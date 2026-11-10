// Runs once a day. Deletes what is due: a transcript whose keeping time has passed, or one whose owner asked for deletion with the signed file
// (docs/transcript-consent-scope.md). For each: the waiting or public copy is removed, the stored form submission is deleted through Netlify's API (it needs
// NETLIFY_API_TOKEN, set by the owner), and the record becomes a "deleted" marker holding only the fingerprint and the date. If the submission cannot be
// deleted automatically (no token, or its id was never recorded), the record stays "due" and is counted, so the owner knows to delete it by hand.
// What it cannot do: remove the copy in the notification email, or anything someone else copied.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import { dueForDeletion, pendingKey, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

export async function expireDue(now: Date, env: Record<string, string | undefined>, fetchFn: typeof fetch = fetch): Promise<{ deleted: number; manual: number }> {
  const s = store();
  const counter = s as unknown as Parameters<typeof addCount>[0];
  const { blobs } = await s.list({ prefix: 'transcript/' });
  let deleted = 0, manual = 0;
  for (const { key } of blobs) {
    const rec = (await s.get(key, { type: 'json' })) as TranscriptRecord | null;
    if (!rec || !dueForDeletion(rec, now)) continue;
    try { await s.delete(pendingKey(rec.hash)); } catch { /* may not exist */ }
    let gone = false;
    if (rec.submissionId && env.NETLIFY_API_TOKEN) {
      try {
        const res = await fetchFn(`https://api.netlify.com/api/v1/submissions/${encodeURIComponent(rec.submissionId)}`, { method: 'DELETE', headers: { authorization: `Bearer ${env.NETLIFY_API_TOKEN}` } });
        gone = res.ok || res.status === 404; // already gone is fine
      } catch { gone = false; }
    }
    if (gone) {
      await s.setJSON(key, { hash: rec.hash, receivedAt: rec.receivedAt, uses: [], keep: rec.keep, keepUntil: rec.keepUntil, status: 'deleted', publication: 'none', updatedAt: now.toISOString() } satisfies TranscriptRecord);
      deleted++;
    } else {
      manual++;
    }
  }
  try { if (deleted) await addCount(counter, 'transcript.deleted'); if (manual) await addCount(counter, 'transcript.needs-manual-deletion'); } catch { /* counts are a convenience */ }
  return { deleted, manual };
}

export default async (): Promise<Response> => {
  const r = await expireDue(new Date(), process.env);
  return new Response(JSON.stringify(r), { status: 200, headers: { 'Cache-Control': 'no-store' } });
};

export const config = { schedule: '@daily' };
