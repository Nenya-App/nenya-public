// The owner's transcript lookup: who may ask, what it answers, and that the checker passes on only a hash.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import lookup, { __useStoreForTests, __useUserForTests } from '../netlify/functions/receipt-lookup.mts';
import { ownerAllowed } from '../src/lib/ownerGate.ts';
import { recordReceipt, receiptKey, findReceipt, receiptRecordedOn } from '../src/lib/receiptLog.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const TOKEN = 'owner-token-for-tests';
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex');

const makeStore = () => {
  const m = new Map<string, string>();
  return {
    async set(k: string, v: string, o?: { onlyIfNew?: boolean }) { if (o?.onlyIfNew && m.has(k)) return { modified: false }; m.set(k, v); return { modified: true }; },
    async getWithMetadata(k: string) { return m.has(k) ? { data: m.get(k)!, etag: '1' } : null; },
    async list({ prefix }: { prefix: string }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { m.delete(k); },
    put: (k: string, v = '1') => m.set(k, v),
  };
};
const store = makeStore();
const H1 = 'a'.repeat(64), H2 = 'b'.repeat(64);
await recordReceipt(store as any, H1);
__useStoreForTests(store);
__useUserForTests(async () => null);

const ask = async (body: unknown, headers: Record<string, string> = {}, method = 'POST', path = '/api/receipt') => {
  const r = await lookup(new Request(`https://nenya.biz${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) }));
  return { status: r.status, text: await r.text(), headers: r.headers };
};

// ---- the gate
let r = await ask({ hash: H1 });
ok('no credential: a bare 401', r.status === 401 && r.text === JSON.stringify({ error: 'no' }));
r = await ask({ hash: H1 }, { 'x-nenya-owner': 'wrong' });
ok('a wrong token: the same bare 401', r.status === 401 && r.text === JSON.stringify({ error: 'no' }));
r = await ask({ hash: H1 }, { 'x-nenya-owner': TOKEN });
ok('the owner token is accepted', r.status === 200);
__useUserForTests(async () => ({ roles: ['Owner'] }));
r = await ask({ hash: H1 });
ok('a signed-in Owner is accepted with no token', r.status === 200);
__useUserForTests(async () => ({ roles: ['editor'] }));
r = await ask({ hash: H1 });
ok('a signed-in user without the Owner role is refused', r.status === 401);
__useUserForTests(async () => { throw new Error('identity down'); });
r = await ask({ hash: H1 });
ok('if the sign-in check fails the answer is a plain 401, and the token still works', r.status === 401 && (await ask({ hash: H1 }, { 'x-nenya-owner': TOKEN })).status === 200);
delete process.env.COACH_OWNER_TOKEN_HASH;
__useUserForTests(async () => ({ roles: ['Owner'] }));
ok('the gate works with no token hash set, by role alone; with neither it refuses', (await ask({ hash: H1 })).status === 200 && (__useUserForTests(async () => null), (await ask({ hash: H1 }, { 'x-nenya-owner': TOKEN })).status === 401));
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex');
ok('the shared gate gives the same answers directly', (await ownerAllowed(new Request('https://x/', { headers: { 'x-nenya-owner': TOKEN } }), async () => null)) === true && (await ownerAllowed(new Request('https://x/'), async () => ({ roles: ['Owner'] }))) === true && (await ownerAllowed(new Request('https://x/'), async () => ({ roles: ['Owner '] }))) === false);

// ---- the answers
__useUserForTests(async () => null);
const auth = { 'x-nenya-owner': TOKEN };
r = await ask({ hash: H1 }, auth);
const j1 = JSON.parse(r.text);
ok('a logged receipt: recorded, with the day it was logged', j1.recorded === true && j1.day === capDay() && j1.keptDays === 30);
r = await ask({ hash: H2 }, auth);
ok('an unknown hash: not recorded, no day', JSON.parse(r.text).recorded === false && JSON.parse(r.text).day === null);
r = await ask({ hash: H1.toUpperCase() }, auth);
ok('an upper-case hash is treated as the same hash', JSON.parse(r.text).recorded === true);
ok('a missing, short, long or non-hex hash is a plain 400', (await Promise.all([{}, { hash: 'abc' }, { hash: 'a'.repeat(65) }, { hash: 'z'.repeat(64) }, { hash: 5 }, 'not json'].map((b) => ask(b as any, auth)))).every((x) => x.status === 400));
ok('only POST is served, and only the public route', (await ask({}, auth, 'GET')).status === 405 && (await ask({ hash: H1 }, auth, 'POST', '/.netlify/functions/receipt-lookup')).status === 404);
ok('the answer is never cached and echoes no credential', r.headers.get('cache-control') === 'no-store' && !r.text.includes(TOKEN));
__useStoreForTests({ async list() { throw new Error('down'); } });
r = await ask({ hash: H1 }, auth);
ok('a log that cannot be read is a 502, not "not recorded"', r.status === 502);
ok('findReceipt throws on a broken store, receiptRecordedOn still just says null', await findReceipt({ list: async () => { throw new Error('x'); } } as any, H1).then(() => false, () => true) && (await receiptRecordedOn({ list: async () => { throw new Error('x'); } } as any, H1)) === null);
store.put(receiptKey('2026-10-20', H2));
__useStoreForTests(store);
ok('a receipt logged on an earlier day reports that day', JSON.parse((await ask({ hash: H2 }, auth)).text).day === '2026-10-20');

// ---- the checker never sends anything itself, and the owner's page sends only the hash
const checker = src('src/verify/TranscriptChecker.tsx');
ok('the checker has no network code of its own: the lookup is handed in', !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(checker) && /lookup\?: \(hash: string\)/.test(checker));
ok('only a signature that checks out is looked up, and only its hash is passed', /outcome\.status === 'valid'[\s\S]{0,400}lookup\(file\.receipt\.hash\)/.test(checker));
const admin = src('src/admin/AdminPage.tsx');
ok('the owner\'s page posts only the hash to /api/receipt', /fetch\('\/api\/receipt'/.test(admin) && /body: JSON\.stringify\(\{ hash \}\)/.test(admin));
ok('the public page uses the same checker without a lookup', /<TranscriptChecker \/>/.test(src('src/verify/VerifyPage.tsx')) && !/lookup/.test(src('src/verify/VerifyPage.tsx').replace(/\/\/.*$/gm, '')));
ok('the stats function uses the same gate', /ownerAllowed\(req/.test(src('netlify/functions/stats.mts')));
