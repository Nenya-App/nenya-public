// Short plain meanings for the phrase workbench, on request only (docs/phrase-workbench-scope.md, section 1.5): our own lists first, from this device, nothing sent.
// A word not on the lists is never flagged; it just has no short meaning here. Pure.

import { allFeelingWords } from './feelingFamilies.ts';
import { NEED_CATEGORIES, allNeedWords } from './needFamilies.ts';
import { PASSING_NOTE, PASSING_WORDS } from './workbenchCopy.ts';
import { nearWords } from './nearWords.ts';

export interface Meaning {
  word: string;
  def: string;
  /** Where it sits on our lists, in words: "a feeling, in Hurt", "a need, in Connection". */
  where: string;
  kind: 'feeling' | 'need' | 'group' | 'passing';
  /** Only for words people often say as feelings. */
  note?: string;
}

const norm = (w: string) => w.trim().toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').replace(/\s+/g, ' ');

/** The short meaning of a word or a group name, or null when it is not on our lists. Looks at needs, feelings, the words often said as feelings, and the groups. */
export function defineWord(raw: string): Meaning | null {
  const w = norm(raw);
  if (!w || w.length > 40) return null;
  const f = allFeelingWords().find((x) => x.word.toLowerCase() === w);
  if (f) return { word: f.word, def: f.def, where: `a feeling, in ${f.family}`, kind: 'feeling' };
  const n = allNeedWords().find((x) => x.word.toLowerCase() === w);
  if (n) return { word: n.word, def: n.def, where: `a need, in ${n.category}`, kind: 'need' };
  const p = PASSING_WORDS.find((x) => x.word === w);
  if (p) return { word: p.word, def: p.def, where: 'a word often said as a feeling', kind: 'passing', note: PASSING_NOTE };
  const c = NEED_CATEGORIES.find((x) => x.name.toLowerCase() === w);
  if (c) return { word: c.name, def: c.plain, where: 'a group of needs', kind: 'group' };
  return null;
}

/** Near words for a word, as the person asked for them (see nearWords.ts). */
export const nearTo = (raw: string): string[] => nearWords(norm(raw), 8);
