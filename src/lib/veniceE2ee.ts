// Venice "E2EE" models (their ids start with "e2ee-"): the prompt is encrypted here, before it goes to Venice's
// API, and only the model's attested enclave (a TEE) can read it. Venice's servers relay ciphertext.
//
// Protocol, from Venice's TEE & E2EE guide: secp256k1 ECDH, HKDF-SHA256 (info "ecdsa_encryption"), AES-256-GCM.
// Every `user` and `system` message is encrypted, as the guide says. The guide says `assistant` messages (the model's
// earlier replies in a conversation) need no encryption, but sent as plain text they made every second turn fail live with
// "E2EE decryption failed" (the first turn, which has none, worked). So they are encrypted too, by default, which also
// keeps the coach's earlier replies from Venice's API layer. `encryptAssistant: false` restores the documented behaviour.
// The response arrives as encrypted chunks that this module decrypts.
//
// What this does and does not protect: the encryption happens in the Netlify relay function, not in the
// visitor's browser, because the function has to read the message to scrub it, screen it and sign the transcript.
// So Venice's API layer sees ciphertext, but this function still sees the visitor's text in memory. Do not
// describe it as end-to-end encryption from the visitor's device.
//
// Attestation: we check what Venice reports (verified, our nonce echoed back, a signing key present, no debug
// flag). We do not parse the Intel TDX quote or the NVIDIA payload ourselves, so we rely on Venice's own
// verification of the enclave.
//
// A short memory of the result: asking Venice for an attestation on every message hit Venice's rate limit for that step
// (each coach turn made two requests). So the verified model key is kept in this function's memory for a few minutes
// (COACH_E2EE_ATTESTATION_TTL_S, default 300; 0 turns it off) and reused, and simultaneous first requests share one
// attestation. What is kept is the model's PUBLIC key and the time it was checked: nothing about any visitor or message.
// It is never written anywhere and goes when the function instance does. Rules, so the check is not weakened:
//  - the key is stored only after every check above has passed, and only for that model;
//  - if a fresh attestation reports "not verified", a debug enclave, a wrong nonce or a bad key, the stored key is dropped and
//    the request fails: a stored key is never used to get around a security failure;
//  - if the attestation step is only rate limited, briefly down or slow (429, 5xx, no answer), a stored key up to
//    COACH_E2EE_ATTESTATION_STALE_S old (default 900) is used instead of failing the visitor;
//  - if a request made with a stored key is refused or cannot be read (for example the enclave's key changed), the stored key is
//    dropped and the request is repeated once with a fresh attestation.

import { createCipheriv, createDecipheriv, createECDH, hkdfSync, randomBytes } from 'node:crypto';

const HKDF_INFO = Buffer.from('ecdsa_encryption');
const MIN_ENCRYPTED_HEX = 186; // ephemeral key (65) + nonce (12) + tag (16) = 93 bytes
const MAX_RESPONSE_CHARS = 20000;

export const VENICE_BASE = 'https://api.venice.ai/api/v1';

export const isE2eeModel = (model: string): boolean => model.startsWith('e2ee-');

/** A short code for logs. Never contains message text. */
export type E2eeCode = 'attestation' | 'nonce' | 'key' | 'status' | 'format' | 'decrypt' | 'size';
export class E2eeError extends Error {
  code: E2eeCode;
  /** The HTTP status Venice answered with, when it answered. */
  status?: number;
  /** A short, cleaned snippet of Venice's own error text. It goes in the server log only, never to the visitor. */
  detail?: string;
  constructor(code: E2eeCode, extra: { status?: number; detail?: string } = {}) {
    super('e2ee ' + code);
    this.code = code;
    this.status = extra.status;
    this.detail = extra.detail;
  }
}

/** A short single-line version of an error body: Venice's error message if it has one, cleaned and cut. */
async function errorDetail(res: Response): Promise<string | undefined> {
  try {
    const text = (await res.text()).slice(0, 400);
    let msg: unknown = text;
    try {
      const j = JSON.parse(text);
      msg = typeof j.error === 'string' ? j.error : j.error?.message ?? j.message ?? text;
    } catch {
      /* not JSON: use the text as it is */
    }
    return String(msg).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, 160) || undefined;
  } catch {
    return undefined;
  }
}

function publicKeyBytes(hex: string): Buffer {
  let h = hex.trim();
  if (h.startsWith('0x')) h = h.slice(2);
  if (h.length === 128) h = '04' + h; // some reports omit the uncompressed-point prefix
  if (!/^04[0-9a-fA-F]{128}$/.test(h)) throw new E2eeError('key');
  return Buffer.from(h, 'hex');
}

const aesKey = (sharedSecret: Buffer): Buffer => Buffer.from(hkdfSync('sha256', sharedSecret, Buffer.alloc(0), HKDF_INFO, 32));

