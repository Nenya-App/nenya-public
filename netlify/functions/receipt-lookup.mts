// For the site owner only: asks whether a signed transcript's receipt hash is in the 30-day log of receipts this site issued
// (see src/lib/receiptLog.ts). The page sends only the 64-character hash, never the conversation, and gets back the day it
// was logged or nothing. Same gate as the numbers (see src/lib/ownerGate.ts); a wrong or missing credential is a bare 401.
import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import { ownerAllowed } from '../../src/lib/ownerGate.ts';
import { findReceipt, RECEIPT_KEEP_DAYS, type ReceiptListStore } from '../../src/lib/receiptLog.ts';
import { storeNameFrom } from '../../src/lib/originHosts.ts';

const ROUTE = '/api/receipt';
const HASH = /^[0-9a-f]{64}$/;

// Tests give the function a fake store and a stand-in for "who is signed in"; in production these are Netlify's.
let storeOverride: ReceiptListStore | null = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s as ReceiptListStore | null;
};
let userOverride: (() => Promise<{ roles?: unknown } | null>) | null = null;
export const __useUserForTests = (f: (() => Promise<{ roles?: unknown } | null>) | null): void => {
  userOverride = f;
};
const privateStore = (): ReceiptListStore => storeOverride ?? (getStore(storeNameFrom(process.env.COACH_STORE_NAME)) as unknown as ReceiptListStore);

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!(await ownerAllowed(req, (userOverride ?? getUser) as () => Promise<{ roles?: unknown } | null>))) return json(401, { error: 'no' });

  let hash = '';
  try {
    const body = (await req.json()) as { hash?: unknown };
    hash = typeof body.hash === 'string' ? body.hash.trim().toLowerCase() : '';
  } catch {
    hash = '';
  }
  if (!HASH.test(hash)) return json(400, { error: 'hash' });
  try {
    const day = await findReceipt(privateStore(), hash);
    return json(200, { recorded: day !== null, day, keptDays: RECEIPT_KEEP_DAYS });
  } catch {
    return json(502, { error: 'store' });
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. Keep `path` in step with ROUTE above.
export const config = {
  path: '/api/receipt',
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
