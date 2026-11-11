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
}

export const DEFAULT_INNER_ORBIT: InnerOrbitLook = {
  show: true,
  radius: 0.0625,
  orbSize: 0.069,
  opacityLow: 0.66,
  opacityHigh: 0.8,
  pulse: 0.05,
  pulseSeconds: 4,
  pulseStep: 0.3,
  colorCycle: 30,
  orbitSeconds: 120,
  form: 0.3,
  shine: 0.2,
  rimLight: 0.69,
  rimDark: 0.06,
  layer: 'under',
  blend: 'normal',
};

export interface OuterOrbitLook {
  show: boolean;
  /** Radius of the ring, as a fraction of the logo's size (0.5 = the edge of the breathing animation). */
  radius: number;
  /** Diameter of each orb, as a fraction of the logo's size. */
  orbSize: number;
  opacityLow: number;
  opacityHigh: number;
}

export const DEFAULT_OUTER_ORBIT: OuterOrbitLook = {
  show: true,
  radius: 0.5,
  orbSize: 0.053,
  opacityLow: 0.64,
  opacityHigh: 0.87,
};
