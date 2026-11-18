// The two optional lens activities (docs/wireframes/lens/pattern-tapestry.html and movement-path.html): the Pattern tapestry and the Movement path of movement.
// Pure functions only, so the words, the limits and the saved shape are tested. Both are off unless their own switch AND the lens tray are on, both are optional,
// and what is saved is words plus a small picture: the report text carries words only, the PDF may show a thumbnail, the coach reads words only.
import { lensTrayOn, SOFT_LIMIT } from './lensState.ts';
import { ORIGINAL_WORDS } from './senseWords.ts';

export const lensTapestryOn = (): boolean => lensTrayOn() && import.meta.env?.VITE_LENS_TAPESTRY === 'on';
export const lensPathOn = (): boolean => lensTrayOn() && import.meta.env?.VITE_LENS_PATH === 'on';

// ── Tapestry: layers[0] is the base, the rest sit above it.
export const TAPESTRY_PATTERNS: string[] = ORIGINAL_WORDS.pattern;
/** The soft limit counts the layers above the base: a base and three layers, then a warning (never a block). */
export const tapestryNeedsWarning = (layers: string[]): boolean => layers.length > SOFT_LIMIT;
export function tapestryWords(layers: string[] | null | undefined): string {
  if (!layers || layers.length === 0) return 'nothing woven yet';
  return `base: ${layers[0].toLowerCase()}${layers.slice(1).map((l) => `, then ${l.toLowerCase()}`).join('')}`;
}
export const cleanLayers = (x: unknown): string[] => (Array.isArray(x) ? x.filter((l): l is string => typeof l === 'string' && TAPESTRY_PATTERNS.includes(l)) : []);

// ── Path of movement: points on a 100 by 100 pad, [x, y] with y growing downward.
export type PathPoint = [number, number];
export type PathDir = 'up' | 'down' | 'left' | 'right';
export const PATH_STEP = 20, PATH_START: PathPoint = [10, 50], PATH_MAX_POINTS = 60;
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const stepPoint = (points: PathPoint[], dir: PathDir): PathPoint[] => {
  const last = points[points.length - 1] ?? PATH_START, d = { up: [0, -PATH_STEP], down: [0, PATH_STEP], left: [-PATH_STEP, 0], right: [PATH_STEP, 0] }[dir];
  return [...(points.length ? points : [last]), [clamp(last[0] + d[0]), clamp(last[1] + d[1])]];
};
/** Keep a saved path small: whole numbers, and no more than PATH_MAX_POINTS points, always keeping the first and last. */
export function simplifyPoints(points: PathPoint[]): PathPoint[] {
  const p = points.map(([x, y]) => [Math.round(clamp(x)), Math.round(clamp(y))] as PathPoint);
  if (p.length <= PATH_MAX_POINTS) return p;
  const out: PathPoint[] = []; for (let i = 0; i < PATH_MAX_POINTS; i++) out.push(p[Math.round((i * (p.length - 1)) / (PATH_MAX_POINTS - 1))]);
  return out;
}
export const cleanPoints = (x: unknown): PathPoint[] => (Array.isArray(x) ? x.filter((p): p is PathPoint => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n))).map(([a, b]) => [clamp(a), clamp(b)] as PathPoint) : []);
const dirOf = (a: PathPoint, b: PathPoint): PathDir => { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; };
/** The path as a short sentence: where it starts, which way it goes, and the quality words (the Movement lens's own list; the path has no list of its own). */
export function pathWords(points: PathPoint[] | null | undefined, feel: string[] = []): string {
  const p = points ?? [];
  if (p.length === 0) return 'nothing drawn yet';
  const x = p[0][0], where = x < 34 ? 'left' : x > 66 ? 'right' : 'middle';
  const keep: PathPoint[] = [p[0]]; p.forEach((q) => { const l = keep[keep.length - 1]; if (Math.hypot(q[0] - l[0], q[1] - l[1]) >= 12) keep.push(q); });
  const runs: PathDir[] = []; for (let i = 1; i < keep.length; i++) { const d = dirOf(keep[i - 1], keep[i]); if (runs[runs.length - 1] !== d) runs.push(d); }
  const tail = feel.length ? `; ${feel.map((f) => f.toLowerCase()).join(', ')}` : '';
  if (runs.length === 0) return `a start at the ${where}, and no steps yet${tail}`;
  return `starts at the ${where}, goes ${runs.slice(0, 6).join(', then ')}${runs.length > 6 ? ', and more' : ''}${tail}`;
}
/** How the line looks for the quality words: broken for jerky or hesitant, thick for forceful, thin for gentle. Looks only; the words say it too. */
export function pathLook(feel: string[]): { dash: string; width: number } {
  const f = feel.map((x) => x.toLowerCase());
  return { dash: f.includes('jerky') ? '4 3' : f.includes('hesitant') ? '2 4' : 'none', width: f.includes('forceful') ? 4 : f.includes('gentle') ? 1.5 : 2.5 };
}
