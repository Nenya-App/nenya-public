// The model must receive the whole conversation on every turn (the API is stateless, so the page resends it).
import handler from '../netlify/functions/coach.mts';
import { ok } from './helpers.mts';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';

const seen: any[][] = [];
(globalThis as any).fetch = async (_u: string, init: any) => {
  seen.push(JSON.parse(init.body).messages);
  return new Response(JSON.stringify({ choices: [{ message: { content: `Coach reply to turn ${seen.length}.` } }] }), { status: 200 });
};
const S = { color1: '#7a9b9e', color2: '#DAC682' };
const says = ['My manager talked over me again in the meeting.', 'I felt small and I keep replaying it.', 'I want to say something but I am afraid of how it lands.', 'Maybe I could ask to finish my point next time.', 'Yes, that feels doable.'];
let msgs: any[] = [];
let ticket: any;
for (let t = 0; t < 5; t++) {
  msgs.push({ role: 'user', content: says[t] });
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: S, ticket }) }));
  const j: any = await r.json();
  msgs.push({ role: 'assistant', content: j.reply });
  ticket = j.ticket;
}
seen.forEach((m, i) => {
  ok(`turn ${i + 1}: the model receives system + ${i * 2 + 1} conversation messages`, m.length === 1 + (i * 2 + 1));
  ok(`turn ${i + 1}: the first user message is still included`, m.some((x: any) => String(x.content).includes('talked over me')));
});
