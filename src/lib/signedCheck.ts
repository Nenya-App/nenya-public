// The check a signed coach-demo transcript must pass before Nenya acts on it (sending it to us, or taking back what was allowed): the shape, the hash, the
// Ed25519 signature, and that the key is one of Nenya's own (the current signing key, or an earlier one listed in COACH_ACCEPTED_KEY_IDS).
// Shared by netlify/functions/report.mts and transcript-revoke.mts so both accept exactly the same transcripts.
import { createHash, createPrivateKey, createPublicKey, verify as edVerify } from 'node:crypto';
import type { Receipt, SignedTranscript } from './transcript.ts';

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const HEX = /^#[0-9A-Fa-f]{6}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** The key ID of the current signing key, if one is set. */
function currentKeyId(env: Record<string, string | undefined>): string | null {
  const b64 = env.COACH_SIGNING_KEY;
  if (!b64) return null;
  try {
    const key = createPrivateKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'pkcs8' });
    const spki = createPublicKey(key).export({ type: 'spki', format: 'der' }) as Buffer;
    return sha256(spki.toString('base64')).slice(0, 16);
  } catch {
    return null;
  }
}

/** Why a transcript was refused, as a short code, or null if it is genuine. */
export function signedProblem(signed: unknown, env: Record<string, string | undefined> = process.env): string | null {
  const s = signed as { transcript?: SignedTranscript; receipt?: Receipt } | null;
  const t = s?.transcript;
  const r = s?.receipt;
  if (!t || !r || typeof t !== 'object' || typeof r !== 'object') return 'shape';
  if (t.v !== 2 && t.v !== 3) return 'version';
  if (!t.session || !HEX.test(t.session.color1) || !HEX.test(t.session.color2)) return 'shape';
  // A conversation the site ended carries one more message than a finished one: the user message the check stopped.
  const endedBySite = t.v === 3 && t.meta?.endedBy === 'site';
  if (!Array.isArray(t.messages) || t.messages.length < 1 || t.messages.length > 10 || (endedBySite ? t.messages.length % 2 !== 1 : t.messages.length < 2 || t.messages.length % 2 !== 0)) return 'shape';
  for (let i = 0; i < t.messages.length; i++) {
    const m = t.messages[i];
    const role = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== role || typeof m.content !== 'string' || m.content.length < 1 || m.content.length > (role === 'user' ? 500 : 3000)) return 'shape';
  }
  if (t.context !== undefined && (typeof t.context !== 'string' || t.context.length > 2500)) return 'shape';
  if (t.checks !== undefined) {
    if (!Array.isArray(t.checks) || t.checks.length > 5) return 'shape';
    for (const c of t.checks) {
      if (!c || !Number.isInteger(c.message) || (c.message < 0 ? !(c.message === -1 && c.shared === true) : c.message >= t.messages.length) || (c.tier !== 'stop' && c.tier !== 'soften') || typeof c.category !== 'string' || (c.source !== 'phrase' && c.source !== 'ladder')) return 'shape';
      if ((c.kind !== undefined && typeof c.kind !== 'string') || (c.matched !== undefined && (typeof c.matched !== 'string' || c.matched.length > 130)) || (c.rung !== undefined && typeof c.rung !== 'string') || (c.basedOn !== undefined && (!Array.isArray(c.basedOn) || c.basedOn.length > 5 || c.basedOn.some((n: unknown) => !Number.isInteger(n))))) return 'shape';
    }
  }
  if (t.site !== undefined) {
    const kinds = new Set(['greeting', 'closing', 'notice', 'invitation', 'answer', 'replacement', 'offer']);
    if (!Array.isArray(t.site) || t.site.length > 12) return 'shape';
    for (const x of t.site) {
      if (!x || !kinds.has(x.kind) || !Number.isInteger(x.after) || x.after < -1 || x.after >= t.messages.length || typeof x.text !== 'string' || x.text.length > 1500) return 'shape';
      if (x.resources !== undefined && (!Array.isArray(x.resources) || x.resources.length > 12 || x.resources.some((r: any) => !r || typeof r.name !== 'string' || typeof r.detail !== 'string' || r.name.length > 200 || r.detail.length > 300))) return 'shape';
    }
  }
  if (t.v === 3) {
    const m = t.meta;
    if (!m || typeof m.closed !== 'boolean' || !Number.isInteger(m.exchanges) || typeof m.build !== 'string' || typeof m.model !== 'string' || typeof m.instructions !== 'string') return 'shape';
    if (m.endedBy !== undefined && (m.endedBy !== 'site' || !m.stop || typeof m.stop.category !== 'string' || (m.stop.kind !== undefined && typeof m.stop.kind !== 'string') || m.closed)) return 'shape';
    if (m.stop !== undefined && m.endedBy !== 'site') return 'shape';
    if (m.terms !== undefined && (!m.terms || typeof m.terms.terms !== 'string' || m.terms.terms.length > 60 || typeof m.terms.build !== 'string' || m.terms.build.length > 80 || typeof m.terms.agreedAt !== 'string' || !ISO.test(m.terms.agreedAt))) return 'shape';
  } else if (t.meta !== undefined) return 'shape';
  if (r.algorithm !== 'Ed25519' || typeof r.hash !== 'string' || typeof r.signature !== 'string' || typeof r.publicKey !== 'string' || typeof r.keyId !== 'string' || typeof r.issuedAt !== 'string' || !ISO.test(r.issuedAt)) return 'shape';

  if (sha256(JSON.stringify(t)) !== r.hash) return 'hash';
  let sigOk = false;
  try {
    sigOk = edVerify(
      null,
      Buffer.from(`nenya-coach-transcript-v${t.v === 3 ? 3 : 2}\n${r.hash}\n${r.issuedAt}`),
      createPublicKey({ key: Buffer.from(r.publicKey, 'base64'), format: 'der', type: 'spki' }),
      Buffer.from(r.signature, 'base64')
    );
  } catch {
    sigOk = false;
  }
  if (!sigOk) return 'signature';
  const keyId = sha256(r.publicKey).slice(0, 16);
  const accepted = new Set([currentKeyId(env), ...(env.COACH_ACCEPTED_KEY_IDS ?? '').split(',').map((x) => x.trim().toLowerCase())].filter(Boolean) as string[]);
  if (keyId !== r.keyId || !accepted.has(keyId)) return 'key';
  return null;
}

