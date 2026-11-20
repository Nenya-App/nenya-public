// The two readings, side by side (docs/dyad-rephrase-scope.md, section 4). Pure. It lists what each person marked, and for each
// marked word says one of four plain things. It never counts, ranks, scores, summarises or says which reading is right, and it
// says nothing about a word nobody marked. A hearer's feelings and needs are called guesses.
import { isGuess, KINDS, markMap, plainWord, tokenize, type Mark, type MarkKind } from './rephraseKinds.ts';
import { KIND_PLAIN, WORDS } from './rephraseWords.ts';

export type Viewer = 'speaker' | 'hearer';
export type Relation = 'same' | 'different' | 'only-speaker' | 'only-hearer';

export interface Section {
  kind: MarkKind;
  /** The heading in the voice of the person who marked (for the guess wording). */
  words: string[];
}
export interface Row {
  index: number;
  word: string;
  speaker: MarkKind | null;
  hearer: MarkKind | null;
  relation: Relation;
  /** The plain statement, worded for the viewer. */
  text: string;
}
export interface Comparison {
  words: string[];
  speaker: Section[];
  /** Null when the hearer's marks are not on this device (kept private, or skipped). */
  hearer: Section[] | null;
  /** In word order. Null with no reading of the hearer. Words nobody marked are not here. */
  rows: Row[] | null;
}

const plain = (k: MarkKind, hearer: boolean): string => (isGuess(k, hearer) ? `a guess at ${KIND_PLAIN[k]}` : KIND_PLAIN[k]);

function sections(words: string[], marks: readonly Mark[]): Section[] {
  const m = markMap(marks);
  return KINDS.map((k) => ({ kind: k.id, words: words.filter((_, i) => m.get(i) === k.id).map(plainWord) })).filter((s) => s.words.length > 0);
}

/** The statement for one word. The speaker is named first, always, so both devices read the same order. */
export function statement(rel: Relation, a: MarkKind | null, b: MarkKind | null, viewer: Viewer): string {
  const me = viewer === 'speaker' ? 'You' : 'They';
  const them = viewer === 'speaker' ? 'They' : 'You';
  switch (rel) {
    case 'same':
      return `Marked the same way by both of you (${KIND_PLAIN[a!]}).`;
    case 'different':
      return `Marked by both of you, as different kinds. ${me}: ${plain(a!, false)}. ${them}: ${plain(b!, true)}.`;
    case 'only-speaker':
      return viewer === 'speaker' ? 'Marked only by you.' : 'Marked only by them.';
    case 'only-hearer':
      return viewer === 'speaker' ? 'Marked only by them.' : 'Marked only by you.';
  }
}

export function compare(phrase: string, speakerMarks: readonly Mark[], hearerMarks: readonly Mark[] | null, viewer: Viewer): Comparison {
  const words = tokenize(phrase);
  const out: Comparison = { words, speaker: sections(words, speakerMarks), hearer: hearerMarks ? sections(words, hearerMarks) : null, rows: null };
  if (!hearerMarks) return out;
  const a = markMap(speakerMarks);
  const b = markMap(hearerMarks);
  const rows: Row[] = [];
  words.forEach((w, i) => {
    const x = a.get(i) ?? null;
    const y = b.get(i) ?? null;
    if (!x && !y) return;
    const relation: Relation = x && y ? (x === y ? 'same' : 'different') : x ? 'only-speaker' : 'only-hearer';
    rows.push({ index: i, word: plainWord(w), speaker: x, hearer: y, relation, text: statement(relation, x, y, viewer) });
  });
  out.rows = rows;
  return out;
}

/** The sentence under a section, for a screen that has no layout to lean on: "What was seen or heard: late, waiting." */
export const sectionLine = (s: Section, hearer: boolean): string => `${isGuess(s.kind, hearer) ? `A guess at ${KIND_PLAIN[s.kind]}` : KIND_PLAIN[s.kind][0].toUpperCase() + KIND_PLAIN[s.kind].slice(1)}: ${s.words.join(', ')}.`;
export const emptyLine = (anyMarked: boolean): string => (anyMarked ? WORDS.nothingMarked : WORDS.noWordsMarked);
