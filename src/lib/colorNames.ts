// Suggesting a name for a colour (docs/color-tools-scope.md). The names come from color-name-list (MIT, David Aerne; github.com/meodai/color-names), the
// "best of" set of 5,000 evocative names, shipped with the site and loaded only when a visitor asks for a suggestion: nothing is sent anywhere. The nearest
// name is found by distance in OKLab (a space built so that equal steps look about equally different). A name is a starting point for the person's own
// word, never a reading of the colour: no colour has a fixed meaning. For people who cannot see the colour, the name and a plain description stand in for it.

export interface NamedColor {
  name: string;
  hex: string;
}

export type Closeness = 'close' | 'rough' | 'loose';

export interface NameSuggestion {
  name: string;
  hex: string;
  closeness: Closeness;
  /** The next-nearest names, for "another". */
  others: string[];
}

const HEX = /^#?([0-9a-f]{6})$/i;

/** OKLab coordinates [L, a, b] of a hex colour, or null if it is not a six-digit hex. */
export function toOklab(hex: string): [number, number, number] | null {
  const m = HEX.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s];
}

const dist = (a: [number, number, number], b: [number, number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Cached Lab values for a list, so a second suggestion does not recompute 5,000 conversions.
const labCache = new WeakMap<NamedColor[], ([number, number, number] | null)[]>();
const labsFor = (list: NamedColor[]) => {
  let labs = labCache.get(list);
  if (!labs) { labs = list.map((c) => toOklab(c.hex)); labCache.set(list, labs); }
  return labs;
};

/** The nearest names to a colour, nearest first, or null if the colour is not a valid hex or the list is empty. */
export function suggestName(hex: string, list: NamedColor[], howMany = 4): NameSuggestion | null {
  const target = toOklab(hex);
  if (!target || list.length === 0) return null;
  const labs = labsFor(list);
  const scored: { i: number; d: number }[] = [];
  for (let i = 0; i < list.length; i++) {
    const lab = labs[i];
    if (lab) scored.push({ i, d: dist(target, lab) });
  }
  scored.sort((a, b) => a.d - b.d);
  const best = scored[0];
  if (!best) return null;
  // OKLab distances: under about 0.02 is hard to tell apart by eye, under about 0.05 is a near neighbour, beyond that the name is only in the neighbourhood.
  const closeness: Closeness = best.d < 0.02 ? 'close' : best.d < 0.05 ? 'rough' : 'loose';
  return { name: list[best.i].name, hex: list[best.i].hex, closeness, others: scored.slice(1, howMany).map((s) => list[s.i].name) };
}

/** Plain words for a colour, so the name is not the only description: "a dark, muted blue". For people who cannot see the colour. */
export function describePlainly(hex: string): string {
  const lab = toOklab(hex);
  if (!lab) return 'a colour';
  const [L, a, b] = lab;
  const C = Math.hypot(a, b);
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  const light = L < 0.25 ? 'very dark' : L < 0.45 ? 'dark' : L < 0.7 ? 'medium' : L < 0.88 ? 'light' : 'very light';
  if (C < 0.02) return L < 0.25 ? 'black or nearly black' : L > 0.95 ? 'white or nearly white' : `${light} grey`;
  const strength = C < 0.06 ? 'muted' : C < 0.14 ? '' : 'vivid';
  // Hue angles in OKLab: red about 30, orange 55, yellow 100, green 140, teal 190, blue 255, purple 305, pink/magenta 345.
  const hue = h < 15 || h >= 355 ? 'pink-red' : h < 42 ? 'red' : h < 75 ? 'orange' : h < 115 ? 'yellow' : h < 165 ? 'green' : h < 210 ? 'teal' : h < 275 ? 'blue' : h < 325 ? 'purple' : 'pink';
  return `a ${[light, strength].filter(Boolean).join(', ')} ${hue}`;
}

/** What a screen reader says for a suggestion: the name, how well it fits, and the plain description. */
export function speakSuggestion(label: string, hex: string, s: NameSuggestion | null): string {
  if (!s) return `${label}: ${describePlainly(hex)}.`;
  const fit = s.closeness === 'close' ? 'a close match' : s.closeness === 'rough' ? 'a near match' : 'only a rough match';
  return `${label}: ${describePlainly(hex)}. A name that might fit: ${s.name}, ${fit}. It is only a suggestion; you can use it, change it, or keep your own words.`;
}

let loaded: Promise<NamedColor[]> | null = null;
/** The name list, loaded once and only when asked for (a separate file, about 200 KB; nothing is requested before this is called). */
export function loadColorNames(): Promise<NamedColor[]> {
  if (!loaded) loaded = import('color-name-list/bestof').then((m) => m.colornames as NamedColor[]);
  return loaded;
}
