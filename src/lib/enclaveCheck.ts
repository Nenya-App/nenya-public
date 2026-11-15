// The hardware check for the AI model's enclave (docs/ghost-footprint-stack.md, "Checking the hardware"). Venice's attestation
// report says "verified"; this file checks the evidence itself instead of taking that word, so the browser (and the relay)
// can confirm that the key it encrypts to was made inside a genuine Intel TDX machine, for this request, by the code the
// machine says it runs. It runs the same way in the browser and in Node: WebCrypto for P-256 and the SHA hashes, and
// @noble/hashes for Keccak (the key's address). No WebAssembly, no network request.
//
// What is checked here, from the report alone:
//  1. Key binding: the quote's report_data is the enclave key's address (Keccak-256 of the key, last 20 bytes), 12 zero
//     bytes, then our own 32-byte nonce. This is what ties the key to the hardware and to this request.
//  2. The quote's signature, by the attestation key inside it (ECDSA P-256 over the header and the TD report).
//  3. The attestation key belongs to Intel's Quoting Enclave: the QE report carries a hash of that key, and the QE report
//     is signed by the machine's PCK certificate.
//  4. The PCK certificate chain: leaf, then Intel's platform or processor CA, then Intel's SGX Root CA, whose public key is
//     pinned below (taken from Intel's own download, certificates.trustedservices.intel.com, and identical to the root
//     inside Venice's quotes). Each certificate must be in date.
//  5. Not a debug machine: the TD attributes' DEBUG bit is clear.
//  6. Which code runs: the event log replays to the quote's RTMR3, and its "compose-hash" event is the SHA-256 of the
//     app description (the container images and settings) that the report includes. The hash and the images are returned
//     so they can be shown and compared.
//  7. The GPU evidence was made for our nonce (the nonce inside the NVIDIA payload).
//
// What is NOT checked here yet, and so still rests on Venice's own verification (returned as `reliesOnVenice`):
//  - whether the machine's firmware is up to date and its certificate unrevoked (Intel's TCB info and revocation lists);
//  - the NVIDIA GPU evidence's own signatures and measurements;
//  - whether the code identity (compose hash, MRTD) is one Venice has published as known-good: nobody publishes that list
//    yet (docs/drafts/venice-attestation-questions.md).
import { keccak_256 } from '@noble/hashes/sha3';

/** Intel SGX Root CA public key (P-256, uncompressed). Certificate SHA-256 44A0196B2B99F889B8E149E95B807A350E7424964399E885A7CBB8CCFAB674D3, valid until 2049. */
export const INTEL_ROOT_KEY_HEX =
  '040ba9c4c0c0c86193a3fe23d6b02cda10a8bbd4e88e48b4458561a36e705525f567918e2edc88e40d860bd0cc4ee26aacc988e505a953558c453f6b0904ae7394';

export type HardwareFailure =
  | 'missing' // no quote in the report
  | 'format' // the quote or a certificate could not be read
  | 'binding' // report_data is not the key's address and our nonce
  | 'quote-signature'
  | 'qe-binding'
  | 'qe-signature'
  | 'chain' // the certificate chain does not lead to Intel's pinned root
  | 'expired'
  | 'debug'
  | 'code' // the event log or the app description does not match the quote
  | 'gpu-nonce';

export interface HardwareFacts {
  /** SHA-256 of the app description the machine runs (hex). */
  composeHash: string;
  /** The container images the app description names, as written there (with their digests). */
  images: string[];
  /** The TD's build measurement (hex), and the OS image hash when the report gives one. */
  mrtd: string;
  osImageHash: string | null;
  /** The GPU architecture named in the NVIDIA payload, or null if there is none. */
  gpu: string | null;
}

export type HardwareResult =
  | { ok: true; facts: HardwareFacts; reliesOnVenice: string[] }
  | { ok: false; failed: HardwareFailure };

/** What Venice still vouches for after a passing check, in plain words. */
export const RELIES_ON_VENICE = [
  "that the machine's firmware is up to date and its certificate not revoked",
  "the GPU evidence's own signatures",
  'that the code the machine runs is the code Venice intends',
];

class Fail extends Error {
  code: HardwareFailure;
  constructor(code: HardwareFailure) {
    super(code);
    this.code = code;
  }
}
const need = (cond: unknown, code: HardwareFailure): void => {
  if (!cond) throw new Fail(code);
};

