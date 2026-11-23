// The notes of one breath, for each tone style. Pure (no sound is made here): the engine in breathTones.ts plays them.
//
// A breath is already a short musical phrase with a cadence in it: the inhale rises and ends open, the exhale falls and
// lands on the home note (the tonic), holds are sustained notes, each count is a beat and each breath a bar. Every style
// below uses that: the inhale climbs, the exhale resolves to the tonic (D), a hold after the inhale sits on a stable open
// note and a hold after the exhale rests on the tonic. All are in D, on the pentatonic scale, so any note sits well with
// any other. See docs/accessibility-audio-scope.md.
import type { BreathTiming } from './breathClock.ts';
import { HUM_DESCRIPTION, HUM_LABEL, HUM_LOW_HZ, HUM_PEAK, humRamps } from './breathHum.ts';

export type Arrangement = 'harp' | 'bowls' | 'chord' | 'scale' | 'hum';
/** The style heard by default: the bowls (the owner's choice, 2026-11-20). A visitor's own choice, kept on their device, still wins. */
export const DEFAULT_ARRANGEMENT: Arrangement = 'bowls';

export const ARRANGEMENTS: { id: Arrangement; label: string; description: string; drone: boolean }[] = [
  { id: 'harp', label: 'Harp', description: 'Plucked notes that ring and overlap, over a very soft low drone. The exhale lands on the home note.', drone: true },
  { id: 'bowls', label: 'Bowls', description: 'A singing bowl at the start of the inhale and a lower one at the start of the exhale, a soft swell between, and a gentle tick for each count.', drone: false },
  { id: 'chord', label: 'Chord', description: 'A chord that adds a voice for each count of the inhale and lets one go for each count of the exhale.', drone: false },
  { id: 'scale', label: 'Scale', description: 'Plain notes rising and falling, one a count. The first version, kept for comparison.', drone: false },
  { id: 'hum', label: HUM_LABEL, description: HUM_DESCRIPTION, drone: false },
];

export const isArrangement = (v: unknown): v is Arrangement => typeof v === 'string' && ARRANGEMENTS.some((a) => a.id === v);

export type Timbre = 'sine' | 'harp' | 'bowl' | 'pad' | 'tick' | 'hum';
export type Kind = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export interface ToneEvent {
  /** Milliseconds from the start of the breath. */
  t: number;
  freq: number;
  /** Loudness, 0 to 1 of the master level. */
  gain: number;
  kind: Kind;
  timbre: Timbre;
  /** How long the sound lasts, in seconds, including its fade. */
  dur: number;
  /** For pads: seconds to swell in, and seconds to fade out at the end of `dur`. */
  attack?: number;
  release?: number;
  /** For the hum: the breath's rhythm in ms, which draws its swell (src/lib/breathHum.ts). */
  shape?: BreathTiming;
}

const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);
const counts = (ms: number): number => (ms > 0 ? Math.max(1, Math.round(ms / 1000)) : 0);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

// ---- Scale (the first version): plain notes, one a count, rising then falling. Stepwise through the D major pentatonic (the key of the
// other styles). The first version spread the notes over the C pentatonic with a fixed range, which skipped notes and leapt (D E G C D E): awkward
// and unpleasant by the owner's ear (2026-11-20). Now a phase climbs the scale a degree at a time, and both phases of a breath share the same top.

/** D major pentatonic from the home note up one octave: D4 E4 F#4 A4 B4 D5. D5 (587 Hz) is the ceiling: no pitched note in any style goes above it (the owner found the top note too high, 2026-11-20). */
export const SCALE_LADDER = [62, 64, 66, 69, 71, 74].map(hz);
export const LOW_INDEX = 0;
export const HIGH_INDEX = SCALE_LADDER.length - 1;
export const LOW_FREQ = SCALE_LADDER[LOW_INDEX];
export const HIGH_FREQ = SCALE_LADDER[HIGH_INDEX];
export const GAIN_MOVING = 0.12;
export const GAIN_FIRM = 0.17;
export const GAIN_HOLD = 0.05;

/** The scale degree a breath climbs to: one step for each count of its longer phase (so equal phases walk the scale a degree at a time), at most the top. */
export const scalePeak = (t: BreathTiming): number => Math.max(1, Math.min(HIGH_INDEX, Math.max(counts(t.ih), counts(t.ex)) - 1));

