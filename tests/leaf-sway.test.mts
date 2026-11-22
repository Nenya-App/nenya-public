// The leaves' gentle sway (a visitor setting, off by default): its size and pace, when it may run, how each leaf starts, and that the woven gaps stay lined up.
import { readFileSync } from 'node:fs';
import { leafWeave, weaveSpecs } from '../src/lib/leafWeave.ts';
import { LEAF_ROCK_DEG, LEAF_ROCK_PERIOD_MS, leafBase, leafBox, leafRockCss, leafRockStyle, rockOffsetMs, swayAllowed, swayBlockedReason, type LeafCapability } from '../src/lib/leafMotion.ts';
import { ok } from './helpers.mts';

const calm: LeafCapability = { reducedMotion: false, reducedData: false, deviceMemory: 8, hardwareConcurrency: 8 };

ok('the sway is small (at most two degrees) and slow (a rock takes at least ten seconds)', LEAF_ROCK_DEG > 0 && LEAF_ROCK_DEG <= 2 && LEAF_ROCK_PERIOD_MS >= 10000);
// It is a visitor's choice and off unless made.
ok('not wanted: never on', !swayAllowed(false, true, calm));
ok('wanted, motion allowed: on', swayAllowed(true, true, calm));
ok('reduced motion: never on, however it was asked', !swayAllowed(true, true, { ...calm, reducedMotion: true }));
ok('the site\'s own breathing switch off: never on', !swayAllowed(true, false, calm));
ok('less data, little memory or few cores: not on (the lighter drawing, as the earlier sway did)', !swayAllowed(true, true, { ...calm, reducedData: true }) && !swayAllowed(true, true, { ...calm, deviceMemory: 2 }) && !swayAllowed(true, true, { ...calm, hardwareConcurrency: 2 }));
ok('unknown memory and cores (browsers that do not say) do not block it', swayAllowed(true, true, { reducedMotion: false, reducedData: false }));
ok('the settings can say why it is blocked, and say nothing when it is not', swayBlockedReason(true, { ...calm, reducedMotion: true }).includes('reduced motion') && swayBlockedReason(false, calm).includes('Breathing Emanation') && swayBlockedReason(true, { ...calm, reducedData: true }).length > 0 && swayBlockedReason(true, calm) === '');

