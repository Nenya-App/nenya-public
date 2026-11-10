// Palettes for the Sight gateway (docs/color-tools-scope.md): the modes The Color API offers, the same harmonies computed on the device as a fallback and for
// people who prefer nothing to leave it, and a "bridge" from the current colour to the wish colour (always local). Colours are shaped in OKLCH and kept inside
// what a screen can show. Nothing here makes a network request.
import { toOklab } from './colorNames.ts';

export const SCHEME_MODES = ['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 'complement', 'analogic-complement', 'triad', 'quad'] as const;
export type SchemeMode = (typeof SCHEME_MODES)[number];

export const MODE_LABELS: Record<SchemeMode, { label: string; blurb: string }> = {
  monochrome: { label: 'One color, in steps', blurb: 'The same hue, lighter and darker.' },
  'monochrome-dark': { label: 'One color, darker', blurb: 'The same hue, moving toward dark.' },
  'monochrome-light': { label: 'One color, lighter', blurb: 'The same hue, moving toward light.' },
  analogic: { label: 'Neighbors', blurb: 'Colors next to it on the color wheel.' },
  complement: { label: 'Its opposite', blurb: 'The color across the wheel, with steps between.' },
  'analogic-complement': { label: 'Neighbors and opposite', blurb: 'Neighbors, plus the color across the wheel.' },
  triad: { label: 'Three evenly spaced', blurb: 'Three colors a third of the wheel apart.' },
  quad: { label: 'Four evenly spaced', blurb: 'Four colors a quarter of the wheel apart.' },
};

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (s: unknown): s is string => typeof s === 'string' && HEX.test(s);

const toLch = (hex: string): { L: number; C: number; h: number } => {
  const lab = toOklab(hex) ?? [0.5, 0, 0];
  return { L: lab[0], C: Math.hypot(lab[1], lab[2]), h: ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360 };
};

const srgbOf = (L: number, C: number, hDeg: number): [number, number, number] => {
  const a = C * Math.cos((hDeg * Math.PI) / 180), b = C * Math.sin((hDeg * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.max(x, 0) ** (1 / 2.4) - 0.055)) as [number, number, number];
};

/** A hex colour for OKLCH values, with the chroma reduced until it fits inside the screen's range. */
export function fromLch(L: number, C: number, h: number): string {
  const Lc = Math.min(0.98, Math.max(0.05, L));
  let c = Math.max(0, C);
  for (let i = 0; i < 40; i++) {
    const rgb = srgbOf(Lc, c, h);
    if (rgb.every((x) => x >= -0.001 && x <= 1.001)) {
      return '#' + rgb.map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    c *= 0.92;
  }
  return '#' + srgbOf(Lc, 0, h).map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const spread = (n: number, from: number, to: number): number[] => Array.from({ length: n }, (_, i) => (n === 1 ? from : from + ((to - from) * i) / (n - 1)));

/** The same kinds of harmony The Color API offers, made on the device. `count` colors, the seed first. */
export function localScheme(hex: string, mode: SchemeMode, count = 5): string[] {
  const { L, C, h } = toLch(hex);
  const at = (hh: number, LL = L, CC = C) => fromLch(LL, CC, hh);
  switch (mode) {
    case 'monochrome': return spread(count, 0.25, 0.9).map((LL) => at(h, LL));
    case 'monochrome-dark': return spread(count, L, Math.max(0.15, L - 0.45)).map((LL) => at(h, LL));
    case 'monochrome-light': return spread(count, L, Math.min(0.95, L + 0.45)).map((LL) => at(h, LL));
    case 'analogic': return spread(count, -2 * 30, 2 * 30).map((d) => at(h + d));
    case 'complement': return [hex.toUpperCase(), ...spread(count - 2, L + 0.1, L - 0.1).map((LL) => at(h + 90, LL, C * 0.6)), at(h + 180)].slice(0, count);
    case 'analogic-complement': return [at(h - 30), at(h), at(h + 30), at(h + 180, L, C * 0.9), at(h + 180, L + 0.12, C * 0.6)].slice(0, count);
    case 'triad': return [at(h), at(h + 120), at(h + 240), at(h + 60, L + 0.12, C * 0.5), at(h + 180, L - 0.1, C * 0.5)].slice(0, count);
    case 'quad': return [at(h), at(h + 90), at(h + 180), at(h + 270), at(h + 45, L + 0.12, C * 0.5)].slice(0, count);
  }
}

/** Colours from the current colour to the wish colour, the two at the ends, evenly spaced in OKLCH (the shorter way round the hue wheel). Always local. */
export function bridge(fromHex: string, toHex: string, count = 5): string[] {
  const a = toLch(fromHex), b = toLch(toHex);
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  // A grey has no hue of its own: borrow the other end's, so a bridge from grey does not swing round the wheel.
  if (a.C < 0.01) { a.h = b.h; dh = 0; }
  if (b.C < 0.01) { dh = 0; }
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return fromHex.toUpperCase();
    if (i === count - 1) return toHex.toUpperCase();
    const t = i / (count - 1);
    return fromLch(a.L + (b.L - a.L) * t, a.C + (b.C - a.C) * t, a.h + dh * t);
  });
}

/** Asks our server for a scheme (which asks The Color API). Throws a short code if it cannot: 'off', 'limit', 'origin', 'upstream', 'network'. */
export async function fetchScheme(hex: string, mode: SchemeMode, signal?: AbortSignal): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch('/api/colors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hex, mode }), signal });
  } catch {
    throw new Error('network');
  }
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof j.error === 'string' ? j.error : 'upstream');
  if (!Array.isArray(j.colors) || !j.colors.every(isHex)) throw new Error('upstream');
  return (j.colors as string[]).map((c) => c.toUpperCase());
}

/** A palette the person made in the Sight gateway and chose to keep. Its colours count as the person's own (not one of the sixteen). */
export interface GeneratedPalette {
  /** Where it was made: on the device, or by The Color API through our server. */
  source: 'device' | 'The Color API';
  /** 'bridge' (current to wish) or one of the modes. */
  kind: 'bridge' | SchemeMode;
  /** For a mode: which colour it was made around. */
  base?: 'present' | 'wish';
  colors: { hex: string; name?: string }[];
  /** The person chose to carry this palette into the Sound gateway (docs/sound-from-colors-scope.md). */
  useInSound?: boolean;
}

/** Up to two palettes can be kept. */
export const MAX_PALETTES = 2;

/** One plain line for the report: what it is, where it was made, and the colours. */
export function describePalettePlainly(p: GeneratedPalette, n?: number): string {
  const how = p.kind === 'bridge' ? 'a bridge from the current color to the wish color' : `${MODE_LABELS[p.kind].label.toLowerCase()}, around the ${p.base === 'wish' ? 'wish' : 'current'} color`;
  const src = p.source === 'The Color API' ? 'generated with The Color API (thecolorapi.com)' : 'made on the device';
  return `${n ? `Palette ${n} you made` : 'Palette you made'}: ${how}, ${src}: ${p.colors.map((c) => (c.name ? `${c.name} ${c.hex}` : c.hex)).join(', ')}${p.useInSound ? ' (also used in the Sound gateway)' : ''}`;
}
