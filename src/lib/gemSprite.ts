// The gem's sprite sheet: 48 frames of one pre-rendered diamond, each 288 x 288, laid out row-major in a
// 7 x 7 grid on a 2016 x 2016 transparent image. Loaded once, only when something that needs it mounts
// (the sheet is ~790 KB, so it must not load for pages that never show the orbit view).
import spriteUrl from '../assets/diamond-hex-sprite.webp';

/**
 * Which gem the site draws: the pre-rendered sprite sheet, or the live, ray-traced stone (src/lib/gemRenderer.ts).
 * The live gem needs WebGL2; where it is missing, or its shader fails, the sprite is used instead. Tune the live gem
 * side by side with the sprite on the /bench page before switching this.
 */
export const GEM_ENGINE: 'sprite' | 'live' = 'live';
export type GemEngine = 'sprite' | 'live';

export const SPRITE_COLS = 7;
export const SPRITE_CELL = 288;
/** The hexagon spans this fraction of its frame's width. */
export const GEM_HEX_FRACTION = 2 / 2.48;
/** Gem canvas side as a fraction of the petals layer's side (the petals layer is size * 0.765). */
export const GEM_TO_PETALS = 0.313; // was 0.3402: the stone is a little smaller, with its bezel
/** Circumradius of the stone's hexagon (corners at the top and bottom) as a fraction of its frame's side. */
export const GEM_HEX_RADIUS = 476 / 1024;

/** Centre of the gem within the petals box, as measured from the old gem layer's alpha bounds. */
export const GEM_CENTRE = { x: 0.5008, y: 0.4984 };

// Resolves once the gem has drawn its first frame on screen (see SpectralGem). The loading screen waits for it, so the
// gem is already there when the screen fades away.
let resolveFirstDraw: () => void = () => {};
export const gemFirstDraw: Promise<void> = new Promise<void>((resolve) => {
  resolveFirstDraw = resolve;
});
export const markGemDrawn = (): void => resolveFirstDraw();

let loading: Promise<HTMLImageElement> | null = null;

export function loadGemSprite(): Promise<HTMLImageElement> {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        loading = null; // allow a retry on the next mount
        reject(new Error('gem sprite failed to load'));
      };
      img.src = spriteUrl;
    });
  }
  return loading;
}

export const frameOrigin = (i: number): [number, number] => [(i % SPRITE_COLS) * SPRITE_CELL, Math.floor(i / SPRITE_COLS) * SPRITE_CELL];

/** Load an image by URL (same-origin, build-hashed assets). */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to load'));
    img.src = src;
  });
}

/**
 * Draws the stone's outline (the girdle hexagon, corners at the top and bottom) filled in solid, in a gem frame of
 * side `side` at (x, y). The live gem uses it where the sprite's first frame was used for the outline (the glow).
 */
export function drawGemSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, side: number): void {
  const r = side * GEM_HEX_RADIUS;
  const cx = x + side / 2;
  const cy = y + side / 2;
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 2 + (k * Math.PI) / 3;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#000';
  ctx.fill();
}
