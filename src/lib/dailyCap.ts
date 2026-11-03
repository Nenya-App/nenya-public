// A single anonymous counter: how many conversations were started today. It holds no
// visitor data at all, only "<date>:<count>", and is the brake on the Venice bill.
// Only a conversation's first exchange is counted, so ones already under way finish.

/** The slice of a Netlify Blobs store this needs, so it can be tested with a fake. */
export interface CounterStore {
  getWithMetadata(key: string, opts: { type: 'text' }): Promise<{ data: string; etag?: string } | null>;
  set(key: string, value: string, opts: { onlyIfNew: true } | { onlyIfMatch: string }): Promise<{ modified: boolean }>;
}

export const DEFAULT_DAILY_CAP = 100;
const KEY = 'daily-count';
const ATTEMPTS = 8;

/** Today's date in Minnesota, where the day is meant to turn over. */
export const capDay = (now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(now);

/** Cap from the COACH_DAILY_CAP variable when it is a positive whole number, else the default. */
export const capFromEnv = (raw: string | undefined): number => {
  const n = Number(raw);
  return raw && Number.isInteger(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
};

/**
 * Takes one slot if any are left today. Returns false only when the cap is reached.
 * Conditional writes keep two simultaneous requests from taking the same slot, and a burst that
 * keeps colliding is refused. If the store itself fails, the visitor is let through, because an
 * outage here should not lock people out of a breathing tool.
 */
export async function claimConversationSlot(store: CounterStore, cap: number, now = new Date()): Promise<boolean> {
  const day = capDay(now);
  try {
    for (let i = 0; i < ATTEMPTS; i++) {
      const cur = await store.getWithMetadata(KEY, { type: 'text' });
      const [d, c] = (cur?.data ?? '').split(':');
      const count = d === day ? Number(c) || 0 : 0;
      if (count >= cap) return false;
      const value = `${day}:${count + 1}`;
      const res = cur?.etag
        ? await store.set(KEY, value, { onlyIfMatch: cur.etag })
        : await store.set(KEY, value, { onlyIfNew: true });
      if (res.modified) return true;
    }
    // Still losing the race after several tries means a burst of simultaneous starts, which is
    // the pattern the cap exists for. Refuse; a real visitor can try again in a moment.
    return false;
  } catch {
    return true;
  }
}
