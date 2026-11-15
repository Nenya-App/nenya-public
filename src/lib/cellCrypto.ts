// Partner practice ("Dyadic Cells"): the end-to-end encrypted channel between two people (docs/ghost-footprint-stack.md).
// Built only on the browser's own WebCrypto (P-256 ECDH, HKDF-SHA256, HMAC-SHA256, AES-256-GCM), so it needs no library and
// works in every current browser and in Node.
//
// How it fits together:
//  - One person makes a code (80 random bits, shown as 16 letters and digits) and gives it to the other person directly.
//  - From the code each side derives a mailbox name (all the server ever sees) and an authentication key (never sent).
//  - Each side makes a one-time key pair and sends its public key with a tag made with the authentication key, so the
//    server, which does not know the code, cannot swap in a key of its own (no one in the middle).
//  - The shared secret gives one chain of keys for each direction. Every message uses the next key in its chain and the
//    old key is thrown away, so a key found later cannot open earlier messages (forward secrecy).
//  - Every message carries a "franking" commitment: a fingerprint of its text under a random key that is inside the
//    encrypted message. If the reader reports a message, they reveal the text and that key, and the server can confirm the
//    message really was sent through the cell, while being unable to read any message no one reported.
//  - Both people can compare two "safety colours" made from both public keys; if they match, no one is in between.

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = (): SubtleCrypto => globalThis.crypto.subtle;
const rand = (n: number): Uint8Array => globalThis.crypto.getRandomValues(new Uint8Array(n));
const buf = (u: Uint8Array): BufferSource => u as BufferSource;

export const b64 = (u: Uint8Array): string => {
  let s = '';
  for (const x of u) s += String.fromCharCode(x);
  return btoa(s);
};
export const unb64 = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const hex = (u: Uint8Array): string => Array.from(u, (x) => x.toString(16).padStart(2, '0')).join('');
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
/** Comparison that takes the same time whatever the inputs, so a tag cannot be guessed byte by byte. */
export function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// ── The code ────────────────────────────────────────────────────────────────

// Crockford's base32: no I, L, O or U, so nothing is misread. 16 characters = 80 bits.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 16;

/** A new cell code, shown in four groups of four ("7K2Q-…"). Uses the browser's secure random numbers. */
export function newCellCode(): string {
  const bytes = rand(10);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out.match(/.{4}/g)!.join('-');
}

/** A typed code tidied up (case, spaces and dashes ignored, look-alike letters read as the digit), or null if it cannot be a code. */
export function normalizeCode(input: string): string | null {
  const s = input.toUpperCase().replace(/[\s-]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
  if (s.length !== CODE_LENGTH || [...s].some((c) => !ALPHABET.includes(c))) return null;
  return s.match(/.{4}/g)!.join('-');
}

// ── Keys ────────────────────────────────────────────────────────────────────

async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: string, bytes: number): Promise<Uint8Array> {
  const k = await subtle().importKey('raw', buf(ikm), 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await subtle().deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: buf(salt), info: enc.encode(info) }, k, bytes * 8));
}
async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await subtle().importKey('raw', buf(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await subtle().sign('HMAC', k, buf(data)));
}

export interface CellIds {
  /** What the server sees: the mailbox's name. */
  box: string;
  /** Never leaves the device: tags the key exchange. */
  auth: Uint8Array;
  /** Salt for the session keys. */
  salt: Uint8Array;
}

/** Everything the code gives. The code itself is never sent anywhere. */
export async function cellIds(code: string): Promise<CellIds> {
  const c = normalizeCode(code);
  if (!c) throw new Error('not a cell code');
  const ikm = enc.encode(c);
  const zero = new Uint8Array(32);
  return {
    box: hex(await hkdf(ikm, zero, 'nenya-cell v1 mailbox', 16)),
    auth: await hkdf(ikm, zero, 'nenya-cell v1 auth', 32),
    salt: await hkdf(ikm, zero, 'nenya-cell v1 salt', 32),
  };
}

export type Role = 'a' | 'b'; // a made the code, b joined with it
export const other = (r: Role): Role => (r === 'a' ? 'b' : 'a');

export interface Hello {
  pub: string;
  tag: string;
}
export interface Handshake {
  role: Role;
  ids: CellIds;
  keys: CryptoKeyPair;
  pub: Uint8Array;
  hello: Hello;
}

/** One person's half of the key exchange: a one-time key pair, and the public half tagged with the code's key. */
export async function startHandshake(code: string, role: Role): Promise<Handshake> {
  const ids = await cellIds(code);
  const keys = (await subtle().generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])) as CryptoKeyPair;
  const pub = new Uint8Array(await subtle().exportKey('raw', keys.publicKey));
  const tag = await hmac(ids.auth, concat(enc.encode(`hello|${role}|`), pub));
  return { role, ids, keys, pub, hello: { pub: b64(pub), tag: b64(tag) } };
}

interface Chain {
  key: Uint8Array;
  seq: number;
}
export interface CellSession {
  role: Role;
  box: string;
  send: Chain;
  receive: Chain;
  /** Two colours both people can compare: the same on both screens means no one is in between. */
  safetyColors: [string, string];
}

