// The coach must not give the same words twice. This checks the repeat detector, that the function asks once more
// for different words when the model repeats itself, and that the later turns pick the right coaching modules.
import handler from '../netlify/functions/coach.mts';
import { repeatsEarlier } from '../src/lib/coachRepeat.ts';
import { selectModules } from '../src/lib/coachModules.ts';
import { ok } from './helpers.mts';

const script = 'You could say, "I\'ve been feeling really overwhelmed lately, especially when we argue. I need some space to calm down and think about how we can talk things through more calmly in the future. Can we take a break for now?"';
ok('the same script again is a repeat', repeatsEarlier(script + ' How does that feel to say?', [script]));
ok('capitals and punctuation do not hide a repeat', repeatsEarlier(script.toUpperCase().replace(/[",.?]/g, ''), [script]));
ok('a repeat is caught inside a longer reply', repeatsEarlier("It's understandable to feel worried. " + script, [script]));
ok('different words are not a repeat', !repeatsEarlier("It makes sense to worry about that. Notice what you'd want her to hear first, and say that in your own way.", [script]));
ok('a short shared phrase is not a repeat', !repeatsEarlier('How does that feel to say? Does it seem right to you?', [script + ' How does that feel to say? Does it seem like a good way to express what you need?']));
ok('nothing earlier means no repeat', !repeatsEarlier(script, []) && !repeatsEarlier('', [script]));

// later turns follow the latest message
const t4 = 'How do I tell my sister I need space? She keeps yelling at me.';
const t5 = 'I feel like that might be okay. I am worried that it might just make her more upset.';
const both = selectModules([t4, t5]);
ok('turn 4 offers words and a boundary', selectModules([t4]).includes('answer_with_words') && selectModules([t4]).includes('set_a_boundary'));
ok('turn 5 no longer offers words again', !both.includes('answer_with_words') && !both.includes('set_a_boundary'), both.join(','));
ok('turn 5 works with her possible reaction', both.includes('reaction_as_information') && both.includes('guess_then_check'), both.join(','));
ok('lens modules still look at the whole conversation', selectModules(["I'm exhausted at work.", 'Anyway, what should I cook tonight?']).includes('reserves'));

// the function
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'test-key';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_EXTRA_HOSTS;
let calls: any[] = [];
let plan: Array<string | 'fail'> = [];
(globalThis as any).fetch = async (_u: string, init: any) => {
  const body = JSON.parse(init.body);
  calls.push(body);
  const next = plan.shift() ?? 'A fresh answer in new words.';
  if (next === 'fail') return new Response('no', { status: 500 });
  return new Response(JSON.stringify({ choices: [{ message: { content: next } }] }), { status: 200 });
};
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const call = async (body: any) => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: SESSION, ...body }) }));
  return { status: r.status, json: await r.json() };
};
plan = [script];
const r1 = await call({ messages: [{ role: 'user', content: t4 }] });
ok('the first reply is kept when nothing repeats', r1.status === 200 && r1.json.reply === script && calls.length === 1);

calls = []; plan = [script + ' How does that feel to say?', 'It makes sense to worry about how she will take it. What do you most want her to understand?'];
const hist = [{ role: 'user', content: t4 }, { role: 'assistant', content: r1.json.reply }, { role: 'user', content: t5 }];
const r2 = await call({ messages: hist, ticket: r1.json.ticket });
ok('a repeat triggers one more attempt, and the new reply is used', r2.status === 200 && calls.length === 2 && /makes sense to worry/.test(r2.json.reply), JSON.stringify(r2.json).slice(0, 120));
ok('the second attempt carries the do-not-repeat note', calls[1].messages.some((m: any) => m.role === 'system' && /repeated words you had already given/.test(m.content)) && !calls[0].messages.some((m: any) => /repeated words you had already given/.test(m.content)));
ok('the main instruction tells the model never to repeat itself', calls[0].messages[0].content.includes('Never repeat a sentence or a script'));

calls = []; plan = [script, 'fail'];
const r3 = await call({ messages: hist, ticket: r1.json.ticket });
ok('if the second attempt fails, the first reply is kept (no error)', r3.status === 200 && r3.json.reply === script && calls.length === 2);

calls = []; plan = ['A different answer from the start.'];
const r4 = await call({ messages: hist, ticket: r1.json.ticket });
ok('a reply that does not repeat is not retried', r4.status === 200 && calls.length === 1);

calls = []; plan = ['hello'];
const r5 = await call({ messages: [{ role: 'user', content: 'hi' }] });
ok('the first turn is never retried', calls.length === 1 && r5.status === 200);
