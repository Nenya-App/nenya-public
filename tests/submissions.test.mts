// Reports and messages in the private store (owner, 2026-11-15; docs/data-hygiene-scope.md): kept 90 days, deleted by a daily job, deletable by the sender
// with a code (only its hash stored), read by the owner on the admin page, and the alert email carries no text.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update('owner-x').digest('hex');
delete process.env.COACH_EXTRA_HOSTS;

// A small store standing in for Netlify Blobs.
const data = new Map<string, string>();
const store = {
  get: async (k: string, o?: { type?: string }) => (data.has(k) ? (o?.type === 'json' ? JSON.parse(data.get(k)!) : data.get(k)) : null),
  set: async (k: string, v: string) => void data.set(k, v),
  setJSON: async (k: string, v: unknown) => void data.set(k, JSON.stringify(v)),
  delete: async (k: string) => void data.delete(k),
  list: async (o?: { prefix?: string }) => ({ blobs: [...data.keys()].filter((k) => !o?.prefix || k.startsWith(o.prefix)).map((key) => ({ key })) }),
};
const alerts: string[] = [];
(globalThis as any).fetch = async (_url: string, init?: { body?: FormData }) => {
  const f = init?.body;
  alerts.push(f instanceof FormData ? [...f.entries()].map(([k, v]) => `${k}=${v}`).join('&') : '');
  return new Response(null, { status: 200 });
};

const submit = await import('../netlify/functions/submit.mts');
const expiry = await import('../netlify/functions/submission-expiry.mts');
const owner = await import('../netlify/functions/submissions.mts');
const { DUP_PREFIX, KEEP_DAYS, PREFIX, duplicateKey, isDue, keyForCode, makeCode, normalizeCode } = await import('../src/lib/submissions.ts');
submit.__useStoreForTests(store);
expiry.__useStoreForTests(store);
owner.__useStoreForTests(store);
owner.__useUserForTests(async () => null);
import { ok } from './helpers.mts';

const post = (body: Record<string, unknown>, origin = 'https://nenya.biz') =>
  submit.default(new Request('https://nenya.biz/api/submit', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify('adult' in body || body.action ? body : { adult: true, ...body }) }));
const submissionKeys = () => [...data.keys()].filter((k) => k.startsWith(PREFIX));

ok('a code is five groups of six easy-to-read characters', /^[a-z2-9]{6}(-[a-z2-9]{6}){4}$/.test(makeCode()) && !/[01ilo]/.test(makeCode()));
ok('a code typed with spaces or capitals still matches', keyForCode('ABCDEF ghjkmn-pqrstu') === keyForCode('abcdefghjkmnpqrstu') && normalizeCode(' a-B ') === 'ab');

let res = await post({ type: 'contact-message', report: 'Hello, the Sound gateway is lovely.', comments: '' });
const sent = await res.json();
ok('sending keeps it and returns a code and the date it will be deleted', res.status === 200 && typeof sent.code === 'string' && submissionKeys().length === 1);
const key = submissionKeys()[0];
const kept = JSON.parse(data.get(key)!);
ok('it is kept under the hash of the code, not the code itself', key === keyForCode(sent.code) && !data.get(key)!.includes(sent.code) && !key.includes(sent.code.replace(/-/g, '')));
ok('it is kept for 90 days', KEEP_DAYS === 90 && Math.round((Date.parse(kept.keepUntil) - Date.parse(kept.receivedAt)) / 86400000) === 90 && sent.keepUntil === kept.keepUntil);
ok('the email alert carries the kind and the dates, never the text', alerts.length === 1 && /form-name=submission-alert/.test(alerts[0]) && /kind=contact-message/.test(alerts[0]) && !/Sound gateway|lovely/.test(alerts[0]));

res = await post({ action: 'delete', code: 'not-the-right-code' });
ok('a wrong code changes nothing, and gets the same answer', res.status === 200 && (await res.json()).deleted === true && submissionKeys().length === 1);
res = await post({ action: 'delete', code: sent.code.toUpperCase().replace(/-/g, ' ') });
ok('the right code (however typed) deletes it at once', res.status === 200 && submissionKeys().length === 0);

