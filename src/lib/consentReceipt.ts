// The consent receipt: a small file, signed by the site, that the person keeps. It says what they agreed to when they sent a conversation: the transcript's fingerprint, the uses (including
// training), how long it is kept, what may be shown, that they said they are 18 or older and that the words are their own, which wording applied, and when. It is not a copy of the conversation.
// It is the person's own proof of what was agreed, alongside the signed transcript, which stays the key for taking a permission back (docs/drafts/transcript-contribution-terms-draft.md).
import { createPrivateKey, createPublicKey, createHash, sign as edSign, verify as edVerify } from 'node:crypto';
import type { Choices } from './transcriptPolicy.ts';

export interface ConsentReceipt {
  kind: 'nenya-consent-receipt';
  v: 1;
  transcript: string;
  uses: string[];
  keep: string;
  portions?: 'all' | number[];
  showFor?: string;
  adult: true;
  terms: string;
  issuedAt: string;
  keyId: string;
  publicKey: string;
  signature: string;
}

/** The exact text that is signed: the fields in a fixed order, so it can be checked later. */
export const consentText = (r: Omit<ConsentReceipt, 'signature'>): string =>
  JSON.stringify([r.kind, r.v, r.transcript, [...r.uses].sort(), r.keep, r.portions ?? null, r.showFor ?? null, r.adult, r.terms, r.issuedAt, r.keyId]);

/** Signs a consent receipt with the site's key (base64 PKCS8, the same COACH_SIGNING_KEY the transcripts use). Returns null if the key is missing or unreadable. */
export function signConsent(transcriptHash: string, c: Choices, now: Date, keyB64: string | undefined): ConsentReceipt | null {
  if (!keyB64) return null;
  try {
    const key = createPrivateKey({ key: Buffer.from(keyB64, 'base64'), format: 'der', type: 'pkcs8' });
    const spki = (createPublicKey(key).export({ type: 'spki', format: 'der' }) as Buffer).toString('base64');
    const body: Omit<ConsentReceipt, 'signature'> = {
      kind: 'nenya-consent-receipt', v: 1, transcript: transcriptHash, uses: [...c.uses], keep: c.keep, ...(c.portions ? { portions: c.portions } : {}), ...(c.showFor ? { showFor: c.showFor } : {}),
      adult: true, terms: c.terms ?? '', issuedAt: now.toISOString(), keyId: createHash('sha256').update(spki).digest('hex').slice(0, 16), publicKey: spki,
    };
    return { ...body, signature: edSign(null, Buffer.from(consentText(body)), key).toString('base64') };
  } catch {
    return null;
  }
}

/** True if the signature matches the fields, using the public key inside the receipt (compare its keyId with the site's published key to know whose it is). */
export function verifyConsent(r: ConsentReceipt): boolean {
  try {
    const { signature, ...body } = r;
    const pub = createPublicKey({ key: Buffer.from(r.publicKey, 'base64'), format: 'der', type: 'spki' });
    return edVerify(null, Buffer.from(consentText(body)), pub, Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}
