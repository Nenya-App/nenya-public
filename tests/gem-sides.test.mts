// The stone's side count (src/lib/gemCut.ts): six is the original hexagon, unchanged; eight is the octagon (docs/eight-sided-gem-scope.md).
import { DEFAULT_CUT, MAX_GEM_SIDES, MIN_GEM_SIDES, apothem, clampSides, frameHalf, gemPlanes, hexRadius, planeCount, sideStart, stoneRadius, FRAME_HALF, PLANE_COUNT } from '../src/lib/gemCut.ts';
import { HIGH_QUALITY, fragmentSource } from '../src/lib/gemRenderer.ts';
import { kaleidoscopeCut } from '../src/lib/kaleidoscope.ts';
import { ok } from './helpers.mts';

const rows = (p: Float32Array): string[] => Array.from({ length: p.length / 4 }, (_, i) => Array.from(p.slice(4 * i, 4 * i + 4)).map((v) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4)).join(',')).sort();
const inside = (p: Float32Array, x: number, y: number, z: number) => {
  for (let i = 0; i < p.length / 4; i++) if (p[4 * i] * x + p[4 * i + 1] * y + p[4 * i + 2] * z > p[4 * i + 3] + 1e-9) return false;
  return true;
};
const hits = (p: Float32Array, x: number, y: number) => {
  let tIn = -1e9, tOut = 1e9;
  for (let i = 0; i < p.length / 4; i++) {
    const den = -p[4 * i + 2];
    const t = (p[4 * i + 3] - p[4 * i] * x - p[4 * i + 1] * y - p[4 * i + 2] * 5) / den;
    if (den < -1e-6) tIn = Math.max(tIn, t);
    else if (den > 1e-6) tOut = Math.min(tOut, t);
  }
  return tIn <= tOut;
};

// Six sides must be exactly the stone the site has always drawn: the original construction, written out here, gives the same planes.
const legacy = (() => {
  const c = DEFAULT_CUT, deg = Math.PI / 180, A = Math.sqrt(3) / 2;
  const f = (phi: number, tilt: number, up: boolean, p: number[]) => { const s = Math.sin(tilt * deg), k = Math.cos(tilt * deg); const n = [Math.cos(phi * deg) * s, Math.sin(phi * deg) * s, up ? k : -k]; return [...n, n[0] * p[0] + n[1] * p[1] + n[2] * p[2]]; };
  const at = (phi: number, r: number, z: number) => [Math.cos(phi * deg) * r, Math.sin(phi * deg) * r, z];
  const out: number[][] = [[0, 0, 1, c.tableZ]];
  const culet = Math.tan(c.pavilion * deg) + c.girdle;
  for (let k = 0; k < 6; k++) { const side = k * 60, corner = 30 + k * 60; out.push(f(side, 90, true, at(side, A, 0)), f(side, c.crown, true, at(side, A, c.girdle)), f(corner, c.star, true, at(corner, c.starReach, c.tableZ)), f(corner, c.pavilion, false, [0, 0, -culet])); }
  for (let k = 0; k < 12; k++) { const phi = 15 + k * 30, corner = 30 + 60 * Math.round((phi - 30) / 60); out.push(f(phi, c.upperGirdle, true, at(corner, 1, c.girdle)), f(phi, c.lowerGirdle, false, at(corner, 1, -c.girdle))); }
  return new Float32Array(out.flat());
})();
ok('six sides give the same planes as the original hexagonal cut', JSON.stringify(rows(gemPlanes())) === JSON.stringify(rows(legacy)));
ok('six sides keep the plane count, frame and radius', PLANE_COUNT === 49 && planeCount(6) === 49 && Math.abs(FRAME_HALF - 1 / (2 * (476 / 1024))) < 1e-12 && stoneRadius(6) === 476 / 1024);
ok('the side count is limited to 6 to 12 and whole', clampSides(3) === MIN_GEM_SIDES && clampSides(40) === MAX_GEM_SIDES && clampSides(7.6) === 8 && clampSides(NaN) === 6 && clampSides('8') === 6);
ok('a corner is at the top for every side count', [6, 7, 8, 9, 10, 12].every((n) => Math.abs(hexRadius(90, n) - 1) < 1e-9));
ok('the octagon takes the hexagon\'s area (equal visual weight)', Math.abs(stoneRadius(8) ** 2 * 2 * Math.SQRT2 - stoneRadius(6) ** 2 * 1.5 * Math.sqrt(3)) < 1e-9);
ok('the frame holds every stone with a margin', [6, 8, 10, 12].every((n) => stoneRadius(n) < 0.5 && frameHalf(n) > 1));

for (const n of [6, 7, 8, 10, 12]) {
  const P = gemPlanes({ sides: n });
  ok(`${n} sides: ${planeCount(n)} planes, all unit normals`, P.length === planeCount(n) * 4 && Array.from({ length: planeCount(n) }, (_, i) => Math.hypot(P[4 * i], P[4 * i + 1], P[4 * i + 2])).every((v) => Math.abs(v - 1) < 1e-6));
  ok(`${n} sides: the stone is closed above and below`, inside(P, 0, 0, 0) && !inside(P, 0, 0, DEFAULT_CUT.tableZ + 1e-3) && !inside(P, 0, 0, -2) && inside(P, 0, 0, -0.5));
  const step = 360 / n;
  ok(`${n} sides: the girdle reaches the outline at every side`, Array.from({ length: n }, (_, k) => sideStart(n) + k * step).every((a) => inside(P, Math.cos((a * Math.PI) / 180) * (apothem(n) - 0.01), Math.sin((a * Math.PI) / 180) * (apothem(n) - 0.01), 0)));
  ok(`${n} sides: nothing sticks out past the outline`, Array.from({ length: 144 }, (_, k) => k * 2.5).every((a) => !inside(P, Math.cos((a * Math.PI) / 180) * (hexRadius(a, n) + 0.01), Math.sin((a * Math.PI) / 180) * (hexRadius(a, n) + 0.01), 0)));
  let holes = 0;
  for (let y = -0.95; y <= 0.95; y += 0.025) for (let x = -0.95; x <= 0.95; x += 0.025) {
    const r = Math.hypot(x, y), a = (Math.atan2(y, x) * 180) / Math.PI;
    if (r < hexRadius(a, n) - 0.02 && !hits(P, x, y)) holes++;
  }
  ok(`${n} sides: a ray through any point of the outline enters the stone`, holes === 0, `${holes} holes`);
  const sh = fragmentSource(HIGH_QUALITY, n);
  ok(`${n} sides: the shader is sized for the planes and the outline`, sh.includes(`#define NP ${planeCount(n)}`) && sh.includes(`#define SIDES ${n}`));
  const wrap = gemPlanes({ sides: n, starTwist: step, pavilionTwist: -step });
  ok(`${n} sides: the kaleidoscope's turn wraps without a jump at ${step} degrees`, JSON.stringify(rows(wrap)) === JSON.stringify(rows(P)));
}
const look = { on: true, depth: 1, periodS: 60, turn: 1, sway: 0 };
ok('the kaleidoscope wraps at 45 degrees for eight sides and 60 for six', (kaleidoscopeCut(1000, { sides: 8 }, look).starTwist ?? 99) < 45 && (kaleidoscopeCut(1000, { sides: 6 }, look).starTwist ?? 99) < 60);
