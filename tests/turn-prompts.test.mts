// The instructions the model gets change with the exchange number, and stay quiet about counts.
import handler from '../netlify/functions/coach.mts';
import { ok } from './helpers.mts';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2'; // these tests use the plain request path; the default encrypted model is covered in venice-e2ee.test.mts

const sys: string[] = [];
(globalThis as any).fetch = async (_u: string, init: any) => {
  sys.push(JSON.parse(init.body).messages[0].content);
  return new Response(JSON.stringify({ choices: [{ message: { content: 'I hear that. It sounds like a lot to carry right now.' } }] }), { status: 200 });
};
const S = { color1: '#7a9b9e', color2: '#DAC682' };
let msgs: any[] = [];
let ticket: any;
for (let t = 1; t <= 5; t++) {
  msgs.push({ role: 'user', content: 'it is hard at work lately' });
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: S, ticket }) }));
  const j: any = await r.json();
  msgs.push({ role: 'assistant', content: j.reply });
  ticket = j.ticket;
}
for (let i = 0; i < 5; i++) {
  ok(`exchange ${i + 1}: told not to announce counts`, /announce counts/.test(sys[i]));
  ok(`exchange ${i + 1}: names its own exchange number`, new RegExp(`exchange ${i + 1} of 5`).test(sys[i]));
}
ok('exchange 1 asks for listening first', /first exchange: listen/.test(sys[0]) && !/first exchange: listen/.test(sys[1]));
ok('exchange 4 mentions one remaining', /One exchange remains/.test(sys[3]) && !/One exchange remains/.test(sys[2]));
ok('exchange 5 is told the page closes the conversation', /final exchange\. Reflect/.test(sys[4]) && /page closes the conversation/.test(sys[4]));
