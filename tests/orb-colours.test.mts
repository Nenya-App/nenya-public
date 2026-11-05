// The orb colour model the gem uses for its inner light: six colours, one every 5 seconds, 30 seconds round,
// each orb 2 seconds behind the one before it.
import { orbColour, COLOR_CYCLE_S, ORB_DELAY_S } from '../src/lib/orbColours.ts';
import { ok } from './helpers.mts';

const v = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
const near = (a: number[], b: number[], e = 1) => a.every((x, i) => Math.abs(x - b[i]) <= e);

ok('at the start the first colour shows', near(orbColour(v, 0, 0), [255, 0, 0]));
ok('every 5 seconds the next colour has arrived', [0, 1, 2, 3, 4, 5].every((k) => near(orbColour(v, 0, k * 5), [parseInt(v[k].slice(1, 3), 16), parseInt(v[k].slice(3, 5), 16), parseInt(v[k].slice(5, 7), 16)])));
ok('halfway between two colours is their eased midpoint', near(orbColour(v, 0, 2.5), [127.5, 127.5, 0], 1));
ok('the cycle repeats every 30 seconds', near(orbColour(v, 0, 7.3), orbColour(v, 0, 7.3 + COLOR_CYCLE_S)));
ok('each orb is 2 seconds behind the one before', near(orbColour(v, 3, 11), orbColour(v, 0, 11 - 3 * ORB_DELAY_S)));
ok('negative time wraps instead of breaking', orbColour(v, 5, -3).every((x) => Number.isFinite(x) && x >= 0 && x <= 255));
ok('it is continuous (no jump between neighbouring moments)', Array.from({ length: 600 }, (_, i) => i / 10).every((t) => {
  const a = orbColour(v, 2, t), b = orbColour(v, 2, t + 0.1);
  return Math.max(...a.map((x, k) => Math.abs(x - b[k]))) < 40;
}));