/** Encrypt text so only the holder of the model's private key can read it. Returns hex: ephemeral key, nonce, ciphertext, tag. */
export function encryptTo(modelPublicKeyHex: string, plaintext: string): string {
  const ecdh = createECDH('secp256k1');
  ecdh.generateKeys();
  const key = aesKey(ecdh.computeSecret(publicKeyBytes(modelPublicKeyHex)));
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([ecdh.getPublicKey(), nonce, body, cipher.getAuthTag()]).toString('hex');
}

export const looksEncrypted = (s: string): boolean => s.length >= MIN_ENCRYPTED_HEX && s.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(s);

/** Decrypt a chunk the enclave encrypted to our one-time key. */
export function decryptFrom(clientKey: ReturnType<typeof createECDH>, hex: string): string {
  try {
    const raw = Buffer.from(hex, 'hex');
    const key = aesKey(clientKey.computeSecret(raw.subarray(0, 65)));
    const nonce = raw.subarray(65, 77);
    const tag = raw.subarray(raw.length - 16);
    const decipher = createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(raw.subarray(77, raw.length - 16)), decipher.final()]).toString('utf8');
  } catch {
    throw new E2eeError('decrypt');
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface E2eeChatOptions {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  /** Encrypt earlier `assistant` messages too (default true). */
  encryptAssistant?: boolean;
  /** Extra body fields (temperature and so on). `model`, `messages` and `stream` are set here. */
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** How long a verified model key is remembered (default: from the environment; see the note at the top of this file). */
  attestation?: AttestationPolicy;
}

export interface AttestationPolicy {
  /** How long a verified key is reused without asking again (ms). 0 turns the memory off. */
  ttlMs: number;
  /** How old a stored key may be and still be used when the attestation step is only rate limited or briefly down (ms). */
  staleMs: number;
  now: () => number;
}

const secondsFromEnv = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** The policy from the environment (COACH_E2EE_ATTESTATION_TTL_S and _STALE_S); a day is the most either may be. */
export function attestationPolicyFromEnv(env: Record<string, string | undefined> = process.env): AttestationPolicy {
  const ttl = Math.min(86400, secondsFromEnv(env.COACH_E2EE_ATTESTATION_TTL_S, 300));
  const stale = Math.min(86400, Math.max(ttl, secondsFromEnv(env.COACH_E2EE_ATTESTATION_STALE_S, 900)));
  return { ttlMs: ttl * 1000, staleMs: ttl === 0 ? 0 : stale * 1000, now: () => Date.now() };
}

const keyMemory = new Map<string, { key: string; at: number }>();
const keyInFlight = new Map<string, Promise<string>>();
/** For tests: forget every stored key. */
export const __clearAttestationMemory = (): void => {
  keyMemory.clear();
  keyInFlight.clear();
};
/** For tests: what is remembered (the public key and when it was checked). */
export const __attestationMemory = (): { model: string; key: string; at: number }[] => [...keyMemory].map(([model, v]) => ({ model, ...v }));

/** True when the attestation step failed only because Venice was busy or unreachable, not because the report was bad. */
const onlyBusy = (e: unknown): boolean => {
  if (e instanceof E2eeError) return e.code === 'attestation' && e.status !== undefined && (e.status === 429 || e.status >= 500);
  return true; // no answer at all (network, timeout)
};

/** Fetch and check the enclave's attestation; returns the key to encrypt to. */
async function attest(o: Required<Pick<E2eeChatOptions, 'apiKey' | 'model' | 'baseUrl'>> & { fetchImpl: typeof fetch; signal?: AbortSignal }): Promise<string> {
  const nonce = randomBytes(32).toString('hex'); // 32 bytes, as the providers require
  const res = await o.fetchImpl(`${o.baseUrl}/tee/attestation?model=${encodeURIComponent(o.model)}&nonce=${nonce}`, {
    headers: { Authorization: `Bearer ${o.apiKey}` },
    signal: o.signal,
  });
  if (!res.ok) throw new E2eeError('attestation', { status: res.status, detail: await errorDetail(res) });
  const a = (await res.json()) as Record<string, unknown>;
  if (a.verified !== true) throw new E2eeError('attestation');
  if (a.nonce !== nonce) throw new E2eeError('nonce');
  // Best effort: refuse a report that says it came from a debug enclave. (The guide asks for this check but
  // does not name the field, so look at the likely ones.)
  if (a.debug === true || a.debug_mode === true || a.debuggable === true) throw new E2eeError('attestation');
  const key = (a.signing_key ?? a.signing_public_key) as unknown;
  if (typeof key !== 'string' || !key) throw new E2eeError('key');
  publicKeyBytes(key); // throws on a malformed key
  return key;
}

/** The key to encrypt to for this model: the remembered one if it is recent, else a fresh, fully checked attestation. */
async function modelKeyFor(
  o: { apiKey: string; model: string; baseUrl: string; fetchImpl: typeof fetch; signal?: AbortSignal },
  policy: AttestationPolicy,
  forceFresh = false
): Promise<{ key: string; remembered: boolean }> {
  const now = policy.now();
  const hit = keyMemory.get(o.model);
  if (!forceFresh && policy.ttlMs > 0 && hit && now - hit.at < policy.ttlMs) return { key: hit.key, remembered: true };
  if (forceFresh) keyMemory.delete(o.model);
  // Requests that arrive together share one attestation instead of each making their own.
  let pending = policy.ttlMs > 0 ? keyInFlight.get(o.model) : undefined;
  if (!pending) {
    pending = attest({ ...o, signal: o.signal ?? AbortSignal.timeout(15000) }).then(
      (key) => {
        if (policy.ttlMs > 0) keyMemory.set(o.model, { key, at: policy.now() });
        return key;
      },
      (e) => {
        if (!onlyBusy(e)) keyMemory.delete(o.model); // a security failure: forget the stored key
        throw e;
      }
    );
    if (policy.ttlMs > 0) {
      keyInFlight.set(o.model, pending);
      const clear = () => keyInFlight.delete(o.model);
      pending.then(clear, clear);
    }
  }
  try {
    return { key: await pending, remembered: false };
  } catch (e) {
    // Only when Venice was busy or unreachable, and only for a recently checked key.
    if (policy.staleMs > 0 && hit && now - hit.at < policy.staleMs && onlyBusy(e)) return { key: hit.key, remembered: true };
    throw e;
  }
}

/** One encrypted chat completion. Streams internally and returns the whole decrypted reply. */
export async function e2eeChat(opts: E2eeChatOptions): Promise<{ content: string; finishReason?: string }> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const baseUrl = opts.baseUrl ?? VENICE_BASE;
  const policy = opts.attestation ?? attestationPolicyFromEnv();
  const base = { apiKey: opts.apiKey, model: opts.model, baseUrl, fetchImpl, signal: opts.signal };
  const first = await modelKeyFor(base, policy);
  try {
    return await chatWithKey(opts, first.key, fetchImpl, baseUrl);
  } catch (e) {
    // A request made with a remembered key that is refused or cannot be read may mean the enclave's key changed: forget it and
    // try once more with a fresh attestation. (A failure with a fresh key is a real failure and is not repeated.)
    if (first.remembered && e instanceof E2eeError && (e.code === 'status' || e.code === 'decrypt' || e.code === 'format') && !opts.signal?.aborted) {
      const second = await modelKeyFor(base, policy, true);
      return chatWithKey(opts, second.key, fetchImpl, baseUrl);
    }
    throw e;
  }
}

