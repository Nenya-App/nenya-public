// Takes a report, a sensory-reflection summary or a contact message and keeps it in the site's own private store for 90 days (src/lib/submissions.ts), instead of
// Netlify Forms, where only the owner could delete it, by hand. The sender gets a deletion code, shown once; only its hash is stored, as the record's key. With the
// code they can delete it themselves (`{ action: "delete", code }`), at once, with no email. A daily job (submission-expiry.mts) deletes what has reached 90 days.
// The owner reads submissions on the admin page; the alert email, through a small separate form, carries only the kind and the dates, never the text.
// Nothing here is logged; only plain counts. The text is checked as plain text again here, whatever the page did.
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { sanitizePlainText } from '../../src/lib/textSanitize.ts';
import { isSubmissionType, keyForCode, makeCode, newRecord } from '../../src/lib/submissions.ts';

const MAX_BODY = 30000;
const MAX_REPORT = 20000;
const MAX_COMMENTS = 2000;
const ALERT_FORM = 'submission-alert';

let storeOverride: unknown = null;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;

const reply = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const count = async (event: string) => {
  try {
    await addCount(store() as unknown as CounterStore, event);
  } catch {
    /* a count is never worth failing a request */
  }
};

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return reply(405, { error: 'method' });
  let originHost = '';
  try {
    originHost = new URL(req.headers.get('origin') || '').hostname;
  } catch {
    originHost = '';
  }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return reply(403, { error: 'origin' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return reply(415, { error: 'type' });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return reply(413, { error: 'size' });
  let body: { action?: unknown; type?: unknown; report?: unknown; comments?: unknown; code?: unknown; website?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: 'json' });
  }

  // Deleting, with the code: at once, and the same answer whether or not there was anything to delete (the code is the only key).
  if (body.action === 'delete') {
    if (typeof body.code !== 'string' || body.code.length > 100) return reply(400, { error: 'code' });
    try {
      const key = keyForCode(body.code);
      const had = (await store().get(key)) !== null;
      await store().delete(key);
      if (had) await count('submission.deleted.self');
    } catch {
      return reply(503, { error: 'store' });
    }
    return reply(200, { deleted: true });
  }

  if (typeof body.website === 'string' && body.website !== '') return reply(200, {}); // the honeypot: pretend, keep nothing
  if (!isSubmissionType(body.type)) return reply(400, { error: 'kind' });
  const report = sanitizePlainText(typeof body.report === 'string' ? body.report : '', MAX_REPORT);
  const comments = sanitizePlainText(typeof body.comments === 'string' ? body.comments : '', MAX_COMMENTS);
  if (!report.trim() && !comments.trim()) return reply(400, { error: 'empty' });

  const code = makeCode();
  const record = newRecord(body.type, report, comments);
  try {
    await store().setJSON(keyForCode(code), record);
  } catch {
    return reply(503, { error: 'store' });
  }
  await count('submission.received');

  // The owner's alert: the kind and the dates only.
  try {
    const form = new FormData();
    form.set('form-name', ALERT_FORM);
    form.set('bot-field', '');
    form.set('kind', record.type);
    form.set('received-at', record.receivedAt);
    form.set('keep-until', record.keepUntil);
    const res = await fetch(`${new URL(req.url).origin}/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('alert');
  } catch {
    await count('submission.alert-failed'); // kept safely; only the email failed, and the admin page lists it anyway
  }
  return reply(200, { code, keepUntil: record.keepUntil });
};

// Literal values on purpose: Netlify reads this block by static analysis.
export const config = {
  path: '/api/submit',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
