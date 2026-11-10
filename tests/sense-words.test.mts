// The word lists in the sensory gateways (src/lib/senseWords.ts): complete, described, and free of duplicates and of claims.
import { SENSE_WORDS, ORIGINAL_WORDS, wordsOf, senseDescription, type SenseCategory } from '../src/lib/senseWords.ts';
import { ok } from './helpers.mts';

const cats = Object.keys(SENSE_WORDS) as SenseCategory[];
ok('there are nine lists', cats.length === 9);
for (const c of cats) {
  const words = wordsOf(c);
  const lower = words.map((w) => w.toLowerCase());
  ok(`${c}: no word appears twice`, new Set(lower).size === lower.length, lower.filter((w, i) => lower.indexOf(w) !== i).join(', '));
  ok(`${c}: every original word is still there`, ORIGINAL_WORDS[c].every((w) => words.includes(w)), ORIGINAL_WORDS[c].filter((w) => !words.includes(w)).join(', '));
  const undescribed = words.filter((w) => !ORIGINAL_WORDS[c].includes(w) && !senseDescription(c, w));
  ok(`${c}: every new word has a description`, undescribed.length === 0, undescribed.join(', '));
  const described = SENSE_WORDS[c].flatMap((g) => g.words).filter((w) => w.description);
  ok(`${c}: descriptions are short, plain sentences`, described.every((w) => w.description!.length >= 20 && w.description!.length <= 200 && /[.]$/.test(w.description!)), described.filter((w) => w.description!.length > 200 || !/[.]$/.test(w.description!)).map((w) => w.term).join(', '));
  ok(`${c}: groups have names and words`, SENSE_WORDS[c].every((g) => g.label && g.words.length > 0));
}
const all = cats.flatMap((c) => SENSE_WORDS[c].flatMap((g) => g.words.filter((w) => w.description).map((w) => `${w.term}: ${w.description}`))).join('\n');
ok('descriptions make no medical or fixed-meaning claims', !/\b(?:diagnos|disorder|trauma|therapy|treat(?:s|ment)|cure|symptom|means that you|always means|proves)\b/i.test(all));
ok('the lists are much larger than they were', wordsOf('scent').length >= 60 && wordsOf('quality').length >= 40 && wordsOf('lightQuality').length >= 30 && cats.every((c) => wordsOf(c).length >= 25));
