// One breath clock for everything that animates with the breath (the ring, the counter, the gem),
// so they stay in phase. All times are milliseconds.

export interface BreathTiming {
  ih: number; // inhale
  hi?: number; // hold in
  ex: number; // exhale
  ho?: number; // hold out
}

export interface BreathFractions {
  t1: number; // end of inhale
  t2: number; // end of hold-in
  t3: number; // end of exhale
}

export function breathLengthMs(technique: BreathTiming | null | undefined, cycleDurationS = 10): number {
  return technique ? technique.ih + (technique.hi || 0) + technique.ex + (technique.ho || 0) : cycleDurationS * 1000;
}

/** Phase fractions of the breath: end of inhale, end of hold-in, end of exhale (as in ValarBreathingLogo). */
export function breathFractions(technique: BreathTiming | null | undefined): BreathFractions {
  if (!technique) return { t1: 0.5, t2: 0.5, t3: 1 };
  const total = breathLengthMs(technique);
  return {
    t1: technique.ih / total,
    t2: (technique.ih + (technique.hi || 0)) / total,
    t3: (technique.ih + (technique.hi || 0) + technique.ex) / total,
  };
}

/** 0 at rest, 1 at full inhale: the same shape as the ring's scale keyframes. */
export function breathEnvelope(p: number, f: BreathFractions): number {
  if (p < f.t1) return f.t1 > 0 ? p / f.t1 : 1;
  if (p < f.t2) return 1;
  if (p < f.t3) return f.t3 > f.t2 ? 1 - (p - f.t2) / (f.t3 - f.t2) : 0;
  return 0;
}

export const COLOR_COUNT = 96;
/** Frames in the gem's sparkle loop, and how many breaths one loop lasts. */
export const GEM_FRAMES = 48;
export const GEM_LOOP_BREATHS = 3;

export interface GemClock {
  /** Fractional frame, 0 to GEM_FRAMES. */
  f: number;
  f0: number;
  f1: number;
  /** Crossfade weight of f1 over f0. */
  a: number;
  /** Index of the active breath colour. */
  idx: number;
  /** Phase within the current breath, 0 to 1. */
  p: number;
}

/** Everything the gem needs from the clock at one instant. `elapsed` is ms since the shared cycle start. */
export function gemClock(elapsedMs: number, breathMs: number): GemClock {
  const elapsed = Math.max(0, elapsedMs);
  const loopMs = GEM_LOOP_BREATHS * breathMs;
  const f = ((elapsed % loopMs) / loopMs) * GEM_FRAMES;
  const f0 = Math.floor(f) % GEM_FRAMES;
  return {
    f,
    f0,
    f1: (f0 + 1) % GEM_FRAMES,
    a: f - Math.floor(f),
    idx: Math.floor(elapsed / breathMs) % COLOR_COUNT,
    p: (elapsed % breathMs) / breathMs,
  };
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Scale the colour so its largest channel is 255, so dark colours change hue without dimming the stone. */
export function hueOnly(rgb: [number, number, number]): [number, number, number] {
  const max = Math.max(rgb[0], rgb[1], rgb[2]);
  if (max <= 0) return [255, 255, 255];
  return [(rgb[0] / max) * 255, (rgb[1] / max) * 255, (rgb[2] / max) * 255];
}

export const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/**
 * The colour the stone is multiplied by at this instant. `colors` is the 96-colour list, `strength` the
 * maximum tint (at peak inhale). With `useEnvelope` false the strength is held at its maximum.
 * Returns [r, g, b] in 0..255; [255, 255, 255] means no tint.
 */
export function gemMultiplyColor(
  colors: string[],
  idx: number,
  p: number,
  f: BreathFractions,
  strength: number,
  useEnvelope = true,
): [number, number, number] {
  const a = hueOnly(hexToRgb(colors[idx % colors.length]));
  const b = hueOnly(hexToRgb(colors[(idx + 1) % colors.length]));
  // Ease toward the next breath's colour during the exhale and hold-out, so it never jumps at a boundary.
  const t = p < f.t2 ? 0 : easeInOut((p - f.t2) / (1 - f.t2 || 1));
  // Mix in squared space, as Motion does.
  const hue = a.map((av, i) => Math.sqrt(av * av + (b[i] * b[i] - av * av) * t)) as [number, number, number];
  const k = strength * (useEnvelope ? 0.35 + 0.65 * breathEnvelope(p, f) : 1);
  return hue.map((h) => 255 + (h - 255) * k) as [number, number, number];
}

export type BreathPhase = 'i' | 'h' | 'e';

/**
 * The number the breathing counter shows. Each phase counts from 1: inhale 1, 2, 3...; a hold 1, 2, 3...; exhale counts
 * down to 1, so a 5-second inhale and exhale read 1 to 5 and then 5 to 1. `elapsedMs` is time since the shared cycle start.
 */
export function breathCounter(elapsedMs: number, t: BreathTiming): { count: number; phase: BreathPhase } {
  const ih = t.ih, hi = t.hi || 0, ex = t.ex, ho = t.ho || 0;
  const cycle = ih + hi + ex + ho;
  const d = ((elapsedMs % cycle) + cycle) % cycle;
  if (d < ih) return { count: Math.floor(d / 1000) + 1, phase: 'i' };
  if (d < ih + hi) return { count: Math.floor((d - ih) / 1000) + 1, phase: 'h' };
  if (d < ih + hi + ex) return { count: Math.max(1, Math.round(ex / 1000) - Math.floor((d - ih - hi) / 1000)), phase: 'e' };
  return { count: Math.floor((d - ih - hi - ex) / 1000) + 1, phase: 'h' };
}
