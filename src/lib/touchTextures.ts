// The surfaces offered in the Touch gateway: photographed material textures (fabric, leather, bark, stone and so on) from two libraries that publish
// them under CC0 (ambientCG and Poly Haven), bundled with the site so nothing is fetched from anywhere else (public/touch-textures/).
//
// Each ambientCG surface has a measured feel: the average steepness of its surface, read from the library's published normal map (a 512 px crop at
// full size), from flat to rough. It measures bumpiness only, not softness, warmth or anything else, and the labels' cutoffs are ours. Poly Haven
// surfaces were not measured. The position on the Texture slider ("smooth" below, 0 rough to 100 smooth) is the surface's place in the order of the
// measured ones, not a unit of anything. A picture is something to point at; it has no fixed meaning.
import { describePlainly } from './colorNames.ts';
import { TOUCH_TEXTURE_DATA, type TextureRecord } from './touchTexturesData.ts';

export const TEXTURE_GROUPS = ['Soft and woven', 'Leather and skin-like', 'Plant and wood', 'Stone, earth and cold'] as const;
export type TextureGroup = (typeof TEXTURE_GROUPS)[number];

export const FEELS = ['Flat or very smooth', 'Smooth', 'Lightly textured', 'Textured', 'Rough', 'Not measured'] as const;
export type Feel = (typeof FEELS)[number];

/** The label for a measured steepness (0 flat to about 0.7). */
export function feelOf(relief: number | null): Feel {
  if (relief === null) return 'Not measured';
  return relief < 0.03 ? 'Flat or very smooth' : relief < 0.15 ? 'Smooth' : relief < 0.3 ? 'Lightly textured' : relief < 0.45 ? 'Textured' : 'Rough';
}

export interface TouchTexture extends TextureRecord {
  feel: Feel;
  /** Place on the Texture slider: 0 rough to 100 smooth, among the measured surfaces; null if not measured. */
  smooth: number | null;
}

const measured = TOUCH_TEXTURE_DATA.filter((t) => t.relief !== null).map((t) => t.relief as number).sort((a, b) => a - b);

export const TOUCH_TEXTURES: TouchTexture[] = TOUCH_TEXTURE_DATA.map((t) => {
  const smooth = t.relief === null ? null : Math.round(100 * (1 - measured.filter((r) => r < (t.relief as number)).length / measured.length));
  return { ...t, feel: feelOf(t.relief), smooth };
});

export const textureById = (id: string | null | undefined): TouchTexture | undefined => (id ? TOUCH_TEXTURES.find((t) => t.id === id) : undefined);

export const texturePath = (id: string): string => `/touch-textures/${id}.jpg`;

/** Smoothest first, then the unmeasured ones. */
export const bySmoothness = (list: TouchTexture[]): TouchTexture[] =>
  [...list].sort((a, b) => (a.smooth === null ? 1 : 0) - (b.smooth === null ? 1 : 0) || (b.smooth ?? 0) - (a.smooth ?? 0) || a.title.localeCompare(b.title));

/** The measured surface whose place on the slider is closest to the given value. */
export function nearestToSlider(value: number): TouchTexture {
  const m = TOUCH_TEXTURES.filter((t) => t.smooth !== null);
  return m.reduce((best, t) => (Math.abs((t.smooth as number) - value) < Math.abs((best.smooth as number) - value) ? t : best), m[0]);
}

/** What a screen reader says for a surface: a plain description built from facts we know (its kind, its average color, its measured feel). */
export function textureAlt(t: TouchTexture): string {
  return `${t.title}: a close-up photograph of a ${t.kind.toLowerCase()} surface, ${describePlainly(t.hex)} in color. ${t.feel === 'Not measured' ? 'Its feel was not measured.' : `Measured feel: ${t.feel.toLowerCase()}.`}`;
}

/** One line for the report: the surface chosen, in words. */
export function surfaceLine(id: string | null | undefined): string | null {
  const t = textureById(id);
  return t ? `${t.title} (${t.kind.toLowerCase()}, ${t.feel === 'Not measured' ? 'feel not measured' : t.feel.toLowerCase()}; picture from ${t.source})` : null;
}
