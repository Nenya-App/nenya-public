// The visitor's own look for the logo (docs/eight-sided-gem-scope.md, Part 2): how many leaves the ring has and how many sides the
// gem has. Presets, not sliders. Pure, so it is tested; the choice is kept by src/lib/deviceMemory.ts (only while "Remember on this
// device" is on). The still pictures of the logo (header image, icons, social preview, PDF) always stay at the standard design.
import { DEFAULT_GEM_SIDES, MAX_GEM_SIDES, MIN_GEM_SIDES, clampSides } from './gemCut.ts';

/** Leaf counts a visitor can choose for the logo's look: all even, so the weave alternates cleanly all the way round. */
export const LEAF_PRESETS = [6, 8, 10, 12] as const;
/** Gem sides a visitor can choose. 12 is possible in the engine but twice the cost of 6, so it is not offered. */
export const GEM_SIDE_PRESETS = [6, 8, 10] as const;
/** The leaves the logo has by default: eight, which looks best with the mallorn leaves; the gem then follows as an octagon. */
export const DEFAULT_LOGO_LEAVES = 8;
/** The gem follows the leaves unless the visitor picks a number. */
export type GemSidesChoice = 'match' | (typeof GEM_SIDE_PRESETS)[number];
export const DEFAULT_GEM_CHOICE: GemSidesChoice = 'match';
/** On a low-capability device the stone is drawn with at most this many sides. */
export const LOW_DEVICE_MAX_SIDES = 8;

const nearest = <T extends number>(n: number, from: readonly T[]): T => from.reduce((best, v) => (Math.abs(v - n) < Math.abs(best - n) ? v : best), from[0]);

/** A leaf count the logo may have: the nearest preset (anything unreadable becomes the default). */
export const snapLeaves = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) ? nearest(n, LEAF_PRESETS) : DEFAULT_LOGO_LEAVES);
/** A gem choice the logo may have: 'match' or the nearest preset. */
export const snapGemChoice = (v: unknown): GemSidesChoice => (v === 'match' ? 'match' : typeof v === 'number' && Number.isFinite(v) ? nearest(v, GEM_SIDE_PRESETS) : DEFAULT_GEM_CHOICE);

/**
 * The sides the stone is drawn with. "Match" follows the leaves, kept between 6 and 10 (so twelve leaves give ten sides). Where the
 * live gem cannot run (no WebGL2) the stone is the sprite's hexagon; on a low-capability device it never has more than eight.
 */
export function effectiveGemSides(choice: GemSidesChoice, leaves: number, opts: { live: boolean; low: boolean }): number {
  if (!opts.live) return DEFAULT_GEM_SIDES;
  const wanted = choice === 'match' ? Math.min(Math.max(snapLeaves(leaves), MIN_GEM_SIDES), 10) : choice;
  return clampSides(opts.low ? Math.min(wanted, LOW_DEVICE_MAX_SIDES) : wanted);
}
export { MAX_GEM_SIDES };

/** Whether the settings offer the leaf count. On now that the mallorn leaves are in and the ring follows the count. */
export const LEAF_SETTING_AVAILABLE = true;
/** Plain-language names for the choices (shown in the accessibility panel and read aloud by the live message). */
export const gemChoiceLabel = (c: GemSidesChoice): string => (c === 'match' ? 'Match the leaves' : `${c} sides`);
export const gemChoiceMessage = (c: GemSidesChoice): string => (c === 'match' ? 'The gem now matches the leaves.' : `The gem now has ${c} sides.`);
