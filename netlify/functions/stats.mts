// The usage totals, for the site owner only. Answers to the owner's token (the header x-nenya-owner; only the
// token's SHA-256 is in COACH_OWNER_TOKEN_HASH) or to a signed-in Netlify Identity user with the Owner role. It returns plain daily totals (see src/lib/counters.ts): numbers by
// event name and day, and nothing else. A wrong or missing token gets the same bare 401, whatever the reason.
import { getStore } from '@netlify/blobs';
import { ALL_EVENTS, readRange, recentDays, type RangeStore } from '../../src/lib/counters.ts';
import { capDay } from '../../src/lib/dailyCap.ts';
import { getUser } from '@netlify/identity';
import { tokenMatches } from '../../src/lib/ownerAuth.ts';
import { hasOwnerRole } from '../../src/lib/ownerAccess.ts';
import { storeNameFrom } from '../../src/lib/originHosts.ts';

const ROUTE = '/api/stats';

// Tests give the function a fake store; in production this is always the Netlify store.
let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s as ReturnType<typeof getStore> | null;
};
const privateStore = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

// Tests give the function a fixed answer for "who is signed in"; in production this asks Netlify Identity.
let userOverride: (() => Promise<{ roles?: string[] } | null>) | null = null;
export const __useUserForTests = (f: (() => Promise<{ roles?: string[] } | null>) | null): void => {
  userOverride = f;
};
const signedInUser = async () => {
  try {
    return await (userOverride ?? getUser)();
  } catch {
    return null;
  }
};

// The owner token in the header, or a signed-in Identity user with the Owner role. Anything else is the same bare 401.
const allowed = async (req: Request): Promise<boolean> => {
  if (tokenMatches(req.headers.get('x-nenya-owner'), process.env.COACH_OWNER_TOKEN_HASH)) return true;
  return hasOwnerRole(await signedInUser());
};

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method !== 'GET') return json(405, { error: 'method' });
  if (!(await allowed(req))) return json(401, { error: 'no' });

  const asked = Number.parseInt(url.searchParams.get('days') ?? '', 10);
  const n = Math.min(60, Math.max(1, Number.isFinite(asked) ? asked : 30));
  const days = recentDays(n);
  try {
    const store = privateStore() as unknown as RangeStore;
    const counts = await readRange(store, days);
    // The site-wide running count holds only today's number (it starts again each day).
    let todayTurns: number | undefined;
    try {
      const cur = await store.getWithMetadata('daily-count', { type: 'text' });
      const [d, c] = (cur?.data ?? '').split(':');
      if (d === capDay()) todayTurns = Number(c) || 0;
    } catch {
      /* not shown */
    }
    // Receipt counts are kept per signing key, so the keys that appear are added to the list.
    const extra = [...new Set(Object.values(counts).flatMap((c) => Object.keys(c)))].filter((e) => !ALL_EVENTS.includes(e)).sort();
    return json(200, { generatedAt: new Date().toISOString(), days, events: [...ALL_EVENTS, ...extra], counts, todayTurns });
  } catch {
    return json(502, { error: 'store' });
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. Keep `path` in step with ROUTE above.
export const config = {
  path: '/api/stats',
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
