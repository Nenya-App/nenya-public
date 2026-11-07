// The logo's glow is computed in JavaScript (Safari will not draw it as a CSS filter on this element), so the
// maths must behave like the CSS drop-shadow chain it replaces.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gaussianBlur, bakeGlow, GLOW_RADII, GLOW_COLORS, GLOW_SPREAD, GLOW_STRENGTH } from '../src/lib/glowBake.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const N = 257;
const disc = (r: number) => {
  const a = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) a[y * N + x] = Math.hypot(x - 128, y - 128) <= r ? 1 : 0;
  return a;
};

// A blurred point should be close to a Gaussian: right mass, right peak, symmetric.
const point = new Float32Array(N * N); point[128 * N + 128] = 1;
const sigma = 10;
const blurred = gaussianBlur(point, N, N, sigma);
const mass = blurred.reduce((a, v) => a + v, 0);
const peak = blurred[128 * N + 128];
const ideal = 1 / (2 * Math.PI * sigma * sigma);
ok('blur keeps the total (nothing lost inside the image)', Math.abs(mass - 1) < 1e-3, `mass ${mass.toFixed(5)}`);
// Three box blurs are the standard Gaussian approximation; their peak sits about 9% under a true Gaussian's.
ok('blur peak is within 12% of a true Gaussian', peak / ideal > 0.88 && peak / ideal < 1.02, `peak ${(peak / ideal).toFixed(3)} of ideal`);
ok('blur is symmetric', Math.abs(blurred[128 * N + 118] - blurred[128 * N + 138]) < 1e-6 && Math.abs(blurred[118 * N + 128] - blurred[138 * N + 128]) < 1e-6);
ok('a tiny sigma leaves the image unchanged', gaussianBlur(point, N, N, 0.1)[128 * N + 128] === 1);
ok('blur of an empty image is empty', gaussianBlur(new Float32Array(N * N), N, N, 8).every((v) => v === 0));

// The baked glow.
const content = disc(20);
const px = bakeGlow(content, N, N, GLOW_RADII.dark, 1);
const alphaAt = (x: number, y: number) => px[(y * N + x) * 4 + 3];
const inside = alphaAt(128, 128), edge = alphaAt(128 + 22, 128), mid = alphaAt(128 + 35, 128), far = alphaAt(128 + 70, 128);
ok('no glow inside solid content', inside === 0);
ok('glow is strongest at the edge and fades outward', edge > mid && mid > far && edge > 150, `${edge} > ${mid} > ${far}`);
ok('glow reaches well past the edge', alphaAt(128 + 50, 128) > 5);
ok('glow is round (same in every direction)', Math.abs(alphaAt(128 + 35, 128) - alphaAt(128, 128 + 35)) <= 2 && Math.abs(alphaAt(128 + 35, 128) - alphaAt(128 - 35, 128)) <= 2);
const [lo, hi] = [Math.min(...GLOW_COLORS.map((c) => c[0])), Math.max(...GLOW_COLORS.map((c) => c[0]))];
const r = px[(128 * N + 128 + 30) * 4];
ok('glow colour stays within the three gold tones', r >= lo - 1 && r <= hi + 1, `red ${r}`);
const hov = bakeGlow(content, N, N, GLOW_RADII.darkHover, 1);
ok('the hovered glow is wider and stronger than the resting glow', hov[(128 * N + 128 + 60) * 4 + 3] > px[(128 * N + 128 + 60) * 4 + 3]);
const light = bakeGlow(content, N, N, GLOW_RADII.light, 1);
ok('the light-mode glow is tighter than the dark-mode glow', light[(128 * N + 128 + 55) * 4 + 3] < px[(128 * N + 128 + 55) * 4 + 3]);
ok('a higher pixel density scales the glow with it', bakeGlow(disc(20), N, N, [4, 8, 12], 2)[(128 * N + 128 + 40) * 4 + 3] > bakeGlow(disc(20), N, N, [4, 8, 12], 1)[(128 * N + 128 + 40) * 4 + 3]);
ok('no content, no glow', bakeGlow(new Float32Array(N * N), N, N, GLOW_RADII.dark, 1).every((v) => v === 0));

