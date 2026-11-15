// The live gem (src/lib/gemCut.ts, src/lib/gemRenderer.ts): the stone must be a closed, convex shape that fills its
// hexagon outline, the shader must be built with the right sizes, and the site must keep the sprite until the owner switches.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APOTHEM, DEFAULT_CUT, FRAME_HALF, PLANE_COUNT, gemPlanes, hexRadius } from '../src/lib/gemCut.ts';
import { DEFAULT_LIGHT, HIGH_QUALITY, LOW_QUALITY, fragmentSource } from '../src/lib/gemRenderer.ts';
import { orbColour, COLOR_CYCLE_S } from '../src/lib/orbColours.ts';
import { DEFAULT_INNER_ORBIT } from '../src/lib/orbitLook.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (p: string) => readFileSync(root + p, 'utf8');

const P = gemPlanes();
ok('the stone has the expected number of facet planes', P.length === PLANE_COUNT * 4);
ok('every facet normal is a unit vector', Array.from({ length: PLANE_COUNT }, (_, i) => Math.hypot(P[4 * i], P[4 * i + 1], P[4 * i + 2])).every((n) => Math.abs(n - 1) < 1e-6));

const inside = (x: number, y: number, z: number, planes = P) => {
  for (let i = 0; i < planes.length / 4; i++) if (planes[4 * i] * x + planes[4 * i + 1] * y + planes[4 * i + 2] * z > planes[4 * i + 3] + 1e-9) return false;
  return true;
};
ok('the centre of the stone is inside it', inside(0, 0, 0));
ok('the table is the top of the stone', inside(0, 0, DEFAULT_CUT.tableZ - 1e-6) && !inside(0, 0, DEFAULT_CUT.tableZ + 1e-3));
ok('the stone is closed underneath (the culet is a point below the girdle)', !inside(0, 0, -2) && inside(0, 0, -0.5));
ok('the girdle reaches the hexagon outline at every side', [0, 60, 120, 180, 240, 300].every((a) => inside(Math.cos((a * Math.PI) / 180) * (APOTHEM - 0.01), Math.sin((a * Math.PI) / 180) * (APOTHEM - 0.01), 0)));
ok('nothing sticks out past the hexagon outline', Array.from({ length: 72 }, (_, k) => k * 5).every((a) => !inside(Math.cos((a * Math.PI) / 180) * (hexRadius(a) + 0.01), Math.sin((a * Math.PI) / 180) * (hexRadius(a) + 0.01), 0)));

// A straight-down ray through any point of the outline must enter the stone (no holes the background shows through).
const hits = (x: number, y: number, planes = P) => {
  let tIn = -1e9, tOut = 1e9;
  for (let i = 0; i < planes.length / 4; i++) {
    const den = -planes[4 * i + 2];
    const t = (planes[4 * i + 3] - planes[4 * i] * x - planes[4 * i + 1] * y - planes[4 * i + 2] * 5) / den;
    if (den < -1e-6) tIn = Math.max(tIn, t);
    else if (den > 1e-6) tOut = Math.min(tOut, t);
  }
  return tIn <= tOut;
};
let holes = 0;
for (let y = -0.95; y <= 0.95; y += 0.025) for (let x = -0.85; x <= 0.85; x += 0.025) {
  const a = (Math.atan2(y, x) * 180) / Math.PI;
  if (Math.hypot(x, y) < hexRadius(a) * 0.97 && !hits(x, y)) holes++;
}
ok('every point inside the outline is covered by the stone', holes === 0, `${holes} holes`);
ok('a different cut is still a closed stone', (() => { const q = gemPlanes({ crown: 25, pavilion: 48, tableZ: 0.2 }); return inside(0, 0, 0, q) && hits(0.3, 0.2, q) && !inside(0, 0, -3, q); })());
ok('the stone sits in its frame exactly as the sprite does', Math.abs(1 / (2 * FRAME_HALF) - 476 / 1024) < 1e-9);

const hi = fragmentSource(HIGH_QUALITY);
const lo = fragmentSource(LOW_QUALITY);
ok('the shader is GLSL ES 3.00 and sized for every plane', hi.startsWith('#version 300 es') && hi.includes(`#define NP ${PLANE_COUNT}`));
ok('quality changes the shader (bounces, fire)', hi.includes('#define BOUNCES 5') && hi.includes('#define DISPERSE 1') && lo.includes('#define BOUNCES 3') && lo.includes('#define DISPERSE 0'));
ok('bounces are clamped to 1-8', fragmentSource({ ...HIGH_QUALITY, bounces: 40 }).includes('#define BOUNCES 8') && fragmentSource({ ...HIGH_QUALITY, bounces: 0 }).includes('#define BOUNCES 1'));
ok('diamond is the default material', DEFAULT_LIGHT.ior === 2.42);

