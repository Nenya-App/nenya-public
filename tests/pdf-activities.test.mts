// The PDF thumbnails of the tapestry and the path (src/lib/pdfActivities.ts): drawn with the PDF's own calls, only when there is something to draw, inside their square.
import { readFileSync } from 'node:fs';
import { drawPathThumb, drawTapestryThumb, type PdfPen } from '../src/lib/pdfActivities.ts';
import { TAPESTRY_PATTERNS } from '../src/lib/lensActivities.ts';
import { ok } from './helpers.mts';

const spy = () => {
  const calls: { n: string; a: unknown[] }[] = [];
  const doc: any = new Proxy({}, { get: (_t, n: string) => (...a: unknown[]) => { calls.push({ n, a }); } });
  return { doc: doc as PdfPen, calls };
};
const P = TAPESTRY_PATTERNS;

let t = spy();
ok('no layers draws nothing, and junk is ignored', drawTapestryThumb(t.doc, [], 0, 0) === 0 && drawTapestryThumb(t.doc, 'x', 0, 0) === 0 && drawTapestryThumb(t.doc, ['not a pattern'], 0, 0) === 0 && t.calls.length === 0);
t = spy();
const size = drawTapestryThumb(t.doc, [P[0], P[1], P[2]], 10, 20, 28);
const rects = t.calls.filter((c) => c.n === 'roundedRect');
ok('a base and two layers are three nested squares, each inside the one before it and inside the box', size === 28 && rects.length === 3 && rects.every((r, i) => i === 0 || ((r.a[0] as number) > (rects[i - 1].a[0] as number) && (r.a[2] as number) < (rects[i - 1].a[2] as number))) && rects.every((r) => (r.a[0] as number) >= 10 && (r.a[1] as number) >= 20 && (r.a[0] as number) + (r.a[2] as number) <= 38.0001 && (r.a[1] as number) + (r.a[3] as number) <= 48.0001));
t = spy();
drawTapestryThumb(t.doc, Array(9).fill(P[0]), 0, 0);
ok('no more than six layers are drawn', t.calls.filter((c) => c.n === 'roundedRect').length === 6);

t = spy();
ok('a path of fewer than two points draws nothing', drawPathThumb(t.doc, [[10, 50]], 0, 0) === 0 && drawPathThumb(t.doc, null, 0, 0) === 0 && t.calls.length === 0);
t = spy();
const path: [number, number][] = [[10, 50], [30, 50], [30, 30], [50, 30]];
const s2 = drawPathThumb(t.doc, path, 5, 5, 28);
const lines = t.calls.filter((c) => c.n === 'line');
ok('the path is one line segment per step, inside its square, with a ring at the start and a dot at the end', s2 === 28 && lines.length === 3 && lines.every((l) => (l.a as number[]).every((v) => v >= 5 - 0.001 && v <= 33.001)) && t.calls.filter((c) => c.n === 'circle').length === 2 && t.calls.some((c) => c.n === 'circle' && c.a[3] === 'F') && t.calls.some((c) => c.n === 'circle' && c.a[3] === 'S'));
t = spy();
drawPathThumb(t.doc, path, 0, 0, 28, ['Jerky']);
ok('a jerky path is drawn broken, and the dash is put back afterwards', t.calls.some((c) => c.n === 'setLineDashPattern' && (c.a[0] as number[]).length > 0) && (t.calls.filter((c) => c.n === 'setLineDashPattern').pop()!.a[0] as number[]).length === 0);
t = spy();
ok('a document without dash support still draws', (() => { const calls: string[] = []; const d: any = { setDrawColor() {}, setFillColor() {}, setLineWidth() {}, roundedRect() { calls.push('r'); }, line() { calls.push('l'); }, circle() {}, rect() {} }; return drawPathThumb(d, path, 0, 0) === 28 && drawTapestryThumb(d, [P[0]], 0, 0) === 28 && calls.length > 0; })());

const pdf = readFileSync('src/lib/nenyaPdfReport.ts', 'utf8');
ok('the PDF draws the tapestry only in the Pattern section and the path only in the Movement section, before the words', /gd\.gateway === 'insight' \? cleanLayers\(gd\.data\?\.tapestryLayers\)/.test(pdf) && /gd\.gateway === 'movement' \? cleanPoints\(gd\.data\?\.movementPath\)/.test(pdf) && pdf.indexOf('drawTapestryThumb(doc') < pdf.indexOf('dataLines.forEach((line)'));
const code = readFileSync('src/lib/pdfActivities.ts', 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
ok('the thumbnails fetch and store nothing', !/fetch\(|localStorage|sessionStorage|document\.|window\./.test(code));
