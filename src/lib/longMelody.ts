// A melody made of phrases, one phrase for each color (three notes a color): the present color, the wish color and up to two palettes the person kept
// in the Sight gateway and marked for sound. Up to twelve phrases, 36 notes (docs/sound-from-colors-scope.md).
//
// Rules (the owner, 2026-11-09/10):
// - the present and wish phrases always stay (they can be moved and their notes changed, but not muted or taken out); any palette phrase can be muted;
// - the notes and the Sight colors are separate once both exist: changing a note never changes a color and changing a color elsewhere never changes
//   a note the person has set. The colors only seed the notes at the start and when a scale change has to be re-translated.
import { hexToMelodyIndices } from './audio.ts';

export type PhraseKind = 'present' | 'wish' | 'palette';

export interface Phrase {
  id: string;
  kind: PhraseKind;
  /** A name for the color: the person's own words, a nearest name, or the hex code. */
  label: string;
  hex: string;
  notes: number[];
  muted: boolean;
  /** True once the person has changed a note: it is then kept (and mapped across a scale change) instead of re-derived from the color. */
  edited: boolean;
}

export interface PaletteIn {
  colors: { hex: string; name?: string }[];
  useInSound?: boolean;
}

export const MAX_PHRASES = 12;
export const NOTES_PER_PHRASE = 3;

const HEX = /^#[0-9a-f]{6}$/i;

export function buildPhrases(
  present: { hex: string; name?: string | null },
  wish: { hex: string; name?: string | null },
  palettes: PaletteIn[],
  scaleLength: number,
): Phrase[] {
  const mk = (kind: PhraseKind, id: string, hex: string, label?: string | null): Phrase => ({
    id, kind, label: (label ?? '').trim() || hex.toUpperCase(), hex: hex.toUpperCase(), notes: hexToMelodyIndices(hex, scaleLength), muted: false, edited: false,
  });
  const used = palettes.filter((p) => p?.useInSound && (p.colors ?? []).some((c) => HEX.test(c.hex)));
  const fromPalette = (p: PaletteIn | undefined, n: number): Phrase[] =>
    (p?.colors ?? []).filter((c) => HEX.test(c.hex)).map((c, i) => mk('palette', `palette${n}-${i}`, c.hex, c.name));
  const out = [mk('present', 'present', present.hex, present.name), ...fromPalette(used[0], 1), mk('wish', 'wish', wish.hex, wish.name), ...fromPalette(used[1], 2)];
  return out.slice(0, MAX_PHRASES);
}

export const canMute = (p: Phrase): boolean => p.kind === 'palette';

export function setMuted(list: Phrase[], id: string, muted: boolean): Phrase[] {
  return list.map((p) => (p.id === id && canMute(p) ? { ...p, muted } : p));
}

export function movePhrase(list: Phrase[], id: string, by: -1 | 1): Phrase[] {
  const i = list.findIndex((p) => p.id === id);
  const j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Changes one note of one phrase. The colors are untouched. */
export function setNote(list: Phrase[], id: string, position: number, note: number): Phrase[] {
  return list.map((p) => (p.id === id && position >= 0 && position < p.notes.length ? { ...p, notes: p.notes.map((n, k) => (k === position ? note : n)), edited: true } : p));
}

/** After a change of scale: phrases the person has not touched are re-derived from their colors; the ones they have changed keep their place in the scale. */
export function remapScale(list: Phrase[], oldLength: number, newLength: number): Phrase[] {
  const carry = (n: number) => (oldLength <= 1 ? 0 : Math.min(newLength - 1, Math.round((n * (newLength - 1)) / (oldLength - 1))));
  return list.map((p) => (p.edited ? { ...p, notes: p.notes.map(carry) } : { ...p, notes: hexToMelodyIndices(p.hex, newLength) }));
}

/** What plays, in order: every note of every phrase that is not muted, and for each its phrase and position (for the highlight). */
export function playlist(list: Phrase[]): { notes: number[]; at: { id: string; position: number }[] } {
  const notes: number[] = [];
  const at: { id: string; position: number }[] = [];
  for (const p of list) {
    if (p.muted) continue;
    p.notes.forEach((n, position) => { notes.push(n); at.push({ id: p.id, position }); });
  }
  return { notes, at };
}

/** The phrases as plain lines for the reports: the color, and the note values. No description of how it sounds (that is the person's to write). */
export function phraseLines(list: Phrase[], noteNames: string[]): string[] {
  return list.map((p, i) => `  ${i + 1}. ${p.kind === 'present' ? 'Present' : p.kind === 'wish' ? 'Wish' : 'Palette'} ${p.label}${p.label.toUpperCase() === p.hex ? '' : ` ${p.hex}`}: ${p.muted ? 'muted' : p.notes.map((n) => noteNames[n] ?? String(n)).join(' ')}`);
}
