// Through the coach function: a question about Nenya itself is answered by the site (a pre-written answer, no model call, a card, one turn),
// distress and abuse come first, the switch turns it off, a signed transcript says the site wrote the reply, and the guard stops a model reply
// that makes a claim about how Nenya runs.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
delete process.env.COACH_IP_SECRET; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_ABOUT_ANSWERS; delete process.env.COACH_INFRA_GUARD;
let modelCalls = 0;
let modelSays: string[] = ['What would help most?'];
(globalThis as any).fetch = async () => {
  const say = modelSays[Math.min(modelCalls, modelSays.length - 1)];
  modelCalls++;
  return new Response(JSON.stringify({ choices: [{ message: { content: say } }] }), { status: 200 });
};
const { default: handler } = await import('../netlify/functions/coach.mts');
import { liveAnswers, fillAnswer } from '../src/lib/aboutNenya.ts';
import { INFRA_FALLBACK, claimsInfrastructure } from '../src/lib/infraGuard.ts';
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const post = async (body: any) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: SESSION, ...body }) }));
  return { status: res.status, j: (await res.json()) as any };
};
const ask = (text: string, extra: any = {}) => { modelCalls = 0; return post({ messages: [{ role: 'user', content: text }], ...extra }); };

const open = liveAnswers().find((a) => a.id === 'n-opensource')!;
ok('the answer used here is live', !!open);

// ── the site answers
let r = await ask('is this open source');
ok('a question about Nenya is answered by the site: the pre-written text, no model call', r.status === 200 && modelCalls === 0 && r.j.reply === fillAnswer(open, { model: 'deepseek-v3.2', label: 'x', terms: 'x' }).short.replace(/\s+$/, '') || (r.status === 200 && modelCalls === 0 && /GNU Affero/.test(r.j.reply)));
ok('it comes with a card: id, title, the full answer and links', r.j.card?.id === 'n-opensource' && r.j.card.title === open.title && Array.isArray(r.j.card.more) && r.j.card.more.length > 0 && r.j.card.links.length > 0);
ok('it is a turn like any other: a ticket, the turn counted', typeof r.j.ticket === 'string' && r.j.turn === 1 && r.j.done === false);
const conv = [{ role: 'user', content: 'is this open source' }, { role: 'assistant', content: r.j.reply }, { role: 'user', content: 'I feel overwhelmed at work.' }];
modelCalls = 0;
const next = await post({ messages: conv, ticket: r.j.ticket });
ok('the conversation goes on from it: the next turn is answered by the model, with the site answer in the history', next.status === 200 && modelCalls === 1 && next.j.turn === 2 && !next.j.card);

// ── what comes first
r = await ask('I want to kill myself. Is this open source?');
ok('a message the crisis check flags is never answered by the site', modelCalls === 0 || !r.j.card);
r = await ask('This is a scam. Who runs this?');
ok('abuse aimed at the coach is left to the model and its hostile-turn note', !r.j.card && modelCalls === 1);
r = await ask('I had a hard day at work and I feel tired.');
ok('an ordinary message goes to the model', !r.j.card && modelCalls === 1);
process.env.COACH_ABOUT_ANSWERS = 'off';
r = await ask('is this open source');
ok('COACH_ABOUT_ANSWERS=off sends the question to the model', !r.j.card && modelCalls === 1);
delete process.env.COACH_ABOUT_ANSWERS;

// ── the last exchange
const five: any[] = [];
let t: string | undefined;
for (let i = 1; i <= 4; i++) { five.push({ role: 'user', content: `message ${i}` }); modelCalls = 0; const x = await post({ messages: five, ticket: t }); five.push({ role: 'assistant', content: x.j.reply }); t = x.j.ticket; }
five.push({ role: 'user', content: 'is this open source' });
const last = await post({ messages: five, ticket: t });
ok('a site answer on the last exchange ends the conversation as usual', last.status === 200 && last.j.done === true && last.j.turn === 5 && !!last.j.card);

