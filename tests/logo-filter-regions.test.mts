// Crash guard (docs/eight-sided-gem-scope.md, Part 4). Safari re-draws SVG filters at the zoomed scale, so a filter region far
// larger than its drawing multiplies memory when someone pinch-zooms on the logo (an iPhone crash was reported). Every filter in
// the logo's vector files must stay within a small margin of its own drawing.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = root + 'src/assets/logo/';
for (const f of readdirSync(dir).filter((n) => n.endsWith('.svg'))) {
  const s = readFileSync(dir + f, 'utf8');
  const vb = /viewBox="([-\d.\s]+)"/.exec(s)?.[1].trim().split(/\s+/).map(Number);
  ok(`${f}: has a viewBox`, !!vb && vb.length === 4);
  if (!vb) continue;
  const area = vb[2] * vb[3];
  const filters = [...s.matchAll(/<filter\b[^>]*>/g)].map((m) => m[0]);
  for (const t of filters) {
    const num = (k: string) => Number(new RegExp(`\\b${k}="(-?[\\d.]+)"`).exec(t)?.[1]);
    const w = num('width'), h = num('height');
    ok(`${f}: a filter's region is at most 1.2 times the drawing's area`, Number.isFinite(w) && Number.isFinite(h) && (w * h) / area <= 1.2, `${w}x${h} against ${vb[2]}x${vb[3]}`);
  }
}
