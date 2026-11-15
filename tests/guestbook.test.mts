// "Sign Our Guestbook" (owner, 2026-11-15; docs/guestbook-scope.md): two chosen colors, a time-derived guestbook ID, and only the centroid of the four kept,
// with the day; the session pair refused; one per connection a day; kept forever.
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { centroid, guestbookId, isSessionPair, normHex, signaturePoint, toRgb } from '../src/lib/guestbook.ts';
import { ok } from './helpers.mts';

ok('the centroid averages each channel on its own (unlike adding the six-digit numbers, which lets one channel spill into the next)', centroid(['#00ff00', '#010000']) === '#018000' && centroid(['#000000', '#ffffff']) === '#808080');
const at = new Date('2026-11-15T21:43:00Z');
const id = guestbookId(at);
ok('the guestbook ID is two colors made from the moment, the same for anyone signing then', id.length === 2 && id.every((h) => /^#[0-9a-f]{6}$/.test(h)) && JSON.stringify(guestbookId(new Date('2026-11-15T21:47:00Z'))) === JSON.stringify(id));
ok('it moves with the time of day (10-minute steps) and with the day of the year', guestbookId(new Date('2026-11-15T21:53:00Z'))[1] !== id[1] && guestbookId(new Date('2026-11-16T21:43:00Z'))[0] !== id[0]);
const p = signaturePoint(['#2c6e9e', '#e9c46a'], at);
ok('a signature is the centroid of the two chosen and the two of the moment', p === centroid(['#2c6e9e', '#e9c46a', ...id]));
ok('the chosen pair cannot be read back from the point alone', signaturePoint(['#2c6e9e', '#e9c46a'], at) === signaturePoint(['#e9c46a', '#2c6e9e'], at) && toRgb(p).length === 3);
ok('the session pair is refused in either order; other pairs are not', isSessionPair(['#7A9B9E', '#dac682'], '#7a9b9e.#dac682') && isSessionPair(['#dac682', '#7a9b9e'], '#7a9b9e.#dac682') && !isSessionPair(['#7a9b9e', '#ffffff'], '#7a9b9e.#dac682') && !isSessionPair(['#7a9b9e', '#dac682'], null));
ok('only six-digit colors are accepted', normHex('#ABCDEF') === '#abcdef' && normHex('abc') === null && normHex(7) === null);

// The function, with a stand-in store.
const data = new Map<string, string>();
const store = {
  get: async (k: string, o?: { type?: string }) => (data.has(k) ? (o?.type === 'json' ? JSON.parse(data.get(k)!) : data.get(k)) : null),
  set: async (k: string, v: string) => void data.set(k, v),
  setJSON: async (k: string, v: unknown) => void data.set(k, JSON.stringify(v)),
  delete: async (k: string) => void data.delete(k),
  list: async (o?: { prefix?: string }) => ({ blobs: [...data.keys()].filter((k) => !o?.prefix || k.startsWith(o.prefix)).map((key) => ({ key })) }),
};
process.env.COACH_IP_SECRET = randomBytes(16).toString('hex');
delete process.env.COACH_EXTRA_HOSTS;
const fn = await import('../netlify/functions/guestbook.mts');
fn.__useStoreForTests(store);
const post = (colors: unknown, ip = '203.0.113.7', origin = 'https://nenya.biz') =>
  fn.default(new Request('https://nenya.biz/api/guestbook', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ colors, website: '' }) }), { ip });
let res = await post(['#2c6e9e', '#e9c46a']);
const body = await res.json();
const kept = [...data.entries()].filter(([k]) => k.startsWith('guestbook/'));
ok('signing keeps one point and the day, and drops the chosen colors', res.status === 200 && kept.length === 1 && JSON.stringify(Object.keys(JSON.parse(kept[0][1]))) === '["c"]' && !kept[0][1].includes('2c6e9e') && /^guestbook\/\d{4}-\d{2}-\d{2}\//.test(kept[0][0]) && body.point === JSON.parse(kept[0][1]).c);
ok('a second signature from the same connection that day is refused', (await post(['#ffffff', '#000000'])).status === 429 && [...data.keys()].filter((k) => k.startsWith('guestbook/')).length === 1);
ok('the once-a-day marker sits with the connection records, so the daily cleanup deletes it', [...data.keys()].some((k) => /^c\/\d{4}-\d{2}-\d{2}\/g-[0-9a-f]+$/.test(k)));
ok('another site cannot sign, and malformed colors are refused', (await post(['#ffffff', '#000000'], '198.51.100.1', 'https://evil.example')).status === 403 && (await post(['red', '#000000'], '198.51.100.2')).status === 400);
const got = await (await fn.default(new Request('https://nenya.biz/api/guestbook'))).json();
ok('everyone can see the points (color and day only)', got.total === 1 && JSON.stringify(Object.keys(got.points[0]).sort()) === '["c","d"]');

const page = readFileSync('src/app/components/pages/GuestbookPage.tsx', 'utf8');
ok('the page warns about the session colors and refuses them', /Please don’t use your session colors: those are the key to a saved reflection\./.test(page) && /disabled=\{!pair \|\| isSession/.test(page) && /Those are your session colors/.test(page));
ok('once per visit, and it says a signature cannot be taken back', /signedThisVisit/.test(page) && /You left your mark this visit/.test(page) && /cannot be taken back, because nothing ties it to you/.test(page));
ok('the colors are radio buttons with plain descriptions, and every target is 44px', /role="radio"/.test(page) && /aria-label=\{describePlainly\(hex\)\}/.test(page) && (page.match(/min-h-11/g) ?? []).length >= 4);
const cloud = readFileSync('src/app/components/GuestbookCloud.tsx', 'utf8');
ok('the 3D view turns by keyboard, can be paused, is still under reduced motion, and says what it shows', /ArrowLeft/.test(cloud) && /'Turn slowly' : 'Pause'/.test(cloud) && /prefers-reduced-motion: reduce/.test(cloud) && /role="img"/.test(cloud) && /The centre of them all is/.test(cloud));
ok('it loads nothing from other sites', !/cdnjs|three\.min|import .* from 'three'/.test(cloud));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  ok('the Terms describe the guestbook', /The guestbook \(nenya\.biz\/guestbook\), only if you sign it/.test(JSON.stringify(LEGAL_PARTS)) && /cannot be removed, because nothing ties it to you/.test(JSON.stringify(LEGAL_PARTS)));
}
