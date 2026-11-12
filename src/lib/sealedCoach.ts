// Sealed mode for the coach, the browser's side (docs/ghost-footprint-stack.md). The visitor's words are encrypted here,
// on their device, to the key of the model's attested enclave, so neither Nenya's relay function nor Venice's API layer
// can read them. The reply comes back encrypted to a one-time key made here, and is opened here.
//
// The price, stated plainly (and shown to the visitor by src/lib/privacyModes.ts): the safety checks run only on this
// device, and the relay cannot sign a transcript of words it never saw. The enclave check below reads the hardware evidence
// itself (src/lib/enclaveCheck.ts): Intel's signatures up to the pinned root, the key and our nonce in the quote, no debug
// mode, which code runs, and the GPU evidence's nonce. What it still takes from Venice: whether the firmware is up to date
// and unrevoked, the GPU evidence's signatures, and whether the code is the code Venice intends.
//
// Protocol (the same as src/lib/veniceE2ee.ts on the server): secp256k1 ECDH, HKDF-SHA256 with info "ecdsa_encryption" and
// no salt, AES-256-GCM. A message is hex of: one-time public key (65 bytes) | nonce (12) | ciphertext | tag (16).

import { secp256k1 } from '@noble/curves/secp256k1';
import { checkHardware, type HardwareFacts, type HardwareFailure } from './enclaveCheck.ts';
import { scrubPII } from './piiScrub.ts';
import { looksLikeManipulation, neutralize } from './promptGuard.ts';
import { checkConversation, type SafetyFlag } from './safetyFlags.ts';
import { detectHostility, type Hostility } from './hostility.ts';
import { claimsInfrastructure, INFRA_FALLBACK } from './infraGuard.ts';
import { claimsPersona, PERSONA_FALLBACK } from './personaGuard.ts';
import { echoedNames, withoutNames } from './nameGuard.ts';

const enc = new TextEncoder();
const dec = new TextDecoder();
const HKDF_INFO = enc.encode('ecdsa_encryption');

export const toHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
export function fromHex(h: string): Uint8Array {
  const s = h.startsWith('0x') ? h.slice(2) : h;
  if (s.length % 2 || /[^0-9a-fA-F]/.test(s)) throw new SealedError('format');
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}
const randomBytes = (n: number): Uint8Array => crypto.getRandomValues(new Uint8Array(n));

export type SealedCode = 'attestation' | 'hardware' | 'nonce' | 'key' | 'format' | 'decrypt' | 'blocked' | 'status' | 'network';
export class SealedError extends Error {
  code: SealedCode;
  /** For 'hardware': which part of the hardware check failed. */
  failed?: HardwareFailure;
  constructor(code: SealedCode, failed?: HardwareFailure) {
    super('sealed ' + code + (failed ? ' ' + failed : ''));
    this.code = code;
    if (failed) this.failed = failed;
  }
}

/** The enclave's key as 65 uncompressed bytes (some reports leave off the 04 prefix). */
export function modelKeyBytes(hex: string): Uint8Array {
  let h = hex.trim().toLowerCase();
  if (h.startsWith('0x')) h = h.slice(2);
  if (h.length === 128) h = '04' + h;
  if (!/^04[0-9a-f]{128}$/.test(h)) throw new SealedError('key');
  const b = fromHex(h);
  secp256k1.ProjectivePoint.fromHex(b); // throws if it is not a point on the curve
  return b;
}

async function aesKey(sharedX: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey('raw', sharedX as BufferSource, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: HKDF_INFO }, ikm, { name: 'AES-GCM', length: 256 }, false, [usage]);
}
/** The x coordinate of the shared point, as Node's ECDH computeSecret gives it. */
const sharedX = (priv: Uint8Array, pub: Uint8Array): Uint8Array => secp256k1.getSharedSecret(priv, pub, true).slice(1, 33);

