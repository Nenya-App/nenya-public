// The mark's settings and its pure parts (owner, 2026-11-15; reset from the editor on 2026-11-17), kept apart from the component so tests can read them.
// See src/app/components/NenyaMark.tsx and docs/brand/mark-settings-2026-11-17.md.
//
// The mark is nenya.biz with four e's stacked in one letter space: the white (page ink) e, a gold e that turns half a circle and rests upside down (so it reads
// nənya.biz, "nunya biz"), and two more. It is a visual form of the session ID: which of the extra e's rest upside down, and which colour each takes, come from
// the ID (src/lib/savedReflection.ts); the colours themselves are the breathing ring's (owner, 2026-11-26). A recognisable signature, a cryptography
// demonstration, nothing to do with security: the picture proves nothing and the ID is not secret.

export type MarkFace = 'body' | 'lyric';

/** Where a turned e rests relative to the white e, per face (em): sideways, up, and the space after the stack. These are the owner's settings from the editor (2026-11-17: Cormorant nudge -0.030, raise -0.025, after -0.010;
 *  Manrope nudge 0.085, raise 0.020, after -0.020), written as the NET placement. The editor turned each e about a point one left-side bearing too far left (it added the bearing to the middle of the ink), which pulled a
 *  turned e left by twice the bearing (Manrope 2 x 0.040 em, Cormorant italic 2 x 0.022 em); the owner's sideways nudge was cancelling that. The turn is now exact (about the middle of the ink), so the nudge is the old nudge
 *  plus twice the bearing, and the e lands exactly where the editor showed it: Manrope sits 0.005 em right of, and 0.020 em above, the white e (it forms the theta); it turns in place and does not swing. */
export const MARK_SETTINGS: Record<MarkFace, { nudge: number; rise: number; after: number }> = {
  lyric: { nudge: -0.074, rise: -0.025, after: -0.01 }, // Cormorant Garamond italic: -0.030 + 2 x (-0.022)
  body: { nudge: 0.005, rise: 0.02, after: -0.02 }, // Manrope: 0.085 + 2 x (-0.040)
};

/** An e's ink, in px at the size it is shown: how far it reaches left of and right of the glyph's starting point (left is negative when the letter has a side bearing), and above and below the baseline. */
export interface InkMetrics { left: number; right: number; ascent: number; descent: number }
/** The middle of an e's own ink, in px from the top-left of its box, given where the baseline sits in the box: the point an e turns about so that it turns in place (owner, 2026-11-18). */
export const inkCentre = (m: InkMetrics, baseline: number): { x: number; y: number } => ({ x: (m.right - m.left) / 2, y: baseline - (m.ascent - m.descent) / 2 });

/** Where the middle of an e's ink is in its box, in em from the top-left, per face (measured in Chrome and Firefox at 14 and 56 px, line-height 1). Used only if the browser cannot measure the glyph, so that an e still turns about
 *  its own middle and not about the middle of its box, which sits a tenth of an em too high and swings the e up and to the right. */
export const FALLBACK_PIVOT_EM: Record<MarkFace, { x: number; y: number }> = {
  lyric: { x: 0.177, y: 0.619 }, // Cormorant Garamond italic
  body: { x: 0.297, y: 0.61 }, // Manrope
};

export const SETTLE = 'cubic-bezier(.2, .8, .2, 1)';
/** The e's in the stack: the white e, the gold e, and two more. */
export const MARK_LAYERS = 4;

/** The single turn of the gold e, when the mark first comes into view (owner, 2026-11-17). Clockwise is +1. The gold e is in front of the white one. */
export interface MarkMotion { way: 1 | -1; degrees: number; durationMs: number; delayMs: number; easing: string; lift: number; pauseMs: number; goldColour: 'same' | 'turns' }
export const MARK_MOTION: Record<MarkFace, MarkMotion> = {
  lyric: { way: 1, degrees: 180, durationMs: 4200, delayMs: 700, easing: SETTLE, lift: 1.1, pauseMs: 0, goldColour: 'same' },
  body: { way: -1, degrees: 180, durationMs: 4000, delayMs: 1000, easing: SETTLE, lift: 1.1, pauseMs: 100, goldColour: 'turns' },
};

