// "This was a mistake": a person tells us a check was wrong about their message (the coach stated its position, a card was offered, or a message was asked to be rewritten). It counts ONE thing, by kind,
// as a plain daily total (src/lib/counters.ts): no message, no text, no identifier, no address is read or kept. The count is how we see whether the checks are too eager. A person who also wants to share
// the message itself can do that separately, through the signed-transcript consent flow, by choice.
import { getStore } from '@netlify/blobs';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';

export const MISTAKE_KINDS = ['challenge', 'offer', 'form'] as const;
const ROUTE = '/api/mistake';

let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s; };
const store = (): CounterStore => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as unknown as CounterStore;
const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return json(404, { error: 'not found' });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  let originHost = '';
  try { const o = req.headers.get('origin'); originHost = o ? new URL(o).hostname : ''; } catch { originHost = ''; }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return json(403, { error: 'origin' });
  let kind = '';
  try { const b = JSON.parse((await req.text()).slice(0, 200)) as { kind?: unknown }; kind = typeof b.kind === 'string' ? b.kind : ''; } catch { return json(400, { error: 'body' }); }
  if (!(MISTAKE_KINDS as readonly string[]).includes(kind)) return json(400, { error: 'kind' });
  try { await addCount(store(), `coach.mistake.${kind}`); } catch { /* a count is a courtesy: never an error for the person */ }
  return json(200, { ok: true });
}

export const config = { path: '/api/mistake' };
