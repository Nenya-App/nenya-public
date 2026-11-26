// How big the breathing animation is on the front page (src/app/components/pages/WelcomePage.tsx). Pure.
// Standard takes the smaller of the screen's width and height, leaving room for the header and the words under it, never above 600,
// times 0.709. (Owner, 2026-11-26: 5% larger than the earlier 0.675 on every screen; 10% was too big.)
// The visitor can choose Small or Large in the breathing panel (src/lib/logoLook.ts).
import type { AnimationSize } from './logoLook.ts';

const SCALE: Record<AnimationSize, number> = { small: 0.75, standard: 1, large: 1.25 };
/** The height Large leaves free: the header (65), the two equal gaps at their smallest (56 each), the button (76) and a little room under it (12). */
const HEIGHT_AROUND = 65 + 2 * 56 + 76 + 12;

export function welcomeLogoSize(viewportWidth: number, viewportHeight: number, size: AnimationSize = 'standard'): number {
  const availableHeight = viewportHeight - 64 - 120; // header, and room for the words
  const availableWidth = viewportWidth - 48; // side padding
  const standard = Math.min(availableWidth, availableHeight, 600) * 0.709;
  if (size !== 'large') return standard * SCALE[size];
  // Large grows only as far as fits: the ring's padding across, and both gaps and the button down. It is never smaller than Standard.
  const across = viewportWidth - (viewportWidth < 640 ? 64 : 96) - 12;
  return Math.min(standard * SCALE.large, Math.max(standard, Math.min(across, viewportHeight - HEIGHT_AROUND)));
}
