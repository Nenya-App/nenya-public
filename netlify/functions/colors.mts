// POST /api/colors: an optional palette from The Color API (thecolorapi.com, by Josh Beckman), asked for by a visitor who pressed a button that said what
// is sent (docs/color-tools-scope.md). The visitor's browser never reaches the service: this function takes ONE hex colour and ONE scheme mode, asks the
// API's /scheme over HTTPS, and returns five hex colours. The service sees this function and nothing else: no visitor address, no cookie, no identifier.
// Nothing about the request (the colour, the mode, the address) is stored or logged. Off unless PALETTE_ENABLED=true.
//
//   PALETTE_ENABLED         plain   "true" turns the feature on (default off)
//   PALETTE_PER_CONNECTION  plain   optional, requests per connection per day (default 20)
//   PALETTE_DAILY_CAP       plain   optional, requests per day in all (default 300)
//   COACH_IP_SECRET         secret  the same secret the coach uses for its one-way daily code; without it the per-connection limit is off
//   COACH_EXTRA_HOSTS       plain   the same extra hosts the coach allows (a preview or staging site)
// It cannot use another code-based rate-limit rule (both of the project's are taken: see netlify.toml), so its limits are kept here, as the coach's are.
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { connectionCode } from '../../src/lib/connectionLimit.ts';
import { capDay, type CounterStore } from '../../src/lib/dailyCap.ts';
import { SCHEME_MODES, isHex } from '../../src/lib/colorSchemes.ts';

const ROUTE = '/api/colors';
const UPSTREAM = 'https://www.thecolorapi.com/scheme';
const TIMEOUT_MS = 6000;
const MAX_BODY = 200;

let storeOverride: CounterStore | null = null;
export const __useStoreForTests = (s: unknown) => { storeOverride = s as CounterStore | null; };
const store = (): CounterStore | null => {
  if (storeOverride) return storeOverride;
  try { return getStore(storeNameFrom(process.env.COACH_STORE_NAME)) as unknown as CounterStore; } catch { return null; }
};

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const fail = (status: number, error: string) => reply(status, { error }); // a short code only, never the request

const intFrom = (raw: string | undefined, fallback: number) => { const n = Number(raw); return raw && Number.isInteger(n) && n > 0 ? n : fallback; };

async function bump(s: CounterStore, key: string, limit: number): Promise<boolean> {
  // True when the count was below the limit and has been raised; false when the limit is reached. An unreachable store lets the request through.
  try {
    for (let i = 0; i < 8; i++) {
      const cur = await s.getWithMetadata(key, { type: 'text' });
      const n = Number(cur?.data) || 0;
      if (n >= limit) return false;
      const res = cur?.etag ? await s.set(key, String(n + 1), { onlyIfMatch: cur.etag }) : await s.set(key, String(n + 1), { onlyIfNew: true });
      if (res.modified) return true;
    }
  } catch { /* an uncounted request is not fatal */ }
  return true;
}

export default async (req: Request, netlify?: { ip?: string }): Promise<Response> => {
  if (new URL(req.url).pathname !== ROUTE) return fail(404, 'not-found');
  if (req.method !== 'POST') return fail(405, 'method');
  if (process.env.PALETTE_ENABLED !== 'true') return fail(503, 'off');

  let originHost = '';
  try { const o = req.headers.get('origin'); originHost = o ? new URL(o).hostname : ''; } catch { originHost = ''; }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return fail(403, 'origin');
  if (!(req.headers.get('content-type') || '').includes('application/json')) return fail(415, 'type');

  const text = await req.text();
  if (text.length > MAX_BODY) return fail(413, 'size');
  let body: { hex?: unknown; mode?: unknown };
  try { body = JSON.parse(text); } catch { return fail(400, 'json'); }
  if (!isHex(body.hex) || typeof body.mode !== 'string' || !(SCHEME_MODES as readonly string[]).includes(body.mode)) return fail(400, 'invalid');
  const hex = body.hex.slice(1).toLowerCase();

  // Limits: per connection (a one-way daily code, as the coach uses) and in all. Neither stores anything about the colour.
  const s = store();
  if (s) {
    const day = capDay();
    const code = connectionCode(process.env.COACH_IP_SECRET, netlify?.ip);
    if (code && !(await bump(s, `p/${day}/${code}`, intFrom(process.env.PALETTE_PER_CONNECTION, 20)))) return fail(429, 'limit');
    if (!(await bump(s, `p-total/${day}`, intFrom(process.env.PALETTE_DAILY_CAP, 300)))) return fail(429, 'limit');
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${UPSTREAM}?hex=${hex}&mode=${body.mode}&count=5&format=json`, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    clearTimeout(timer);
    if (!res.ok) return fail(502, 'upstream');
    const j = (await res.json()) as { colors?: { hex?: { value?: string } }[] };
    const colors = (j.colors ?? []).map((c) => c.hex?.value ?? '');
    if (colors.length < 3 || !colors.every(isHex)) return fail(502, 'upstream');
    return reply(200, { colors: colors.slice(0, 5).map((c) => c.toUpperCase()), source: 'The Color API' });
  } catch {
    clearTimeout(timer);
    return fail(502, 'upstream');
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. No rateLimit here (see the header).
export const config = { path: '/api/colors' };
