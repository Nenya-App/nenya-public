// The woven leaf outlines the logo draws: deterministic, gaps where a leaf passes under, counts 6, 8 and 12.
import { readFileSync } from 'node:fs';
import { leafWeave, weaveSpecs, weaveSilhouetteSvg, LOGO_LEAF_COUNT } from '../src/lib/leafWeave.ts';
import { flowerAnimationStyle, leafMotionCss } from '../src/lib/leafMotion.ts';
import { ok } from './helpers.mts';

const PATH = /^M[ML0-9.\s-]+Z?$/;
ok('the logo defaults to eight leaves', LOGO_LEAF_COUNT === 8 && leafWeave().count === 8);
ok('the weave is memoised and deterministic', leafWeave(8) === leafWeave(8) && JSON.stringify(leafWeave(6)) === JSON.stringify(JSON.parse(JSON.stringify(leafWeave(6)))));
ok('bad counts are clamped, never crash', weaveSpecs(0).length === 1 && weaveSpecs(99).length === 12 && weaveSpecs(NaN).length === 8);

for (const n of [6, 8, 12]) {
  const w = leafWeave(n);
  const specs = weaveSpecs(n);
  ok(`${n}: one set of paths per leaf, ids leaf-1..leaf-${n}`, w.outer.length === n && w.inner.length === n && w.rib.length === n && w.fill.length === n && w.ids.join() === Array.from({ length: n }, (_, i) => `leaf-${i + 1}`).join());
  ok(`${n}: all paths valid and finite`, [...w.outer, ...w.inner, ...w.rib, ...w.fill].every((d) => PATH.test(d) && !/NaN|Infinity/.test(d)));
  ok(`${n}: leaves are placed evenly round the ring`, specs.every((s, i) => Math.abs(s.angle - (i * 360) / n) < 1e-9));
  ok(`${n}: gaps are present (some outlines are broken where a leaf passes under)`, w.outer.every((d) => (d.match(/M/g) ?? []).length > 1) && (n < 12 || w.inner.every((d) => (d.match(/M/g) ?? []).length > 1)));
  ok(`${n}: no outer outline is closed: each leaf passes under at least one neighbour`, w.outer.every((d) => !d.endsWith('Z')));
  ok(`${n}: midrib is one open hairline per leaf`, w.rib.every((d) => d.startsWith('M') && !d.includes('Z') && (d.match(/M/g) ?? []).length === 1));
  ok(`${n}: all drawing stays inside the 765 box`, [...w.outer, ...w.inner].every((d) => (d.match(/-?\d+\.\d/g) ?? []).map(Number).every((v) => Math.abs(v) < 380)));
  ok(`${n}: the silhouette (glow mask) carries every outline`, (weaveSilhouetteSvg(n).match(/<path /g) ?? []).length === 2 * n);
}
ok('twelve narrower than six (width follows the count)', weaveSpecs(12)[0].width < weaveSpecs(6)[0].width);
ok('geometry is from the approved blend (root 30, length 340, sharpness 0.5, curve 0.035, eight wide 238*(6/8)^0.85)', (() => { const s = weaveSpecs(8)[0]; return s.root === 30 && s.length === 340 && s.tipSharpness === 0.5 && s.curve === 0.035 && s.width === Math.round(238 * Math.pow(0.75, 0.85)); })());

// The drawing component (read as source: it is TSX).
const src = readFileSync(new URL('../src/app/components/MallornLeaves.tsx', import.meta.url), 'utf8');
ok('component: eight leaves and alternating tones are the defaults; the midrib is off by default (owner, 2026-11-20)', /count = LOGO_LEAF_COUNT/.test(src) && /tones = 'alternate'/.test(src) && /midrib = false/.test(src));
ok("component: 'classic' is the other tone option", /'alternate' \| 'classic'/.test(src));
ok('component: the original finish is reused (gold and cream gradients, both lighting filters, round joins, 8.2 / 5.2 strokes)', ['gGold', 'gCream', 'fGold', 'fCream', 'rFill', 'feSpecularLighting', 'feDiffuseLighting'].every((t) => src.includes(t)) && /strokeLinejoin: 'round'/.test(src));
ok('component: tone alternation puts silver outside on odd (0-based) leaves, gold on even', /tones === 'alternate' && i % 2 === 1/.test(src));
ok('component: each leaf has an id group', /id=\{leafId\}/.test(src) && /data-leaf=/.test(src));
const original = readFileSync(new URL('../src/assets/logo/petals.svg', import.meta.url), 'utf8');
const grab = (re: RegExp, text: string) => (text.match(re) ?? []).join('');
ok('the colours match the original petals file', ['#b8803f', '#fcce96', '#fff0cf', '#b9b09f', '#f2ead9'].every((c) => original.includes(c) && src.toLowerCase().includes(c)) && grab(/specularExponent="28"/, original) === 'specularExponent="28"' && src.includes('specularExponent="28"'));

// Motion presets still apply, at flower level.
const tech = { ih: 4000, hi: 0, ex: 6000, ho: 0 };
ok('none preset: no keyframes and no animation', leafMotionCss('none', tech) === '' && Object.keys(flowerAnimationStyle('none', tech, 10000, 1234)).length === 0);
ok('full and low breathe at flower level only', !!flowerAnimationStyle('full', tech, 10000, 0).animation && !!flowerAnimationStyle('low', tech, 10000, 0).animation && /class(Name)?="lm-flower"/.test(src) && !/lm-open|lm-sway|lm-glint/.test(src));