// The stylesheet: one keyframe, one class, the reduced-motion backstop, and a loop with the same value at both ends.
const css = leafRockCss();
ok('the keyframes start and end on the same angle (no jump when the loop restarts) and swing both ways', /@keyframes lm-rock\{0%,100%\{transform:rotate\(calc\(var\(--lm-rock\) \* -1\)\)\}50%\{transform:rotate\(var\(--lm-rock\)\)\}\}/.test(css));
ok('the rock is eased, infinite and as slow as the period says', new RegExp(`\\.lm-rock\\{animation:lm-rock ${LEAF_ROCK_PERIOD_MS}ms ease-in-out infinite`).test(css));
ok('reduced motion switches it off in the stylesheet as well (a backstop for a setting changed while the page is open)', /@media \(prefers-reduced-motion:reduce\)\{\.lm-rock\{animation:none!important/.test(css));
ok('only transform is animated (no layout, no paint properties)', !/(width|height|left|top|margin|opacity|filter)\s*:/.test(css.split('}')[0] + css.split('}')[1]));

// Per-leaf phase and pivot.
for (const n of [6, 8, 10, 12]) {
  const offs = Array.from({ length: n }, (_, i) => rockOffsetMs(i, n));
  ok(`${n}: each leaf starts at a different point of the rock, evenly, and the wave joins up round the ring`, new Set(offs).size === n && offs[0] === 0 && offs.every((o, i) => Math.abs(o - (i * LEAF_ROCK_PERIOD_MS) / n) <= 1) && Math.abs(offs[n - 1] + LEAF_ROCK_PERIOD_MS / n - LEAF_ROCK_PERIOD_MS) <= 1);
  const specs = weaveSpecs(n);
  ok(`${n}: each leaf rocks about its own base (the place the leaf starts, 30 units out along its angle)`, specs.every((s, i) => { const b = leafBase(i, n); const a = (s.angle * Math.PI) / 180; return Math.abs(b.x - 30 * Math.sin(a)) < 0.01 && Math.abs(b.y + 30 * Math.cos(a)) < 0.01 && Math.abs(Math.hypot(b.x, b.y) - s.root) < 0.01; }));
}
const st = leafRockStyle(1, 8, 765, 5000);
ok('the style carries the amount, a pivot in px and a negative delay (so the leaf starts part-way round)', st['--lm-rock'] === `${LEAF_ROCK_DEG}deg` && /^[\d.]+px [\d.]+px$/.test(String(st.transformOrigin)) && /^-\d+ms$/.test(String(st.animationDelay)));
ok('the delay stays inside one period for any clock, and follows the wall clock (so a new logo carries on with the others)', [0, 1, 17999, 18000, 123456789, -5].every((t) => { const d = -parseInt(String(leafRockStyle(3, 8, 200, t).animationDelay)); return d >= 0 && d < LEAF_ROCK_PERIOD_MS; }) && leafRockStyle(2, 8, 200, 1000).animationDelay !== leafRockStyle(2, 8, 200, 2000).animationDelay);
ok('the pivot scales with the drawn size', String(leafRockStyle(0, 8, 765, 0).transformOrigin) !== String(leafRockStyle(0, 8, 200, 0).transformOrigin));

// The weave stays lined up. Each leaf has gaps cut where it goes under a neighbour; when two neighbours rock by different amounts, the point where they cross moves differently
// for each. Using the real leaf outlines, find every place a leaf crosses its next neighbour, move that place with each leaf's rotation about its own base through a whole
// rock, and measure how far apart the two copies get. The outer gap is cut 7.5 units round the crossing, so up to about half that is kept as the limit.
type P = [number, number];
const pts = (d: string): P[] => { const nn = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number); const o: P[] = []; for (let i = 0; i + 1 < nn.length; i += 2) o.push([nn[i], nn[i + 1]]); return o; };
function cross(a: P[], b: P[]): P[] {
  const out: P[] = [];
  for (let i = 0; i < a.length - 1; i++) for (let j = 0; j < b.length - 1; j++) {
    const [p, q, r, s] = [a[i], a[i + 1], b[j], b[j + 1]];
    const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
    if (Math.abs(d) < 1e-9) continue;
    const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
    const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
  }
  return out;
}
const rot = (x: P, b: { x: number; y: number }, deg: number): P => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), dx = x[0] - b.x, dy = x[1] - b.y; return [b.x + dx * c - dy * s, b.y + dx * s + dy * c]; };
for (const n of [6, 8, 10, 12]) {
  const w = leafWeave(n);
  let worst = 0, crossings = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    // every pair of leaves, not only neighbours: with wide leaves a leaf also crosses the one after next
    for (const x of cross(pts(w.fill[i]), pts(w.fill[j]))) {
      crossings++;
      for (let k = 0; k < 90; k++) {
        const t = k / 90;
        const a = rot(x, leafBase(i, n), LEAF_ROCK_DEG * Math.sin(2 * Math.PI * (t + i / n)));
        const b = rot(x, leafBase(j, n), LEAF_ROCK_DEG * Math.sin(2 * Math.PI * (t + j / n)));
        worst = Math.max(worst, Math.hypot(a[0] - b[0], a[1] - b[1]));
      }
    }
  }
  ok(`${n}: leaves cross somewhere, and at every crossing the two leaves drift apart by at most 3.6 units in 765 (the gap is cut 7.5 round it)`, crossings > 0 && worst <= 3.6, `worst ${worst.toFixed(2)} over ${crossings} crossings`);
}
const box = leafBox([leafWeave(6).outer[0], leafWeave(6).inner[0]]);
ok('a leaf\'s own filter box holds all of its outline with room, and is much smaller than the whole drawing', box.w < 765 * 0.6 && box.h <= 765 && box.x >= -382.5 - 30 && box.y >= -382.5 - 30);

// The component (read as source, it is TSX).
const src = readFileSync(new URL('../src/app/components/MallornLeaves.tsx', import.meta.url), 'utf8');
ok('component: sway is off unless asked for (the prop defaults to false and the page is drawn as one picture without it)', /sway = false/.test(src) && /if \(swaying\)/.test(src) && /useSwayAllowed\(sway, breathingEnabled\)/.test(src));
ok('component: the sway checks the site\'s breathing switch and the browser\'s reports, and re-reads reduced motion when it changes', /swayAllowed\(wanted, breathingEnabled, readLeafCapability\(\)\)/.test(src) && /prefers-reduced-motion: reduce/.test(src) && /addEventListener\?\.\('change', update\)/.test(src));
ok('component: never on for the first render (no mismatch between server and browser)', /useState\(false\); \/\/ never on for the first/.test(src));
ok('component: each leaf is a layer of its own, turned by CSS, with its own filter over its own box', /className="lm-rock"/.test(src) && /leafBox\(\[w\.outer\[i\], w\.inner\[i\]\]\)/.test(src) && /<MetalFilter id=\{lid\('fGold'\)\} box=\{box\}/.test(src));
ok('component: the layers are hidden from assistive technology like the single picture', (src.match(/aria-hidden="true"/g) ?? []).length >= 3);
ok('component: the over-and-under comes from the paths, so the layer order does not matter (it says so)', /not made by stacking order/.test(src));
const logo = readFileSync(new URL('../src/app/components/NenyaLogo.tsx', import.meta.url), 'utf8');
ok('the logo passes the visitor\'s wish, and never while the page is pinch-zoomed (the light drawing)', /sway=\{swayWish && !zoomed\}/.test(logo) && /useLeafSway\(\)/.test(logo));
