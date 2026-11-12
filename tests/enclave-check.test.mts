// The enclave hardware check (src/lib/enclaveCheck.ts), against a real attestation report captured from Venice on 2026-11-12
// (tests/fixtures/venice-attestation-2026-11-12.json; Venice returns it without an API key) and copies of it with one part changed.
import { readFileSync } from 'node:fs';
import { checkHardware, keyAddress, INTEL_ROOT_KEY_HEX } from '../src/lib/enclaveCheck.ts';
import { SealedCoach, SealedError } from '../src/lib/sealedCoach.ts';
import { attestationFor, hardwareModeFrom, __clearAttestationMemory } from '../src/lib/veniceE2ee.ts';

let failed = 0;
const ok = (name: string, cond: unknown) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) failed++; };

const real = JSON.parse(readFileSync(new URL('./fixtures/venice-attestation-2026-11-12.json', import.meta.url), 'utf8'));
const NOW = Date.parse('2026-11-12T16:00:00Z');
const key: string = real.signing_public_key;
const nonce: string = real.nonce;
const copy = (): any => JSON.parse(JSON.stringify(real));
const run = (r: unknown, k = key, n = nonce, now = NOW) => checkHardware(r as Record<string, unknown>, k, n, now);
const flip = (hex: string, at: number): string => hex.slice(0, at) + (hex[at] === '0' ? '1' : '0') + hex.slice(at + 1);

const good = await run(real);
ok('the real report passes', good.ok);
ok('it names the code it runs: the compose hash is the one in the quote\'s event log', good.ok && good.facts.composeHash === '66e91ac6c2325537851bc95fc0e4489df119b7b0204d27f2bae91ec1324ecf1f');
ok('it lists the container images', good.ok && good.facts.images.length >= 3 && good.facts.images.every((i) => i.includes('@sha256:')));
ok('it names the GPU', good.ok && good.facts.gpu === 'HOPPER');
ok('it says what still rests on Venice', good.ok && good.reliesOnVenice.length === 3);
ok('the key\'s address is the one Venice reports', '0x' + Buffer.from(keyAddress(key)).toString('hex') === real.signing_address);
ok('the pinned root is Intel\'s SGX Root CA key', INTEL_ROOT_KEY_HEX.length === 130 && INTEL_ROOT_KEY_HEX.startsWith('04'));

const fails = async (name: string, r: unknown, code: string, k = key, n = nonce, now = NOW) => {
  const res = await run(r, k, n, now);
  ok(`${name} (${code})`, res.ok === false && res.failed === code);
};

// The key and nonce are bound to the quote.
const other = '04' + '11'.repeat(64);
await fails('a different key is refused', real, 'binding', '04' + Buffer.from(keyAddress(key)).toString('hex').padEnd(128, '0'));
await fails('another key is refused', real, 'binding', other);
await fails('a different nonce is refused', real, 'binding', key, 'cd'.repeat(32));

// The quote's signed part: changing any byte breaks Intel's signature. 48 header bytes, then the TD report.
const q: string = real.intel_quote;
for (const [label, byte] of [['the MRTD', 48 + 136], ['RTMR3', 48 + 472], ['the TD attributes', 48 + 120]] as const) {
  const r = copy();
  r.intel_quote = flip(q, byte * 2 + 1);
  await fails(`a quote with ${label} changed is refused`, r, 'quote-signature');
}
{
  const r = copy();
  r.intel_quote = flip(q, (632 + 4 + 10) * 2); // inside the quote's signature
  await fails('a quote with a changed signature is refused', r, 'quote-signature');
}
{
  const r = copy();
  r.intel_quote = flip(q, (632 + 4 + 128 + 6 + 10) * 2); // inside the QE report
  const res = await run(r);
  ok('a quote with a changed QE report is refused', res.ok === false && (res.failed === 'qe-binding' || res.failed === 'qe-signature'));
}
{
  const r = copy();
  delete r.intel_quote;
  r.attestation.evidence.quote = q;
  ok('the quote is also read from attestation.evidence', (await run(r)).ok);
  delete r.attestation.evidence.quote;
  await fails('a report with no quote is refused', r, 'missing');
}
await fails('a quote that is not a quote is refused', { ...copy(), intel_quote: 'ab'.repeat(800) }, 'format');

