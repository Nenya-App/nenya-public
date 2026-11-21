// The logo's leaves as thin woven outlines: the original petals' structure (an outer and an inner outline per leaf,
// each leaf passing over or under its neighbours, a faint translucent fill) drawn with mallorn-shaped leaves from
// leafGeometry(). Pure and deterministic; the geometry is computed once per leaf count and kept (leafWeave is memoised),
// so drawing costs nothing after the first call.
import { leafGeometry, type LeafSpec } from './leafShape.ts';

/** How many leaves the logo draws by default. The count is a parameter everywhere; 6, 8 and 12 are tested. */
export const LOGO_LEAF_COUNT = 8;

/** Stroke widths of the outer and inner outlines, and the hairline midrib (drawing units, as the original petals). */
export const WEAVE_OUTER_WIDTH = 8.2;
export const WEAVE_INNER_WIDTH = 5.2;
export const WEAVE_RIB_WIDTH = 1.6;
/** Radius of the gap cut in the leaf that passes under, on the outer and the inner outline. */
export const WEAVE_OUTER_GAP = 7.5;
export const WEAVE_INNER_GAP = 5.5;

type P = [number, number];

export interface LeafWeave {
  count: number;
  /** One id per leaf: leaf-1 ... leaf-N. */
  ids: string[];
  /** Outer outline of each leaf, with a gap where it passes under a neighbour. */
  outer: string[];
  /** Inner outline of each leaf, likewise. */
  inner: string[];
  /** The hairline midrib of each leaf. */
  rib: string[];
  /** The closed outer outline of each leaf (for the faint fill, and as the leaf's hit area). */
  fill: string[];
}

/** The leaf at position i of a ring of `count`: where it sits and its shape (the approved blend). */
export function weaveSpecs(count: number): LeafSpec[] {
  const n = Math.max(1, Math.min(12, Math.round(Number.isFinite(count) ? count : LOGO_LEAF_COUNT)));
  return Array.from({ length: n }, (_, i) => ({
    id: `leaf-${i + 1}`,
    tone: i % 2 === 0 ? 'gold' : 'silver', // the outer outline's metal when tones alternate
    angle: (i * 360) / n,
    root: 30,
    length: 340,
    width: Math.round(238 * Math.pow(6 / n, 0.85)),
    tipSharpness: 0.5,
    curve: 0.035,
    veins: 3,
  }));
}

const num = (s: string): number[] => s.match(/-?\d+(?:\.\d+)?/g)!.map(Number);

/** An "M ... C ..." path as a dense polyline (ten points per Bezier segment). */
function poly(d: string): P[] {
  const n = num(d);
  const pts: P[] = [[n[0], n[1]]];
  let cur: P = [n[0], n[1]];
  for (let i = 2; i + 5 < n.length; i += 6) {
    const c1: P = [n[i], n[i + 1]];
    const c2: P = [n[i + 2], n[i + 3]];
    const e: P = [n[i + 4], n[i + 5]];
    for (let k = 1; k <= 10; k++) {
      const t = k / 10;
      const u = 1 - t;
      pts.push([
        u * u * u * cur[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0],
        u * u * u * cur[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1],
      ]);
    }
    cur = e;
  }
  return pts;
}

/** Place a leaf-local polyline: move out by root (+ dy along the leaf), then rotate by angle degrees. */
function place(pts: P[], angle: number, root: number, dy = 0): P[] {
  const a = (angle * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => {
    const yy = y - root - dy;
    return [x * c - yy * s, x * s + yy * c] as P;
  });
}

/** Where two polylines cross. */
function crossings(a: P[], b: P[]): P[] {
  const out: P[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      const [p, q, r, s] = [a[i], a[i + 1], b[j], b[j + 1]];
      const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
      if (Math.abs(d) < 1e-9) continue;
      const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
      const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

const dist = (a: P, b: P): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Crossings found twice (at a segment joint) count once. */
function dedupe(xs: P[]): P[] {
  const o: P[] = [];
  for (const x of xs) if (!o.some((y) => dist(x, y) < 6)) o.push(x);
  return o;
}

const line = (pts: P[]): string => pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');

/** A closed outline with a gap wherever it is within `gap` of a point in `under`. */
function outline(pts: P[], under: P[], gap: number): string {
  const keep = pts.map((p) => !under.some((u) => dist(p, u) < gap));
  if (keep.every(Boolean)) return `M${line(pts)}Z`;
  const start = keep.findIndex((k) => !k);
  const n = pts.length;
  let d = '';
  let run: P[] = [];
  for (let i = 1; i <= n; i++) {
    const k = (start + i) % n;
    if (keep[k]) run.push(pts[k]);
    else {
      if (run.length > 1) d += `M${line(run)}`;
      run = [];
    }
  }
  if (run.length > 1) d += `M${line(run)}`;
  return d;
}

/**
 * The weave of a set of placed outlines. Leaf pairs cross at several points; each pair's crossings are ordered by
 * distance from the centre, and at crossing j the lower-numbered leaf a goes over if (j + a) is odd and under if even,
 * which alternates over and under all round the ring. The leaf that goes under is cut open around the crossing.
 */
function weave(set: P[][], gap: number): string[] {
  const under: P[][] = set.map(() => []);
  for (let a = 0; a < set.length; a++) {
    for (let b = a + 1; b < set.length; b++) {
      const xs = dedupe(crossings(set[a], set[b])).sort((p, q) => Math.hypot(p[0], p[1]) - Math.hypot(q[0], q[1]));
      xs.forEach((x, j) => {
        if ((j + a) % 2 === 0) under[b].push(x);
        else under[a].push(x);
      });
    }
  }
  return set.map((p, i) => outline(p, under[i], gap));
}

const memo = new Map<number, LeafWeave>();

/** The woven outlines for a ring of `count` leaves (memoised). */
export function leafWeave(count: number = LOGO_LEAF_COUNT): LeafWeave {
  const specs = weaveSpecs(count);
  const hit = memo.get(specs.length);
  if (hit) return hit;
  const outerPts = specs.map((s) => place(poly(leafGeometry(s).blade), s.angle, s.root));
  const innerPts = specs.map((s) => place(poly(leafGeometry({ ...s, length: s.length * 0.74, width: s.width * 0.6 }).blade), s.angle, s.root, s.length * 0.09));
  const result: LeafWeave = {
    count: specs.length,
    ids: specs.map((s) => s.id),
    outer: weave(outerPts, WEAVE_OUTER_GAP),
    inner: weave(innerPts, WEAVE_INNER_GAP),
    rib: specs.map((s) => `M${line(place(poly(leafGeometry({ ...s, length: s.length * 0.86 }).midrib), s.angle, s.root, s.length * 0.06))}`),
    fill: outerPts.map((p) => `M${line(p)}Z`),
  };
  memo.set(specs.length, result);
  return result;
}

/** Still silhouette of the woven outlines (the glow is cast from its alpha), in the 765-unit box. */
export function weaveSilhouetteSvg(count: number = LOGO_LEAF_COUNT): string {
  const w = leafWeave(count);
  const g = (paths: string[], width: number) => `<g stroke-width="${width}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-382.5 -382.5 765 765" width="765" height="765"><g fill="none" stroke="#000" stroke-linejoin="round" stroke-linecap="round">${g(w.outer, WEAVE_OUTER_WIDTH)}${g(w.inner, WEAVE_INNER_WIDTH)}</g></svg>`;
}
