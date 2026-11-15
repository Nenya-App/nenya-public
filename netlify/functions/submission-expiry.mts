// Runs once a day: deletes every report and message whose 90 days have passed (src/lib/submissions.ts), as the Terms promise. It reads only each record's
// keeping date. If the store cannot be reached, nothing is lost: the same records are due tomorrow.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { PREFIX, isDue } from '../../src/lib/submissions.ts';

let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;

export async function expireSubmissions(now = new Date()): Promise<number> {
  const st = store();
  const { blobs } = await st.list({ prefix: PREFIX });
  let n = 0;
  for (const b of blobs) {
    // An unreadable record has no keeping date it can prove, so it is deleted like an expired one.
    let rec: { keepUntil?: unknown } | null = null;
    try {
      rec = (await st.get(b.key, { type: 'json' })) as { keepUntil?: unknown } | null;
    } catch {
      rec = null;
    }
    if (isDue(rec, now)) {
      await st.delete(b.key);
      n++;
      try {
        await addCount(st as unknown as CounterStore, 'submission.deleted.expired', now);
      } catch {
        /* the deletion is what matters */
      }
    }
  }
  return n;
}

export default async (): Promise<Response> => {
  try {
    const n = await expireSubmissions();
    console.log(`submission-expiry: deleted ${n} submission(s) past 90 days`);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(`submission-expiry: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

export const config = { schedule: '@daily' };
