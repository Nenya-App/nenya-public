// The sentence the site adds to a reply when the crisis check flags possible distress (draft wording, off unless COACH_DISTRESS_TEXT=on).
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET;
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_DISTRESS_TEXT;
let modelSays = 'That sounds heavy, and it makes sense that you are tired.';
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
const { default: handler } = await import('../netlify/functions/coach.mts');
const { DISTRESS_APPEND, STOP_LEAD, withDistressText, distressTextOn } = await import('../src/lib/distressText.ts');
const { present } = await import('../src/lib/personaChecks.ts');
const { detectFlag } = await import('../src/lib/safetyFlags.ts');
const { isKnownEvent } = await import('../src/lib/counters.ts');
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const turn1 = async (text: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) }));
  return (await res.json()) as any;
};

// ---- the wording itself
const cats = ['self-harm', 'distress', 'abuse', 'harm-others'] as const;
ok('there is a sentence for every kind of flag', cats.every((c) => (DISTRESS_APPEND as any)[c]?.length > 60));
ok('each names a person or a crisis line, and the numbers on the page', cats.every((c) => present('pointsToHelp', DISTRESS_APPEND[c])) && cats.every((c) => /numbers below|use the numbers|The numbers below|connect you with a person/.test(DISTRESS_APPEND[c])));
ok('none asks a question, gives advice to do anything but reach out, probes, or says "I\'m here for you" in place of a person', cats.every((c) => !/\?/.test(DISTRESS_APPEND[c]) && !present('standsInForPeople', DISTRESS_APPEND[c]) && !/tell me (?:more|about)|describe|what happened/i.test(DISTRESS_APPEND[c])));
ok('none claims what an AI cannot: no promise to remember, miss, or be there, no claim to help in a crisis', cats.every((c) => !present('promisesMemory', DISTRESS_APPEND[c]) && !present('claimsMissingOrWorry', DISTRESS_APPEND[c]) && !/I can help in a crisis/i.test(DISTRESS_APPEND[c])));
ok('the self-harm one says it is an AI that cannot help in a crisis, and names the emergency number for acting on the thoughts', /I'm an AI and can't help in a crisis/.test(DISTRESS_APPEND['self-harm']) && /emergency number/.test(DISTRESS_APPEND['self-harm']));
ok('the abuse one gives the hotline the page already lists, and 911', /1-800-799-7233/.test(DISTRESS_APPEND.abuse) && /911/.test(DISTRESS_APPEND.abuse));
ok('the stop notice lead is warm, plain, says an AI cannot help in a crisis, and ends where the numbers start', /deserves a person, not an AI/.test(STOP_LEAD) && /not able to help in a crisis/.test(STOP_LEAD) && STOP_LEAD.trim().endsWith(':'));

// ---- adding it
const base = 'I hear that you are worn out.';
const out = withDistressText('distress', base, 3000);
ok('the sentence follows the reply after a blank line, and the reply is kept whole', out === `${base}\n\n${DISTRESS_APPEND.distress}`);
ok('a reply that already names 988 and says to call or text is left alone', withDistressText('distress', 'Please call or text 988 today.', 3000) === 'Please call or text 988 today.');
const long = 'This is a sentence about being tired. '.repeat(120);
const fitted = withDistressText('self-harm', long, 3000);
ok('a long reply is trimmed at a whole sentence so the sentence always fits and is never cut off', fitted.length <= 3000 && fitted.endsWith(DISTRESS_APPEND['self-harm']) && /\.\n\n/.test(fitted));
ok('if nothing of the reply fits, the sentence alone is sent', withDistressText('self-harm', 'x'.repeat(5000), 100) === DISTRESS_APPEND['self-harm']);
ok('it is on only when COACH_DISTRESS_TEXT is "on"', distressTextOn({ COACH_DISTRESS_TEXT: 'on' }) && !distressTextOn({}) && !distressTextOn({ COACH_DISTRESS_TEXT: 'true' }) && !distressTextOn({ COACH_DISTRESS_TEXT: 'off' }));

// ---- through the function
const flagged = 'I feel so hopeless and worthless lately.';
const f = detectFlag(flagged);
ok('the test message is a soften flag in the "distress" category', f?.tier === 'soften' && f.category === 'distress');
let j = await turn1(flagged);
ok('with the switch off, the reply is the model\'s alone (nothing changes)', j.reply === modelSays && !j.reply.includes('988'));
process.env.COACH_DISTRESS_TEXT = 'on';
j = await turn1(flagged);
ok('with it on, a soften-flagged message gets the pointer added after the reply, and it is a normal reply (a ticket and a turn)', j.reply === `${modelSays}\n\n${DISTRESS_APPEND.distress}` && typeof j.ticket === 'string' && j.turn === 1 && j.done === false && j.flag?.tier === 'soften');
const selfHarm = await turn1('I have been thinking about suicide a lot.');
ok('the stop tier is untouched: no model reply, the notice and the resources (the page writes them)', !!selfHarm.flag && selfHarm.flag.tier === 'stop' && selfHarm.reply === undefined && selfHarm.done === true);
const shSoft = await turn1('I wish I could disappear sometimes.');
ok('a self-harm soften flag gets the self-harm sentence', shSoft.flag?.category === 'self-harm' && shSoft.reply.endsWith(DISTRESS_APPEND['self-harm']));
const plain = await turn1('My coworker keeps talking over me in meetings.');
ok('an unflagged message is never given the sentence', plain.reply === modelSays && !plain.flag);
modelSays = 'Please call or text 988 or reach someone you trust.';
const already = await turn1(flagged);
ok('if the model has already named the line, the sentence is not added a second time', already.reply === modelSays);
modelSays = 'That sounds heavy. '.repeat(400);
const longj = await turn1(flagged);
ok('through the function, a very long model reply is trimmed so the sentence fits within the reply limit', longj.reply.length <= 3000 && longj.reply.endsWith(DISTRESS_APPEND.distress));
// the final exchange must still end without a question
modelSays = 'That sounds heavy, and I hear the weight of it.';
const hist: any[] = [];
let ticket: string | undefined;
for (let t = 1; t <= 5; t++) {
  hist.push({ role: 'user', content: t === 5 ? flagged : `message number ${t}` });
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: hist, session: SESSION, ticket }) }));
  const k: any = await res.json();
  hist.push({ role: 'assistant', content: k.reply });
  ticket = k.ticket;
  if (t === 5) ok('on the fifth exchange the reply with the sentence still ends the conversation and asks nothing', k.done === true && k.reply.endsWith(DISTRESS_APPEND.distress) && !/\?/.test(k.reply));
}
ok('the count of how often it is added is a known event for the admin page', isKnownEvent('coach.turn.distress-text'));
delete process.env.COACH_DISTRESS_TEXT;

// ---- the instruction's no-probing line
const src = readFileSync(join(root, 'netlify/functions/coach.mts'), 'utf8');
ok('the v2 distress instruction tells the model not to ask for details about dark or suicidal thoughts', /do not ask them to describe or explain dark or suicidal thoughts and do not ask for details about them/.test(src));
ok('the switch and the tally are in the function, after the trimming', src.indexOf('trimToSentence(reply.slice(0, MAX_ASSISTANT_CHARS))') < src.indexOf("tally('coach.turn.distress-text')"));
