// How the logo's leaves move. Three presets, chosen from what the browser reports:
//   full: the whole flower swells gently with the breath and softens with the exhale
//   low:  the same breath, smaller
//   none: nothing moves (a still drawing)
// The woven outlines are drawn as one piece, so the breath is at flower level (a scale about the centre), not per leaf.
// It is driven by the shared clock (src/lib/breathClock.ts): the keyframes use the same phase fractions as the ring's
// scale, and the animation is started at the clock's current phase, so flower and ring stay in phase.
import { breathEnvelope, breathFractions, type BreathFractions } from './breathClock.ts';

export type LeafPreset = 'full' | 'low' | 'none';

export interface LeafCapability {
  reducedMotion: boolean;
  /** The person asked for less data (Save-Data, or prefers-reduced-data). */
  reducedData: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

/**
 * Whether the petals swell with the breath on the site. OFF (owner, 2026-11-21): the petals stay still while the orbs and the gem keep breathing. The motion code below is kept
 * as it was, so turning this on again, or forcing a preset where one is shown on purpose (the bench's preview passes `preset` to MallornLeaves), brings it back unchanged.
 */
export const PETALS_BREATHE = false;

/** Pure choice of preset. With the petals' breathing off nothing moves; otherwise reduced motion wins, then lighter presets for small devices. */
export function chooseLeafPreset(c: LeafCapability, breathes: boolean = PETALS_BREATHE): LeafPreset {
  if (!breathes) return 'none';
  if (c.reducedMotion) return 'none';
  if (c.reducedData) return 'low';
  if (c.deviceMemory !== undefined && c.deviceMemory <= 2) return 'low';
  if (c.hardwareConcurrency !== undefined && c.hardwareConcurrency <= 2) return 'low';
  return 'full';
}

/** Read the browser's reports. Safe where there is no window (it then says: reduced motion, so nothing moves). */
export function readLeafCapability(win: Window | undefined = typeof window === 'undefined' ? undefined : window): LeafCapability {
  if (!win || typeof win.matchMedia !== 'function') return { reducedMotion: true, reducedData: false };
  const nav = (win.navigator ?? {}) as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedData: !!nav.connection?.saveData || win.matchMedia('(prefers-reduced-data: reduce)').matches,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}

/** How much the flower grows at full inhale (4.5%); `low` uses LEAF_LOW_SCALE of it. */
export const LEAF_SWELL = 0.045;
export const LEAF_LOW_SCALE = 0.5;

const pct = (x: number): string => `${Math.round(x * 10000) / 100}%`;

/** The key that names a breath shape's keyframes. */
export function breathKey(f: BreathFractions): string {
  return [f.t1, f.t2, f.t3].map((x) => Math.round(x * 1000)).join('-');
}

/** Keyframe stops for the envelope: 0 at rest, 1 held at full inhale, back to 0 through the exhale. */
function stops(f: BreathFractions, body: (e: number) => string): string {
  const at = [...new Set([0, f.t1, f.t2, f.t3, 1])]; // t3 is 1 when there is no hold-out
  return at.map((p) => `${pct(p)}{${body(breathEnvelope(p, f))}}`).join('');
}

/**
 * The stylesheet for a preset. Empty for `none`: no keyframes, no animation rules, nothing for the browser to run.
 * The envelope is sampled at the same stops as the ring (end of inhale, of hold-in, of exhale), so the flower is
 * fullest exactly while the ring is.
 */
export function leafMotionCss(preset: LeafPreset, technique: Parameters<typeof breathFractions>[0]): string {
  if (preset === 'none') return '';
  const f = breathFractions(technique);
  const grow = stops(f, (e) => `transform:scale(calc(1 + var(--lm-swell) * ${e}))`);
  // The same rule the preset already applied, repeated for browsers that change the setting while the page is open.
  return `@keyframes lm-breath-${breathKey(f)}{${grow}}@media (prefers-reduced-motion:reduce){.lm-flower{animation:none!important}}`;
}

type Style = Record<string, string | number>;

/**
 * Inline style for the flower group. `elapsedMs` is the time since the shared cycle start, so the animation begins at the
 * clock's present phase (a negative delay). `none` returns an empty style: no animation property at all.
 */
export function flowerAnimationStyle(
  preset: LeafPreset,
  technique: Parameters<typeof breathFractions>[0],
  breathMs: number,
  elapsedMs: number,
): Style {
  if (preset === 'none' || !(breathMs > 0)) return {};
  const phase = Math.max(0, elapsedMs) % breathMs;
  return {
    '--lm-swell': (LEAF_SWELL * (preset === 'low' ? LEAF_LOW_SCALE : 1)).toFixed(4),
    animation: `lm-breath-${breathKey(breathFractions(technique))} ${breathMs}ms ease-in-out infinite`,
    animationDelay: `${-Math.round(phase)}ms`,
    transformOrigin: '0px 0px',
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Leaf sway (a visitor setting, off by default): each of the leaves rocks very slightly about its own base, as in a gentle breeze.
// Not the earlier sway (removed 2026-11-20, commit 3b704fd): that one swung every leaf by up to 1.6 degrees on a two-breath
// period with the opening and closing of the leaf. What is reused from it: the keyframe shape (one rotate to the left, one to the
// right, ease-in-out, same value at both ends so the loop has no jump), the variable for the amount (--lm-sway became --lm-rock),
// a negative animation delay to start each leaf part-way round, rotation about the leaf's own base, and "no sway under reduced
// motion or on a light device". What is new: a fixed slow period that does not follow the breathing pace, a smaller angle, one
// phase step of 1/count of a period from leaf to leaf (a slow wave round the ring that joins up with itself), and each leaf drawn
// as its own layer so the browser's compositor can turn it without redrawing the leaf's lighting filter every frame.
// ---------------------------------------------------------------------------------------------------------------------

/** How far a leaf rocks either way, in degrees. Small on purpose: the woven gaps stay lined up (see tests/leaf-sway.test.mts). */
export const LEAF_ROCK_DEG = 1;
/** One full rock (left, right, left) takes this long. Slow, and not tied to the breathing pace. */
export const LEAF_ROCK_PERIOD_MS = 18000;
/** The radius at which a leaf starts, in the 765-unit drawing (leafWeave's `root`). */
const LEAF_ROOT = 30;

/**
 * Whether the leaves may sway: the visitor asked for it, the breathing animation is on (the site's own motion switch), and the
 * device does not ask for reduced motion, less data, or lighter drawing. Pure.
 */
export function swayAllowed(wanted: boolean, breathingEnabled: boolean, c: LeafCapability): boolean {
  if (!wanted || !breathingEnabled) return false;
  if (c.reducedMotion || c.reducedData) return false;
  if (c.deviceMemory !== undefined && c.deviceMemory <= 2) return false;
  if (c.hardwareConcurrency !== undefined && c.hardwareConcurrency <= 2) return false;
  return true;
}

/** Why the sway cannot run now, in plain words for the settings (empty when it can, or when the visitor has not asked for it). */
export function swayBlockedReason(breathingEnabled: boolean, c: LeafCapability): string {
  if (c.reducedMotion) return 'Your device asks for reduced motion, so the leaves stay still.';
  if (!breathingEnabled) return 'Breathing Emanation is off, so the leaves stay still. Turn it on to use this.';
  if (c.reducedData || (c.deviceMemory !== undefined && c.deviceMemory <= 2) || (c.hardwareConcurrency !== undefined && c.hardwareConcurrency <= 2)) {
    return 'This device draws less to save power or data, so the leaves stay still.';
  }
  return '';
}

/** Where leaf `index` of a ring of `count` starts, in the 765-unit drawing (the point it rocks about). */
export function leafBase(index: number, count: number): { x: number; y: number } {
  const a = (index * 2 * Math.PI) / Math.max(1, count);
  return { x: +(LEAF_ROOT * Math.sin(a)).toFixed(3), y: +(-LEAF_ROOT * Math.cos(a)).toFixed(3) };
}

/** How far into the rock leaf `index` starts, in ms: a wave that advances one `count`-th of a period per leaf and so joins up round the ring. */
export function rockOffsetMs(index: number, count: number, period: number = LEAF_ROCK_PERIOD_MS): number {
  return Math.round(((index % count) / Math.max(1, count)) * period);
}

/** The one stylesheet the sway needs (and nothing else): the keyframes, the class, and the reduced-motion backstop. */
export function leafRockCss(): string {
  return (
    `@keyframes lm-rock{0%,100%{transform:rotate(calc(var(--lm-rock) * -1))}50%{transform:rotate(var(--lm-rock))}}` +
    `.lm-rock{animation:lm-rock ${LEAF_ROCK_PERIOD_MS}ms ease-in-out infinite;will-change:transform}` +
    `@media (prefers-reduced-motion:reduce){.lm-rock{animation:none!important;will-change:auto}}`
  );
}

/**
 * Inline style of leaf `index`'s layer. `clockMs` is the wall clock (so a remounted logo carries on from where the others are, not
 * from zero). The layer is an element of its own, turned by CSS about the leaf's base, given in px of the drawn box of `size`.
 */
export function leafRockStyle(index: number, count: number, size: number, clockMs: number): Record<string, string | number> {
  const b = leafBase(index, count);
  const k = size / 765;
  const phase = (((clockMs % LEAF_ROCK_PERIOD_MS) + LEAF_ROCK_PERIOD_MS) % LEAF_ROCK_PERIOD_MS + rockOffsetMs(index, count)) % LEAF_ROCK_PERIOD_MS;
  return {
    '--lm-rock': `${LEAF_ROCK_DEG}deg`,
    transformOrigin: `${((b.x + 382.5) * k).toFixed(2)}px ${((b.y + 382.5) * k).toFixed(2)}px`,
    animationDelay: `${-Math.round(phase)}ms`,
  };
}

/** The box that holds everything of one leaf (outer and inner outline, with room for the stroke and the lighting), for a filter region of its own. */
export function leafBox(paths: string[], margin = 24): { x: number; y: number; w: number; h: number } {
  const n = paths.join(' ').match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [0, 0];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < n.length; i += 2) {
    x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]);
  }
  if (!Number.isFinite(x0)) return { x: -382.5, y: -382.5, w: 765, h: 765 };
  return { x: Math.floor(x0 - margin), y: Math.floor(y0 - margin), w: Math.ceil(x1 - x0 + 2 * margin), h: Math.ceil(y1 - y0 + 2 * margin) };
}
