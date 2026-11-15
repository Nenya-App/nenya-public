// The signed internal call from the coach relay to the screening function (netlify/functions/screen.mts). The screening endpoint is reachable at a public address, so it answers only a request carrying a
// short-lived signature made with a secret that only the two functions know (COACH_SCREEN_SECRET): the time, then an HMAC-SHA256 of the time and the body. A copied header stops working after
// thirty seconds and is bound to its body. Without the secret the endpoint does not exist. No identifier is part of it.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SCREEN_HEADER = 'x-nenya-screen';
export const SCREEN_WINDOW_MS = 30_000;

const mac = (secret: string, t: string, body: string): string => createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');

export const signScreenCall = (secret: string, body: string, now = Date.now()): string => `${now}.${mac(secret, String(now), body)}`;

export function verifyScreenCall(secret: string | undefined, header: string | null | undefined, body: string, now = Date.now()): boolean {
  if (!secret || !header) return false;
  const dot = header.indexOf('.');
  if (dot < 1) return false;
  const t = header.slice(0, dot);
  const given = header.slice(dot + 1);
  const at = Number(t);
  if (!Number.isFinite(at) || Math.abs(now - at) > SCREEN_WINDOW_MS) return false;
  const want = mac(secret, t, body);
  if (given.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(want));
}
