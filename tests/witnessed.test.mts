// The "witnessed conversations" safeguards: never offered after a stop, anonymized automatically, reviewed by hand, public only while allowed.
import { generateKeyPairSync } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import report, { __useStoreForTests as reportStore } from '../netlify/functions/report.mts';
import revoke, { __useStoreForTests as revokeStore } from '../netlify/functions/transcript-revoke.mts';
import { expireDue, __useStoreForTests as expiryStore } from '../netlify/functions/transcript-expiry.mts';
import review, { __useStoreForTests as reviewStore, __useUserForTests as reviewUser } from '../netlify/functions/witnessed-review.mts';
import witnessed, { __useStoreForTests as witnessedStore } from '../netlify/functions/witnessed.mts';
import { anonymize, reviewProblem, stopLevelFlagged } from '../src/lib/publicCopy.ts';
import { pendingKey, publicKey, recordKey } from '../src/lib/transcriptPolicy.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_ACCEPTED_KEY_IDS; delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET; delete process.env.NENYA_OWNER_TOKEN;
(globalThis as any).fetch = async (url: string) => String(url).includes('venice') ? new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 }) : new Response('ok', { status: 200 });
const mk = () => { const j = new Map<string, any>(); return { j, async getWithMetadata() { return null; }, async set() { return { modified: true }; }, async get(k: string, o?: any) { return o?.type === 'json' ? (j.get(k) ?? null) : null; }, async setJSON(k: string, v: any) { j.set(k, JSON.parse(JSON.stringify(v))); }, async delete(k: string) { j.delete(k); }, async list({ prefix }: { prefix: string }) { return { blobs: [...j.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; } }; };
const store = mk();
for (const use of [coachStore, reportStore, revokeStore, expiryStore, reviewStore, witnessedStore]) use(store);
let owner = true; reviewUser(async () => (owner ? { roles: ['Owner'] } : null));

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const coachPost = async (body: any) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }))).json() as Promise<any>;
const m: any[] = []; let ticket: string | undefined; let r: any;
for (const text of ['I talked with Maria Santos at maria@example.com about work', 'it was a long week', 'my manager is hard to read', 'I feel tired', 'I want some calm']) { m.push({ role: 'user', content: text }); r = await coachPost({ messages: m, ticket }); m.push({ role: 'assistant', content: r.reply }); ticket = r.ticket; }
const rc = await coachPost({ action: 'receipt', messages: m, ticket });
const GOOD = { transcript: rc.transcript, receipt: rc.receipt };
const hash = GOOD.receipt.hash;
const stopRc = await coachPost({ action: 'receipt', stopped: true, messages: [{ role: 'user', content: 'I am going to kill myself tonight' }] });
const STOPPED = { transcript: stopRc.transcript, receipt: stopRc.receipt };

const call = async (fn: any, path: string, body?: any, method = 'POST') => { const res = await fn(new Request(`https://nenya.biz${path}`, { method, headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: method === 'GET' ? undefined : JSON.stringify(body) })); const t = await res.text(); return { status: res.status, json: t ? JSON.parse(t) : null }; };
const send = (signed: any, choices: any) => call(report, '/api/report', { signed, choices });

// ── the stop-level gate
ok('a stopped conversation is recognised, an ordinary one is not', stopLevelFlagged(STOPPED.transcript) && !stopLevelFlagged(GOOD.transcript) && !stopLevelFlagged(null) && !stopLevelFlagged({ meta: undefined, checks: [{ message: 0, tier: 'soften', category: 'distress', source: 'phrase' } as any] }));
ok('a stopped conversation can be sent for other uses, but never for publishing', (await send(STOPPED, { keep: '30d', uses: ['evaluate'] })).status === 204 && (await send(STOPPED, { keep: '30d', uses: ['publish'], portions: 'all', showFor: '30d' })).json?.reason === 'publish-not-allowed' && !store.j.has(pendingKey(STOPPED.receipt.hash)));

