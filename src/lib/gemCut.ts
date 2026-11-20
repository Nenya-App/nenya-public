// The live gem's cut: a regular-polygon stone (six sides by default, corners at the top and bottom, as in the sprite; eight
// for the octagon, see docs/eight-sided-gem-scope.md) described as a convex polyhedron,
// one plane per facet. A point p is inside the stone when n·p <= d for every plane [n, d]. Used by gemRenderer.ts, which
// ray-traces the stone in a shader, so the stone needs no mesh and no image.
//
// Units: the girdle's corner radius is 1. x points right, y up, z toward the viewer, who looks straight down at the table.
// All angles are in degrees and are tuning knobs (see the /bench page); the defaults are a starting point, not a measurement.

export interface GemCut {
  /** Number of sides of the stone's outline (6 to 12; the site's own are 6 and 8). Changing it rebuilds the shader. */
  sides: number;
  /** Crown main facets' slope from the girdle plane, facing the hexagon's sides. */
  crown: number;
  /** Star facets' slope, facing the corners, around the table. */
  star: number;
  /** How far the star facets reach from the centre, at table height (0 to 1). */
  starReach: number;
  /** Upper girdle facets' slope (twelve, between the mains and the stars). */
  upperGirdle: number;
  /** Pavilion main facets' slope, facing the corners, meeting at the culet. */
  pavilion: number;
  /** Lower girdle facets' slope (twelve). */
  lowerGirdle: number;
  /** Height of the table above the girdle (girdle corner radius = 1). */
  tableZ: number;
  /** Half the girdle's thickness. */
  girdle: number;
  /** Turns the star facets around the table, in degrees (the kaleidoscope uses this; 0 is the classic cut). */
  starTwist: number;
  /** Turns the pavilion mains under the stone, in degrees. Only the inside pattern moves: the outline never does. */
  pavilionTwist: number;
}

export const DEFAULT_CUT: GemCut = {
  sides: 6,
  crown: 34,
  star: 21,
  starReach: 0.4,
  upperGirdle: 43,
  pavilion: 40.8,
  lowerGirdle: 43,
  tableZ: 0.34,
  girdle: 0.015,
  starTwist: 0,
  pavilionTwist: 0,
};

/** The fewest and most sides a stone may have: under 6 it reads as a tile, past 12 it is within 3.5% of a circle (and costs twice as much to draw). */
export const MIN_GEM_SIDES = 6;
export const MAX_GEM_SIDES = 12;
/** The sides the stone has unless a look says otherwise. */
export const DEFAULT_GEM_SIDES = 6;
/** Whole sides inside the allowed range (anything else becomes the default). */
export const clampSides = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) ? Math.min(MAX_GEM_SIDES, Math.max(MIN_GEM_SIDES, Math.round(n))) : DEFAULT_GEM_SIDES);

/** The number of planes gemPlanes returns for `n` sides: table, n girdle sides, n crown mains, n stars, n pavilion mains, 2n + 2n girdle facets. 49 for six. */
export const planeCount = (n: number = DEFAULT_CUT.sides): number => 1 + 8 * clampSides(n);
/** The planes of the default (hexagonal) stone. */
export const PLANE_COUNT = planeCount(6);

const deg = Math.PI / 180;
/** The girdle polygon's apothem (the distance to the middle of a side) when its corner radius is 1. */
export const apothem = (n: number = DEFAULT_CUT.sides): number => Math.cos(Math.PI / clampSides(n));
/** The hexagon's apothem. */
export const APOTHEM = Math.sqrt(3) / 2;
/** Direction of the first side's middle, in degrees: a corner is at the top (90) and sides lie between corners. For six sides this is 120, which is the set 0, 60, ... */
export const sideStart = (n: number = DEFAULT_CUT.sides): number => 90 + 180 / clampSides(n);

