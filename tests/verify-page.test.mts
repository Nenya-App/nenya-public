// The browser verifier: its checks (the same in Node's WebCrypto as in a browser), the readable-copy block, and that it
// never sends anything anywhere.
import { createHash, generateKeyPairSync, sign as edSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import coach, { __useStoreForTests } from '../netlify/functions/coach.mts';
import { verifySigned, extractSigned, readableMatches, readableWithBlock, signedBlock, PUBLISHED_KEY_IDS, BLOCK_BEGIN } from '../src/lib/verifyTranscript.ts';
import { readableTranscript } from '../src/lib/transcript.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'); delete process.env.COACH_IP_SECRET;
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. Thank you for saying it.' } }] }), { status: 200 });
__useStoreForTests(null);
const S = { color1: '#7A9B9E', color2: '#DAC682' };
const post = async (body: any) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }))).json() as Promise<any>;
const m: any[] = []; let ticket: string | undefined;
for (let t = 1; t <= 5; t++) { m.push({ role: 'user', content: `message ${t} é “quoted”` }); const r = await post({ messages: m, ticket }); m.push({ role: 'assistant', content: r.reply }); ticket = r.ticket; }
const rc = await post({ action: 'receipt', messages: m, ticket });
const FILE = { transcript: rc.transcript, receipt: rc.receipt };
const keyId = rc.receipt.keyId;

// ---- the checks
let v = await verifySigned(FILE, { publishedKeyIds: [keyId] });
ok('a genuine transcript is valid, with its signed facts', v.status === 'valid' && v.details.messageCount === 10 && v.details.meta?.closed === true && v.details.version === 3);
ok('and its key is recognized when it is on the published list', v.status === 'valid' && v.details.publishedKey === true);
v = await verifySigned(FILE, { publishedKeyIds: ['0000000000000000'] });
ok('a valid file signed by a key that is not published is valid but flagged', v.status === 'valid' && v.details.publishedKey === false);
ok('by default only the published key ids count', PUBLISHED_KEY_IDS.length >= 1 && (await verifySigned(FILE)).status === 'valid' && ((await verifySigned(FILE)) as any).details.publishedKey === false);
const reason = async (mut: (f: any) => void) => { const f = structuredClone(FILE); mut(f); const r = await verifySigned(f); return r.status === 'invalid' ? r.reason : r.status; };
ok('an edited reply is caught as a changed transcript', (await reason((f) => { f.transcript.messages[1].content = 'Different'; })) === 'hash');
ok('changed signed facts are caught', (await reason((f) => { f.transcript.meta.exchanges = 3; })) === 'hash');
ok('changed colors are caught', (await reason((f) => { f.transcript.session.color2 = '#000000'; })) === 'hash');
ok('a changed date is caught as a bad signature', (await reason((f) => { f.receipt.issuedAt = '2020-01-01T00:00:00.000Z'; })) === 'signature');
ok('a forged signature is caught', (await reason((f) => { f.receipt.signature = Buffer.alloc(64).toString('base64'); })) === 'signature');
ok('a key id that does not match the key is caught', (await reason((f) => { f.receipt.keyId = '1111111111111111'; })) === 'keyid');
ok('a missing receipt is a shape problem', (await reason((f) => { delete f.receipt; })) === 'shape');
ok('anything that is not an object is a shape problem', (await verifySigned('nope')).status === 'invalid' && (await verifySigned(null)).status === 'invalid');
// a made-up transcript signed with someone else's key: genuine signature, not our key
{
  const other = generateKeyPairSync('ed25519');
  const tr = structuredClone(FILE.transcript); tr.messages[1].content = 'Invented reply';
  const hash = createHash('sha256').update(JSON.stringify(tr)).digest('hex'); const issuedAt = '2026-11-07T00:00:00.000Z';
  const pub = other.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const rec = { version: 3, algorithm: 'Ed25519', keyId: createHash('sha256').update(pub).digest('hex').slice(0, 16), publicKey: pub, hash, issuedAt, signature: edSign(null, Buffer.from(`nenya-coach-transcript-v3\n${hash}\n${issuedAt}`), other.privateKey).toString('base64') };
  const res = await verifySigned({ transcript: tr, receipt: rec });
  ok('a transcript signed with someone else\'s key verifies but is flagged as not Nenya\'s', res.status === 'valid' && res.details.publishedKey === false);
}
// an older version 2 file
{
  const old = { v: 2, session: S, messages: m.map((q: any) => ({ role: q.role, content: q.content })) };
  const hash = createHash('sha256').update(JSON.stringify(old)).digest('hex'); const issuedAt = '2026-11-01T00:00:00.000Z';
  const pub = mine.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  const rec = { version: 2, algorithm: 'Ed25519', keyId: createHash('sha256').update(pub).digest('hex').slice(0, 16), publicKey: pub, hash, issuedAt, signature: edSign(null, Buffer.from(`nenya-coach-transcript-v2\n${hash}\n${issuedAt}`), mine.privateKey).toString('base64') };
  const res = await verifySigned({ transcript: old, receipt: rec });
  ok('an older version 2 file verifies, with no signed facts', res.status === 'valid' && res.details.version === 2 && res.details.meta === undefined);
}
const fakeSubtle = { digest: crypto.subtle.digest.bind(crypto.subtle), importKey: async () => { const e = new Error('no'); e.name = 'NotSupportedError'; throw e; } } as any;
ok('a browser without this signature support says so, rather than calling the file invalid', (await verifySigned(FILE, { subtle: fakeSubtle })).status === 'unsupported');
ok('a browser with no crypto at all says so too', (await verifySigned(FILE, { subtle: { digest: undefined } as any }).catch(() => ({ status: 'unsupported' }))).status !== 'valid');