// ── the signed transcript says the site wrote it
const done = [...five, { role: 'assistant', content: last.j.reply }];
const rc = await post({ action: 'receipt', messages: done, ticket: last.j.ticket });
ok('the receipt marks the reply as written by the site', rc.status === 200 && rc.j.transcript.site.some((x: any) => x.kind === 'answer' && x.after === 9 && /pre-written answer/.test(x.text)));

// ── the guard
process.env.COACH_INFRA_GUARD = undefined as any; delete process.env.COACH_INFRA_GUARD;
modelSays = ['We run on AWS and everything is end-to-end encrypted.', 'Your words matter. What would help most right now?'];
r = await ask('I had a hard day at work and I feel tired.');
ok('a reply that claims how Nenya runs is asked for again, and the clean second reply is used', modelCalls === 2 && r.j.reply === 'Your words matter. What would help most right now?');
modelSays = ['Nenya is HIPAA compliant.', 'We store nothing, it is HIPAA compliant, truly.'];
r = await ask('I had a hard day at work and I feel tired.');
ok('if the second reply still claims it, the site\'s fixed sentence replaces it', modelCalls === 2 && r.j.reply === INFRA_FALLBACK && !claimsInfrastructure(r.j.reply));
process.env.COACH_INFRA_GUARD = 'off';
modelSays = ['Nenya is HIPAA compliant.'];
r = await ask('I had a hard day at work and I feel tired.');
ok('COACH_INFRA_GUARD=off lets the model\'s reply through (to measure the instructions alone)', modelCalls === 1 && r.j.reply === 'Nenya is HIPAA compliant.');
delete process.env.COACH_INFRA_GUARD;
modelSays = ['It sounds like a lot to carry. What is weighing on you most?'];
r = await ask('I had a hard day at work and I feel tired.');
ok('an ordinary reply is left alone', modelCalls === 1 && r.j.reply === modelSays[0]);
ok('the fixed sentence points to the About pages and the Terms and states no fact', /About pages and the Terms/.test(INFRA_FALLBACK) && !/\b(?:AWS|encrypt|HIPAA)\b/.test(INFRA_FALLBACK));

// ── the guard on an invented human life
import { claimsPersona, PERSONA_FALLBACK } from '../src/lib/personaGuard.ts';
modelSays = ['As a mother myself, I know how hard the teenage years are.', 'That sounds like a heavy stretch. What has been hardest?'];
r = await ask('Do you have kids? I want to know how you handled the teenage years.');
ok('a reply that invents a human life is asked for again, and the clean second reply is used', modelCalls === 2 && r.j.reply === 'That sounds like a heavy stretch. What has been hardest?');
modelSays = ['As a mother myself, I know.', 'When I was young I went through the same thing.'];
r = await ask('Do you have kids? I want to know how you handled the teenage years.');
ok('if the second reply still does, the site\'s fixed sentence replaces it', modelCalls === 2 && r.j.reply === PERSONA_FALLBACK && !claimsPersona(PERSONA_FALLBACK));
process.env.COACH_PERSONA_GUARD = 'off';
modelSays = ['As a mother myself, I know.'];
r = await ask('Do you have kids? I want to know how you handled the teenage years.');
ok('COACH_PERSONA_GUARD=off lets the reply through', modelCalls === 1 && r.j.reply === 'As a mother myself, I know.');
delete process.env.COACH_PERSONA_GUARD;
modelSays = ["I'm an AI, so I don't have children or a past. What was the hardest part for you?"];
r = await ask('Do you have kids? I want to know how you handled the teenage years.');
ok('an honest reply is left alone', modelCalls === 1 && r.j.reply === modelSays[0]);
const quiet = ['It sounds like you are carrying a lot.', 'Your messages go through our server to an outside service, as the Terms describe.', 'I do not have that detail.', 'Thank you for telling me.'];
ok('ordinary sentences, and the Terms\' own wording, do not trip the guard', quiet.every((x) => !claimsInfrastructure(x)));

