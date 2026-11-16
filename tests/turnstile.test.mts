// The humanity check (Cloudflare Turnstile): checked on a conversation's first message only, fails closed when on, never refuses in shadow.
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_PROVIDER = 'venice'; // these tests stub Venice's address
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_TURNSTILE;
const OWNER = 'owner-token-for-tests';
process.env.COACH_OWNER_TOKEN_HASH = createHash('sha256').update(OWNER).digest('hex');

// Cloudflare's answer, set per test; the model's answer is always the same.
let verdict: Record<string, unknown> | 'down' = { success: true, action: 'coach', hostname: 'nenya.biz' };
let siteverifyCalls = 0;
let siteverifyBody = '';
let modelCalls = 0;
(globalThis as any).fetch = async (url: string, init?: { body?: unknown }) => {
  if (String(url).includes('challenges.cloudflare.com')) {
    siteverifyCalls++;
    siteverifyBody = String(init?.body ?? '');
    if (verdict === 'down') throw new TypeError('network');
    return new Response(JSON.stringify(verdict), { status: 200 });
  }
  modelCalls++;
  return new Response(JSON.stringify({ choices: [{ message: { content: 'What need might be behind it?' } }] }), { status: 200 });
};
const { default: handler } = await import('../netlify/functions/coach.mts');
const { checkTurnstile, turnstileHosts, turnstileMode, TURNSTILE_ACTION } = await import('../src/lib/turnstileCheck.ts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const first = { role: 'user', content: 'I felt ignored at work today' };
const post = (body: Record<string, unknown>, owner = false) =>
  handler(
    new Request('https://nenya.biz/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://nenya.biz', ...(owner ? { 'x-nenya-owner': OWNER } : {}) },
      body: JSON.stringify({ session: SESSION, ...body }),
    }),
    { ip: '203.0.113.9', geo: { country: { code: 'US' } } },
  );
const reset = () => {
  siteverifyCalls = 0;
  modelCalls = 0;
  siteverifyBody = '';
  verdict = { success: true, action: 'coach', hostname: 'nenya.biz' };
};

// The settings
ok('the mode is off unless set to "shadow" or "on"', turnstileMode(undefined) === 'off' && turnstileMode('yes') === 'off' && turnstileMode(' ON ') === 'on' && turnstileMode('shadow') === 'shadow');
ok('hosts are read as a clean list', [...turnstileHosts(' nenya.biz, www.nenya.biz ,,bad host')].join() === 'nenya.biz,www.nenya.biz');
ok('the action is "coach"', TURNSTILE_ACTION === 'coach');

// The check itself
{
  const hosts = turnstileHosts('nenya.biz');
  const f = (v: unknown) => (async () => new Response(JSON.stringify(v), { status: 200 })) as unknown as typeof fetch;
  ok('a genuine token for the coach on an allowed host passes', (await checkTurnstile('t', 's', hosts, f({ success: true, action: 'coach', hostname: 'nenya.biz' }))).ok);
  ok('no token, or an oversized one, fails without asking Cloudflare', JSON.stringify(await checkTurnstile(undefined, 's', hosts, f({}))) === '{"ok":false,"why":"missing"}' && JSON.stringify(await checkTurnstile('x'.repeat(2049), 's', hosts, f({}))) === '{"ok":false,"why":"missing"}');
  ok('no secret or no hosts fails closed', JSON.stringify(await checkTurnstile('t', undefined, hosts, f({}))) === '{"ok":false,"why":"config"}' && JSON.stringify(await checkTurnstile('t', 's', new Set(), f({}))) === '{"ok":false,"why":"config"}');
  ok('a rejected token fails', JSON.stringify(await checkTurnstile('t', 's', hosts, f({ success: false }))) === '{"ok":false,"why":"rejected"}');
  ok('a token made for another action fails', JSON.stringify(await checkTurnstile('t', 's', hosts, f({ success: true, action: 'signup', hostname: 'nenya.biz' }))) === '{"ok":false,"why":"action"}');
  ok('a token solved on another host (localhost included) fails', JSON.stringify(await checkTurnstile('t', 's', hosts, f({ success: true, action: 'coach', hostname: 'localhost' }))) === '{"ok":false,"why":"hostname"}');
  const down = (async () => {
    throw new TypeError('down');
  }) as unknown as typeof fetch;
  const bad = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch;
  ok('Cloudflare unreachable or answering badly fails closed', JSON.stringify(await checkTurnstile('t', 's', hosts, down)) === '{"ok":false,"why":"unreachable"}' && JSON.stringify(await checkTurnstile('t', 's', hosts, bad)) === '{"ok":false,"why":"unreachable"}');
}

// Off (the default): nothing changes
{
  reset();
  const res = await post({ messages: [first] });
  ok('off: a first message goes through with no token, and Cloudflare is never asked', res.status === 200 && siteverifyCalls === 0 && modelCalls > 0);
}

