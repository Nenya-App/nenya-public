// Reads the private list from the site's private storage at run time (it is never in the repository or the bundle), compiles it once, and keeps it for a few
// minutes. Returns null if there is no list, which simply means no cards are offered for language found in the text. The list is uploaded with
// scripts/upload-private-list.mts.
import { loadLexicon } from './lexiconLoader.ts';
import type { Matcher } from './lexicon.ts';

export const LEXICON_KEY = 'lexicon/en/current';
const KEEP_MS = 5 * 60 * 1000;
let cached: { at: number; matcher: Matcher | null } | null = null;

export async function getMatcher(store: { get(key: string, opts: { type: 'text' }): Promise<string | null> }, now = Date.now()): Promise<Matcher | null> {
  if (cached && now - cached.at < KEEP_MS) return cached.matcher;
  let matcher: Matcher | null = null;
  try {
    const csv = await store.get(LEXICON_KEY, { type: 'text' });
    if (csv) matcher = loadLexicon(csv).matcher;
  } catch {
    matcher = null;
  }
  cached = { at: now, matcher };
  return matcher;
}
export const __forgetLexiconForTests = (): void => { cached = null; };
