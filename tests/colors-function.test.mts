// POST /api/colors: off until switched on, closed to other sites, one hex and one mode in, five hex colours out, the limits, and nothing about the request
// reaching the service or the log.
process.env.COACH_IP_SECRET = 'ip-secret-ip-secret-ip-secret';
delete process.env.PALETTE_ENABLED; delete process.env.PALETTE_PER_CONNECTION; delete process.env.PALETTE_DAILY_CAP; delete process.env.COACH_EXTRA_HOSTS;
const calls: { url: string; headers: any }[] = [];
let upstream: () => Response = () => new Response(JSON.stringify({ colors: [{ hex: { value: '#1B4F6E' } }, { hex: { value: '#2D6F8E' } }, { hex: { value: '#4B8EAA' } }, { hex: { value: '#72AEC6' } }, { hex: { value: '#A1CDE0' } }] }), { status: 200 });
(globalThis as any).fetch = async (url: string, init: any) => { calls.push({ url: String(url), headers: init?.headers ?? {} }); return upstream(); };
const logged: string[] = [];
const origLog = console.log; const origErr = console.error; const origWarn = console.warn;
console.log = (...a: any[]) => { logged.push(a.join(' ')); origLog(...a); }; console.error = (...a: any[]) => { logged.push(a.join(' ')); origErr(...a); }; console.warn = (...a: any[]) => { logged.push(a.join(' ')); origWarn(...a); };
const { default: fn, __useStoreForTests } = await import('../netlify/functions/colors.mts');
import { ok } from './helpers.mts';

const mem = new Map<string, { v: string; e: number }>();
__useStoreForTests({
  async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
  async set(k: string, v: string, o: any) { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
});
const call = async (body: any, o: { origin?: string | null; method?: string; path?: string; type?: string; ip?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': o.type ?? 'application/json', cookie: 'secret=1' };
  if (o.origin !== null) headers.origin = o.origin ?? 'https://nenya.biz';
  const res = await fn(new Request(`https://nenya.biz${o.path ?? '/api/colors'}`, { method: o.method ?? 'POST', headers, body: o.method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) }), { ip: o.ip ?? '203.0.113.7' });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
};
const GOOD = { hex: '#1B4F6E', mode: 'analogic' };

let r = await call(GOOD);
ok('off until PALETTE_ENABLED=true', r.status === 503 && r.json.error === 'off' && calls.length === 0);
process.env.PALETTE_ENABLED = 'true';
r = await call(GOOD);
ok('on: one hex and one mode in, five hex colours out, credited', r.status === 200 && r.json.colors.length === 5 && r.json.colors.every((c: string) => /^#[0-9A-F]{6}$/.test(c)) && r.json.source === 'The Color API');
ok('the service is asked over HTTPS for that colour and mode, and nothing else: no cookie, no address, no origin header', calls.length === 1 && /^https:\/\/www\.thecolorapi\.com\/scheme\?hex=1b4f6e&mode=analogic&count=5&format=json$/.test(calls[0].url) && !JSON.stringify(calls[0].headers).match(/cookie|203\.0\.113|origin|x-forwarded/i));
ok('only POST, only JSON, only the public route', (await call(GOOD, { method: 'GET' })).status === 405 && (await call(GOOD, { type: 'text/plain' })).status === 415 && (await call(GOOD, { path: '/.netlify/functions/colors' })).status === 404);
ok('another site is refused', (await call(GOOD, { origin: 'https://example.com' })).status === 403 && (await call(GOOD, { origin: null })).status === 403);
const before = calls.length;
ok('a bad colour, a bad mode, bad JSON and an oversized body are refused before the service is asked', (await call({ hex: 'red', mode: 'analogic' })).status === 400 && (await call({ hex: '#1B4F6E', mode: 'rainbow' })).status === 400 && (await call('{nope')).status === 400 && (await call({ hex: '#1B4F6E', mode: 'analogic', pad: 'x'.repeat(300) })).status === 413 && calls.length === before);
ok('all eight modes are accepted', (await Promise.all(['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 'complement', 'analogic-complement', 'triad', 'quad'].map((mode) => call({ hex: '#E3752B', mode, }, { ip: '198.51.100.' + mode.length })))).every((x) => x.status === 200));

upstream = () => new Response('nope', { status: 500 });
r = await call(GOOD, { ip: '192.0.2.50' });
ok('if the service fails, the visitor gets a short code (the page then offers the version made on the device)', r.status === 502 && r.json.error === 'upstream' && Object.keys(r.json).join() === 'error');
upstream = () => new Response(JSON.stringify({ colors: [{ hex: { value: 'javascript:1' } }] }), { status: 200 });
ok('an answer that is not five hex colours is not passed on', (await call(GOOD, { ip: '192.0.2.51' })).status === 502);
upstream = () => new Response(JSON.stringify({ colors: [{ hex: { value: '#1B4F6E' } }, { hex: { value: '#2D6F8E' } }, { hex: { value: '#4B8EAA' } }] }), { status: 200 });
ok('three valid colours are enough to be useful', (await call(GOOD, { ip: '192.0.2.52' })).json.colors.length === 3);

// limits
process.env.PALETTE_PER_CONNECTION = '3';
let last = 0;
for (let i = 0; i < 4; i++) last = (await call(GOOD, { ip: '192.0.2.99' })).status;
ok('a connection that has used its requests for the day is told so (429), and another connection is not', last === 429 && (await call(GOOD, { ip: '192.0.2.100' })).status === 200);
process.env.PALETTE_PER_CONNECTION = '1000'; process.env.PALETTE_DAILY_CAP = '3';
mem.clear();
const codes: number[] = [];
for (let i = 0; i < 4; i++) codes.push((await call(GOOD, { ip: '192.0.2.' + (10 + i) })).status);
ok('the daily total is capped too', codes.join() === '200,200,200,429', codes.join());
ok('the store holds only counts: no colour, no address', [...mem.entries()].every(([k, v]) => /^p(?:-total)?\//.test(k) && /^\d+$/.test(v.v) && !/203\.|192\.|1b4f6e/i.test(k)));
console.log = origLog; console.error = origErr; console.warn = origWarn;
ok('nothing about a request (the colour, the address) was written to the log', logged.filter((l) => !/^(PASS|FAIL)/.test(l)).every((l) => !/1b4f6e|203\.0\.113|192\.0\.2|E3752B/i.test(l)));
