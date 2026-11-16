// The coach's provider switch (docs/hosted-model-swap-scope.md): Venice by default; Workers AI with COACH_PROVIDER=workers-ai. The model call is
// stubbed; nothing here touches the network.
import handler from '../netlify/functions/coach.mts';
import { coachModel, coachProvider, isWorkersAiModel, readWorkersAi, workersAiBody, workersAiUrl, WORKERS_AI_DEFAULT_MODEL, VENICE_DEFAULT_MODEL } from '../src/lib/coachProvider.ts';
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const ACCOUNT = '0123456789abcdef0123456789abcdef';
// The pure parts.
ok('Venice unless the switch says workers-ai', coachProvider({}) === 'venice' && coachProvider({ COACH_PROVIDER: 'cloudflare' }) === 'venice' && coachProvider({ COACH_PROVIDER: 'workers-ai' }) === 'workers-ai');
ok('each provider has its own default model, and COACH_MODEL wins', coachModel({}) === VENICE_DEFAULT_MODEL && coachModel({ COACH_PROVIDER: 'workers-ai' }) === WORKERS_AI_DEFAULT_MODEL && coachModel({ COACH_PROVIDER: 'workers-ai', COACH_MODEL: '@cf/qwen/qwen3-30b-a3b-fp8' }) === '@cf/qwen/qwen3-30b-a3b-fp8');
ok('the Workers AI default is Gemma 4 26B-A4B (Apache 2.0, the bake-off leader)', WORKERS_AI_DEFAULT_MODEL === '@cf/google/gemma-4-26b-a4b-it' && isWorkersAiModel(WORKERS_AI_DEFAULT_MODEL));
ok('the address is built only from a real account id and a Workers AI model id', workersAiUrl(ACCOUNT, WORKERS_AI_DEFAULT_MODEL) === `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/@cf/google/gemma-4-26b-a4b-it` && workersAiUrl('nope', WORKERS_AI_DEFAULT_MODEL) === null && workersAiUrl(ACCOUNT, 'e2ee-qwen-2-5-7b-p') === null && workersAiUrl(ACCOUNT, '@cf/../../x') === null);
const body = workersAiBody([{ role: 'user', content: 'hi' }], { temperature: 0.7, top_p: 0.9, max_completion_tokens: 600 });
ok('the body is what the bake-off measured: thinking off, the same sampling and ceiling', body.max_tokens === 600 && body.temperature === 0.7 && body.top_p === 0.9 && body.chat_template_kwargs.enable_thinking === false && !('model' in body));
ok('the reply is read from result.choices, a bare choices, reasoning_content or response; Neurons when reported',
  readWorkersAi({ result: { choices: [{ message: { content: 'a' }, finish_reason: 'stop' }], usage: { neurons: 15.7 } } }).content === 'a'
  && readWorkersAi({ result: { choices: [{ message: { content: 'a' } }], usage: { neurons: 15.7 } } }).neurons === 15.7
  && readWorkersAi({ choices: [{ message: { reasoning_content: 'b' } }] }).content === 'b'
  && readWorkersAi({ result: { response: 'c' } }).content === 'c'
  && readWorkersAi(null).content === '' && readWorkersAi({}).neurons === undefined);

// End to end through the coach function.
process.env.COACH_ENABLED = 'true';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_PROVIDER = 'workers-ai';
process.env.CF_AI_ACCOUNT_ID = ACCOUNT;
process.env.CF_AI_TOKEN = 'cf-test-token';
process.env.COACH_SEALED = 'on';
delete process.env.VENICE_API_KEY;
delete process.env.COACH_MODEL;
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_EXTRA_HOSTS;
let calls: { url: string; init: any; body: any }[] = [];
let mode: 'ok' | 'fail' = 'ok';
(globalThis as any).fetch = async (url: string, init: any) => {
  calls.push({ url: String(url), init, body: init?.body ? JSON.parse(init.body) : null });
  if (mode === 'fail') return new Response('nope', { status: 500 });
  return new Response(JSON.stringify({ result: { choices: [{ message: { content: 'I hear that. What feels heaviest right now?' }, finish_reason: 'stop' }], usage: { neurons: 15.7 } }, success: true }), { status: 200 });
};
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const call = async (b: any) => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: SESSION, ...b }) }));
  return { status: r.status, json: await r.json() };
};

let r = await call({ messages: [{ role: 'user', content: 'I have been feeling stuck at work.' }] });
const sent = calls.find((c) => c.url.includes('api.cloudflare.com'));
ok('a turn goes to Workers AI, with the token, and the reply comes back', r.status === 200 && /What feels heaviest/.test(r.json.reply) && !!sent && sent.init.headers.Authorization === 'Bearer cf-test-token', JSON.stringify(r.json));
ok('the same system instruction and scrubbed messages as on Venice', !!sent && sent.body.messages[0].role === 'system' && /exchange 1 of 5/.test(sent.body.messages[0].content) && sent.body.messages.at(-1).content.includes('stuck at work'));
ok('the brevity note is added on Workers AI', !!sent && sent.body.messages[0].content.includes('under 80 words') && sent.body.messages[0].content.includes('whoever prescribes it'));
ok('nothing goes to Venice', !calls.some((c) => c.url.includes('venice.ai')));
calls = [];
mode = 'fail';
r = await call({ messages: [{ role: 'user', content: 'I have been feeling stuck at work.' }] });
ok('if Workers AI fails, the person gets the failure notice, and there is no fallback to Venice', r.status === 502 && r.json.error === 'upstream' && !calls.some((c) => c.url.includes('venice.ai')));
mode = 'ok';
const modes = await (await handler(new Request('https://nenya.biz/api/coach?modes'))).json();
ok('sealed (Venice\'s encrypted mode) is not offered on Workers AI, even with COACH_SEALED=on', modes.witnessed === true && modes.sealed === false);
r = await call({ sealed: 'attest', nonce: 'a'.repeat(64) });
ok('a sealed request is refused on Workers AI', r.status === 503 && r.json.error === 'sealed-provider', JSON.stringify(r.json));
delete process.env.CF_AI_ACCOUNT_ID;
r = await call({ messages: [{ role: 'user', content: 'hello' }] });
ok('without the Cloudflare account the coach is off with a config error, never sent elsewhere', r.status === 500 && calls.every((c) => !c.url.includes('venice.ai')));
process.env.CF_AI_ACCOUNT_ID = ACCOUNT;
process.env.COACH_MODEL = 'e2ee-qwen-2-5-7b-p';
r = await call({ messages: [{ role: 'user', content: 'hello' }] });
ok('a Venice model id under Workers AI is refused as a config error', r.status === 500);
delete process.env.COACH_MODEL;

const env = readFileSync('docs/production-env.md', 'utf8');
ok('the new settings are documented', ['COACH_PROVIDER', 'CF_AI_ACCOUNT_ID', 'CF_AI_TOKEN'].every((k) => env.includes('`' + k + '`')));
