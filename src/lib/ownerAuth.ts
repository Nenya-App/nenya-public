// The owner's token. Only its SHA-256 (hex) is ever in the environment (COACH_OWNER_TOKEN_HASH), so the secret itself is
// never in code or settings. Used to lift the per-connection coach limit and to read the usage totals.
import { createHash, timingSafeEqual } from 'node:crypto';

export function tokenMatches(token: string | null | undefined, hash: string | undefined): boolean {
  if (!hash || !token) return false;
  const a = Buffer.from(createHash('sha256').update(token).digest('hex'));
  const b = Buffer.from(hash.trim().toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}
