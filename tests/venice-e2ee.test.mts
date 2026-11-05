// Venice's encrypted ("e2ee-") models, with a pretend enclave standing in for Venice. This checks that our side of
// the protocol is self-consistent with Venice's published description and that the coach function uses it
// correctly. It cannot prove that Venice's real service accepts our requests; that needs a live test on staging.
import { createCipheriv, createDecipheriv, createECDH, hkdfSync, randomBytes } from 'node:crypto';
import handler from '../netlify/functions/coach.mts';
import { encryptTo, decryptFrom, looksEncrypted, isE2eeModel } from '../src/lib/veniceE2ee.ts';
import { ok } from './helpers.mts';

process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'test-key-e2ee';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'e2ee-qwen-2-5-7b-p';
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_EXTRA_HOSTS;

const INFO = Buffer.from('ecdsa_encryption');
const kdf = (s: Buffer) => Buffer.from(hkdfSync('sha256', s, Buffer.alloc(0), INFO, 32));

// The pretend enclave: its own key pair, reading and writing the documented format.
const enclave = createECDH('secp256k1'); enclave.generateKeys();
const enclavePub = enclave.getPublicKey('hex'); // 130 chars, 04...
const enclaveReads = (hex: string) => {
  const raw = Buffer.from(hex, 'hex');
  const d = createDecipheriv('aes-256-gcm', kdf(enclave.computeSecret(raw.subarray(0, 65))), raw.subarray(65, 77));
  d.setAuthTag(raw.subarray(raw.length - 16));
  return Buffer.concat([d.update(raw.subarray(77, raw.length - 16)), d.final()]).toString('utf8');
};
const enclaveWrites = (clientPubHex: string, text: string) => {
  const e = createECDH('secp256k1'); e.generateKeys();
  const nonce = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', kdf(e.computeSecret(Buffer.from(clientPubHex, 'hex'))), nonce);
  const ct = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([e.getPublicKey(), nonce, ct, c.getAuthTag()]).toString('hex');
};

// 1. The primitives round-trip, and bad input is refused.
const clientKey = createECDH('secp256k1'); clientKey.generateKeys();
const sealed = encryptTo(enclavePub, 'I feel stretched thin.');
ok('encrypted text looks like hex of the documented length', looksEncrypted(sealed) && sealed.length === (65 + 12 + 'I feel stretched thin.'.length + 16) * 2);
ok('the enclave can read what we encrypt', enclaveReads(sealed) === 'I feel stretched thin.');
ok('the same text encrypts differently each time', encryptTo(enclavePub, 'x') !== encryptTo(enclavePub, 'x'));
ok('a key sent without the 04 prefix is accepted', enclaveReads(encryptTo(enclavePub.slice(2), 'hi')) === 'hi');
let threw = false; try { encryptTo('abcd', 'x'); } catch { threw = true; }
ok('a malformed model key is refused', threw);
ok('we can read what the enclave encrypts to our key', decryptFrom(clientKey, enclaveWrites(clientKey.getPublicKey('hex'), 'Thank you for sharing that.')) === 'Thank you for sharing that.');
const tampered = enclaveWrites(clientKey.getPublicKey('hex'), 'hello world, this is a reply');
const flipped = tampered.slice(0, tampered.length - 4) + (tampered.slice(-4) === '0000' ? '1111' : '0000');
threw = false; try { decryptFrom(clientKey, flipped); } catch { threw = true; }
ok('a tampered reply is rejected, not read', threw);
ok('only ids that start with e2ee- take the encrypted path', isE2eeModel('e2ee-qwen-2-5-7b-p') && !isE2eeModel('deepseek-v3.2') && !isE2eeModel('mistral-small-3-2-24b-instruct'));