/** The pitch for step `j` (from 0) of `n` steps from the home note up to degree `peak`, rising or falling. A phase of one count sits at its end of the range. */
export function pitchFor(j: number, n: number, direction: 'up' | 'down', peak: number = HIGH_INDEX): number {
  const span = peak - LOW_INDEX;
  const frac = n <= 1 ? 1 : clamp01(j / (n - 1));
  const idx = direction === 'up' ? LOW_INDEX + Math.round(frac * span) : peak - Math.round(frac * span);
  return SCALE_LADDER[n <= 1 ? (direction === 'up' ? peak : LOW_INDEX) : idx];
}

type Pitcher = (j: number, n: number) => number;
type Phase = (start: number, len: number, kind: Kind, pitch: Pitcher, gain: (j: number) => number, make?: Partial<ToneEvent>) => void;

function scaleEvents(t: BreathTiming): ToneEvent[] {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const out: ToneEvent[] = [];
  const peak = scalePeak(t);
  const phase: Phase = (start, len, kind, pitch, gain) => {
    const n = counts(len);
    for (let j = 0; j < n; j++) out.push({ t: start + (j * len) / n, freq: pitch(j, n), gain: gain(j), kind, timbre: 'sine', dur: 0.6 });
  };
  phase(0, ih, 'inhale', (j, n) => pitchFor(j, n, 'up', peak), (j) => (j === 0 ? GAIN_FIRM : GAIN_MOVING));
  phase(ih, hi, 'hold-in', () => SCALE_LADDER[peak], () => GAIN_HOLD);
  phase(ih + hi, ex, 'exhale', (j, n) => pitchFor(j, n, 'down', peak), () => GAIN_MOVING);
  phase(ih + hi + ex, ho, 'hold-out', () => LOW_FREQ, () => GAIN_HOLD);
  return out;
}

// ---- Harp: an open arpeggio in D that rings, rising on the inhale and landing on the tonic on the exhale

/** D4 E4 F#4 A4 B4 D5: the same six notes as the scale. D4 is the home note and D5 (the ceiling) the top; a short phase picks its notes from across them (three counts give the open D4 A4 D5). */
export const HARP_LADDER = [62, 64, 66, 69, 71, 74].map(hz);
export const HARP_HOME = HARP_LADDER[0];
export const HARP_OPEN = HARP_LADDER[5]; // D5: the top, and the stable, open note the inhale hold sits on
const HARP_TOP = HARP_LADDER.length - 1;

function harpPitch(j: number, n: number, up: boolean): number {
  // Every phase spans the whole ladder, so both halves of a breath share the same top. Six counts are six different notes, one a step; the
  // earlier ladder (D4 to F#5, five notes) repeated A4 on the steady 6 count pace, and its top note was found too high.
  const frac = n <= 1 ? 1 : clamp01(j / (n - 1));
  const idx = up ? Math.round(frac * HARP_TOP) : HARP_TOP - Math.round(frac * HARP_TOP);
  return HARP_LADDER[n <= 1 ? (up ? HARP_TOP : 0) : idx];
}

function harpEvents(t: BreathTiming): ToneEvent[] {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const out: ToneEvent[] = [];
  const phase: Phase = (start, len, kind, pitch, gain) => {
    const n = counts(len);
    for (let j = 0; j < n; j++) out.push({ t: start + (j * len) / n, freq: pitch(j, n), gain: gain(j), kind, timbre: 'harp', dur: kind.startsWith('hold') ? 1.6 : 2.6 });
  };
  phase(0, ih, 'inhale', (j, n) => harpPitch(j, n, true), (j) => (j === 0 ? 0.17 : 0.13));
  phase(ih, hi, 'hold-in', () => HARP_OPEN, () => 0.045);
  phase(ih + hi, ex, 'exhale', (j, n) => harpPitch(j, n, false), () => 0.13);
  phase(ih + hi + ex, ho, 'hold-out', () => HARP_HOME, () => 0.045);
  return out;
}

// ---- Bowls: a bowl to open the inhale (the home note) and another to open the exhale (the fifth of the key, lower), a swell
// between, a soft tick for each count

export const BOWL_IN = hz(62); // D4
export const BOWL_OUT = hz(57); // A3: the fifth of the key, sitting below the home note (a fourth under D4)
export const PAD_VOICES = [hz(62), hz(69)]; // D4 and A4

