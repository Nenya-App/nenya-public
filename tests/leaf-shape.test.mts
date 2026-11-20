// The leaf generator (pure path data) and the three motion presets.
import { LEAF_SET, leafRing, leafGeometry, leafTransform, leafSilhouetteSvg } from '../src/lib/leafShape.ts';
import { chooseLeafPreset, leafAnimationStyles, leafMotionCss, readLeafCapability } from '../src/lib/leafMotion.ts';
import { breathFractions, breathEnvelope } from '../src/lib/breathClock.ts';
import { ok } from './helpers.mts';

const PATH = /^M[MCLQZ0-9.,\s-]+Z?$/;
const nums = (d: string) => (d.match(/-?\d+\.\d+/g) ?? []).map(Number);
const geos = LEAF_SET.map((s) => leafGeometry(s));

ok('there are six leaves with their own ids', LEAF_SET.length === 6 && new Set(LEAF_SET.map((s) => s.id)).size === 6);
for (const [i, g] of geos.entries()) {
  const parts = [g.blade, g.litHalf, g.midrib, g.sheen, ...g.veins];
  ok(`leaf ${i + 1}: every path is valid and finite`, parts.every((d) => PATH.test(d) && !/NaN|Infinity/.test(d) && nums(d).every(Number.isFinite)));
  ok(`leaf ${i + 1}: blade is closed, vein count matches`, g.blade.endsWith('Z') && g.veins.length === LEAF_SET[i].veins);
  ok(`leaf ${i + 1}: tip is at the length, base at the origin`, Math.abs(g.tip.y + LEAF_SET[i].length) < 0.01 && g.blade.startsWith('M0.00 0.00'));
}
ok('deterministic: same inputs, same strings', JSON.stringify(LEAF_SET.map((s) => leafGeometry(s))) === JSON.stringify(geos));
ok('six distinct blades', new Set(geos.map((g) => g.blade)).size === 6);
ok('six distinct shapes without motion (no two share length and width and veins)', new Set(LEAF_SET.map((s) => [s.length, s.width, s.veins, s.tipSharpness, s.curve].join())).size === 6);
ok('six distinct placements', new Set(LEAF_SET.map(leafTransform)).size === 6);
ok('a curve moves the tip sideways', leafGeometry({ ...LEAF_SET[0], curve: 0.1 }).tip.x > 0 && leafGeometry({ ...LEAF_SET[0], curve: 0 }).tip.x === 0);
ok('bad input still gives a drawable leaf', PATH.test(leafGeometry({ length: NaN, width: -5, tipSharpness: 9, curve: NaN, veins: -2 }).blade));
ok('silhouette is one svg with six blades', (leafSilhouetteSvg().match(/<path /g) ?? []).length === 6);

// Presets.
const cap = { reducedMotion: false, reducedData: false };
ok('preset: ordinary browser is full', chooseLeafPreset(cap) === 'full');
ok('preset: reduced motion is none, whatever else', chooseLeafPreset({ ...cap, reducedMotion: true, deviceMemory: 8 }) === 'none');
ok('preset: save-data is low', chooseLeafPreset({ ...cap, reducedData: true }) === 'low');
ok('preset: little memory or two cores is low', chooseLeafPreset({ ...cap, deviceMemory: 2 }) === 'low' && chooseLeafPreset({ ...cap, hardwareConcurrency: 2 }) === 'low');
ok('preset: no window means none', chooseLeafPreset(readLeafCapability(undefined)) === 'none' || typeof window !== 'undefined');

const tech = { ih: 4000, hi: 2000, ex: 6000, ho: 0 };
const style = (p: 'full' | 'low' | 'none', i = 0) => leafAnimationStyles(p, i, tech, 12000, 5000);
ok('none: no css and no animation on any part', leafMotionCss('none', tech) === '' && [0, 1, 2, 3, 4, 5].every((i) => Object.keys(style('none', i).open).length + Object.keys(style('none', i).glint).length + Object.keys(style('none', i).sway).length === 0));
ok('low: breath animation only, no sway', !!style('low').open.animation && !!style('low').glint.animation && Object.keys(style('low').sway).length === 0 && !leafMotionCss('low', tech).includes('@keyframes lm-sway'));
ok('full: breath and sway', !!style('full').open.animation && !!style('full').sway.animation && leafMotionCss('full', tech).includes('@keyframes lm-sway'));
ok('motion css repeats the reduced-motion rule', leafMotionCss('full', tech).includes('prefers-reduced-motion:reduce') && leafMotionCss('low', tech).includes('prefers-reduced-motion:reduce'));
ok('breath animation lasts exactly one breath', String(style('full').open.animation).includes('12000ms'));
ok('starts at the clock phase (negative delay = elapsed)', style('full').open.animationDelay === '-5000ms' && leafAnimationStyles('low', 0, tech, 12000, 17000).open.animationDelay === '-5000ms');
const f = breathFractions(tech);
const css = leafMotionCss('full', tech);
ok('keyframes follow the ring fractions (open held through the hold-in, closed at the end)', css.includes(`${Math.round(f.t1 * 10000) / 100}%{transform:rotate(calc(var(--lm-open) * 1))`) && breathEnvelope(0.4, f) === 1);
ok('no flashing: glint stays between 0.35 and 0.75', [...css.matchAll(/opacity:([\d.]+)/g)].every((m) => +m[1] >= 0.35 && +m[1] <= 0.75));
ok('leaves sway out of step with each other', new Set([0, 1, 2, 3, 4, 5].map((i) => style('full', i).sway.animationDelay)).size === 6);

// The leaf count is a parameter: six is the default, eight draws cleanly, nothing is hard-coded to six.
ok('default ring is six and equals leafRing(6)', LEAF_SET.length === 6 && JSON.stringify(leafRing()) === JSON.stringify(LEAF_SET));
for (const n of [6, 8]) {
  const ring = leafRing(n);
  const g = ring.map((s) => leafGeometry(s));
  ok(`ring of ${n}: ${n} unique ids, blades, and placements`, ring.length === n && new Set(ring.map((s) => s.id)).size === n && new Set(g.map((x) => x.blade)).size === n && new Set(ring.map(leafTransform)).size === n);
  ok(`ring of ${n}: all paths valid and finite`, g.every((x) => [x.blade, x.litHalf, x.midrib, x.sheen, ...x.veins].every((d) => PATH.test(d) && !/NaN/.test(d))));
  const step = 360 / n;
  const gaps = ring.map((s, i) => (ring[(i + 1) % n].angle - s.angle + 360) % 360);
  ok(`ring of ${n}: spacing stays within 4 degrees of even`, gaps.every((d) => Math.abs(d - step) < 4));
  // Neighbours must not overlap: blade width at its widest vs. arc spacing at mid-length.
  ok(`ring of ${n}: widest blade fits its slot at mid-length`, ring.every((s) => s.width < 2 * Math.PI * (s.root + s.length * 0.38) / n));
  ok(`ring of ${n}: silhouette has ${n} blades`, (leafSilhouetteSvg(n).match(/<path /g) ?? []).length === n);
}
