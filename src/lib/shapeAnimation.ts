// The animated layer of a line drawing (src/lib/gatewayShapes.ts). The still drawing is never replaced: the animation is a second copy laid over it, so a drawing is
// always there to see and to choose, and under reduced motion (or when paused) only the still copy shows. Pure string work, so it is tested without a browser.
//
// Every drawn element gets a class and a start delay:
//   sa-draw  an outlined line, circle, rectangle or ellipse: its line draws itself (the page measures its length into --len)
//   sa-pop   a filled dot or triangle (no outline, so nothing to draw): it fades in
// Later elements start a little later, up to a cap, so the shape is seen being made.

const SHAPE_ELEMENT = /<(path|circle|rect|ellipse|line|polyline|polygon) ([^>]*?)(\/?)>/g;

export const DRAW_STEP = 0.25;
export const DRAW_CAP = 1;
export const POP_STEP = 0.05;
export const POP_CAP = 1.2;

export interface AnimatedArt {
  svg: string;
  /** How many elements draw a line. */
  draws: number;
  /** How many elements (filled, no outline) fade in. */
  pops: number;
}

const round = (n: number): number => Math.round(n * 100) / 100;

export function animatedArt(svg: string): AnimatedArt {
  let draws = 0;
  let pops = 0;
  const out = svg.replace(SHAPE_ELEMENT, (_all, tag: string, attrs: string, close: string) => {
    const filled = /\bfill="currentColor"/.test(attrs) && /\bstroke="none"/.test(attrs);
    const delay = filled ? round(Math.min(pops++ * POP_STEP, POP_CAP)) : round(Math.min(draws++ * DRAW_STEP, DRAW_CAP));
    return `<${tag} class="${filled ? 'sa-pop' : 'sa-draw'}" style="--delay:${delay}s" ${attrs}${close}>`;
  });
  return { svg: out, draws, pops };
}

/** The styles for the still copy, the animated copy, reduced motion, pausing and a chosen drawing. Scoped to .shape-anim. */
export const SHAPE_ANIM_CSS = `
.shape-anim .shape-live { position: absolute; inset: 0; }
.shape-anim .shape-live svg, .shape-anim .shape-still svg { display: block; width: 100%; height: 100%; }
.shape-anim:not(.shape-paused) .shape-still { opacity: .35; }
.shape-anim:not(.shape-paused) .shape-chosen .shape-still { opacity: 1; }
@keyframes shapeDraw { 0% { stroke-dashoffset: var(--len, 100); } 45% { stroke-dashoffset: 0; } 82% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: calc(var(--len, 100) * -1); } }
@keyframes shapePop { 0% { opacity: 0; } 30% { opacity: 1; } 82% { opacity: 1; } 100% { opacity: 0; } }
.shape-anim .sa-draw { stroke-dasharray: var(--len, 100) var(--len, 100); stroke-dashoffset: var(--len, 100); animation: shapeDraw 4.5s ease-in-out var(--delay, 0s) infinite backwards; }
.shape-anim .sa-pop { opacity: 0; animation: shapePop 4.5s ease-in-out var(--delay, 0s) infinite backwards; }
.shape-anim.shape-paused .shape-live, .shape-anim .shape-chosen .shape-live { display: none; }
@media (prefers-reduced-motion: reduce) { .shape-anim .shape-live { display: none; } .shape-anim .shape-still { opacity: 1 !important; } }`;
