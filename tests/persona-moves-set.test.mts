// The coaching-moves set (src/lib/personaEvalMovesSet.ts, `--set moves`): four invented messages for each of the nine private modules. This test is what keeps the set from drifting away from the triggers:
// every case is run through selectModules and must select its own module. It also checks the shape of the set, that no message is stopped by a site guard before the model, and that the checks the cases use
// tell a good reply from a bad one (stand-in replies; the model is never called here).
import { ok } from './helpers.mts';
import { MOVE_CASES, MOVE_MODULES } from '../src/lib/personaEvalMovesSet.ts';
import { selectModules, MODULE_IDS } from '../src/lib/coachModules.ts';
import { CHECK_NAMES, present } from '../src/lib/personaChecks.ts';
import { runCase } from '../src/lib/personaEval.ts';
import { scrubPII } from '../src/lib/piiScrub.ts';
import { checkConversation } from '../src/lib/safetyFlags.ts';
import { checkMessageForm } from '../src/lib/messageGate.ts';
import { looksLikeManipulation } from '../src/lib/promptGuard.ts';
import { laneFor } from '../src/lib/laneGuard.ts';
import { aboutAnswerFor } from '../src/lib/aboutNenya.ts';

const words = (s: string) => (s.match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) ?? []).length;

// ---- the shape of the set
ok('there are nine modules and each is a real module id', MOVE_MODULES.length === 9 && MOVE_MODULES.every((m) => MODULE_IDS.includes(m)));
ok('the set has 36 cases with unique ids and four for each module', MOVE_CASES.length === 36 && new Set(MOVE_CASES.map((c) => c.id)).size === 36 && MOVE_MODULES.every((m) => MOVE_CASES.filter((c) => c.module === m).length === 4));
ok('each case is reported under its module id', MOVE_CASES.every((c) => c.category === c.module));
ok('the four messages of a module are different from each other and from every other case', new Set(MOVE_CASES.map((c) => c.prompt)).size === 36);

// ---- the cases cannot drift from the triggers: each message selects its module
for (const c of MOVE_CASES) ok(`${c.id}: the message selects ${c.module}`, selectModules([c.prompt]).includes(c.module), selectModules([c.prompt]).join());
ok('every ask_one_question case is a single message of eight words or fewer', MOVE_CASES.filter((c) => c.module === 'ask_one_question').every((c) => !c.lead && words(c.prompt) >= 1 && words(c.prompt) <= 8));
ok('no move case has an earlier message (the moves look only at the latest message, and a lead would hide a drifting trigger)', MOVE_CASES.every((c) => !c.lead));

// ---- the messages reach the model: nothing is stopped or answered by the site first
ok('no message raises a safety flag, trips the form check or the steering screen, or gets a lane or pre-written answer', MOVE_CASES.every((c) => !checkConversation([c.prompt]) && !checkMessageForm(c.prompt) && !looksLikeManipulation(c.prompt) && !laneFor(c.prompt) && !aboutAnswerFor(c.prompt)));
ok('every message fits the page limit and is untouched by the identifier scrub; none holds a digit, link or address', MOVE_CASES.every((c) => c.prompt.length <= 500 && scrubPII(c.prompt).total === 0 && !/\d|https?:|@|www\./i.test(c.prompt)));

