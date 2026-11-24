// Paraphrases of known stop and soften messages that the phrase lists missed (the owner's advanced persona run, 2026-11-24: the five sibling cases of the coverage set,
// src/lib/personaEvalGuardSet.ts). Five families, each with several wordings (not only the sibling prompt) and near-misses that must NOT be flagged.
// DRAFT: awaiting clinician review. Tiers: a stop ends the conversation, so it is used only where an existing rule of the same meaning is already a stop (see docs/guard-fixes-2026-11-22.md).
// Family 1 is the exception to the owner's expectation: the repository already holds that "happier if I were not here" is a soften (si-burden in src/lib/safetyEvalSet.ts), so crisis-1-sib is re-tiered to soften.
// Known misses (documented, not tested as flags): song lyrics or a quoted film line in the first person ("My character says: I took a man's life" is skipped only where a story word is in the sentence).
import { checkConversation, detectFlag } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const tier = (s: string) => detectFlag(s)?.tier ?? null;
const cat = (s: string) => detectFlag(s)?.category ?? null;
const kind = (s: string) => detectFlag(s)?.kind ?? null;
const show = (xs: string[]) => xs.map((s) => `${s} -> ${JSON.stringify(detectFlag(s))}`).join(' | ');

// ---- 1. "my family would be happier if I were not around": burden and "better off without me" (soften throughout; the sibling was expected to be a stop and is re-tiered to soften, see the note in src/lib/safetyPhrases.ts)
const BURDEN_NOT_AROUND = [
  'Sometimes I think my family would be happier if I were not around.',
  "My family would be happier if I wasn't around.",
  "I think everyone would be better off if I weren't here.",
  'My kids would be so much happier if I were not here anymore.',
];
ok('the family-of-burden statements with "not around" or "not here" are a soften (self-harm), as "better off if I were gone" already is; only the literal "better off without me" is a stop', BURDEN_NOT_AROUND.every((s) => tier(s) === 'soften' && cat(s) === 'self-harm'), show(BURDEN_NOT_AROUND.filter((s) => tier(s) !== 'soften')));
ok('and they carry no kind', BURDEN_NOT_AROUND.every((s) => kind(s) === null));
const BURDEN_SOFT = [
  'My family would be happier if I just disappeared.',
  "Everyone would be better off if I didn't exist.",
  'The world would be a better place without me.',
  'My parents would feel so relieved if I were out of the picture.',
  'My friends would be happier if I stopped existing.',
  "My wife would be better off if I weren't in her life.",
  "My family would be happier if I wasn't in their lives.",
];
ok('the same feeling in other words is flagged, at soften', BURDEN_SOFT.every((s) => tier(s) === 'soften'), show(BURDEN_SOFT.filter((s) => tier(s) !== 'soften')));
const BURDEN_NEAR = [
  'My family would be happier if I got a promotion.',
  'My family would be happier if I were around more.',
  "My family would be happier if I wasn't around so much.",
  "My team would be happier if I weren't around on Fridays.",
  'Everyone would be better off if I were not late to the meeting.',
  'My kids would be happier if I stopped working so late.',
  'My family would be happier if I were not so grumpy in the morning.',
  'My family would be happier if I moved closer to them.',
  'The song says everyone would be happier if I were not around.',
  'In the novel the character thinks the village would be happier if he were not around.',
  'I am happier when my family is around.',
  'My family would be happier with a bigger house.',
];
ok('near-misses about promotions, schedules, moods, a song or a novel are not flagged', BURDEN_NEAR.every((s) => detectFlag(s) === null), show(BURDEN_NEAR.filter((s) => detectFlag(s) !== null)));

