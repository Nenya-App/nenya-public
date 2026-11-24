// The outer ring's movement (owner, 2026-11-24): the sixteen orbs at the edge of the breathing animation turn round the logo. The visitor can set whether it turns, which way, how fast
// (seconds per turn) or to "pace to my breathing" (a fixed fraction of a turn for each full breath). All the maths is here, pure, so it is tested; the ring itself only asks for an angle.
//
// Safety: the ring is never faster than MAX_RPM (2 turns a minute = 12 degrees a second) whatever is chosen, and it only ever moves smoothly: there is no flashing, no jump and no sudden stop.
// A turn is positive clockwise, as the browser's rotate() is; counter-clockwise is negative.
import { breathFractions, breathLengthMs, breathEnvelope, type BreathFractions, type BreathTiming } from './breathClock.ts';

/** The fastest the ring may ever turn, in turns a minute (the owner's limit). */
export const OUTER_RING_MAX_RPM = 2;
/** Seconds per turn: 30 is the fastest allowed (2 rpm), 300 the slowest offered (0.2 rpm). The default, 144 s, is twelve 12-second breaths (6 s in, 6 s out). */
export const OUTER_RING_MIN_SECONDS = 30;
export const OUTER_RING_MAX_SECONDS = 300;
export const OUTER_RING_STEP_SECONDS = 6;
export const DEFAULT_OUTER_RING_SECONDS = 144;

export type RingDirection = 'ccw' | 'cw';
export const RING_DIRECTIONS: readonly RingDirection[] = ['ccw', 'cw'];
export const DEFAULT_RING_DIRECTION: RingDirection = 'ccw';
export const DEFAULT_OUTER_RING_TURNING = true;
export const DEFAULT_OUTER_RING_BREATH_PACED = false;

/** "Pace to my breathing": the ring turns 1/N of a turn for each full breath. 12 is the default and is the same pace as 144 s per turn at the default 6 s in, 6 s out. */
export const BREATH_TURN_DENOMINATORS = [12, 8, 6, 4] as const;
export type BreathTurnDenominator = (typeof BREATH_TURN_DENOMINATORS)[number];
export const DEFAULT_BREATH_TURN: BreathTurnDenominator = 12;
export const breathTurnLabel = (d: number): string => `1/${d} turn`;

export const rpmFromSeconds = (secondsPerTurn: number): number => 60 / secondsPerTurn;
export const secondsFromRpm = (rpm: number): number => 60 / rpm;

/** A pace as it is shown: at most two decimals, no trailing zeros ("0.42", "2", "0.2"). */
export const formatRpm = (rpm: number): string => String(Math.round(rpm * 100) / 100);
/** "144 s per turn (0.42 rpm)". */
export const paceLabel = (secondsPerTurn: number): string => `${Math.round(secondsPerTurn)} s per turn (${formatRpm(rpmFromSeconds(secondsPerTurn))} rpm)`;

/** Holds a number of seconds per turn to the allowed range and to the slider's steps (counted from the fastest). Anything that is not a number is the default. */
export function snapOuterRingSeconds(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DEFAULT_OUTER_RING_SECONDS;
  const c = Math.min(OUTER_RING_MAX_SECONDS, Math.max(OUTER_RING_MIN_SECONDS, v));
  return OUTER_RING_MIN_SECONDS + Math.round((c - OUTER_RING_MIN_SECONDS) / OUTER_RING_STEP_SECONDS) * OUTER_RING_STEP_SECONDS;
}
export const snapRingDirection = (v: unknown): RingDirection => (v === 'cw' ? 'cw' : 'ccw');
export const snapBreathTurn = (v: unknown): BreathTurnDenominator => ((BREATH_TURN_DENOMINATORS as readonly unknown[]).includes(v) ? (v as BreathTurnDenominator) : DEFAULT_BREATH_TURN);

/** The sign of a turn: counter-clockwise is negative, clockwise positive. */
export const directionSign = (d: RingDirection): -1 | 1 => (d === 'cw' ? 1 : -1);

// --- Paced to the breath -------------------------------------------------------------------------------------------------------------------------------------------------------------
// The ring's speed follows the breath: it is slowest at rest (a quarter of its fastest, never zero, so it never stops), picks up through the in-breath, is quickest at the top of the breath
// (and through a hold-in), and eases down through the out-breath, sooner than it rose, so most of each breath's turn is made on the in-breath. The speed is the breath's own envelope (src/lib/breathClock.ts) smoothed, so it is continuous and has no corners, and it is the same
// at the start and the end of every breath, so breath after breath joins up. Each full breath adds the same fraction of a turn.
const SPEED_FLOOR = 0.25;
const SAMPLES = 240;
const smooth = (x: number) => x * x * (3 - 2 * x);

