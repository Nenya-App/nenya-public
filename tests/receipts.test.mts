// Receipts: the signed facts, the daily count by key, the 30-day hash log, and that older (version 2) files still verify.
import { BUILD_INFO } from '../src/generated/build-info.ts';
import { formatBuild } from '../src/lib/buildInfo.ts';
import { createHash, generateKeyPairSync, sign as edSign } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import handler, { __useStoreForTests, __instructionsFingerprint } from '../netlify/functions/coach.mts';
import { recordReceipt, receiptRecordedOn, cleanupReceiptRecords, receiptKey, RECEIPT_KEEP_DAYS } from '../src/lib/receiptLog.ts';
import { eventKey, isKnownEvent } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { readableTranscript } from '../src/lib/transcript.ts';
import { ok } from './helpers.mts';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_IP_SECRET; delete process.env.COACH_BUILD;
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 });

const makeStore = () => {
  const m = new Map<string, { v: string; e: number }>();
  return {
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any) { const x = m.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; m.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
    async get() { return null; },
    async list({ prefix }: { prefix: string }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { m.delete(k); },
    peek: (k: string) => m.get(k)?.v, keys: () => [...m.keys()], put: (k: string, v = '1') => m.set(k, { v, e: 1 }),
  };
};
const store = makeStore();
__useStoreForTests(store);
const S = { color1: '#7A9B9E', color2: '#DAC682' };
const post = async (body: any) => { const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) })); return r.json() as Promise<any>; };

async function conversation(turns: number) {
  const m: any[] = []; let ticket: string | undefined; let last: any;
  for (let t = 1; t <= turns; t++) { m.push({ role: 'user', content: `message ${t}` }); last = await post({ messages: m, ticket }); m.push({ role: 'assistant', content: last.reply }); ticket = last.ticket; }
  return { m, ticket };
}

// a partial conversation
const two = await conversation(2);
const part = await post({ action: 'receipt', messages: two.m, ticket: two.ticket });
ok('a partial conversation is signed as not complete, with its exchange count', part.transcript.meta.closed === false && part.transcript.meta.exchanges === 2);
// a full conversation
const five = await conversation(5);
const full = await post({ action: 'receipt', messages: five.m, ticket: five.ticket });
ok('a full conversation is signed as complete', full.transcript.meta.closed === true && full.transcript.meta.exchanges === 5);
ok('the build is the version written into the code at build time, not read from the host at run time', full.transcript.meta.build === formatBuild(BUILD_INFO) && /^\d+\.\d+\.\d+(-[a-z0-9-]+)?\+([0-9a-f]{7}|nogit)$/.test(full.transcript.meta.build), full.transcript.meta.build);
process.env.COACH_BUILD = 'my-build';
const alt = await post({ action: 'receipt', messages: five.m, ticket: five.ticket });
ok('an explicit COACH_BUILD wins', alt.transcript.meta.build === 'my-build');
delete process.env.COACH_BUILD;
const unk = await post({ action: 'receipt', messages: five.m, ticket: five.ticket });
ok('the build never says unknown', unk.transcript.meta.build !== 'unknown' && unk.transcript.meta.build === full.transcript.meta.build);
ok('the model is recorded', full.transcript.meta.model === 'deepseek-v3.2');
ok('the instruction fingerprint is 16 hex characters and stable', /^[0-9a-f]{16}$/.test(full.transcript.meta.instructions) && full.transcript.meta.instructions === __instructionsFingerprint() && __instructionsFingerprint() === __instructionsFingerprint());
ok('the key order is version, session, meta, site, messages', Object.keys(full.transcript).join() === 'v,session,meta,site,messages');
ok('the receipt is version 3 and its hash is of the transcript as returned', full.receipt.version === 3 && full.receipt.hash === createHash('sha256').update(JSON.stringify(full.transcript)).digest('hex'));

// counts and the hash log
const day = capDay(new Date());
const key = full.receipt.keyId;
ok('a daily count of receipts issued is kept by key', Number(store.peek(eventKey(day, `coach.receipt.issued.${key}`))) >= 3 && isKnownEvent(`coach.receipt.issued.${key}`));
ok("each receipt's hash is in the log for today", store.peek(receiptKey(day, full.receipt.hash)) === '1' && store.peek(receiptKey(day, part.receipt.hash)) === '1');
ok('the log holds only the day and the hash', store.keys().filter((k) => k.startsWith('r/')).every((k) => /^r\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{64}$/.test(k)));
ok('nothing from the conversation is in any stored key', !JSON.stringify(store.keys()).includes('message '));

