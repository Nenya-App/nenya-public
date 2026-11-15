// What the public "witnessed conversations" page reads: only copies a person has reviewed and approved, whose owner has not taken them back, and whose keeping
// time has not passed (isPublic). Never cached, so a withdrawal takes effect at once. Shows a short fingerprint and the month, not the exact date, no colors.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { isPublic, publicKey, recordKey, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));
const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  if (new URL(req.url).pathname !== '/api/witnessed') return json(404, { error: 'not found' });
  if (req.method !== 'GET') return json(405, { error: 'method' });
  const now = new Date();
  try {
    const s = store();
    const { blobs } = await s.list({ prefix: 'public/' });
    const conversations = [];
    for (const { key } of blobs) {
      const hash = key.slice('public/'.length);
      const rec = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null;
      if (!rec || !isPublic(rec, now)) continue;
      const copy = (await s.get(publicKey(hash), { type: 'json' })) as { items: { by: string; text: string }[]; approvedAt: string } | null;
      if (!copy) continue;
      conversations.push({ fingerprint: hash.slice(0, 12), month: copy.approvedAt.slice(0, 7), items: copy.items });
    }
    conversations.sort((a, b) => (a.month < b.month ? 1 : -1));
    return json(200, { conversations });
  } catch {
    return json(503, { error: 'store' });
  }
};

export const config = { path: '/api/witnessed' };
