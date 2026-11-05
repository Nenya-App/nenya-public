// The breath clock drives the ring, the counter and the gem, so they must agree. These check the maths the gem
// relies on: the sparkle loop is exactly three breaths, and the tint never jumps at a breath boundary.
import { breathLengthMs, breathFractions, breathEnvelope, gemClock, gemMultiplyColor, hueOnly, GEM_FRAMES } from '../src/lib/breathClock.ts';
import { ok } from './helpers.mts';

const even = { ih: 5000, hi: 0, ex: 5000, ho: 0 };
const box = { ih: 4000, hi: 4000, ex: 4000, ho: 4000 };
const s478 = { ih: 4000, hi: 7000, ex: 8000, ho: 0 };

ok('breath length adds the four phases', breathLengthMs(s478) === 19000 && breathLengthMs(box) === 16000);
ok('no technique falls back to the cycle duration', breathLengthMs(null, 10) === 10000 && breathLengthMs(undefined, 12) === 12000);
const f = breathFractions(s478);
ok('fractions are the end of inhale, hold-in and exhale', Math.abs(f.t1 - 4 / 19) < 1e-9 && Math.abs(f.t2 - 11 / 19) < 1e-9 && f.t3 === 1);
ok('envelope: 0 at rest, 1 at peak, 0 after the exhale',
  breathEnvelope(0, f) === 0 && breathEnvelope(f.t1, f) === 1 && breathEnvelope((f.t1 + f.t2) / 2, f) === 1 && breathEnvelope(f.t3 - 1e-9, f) < 1e-6);
ok('envelope rises through the inhale and falls through the exhale',
  breathEnvelope(f.t1 / 2, f) > 0.49 && breathEnvelope(f.t1 / 2, f) < 0.51 && breathEnvelope((f.t2 + f.t3) / 2, f) > 0.49 && breathEnvelope((f.t2 + f.t3) / 2, f) < 0.51);
ok('a technique with no hold keeps the envelope in range',
  [0, 0.1, 0.5, 0.9, 0.999].every((p) => { const v = breathEnvelope(p, breathFractions(even)); return v >= 0 && v <= 1; }));

// The sparkle loop lasts exactly three breaths, whatever the technique.
for (const [name, t] of [['even 5-5', even], ['box 4-4-4-4', box], ['4-7-8', s478]] as const) {
  const b = breathLengthMs(t);
  const start = gemClock(0, b);
  const end = gemClock(3 * b - 1, b);
  const wrap = gemClock(3 * b, b);
  ok(`${name}: loop starts at frame 0`, start.f0 === 0 && start.a === 0);
  ok(`${name}: loop ends on the last frame, then wraps to frame 0`, end.f0 === GEM_FRAMES - 1 && end.f1 === 0 && wrap.f0 === 0 && wrap.a < 1e-9);
  ok(`${name}: the colour index moves on every breath`, gemClock(b - 1, b).idx === 0 && gemClock(b, b).idx === 1 && gemClock(2 * b, b).idx === 2);
}
ok('colour index wraps after 96 breaths', gemClock(96 * 10000, 10000).idx === 0 && gemClock(97 * 10000, 10000).idx === 1);
ok('a negative elapsed time is clamped to the start', gemClock(-5000, 10000).f === 0);
ok('frame crossfade weight stays in [0, 1)', Array.from({ length: 200 }, (_, i) => gemClock(i * 137, 10000).a).every((a) => a >= 0 && a < 1));

// Tint: never jumps at a breath boundary, never dims the stone, and is off when the strength is 0.
const colors = ['#1E1E2A', '#3A3A50', '#F7D44A', '#2C6E9E'];
const ff = breathFractions(even);
for (let i = 0; i < colors.length; i++) {
  const endOfThis = gemMultiplyColor(colors, i, 0.999999, ff, 0.2);
  const startOfNext = gemMultiplyColor(colors, (i + 1) % colors.length, 0, ff, 0.2);
  const d = Math.max(...endOfThis.map((v, c) => Math.abs(v - startOfNext[c])));
  ok(`tint is continuous across the breath boundary (${colors[i]} to ${colors[(i + 1) % colors.length]})`, d < 0.5, `jump ${d.toFixed(3)}/255`);
}
ok('zero strength means no tint', gemMultiplyColor(colors, 0, 0.3, ff, 0).every((v) => v === 255));
ok('the tint never goes darker than the strength allows (dark Valar included)',
  colors.every((_, i) => [0, 0.25, 0.5, 0.75, 0.99].every((p) => gemMultiplyColor(colors, i, p, ff, 0.2).every((v) => v >= 255 - 255 * 0.2 - 1e-6 && v <= 255 + 1e-6))));
const peak = gemMultiplyColor(colors, 2, ff.t1, ff, 0.2);
ok('the tint peaks at the end of the inhale', [0, 0.1, 0.9].every((p) => gemMultiplyColor(colors, 2, p, ff, 0.2).reduce((a, v) => a + v, 0) >= peak.reduce((a, v) => a + v, 0) - 1e-6));
ok('reduced motion holds the tint at full strength', gemMultiplyColor(colors, 2, 0, ff, 0.2, false)[2] < gemMultiplyColor(colors, 2, 0, ff, 0.2, true)[2]);
const dark = hueOnly([0x1e, 0x1e, 0x2a]);
ok('a dark colour keeps its hue but is scaled to full brightness', Math.max(...dark) === 255 && dark[0] === dark[1] && dark[2] === 255);
ok('black does not produce NaN', hueOnly([0, 0, 0]).every((v) => v === 255));
