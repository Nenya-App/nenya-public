// The visitor's own look for the logo (docs/eight-sided-gem-scope.md, Part 2): how many leaves the ring has and how many sides the
// gem has. Presets, not sliders. Pure, so it is tested; the choice is kept by src/lib/deviceMemory.ts (only while "Remember on this
// device" is on). The still pictures of the logo (header image, icons, social preview, PDF) always stay at the standard design.
import { DEFAULT_GEM_SIDES, MAX_GEM_SIDES, MIN_GEM_SIDES, clampSides } from './gemCut.ts';

/** Leaf counts a visitor can choose for the logo's look: all even, so the weave alternates cleanly all the way round. */
export const LEAF_PRESETS = [6, 8, 10, 12] as const;
/** Gem sides a visitor can choose. 12 is possible in the engine but twice the cost of 6, so it is not offered. */
export const GEM_SIDE_PRESETS = [6, 8, 10] as const;
/** The leaves the logo has by default: six, the layout the owner chose. Eight is a preset. */
export const DEFAULT_LOGO_LEAVES = 6;
/** The gem has eight sides by default (the owner's choice); a visitor can pick another number or have it match the leaves. */
export type GemSidesChoice = 'match' | (typeof GEM_SIDE_PRESETS)[number];
export const DEFAULT_GEM_CHOICE: GemSidesChoice = 8;
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

// The outer orbs' glow (a halo round each outer orb): its style and width are visitor settings too, with the same rules as the rest of the look.
/** The glow styles. 'own': the orb's own current colour. 'palette': the rim fades into another colour from the orb's palette. 'random': colours from every palette mixed. 'shared': the three large gold blurs the site used before (heavier to draw). */
export const HALO_STYLES = ['own', 'palette', 'random', 'shared'] as const;
export type HaloStyle = (typeof HALO_STYLES)[number];
export const DEFAULT_HALO_STYLE: HaloStyle = 'own';
/** A halo's width as a multiple of its orb's width: soft is the first design, 5 the owner's choice (2026-11-20). */
export const HALO_WIDTHS = [3.4, 5, 7] as const;
export const DEFAULT_HALO_WIDTH = 5;
export const snapHaloStyle = (v: unknown): HaloStyle => ((HALO_STYLES as readonly unknown[]).includes(v) ? (v as HaloStyle) : DEFAULT_HALO_STYLE);
export const snapHaloWidth = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? nearest(v, HALO_WIDTHS) : DEFAULT_HALO_WIDTH);
/** A whole number to seed the random colours; anything else becomes 1. */
export const snapHaloSeed = (v: unknown): number => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4294967295 ? v : 1);
export const haloStyleLabel = (s: HaloStyle): string => ({ own: 'Own colour', palette: "Orb's palette", random: 'Random colours', shared: 'Old shared glow' })[s];
export const haloWidthLabel = (w: number): string => (w <= 3.4 ? 'Soft' : w >= 7 ? 'Wider' : 'Wide');
export const haloStyleMessage = (s: HaloStyle): string => `The outer glow is now ${haloStyleLabel(s).toLowerCase()}.`;

/**
 * Six colours for orb number `index`, drawn from `all` (every palette's colours) and fixed by `seed`: the same seed always gives the same
 * glow, so a reload does not reshuffle it; "Shuffle" picks a new seed. Pure.
 */
export function randomHaloColors(seed: number, index: number, all: readonly string[]): string[] {
  let x = (Math.imul(snapHaloSeed(seed) + 1, 2654435761) ^ Math.imul(index + 1, 40503)) >>> 0;
  return Array.from({ length: 6 }, () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return all[Math.floor((x / 4294967296) * all.length)] ?? all[0];
  });
}

// The size of the animated preview in the breathing and accessibility panel: a percentage of the standard preview (220 px), 50% to 200% in steps of
// 10%, 100% by default. How far up it can go depends on the device and on the width of the panel (previewMaxPercent), so it never costs a light device
// more than it can draw and never makes the panel scroll sideways.
/** The standard preview's side in px: 100%. */
export const DEFAULT_PREVIEW_SIZE = 220;
export const PREVIEW_PCT_MIN = 50;
export const PREVIEW_PCT_MAX = 200;
export const PREVIEW_PCT_STEP = 10;
export const DEFAULT_PREVIEW_PCT = 100;
/** A percentage the panel may use: rounded to a step and kept between the limits; anything unreadable becomes 100. */
export const snapPreviewPercent = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(PREVIEW_PCT_MAX, Math.max(PREVIEW_PCT_MIN, Math.round(v / PREVIEW_PCT_STEP) * PREVIEW_PCT_STEP)) : DEFAULT_PREVIEW_PCT;
/** A size the panel kept in pixels before it was a percentage (120 to 400), as a percentage of the standard 220 px (so 220 px is 100%, 400 px is 180%). Unreadable or out of range is 100%. */
export const percentFromOldPixels = (px: unknown): number =>
  typeof px === 'number' && Number.isFinite(px) && px >= 120 && px <= 400 ? snapPreviewPercent((px / DEFAULT_PREVIEW_SIZE) * 100) : DEFAULT_PREVIEW_PCT;

