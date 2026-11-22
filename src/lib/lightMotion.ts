// How the inner lights behind the gem move: they follow the gem's own motion settings (owner, 2026-11-22: "their own movement patterns should track with the gem's
// settings"). A pure function from the gem's settings to the lights' motion, so it is tested. The visitor's Inner lights choice (src/lib/logoLook.ts) is the top level:
//   Hidden  the lights are not drawn.
//   Still   the lights hold still, whatever the gem does.
//   Moving  the lights follow the gem (below).
//
// What the lights follow (the gem's kaleidoscope, src/lib/kaleidoscope.ts):
//   switch           with the gem's kaleidoscope off, the lights hold still. With it on, they move.
//   look             the pace and the amount come from the gem's look (Calm, Gentle, Lively, Full motion, or the bench's own values):
//                    pace   the gem's star and pavilion facets turn on a wave of half the look's slowest period (period x 0.5); the ring turns on the same period and in the same way:
//                           with a sway the facets swing back and forth that many degrees with a sine and come home, and so does the ring; with no sway (Full motion) they turn on
//                           steadily by one repeat of the cut (360 / sides degrees) every half period, and so does the ring, at that angular speed.
//                    amount the gem moves its star pattern by depth x pattern; the lights dim and shrink by the same measure (see below), so Calm moves them least and Full motion most.
//   follow the breath  when the gem's pattern opens with the breath (the "Move with my breathing" switch), the lights brighten and swell as the breath goes in, hold through the
//                    hold, and dim and settle as it goes out, on the same shared breath clock; the pattern's rise and fall is then the breath's, not its own wave.
//   reduced motion   nothing moves.
// What they do not follow, and why: the gem's structure and pattern settings that change the stone's facet angles (crown, pavilion, girdle, table height) have no meaning for a
// light; the gem's side count only sets how far a steady turn goes in one repeat; the spin of the gem's own sparkle (three breaths a loop) is the gem's light, not the lights'.
import { breathEnvelope, breathFractions, type BreathTiming } from './breathClock.ts';
import type { InnerOrbMode } from './logoLook.ts';

/** The parts of the gem's kaleidoscope look the lights follow. */
export interface GemMotionLook {
  on: boolean;
  periodS: number;
  depth: number;
  pattern: number;
  sway: number;
  turn: number;
}
export interface GemMotionSettings {
  mode: InnerOrbMode;
  kaleidoscope: GemMotionLook;
  /** The gem's "Move with my breathing" switch (it only counts while the kaleidoscope is on). */
  breathSync: boolean;
  /** The sides the gem is drawn with (6 to 12). */
  sides: number;
  reducedMotion: boolean;
}

export type LightTurn = 'none' | 'sway' | 'steady';
export type LightRise = 'none' | 'gem' | 'breath';
export interface LightMotion {
  drawn: boolean;
  /** How the ring turns: not at all, back and forth by `turnDeg` (period `turnPeriodS`), or steadily (one full turn in `turnPeriodS`). */
  turn: LightTurn;
  turnDeg: number;
  turnPeriodS: number;
  /** How each light rises and fades: not at all, on the gem's own wave (period `risePeriodS` for the first light, `riseStepS` longer for each later one), or with the breath. */
  rise: LightRise;
  risePeriodS: number;
  riseStepS: number;
  /** The dimmest a light gets (as a fraction of full brightness), and the smallest (as a fraction of full size). */
  depth: number;
  scale: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(x) ? x : lo));
/** How much each light's period differs from the one before it, as a fraction of the first's, so they are never in step. */
export const LIGHT_STEP = 0.04;
/** The turn of the gem's facets runs on this fraction of the look's slowest wave (see kaleidoscopeCut). */
export const GEM_TURN_RATIO = 0.5;

export function lightMotionFor(g: GemMotionSettings): LightMotion {
  const k = g.kaleidoscope;
  const d = clamp(k.depth, 0, 1);
  const swing = d * clamp(k.pattern, 0, 1);
  const base: LightMotion = {
    drawn: g.mode !== 'hidden',
    turn: 'none',
    turnDeg: 0,
    turnPeriodS: 0,
    rise: 'none',
    risePeriodS: 0,
    riseStepS: 0,
    depth: 1 - 0.5 * swing,
    scale: 1 - 0.25 * swing,
  };
  if (g.mode !== 'moving' || g.reducedMotion || !k.on || d <= 0) return base;
  const half = Math.max(10, k.periodS) * GEM_TURN_RATIO;
  const tn = clamp(k.turn, 0, 1) * d;
  const sway = clamp(k.sway, 0, 30);
  const wrap = 360 / clamp(Math.round(g.sides), 6, 12);
  const m: LightMotion = { ...base, rise: g.breathSync ? 'breath' : 'gem', risePeriodS: half, riseStepS: half * LIGHT_STEP };
  if (tn > 0) {
    if (sway > 0) return { ...m, turn: 'sway', turnDeg: sway * tn, turnPeriodS: half };
    return { ...m, turn: 'steady', turnDeg: wrap * tn, turnPeriodS: (360 / (wrap * tn)) * half };
  }
  return m;
}

/** The ring's angle in radians at `tSec` (clockwise positive, as the ring has always turned): 0 when it does not turn. */
export function lightRingAngle(m: LightMotion, tSec: number): number {
  if (m.turn === 'sway') return ((m.turnDeg * Math.PI) / 180) * Math.sin((2 * Math.PI * tSec) / m.turnPeriodS);
  if (m.turn === 'steady') return 2 * Math.PI * (((tSec / m.turnPeriodS) % 1 + 1) % 1);
  return 0;
}

/** The brightness (0 to 1) of light `index` at `tSec`; `envelope` is the breath's (0 at rest, 1 at full inhale). The gem multiplies each light's colour by this. */
export function lightLevel(m: LightMotion, index: number, tSec: number, envelope: number): number {
  if (m.rise === 'none') return (1 + m.depth) / 2;
  if (m.rise === 'breath') return m.depth + (1 - m.depth) * clamp(envelope, 0, 1);
  const period = Math.max(1, m.risePeriodS + index * m.riseStepS);
  return m.depth + (1 - m.depth) * (0.5 - 0.5 * Math.cos((2 * Math.PI * tSec) / period));
}

// With the breath: a CSS animation on each light (opacity and size), on the shared clock, so it needs no script per frame. Keyframes are named by the breath's shape, as the leaves' are.
const pct = (x: number): string => `${Math.round(x * 10000) / 100}%`;
export const lightBreathKey = (technique: BreathTiming | null | undefined): string => {
  const f = breathFractions(technique);
  return [f.t1, f.t2, f.t3].map((x) => Math.round(x * 1000)).join('-');
};
/** Keyframes: dimmest and smallest at rest, full at the end of the inhale, held through the hold, back down through the exhale. Uses --nl-depth and --nl-scale set on each light. */
export function lightBreathCss(technique: BreathTiming | null | undefined): string {
  const f = breathFractions(technique);
  const at = [...new Set([0, f.t1, f.t2, f.t3, 1])];
  const body = at.map((p) => {
    const e = breathEnvelope(p, f);
    return `${pct(p)}{opacity:calc(var(--nl-depth) + (1 - var(--nl-depth)) * ${e.toFixed(3)});transform:scale(calc(var(--nl-scale) + (1 - var(--nl-scale)) * ${e.toFixed(3)}))}`;
  }).join('');
  return `@keyframes nl-breath-${lightBreathKey(technique)}{${body}}@media (prefers-reduced-motion:reduce){.nenya-light-breath{animation:none!important}}`;
}
