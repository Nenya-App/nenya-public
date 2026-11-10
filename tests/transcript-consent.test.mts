// Sending a transcript with choices, taking them back with the signed file, and the daily deletion (docs/transcript-consent-scope.md).
import { generateKeyPairSync } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import report, { __useStoreForTests as reportStore } from '../netlify/functions/report.mts';
import revoke, { __useStoreForTests as revokeStore } from '../netlify/functions/transcript-revoke.mts';
import { expireDue, __useStoreForTests as expiryStore } from '../netlify/functions/transcript-expiry.mts';
import created, { __useStoreForTests as createdStore } from '../netlify/functions/submission-created.mts';
import { pendingKey, recordKey, type TranscriptRecord } from '../src/lib/transcriptPolicy.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_ACCEPTED_KEY_IDS; delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET;

let forwardStatus = 200; let forwards: Record<string, string>[] = []; let netlifyCalls: { url: string; method: string; auth: string }[] = []; let netlifyStatus = 204;
(globalThis as any).fetch = async (url: string, init: any) => {
  if (String(url).includes('venice')) return new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 });
  if (String(url).startsWith('https://api.netlify.com')) { netlifyCalls.push({ url: String(url), method: init.method, auth: init.headers.authorization }); return new Response(null, { status: netlifyStatus }); }
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
for (const use of [coachStore, reportStore, revokeStore, expiryStore, createdStore]) use(store);

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const coachPost = async (body: any) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }))).json() as Promise<any>;
const m: any[] = []; let ticket: string | undefined; let r: any;
for (let t = 1; t <= 5; t++) { m.push({ role: 'user', content: `message ${t}` }); r = await coachPost({ messages: m, ticket }); m.push({ role: 'assistant', content: r.reply }); ticket = r.ticket; }
const rc = await coachPost({ action: 'receipt', messages: m, ticket });
const GOOD = { transcript: rc.transcript, receipt: rc.receipt };
const hash = GOOD.receipt.hash;
const req = (fn: any, path: string, body: any) => fn(new Request(`https://nenya.biz${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }));
const send = async (choices: unknown) => { const res = await req(report, '/api/report', { signed: GOOD, choices }); const t = await res.text(); return { status: res.status, json: t ? JSON.parse(t) : null }; };
const takeBack = async (body: any) => { const res = await req(revoke, '/api/transcript-revoke', body); const t = await res.text(); return { status: res.status, json: t ? JSON.parse(t) : null }; };
const rec = (): TranscriptRecord | null => store.j.get(recordKey(hash)) ?? null;

// ── sending: the choices are required, and nothing is forwarded without them
ok('a transcript with no choices is refused and nothing is forwarded or saved', (await send(undefined)).status === 400 && (await send({ uses: [] })).status === 400 && forwards.length === 0 && !rec());
ok('a transcript with a keeping time is accepted, forwarded with the choices in plain words, and a small record is saved', (await send({ keep: '30d', uses: ['evaluate'] })).status === 204 && forwards.length === 1 && /test and improve the coach/.test(forwards[0].permissions) && /after 30 days/.test(forwards[0].permissions) && !!forwards[0]['keep-until'] && rec()?.status === 'active');
ok('the record holds the fingerprint, the choices and dates, and no conversation', (() => { const s = JSON.stringify(rec()); return s.includes(hash) && !s.includes('message 1') && !s.includes('transcript"'); })());
ok('no public copy is made unless publishing was allowed', !store.j.has(pendingKey(hash)) && rec()?.publication === 'none');

// ── sending again can only narrow
ok('sending it again with fewer allowed uses narrows them; with more it does not widen them', (await send({ keep: '1y', uses: [] })).status === 204 && rec()!.uses.length === 0 && (await send({ keep: '1y', uses: ['evaluate', 'quote'] })).status === 204 && rec()!.uses.length === 0);
ok('the earlier delete-by date stands when it is sent again with a longer keeping time', rec()!.keepUntil !== null && rec()!.keep === '30d');

// ── publishing
store.j.clear(); forwards = [];
ok('publishing needs a clear choice of what to show', (await send({ keep: '30d', uses: ['publish'], showFor: '30d' })).status === 400 && (await send({ keep: '30d', uses: ['publish'], portions: [], showFor: '30d' })).status === 400);
ok('a publish choice saves a waiting copy for a person to read, and nothing is public', (await send({ keep: '90d', uses: ['publish'], portions: [0, 1], showFor: '30d' })).status === 204 && rec()?.publication === 'pending-review' && !!store.j.get(pendingKey(hash))?.transcript && /only the chosen messages/.test(forwards[0].permissions));

// ── taking back
ok('a request with no genuine signed transcript is refused', (await takeBack({ signed: { ...GOOD, receipt: { ...GOOD.receipt, hash: 'f'.repeat(64) } }, deleteNow: true })).status === 400 && (await takeBack({ deleteNow: true })).status === 400);
ok('a request that asks for nothing is refused', (await takeBack({ signed: GOOD })).status === 400);
const back = await takeBack({ signed: GOOD, stop: ['publish'] });
ok('taking back publishing withdraws it and removes the waiting copy at once', back.status === 200 && back.json.publication === 'withdrawn' && !back.json.uses.includes('publish') && !store.j.has(pendingKey(hash)));
ok('a transcript we were never sent is not found', (() => { store.j.clear(); return true; })() && (await takeBack({ signed: GOOD, deleteNow: true })).status === 404);

// ── a failed forward leaves nothing behind
forwardStatus = 500; forwards = [];
ok('if forwarding fails, the new record and any waiting copy are removed', (await send({ keep: '30d', uses: ['publish'], portions: 'all', showFor: '30d' })).status === 502 && !rec() && !store.j.has(pendingKey(hash)));
forwardStatus = 200;

// ── deletion
await send({ keep: '30d', uses: ['evaluate'] });
await created(new Request('https://nenya.biz/.netlify/functions/submission-created', { method: 'POST', body: JSON.stringify({ payload: { id: 'sub123', form_name: 'verified-transcript', data: { 'receipt-hash': hash } } }) }));
ok('the stored submission id is recorded when Netlify reports the submission', rec()?.submissionId === 'sub123');
await created(new Request('https://x/', { method: 'POST', body: JSON.stringify({ payload: { id: 'zzz', form_name: 'other-form', data: { 'receipt-hash': hash } } }) }));
ok('submissions from other forms are ignored', rec()?.submissionId === 'sub123');
const soon = new Date(Date.now() + 40 * 86400e3);
ok('nothing is deleted before its time', (await expireDue(new Date(), { NETLIFY_API_TOKEN: 't' })).deleted === 0 && netlifyCalls.length === 0 && rec()?.status === 'active');
const noToken = await expireDue(soon, {});
ok('without the owner\'s Netlify token, a due submission is counted as needing a hand, not marked deleted', noToken.deleted === 0 && noToken.manual === 1 && rec()?.status === 'active');
const done = await expireDue(soon, { NETLIFY_API_TOKEN: 't' });
ok('when its time has passed, the submission is deleted through the Netlify API and the record becomes a marker with no choices', done.deleted === 1 && netlifyCalls.length === 1 && netlifyCalls[0].method === 'DELETE' && netlifyCalls[0].url.endsWith('/sub123') && netlifyCalls[0].auth === 'Bearer t' && rec()?.status === 'deleted' && rec()!.uses.length === 0);
ok('a deleted record is not deleted again', (await expireDue(soon, { NETLIFY_API_TOKEN: 't' })).deleted === 0 && netlifyCalls.length === 1);
// asking for deletion with the signed file
await send({ keep: 'until-asked', uses: ['quote'] });
store.j.set(recordKey(hash), { ...rec()!, submissionId: 'sub9' });
ok('asking for deletion with the signed file makes it due at once, even with no end date', (await takeBack({ signed: GOOD, deleteNow: true })).json?.status === 'deletion-requested' && (await expireDue(new Date(), { NETLIFY_API_TOKEN: 't' })).deleted === 1 && rec()?.status === 'deleted');

// ── the screens
import { readFileSync } from 'node:fs';
const src = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const page = src('src/mytranscript/MyTranscriptPage.tsx');
ok('the take-back page is its own page, checks the file on the device first, and sends only to the revoke route', /verifySigned\(got\.file\)/.test(page) && (page.match(/fetch\(/g) ?? []).length === 1 && /fetch\('\/api\/transcript-revoke'/.test(page) && !/localStorage|sessionStorage|document\.cookie/.test(page));
ok('the verify page still sends nothing', !/fetch\(/.test(src('src/verify/TranscriptChecker.tsx') + src('src/verify/VerifyPage.tsx')));
ok('the take-back page is built, and is in no sitemap', /myTranscript: path\.resolve\(__dirname, 'my-transcript\/index\.html'\)/.test(src('vite.config.ts')) && !/my-transcript/.test(src('public/sitemap.xml')));
const tools = src('src/coach/TranscriptTools.tsx') + src('src/coach/TranscriptChoices.tsx');
ok('sending is not possible until a keeping time is chosen; nothing is preselected; the page where to take it back is named', /!toSend/.test(tools) && /keep: null, uses: \[\]/.test(tools) && /nenya\.biz\/my-transcript/.test(tools));
ok('the static form lists the two new fields', /name="permissions"/.test(src('index.html')) && /name="keep-until"/.test(src('index.html')));