// 2. The coach function end to end against the pretend Venice.
let calls: { url: string; headers: Record<string, string>; body: any; rawBody: string }[] = [];
let attestMode: 'ok' | 'unverified' | 'badnonce' | 'nokey' | 'debug' | 'nopfx' | 'down' = 'ok';
let chatStatus = 200;
let replyText = 'That sounds like a lot to carry. What feels heaviest right now?';
let finishReason: string | null = 'stop';
const veniceStub = async (url: string, init: any = {}) => {
  const u = new URL(url);
  const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
  if (u.pathname.endsWith('/tee/attestation')) {
    calls.push({ url, headers, body: null, rawBody: '' });
    if (attestMode === 'down') return new Response('x', { status: 500 });
    const nonce = u.searchParams.get('nonce')!;
    const a: any = { verified: attestMode !== 'unverified', nonce: attestMode === 'badnonce' ? 'f'.repeat(64) : nonce, model: u.searchParams.get('model'), signing_key: attestMode === 'nopfx' ? enclavePub.slice(2) : enclavePub };
    if (attestMode === 'nokey') delete a.signing_key;
    if (attestMode === 'debug') a.debug = true;
    return new Response(JSON.stringify(a), { status: 200 });
  }
  const rawBody = String(init.body);
  const body = JSON.parse(rawBody);
  calls.push({ url, headers, body, rawBody });
  if (chatStatus !== 200) return new Response('no', { status: chatStatus });
  // The reply comes back as encrypted chunks, split into pieces, with the stream cut at awkward places.
  const clientPub = headers['x-venice-tee-client-pub-key'];
  const pieces = replyText.match(/.{1,18}/g)!;
  const lines = pieces.map((p) => 'data: ' + JSON.stringify({ choices: [{ delta: { content: enclaveWrites(clientPub, p) } }] }) + '\n\n');
  lines.push('data: ' + JSON.stringify({ choices: [{ delta: { content: '' }, finish_reason: finishReason }] }) + '\n\n', 'data: [DONE]\n\n');
  const all = lines.join('');
  const mid = Math.floor(all.length / 2);
  const enc = new TextEncoder();
  return new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode(all.slice(0, mid))); c.enqueue(enc.encode(all.slice(mid))); c.close(); } }), { status: 200 });
};
(globalThis as any).fetch = veniceStub;
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const call = async (body: any) => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: SESSION, ...body }) }));
  return { status: r.status, json: await r.json() };
};

const FIRST = 'Work has been heavy and I keep forgetting to eat. Email me at jo@example.com';
let r = await call({ messages: [{ role: 'user', content: FIRST }] });
ok('encrypted model: the coach replies, decrypted', r.status === 200 && r.json.reply === replyText && r.json.turn === 1, JSON.stringify(r.json).slice(0, 120));
const att = calls.find((c) => c.url.includes('/tee/attestation'))!;
const chat = calls.find((c) => c.url.endsWith('/chat/completions'))!;
ok('attestation is requested for the model with a 32-byte nonce and the key', /model=e2ee-qwen-2-5-7b-p/.test(att.url) && /nonce=[0-9a-f]{64}(&|$)/.test(att.url) && att.headers.authorization === 'Bearer test-key-e2ee');
ok('the three encryption headers are sent', chat.headers['x-venice-tee-signing-algo'] === 'ecdsa' && chat.headers['x-venice-tee-model-pub-key'] === enclavePub && /^04[0-9a-f]{128}$/.test(chat.headers['x-venice-tee-client-pub-key']));
ok('the request asks for a stream and carries no Venice character or web options', chat.body.stream === true && chat.body.venice_parameters === undefined && chat.body.model === 'e2ee-qwen-2-5-7b-p');
const sys = chat.body.messages.filter((m: any) => m.role === 'system'), usr = chat.body.messages.filter((m: any) => m.role === 'user');
ok('every system and user message is encrypted', sys.length >= 1 && usr.length === 1 && [...sys, ...usr].every((m: any) => looksEncrypted(m.content)));
const sysPlain = enclaveReads(sys[0].content), usrPlain = enclaveReads(usr[0].content);
ok('the enclave reads our turn-aware instruction', /exchange 1 of 5/.test(sysPlain) && /Nenya coach/.test(sysPlain));
ok('the person\'s words arrive scrubbed of the email address, and intact otherwise', /Work has been heavy/.test(usrPlain) && !/jo@example\.com/.test(usrPlain), usrPlain);
ok('none of the person\'s words appear in plain text in the request body', !/Work has been heavy|forgetting to eat|jo@example/.test(chat.rawBody) && !/exchange 1 of 5|Nenya coach/.test(chat.rawBody));
ok('the API key is only in the header, never the body', !chat.rawBody.includes('test-key-e2ee'));

