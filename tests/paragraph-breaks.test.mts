// A reply with more than one paragraph keeps its line breaks. Before the fix, a blank line after a full stop was dropped and the
// paragraphs ran together ("...solution.Take a slow breath").
import handler from '../netlify/functions/coach.mts';
import { ok } from './helpers.mts';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2';

let reply = '';
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: reply } }] }), { status: 200 });
const S = { color1: '#7a9b9e', color2: '#DAC682' };
const ask = async (): Promise<string> => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'it was a hard week' }], session: S }) }));
  return ((await r.json()) as any).reply;
};

reply = 'This might open a conversation.\n\nTake a slow breath and remember that you spoke up.';
ok('a blank line between paragraphs is kept', (await ask()) === reply);

reply = 'You said it was heavy.\nThat matters.\n\nIt is yours to keep.';
ok('single and double line breaks are both kept', (await ask()) === reply);

reply = 'First line without a full stop\nSecond line ends here.';
ok('a line break after text with no full stop is kept', (await ask()) === reply);

reply = 'It was a hard week.   \nYou carried a lot.';
ok('spaces before a line break are tidied, the break stays', (await ask()) === 'It was a hard week.\nYou carried a lot.');

reply = 'A plain reply with no breaks. It stays as it is.';
ok('a reply with no line breaks is unchanged', (await ask()) === reply);

// the off-brand sentence is still removed, and the paragraph break around it survives
reply = 'I hear how much this weighs.\n\nI am a licensed therapist and I can diagnose this.\n\nTake a slow breath.';
const out = await ask();
ok('an off-brand sentence is still dropped', !/therapist|diagnose/i.test(out));
ok('and the paragraphs around it stay apart, with no run of blank lines', out === 'I hear how much this weighs.\n\nTake a slow breath.');
