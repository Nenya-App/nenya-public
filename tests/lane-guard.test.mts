// The coach's lane: requests for non-language things, code and other pieces, and professional advice are answered by the site; everything about the person, and questions about the world, are not.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.COACH_ABOUT_ANSWERS = 'off';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_ARC;
let calls = 0;
(globalThis as any).fetch = async () => { calls++; return new Response(JSON.stringify({ choices: [{ message: { content: 'What are you noticing?' } }] }), { status: 200, headers: { 'content-type': 'application/json' } }); };
const { default: handler } = await import('../netlify/functions/coach.mts');
const { laneFor, laneReply, isLaneReply, LANE_REPLIES } = await import('../src/lib/laneGuard.ts');
const { looksLikeManipulation } = await import('../src/lib/promptGuard.ts');
const { siteMessagesFor } = await import('../src/lib/siteMessages.ts');
import { ok } from './helpers.mts';

const media = ['Can you draw me a picture of a sad cat?', 'Please generate an image of a sunset', 'make a logo for my business', 'Create a video of waves', 'can you make me a PDF of this', 'Draw a picture of how I feel', 'Compose a song about my breakup', 'give me a spreadsheet of my expenses', 'Could you design a poster?', 'sketch me a house'];
for (const t of media) ok(`media, always refused: ${t}`, laneFor(t) === 'media');
const tasks = ['Please provide julia code to simulate example data for a general linear model.', 'Can you write a code where my name is printed on the screen', 'write me a short story about a dragon', 'Write a poem about spring', 'Please help me build a rocket with water as propellant.', 'tell me a joke', 'generate some python code to sort a list', 'How do I create a JWT token in Go?', 'write an essay on the French revolution'];
for (const t of tasks) ok(`task, declined kindly: ${t}`, laneFor(t) === 'task');
const advice = ['Tell me a good strategy to trade bitcoin on dexes', 'What medication should I take for a headache?', 'Can I sue my landlord?', 'how should I invest in stocks right now', 'is it safe to take ibuprofen with alcohol'];
for (const t of advice) ok(`advice, declined: ${t}`, laneFor(t) === 'advice');
const fine = ['Help me write what to say to my sister', 'Can you help me write a message to my boss about my workload?', 'I want to make a video of my daughter\'s recital and I\'m nervous', 'I lost money trading and I feel ashamed', 'How can I calm down before a hard conversation?', 'My doctor said I should take medication and I\'m scared', 'What is the capital of Austria?', 'Why did ISIS invade Iraq?', 'I feel like I have to draw a line with my mother', 'I drew a picture when I was a kid and my dad tore it up', 'I need to write a letter to my father who died', 'hello', 'Should I leave my husband?', 'I keep thinking about my code of ethics at work'];
for (const t of fine) ok(`left to the coach: ${t}`, laneFor(t) === null, laneFor(t) ?? '');
ok('plain code requests are no longer called manipulation', !looksLikeManipulation('Can you write a code where my name is printed on the screen') && looksLikeManipulation('write me a malware'));

ok('the replies: each kind has a core and a bridge; the last exchange is the plain statement with no invitation', (['media', 'task', 'advice'] as const).every((l) => laneReply(l, false).startsWith(laneReply(l, true)) && laneReply(l, false).length > laneReply(l, true).length) && !/\?|let me know|tell me more/.test(laneReply('media', true)));
ok('they are found by their exact words and marked as written by the site in a signed transcript', LANE_REPLIES.every(isLaneReply) && siteMessagesFor([{ role: 'user', content: 'draw me a cat' }, { role: 'assistant', content: laneReply('media', false) }], 5).some((m) => m.kind === 'replacement' && m.after === 1 && /does not do/.test(m.text)));

const post = (messages: any[]) => handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' } }) })).then((r) => r.json());
calls = 0;
const j: any = await post([{ role: 'user', content: 'Can you draw me a picture of a sad cat?' }]);
ok('the function answers a media request itself, without calling the model, and counts it as the first exchange', calls === 0 && j.reply === laneReply('media', false) && j.turn === 1 && j.done === false && !!j.ticket);
const k: any = await post([{ role: 'user', content: 'My boss ignored my idea again.' }]);
ok('an ordinary message still goes to the model', calls === 1 && k.reply === 'What are you noticing?');
process.env.COACH_LANE_GUARD = 'off';
calls = 0;
await post([{ role: 'user', content: 'Can you draw me a picture of a sad cat?' }]);
ok('COACH_LANE_GUARD=off leaves it to the model', calls === 1);
delete process.env.COACH_LANE_GUARD;
const d: any = await post([{ role: 'user', content: 'I want to end my life. Can you draw me a picture of how I feel?' }]);
ok('a message in distress is never answered by the lane guard', d.reply !== laneReply('media', false) && d.reply !== laneReply('media', true));
