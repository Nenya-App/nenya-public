// The seven coaching-move modules added 2026-11-22: when each is chosen, and when lookalikes must not choose it. All messages are invented.
// The module text is private and is not in this repository; the size check uses stand-in text.
import { selectModules, buildNotes, MODULE_IDS, MODULE_GROUPS, type ModuleSet } from '../src/lib/coachModules.ts';
import { ok } from './helpers.mts';

const must: Record<string, string[]> = {
  offer_a_smaller_step: [
    "I'm overwhelmed and I don't know what to say next.",
    'Honestly I feel overwhelmed by all of this.',
    "This is too much for me right now.",
    "It's all too much today.",
    "I'm so tired and I can't keep doing this.",
    "I'm too tired to think about this any more tonight.",
    "I don't want to go any deeper into this right now.",
    "I'd rather not go into that today.",
    "I need a break from this for now.",
    "Can we pause here? I'm completely overwhelmed.",
    "Let's stop for now, it's too much to process.",
  ],
  grieve_before_deciding: [
    "He told me last night he lied for a year and I'm devastated. Should I leave him?",
    "I'm so hurt and furious, I think I'm going to divorce my husband.",
    "I just found out she cheated, and I'm thinking I should break up with her.",
    "I'm heartbroken. I'm leaving my wife tomorrow, I can't be near her.",
    "I can't stop crying and I want to end the relationship right now.",
    "My friend betrayed me this morning and I'm going to cut her off for good, I'm shaking.",
    "I'm still shaking from what he said. Do I leave him?",
    "I feel so betrayed that I'm walking away from my marriage.",
    "I'm raw and I keep thinking I should call it quits with my boyfriend.",
    "I was blindsided today. I'm ending the friendship, it hurts so much.",
    "I'm gutted and I want to cut my brother out of my life.",
  ],
  protective_not_punitive: [
    'I want him to pay for what he did to me.',
    'I want her to suffer the way I did.',
    'I just want him to feel what I felt.',
    "I want my brother to regret everything.",
    'I want revenge on my old boss.',
    "I'm thinking about payback for what they did.",
    'I want to get back at her.',
    "He deserves to suffer after that.",
    "I want to make them pay for it.",
    'I watched her cry and I wish she would really pay for it.',
    "She should suffer for how she treated my kid.",
  ],
  rough_draft_first: [
    "I have to have a hard conversation with my sister and I'm furious.",
    "I need to tell my boss what I think and I'm so angry I'm shaking with rage.",
    "I'm livid and I'm going to confront him tonight.",
    "I want to talk to my dad but there is so much anger in me I can't hold it in.",
    "There is a difficult talk coming with my landlord and I am seething.",
    "I'm going to tell her how I feel but I'm fuming.",
    "I have to speak to my coworker tomorrow, I'm so mad I want to scream.",
    "I need to bring it up with my mom and I'm full of resentment.",
    "I'm planning to confront my roommate and my blood is boiling.",
    "A big conversation with my partner is tonight; I'm so angry I can barely think.",
    "I'm enraged and I need to talk to my manager before Friday.",
  ],
  two_intentions: [
    "I have to tell my husband something hard and I want him to understand how it felt.",
    "I'm dreading it, but I need to talk to her and I want her to listen.",
    "I'm going to tell my brother something difficult and I want him to stop.",
    "I want to call out my coworker but I'm scared to.",
    "It's awkward, and I have to tell my friend what happened; I want her to see it.",
    "I have a conversation with my mom that I'm nervous about. I'd like her to understand me.",
    "I need to tell my father something I haven't said in years and I want him to know.",
    "I need to bring it up with my partner. It's painful and I just want to point it out.",
    "It's hard to say, but I'm going to confront my sister and name the pattern.",
    "I need to talk to him and I'm afraid to, I don't know what I even want from it.",
    "It will be a difficult talk with my boss, I want her to notice what is happening.",
  ],
  name_behavior_neutrally: [
    "Every time I mention the budget, he changes the subject.",
    "Whenever I raise it, she goes quiet.",
    "My boss always interrupts me in meetings.",
    "Each time I bring up the chores my husband walks out of the room.",
    "She keeps rolling her eyes when I talk.",
    "Every time I ask a question my manager sighs.",
    "My mom usually talks over me at dinner.",
    "Whenever we disagree he checks his phone.",
    "They always laugh it off when I say it bothers me.",
    "Any time I mention my day my partner changes the topic.",
    "My sister keeps cutting me off whenever I say something about the kids.",
  ],
  smallest_next_step: [
    "I know what matters, I want to finish my novel, and I keep putting it off.",
    "It matters so much to me and I still haven't started.",
    "I know exactly what I want to do and I can't seem to start.",
    "This is really important to me, but I keep avoiding it.",
    "I care deeply about this, and I still haven't made a start.",
    "I really want to start running again, but I just can't start.",
    "I know what I need to do and I keep not starting.",
    "It matters a lot to me, and I procrastinate every single day.",
    "I really want to write to my old teacher and I keep putting it off.",
    "I care so much about this and I have not started.",
  ],
};
const mustNot: Record<string, string[]> = {
  offer_a_smaller_step: [
    "I'm overwhelmed with joy, the baby arrived!",
    "The view from the summit was overwhelmingly beautiful.",
    "I'm overwhelmed by how kind everyone was today.",
    "I'm tired of waiting for the bus.",
    "That was too much sugar for me.",
    "I'm not tired at all, let's keep going.",
    "My inbox is overwhelming for the intern, not for me.",
    "I want to go deeper into this, I have time.",
    "Let's pause the music, I want to talk.",
    "I need a break from the rain, so I'm booking a trip.",
    "It is too much to ask of a mule.",
  ],
  grieve_before_deciding: [
    "We broke up three years ago and I'm doing great.",
    "I've decided to divorce him after two years of counselling and I feel at peace.",
    "I'm devastated about the news from home but I'm staying with my partner.",
    "My friend is getting a divorce and I'm happy for her.",
    "I want to leave my job. I'm furious with my manager.",
    "Should I leave my husband? We have been thinking about it calmly for months.",
    "I'm heartbroken that my dog died.",
    "He cheated last night in the game, I'm furious, but we're fine.",
    "I'm so hurt that she forgot my birthday; I'd never end the friendship over that.",
    "I'm raw from the sunburn.",
    "I am going to leave the party early because I'm tired.",
  ],
  protective_not_punitive: [
    "I want him to pay me back the fifty dollars he owes.",
    "I want the contractor to pay for the damage to the roof.",
    "I'm reading a revenge story and it is gripping.",
    "I want her to be happy.",
    "I hope they regret nothing and keep going.",
    "I want my brother to feel welcome at the party.",
    "He should pay attention in class.",
    "I want her to know how much she means to me.",
    "I just want him to stop shouting at me.",
    "Revenge of the Nerds is on tonight.",
    "I want them to understand why I'm upset.",
  ],
  rough_draft_first: [
    "I'm furious that my flight was cancelled.",
    "I have a hard conversation with my boss tomorrow and I feel calm and ready.",
    "I need to talk to my landlord about the heating.",
    "I'm so angry about the news today.",
    "I'm seething at the traffic.",
    "I have to tell my sister about the party, and I'm excited.",
    "I'm planning to confront my fear of flying.",
    "I'm furious, but I don't want to go there or talk about it.",
    "There is rage in the song's lyrics.",
    "I want to scream at the referee.",
    "We had a big talk, and it went well.",
  ],
  two_intentions: [
    "I want to tell my mom happy birthday.",
    "I have to tell my kids dinner is ready and I want them to hurry.",
    "I want him to stop texting at 3am but I'm not going to say anything.",
    "It's hard to say goodbye to my old flat.",
    "I need to talk to my friend about the wedding; I want her to be my maid of honor.",
    "I'm nervous about the exam.",
    "I want her to understand the homework.",
    "I'm dreading Monday, and I'd like it to stop raining.",
    "I'm going to tell my boss I'm taking a day off.",
    "The conversation with my brother was hard but we resolved it.",
    "I want to stop eating late at night.",
  ],
  name_behavior_neutrally: [
    "My cat always walks out of the room when the vacuum starts.",
    "He changed the subject once, I think he was tired.",
    "Every time I eat cheese I get a headache.",
    "She sighed.",
    "Whenever it rains the bus is late.",
    "The dog keeps interrupting my calls.",
    "They always laugh at the same joke on that show.",
    "My boss was talking over the noise from the road.",
    "Every time I bring up the budget I feel nervous.",
    "I go quiet whenever I'm nervous.",
    "Usually I check my phone before bed.",
  ],
  smallest_next_step: [
    "I haven't started dinner yet.",
    "I know what I'm doing, the laundry is almost done.",
    "I keep putting off the dentist but it doesn't matter to me.",
    "I really want pizza tonight.",
    "It is really important to me that you reply by Friday.",
    "I care a lot about my neighbour's garden.",
    "I can't start my car this morning.",
    "I procrastinate sometimes, no big deal.",
    "I know what I want for lunch.",
    "I really want to finish the dishes and then I will.",
    "I still haven't started the series everyone is talking about.",
  ],
};

