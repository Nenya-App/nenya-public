// The owner's view of reports and messages (admin page): list them with their text and dates, and delete one. Owner only (src/lib/ownerGate.ts): the owner
// token or a signed-in Identity user with the Owner role. Nothing is logged.
import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { ownerAllowed } from '../../src/lib/ownerGate.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { PREFIX, type SubmissionRecord } from '../../src/lib/submissions.ts';

let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
};
let userOverride: (() => Promise<{ roles?: unknown } | null>) | null = null;
export const __useUserForTests = (f: (() => Promise<{ roles?: unknown } | null>) | null): void => {
  userOverride = f;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;
const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  if (!(await ownerAllowed(req, (userOverride ?? getUser) as () => Promise<{ roles?: unknown } | null>))) return json(401, { error: 'no' });
  const st = store();
  if (req.method === 'GET') {
    const { blobs } = await st.list({ prefix: PREFIX });
    const items: (SubmissionRecord & { id: string })[] = [];
    for (const b of blobs) {
      const rec = (await st.get(b.key, { type: 'json' })) as SubmissionRecord | null;
      if (rec) items.push({ id: b.key.slice(PREFIX.length), ...rec });
    }
    items.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    return json(200, { items });
  }
  if (req.method === 'POST') {
    let body: { delete?: unknown };
    try {
      body = await req.json();
    } catch {
      return json(400, { error: 'json' });
    }
    if (typeof body.delete !== 'string' || !/^[0-9a-f]{64}$/.test(body.delete)) return json(400, { error: 'id' });
    await st.delete(`${PREFIX}${body.delete}`);
    try {
      await addCount(st as unknown as CounterStore, 'submission.deleted.owner');
    } catch {
      /* the deletion is what matters */
    }
    return json(200, { deleted: true });
  }
  return json(405, { error: 'method' });
};

export const config = { path: '/api/submissions' };