// The certificate chain must end at Intel's pinned root.
{
  const r = copy();
  const bytes = Buffer.from(q, 'hex');
  const at = bytes.indexOf(Buffer.from('-----BEGIN CERTIFICATE-----'));
  const pem = bytes.subarray(at).toString('latin1');
  const certs = [...pem.matchAll(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----\n?/g)].map((m) => m[0]);
  const swapped = (certs[0] + certs[1] + certs[1]).padEnd(pem.length, '\0'); // the platform CA in the root's place
  r.intel_quote = Buffer.concat([bytes.subarray(0, at), Buffer.from(swapped, 'latin1')]).toString('hex');
  await fails('a chain that does not end at Intel\'s root is refused', r, 'chain');
}
await fails('certificates out of date are refused', real, 'expired', key, nonce, Date.parse('2060-01-01T00:00:00Z'));

// Which code runs.
{
  const r = copy();
  r.attestation.evidence.app_compose = r.attestation.evidence.app_compose.replace('dstack-verifier', 'dstack-verifyer');
  await fails('a changed app description is refused', r, 'code');
}
{
  const r = copy();
  const log = JSON.parse(r.attestation.evidence.event_log);
  const i = log.findIndex((e: any) => e.imr === 3 && e.event === 'compose-hash');
  log[i].event_payload = 'ab'.repeat(32);
  r.attestation.evidence.event_log = JSON.stringify(log);
  await fails('a changed compose-hash event is refused', r, 'code');
  log.splice(i, 1);
  r.attestation.evidence.event_log = JSON.stringify(log);
  await fails('an event log that does not replay to RTMR3 is refused', r, 'code');
}

// The GPU evidence's nonce.
{
  const r = copy();
  const p = JSON.parse(r.nvidia_payload);
  p.nonce = 'cd'.repeat(32);
  r.nvidia_payload = JSON.stringify(p);
  await fails('GPU evidence made for another nonce is refused', r, 'gpu-nonce');
}

// The browser's sealed coach refuses a key whose hardware check fails, and keeps the facts when it passes.
const relay = (report: unknown) => (async (_u: unknown, init?: { body?: string }) => {
  const body = JSON.parse(init?.body ?? '{}');
  return new Response(JSON.stringify({ report: { ...(report as object), nonce: body.nonce } }), { status: 200, headers: { 'content-type': 'application/json' } });
}) as unknown as typeof fetch;
{
  // The relay echoes the browser's fresh nonce, which is not the one in the captured quote: the binding check catches it.
  const coach = new SealedCoach({ session: { color1: '#112233', color2: '#445566' }, fetchImpl: relay(real) });
  let err: unknown = null;
  try { await coach.attest(); } catch (e) { err = e; }
  ok('the sealed coach refuses a replayed report (its nonce is not ours)', err instanceof SealedError && err.code === 'hardware' && err.failed === 'binding' && coach.hardware === null);
}

// The relay: 'report' by default (logs, carries on), 'enforce' refuses, 'off' skips.
ok('the server mode defaults to report', hardwareModeFrom(undefined) === 'report' && hardwareModeFrom('enforce') === 'enforce' && hardwareModeFrom('off') === 'off' && hardwareModeFrom('x') === 'report');
const venice = (async () => new Response(JSON.stringify({ ...copy(), nonce: 'ef'.repeat(32) }), { status: 200 })) as unknown as typeof fetch;
const policy = (hardware: 'report' | 'enforce' | 'off') => ({ ttlMs: 0, staleMs: 0, now: () => Date.now(), hardware });
const warn = console.warn;
let warned = '';
console.warn = (m: string) => { warned = m; };
__clearAttestationMemory();
const reported = await attestationFor({ apiKey: 'test', model: 'e2ee-test', nonce: 'ef'.repeat(32), fetchImpl: venice, policy: policy('report') }).then((x) => x.key, () => null);
console.warn = warn;
ok('report mode carries on and logs the failure (no visitor data)', reported === key && /hardware check did not pass \(binding\)/.test(warned));
const enforced = await attestationFor({ apiKey: 'test', model: 'e2ee-test', nonce: 'ef'.repeat(32), fetchImpl: venice, policy: policy('enforce') }).then(() => 'accepted', (e) => e?.detail ?? 'refused');
ok('enforce mode refuses the key', enforced === 'hardware: binding');
const skipped = await attestationFor({ apiKey: 'test', model: 'e2ee-test', nonce: 'ef'.repeat(32), fetchImpl: venice, policy: policy('off') }).then((x) => x.key, () => null);
ok('off mode skips the check', skipped === key);

if (failed) process.exit(1);
