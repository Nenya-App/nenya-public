// The coach function in shadow screening mode: the band is counted next to whether the phrase matcher acted, a slow or failing screening function is counted as unavailable, and the reply never changes.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS;
let screenMode: 'high' | 'low' | 'down' | 'slow' = 'low';
let screenCalls = 0;
(globalThis as any).fetch = async (u: string, init: any) => {
  if (String(u).endsWith('/api/screen')) {
    screenCalls++;
    if (screenMode === 'down') return new Response('{}', { status: 503 });
    if (screenMode === 'slow') await new Promise((res, rej) => { const t = setTimeout(res, 2000); init?.signal?.addEventListener('abort', () => { clearTimeout(t); rej(new Error('aborted')); }); });
    return new Response(JSON.stringify({ band: screenMode === 'slow' ? 'low' : screenMode }), { status: 200 });
  }
  return new Response(JSON.stringify({ choices: [{ message: { content: 'What would help most?' } }] }), { status: 200 });
};
const { default: handler, __useStoreForTests } = await import('../netlify/functions/coach.mts');
import { eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const data = new Map<string, { v: string; e: number }>();
let etag = 0;
__useStoreForTests({
  async getWithMetadata(k: string) { const d = data.get(k); return d ? { data: d.v, etag: String(d.e) } : null; },
  async get(k: string) { return data.get(k)?.v ?? null; },
  async set(k: string, v: string, o: any) { const d = data.get(k); if (o?.onlyIfNew && d) return { modified: false }; if (o?.onlyIfMatch && (!d || String(d.e) !== o.onlyIfMatch)) return { modified: false }; data.set(k, { v, e: ++etag }); return { modified: true }; },
});
const n = (e: string) => Number(data.get(eventKey(capDay(), e))?.v ?? 0);
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => (await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }))).json()) as any;

delete process.env.COACH_SCREEN; process.env.COACH_SCREEN_SECRET = 'a-secret';
let j = await send('My week was long and I am tired.');
ok('screening is off by default: no call is made', !!j.reply && screenCalls === 0);
process.env.COACH_SCREEN = 'shadow';
screenMode = 'low';
j = await send('Those people should all be killed.');
ok('in shadow mode the reply is the usual one', j.reply === 'What would help most?');
ok('the band is counted, with whether the matcher acted', n('coach.screen.band.low') === 1 && n('coach.screen.vs-list.low.list') === 1, String(n('coach.screen.vs-list.low.list')));
screenMode = 'high';
await send('I had a quiet afternoon with my dog.');
ok('a high band with no matcher action is counted as such', n('coach.screen.band.high') === 1 && n('coach.screen.vs-list.high.nolist') === 1);
screenMode = 'down';
j = await send('Another ordinary message about my day.');
ok('a failing screening function is counted as unavailable and the reply is unchanged', j.reply === 'What would help most?' && n('coach.screen.unavailable') === 1);
screenMode = 'slow';
const t0 = Date.now();
j = await send('A message while the screening is slow today.');
ok('a slow screening function does not hold the reply for long, and counts as unavailable', j.reply === 'What would help most?' && n('coach.screen.unavailable') === 2 && Date.now() - t0 < 1500);
const before = screenCalls;
await send('I want to end my life');
ok('a message that stops for safety is never sent to screening', screenCalls === before);
delete process.env.COACH_SCREEN_SECRET;
await send('One more ordinary message about my evening.');
ok('without the secret there is no call', screenCalls === before);
ok('the stored counts hold no text: only event names and numbers', [...data.keys()].filter((k) => k.startsWith('m/')).every((k) => /^m\/\d{4}-\d{2}-\d{2}\/coach\.[a-z.\-]+$/.test(k)));