async function chatWithKey(opts: E2eeChatOptions, modelKey: string, fetchImpl: typeof fetch, baseUrl: string): Promise<{ content: string; finishReason?: string }> {

  // A fresh key for every request, used only to read this reply.
  const client = createECDH('secp256k1');
  client.generateKeys();

  const encryptAssistant = opts.encryptAssistant !== false;
  const messages = opts.messages.map((m) => (m.role === 'assistant' && !encryptAssistant ? m : { ...m, content: encryptTo(modelKey, m.content) }));
  const res = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: 'POST',
    signal: opts.signal,
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      'X-Venice-TEE-Client-Pub-Key': client.getPublicKey('hex'),
      'X-Venice-TEE-Model-Pub-Key': modelKey,
      'X-Venice-TEE-Signing-Algo': 'ecdsa',
    },
    body: JSON.stringify({ ...opts.params, model: opts.model, messages, stream: true }),
  });
  if (!res.ok || !res.body) throw new E2eeError('status', { status: res.status, detail: res.ok ? 'no response body' : await errorDetail(res) });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let content = '';
  let finishReason: string | undefined;
  const handle = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return;
    let chunk: { choices?: { delta?: { content?: string }; finish_reason?: string | null }[] };
    try {
      chunk = JSON.parse(data);
    } catch {
      return; // a malformed chunk is skipped, as in Venice's own example
    }
    const choice = chunk.choices?.[0];
    if (choice?.finish_reason) finishReason = choice.finish_reason;
    const piece = choice?.delta?.content;
    if (piece) {
      content += looksEncrypted(piece) ? decryptFrom(client, piece) : piece;
      if (content.length > MAX_RESPONSE_CHARS) throw new E2eeError('size');
    }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    lines.forEach(handle);
  }
  pending += decoder.decode();
  if (pending) handle(pending);
  if (!content) throw new E2eeError('format');
  return { content, finishReason };
}