// the log itself
const ls = makeStore();
const h1 = 'a'.repeat(64);
const nowD = new Date('2026-11-07T18:00:00Z');
ok('a new hash is recorded', (await recordReceipt(ls, h1, nowD)) === 'new');
ok('the same hash again the same day is a duplicate', (await recordReceipt(ls, h1, nowD)) === 'duplicate');
ok('anything that is not a hash is refused', (await recordReceipt(ls, 'short', nowD)) === 'failed' && (await recordReceipt(ls, 'A'.repeat(64), nowD)) === 'failed');
ok('a store that is down does not throw', (await recordReceipt({ getWithMetadata: async () => null, set: async () => { throw new Error('x'); } } as any, h1, nowD)) === 'failed');
ok('a recorded receipt can be found, with its day', (await receiptRecordedOn(ls as any, h1)) === '2026-11-07' && (await receiptRecordedOn(ls as any, 'b'.repeat(64))) === null);
ls.put(receiptKey('2026-10-01', 'c'.repeat(64))); ls.put(receiptKey('2026-10-08', 'd'.repeat(64))); ls.put('c/2026-10-01/zzzz'); ls.put('m/2026-10-01/coach.turn.sent', '9');
const removed = await cleanupReceiptRecords(ls as any, nowD);
ok(`records older than ${RECEIPT_KEEP_DAYS} days are deleted`, removed === 1 && ls.keys().includes(receiptKey('2026-10-08', 'd'.repeat(64))) === true && !ls.keys().includes(receiptKey('2026-10-01', 'c'.repeat(64))));
ok('recent records, connection records and totals are untouched', ls.keys().includes(receiptKey('2026-11-07', h1)) && ls.keys().includes('c/2026-10-01/zzzz') && ls.keys().includes('m/2026-10-01/coach.turn.sent'));

// the readable copy carries the signed facts
const readable = readableTranscript(five.m, S, full.receipt, '', full.transcript.meta);
ok('the readable copy says whether the conversation is complete and which version wrote it', /Conversation complete: yes \(5 exchanges\)/.test(readable) && readable.includes(`build ${full.transcript.meta.build}, model deepseek-v3.2, instructions `));
ok('a partial one says so', /Conversation complete: no, stopped after 2 exchanges/.test(readableTranscript(two.m, S, part.receipt, '', part.transcript.meta)));
ok('without the facts (an older receipt) the readable copy is unchanged in kind', !/Conversation complete/.test(readableTranscript(five.m, S, full.receipt, '')));

// the verify script: version 3, tampering with the facts, and older version 2 files
const dir = mkdtempSync(join(tmpdir(), 'nenya-receipts-'));
const write = (n: string, d: any) => { const p = join(dir, n); writeFileSync(p, JSON.stringify(d)); return p; };
const run = (f: string) => spawnSync(process.execPath, ['scripts/verify-transcript.mjs', f], { encoding: 'utf8' });
try {
  const good = run(write('v3.json', { transcript: full.transcript, receipt: full.receipt }));
  ok('a version 3 file verifies and shows the signed facts', good.status === 0 && /Complete:  yes \(5 exchanges\)/.test(good.stdout) && /Produced by: build/.test(good.stdout), good.stdout + good.stderr);
  const flipped = structuredClone(part.transcript); flipped.meta.closed = true;
  ok('claiming a partial conversation was complete breaks the signature', run(write('flip.json', { transcript: flipped, receipt: part.receipt })).status === 1);
  const rebuilt = structuredClone(full.transcript); rebuilt.meta.build = 'other';
  ok('changing the build breaks the signature', run(write('build.json', { transcript: rebuilt, receipt: full.receipt })).status === 1);
  // an older file: version 2, signed the old way
  const old = { v: 2, session: S, messages: five.m.map((x: any) => ({ role: x.role, content: x.content })) };
  const hash = createHash('sha256').update(JSON.stringify(old)).digest('hex');
  const issuedAt = '2026-11-01T00:00:00.000Z';
  const pub = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const receipt = { version: 2, algorithm: 'Ed25519', keyId: createHash('sha256').update(pub).digest('hex').slice(0, 16), publicKey: pub, hash, issuedAt, signature: edSign(null, Buffer.from(`nenya-coach-transcript-v2\n${hash}\n${issuedAt}`), privateKey).toString('base64') };
  ok('an older version 2 file still verifies', run(write('v2.json', { transcript: old, receipt })).status === 0);
} finally { rmSync(dir, { recursive: true, force: true }); }
__useStoreForTests(null);
