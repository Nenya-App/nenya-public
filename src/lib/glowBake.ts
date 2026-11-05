// Computes the logo's gold glow once, as an image, instead of asking the browser to run a chain of CSS
// `filter: drop-shadow()`s on an element whose contents are animated and blended (Safari fails to draw
// that). Mirrors how CSS drop-shadow chains work: each shadow is cast from everything drawn so far,
// earlier shadows included, and drawn underneath. A CSS blur length is a Gaussian sigma of that length
// (px), the same rule drop-shadow uses.

export const GLOW_COLORS: [number, number, number][] = [
  [0xdd, 0xb8, 0x8c], // --nenya-accent-warm
  [0xe8, 0xc4, 0xa8], // --nenya-accent-metallic
  [0xd4, 0xaf, 0x87], // --nenya-accent-primary
];

/** Blur radii (CSS px) for each state, from the old `.nenya-logo-glow` rules. */
export const GLOW_RADII = {
  light: [8, 16, 24],
  dark: [10, 20, 30],
  lightHover: [12, 24, 36],
  darkHover: [16, 32, 48],
} as const;

export type GlowState = keyof typeof GLOW_RADII;

/** The largest radius, so callers can leave room around the logo for the glow. */
export const MAX_GLOW_RADIUS = 48;

// Box sizes whose three successive passes approximate a Gaussian of the given sigma.
function boxesForGauss(sigma: number, n = 3): number[] {
  const ideal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(ideal);
  if (wl % 2 === 0) wl--;
  const wu = wl + 2;
  const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => (i < m ? wl : wu));
}

// One horizontal box blur (radius r each side), zero outside the image.
function boxBlurH(src: Float32Array, dst: Float32Array, w: number, h: number, r: number): void {
  const inv = 1 / (r + r + 1);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let x = 0; x <= r && x < w; x++) acc += src[row + x];
    for (let x = 0; x < w; x++) {
      dst[row + x] = acc * inv;
      const add = x + r + 1;
      const sub = x - r;
      if (add < w) acc += src[row + add];
      if (sub >= 0) acc -= src[row + sub];
    }
  }
}

// One vertical box blur, same boundary rule.
function boxBlurV(src: Float32Array, dst: Float32Array, w: number, h: number, r: number): void {
  const inv = 1 / (r + r + 1);
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = 0; y <= r && y < h; y++) acc += src[y * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = acc * inv;
      const add = y + r + 1;
      const sub = y - r;
      if (add < h) acc += src[add * w + x];
      if (sub >= 0) acc -= src[sub * w + x];
    }
  }
}

/** Gaussian blur of a single-channel float image (three successive box blurs, horizontal then vertical each). */
export function gaussianBlur(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  if (sigma < 0.3) return src.slice();
  let a = src.slice();
  let b = new Float32Array(src.length);
  for (const box of boxesForGauss(sigma)) {
    const r = Math.max(0, (box - 1) >> 1);
    boxBlurH(a, b, w, h, r);
    boxBlurV(b, a, w, h, r);
  }
  return a;
}

/**
 * Bake the glow around `alpha` (0..1 per pixel, w by h). `radii` are CSS lengths and `scale` is device
 * pixels per CSS px. Returns straight (non-premultiplied) RGBA bytes of the glow only, with no content in it.
 */
export function bakeGlow(
  alpha: Float32Array,
  w: number,
  h: number,
  radii: readonly number[],
  scale: number,
  colors: [number, number, number][] = GLOW_COLORS,
): Uint8ClampedArray<ArrayBuffer> {
  const n = w * h;
  const A = alpha.slice();
  const G = new Float32Array(n * 3); // premultiplied glow colour
  radii.forEach((r, i) => {
    const S = gaussianBlur(A, w, h, r * scale);
    const [cr, cg, cb] = colors[i % colors.length];
    for (let p = 0; p < n; p++) {
      const under = S[p] * (1 - A[p]);
      if (under <= 0) continue;
      G[p * 3] += under * (cr / 255);
      G[p * 3 + 1] += under * (cg / 255);
      G[p * 3 + 2] += under * (cb / 255);
      A[p] += under;
    }
  });
  const out = new Uint8ClampedArray(n * 4);
  for (let p = 0; p < n; p++) {
    const ga = Math.min(1, Math.max(0, A[p] - alpha[p]));
    if (ga <= 1e-4) continue;
    out[p * 4] = Math.round((G[p * 3] / ga) * 255);
    out[p * 4 + 1] = Math.round((G[p * 3 + 1] / ga) * 255);
    out[p * 4 + 2] = Math.round((G[p * 3 + 2] / ga) * 255);
    out[p * 4 + 3] = Math.round(ga * 255);
  }
  return out;
}
