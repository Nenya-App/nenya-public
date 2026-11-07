// The static grain used to break up banding in the glow gradients (see src/lib/grain.ts).
import { GRAIN_AMOUNT, GRAIN_TILE, grainTileBytes, mulberry32 } from '../src/lib/grain.ts';
import { ok } from './helpers.mts';

ok('grain is 15%', GRAIN_AMOUNT === 0.15);
const a = mulberry32(1), b = mulberry32(1), c = mulberry32(2);
ok('seeded random numbers repeat for the same seed', a() === b() && a() === b());
ok('and differ for another seed', mulberry32(1)() !== c());
const t1 = grainTileBytes(), t2 = grainTileBytes();
ok('the tile has the right size', t1.length === GRAIN_TILE * GRAIN_TILE * 4);
ok('the tile is static: made twice, identical', t1.every((v, i) => v === t2[i]));
let white = 0, black = 0, alphaSum = 0, grey = true;
for (let p = 0; p < GRAIN_TILE * GRAIN_TILE; p++) {
  const r = t1[p * 4], g = t1[p * 4 + 1], bl = t1[p * 4 + 2];
  if (r !== g || g !== bl) grey = false;
  if (r === 255) white++; else if (r === 0) black++;
  alphaSum += t1[p * 4 + 3];
}
const n = GRAIN_TILE * GRAIN_TILE;
ok('every speck is pure white or pure black', grey && white + black === n);
ok('white and black are about equal (so the grain neither lightens nor darkens)', Math.abs(white - black) / n < 0.03, `${white} / ${black}`);
ok('speck opacity is spread evenly (mean near half)', Math.abs(alphaSum / n - 127.5) < 4, (alphaSum / n).toFixed(1));
ok('a different seed gives a different tile', grainTileBytes(GRAIN_TILE, 7).some((v, i) => v !== t1[i]));
