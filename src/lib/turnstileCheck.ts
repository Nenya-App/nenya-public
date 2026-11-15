// The humanity check for the coach (Cloudflare Turnstile), on the server side.
//
// The browser shows Cloudflare's widget and gets a single-use token. The first message of a conversation carries it; this
// function asks Cloudflare whether the token is genuine. Later messages need no token: the conversation's signed ticket
// already binds them to that first, checked message.
//
// Settings (production-env.md):
//   COACH_TURNSTILE       off (default) | shadow | on. "shadow" checks and counts but never refuses, for measuring first.
//   TURNSTILE_SECRET_KEY  the widget's secret (Functions scope, secret). Never in the repo or in chat.
//   TURNSTILE_HOSTNAMES   the page hosts a token may come from, comma-separated, set per site (production: nenya.biz,www.nenya.biz).
//                         Never localhost on production. Empty while "on" refuses every first message (fails closed).
//
// What is sent to Cloudflare: the token and the secret. Not the visitor's IP address (optional for Cloudflare; left out),
// and nothing of the conversation. Nothing about the check is stored or logged; only plain counts.

export type TurnstileMode = 'off' | 'shadow' | 'on';

/** The action the widget is rendered with, and the only one accepted. */
export const TURNSTILE_ACTION = 'coach';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN = 2048;

export function turnstileMode(raw: string | undefined): TurnstileMode {
  const v = (raw ?? '').trim().toLowerCase();
  return v === 'on' || v === 'shadow' ? v : 'off';
}

export function turnstileHosts(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter((h) => /^[a-z0-9.-]{1,253}$/.test(h)),
  );
}

/** Why a check failed: a short code for counts only. */
export type TurnstileFailure = 'missing' | 'config' | 'unreachable' | 'rejected' | 'action' | 'hostname';

export type TurnstileResult = { ok: true; why?: undefined } | { ok: false; why: TurnstileFailure };

/** Asks Cloudflare whether a token is genuine, for this action and one of the allowed hosts. Fails closed on any doubt. */
export async function checkTurnstile(
  token: unknown,
  secret: string | undefined,
  hosts: Set<string>,
  fetchImpl: typeof fetch = fetch,
): Promise<TurnstileResult> {
  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN) return { ok: false, why: 'missing' };
  if (!secret || hosts.size === 0) return { ok: false, why: 'config' };
  let result: { success?: unknown; action?: unknown; hostname?: unknown };
  try {
    const r = await fetchImpl(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!r.ok) return { ok: false, why: 'unreachable' };
    result = await r.json();
  } catch {
    return { ok: false, why: 'unreachable' };
  }
  if (result?.success !== true) return { ok: false, why: 'rejected' };
  if (result.action !== TURNSTILE_ACTION) return { ok: false, why: 'action' };
  if (typeof result.hostname !== 'string' || !hosts.has(result.hostname.toLowerCase())) return { ok: false, why: 'hostname' };
  return { ok: true };
}
