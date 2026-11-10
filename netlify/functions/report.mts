// Sends a signed coach-demo transcript to Nenya, but only a genuine one. The function checks everything the signature
// can prove before anything is forwarded: the shape, the hash, the Ed25519 signature, and that the key is one of
// Nenya's own (the current signing key, or an earlier one listed in COACH_ACCEPTED_KEY_IDS). An unsigned or altered
// transcript is refused with a short code. A valid one is rebuilt as readable text from the signed transcript itself
// (so what is read is what was signed), with a `checked` field only this function can produce (an HMAC of the hash under
// the ticket secret) and whether the receipt is in the 30-day log. A valid transcript is kept in the site's private store (never in the form, never in logs or counts) together with a small record of the choices the person
// made (src/lib/transcriptPolicy.ts), keyed by its fingerprint; the owner's notification email carries only the fingerprint and the choices.
import { getStore } from '@netlify/blobs';
import { createHmac } from 'node:crypto';
import { addCount } from '../../src/lib/counters.ts';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { receiptRecordedOn } from '../../src/lib/receiptLog.ts';
import { readableTranscript, type Receipt, type SignedTranscript } from '../../src/lib/transcript.ts';
import { sanitizePlainText } from '../../src/lib/textSanitize.ts';
import { signedProblem } from '../../src/lib/signedCheck.ts';
import { stopLevelFlagged } from '../../src/lib/publicCopy.ts';
import { signConsent } from '../../src/lib/consentReceipt.ts';
import { describeChoices, inboxKey, mergeResend, newRecord, parseChoices, pendingKey, recordKey, type InboxEntry, type TranscriptRecord } from '../../src/lib/transcriptPolicy.ts';

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
  if ((choices.uses.includes('publish') || choices.uses.includes('train')) && stopLevelFlagged(transcript)) return refuse('publish-not-allowed');
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

  // A small record of the choices and dates, keyed by the transcript's fingerprint (never the conversation), so the keeping time can be kept and the person can
  // take permissions back later with the signed file. Written first: if it cannot be, nothing is kept, because the promise could not be kept.
  const nowDate = new Date();
  let record: TranscriptRecord = newRecord(receipt.hash, choices, nowDate);
  let previous: TranscriptRecord | null = null;
  const permissions = (r: TranscriptRecord) => describeChoices({ uses: r.uses, keep: r.keep, ...(r.portions ? { portions: r.portions } : {}), ...(r.showFor ? { showFor: r.showFor } : {}) });
  try {
    const ps = privateStore();
    previous = (await ps.get(recordKey(receipt.hash), { type: 'json' })) as TranscriptRecord | null;
    if (previous) record = mergeResend(previous, record);
    await ps.setJSON(recordKey(receipt.hash), record);
    // The transcript goes into our own private store (the owner reads it in the admin page), NOT into Netlify Forms: a form submission can only be deleted with an account
    // token, and the notification email below carries no conversation. Everything we hold is deleted here, at the person's request or when their chosen time ends.
    const entry: InboxEntry = { receivedAt: record.receivedAt, readable, signed: { transcript, receipt }, note, checked, issuedRecord: recorded ? `yes (${recorded})` : 'no record (older than 30 days, or not logged)', permissions: permissions(record), keepUntil: record.keepUntil };
    await ps.setJSON(inboxKey(receipt.hash), entry);
    // Only if they allowed it: the signed conversation waits here for a person to read it before anything is shown (nothing is public until then).
    if (record.uses.includes('publish') && record.publication === 'pending-review') {
      await ps.setJSON(pendingKey(receipt.hash), { transcript, receipt, portions: record.portions ?? 'all', receivedAt: record.receivedAt });
    }
  } catch {
    return reply(503, { error: 'record' });
  }

  // An alert for the owner through the separate form (Netlify emails it): the fingerprint and the person's choices only, never the conversation or the note.
  const form = new FormData();
  form.set('form-name', FORM);
  form.set('bot-field', '');
  form.set('receipt-hash', receipt.hash);
  form.set('issued-at', receipt.issuedAt);
  form.set('permissions', permissions(record));
  form.set('keep-until', record.keepUntil ?? 'until the person asks');
  form.set('checked', checked);
  form.set('key-id', receipt.keyId);
  try {
    const res = await fetch(`${url.origin}/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('forward');
  } catch {
    await count('coach.report.alert-failed'); // the transcript is safely kept; only the email alert failed, and it is listed in the admin page
  }
  await count('coach.report.verified');
  if (choices.uses.includes('train')) await count('coach.report.train');
  // The person's consent receipt: signed by the site with the same key as the transcripts, so they hold their own proof of what they agreed to (src/lib/consentReceipt.ts). Without
  // a signing key there is no receipt and the answer is as before.
  const consent = signConsent(receipt.hash, choices, new Date(), process.env.COACH_SIGNING_KEY);
  return consent ? new Response(JSON.stringify({ consentReceipt: consent }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }) : reply(204);
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
