// Breathing tones: a sound for each count of the breath, so the breath can be followed by ear (see
// docs/accessibility-audio-scope.md). Off until a visitor switches it on; nothing here makes a sound at import time.
// The notes themselves, for each tone style, are laid out in breathArrangements.ts (pure, tested); this file plays them.
import { arrangementEvents, ARRANGEMENTS, type Arrangement, type ToneEvent, type Timbre } from './breathArrangements.ts';
import type { BreathTiming } from './breathClock.ts';

export {
  GAIN_FIRM,
  GAIN_HOLD,
  GAIN_MOVING,
  HIGH_FREQ,
  LOW_FREQ,
  pitchFor,
  type Arrangement,
  type ToneEvent,
} from './breathArrangements.ts';

/** The first version (a plain scale), kept as the default for these two helpers so older callers and tests keep working. */
export const breathEvents = (t: BreathTiming, arrangement: Arrangement = 'scale'): ToneEvent[] => arrangementEvents(arrangement, t);

/** The notes that start in [fromMs, toMs) of the real clock (ms epoch), for a breath cycle that began at `cycleStart`. */
export function eventsBetween(
  t: BreathTiming,
  cycleStart: number,
  fromMs: number,
  toMs: number,
  arrangement: Arrangement = 'scale',
): (ToneEvent & { at: number })[] {
  const cycle = t.ih + (t.hi || 0) + t.ex + (t.ho || 0);
  if (!(cycle > 0) || !(toMs > fromMs)) return [];
  const one = arrangementEvents(arrangement, t);
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

// A small shared mixing desk: everything goes to a gentle compressor (so overlapping notes cannot clip), with a short,
// soft reverb added to the rung and swelling sounds so they sit in a room instead of ticking dryly.
interface Bus {
  dry: GainNode;
  send: GainNode;
}
const buses = new WeakMap<Ctx, Bus>();
function busFor(c: Ctx): Bus {
  const found = buses.get(c);
  if (found) return found;
  const master = c.createGain();
  master.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  master.connect(comp);
  comp.connect(c.destination);
  // A generated room: two seconds of noise that fades away.
  const seconds = 2.2;
  const len = Math.floor(c.sampleRate * seconds);
  const impulse = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const conv = c.createConvolver();
  conv.buffer = impulse;
  const wet = c.createGain();
  wet.gain.value = 0.32;
  conv.connect(wet);
  wet.connect(master);
  const dry = c.createGain();
  dry.connect(master);
  const send = c.createGain();
  send.connect(conv);
  const bus = { dry, send };
  buses.set(c, bus);
  return bus;
}

type Stop = () => void;

/** Plays one sound of the given style at an audio-clock time. Returns a function that fades it out at once. */
export function playEvent(c: Ctx, when: number, e: Pick<ToneEvent, 'freq' | 'gain' | 'timbre' | 'dur' | 'attack' | 'release'>): Stop {
  const bus = busFor(c);
  const env = c.createGain();
  const oscs: OscillatorNode[] = [];
  const osc = (type: OscillatorType, freq: number, level: number, dest: AudioNode): void => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = level;
    o.connect(g);
    g.connect(dest);
    oscs.push(o);
  };
  const end = when + e.dur;
  const reverb = (amount: number) => {
    const s = c.createGain();
    s.gain.value = amount;
    env.connect(s);
    s.connect(bus.send);
  };
  const T: Timbre = e.timbre;
  if (T === 'harp') {
    // A plucked string: a quick attack, a triangle with a faint octave, softened above 2.4 kHz, a long fade.
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    lp.connect(env);
    osc('triangle', e.freq, 1, lp);
    osc('sine', e.freq * 2, 0.22, lp);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(e.gain, when + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0008, end);
    reverb(0.9);
  } else if (T === 'bowl') {
    // A singing bowl: a few inharmonic partials, a pair slightly apart so it shimmers, a soft strike, a very long fade.
    const ratios = [1, 2.76, 5.4, 8.9];
    const levels = [1, 0.32, 0.14, 0.05];
    ratios.forEach((r, i) => osc('sine', e.freq * r, levels[i] * 0.7, env));
    osc('sine', e.freq * 1.004, 0.55, env);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(e.gain, when + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0008, end);
    env.connect(bus.dry);
    reverb(1);
  } else if (T === 'pad') {
    // A soft sustained voice: two slightly detuned triangles through a low-pass, swelling in and fading out.
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    lp.connect(env);
    osc('triangle', e.freq * Math.pow(2, -5 / 1200), 0.6, lp);
    osc('triangle', e.freq * Math.pow(2, 5 / 1200), 0.6, lp);
    const attack = Math.min(e.attack ?? 0.4, e.dur * 0.8);
    const release = Math.min(e.release ?? 0.8, e.dur * 0.8);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(e.gain, when + attack);
    env.gain.setValueAtTime(e.gain, Math.max(when + attack, end - release));
    env.gain.linearRampToValueAtTime(0, end);
    reverb(0.6);
  } else if (T === 'tick') {
    // A soft wooden tick: a very short triangle blip.
    osc('triangle', e.freq, 1, env);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(e.gain, when + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0008, when + 0.07);
  } else {
    // The plain scale note: a sine with a short attack and a gentle fade.
    osc('sine', e.freq, 1, env);
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(e.gain, when + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0008, when + 0.55);
  }
  if (T !== 'bowl') env.connect(bus.dry);
  for (const o of oscs) {
    o.start(when);
    o.stop(end + 0.1);
  }
  return () => {
    try {
      env.gain.cancelScheduledValues(c.currentTime);
      env.gain.setTargetAtTime(0, c.currentTime, 0.03);
      for (const o of oscs) o.stop(c.currentTime + 0.2);
    } catch {
      /* already stopped */
    }
  };
}