/** The fidget, started by pointing at the mark (or a tap, or its keyboard button): up to `steps` half turns, one e at a time, chosen at random. */
export interface MarkFidget { steps: number; turnMs: number; pauseMs: number; ways: 'either' | 'alternate' }
export const MARK_FIDGET: Record<MarkFace, MarkFidget> = {
  lyric: { steps: 16, turnMs: 1000, pauseMs: 500, ways: 'either' },
  body: { steps: 16, turnMs: 800, pauseMs: 400, ways: 'alternate' },
};
/** Colours kept at least this readable against the page (WCAG non-text contrast). */
export const MARK_MIN_CONTRAST = 3;

// ---- the session ID as a pair of colours, and the colours and arrangement made from it
const HEX = /^#?([0-9a-f]{6})$/i;
export type Rgb = [number, number, number];
export const hexToRgb = (h: string): Rgb => { const m = HEX.exec(h.trim()); const n = m ? parseInt(m[1], 16) : 0x808080; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgbToHex = (c: Rgb): string => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
/** The two colours of a session ID ("#7a9b9e.#dac682"), or null. */
export function pairFromId(id: string): [string, string] | null {
  const parts = id.split('.');
  return parts.length === 2 && HEX.test(parts[0]) && HEX.test(parts[1]) ? [rgbToHex(hexToRgb(parts[0])), rgbToHex(hexToRgb(parts[1]))] : null;
}
const lum = (c: Rgb): number => { const f = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
export const contrastOf = (a: Rgb, b: Rgb): number => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const blendHex = (a: string, b: string, t: number): string => { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); };
/** A colour moved toward black or white (away from the page) until it is at least `min`:1 against the page. */
export function readableOn(hex: string, bg: Rgb, min = MARK_MIN_CONTRAST): string {
  const c = hexToRgb(hex);
  if (contrastOf(c, bg) >= min) return rgbToHex(c);
  const target: Rgb = lum(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0.05; t <= 1; t += 0.05) { const m: Rgb = [0, 1, 2].map((i) => Math.round(c[i] + (target[i] - c[i]) * t)) as Rgb; if (contrastOf(m, bg) >= min) return rgbToHex(m); }
  return rgbToHex(target);
}
/**
 * The colours the mark's e's draw from (owner, 2026-11-26: the approved palettes): the breathing ring's own list for the theme, each kept readable
 * against the page, with no doubles. An empty list gives the page's gold.
 */
export function markColours(list: readonly string[], bg: Rgb): string[] {
  return [...new Set((list.length ? list : ['#c9a88a']).map((c) => readableOn(c, bg)))];
}

/** A small seeded random generator: the same seed always gives the same run of numbers. */
export function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The resting arrangement for a session ID: whether each e rests upside down. The white e is upright and the gold e is turned (that is the mark); the other two come from the ID. */
export function markArrangement(id: string, face: MarkFace): boolean[] {
  const rng = seededRng(`${id}|${face}|arrangement`);
  return [false, true, rng() < 0.5, rng() < 0.5];
}
/** The colour (an index into markColours) each e takes at rest, from the ID, so two sessions can differ. */
export function markColourIndexes(id: string, face: MarkFace, colours = 4): number[] {
  const rng = seededRng(`${id}|${face}|colours`);
  return [0, 1, 2, 3].map(() => Math.floor(rng() * colours));
}

export interface FidgetStep { layer: number; way: 1 | -1; colour: number }
/** The turns of one fidget: for each step, which e turns, which way, and which palette colour it takes. `rng` is Math.random on the site (seed off). */
export function fidgetPlan(face: MarkFace, rng: () => number = Math.random, first: 1 | -1 = 1, colours = 4): FidgetStep[] {
  const f = MARK_FIDGET[face];
  const plan: FidgetStep[] = [];
  for (let i = 0; i < f.steps; i++) {
    const way: 1 | -1 = f.ways === 'alternate' ? ((i % 2 === 0 ? first : -first) as 1 | -1) : rng() < 0.5 ? 1 : -1;
    plan.push({ layer: Math.floor(rng() * MARK_LAYERS), way, colour: Math.floor(rng() * colours) });
  }
  return plan;
}
