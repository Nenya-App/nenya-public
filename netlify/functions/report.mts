// Sends a signed coach-demo transcript to Nenya, but only a genuine one. The function checks everything the signature
// can prove before anything is forwarded: the shape, the hash, the Ed25519 signature, and that the key is one of
// Nenya's own (the current signing key, or an earlier one listed in COACH_ACCEPTED_KEY_IDS). An unsigned or altered
// transcript is refused with a short code. A valid one is rebuilt as readable text from the signed transcript itself
// (so what is read is what was signed) and forwarded to a separate Netlify form, with the signed file, a `checked` field
// only this function can produce (an HMAC of the hash under the ticket secret), and whether the receipt is in the
// 30-day log. The transcript is seen on its way through and is never stored or logged here.
import { getStore } from '@netlify/blobs';
import { createHash, createHmac, createPrivateKey, createPublicKey, verify as edVerify } from 'node:crypto';
import { addCount } from '../../src/lib/counters.ts';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { receiptRecordedOn } from '../../src/lib/receiptLog.ts';
import { readableTranscript, signedJson, transcriptFilename, type Receipt, type SignedTranscript } from '../../src/lib/transcript.ts';
import { sanitizePlainText } from '../../src/lib/textSanitize.ts';

const ROUTE = '/api/report';
const MAX_BODY = 40000;
const MAX_READABLE = 19000; // the form's limit is 20,000
const MAX_NOTE = 1000;
const FORM = 'verified-transcript';

// Tests give the function a fake store; in production this is always the Netlify store.
let storeOverride: ReturnType<typeof getStore> | null = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s as ReturnType<typeof getStore> | null;
};
const privateStore = () => storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const HEX = /^#[0-9A-Fa-f]{6}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const reply = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/** The key ID of the current signing key, if one is set. */
function currentKeyId(): string | null {
  const b64 = process.env.COACH_SIGNING_KEY;
  if (!b64) return null;
  try {
    const key = createPrivateKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'pkcs8' });
    const spki = createPublicKey(key).export({ type: 'spki', format: 'der' }) as Buffer;
    return sha256(spki.toString('base64')).slice(0, 16);
  } catch {
    return null;
  }
}

