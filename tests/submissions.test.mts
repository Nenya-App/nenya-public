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
const { KEEP_DAYS, PREFIX, isDue, keyForCode, makeCode, normalizeCode } = await import('../src/lib/submissions.ts');
submit.__useStoreForTests(store);
expiry.__useStoreForTests(store);
owner.__useStoreForTests(store);
owner.__useUserForTests(async () => null);
import { ok } from './helpers.mts';

const post = (body: unknown, origin = 'https://nenya.biz') =>
  submit.default(new Request('https://nenya.biz/api/submit', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body) }));
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
ok('all five forms show the deletion code', ['src/app/components/ReportModal.tsx', 'src/app/components/SubmitSensoryReportForm.tsx', 'src/app/components/ContactSection.tsx', 'src/coach/FailureNotice.tsx', 'src/coach/FlagNotice.tsx'].every((f) => /<DeletionCode receipt=\{receipt\} \/>/.test(readFileSync(f, 'utf8')) && /setReceipt\(await submitReport\(/.test(readFileSync(f, 'utf8'))));
ok('the sender can delete with the code on /my-transcript', /<DeleteSubmission \/>/.test(readFileSync('src/mytranscript/MyTranscriptPage.tsx', 'utf8')));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const t = JSON.stringify(LEGAL_PARTS);
  ok('the Terms say 90 days, the deletion code, and that the email carries no text; the old "no schedule" line is gone', /kept for 90 days and then deleted automatically/.test(t) && /deletion code/.test(t) && /never what it says/.test(t) && !/no automatic deletion schedule yet/.test(t));
}
