// The terms receipt: a small statement, signed by the site, that a visitor agreed to the Terms of Use and Privacy Policy as they stood on a given date, at a given time, on a given build of the site.
// It holds NO address, NO identifier and nothing the person wrote. The site stores nothing: it signs and hands it to the page. The page keeps it for the visit (cleared when the tab closes, on Emergency
// Exit, or on "Forget me"; kept on the device only if the person turned on "Remember on this device"), and it is copied into what the person later signs: a signed transcript, a consent receipt, any
// later agreement. Anyone can check it with the site's public key. The Terms version is explicit, and so is the build's commit, so the time can be cross-checked against the repository's history
// (docs/carrythrough-consent-scope.md).
import { createPrivateKey, createPublicKey, createHash, sign as edSign, verify as edVerify } from 'node:crypto';

export interface TermsReceipt {
  kind: 'nenya-terms-receipt';
  v: 1;
  /** The effective date of the Terms and Privacy Policy that was agreed to, as the site states it. */
  terms: string;
  /** The site's clock, ISO 8601. */
  agreedAt: string;
  /** The site build that asked (its label includes the commit). */
  build: string;
  keyId: string;
  publicKey: string;
  signature: string;
}
/** What a transcript or a consent receipt carries: the receipt without its key and signature (those are checked when it is made, by the site). */
export interface TermsFacts {
  terms: string;
  agreedAt: string;
  build: string;
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
export const termsText = (r: Omit<TermsReceipt, 'signature'>): string => `nenya-terms-receipt-v1\n${r.terms}\n${r.agreedAt}\n${r.build}\n${r.keyId}`;

export function signTerms(terms: string, build: string, now: Date, keyB64: string | undefined): TermsReceipt | null {
  if (!keyB64) return null;
  try {
    const key = createPrivateKey({ key: Buffer.from(keyB64, 'base64'), format: 'der', type: 'pkcs8' });
    const spki = (createPublicKey(key).export({ type: 'spki', format: 'der' }) as Buffer).toString('base64');
    const body: Omit<TermsReceipt, 'signature'> = { kind: 'nenya-terms-receipt', v: 1, terms, agreedAt: now.toISOString(), build, keyId: createHash('sha256').update(spki).digest('hex').slice(0, 16), publicKey: spki };
    return { ...body, signature: edSign(null, Buffer.from(termsText(body)), key).toString('base64') };
  } catch {
    return null;
  }
}

/** Checks a receipt's shape and signature against the public key inside it. */
export function verifyTerms(r: unknown): r is TermsReceipt {
  try {
    const x = r as TermsReceipt;
    if (!x || x.kind !== 'nenya-terms-receipt' || x.v !== 1 || typeof x.terms !== 'string' || x.terms.length > 60 || typeof x.build !== 'string' || x.build.length > 80 || typeof x.agreedAt !== 'string' || !ISO.test(x.agreedAt) || typeof x.keyId !== 'string' || typeof x.publicKey !== 'string' || typeof x.signature !== 'string') return false;
    const { signature, ...body } = x;
    const pub = createPublicKey({ key: Buffer.from(x.publicKey, 'base64'), format: 'der', type: 'spki' });
    return edVerify(null, Buffer.from(termsText(body)), pub, Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}

/** True only if it verifies AND was signed by THIS site's key (the key id matches), so a receipt made with someone else's key is not accepted. */
export function termsFromOurKey(r: unknown, ourKeyId: string, now: Date = new Date()): TermsFacts | null {
  if (!verifyTerms(r) || r.keyId !== ourKeyId) return null;
  if (new Date(r.agreedAt).getTime() > now.getTime() + 60_000) return null; // not from the future
  return { terms: r.terms, agreedAt: r.agreedAt, build: r.build };
}