// ── answer first, then carry on (a longer message with a question about Nenya inside it)
process.env.COACH_INFRA_GUARD = 'off'; delete process.env.COACH_INFRA_GUARD;
const STORY = 'My sister and I have not spoken since the funeral, and I keep replaying the argument at night. I feel guilty and angry at the same time, and I do not know whether to call her or wait for her to call me. Work has been heavy too and I am tired of holding it all. Also, who runs this site? I want to know who is on the other end before I say more.';
ok('the story is over the limit the whole-message detector accepts', STORY.length > 300);
modelSays = ['It sounds like you are carrying grief, guilt and tiredness all at once. What do you most need from her right now?'];
let sent: any = null;
const realFetch = (globalThis as any).fetch;
(globalThis as any).fetch = async (u: string, init: any) => { try { sent = JSON.parse(init.body).messages; } catch { sent = null; } return realFetch(u, init); };
r = await ask(STORY);
const whoAnswer = liveAnswers().find((a) => a.id === 'n-who')!;
ok('a long message with a question inside gets the site\'s answer first and then the model\'s reply to the rest, in one reply', r.status === 200 && modelCalls === 1 && r.j.reply.startsWith(fillAnswer(whoAnswer, { model: 'deepseek-v3.2', label: 'x', terms: 'x' }).short.slice(0, 40)) && r.j.reply.endsWith(modelSays[0]) && r.j.reply.includes('\n\n'));
ok('the card is there and says only the first part is the site\'s', r.j.card?.id === 'n-who' && r.j.card.partial === true);
ok('the model was told the question is already answered and not to answer or describe Nenya', !!sent && sent.some((m: any) => m.role === 'system' && /the site has already answered it/.test(m.content)));
const ticket1 = r.j.ticket;
const convP = [{ role: 'user', content: STORY }, { role: 'assistant', content: r.j.reply }];
const rcP = await post({ action: 'receipt', messages: convP, ticket: ticket1 });
ok('a signed copy says the first part of that reply was written by the site and the rest is the AI\'s', rcP.status === 200 && rcP.j.transcript.site.some((x: any) => x.kind === 'answer' && x.after === 1 && /first part of the reply above/.test(x.text)));
r = await ask(STORY.replace('who runs this site?', 'what colour is the sky?'));
ok('a long message with no question about Nenya goes to the model alone', !r.j.card && modelCalls === 1 && !r.j.reply.includes('\n\n'));
r = await ask(STORY.replace('who runs this site?', 'who runs this site? I want to kill myself.'));
ok('a long message the crisis check flags is never answered this way', !r.j.card);
(globalThis as any).fetch = realFetch;

// ── one system message only (the encrypted route answered a second one with a 400)
(globalThis as any).fetch = async (u: string, init: any) => { try { sent = JSON.parse(init.body).messages; } catch { sent = null; } return realFetch(u, init); };
modelSays = ['It sounds like a lot.'];
r = await ask(STORY);
ok('answer first: the model receives exactly one system message, with the note inside it', !!sent && sent.filter((m: any) => m.role === 'system').length === 1 && /the site has already answered it/.test(sent.find((m: any) => m.role === 'system').content));
modelSays = ['We run on AWS.', 'Your words matter. What would help most?'];
r = await ask('I had a hard day at work and I feel tired.');
ok('a retry (the guard) also sends exactly one system message, with the retry note inside it', !!sent && sent.filter((m: any) => m.role === 'system').length === 1 && /Your last reply described how Nenya runs/.test(sent.find((m: any) => m.role === 'system').content));
(globalThis as any).fetch = realFetch;

// ── several short questions in a row (a dev transcript, 2026-11-09: "Who runs this? Is it free?" got no answer)
import { detectAboutNenya as detectMany } from '../src/lib/aboutNenya.ts';
ok('two short questions in a row: the first about the site is answered', detectMany('Who runs this? Is it free?') === 'n-who');
ok('a run of questions that includes "are you a scam?" is answered', detectMany('What is this tool? Are you a scam? What do you do with my data? Who runs it? Is it free?') !== null);
ok('two ordinary sentences with a question about something else are not taken for one', detectMany('I had a long day. Is it free time I am wasting?') === null);