ok('another site cannot send', (await post({ type: 'contact-message', report: 'x' }, 'https://evil.example')).status === 403);
ok('an unknown kind or an empty message is refused', (await post({ type: 'coach-transcript', report: 'x' })).status === 400 && (await post({ type: 'error-report', report: '   ' })).status === 400);
res = await post({ type: 'error-report', report: 'spam', website: 'http://spam' });
ok('the honeypot is answered politely and nothing is kept', res.status === 200 && submissionKeys().length === 0);
await post({ type: 'error-report', report: '<script>alert(1)</script>Real report' });
ok('the text is checked as plain text again on the server', !JSON.parse(data.get(submissionKeys()[0])!).report.includes('<script>'));

// The daily job
data.clear();
const now = new Date('2026-11-15T12:00:00Z');
data.set(`${PREFIX}old`, JSON.stringify({ keepUntil: '2026-11-15T11:00:00Z' }));
data.set(`${PREFIX}new`, JSON.stringify({ keepUntil: '2026-12-01T00:00:00Z' }));
data.set(`${PREFIX}broken`, 'not json-ish but a string');
data.set('counts/other', '1');
const n = await expiry.expireSubmissions(now);
ok('the daily job deletes what reached 90 days (and anything unreadable), keeps the rest, and touches nothing else', n === 2 && data.has(`${PREFIX}new`) && !data.has(`${PREFIX}old`) && data.has('counts/other'));
ok('"due" means the keeping date has passed', isDue({ keepUntil: '2026-11-15T11:00:00Z' }, now) && !isDue({ keepUntil: '2026-11-16T00:00:00Z' }, now) && isDue(null, now));

// The owner's view
const asOwner = (init: RequestInit = {}) => owner.default(new Request('https://nenya.biz/api/submissions', { ...init, headers: { 'content-type': 'application/json', 'x-nenya-owner': 'owner-x' } }));
ok('only the owner can read them', (await owner.default(new Request('https://nenya.biz/api/submissions'))).status === 401);
data.clear();
await post({ type: 'sensory-reflection', report: 'Touch: silk', comments: 'thank you' });
const list = await (await asOwner()).json();
ok('the owner sees the text and the dates', list.items.length === 1 && list.items[0].report === 'Touch: silk' && list.items[0].type === 'sensory-reflection');
await asOwner({ method: 'POST', body: JSON.stringify({ delete: list.items[0].id }) });
ok('and can delete one at once', submissionKeys().length === 0);

