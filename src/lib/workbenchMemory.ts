// "Remember on this device" for the phrase workbench (docs/phrase-workbench-scope.md, section 4). Off by default and the person's own switch, separate from the site's
// settings switch. What is kept: the latest sentence, its marks and their levels, in one record. Not kept: a time, a count, a history of sentences, an identifier.
// Never sent anywhere. Forget removes it; "Forget me" and Emergency Exit remove every key that starts with "nenya" (deviceMemory.ts), and this key does.

import { parse, serialize, type Workbench } from './phraseWorkbench.ts';

export const PHRASES_KEY = 'nenya.phrases';

const read = (): string | null => { try { return localStorage.getItem(PHRASES_KEY); } catch { return null; } };

/** Whether this device holds a kept sentence. */
export const phrasesKept = (): boolean => read() !== null;

/** Keep the latest sentence and marks, replacing what was kept. Returns false (and keeps nothing) if the record is too large or storage is blocked. */
export function keepPhrases(w: Workbench): boolean {
  const rec = serialize(w);
  try {
    if (rec === null) { localStorage.removeItem(PHRASES_KEY); return false; }
    localStorage.setItem(PHRASES_KEY, rec);
    return true;
  } catch { return false; }
}

/** What was kept, validated, or null. */
export function loadPhrases(): Workbench | null {
  const raw = read();
  return raw === null ? null : parse(raw);
}

export function forgetPhrases(): void {
  try { localStorage.removeItem(PHRASES_KEY); } catch { /* nothing to remove */ }
}
