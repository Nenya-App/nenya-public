// Breathing tones: one note for each count of the breath, so the breath can be followed by ear (see
// docs/accessibility-audio-scope.md). Off until a visitor switches it on; nothing here makes a sound at import time.
//
// What is heard, on the same clock as the counter and the ring (the shared cycle start):
//   inhale        one note per count, rising
//   hold after in one quiet note per count, repeating the top note
//   exhale        one note per count, falling
//   hold after ex one quiet note per count, repeating the bottom note
// The first note of each inhale is a little firmer, as the counter's first pulse is stronger. The notes come from the
// pentatonic scale already used for the session sound, so every step is consonant and nothing sounds like an alarm.
import { FREQS } from './sessionSound.ts';
import type { BreathTiming } from './breathClock.ts';

/** The range the notes move through: from D4 up to E5 (indexes into the session sound's scale). */
export const LOW_INDEX = 1;
export const HIGH_INDEX = 7;
export const LOW_FREQ = FREQS[LOW_INDEX];
export const HIGH_FREQ = FREQS[HIGH_INDEX];

/** Loudness (0 to 1 of the master level): moving notes, the firm first note of a breath, and the quiet hold notes. */
export const GAIN_MOVING = 0.12;
export const GAIN_FIRM = 0.17;
export const GAIN_HOLD = 0.05;

export interface ToneEvent {
  /** Milliseconds from the start of the breath. */
  t: number;
  freq: number;
  gain: number;
  kind: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
}

/** The pitch for step `j` (from 0) of `n` steps across the range, rising or falling. A phase of one count sits at its end of the range. */
export function pitchFor(j: number, n: number, direction: 'up' | 'down'): number {
  const span = HIGH_INDEX - LOW_INDEX;
  const frac = n <= 1 ? 1 : Math.min(1, Math.max(0, j / (n - 1)));
  const idx = direction === 'up' ? LOW_INDEX + Math.round(frac * span) : HIGH_INDEX - Math.round(frac * span);
  // A one-count exhale is a single falling step to the bottom, a one-count inhale a single rising step to the top.
  return FREQS[n <= 1 ? (direction === 'up' ? HIGH_INDEX : LOW_INDEX) : idx];
}

const counts = (ms: number): number => (ms > 0 ? Math.max(1, Math.round(ms / 1000)) : 0);

/** Every note in one breath, in order, with its time from the start of the breath. */
export function breathEvents(t: BreathTiming): ToneEvent[] {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const out: ToneEvent[] = [];
  const phase = (start: number, len: number, kind: ToneEvent['kind'], pitch: (j: number, n: number) => number, gain: (j: number) => number) => {
    const n = counts(len);
    for (let j = 0; j < n; j++) out.push({ t: start + (j * len) / n, freq: pitch(j, n), gain: gain(j), kind });
  };
  phase(0, ih, 'inhale', (j, n) => pitchFor(j, n, 'up'), (j) => (j === 0 ? GAIN_FIRM : GAIN_MOVING));
  phase(ih, hi, 'hold-in', () => HIGH_FREQ, () => GAIN_HOLD);
  phase(ih + hi, ex, 'exhale', (j, n) => pitchFor(j, n, 'down'), () => GAIN_MOVING);
  phase(ih + hi + ex, ho, 'hold-out', () => LOW_FREQ, () => GAIN_HOLD);
  return out;
}

/** The notes that start in [fromMs, toMs) of the real clock (ms epoch), for a breath cycle that began at `cycleStart`. */
export function eventsBetween(t: BreathTiming, cycleStart: number, fromMs: number, toMs: number): (ToneEvent & { at: number })[] {
  const cycle = t.ih + (t.hi || 0) + t.ex + (t.ho || 0);
  if (!(cycle > 0) || !(toMs > fromMs)) return [];
  const one = breathEvents(t);
  const out: (ToneEvent & { at: number })[] = [];
  for (let k = Math.floor((fromMs - cycleStart) / cycle) - 1; cycleStart + k * cycle < toMs; k++) {
    for (const e of one) {
      const at = cycleStart + k * cycle + e.t;
      if (at >= fromMs && at < toMs) out.push({ ...e, at });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

// ---- the sound itself (browser only)

type Ctx = AudioContext;
let ctx: Ctx | null = null;

/**
 * The audio context. Browsers allow sound only after the visitor has done something on the page, so this must first be
 * called from a click or key press (the switch that turns the tones on does that).
 */
export function unlockAudio(): Ctx | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One soft note: a sine with a short attack and a gentle fade, so there are no clicks. Returns a function that stops it early. */
export function playNote(c: Ctx, when: number, freq: number, gain: number): () => void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0008, when + 0.55);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(when);
  osc.stop(when + 0.6);
  return () => {
    try {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setTargetAtTime(0, c.currentTime, 0.02);
      osc.stop(c.currentTime + 0.1);
    } catch {
      /* already stopped */
    }
  };
}

/** The one short note that plays when the tones are switched on, so the visitor knows it worked. */
export function playSample(): void {
  const c = unlockAudio();
  if (c) playNote(c, c.currentTime + 0.02, FREQS[4], GAIN_FIRM);
}

const LOOKAHEAD_MS = 700;
const TICK_MS = 150;

/**
 * Plays the tones for a running breath. `state` is read on every tick, so a change of rhythm (which restarts the cycle) is
 * picked up at once. Notes are scheduled on the audio clock a little ahead, so they do not drift. Returns a stop function.
 */
export function startTonePlayer(state: () => { timing: BreathTiming; cycleStart: number }): () => void {
  const c = unlockAudio();
  if (!c) return () => {};
  const live = new Set<() => void>();
  let scheduledTo = Date.now();
  let last = '';
  const tick = () => {
    const now = Date.now();
    const { timing, cycleStart } = state();
    const sig = `${timing.ih}.${timing.hi || 0}.${timing.ex}.${timing.ho || 0}.${cycleStart}`;
    if (sig !== last) {
      last = sig;
      scheduledTo = now; // a new rhythm: forget what was planned
    }
    const to = now + LOOKAHEAD_MS;
    for (const e of eventsBetween(timing, cycleStart, Math.max(scheduledTo, now - 50), to)) {
      const when = c.currentTime + Math.max(0, e.at - now) / 1000;
      const stop = playNote(c, when, e.freq, e.gain);
      live.add(stop);
      setTimeout(() => live.delete(stop), (e.at - now) + 800);
    }
    scheduledTo = to;
  };
  tick();
  const id = setInterval(tick, TICK_MS);
  return () => {
    clearInterval(id);
    live.forEach((stop) => stop());
    live.clear();
  };
}

// ---- the polite announcement ("Breathing tones on" / "off"), read by screen readers from a live region

let announcement = '';
const announceListeners = new Set<() => void>();
export const getAnnouncement = (): string => announcement;
export const subscribeAnnouncement = (l: () => void): (() => void) => {
  announceListeners.add(l);
  return () => announceListeners.delete(l);
};
export function announceTones(message: string): void {
  announcement = message;
  announceListeners.forEach((l) => l());
}
