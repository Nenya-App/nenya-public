// The kinds of mark in rephrasing (docs/dyad-rephrase-scope.md), as a person marks the words of a phrase. The kinds, their names,
// plain descriptions and shapes are the solo phrase workbench's own (src/lib/workbenchCopy.ts), reused so the two tools say the
// same things. A shape (how a mark looks without colour) and a glyph are in addition to the text label, which is always shown:
// a mark is never colour alone. The tokenizer stays rephrasing's own (version 'w1'), because it travels with the phrase.
import { MARKS, type MarkKind as WorkbenchKind, type MarkShape } from './workbenchCopy.ts';

export type MarkKind = WorkbenchKind;
export type Cue = MarkShape;
export interface KindInfo {
  id: MarkKind;
  /** The heading. */
  name: string;
  /** The short label shown on the marked word. */
  short: string;
  glyph: string;
  /** One plain line. */
  desc: string;
  cue: Cue;
  /** Shown first; the rest sit under "More marks". */
  first: boolean;
}
const GLYPH: Record<MarkKind, string> = { saw: '\u25A0', story: '\u25CB', feeling: '\u25B2', need: '\u25C6', request: '\u2726', thought: '\u25C7', strategy: '\u25CF', demand: '\u25BC' };
export const KINDS: readonly KindInfo[] = MARKS.map((m) => ({ id: m.kind, name: m.name, short: m.kind, glyph: GLYPH[m.kind], desc: m.plain, cue: m.shape, first: m.first }));
export const MARK_KINDS: readonly MarkKind[] = KINDS.map((k) => k.id);
export const isMarkKind = (x: unknown): x is MarkKind => typeof x === 'string' && (MARK_KINDS as readonly string[]).includes(x);
export const kindInfo = (k: MarkKind): KindInfo => KINDS.find((x) => x.id === k)!;
/** A hearer's feelings and needs are guesses about someone else, and are worded so. */
export const isGuess = (k: MarkKind, hearer: boolean): boolean => hearer && (k === 'feeling' || k === 'need');

/** One mark: the first and last word it covers (positions in `tokenize`'s list, inclusive) and its kind. */
export type Mark = [start: number, end: number, kind: MarkKind];

export const TOKENIZER = 'w1';
/** The words of a phrase: whatever sits between spaces. Both devices must split in exactly the same way (the version travels with the phrase). */
export const tokenize = (text: string): string[] => text.split(/\s+/).filter(Boolean);
/** The word as read aloud: the same word without the marks of punctuation around it. */
export const plainWord = (w: string): string => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') || w;

/** Which kind each word has (a later mark overrides an earlier one on the same word). */
export function markMap(marks: readonly Mark[]): Map<number, MarkKind> {
  const m = new Map<number, MarkKind>();
  for (const [a, b, k] of marks) for (let i = a; i <= b; i++) m.set(i, k);
  return m;
}
/** The same, as one mark per word, in word order (the shape the editor keeps and the comparison reads). */
export function marksFromMap(m: ReadonlyMap<number, MarkKind>): Mark[] {
  return [...m.entries()].sort((x, y) => x[0] - y[0]).map(([i, k]) => [i, i, k] as Mark);
}
