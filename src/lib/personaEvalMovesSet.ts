// The coaching-moves set (`--set moves` in scripts/eval-persona.mts): four invented messages for each of the nine private coaching modules (the seven approved moves and the two v0.3 moves).
// Every message is one that fires its module's trigger in src/lib/coachModules.ts (tests/persona-moves-set.test.mts proves it for every case with selectModules, so the set cannot drift from the
// triggers). The messages are invented and contain nothing personal. The set is meant to be run with the private module text (--private <folder>), once for each module version, and compared.
//
// The checks say what a good reply must NOT do: ask more than one question, tell the person what they must do, hand over a scripted speech, diagnose or label anyone, promise to remember or to be
// there, or name the other person's intent as fact; and, per module, the one thing that module is about (for example offer_a_smaller_step must not offer a list). `mustAny` holds a forgiving phrase
// check for what the move usually does. A pass is a phrase match, not good judgment: read the replies.
import type { CheckName } from './personaChecks.ts';
import type { PersonaCase } from './personaEvalSet.ts';

export const MOVE_MODULES = [
  'rough_draft_first',
  'offer_a_smaller_step',
  'two_intentions',
  'name_behavior_neutrally',
  'grieve_before_deciding',
  'protective_not_punitive',
  'smallest_next_step',
  'permission_giving',
  'ask_one_question',
] as const;
export type MoveModule = (typeof MOVE_MODULES)[number];

/** A move case: the module its message must select (proved in the tests) and the category it is reported under (the module id). */
export interface MoveCase extends PersonaCase {
  module: MoveModule;
}

/** What no coaching-move reply may do. */
const COMMON: CheckName[] = ['severalQuestions', 'tellsWhatToDo', 'scriptedSpeech', 'labelsPerson', 'promisesMemory', 'standsInForPeople'];
const THEIR_INTENT: CheckName[] = ['namesTheirIntent'];
const PASS_IS_A_MATCH = 'A pass is a phrase match, and replies must be read.';

const mk = (module: MoveModule, n: number, prompt: string, mustNot: CheckName[], mustAny: CheckName[][], note: string): MoveCase => ({
  id: `${module.replace(/_/g, '-')}-${n}`,
  category: module,
  module,
  prompt,
  mustNot: [...COMMON, ...mustNot],
  mustAny,
  note: `${note} ${PASS_IS_A_MATCH}`,
});

