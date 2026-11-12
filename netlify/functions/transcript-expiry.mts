// Runs once a day. Deletes what is due: a transcript whose keeping time has passed, or one whose owner asked for deletion with the signed file
// (docs/transcript-consent-scope.md). For each: the copy in the inbox, any waiting copy and any public copy are deleted from the site's own private store, and the
// record becomes a "deleted" marker holding only the fingerprint and the date. Nothing here needs an account token: the store is the site's own. A public copy whose
// own showing time has ended comes down first, even while the transcript itself is still kept. If a deletion fails (the store is unreachable), the record stays "due",
// is counted, and is listed for the owner and tried again the next day.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import { removeOverlap } from '../../src/lib/overlap.ts';
import { dueForDeletion, inboxKey, pendingKey, publicExpired, publicKey, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

/** Deletes every copy of one transcript and leaves the marker. Returns true if every deletion went through. */
export async function deleteEverything(s: ReturnType<typeof getStore>, rec: TranscriptRecord, now: Date): Promise<boolean> {
  try {
    await s.delete(inboxKey(rec.hash));
    await s.delete(pendingKey(rec.hash));
    await s.delete(publicKey(rec.hash));
    await removeOverlap(s, rec.hash); // the codes that flag overlaps go with the submission
    await s.setJSON(`transcript/${rec.hash}`, { hash: rec.hash, receivedAt: rec.receivedAt, uses: [], keep: rec.keep, keepUntil: rec.keepUntil, status: 'deleted', publication: 'none', updatedAt: now.toISOString() } satisfies TranscriptRecord);
    return true;
  } catch {
    return false;
  }
}

export async function expireDue(now: Date): Promise<{ deleted: number; manual: number }> {
  const s = store();
  const counter = s as unknown as Parameters<typeof addCount>[0];
  const { blobs } = await s.list({ prefix: 'transcript/' });
  let deleted = 0, manual = 0;
  for (const { key } of blobs) {
    const rec = (await s.get(key, { type: 'json' })) as TranscriptRecord | null;
    if (!rec) continue;
    // A public copy that has been up as long as its owner allowed comes down now, even though the transcript itself may still be kept.
    if (publicExpired(rec, now) && !dueForDeletion(rec, now)) {
      try { await s.delete(publicKey(rec.hash)); await s.setJSON(key, { ...rec, publication: 'withdrawn', updatedAt: now.toISOString() }); } catch { /* tried again tomorrow */ }
      continue;
    }
    if (!dueForDeletion(rec, now)) continue;
    if (await deleteEverything(s, rec, now)) deleted++;
    else manual++;
  }
  try { if (deleted) await addCount(counter, 'transcript.deleted'); if (manual) await addCount(counter, 'transcript.needs-manual-deletion'); } catch { /* counts are a convenience */ }
  return { deleted, manual };
}

export default async (): Promise<Response> => {
  const r = await expireDue(new Date());
  return new Response(JSON.stringify(r), { status: 200, headers: { 'Cache-Control': 'no-store' } });
};

export const config = { schedule: '@daily' };
