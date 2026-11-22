// Which colours the logo uses: the colour of each breath's ring (and the gem's tint that follows it), and the colours of the sixteen orbs.
// A visitor setting like the rest of the logo's look (src/lib/logoLook.ts, kept by src/lib/deviceMemory.ts). Pure and tested.
//
// Every choice is one of:
//   'original'          what the site does without a choice: the ring goes through all 96 colours of the sixteen palettes, one colour a breath, and each orb has its own palette
//   'preset:<id>'       a small named set built from the sixteen palettes (PRESETS below)
//   'palette:<Name>'    one of the sixteen palettes, by the name a visitor sees (src/lib/paletteNames.ts)
//   'mine-1', 'mine-2'  a palette the visitor made and kept in the Sight lens (src/lib/colorSchemes.ts); offered only while it exists
//   'mine-both'         both of them together (offered only while both exist)
//
// How a choice becomes colours (the same rule for every choice that has more than one palette in it, "both" included):
//   Breath: the ring takes one colour a breath, and the palettes take turns: breath 1 the first palette's first colour, breath 2 the second palette's
//           first colour, and so on round, then each palette's second colour. One palette on its own just goes through its colours in order.
//   Orbs:   orb number i (0 to 15) takes palette (i mod number-of-palettes), so with two palettes the orbs alternate between them all the way round. Each orb
//           needs six colours to fade through; a palette with six colours gives them as they are (shifted along by one for each time the palettes come round,
//           so orbs sharing a palette do not all start on the same colour), and one with another number of colours is sampled evenly round its loop, blending
//           between neighbours.
// Nothing here reads or writes storage; the saved palettes come in as an argument.
import { displayNameFor, PALETTE_DISPLAY_NAMES } from './paletteNames.ts';

export const COLOUR_ORIGINAL = 'original';
export const SAVED_CHOICES = ['mine-1', 'mine-2', 'mine-both'] as const;
export type SavedChoice = (typeof SAVED_CHOICES)[number];

/** The palettes as the logo has them: the internal id (as in ValarBreathingLogo.tsx) and its colours. */
export interface PaletteVector {
  name: string;
  vector: readonly string[];
}
/** What the logo needs of a palette the visitor kept: its colours, with the names the Sight lens gave them where it did. */
export interface KeptPalette {
  colours: string[];
  names: (string | undefined)[];
}

/** The outward names of the sixteen palettes, in the order of the logo's orbs (an internal id with no outward name is not offered). */
export const PALETTE_NAMES: readonly string[] = [...new Set(Object.values(PALETTE_DISPLAY_NAMES))];

export interface ColourPreset {
  id: string;
  label: string;
  /** Outward palette names, in the order the orbs and breaths take them. */
  palettes: readonly string[];
}
/** A few named sets from the sixteen. Plain names about what the colours look like, not what they mean. */
export const PRESETS: readonly ColourPreset[] = [
  { id: 'cool', label: 'Cool', palettes: ['Sky', 'Tide', 'Soft Rain', 'Starlight', 'Reverie', 'Haven'] },
  { id: 'warm', label: 'Warm', palettes: ['Ember', 'Craft', 'Stride', 'Rhythm', 'Tapestry', 'Blossom'] },
  { id: 'woodland', label: 'Woodland', palettes: ['Greenwood', 'Stride', 'Haven', 'Blossom'] },
  { id: 'night', label: 'Night', palettes: ['Starlight', 'Twilight', 'Reverie', 'Hollow', 'Cinder'] },
];

const HEX = /^#[0-9a-f]{6}$/i;
export const isHexColour = (s: unknown): s is string => typeof s === 'string' && HEX.test(s);

/** The choice if it is one the site offers (a saved-palette choice passes here; whether it can be used is decided where the saved palettes are known), else the original. */
export function snapColourChoice(v: unknown): string {
  if (typeof v !== 'string') return COLOUR_ORIGINAL;
  if (v === COLOUR_ORIGINAL || (SAVED_CHOICES as readonly string[]).includes(v)) return v;
  if (v.startsWith('preset:') && PRESETS.some((p) => `preset:${p.id}` === v)) return v;
  if (v.startsWith('palette:') && PALETTE_NAMES.includes(v.slice('palette:'.length))) return v;
  return COLOUR_ORIGINAL;
}

