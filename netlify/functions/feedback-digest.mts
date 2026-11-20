// Runs once a day: emails the admin one digest of the day's feedback (docs/feedback-scope.md). It reads the notes from Netlify Forms (the form "feedback") through the
// Netlify API, keeps only those whose `checked` proof holds (so only notes that passed every check in feedback.mts: a note posted around that function is ignored), and
// sends nothing on a quiet day. The window runs from the last digest that was delivered to now (the time is the only thing kept, in the private store); a failed
// delivery leaves the window open, so the same notes are in tomorrow's digest. Off unless FEEDBACK_DIGEST=on.
//   FEEDBACK_DIGEST        plain   "on" turns the digest on (default off)
//   FEEDBACK_NETLIFY_TOKEN secret  a Netlify personal access token, read by this function only, to list this site's form submissions
//   FEEDBACK_SITE_ID       plain   optional: this site's id; the platform's SITE_ID is used when it is not set
//   FEEDBACK_DIGEST_VIA    plain   "form" (default): posts the digest to the Netlify form "feedback-digest", whose email notification (Site configuration, Forms) goes to the
//                                  admin and needs no mail provider; or "mail": sends it through the mail sender (src/lib/feedbackMail.ts) to FEEDBACK_ADMIN_EMAIL
//   FEEDBACK_ADMIN_EMAIL   plain   where "mail" delivers the digest
// Scheduled functions run only on a site's published deploy (the production branch of that site; for the dev site, its own branch).
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { proofHolds } from '../../src/lib/feedbackChecks.ts';
import { buildDigest, senderFromEnv, type DigestEntry, type MailSender } from '../../src/lib/feedbackMail.ts';

const API = 'https://api.netlify.com/api/v1';
const FORM = 'feedback';
const DIGEST_FORM = 'feedback-digest';
const LAST_KEY = 'fb-digest/last';
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES = 5;

let storeOverride: unknown = null;
let senderOverride: MailSender | null | undefined;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
};
export const __useSenderForTests = (s: MailSender | null | undefined): void => {
  senderOverride = s;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;
const count = async (event: string) => {
  try {
    await addCount(store() as unknown as CounterStore, event);
  } catch {
    /* a count is never worth failing the job */
  }
};

type Submission = { created_at?: unknown; data?: Record<string, unknown> };

async function api(path: string, token: string, fetchImpl: typeof fetch): Promise<unknown> {
  const r = await fetchImpl(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
  if (!r.ok) throw new Error('api');
  return r.json();
}

/** The notes in the window that passed the site's checks, oldest first. */
export async function collect(token: string, siteId: string, secret: string, sinceMs: number, untilMs: number, fetchImpl: typeof fetch = fetch): Promise<DigestEntry[]> {
  const forms = (await api(`/sites/${encodeURIComponent(siteId)}/forms`, token, fetchImpl)) as { id?: string; name?: string }[];
  const form = Array.isArray(forms) ? forms.find((f) => f.name === FORM) : undefined;
  if (!form?.id) return [];
  const out: DigestEntry[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const subs = (await api(`/forms/${encodeURIComponent(form.id)}/submissions?per_page=100&page=${page}`, token, fetchImpl)) as Submission[];
    if (!Array.isArray(subs) || subs.length === 0) break;
    let older = false;
    for (const s of subs) {
      const at = typeof s.created_at === 'string' ? Date.parse(s.created_at) : NaN;
      if (!Number.isFinite(at)) continue;
      if (at <= sinceMs) { older = true; continue; }
      if (at > untilMs) continue;
      const d = s.data ?? {};
      const f = { route: String(d.route ?? ''), picked: String(d.picked ?? ''), features: String(d.features ?? ''), comment: String(d.comment ?? '') };
      if (!f.comment || !proofHolds(secret, f, d.checked)) continue;
      out.push({ at: new Date(at).toISOString(), ...f });
    }
    if (older || subs.length < 100) break; // newest first: a page with older notes is the last one that matters
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export async function runDigest(now = new Date(), fetchImpl: typeof fetch = fetch): Promise<'off' | 'config' | 'quiet' | 'sent' | 'failed'> {
  if (process.env.FEEDBACK_DIGEST !== 'on') return 'off';
  const token = process.env.FEEDBACK_NETLIFY_TOKEN;
  const siteId = process.env.FEEDBACK_SITE_ID || process.env.SITE_ID;
  const secret = process.env.COACH_TICKET_SECRET;
  const via = process.env.FEEDBACK_DIGEST_VIA === 'mail' ? 'mail' : 'form';
  const admin = (process.env.FEEDBACK_ADMIN_EMAIL ?? '').trim();
  const sender = senderOverride === undefined ? senderFromEnv(process.env) : senderOverride;
  if (!token || !siteId || !secret || (via === 'mail' && (!admin || !sender))) return 'config';

  const st = store();
  const until = now.getTime();
  let since = until - DAY_MS;
  try {
    const last = Date.parse((await st.get(LAST_KEY, { type: 'text' })) ?? '');
    if (Number.isFinite(last) && last < until) since = Math.max(last, until - 7 * DAY_MS);
  } catch {
    /* no earlier digest: the last day */
  }
  let entries: DigestEntry[];
  try {
    entries = await collect(token, siteId, secret, since, until, fetchImpl);
  } catch {
    await count('feedback.digest.failed');
    return 'failed';
  }
  const digest = buildDigest(entries, new Date(since).toISOString(), now.toISOString());
  if (digest) {
    let sent = false;
    try {
      if (via === 'mail') {
        sent = await sender!.send({ to: admin, subject: digest.subject, text: digest.text });
      } else {
        const form = new FormData();
        form.set('form-name', DIGEST_FORM);
        form.set('bot-field', '');
        form.set('subject', digest.subject);
        form.set('digest', digest.text);
        const base = (process.env.URL ?? '').replace(/\/$/, '');
        sent = !!base && (await fetchImpl(`${base}/`, { method: 'POST', body: form })).ok;
      }
    } catch {
      sent = false;
    }
    if (!sent) {
      await count('feedback.digest.failed');
      return 'failed';
    }
    await count('feedback.digest.sent');
  }
  try {
    await st.set(LAST_KEY, now.toISOString());
  } catch {
    /* the next run would repeat a quiet window at worst */
  }
  return digest ? 'sent' : 'quiet';
}

export default async (): Promise<Response> => {
  try {
    const r = await runDigest();
    console.log(`feedback-digest: ${r}`);
    return new Response(null, { status: r === 'failed' ? 500 : 204 });
  } catch (e) {
    console.error(`feedback-digest: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

export const config = { schedule: '0 7 * * *' };
