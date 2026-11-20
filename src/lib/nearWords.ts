// Near words for the phrase workbench (docs/phrase-workbench-scope.md): from this device only, nothing sent, and only when the person presses for them.
// A word's neighbours are the other words in its family on our own lists, plus a few hand-picked cross links. They are "nearby, some closer, some
// further", never corrections. Pure.

import { allFeelingWords } from './feelingFamilies.ts';
import { allNeedWords } from './needFamilies.ts';

// A few neighbours that sit in different families. Each pair is read both ways.
const LINKS: [string, string][] = [
  ['hurt', 'sad'], ['hurt', 'lonely'], ['lonely', 'left out'], ['worried', 'uneasy'], ['anxious', 'uneasy'], ['tired', 'overwhelmed'],
  ['angry', 'hurt'], ['frustrated', 'stressed'], ['calm', 'relieved'], ['happy', 'content'], ['numb', 'flat'], ['trust', 'reliability'],
  ['respect', 'being heard'], ['space', 'privacy'], ['rest', 'quiet'], ['choice', 'a say'], ['closeness', 'belonging'], ['purpose', 'mattering'],
];

const families = (): string[][] => {
  const byKey = new Map<string, string[]>();
  for (const w of allFeelingWords()) byKey.set(`f:${w.side}:${w.family}`, [...(byKey.get(`f:${w.side}:${w.family}`) ?? []), w.word]);
  for (const w of allNeedWords()) byKey.set(`n:${w.category}:${w.family}`, [...(byKey.get(`n:${w.category}:${w.family}`) ?? []), w.word]);
  return [...byKey.values()];
};

/** Up to `limit` words near the given one, never the word itself, lower case. Empty if the word is not on the lists. */
export function nearWords(word: string, limit = 8): string[] {
  const w = word.trim().toLowerCase();
  if (!w) return [];
  const out: string[] = [];
  const add = (x: string) => { const t = x.toLowerCase(); if (t !== w && !out.includes(t)) out.push(t); };
  for (const [a, b] of LINKS) { if (a === w) add(b); else if (b === w) add(a); }
  for (const fam of families()) if (fam.some((x) => x.toLowerCase() === w)) fam.forEach(add);
  return out.slice(0, limit);
}

export const LINK_WORDS: string[] = LINKS.flat();
