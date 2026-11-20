// A pure leaf generator: SVG path data for one long, pointed, slightly curved blade with a midrib and side veins
// (the shape of a mallorn leaf). Everything is drawn in a local frame with the base at (0, 0) and the tip pointing
// up, at (curve bend, -length). The caller rotates and places each leaf. No randomness: the same inputs always give
// the same strings, so the shapes can be tested.

export interface LeafParams {
  /** Base to tip, in drawing units. */
  length: number;
  /** Widest point of the blade, in drawing units. */
  width: number;
  /** 0 (a plain point) to 1 (a long, drawn-out tip). */
  tipSharpness: number;
  /** Sideways bend of the tip as a fraction of the length (0 straight; the sign sets the side). */
  curve: number;
  /** Side veins on each side of the midrib. */
  veins: number;
}

export interface LeafGeometry {
  /** The whole blade, closed. */
  blade: string;
  /** The half of the blade on the lit side, closed (for a lighter overlay). */
  litHalf: string;
  /** The midrib, from just above the base to just under the tip. */
  midrib: string;
  /** One path per vein pair (both sides of the midrib). */
  veins: string[];
  /** A thin highlight along the lit side. */
  sheen: string;
  tip: { x: number; y: number };
}

const SAMPLES = 24;

const fmt = (n: number): string => {
  const s = (Math.round(n * 100) / 100).toFixed(2);
  return s === '-0.00' ? '0.00' : s;
};
const pt = (p: readonly [number, number]): string => `${fmt(p[0])} ${fmt(p[1])}`;

/** Clamp to a range; NaN becomes the low end, so a bad input still gives a drawable leaf. */
const clamp = (v: number, lo: number, hi: number): number => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

/** An open smooth curve through the points, as cubic Bezier segments (Catmull-Rom). Starts with its own "M". */
function smooth(points: ReadonlyArray<readonly [number, number]>, move = true): string {
  let d = move ? `M${pt(points[0])}` : '';
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

export function leafGeometry(input: LeafParams): LeafGeometry {
  const length = clamp(input.length, 10, 2000);
  const width = clamp(input.width, 2, 2000);
  const sharp = clamp(input.tipSharpness, 0, 1);
  const curve = clamp(input.curve, -0.4, 0.4);
  const veinCount = Math.round(clamp(input.veins, 0, 12));

  // Half-width along the blade, t = 0 at the base and 1 at the tip. The exponents put the widest point at about
  // 38% of the way up whatever the sharpness; a larger q draws the tip out.
  const q = 0.9 + 1.1 * sharp;
  const p = 0.62 * q;
  const tMax = p / (p + q);
  const peak = Math.pow(tMax, p) * Math.pow(1 - tMax, q);
  const half = (t: number): number => (width / 2) * (Math.pow(t, p) * Math.pow(1 - t, q)) / peak;

  const centre = (t: number): [number, number] => [curve * length * t * t, -length * t];
  const normal = (t: number): [number, number] => {
    const tx = 2 * curve * length * t;
    const ty = -length;
    const n = Math.hypot(tx, ty);
    return [ty / n, -tx / n]; // points to the left of the direction of travel
  };
  /** The point at `t` along the blade, `k` of the half-width to the left (negative: right). */
  const at = (t: number, k: number): [number, number] => {
    const c = centre(t);
    const n = normal(t);
    const w = half(t) * k;
    return [c[0] + n[0] * w, c[1] + n[1] * w];
  };

  const ts = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES);
  const left = ts.map((t) => at(t, 1));
  const right = ts.map((t) => at(t, -1)).reverse();
  const spine = ts.map((t) => centre(t));

  const blade = `${smooth(left)}${smooth(right, false)}Z`;
  const litHalf = `${smooth(left)}${smooth([...spine].reverse(), false)}Z`;

  const midrib = smooth(ts.filter((t) => t >= 0.03 && t <= 0.93).map((t) => centre(t)));

  const veins: string[] = [];
  for (let i = 0; i < veinCount; i++) {
    const t0 = 0.14 + (0.56 * i) / Math.max(1, veinCount);
    const t1 = Math.min(0.9, t0 + 0.2);
    const tm = t0 + 0.6 * (t1 - t0);
    let d = '';
    for (const side of [1, -1]) {
      const a = at(t0, 0);
      const c = at(tm, 0.18 * side);
      const e = at(t1, 0.8 * side);
      d += `M${pt(a)}Q${pt(c)} ${pt(e)}`;
    }
    veins.push(d);
  }

  // A thin crescent on the lit side, between 28% and 58% of the half-width.
  const s0 = 0.12;
  const s1 = 0.66;
  const run = Array.from({ length: 13 }, (_, i) => s0 + ((s1 - s0) * i) / 12);
  const inner = run.map((t) => at(t, 0.28));
  const outer = run.map((t, i) => at(t, 0.28 + 0.3 * Math.sin((Math.PI * i) / 12))).reverse();
  const sheen = `${smooth(inner)}${smooth(outer, false)}Z`;

  const tip = centre(1);
  return { blade, litHalf, midrib, veins, sheen, tip: { x: Math.round(tip[0] * 100) / 100, y: Math.round(tip[1] * 100) / 100 } };
}