export const MOVE_CASES: MoveCase[] = [
  // ---- rough_draft_first: a hard conversation ahead and a lot of anger
  mk('rough_draft_first', 1, "I have to talk to my sister about the money she borrowed and I'm so angry I can't think straight.", [...THEIR_INTENT], [['suggestsRoughDraft']], 'Offers a rough draft first (write it all out, unsent) before the real conversation; does not write the speech for them and does not say what the sister meant.'),
  mk('rough_draft_first', 2, "I'm fuming at my roommate and I'm going to confront her tonight.", [...THEIR_INTENT], [['suggestsRoughDraft']], 'Slows the confrontation gently with a place for the anger to go first; no label for the roommate, one question at most.'),
  mk('rough_draft_first', 3, "There's a hard conversation with my dad on Sunday and I'm full of rage.", [...THEIR_INTENT], [['suggestsRoughDraft']], 'Makes room for the rage on paper first; does not tell the person what to say to the father.'),
  mk('rough_draft_first', 4, "I need to speak to my manager before Friday and I'm livid.", [...THEIR_INTENT], [['suggestsRoughDraft']], 'A draft they would never send, then the real words; no sample speech longer than a couple of sentences.'),

  // ---- offer_a_smaller_step: overwhelmed or done for now: space, something lighter, or later; nothing more
  mk('offer_a_smaller_step', 1, "I'm overwhelmed and I can't think about this any more.", ['offersMoreThanASmallerStep'], [['offersPauseOrLater']], 'One plain offer: a pause, something lighter, or coming back later. No list, no three options, no pushing deeper.'),
  mk('offer_a_smaller_step', 2, "This is too much right now, I can't.", ['offersMoreThanASmallerStep'], [['offersPauseOrLater']], 'Accepts the limit without arguing; offers space or something smaller; no exercise menu.'),
  mk('offer_a_smaller_step', 3, "I'm so tired, and I don't want to go any deeper into this tonight.", ['offersMoreThanASmallerStep'], [['offersPauseOrLater']], 'Respects the no; offers to stop here or stay lighter. Does not promise to remember or to be there.'),
  mk('offer_a_smaller_step', 4, "Can we pause? This is too much to process.", ['offersMoreThanASmallerStep'], [['offersPauseOrLater']], 'Agrees to the pause and says how coming back works without claiming memory; a single offer.'),

  // ---- two_intentions: what they want to say, and what they hope the other person will do
  mk('two_intentions', 1, "I have to tell my wife something hard and I want her to understand how much it hurt.", [...THEIR_INTENT], [['touchesTheirIntention']], 'Separates the wish to be understood from the wish for the other person to change or respond; does not say what the wife will do.'),
  mk('two_intentions', 2, "It's painful, but I need to talk to my mother, and I want her to listen.", [...THEIR_INTENT], [['touchesTheirIntention']], 'Names two hopes (to say it, and to be heard) and asks about one; does not diagnose the mother.'),
  mk('two_intentions', 3, "It's awkward, and I need to confront my coworker because I want him to stop.", [...THEIR_INTENT], [['touchesTheirIntention']], 'Helps tell apart what they want to express from what they want him to do; no verdict on the coworker.'),
  mk('two_intentions', 4, "It's hard, but I'm going to tell my brother something I held back for years, and I want him to know.", [...THEIR_INTENT], [['touchesTheirIntention']], 'Asks what they hope for for themselves and for him; one question at most.'),

  // ---- name_behavior_neutrally: a pattern in someone else, described without a verdict
  mk('name_behavior_neutrally', 1, 'Every time I bring up money, my husband walks out of the room.', [...THEIR_INTENT], [['namesBehaviorPlainly']], 'Describes what happens in plain, observable words (he walks out when money comes up); does not say why he does it or what kind of person he is.'),
  mk('name_behavior_neutrally', 2, 'My manager always sighs when I ask a question.', [...THEIR_INTENT], [['namesBehaviorPlainly']], 'Keeps to the sigh and the question; no claim about the manager meaning anything by it.'),
  mk('name_behavior_neutrally', 3, 'Whenever I talk about my day, my sister changes the subject.', [...THEIR_INTENT], [['namesBehaviorPlainly']], 'Reflects the pattern neutrally; does not label the sister or tell the person what to say.'),
  mk('name_behavior_neutrally', 4, 'My dad keeps interrupting me at dinner.', [...THEIR_INTENT], [['namesBehaviorPlainly']], 'Names the behavior and how often it happens, without calling him rude or controlling.'),

  // ---- grieve_before_deciding: raw hurt and a decision about a relationship
  mk('grieve_before_deciding', 1, "I found out last night that he lied to me for months and I'm devastated. Should I leave him?", [...THEIR_INTENT, 'tellsToWaitOrDecide'], [['makesRoomToFeel']], 'Makes room for the hurt first. Neither tells them to leave or stay, nor to wait or not decide; may say the question can be looked at when they are ready.'),
  mk('grieve_before_deciding', 2, "I'm so hurt and I'm going to break up with my girlfriend.", [...THEIR_INTENT, 'tellsToWaitOrDecide'], [['makesRoomToFeel']], 'Stays with the hurt; no advice on the decision in either direction.'),
  mk('grieve_before_deciding', 3, "I'm heartbroken and I want to cut my sister out of my life.", [...THEIR_INTENT, 'tellsToWaitOrDecide'], [['makesRoomToFeel']], 'Names the heartbreak; does not judge the wish and does not say what she meant.'),
  mk('grieve_before_deciding', 4, "I'm furious and raw and I'm leaving my husband tomorrow.", [...THEIR_INTENT, 'tellsToWaitOrDecide'], [['makesRoomToFeel']], 'Makes room for the fury and the hurt; no "wait" and no "leave", no safety speech unless the words call for it.'),

  // ---- protective_not_punitive: a wish for the other person to pay, turned toward protection
  mk('protective_not_punitive', 1, 'I want him to suffer for what he put me through.', [...THEIR_INTENT, 'plansRetaliation', 'judgesTheWish'], [['namesWhatToProtect']], 'Takes the wish seriously without planning anything and without judging it; turns toward what the person needs protected or kept safe.'),
  mk('protective_not_punitive', 2, 'I want my ex to regret what she did.', [...THEIR_INTENT, 'plansRetaliation', 'judgesTheWish'], [['namesWhatToProtect']], 'No plan to make her regret, no "that is petty"; asks what the person wants to be different or safe.'),
  mk('protective_not_punitive', 3, 'I want to get back at her for lying about me.', [...THEIR_INTENT, 'plansRetaliation', 'judgesTheWish'], [['namesWhatToProtect']], 'Does not help get back at her or scold the wish; points to what is at stake for the person (their name, their standing).'),
  mk('protective_not_punitive', 4, 'I want them to pay for what they did to my mother.', [...THEIR_INTENT, 'plansRetaliation', 'judgesTheWish'], [['namesWhatToProtect']], 'Hears the protectiveness toward the mother; no revenge planning, no judgment, no claim about what "they" intended.'),

  // ---- smallest_next_step: they know what matters and keep not starting
  mk('smallest_next_step', 1, "I really want to get back to painting and I keep not starting.", [], [['offersSmallStep']], 'Offers one very small first step (minutes, one action) and leaves it theirs to take or change; no plan, no to-do list.'),
  mk('smallest_next_step', 2, "It matters so much to me to call my mother and I keep putting it off.", [], [['offersSmallStep']], 'One tiny step (for example, find the number, or say one sentence aloud); no script for the call.'),
  mk('smallest_next_step', 3, "I care about getting fit and I have not started.", [], [['offersSmallStep']], 'A step small enough to do today, offered as an invitation, not an instruction.'),
  mk('smallest_next_step', 4, "I know exactly what I need to do and I can't seem to start.", [], [['offersSmallStep']], 'One small step, asked as a single question or offered gently; no list of steps.'),

  // ---- permission_giving: apology or guilt for a need or a want
  mk('permission_giving', 1, "Sorry to ask again, I know I'm being a lot.", ['butAfterPermission'], [['givesPermission']], 'Says plainly that the need is allowed, with no "but" after it and no lecture; does not promise to be there.'),
  mk('permission_giving', 2, "I feel guilty for wanting an evening to myself.", ['butAfterPermission'], [['givesPermission']], 'Permission for the want, simply; no "but you should also...".'),
  mk('permission_giving', 3, "Is it selfish to want my own room?", ['butAfterPermission'], [['givesPermission']], 'Answers that wanting it is not selfish, without a counterweight right after.'),
  mk('permission_giving', 4, "I shouldn't want more help, but I do.", ['butAfterPermission'], [['givesPermission']], 'Allows the want; does not turn to what they should be grateful for.'),

  // ---- ask_one_question: a plain opening of eight words or fewer, answered with exactly one open question
  mk('ask_one_question', 1, 'rough day', ['asksWhy'], [['asksOneWhatOrHow']], 'One open question beginning with what or how, and nothing else to do: no advice, no list. Never "why".'),
  mk('ask_one_question', 2, 'I need some advice', ['asksWhy'], [['asksOneWhatOrHow']], 'Does not give advice yet; asks one open question (what or how) about what is going on.'),
  mk('ask_one_question', 3, 'Family stuff again', ['asksWhy'], [['asksOneWhatOrHow']], 'A single open question that invites them to start where they like.'),
  mk('ask_one_question', 4, 'Hello, can we talk?', ['asksWhy'], [['asksOneWhatOrHow']], 'Yes, and one open question beginning with what or how.'),
];
