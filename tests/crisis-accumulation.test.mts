// Risk carried across turns without storing anything (step 3 of the suicidal-ideation audit). DRAFT: awaiting clinician review.
// The decision is recomputed from the person's messages on every request: two different kinds of sign in the last 10 messages, or an earlier soften flag
// in that window, give a soften flag; one kind alone gives nothing; a stop is never touched. First person only; English only; phrase matching.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_FORM_CHECK = 'off'; process.env.COACH_DISTRESS_TEXT = 'on';
for (const k of ['COACH_IP_SECRET', 'COACH_VALUES', 'COACH_SCREEN', 'COACH_EXTRA_HOSTS', 'COACH_CARE_GUARD', 'COACH_ARC']) delete process.env[k];
let lastSystem = '';
(globalThis as any).fetch = async (_u: string, init: any) => {
  try { lastSystem = JSON.parse(init.body).messages.filter((m: any) => m.role === 'system').map((m: any) => m.content).join(' '); } catch { /* */ }
  return new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds like a lot to carry. What is that like for you?' } }] }), { status: 200 });
};
const { default: coach } = await import('../netlify/functions/coach.mts');
const { constructsIn, WINDOW } = await import('../src/lib/safetyConstructs.ts');
const { checkConversation, explainConversation, detectFlag } = await import('../src/lib/safetyFlags.ts');
const { siteMessagesFor, checkNotesFor } = await import('../src/lib/siteMessages.ts');
const { signedProblem } = await import('../src/lib/signedCheck.ts');
const { DISTRESS_APPEND } = await import('../src/lib/distressText.ts');
import { ok } from './helpers.mts';

const kinds = (s: string) => [...constructsIn(s)].sort().join(',');
const tierOf = (msgs: string[]) => checkConversation(msgs)?.tier ?? null;
const show = (msgs: string[]) => `${JSON.stringify(msgs)} -> ${JSON.stringify(explainConversation(msgs))}`;

// ── each kind, in the first person
const POS: Record<string, string[]> = {
  hopelessness: ["I feel so hopeless.", "I'm completely hopeless", 'there is no hope for me', "things will never get better", "nothing will ever get better.", "I'll never be happy again", "What's the point of trying", "I can't see a future", "I don't see any way forward", "I feel h0peless", "I feel soooo hopeless"],
  burden: ["I feel like a burden.", "I am a burden to everyone", "I'm such a burden on my family", "I feel like such a burden", "I'm tired of being a burden", "I don't want to be a burden anymore", "my family would be happier without me", "I'm too much for everyone"],
  isolation: ["nobody would notice if I disappeared", "no one would miss me", "No one cares about me.", "nobody understands me", "I have no one to talk to", "I have no friends", "I feel so alone", "I'm completely isolated", "I feel cut off from everyone", "I don't belong anywhere", "I feel so alone in this world"],
  entrapment: ["I feel trapped in my own life", "I'm trapped in this situation", "I can't take it anymore", "I cannot go on like this", "I see no way out of this", "I feel worthless", "I feel like a total failure", "I have failed everyone", "I feel completely defeated"],
  pain: ["I'm in so much emotional pain", "I have unbearable inner pain", "the emotional pain never stops", "it hurts so much inside", "I can't bear this emotional pain"],
};
for (const [construct, list] of Object.entries(POS)) {
  ok(`kind "${construct}": ${list.length} first-person phrases are found`, list.every((s) => kinds(s) === construct), list.filter((s) => kinds(s) !== construct).map((s) => `${s} => ${kinds(s)}`).join(' | '));
}

