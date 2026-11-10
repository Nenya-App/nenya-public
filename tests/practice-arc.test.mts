// The practice arc (COACH_ARC=practice): the person does the naming; the coach asks. Off by default.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.COACH_ABOUT_ANSWERS = 'off';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET;
delete process.env.COACH_SIGNING_KEY;
delete process.env.COACH_INSTRUCTIONS;
delete process.env.COACH_ARC;
let sent: any[] = [];
(globalThis as any).fetch = async (_u: string, init: any) => { sent.push(JSON.parse(init.body).messages); return new Response(JSON.stringify({ choices: [{ message: { content: 'Thank you for telling me. What word fits closest?' } }] }), { status: 200, headers: { 'content-type': 'application/json' } }); };
const { default: handler, __instructionsFingerprint } = await import('../netlify/functions/coach.mts');
const { arcProblems, isStuck, isWordsOnly, practiceArcOn, arcTurnLine } = await import('../src/lib/practiceArc.ts');
const { FEELINGS_MET, FEELINGS_UNMET, NEEDS, wordsOf, filterGroups, addWordToDraft, phraseFor, CNVC_CREDIT } = await import('../src/lib/feelingsNeeds.ts');
import { ok } from './helpers.mts';

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
async function systemFor(messages: any[]) {
  sent = [];
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: SESSION }) }));
  const j: any = await res.json();
  return { system: (sent[0] ?? []).filter((m: any) => m.role === 'system').map((m: any) => m.content).join(' '), json: j };
}
// Build a conversation of n finished exchanges ending in a user message, by walking the ticketed API.
async function conv(texts: string[]) {
  let history: any[] = [];
  let ticket: string | undefined;
  let last: any;
  for (const t of texts) {
    history = [...history, { role: 'user', content: t }];
    sent = [];
    const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: history, session: SESSION, ...(ticket ? { ticket } : {}) }) }));
    const j: any = await res.json();
    last = { system: (sent[0] ?? []).filter((m: any) => m.role === 'system').map((m: any) => m.content).join(' '), json: j };
    ticket = j.ticket;
    history = [...history, { role: 'assistant', content: j.reply }];
  }
  return last;
}

// ---- off by default: the live wording is untouched
const fpOff = __instructionsFingerprint();
const off = await systemFor([{ role: 'user', content: 'My manager ignored my idea again in the meeting.' }]);
ok('off by default: the coach is still told to name the feeling or need underneath', off.system.includes('name the feeling or need underneath') && !off.system.includes('practice at finding words'));
ok('the switch is exactly COACH_ARC=practice', practiceArcOn('practice') && !practiceArcOn('on') && !practiceArcOn(undefined));

// ---- on
process.env.COACH_ARC = 'practice';
const fpOn = __instructionsFingerprint();
ok('turning it on changes the signed instructions fingerprint', fpOn !== fpOff);
const t1 = await systemFor([{ role: 'user', content: 'My manager ignored my idea again in the meeting.' }]);
ok('exchange 1: the person does the finding, the coach does not name the feeling, and says a miss is useful', t1.system.includes('Do not name their feeling or need for them') && /a guess that misses is still useful/.test(t1.system) && t1.system.includes('Exchange 1 of the practice'));
ok('the old "name the feeling or need underneath" line is gone while the arc is on', !t1.system.includes('name the feeling or need underneath'));
ok('every guess is a question, and the coach does not list words (the page does)', /Phrase every guess as a question/.test(t1.system) && /do not list words yourself/.test(t1.system));
ok('met needs are asked about, not only unmet ones', /which need is being met, even a little/.test(t1.system));
ok('not stuck: no menu instruction', !t1.system.includes('Offer two or three possible words'));
const stuck = await conv(['Something happened with my sister.', "I don't know"]);
ok('after "I don\'t know": a menu of two or three words as options, none stated as fact', stuck.system.includes('Offer two or three possible words as options') && stuck.system.includes('Never state one word as fact about them'));
const t4 = await conv(['a', 'b', 'c', 'd'].map((x) => `It was hard at work, part ${x}.`));
ok('exchange 4: one question about a request; the other person\'s side is an option they can decline, with a caution (not a gate)', t4.system.includes('Exchange 4 of the practice') && /as something they can decline/.test(t4.system) && /they owe no one understanding/.test(t4.system) && !/do not ask this when/.test(t4.system));
const t5 = await conv(['a', 'b', 'c', 'd', 'e'].map((x) => `It was hard at work, part ${x}.`));
ok('exchange 5: only their own words come back, no new feeling or need word', /in their own words only/.test(t5.system) && /Add no new feeling or need word of your own/.test(t5.system) && !t5.system.includes('name the feeling or need underneath'));

// ---- steps aside
const distress = await systemFor([{ role: 'user', content: 'I have been thinking about suicide.' }]);
ok('a message flagged for distress gets the care note and not the practice', !distress.system.includes('practice at finding words'));
const abuse = await systemFor([{ role: 'user', content: 'You are a useless stupid piece of garbage.' }]);
ok('hostility aimed at the coach: the arc steps aside', !abuse.system.includes('practice at finding words'));

// ---- stuck detection
for (const t of ["I don't know", 'idk', 'no idea', "I can't name it", 'I dont really know what I feel', "I have no words for it", 'not sure']) ok(`stuck: ${t}`, isStuck(t));
for (const t of ['I feel worried about it', 'My boss knows what he did', 'Nothing is wrong, just tired']) ok(`not stuck: ${t}`, !isStuck(t));

