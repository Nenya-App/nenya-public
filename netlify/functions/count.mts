// Counts how the site is used, as plain daily totals (see src/lib/counters.ts and docs/site-metrics-scope.md).
// It reads the event names from the request and nothing else: not the visitor's address, browser, referrer or cookies, and
// it sets no cookie. Names must be on the fixed list; anything else is ignored. Netlify's own rate limit (below) protects it.
import { getStore } from '@netlify/blobs';
import { addCount, isKnownEvent } from '../../src/lib/counters.ts';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';

const ROUTE = '/api/count';
const MAX_BODY = 1000;
const MAX_EVENTS = 4;

// Tests give the function a fake store; in production this is always the Netlify store.
let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s as ReturnType<typeof getStore> | null;
};
const privateStore = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

const reply = (status: number): Response => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return reply(404);
  if (req.method !== 'POST') return reply(405);

  // A courtesy check against casual misuse, as in the coach function. It reads only the page's own address.
  let originHost = '';
  try {
    const o = req.headers.get('origin');
    originHost = o ? new URL(o).hostname : '';
  } catch {
    originHost = '';
  }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return reply(403);

  const text = await req.text();
  if (text.length > MAX_BODY) return reply(413);
  let events: unknown;
  try {
    events = (JSON.parse(text) as { events?: unknown }).events;
  } catch {
    return reply(400);
  }
  if (!Array.isArray(events) || events.length === 0 || events.length > MAX_EVENTS) return reply(400);

  const wanted = [...new Set(events.filter((e): e is string => typeof e === 'string' && isKnownEvent(e)))];
  try {
    const store = privateStore() as unknown as Parameters<typeof addCount>[0];
    await Promise.allSettled(wanted.map((e) => addCount(store, e)));
  } catch {
    /* a count that cannot be written is simply lost */
  }
  return reply(204);
};

// Literal values on purpose: Netlify reads this block by static analysis. Keep `path` in step with ROUTE above.
// Generous for a person (a few events a minute), and it cuts off a script.
export const config = {
  path: '/api/count',
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
