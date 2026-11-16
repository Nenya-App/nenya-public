// The care guard: when the message may signal distress, the coach may offer a grounding tool, but may not tell the person to calm down, speak as if it could be
// with the person, or ask about the thoughts. Through the real coach function, with a model that does it anyway. No model call.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_FORM_CHECK = 'off'; process.env.COACH_DISTRESS_TEXT = 'on'; process.env.COACH_INSTRUCTIONS = 'v2.1';
for (const k of ['COACH_IP_SECRET', 'COACH_VALUES', 'COACH_SCREEN', 'COACH_EXTRA_HOSTS', 'COACH_CARE_GUARD', 'COACH_ARC']) delete process.env[k];
let says: string[] = [];
let calls = 0; let lastSystem = '';
(globalThis as any).fetch = async (_u: string, init: any) => {
  calls++;
  try { lastSystem = JSON.parse(init.body).messages.filter((m: any) => m.role === 'system').map((m: any) => m.content).join(' '); } catch { /* */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: says.length > 1 ? says.shift()! : says[0] } }] }), { status: 200 });
};
const { default: coach } = await import('../netlify/functions/coach.mts');
const { careProblems, withoutCareProblems, CARE_FALLBACK } = await import('../src/lib/careGuard.ts');
const { editText } = await import('../src/lib/siteMessages.ts');
import { ok } from './helpers.mts';

// The patterns
const BAD = ['Calm down.', 'You need to calm down and think clearly.', 'Just relax.', 'Just breathe.', "Don't worry, it will pass.", "It's not that bad.", 'Everything will be fine.', 'Would it help to take a slow, deep breath together?', "Is there something specific that's making it hard to see a reason to keep going?", "Can you tell me more about what you're feeling?", "I'm here for you.", 'We can get through this together.', 'Have you thought about how you would hurt yourself?'];
const FINE = ['Would it help to take a slow, deep breath?', 'If you want, you could try a slow breath, or notice your feet on the floor.', 'A slow breath can sometimes help your body settle down a little.', 'Some people find it helps to breathe out slowly.', 'Is there someone you trust that you could reach out to right now?', "That sounds really heavy, and I'm glad you said it.", 'Please call or text 988.', 'You and your sister worked on it together for years.', "I'm an AI and can't help in a crisis.", "You don't have to calm down to talk here."];
ok('it finds "calm down" and its relatives, "together", "I\'m here for you" and probing questions', BAD.every((b) => careProblems(b).length > 0), BAD.filter((b) => !careProblems(b).length).join(' | '));
ok('it leaves a breath or grounding tool offered as an option, care, a person to reach, a crisis line and ordinary sentences alone (owner, 2026-11-14)', FINE.every((f) => careProblems(f).length === 0), FINE.filter((f) => careProblems(f).length).join(' | '));
const cleaned = withoutCareProblems("That sounds really heavy. Don't worry, it will pass. If you want, a slow breath can help.");
ok('cleaning takes out only the sentences that break the rule, keeps the breath offer, and counts them', cleaned.removed === 1 && !/worry/.test(cleaned.reply) && /really heavy/.test(cleaned.reply) && /slow breath/.test(cleaned.reply));
ok('if nothing would be left, the site\'s own short sentence stands in', withoutCareProblems('Just calm down.').reply === CARE_FALLBACK);

const S = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: S }) }), { ip: '203.0.113.8' })).json() as Promise<any>;
const DISTRESS = 'I do not see the point in going on.';

// The model does it twice: the retry is asked for, then the sentence is taken out and the edit reported with a proof.
calls = 0; says = ['That sounds really heavy. Just calm down, everything will be fine.', 'I hear you. Try not to think about it. Just relax.'];
const a = await send(DISTRESS);
ok('a reply that tells someone in distress to calm down is asked for again, once, and the note invites a grounding offer', calls === 2 && /told the person to calm down/.test(lastSystem) && /You may offer one grounding tool/.test(lastSystem));
ok('if the retry does it too, the sentence is taken out and the site\'s distress sentence still follows', !/just relax/i.test(a.reply.split('\n\n')[0]) && /988/.test(a.reply));
const care = (a.edits ?? []).find((e: any) => e.kind === 'removed-care');
ok('the removal is reported as a care edit with a count and a proof', !!care && care.n === 1 && typeof care.proof === 'string' && care.proof.length === 64);

// The retry gets it right: no removal, no edit.
calls = 0; says = ["Don't worry about it.", 'That sounds really heavy, and I am glad you said it. Is there someone you trust you could reach right now?'];
const b = await send(DISTRESS);
ok('when the retry is right, its reply is used and nothing is removed', calls === 2 && /someone you trust/.test(b.reply) && !(b.edits ?? []).some((e: any) => e.kind === 'removed-care'));

// Not in distress: an exercise is fine, nothing is checked.
calls = 0; says = ['Would it help to take a slow breath before you talk to your manager?'];
const c = await send('I am nervous about talking to my manager tomorrow about credit on the project.');
ok('without a distress flag the guard does not run (a breath before a hard talk is fine)', calls === 1 && /slow breath/.test(c.reply) && !(c.edits ?? []).length);

// A grounding offer in distress is kept as it is: no retry, no removal.
calls = 0; says = ['That sounds really heavy, and I am glad you said it. If you want, a slow breath or feeling your feet on the floor can help a little.'];
const g = await send(DISTRESS);
ok('in distress, a breath or grounding offer is kept, with no retry and no edit', calls === 1 && /slow breath/.test(g.reply) && !(g.edits ?? []).some((e: any) => e.kind === 'removed-care'));

// The switch, for measuring the instructions alone.
process.env.COACH_CARE_GUARD = 'off';
calls = 0; says = ['Just calm down.'];
await send(DISTRESS);
ok('COACH_CARE_GUARD=off turns it off', calls === 1);
delete process.env.COACH_CARE_GUARD;

ok('the transcript mark says what was removed and why, gives the count and not the words, and owns the stand-in sentence', /told you to calm down or not to worry, spoke as if the AI could be with you, or asked about painful thoughts/.test(editText({ after: 1, kind: 'removed-care', n: 2 })) && /removed 2 sentences/.test(editText({ after: 1, kind: 'removed-care', n: 2 })) && /the site’s own/.test(editText({ after: 1, kind: 'removed-care', n: 1 })));
const fn = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('the guard runs before the site\'s distress sentence is added, so that sentence is never touched', fn.indexOf('careProblems(reply).length) {') < fn.indexOf('reply = withDistressText('));
ok('a signed transcript accepts a proven care edit', /o\.kind !== 'removed-care'/.test(fn));
{
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  ok('the Terms list the care removal among the words the site changes', /it may take out sentences of the reply that told you to calm down or not to worry/.test(JSON.stringify(LEGAL_PARTS)));
}
