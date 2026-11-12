export interface OverlapMsg { role: string; content: string }

export const normalizeForOverlap = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

// Near-duplicates, for the owner's page (docs/transcript-consent-scope.md, "Overlapping submissions") (runs in the owner's browser over transcripts already held; it only flags).
// Compares the person's own words as overlapping runs of SHINGLE words, so a message pasted with small edits still shows up.

export const SHINGLE = 6;
export const NEAR_MIN_SHARED = 2;

const shingles = (text: string): Set<string> => {
  const w = normalizeForOverlap(text).replace(/[^\p{L}\p{N}' ]+/gu, ' ').split(' ').filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + SHINGLE <= w.length; i++) out.add(w.slice(i, i + SHINGLE).join(' '));
  return out;
};

export interface NearPair { a: string; b: string; shared: number }

/** Pairs of submissions whose person-written messages share at least NEAR_MIN_SHARED runs of words. Possible duplicates only. */
export function nearDuplicates(items: { hash: string; messages: OverlapMsg[] }[]): NearPair[] {
  const sets = items.map((x) => ({ hash: x.hash, s: shingles(x.messages.filter((m) => m.role === 'user').map((m) => m.content).join(' \n ')) }));
  const out: NearPair[] = [];
  for (let i = 0; i < sets.length; i++)
    for (let j = i + 1; j < sets.length; j++) {
      let shared = 0;
      for (const sh of sets[i].s) if (sets[j].s.has(sh)) shared++;
      if (shared >= NEAR_MIN_SHARED) out.push({ a: sets[i].hash, b: sets[j].hash, shared });
    }
  return out.sort((x, y) => y.shared - x.shared);
}