export interface BreathTurnProfile {
  /** 0 to 1: how much of one breath's turn has been made by phase `p` (0 to 1) of the breath. Rises smoothly and never falls. */
  at: (p: number) => number;
  /** The fastest moment's speed as a multiple of the breath's average speed (always at least 1). */
  peak: number;
}
const profiles = new Map<string, BreathTurnProfile>();
export function breathTurnProfile(f: BreathFractions): BreathTurnProfile {
  const key = `${f.t1}|${f.t2}|${f.t3}`;
  const hit = profiles.get(key);
  if (hit) return hit;
  // Through the in-breath (and a hold-in) the speed follows the smoothed envelope up to its peak; through the out-breath it falls away faster (the square of it), so the ring does most of its turning on the in-breath and eases on the out-breath.
  const speed = (p: number) => {
    const e = smooth(breathEnvelope(p, f));
    return SPEED_FLOOR + (1 - SPEED_FLOOR) * (p >= f.t2 ? e * e : e);
  };
  const cum = new Float64Array(SAMPLES + 1);
  let max = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const a = speed((i - 1) / SAMPLES), b = speed(i / SAMPLES);
    cum[i] = cum[i - 1] + (a + b) / 2 / SAMPLES;
    max = Math.max(max, a, b);
  }
  const total = cum[SAMPLES];
  const profile: BreathTurnProfile = {
    at: (p) => {
      const x = Math.min(1, Math.max(0, p)) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(x));
      return (cum[i] + (cum[i + 1] - cum[i]) * (x - i)) / total;
    },
    peak: max / (total || 1),
  };
  profiles.set(key, profile);
  return profile;
}

export interface BreathClamp {
  /** Turns the ring makes for each full breath after the limit: the chosen 1/N, or less when the limit applies. */
  turnsPerBreath: number;
  /** True when the limit made the ring turn less than the chosen fraction. */
  clamped: boolean;
  /** Its fastest moment, in turns a minute (never more than OUTER_RING_MAX_RPM). */
  peakRpm: number;
  /** Its average, in turns a minute. */
  averageRpm: number;
}
/**
 * What "pace to my breathing" does for this breath and this fraction. The ring's fastest moment may not pass OUTER_RING_MAX_RPM, so when a short breath would make it, the turn each breath is
 * scaled down evenly (the same shape, a smaller fraction), never cut off: the ring does not stop and start, it just turns less each breath.
 */
export function breathClamp(technique: BreathTiming | null | undefined, denominator: number): BreathClamp {
  const d = snapBreathTurn(denominator);
  const breathMin = breathLengthMs(technique) / 60000;
  const { peak } = breathTurnProfile(breathFractions(technique));
  const wanted = 1 / d;
  const allowed = (OUTER_RING_MAX_RPM * breathMin) / peak;
  const turnsPerBreath = Math.min(wanted, allowed);
  return { turnsPerBreath, clamped: turnsPerBreath < wanted - 1e-12, peakRpm: (turnsPerBreath * peak) / breathMin, averageRpm: turnsPerBreath / breathMin };
}

/** The turns made (clockwise positive, counted from the shared clock's start) by `elapsedMs` of the breathing clock, for the 1/`denominator` fraction and the limit. */
export function breathPacedTurns(elapsedMs: number, technique: BreathTiming | null | undefined, denominator: number): number {
  if (!Number.isFinite(elapsedMs)) return 0;
  const b = breathLengthMs(technique);
  const whole = Math.floor(elapsedMs / b);
  const p = (elapsedMs - whole * b) / b;
  return breathClamp(technique, denominator).turnsPerBreath * (whole + breathTurnProfile(breathFractions(technique)).at(p));
}

export interface RingMotion {
  direction: RingDirection;
  /** Steady pace: seconds per turn. */
  seconds: number;
  /** Paced to the breath instead of steady. */
  breathPaced: boolean;
  /** The fraction of a turn for each breath is 1/this. */
  breathTurn: number;
  technique?: BreathTiming | null;
}
/** The ring's angle in degrees (counter-clockwise negative) after `elapsedMs` of the shared clock. Not reduced to a turn, so the motion is continuous. */
export function ringAngleDeg(m: RingMotion, elapsedMs: number): number {
  const turns = m.breathPaced ? breathPacedTurns(elapsedMs, m.technique, m.breathTurn) : elapsedMs / 1000 / snapOuterRingSeconds(m.seconds);
  return directionSign(m.direction) * 360 * turns;
}
/** The fastest the ring turns under these settings, in turns a minute. Never more than OUTER_RING_MAX_RPM. */
export function ringPeakRpm(m: RingMotion): number {
  return m.breathPaced ? breathClamp(m.technique, m.breathTurn).peakRpm : rpmFromSeconds(snapOuterRingSeconds(m.seconds));
}

/**
 * Keeps the ring continuous when a setting changes: the offset to add to the new raw angle so the ring carries on from the angle it was last drawn at, rather than jumping to where the new
 * setting would put it. The ring never jumps when the pace, direction or mode is changed.
 */
export const continuityOffset = (lastDrawnDeg: number, newRawDeg: number): number => lastDrawnDeg - newRawDeg;
/** An angle for the style attribute: held between 0 and 360 so the number stays small. */
export const wrapDeg = (deg: number): number => ((deg % 360) + 360) % 360;

/** The sentence under the breath-paced control: says when the limit applies. Plain words. */
export function breathPaceNote(technique: BreathTiming | null | undefined, denominator: number): string {
  const c = breathClamp(technique, denominator);
  const avg = formatRpm(c.averageRpm);
  return c.clamped
    ? `At your breathing pace this would be faster than the most the ring ever turns (${OUTER_RING_MAX_RPM} turns a minute), so it turns less each breath than you chose. On average it turns about ${avg} times a minute.`
    : `On average the ring turns about ${avg} times a minute at your breathing pace. It is never faster than ${OUTER_RING_MAX_RPM} turns a minute.`;
}
