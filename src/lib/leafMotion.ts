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

/** Pure choice of preset. Reduced motion always wins: nothing moves. */
export function chooseLeafPreset(c: LeafCapability): LeafPreset {
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
