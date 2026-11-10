// Sends a signed coach-demo transcript to Nenya, but only a genuine one. The function checks everything the signature
// can prove before anything is forwarded: the shape, the hash, the Ed25519 signature, and that the key is one of
// Nenya's own (the current signing key, or an earlier one listed in COACH_ACCEPTED_KEY_IDS). An unsigned or altered
// transcript is refused with a short code. A valid one is rebuilt as readable text from the signed transcript itself
// (so what is read is what was signed) and forwarded to a separate Netlify form, with the signed file, a `checked` field
// only this function can produce (an HMAC of the hash under the ticket secret), and whether the receipt is in the
// 30-day log. The transcript is seen on its way through and is never stored or logged here; what is kept is a small record of the choices the person made
// (src/lib/transcriptPolicy.ts), keyed by the transcript's fingerprint.
import { getStore } from '@netlify/blobs';
import { createHmac } from 'node:crypto';
import { addCount } from '../../src/lib/counters.ts';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { receiptRecordedOn } from '../../src/lib/receiptLog.ts';
import { readableTranscript, signedJson, transcriptFilename, type Receipt, type SignedTranscript } from '../../src/lib/transcript.ts';
import { sanitizePlainText } from '../../src/lib/textSanitize.ts';
import { signedProblem } from '../../src/lib/signedCheck.ts';
import { stopLevelFlagged } from '../../src/lib/publicCopy.ts';
import { describeChoices, mergeResend, newRecord, parseChoices, pendingKey, recordKey, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

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


const reply = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const problem = (signed: unknown): string | null => signedProblem(signed, process.env);

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

  let body: { signed?: unknown; note?: unknown; choices?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return refuse('json');
  }
  const why = problem(body.signed);
  if (why) return refuse(why);
  // What the person allows us to do with it, and for how long. Required: nothing is assumed (docs/transcript-consent-scope.md).
  const choices = parseChoices(body.choices);
  if (!choices) return refuse('choices');

  const { transcript, receipt } = body.signed as { transcript: SignedTranscript; receipt: Receipt };
  // A conversation in which the site's safety check stopped a message is never offered for publishing, whatever the request says.
  if (choices.uses.includes('publish') && stopLevelFlagged(transcript)) return refuse('publish-not-allowed');
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
  // A small record of the choices and dates, keyed by the transcript's fingerprint (never the conversation), so the keeping time can be kept and the person can
  // take permissions back later with the signed file. Written first: if it cannot be, nothing is forwarded, because the promise could not be kept.
  const nowDate = new Date();
  let record: TranscriptRecord = newRecord(receipt.hash, choices, nowDate);
  let previous: TranscriptRecord | null = null;
  try {
    const ps = privateStore();
    previous = (await ps.get(recordKey(receipt.hash), { type: 'json' })) as TranscriptRecord | null;
    if (previous) record = mergeResend(previous, record);
    await ps.setJSON(recordKey(receipt.hash), record);
    // Only if they allowed it: the signed conversation waits here for a person to read it before anything is shown (nothing is public until then).
    if (record.uses.includes('publish') && record.publication === 'pending-review') {
      await ps.setJSON(pendingKey(receipt.hash), { transcript, receipt, portions: record.portions ?? 'all', receivedAt: record.receivedAt });
    }
  } catch {
    return reply(503, { error: 'record' });
  }

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
  form.set('permissions', describeChoices({ uses: record.uses, keep: record.keep }));
  form.set('keep-until', record.keepUntil ?? 'until the person asks');
  form.set('checked', checked);
  form.set('key-id', receipt.keyId);
  form.set('issued-record', recorded ? `yes (${recorded})` : 'no record (older than 30 days, or not logged)');
  form.set('signed-file', new Blob([signedJson(transcript, receipt)], { type: 'application/json' }), transcriptFilename(receipt, 'json'));
  try {
    const res = await fetch(`${url.origin}/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('forward');
  } catch {
    if (!previous) { try { await privateStore().delete(recordKey(receipt.hash)); await privateStore().delete(pendingKey(receipt.hash)); } catch { /* nothing more can be done here */ } }
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
