// Sending a transcript with choices, taking them back with the signed file, and the daily deletion (docs/transcript-consent-scope.md).
import { generateKeyPairSync } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import report, { __useStoreForTests as reportStore } from '../netlify/functions/report.mts';
import revoke, { __useStoreForTests as revokeStore } from '../netlify/functions/transcript-revoke.mts';
import { expireDue, __useStoreForTests as expiryStore } from '../netlify/functions/transcript-expiry.mts';
import { pendingKey, recordKey, type TranscriptRecord } from '../src/lib/transcriptPolicy.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_ACCEPTED_KEY_IDS; delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET;

let forwardStatus = 200; let forwards: Record<string, string>[] = []; let netlifyCalls = 0;
(globalThis as any).fetch = async (url: string, init: any) => {
  if (String(url).includes('venice')) return new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 });
  if (String(url).includes('api.netlify.com')) netlifyCalls++; // nothing may ever call Netlify's API
  const f: Record<string, string> = {}; for (const [k, v] of (init.body as FormData).entries()) if (typeof v === 'string') f[k] = v; forwards.push(f);
  return new Response('ok', { status: forwardStatus });
};
const makeStore = () => {
  const j = new Map<string, any>();
  return { j,
    async getWithMetadata() { return null; }, async set() { return { modified: true }; },
    async get(k: string, o?: any) { return o?.type === 'json' ? (j.get(k) ?? null) : null; }, async setJSON(k: string, v: any) { j.set(k, JSON.parse(JSON.stringify(v))); }, async delete(k: string) { j.delete(k); },
    async list({ prefix }: { prefix: string }) { return { blobs: [...j.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; } };
};
const store = makeStore();
for (const use of [coachStore, reportStore, revokeStore, expiryStore]) use(store);

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const coachPost = async (body: any) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }))).json() as Promise<any>;
const m: any[] = []; let ticket: string | undefined; let r: any;
for (let t = 1; t <= 5; t++) { m.push({ role: 'user', content: `message ${t}` }); r = await coachPost({ messages: m, ticket }); m.push({ role: 'assistant', content: r.reply }); ticket = r.ticket; }
const rc = await coachPost({ action: 'receipt', messages: m, ticket });
const GOOD = { transcript: rc.transcript, receipt: rc.receipt };
const hash = GOOD.receipt.hash;
const req = (fn: any, path: string, body: any) => fn(new Request(`https://nenya.biz${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }));
const withAdult = (c: any) => (c && typeof c === 'object' && !Array.isArray(c) && !('adult' in c) ? { adult: true, ...c } : c);
const send = async (choices: unknown) => { const res = await req(report, '/api/report', { signed: GOOD, choices: withAdult(choices) }); const t = await res.text(); return { status: res.status, json: t ? JSON.parse(t) : null }; };
const takeBack = async (body: any) => { const res = await req(revoke, '/api/transcript-revoke', body); const t = await res.text(); return { status: res.status, json: t ? JSON.parse(t) : null }; };
const rec = (): TranscriptRecord | null => store.j.get(recordKey(hash)) ?? null;

// ── sending: the choices are required, and nothing is forwarded without them
ok('a transcript with no choices is refused and nothing is forwarded or saved', (await send(undefined)).status === 400 && (await send({ uses: [] })).status === 400 && forwards.length === 0 && !rec());
ok('a transcript with a keeping time is accepted, forwarded with the choices in plain words, and a small record is saved', (await send({ keep: '30d', uses: ['evaluate'] })).status < 300 && forwards.length === 1 && /test and improve the coach/.test(forwards[0].permissions) && /after 30 days/.test(forwards[0].permissions) && !!forwards[0]['keep-until'] && rec()?.status === 'active');
ok('the record holds the fingerprint, the choices and dates, and no conversation', (() => { const s = JSON.stringify(rec()); return s.includes(hash) && !s.includes('message 1') && !s.includes('transcript"'); })());
ok('no public copy is made unless publishing was allowed', !store.j.has(pendingKey(hash)) && rec()?.publication === 'none');

// ── sending again can only narrow
ok('sending it again with fewer allowed uses narrows them; with more it does not widen them', (await send({ keep: '1y', uses: [] })).status < 300 && rec()!.uses.length === 0 && (await send({ keep: '1y', uses: ['evaluate', 'quote'] })).status < 300 && rec()!.uses.length === 0);
ok('the earlier delete-by date stands when it is sent again with a longer keeping time', rec()!.keepUntil !== null && rec()!.keep === '30d');

// ── publishing
store.j.clear(); forwards = [];
ok('publishing needs a clear choice of what to show', (await send({ keep: '30d', uses: ['publish'], showFor: '30d' })).status === 400 && (await send({ keep: '30d', uses: ['publish'], portions: [], showFor: '30d' })).status === 400);
ok('a publish choice saves a waiting copy for a person to read, and nothing is public', (await send({ keep: '90d', uses: ['publish'], portions: [0, 1], showFor: '30d' })).status < 300 && rec()?.publication === 'pending-review' && !!store.j.get(pendingKey(hash))?.transcript && /only the chosen messages/.test(forwards[0].permissions));

// ── taking back
ok('a request with no genuine signed transcript is refused', (await takeBack({ signed: { ...GOOD, receipt: { ...GOOD.receipt, hash: 'f'.repeat(64) } }, deleteNow: true })).status === 400 && (await takeBack({ deleteNow: true })).status === 400);
ok('a request that asks for nothing is refused', (await takeBack({ signed: GOOD })).status === 400);
const back = await takeBack({ signed: GOOD, stop: ['publish'] });
ok('taking back publishing withdraws it and removes the waiting copy at once', back.status === 200 && back.json.publication === 'withdrawn' && !back.json.uses.includes('publish') && !store.j.has(pendingKey(hash)));
ok('a transcript we were never sent is not found', (() => { store.j.clear(); return true; })() && (await takeBack({ signed: GOOD, deleteNow: true })).status === 404);

// ── a failed email alert does not lose or fail the transcript
forwardStatus = 500; forwards = [];
ok('if only the owner\'s email alert fails, the transcript, its record and any waiting copy are kept and the visitor is not failed', (await send({ keep: '30d', uses: ['publish'], portions: 'all', showFor: '30d' })).status < 300 && !!rec() && !!store.j.get('inbox/' + hash) && !!store.j.get(pendingKey(hash)));
{
  const realSet = store.setJSON.bind(store);
  store.setJSON = async () => { throw new Error('down'); };
  const failed = await send({ keep: '30d', uses: [] });
  store.setJSON = realSet;
  ok('if the store itself cannot be written, nothing is promised: the visitor is told so (503)', failed.status === 503);
}
forwardStatus = 200;

// ── deletion
await send({ keep: '30d', uses: ['evaluate'] });
ok('the conversation is in our private inbox, not in the form, and the inbox entry holds the choices in plain words', !!store.j.get('inbox/' + hash) && /after 30 days/.test(store.j.get('inbox/' + hash).permissions) && forwards.every((f) => !('report' in f) && !('signed' in f)));
const soon = new Date(Date.now() + 40 * 86400e3);
ok('nothing is deleted before its time', (await expireDue(new Date())).deleted === 0 && !!store.j.get('inbox/' + hash) && rec()?.status === 'active');
const done = await expireDue(soon);
ok('when its time has passed, every copy is deleted from our own store, with no token and no call to Netlify, and the record becomes a marker with no choices', done.deleted === 1 && !store.j.has('inbox/' + hash) && rec()?.status === 'deleted' && rec()!.uses.length === 0 && netlifyCalls === 0);
ok('a deleted record is not deleted again', (await expireDue(soon)).deleted === 0);
// asking for deletion with the signed file deletes at once
await send({ keep: 'until-asked', uses: ['quote'] });
const gone = await takeBack({ signed: GOOD, deleteNow: true });
ok('asking for deletion with the signed file deletes every copy now, even with no end date', gone.json?.status === 'deleted' && !store.j.has('inbox/' + hash) && rec()?.status === 'deleted' && gone.json.uses.length === 0);
// if the store cannot delete, the request is kept and the daily job finishes it
await send({ keep: 'until-asked', uses: ['quote'] });
const realDelete = store.delete.bind(store); let failOnce = true;
store.delete = async (k: string) => { if (failOnce && k.startsWith('inbox/')) { failOnce = false; throw new Error('store down'); } return realDelete(k); };
const half = await takeBack({ signed: GOOD, deleteNow: true });
ok('if a deletion fails, the request is recorded as requested and the copy is still there', half.json?.status === 'deletion-requested' && !!store.j.get('inbox/' + hash));
store.delete = realDelete;
ok('the daily job then finishes it', (await expireDue(new Date())).deleted === 1 && !store.j.has('inbox/' + hash) && rec()?.status === 'deleted');
ok('nothing in this flow ever called Netlify\'s API', netlifyCalls === 0);

// ── the screens
import { readFileSync } from 'node:fs';
const src = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const page = src('src/mytranscript/MyTranscriptPage.tsx');
ok('the take-back page is its own page, checks the file on the device first, and sends only to the revoke route', /verifySigned\(got\.file\)/.test(page) && (page.match(/fetch\(/g) ?? []).length === 1 && /fetch\('\/api\/transcript-revoke'/.test(page) && !/localStorage|sessionStorage|document\.cookie/.test(page));
ok('the verify page still sends nothing', !/fetch\(/.test(src('src/verify/TranscriptChecker.tsx') + src('src/verify/VerifyPage.tsx')));
ok('the take-back page is built, and is in no sitemap', /myTranscript: path\.resolve\(__dirname, 'my-transcript\/index\.html'\)/.test(src('vite.config.ts')) && !/my-transcript/.test(src('public/sitemap.xml')));
const tools = src('src/coach/TranscriptTools.tsx') + src('src/coach/TranscriptChoices.tsx');
ok('sending is not possible until a keeping time is chosen; nothing is preselected; the page where to take it back is named', /!toSend/.test(tools) && /keep: null, uses: \[\]/.test(tools) && /nenya\.biz\/my-transcript/.test(tools));
ok('the static form is only the content-free alert: it has the choices but no field for the conversation or the note', /name="permissions"/.test(src('index.html')) && /name="keep-until"/.test(src('index.html')) && !/name="report"|name="signed"|name="comments"|type="file"/.test(src('index.html').slice(src('index.html').indexOf('verified-transcript'))));

// ── the 18+ statement, training as a fourth choice, and the signed consent receipt (2026-11-10)
{
  const { verifyConsent } = await import('../src/lib/consentReceipt.ts');
  const { CONSENT_TERMS_VERSION, parseChoices, newRecord, applyRevocation, mergeResend, describeChoices, USES } = await import('../src/lib/transcriptPolicy.ts');
  const noAdult = await send({ adult: false, keep: '30d', uses: ['evaluate'] });
  ok('without "I am 18 or older, and these are my own words" nothing is accepted or kept', noAdult.status === 400);
  const withTrain = await send({ keep: '30d', uses: ['train', 'evaluate'] });
  const cr = withTrain.json?.consentReceipt;
  ok('with the statement and a training choice it is accepted and a signed consent receipt comes back', withTrain.status === 200 && !!cr && cr.kind === 'nenya-consent-receipt' && cr.transcript === hash && cr.uses.includes('train') && cr.adult === true && cr.terms === CONSENT_TERMS_VERSION);
  ok('the receipt\'s signature checks, and changing a field breaks it', verifyConsent(cr) && !verifyConsent({ ...cr, uses: ['evaluate'] }) && !verifyConsent({ ...cr, adult: false }));
  ok('the receipt holds no conversation', !JSON.stringify(cr).includes('message 1'));
  ok('training is a fourth, separate choice', USES.length === 4 && (USES as readonly string[]).includes('train') && parseChoices({ adult: true, keep: '30d', uses: ['train'] })?.uses.join() === 'train');
  const c = parseChoices({ adult: true, keep: '90d', uses: ['train', 'evaluate'] })!;
  const r = newRecord('a'.repeat(64), c, new Date('2026-11-10T00:00:00Z'));
  ok('a record with training waits for a person: nothing is used until it is read and edited by hand', r.training === 'pending-review' && r.adult === true && r.terms === CONSENT_TERMS_VERSION);
  ok('taking training back withdraws it from future training and leaves the other uses', (() => { const n = applyRevocation(r, { stop: ['train'] }, new Date()); return n.training === 'withdrawn' && n.uses.includes('evaluate') && !n.uses.includes('train'); })());
  ok('asking for deletion also withdraws it', applyRevocation(r, { deleteNow: true }, new Date()).training === 'withdrawn');
  ok('sending again without training withdraws it; sending again with it keeps the state', mergeResend(r, newRecord('a'.repeat(64), parseChoices({ adult: true, keep: '90d', uses: ['evaluate'] })!, new Date())).training === 'withdrawn' && mergeResend(r, r).training === 'pending-review');
  ok('the plain-words description says the person confirmed 18+, and that there is no other use when none was chosen', describeChoices(c).includes('18 or older') && describeChoices(parseChoices({ adult: true, keep: '30d' })!).includes('not used for training'));
}