const MOVE_IDS = Object.keys(must);
ok('the seven new modules are the approved ones, in group move', MOVE_IDS.length === 7 && MOVE_IDS.every((id) => MODULE_GROUPS[id] === 'move' && MODULE_IDS.includes(id)));
for (const id of MOVE_IDS) {
  const pos = must[id], neg = mustNot[id];
  ok(`${id}: at least 10 trigger messages and 10 lookalikes are tested`, pos.length >= 10 && neg.length >= 10);
  for (const t of pos) ok(`${id} fires for "${t.slice(0, 50)}"`, selectModules([t]).includes(id), selectModules([t]).join(','));
  for (const t of neg) ok(`${id} does not fire for "${t.slice(0, 50)}"`, !selectModules([t]).includes(id), selectModules([t]).join(','));
}

// Combined-condition triggers need both halves.
ok('grieve_before_deciding needs the ending talk as well as the pain', !selectModules(["I'm devastated and I just found out my sister is moving."]).includes('grieve_before_deciding'));
ok('grieve_before_deciding needs the pain as well as the ending talk', !selectModules(['I think I should leave my husband.']).includes('grieve_before_deciding'));
ok('protective_not_punitive needs wanting someone to pay or suffer', !selectModules(['He hurt me and I feel unsafe.']).includes('protective_not_punitive'));
ok('moves look only at the latest message', !selectModules(['I want him to pay for what he did.', 'Thanks, that helps.']).includes('protective_not_punitive'));