const client = readFileSync('src/lib/reportSubmission.ts', 'utf8');
ok('the forms send to the site\'s own function, not Netlify Forms', /fetch\('\/api\/submit'/.test(client) && !/form-name/.test(client));
const html = readFileSync('index.html', 'utf8');
ok('the old report form is gone; the alert form holds no text fields', !/name="report-submission"/.test(html) && /name="submission-alert"/.test(html) && !/<textarea name="report"/.test(html));
const FIVE = ['src/app/components/ReportModal.tsx', 'src/app/components/SubmitSensoryReportForm.tsx', 'src/app/components/ContactSection.tsx', 'src/coach/FailureNotice.tsx', 'src/coach/FlagNotice.tsx'];
ok('all five forms show the deletion code', FIVE.every((f) => /<DeletionCode receipt=\{receipt\}/.test(readFileSync(f, 'utf8'))));
ok('all five forms go through the consent screen: the button only opens it, and only Send there sends', FIVE.every((f) => { const t = readFileSync(f, 'utf8'); return /useSendFlow\(/.test(t) && /<SendConsent/.test(t) && /flow\.begin\(/.test(t) && !/submitReport\(\{/.test(t); }));
ok('the coach forms show the way back to the conversation, the others do not need it', ['src/coach/FailureNotice.tsx', 'src/coach/FlagNotice.tsx'].every((f) => /<DeletionCode receipt=\{receipt\} fromCoach \/>/.test(readFileSync(f, 'utf8'))));
ok('the sender can delete with the code on /my-transcript', /<DeleteSubmission \/>/.test(readFileSync('src/mytranscript/MyTranscriptPage.tsx', 'utf8')));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const t = JSON.stringify(LEGAL_PARTS);
  ok('the Terms say 90 days, the deletion code, and that the email carries no text; the old "no schedule" line is gone', /kept for 90 days and then deleted automatically/.test(t) && /deletion code/.test(t) && /never what it says/.test(t) && !/no automatic deletion schedule yet/.test(t));
}

// ---- 18 or older: the server refuses a send without the confirmation (owner, 2026-11-18)
data.clear();
res = await submit.default(new Request('https://nenya.biz/api/submit', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ type: 'contact-message', report: 'Hello' }) }));
ok('a send without "adult: true" is refused and nothing is kept', res.status === 400 && (await res.json()).error === 'adult' && submissionKeys().length === 0);
res = await post({ type: 'contact-message', report: 'Hello', adult: false });
ok('"adult: false" and anything but true are refused', res.status === 400 && (await post({ type: 'contact-message', report: 'Hello', adult: 'true' })).status === 400 && submissionKeys().length === 0);
res = await post({ type: 'contact-message', report: 'Hello', adult: true });
ok('with the confirmation it is accepted', res.status === 200 && submissionKeys().length === 1);
ok('the confirmation is not kept with the text: the record holds only what it held before, plus its one-way marker key', Object.keys(JSON.parse(data.get(submissionKeys()[0])!)).sort().join() === 'comments,dup,keepUntil,receivedAt,report,type');

// ---- an identical repeat is refused (owner, 2026-11-18: "third identical report submitted after back button pressed")
data.clear();
alerts.length = 0;
const markerKeys = () => [...data.keys()].filter((k) => k.startsWith(DUP_PREFIX));
const same = { type: 'error-report', report: 'The coach kept going on after I said stop.', comments: 'second try' };
const one = await (await post(same)).json();
ok('the first send is kept and leaves one marker', typeof one.code === 'string' && submissionKeys().length === 1 && markerKeys().length === 1);
ok('the marker holds no text: only its end date and the key of its submission', !/coach kept going|second try/.test(data.get(markerKeys()[0])!) && Object.keys(JSON.parse(data.get(markerKeys()[0])!)).sort().join() === 'keepUntil,sub' && !markerKeys()[0].includes('coach'));
res = await post(same);
ok('the same text again is refused with 409 duplicate', res.status === 409 && (await res.json()).error === 'duplicate');
res = await post({ ...same, report: '  The coach kept going on after I said stop.\n' });
ok('so is the same text with only spaces around it, and with markup the function would strip anyway', res.status === 409 && (await post({ ...same, report: '<b>The coach kept going on after I said stop.</b>' })).status === 409);
ok('a refused repeat keeps nothing new, sends no alert and gives no new code', submissionKeys().length === 1 && markerKeys().length === 1 && alerts.length === 1);
ok('a different kind with the same words is a different send', (await post({ ...same, type: 'contact-message' })).status === 200);
ok('changed text is accepted', (await post({ ...same, report: 'The coach kept going on after I said stop. Again today.' })).status === 200 && (await post({ ...same, comments: 'third try' })).status === 200);
ok('the marker key is one-way and depends on the text, the kind and the comments', duplicateKey('error-report', 'a', 'b') !== duplicateKey('error-report', 'a', 'c') && duplicateKey('error-report', 'a', 'b') !== duplicateKey('contact-message', 'a', 'b') && duplicateKey('error-report', 'a', 'b', 'secret') !== duplicateKey('error-report', 'a', 'b') && !duplicateKey('error-report', 'secretwords', '').includes('secretwords'));

// every way of deleting a submission deletes its marker, so the same words may be sent again on purpose
const resend = async (label: string) => ok(`${label}: the same words can then be sent again`, (await post(same)).status === 200 && markerKeys().length >= 1);
data.clear();
let sent1 = await (await post(same)).json();
await post({ action: 'delete', code: sent1.code });
ok('deleting with the sender\'s code removes the marker', markerKeys().length === 0 && submissionKeys().length === 0);
await resend('after the sender\'s deletion');
data.clear();
await post(same);
const idOwner = submissionKeys()[0].slice(PREFIX.length);
await asOwner({ method: 'POST', body: JSON.stringify({ delete: idOwner }) });
ok('deleting on the admin page removes the marker', markerKeys().length === 0);
await resend('after the owner\'s deletion');
data.clear();
await post(same);
const recKey = submissionKeys()[0];
const aged = JSON.parse(data.get(recKey)!);
data.set(recKey, JSON.stringify({ ...aged, keepUntil: '2020-01-01T00:00:00.000Z' }));
await expiry.expireSubmissions(new Date('2026-11-18T12:00:00Z'));
ok('the daily job removes the marker with the submission at 90 days', submissionKeys().length === 0 && markerKeys().length === 0);
await resend('after the 90 days');
data.clear();
await post(same);
data.delete(submissionKeys()[0]); // a submission removed some other way, leaving its marker behind
res = await post(same);
ok('a marker whose submission is gone does not block a send', res.status === 200);
data.clear();
await post(same);
data.delete(submissionKeys()[0]);
await expiry.expireSubmissions(new Date());
ok('the daily job also sweeps a marker left without its submission', markerKeys().length === 0);
data.clear();
await post(same);
const mk = markerKeys()[0];
data.set(mk, JSON.stringify({ ...JSON.parse(data.get(mk)!), keepUntil: '2020-01-01T00:00:00.000Z' }));
res = await post(same);
ok('a marker past its date is ignored (the same 90 days as the submission)', res.status === 200);
ok('the owner\'s list never shows markers', ((await (await asOwner()).json()).items as unknown[]).length === submissionKeys().length);

// ---- the page: the guard against sending twice (src/app/components/useSendFlow.ts, src/lib/reportSubmission.ts)
{
  const flow = readFileSync('src/app/components/useSendFlow.ts', 'utf8');
  const lib = readFileSync('src/lib/reportSubmission.ts', 'utf8');
  const consent = readFileSync('src/app/components/SendConsent.tsx', 'utf8');
  ok('the page sends only from confirm(), once at a time, and not again after it was sent', /if \(flying\.current \|\| done\.current \|\| !pending\) return/.test(flow) && /submitReport\(\{/.test(flow) && !/submitReport\(\{/.test(readFileSync('src/app/components/ReportModal.tsx', 'utf8')));
  ok('a page restored from the back/forward cache (pageshow, persisted) is reset if a send was in flight, and a sent form stays a confirmation', /addEventListener\('pageshow'/.test(flow) && /e\.persisted/.test(flow) && /p === 'sending' \? 'idle'/.test(flow));
  ok('the page remembers only a one-way code of what this tab sent, in sessionStorage, inside try/catch, never the text', /sessionStorage/.test(lib) && /crypto\.subtle\.digest\('SHA-256'/.test(lib) && !/sessionStorage\.setItem\([^)]*report[^_]/.test(lib) && /catch \{/.test(lib));
  ok('a 409 from the function becomes the plain "already sent" message, with the link to the transcript page', /status === 409/.test(lib) && /You already sent exactly this\. It is on file, and the deletion code you were given still works\. Change it if you want to send something different\./.test(lib) && /<AfterSending/.test(readFileSync('src/app/components/DeletionCode.tsx', 'utf8')));
  ok('the typed text is cleared after a successful send in every form', FIVE.every((f) => /useSendFlow\('[a-z-]+', \(\) =>/.test(readFileSync(f, 'utf8'))));
  ok('the consent screen: text first, who reads it, what we may do, 90 days, the code shown once, an unticked 18+ box, Send off until it is ticked, Send and Don\'t send alike', consent.indexOf('exactly what we would receive') < consent.indexOf('Who reads it') && /90 days/.test(consent) && /deletion code/.test(consent) && /type="checkbox"[^>]*checked=\{adult\}/.test(consent) && /useState\(false\)/.test(consent) && /disabled=\{!adult \|\| busy\}/.test(consent) && (consent.match(/variant="outline" size="lg" className="min-w-36 border-2"/g) ?? []).length === 2 && /I am 18 or older/.test(consent));
}
