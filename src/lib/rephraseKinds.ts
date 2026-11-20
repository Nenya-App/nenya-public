// The five kinds of mark in rephrasing (docs/dyad-rephrase-scope.md), as a person marks the words of a phrase. A LOCAL stand-in
// for the solo phrase workbench's own list, to be replaced by its names when that lands. The cue (how a mark looks without
// colour) and the glyph are in addition to the text label, which is always shown: a mark is never colour alone.
export type MarkKind = 'saw' | 'story' | 'feeling' | 'need' | 'request';
export type Cue = 'solid' | 'dotted' | 'double' | 'dashed' | 'wavy';
export interface KindInfo {
  id: MarkKind;
  /** The heading, in the person's own voice. */
  name: string;
  /** The short label shown on the marked word. */
  short: string;
  glyph: string;
  /** One plain line. */
  desc: string;
  cue: Cue;
}

export const KINDS: readonly KindInfo[] = [
  { id: 'saw', name: 'What I saw or heard', short: 'saw', glyph: '■', desc: 'Something a camera or a recording would have caught.', cue: 'solid' },
  { id: 'story', name: 'A story about it', short: 'story', glyph: '○', desc: 'What I made of it: a reason, a pattern, a judgment.', cue: 'dotted' },
  { id: 'feeling', name: 'A feeling', short: 'feeling', glyph: '▲', desc: 'What I felt in my body or heart.', cue: 'double' },
  { id: 'need', name: 'A need', short: 'need', glyph: '◆', desc: 'What matters to me underneath.', cue: 'dashed' },
  { id: 'request', name: 'A request', short: 'request', glyph: '✦', desc: 'A clear, doable ask.', cue: 'wavy' },
];
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
