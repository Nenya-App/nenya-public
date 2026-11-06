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
}

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

/** One encrypted chat completion. Streams internally and returns the whole decrypted reply. */
export async function e2eeChat(opts: E2eeChatOptions): Promise<{ content: string; finishReason?: string }> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const baseUrl = opts.baseUrl ?? VENICE_BASE;
  const modelKey = await attest({ apiKey: opts.apiKey, model: opts.model, baseUrl, fetchImpl, signal: opts.signal });

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
