// The orbits' look: everything about the 16 orbs round the gem that can be tuned on the /bench page. NenyaLogo uses these
// defaults when it is given no options, so the live site looks as it always has.

export interface InnerOrbitLook {
  show: boolean;
  /** Radius of the ring, as a fraction of the logo's size. */
  radius: number;
  /** Diameter of each orb, as a fraction of the logo's size (never below 8.5 px). */
  orbSize: number;
  /** The orbs' opacity pulses between these. */
  opacityLow: number;
  opacityHigh: number;
  /** How much each orb grows and shrinks as it pulses (0.05 = 5% either way). */
  pulse: number;
  /** Length of the first orb's pulse in seconds; each later orb's is `pulseStep` longer, so they drift apart. */
  pulseSeconds: number;
  pulseStep: number;
  /** Seconds for one orb to pass through its six colours. The gem's inner colour follows this. */
  colorCycle: number;
  /** Seconds for the ring to turn once. The gem's inner colour follows this. */
  orbitSeconds: number;
  /** The glass layers over each orb's colour. */
  form: number;
  shine: number;
  rimLight: number;
  rimDark: number;
  /** Whether the ring is drawn under the gem (seen through it) or over it. */
  layer: 'under' | 'over';
  /** How the ring blends with what is behind it. */
  blend: 'normal' | 'screen' | 'soft-light' | 'overlay' | 'plus-lighter';
  /**
   * 'orb' draws shaded spheres (the look the site has always had). 'light' draws soft light sources that well up from beneath the
   * stone and fade back: no rim, no highlight, and they add together where they overlap.
   */
  style: 'orb' | 'light';
  /** Light style: seconds for one light to rise and settle; each later light's is `emergeStep` longer, so they never move in step. */
  emergeSeconds: number;
  emergeStep: number;
  /** Light style: how dim a light gets between risings, as a fraction of its full brightness (0 to 1). */
  emergeDepth: number;
}

export const DEFAULT_INNER_ORBIT: InnerOrbitLook = {
  show: true,
  radius: 0.06,
  orbSize: 0.073,
  opacityLow: 0.8,
  opacityHigh: 0.9,
  pulse: 0.22,
  pulseSeconds: 3,
  pulseStep: 0.5,
  colorCycle: 36,
  orbitSeconds: 120,
  form: 0,
  shine: 1,
  rimLight: 0,
  rimDark: 0,
  layer: 'under',
  blend: 'normal',
  style: 'orb',
  emergeSeconds: 9,
  emergeStep: 0.7,
  emergeDepth: 0.12,
};

export interface OuterOrbitLook {
  show: boolean;
  /** Radius of the ring, as a fraction of the logo's size (0.5 = the edge of the breathing animation). */
  radius: number;
  /** Diameter of each orb, as a fraction of the logo's size. */
  orbSize: number;
  opacityLow: number;
  opacityHigh: number;
  /**
   * 'shared' is the one three-colour glow every orb has always had (heavy: three large blurs round every orb). 'own' gives each orb a soft
   * halo in its own current colour; 'palette' fades that halo out into other colours from the orb's own palette. Both are gradients, not
   * blurs, and are coloured by the browser's own animation (no per-frame script), so they are light to animate and safe when the page is zoomed.
   */
  halo: 'shared' | 'own' | 'palette';
}

export const DEFAULT_OUTER_ORBIT: OuterOrbitLook = {
  show: true,
  radius: 0.5,
  orbSize: 0.053,
  opacityLow: 0.64,
  opacityHigh: 0.87,
  halo: 'own',
};

/**
 * How lit the inner light number `index` is at `tSec`, from `emergeDepth` (dimmest) to 1 (full): a smooth rise and settle over its own
 * period (`emergeSeconds` plus `emergeStep` for each later light), so the ring is never lit in step. Orbs ('orb' style) are always 1.
 * The gem multiplies each light's colour by this, so the stone brightens where a light is rising.
 */
export function emergence(index: number, tSec: number, look: Pick<InnerOrbitLook, 'style' | 'emergeSeconds' | 'emergeStep' | 'emergeDepth'>): number {
  if (look.style !== 'light') return 1;
  const period = Math.max(1, look.emergeSeconds + index * look.emergeStep);
  const depth = Math.min(1, Math.max(0, look.emergeDepth));
  return depth + (1 - depth) * (0.5 - 0.5 * Math.cos((2 * Math.PI * tSec) / period));
}
