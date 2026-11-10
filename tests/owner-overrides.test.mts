// Owner-only per-request switches (netlify/functions/coach.mts, parseOverrides): the owner's token lets a request turn the added distress
// sentences and the v1/v2 instruction wording on or off for that request only. Without the token, nothing changes.
import { createHash, randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET;
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_DISTRESS_TEXT;
delete process.env.COACH_INSTRUCTIONS;
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update('owner-secret').digest('hex');
const modelSays = 'That sounds heavy, and it makes sense that you are tired.';
let lastSystem = '';
(globalThis as any).fetch = async (_u: string, init: any) => {
  try { lastSystem = JSON.parse(init.body).messages[0].content; } catch { /* not a chat body */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
};
const { default: handler, parseOverrides } = await import('../netlify/functions/coach.mts');
const { DISTRESS_APPEND } = await import('../src/lib/distressText.ts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const call = async (text: string, overrides: unknown, token?: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz', ...(token ? { 'x-nenya-owner': token } : {}) }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION, overrides }) }));
  return (await res.json()) as any;
};
const flagged = 'I feel so hopeless and worthless lately.';

ok('only the owner\'s requests are read, and only the two known switches with known values', JSON.stringify(parseOverrides(true, { distressText: 'on', instructions: 'v2', maxTurns: 99, x: 1 })) === '{"distressText":true,"instructions":"v2"}' && JSON.stringify(parseOverrides(false, { distressText: 'on' })) === '{}' && JSON.stringify(parseOverrides(true, { distressText: 'yes', instructions: 'v3' })) === '{}' && JSON.stringify(parseOverrides(true, 'on')) === '{}');
let j = await call(flagged, { distressText: 'on' });
ok('a visitor cannot switch anything on', j.reply === modelSays);
j = await call(flagged, { distressText: 'on' }, 'wrong-token');
ok('a wrong token cannot either', j.reply === modelSays);
j = await call(flagged, { distressText: 'on' }, 'owner-secret');
ok('the owner can turn the added sentence on for one request', j.reply === `${modelSays}\n\n${DISTRESS_APPEND.distress}`);
j = await call(flagged, undefined, 'owner-secret');
ok('and the next request, with no override, follows the site\'s own setting again (off)', j.reply === modelSays);
process.env.COACH_DISTRESS_TEXT = 'on';
j = await call(flagged, { distressText: 'off' }, 'owner-secret');
ok('the owner can turn it off for one request while the site has it on', j.reply === modelSays);
j = await call(flagged, undefined, 'owner-secret');
ok('and without an override the site\'s setting (on) applies', j.reply.endsWith(DISTRESS_APPEND.distress));
delete process.env.COACH_DISTRESS_TEXT;

await call('Work is tiring.', undefined, 'owner-secret');
const v1 = lastSystem;
await call('Work is tiring.', { instructions: 'v2' }, 'owner-secret');
const v2 = lastSystem;
await call('Work is tiring.', { instructions: 'v2' });
const visitor = lastSystem;
ok('the owner can choose the v2 instruction wording for one request; a visitor cannot', v2 !== v1 && /You are an AI\. You have no body/.test(v2) && !/You are an AI\. You have no body/.test(v1) && visitor === v1);

// ---- why an origin was refused: told to the owner only
const refused = async (token?: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://dev--elsewhere.netlify.app', ...(token ? { 'x-nenya-owner': token } : {}) }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello.' }], session: SESSION }) }));
  return { status: res.status, body: (await res.json()) as any };
};
const visitorRefused = await refused();
const ownerRefused = await refused('owner-secret');
ok('a refused origin is a 403 for everyone, and only the owner is told why', visitorRefused.status === 403 && visitorRefused.body.error === 'origin' && visitorRefused.body.reason === undefined && ownerRefused.status === 403 && /COACH_EXTRA_HOSTS is empty or not set/.test(ownerRefused.body.reason ?? ''));