const enc = new TextEncoder();
const subtle = (): SubtleCrypto => globalThis.crypto.subtle;
const bs = (u: Uint8Array): BufferSource => u as BufferSource;

function fromHex(h: unknown): Uint8Array {
  need(typeof h === 'string', 'format');
  const s = (h as string).startsWith('0x') ? (h as string).slice(2) : (h as string);
  need(s.length % 2 === 0 && !/[^0-9a-fA-F]/.test(s), 'format');
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}
const toHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const same = (a: Uint8Array, b: Uint8Array): boolean => a.length === b.length && a.every((x, i) => x === b[i]);
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) (out.set(p, o), (o += p.length));
  return out;
};
const u16 = (b: Uint8Array, o: number): number => b[o] | (b[o + 1] << 8);
const u32 = (b: Uint8Array, o: number): number => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 0x1000000;
const digest = async (alg: 'SHA-256' | 'SHA-384', data: Uint8Array): Promise<Uint8Array> => new Uint8Array(await subtle().digest(alg, bs(data)));

async function verifyP256(pub65: Uint8Array, sigRaw64: Uint8Array, data: Uint8Array): Promise<boolean> {
  try {
    const key = await subtle().importKey('raw', bs(pub65), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    return await subtle().verify({ name: 'ECDSA', hash: 'SHA-256' }, key, bs(sigRaw64), bs(data));
  } catch {
    return false;
  }
}

// ── A small DER reader: just enough for Intel's certificates ────────────────

interface Der {
  tag: number;
  start: number; // where the element (tag byte) starts
  body: number; // where its contents start
  end: number;
}
function der(b: Uint8Array, at: number): Der {
  need(at + 2 <= b.length, 'format');
  const tag = b[at];
  let len = b[at + 1];
  let body = at + 2;
  if (len & 0x80) {
    const n = len & 0x7f;
    need(n >= 1 && n <= 3 && body + n <= b.length, 'format');
    len = 0;
    for (let i = 0; i < n; i++) len = len * 256 + b[body + i];
    body += n;
  }
  need(body + len <= b.length, 'format');
  return { tag, start: at, body, end: body + len };
}
const children = (b: Uint8Array, e: Der): Der[] => {
  const out: Der[] = [];
  for (let at = e.body; at < e.end; ) {
    const c = der(b, at);
    out.push(c);
    at = c.end;
  }
  return out;
};

function derTime(b: Uint8Array, e: Der): number {
  const s = new TextDecoder().decode(b.subarray(e.body, e.end));
  const m = (e.tag === 0x17 ? /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/ : /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/).exec(s);
  need(m, 'format');
  let y = Number(m![1]);
  if (e.tag === 0x17) y += y < 50 ? 2000 : 1900;
  return Date.UTC(y, Number(m![2]) - 1, Number(m![3]), Number(m![4]), Number(m![5]), Number(m![6]));
}

/** An ECDSA signature in DER (SEQUENCE of two INTEGERs) as the 64 raw bytes WebCrypto takes. */
function rawSig(b: Uint8Array): Uint8Array {
  const seq = der(b, 0);
  const [r, s] = children(b, seq);
  need(r?.tag === 0x02 && s?.tag === 0x02, 'format');
  const fit = (x: Der): Uint8Array => {
    let v = b.subarray(x.body, x.end);
    while (v.length > 32 && v[0] === 0) v = v.subarray(1);
    need(v.length <= 32, 'format');
    const out = new Uint8Array(32);
    out.set(v, 32 - v.length);
    return out;
  };
  return concat(fit(r), fit(s));
}

interface Cert {
  tbs: Uint8Array;
  sig: Uint8Array;
  issuer: Uint8Array;
  subject: Uint8Array;
  notBefore: number;
  notAfter: number;
  key: Uint8Array; // the uncompressed P-256 point
}
function parseCert(b: Uint8Array): Cert {
  const top = der(b, 0);
  need(top.tag === 0x30, 'format');
  const [tbsE, , sigE] = children(b, top);
  need(tbsE?.tag === 0x30 && sigE?.tag === 0x03, 'format');
  let f = children(b, tbsE);
  if (f[0]?.tag === 0xa0) f = f.slice(1); // the version
  const [, , issuer, validity, subject, spki] = f;
  need(issuer && validity && subject && spki, 'format');
  const [nb, na] = children(b, validity);
  const [, keyBits] = children(b, spki);
  need(keyBits?.tag === 0x03 && b[keyBits.body] === 0, 'format');
  need(sigE && b[sigE.body] === 0, 'format');
  return {
    tbs: b.subarray(tbsE.start, tbsE.end),
    sig: rawSig(b.subarray(sigE.body + 1, sigE.end)),
    issuer: b.subarray(issuer.start, issuer.end),
    subject: b.subarray(subject.start, subject.end),
    notBefore: derTime(b, nb),
    notAfter: derTime(b, na),
    key: b.subarray(keyBits.body + 1, keyBits.end),
  };
}

function pemCerts(pem: string): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (const m of pem.matchAll(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g)) {
    out.push(Uint8Array.from(atob(m[1].replace(/\s+/g, '')), (c) => c.charCodeAt(0)));
  }
  return out;
}