/** The hexagonal stone's corner radius as a fraction of its frame's side (the sprite's, GEM_HEX_RADIUS in gemSprite.ts). */
export const HEX_STONE_RADIUS = 476 / 1024;
/**
 * A stone's corner radius as a fraction of its frame's side. Every polygon takes the same area as the hexagon, so the stone
 * keeps its visual weight inside the bezel: six sides give exactly the hexagon's radius, eight about 0.445.
 */
export const stoneRadius = (n: number = DEFAULT_CUT.sides): number => {
  const m = clampSides(n);
  const area = (k: number) => (k / 2) * Math.sin((2 * Math.PI) / k);
  return HEX_STONE_RADIUS * Math.sqrt(area(6) / area(m));
};

type Vec3 = [number, number, number];
type Plane = [number, number, number, number];

/** A facet whose outward normal points toward azimuth `phi`, tilted `tilt` degrees from straight up (or down), through point p. */
const facet = (phi: number, tilt: number, up: boolean, p: Vec3): Plane => {
  const s = Math.sin(tilt * deg);
  const c = Math.cos(tilt * deg);
  const n: Vec3 = [Math.cos(phi * deg) * s, Math.sin(phi * deg) * s, up ? c : -c];
  return [n[0], n[1], n[2], n[0] * p[0] + n[1] * p[1] + n[2] * p[2]];
};
const at = (phi: number, r: number, z: number): Vec3 => [Math.cos(phi * deg) * r, Math.sin(phi * deg) * r, z];
/** The girdle polygon's radius in direction phi (corner radius 1; for six sides the sides face 0, 60, ... degrees and the corners lie at 30, 90, ...). */
export const hexRadius = (phi: number, n: number = DEFAULT_CUT.sides): number => {
  const step = 360 / clampSides(n);
  let d = (((phi - sideStart(n)) % step) + step) % step;
  if (d > step / 2) d -= step;
  return apothem(n) / Math.cos(d * deg);
};

/** The stone's planes, flattened as [nx, ny, nz, d] x planeCount(sides). */
export function gemPlanes(cut: Partial<GemCut> = {}): Float32Array {
  const c = { ...DEFAULT_CUT, ...cut };
  const n = clampSides(c.sides);
  const step = 360 / n;
  const apo = apothem(n);
  const out: Plane[] = [[0, 0, 1, c.tableZ]];
  const culet = Math.tan(c.pavilion * deg) + c.girdle; // the pavilion mains meet the girdle at the corners
  for (let k = 0; k < n; k++) {
    const side = sideStart(n) + k * step;
    const corner = side + step / 2;
    out.push(facet(side, 90, true, at(side, apo, 0))); // girdle side
    out.push(facet(side, c.crown, true, at(side, apo, c.girdle))); // crown main
    out.push(facet(corner + c.starTwist, c.star, true, at(corner + c.starTwist, c.starReach, c.tableZ))); // star
    out.push(facet(corner + c.pavilionTwist, c.pavilion, false, [0, 0, -culet])); // pavilion main
  }
  // The girdle facets run from a side's middle to the nearest corner, so each one meets the girdle at that corner
  // (otherwise they cut the corners off, and the background shows through there). Two flank every corner, a quarter step either side.
  for (let k = 0; k < 2 * n; k++) {
    const corner = 90 + Math.floor(k / 2) * step;
    const phi = corner + (k % 2 === 0 ? -step / 4 : step / 4);
    out.push(facet(phi, c.upperGirdle, true, at(corner, 1, c.girdle)));
    out.push(facet(phi, c.lowerGirdle, false, at(corner, 1, -c.girdle)));
  }
  return new Float32Array(out.flat());
}

/** Half the gem frame's side in stone units, so the stone sits in its frame as the sprite's does (stoneRadius). */
export const frameHalf = (n: number = DEFAULT_CUT.sides): number => 1 / (2 * stoneRadius(n));
export const FRAME_HALF = frameHalf(6);
