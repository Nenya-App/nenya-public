// The coach's stance on mass violence and history: off by default, on with COACH_VALUES=on, never while the care note governs.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true'; process.env.COACH_ABOUT_ANSWERS = 'off'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_ARC; delete process.env.COACH_VALUES;
let sent: any[] = [];
(globalThis as any).fetch = async (_u: string, init: any) => { sent.push(JSON.parse(init.body).messages); return new Response(JSON.stringify({ choices: [{ message: { content: 'What are you noticing?' } }] }), { status: 200, headers: { 'content-type': 'application/json' } }); };
const { default: handler, __instructionsFingerprint } = await import('../netlify/functions/coach.mts');
const { VALUES_RULE, valuesOn } = await import('../src/lib/valuesRule.ts');
import { ok } from './helpers.mts';

const system = async (text: string) => { sent = []; await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: { color1: '#7a9b9e', color2: '#DAC682' } }) })); return (sent[0] ?? []).filter((m: any) => m.role === 'system').map((m: any) => m.content).join(' '); };
const fpOff = __instructionsFingerprint();
ok('off by default: the rule is not in the instructions', !(await system('My day was hard.')).includes('Mass violence and its history are not matters of opinion'));
ok('the switch is exactly "on"', valuesOn('on') && !valuesOn('true') && !valuesOn(undefined));
process.env.COACH_VALUES = 'on';
const on = await system('My day was hard.');
ok('on: the rule is in the instructions', on.includes('Mass violence and its history are not matters of opinion'));
ok('the rule says not to both-sides, to say who found what, to treat belief as any thought, never to blame a survivor, and to hold the same line in every direction', /Do not both-sides/.test(VALUES_RULE) && /say who found it/.test(VALUES_RULE) && /Treat a religious belief as you treat any thought/.test(VALUES_RULE) && /Never blame a survivor/.test(VALUES_RULE) && /whether they are the colonized or the colonizers/.test(VALUES_RULE) && /removal of any group from any place/.test(VALUES_RULE));
ok('the rule is short enough for a small model to keep in view', VALUES_RULE.length < 1900, String(VALUES_RULE.length));
ok('turning it on changes the signed instructions fingerprint', __instructionsFingerprint() !== fpOff);
const distress = await system('I have been thinking about suicide.');
ok('while the care note governs (possible distress), the rule is left out', !distress.includes('Mass violence and its history are not matters of opinion'));
delete process.env.COACH_VALUES;

// ---- the plain statement the site adds (from the first holistic run)
const { challengeFor, CHALLENGE } = await import('../src/lib/valuesRule.ts');
ok('denial gets a plain statement of disagreement', challengeFor('I think the Holocaust never happened.', 'What do you notice in yourself?') === CHALLENGE['mass-violence-denial']);
ok('removal and colonizer-dehumanization get the approved wording', challengeFor('We should send them all back.', 'x') === CHALLENGE['mass-violence-removal'] && challengeFor('The settlers are all vermin.', 'x') === CHALLENGE['colonizer-dehumanization'] && /less than human/.test(CHALLENGE['colonizer-dehumanization']));
ok('nothing is added when the reply already says it, when the person is reporting, or for ordinary talk', challengeFor('The Holocaust never happened.', 'I disagree with that, and the record is clear.') === null && challengeFor('My uncle told me the Holocaust never happened.', 'x') === null && challengeFor('My day was hard.', 'x') === null && challengeFor('I read about ethnic cleansing in Bosnia.', 'x') === null);
const post = async (text: string) => { const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: { color1: '#7a9b9e', color2: '#DAC682' } }) })); return (await r.json()) as any; };
process.env.COACH_VALUES = 'on';
const dn = await post('I think the Holocaust never happened and the numbers are made up.');
ok('on: the statement is put before the model\'s reply and the reply is kept', dn.reply.startsWith(CHALLENGE['mass-violence-denial']) && dn.reply.endsWith('What are you noticing?'));
delete process.env.COACH_VALUES;
const dn2 = await post('I think the Holocaust never happened and the numbers are made up.');
ok('off: nothing is added', dn2.reply === 'What are you noticing?');
