// The owner's usage totals: a protected endpoint, the range reader, and the private page that is linked from nowhere.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import statsHandler, { __useStoreForTests } from '../netlify/functions/stats.mts';
import { tokenMatches } from '../src/lib/ownerAuth.ts';
import { recentDays, readRange, ALL_EVENTS, isKnownEvent, eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const TOKEN = 'owner-token-for-tests';
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex');

// ---- the token check
ok('the right token matches its hash', tokenMatches(TOKEN, process.env.COACH_OWNER_TOKEN_HASH));
ok('the hash may be upper case or padded', tokenMatches(TOKEN, ` ${process.env.COACH_OWNER_TOKEN_HASH!.toUpperCase()} `));
ok('a wrong, empty or missing token does not', !tokenMatches('nope', process.env.COACH_OWNER_TOKEN_HASH) && !tokenMatches('', process.env.COACH_OWNER_TOKEN_HASH) && !tokenMatches(null, process.env.COACH_OWNER_TOKEN_HASH));
ok('with no hash configured nothing matches', !tokenMatches(TOKEN, undefined) && !tokenMatches(TOKEN, ''));

// ---- days and the range reader
const noon = new Date('2026-11-07T18:00:00Z');
const d7 = recentDays(7, noon);
ok('recent days are unique, newest first, and the right number', d7.length === 7 && new Set(d7).size === 7 && d7[0] === '2026-11-07' && d7[6] === '2026-11-01', d7.join());
ok('even across the autumn clock change the days are unique', new Set(recentDays(10, new Date('2026-11-02T18:00:00Z'))).size === 10);

const makeStore = () => {
  const m = new Map<string, string>();
  return {
    async getWithMetadata(k: string) { return m.has(k) ? { data: m.get(k)!, etag: '1' } : null; },
    async set(k: string, v: string) { m.set(k, v); return { modified: true }; },
    async list({ prefix }: { prefix: string }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    put: (k: string, v: string) => m.set(k, v),
  };
};
const store = makeStore();
const today = capDay();
const yesterday = recentDays(2)[1];
store.put(eventKey(today, 'coach.turn.sent'), '12');
store.put(eventKey(today, 'page.view.welcome'), '30');
store.put(eventKey(yesterday, 'coach.turn.sent'), '4');
store.put(eventKey('2020-01-01', 'coach.turn.sent'), '999');
store.put(`m/${today}/evil.event`, '5');
store.put('daily-count', `${today}:7`);
store.put('c/' + today + '/abcdef', '3');
__useStoreForTests(store);

const range = await readRange(store as any, recentDays(30));
ok('the range reader returns each day and event', range[today]['coach.turn.sent'] === 12 && range[yesterday]['coach.turn.sent'] === 4 && range[today]['page.view.welcome'] === 30);
ok('days outside the range are left out', !range['2020-01-01']);
ok('unknown event names are skipped, and connection records never read', !('evil.event' in (range[today] ?? {})) && !JSON.stringify(range).includes('abcdef'));

// ---- the function
const get = async (path = '/api/stats', headers: Record<string, string> = {}, method = 'GET') => {
  const r = await statsHandler(new Request(`https://nenya.biz${path}`, { method, headers }));
  return { status: r.status, text: await r.text(), headers: r.headers };
};
let r = await get('/api/stats');
ok('no token: a bare 401', r.status === 401 && !r.text.includes('coach'));
r = await get('/api/stats', { 'x-nenya-owner': 'wrong' });
ok('a wrong token: the same bare 401', r.status === 401 && r.text === JSON.stringify({ error: 'no' }));
r = await get('/api/stats?days=30', { 'x-nenya-owner': TOKEN });
const body = JSON.parse(r.text);
ok('the right token reads the totals', r.status === 200 && body.counts[today]['coach.turn.sent'] === 12 && body.days.length === 30 && body.events.length === ALL_EVENTS.length);
ok("today's site-wide turn count is included", body.todayTurns === 7);
ok('the answer is never cached and sets no cookie', r.headers.get('cache-control') === 'no-store' && !r.headers.get('set-cookie'));
ok('neither the token nor its hash is ever echoed', !r.text.includes(TOKEN) && !r.text.includes(process.env.COACH_OWNER_TOKEN_HASH!));
r = await get('/api/stats?days=500', { 'x-nenya-owner': TOKEN }); ok('days are capped at 60', JSON.parse(r.text).days.length === 60);
r = await get('/api/stats?days=0', { 'x-nenya-owner': TOKEN }); ok('days are at least 1', JSON.parse(r.text).days.length === 1);
r = await get('/api/stats?days=abc', { 'x-nenya-owner': TOKEN }); ok('a bad days value falls back to 30', JSON.parse(r.text).days.length === 30);
r = await get('/api/stats', { 'x-nenya-owner': TOKEN }, 'POST'); ok('only GET is served', r.status === 405);
r = await get('/.netlify/functions/stats', { 'x-nenya-owner': TOKEN }); ok('only the public route is served', r.status === 404);
delete process.env.COACH_OWNER_TOKEN_HASH;
r = await get('/api/stats', { 'x-nenya-owner': TOKEN }); ok('with no hash configured, even the token is refused', r.status === 401);
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex');
__useStoreForTests({ async list() { throw new Error('down'); }, async getWithMetadata() { throw new Error('down'); } });
r = await get('/api/stats', { 'x-nenya-owner': TOKEN }); ok('a store that is down gives a plain 502', r.status === 502);
__useStoreForTests(null);

// ---- the private page is linked from nowhere
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const adminHtml = readFileSync(join(root, 'admin', 'index.html'), 'utf8');
ok('the admin page asks not to be indexed', /name="robots"\s+content="noindex, nofollow"/.test(adminHtml));
ok('and the host adds the same header for /admin/*', /for = "\/admin\/\*"[\s\S]{0,80}X-Robots-Tag = "noindex, nofollow"/.test(readFileSync(join(root, 'netlify.toml'), 'utf8')));
ok('it is not in the sitemap, robots.txt or llms.txt', ['sitemap.xml', 'robots.txt', 'llms.txt'].every((f) => !/admin/i.test(readFileSync(join(root, 'public', f), 'utf8'))));
const linking = walk(join(root, 'src')).concat(walk(join(root, 'public')).filter((f) => /\.html$/.test(f))).filter((f) => !f.includes(join('src', 'admin')) && /\.(tsx?|html)$/.test(f)).filter((f) => /["'`]\/admin\/?["'`#?]/.test(readFileSync(f, 'utf8')));
ok('no page or component links to /admin', linking.length === 0, linking.join());
ok('every known event can be listed for the admin view', ALL_EVENTS.every(isKnownEvent));