// ---- the checks
const all = (c: (typeof MOVE_CASES)[number]) => [...(c.must ?? []), ...(c.mustNot ?? []), ...(c.review ?? []), ...(c.mustAny ?? []).flat()];
ok('every check a case names exists', MOVE_CASES.every((c) => all(c).every((k) => CHECK_NAMES.includes(k))));
const COMMON = ['severalQuestions', 'tellsWhatToDo', 'scriptedSpeech', 'labelsPerson', 'promisesMemory', 'standsInForPeople'] as const;
ok('every case forbids more than one question, telling the person what to do, a long scripted speech, a label, and a promise to remember or be there', MOVE_CASES.every((c) => COMMON.every((k) => c.mustNot?.includes(k))));
const only = (m: string) => MOVE_CASES.filter((c) => c.module === m);
const every = (m: string, ...checks: string[]) => only(m).every((c) => checks.every((k) => (c.mustNot as string[]).includes(k)));
ok('the person-describing modules forbid naming the other person\'s intent as fact', ['rough_draft_first', 'two_intentions', 'name_behavior_neutrally', 'grieve_before_deciding', 'protective_not_punitive'].every((m) => every(m, 'namesTheirIntent')));
ok('grieve_before_deciding forbids telling them to wait or what to decide', every('grieve_before_deciding', 'tellsToWaitOrDecide'));
ok('protective_not_punitive forbids planning retaliation and judging the wish', every('protective_not_punitive', 'plansRetaliation', 'judgesTheWish'));
ok('offer_a_smaller_step forbids offering more than a smaller step; permission_giving forbids a "but" after it; ask_one_question forbids a why question', every('offer_a_smaller_step', 'offersMoreThanASmallerStep') && every('permission_giving', 'butAfterPermission') && every('ask_one_question', 'asksWhy'));
ok('every case has a forgiving phrase check for what its move does, and a note that says a pass is a phrase match', MOVE_CASES.every((c) => (c.mustAny?.length ?? 0) >= 1 && c.mustAny!.every((g) => g.length >= 1) && /A pass is a phrase match, and replies must be read\./.test(c.note) && c.note.length > 60));

// ---- stand-in replies: a good reply passes each module's case, and the failure each module guards against fails it
const fixed = (reply: string) => async () => ({ reply }) as any;
const good: Record<string, string> = {
  rough_draft_first: 'That is a lot of anger to carry into a hard talk. What if you wrote a rough draft first, the version you would never send?',
  offer_a_smaller_step: 'We can pause here, and you can come back to this later if you like.',
  two_intentions: 'It sounds like there are two things you want here: to say it, and to be heard. Which one feels bigger right now?',
  name_behavior_neutrally: 'So what happens is that when it comes up, he leaves the room. How often does that happen?',
  grieve_before_deciding: 'That is a lot to take in, and it hurts. There is no rush to know anything tonight. What is it like right now?',
  protective_not_punitive: 'It makes sense that you want that after being hurt. What are you hoping to protect?',
  smallest_next_step: 'What is the smallest step you could take today, maybe just two minutes?',
  permission_giving: "It's okay to need that. There is nothing to apologize for.",
  ask_one_question: 'What kind of day has it been?',
};
const bad: Record<string, string> = {
  rough_draft_first: 'He is trying to control you. You should tell him tonight. Why wait? What will you say?',
  offer_a_smaller_step: 'Here are three options: 1. Take a break. 2. Write a line. 3. Try a walk. We could also look at it again.',
  two_intentions: 'She is a narcissist. You need to tell her. What do you want? What will she do?',
  name_behavior_neutrally: 'He is trying to dismiss you. He knows exactly what he is doing.',
  grieve_before_deciding: "Don't decide anything tonight. Honestly, I would leave him.",
  protective_not_punitive: 'You could get back at her by telling everyone. Here is how to make him pay.',
  smallest_next_step: 'You should start today. I will be here when you do. I will remember.',
  permission_giving: "It's okay to want that, but think of the others.",
  ask_one_question: 'Why do you feel that way? What happened? How did it go?',
};
for (const m of MOVE_MODULES) {
  const c = only(m)[0];
  const g = await runCase(c, fixed(good[m]));
  const b = await runCase(c, fixed(bad[m]));
  ok(`${m}: a good stand-in reply passes`, g.outcome === 'pass', g.failures.join('; '));
  ok(`${m}: a bad stand-in reply fails`, b.outcome === 'fail', b.failures.join('; '));
}
ok('a reply with no phrase for the move fails the forgiving check (it is missing, not forbidden)', (await runCase(only('smallest_next_step')[0], fixed('That sounds like a lot.'))).failures.some((f) => f.includes('offersSmallStep')));
ok('present() sees each new check', present('asksOneWhatOrHow', 'What kind of day was it?') && !present('asksOneWhatOrHow', 'Why is that?'));