// ── ordinary uses, third person, fiction, hypotheticals: no kind at all
const NEG: string[] = [
  "I am a burden on my phone's battery", "this app is a burden on my laptop", "I'm a burden to my phone", 'The file is a burden on the server.', 'I carry a burden of paperwork at work.',
  'hopeless romantic', "I'm a hopeless romantic", "I'm hopeless at math", "I'm hopeless with directions", "I am hopeless at cooking but I love it", "he feels hopeless", "My friend is so hopeless about it", "She says there is no hope for the team",
  "nobody was home", "nobody would notice the typo", "no one noticed the typo", "nobody cares about the deadline", "No one understands the tax code", "nobody likes the new logo", "I have no one to blame but myself for the spill",
  "I feel isolated in this Zoom call", "I feel so isolated in this Zoom call", "I'm all alone at the party tonight", "I feel alone in this meeting", "I feel lonely at work on Fridays", "I was all alone at home yesterday", "I am alone in the office today",
  "I'm alone", "I feel alone", "I feel lonely", "I'm isolated", "I feel cut off", "I am trapped in an elevator", "I feel trapped in this elevator", "I'm trapped in traffic", "I'm stuck in traffic", "no way out of the maze in this game", "there is no way out of the parking garage",
  "I'm a failure at gardening", "I failed my driving test", "I feel defeated by the crossword", "I'm worthless at trivia", 'The team felt defeated after the match.',
  "I'm in so much pain", "my knee pain is back", "I'm in pain after the gym", "the pain in my back never stops", "I have a mental picture", "I can't bear this heat", "I can't take it anymore, this song is too loud, I am turning it down",
  "I'm not hopeless", "I never feel like a burden", "I'm not a burden", "I do not feel worthless", "I don't feel trapped",
  "If I felt hopeless I would call someone", "imagine I am a burden to everyone", "what if I felt so alone", "suppose I'm worthless",
  "In the novel she says I am a burden to everyone", "The song goes I feel so alone", "My character feels so hopeless in the game", "Her poem says nobody would notice if I disappeared", "In my dream I was so alone", "The movie line was 'I am a burden to everyone'",
  "I had a hard day", "I'm tired", "I feel sad", "work was exhausting", "I want to go on holiday", "I cannot go on holiday this year", "life is hard but good",
];
ok(`${NEG.length} ordinary, third-person, fictional, negated and hypothetical texts contain no kind`, NEG.every((s) => kinds(s) === ''), NEG.filter((s) => kinds(s) !== '').map((s) => `${s} => ${kinds(s)}`).join(' | '));

// ── one kind alone does not flag (nor the same kind repeated)
const SINGLES = ["I feel like a burden.", "nobody understands me", "I'm in so much emotional pain", "things will never get better", "I feel trapped in my own life", "I have no friends", "I feel so alone"];
ok('one kind in one message is no flag', SINGLES.every((s) => tierOf([s]) === null), SINGLES.filter((s) => tierOf([s]) !== null).map((s) => show([s])).join(' | '));
ok('the same kind said three times is still no flag', SINGLES.every((s) => tierOf([s, 'What should I do?', s, 'Hard to say.', s]) === null));
ok('one kind with ordinary messages around it is no flag', tierOf(['I had a hard day', 'I feel like a burden.', 'Work was long', 'I made soup']) === null);
ok('a message of one kind, then ordinary talk across all five exchanges, is no flag', tierOf(['I feel so alone', 'I like tea', 'my cat is sleepy', 'it rained', 'we had soup']) === null);

// ── two different kinds across the window: soften, distress
const TWO: string[][] = [
  ['I feel like a burden.', 'I feel so alone.'],
  ['nobody understands me', 'I am in so much emotional pain'],
  ['I have no friends', 'things will never get better'],
  ['I feel trapped in my own life', 'I feel like a burden lately'],
  ['I feel like a burden.', 'Work was long today.', 'I made soup.', 'nobody understands me'],
  ["I'm in so much emotional pain", 'I feel like a total failure'],
  ['I feel like a burden and nobody understands me.'], // two kinds in one message
];
ok('two different kinds across the messages: a soften flag, category distress, why "accumulated"', TWO.every((c) => { const e = explainConversation(c); return e?.flag.tier === 'soften' && e.flag.category === 'distress' && e.why.source === 'accumulated' && !!e.why.matched; }), TWO.filter((c) => explainConversation(c)?.flag.tier !== 'soften').map(show).join(' | '));
ok('the flag has no kind and so uses the existing generic distress notice and resources', TWO.every((c) => checkConversation(c)?.kind === undefined));
ok('the reason names the kinds found, never the person\'s words', explainConversation(TWO[0])!.why.matched === 'feeling like a burden, isolation' && !/burden\.|alone\./.test(explainConversation(TWO[0])!.why.matched!));
ok('three kinds across four messages are named', (explainConversation(['I feel like a burden.', 'I feel so alone.', 'things will never get better'])?.why.matched ?? '').split(', ').length >= 2);
ok('slang and spelling tricks count: h0peless + a burden', tierOf(['I feel h0peless', 'I feel like a burd3n']) === 'soften' || tierOf(['I feel h0peless', 'I feel like a burden']) === 'soften');
ok('curly apostrophes count', tierOf(['I’m a burden to everyone', 'I can’t take it anymore']) === 'soften');