// second turn: the earlier assistant reply travels as plain text (Venice\'s documented behaviour), the new user turn is encrypted
calls = [];
const hist = [{ role: 'user', content: FIRST }, { role: 'assistant', content: r.json.reply }, { role: 'user', content: 'I just feel tired.' }];
const r2 = await call({ messages: hist, ticket: r.json.ticket });
const chat2 = calls.find((c) => c.url.endsWith('/chat/completions'))!;
ok('second turn works', r2.status === 200 && r2.json.turn === 2, JSON.stringify(r2.json).slice(0, 100));
ok('assistant history is sent as it is; every user message is encrypted', chat2.body.messages.filter((m: any) => m.role === 'assistant').every((m: any) => m.content === r.json.reply) && chat2.body.messages.filter((m: any) => m.role === 'user').every((m: any) => looksEncrypted(m.content)));
ok('the daily counter and ticket still work for encrypted models', typeof r2.json.ticket === 'string' && r2.json.done === false);

// length handling and the reply cleanup still apply
replyText = 'This is a long thought that ends mid-sent'; finishReason = 'length'; calls = [];
let r3 = await call({ messages: [{ role: 'user', content: 'hi' }] });
ok('a reply cut off at the token ceiling is trimmed to a whole sentence or kept clean', r3.status === 200 && typeof r3.json.reply === 'string' && r3.json.reply.length > 0);
replyText = '<think>hidden</think>I hear you.'; finishReason = 'stop';
r3 = await call({ messages: [{ role: 'user', content: 'hi' }] });
ok('thinking text is stripped from encrypted replies too', r3.json.reply === 'I hear you.', r3.json.reply);
replyText = 'That sounds like a lot to carry. What feels heaviest right now?';

// a key reported without the 04 prefix still works
attestMode = 'nopfx'; r3 = await call({ messages: [{ role: 'user', content: 'hi' }] });
ok('an attestation key without the point prefix works', r3.status === 200 && !!r3.json.reply);

// 3. Refusals: anything wrong with the attestation or the upstream means no reply, and nothing is sent in the clear.
for (const [mode, label] of [['unverified', 'an unverified attestation'], ['badnonce', 'a nonce that does not match'], ['nokey', 'no signing key'], ['debug', 'a debug-enclave report'], ['down', 'the attestation endpoint failing']] as const) {
  attestMode = mode; calls = [];
  const bad = await call({ messages: [{ role: 'user', content: 'private words here' }] });
  ok(`refused: ${label}`, bad.status === 502 && !bad.json.reply, `status ${bad.status}`);
  ok(`refused: ${label} (names its reason)`, /^e2ee-/.test(bad.json.reason) && /^[0-9a-f]{8}$/.test(bad.json.ref), JSON.stringify(bad.json));
  ok(`refused: ${label} (no chat request was sent)`, !calls.some((c) => c.url.endsWith('/chat/completions')));
}
attestMode = 'ok'; chatStatus = 500; calls = [];
let bad = await call({ messages: [{ role: 'user', content: 'hi' }] });
ok('refused: the chat request failing', bad.status === 502);
chatStatus = 200;

// the plain path is untouched
process.env.COACH_MODEL = 'deepseek-v3.2'; calls = [];
(globalThis as any).fetch = async (url: string, init: any) => { calls.push({ url, headers: {}, body: JSON.parse(init.body), rawBody: init.body }); return new Response(JSON.stringify({ choices: [{ message: { content: 'I hear that.' } }] }), { status: 200 }); };
const plain = await call({ messages: [{ role: 'user', content: 'hello there' }] });
ok('other models still use the plain request with the Venice character', plain.status === 200 && calls.length === 1 && calls[0].body.venice_parameters.character_slug === 'nenya-20' && calls[0].body.stream === false && calls[0].body.messages.some((m: any) => /hello there/.test(m.content)));

// The default model is the encrypted 7B Qwen: with COACH_MODEL unset, the function asks for its attestation and encrypts.
delete process.env.COACH_MODEL;
attestMode = 'ok'; calls = [];
(globalThis as any).fetch = veniceStub;
const dflt = await call({ messages: [{ role: 'user', content: 'hello there' }] });
ok('with no COACH_MODEL set, the default is the encrypted Qwen 2.5 7B', dflt.status === 200 && calls.some((c) => /model=e2ee-qwen-2-5-7b-p/.test(c.url)) && calls.some((c) => c.body?.model === 'e2ee-qwen-2-5-7b-p'));
