// The owner's side of the "witnessed conversations" page: the by-hand review every public copy must pass. Owner only (the same gate as the numbers).
//   {action:'list'}                       the waiting conversations, each with an automatic anonymized DRAFT to start from
//   {action:'approve', hash, items}       the reviewer's final text; refused if it is the wrong shape or the scrubber would still replace something
//   {action:'reject', hash}               do not show it (its waiting copy is deleted; the person's other choices stand)
// Approving writes the reviewed copy to the store the public page reads, and deletes the signed original from the waiting store (it is no longer needed).
import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import { ownerAllowed } from '../../src/lib/ownerGate.ts';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { anonymize, reviewProblem, stopLevelFlagged, type PublicItem } from '../../src/lib/publicCopy.ts';
import { HASH, pendingKey, publicKey, publicUntilFor, recordKey, dueForDeletion, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';
import type { Receipt, SignedTranscript } from '../../src/lib/transcript.ts';

const ROUTE = '/api/witnessed-review';
let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
let userOverride: (() => Promise<{ roles?: unknown } | null>) | null = null;
export const __useUserForTests = (f: (() => Promise<{ roles?: unknown } | null>) | null): void => { userOverride = f; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));
const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  if (new URL(req.url).pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!(await ownerAllowed(req, (userOverride ?? getUser) as () => Promise<{ roles?: unknown } | null>))) return json(401, { error: 'no' });
  let body: { action?: unknown; hash?: unknown; items?: unknown };
  try { body = await req.json(); } catch { return json(400, { error: 'json' }); }
  const s = store();
  const now = new Date();
  try {
    if (body.action === 'list') {
      const { blobs } = await s.list({ prefix: 'witnessed/' });
      const out = [];
      for (const { key } of blobs) {
        const hash = key.slice('witnessed/'.length);
        const rec = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null;
        const pending = (await s.get(key, { type: 'json' })) as { transcript: SignedTranscript; receipt: Receipt; portions: 'all' | number[] } | null;
        if (!rec || rec.status !== 'active' || rec.publication !== 'pending-review' || !pending) continue;
        if (stopLevelFlagged(pending.transcript)) continue; // cannot happen through /api/report, but is never shown if it somehow did
        out.push({ hash, receivedAt: rec.receivedAt, draft: anonymize(pending.transcript, pending.portions) });
      }
      return json(200, { pending: out });
    }
    // Deletions software could not finish: the transcript is due to go (its time passed, or the person asked), but the stored submission could not be deleted
    // automatically, and the notification email always needs a hand. The owner does those by hand, then marks them done here.
    if (body.action === 'deletions') {
      const { blobs } = await s.list({ prefix: 'transcript/' });
      const waiting = [];
      for (const { key } of blobs) {
        const r = (await s.get(key, { type: 'json' })) as TranscriptRecord | null;
        if (r && dueForDeletion(r, now)) waiting.push({ hash: r.hash, receivedAt: r.receivedAt, status: r.status, keepUntil: r.keepUntil, submissionId: r.submissionId ?? null, todo: ['delete the stored submission in Netlify (Forms, verified-transcript)', 'delete the notification email copy'] });
      }
      return json(200, { waiting });
    }
    const hash = typeof body.hash === 'string' ? body.hash : '';
    if (!HASH.test(hash)) return json(400, { error: 'hash' });
    if (body.action === 'mark-deleted') {
      const r = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null;
      if (!r || !dueForDeletion(r, now)) return json(404, { error: 'not due' });
      await s.delete(pendingKey(hash)); await s.delete(publicKey(hash));
      await s.setJSON(recordKey(hash), { hash: r.hash, receivedAt: r.receivedAt, uses: [], keep: r.keep, keepUntil: r.keepUntil, status: 'deleted', publication: 'none', updatedAt: now.toISOString() } satisfies TranscriptRecord);
      return json(200, { status: 'deleted' });
    }
    const rec = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null;
    if (!rec || rec.status !== 'active' || rec.publication !== 'pending-review') return json(404, { error: 'not waiting' });
    if (body.action === 'reject') {
      await s.setJSON(recordKey(hash), { ...rec, publication: 'withdrawn', updatedAt: now.toISOString() });
      await s.delete(pendingKey(hash));
      return json(200, { publication: 'withdrawn' });
    }
    if (body.action === 'approve') {
      const why = reviewProblem(body.items);
      if (why) return json(422, { error: why });
      const items = (body.items as PublicItem[]).map((x) => ({ by: x.by, text: x.text }));
      await s.setJSON(publicKey(hash), { items, approvedAt: now.toISOString() });
      await s.setJSON(recordKey(hash), { ...rec, publication: 'public', publicUntil: publicUntilFor(rec.showFor, now), updatedAt: now.toISOString() });
      await s.delete(pendingKey(hash)); // the signed original is not needed any more
      return json(200, { publication: 'public' });
    }
    return json(400, { error: 'action' });
  } catch {
    return json(503, { error: 'store' });
  }
};

export const config = { path: '/api/witnessed-review' };
