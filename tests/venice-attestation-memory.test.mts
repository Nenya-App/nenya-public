// The short memory of a verified model key (see the note at the top of src/lib/veniceE2ee.ts): fewer attestation requests, with every
// check kept and nothing about any visitor remembered.
import { createCipheriv, createDecipheriv, createECDH, hkdfSync, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { e2eeChat, E2eeError, attestationPolicyFromEnv, __clearAttestationMemory, __attestationMemory, type AttestationPolicy } from '../src/lib/veniceE2ee.ts';
import { ok } from './helpers.mts';

const INFO = Buffer.from('ecdsa_encryption');
const kdf = (s: Buffer) => Buffer.from(hkdfSync('sha256', s, Buffer.alloc(0), INFO, 32));
const makeEnclave = () => {
  const e = createECDH('secp256k1'); e.generateKeys();
  const reads = (hex: string) => {
    const raw = Buffer.from(hex, 'hex');
    const d = createDecipheriv('aes-256-gcm', kdf(e.computeSecret(raw.subarray(0, 65))), raw.subarray(65, 77));
    d.setAuthTag(raw.subarray(raw.length - 16));
    return Buffer.concat([d.update(raw.subarray(77, raw.length - 16)), d.final()]).toString('utf8');
  };
  const writes = (clientPubHex: string, text: string) => {
    const x = createECDH('secp256k1'); x.generateKeys();
    const nonce = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', kdf(x.computeSecret(Buffer.from(clientPubHex, 'hex'))), nonce);
    const ct = Buffer.concat([c.update(text, 'utf8'), c.final()]);
    return Buffer.concat([x.getPublicKey(), nonce, ct, c.getAuthTag()]).toString('hex');
  };
  return { pub: e.getPublicKey('hex'), reads, writes };
};

let enclave = makeEnclave();
let attest = { count: 0, mode: 'ok' as 'ok' | '429' | '500' | 'unverified' | 'badnonce' | 'debug' | 'nokey' | 'hang', delayMs: 0 };
let chat = { count: 0, refuseUnknownKey: true };
const stub = async (url: string, init: any = {}) => {
  const u = new URL(url);
  if (u.pathname.endsWith('/tee/attestation')) {
    attest.count++;
    if (attest.delayMs) await new Promise((r) => setTimeout(r, attest.delayMs));
    if (attest.mode === '429') return new Response('slow down', { status: 429 });
    if (attest.mode === '500') return new Response('oops', { status: 500 });
    const nonce = u.searchParams.get('nonce')!;
    const a: any = { verified: attest.mode !== 'unverified', nonce: attest.mode === 'badnonce' ? 'f'.repeat(64) : nonce, signing_key: enclave.pub };
    if (attest.mode === 'debug') a.debug = true;
    if (attest.mode === 'nokey') delete a.signing_key;
    return new Response(JSON.stringify(a), { status: 200 });
  }
  chat.count++;
  const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
  const body = JSON.parse(String(init.body));
  // The enclave refuses a request encrypted to a key that is not its own (as it would after a key change).
  try { body.messages.forEach((m: any) => enclave.reads(m.content)); } catch { return new Response(JSON.stringify({ error: 'E2EE decryption failed' }), { status: 400 }); }
  const clientPub = headers['x-venice-tee-client-pub-key'];
  const line = 'data: ' + JSON.stringify({ choices: [{ delta: { content: enclave.writes(clientPub, 'Thank you for telling me.') } }] }) + '\n\n';
  return new Response(line + 'data: ' + JSON.stringify({ choices: [{ delta: { content: '' }, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n', { status: 200 });
};
let clock = 1_000_000;
const policy = (ttlS = 300, staleS = 900): AttestationPolicy => ({ ttlMs: ttlS * 1000, staleMs: ttlS === 0 ? 0 : staleS * 1000, now: () => clock });
const ask = (p: AttestationPolicy, model = 'e2ee-qwen-2-5-7b-p') => e2eeChat({ apiKey: 'k', model, messages: [{ role: 'user', content: 'hello' }], fetchImpl: stub as any, attestation: p });
const reset = () => { __clearAttestationMemory(); attest.count = 0; attest.mode = 'ok'; attest.delayMs = 0; chat.count = 0; clock = 1_000_000; enclave = makeEnclave(); };

// ---- the memory
reset();
await ask(policy()); await ask(policy()); await ask(policy());
ok('three requests close together make one attestation request, not three', attest.count === 1 && chat.count === 3);
clock += 301_000;
await ask(policy());
ok('after the time is up, the next request attests again', attest.count === 2);
reset();
await ask(policy(0)); await ask(policy(0));
ok('with the time set to 0 the memory is off: an attestation every time, as before', attest.count === 2);
reset();
await Promise.all([ask(policy()), ask(policy()), ask(policy()), ask(policy())]);
ok('requests that arrive together share one attestation', attest.count === 1 && chat.count === 4);
reset();
await ask(policy()); await ask(policy(), 'e2ee-other-model');
ok('each model has its own remembered key', attest.count === 2 && __attestationMemory().length === 2 && new Set(__attestationMemory().map((m) => m.model)).size === 2);
reset();
await ask(policy());
const mem = JSON.stringify(__attestationMemory());
ok('what is remembered is the public key and a time, nothing else: no message text, no API key, no visitor information', __attestationMemory().length === 1 && mem.includes(enclave.pub) && !mem.includes('hello') && !mem.includes('"k"') && Object.keys(__attestationMemory()[0]).sort().join() === 'at,key,model');

// ---- the checks are not weakened
for (const mode of ['unverified', 'badnonce', 'debug', 'nokey'] as const) {
  reset();
  attest.mode = mode;
  let code = '';
  try { await ask(policy()); } catch (e) { code = e instanceof E2eeError ? e.code : 'other'; }
  ok(`a fresh attestation that is bad (${mode}) is refused, and nothing is remembered`, code !== '' && __attestationMemory().length === 0 && chat.count === 0);
}
reset();
await ask(policy());
clock += 301_000;
attest.mode = 'unverified';
let refused = false;
try { await ask(policy()); } catch { refused = true; }
ok('a remembered key is never used to get around a bad report: once it expires and the new report is bad, the request fails and the key is dropped', refused && __attestationMemory().length === 0);
reset();
await ask(policy());
clock += 301_000;
attest.mode = 'badnonce';
refused = false;
try { await ask(policy()); } catch { refused = true; }
ok('the same for a wrong nonce', refused && __attestationMemory().length === 0);

// ---- Venice busy: use the remembered key instead of failing
reset();
await ask(policy());
clock += 301_000; // expired, but within the longer allowance
attest.mode = '429';
let r = await ask(policy()).catch(() => null);
ok('when the attestation step is rate limited (429), a recently checked key is used instead of failing the visitor', r?.content === 'Thank you for telling me.');
attest.mode = '500';
r = await ask(policy()).catch(() => null);
ok('and when it is briefly down (5xx)', r?.content === 'Thank you for telling me.');
clock += 700_000; // now older than the allowance
attest.mode = '429';
let busyCode = '';
try { await ask(policy()); } catch (e) { busyCode = e instanceof E2eeError ? `${e.code}-${e.status}` : 'other'; }
ok('but not once the key is older than the allowance: then the request fails, as it would have before', busyCode === 'attestation-429');
reset();
attest.mode = '429';
busyCode = '';
try { await ask(policy()); } catch (e) { busyCode = e instanceof E2eeError ? `${e.code}-${e.status}` : 'other'; }
ok('with nothing remembered, a rate limited attestation is still an error', busyCode === 'attestation-429');

// ---- the enclave's key changed
reset();
await ask(policy());
enclave = makeEnclave(); // a new key; the remembered one no longer works
const before = attest.count;
r = await ask(policy()).catch(() => null);
ok('if a request made with a remembered key is refused (the enclave changed its key), the key is dropped and it is repeated once with a fresh attestation', r?.content === 'Thank you for telling me.' && attest.count === before + 1 && __attestationMemory()[0].key === enclave.pub);

// ---- the setting
const p0 = attestationPolicyFromEnv({});
ok('by default: five minutes remembered, fifteen as the allowance when Venice is busy', p0.ttlMs === 300_000 && p0.staleMs === 900_000);
ok('the environment can change them, and 0 turns the memory off (and the allowance with it)', attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: '60', COACH_E2EE_ATTESTATION_STALE_S: '120' }).ttlMs === 60_000 && attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: '0' }).ttlMs === 0 && attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: '0' }).staleMs === 0);
ok('a value that is not a number falls back, and nothing can be kept longer than a day', attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: 'soon' }).ttlMs === 300_000 && attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: '999999999' }).ttlMs === 86_400_000);
ok('the allowance is never shorter than the time itself', attestationPolicyFromEnv({ COACH_E2EE_ATTESTATION_TTL_S: '600', COACH_E2EE_ATTESTATION_STALE_S: '60' }).staleMs === 600_000);

// ---- in the code
const src = readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), 'src/lib/veniceE2ee.ts'), 'utf8');
ok('the module says in plain words what is kept and what rules protect the check', /PUBLIC key and the time it was checked: nothing about any visitor or message/.test(src) && /a stored key is never used to get around a security failure/.test(src));