/**
 * The palettes a visitor kept, from what the Sight lens holds (up to two; anything without at least two usable colours is left out, and
 * what is left is renumbered, so "palette 1" is always the first one that can be used).
 */
export function keptPalettes(raw: unknown): KeptPalette[] {
  if (!Array.isArray(raw)) return [];
  const out: KeptPalette[] = [];
  for (const p of raw.slice(0, 8)) {
    if (out.length >= 2) break;
    const list: unknown[] = Array.isArray((p as { colors?: unknown })?.colors) ? (p as { colors: unknown[] }).colors : [];
    const colours: string[] = [];
    const names: (string | undefined)[] = [];
    for (const c of list) {
      const hex = (c as { hex?: unknown })?.hex;
      if (!isHexColour(hex)) continue;
      colours.push(hex.toUpperCase());
      const nm = (c as { name?: unknown }).name;
      names.push(typeof nm === 'string' && nm.trim() ? nm.trim().slice(0, 40) : undefined);
    }
    if (colours.length >= 2) out.push({ colours, names });
  }
  return out;
}

/** The choices the settings should offer for the palettes that exist now: "Your saved palette" choices appear only when there is something to choose. */
export function savedChoicesFor(kept: readonly KeptPalette[]): SavedChoice[] {
  return kept.length >= 2 ? ['mine-1', 'mine-2', 'mine-both'] : kept.length === 1 ? ['mine-1'] : [];
}

export interface ResolvedColours {
  /** The choice in effect: the one asked for, or 'original' when it cannot be used (a saved palette that is gone, an unknown name). */
  choice: string;
  /** The palettes it is made of, in order: each a list of colours. For the original, the sixteen. */
  palettes: string[][];
}

const nameToVector = (sixteen: readonly PaletteVector[], outward: string): string[] | null => {
  const v = sixteen.find((p) => displayNameFor(p.name) === outward);
  return v ? [...v.vector] : null;
};

/** What a choice is made of, given the sixteen palettes and the ones the visitor kept. An unusable choice is the original. */
export function resolveColours(choice: unknown, sixteen: readonly PaletteVector[], kept: readonly KeptPalette[] = []): ResolvedColours {
  const original: ResolvedColours = { choice: COLOUR_ORIGINAL, palettes: sixteen.map((p) => [...p.vector]) };
  const c = snapColourChoice(choice);
  if (c === COLOUR_ORIGINAL) return original;
  if (c === 'mine-1') return kept[0] ? { choice: c, palettes: [kept[0].colours] } : original;
  if (c === 'mine-2') return kept[1] ? { choice: c, palettes: [kept[1].colours] } : original;
  if (c === 'mine-both') return kept.length >= 2 ? { choice: c, palettes: [kept[0].colours, kept[1].colours] } : original;
  if (c.startsWith('palette:')) {
    const v = nameToVector(sixteen, c.slice('palette:'.length));
    return v ? { choice: c, palettes: [v] } : original;
  }
  const preset = PRESETS.find((p) => `preset:${p.id}` === c);
  const lists = preset ? preset.palettes.map((n) => nameToVector(sixteen, n)).filter((x): x is string[] => !!x) : [];
  return lists.length ? { choice: c, palettes: lists } : original;
}

const hexToRgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgbToHex = (r: number[]): string => '#' + r.map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('').toUpperCase();

/**
 * Six colours for an orb from one palette: six colours as they are (starting `shift` along); any other number sampled evenly round the loop of
 * the palette (the last blends back into the first), so an orb fades through the whole palette and comes round smoothly. Pure.
 */
export function sixColours(palette: readonly string[], shift = 0): string[] {
  const n = palette.length;
  if (n === 0) return Array.from({ length: 6 }, () => '#FFFFFF');
  if (n === 6) return Array.from({ length: 6 }, (_, k) => palette[(k + shift) % 6]);
  return Array.from({ length: 6 }, (_, k) => {
    const pos = (((shift + (k * n) / 6) % n) + n) % n;
    const lo = Math.floor(pos);
    const f = pos - lo;
    if (f < 1e-9) return palette[lo % n];
    const a = hexToRgb(palette[lo % n]);
    const b = hexToRgb(palette[(lo + 1) % n]);
    return rgbToHex(a.map((x, i) => x + (b[i] - x) * f));
  });
}

