// The live gem's cut: a hexagonal stone (corners at the top and bottom, as in the sprite) described as a convex polyhedron,
// one plane per facet. A point p is inside the stone when n·p <= d for every plane [n, d]. Used by gemRenderer.ts, which
// ray-traces the stone in a shader, so the stone needs no mesh and no image.
//
// Units: the girdle's corner radius is 1. x points right, y up, z toward the viewer, who looks straight down at the table.
// All angles are in degrees and are tuning knobs (see the /bench page); the defaults are a starting point, not a measurement.

export interface GemCut {
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
  /** Turns the six star facets around the table, in degrees (the kaleidoscope uses this; 0 is the classic cut). */
  starTwist: number;
  /** Turns the six pavilion mains under the stone, in degrees. Only the inside pattern moves: the outline never does. */
  pavilionTwist: number;
}

export const DEFAULT_CUT: GemCut = {
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

/** The number of planes gemPlanes returns: table, 6 sides, 6 crown mains, 6 stars, 6 pavilion mains, 12 + 12 girdle facets. */
export const PLANE_COUNT = 49;

const deg = Math.PI / 180;
/** The girdle hexagon's apothem (the distance to the middle of a side). */
export const APOTHEM = Math.sqrt(3) / 2;

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
/** The girdle hexagon's radius in direction phi (sides face 0, 60, ... degrees; corners at 30, 90, ...). */
export const hexRadius = (phi: number): number => {
  let d = ((phi % 60) + 60) % 60;
  if (d > 30) d -= 60;
  return APOTHEM / Math.cos(d * deg);
};

/** The stone's planes, flattened as [nx, ny, nz, d] x PLANE_COUNT. */
export function gemPlanes(cut: Partial<GemCut> = {}): Float32Array {
  const c = { ...DEFAULT_CUT, ...cut };
  const out: Plane[] = [[0, 0, 1, c.tableZ]];
  const culet = Math.tan(c.pavilion * deg) + c.girdle; // the pavilion mains meet the girdle at the corners
  for (let k = 0; k < 6; k++) {
    const side = k * 60;
    const corner = 30 + k * 60;
    out.push(facet(side, 90, true, at(side, APOTHEM, 0))); // girdle side
    out.push(facet(side, c.crown, true, at(side, APOTHEM, c.girdle))); // crown main
    out.push(facet(corner + c.starTwist, c.star, true, at(corner + c.starTwist, c.starReach, c.tableZ))); // star
    out.push(facet(corner + c.pavilionTwist, c.pavilion, false, [0, 0, -culet])); // pavilion main
  }
  // The girdle facets run from a side's middle to the nearest corner, so each one meets the girdle at that corner
  // (otherwise they cut the corners off, and the background shows through there).
  for (let k = 0; k < 12; k++) {
    const phi = 15 + k * 30;
    const corner = 30 + 60 * Math.round((phi - 30) / 60);
    out.push(facet(phi, c.upperGirdle, true, at(corner, 1, c.girdle)));
    out.push(facet(phi, c.lowerGirdle, false, at(corner, 1, -c.girdle)));
  }
  return new Float32Array(out.flat());
}

/** Half the gem frame's side in stone units, so the stone sits in its frame exactly as the sprite's does (GEM_HEX_RADIUS). */
export const FRAME_HALF = 1 / (2 * (476 / 1024));
