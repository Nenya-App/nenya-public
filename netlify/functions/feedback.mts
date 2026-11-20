// POST /api/feedback: the "Give feedback" tool (docs/feedback-scope.md). Every check the site already has runs here, in this order, BEFORE anything reaches Netlify Forms:
//   switch, the site's own origin, JSON and size, the honeypot, a per-connection and a daily limit (the coach's one-way daily connection code), the Cloudflare
//   Turnstile check (the coach's, COACH_TURNSTILE), plain text, personal details taken out, the form check, and the private list's matcher.
// A note that fails any of them is dropped: it is never put in the form and never emailed. A note that passes is posted to the Netlify form "feedback" (hidden copy in
// index.html) with a `checked` proof only this function can make (src/lib/feedbackChecks.ts): the daily digest (feedback-digest.mts) includes only notes whose proof holds,
// so a note posted straight to the form, around this function, is never emailed to anyone.
// The optional email address is used once, here, for the automated thank-you (when FEEDBACK_AUTOREPLY=on and a sender is configured), and is then gone: it is not put in
// the form, the store, a count or the log. Nothing about a note is logged; only plain counts.
//   FEEDBACK_ENABLED        plain   "true" turns the tool on (default off)
//   FEEDBACK_AUTOREPLY      plain   "on" sends the thank-you to an address the person typed (default off; needs a sender, src/lib/feedbackMail.ts)
//   FEEDBACK_PER_CONNECTION plain   optional, notes per connection per day (default 5)
//   FEEDBACK_DAILY_CAP      plain   optional, notes per day in all (default 200)
//   FEEDBACK_MIN_SEVERITY   plain   optional, the lowest list severity that refuses a note (default 2)
//   COACH_TICKET_SECRET, COACH_IP_SECRET, COACH_EXTRA_HOSTS, COACH_STORE_NAME, COACH_TURNSTILE, TURNSTILE_SECRET_KEY, TURNSTILE_HOSTNAMES: the coach's own settings, shared
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { addCount } from '../../src/lib/counters.ts';
import { capDay, type CounterStore } from '../../src/lib/dailyCap.ts';
import { connectionCode } from '../../src/lib/connectionLimit.ts';
import { getMatcher } from '../../src/lib/lexiconStore.ts';
import { FEEDBACK_TURNSTILE_ACTION, checkTurnstile, turnstileHosts, turnstileMode } from '../../src/lib/turnstileCheck.ts';
import { cleanEmail, cleanFeatures, cleanRoute } from '../../src/lib/feedback.ts';
import { feedbackProof, intFrom, takePlace, vetText } from '../../src/lib/feedbackChecks.ts';
import { senderFromEnv, thankYouMail, type MailSender } from '../../src/lib/feedbackMail.ts';

const ROUTE = '/api/feedback';
const MAX_BODY = 8000;
export const FORM = 'feedback';

let storeOverride: unknown = null;
let senderOverride: MailSender | null | undefined;
export const __useStoreForTests = (s: unknown): void => {
  storeOverride = s;
};
export const __useSenderForTests = (s: MailSender | null | undefined): void => {
  senderOverride = s;
};
const store = () => (storeOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME))) as ReturnType<typeof getStore>;
const reply = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const count = async (event: string) => {
  try {
    await addCount(store() as unknown as CounterStore, event);
  } catch {
    /* a count is never worth failing a request */
  }
};