function bowlEvents(t: BreathTiming): ToneEvent[] {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const out: ToneEvent[] = [];
  out.push({ t: 0, freq: BOWL_IN, gain: 0.2, kind: 'inhale', timbre: 'bowl', dur: 7 });
  out.push({ t: ih + hi, freq: BOWL_OUT, gain: 0.2, kind: 'exhale', timbre: 'bowl', dur: 7 });
  // The swell: in over the inhale, held through the hold, out over the exhale.
  const swellMs = ih + hi + ex;
  for (const f of PAD_VOICES) out.push({ t: 0, freq: f, gain: 0.05, kind: 'inhale', timbre: 'pad', dur: swellMs / 1000 + 0.6, attack: Math.max(0.4, ih / 1000), release: Math.max(0.6, ex / 1000) });
  const ticks = (start: number, len: number, kind: Kind, gain: number) => {
    const n = counts(len);
    for (let j = 0; j < n; j++) out.push({ t: start + (j * len) / n, freq: 660, gain, kind, timbre: 'tick', dur: 0.12 });
  };
  ticks(0, ih, 'inhale', 0.07);
  ticks(ih, hi, 'hold-in', 0.04);
  ticks(ih + hi, ex, 'exhale', 0.07);
  ticks(ih + hi + ex, ho, 'hold-out', 0.04);
  return out;
}

// ---- Chord: a voice joins for each count of the inhale and leaves for each count of the exhale

/** D3, A3, D4, F#4, A4, D5, from the root up. */
export const CHORD_LADDER = [50, 57, 62, 66, 69, 74].map(hz);

function chordEvents(t: BreathTiming): ToneEvent[] {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const cycle = ih + hi + ex + ho;
  const nIn = counts(ih), nEx = counts(ex);
  const out: ToneEvent[] = [];
  if (nIn > 0 && nEx > 0) {
    const V = Math.min(nIn, CHORD_LADDER.length);
    const startOf = (i: number) => (V === 1 ? 0 : Math.round((i * (nIn - 1)) / (V - 1))); // inhale count that adds voice i
    const leaveOf = (i: number) => (V === 1 ? nEx - 1 : Math.round(((V - 1 - i) * (nEx - 1)) / (V - 1))); // exhale count that releases voice i (top first)
    for (let i = 0; i < V; i++) {
      const on = (startOf(i) * ih) / nIn;
      // The root is let go at the end of the exhale and lingers, very quiet, through the rest of the breath.
      const off = i === 0 ? ih + hi + ex : ih + hi + (leaveOf(i) * ex) / nEx;
      const end = i === 0 ? Math.max(off, cycle) : off;
      out.push({ t: on, freq: CHORD_LADDER[Math.round((i * (CHORD_LADDER.length - 1)) / Math.max(1, V - 1))], gain: 0.085, kind: 'inhale', timbre: 'pad', dur: (end - on) / 1000 + 0.9, attack: 0.35, release: 0.9 });
    }
  }
  // A very soft tick for every count, so each count can still be counted when voices overlap.
  const ticks = (start: number, len: number, kind: Kind, gain: number) => {
    const n = counts(len);
    for (let j = 0; j < n; j++) out.push({ t: start + (j * len) / n, freq: 640, gain, kind, timbre: 'tick', dur: 0.12 });
  };
  ticks(0, ih, 'inhale', 0.05);
  ticks(ih, hi, 'hold-in', 0.03);
  ticks(ih + hi, ex, 'exhale', 0.05);
  ticks(ih + hi + ex, ho, 'hold-out', 0.03);
  return out;
}

// ---- Hum: one soft sound a breath, two sine tones that swell in over the inhale and fade over the exhale (src/lib/breathHum.ts). No notes, no ticks.
// The event is the whole breath long; its swell is drawn from `shape`, so it follows whichever rhythm is active.
function humEvents(t: BreathTiming): ToneEvent[] {
  const { cycle } = humRamps(t);
  if (!(cycle > 0)) return [];
  return [{ t: 0, freq: HUM_LOW_HZ, gain: HUM_PEAK, kind: 'inhale', timbre: 'hum', dur: cycle / 1000, shape: { ih: t.ih, hi: t.hi || 0, ex: t.ex, ho: t.ho || 0 } }];
}

/** Every note in one breath for a tone style, in time order, with its time from the start of the breath. */
export function arrangementEvents(arrangement: Arrangement, t: BreathTiming): ToneEvent[] {
  const events = arrangement === 'harp' ? harpEvents(t) : arrangement === 'bowls' ? bowlEvents(t) : arrangement === 'chord' ? chordEvents(t) : arrangement === 'hum' ? humEvents(t) : scaleEvents(t);
  return events.sort((a, b) => a.t - b.t);
}
