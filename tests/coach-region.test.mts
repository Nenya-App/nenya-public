// The coach is open only to connections our host places in the United States; elsewhere the page explains IP addresses.
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_PROVIDER = 'venice'; // these tests stub Venice's address
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_OWNER_TOKEN_HASH;
let modelCalls = 0;
(globalThis as any).fetch = async () => {
  modelCalls++;
  return new Response(JSON.stringify({ choices: [{ message: { content: 'What need might be behind it?' } }] }), { status: 200 });
};
const { default: handler } = await import('../netlify/functions/coach.mts');
const { regionDecision, countryOf, COACH_COUNTRIES } = await import('../src/lib/coachRegion.ts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const post = (geo?: { country?: { code?: string } }) =>
  handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'I felt ignored at work today' }], session: SESSION }) }), { ip: '203.0.113.9', geo });
const get = (geo?: { country?: { code?: string } }) => handler(new Request('https://nenya.biz/api/coach?region', { method: 'GET' }), { geo });

ok('the United States and its territories are allowed', ['US', 'PR', 'GU', 'VI', 'AS', 'MP', 'UM'].every((c) => regionDecision({ country: { code: c } }) === 'allowed') && COACH_COUNTRIES.length === 7);
ok('other countries are refused, and so is a connection the host could not place', regionDecision({ country: { code: 'CA' } }) === 'denied' && regionDecision({ country: { code: 'GB' } }) === 'denied' && regionDecision({}) === 'denied');
ok('with no location from the host at all (local runs and tests), nothing is decided', regionDecision(undefined) === 'unchecked');
ok('only a two-letter code is ever returned', countryOf({ country: { code: 'ca' } }) === 'CA' && countryOf({ country: { code: '<script>' } }) === null && countryOf(undefined) === null);

{
  modelCalls = 0;
  const res = await post({ country: { code: 'CA' } });
  const body = await res.json();
  ok('a message from outside the US is refused with "region", and the model is never called', res.status === 403 && body.error === 'region' && modelCalls === 0);
  ok('the refusal carries no reference to a log line, so nothing is logged about it', body.ref === undefined);
}
{
  modelCalls = 0;
  const res = await post({ country: { code: 'US' } });
  ok('a message from the US goes through', res.status === 200 && modelCalls > 0);
}
{
  const out = await (await get({ country: { code: 'DE' } })).json();
  const inUs = await (await get({ country: { code: 'US' } })).json();
  ok('the page can ask first, and hears back only the decision and the country code', out.allowed === false && out.country === 'DE' && inUs.allowed === true && Object.keys(out).sort().join() === 'allowed,country');
}

const fn = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('the region check runs before the message is read, and before the sealed path', fn.indexOf("regionDecision(netlify?.geo) === 'denied'") < fn.indexOf('const sealedStep') && fn.indexOf("regionDecision(netlify?.geo) === 'denied'") < fn.indexOf('await req.text()'));
ok('the country code is never logged', !/console\.\w+\([^)]*geo/.test(fn) && !/console\.\w+\([^)]*country/.test(fn));

const gate = readFileSync('src/coach/RegionGate.tsx', 'utf8') + readFileSync('src/coach/IpExplainer.tsx', 'utf8');
ok('both ways into the coach go through the gate', /<RegionGate/.test(readFileSync('src/coach/CoachPage.tsx', 'utf8')) && /<RegionGate/.test(readFileSync('src/app/App.tsx', 'utf8')));
ok('a refusal mid-conversation shows the same explanation', /failure\.code === 'region' \? <RegionNotice inline/.test(readFileSync('src/coach/CoachDemo.tsx', 'utf8')));
ok('the notice explains what an IP address is, how a country is guessed, and what Nenya does with it', ['What an IP address is', 'How a country is worked out from it', 'What Nenya does with yours', 'If you are in the United States'].every((h) => gate.includes(h)));
ok('it says the code is not stored or logged, and points to the Terms', /We do not\s+store it or write it to our logs/.test(gate) && /Section 13/.test(gate) && /Section 15 of the Terms/.test(gate));

{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const terms = JSON.stringify(LEGAL_PARTS);
  ok('the Terms say the coach is US-only, how the country is found, and that the code is neither stored nor logged', /open only to connections our host places in the United States/.test(terms) && /neither stores nor logs it/.test(terms) && /Netlify also tells our code which country/.test(terms) && /a connection outside the United States/.test(terms));
}

{
  const OWNER = 'owner-test-token';
  const { createHash } = await import('node:crypto');
  process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(OWNER).digest('hex');
  const res = await handler(new Request('https://nenya.biz/api/coach?region', { method: 'GET', headers: { 'x-nenya-owner': OWNER } }), { geo: { country: { code: 'DE' } } });
  const j = await res.json();
  ok('the page\'s check lets the owner through from anywhere (a VPN included), and still reports the country', j.allowed === true && j.country === 'DE');
  const wrong = await (await handler(new Request('https://nenya.biz/api/coach?region', { method: 'GET', headers: { 'x-nenya-owner': 'not-it' } }), { geo: { country: { code: 'DE' } } })).json();
  ok('a wrong token changes nothing', wrong.allowed === false);
  delete process.env.COACH_OWNER_TOKEN_HASH;
  const g = readFileSync('src/coach/RegionGate.tsx', 'utf8');
  ok('the page sends the owner token with its check', /localStorage\.getItem\(OWNER_TOKEN_KEY\)/.test(g) && /fetch\('\/api\/coach\?region', \{ cache: 'no-store', headers \}\)/.test(g));
  ok('the full-page notice scrolls inside the space it is given', /<div className="scroll-container size-full overflow-y-auto">/.test(g));
}