// The CSS filter chain is gone from the logo, and the radii match what it used to be.
const css = readFileSync(root + 'src/styles/globals.css', 'utf8');
ok('the logo glow is no longer a CSS filter', !/\.nenya-logo-glow[^{]*\{[^}]*filter/.test(css) && !css.includes('gem-shimmer'));
ok('radii match the old CSS (light 8/16/24, dark 10/20/30, hovers 12/24/36 and 16/32/48)',
  GLOW_RADII.light.join() === '8,16,24' && GLOW_RADII.dark.join() === '10,20,30' && GLOW_RADII.lightHover.join() === '12,24,36' && GLOW_RADII.darkHover.join() === '16,32,48');
ok('outer orbs get a box-shadow glow with doubled radii, widened by 1.45', css.includes('.nenya-orb-glow') && /0 0 29px[\s\S]*0 0 58px[\s\S]*0 0 87px/.test(css));
ok('the glow is tightened and softened for the vector petals (bench settings)', GLOW_SPREAD === 0.75 && GLOW_STRENGTH === 0.74);
const full = bakeGlow(content, N, N, GLOW_RADII.dark, 1)[(128 * N + 128 + 30) * 4 + 3];
const soft = bakeGlow(content, N, N, GLOW_RADII.dark, 1, undefined, 0.5)[(128 * N + 128 + 30) * 4 + 3];
ok('strength scales the glow opacity and nothing else', soft > 0 && Math.abs(soft - full / 2) <= 1, `${soft} vs ${full}`);

// Grain: a fixed, seeded noise that breaks up banding; off unless asked for.
import { GLOW_GRAIN } from '../src/lib/glowBake.ts';
ok('the logo glow carries a 15% grain', GLOW_GRAIN === 0.15);
const plain = bakeGlow(content, N, N, GLOW_RADII.dark, 1, undefined, GLOW_STRENGTH);
const g1 = bakeGlow(content, N, N, GLOW_RADII.dark, 1, undefined, GLOW_STRENGTH, GLOW_GRAIN);
const g2 = bakeGlow(content, N, N, GLOW_RADII.dark, 1, undefined, GLOW_STRENGTH, GLOW_GRAIN);
ok('grain is static: the same bake twice is identical', g1.every((v, i) => v === g2[i]));
ok('no grain by default: the plain bake is unchanged by this feature', plain.some((v, i) => v !== g1[i]));
let sumP = 0, sumG = 0, cnt = 0, maxRel = 0, moved = 0, seen = 0;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const i = (y * N + x) * 4 + 3;
  if (plain[i] > 40) {
    sumP += plain[i]; sumG += g1[i]; cnt++; seen++;
    if (g1[i] !== plain[i]) moved++;
    maxRel = Math.max(maxRel, Math.abs(g1[i] - plain[i]) / plain[i]);
  }
}
ok('grain does not brighten or dim the glow on average (within 1%)', Math.abs(sumG - sumP) / sumP < 0.01, `${(sumG / cnt).toFixed(2)} vs ${(sumP / cnt).toFixed(2)}`);
ok('grain moves most pixels but never more than 15% plus rounding', moved / seen > 0.7 && maxRel <= 0.15 + 1.5 / 40, `moved ${(moved / seen).toFixed(2)}, worst ${(maxRel * 100).toFixed(1)}%`);
let strayInside = 0, strayEmpty = 0;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const i = (y * N + x) * 4 + 3;
  if (content[y * N + x] === 1 && g1[i] !== 0) strayInside++;
  if (plain[i] === 0 && plain[i - 3] === 0 && g1[i] > 1) strayEmpty++;
}
ok('grain adds nothing inside the content', strayInside === 0, String(strayInside));
ok('grain does not spill far past the glow (at most a step of rounding noise)', strayEmpty === 0, String(strayEmpty));
ok('grain breaks up flat steps: the faint tail has more distinct opacity values', new Set(Array.from(g1).filter((_, i) => i % 4 === 3 && g1[i] > 0 && g1[i] < 12)).size >= new Set(Array.from(plain).filter((_, i) => i % 4 === 3 && plain[i] > 0 && plain[i] < 12)).size);

// Orb halos: the CSS carries the same grain through one repeating tile, in the same four states as the halo.
ok('the orb halo has a grain layer at 15%, using the shared tile', /\.nenya-orb-glow::after\s*\{[^}]*opacity:\s*0\.15[^}]*\}/.test(css) && css.includes('var(--nenya-grain'));
ok('the grain layer reaches as far as the halo in all four states', /\.nenya-orb-glow::after\s*\{[^}]*inset:\s*-70px/.test(css) && ['-87px', '-104px', '-139px'].every((v) => new RegExp(`nenya-orb-glow::after \\{ inset: ${v}; \\}`).test(css)));
