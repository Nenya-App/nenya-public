// Runs once a day: deletes every report and message (and every partner-practice report) whose 90 days have passed (src/lib/submissions.ts), as the Terms promise. It reads only each record's
// keeping date. If the store cannot be reached, nothing is lost: the same records are due tomorrow.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { CELL_REPORT_PREFIX, DUP_PREFIX, PREFIX, cellReportDue, isDue } from '../../src/lib/submissions.ts';

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
    let rec: { keepUntil?: unknown; dup?: unknown } | null = null;
    try {
      rec = (await st.get(b.key, { type: 'json' })) as { keepUntil?: unknown; dup?: unknown } | null;
    } catch {
      rec = null;
    }
    if (isDue(rec, now)) {
      await st.delete(b.key);
      if (rec && typeof rec.dup === 'string' && rec.dup.startsWith(DUP_PREFIX)) await st.delete(rec.dup);
      n++;
      try {
        await addCount(st as unknown as CounterStore, 'submission.deleted.expired', now);
      } catch {
        /* the deletion is what matters */
      }
    }
  }
  // Duplicate markers (src/lib/submissions.ts): any that has reached its date, or whose submission is gone (however it went), is deleted too, so a marker never outlives
  // the submission it guards.
  const { blobs: markers } = await st.list({ prefix: DUP_PREFIX });
  for (const m of markers) {
    let mark: { keepUntil?: unknown; sub?: unknown } | null = null;
    try {
      mark = (await st.get(m.key, { type: 'json' })) as { keepUntil?: unknown; sub?: unknown } | null;
    } catch {
      mark = null;
    }
    const orphan = !mark || typeof mark.sub !== 'string' || (await st.get(mark.sub)) === null;
    if (orphan || isDue(mark, now)) await st.delete(m.key);
  }
  return n;
}

/** Partner-practice reports (cell-report/<id>) are deleted 90 days after they were filed. The "reports kept" total (cell.report.verified) is a plain count of reports received and is not lowered. */
export async function expireCellReports(now = new Date()): Promise<number> {
  const st = store();
  const { blobs } = await st.list({ prefix: CELL_REPORT_PREFIX });
  let n = 0;
  for (const b of blobs) {
    let rec: { keepUntil?: unknown; receivedAt?: unknown } | null = null;
    try {
      rec = (await st.get(b.key, { type: 'json' })) as { keepUntil?: unknown; receivedAt?: unknown } | null;
    } catch {
      rec = null;
    }
    if (cellReportDue(rec, now)) {
      await st.delete(b.key);
      n++;
    }
  }
  return n;
}

export default async (): Promise<Response> => {
  try {
    const n = await expireSubmissions();
    console.log(`submission-expiry: deleted ${n} submission(s) past 90 days`);
    const c = await expireCellReports();
    console.log(`submission-expiry: deleted ${c} partner-practice report(s) past 90 days`);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(`submission-expiry: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

export const config = { schedule: '@daily' };
