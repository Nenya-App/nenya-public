// The gem's kaleidoscope: the inside of the stone slowly changes its cut over time, so its pattern of light keeps
// re-forming, while the stone's outline stays still inside the bezel. Each facet angle drifts on its own slow wave, and
// the waves have unrelated lengths, so the pattern does not repeat for a long time. The star and pavilion facets also turn
// slowly, in opposite directions, which is what reads as a kaleidoscope.
//
// The ranges are the ones tests/live-gem.test.mts checks at their extremes: at full depth the stone stays closed and
// covers its outline (no gaps where the background would show through). It costs nothing extra to download: the cut is
// worked out on the device each frame (a few microseconds) and sent to the same shader.

import { DEFAULT_CUT, type GemCut } from './gemCut.ts';

export interface KaleidoscopeLook {
  on: boolean;
  /** How far the cut moves, 0 (not at all) to 1 (the full tested range). */
  depth: number;
  /** Seconds for the slowest wave. The others are shorter, by unrelated ratios. */
  periodS: number;
  /** Whether the star and pavilion facets also turn (0 = only the angles breathe). */
  turn: number;
}

export const DEFAULT_KALEIDOSCOPE: KaleidoscopeLook = { on: false, depth: 0.6, periodS: 90, turn: 1 };

/** The furthest each part of the cut may move from its base value at depth 1 (degrees, or stone units). */
export const KALEIDOSCOPE_SWING = {
  crown: 6,
  star: 6,
  starReach: 0.14,
  upperGirdle: 5,
  pavilion: 3.5,
  lowerGirdle: 5,
  tableZ: 0.06,
  /** Unused as a limit: the stars and pavilion turn without end (every 60 degrees the pattern matches itself again). */
  twist: 60,
};

// Ratios of the slowest wave, chosen so no two line up for a long time.
const RATIOS: Record<keyof typeof KALEIDOSCOPE_SWING, number> = {
  crown: 1,
  star: 0.787,
  starReach: 0.618,
  upperGirdle: 0.541,
  pavilion: 0.433,
  lowerGirdle: 0.371,
  tableZ: 0.299,
  twist: 0.5,
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** The cut at time `tSec`, moved from `base` by the kaleidoscope. With it off, `base` unchanged. */
export function kaleidoscopeCut(tSec: number, base: Partial<GemCut> = {}, k: Partial<KaleidoscopeLook> = {}): Partial<GemCut> {
  const look = { ...DEFAULT_KALEIDOSCOPE, ...k };
  if (!look.on || look.depth <= 0) return base;
  const c = { ...DEFAULT_CUT, ...base };
  const d = clamp(look.depth, 0, 1);
  const period = Math.max(10, look.periodS);
  const wave = (key: keyof typeof KALEIDOSCOPE_SWING, phase: number) => Math.sin((2 * Math.PI * tSec) / (period * RATIOS[key]) + phase);
  const S = KALEIDOSCOPE_SWING;
  // The stars and the pavilion turn steadily, in opposite directions. The cut repeats every 60 degrees, so wrapping the
  // angle at 60 is seamless. `turn` and `depth` set the speed: at both 1, a sixth of a turn each half period.
  const twist = (((clamp(look.turn, 0, 1) * d * 60 * tSec) / (period * RATIOS.twist)) % 60 + 60) % 60;
  return {
    ...base,
    crown: c.crown + S.crown * d * wave('crown', 0),
    star: c.star + S.star * d * wave('star', 1.3),
    starReach: clamp(c.starReach + S.starReach * d * wave('starReach', 2.1), 0.15, 0.75),
    upperGirdle: c.upperGirdle + S.upperGirdle * d * wave('upperGirdle', 0.7),
    pavilion: c.pavilion + S.pavilion * d * wave('pavilion', 2.9),
    lowerGirdle: c.lowerGirdle + S.lowerGirdle * d * wave('lowerGirdle', 1.9),
    tableZ: c.tableZ + S.tableZ * d * wave('tableZ', 0.4),
    starTwist: c.starTwist + twist,
    pavilionTwist: c.pavilionTwist - twist,
  };
}
