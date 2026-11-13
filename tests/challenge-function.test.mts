// Through the coach function: contempt for a group or a call to harm one makes the coach say where it stands (a note in its instructions and, with COACH_VALUES=on, a plain sentence of the site's) instead of
// mirroring; the practice arc steps aside; several questions in one message are each to be answered.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_SCREEN;
let lastSystem = '';
let modelSays = "That sounds really tough. What need might be behind it?";
(globalThis as any).fetch = async (_u: string, init: any) => {
  try { lastSystem = JSON.parse(init.body).messages[0].content; } catch { /* not a chat body */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
};
const { default: handler } = await import('../netlify/functions/coach.mts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }));
  return { j: (await res.json()) as any, system: lastSystem };
};
const VIOLENCE = /call for a group of people to be harmed or killed/, CONTEMPT = /contempt for a group of people/, MULTI = /asked more than one question/;

process.env.COACH_VALUES = 'on';
let r = await send('I think we should just kill them all.');
ok('a call to kill a group: the coach is told to say plainly where it stands, not to mirror', VIOLENCE.test(r.system) && /Do not mirror it back/.test(r.system));
ok('and the site puts a plain sentence first when the model does not say it', /^I can't go along with wanting any group of people harmed or dead/.test(r.j.reply), r.j.reply);
r = await send('They are evil and I wish they would all die.');
ok('a wish that a group dies gets the same', VIOLENCE.test(r.system));
r = await send('My teacher said "we should just kill them all" and I froze.');
ok('a quote of what someone said gets neither the note nor the sentence', !VIOLENCE.test(r.system) && !CONTEMPT.test(r.system) && r.j.reply === modelSays);
r = await send('It is horrifying to hear anyone say they should all be killed.');
ok('denouncing such words gets neither', !VIOLENCE.test(r.system) && r.j.reply === modelSays);
r = await send('My week was long and my boss is a bully.');
ok('an ordinary message gets neither', !VIOLENCE.test(r.system) && !CONTEMPT.test(r.system) && r.j.reply === modelSays);

process.env.COACH_VALUES = 'off';
r = await send('I think we should just kill them all.');
ok('with COACH_VALUES off nothing changes (the switch is the owner\'s)', !VIOLENCE.test(r.system) && r.j.reply === modelSays);

// the practice arc steps aside for it
process.env.COACH_VALUES = 'on'; process.env.COACH_ARC = 'practice';
const arcOn = (await send('My week was long and I do not know what to feel.')).system;
r = await send('I think we should just kill them all.');
ok('the practice arc is not asked of a person calling for harm: its instruction is not in the prompt, the plain note is', VIOLENCE.test(r.system) && r.system !== arcOn && !/practice/i.test(r.system.split('\n\n').filter((p) => /find the words|own words for/i.test(p)).join('')));
delete process.env.COACH_ARC;

// stacked questions
r = await send('Is this normal? Should I tell her? What would you do?');
ok('several questions: the coach is told to answer each, in order, not just one', MULTI.test(r.system) && /do not answer only the last/.test(r.system));
r = await send('Should I tell her?');
ok('one question does not get the note', !MULTI.test(r.system));
