// The coach relay's side of the screening call: one signed request to the screening function, with a short time budget. It never throws and never blocks the reply: any failure, or no answer in time,
// is "unavailable" and the relay carries on with the phrase matcher alone (fail open). The text is sent only to our own function, in the request body, and nothing about the visitor goes with it.
import { SCREEN_HEADER, signScreenCall } from './screenAuth.ts';
import type { Band } from './screenModel.ts';

export const SCREEN_BUDGET_MS = 400;

export async function askScreen(opts: { origin: string; secret: string; text: string; fetchImpl?: typeof fetch; budgetMs?: number; now?: () => number }): Promise<{ band: Band } | null> {
  const f = opts.fetchImpl ?? fetch;
  const body = JSON.stringify({ text: opts.text.slice(0, 2000) });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.budgetMs ?? SCREEN_BUDGET_MS);
  try {
    const res = await f(`${opts.origin}/api/screen`, { method: 'POST', headers: { 'content-type': 'application/json', [SCREEN_HEADER]: signScreenCall(opts.secret, body, (opts.now ?? Date.now)()) }, body, signal: ctl.signal });
    if (!res.ok) return null;
    const j = (await res.json()) as { band?: unknown };
    return j.band === 'high' || j.band === 'mid' || j.band === 'low' ? { band: j.band } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
