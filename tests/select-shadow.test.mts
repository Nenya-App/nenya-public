// The coach function in shadow selection mode: what the selection function chose is counted next to what the phrase matcher chose, a slow or failing function is counted as unavailable, and the
// reply never changes. Only counts are kept: no text, no score.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_PROVIDER = 'venice';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
process.env.COACH_ABOUT_ANSWERS = 'off';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_SCREEN;
let ids: string[] | 'down' | 'slow' = [];
let calls = 0;
(globalThis as any).fetch = async (u: string, init: any) => {
  if (String(u).endsWith('/api/select')) {
    calls++;
    if (ids === 'down') return new Response('{}', { status: 503 });
    if (ids === 'slow') await new Promise((res, rej) => { const t = setTimeout(res, 2000); init?.signal?.addEventListener('abort', () => { clearTimeout(t); rej(new Error('aborted')); }); });
    return new Response(JSON.stringify({ ids: ids === 'slow' ? [] : ids }), { status: 200 });
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
} as any);
const n = (e: string) => Number(data.get(eventKey(capDay(), e))?.v ?? 0);
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => (await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }))).json()) as any;

delete process.env.COACH_SELECT; process.env.COACH_SELECT_SECRET = 'a-secret';
let j = await send('I am exhausted and have nothing left.');
ok('selection is off by default: no call is made', !!j.reply && calls === 0);
process.env.COACH_SELECT = 'shadow';
ids = ['reserves'];
j = await send('I am exhausted and have nothing left.');
ok('in shadow mode the reply is the usual one, and one call is made', j.reply === 'What would help most?' && calls === 1);
ok('when the model and the phrase matcher choose the same module, it is counted as agreement', n('coach.select.agree') === 1);
ids = ['recurrence'];
j = await send('I am exhausted and have nothing left.');
ok('different modules are counted as a difference, and what the model found that the phrases did not is counted by topic', n('coach.select.differ') === 1 && n('coach.select.model-found.recurrence') === 1);
ids = ['field_cost'];
j = await send('We talked about the weather and the garden today.');
ok('a module only the model chose is counted as model-only, by topic', n('coach.select.model-only') === 1 && n('coach.select.model-found.field_cost') === 1);
ids = [];
await send('I am exhausted and have nothing left.');
ok('a module only the phrases chose is counted as phrase-only', n('coach.select.phrase-only') === 1);
await send('We talked about the weather and the garden today.');
ok('neither choosing anything is counted as none', n('coach.select.none') === 1);
ids = ['conn-01'];
await send('We talked about the weather and the garden today.');
ok('a card the model found is counted by id, and is not a module', n('coach.select.card.conn-01') === 1 && n('coach.select.none') === 2);
ids = 'down';
j = await send('I am exhausted and have nothing left.');
ok('an unavailable selection function is counted and the reply is unaffected', j.reply === 'What would help most?' && n('coach.select.unavailable') === 1);
ids = 'slow';
const t0 = Date.now();
j = await send('I am exhausted and have nothing left.');
ok('a slow one is given up on within the budget and counted as unavailable', j.reply === 'What would help most?' && n('coach.select.unavailable') === 2 && Date.now() - t0 < 1800);
delete process.env.COACH_SELECT_SECRET;
const before = calls;
await send('I am exhausted and have nothing left.');
ok('without the secret, no call is made even in shadow mode', calls === before);
process.env.COACH_SELECT_SECRET = 'a-secret';
ok('a message the crisis check flags is never sent to it', await (async () => { const c0 = calls; ids = []; await send('I want to kill myself.'); return calls === c0; })());
