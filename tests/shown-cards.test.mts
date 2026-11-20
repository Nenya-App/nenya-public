// Cards the page has shown: the model is told what they say, and a reply that restates one is asked for again (src/lib/shownCards.ts).
import { generateKeyPairSync } from 'node:crypto';
import coach from '../netlify/functions/coach.mts';
import { __setCardsForTests, type LearningCard } from '../src/lib/learningCards.ts';
import { SHOWN_NOTE_INTRO, shownCardIds, shownCardsNote, shownCardTexts, MAX_SHOWN } from '../src/lib/shownCards.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_ABOUT_ANSWERS = 'off';
delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET; delete process.env.COACH_LEARNING_OFFERS;

const BODY = 'Contempt is often the surface of an unmet need, and listening for that need can change how a hard conversation begins and ends.';
const card = (id: string, title: string): LearningCard => ({ id, series: 'connection', order: 1, title, contentNote: '', key: 'Look for the need under the contempt.', body: BODY, tryIt: 'Next time you feel contempt, name one need that might sit under it.', where: 'Ours.', more: '', url: '', license: '' });
__setCardsForTests([card('conn-01', 'The needs behind contempt'), card('conn-02', 'One question')]);

let sent: any[] = []; let say: string[] = ['That sounds like a lot. What matters most to you here?'];
(globalThis as any).fetch = async (_u: string, init: any) => { try { sent.push(JSON.parse(init.body).messages); } catch { /* not a chat request */ } return new Response(JSON.stringify({ choices: [{ message: { content: say.length > 1 ? say.shift()! : say[0] } }] }), { status: 200 }); };
const S = { color1: '#7A9B9E', color2: '#DAC682' };
const ask = async (extra: object = {}) => {
  sent = [];
  const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: [{ role: 'user', content: 'I read the card and I keep thinking about my brother.' }], ...extra }) }));
  return { j: (await res.json()) as any, sys: sent.map((m) => m.filter((x: any) => x.role === 'system').map((x: any) => x.content).join('\n')) };
};

// the pure pieces
ok('only known ids are taken, once each, at most four', JSON.stringify(shownCardIds(['conn-01', 'x', 'conn-01', 5, 'conn-02'], new Set(['conn-01', 'conn-02']))) === '["conn-01","conn-02"]' && shownCardIds(['a', 'b', 'c', 'd', 'e', 'f'], new Set(['a', 'b', 'c', 'd', 'e', 'f'])).length === MAX_SHOWN && shownCardIds('nope', new Set(['a'])).length === 0);
ok('the note says they were offered, whose words they are, what to do, and gives each card\'s title, key idea and text', /written by Nenya and not by you, and they may have read them/.test(SHOWN_NOTE_INTRO) && /do not repeat them/.test(SHOWN_NOTE_INTRO) && /cuts across/.test(SHOWN_NOTE_INTRO) && /1\. "The needs behind contempt"\. Key idea: Look for the need/.test(shownCardsNote([card('conn-01', 'The needs behind contempt')])) && shownCardsNote([]) === '');
ok('the card\'s own words for the repeat check leave out fragments too short to compare', shownCardTexts([card('conn-01', 'T')]).length === 2 && shownCardTexts([card('conn-01', 'T')]).every((t) => t.split(/\s+/).length >= 10));

// through the coach
let r = await ask();
ok('with nothing shown, the model is told nothing about cards', !/written by Nenya and not by you/.test(r.sys[0]));
r = await ask({ shown: ['conn-01'] });
ok('with a card shown, the model\'s single system message carries the note and the card\'s words', sent[0].filter((x: any) => x.role === 'system').length === 1 && /written by Nenya and not by you/.test(r.sys[0]) && /The needs behind contempt/.test(r.sys[0]) && /Contempt is often the surface of an unmet need/.test(r.sys[0]));
ok('an unknown id shows the model nothing', !/written by Nenya and not by you/.test((await ask({ shown: ['nope'] })).sys[0]));
// the return guard: a reply that restates the card is asked for again, once
say = [BODY + ' That is worth remembering.', 'It sounds like your brother matters a great deal. What was it you kept returning to?'];
r = await ask({ shown: ['conn-01'] });
ok('a reply that restates a shown card is asked for again, and the second reply is used', sent.length === 2 && r.j.reply === 'It sounds like your brother matters a great deal. What was it you kept returning to?', JSON.stringify(r.j.reply));
say = [BODY + ' That is worth remembering.', 'It sounds like your brother matters a great deal. What was it you kept returning to?'];
r = await ask();
ok('the same reply is left alone when no card was shown (nothing to repeat)', sent.length === 1 && r.j.reply.startsWith('Contempt is often'));
__setCardsForTests(null);
