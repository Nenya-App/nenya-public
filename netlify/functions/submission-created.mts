// Netlify calls this when a form submission is verified. For the verified-transcript form it records the stored submission's id on the transcript's record,
// so the daily job can delete the submission later. Unverified against Netlify's current event-function format: if the id is never recorded, deletion falls
// back to the owner doing it by hand (the daily job counts how many are waiting).
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { HASH, recordKey, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

export default async (req: Request): Promise<Response> => {
  let payload: { id?: string; form_name?: string; data?: Record<string, string> } | undefined;
  try { payload = ((await req.json()) as { payload?: typeof payload }).payload; } catch { return new Response(null, { status: 204 }); }
  if (!payload || payload.form_name !== 'verified-transcript' || !payload.id) return new Response(null, { status: 204 });
  const hash = payload.data?.['receipt-hash'] ?? '';
  if (!HASH.test(hash)) return new Response(null, { status: 204 });
  try {
    const s = store();
    const rec = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null;
    if (rec && rec.status !== 'deleted') await s.setJSON(recordKey(hash), { ...rec, submissionId: payload.id });
  } catch { /* the daily job will count it as needing a hand */ }
  return new Response(null, { status: 204 });
};
