// Checks a signed Nenya coach-demo transcript, in the browser or in Node, with nothing sent anywhere. It recomputes the
// hash of the transcript, checks the Ed25519 signature, and checks the key id against the key's own bytes. It cannot
// say whether the key is Nenya's unless the key id is in the list published in docs/coach-transcripts.md, so it reports
// that separately. It takes both forms of the file: the signed .json, and the readable .txt copy, which carries the signed
// file at the end and is also checked against it (so editing the readable text above is caught).
import { readableTranscript, type Receipt, type SignedTranscript } from './transcript.ts';

/** The key id(s) Nenya has published for its own signing key (see docs/coach-transcripts.md). */
export const PUBLISHED_KEY_IDS = ['579b407dc600fa7d'];

export const BLOCK_BEGIN = '-----BEGIN NENYA SIGNED TRANSCRIPT-----';
export const BLOCK_END = '-----END NENYA SIGNED TRANSCRIPT-----';

export interface SignedFile {
  transcript: SignedTranscript;
  receipt: Receipt;
}

export interface VerifiedDetails {
  version: number;
  issuedAt: string;
  keyId: string;
  publishedKey: boolean;
  session: { color1: string; color2: string };
  messageCount: number;
  meta?: SignedTranscript['meta'];
}

export type VerifyOutcome =
  | { status: 'valid'; details: VerifiedDetails }
  | { status: 'invalid'; reason: 'shape' | 'hash' | 'signature' | 'keyid'; message: string }
  | { status: 'unsupported'; message: string };

const hex = (buf: ArrayBuffer): string => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const utf8 = (s: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;
const fromBase64 = (b64: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const toBase64 = (bytes: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

/** The signed file as a block of text, to sit at the end of a readable copy. */
export function signedBlock(file: SignedFile): string {
  const b64 = toBase64(utf8(JSON.stringify(file)));
  const lines = b64.match(/.{1,76}/g) ?? [];
  return [BLOCK_BEGIN, ...lines, BLOCK_END].join('\n');
}

/** The readable copy with the signed file attached at the end. */
export const readableWithBlock = (readable: string, file: SignedFile): string => `${readable}\n\n${signedBlock(file)}\n`;

/** Reads either form of the file. For the readable copy, also returns the text that sits above the signed block. */
export function extractSigned(text: string): { file: unknown; readableAbove?: string } | null {
  const t = text.replace(/^﻿/, '').trim();
  if (t.startsWith('{')) {
    try {
      return { file: JSON.parse(t) };
    } catch {
      return null;
    }
  }
  const a = t.indexOf(BLOCK_BEGIN);
  const b = t.indexOf(BLOCK_END);
  if (a < 0 || b < a) return null;
  try {
    const b64 = t.slice(a + BLOCK_BEGIN.length, b).replace(/\s+/g, '');
    return { file: JSON.parse(new TextDecoder().decode(fromBase64(b64))), readableAbove: t.slice(0, a) };
  } catch {
    return null;
  }
}

const normalize = (s: string): string => s.replace(/\r\n/g, '\n').trim();

/** Whether the readable text above the block is exactly what the signed transcript produces. */
export function readableMatches(readableAbove: string, file: SignedFile): boolean {
  const t = file.transcript;
  return normalize(readableAbove) === normalize(readableTranscript(t.messages, t.session, file.receipt, t.context ?? '', t.meta, t.site ?? [], t.checks ?? []));
}

export async function verifySigned(
  input: unknown,
  opts: { subtle?: SubtleCrypto; publishedKeyIds?: string[] } = {}
): Promise<VerifyOutcome> {
  const subtle = opts.subtle ?? globalThis.crypto?.subtle;
  const published = opts.publishedKeyIds ?? PUBLISHED_KEY_IDS;
  const f = input as { transcript?: SignedTranscript; receipt?: Receipt } | null;
  const t = f?.transcript;
  const r = f?.receipt;
  if (!t || !r || !Array.isArray(t.messages) || !t.session || typeof r.hash !== 'string' || typeof r.signature !== 'string' || typeof r.publicKey !== 'string' || typeof r.issuedAt !== 'string' || typeof r.keyId !== 'string') {
    return { status: 'invalid', reason: 'shape', message: 'This is not a signed Nenya transcript: the transcript or its receipt is missing.' };
  }
  if (!subtle) return { status: 'unsupported', message: 'This browser cannot do the check. Try another browser, or use the verify script.' };

  const hash = hex(await subtle.digest('SHA-256', utf8(JSON.stringify(t))));
  if (hash !== r.hash) {
    return { status: 'invalid', reason: 'hash', message: 'The transcript has been changed since it was signed: it no longer matches its fingerprint.' };
  }
  let sigOk = false;
  try {
    const key = await subtle.importKey('spki', fromBase64(r.publicKey), { name: 'Ed25519' }, false, ['verify']);
    sigOk = await subtle.verify('Ed25519', key, fromBase64(r.signature), utf8(`nenya-coach-transcript-v${t.v === 3 ? 3 : 2}\n${r.hash}\n${r.issuedAt}`));
  } catch (e) {
    if ((e as Error)?.name === 'NotSupportedError') {
      return { status: 'unsupported', message: 'This browser cannot check this kind of signature. Try a current Safari, Chrome or Firefox, or use the verify script.' };
    }
    sigOk = false;
  }
  if (!sigOk) return { status: 'invalid', reason: 'signature', message: 'The signature does not match: the transcript, its date, or its key was altered.' };
  const keyId = hex(await subtle.digest('SHA-256', utf8(r.publicKey))).slice(0, 16);
  if (keyId !== r.keyId) return { status: 'invalid', reason: 'keyid', message: 'The key id does not match the key.' };
  return {
    status: 'valid',
    details: { version: t.v, issuedAt: r.issuedAt, keyId, publishedKey: published.includes(keyId), session: t.session, messageCount: t.messages.length, meta: t.meta },
  };
}