/** The very quiet low drone under the harp: the home note and its fifth. Returns a function that fades it out. */
function startDrone(c: Ctx): Stop {
  const bus = busFor(c);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.022, c.currentTime + 2.5);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  lp.connect(g);
  g.connect(bus.dry);
  const oscs = [146.83, 220].map((f) => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(lp);
    o.start();
    return o;
  });
  return () => {
    try {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setTargetAtTime(0, c.currentTime, 0.4);
      for (const o of oscs) o.stop(c.currentTime + 2);
    } catch {
      /* already stopped */
    }
  };
}

/** A short taste of a style: the first three counts of a 5-5 breath. Plays when a style is chosen and when the tones are switched on. */
export function playPreview(arrangement: Arrangement): void {
  const c = unlockAudio();
  if (!c) return;
  const events = arrangementEvents(arrangement, { ih: 5000, hi: 0, ex: 5000, ho: 0 }).filter((e) => e.t < 3000);
  for (const e of events) playEvent(c, c.currentTime + 0.03 + e.t / 1000, { ...e, dur: Math.min(e.dur, 3.5) });
}
/** The sample that plays when the tones are switched on. */
export const playSample = playPreview;

const LOOKAHEAD_MS = 700;
const TICK_MS = 150;

/**
 * Decides, tick by tick, which sounds to schedule. Pure (no audio, no clock of its own), so it can be tested by playing a
 * breath through it.
 *  - A new rhythm restarts the breath (the counter and the ring restart with it), so the tones restart at once.
 *  - A new style does not cut in mid-breath: the style that is playing finishes its breath (and its notes are left to ring
 *    out), and the new style begins on the first note of the next breath after anything already scheduled.
 */
export function createPlanner(lookaheadMs = LOOKAHEAD_MS) {
  let sig = '';
  let scheduledTo = 0;
  let active: Arrangement = 'harp';
  let pending: { arrangement: Arrangement; at: number } | null = null;
  return (now: number, st: { timing: BreathTiming; cycleStart: number; arrangement: Arrangement }) => {
    const { timing, cycleStart } = st;
    const cycle = timing.ih + (timing.hi || 0) + timing.ex + (timing.ho || 0);
    const rhythmSig = `${timing.ih}.${timing.hi || 0}.${timing.ex}.${timing.ho || 0}.${cycleStart}`;
    let restart = false;
    if (rhythmSig !== sig) {
      restart = sig !== '';
      sig = rhythmSig;
      scheduledTo = now;
      active = st.arrangement;
      pending = null;
    } else if (st.arrangement !== active) {
      // The first start of a breath at or after everything already scheduled (so nothing is cut off or doubled).
      const at = pending?.at ?? (cycle > 0 ? cycleStart + Math.ceil((scheduledTo - cycleStart) / cycle) * cycle : scheduledTo);
      pending = { arrangement: st.arrangement, at };
    } else {
      pending = null;
    }
    const to = now + lookaheadMs;
    let from = Math.max(scheduledTo, now - 50);
    const events: (ToneEvent & { at: number })[] = [];
    while (from < to) {
      const cap = pending ? Math.min(to, pending.at) : to;
      events.push(...eventsBetween(timing, cycleStart, from, cap, active));
      from = cap;
      if (pending && from >= pending.at) {
        active = pending.arrangement;
        pending = null;
      } else {
        break;
      }
    }
    scheduledTo = to;
    return { events, restart, active, pendingAt: pending?.at ?? null };
  };
}

let running = false;
/** True while the tones are playing a breath. Choosing a style then waits for the next breath instead of playing a taste over it. */
export const isTonePlayerRunning = (): boolean => running;

/**
 * Plays the tones for a running breath. `state` is read on every tick. Sounds are scheduled on the audio clock a little
 * ahead, so they do not drift. Returns a stop function.
 */
export function startTonePlayer(state: () => { timing: BreathTiming; cycleStart: number; arrangement: Arrangement }): () => void {
  const c = unlockAudio();
  if (!c) return () => {};
  const live = new Set<Stop>();
  const plan = createPlanner();
  let drone: Stop | null = null;
  const tick = () => {
    const now = Date.now();
    const r = plan(now, state());
    if (r.restart) {
      // A new rhythm: what was ringing fades, and the breath starts again.
      live.forEach((stop) => stop());
      live.clear();
    }
    const wantsDrone = ARRANGEMENTS.find((a) => a.id === r.active)?.drone === true;
    if (wantsDrone && !drone) drone = startDrone(c);
    if (!wantsDrone && drone) {
      drone();
      drone = null;
    }
    for (const e of r.events) {
      const stop = playEvent(c, c.currentTime + Math.max(0, e.at - now) / 1000, e);
      live.add(stop);
      setTimeout(() => live.delete(stop), e.at - now + e.dur * 1000 + 300);
    }
  };
  running = true;
  tick();
  const id = setInterval(tick, TICK_MS);
  return () => {
    running = false;
    clearInterval(id);
    live.forEach((stop) => stop());
    live.clear();
    drone?.();
    drone = null;
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