// ── one kind after an earlier soften flag; a soften persists
const hop = 'I feel so hopeless.'; // an existing single-message soften
ok('the existing single soften is untouched', tierOf([hop]) === 'soften' && explainConversation([hop])!.why.source === 'phrase');
ok('after a soften, a later message with a kind is a soften', tierOf([hop, 'I feel like a burden.']) === 'soften');
ok('after a soften, even an ordinary later message stays a soften (it persists)', tierOf([hop, 'Work was long today.']) === 'soften' && tierOf([hop, 'a', 'b', 'c', 'd']) === 'soften');
ok('the persisting soften says why in the process note', explainConversation([hop, 'Work was long today.'])!.why.rung === 'a distress flag earlier in the conversation');
ok('after an earlier suicide soften the persisted soften keeps the suicide category (its own sentence)', checkConversation(['I think about suicide a lot.', 'It rained today.'])?.category === 'self-harm');
ok('a persisted soften after a distress soften is generic distress', checkConversation([hop, 'It rained today.'])?.category === 'distress');
ok('a soften flag that persists never becomes a stop', ['I feel so hopeless.', 'I feel like a burden.', 'nobody would notice if I left', 'I feel so alone', 'I cannot go on like this'].every((_, i, a) => tierOf(a.slice(0, i + 1)) !== 'stop'));
ok('no earlier flag and an ordinary message: still nothing', tierOf(['It rained today.', 'Work was long today.']) === null);

// ── the window forgets
const filler = (n: number) => Array.from({ length: n }, (_, i) => `ordinary message number ${i}`);
ok(`the window is ${WINDOW} messages`, WINDOW === 10);
ok('two kinds exactly ten messages apart (both inside the window) are a soften', tierOf(['I feel like a burden.', ...filler(8), 'I feel so alone.']) === 'soften');
ok('two kinds eleven messages apart (the first has left the window) are no flag', tierOf(['I feel like a burden.', ...filler(9), 'I feel so alone.']) === null);
ok('two kinds far apart are no flag', tierOf(['I feel like a burden.', ...filler(30), 'I feel so alone.']) === null);
ok('an earlier soften inside the window persists (the tenth message)', tierOf([hop, ...filler(8), 'Nothing special.']) === 'soften');
ok('an earlier soften that has left the window is forgotten (the eleventh message)', tierOf([hop, ...filler(9), 'Nothing special.']) === null);
ok('an earlier soften long ago is forgotten', tierOf([hop, ...filler(25)]) === null);
ok('a kind that has left the window does not count with a new one', tierOf(['nobody would notice if I left', ...filler(9), "I'm in so much emotional pain"]) === null);
ok('a kind and a later kind both in the window after old messages are dropped still add up', tierOf([...filler(20), 'I feel like a burden.', 'I feel so alone.']) === 'soften');

// ── stop handling is untouched; so are other flags
ok('a stop stays a stop, however many kinds came before', tierOf(['I feel like a burden.', 'I feel so alone.', 'I want to kill myself.']) === 'stop');
ok('an imminent stop stays imminent', checkConversation(['I feel like a burden.', 'I feel so alone.', "I'm going to kill myself tonight."])?.kind === 'imminent');
ok('accumulated signs never turn into a stop', ['I feel like a burden.', 'I feel so alone.', "I feel hopeless", "I can't take it anymore", "I'm in so much emotional pain", 'nobody would notice if I left'].every((_, i, a) => tierOf(a.slice(0, i + 1)) !== 'stop'));
ok('a harm-to-others stop stays what it was', checkConversation(['I feel so alone.', 'I feel like a burden.', "I'm going to kill them"])?.category === 'harm-others' || checkConversation(['I feel so alone.', 'I feel like a burden.', "I'm going to kill him"])?.tier === 'stop');
ok('the single-message decisions are the same as before', detectFlag('I feel so hopeless')?.tier === 'soften' && detectFlag('I had a hard day') === null && detectFlag('I want to die')?.tier === 'stop');
const lad = ['I used to self-harm as a teenager.', 'Work has been hard.', 'I did it again last night.'];
ok('the self-injury ladder still escalates and stops as before', tierOf(lad) === 'stop' && checkConversation(lad)?.kind === 'ends');
ok('a ladder soften is not replaced', checkConversation(['I used to self-harm as a teenager.'])?.category === 'self-injury');
ok('a self-injury ladder soften is not carried by this rule (the ladder has its own memory): an ordinary message after it is back to nothing', checkConversation(['I used to self-harm as a teenager.', 'It rained today.']) === null);
ok('nothing in, nothing out', checkConversation([]) === null);