// ── The quote (Intel TDX, version 4) ────────────────────────────────────────

const HEADER = 48;
const BODY = 584;
const QE_REPORT = 384;

interface Quote {
  signed: Uint8Array; // header and TD report: what the attestation key signs
  tdAttributes: Uint8Array;
  mrtd: Uint8Array;
  rtmr3: Uint8Array;
  reportData: Uint8Array;
  sig: Uint8Array;
  attKey: Uint8Array; // 64 bytes, x and y
  qeReport: Uint8Array;
  qeSig: Uint8Array;
  qeAuth: Uint8Array;
  chainPem: string;
}
function parseQuote(q: Uint8Array): Quote {
  need(q.length > HEADER + BODY + 4, 'format');
  need(u16(q, 0) === 4 && u16(q, 2) === 2 && u32(q, 4) === 0x81, 'format'); // version 4, ECDSA P-256, TDX
  const body = q.subarray(HEADER, HEADER + BODY);
  let o = HEADER + BODY;
  const sigLen = u32(q, o);
  o += 4;
  need(o + sigLen <= q.length && sigLen > 128 + 6, 'format');
  const sig = q.subarray(o, o + 64);
  const attKey = q.subarray(o + 64, o + 128);
  o += 128;
  need(u16(q, o) === 6, 'format'); // certification data: the QE report and its certificates
  o += 6;
  need(o + QE_REPORT + 64 + 2 <= q.length, 'format');
  const qeReport = q.subarray(o, o + QE_REPORT);
  const qeSig = q.subarray(o + QE_REPORT, o + QE_REPORT + 64);
  o += QE_REPORT + 64;
  const authLen = u16(q, o);
  const qeAuth = q.subarray(o + 2, o + 2 + authLen);
  o += 2 + authLen;
  need(o + 6 <= q.length && u16(q, o) === 5, 'format'); // a PCK certificate chain, in PEM
  const certLen = u32(q, o + 2);
  need(o + 6 + certLen <= q.length, 'format');
  const chainPem = new TextDecoder().decode(q.subarray(o + 6, o + 6 + certLen));
  return {
    signed: q.subarray(0, HEADER + BODY),
    tdAttributes: body.subarray(120, 128),
    mrtd: body.subarray(136, 184),
    rtmr3: body.subarray(472, 520),
    reportData: body.subarray(520, 584),
    sig,
    attKey,
    qeReport,
    qeSig,
    qeAuth,
    chainPem,
  };
}

/** The address of a secp256k1 key: the last 20 bytes of the Keccak-256 of its 64 coordinate bytes. */
export function keyAddress(keyHex: string): Uint8Array {
  let k = fromHex(keyHex);
  if (k.length === 65 && k[0] === 4) k = k.subarray(1);
  need(k.length === 64, 'binding');
  return keccak_256(k).subarray(12);
}

async function checkChain(chainPem: string, now: number): Promise<Cert> {
  const ders = pemCerts(chainPem);
  need(ders.length >= 2, 'chain');
  const certs = ders.map(parseCert);
  const root = certs[certs.length - 1];
  need(same(root.key, fromHex(INTEL_ROOT_KEY_HEX)), 'chain');
  need(await verifyP256(root.key, root.sig, root.tbs), 'chain');
  for (let i = 0; i < certs.length - 1; i++) {
    need(same(certs[i].issuer, certs[i + 1].subject), 'chain');
    need(await verifyP256(certs[i + 1].key, certs[i].sig, certs[i].tbs), 'chain');
  }
  for (const c of certs) need(now >= c.notBefore && now <= c.notAfter, 'expired');
  return certs[0];
}

interface LogEvent {
  imr: number;
  event_type: number;
  digest: string;
  event: string;
  event_payload: string;
}