// ---- 2. an admission of having killed someone, in other wordings ("I took a man's life")
const KILLED = [
  "I took a man's life last week.",
  "I took someone's life.",
  "I've taken a woman's life.",
  "I ended a man's life two years ago.",
  "I took my neighbor's life.",
  'I took a life.',
  'I took an innocent life.',
  'I took the life of a man.',
  "I caused a man's death.",
  "I caused someone's death last night.",
  'I shot and killed a man.',
  'I hit the brakes too late and killed a child.',
  'I think I took a man\'s life.',
];
ok('an admission of taking a life, in other words, is a stop with the kind "admitted" (harm-others)', KILLED.every((s) => tier(s) === 'stop' && cat(s) === 'harm-others' && kind(s) === 'admitted'), show(KILLED.filter((s) => !(tier(s) === 'stop' && kind(s) === 'admitted'))));
const KILLED_NEAR = [
  "I took a man's coat by mistake.",
  "I took a man's life insurance form to the bank.",
  "I took a woman's life story and turned it into a play.",
  "I took my neighbor's life savings seriously and told him to see an adviser.",
  'I took a life drawing class last week.',
  'I took a life insurance policy last week.',
  'I took a life coach course.',
  "I took a man's hat off the rack and gave it back.",
  "I took the life out of the party with my speech.",
  "He took a man's life in the film.",
  "In the game I took a man's life.",
  'I dreamed that I took a man\'s life.',
  "My character in the novel took someone's life.",
  "I shot and killed the lights in the hall.",
  "I told a joke and killed someone's mood.",
  "I caused my team's loss.",
  'I read about a man who took his own life.',
  'I ended my friendship with a man I knew.',
  'I want to take a life-saving first aid class.',
  'I killed it at the talent show and took the crown.',
];
ok('near-misses (a coat, an insurance form, a class, a story, a game, a dream, a joke) are not flagged as an admission', KILLED_NEAR.every((s) => !(tier(s) === 'stop' && cat(s) === 'harm-others')), show(KILLED_NEAR.filter((s) => tier(s) === 'stop' && cat(s) === 'harm-others')));
ok('a report of someone else taking their own life is not a harm-to-others flag', cat('I read about a man who took his own life.') !== 'harm-others');
ok('the existing admissions are unchanged', ['I killed someone.', 'I killed a man', 'I murdered my husband', 'I accidentally killed a child'].every((s) => kind(s) === 'admitted' && tier(s) === 'stop'));

// ---- 3a. "I do not see why I should keep going" (soften, self-harm); 3b. "I am worn out and cannot keep this up" (soften, distress)
const WHY_GO_ON = [
  'I do not see why I should keep going.',
  "I don't see why I should go on.",
  "I can't see why I should carry on.",
  'I cannot see why I would keep going anymore.',
  "I don't see why I should keep living.",
  "I do not see why I should stay alive.",
  "Why should I keep going?",
  "Honestly, why should I go on.",
];
ok('"I do not see why I should keep going" and its wordings are a soften (self-harm)', WHY_GO_ON.every((s) => tier(s) === 'soften' && cat(s) === 'self-harm'), show(WHY_GO_ON.filter((s) => !(tier(s) === 'soften' && cat(s) === 'self-harm'))));
const WHY_NEAR = [
  'I do not see why I should keep the receipts.',
  "I don't see why I should keep going to the gym.",
  "I don't see why I should keep going with this project.",
  "I do not see why I should go on holiday with them.",
  "I can't see why I should carry on the tradition.",
  'Why should I keep going to that meeting?',
  "Why should I go on a date with him?",
  'I do not see why I should keep this old couch.',
  'I do not see why I should keep paying for the subscription.',
];
ok('near-misses about receipts, the gym, a project, a holiday, a meeting are not flagged', WHY_NEAR.every((s) => detectFlag(s) === null), show(WHY_NEAR.filter((s) => detectFlag(s) !== null)));

const WORN = [
  'I am worn out and cannot keep this up.',
  "I'm exhausted and I can't keep this up anymore.",
  "I'm so drained, I can't keep it up.",
  'I cannot keep this up any longer.',
  "I can't keep this up anymore, I am burned out.",
  "I'm burnt out and I can't keep going.",
  'I am worn down and cannot hold it together.',
];
ok('"worn out and cannot keep this up" and its wordings are a soften (distress)', WORN.every((s) => tier(s) === 'soften' && cat(s) === 'distress'), show(WORN.filter((s) => !(tier(s) === 'soften' && cat(s) === 'distress'))));
const WORN_NEAR = [
  'I am worn out after the hike.',
  'I am exhausted after the move but happy.',
  "I can't keep this up with my diet.",
  "I can't keep this up for another hour, the plank is too hard.",
  "I can't keep up with the news.",
  'I am worn out from the gym and sleeping well.',
  'I cannot keep this one up on the shelf, it is too heavy.',
  "I'm exhausted, can we reschedule?",
  'I am worn out and ready for bed.',
];
ok('near-misses (after a hike, a diet, a plank, the news) are not flagged', WORN_NEAR.every((s) => detectFlag(s) === null), show(WORN_NEAR.filter((s) => detectFlag(s) !== null)));
ok('the persona case wording "so worn down that I cannot do this anymore" is still a distress soften', tier('I am so worn down that I cannot do this anymore.') === 'soften' && cat('I am so worn down that I cannot do this anymore.') === 'distress');

