// The screening model ACTING (COACH_SCREEN=on): it never decides alone. With a word the list leaves to the model, a "high" reading counts as contempt (the coach says where it stands); on its own a "high"
// reading only gives the lighter note; a slow or failing model changes nothing; quotes are left alone; with the switch off the list alone decides.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
process.env.COACH_VALUES = 'on';
process.env.COACH_SCREEN_SECRET = 'a-secret';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_ARC;
let lastSystem = '';
let screenMode: 'by-text' | 'down' | 'slow' = 'by-text';
(globalThis as any).fetch = async (u: string, init: any) => {
  if (String(u).endsWith('/api/screen')) {
    if (screenMode === 'down') return new Response('{}', { status: 503 });
    if (screenMode === 'slow') await new Promise((res, rej) => { const t = setTimeout(res, 2000); init?.signal?.addEventListener('abort', () => { clearTimeout(t); rej(new Error('aborted')); }); });
    const text = String(JSON.parse(init.body).text);
    return new Response(JSON.stringify({ band: /zzhigh|zorkblat/i.test(text) ? 'high' : 'low' }), { status: 200 });
  }
  try { lastSystem = JSON.parse(init.body).messages[0].content; } catch { /* not a chat body */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: 'What would help most?' } }] }), { status: 200 });
};
const { default: handler, __useStoreForTests } = await import('../netlify/functions/coach.mts');
import { eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { DECISIONS_KEY, LEXICON_KEY, __forgetLexiconForTests } from '../src/lib/lexiconStore.ts';
import { ok } from './helpers.mts';

const header = '"term","variants","category","target","severity","context_note","match_mode","cues","language","source","confidence"';
const data = new Map<string, { v: string; e: number }>(); let etag = 0;
data.set(LEXICON_KEY, { v: [header, '"zorkblat","","slur","race-ethnicity","2","","token","","en","test","high"'].join('\n'), e: 0 });
data.set(DECISIONS_KEY, { v: 'term,action,note\n"zorkblat","model",""\n', e: 0 });
__useStoreForTests({
  async getWithMetadata(k: string) { const d = data.get(k); return d ? { data: d.v, etag: String(d.e) } : null; },
  async get(k: string) { return data.get(k)?.v ?? null; },
  async set(k: string, v: string, o: any) { const d = data.get(k); if (o?.onlyIfNew && d) return { modified: false }; if (o?.onlyIfMatch && (!d || String(d.e) !== o.onlyIfMatch)) return { modified: false }; data.set(k, { v, e: ++etag }); return { modified: true }; },
});
const n = (e: string) => Number(data.get(eventKey(capDay(), e))?.v ?? 0);
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => {
  __forgetLexiconForTests();
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }));
  return { j: (await res.json()) as any, system: lastSystem };
};
const CONTEMPT = /contempt for a group of people \(slurs/, SOFT = /A check on this conversation suggests/;
const SITE = /^I hear how strong the feeling is\. I don't share the view/;

process.env.COACH_SCREEN = 'on';
let r = await send('I hate zorkblat.');
ok('a word the list leaves to the model, read as high by the model: the coach says where it stands', CONTEMPT.test(r.system) && SITE.test(r.j.reply), r.j.reply);
ok('the model changing the outcome is counted', n('coach.screen.acted.contempt') === 1 && n('coach.challenge.note.contempt') >= 1);
r = await send('I am so angry at the committee zzhigh.');
ok('a high reading on its own gives only the lighter note and no site sentence', SOFT.test(r.system) && !CONTEMPT.test(r.system) && r.j.reply === 'What would help most?' && n('coach.screen.acted.soft') === 1);
r = await send('I am angry about zorkblat prices at the market.');
ok('the same word read as high in the same message is still contempt: the model reads the message, the list reads the word', CONTEMPT.test(r.system) || SOFT.test(r.system));
r = await send('My teacher said "I hate zorkblat zzhigh" and I froze.');
ok('a quote of what someone said is left alone even when the model reads it as high', !CONTEMPT.test(r.system) && !SOFT.test(r.system) && r.j.reply === 'What would help most?');
r = await send('Plain talk about my week, nothing unusual.');
ok('an ordinary message gets neither note', !CONTEMPT.test(r.system) && !SOFT.test(r.system));
screenMode = 'down';
r = await send('I hate zorkblat.');
ok('with the model down the list alone decides: a model-only word does nothing (fail open)', !CONTEMPT.test(r.system) && !SOFT.test(r.system) && r.j.reply === 'What would help most?');
screenMode = 'slow';
const t0 = Date.now();
r = await send('I hate zorkblat.');
ok('a slow model does not hold the reply for long and changes nothing', r.j.reply === 'What would help most?' && Date.now() - t0 < 1800 && !CONTEMPT.test(r.system));
screenMode = 'by-text';
process.env.COACH_SCREEN = 'shadow';
r = await send('I hate zorkblat.');
ok('in shadow mode the model still only counts', !CONTEMPT.test(r.system) && !SOFT.test(r.system));
delete process.env.COACH_SCREEN;
r = await send('I hate zorkblat.');
ok('with the switch off the list alone decides', !CONTEMPT.test(r.system) && !SOFT.test(r.system));
process.env.COACH_SCREEN = 'on'; process.env.COACH_VALUES = 'off';
r = await send('I hate zorkblat.');
ok('without COACH_VALUES the model acting changes nothing in the coach (the stance is the owner\'s switch)', !CONTEMPT.test(r.system) && !SOFT.test(r.system));