async function checkCode(report: Record<string, any>, rtmr3: Uint8Array): Promise<{ composeHash: string; images: string[]; osImageHash: string | null }> {
  const ev = report.attestation?.evidence ?? {};
  let log: LogEvent[];
  try {
    log = typeof ev.event_log === 'string' ? JSON.parse(ev.event_log) : ev.event_log;
  } catch {
    throw new Fail('code');
  }
  need(Array.isArray(log), 'code');
  // Replay RTMR3: start at zero, and fold in each event's digest.
  let r: Uint8Array = new Uint8Array(48);
  const mine = log.filter((e) => e?.imr === 3);
  for (const e of mine) r = await digest('SHA-384', concat(r, fromHex(e.digest)));
  need(same(r, rtmr3), 'code');
  // Each named event's digest must be what its name and payload give, so the payloads can be read as fact.
  const payloadOf = async (name: string): Promise<Uint8Array | null> => {
    const e = mine.find((x) => x.event === name);
    if (!e) return null;
    const type = new Uint8Array([e.event_type & 0xff, (e.event_type >>> 8) & 0xff, (e.event_type >>> 16) & 0xff, (e.event_type >>> 24) & 0xff]);
    const payload = fromHex(e.event_payload);
    need(same(await digest('SHA-384', concat(type, enc.encode(':'), enc.encode(e.event), enc.encode(':'), payload)), fromHex(e.digest)), 'code');
    return payload;
  };
  const composeHash = await payloadOf('compose-hash');
  need(composeHash && typeof ev.app_compose === 'string', 'code');
  need(same(await digest('SHA-256', enc.encode(ev.app_compose)), composeHash!), 'code');
  let images: string[] = [];
  try {
    const file = String(JSON.parse(ev.app_compose)?.docker_compose_file ?? '');
    images = [...file.matchAll(/^\s*image:\s*(\S+)/gm)].map((m) => m[1]);
  } catch {
    images = [];
  }
  const os = await payloadOf('os-image-hash');
  return { composeHash: toHex(composeHash!), images, osImageHash: os ? toHex(os) : null };
}

/**
 * Checks the hardware evidence in a Venice attestation report for the key `keyHex` and the nonce we sent. Never throws:
 * a report that does not pass gives `{ ok: false, failed }`.
 */
export async function checkHardware(report: Record<string, unknown>, keyHex: string, nonce: string, now: number = Date.now()): Promise<HardwareResult> {
  try {
    const r = report as Record<string, any>;
    const quoteHex = r.intel_quote ?? r.attestation?.evidence?.quote;
    need(typeof quoteHex === 'string' && quoteHex.length > 0, 'missing');
    const q = parseQuote(fromHex(quoteHex));

    // 1. The key and our nonce are what the machine put in the quote.
    const expected = concat(keyAddress(keyHex), new Uint8Array(12), fromHex(nonce));
    need(expected.length === 64 && same(q.reportData, expected), 'binding');

    // 2–4. Intel's signatures, from the quote up to the pinned root.
    const attKey = concat(new Uint8Array([4]), q.attKey);
    need(await verifyP256(attKey, q.sig, q.signed), 'quote-signature');
    need(same((await digest('SHA-256', concat(q.attKey, q.qeAuth))), q.qeReport.subarray(320, 352)), 'qe-binding');
    const pck = await checkChain(q.chainPem, now);
    need(await verifyP256(pck.key, q.qeSig, q.qeReport), 'qe-signature');

    // 5. Not a debug machine.
    need((q.tdAttributes[0] & 1) === 0, 'debug');

    // 6. Which code it runs.
    const code = await checkCode(r, q.rtmr3);

    // 7. The GPU evidence was made for this request.
    let gpu: string | null = null;
    if (r.nvidia_payload !== undefined && r.nvidia_payload !== null) {
      let p: Record<string, unknown>;
      try {
        p = typeof r.nvidia_payload === 'string' ? JSON.parse(r.nvidia_payload) : r.nvidia_payload;
      } catch {
        throw new Fail('gpu-nonce');
      }
      need(typeof p.nonce === 'string' && p.nonce.toLowerCase() === nonce.toLowerCase(), 'gpu-nonce');
      gpu = typeof p.arch === 'string' ? p.arch : null;
    }

    return { ok: true, facts: { ...code, mrtd: toHex(q.mrtd), gpu }, reliesOnVenice: RELIES_ON_VENICE };
  } catch (e) {
    return { ok: false, failed: e instanceof Fail ? e.code : 'format' };
  }
}
