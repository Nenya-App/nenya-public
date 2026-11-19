// POST /api/words: an optional look-up for "a word of your own" (docs/word-help-scope.md), asked for by a visitor who pressed a button that said what is sent. The visitor's browser never
// reaches the services: this function takes ONE word (letters, a hyphen or an apostrophe, up to 24 characters) and a language (English only for now), asks Datamuse (related words) and the Free
// Dictionary API (a meaning) over HTTPS, and returns a short list of words and one meaning. The services see this function and nothing else: no visitor address, no cookie, no identifier. Nothing
// about the request (the word, the address) is stored or logged. Off unless WORD_HELP_ENABLED=true.
//
//   WORD_HELP_ENABLED         plain   "true" turns the look-up on (default off)
//   WORD_HELP_PER_CONNECTION  plain   optional, look-ups per connection per day (default 40)
//   WORD_HELP_DAILY_CAP       plain   optional, look-ups per day in all (default 600)
//   COACH_IP_SECRET           secret  the same secret the coach uses for its one-way daily code; without it the per-connection limit is off
//   COACH_EXTRA_HOSTS         plain   the same extra hosts the coach allows (a preview or staging site)
import { getStore } from '@netlify/blobs';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import { connectionCode } from '../../src/lib/connectionLimit.ts';
import { capDay, type CounterStore } from '../../src/lib/dailyCap.ts';
import { WORD_HELP_LANGS, cleanLookupWord, parseDatamuse, parseDictionary } from '../../src/lib/wordHelp.ts';

const ROUTE = '/api/words';
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

async function ask(url: string): Promise<unknown | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    clearTimeout(timer);
    return res.ok ? await res.json() : null;
  } catch { clearTimeout(timer); return null; }
}

export default async (req: Request, netlify?: { ip?: string }): Promise<Response> => {
  if (new URL(req.url).pathname !== ROUTE) return fail(404, 'not-found');
  if (req.method !== 'POST') return fail(405, 'method');
  if (process.env.WORD_HELP_ENABLED !== 'true') return fail(503, 'off');

  let originHost = '';
  try { const o = req.headers.get('origin'); originHost = o ? new URL(o).hostname : ''; } catch { originHost = ''; }
  if (!hostAllowed(originHost, process.env.COACH_EXTRA_HOSTS)) return fail(403, 'origin');
  if (!(req.headers.get('content-type') || '').includes('application/json')) return fail(415, 'type');

  const text = await req.text();
  if (text.length > MAX_BODY) return fail(413, 'size');
  let body: { word?: unknown; lang?: unknown };
  try { body = JSON.parse(text); } catch { return fail(400, 'json'); }
  const word = cleanLookupWord(body.word);
  const lang = body.lang === undefined ? 'en' : body.lang;
  if (!word) return fail(400, 'invalid');
  if (typeof lang !== 'string' || !(WORD_HELP_LANGS as readonly string[]).includes(lang)) return fail(400, 'language');

  const s = store();
  if (s) {
    const day = capDay();
    const code = connectionCode(process.env.COACH_IP_SECRET, netlify?.ip);
    if (code && !(await bump(s, `w/${day}/${code}`, intFrom(process.env.WORD_HELP_PER_CONNECTION, 40)))) return fail(429, 'limit');
    if (!(await bump(s, `w-total/${day}`, intFrom(process.env.WORD_HELP_DAILY_CAP, 600)))) return fail(429, 'limit');
  }

  const [related, entry] = await Promise.all([
    ask(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=14`),
    ask(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
  ]);
  const words = parseDatamuse(related);
  const meaning = parseDictionary(entry);
  if (related === null && entry === null) return fail(502, 'upstream');
  return reply(200, { words, meaning, sources: ['Datamuse', 'Free Dictionary API'] });
};

// Literal values on purpose: Netlify reads this block by static analysis. No rateLimit here (both of the project's code-based rules are taken: see netlify.toml).
export const config = { path: '/api/words' };