export default async (req: Request, netlify?: { ip?: string }): Promise<Response> => {
  if (new URL(req.url).pathname !== ROUTE) return reply(404, { error: 'not-found' });
  if (req.method !== 'POST') return reply(405, { error: 'method' });
  if (process.env.FEEDBACK_ENABLED !== 'true') return reply(503, { error: 'off' });

  let originHost = '';
  try {
    originHost = new URL(req.headers.get('origin') || '').hostname;
  } catch {
    originHost = '';
  }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return reply(403, { error: 'origin' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return reply(415, { error: 'type' });
  const secret = process.env.COACH_TICKET_SECRET;
  if (!secret) return reply(500, { error: 'config' });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return reply(413, { error: 'size' });
  let body: { website?: unknown; route?: unknown; features?: unknown; picked?: unknown; comment?: unknown; email?: unknown; token?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: 'json' });
  }
  if (typeof body.website === 'string' && body.website !== '') {
    await count('feedback.refused.honeypot');
    return reply(200, { ok: true }); // the honeypot: pretend, keep nothing
  }

  // Limits, by the coach's one-way daily connection code (never the address itself). Counted per attempt, so a script cannot spend Cloudflare's or the form's patience.
  // The keys sit under "c/<day>/", which the daily coach-cleanup deletes once the day has passed, so no code outlives about a day and a half.
  const day = capDay();
  let st: CounterStore | null = null;
  try {
    st = store() as unknown as CounterStore;
  } catch {
    st = null;
  }
  if (st) {
    const code = connectionCode(process.env.COACH_IP_SECRET, netlify?.ip);
    if (code && !(await takePlace(st, `c/${day}/fb-${code}`, intFrom(process.env.FEEDBACK_PER_CONNECTION, 5)))) {
      await count('feedback.refused.limit');
      return reply(429, { error: 'limit' });
    }
    if (!(await takePlace(st, `c/${day}/fb-total`, intFrom(process.env.FEEDBACK_DAILY_CAP, 200)))) {
      await count('feedback.refused.limit');
      return reply(429, { error: 'limit' });
    }
  }

  // Is this a person? The coach's check, with this form's own action name. "shadow" checks and counts but never refuses.
  const mode = turnstileMode(process.env.COACH_TURNSTILE);
  if (mode !== 'off') {
    const t = await checkTurnstile(body.token, process.env.TURNSTILE_SECRET_KEY, turnstileHosts(process.env.TURNSTILE_HOSTNAMES), fetch, FEEDBACK_TURNSTILE_ACTION);
    if (!t.ok) {
      await count('feedback.refused.human');
      if (mode === 'on') return reply(403, { error: 'human' });
    }
  }

  let matcher = null;
  try {
    matcher = await getMatcher(store() as unknown as Parameters<typeof getMatcher>[0]);
  } catch {
    matcher = null;
  }
  const v = vetText(body.comment, body.picked, matcher, intFrom(process.env.FEEDBACK_MIN_SEVERITY, 2), process.env.COACH_FORM_CHECK !== 'off');
  if (v.ok === false) {
    await count(v.why === 'language' ? 'feedback.refused.language' : 'feedback.refused.form');
    return reply(v.why === 'language' ? 422 : 400, { error: v.why });
  }
  const route = cleanRoute(body.route);
  const features = cleanFeatures(body.features).join(',');
  const fields = { route, picked: v.picked, features, comment: v.comment };

  try {
    const form = new FormData();
    form.set('form-name', FORM);
    form.set('bot-field', '');
    form.set('route', route);
    form.set('features', features);
    form.set('picked', v.picked);
    form.set('comment', v.comment);
    form.set('checked', feedbackProof(secret, fields));
    const res = await fetch(`${new URL(req.url).origin}/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('form');
  } catch {
    await count('feedback.forward-failed');
    return reply(502, { error: 'forward' });
  }
  await count('feedback.received');

  // The thank-you, only if asked for twice (the person typed an address; the owner switched it on). The address lives in this request and nowhere else.
  const to = cleanEmail(body.email);
  let thanked: boolean | null = null;
  if (to && process.env.FEEDBACK_AUTOREPLY === 'on') {
    const sender = senderOverride === undefined ? senderFromEnv(process.env) : senderOverride;
    if (sender) {
      thanked = await sender.send(thankYouMail(to)).catch(() => false);
      await count(thanked ? 'feedback.reply.sent' : 'feedback.reply.failed');
    }
  }
  return reply(200, { ok: true, thanked });
};

// Literal values on purpose: Netlify reads this block by static analysis. No rateLimit here (both of the project's code-based rules are taken: see netlify.toml); the limits above stand in.
export const config = { path: '/api/feedback' };
