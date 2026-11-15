// The drawing is kept as strokes (lists of points), not only as pixels, so it can be built by pointer, by keyboard, by buttons or by switch, and so it can be
// described in words for people who cannot see it. Coordinates are in the canvas's own pixels.
export const CANVAS_W = 400;
export const CANVAS_H = 180;

export interface Pt { x: number; y: number }
export type Stroke = Pt[];

export const SHAPES = [
  { id: 'line', label: 'Straight line, left to right' },
  { id: 'vertical', label: 'Straight line, top to bottom' },
  { id: 'wave', label: 'Wave' },
  { id: 'zigzag', label: 'Zigzag' },
  { id: 'circle', label: 'Circle' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'dots', label: 'Cluster of dots' },
  { id: 'arrow', label: 'Arrow pointing right' },
] as const;
export type ShapeId = (typeof SHAPES)[number]['id'];
export type ShapeSize = 'small' | 'medium' | 'large';
export const SIZES: Record<ShapeSize, number> = { small: 24, medium: 48, large: 80 };

export const clampPt = (p: Pt): Pt => ({ x: Math.min(CANVAS_W, Math.max(0, p.x)), y: Math.min(CANVAS_H, Math.max(0, p.y)) });

/** The strokes of a shape centered on a point, kept inside the canvas. A dot is a stroke of one point. */
export function shapeStrokes(kind: ShapeId, center: Pt, size: ShapeSize): Stroke[] {
  const r = SIZES[size];
  const at = (dx: number, dy: number): Pt => clampPt({ x: center.x + dx, y: center.y + dy });
  const steps = (n: number, f: (t: number) => Pt): Stroke => Array.from({ length: n + 1 }, (_, i) => f(i / n));
  switch (kind) {
    case 'line': return [steps(12, (t) => at(-r + 2 * r * t, 0))];
    case 'vertical': return [steps(12, (t) => at(0, -r / 1.6 + (2 * r / 1.6) * t))];
    case 'wave': return [steps(40, (t) => at(-r * 1.4 + 2.8 * r * t, Math.sin(t * Math.PI * 4) * r * 0.35))];
    case 'zigzag': return [Array.from({ length: 7 }, (_, i) => at(-r * 1.2 + (2.4 * r * i) / 6, i % 2 ? r * 0.4 : -r * 0.4))];
    case 'circle': return [steps(48, (t) => at(Math.cos(t * Math.PI * 2) * r * 0.7, Math.sin(t * Math.PI * 2) * r * 0.7))];
    case 'spiral': return [steps(80, (t) => at(Math.cos(t * Math.PI * 6) * r * 0.75 * t, Math.sin(t * Math.PI * 6) * r * 0.75 * t))];
    case 'dots': return [[-0.5, -0.3], [0.2, -0.5], [0.6, 0.1], [-0.2, 0.4], [0.1, 0], [-0.7, 0.2]].map(([dx, dy]) => [at(dx * r, dy * r)]);
    case 'arrow': return [[at(-r, 0), at(r, 0)], [at(r * 0.45, -r * 0.4), at(r, 0), at(r * 0.45, r * 0.4)]];
  }
}

const length = (s: Stroke): number => s.reduce((n, p, i) => (i ? n + Math.hypot(p.x - s[i - 1].x, p.y - s[i - 1].y) : 0), 0);

function where(p: Pt): string {
  const h = p.x < CANVAS_W / 3 ? 'left' : p.x > (2 * CANVAS_W) / 3 ? 'right' : 'middle';
  const v = p.y < CANVAS_H / 3 ? 'top' : p.y > (2 * CANVAS_H) / 3 ? 'bottom' : 'middle';
  if (h === 'middle' && v === 'middle') return 'in the middle';
  if (h === 'middle') return `at the ${v}`;
  if (v === 'middle') return `on the ${h}`;
  return `at the ${v} ${h}`;
}

function describeStroke(s: Stroke): string {
  const first = s[0], last = s[s.length - 1];
  const cx = s.reduce((n, p) => n + p.x, 0) / s.length, cy = s.reduce((n, p) => n + p.y, 0) / s.length;
  const place = where({ x: cx, y: cy });
  if (s.length < 3 || length(s) < 6) return `a dot ${place}`;
  const len = length(s), chord = Math.hypot(last.x - first.x, last.y - first.y);
  if (chord < len * 0.12 && len > 40) return `a closed loop ${place}`;
  if (chord > len * 0.9) {
    const dx = last.x - first.x, dy = last.y - first.y;
    const dir = Math.abs(dx) > Math.abs(dy) * 2 ? (dx > 0 ? 'left to right' : 'right to left') : Math.abs(dy) > Math.abs(dx) * 2 ? (dy > 0 ? 'top to bottom' : 'bottom to top') : dx > 0 ? (dy > 0 ? 'down and to the right' : 'up and to the right') : dy > 0 ? 'down and to the left' : 'up and to the left';
    return `a straight line going ${dir} ${place}`;
  }
  return `a winding line ${place}`;
}

/** The drawing in words: how many strokes, what each looks like and roughly where. Used as the drawing's text for screen readers. */
export function describeDrawing(strokes: Stroke[]): string {
  const real = strokes.filter((s) => s.length);
  if (!real.length) return 'Empty.';
  const dots = real.filter((s) => s.length < 3 || length(s) < 6).length;
  const shown = real.slice(0, 6).map(describeStroke);
  const more = real.length > 6 ? `, and ${real.length - 6} more` : '';
  const head = real.length === 1 ? '1 stroke' : `${real.length} strokes${dots === real.length ? ' (all dots)' : ''}`;
  return `${head}: ${shown.join('; ')}${more}.`;
}