// On
process.env.COACH_TURNSTILE = 'on';
process.env.TURNSTILE_SECRET_KEY = 'secret-for-tests';
process.env.TURNSTILE_HOSTNAMES = 'nenya.biz,www.nenya.biz';
{
  reset();
  const res = await post({ messages: [first] });
  const body = await res.json();
  ok('on: a first message without a token is refused with "human", and the model is never called', res.status === 403 && body.error === 'human' && modelCalls === 0);
}
{
  reset();
  const res = await post({ messages: [first], human: 'tok' });
  const body = await res.json();
  ok('on: a first message with a genuine token goes through', res.status === 200 && typeof body.ticket === 'string' && modelCalls > 0 && siteverifyCalls === 1);
  ok('only the token and the secret are sent to Cloudflare: no IP address, nothing of the message', /^secret=secret-for-tests&response=tok$/.test(siteverifyBody));
  reset();
  verdict = { success: false };
  const second = await post({ messages: [first, { role: 'assistant', content: body.reply }, { role: 'user', content: 'It keeps happening every week' }], ticket: body.ticket });
  ok('on: a later message needs no token (the ticket binds it to the checked first one), and Cloudflare is not asked', second.status === 200 && siteverifyCalls === 0 && modelCalls > 0);
}
{
  reset();
  verdict = { success: true, action: 'coach', hostname: 'localhost' };
  const res = await post({ messages: [first], human: 'tok' });
  ok('on: a token solved on localhost is refused on production', res.status === 403 && modelCalls === 0);
}
{
  reset();
  verdict = 'down';
  const res = await post({ messages: [first], human: 'tok' });
  ok('on: if Cloudflare cannot be reached, the first message is refused (fails closed)', res.status === 403 && modelCalls === 0);
}
{
  reset();
  const saved = process.env.TURNSTILE_HOSTNAMES;
  delete process.env.TURNSTILE_HOSTNAMES;
  const res = await post({ messages: [first], human: 'tok' });
  process.env.TURNSTILE_HOSTNAMES = saved;
  ok('on: with no hosts set, every first message is refused (fails closed)', res.status === 403 && modelCalls === 0);
}
{
  reset();
  const res = await post({ messages: [first] }, true);
  ok("on: the owner's token passes without a check, for the staging suite", res.status === 200 && siteverifyCalls === 0);
}

// Shadow: checks and counts, never refuses
process.env.COACH_TURNSTILE = 'shadow';
{
  reset();
  const res = await post({ messages: [first] });
  verdict = { success: false };
  const res2 = await post({ messages: [first], human: 'tok' });
  ok('shadow: a first message goes through without a token, and with a rejected one', res.status === 200 && res2.status === 200);
}
delete process.env.COACH_TURNSTILE;

// The code around it
const fn = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('the check runs before the turn is counted, on the witnessed and the sealed paths', (fn.match(/await humanCheck\(/g) ?? []).length === 2 && fn.indexOf('await humanCheck(req, (body') < fn.indexOf("tally('coach.turn.sent')"));
ok('the token is never logged', !/console\.\w+\([^)]*(human|token)/i.test(fn));
const hook = readFileSync('src/coach/useHumanCheck.ts', 'utf8');
const demo = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
ok("Cloudflare's script is loaded only by the coach's hook, and siteverify is never called from the browser", hook.includes('challenges.cloudflare.com/turnstile/v0/api.js') && !/siteverify/.test(hook + demo));
ok('the check is active only before the first message', /useHumanCheck\(stage === 'chat' && messages\.length === 0 && !ticket\)/.test(demo));
ok('the widget stays out of sight unless Cloudflare needs the person', hook.includes("appearance: 'interaction-only'"));
ok('a first message resets the widget whatever the answer, so a retry gets a fresh token', /finally \{[\s\S]{0,200}if \(first\) human\.reset\(\)/.test(demo));
const toml = readFileSync('netlify.toml', 'utf8');
ok("the security policy allows Cloudflare's script and frame, and nothing else new", /script-src 'self' https:\/\/challenges\.cloudflare\.com;/.test(toml) && /frame-src https:\/\/challenges\.cloudflare\.com;/.test(toml) && /connect-src 'self';/.test(toml));
{
  const { describeFailure } = await import('../src/lib/coachErrors.ts');
  ok('a refusal is explained in plain words', /automated traffic/.test(describeFailure({ status: 403, error: 'human' }).message));
}
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const terms = JSON.stringify(LEGAL_PARTS);
  ok('the Terms describe the check: Cloudflare, what it receives, what our server learns, and nothing stored', /Check for automated traffic/.test(terms) && /Cloudflare Turnstile/.test(terms) && /TLS fingerprint/.test(terms) && /learns only whether the check passed/.test(terms) && /We do not store the result and do not log it/.test(terms));
  ok('the Terms name it as the one exception to "no fingerprinting" and "nothing from other sites"', /uses no fingerprinting\. The one exception is the coach demo’s check/.test(terms) && /with one exception: before your first coach message, the coach demo loads Cloudflare’s check/.test(terms));
}
