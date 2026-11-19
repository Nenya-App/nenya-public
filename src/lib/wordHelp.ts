// Word help for "a word of your own" (docs/word-help-scope.md; owner, 2026-11-17 and 2026-11-18): near words to pick from, and, per press, a look-up through an outside dictionary and thesaurus.
//  1. On the device (nothing is sent): near words from the lens's own lists (the group the word sits in) and a small hand-made list of related words below.
//  2. Per press, optional (VITE_WORD_HELP; the server has its own switch WORD_HELP_ENABLED): ONE word goes through our server to Datamuse (related words) and the Free Dictionary API (a meaning).
//     The button says exactly what is sent. English only for now: the structure carries a language (WORD_HELP_LANGS), and other languages come from real translators, not from a machine.
import { SENSE_WORDS, type SenseCategory } from './senseWords.ts';

export const wordHelpOn = (): boolean => import.meta.env?.VITE_WORD_HELP === 'on';
/** Languages the look-up may be asked in. English only until real translators have reviewed another (owner, 2026-11-17). */
export const WORD_HELP_LANGS = ['en'] as const;

/** One word, as typed: letters, a hyphen or an apostrophe, 2 to 24 characters, no spaces. Anything else is not looked up. */
export function cleanLookupWord(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const w = raw.trim().toLowerCase();
  return /^[a-z][a-z'-]{1,23}$/.test(w) ? w : null;
}

// A small, hand-made list of related words (grade 5 to 8 words), by plain families. Not a dictionary: a nudge toward a nearby word.
const FAMILIES: string[][] = [
  ['tired', 'worn', 'weary', 'drained', 'heavy', 'sleepy', 'spent'],
  ['calm', 'still', 'quiet', 'peaceful', 'settled', 'gentle', 'easy'],
  ['sad', 'low', 'blue', 'down', 'tearful', 'sorrowful', 'heavy'],
  ['happy', 'glad', 'bright', 'light', 'joyful', 'cheerful', 'warm'],
  ['angry', 'sharp', 'hot', 'fierce', 'cross', 'bitter', 'stormy'],
  ['afraid', 'tense', 'tight', 'nervous', 'uneasy', 'anxious', 'shaky'],
  ['soft', 'smooth', 'silky', 'gentle', 'velvety', 'downy', 'fluffy'],
  ['rough', 'coarse', 'scratchy', 'bumpy', 'gritty', 'prickly', 'uneven'],
  ['cold', 'cool', 'chilly', 'icy', 'frosty', 'crisp', 'fresh'],
  ['warm', 'cosy', 'toasty', 'glowing', 'mellow', 'heated', 'snug'],
  ['fast', 'quick', 'rushing', 'racing', 'darting', 'swift', 'hurried'],
  ['slow', 'easy', 'steady', 'drifting', 'lingering', 'unhurried', 'creeping'],
  ['loud', 'booming', 'ringing', 'sharp', 'bold', 'strong', 'blaring'],
  ['quiet', 'hushed', 'faint', 'muted', 'low', 'whispering', 'soft'],
  ['sweet', 'sugary', 'honeyed', 'ripe', 'mellow', 'syrupy', 'candied'],
  ['sour', 'tart', 'tangy', 'sharp', 'zesty', 'puckering', 'acidic'],
  ['bitter', 'dark', 'harsh', 'sharp', 'burnt', 'strong', 'acrid'],
  ['smooth', 'even', 'flowing', 'sleek', 'glassy', 'flat', 'silky'],
  ['tangled', 'knotted', 'twisted', 'snarled', 'jumbled', 'messy', 'looped'],
  ['bright', 'shining', 'glowing', 'vivid', 'sparkling', 'luminous', 'clear'],
  ['dark', 'dim', 'shadowy', 'murky', 'deep', 'dusky', 'unlit'],
  ['clear', 'plain', 'sharp', 'open', 'sure', 'bright', 'obvious'],
  ['foggy', 'hazy', 'blurry', 'misty', 'cloudy', 'dim', 'unclear'],
  ['rising', 'climbing', 'lifting', 'floating', 'swelling', 'upward', 'growing'],
  ['falling', 'sinking', 'dropping', 'settling', 'sliding', 'downward', 'fading'],
  ['spinning', 'turning', 'circling', 'whirling', 'swirling', 'looping', 'rolling'],
  ['stuck', 'held', 'caught', 'frozen', 'stalled', 'jammed', 'fixed'],
  ['flowing', 'streaming', 'gliding', 'running', 'pouring', 'drifting', 'rippling'],
  ['heavy', 'weighty', 'dense', 'thick', 'leaden', 'sinking', 'laden'],
  ['light', 'airy', 'floating', 'weightless', 'thin', 'feathery', 'buoyant'],
];

/** Near words for a typed word, from the device only: related words from the hand-made list, then the words sitting in the same group of this lens's own lists. At most `limit`, never the word itself. */
export function localNearWords(word: string, category?: SenseCategory, limit = 12): string[] {
  const w = word.trim().toLowerCase();
  if (!w) return [];
  const out: string[] = [];
  const add = (x: string) => { const t = x.toLowerCase(); if (t !== w && !out.includes(t)) out.push(t); };
  for (const f of FAMILIES) if (f.includes(w)) f.forEach(add);
  const cats: SenseCategory[] = category ? [category] : (Object.keys(SENSE_WORDS) as SenseCategory[]);
  for (const c of cats) for (const g of SENSE_WORDS[c]) {
    const terms = g.words.map((x) => x.term.toLowerCase());
    if (terms.includes(w) || terms.some((t) => t.startsWith(w) || w.startsWith(t))) terms.forEach(add);
  }
  return out.slice(0, limit);
}

/** What the look-up answers: related words and, when there is one, the first meaning. Anything else the services sent is dropped. */
export interface LookupResult { words: string[]; meaning: string | null; sources: string[] }
export function parseDatamuse(json: unknown, limit = 12): string[] {
  if (!Array.isArray(json)) return [];
  return json.map((x) => (x && typeof x === 'object' ? (x as { word?: unknown }).word : null)).filter((w): w is string => typeof w === 'string' && /^[a-z][a-z' -]{1,30}$/i.test(w)).slice(0, limit);
}
export function parseDictionary(json: unknown): string | null {
  const first = Array.isArray(json) ? (json[0] as { meanings?: { partOfSpeech?: unknown; definitions?: { definition?: unknown }[] }[] } | undefined) : undefined;
  const m = first?.meanings?.[0];
  const d = m?.definitions?.[0]?.definition;
  if (typeof d !== 'string' || !d) return null;
  const pos = typeof m?.partOfSpeech === 'string' ? `${m.partOfSpeech}: ` : '';
  return `${pos}${d}`.slice(0, 240);
}

/** The words on the page. Drafts for the owner's edit. */
export const WORD_HELP_COPY = {
  summary: 'Word help',
  field: 'A word to look up',
  near: 'Near words on this device',
  nearNote: 'Nothing is sent. These come from this site’s own word lists.',
  lookup: 'Look it up online',
  sends: (w: string) => `Pressing this sends the one word “${w}”, and nothing else, through our server to Datamuse (related words) and the Free Dictionary API (a meaning). Neither sees who you are. Nothing is kept.`,
  none: 'No near words found. Try another word, or use your own.',
  failed: 'The look-up could not be reached just now. The near words on this device still work.',
} as const;
