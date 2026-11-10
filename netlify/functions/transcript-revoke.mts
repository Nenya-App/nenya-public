// Takes back what a person allowed us to do with a signed transcript they sent (docs/transcript-consent-scope.md). The person shows the same signed file:
// holding it is the key. It can only reduce what was allowed (stop a use, take a public copy down, ask for deletion), never widen it. The effect on a public
// copy is immediate, and so is deletion: every copy we hold (the inbox copy, any waiting copy, any public copy) is deleted from the site's own private store at once and
// only a marker with the fingerprint and the date remains. If the store cannot be reached, the request is recorded and the daily job (transcript-expiry.mts) finishes it.
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { signedProblem } from '../../src/lib/signedCheck.ts';
import { deleteEverything } from './transcript-expiry.mts';
import { applyRevocation, pendingKey, publicKey, recordKey, USES, type TranscriptRecord, type Use } from '../../src/lib/transcriptPolicy.ts';

const ROUTE = '/api/transcript-revoke';
const MAX_BODY = 40000;

let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => { storeOverride = s as ReturnType<typeof getStore> | null; };
const store = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));
const reply = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return reply(404, { error: 'not found' });
  if (req.method !== 'POST') return reply(405, { error: 'method' });
  let originHost = '';
  try { const o = req.headers.get('origin'); originHost = o ? new URL(o).hostname : ''; } catch { originHost = ''; }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return reply(403, { error: 'origin' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return reply(415, { error: 'type' });
  const text = await req.text();
  if (text.length > MAX_BODY) return reply(413, { error: 'size' });

  let body: { signed?: unknown; stop?: unknown; deleteNow?: unknown };
  try { body = JSON.parse(text); } catch { return reply(400, { error: 'json' }); }
  const why = signedProblem(body.signed, process.env);
  if (why) return reply(400, { error: 'rejected', reason: why });
  const stop = Array.isArray(body.stop) ? (body.stop.filter((u): u is Use => typeof u === 'string' && (USES as readonly string[]).includes(u))) : [];
  const deleteNow = body.deleteNow === true;
  if (!stop.length && !deleteNow) return reply(400, { error: 'nothing' });

  const hash = (body.signed as { receipt: { hash: string } }).receipt.hash;
  const s = store();
  let rec: TranscriptRecord | null;
  try { rec = (await s.get(recordKey(hash), { type: 'json' })) as TranscriptRecord | null; } catch { return reply(503, { error: 'store' }); }
  if (!rec) return reply(404, { error: 'unknown' }); // nothing was ever sent to us under this signature (or it was already deleted)
  const next = applyRevocation(rec, { stop, deleteNow }, new Date());
  try {
    await s.setJSON(recordKey(hash), next);
    // A public or waiting copy goes at once when publishing is taken back or deletion is asked for.
    if (next.publication === 'withdrawn') { await s.delete(pendingKey(hash)); await s.delete(publicKey(hash)); }
  } catch { return reply(503, { error: 'store' }); }
  // Asking for deletion deletes now. If anything cannot be deleted, the record stays "requested" and the daily job tries again.
  let status = next.status;
  if (deleteNow && next.status === 'deletion-requested' && (await deleteEverything(s, next, new Date()))) status = 'deleted';
  return reply(200, { status, uses: status === 'deleted' ? [] : next.uses, publication: status === 'deleted' ? 'none' : next.publication });
};

// No rateLimit here: both of the project's code-based rate-limit rules are already used (see netlify.toml). The request must carry a transcript our own key signed, which is its own barrier.
export const config = { path: '/api/transcript-revoke' };
