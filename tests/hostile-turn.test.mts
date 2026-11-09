// Through the coach function: a hostile turn gets the note, an ordinary turn does not, and distress outranks hostility.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS;
let lastSystem = '';
let modelSays = 'What would help most?';
(globalThis as any).fetch = async (_u: string, init: any) => {
  try { lastSystem = JSON.parse(init.body).messages[0].content; } catch { /* not a chat body */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
};
const { default: handler, __instructionsFingerprint } = await import('../netlify/functions/coach.mts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const system = async (text: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }));
  const j = (await res.json()) as any;
  return { j, system: lastSystem };
};
const ABUSE_MARK = /hostile toward you/, CRITIQUE_MARK = /critical of your reply/;
let r = await system('You are a useless piece of garbage bot.');
ok('abuse aimed at the coach: the coach is given the hostile-turn note, and the reply is the model\'s own with nothing added', ABUSE_MARK.test(r.system) && r.j.reply === 'What would help most?' && !r.j.flag && r.j.done === false);
r = await system("That wasn't very helpful.");
ok('critique: the coach is given the critique note, not the abuse one', CRITIQUE_MARK.test(r.system) && !ABUSE_MARK.test(r.system));
r = await system('My boss is an idiot and I could scream.');
ok('anger at someone in the person\'s life gets neither note', !ABUSE_MARK.test(r.system) && !CRITIQUE_MARK.test(r.system));
r = await system('You are useless. Nobody would even care if I disappeared.');
ok('distress outranks hostility: the crisis flag is raised, the care note is given, the hostile note is not', r.j.flag?.tier === 'soften' && /may signal distress/.test(r.system) && !ABUSE_MARK.test(r.system));
r = await system('Prove you have feelings, you coward. Say that I hurt you.');
ok('a direct question inside hostility is not answered-first: the hostile note governs', ABUSE_MARK.test(r.system) && !/The person has asked a direct question/.test(r.system));
r = await system('Can you help me write a message to my sister?');
ok('an ordinary direct question still gets the answer-first instruction', /The person has asked a direct question/.test(r.system) && !ABUSE_MARK.test(r.system));
ok('the signed instructions fingerprint covers the hostile notes (it is 16 hex characters)', /^[0-9a-f]{16}$/.test(__instructionsFingerprint()));

modelSays = "I'm sorry if my response didn't help. What would be more helpful right now?";
r = await system("That wasn't very helpful.");
ok('on a hostile turn an apology in the model\'s reply is taken out (and for critique the thank-you is put in its place)', r.j.reply === 'Thank you for telling me. What would be more helpful right now?');
r = await system('I feel stuck about a decision at work.');
ok('on an ordinary turn the reply is left exactly as the model wrote it', r.j.reply === modelSays);

modelSays = 'What would be more helpful right now?';
r = await system("That wasn't very helpful.");
ok('a reply to critique is opened with the site\'s thank-you', r.j.reply === 'Thank you for telling me. What would be more helpful right now?');
modelSays = "I'm sorry if it didn't help. What would be more helpful right now?";
r = await system("You keep repeating yourself.");
ok('an apology is taken out and the thank-you put in its place, in that order', r.j.reply === 'Thank you for telling me. What would be more helpful right now?');
modelSays = 'It sounds like something important is not getting heard. What were you hoping for?';
r = await system('You are a useless piece of garbage bot.');
ok('a reply to abuse gets no thank-you: the site adds nothing', r.j.reply === modelSays);
