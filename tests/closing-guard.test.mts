// The function retries a final reply that ends with a question, then drops the question if it still does.
import handler from '../netlify/functions/coach.mts';
import { ok } from './helpers.mts';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2';

const S = { color1: '#7a9b9e', color2: '#DAC682' };
let script: string[] = [];
let failWhenEmpty = false;
const seen: string[] = [];
(globalThis as any).fetch = async (_u: string, init: any) => {
  const body = JSON.parse(init.body);
  seen.push(body.messages.map((m: any) => m.content).join('\n'));
  if (failWhenEmpty && script.length === 0) return new Response('{}', { status: 500 });
  return new Response(JSON.stringify({ choices: [{ message: { content: script.shift() ?? 'Fallback.' } }] }), { status: 200 });
};

// plays four ordinary turns, then returns the fifth call's result and the number of model calls the fifth made
async function playToFive(replies: string[], fifthUser = 'It is hard at work lately.'): Promise<{ json: any; calls: number; prompts: string[] }> {
  const msgs: any[] = [];
  let ticket: string | undefined;
  let json: any;
  const four = ['I hear that. It sounds like a lot to carry.', 'Thank you for telling me more. Work seems to press on you.', 'That would wear anyone down.', 'Something about being stretched thin comes through clearly.'];
  for (let t = 1; t <= 4; t++) {
    script = [four[t - 1]];
    msgs.push({ role: 'user', content: `message ${t}` });
    json = await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: S, ticket }) }))).json();
    msgs.push({ role: 'assistant', content: json.reply });
    ticket = json.ticket;
  }
  script = [...replies];
  seen.length = 0;
  msgs.push({ role: 'user', content: fifthUser });
  json = await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: S, ticket }) }))).json();
  return { json, calls: seen.length, prompts: [...seen] };
}

const SETTLED = 'You said work keeps pressing from every side. Speaking about it plainly is yours to keep. That is enough for today.';

let r = await playToFive([SETTLED]);
ok('a settled final reply is used as it is, with one call', r.json.reply === SETTLED && r.calls === 1);

r = await playToFive(['You carry a lot. What would help you most this week?', SETTLED]);
ok('a final reply that asks is tried again, and the closing reply is used', r.calls === 2 && r.json.reply === SETTLED);
ok('the second try carries the firmer note', /cannot reply: this is the last message/.test(r.prompts[1]) && !/cannot reply: this is the last message/.test(r.prompts[0]));

r = await playToFive(['You carry a lot. What would help you most this week?', 'It is a lot. Would you like to tell me more about it?']);
ok('if it asks again, the question sentences are dropped', r.calls === 2 && r.json.reply === 'It is a lot.' + ' ' + 'Thank you for putting that into words. It mattered that you said it.');
ok('what is shown never asks', !/\?/.test(r.json.reply));

r = await playToFive(['You carry a lot, and you said it plainly. That is yours to keep. Let me know how it goes.', 'That is yours to keep, and it is enough for today.']);
ok('an invitation with no question mark is also tried again', r.calls === 2 && r.json.reply === 'That is yours to keep, and it is enough for today.');

// a failure on the second try keeps the first reply (with its question dropped), not an error
failWhenEmpty = true;
r = await playToFive(['It is a lot to hold. Your honesty about it is yours to keep. What would help most?']);
failWhenEmpty = false;
ok('if the second try fails, the first reply is kept with its question dropped', r.calls === 2 && r.json.reply === 'It is a lot to hold. Your honesty about it is yours to keep.' && r.json.done === true);

// the earlier exchanges are not touched by the guard
const msgs: any[] = [{ role: 'user', content: 'hello' }];
script = ['What brings you here today?'];
const t1: any = await (await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: S }) }))).json();
ok('a question on exchange 1 is left alone', t1.reply === 'What brings you here today?');

// the switch used to measure the instructions alone
process.env.COACH_CLOSING_GUARD = 'off';
r = await playToFive(['You carry a lot. What would help you most this week?']);
ok('with the guard off, the reply is passed through untouched', r.calls === 1 && r.json.reply === 'You carry a lot. What would help you most this week?');
delete process.env.COACH_CLOSING_GUARD;
