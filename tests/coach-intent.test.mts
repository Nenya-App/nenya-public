// The coach answers a direct question first. This checks the phrase matching (what counts as a direct question and
// what does not) and that the function gives the model the right instruction for each.
import handler from '../netlify/functions/coach.mts';
import { detectDirectQuestion } from '../src/lib/coachIntent.ts';
import { ok } from './helpers.mts';

const yes = [
  'What can I do about my anxiety?',
  'how do I calm down before a meeting',
  'Any tips for sleeping better?',
  'Can you help me say this to my boss?',
  'Could you suggest something for when I spiral',
  'tell me how to stop catastrophising',
  'I need advice on talking to my sister',
  'Do you have any ideas for handling mornings?',
  'What helps when everything feels like too much?',
  'Is there a way to stop overthinking at night?',
  "What's the best way to ask for a day off?",
  'What is nonviolent communication?',
  'What should I do?',
  'show me a breathing exercise',
  'How to set a boundary with my mother?',
];
const no = [
  'I feel anxious and my chest is tight.',
  'Why does this always happen to me?',
  'What is wrong with me?',
  "I don't know what to do.",
  'My manager ignored me again today.',
  'how are you',
  "Honestly it's been a hard week and I'm worn out.",
  'Why am I like this?',
  'What is this feeling in my chest?',
  "What's happening to me?",
  '',
  '   ',
];
for (const t of yes) ok(`direct question: "${t}"`, detectDirectQuestion(t) === true);
for (const t of no) ok(`not a direct question: "${t}"`, detectDirectQuestion(t) === false);
ok('curly apostrophes are handled', detectDirectQuestion('What’s the best way to ask for a day off?'));
ok('upper case is handled', detectDirectQuestion('WHAT CAN I DO ABOUT THIS?'));

// The function end to end, with Venice stubbed.
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'test-key';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_EXTRA_HOSTS;
let last: any = null;
(globalThis as any).fetch = async (_u: string, init: any) => {
  last = JSON.parse(init.body);
  return new Response(JSON.stringify({ choices: [{ message: { content: 'Here is something you can try.' } }] }), { status: 200 });
};
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const call = async (body: any) => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: SESSION, ...body }) }));
  return { status: r.status, json: await r.json() };
};
const sys = () => last.messages[0].content as string;

let r = await call({ messages: [{ role: 'user', content: 'What can I do about my anxiety?' }] });
ok('direct question on turn 1: answer-first instruction is given', r.status === 200 && /asked a direct question/.test(sys()) && /Answer it first/.test(sys()));
ok('direct question on turn 1: the "reflect before anything else" rule is left out', !/listen and reflect what you heard before anything else/.test(sys()));
ok('direct question: it says to answer before asking about the body or feelings', /Do not open by asking about their body or feelings/.test(sys()));

r = await call({ messages: [{ role: 'user', content: 'I feel anxious and my chest is tight.' }] });
ok('a statement on turn 1 still gets the listen-first rule', /listen and reflect what you heard before anything else/.test(sys()) && !/asked a direct question/.test(sys()));

// a question that also signals distress: care comes first
r = await call({ messages: [{ role: 'user', content: "I'm killing myself at work with these deadlines, what can I do?" }] });
ok('a possible-crisis message does not get the answer-first block', r.status === 200 && /may signal distress/.test(sys()) && !/asked a direct question/.test(sys()));

// a clearly dangerous message never reaches the model, direct question or not
const before = last;
r = await call({ messages: [{ role: 'user', content: "I want to kill myself, what can I do?" }] });
ok('stop-tier still stops before any instruction is built', r.json.flag?.tier === 'stop' && last === before);

// later turns: only the latest message decides
const FIRST = 'I feel overwhelmed at work.';
r = await call({ messages: [{ role: 'user', content: FIRST }] });
const hist = [{ role: 'user', content: FIRST }, { role: 'assistant', content: r.json.reply }, { role: 'user', content: 'How do I tell my manager?' }];
const r2 = await call({ messages: hist, ticket: r.json.ticket });
ok('turn 2 direct question is answered first too', r2.status === 200 && /asked a direct question/.test(sys()) && /exchange 2 of 5/.test(sys()));

// the final exchange: still no question, but an unanswered question is answered
let t: string | undefined; let msgs: any[] = []; let rr: any;
for (let i = 1; i <= 5; i++) {
  msgs.push({ role: 'user', content: i === 5 ? 'What can I do tomorrow morning?' : `turn ${i} message` });
  rr = await call({ messages: msgs, ticket: t });
  msgs.push({ role: 'assistant', content: rr.json.reply }); t = rr.json.ticket;
}
ok('final exchange: answers the question, then closes, and is not offered the gentle-question line', /final exchange/.test(sys()) && /answer it briefly in your first sentence or two, then close/.test(sys()) && !/you may add one short, gentle question/.test(sys()));