/** Encrypt text so only the holder of the enclave's private key can read it. */
export async function sealFor(modelKeyHex: string, text: string): Promise<string> {
  const modelPub = modelKeyBytes(modelKeyHex);
  const eph = secp256k1.utils.randomPrivateKey();
  const key = await aesKey(sharedX(eph, modelPub), 'encrypt');
  const nonce = randomBytes(12);
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce as BufferSource }, key, enc.encode(text)));
  const out = new Uint8Array(65 + 12 + body.length);
  out.set(secp256k1.getPublicKey(eph, false), 0);
  out.set(nonce, 65);
  out.set(body, 77); // AES-GCM output is the ciphertext followed by the 16-byte tag
  return toHex(out);
}

export const looksSealed = (s: string): boolean => s.length >= 186 && s.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(s);

/** A one-time key pair for reading one reply. */
export function replyKey(): { priv: Uint8Array; pubHex: string } {
  const priv = secp256k1.utils.randomPrivateKey();
  return { priv, pubHex: toHex(secp256k1.getPublicKey(priv, false)) };
}

/** Open one piece the enclave encrypted to our one-time key. */
export async function openFrom(priv: Uint8Array, hex: string): Promise<string> {
  try {
    const raw = fromHex(hex);
    const key = await aesKey(sharedX(priv, raw.subarray(0, 65)), 'decrypt');
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.subarray(65, 77) as BufferSource }, key, raw.subarray(77) as BufferSource);
    return dec.decode(plain);
  } catch {
    throw new SealedError('decrypt');
  }
}

/** The same checks the relay runs (veniceE2ee.ts checkReport), run again here so the browser does not take the relay's word. */
export function checkReport(a: Record<string, unknown>, nonce: string): string {
  if (a.verified !== true) throw new SealedError('attestation');
  if (a.nonce !== nonce) throw new SealedError('nonce');
  if (a.debug === true || a.debug_mode === true || a.debuggable === true) throw new SealedError('attestation');
  const key = (a.signing_key ?? a.signing_public_key) as unknown;
  if (typeof key !== 'string' || !key) throw new SealedError('key');
  modelKeyBytes(key);
  return key;
}

// ── The checks that run on this device ──────────────────────────────────────

export type Prepared =
  | { ok: true; text: string; softened: boolean; hostile: Hostility | ''; scrubbed: number }
  | { ok: false; blocked: 'manipulation' | 'crisis' | 'empty' | 'long'; flag?: SafetyFlag };

export const MAX_SEALED_USER_CHARS = 500;

/** Screens and scrubs one message before it is encrypted. Earlier messages are passed so the crisis check sees the whole conversation. */
export function prepareTurn(text: string, earlierUserTexts: string[] = []): Prepared {
  const t = text.trim();
  if (!t) return { ok: false, blocked: 'empty' };
  if (t.length > MAX_SEALED_USER_CHARS) return { ok: false, blocked: 'long' };
  if (looksLikeManipulation(t)) return { ok: false, blocked: 'manipulation' };
  const flag = checkConversation([...earlierUserTexts, t]);
  if (flag?.tier === 'stop') return { ok: false, blocked: 'crisis', flag };
  const scrub = scrubPII(t);
  return { ok: true, text: neutralize(scrub.text), softened: flag?.tier === 'soften', hostile: flag ? '' : detectHostility(t) ?? '', scrubbed: scrub.total };
}

/** The reply guards the relay would have run, run here instead. */
export function guardReply(reply: string, userTexts: string[]): string {
  let r = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (claimsInfrastructure(r)) r = INFRA_FALLBACK;
  if (claimsPersona(r)) r = PERSONA_FALLBACK;
  const names = echoedNames(userTexts, r);
  if (names.length) r = withoutNames(r, names);
  return r;
}

// ── The conversation ────────────────────────────────────────────────────────

export interface SealedTurn {
  reply: string;
  turn: number;
  done: boolean;
}

export interface SealedCoachOptions {
  session: { color1: string; color2: string };
  endpoint?: string;
  fetchImpl?: typeof fetch;
  /** Check the hardware evidence on this device (default true). Only tests against a fake enclave turn it off. */
  checkHardware?: boolean;
}

/**
 * A sealed conversation. Keeps the conversation only in this object (memory, never storage). Each user message is
 * encrypted once and the same ciphertext is resent on later turns (the relay's ticket is bound to it); the coach's
 * earlier replies are encrypted afresh each turn.
 */
