// Small pictures of the two lens activities for the PDF report (docs/wireframes/lens/pattern-tapestry.html and movement-path.html; owner, 2026-11-18: the report text carries words only,
// the PDF may also show a thumbnail, and the coach reads words only). Drawn with the PDF's own line and rectangle calls, so no image is made and nothing is fetched. The words are in the
// report beside the picture; the picture is a recognisable sketch, never a measurement.
import { cleanLayers, cleanPoints, pathLook, type PathPoint } from './lensActivities.ts';

/** The few jsPDF calls used here (so a test can stand in for the document). */
export interface PdfPen {
  setDrawColor(r: number, g: number, b: number): unknown;
  setFillColor(r: number, g: number, b: number): unknown;
  setLineWidth(w: number): unknown;
  setLineDashPattern?(dash: number[], phase: number): unknown;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): unknown;
  line(x1: number, y1: number, x2: number, y2: number): unknown;
  circle(x: number, y: number, r: number, style?: string): unknown;
  rect(x: number, y: number, w: number, h: number, style?: string): unknown;
  setGState?(g: unknown): unknown;
  GState?: new (o: { opacity: number }) => unknown;
}

const INK: [number, number, number] = [60, 52, 46], GOLD: [number, number, number] = [201, 168, 138];

/** The tapestry: the base as the outer rounded square, each layer inside the one before it, a little smaller and a little darker. At most six layers are drawn. */
export function drawTapestryThumb(doc: PdfPen, layers: unknown, x: number, y: number, size = 28): number {
  const ls = cleanLayers(layers).slice(0, 6);
  if (ls.length === 0) return 0;
  const step = size / (2 * (ls.length + 1));
  ls.forEach((_, i) => {
    const inset = i * step, s = size - 2 * inset;
    const shade = Math.round(246 - 24 * (i + 1) / ls.length * 1.5); // lighter at the base, darker toward the middle
    doc.setFillColor(shade, Math.max(shade - 12, 150), Math.max(shade - 28, 120));
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + inset, y + inset, s, s, 1.5, 1.5, 'FD');
  });
  return size;
}

/** The path: the drawn line inside a small square, a ring where it starts and a dot where it ends. The line looks as the quality words say (broken, thick or thin), as on the page. */
export function drawPathThumb(doc: PdfPen, points: unknown, x: number, y: number, size = 28, feel: string[] = []): number {
  const pts: PathPoint[] = cleanPoints(points);
  if (pts.length < 2) return 0;
  const pad = 2, scale = (size - 2 * pad) / 100;
  const at = (p: PathPoint): [number, number] => [x + pad + p[0] * scale, y + pad + p[1] * scale];
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.rect(x, y, size, size, 'S');
  const look = pathLook(feel);
  doc.setDrawColor(...INK);
  doc.setLineWidth(Math.max(0.3, look.width * 0.18));
  const dash = look.dash === 'none' ? [] : look.dash.split(' ').map((n) => Number(n) * 0.35);
  doc.setLineDashPattern?.(dash, 0);
  for (let i = 1; i < pts.length; i++) { const a = at(pts[i - 1]), b = at(pts[i]); doc.line(a[0], a[1], b[0], b[1]); }
  doc.setLineDashPattern?.([], 0);
  const s = at(pts[0]), e = at(pts[pts.length - 1]);
  doc.setLineWidth(0.3);
  doc.circle(s[0], s[1], 0.9, 'S');
  doc.setFillColor(...INK);
  doc.circle(e[0], e[1], 0.9, 'F');
  return size;
}
