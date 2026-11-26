// How big the breathing animation is on the front page (src/app/components/pages/WelcomePage.tsx). Pure.
// It takes the smaller of the screen's width and height, leaving room for the header and the words under it, never above 600, times 0.709.
// (Owner, 2026-11-26: 5% larger than the earlier 0.675 on every screen; 10% was too big.)

export function welcomeLogoSize(viewportWidth: number, viewportHeight: number): number {
  const availableHeight = viewportHeight - 64 - 120; // header, and room for the words
  const availableWidth = viewportWidth - 48; // side padding
  return Math.min(availableWidth, availableHeight, 600) * 0.709;
}