/** Why a transcript was refused, as a short code, or null if it is genuine. */
function problem(signed: unknown): string | null {
  const s = signed as { transcript?: SignedTranscript; receipt?: Receipt } | null;
  const t = s?.transcript;
  const r = s?.receipt;
  if (!t || !r || typeof t !== 'object' || typeof r !== 'object') return 'shape';
  if (t.v !== 2 && t.v !== 3) return 'version';
  if (!t.session || !HEX.test(t.session.color1) || !HEX.test(t.session.color2)) return 'shape';
  // A conversation the site ended carries one more message than a finished one: the user message the check stopped.
  const endedBySite = t.v === 3 && t.meta?.endedBy === 'site';
  if (!Array.isArray(t.messages) || t.messages.length < 1 || t.messages.length > 10 || (endedBySite ? t.messages.length % 2 !== 1 : t.messages.length < 2 || t.messages.length % 2 !== 0)) return 'shape';
  for (let i = 0; i < t.messages.length; i++) {
    const m = t.messages[i];
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== role || typeof m.content !== 'string' || m.content.length < 1 || m.content.length > (role === 'user' ? 500 : 3000)) return 'shape';
  }
  if (t.context !== undefined && (typeof t.context !== 'string' || t.context.length > 2500)) return 'shape';
  if (t.checks !== undefined) {
    if (!Array.isArray(t.checks) || t.checks.length > 5) return 'shape';
    for (const c of t.checks) {
      if (!c || !Number.isInteger(c.message) || c.message < 0 || c.message >= t.messages.length || (c.tier !== 'stop' && c.tier !== 'soften') || typeof c.category !== 'string' || (c.source !== 'phrase' && c.source !== 'ladder')) return 'shape';
      if ((c.kind !== undefined && typeof c.kind !== 'string') || (c.matched !== undefined && (typeof c.matched !== 'string' || c.matched.length > 130)) || (c.rung !== undefined && typeof c.rung !== 'string') || (c.basedOn !== undefined && (!Array.isArray(c.basedOn) || c.basedOn.length > 5 || c.basedOn.some((n: unknown) => !Number.isInteger(n))))) return 'shape';
    }
  }
  if (t.site !== undefined) {
    const kinds = new Set(['greeting', 'closing', 'notice', 'invitation']);
    if (!Array.isArray(t.site) || t.site.length > 4) return 'shape';
    for (const x of t.site) {
      if (!x || !kinds.has(x.kind) || !Number.isInteger(x.after) || x.after < -1 || x.after >= t.messages.length || typeof x.text !== 'string' || x.text.length > 1500) return 'shape';
      if (x.resources !== undefined && (!Array.isArray(x.resources) || x.resources.length > 12 || x.resources.some((r: any) => !r || typeof r.name !== 'string' || typeof r.detail !== 'string' || r.name.length > 200 || r.detail.length > 300))) return 'shape';
    }
  }
  if (t.v === 3) {
    const m = t.meta;
    if (!m || typeof m.closed !== 'boolean' || !Number.isInteger(m.exchanges) || typeof m.build !== 'string' || typeof m.model !== 'string' || typeof m.instructions !== 'string') return 'shape';
    if (m.endedBy !== undefined && (m.endedBy !== 'site' || !m.stop || typeof m.stop.category !== 'string' || (m.stop.kind !== undefined && typeof m.stop.kind !== 'string') || m.closed)) return 'shape';
    if (m.stop !== undefined && m.endedBy !== 'site') return 'shape';
  } else if (t.meta !== undefined) return 'shape';
  if (r.algorithm !== 'Ed25519' || typeof r.hash !== 'string' || typeof r.signature !== 'string' || typeof r.publicKey !== 'string' || typeof r.keyId !== 'string' || typeof r.issuedAt !== 'string' || !ISO.test(r.issuedAt)) return 'shape';

  if (sha256(JSON.stringify(t)) !== r.hash) return 'hash';
  let sigOk = false;
  try {
    sigOk = edVerify(
      null,
      Buffer.from(`nenya-coach-transcript-v${t.v === 3 ? 3 : 2}\n${r.hash}\n${r.issuedAt}`),
      createPublicKey({ key: Buffer.from(r.publicKey, 'base64'), format: 'der', type: 'spki' }),
      Buffer.from(r.signature, 'base64')
    );
  } catch {
    sigOk = false;
  }
  if (!sigOk) return 'signature';
  const keyId = sha256(r.publicKey).slice(0, 16);
  const accepted = new Set([currentKeyId(), ...(process.env.COACH_ACCEPTED_KEY_IDS ?? '').split(',').map((x) => x.trim().toLowerCase())].filter(Boolean) as string[]);
  if (keyId !== r.keyId || !accepted.has(keyId)) return 'key';
  return null;
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname !== ROUTE) return reply(404, { error: 'not found' });
  if (req.method !== 'POST') return reply(405, { error: 'method' });

  // A courtesy check against casual misuse, as in the coach function.
  let originHost = '';
  try {
    const o = req.headers.get('origin');
    originHost = o ? new URL(o).hostname : '';
  } catch {
    originHost = '';
  }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return reply(403, { error: 'origin' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return reply(415, { error: 'type' });
  const secret = process.env.COACH_TICKET_SECRET;
  if (!secret) return reply(500, { error: 'config' });

  const text = await req.text();
  if (text.length > MAX_BODY) return reply(413, { error: 'size' });

  let store: Parameters<typeof addCount>[0] | null = null;
  try {
    store = privateStore() as unknown as Parameters<typeof addCount>[0];
  } catch {
    store = null;
  }
  const count = async (event: string): Promise<void> => {
    if (store) await addCount(store, event);
  };
  const refuse = async (reason: string): Promise<Response> => {
    await count('coach.report.rejected');
    return reply(400, { error: 'rejected', reason }); // a code only, never the content
  };

  let body: { signed?: unknown; note?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return refuse('json');
  }
  const why = problem(body.signed);
  if (why) return refuse(why);

  const { transcript, receipt } = body.signed as { transcript: SignedTranscript; receipt: Receipt };
  const note = typeof body.note === 'string' ? sanitizePlainText(body.note, MAX_NOTE) : '';
  const readable = readableTranscript(transcript.messages, transcript.session, receipt, transcript.context ?? '', transcript.meta, transcript.site ?? [], transcript.checks ?? []);
  if (readable.length > MAX_READABLE) return refuse('size');

  let recorded: string | null = null;
  try {
    if (store) recorded = await receiptRecordedOn(store as unknown as Parameters<typeof receiptRecordedOn>[0], receipt.hash);
  } catch {
    recorded = null;
  }
  const checked = createHmac('sha256', secret).update(`report-checked|${receipt.hash}`).digest('hex');

  // The signed file goes both as a real file (the .json it is, in the submission) and as text (so it can be copied from the
  // email); the readable text and the facts are text fields. A multipart post, as a browser form with a file would send.
  const form = new FormData();
  form.set('form-name', FORM);
  form.set('bot-field', '');
  form.set('report', readable);
  // The signed file again as text, so it can be copied straight from the email and pasted into /verify/.
  form.set('signed', signedJson(transcript, receipt));
  // The hash and signing time on their own, so a submission can be found by them (and matched to /verify/ and the 30-day log).
  form.set('receipt-hash', receipt.hash);
  form.set('issued-at', receipt.issuedAt);
  form.set('comments', note);
  form.set('checked', checked);
  form.set('key-id', receipt.keyId);
  form.set('issued-record', recorded ? `yes (${recorded})` : 'no record (older than 30 days, or not logged)');
  form.set('signed-file', new Blob([signedJson(transcript, receipt)], { type: 'application/json' }), transcriptFilename(receipt, 'json'));
  try {
    const res = await fetch(`${url.origin}/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('forward');
  } catch {
    return reply(502, { error: 'forward' });
  }
  await count('coach.report.verified');
  return reply(204);
};

// Literal values on purpose: Netlify reads this block by static analysis. Keep `path` in step with ROUTE above.
export const config = {
  path: '/api/report',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