/**
 * The six-colour vector of each orb (`count` orbs, sixteen in the logo). For the original these are the sixteen palettes' own vectors, untouched;
 * otherwise orb i takes palette i mod P and shifts along by one each time the palettes come round.
 */
export function orbVectors(r: ResolvedColours, count = 16): string[][] {
  if (r.choice === COLOUR_ORIGINAL) return Array.from({ length: count }, (_, i) => r.palettes[i % r.palettes.length]);
  const P = r.palettes.length;
  return Array.from({ length: count }, (_, i) => sixColours(r.palettes[i % P], Math.floor(i / P)));
}

/**
 * The ring's colours, one a breath, in order, then round again. The original is the sixteen palettes end to end (96 colours, as before);
 * otherwise the palettes take turns (breath k takes palette k mod P, its colour number floor(k / P)).
 */
export function breathSequence(r: ResolvedColours): string[] {
  if (r.choice === COLOUR_ORIGINAL) return r.palettes.flat();
  const P = r.palettes.length;
  const longest = Math.max(...r.palettes.map((p) => p.length));
  return Array.from({ length: longest * P }, (_, k) => {
    const p = r.palettes[k % P];
    return p[Math.floor(k / P) % p.length];
  });
}

/** Plain words for a choice, for the settings and for the polite message after a change. */
export function colourChoiceLabel(choice: string): string {
  const c = snapColourChoice(choice);
  if (c === COLOUR_ORIGINAL) return 'Original';
  if (c === 'mine-1') return 'Your saved palette 1';
  if (c === 'mine-2') return 'Your saved palette 2';
  if (c === 'mine-both') return 'Both of your saved palettes';
  if (c.startsWith('palette:')) return c.slice('palette:'.length);
  return PRESETS.find((p) => `preset:${p.id}` === c)?.label ?? 'Original';
}

/** A line saying what the choice is made of, in names, so it never rests on colour alone. */
export function colourChoiceDetail(choice: string, kept: readonly KeptPalette[] = []): string {
  const c = snapColourChoice(choice);
  if (c === COLOUR_ORIGINAL) return 'Each breath and each orb keeps its own palette, as the logo always has.';
  const hexes = (k: KeptPalette) => k.colours.map((h, i) => (k.names[i] ? `${k.names[i]} ${h}` : h)).join(', ');
  if (c === 'mine-1') return kept[0] ? hexes(kept[0]) : '';
  if (c === 'mine-2') return kept[1] ? hexes(kept[1]) : '';
  if (c === 'mine-both') return kept.length >= 2 ? `Palette 1: ${hexes(kept[0])}. Palette 2: ${hexes(kept[1])}. They take turns.` : '';
  if (c.startsWith('palette:')) return `The ${c.slice('palette:'.length)} palette.`;
  const p = PRESETS.find((x) => `preset:${x.id}` === c);
  return p ? `The palettes ${p.palettes.join(', ')}, taking turns.` : '';
}

/** The polite message after a change. */
export const colourChoiceMessage = (what: 'breath' | 'orbs', choice: string): string =>
  `${what === 'breath' ? 'Breathing colours' : 'Orb colours'} are now ${colourChoiceLabel(choice).toLowerCase()}.`;

/** Swatches for a choice: the colours it is made of, for a small row beside the name (decoration; the name and the line above carry the meaning). */
export function colourChoiceSwatches(choice: string, sixteen: readonly PaletteVector[], kept: readonly KeptPalette[] = []): string[] {
  const r = resolveColours(choice, sixteen, kept);
  if (r.choice === COLOUR_ORIGINAL) return sixteen.map((p) => p.vector[0]); // the main colour of each of the sixteen
  return r.palettes.flatMap((p) => p.slice(0, 6)).slice(0, 12);
}