/** The most a device is asked to draw, as a percentage: a light device (the site's own "lite" tier: little memory, few cores, Save-Data, slow connection) 125%, an ordinary one 175%, a capable one 200%. */
export const previewCapForTier = (tier: 'lite' | 'standard' | 'capable'): number => (tier === 'lite' ? 125 : tier === 'capable' ? 200 : 175);
/** The panel's own padding round the preview, in px: the panel's margin (2 x 16), the column's padding (2 x 24) and the ring's room (2 x 32 below 640 wide, 2 x 48 above). */
const RING_ROOM = (viewport: number): number => (viewport < 640 ? 64 : 96);
/** The most room the preview can have in px at this viewport width, with no sideways scroll: one column under 768, otherwise the right column keeps at least 300 px. */
export function availablePreviewPx(viewport: number): number {
  const v = Number.isFinite(viewport) && viewport > 0 ? viewport : 375;
  return Math.max(0, v < 768 ? v - 32 - 48 - RING_ROOM(v) : v - 32 - 300 - 48 - RING_ROOM(v));
}
/** The highest percentage the slider offers on this device at this width: the device's cap, lowered to what fits, never below 50%. */
export function previewMaxPercent(tier: 'lite' | 'standard' | 'capable', viewport: number): number {
  const fits = Math.floor(((availablePreviewPx(viewport) / DEFAULT_PREVIEW_SIZE) * 100) / PREVIEW_PCT_STEP) * PREVIEW_PCT_STEP;
  return Math.max(PREVIEW_PCT_MIN, Math.min(previewCapForTier(tier), fits));
}
/** The percentage in effect: the stored choice, held to this device's and this width's maximum (the stored choice itself is not changed). */
export const effectivePreviewPercent = (choice: number, tier: 'lite' | 'standard' | 'capable', viewport: number): number => Math.min(snapPreviewPercent(choice), previewMaxPercent(tier, viewport));
/** The preview's side in px for a stored choice. */
export const previewPixels = (choice: number, tier: 'lite' | 'standard' | 'capable', viewport: number): number => Math.round((DEFAULT_PREVIEW_SIZE * effectivePreviewPercent(choice, tier, viewport)) / 100);

// The inner ring of lights behind the gem (owner, 2026-11-22: too much movement behind the gem, and "lights instead of solid orbs"). Three choices, kept like the
// other display settings. The stored key (innerOrbs) and values are the ones from when they were orbs, so nothing stored breaks.
//   moving  the ring turns very slowly, and each light rises and fades gently (60% to 100% bright, 10% in size, 12 seconds or more) and fades through its colours
//   still   the lights stay where they are, drawn, with no turning, rising or fading; they still change slowly from colour to colour, as the rest of the logo's colours do
//   hidden  the inner lights are not drawn behind the gem at all (the gem keeps its own light)
export const INNER_ORB_MODES = ['moving', 'still', 'hidden'] as const;
export type InnerOrbMode = (typeof INNER_ORB_MODES)[number];
export const DEFAULT_INNER_ORB_MODE: InnerOrbMode = 'moving';
export const snapInnerOrbMode = (v: unknown): InnerOrbMode => ((INNER_ORB_MODES as readonly unknown[]).includes(v) ? (v as InnerOrbMode) : DEFAULT_INNER_ORB_MODE);
export const innerOrbLabel = (m: InnerOrbMode): string => ({ moving: 'Moving', still: 'Still', hidden: 'Hidden' })[m];
export const innerOrbHint = (m: InnerOrbMode): string =>
  ({ moving: 'The ring turns very slowly and the lights rise and fade gently.', still: 'The lights stay where they are: no turning, rising or fading. Their colours still change slowly.', hidden: 'The inner lights are not drawn behind the gem. The gem keeps its own light.' })[m];
export const innerOrbMessage = (m: InnerOrbMode): string => `The inner lights are now ${innerOrbLabel(m).toLowerCase()}.`;
/** Whether the inner lights are drawn at all. */
export const innerOrbsDrawn = (m: InnerOrbMode): boolean => m !== 'hidden';
/** Whether the inner lights (and the light the gem takes from their ring) turn and rise and fade. */
export const innerOrbsMove = (m: InnerOrbMode): boolean => m === 'moving';