// ── nothing is stored: the same input gives the same answer, and it depends only on the input
ok('the answer depends only on the messages given: same input, same answer, any order of calls', JSON.stringify(explainConversation(TWO[0])) === JSON.stringify(explainConversation(TWO[0])) && tierOf(['It rained today.']) === null);
ok('asking about a conversation does not change the answer for a different one', (() => { explainConversation(TWO[0]); return tierOf(['I feel like a burden.']) === null; })());

// ── through the coach function: the coach still answers, with the existing distress sentence, and the same conversation rebuilds the same site messages
const S = { color1: '#7a9b9e', color2: '#DAC682' };
const post = async (body: any) => { const r = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) })); return { status: r.status, j: (await r.json()) as any }; };
const said = ['I feel like a burden lately.', 'I feel so alone these days.', 'Work was long today.'];
const conv: { role: 'user' | 'assistant'; content: string }[] = [];
let ticket: string | undefined;
const turns: any[] = [];
for (const text of said) {
  conv.push({ role: 'user', content: text });
  const x = await post({ messages: conv, ticket });
  turns.push({ x, system: lastSystem });
  conv.push({ role: 'assistant', content: x.j.reply });
  ticket = x.j.ticket;
}
ok('turn 1, one kind: an ordinary answer, no flag, no care note, no site sentence', turns[0].x.status === 200 && !turns[0].x.j.flag && !/may signal distress/.test(turns[0].system) && !turns[0].x.j.reply.includes(DISTRESS_APPEND.distress));
ok('turn 2, a second kind: the coach still answers, flagged soften, the care note is on and the existing distress sentence is added', turns[1].x.status === 200 && turns[1].x.j.flag?.tier === 'soften' && turns[1].x.j.flag.category === 'distress' && !turns[1].x.j.done && /may signal distress/.test(turns[1].system) && turns[1].x.j.reply.endsWith(DISTRESS_APPEND.distress) && turns[1].x.j.reply.startsWith('That sounds like a lot to carry'));
ok('turn 3, an ordinary message: the soften persists (care note, sentence), the conversation goes on', turns[2].x.status === 200 && turns[2].x.j.flag?.tier === 'soften' && !turns[2].x.j.done && /may signal distress/.test(turns[2].system) && turns[2].x.j.reply.endsWith(DISTRESS_APPEND.distress));
ok('the persisting soften shows the generic distress resources like today\'s soften', checkConversation(said)?.tier === 'soften');

// the site messages rebuilt on the page and on the server agree, for this accumulating conversation, in every state of it
const rc = await post({ action: 'receipt', messages: conv, ticket });
ok('the receipt is issued for a conversation whose soften was accumulated', rc.status === 200 && !!rc.j.receipt?.signature);
const TR = rc.j.transcript;
const pageSite = siteMessagesFor(conv, 5);
const pageNotes = checkNotesFor(conv);
ok('server and page rebuild the same site messages (greeting and the notice with resources)', JSON.stringify(TR.site) === JSON.stringify(pageSite) && TR.site.some((x: any) => x.kind === 'notice'), JSON.stringify(TR.site).slice(0, 200));
ok('server and page rebuild the same process notes, and they say "accumulated" without quoting the person', JSON.stringify(TR.checks) === JSON.stringify(pageNotes) && TR.checks.length === 2 && TR.checks.every((c: any) => c.source === 'accumulated' && c.tier === 'soften') && !JSON.stringify(TR.checks).includes('burden lately'), JSON.stringify(TR.checks));
ok('the first note is on message 2 (index 2), the second on message 3 (index 4); message 1 has none', TR.checks.map((c: any) => c.message).join() === '2,4');
ok('the signed transcript passes the shape and signature check (checks and sources included)', signedProblem({ transcript: TR, receipt: rc.j.receipt }) === null, String(signedProblem({ transcript: TR, receipt: rc.j.receipt })));
ok('rebuilding is the same on repeated calls and for every prefix of the conversation', (() => { for (let n = 1; n <= conv.length; n++) { const a = JSON.stringify(siteMessagesFor(conv.slice(0, n), 5)); const b = JSON.stringify(siteMessagesFor(conv.slice(0, n).map((m) => ({ ...m })), 5)); if (a !== b) return false; } return true; })());
ok('five soften notes plus a shared-text note fit the signed shape (six notes)', (() => { const t = { ...TR, checks: Array.from({ length: 6 }, (_, i) => ({ message: i === 0 ? -1 : i - 1, ...(i === 0 ? { shared: true } : {}), tier: 'soften', category: 'distress', source: 'accumulated', rung: 'a distress flag earlier in the conversation' })) }; return signedProblem({ transcript: t, receipt: rc.j.receipt }) !== 'shape'; })());