// ---- the readable copy
const readable = readableTranscript(m, S, rc.receipt, '', rc.transcript.meta);
const txt = readableWithBlock(readable, FILE);
ok('a readable copy ends with the marked block', txt.includes(BLOCK_BEGIN) && txt.trim().endsWith('-----END NENYA SIGNED TRANSCRIPT-----') && signedBlock(FILE).split('\n').every((l) => l.length <= 76 || l.startsWith('-----')));
const got = extractSigned(txt);
ok('the block gives back the signed file exactly, including accents and quotes', !!got && JSON.stringify(got.file) === JSON.stringify(FILE));
ok('and the signed file in it verifies', !!got && (await verifySigned(got.file)).status === 'valid');
ok('the readable text above the block matches the signed transcript', !!got && readableMatches(got.readableAbove!, FILE));
ok('line endings and a leading byte-order mark do not matter', !!extractSigned('﻿' + txt.replace(/\n/g, '\r\n')) && readableMatches(extractSigned(txt.replace(/\n/g, '\r\n'))!.readableAbove!, FILE));
const edited = txt.replace('message 3', 'message THREE');
const gotEdited = extractSigned(edited);
ok('editing the readable text is caught, while the signed block still verifies', !!gotEdited && (await verifySigned(gotEdited.file)).status === 'valid' && readableMatches(gotEdited.readableAbove!, FILE) === false);
const lines = txt.split('\n'); const i = lines.findIndex((l) => l === BLOCK_BEGIN); lines[i + 2] = 'AAAA' + lines[i + 2].slice(4);
const bad = extractSigned(lines.join('\n'));
ok('damaging the block is caught', bad === null || (await verifySigned(bad.file)).status !== 'valid');
ok('a .json file is read as it is', !!extractSigned(JSON.stringify(FILE, null, 2)) && JSON.stringify(extractSigned(JSON.stringify(FILE))!.file) === JSON.stringify(FILE));
ok('text with no block and broken JSON are both refused', extractSigned('just some text') === null && extractSigned('{not json') === null);

// ---- nothing is sent, counted or stored
const source = ['src/verify/VerifyPage.tsx', 'src/verify/TranscriptChecker.tsx', 'src/verify/main.tsx', 'src/lib/verifyTranscript.ts'].map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
ok('the verifier never sends, counts or stores anything', !/fetch\(|XMLHttpRequest|sendBeacon|usageCounts|localStorage|sessionStorage|document\.cookie|WebSocket/.test(source));
ok('the published key id in the code is the one in the public docs', readFileSync(join(root, 'docs', 'coach-transcripts.md'), 'utf8').includes('`579b407dc600fa7d`') && PUBLISHED_KEY_IDS.join() === '579b407dc600fa7d');
ok('the verify page is in no sitemap and asks for nothing', !/verify/i.test(readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8')));
