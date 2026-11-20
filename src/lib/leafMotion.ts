// How the logo's leaves move. Three presets, chosen from what the browser reports:
//   full: a slow sway, and the leaves open and close with the breath
//   low:  the opening and closing with the breath only
//   none: nothing moves (a still drawing)
// The breath part is driven by the shared clock (src/lib/breathClock.ts): its keyframes use the same phase fractions
// as the ring's scale, and the animation is started at the clock's current phase, so leaves and ring stay together.
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

/** Peak opening of a leaf about its base, and how much it grows, at full inhale. */
export const LEAF_OPEN_DEG = 7;
export const LEAF_GROW = 0.045;
/** Sway: a gentle swing either way, one full sway per this many breaths. */
export const LEAF_SWAY_DEG = 1.6;
export const LEAF_SWAY_BREATHS = 2;

const pct = (x: number): string => `${Math.round(x * 10000) / 100}%`;

/** The key that names a breath shape's keyframes. */
export function breathKey(f: BreathFractions): string {
  return [f.t1, f.t2, f.t3].map((x) => Math.round(x * 1000)).join('-');
}

/** Keyframe stops for the envelope: 0 at rest, 1 held at full inhale, back to 0 through the exhale. */
function stops(f: BreathFractions, body: (e: number) => string): string {
  const at = [0, f.t1, f.t2, f.t3, 1];
  return at.map((p) => `${pct(p)}{${body(breathEnvelope(Math.min(p, 0.999999), f))}}`).join('');
}

/**
 * The stylesheet for a preset. Empty for `none`: no keyframes, no animation rules, nothing for the browser to run.
 * The envelope is sampled at the same stops as the ring (end of inhale, of hold-in, of exhale), so the leaves are fully
 * open exactly while the ring is.
 */
export function leafMotionCss(preset: LeafPreset, technique: Parameters<typeof breathFractions>[0]): string {
  if (preset === 'none') return '';
  const f = breathFractions(technique);
  const key = breathKey(f);
  const open = stops(f, (e) => `transform:rotate(calc(var(--lm-open) * ${e})) scale(calc(1 + ${LEAF_GROW} * ${e}))`);
  const glint = stops(f, (e) => `opacity:${(0.35 + 0.4 * e).toFixed(2)}`);
  let css = `@keyframes lm-open-${key}{${open}}@keyframes lm-glint-${key}{${glint}}`;
  if (preset === 'full') {
    css += `@keyframes lm-sway{0%,100%{transform:rotate(calc(var(--lm-sway) * -1))}50%{transform:rotate(var(--lm-sway))}}`;
  }
  // The same rule the preset already applied, repeated for browsers that change the setting while the page is open.
  css += `@media (prefers-reduced-motion:reduce){.lm-open,.lm-glint,.lm-sway{animation:none!important}}`;
  return css;
}

type Style = Record<string, string | number>;

export interface LeafAnimationStyles {
  /** On the group that opens and closes (the leaf and its details). */
  open: Style;
  /** On the highlight. */
  glint: Style;
  /** On the group that sways (outside the opening one). */
  sway: Style;
}

/**
 * Inline styles for leaf number `index`. `elapsedMs` is the time since the shared cycle start, so the animation begins
 * at the clock's present phase (a negative delay). `none` returns empty styles: no animation property at all.
 */
export function leafAnimationStyles(
  preset: LeafPreset,
  index: number,
  technique: Parameters<typeof breathFractions>[0],
  breathMs: number,
  elapsedMs: number,
): LeafAnimationStyles {
  if (preset === 'none' || !(breathMs > 0)) return { open: {}, glint: {}, sway: {} };
  const key = breathKey(breathFractions(technique));
  const e = Math.max(0, elapsedMs);
  const phase = e % breathMs;
  const swayMs = breathMs * LEAF_SWAY_BREATHS;
  // Each leaf sways a sixth of a cycle behind the one before, and swings a little differently.
  const swayPhase = (e + (index * swayMs) / 6) % swayMs;
  const open: Style = {
    '--lm-open': `${(LEAF_OPEN_DEG * (0.85 + 0.06 * (index % 4))).toFixed(2)}deg`,
    animation: `lm-open-${key} ${breathMs}ms ease-in-out infinite`,
    animationDelay: `${-Math.round(phase)}ms`,
    transformOrigin: '0px 0px',
  };
  const glint: Style = {
    animation: `lm-glint-${key} ${breathMs}ms ease-in-out infinite`,
    animationDelay: `${-Math.round(phase)}ms`,
  };
  const sway: Style =
    preset === 'full'
      ? {
          '--lm-sway': `${(LEAF_SWAY_DEG * (0.8 + 0.1 * (index % 5))).toFixed(2)}deg`,
          animation: `lm-sway ${swayMs}ms ease-in-out infinite`,
          animationDelay: `${-Math.round(swayPhase)}ms`,
          transformOrigin: '0px 0px',
        }
      : {};
  return { open, glint, sway };
}