// ---- checks on a reply
const U1 = ['My manager ignored my idea again in the meeting.'];
const P = (r: string, turn: number, userTexts: string[]) => arcProblems(r, { turn, max: 5, userTexts }).map((p) => p.check);
ok('good exchange-1 reply passes', P('That sounds like a frustrating meeting. When you think of it now, what word comes closest to what you feel? A guess that misses is fine.', 1, U1).length === 0);
ok('naming the feeling for them is caught', P("It sounds like you're feeling dismissed and angry. What happened next?", 1, U1).includes('namesForThem'));
ok('"you feel" and "you need" statements are caught', P('You feel unseen. What would help?', 2, U1).includes('namesForThem') && P('You need respect here. Does that fit?', 2, U1).includes('namesForThem'));
ok('a question that asks is not flagged', P('Do you feel dismissed, or is it something else?', 2, U1).length === 0);
ok('no question on an early exchange is caught', P('That sounds like a hard meeting.', 1, U1).includes('noQuestion'));
ok('a list of words in the reply is caught', P('Is it angry, sad, scared, lonely, tired or hurt?', 2, U1).includes('wordList'));
const STUCK_T = ['Something happened with my sister.', "I don't know"];
ok('stuck and a menu of three: passes', P('That is hard to name. It might be closer to drained, numb or overwhelmed, or something else. Does any fit?', 2, STUCK_T).length === 0);
ok('stuck and no words offered: caught', P('Take your time. What comes up when you think of it?', 2, STUCK_T).includes('noMenu'));
ok('stuck and a long list: caught', P('Is it drained, numb, overwhelmed, sad, lonely, tired or hurt?', 2, STUCK_T).includes('wordList'));
ok('close: a question is caught', P('You said you felt worried. Does that help?', 5, ['I felt worried']).includes('questionOnClose'));
ok('close: a new word the person never used is caught', P('You said it was hard. That sad part is yours to keep.', 5, ['I felt worried and it was a hard day']).includes('newWords'));
ok('close: their own words only passes', P('You said you felt worried, and that it was a hard day. That is yours to keep.', 5, ['I felt worried and it was a hard day']).length === 0);

// ---- the arc lines
ok('exchange lines exist for 1 to 4, none for the close', [1, 2, 3, 4].every((t) => arcTurnLine(t, 5, false).length > 20) && arcTurnLine(5, 5, false) === '');

// ---- the word lists
const feel = wordsOf('feeling'), need = wordsOf('need');
ok('the lists are the inventory: 11 feeling families when met, 14 when not, 7 need families', FEELINGS_MET.length === 11 && FEELINGS_UNMET.length === 14 && NEEDS.length === 7);
ok('no word is empty, upper case, or has stray spaces', [...feel, ...need].every((w) => w.length > 0 && w === w.toLowerCase() && w === w.trim()));
ok('known words are present', ['worried', 'overwhelmed', 'grateful', 'jittery', 'nervous', 'burnt out'].filter((w) => !feel.includes(w) && w !== 'grateful').length === 0 && feel.includes('thankful') && need.includes('to see and be seen') && need.includes('rest/sleep') && need.includes('safety'));
ok('the credit line is CNVC\'s exact line', CNVC_CREDIT === 'The Center for Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org');
ok('search narrows by letters or family and drops empty groups', filterGroups(FEELINGS_UNMET, 'wor').every((x) => x.words.length > 0) && filterGroups(FEELINGS_UNMET, 'wor').some((x) => x.words.includes('worried')) && filterGroups(NEEDS, 'zzzz').length === 0 && filterGroups(FEELINGS_UNMET, 'sad').some((x) => x.family === 'Sad'));
ok('a picked word adds an editable sentence to the draft', addWordToDraft('', 'feeling', 'worried', 500) === 'I might be feeling worried.' && addWordToDraft('It was hard.', 'need', 'support', 500) === 'It was hard. I might need support.');
ok('a pick that would pass the limit leaves the draft as it was', addWordToDraft('x'.repeat(490), 'feeling', 'overwhelmed', 500) === 'x'.repeat(490));
ok('phrase for needs and feelings', phraseFor('need', 'rest/sleep') === 'I might need rest/sleep.' && phraseFor('feeling', 'hurt') === 'I might be feeling hurt.');

// ---- a first message that is only picked words
const W = 'I might be feeling apprehensive. I might need affection. I might need stability. I might need nurturing.';
ok('only picked words: recognized', isWordsOnly(W) && isWordsOnly('I might be feeling worried.') && isWordsOnly('worried, lonely and tired'));
ok('words with a situation are not "only words"', !isWordsOnly('I might be feeling worried. My boss ignored me today.') && !isWordsOnly('My manager ignored my idea.') && !isWordsOnly('') && !isWordsOnly('hello'));
const wo = await systemFor([{ role: 'user', content: W }]);
ok('only picked words: the coach is told not to echo them or ask if they meant them, to thank them and offer three ways on, and to name no word itself', wo.system.includes('Do not repeat their words back as a list') && wo.system.includes('do not ask whether those are the words they meant') && wo.system.includes('tell you a little of what is going on') && wo.system.includes('a helpful way to spend this time') && wo.system.includes('work out a request') && wo.system.includes('do not name any feeling or need yourself'));
ok('the other person\'s side is offered only if it feels okay, and never as excusing', /only if that feels okay, and that it is never about excusing what happened/.test(wo.system));
ok('a message with a situation does not get that note', !t1.system.includes('Do not repeat their words back as a list'));
const echo = "It sounds like you're experiencing a mix of feelings and needs. Could apprehensive be one of the words you're using? And is affection one that matters right now?";
ok('the echo from the real transcript is caught', P(echo, 1, [W]).includes('echoesWords'));
ok('a good reply to picked words passes', P('Thank you for finding those words; they give us something to work with. Would you like to tell me a little of what is going on, think about how to spend this time, or work out a request?', 1, [W]).length === 0);
