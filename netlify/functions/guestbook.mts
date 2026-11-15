// "Sign Our Guestbook" (docs/guestbook-scope.md). POST: two chosen colors; the server makes the guestbook ID from its own clock (so the time cannot be faked),
// keeps only the centroid of the four colors and the day (the chosen colors are used and dropped), and allows one signature per connection a day (the one-way
// daily code the coach uses; its marker sits under the connection records, which the daily cleanup deletes). GET: every point, for the visualizer. Kept
// forever (owner). Nothing is logged; only plain counts.
import { randomBytes } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { capDay } from '../../src/lib/dailyCap.ts';
import { connectionCode } from '../../src/lib/connectionLimit.ts';
import { STORE_PREFIX, guestbookId, normHex, onceKey, signaturePoint } from '../../src/lib/guestbook.ts';

const MAX_POINTS = 5000;
let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
  cache = null;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;
const json = (status: number, body: unknown, maxAge = 0): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store' } });
const count = async (event: string) => {
  try {
    await addCount(store() as unknown as CounterStore, event);
  } catch {
    /* a count is never worth failing a request */
  }
};

let cache: { at: number; points: { c: string; d: string }[] } | null = null;
async function allPoints(): Promise<{ c: string; d: string }[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.points;
  const st = store();
  const { blobs } = await st.list({ prefix: STORE_PREFIX });
  const keys = blobs.map((b) => b.key).sort().slice(-MAX_POINTS);
  const points: { c: string; d: string }[] = [];
  for (const key of keys) {
    const rec = (await st.get(key, { type: 'json' }).catch(() => null)) as { c?: unknown } | null;
    const c = normHex(rec?.c);
    const d = key.split('/')[1];
    if (c && d) points.push({ c, d });
  }
  cache = { at: Date.now(), points };
  return points;
}

export default async (req: Request, context?: { ip?: string }): Promise<Response> => {
  if (req.method === 'GET') {
    try {
      const points = await allPoints();
      return json(200, { points, total: points.length }, 60);
    } catch {
      return json(503, { error: 'store' });
    }
  }
  if (req.method !== 'POST') return json(405, { error: 'method' });
  let originHost = '';
  try {
    originHost = new URL(req.headers.get('origin') || '').hostname;
  } catch {
    originHost = '';
  }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return json(403, { error: 'origin' });
  let body: { colors?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'json' });
  }
  if (typeof body.website === 'string' && body.website !== '') return json(200, {});
  const colors = Array.isArray(body.colors) ? body.colors.map(normHex) : [];
  if (colors.length !== 2 || !colors[0] || !colors[1]) return json(400, { error: 'colors' });

  const now = new Date();
  const st = store();
  const code = connectionCode(process.env.COACH_IP_SECRET, context?.ip, now);
  if (code) {
    const marker = onceKey(capDay(now), code);
    if ((await st.get(marker).catch(() => null)) !== null) {
      await count('guestbook.refused.once');
      return json(429, { error: 'once' });
    }
    await st.set(marker, '1');
  }
  const point = signaturePoint([colors[0], colors[1]], now);
  const day = now.toISOString().slice(0, 10);
  try {
    await st.setJSON(`${STORE_PREFIX}${day}/${randomBytes(8).toString('hex')}`, { c: point });
  } catch {
    return json(503, { error: 'store' });
  }
  cache = null;
  await count('guestbook.signed');
  return json(200, { point, day, moment: guestbookId(now) });
};

export const config = {
  path: '/api/guestbook',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