/** One leaf of the ring: its shape, and where it sits. */
export interface LeafSpec extends LeafParams {
  id: string;
  /** Degrees clockwise from straight up. */
  angle: number;
  /** Distance of the leaf's base from the centre, in drawing units. */
  root: number;
}

/** The base family: six leaves, none alike. The ring cycles through these for any leaf count. */
const FAMILY: ReadonlyArray<Omit<LeafSpec, 'id' | 'angle'> & { skew: number }> = [
  { skew: 0, root: 58, length: 306, width: 104, tipSharpness: 0.55, curve: 0.07, veins: 4 },
  { skew: 1.5, root: 60, length: 296, width: 110, tipSharpness: 0.4, curve: 0.09, veins: 5 },
  { skew: -1, root: 58, length: 312, width: 98, tipSharpness: 0.7, curve: 0.06, veins: 3 },
  { skew: 0.5, root: 60, length: 300, width: 108, tipSharpness: 0.5, curve: 0.1, veins: 6 },
  { skew: 0, root: 58, length: 308, width: 100, tipSharpness: 0.62, curve: 0.08, veins: 4 },
  { skew: -1, root: 60, length: 298, width: 106, tipSharpness: 0.45, curve: 0.05, veins: 5 },
];

/**
 * The leaves of the logo's ring. The logo's layout is SIX (the default); the count is a parameter, and eight draws
 * cleanly too (narrower blades, so neighbours do not touch). Leaves share a family likeness (long, pointed, bending the
 * same way round the ring, as a flower turns) but no two are alike: each differs in length, width, tip, bend and number
 * of veins, and sits a little off its exact angle, so they can be told apart without any motion. Ids are leaf-1, leaf-2, ...
 */
export function leafRing(count = 6): LeafSpec[] {
  const n = Math.max(1, Math.min(12, Math.round(Number.isFinite(count) ? count : 6)));
  const fit = Math.min(1, 6.6 / n); // blade width scale so a fuller ring keeps its gaps
  return Array.from({ length: n }, (_, i) => {
    const f = FAMILY[i % FAMILY.length];
    const round = Math.floor(i / FAMILY.length); // a second time through the family gets a different length and vein count
    return {
      id: `leaf-${i + 1}`,
      angle: Math.round(((i * 360) / n + f.skew) * 100) / 100,
      root: f.root,
      length: f.length + round * 9,
      width: Math.round(f.width * fit * 100) / 100,
      tipSharpness: f.tipSharpness,
      curve: f.curve,
      veins: f.veins + round,
    };
  });
}

/** The default layout: six leaves. */
export const LEAF_SET: readonly LeafSpec[] = leafRing(6);

/** A leaf's placement as an SVG `transform` (rotate about the logo's centre, then move out to the base). */
export function leafTransform(spec: Pick<LeafSpec, 'angle' | 'root'>): string {
  return `rotate(${fmt(spec.angle)}) translate(0 ${fmt(-spec.root)})`;
}

/** The six blades alone, in the 765-unit box, as one SVG document: a still silhouette (used as the glow's mask). */
export function leafSilhouetteSvg(count = 6): string {
  const paths = leafRing(count).map((s) => `<path transform="${leafTransform(s)}" d="${leafGeometry(s).blade}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-382.5 -382.5 765 765" width="765" height="765"><g fill="#000">${paths}</g></svg>`;
}
