// Which colours the breathing ring uses on each page, so that every breath can be seen (owner, 2026-11-26: the ring was often invisible, for lack of
// contrast with the page). Pure, so it is tested.
//
// A colour is measured as the ring shows it: laid over the page's background at the strength of the ring's outer edge, at standard strength. It stands
// out when its colour difference from the page (CIE76, in Lab) is at least MIN_DIFFERENCE. From each palette the ring takes the colours that stand
// out, in the palette's order. A palette that would have fewer than three is topped up with its next-nearest colours, made darker (light page) or
// lighter (dark page), keeping their hue, only as far as they need. This is a visibility rule of ours, not an accessibility standard: the soft ring
// does not reach 3:1 against the page.
import { RING_STOPS } from './breathStrength.ts';
import type { ResolvedColours } from './logoColours.ts';

export type RingTheme = 'dark' | 'light';
/** The page's background in each theme (--background in src/styles/globals.css; a test keeps them the same). */
export const PAGE_BACKGROUND: Record<RingTheme, string> = { dark: '#1A1512', light: '#DCD9D6' };
/** The ring's own opacity at the top of a breath, at standard strength (the keyframes in ValarBreathingLogo.tsx). */
export const RING_PEAK_OPACITY = 0.6;
/** How strongly the ring's colour shows at its outer edge, at standard strength. */
export const RIM_ALPHA = RING_STOPS[RING_STOPS.length - 1] * RING_PEAK_OPACITY;
export const MIN_DIFFERENCE = 10;
export const MIN_COLOURS = 3;

type Triple = [number, number, number];
const rgbOf = (hex: string): Triple => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const hexOf = (rgb: Triple): string => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const linear = (v: number): number => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const encoded = (c: number): number => 255 * Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055));
const forward = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const back = (t: number): number => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);

function labOf(rgb: Triple): Triple {
  const [r, g, b] = rgb.map(linear);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, y = 0.2126 * r + 0.7152 * g + 0.0722 * b, z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  return [116 * forward(y) - 16, 500 * (forward(x) - forward(y)), 200 * (forward(y) - forward(z))];
}
function rgbOfLab([L, a, b]: Triple): Triple {
  const fy = (L + 16) / 116, x = 0.95047 * back(fy + a / 500), y = back(fy), z = 1.08883 * back(fy - b / 200);
  return [encoded(3.2406 * x - 1.5372 * y - 0.4986 * z), encoded(-0.9689 * x + 1.8758 * y + 0.0415 * z), encoded(0.0557 * x - 0.204 * y + 1.057 * z)];
}

/** How far the ring's edge in this colour stands out from the page: 0 is not at all. */
export function ringDifference(hex: string, theme: RingTheme): number {
  const page = rgbOf(PAGE_BACKGROUND[theme]);
  const shown = rgbOf(hex).map((v, i) => v * RIM_ALPHA + page[i] * (1 - RIM_ALPHA)) as Triple;
  const a = labOf(shown), b = labOf(page);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** The colour moved away from the page in lightness, hue kept, only until it stands out. */
function madeToStandOut(hex: string, theme: RingTheme): string {
  const [L, a, b] = labOf(rgbOf(hex));
  const step = theme === 'dark' ? 1 : -1;
  for (let l = L; l >= -1 && l <= 101; l += step) {
    const out = hexOf(rgbOfLab([Math.min(100, Math.max(0, l)), a, b]));
    if (ringDifference(out, theme) >= MIN_DIFFERENCE) return out;
  }
  return theme === 'dark' ? '#FFFFFF' : '#000000';
}

/** The colours the ring takes from one palette on this page, in the palette's order. */
export function visibleColours(palette: readonly string[], theme: RingTheme): string[] {
  const measured = palette.map((hex, at) => ({ hex, at, d: ringDifference(hex, theme) }));
  const strong = measured.filter((c) => c.d >= MIN_DIFFERENCE);
  const short = Math.max(0, Math.min(MIN_COLOURS, palette.length) - strong.length);
  const added = measured.filter((c) => c.d < MIN_DIFFERENCE).sort((x, y) => y.d - x.d).slice(0, short).map((c) => ({ ...c, hex: madeToStandOut(c.hex, theme) }));
  return [...strong, ...added].sort((x, y) => x.at - y.at).map((c) => c.hex);
}

/** A colour choice (src/lib/logoColours.ts) as the ring uses it on this page. */
export const visibleRing = (r: ResolvedColours, theme: RingTheme): ResolvedColours => ({ choice: r.choice, palettes: r.palettes.map((p) => visibleColours(p, theme)) });

