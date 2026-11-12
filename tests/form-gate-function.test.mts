// Through the coach function: a message with no words to read is not sent on and uses no turn, but a safety flag always wins, and an ordinary message goes through.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_FORM_CHECK;
let calls = 0;
(globalThis as any).fetch = async () => { calls++; return new Response(JSON.stringify({ choices: [{ message: { content: 'What would help most?' } }] }), { status: 200 }); };
const { default: handler } = await import('../netlify/functions/coach.mts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }));
  return (await res.json()) as any;
};
let before = calls;
let j = await send('ok');
ok('a one-word message is answered by the site with a rewrite request: no model call, no ticket, no turn used', j.blocked === 'form' && j.problem === 'short' && !j.reply && !j.ticket && calls === before);
j = await send('asdfgh qwerty zxcvbn');
ok('a slip of the keys is asked to be rewritten', j.blocked === 'form' && j.problem === 'unclear' && calls === before);
j = await send('help me please');
ok('an ordinary short message goes through to the coach', !!j.reply && !j.blocked && calls === before + 1);
before = calls;
j = await send('kms');
ok('a safety flag wins over the form check: a very short message that the crisis check flags is not asked to be rewritten', j.blocked !== 'form');
j = await send('I want to end my life');
ok('a stop-tier message is handled by the crisis check, not the form check', j.done === true && j.flag?.tier === 'stop' && j.blocked !== 'form');
process.env.COACH_FORM_CHECK = 'off';
j = await send('ok');
ok('COACH_FORM_CHECK=off turns the check off', j.blocked !== 'form');