// ── the automatic anonymizing
const draft = anonymize(GOOD.transcript, 'all');
const all = JSON.stringify(draft.items);
ok('the draft marks each message by its writer and replaces an email and a name again', draft.items[0].by === 'person' && draft.items[1].by === 'ai' && !/maria@example\.com/.test(all) && draft.items.length === 10);
ok('only the chosen messages are drafted', anonymize(GOOD.transcript, [0, 2]).items.map((x) => x.n).join() === '0,2' && anonymize(GOOD.transcript, [50]).items.length === 0);
ok('the draft carries no colors, key id or date', !/#7A9B9E|keyId|issuedAt|session/.test(all));
ok('the reviewer\'s final copy is refused if it has the wrong shape or still has an identifier', reviewProblem([]) === 'shape' && reviewProblem([{ by: 'person', text: '' }]) === 'shape' && reviewProblem([{ by: 'robot', text: 'x' }]) === 'shape' && reviewProblem([{ by: 'person', text: 'write to me@example.com' }]) === 'still-identifying' && reviewProblem([{ by: 'person', text: 'A calm week.' }]) === null);

// ── sending for publishing, then review
ok('allowing publishing waits for a person: nothing is public', (await send(GOOD, { keep: '90d', uses: ['publish'], portions: 'all', showFor: '30d' })).status === 204 && store.j.get(recordKey(hash)).publication === 'pending-review' && (await call(witnessed, '/api/witnessed', undefined, 'GET')).json.conversations.length === 0);
ok('only the owner can use the review function', (owner = false, (await call(review, '/api/witnessed-review', { action: 'list' })).status === 401) && (owner = true));
const listed = await call(review, '/api/witnessed-review', { action: 'list' });
ok('the owner sees the waiting conversation with an anonymized draft and not the signed original', listed.status === 200 && listed.json.pending.length === 1 && listed.json.pending[0].hash === hash && !/maria@example\.com/.test(JSON.stringify(listed.json)) && !/signature|"transcript"/.test(JSON.stringify(listed.json)));
ok('approval is refused with the wrong text, a wrong hash, or a missing action', (await call(review, '/api/witnessed-review', { action: 'approve', hash, items: [{ by: 'person', text: 'me@example.com' }] })).status === 422 && (await call(review, '/api/witnessed-review', { action: 'approve', hash: 'zz', items: [] })).status === 400 && (await call(review, '/api/witnessed-review', { action: 'nope', hash })).status === 400);
const approve = await call(review, '/api/witnessed-review', { action: 'approve', hash, items: [{ by: 'person', text: 'I talked with someone about work.' }, { by: 'ai', text: 'That sounds heavy.' }] });
ok('approving makes it public, stores the reviewed copy, and deletes the signed original from the waiting store', approve.status === 200 && store.j.has(publicKey(hash)) && !store.j.has(pendingKey(hash)) && store.j.get(recordKey(hash)).publication === 'public');
const pub = await call(witnessed, '/api/witnessed', undefined, 'GET');
ok('the public page lists it with a short fingerprint and the month, and nothing that identifies', pub.json.conversations.length === 1 && pub.json.conversations[0].fingerprint === hash.slice(0, 12) && /^\d{4}-\d{2}$/.test(pub.json.conversations[0].month) && !/color|keyId|issuedAt|hash"/.test(JSON.stringify(pub.json)));
ok('it is never cached', (await witnessed(new Request('https://nenya.biz/api/witnessed'))).headers.get('cache-control') === 'no-store');

// ── withdrawing, rejecting and expiring
const back = await call(revoke, '/api/transcript-revoke', { signed: GOOD, stop: ['publish'] });
ok('taking publishing back removes the public copy at once', back.status === 200 && !store.j.has(publicKey(hash)) && (await call(witnessed, '/api/witnessed', undefined, 'GET')).json.conversations.length === 0);
await send(GOOD, { keep: '30d', uses: ['publish'], portions: [0], showFor: '30d' });
ok('a record whose publishing was withdrawn is not put back by sending the transcript again', store.j.get(recordKey(hash)).publication === 'withdrawn' && !store.j.has(pendingKey(hash)) && !store.j.get(recordKey(hash)).uses.includes('publish'));
store.j.clear();
await send(GOOD, { keep: '30d', uses: ['publish'], portions: 'all', showFor: '30d' });
ok('rejecting deletes the waiting copy and keeps nothing public', (await call(review, '/api/witnessed-review', { action: 'reject', hash })).json?.publication === 'withdrawn' && !store.j.has(pendingKey(hash)) && !store.j.has(publicKey(hash)));
store.j.clear();
await send(GOOD, { keep: '30d', uses: ['publish'], portions: 'all', showFor: '30d' });
await call(review, '/api/witnessed-review', { action: 'approve', hash, items: [{ by: 'person', text: 'A calm week.' }] });
ok('a public copy disappears when its keeping time ends', (await call(witnessed, '/api/witnessed', undefined, 'GET')).json.conversations.length === 1 && (await expireDue(new Date(Date.now() + 40 * 86400e3), {})).manual === 1 && !store.j.has(publicKey(hash)));

// ── how long it may stay up, and what needs a hand
store.j.clear();
await send(GOOD, { keep: '1y', uses: ['publish'], portions: 'all', showFor: '30d' });
ok('a showing time longer than the keeping time is refused', (await send(GOOD, { keep: '30d', uses: ['publish'], portions: 'all', showFor: '1y' })).status === 400);
await call(review, '/api/witnessed-review', { action: 'approve', hash, items: [{ by: 'person', text: 'A calm week.' }] });
const up = store.j.get(recordKey(hash));
ok('approving starts the clock: the day it must come down is set', up.publication === 'public' && !!up.publicUntil && up.showFor === '30d');
const later = new Date(Date.now() + 40 * 86400e3);
const ran = await expireDue(later, {});
ok('after its showing time the public copy comes down by itself while the transcript is still kept', ran.manual === 0 && !store.j.has(publicKey(hash)) && store.j.get(recordKey(hash)).publication === 'withdrawn' && store.j.get(recordKey(hash)).status === 'active' && (await call(witnessed, '/api/witnessed', undefined, 'GET')).json.conversations.length === 0);
// deletions that need a person
store.j.clear();
await send(GOOD, { keep: '30d', uses: ['evaluate'] });
ok('nothing waits for a person before anything is due', (await call(review, '/api/witnessed-review', { action: 'deletions' })).json.waiting.length === 0);
await call(revoke, '/api/transcript-revoke', { signed: GOOD, deleteNow: true });
const waiting = await call(review, '/api/witnessed-review', { action: 'deletions' });
ok('a deletion the person asked for waits in a list for the owner, with what to do by hand', waiting.json.waiting.length === 1 && waiting.json.waiting[0].hash === hash && /notification email/.test(waiting.json.waiting[0].todo.join(' ')) && !/messages|content/.test(JSON.stringify(waiting.json)));
ok('only the owner can see that list or mark things done', (owner = false, (await call(review, '/api/witnessed-review', { action: 'deletions' })).status === 401 && (await call(review, '/api/witnessed-review', { action: 'mark-deleted', hash })).status === 401) && (owner = true));
ok('the owner marks it deleted after doing it by hand; it leaves the list and becomes a marker', (await call(review, '/api/witnessed-review', { action: 'mark-deleted', hash })).json?.status === 'deleted' && store.j.get(recordKey(hash)).status === 'deleted' && (await call(review, '/api/witnessed-review', { action: 'deletions' })).json.waiting.length === 0);
ok('something not yet due cannot be marked deleted', (await send(GOOD, { keep: '30d', uses: [] })).status === 204 && (await call(review, '/api/witnessed-review', { action: 'mark-deleted', hash })).status === 404);

// ── the owner's panel
import { readFileSync } from 'node:fs';
const panel = readFileSync(new URL('../src/admin/WitnessedPanel.tsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/admin/AdminPage.tsx', import.meta.url), 'utf8');
ok('the panel calls only the owner-only review function, and is part of the owner\'s page', (panel.match(/fetch\(/g) ?? []).length === 1 && /fetch\('\/api\/witnessed-review'/.test(panel) && /<WitnessedPanel /.test(admin));
ok('approving is impossible until the owner says they read every message, and each message can be edited or left out', /disabled=\{busy \|\| !read\[p\.hash\]/.test(panel) && /Leave this message out/.test(panel) && /I read every message/.test(panel));
ok('the panel says which messages the site wrote and shows softer safety flags', /The site \(not the AI\)/.test(panel) && /softFlags/.test(panel));
ok('the panel stores nothing in the browser', !/localStorage|sessionStorage|document\.cookie/.test(panel));
