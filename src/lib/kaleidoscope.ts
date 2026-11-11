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
  /**
   * How much the stone's structure may move, 0 to 1: the crown, pavilion and girdle angles and the table's height. These
   * set the overall shape of the light, so keeping this low keeps the stone recognisably the same.
   */
  structure: number;
  /** How much the star facets (their angle and reach) may move, 0 to 1. These make the finer pattern inside the table. */
  pattern: number;
  /**
   * How far the turning sways each way, in degrees. The star and pavilion facets swing back and forth within this and
   * return to their home position. 0 means they turn without end (the original kaleidoscope).
   */
  sway: number;
}

/**
 * Ready-made looks, from barely moving to the original. Each keeps the stone's structure within its own limits and lets
 * the pattern move inside them. Pick one, then adjust any value on top of it.
 */
export const KALEIDOSCOPE_PRESETS = {
  /** The shape holds still; only the star pattern drifts and sways a little, very slowly. */
  calm: { on: true, depth: 0.5, periodS: 300, turn: 1, structure: 0.05, pattern: 0.5, sway: 6 },
  /** The shape barely moves; the pattern drifts slowly within it. The site's default. */
  gentle: { on: true, depth: 0.6, periodS: 200, turn: 1, structure: 0.15, pattern: 0.7, sway: 12 },
  /** More visible change, still swaying round the same home cut. */
  lively: { on: true, depth: 0.8, periodS: 120, turn: 1, structure: 0.4, pattern: 1, sway: 25 },
  /** The original: everything moves its full range and the facets turn without end. */
  full: { on: true, depth: 0.6, periodS: 90, turn: 1, structure: 1, pattern: 1, sway: 0 },
} satisfies Record<string, KaleidoscopeLook>;
export type KaleidoscopePreset = keyof typeof KALEIDOSCOPE_PRESETS;

export const DEFAULT_KALEIDOSCOPE: KaleidoscopeLook = KALEIDOSCOPE_PRESETS.gentle;

/** The furthest each part of the cut may move from its base value at depth 1 (degrees, or stone units). */
export const KALEIDOSCOPE_SWING = {
  crown: 6,
  star: 6,
  starReach: 0.14,
  upperGirdle: 5,
  pavilion: 3.5,
  lowerGirdle: 5,
  tableZ: 0.06,
  /** Unused as a limit (see `sway`): without a sway the facets turn without end (the pattern repeats every 60 degrees). */
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
  const st = d * clamp(look.structure, 0, 1);
  const pt = d * clamp(look.pattern, 0, 1);
  const wave = (key: keyof typeof KALEIDOSCOPE_SWING, phase: number) => Math.sin((2 * Math.PI * tSec) / (period * RATIOS[key]) + phase);
  const S = KALEIDOSCOPE_SWING;
  // The stars and the pavilion turn in opposite directions. With a sway they swing back and forth within it, so they
  // always come home. Without one they turn steadily; the cut repeats every 60 degrees, so wrapping the angle at 60 is
  // seamless (at `turn` and `depth` both 1, a sixth of a turn each half period).
  const tn = clamp(look.turn, 0, 1) * d;
  const sway = clamp(look.sway, 0, 30);
  const twist = sway > 0 ? sway * tn * wave('twist', 0.9) : (((tn * 60 * tSec) / (period * RATIOS.twist)) % 60 + 60) % 60;
  return {
    ...base,
    crown: c.crown + S.crown * st * wave('crown', 0),
    star: c.star + S.star * pt * wave('star', 1.3),
    starReach: clamp(c.starReach + S.starReach * pt * wave('starReach', 2.1), 0.15, 0.75),
    upperGirdle: c.upperGirdle + S.upperGirdle * st * wave('upperGirdle', 0.7),
    pavilion: c.pavilion + S.pavilion * st * wave('pavilion', 2.9),
    lowerGirdle: c.lowerGirdle + S.lowerGirdle * st * wave('lowerGirdle', 1.9),
    tableZ: c.tableZ + S.tableZ * st * wave('tableZ', 0.4),
    starTwist: c.starTwist + twist,
    pavilionTwist: c.pavilionTwist - twist,
  };
}
