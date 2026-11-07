// A fixed (static) film grain, used to break up banding in the glow gradients. Smooth 8-bit gradients show
// visible rings where one step of colour meets the next; a little noise at the boundaries hides them. The
// grain is the same every time (seeded), never animated, and costs nothing per frame:
//   - the logo's baked glow image has it built in (see glowBake.ts);
//   - the outer orbs' CSS halos get it from a small repeating tile, made once and handed to CSS as --nenya-grain.

/** How strong the grain is: up to 15%. */
export const GRAIN_AMOUNT = 0.15;

/** Side of the repeating tile, in pixels. */
export const GRAIN_TILE = 128;

const GRAIN_SEED = 0x6e656e79; // "neny"

/** Small, fast, seedable random numbers in [0, 1): the same seed always gives the same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * RGBA bytes of a size-by-size tile of grey specks: each pixel is white or black with a random opacity
 * (uniform 0 to 1). It is drawn over a halo at GRAIN_AMOUNT opacity, so no speck is stronger than 15%.
 */
export function grainTileBytes(size = GRAIN_TILE, seed = GRAIN_SEED): Uint8ClampedArray<ArrayBuffer> {
  const rand = mulberry32(seed);
  const out = new Uint8ClampedArray(size * size * 4);
  for (let p = 0; p < size * size; p++) {
    const v = rand() < 0.5 ? 0 : 255;
    out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = v;
    out[p * 4 + 3] = Math.round(rand() * 255);
  }
  return out;
}

/**
 * Makes the tile once and exposes it to CSS as --nenya-grain. Until it runs (or if canvas is unavailable) the
 * variable is unset and the halos simply have no grain. Never throws.
 */
export function installGrainTile(): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = GRAIN_TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(new ImageData(grainTileBytes(), GRAIN_TILE, GRAIN_TILE), 0, 0);
    document.documentElement.style.setProperty('--nenya-grain', `url(${canvas.toDataURL('image/png')})`);
  } catch {
    /* no grain: the halos still draw */
  }
}