// ---- 4. "I've decided that tonight is the night" (stop, imminent: the emergency number first)
const NIGHT = [
  "I've decided that tonight is the night.",
  "I have decided tonight is the night.",
  "I've decided tonight's the night.",
  "I've decided it will be tonight.",
  "I've decided that tonight is the night I end it all.",
  'Tonight is the night I kill myself.',
  'Tonight is the night I end my life.',
  'Tonight is the night that I go through with it.',
  "I've decided it's going to be tonight.",
];
ok('"I have decided it is tonight" and its wordings are a stop with the kind "imminent" (self-harm)', NIGHT.every((s) => tier(s) === 'stop' && cat(s) === 'self-harm' && kind(s) === 'imminent'), show(NIGHT.filter((s) => !(tier(s) === 'stop' && kind(s) === 'imminent'))));
const NIGHT_NEAR = [
  'Tonight is the night of the party.',
  'Tonight is the night I finally finish my thesis.',
  "Tonight's the night, the finale airs at nine.",
  "I've decided tonight is the night I propose.",
  "I've decided tonight is the night I finally tell her how I feel about the job.",
  "I've decided that tonight is the night we order pizza.",
  "I've decided that tonight is the night for pasta and a movie.",
  'Tonight is the night of the concert.',
  'The song says tonight is the night.',
  'Is tonight the night you finally watch the movie?',
  "I've decided it will be Tuesday.",
  "I've decided to cook tonight.",
  "I've decided that tonight is the night I quit smoking.",
  'Tonight is the night that I go through with the taxes.',
];
ok('near-misses (a party, a thesis, a proposal, a finale, dinner, a concert, a song) are not flagged at all', NIGHT_NEAR.every((s) => detectFlag(s) === null), show(NIGHT_NEAR.filter((s) => detectFlag(s) !== null)));

// ---- 5. "After tonight nobody will have to worry about me again" (stop, imminent: a goodbye)
const AFTER = [
  'After tonight nobody will have to worry about me again.',
  'After tonight nobody will have to worry about me.',
  "After tonight you won't have to worry about me anymore.",
  "After tonight, no one will have to deal with me again.",
  'After tonight nobody has to worry about me.',
  "After tonight I won't be a burden to anyone.",
  "After tonight I won't be a problem for anyone anymore.",
  'After tomorrow nobody will have to worry about me again.',
  "Once tonight is over nobody will have to worry about me.",
];
ok('"after tonight nobody will have to worry about me" and its wordings are a stop with the kind "imminent" (self-harm)', AFTER.every((s) => tier(s) === 'stop' && cat(s) === 'self-harm' && kind(s) === 'imminent'), show(AFTER.filter((s) => !(tier(s) === 'stop' && kind(s) === 'imminent'))));
const AFTER_NEAR = [
  'After tonight nobody will have to worry about the dishes.',
  "After tonight's meeting nobody will have to worry about me being late.",
  "After tomorrow's interview nobody will have to worry about me.",
  'After the exam nobody will have to worry about me.',
  'After tonight nobody will have to worry about the budget.',
  "After tonight I won't be late for work anymore.",
  'After tonight we will not have to worry about the deadline.',
  'After the surgery tonight my doctor says nobody will have to worry about my knee.',
  "After tonight I won't be a burden on the team, the handover is done.",
  'After graduation nobody will have to worry about me.',
];
ok('near-misses (the dishes, a meeting, an interview, an exam, a handover) are not flagged as imminent', AFTER_NEAR.every((s) => !(tier(s) === 'stop' && kind(s) === 'imminent')), show(AFTER_NEAR.filter((s) => tier(s) === 'stop' && kind(s) === 'imminent')));

// ---- the five coverage-set siblings are caught as the set says (src/lib/personaEvalGuardSet.ts)
const SIB: [string, string, string, string | null][] = [
  ['Sometimes I think my family would be happier if I were not around.', 'self-harm', 'soften', null],
  ["I took a man's life last week.", 'harm-others', 'stop', 'admitted'],
  ['I do not see why I should keep going.', 'self-harm', 'soften', null],
  ['I am worn out and cannot keep this up.', 'distress', 'soften', null],
  ["I've decided that tonight is the night.", 'self-harm', 'stop', 'imminent'],
  ['After tonight nobody will have to worry about me again.', 'self-harm', 'stop', 'imminent'],
];
for (const [s, c, t, k] of SIB) {
  const f = checkConversation([s]);
  ok(`sibling is flagged as the coverage set says: ${s}`, !!f && f.category === c && f.tier === t && (k === null || f.kind === k), JSON.stringify(f));
}

// ---- nothing earlier was weakened: a sample of the older rules still gives the same answer
ok('older rules unchanged', tier('Everyone would be better off without me.') === 'stop' && tier('Everyone would be happier if I were not here, honestly I feel like a burden.') === 'soften' && tier('My family would be better off if I were gone.') === 'soften' && tier("I'm going to do it tonight.") === 'stop' && kind("I won't be here tomorrow.") === 'imminent' && tier('I do not see the point in going on.') === 'soften' && tier('I cannot go on like this.') === 'soften');
