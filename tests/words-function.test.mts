// POST /api/words (the optional word look-up): off until switched on, closed to other sites, one word and English in, a short list and one meaning out, the limits, and nothing about the request reaching the services or the log.
process.env.COACH_IP_SECRET = 'ip-secret-ip-secret-ip-secret';
delete process.env.WORD_HELP_ENABLED; delete process.env.WORD_HELP_PER_CONNECTION; delete process.env.WORD_HELP_DAILY_CAP; delete process.env.COACH_EXTRA_HOSTS;
const calls: { url: string; headers: any }[] = [];
const DATAMUSE = JSON.stringify([{ word: 'weary', score: 90 }, { word: 'worn', score: 80 }, { word: 'drained', score: 70 }, { word: '<script>', score: 1 }]);
const DICT = JSON.stringify([{ word: 'tired', meanings: [{ partOfSpeech: 'adjective', definitions: [{ definition: 'In need of rest or sleep.' }] }] }]);
let datamuse = () => new Response(DATAMUSE, { status: 200 });
let dict = () => new Response(DICT, { status: 200 });
(globalThis as any).fetch = async (url: string, init: any) => { calls.push({ url: String(url), headers: init?.headers ?? {} }); return String(url).includes('datamuse') ? datamuse() : dict(); };
const logged: string[] = [];
const origLog = console.log; const origErr = console.error; const origWarn = console.warn;
console.log = (...a: any[]) => { logged.push(a.join(' ')); origLog(...a); }; console.error = (...a: any[]) => { logged.push(a.join(' ')); origErr(...a); }; console.warn = (...a: any[]) => { logged.push(a.join(' ')); origWarn(...a); };
const { default: fn, __useStoreForTests } = await import('../netlify/functions/words.mts');
import { ok } from './helpers.mts';

const mem = new Map<string, { v: string; e: number }>();
__useStoreForTests({
  async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
  async set(k: string, v: string, o: any) { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
});
const call = async (body: any, o: { origin?: string | null; method?: string; path?: string; type?: string; ip?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': o.type ?? 'application/json', cookie: 'secret=1' };
  if (o.origin !== null) headers.origin = o.origin ?? 'https://nenya.biz';
  const res = await fn(new Request(`https://nenya.biz${o.path ?? '/api/words'}`, { method: o.method ?? 'POST', headers, body: o.method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) }), { ip: o.ip ?? '203.0.113.7' });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
};
let r = await call({ word: 'tired' });
ok('off until WORD_HELP_ENABLED=true, and nothing is asked', r.status === 503 && r.json.error === 'off' && calls.length === 0);
process.env.WORD_HELP_ENABLED = 'true';
r = await call({ word: 'Tired' });
ok('on: one word in, a short list of words and one meaning out, with the two services named', r.status === 200 && JSON.stringify(r.json.words) === JSON.stringify(['weary', 'worn', 'drained']) && /adjective: In need of rest/.test(r.json.meaning) && r.json.sources.join() === 'Datamuse,Free Dictionary API');
ok('the services are asked over HTTPS for that word only: no cookie, no origin, no address', calls.length === 2 && calls.every((c) => /^https:\/\/(api\.datamuse\.com|api\.dictionaryapi\.dev)\//.test(c.url) && /tired/.test(c.url) && !JSON.stringify(c.headers).match(/cookie|origin|203\.0\.113/i)));
ok('only POST, only JSON, only the public route', (await call({ word: 'tired' }, { method: 'GET' })).status === 405 && (await call({ word: 'tired' }, { type: 'text/plain' })).status === 415 && (await call({ word: 'tired' }, { path: '/.netlify/functions/words' })).status === 404);
ok('another site is refused', (await call({ word: 'tired' }, { origin: 'https://example.com' })).status === 403 && (await call({ word: 'tired' }, { origin: null })).status === 403);
const before = calls.length;
ok('more than one word, digits, markup, too short, too long, bad JSON and an oversized body are refused before the services are asked', (await call({ word: 'two words' })).status === 400 && (await call({ word: 'a1' })).status === 400 && (await call({ word: '<b>x</b>' })).status === 400 && (await call({ word: 'a' })).status === 400 && (await call({ word: 'a'.repeat(30) })).status === 400 && (await call('{nope')).status === 400 && (await call({ word: 'x'.repeat(300) })).status === 413 && calls.length === before);
ok('only English is accepted for now; another language is refused', (await call({ word: 'tired', lang: 'fr' })).status === 400 && (await call({ word: 'tired', lang: 'en' })).status === 200);
datamuse = () => new Response('nope', { status: 500 }); dict = () => new Response('nope', { status: 500 });
ok('when both services fail the answer is a plain upstream error', (await call({ word: 'weary' })).status === 502);
datamuse = () => new Response(DATAMUSE, { status: 200 });
ok('when one service fails the other still answers', (await call({ word: 'weary' })).json.words.length === 3);
process.env.WORD_HELP_PER_CONNECTION = '2'; mem.clear();
await call({ word: 'weary' }, { ip: '198.51.100.9' }); await call({ word: 'weary' }, { ip: '198.51.100.9' });
ok('a connection that has used its look-ups for the day is limited, and another is not', (await call({ word: 'weary' }, { ip: '198.51.100.9' })).status === 429 && (await call({ word: 'weary' }, { ip: '198.51.100.10' })).status === 200);
ok('nothing about the request (the word, the address) is logged', !logged.join(' ').match(/weary|tired|203\.0\.113|198\.51\.100/));
console.log = origLog; console.error = origErr; console.warn = origWarn;