export class SealedCoach {
  private modelKey: string | null = null;
  /** What the last hardware check found (null before one has passed, or when the check is off). */
  hardware: HardwareFacts | null = null;
  private userCipher: string[] = [];
  private history: { role: 'user' | 'assistant'; content: string }[] = [];
  private ticket: string | undefined;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;
  private readonly opts: SealedCoachOptions;
  constructor(opts: SealedCoachOptions) {
    this.opts = opts;
    this.endpoint = opts.endpoint ?? '/api/coach';
    this.fetchImpl = opts.fetchImpl ?? ((input, init) => fetch(input, init));
  }

  private async post(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    let res: Response;
    try {
      res = await this.fetchImpl(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: this.opts.session, ...body }) });
    } catch {
      throw new SealedError('network');
    }
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = new SealedError(j.reason === 'e2ee-key' ? 'key' : 'status');
      (err as SealedError & { detail?: unknown }).detail = j;
      throw err;
    }
    return j;
  }

  /** Asks for the enclave's attestation with a nonce made here, and checks it here. */
  async attest(): Promise<string> {
    const nonce = toHex(randomBytes(32));
    const j = await this.post({ sealed: 'attest', nonce });
    const report = (j.report ?? {}) as Record<string, unknown>;
    const key = checkReport(report, nonce);
    if (this.opts.checkHardware !== false) {
      const hw = await checkHardware(report, key, nonce);
      if (hw.ok === false) {
        this.modelKey = null;
        this.hardware = null;
        throw new SealedError('hardware', hw.failed);
      }
      this.hardware = hw.facts;
    }
    this.modelKey = key;
    return this.modelKey;
  }

  get turns(): number {
    return this.userCipher.length;
  }

  /** One exchange. A message the device's checks stop is never encrypted or sent. */
  async send(text: string): Promise<SealedTurn | Extract<Prepared, { ok: false }>> {
    const userTexts = this.history.filter((m) => m.role === 'user').map((m) => m.content);
    const prep = prepareTurn(text, userTexts);
    if (prep.ok === false) return prep;
    if (!this.modelKey) await this.attest();
    try {
      return await this.exchange(prep, userTexts);
    } catch (e) {
      // The enclave's key may have changed since we checked it. On a first exchange, check again and try once more. A
      // conversation under way is bound to the old key's ciphertext, so the page starts a new one instead.
      if (e instanceof SealedError && e.code === 'key' && this.userCipher.length === 0) {
        await this.attest();
        return this.exchange(prep, userTexts);
      }
      throw e;
    }
  }

  private async exchange(prep: Extract<Prepared, { ok: true }>, userTexts: string[]): Promise<SealedTurn> {
    const key = this.modelKey!;
    const mine = await sealFor(key, prep.text);
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    let u = 0;
    for (const m of this.history) messages.push({ role: m.role, content: m.role === 'user' ? this.userCipher[u++] : await sealFor(key, m.content) });
    messages.push({ role: 'user', content: mine });
    const reader = replyKey();
    const j = await this.post({ sealed: 'turn', modelKey: key, clientKey: reader.pubHex, messages, ticket: this.ticket, labels: { softened: prep.softened, hostile: prep.hostile } });
    const chunks = Array.isArray(j.chunks) ? (j.chunks as unknown[]).filter((c): c is string => typeof c === 'string') : [];
    let reply = '';
    for (const c of chunks) reply += looksSealed(c) ? await openFrom(reader.priv, c) : c;
    if (!reply.trim()) throw new SealedError('format');
    reply = guardReply(reply, [...userTexts, prep.text]);
    this.userCipher.push(mine);
    this.history.push({ role: 'user', content: prep.text }, { role: 'assistant', content: reply });
    this.ticket = typeof j.ticket === 'string' ? j.ticket : undefined;
    return { reply, turn: Number(j.turn) || this.userCipher.length, done: j.done === true };
  }

  /** Forget everything (the conversation lived only here). */
  clear(): void {
    this.modelKey = null;
    this.userCipher = [];
    this.history = [];
    this.ticket = undefined;
  }
}
