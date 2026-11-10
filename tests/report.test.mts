// Sending a transcript to Nenya: only a genuine signed one gets through, and it arrives rebuilt from what was signed.
import { createHash, createHmac, generateKeyPairSync, sign as edSign } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import report, { __useStoreForTests as reportStore } from '../netlify/functions/report.mts';
import { signedJson, transcriptFilename, readableTranscript } from '../src/lib/transcript.ts';
import { eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
const other = generateKeyPairSync('ed25519');
const SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = SECRET;
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_ACCEPTED_KEY_IDS; delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET;

let forwards: { url: string; fields: Record<string, string>; file?: { name: string; type: string; text: string } }[] = [];
let forwardStatus = 200;
(globalThis as any).fetch = async (url: string, init: any) => {
  if (String(url).includes('venice')) return new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 });
  const fields: Record<string, string> = {};
  let file: { name: string; type: string; text: string } | undefined;
  for (const [k, v] of (init.body as FormData).entries()) {
    if (typeof v === 'string') fields[k] = v;
    else file = { name: v.name, type: v.type, text: await v.text() };
  }
  forwards.push({ url: String(url), fields, file });
  return new Response('ok', { status: forwardStatus });
};

const makeStore = () => {
  const m = new Map<string, { v: string; e: number }>();
  return {
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any) { const x = m.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; m.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
    json: new Map<string, any>(),
    async get(k: string, o?: any) { return o?.type === 'json' ? (this.json.get(k) ?? null) : null; }, async setJSON(k: string, v: any) { this.json.set(k, JSON.parse(JSON.stringify(v))); }, async delete(k: string) { this.json.delete(k); }, async list({ prefix }: { prefix: string }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    peek: (k: string) => m.get(k)?.v, keys: () => [...m.keys()],
  };
};
const store = makeStore();
coachStore(store); reportStore(store);

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const coachPost = async (body: any) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }))).json() as Promise<any>;
const m: any[] = []; let ticket: string | undefined; let r: any;
for (let t = 1; t <= 5; t++) { m.push({ role: 'user', content: `message ${t}` }); r = await coachPost({ messages: m, ticket }); m.push({ role: 'assistant', content: r.reply }); ticket = r.ticket; }
const rc = await coachPost({ action: 'receipt', messages: m, ticket });
const GOOD = { transcript: rc.transcript, receipt: rc.receipt };

