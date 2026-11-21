// The coach relay's side of the selection call: one signed request to the selection function, with a short time budget. It never throws and never blocks the reply: any failure, or no answer in
// time, is "unavailable" and the relay carries on with the phrase matcher alone (fail open). The text goes only to our own function, in the request body, and nothing about the visitor goes with it.
import { SCREEN_HEADER, signScreenCall } from './screenAuth.ts';

export const SELECT_BUDGET_MS = 400;

export async function askSelect(opts: { origin: string; secret: string; text: string; fetchImpl?: typeof fetch; budgetMs?: number; now?: () => number }): Promise<{ ids: string[] } | null> {
  const f = opts.fetchImpl ?? fetch;
  const body = JSON.stringify({ text: opts.text.slice(0, 2000) });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.budgetMs ?? SELECT_BUDGET_MS);
  try {
    const res = await f(`${opts.origin}/api/select`, { method: 'POST', headers: { 'content-type': 'application/json', [SCREEN_HEADER]: signScreenCall(opts.secret, body, (opts.now ?? Date.now)()) }, body, signal: ctl.signal });
    if (!res.ok) return null;
    const j = (await res.json()) as { ids?: unknown };
    return Array.isArray(j.ids) && j.ids.every((x) => typeof x === 'string') ? { ids: (j.ids as string[]).slice(0, 8) } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