/** Checks the other person's half and makes the session. Throws if the tag does not match (wrong code, or someone in between). */
export async function finishHandshake(mine: Handshake, theirs: Hello): Promise<CellSession> {
  const theirPub = unb64(theirs.pub);
  const expected = await hmac(mine.ids.auth, concat(enc.encode(`hello|${other(mine.role)}|`), theirPub));
  if (!sameBytes(expected, unb64(theirs.tag))) throw new Error('the other half of the exchange does not match this code');
  const theirKey = await subtle().importKey('raw', buf(theirPub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await subtle().deriveBits({ name: 'ECDH', public: theirKey }, mine.keys.privateKey, 256));
  const [pa, pb] = mine.role === 'a' ? [mine.pub, theirPub] : [theirPub, mine.pub];
  const both = await hkdf(shared, mine.ids.salt, `nenya-cell v1 session|${b64(pa)}|${b64(pb)}`, 64);
  const aToB = both.slice(0, 32);
  const bToA = both.slice(32);
  const print = new Uint8Array(await subtle().digest('SHA-256', buf(concat(pa, pb))));
  const color = (o: number) => '#' + hex(print.slice(o, o + 3)).toUpperCase();
  return {
    role: mine.role,
    box: mine.ids.box,
    send: { key: mine.role === 'a' ? aToB : bToA, seq: 0 },
    receive: { key: mine.role === 'a' ? bToA : aToB, seq: 0 },
    safetyColors: [color(0), color(3)],
  };
}

/** The next message key in a chain, and the chain moved on (the old key is gone). */
async function step(chain: Chain): Promise<Uint8Array> {
  const messageKey = await hmac(chain.key, Uint8Array.of(1));
  chain.key = await hmac(chain.key, Uint8Array.of(2));
  chain.seq += 1;
  return messageKey;
}

// ── Messages ────────────────────────────────────────────────────────────────

/** What travels through the mailbox. The server can read none of it except the sequence number and the commitment. */
export interface Envelope {
  seq: number;
  iv: string;
  ct: string;
  /** Franking commitment: lets a reported message be checked, reveals nothing on its own. */
  commit: string;
}

/** What a message holds once opened. `kind` lets the two pages exchange controls (a pause after a crisis flag, a close). */
export interface CellMessage {
  kind: 'text' | 'pause' | 'resume' | 'close';
  text: string;
  /** The sender's AI-assisted version, when they chose "send with AI" (the original is `text`, always kept). */
  assisted?: string;
  at: number;
}
export interface Opened extends CellMessage {
  seq: number;
  /** Needed only to report this message: the franking key, revealed with the text. */
  frank: string;
  commit: string;
}

const aad = (box: string, from: Role, seq: number, commit: string) => enc.encode(`nenya-cell v1|${box}|${from}|${seq}|${commit}`);
const frankData = (m: CellMessage) => enc.encode(JSON.stringify({ kind: m.kind, text: m.text, assisted: m.assisted ?? null, at: m.at }));

export async function sealMessage(s: CellSession, m: CellMessage): Promise<Envelope> {
  const seq = s.send.seq;
  const mk = await step(s.send);
  const frank = rand(32);
  const commit = b64(await hmac(frank, frankData(m)));
  const key = await subtle().importKey('raw', buf(mk), 'AES-GCM', false, ['encrypt']);
  const iv = rand(12);
  const body = enc.encode(JSON.stringify({ ...m, frank: b64(frank) }));
  const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv: buf(iv), additionalData: buf(aad(s.box, s.role, seq, commit)) }, key, buf(body)));
  return { seq, iv: b64(iv), ct: b64(ct), commit };
}

/** Opens the other person's next message. Messages must arrive in order; one that is out of order, altered or replayed is refused. */
export async function openMessage(s: CellSession, e: Envelope): Promise<Opened> {
  if (e.seq !== s.receive.seq) throw new Error('message out of order');
  const probe: Chain = { key: s.receive.key, seq: s.receive.seq };
  const mk = await step(probe);
  const key = await subtle().importKey('raw', buf(mk), 'AES-GCM', false, ['decrypt']);
  let m: CellMessage & { frank: string };
  try {
    const plain = await subtle().decrypt({ name: 'AES-GCM', iv: buf(unb64(e.iv)), additionalData: buf(aad(s.box, other(s.role), e.seq, e.commit)) }, key, buf(unb64(e.ct)));
    m = JSON.parse(dec.decode(plain));
  } catch {
    throw new Error('message could not be opened');
  }
  if (!(await verifyFranking({ kind: m.kind, text: m.text, assisted: m.assisted, at: m.at }, m.frank, e.commit))) throw new Error('message commitment does not match');
  // Only now move the chain on, so a bad message does not spoil the ones after it.
  s.receive.key = probe.key;
  s.receive.seq = probe.seq;
  return { kind: m.kind, text: m.text, ...(m.assisted !== undefined ? { assisted: m.assisted } : {}), at: m.at, seq: e.seq, frank: m.frank, commit: e.commit };
}

/** The server's check on a reported message: the revealed text and key must give the commitment it relayed. */
export async function verifyFranking(m: CellMessage, frank: string, commit: string): Promise<boolean> {
  try {
    return sameBytes(await hmac(unb64(frank), frankData(m)), unb64(commit));
  } catch {
    return false;
  }
}