const send = async (signed: any, opts: { note?: unknown; choices?: unknown; origin?: string | null; method?: string; path?: string; raw?: string; type?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': opts.type ?? 'application/json' };
  if (opts.origin !== null) headers.origin = opts.origin ?? 'https://nenya.biz';
  const res = await report(new Request(`https://nenya.biz${opts.path ?? '/api/report'}`, { method: opts.method ?? 'POST', headers, body: opts.method === 'GET' ? undefined : (opts.raw ?? JSON.stringify({ signed, note: opts.note, choices: 'choices' in opts ? opts.choices : { keep: '30d', uses: [] } })) }));
  const text = await res.text();
  return { status: res.status, text, json: text ? JSON.parse(text) : null };
};
const day = capDay(new Date());
const n = (e: string) => Number(store.peek(eventKey(day, e)) ?? 0);

// ---- a genuine one
let x = await send(GOOD, { note: '<b>The reply felt</b> off\u0007 today' });
ok('a genuine signed transcript is accepted', x.status === 204 && forwards.length === 1);
const f = forwards[0].fields;
ok('it is forwarded to our own site, to the separate form for signed transcripts', forwards[0].url === 'https://nenya.biz/' && f['form-name'] === 'verified-transcript' && f['bot-field'] === '');
ok('the readable text is rebuilt from the signed transcript, exactly as the page shows it', f.report === readableTranscript(m, S, rc.receipt, '', rc.transcript.meta, rc.transcript.site, rc.transcript.checks));
const sf = forwards[0].file;
ok('the signed file travels as a real JSON file and also as text in the body, for copying', !!sf && sf.type === 'application/json' && JSON.parse(sf.text).receipt.hash === rc.receipt.hash && JSON.parse(sf.text).transcript.v === 3 && JSON.parse(f.signed).receipt.hash === rc.receipt.hash);
ok('the file is exactly what the page would download, and is named by hash and time', !!sf && sf.text === signedJson(rc.transcript, rc.receipt) && sf.name === transcriptFilename(rc.receipt, 'json') && /^nenya-coach-transcript-[0-9a-f]{8}-\d{8}T\d{6}Z\.json$/.test(sf.name));
ok('the note is cleaned of markup and control characters', f.comments === 'The reply felt off today');
ok('a checked field only the function can make is attached', f.checked === createHmac('sha256', SECRET).update(`report-checked|${rc.receipt.hash}`).digest('hex'));
ok('the key id is attached, and the receipt is found in the log', f['key-id'] === rc.receipt.keyId && /^yes \(\d{4}-\d{2}-\d{2}\)$/.test(f['issued-record']));
ok('the hash and signing time are their own fields, so a submission can be found by them', f['receipt-hash'] === rc.receipt.hash && f['issued-at'] === rc.receipt.issuedAt);
ok('an accepted report is counted', n('coach.report.verified') === 1 && n('coach.report.rejected') === 0);
ok('nothing from the transcript was stored', store.keys().every((k) => !JSON.stringify(k).includes('message ')) && !store.keys().some((k) => k.startsWith('reports')));

// ---- refused, each with a short code
const refused = async (name: string, signed: any, reason: string, opts: any = {}) => {
  const before = forwards.length; const rej = n('coach.report.rejected');
  const y = await send(signed, opts);
  ok(`${name}: refused as "${reason}", nothing forwarded, counted`, y.status === 400 && y.json.reason === reason && forwards.length === before && n('coach.report.rejected') === rej + 1 && !y.text.includes('message '), `${y.status} ${y.text}`);
};
const clone = () => structuredClone(GOOD);
let t1 = clone(); t1.transcript.messages[1].content = 'A different reply'; await refused('an edited reply', t1, 'hash');
t1 = clone(); t1.transcript.meta.closed = false; await refused('changed signed facts', t1, 'hash');
t1 = clone(); t1.transcript.session.color1 = '#111111'; await refused('changed session colors', t1, 'hash');
t1 = clone(); t1.receipt.issuedAt = '2020-01-01T00:00:00.000Z'; await refused('a changed date', t1, 'signature');
t1 = clone(); t1.receipt.signature = Buffer.alloc(64).toString('base64'); await refused('a forged signature', t1, 'signature');
// a transcript someone signed with their own key: genuinely signed, but not by us
{
  const tr = structuredClone(GOOD.transcript); tr.messages[1].content = 'Invented reply';
  const hash = createHash('sha256').update(JSON.stringify(tr)).digest('hex'); const issuedAt = '2026-11-07T00:00:00.000Z';
  const pub = other.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const rec = { version: 3, algorithm: 'Ed25519', keyId: createHash('sha256').update(pub).digest('hex').slice(0, 16), publicKey: pub, hash, issuedAt, signature: edSign(null, Buffer.from(`nenya-coach-transcript-v3\n${hash}\n${issuedAt}`), other.privateKey).toString('base64') };
  await refused('a transcript signed with someone else\'s key', { transcript: tr, receipt: rec }, 'key');
  process.env.COACH_ACCEPTED_KEY_IDS = ` ${rec.keyId.toUpperCase()}, deadbeefdeadbeef `;
  const before = forwards.length; const y = await send({ transcript: tr, receipt: rec });
  ok('an earlier key listed in COACH_ACCEPTED_KEY_IDS is accepted', y.status === 204 && forwards.length === before + 1);
  delete process.env.COACH_ACCEPTED_KEY_IDS;
}
t1 = clone(); t1.receipt.keyId = '0000000000000000'; await refused('a key id that does not match the key', t1, 'key');
t1 = clone(); t1.transcript.v = 1; await refused('an unknown version', t1, 'version');
t1 = clone(); delete t1.receipt; await refused('a missing receipt', t1, 'shape');
t1 = clone(); t1.transcript.messages.pop(); await refused('a transcript that ends on a visitor message', t1, 'shape');
t1 = clone(); t1.transcript.messages[0].role = 'assistant'; await refused('roles out of order', t1, 'shape');
t1 = clone(); t1.transcript.messages[0].content = 'x'.repeat(501); await refused('a message over the length limit', t1, 'shape');
t1 = clone(); t1.transcript.meta = 'nope'; await refused('malformed signed facts', t1, 'shape');
t1 = clone(); t1.receipt.algorithm = 'RSA'; await refused('a different algorithm', t1, 'shape');
await refused('no signed object', undefined, 'shape');
await refused('not JSON at all', null, 'json', { raw: '{nope' });

// ---- an older (version 2) transcript signed by this key is still accepted, without the signed facts
{
  const old = { v: 2, session: S, messages: m.map((q: any) => ({ role: q.role, content: q.content })) };
  const hash = createHash('sha256').update(JSON.stringify(old)).digest('hex'); const issuedAt = '2026-11-01T00:00:00.000Z';
  const pub = mine.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const rec = { version: 2, algorithm: 'Ed25519', keyId: createHash('sha256').update(pub).digest('hex').slice(0, 16), publicKey: pub, hash, issuedAt, signature: edSign(null, Buffer.from(`nenya-coach-transcript-v2\n${hash}\n${issuedAt}`), mine.privateKey).toString('base64') };
  const before = forwards.length; const y = await send({ transcript: old, receipt: rec });
  ok('an older version 2 transcript is accepted', y.status === 204 && forwards.length === before + 1 && !/Conversation complete/.test(forwards[forwards.length - 1].fields.report));
  ok('and it is marked as having no record in the log', /^no record/.test(forwards[forwards.length - 1].fields['issued-record']));
}

// ---- the doors
ok('a foreign origin is refused', (await send(GOOD, { origin: 'https://evil.example' })).status === 403);
ok('a missing origin is refused', (await send(GOOD, { origin: null })).status === 403);
ok('only POST is served', (await send(GOOD, { method: 'GET' })).status === 405);
ok('only JSON is accepted', (await send(GOOD, { type: 'text/plain' })).status === 415);
ok('only the public route is served', (await send(GOOD, { path: '/.netlify/functions/report' })).status === 404);
ok('an oversized body is refused', (await send(null, { raw: JSON.stringify({ signed: GOOD, pad: 'x'.repeat(41000) }) })).status === 413);

// ---- a conversation the site ended (the stopped message is signed)
const stopRc = await coachPost({ action: 'receipt', stopped: true, messages: [{ role: 'user', content: 'I am going to kill myself tonight' }] });
const STOP_OK = { transcript: stopRc.transcript, receipt: stopRc.receipt };
const nBeforeStop = forwards.length;
const stopSent = await send(STOP_OK, { note: 'The site stopped this; I think it was a mistake.' });
ok('a genuine signed transcript of a conversation the site ended is accepted', stopSent.status === 204 && forwards.length === nBeforeStop + 1);
ok('its readable text says the site ended it', forwards[forwards.length - 1].fields.report.includes('Ended by the site') && forwards[forwards.length - 1].fields.report === readableTranscript(stopRc.transcript.messages, S, stopRc.receipt, '', stopRc.transcript.meta, stopRc.transcript.site, stopRc.transcript.checks));
const noEnded = JSON.parse(JSON.stringify(STOP_OK)); delete noEnded.transcript.meta.endedBy; delete noEnded.transcript.meta.stop;
ok('an odd number of messages without the site-ended facts is refused', (await send(noEnded)).status === 400);
const claimsEnded = JSON.parse(JSON.stringify(GOOD)); claimsEnded.transcript.meta.endedBy = 'site';
ok('a finished conversation that claims the site ended it is refused', (await send(claimsEnded)).status === 400);
const forgedStop = JSON.parse(JSON.stringify(STOP_OK)); forgedStop.transcript.messages[0].content = 'I am going to kill myself';
ok('an altered stopped message breaks the signature', (await send(forgedStop)).status === 400);

// ---- if our own form cannot be reached
forwardStatus = 500;
const vBefore = n('coach.report.verified');
const down = await send(GOOD);
ok('if the form cannot be reached the visitor gets a plain 502 and nothing is counted as accepted', down.status === 502 && n('coach.report.verified') === vBefore);
forwardStatus = 200;
coachStore(null); reportStore(null);
