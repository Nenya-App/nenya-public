// The breathing animation's strength (owner, 2026-11-22). It replaces the old Breathing opacity (0 to 1, default 1) with a scale in which the old 100% is shown as 50%:
// the scale runs 5% to 200%, 50% is the standard strength and the default, and at 50% the breath ring looks exactly as it did at the old 100%.
//   below 50%   the ring fades as it did before (new 25% = old 50%): its opacity is strength / 50.
//   above 50%   opacity cannot pass 1, so the ring is drawn stronger instead: the colour of its glow is brighter (every step of its soft gradient is multiplied, up to twice at 200%)
//               and the soft edge starts further in, so the ring is wider as well as brighter. Never faster, never flashing: the timing, the growing and fading and the colours are
//               exactly the same; only how strongly the ring is drawn changes.
// The old key (breathingOpacity, 0.1 to 1) is read once to migrate: a stored v becomes v x 50. Pure, so it is tested.
export const STRENGTH_MIN = 5;
export const STRENGTH_MAX = 200;
export const STRENGTH_STEP = 5;
/** The standard strength: what the old 100% was. */
export const STRENGTH_STANDARD = 50;
export const DEFAULT_STRENGTH = STRENGTH_STANDARD;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
/** A strength the panel may use: rounded to a step and kept between the limits; anything unreadable becomes the default (50%). */
export const snapStrength = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? clamp(Math.round(v / STRENGTH_STEP) * STRENGTH_STEP, STRENGTH_MIN, STRENGTH_MAX) : DEFAULT_STRENGTH;

/** The strength for a value stored on the old scale (0.1 to 1): v x 50, so 1 becomes 50% and 0.5 becomes 25%. Unreadable or out of range becomes the default. */
export const strengthFromOldOpacity = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0.1 && v <= 1 ? snapStrength(v * STRENGTH_STANDARD) : DEFAULT_STRENGTH);

export interface StrengthParts {
  /** The ring's opacity as the ring has always used it (0.1 to 1): strength / 50, held at 1 from 50% up. */
  opacity: number;
  /** How much stronger than standard the ring's colour is drawn: 1 up to 50%, then rising to 2 at 200%. */
  boost: number;
}
export function strengthParts(strength: number): StrengthParts {
  const s = snapStrength(strength);
  return { opacity: clamp(s / STRENGTH_STANDARD, 0.1, 1), boost: s > STRENGTH_STANDARD ? 1 + (s - STRENGTH_STANDARD) / (STRENGTH_MAX - STRENGTH_STANDARD) : 1 };
}

/** The ring's soft gradient for a strength: the alpha at each stop (as the ring has always had them, times opacity, times boost, never above 1) and where the soft edge begins (30% of the radius at standard, moving in to 15% at 200%). */
export const RING_STOPS = [0.08, 0.15, 0.25, 0.4] as const;
export function ringAlphas(parts: StrengthParts): number[] {
  return RING_STOPS.map((a) => Math.min(1, a * parts.opacity * parts.boost));
}
export const ringEdgeStart = (parts: StrengthParts): number => 30 - 15 * (parts.boost - 1);

export const strengthLabel = (s: number): string => `${snapStrength(s)}%`;