ok('orb colours follow a changed cycle length', (() => { const v = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']; const a = orbColour(v, 0, 2, 60), b = orbColour(v, 0, 2 + 60, 60); return a.every((x, i) => Math.abs(x - b[i]) < 1e-6) && orbColour(v, 0, 10, 60).every((x, i) => Math.abs(x - [0, 255, 0][i]) < 1) && orbColour(v, 0, 1).every((x, i) => x === orbColour(v, 0, 1, COLOR_CYCLE_S)[i]); })());
ok('the inner orbit defaults are the look chosen on the bench on 2026-11-12', DEFAULT_INNER_ORBIT.radius === 0.06 && DEFAULT_INNER_ORBIT.orbSize === 0.073 && DEFAULT_INNER_ORBIT.opacityLow === 0.8 && DEFAULT_INNER_ORBIT.opacityHigh === 0.9 && DEFAULT_INNER_ORBIT.orbitSeconds === 120 && DEFAULT_INNER_ORBIT.colorCycle === 36 && DEFAULT_INNER_ORBIT.form === 0 && DEFAULT_INNER_ORBIT.shine === 1);

ok('the site draws the live gem (the sprite where it cannot run)', /export const GEM_ENGINE: 'sprite' \| 'live' = 'live';/.test(src('src/lib/gemSprite.ts')));
ok('the live gem falls back to the sprite', /fallback/.test(src('src/app/components/SpectralGem.tsx')) && /loadSprite\(\)/.test(src('src/app/components/SpectralGem.tsx')));
ok('the bench page is built, not indexed, and not linked from the site', /bench: path\.resolve\(__dirname, 'bench\/index\.html'\)/.test(src('vite.config.ts')) && /noindex/.test(src('bench/index.html')) && /for = "\/bench\/\*"[\s\S]*?X-Robots-Tag = "noindex, nofollow"/.test(src('netlify.toml')) && !/\/bench/.test(src('src/app/App.tsx')) && !/bench/.test(src('public/sitemap.xml')));
ok('the bench saves nothing on the device', !/localStorage|sessionStorage|indexedDB/.test(src('src/bench/GemBench.tsx')));

// The kaleidoscope: the cut moves over time, the stone must stay whole at every moment and at full depth.
const { kaleidoscopeCut, DEFAULT_KALEIDOSCOPE, KALEIDOSCOPE_PRESETS, KALEIDOSCOPE_SWING } = await import('../src/lib/kaleidoscope.ts');
const FULL = KALEIDOSCOPE_PRESETS.full;
ok('the kaleidoscope off leaves the cut unchanged', JSON.stringify(kaleidoscopeCut(37, { crown: 30 }, { on: false })) === JSON.stringify({ crown: 30 }));
let worst = 0;
for (let t = 0; t < 1800; t += 7.3) {
  const q = gemPlanes(kaleidoscopeCut(t, {}, { ...FULL, depth: 1, periodS: 60, turn: 1 }));
  let h = 0;
  for (let y = -0.9; y <= 0.9; y += 0.06) for (let x = -0.8; x <= 0.8; x += 0.06) {
    const a = (Math.atan2(y, x) * 180) / Math.PI;
    if (Math.hypot(x, y) < hexRadius(a) * 0.97 && !hits(x, y, q)) h++;
  }
  worst = Math.max(worst, h);
}
ok('at full depth, at every sampled moment over half an hour, the stone covers its outline', worst === 0, `${worst} holes`);
ok('nothing sticks out past the outline while it moves', [0, 13, 101, 777].every((t) => { const q = gemPlanes(kaleidoscopeCut(t, {}, { ...FULL, depth: 1 })); return Array.from({ length: 36 }, (_, k) => k * 10).every((a) => !inside(Math.cos((a * Math.PI) / 180) * (hexRadius(a) + 0.01), Math.sin((a * Math.PI) / 180) * (hexRadius(a) + 0.01), 0, q)); }));
ok('it changes slowly: a tenth of a second moves no angle more than a fraction of a degree', (() => { const a = kaleidoscopeCut(50, {}, { ...FULL, depth: 1, periodS: 90 }) as any, b = kaleidoscopeCut(50.1, {}, { ...FULL, depth: 1, periodS: 90 }) as any; return ['crown', 'star', 'pavilion', 'upperGirdle', 'lowerGirdle'].every((k) => Math.abs(a[k] - b[k]) < 0.2) && Math.abs(a.starTwist - b.starTwist) < 0.5; })());
ok('every preset keeps the structure and the turning within its limits, at every sampled moment', Object.values(KALEIDOSCOPE_PRESETS).every((p) => {
  const st = p.depth * p.structure + 1e-9, pt = p.depth * p.pattern + 1e-9;
  for (let t = 0; t < 3600; t += 4.7) {
    const c = kaleidoscopeCut(t, {}, p) as any;
    for (const k of ['crown', 'upperGirdle', 'pavilion', 'lowerGirdle', 'tableZ'] as const) if (Math.abs(c[k] - (DEFAULT_CUT as any)[k]) > (KALEIDOSCOPE_SWING as any)[k] * st) return false;
    if (Math.abs(c.star - DEFAULT_CUT.star) > KALEIDOSCOPE_SWING.star * pt) return false;
    if (p.sway > 0 && Math.abs(c.starTwist - DEFAULT_CUT.starTwist) > p.sway * p.depth * p.turn + 1e-9) return false;
  }
  return true;
}));
ok('the calmer presets move less and more slowly than the original', (() => { const P = KALEIDOSCOPE_PRESETS; const reach = (p: typeof P.full) => p.depth * p.structure; return reach(P.calm) < reach(P.gentle) && reach(P.gentle) < reach(P.lively) && reach(P.lively) < reach(P.full) && P.calm.periodS > P.gentle.periodS && P.gentle.periodS > P.full.periodS && P.gentle.sway > 0; })());
ok('the site and the bench start on the gentle preset', DEFAULT_KALEIDOSCOPE === KALEIDOSCOPE_PRESETS.gentle && /\.\.\.KALEIDOSCOPE_PRESETS\.gentle/.test(src('src/lib/siteGem.ts')));
ok('every preset stays whole at full depth', Object.values(KALEIDOSCOPE_PRESETS).every((p) => [0, 41, 333, 1201].every((t) => { const q = gemPlanes(kaleidoscopeCut(t, {}, { ...p, depth: 1 })); for (let y = -0.9; y <= 0.9; y += 0.09) for (let x = -0.8; x <= 0.8; x += 0.09) { const a = (Math.atan2(y, x) * 180) / Math.PI; if (Math.hypot(x, y) < hexRadius(a) * 0.97 && !hits(x, y, q)) return false; } return true; })));
ok('the turn wraps without a jump (the cut repeats every 60 degrees)', (() => { const q1 = gemPlanes({ starTwist: 0, pavilionTwist: 0 }), q2 = gemPlanes({ starTwist: 60, pavilionTwist: -60 }); const key = (p: Float32Array) => Array.from({ length: p.length / 4 }, (_, i) => Array.from(p.slice(4 * i, 4 * i + 4), (v) => v.toFixed(5)).join()).sort().join('|'); return key(q1) === key(q2); })());
ok('reduced motion holds the kaleidoscope still', /running = !reduced && !!L\?\.kaleidoscope\?\.on/.test(src('src/app/components/SpectralGem.tsx')));
ok('the kaleidoscope is OFF by default on the site (owner, 2026-11-12), and the site\'s cut is the one chosen on the bench', /kaleidoscope: \{ \.\.\.KALEIDOSCOPE_PRESETS\.\w+, on: false \}/.test(src('src/lib/siteGem.ts')) && /cut: \{ crown: 33, star: 19, starReach: 0\.54, upperGirdle: 41, pavilion: 41\.5, tableZ: 0\.24 \}/.test(src('src/lib/siteGem.ts')) && /live = SITE_LIVE_GEM/.test(src('src/app/components/SpectralGem.tsx')));
ok('turning the kaleidoscope off pauses it: its clock only runs while it is on, and the held cut is kept', /if \(running\) \{[\s\S]*?k\.t \+=/.test(src('src/app/components/SpectralGem.tsx')) && /if \(!k\.started\) return L\?\.cut;\s*return kaleidoscopeCut\(k\.t, L\?\.cut, \{ \.\.\.L\?\.kaleidoscope, on: true \}\)/.test(src('src/app/components/SpectralGem.tsx')));
ok('the live gem takes a quarter of the colour wheel; the sprite keeps its own', /SITE_LIVE_FIELD_ALPHA = 0\.25/.test(src('src/lib/siteGem.ts')) && /fieldAlphaProp \?\? \(renderer \? SITE_LIVE_FIELD_ALPHA : FIELD_ALPHA\)/.test(src('src/app/components/SpectralGem.tsx')));