// Existing rules still hold.
ok('a lens that holds back action planning holds back rough_draft_first and smallest_next_step',
  (() => { const g = selectModules(["I'm exhausted and nothing left. I really want to write to my teacher and I keep putting it off. I have a hard conversation with my sister and I'm furious."]); return !g.includes('smallest_next_step') && !g.includes('rough_draft_first') && g.includes('reserves'); })());
ok('depleted care also holds back these moves', (() => { const g = selectModules(["I'm caring for my mother and I'm drained. I have to confront her doctor and I'm furious."]); return !g.includes('rough_draft_first') && !g.includes('two_intentions'); })());
ok('deliberate harm holds back the perspective-taking and skill-building new moves', (() => {
  const g = selectModules(["He's doing it on purpose. Every time I raise it he changes the subject. I want him to understand, it's a hard conversation and I'm furious, I need to tell him."]);
  return g.includes('harm_named_as_intended') && !['name_behavior_neutrally', 'two_intentions', 'rough_draft_first', 'smallest_next_step'].some((id) => g.includes(id));
})());
ok('deliberate harm does not hold back protective_not_punitive or offer_a_smaller_step', (() => {
  const g = selectModules(["He did it on purpose and I want him to pay for it, and I'm overwhelmed."]);
  return g.includes('protective_not_punitive') && g.includes('offer_a_smaller_step');
})());
ok('at most three modules and safety first when the new moves also match', (() => {
  const g = selectModules(["I had a panic attack. I'm overwhelmed. I want him to pay for what he did. Every time I raise it he goes quiet. I'm devastated and I'm leaving my husband."]);
  return g.length <= 3 && g[0] === 'deep_fear_refer_out';
})());
ok('at most three moves reach one reply', selectModules(["I'm overwhelmed. I want him to pay for what he did. Every time I raise it he goes quiet. I'm devastated and I'm leaving my husband. I really want to start running and keep putting it off."]).filter((id) => MODULE_GROUPS[id] === 'move').length <= 3);
ok('the new moves are left out when moves are excluded (the closing exchange)', (() => {
  const set: ModuleSet = { core: 'CORE', modules: Object.fromEntries(MODULE_IDS.map((id) => [id, `MODULE-${id}`])) };
  return !buildNotes(set, ['I want him to pay for what he did.'], { exclude: ['move'] }).includes('MODULE-protective_not_punitive');
})());
ok('softened conversations get the core only, even when a new move matches', (() => {
  const set: ModuleSet = { core: 'CORE', modules: Object.fromEntries(MODULE_IDS.map((id) => [id, `MODULE-${id}`])) };
  return buildNotes(set, ['I want him to pay for what he did.'], { skipModules: true }) === 'CORE';
})());

// Size: the worst case for one reply with the new modules, using stand-in text of representative length (the real text is private).
{
  const { readFileSync } = await import('node:fs');
  const fn = readFileSync('netlify/functions/coach.mts', 'utf8');
  ok('the function passes the soften tier as skipModules', /skipModules: softened/.test(fn));
  const REAL = 1300; // about the longest approved text plus its title, rounded up
  const stand: Record<string, string> = {};
  for (const id of MODULE_IDS) stand[id] = 'x'.repeat(MOVE_IDS.includes(id) ? REAL : 1700);
  const core = 'c'.repeat(3600);
  const worst = core.length + Object.values(stand).sort((a, b) => b.length - a.length).slice(0, 3).reduce((a, t) => a + t.length + 2, 0);
  ok(`the worst case for one reply stays under the 12,000-character cap (${worst})`, worst < 12000);
  const notes = buildNotes({ core, modules: stand }, ["I'm overwhelmed. I want him to pay for what he did. Every time I raise it he goes quiet."], { maxChars: 9000 });
  ok('a real selection with long text still fits the 9,000-character notes budget', notes.length <= 9000);
}
