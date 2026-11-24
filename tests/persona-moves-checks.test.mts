// The moves-set check fixes of 2026-11-24 (docs/moves-checks-2026-11-24.md): positive and negative examples for every changed check, drawn from the saved run's replies and from synthetic ones.
// Phrase checks only; no model is called. Safety-relevant checks (tellsWhatToDo) are loosened only for the one false alarm and must still catch real instructions.
import { ok } from './helpers.mts';
import { present, type CheckName } from '../src/lib/personaChecks.ts';
import { MOVE_CASES } from '../src/lib/personaEvalMovesSet.ts';

const yes = (check: CheckName, label: string, t: string) => ok(`${check} finds: ${label}`, present(check, t), t);
const no = (check: CheckName, label: string, t: string) => ok(`${check} leaves alone: ${label}`, !present(check, t), t);

// ---- touchesTheirIntention: the either-or question
yes('touchesTheirIntention', 'two-intentions-1 (saved)', 'Are you looking for a way to help her lean in and understand your experience, or are you more looking to name a pattern so that it stops?');
yes('touchesTheirIntention', 'two-intentions-3 (saved)', "Would you like to focus on wanting them to lean in and connect with you more, or are you looking to name a pattern so that it stops?");
yes('touchesTheirIntention', 'synthetic either-or', 'Do you want him to understand what it was like, or do you want it to change?');
yes('touchesTheirIntention', 'the old wording still counts', 'What do you hope she does when you tell her?');
no('touchesTheirIntention', 'two-intentions-2 (saved, no fork)', "It sounds like you are facing a difficult conversation with your mother because you want to be heard. What is it that you've been noticing lately?");
no('touchesTheirIntention', 'two-intentions-4 (saved, no fork)', 'Are you noticing any particular feelings as you prepare to do this?');
no('touchesTheirIntention', 'an or that is not a fork of aims', 'Are you noticing tiredness or tension in your body right now?');

// ---- namesBehaviorPlainly: role instead of he/she/they
yes('namesBehaviorPlainly', 'name-behavior-neutrally-1 (saved)', 'It sounds like whenever you try to talk about money, your husband leaves the room. Does it feel frustrating or perhaps lonely when that happens?');
yes('namesBehaviorPlainly', 'name-behavior-neutrally-2 (saved)', 'It sounds like it feels heavy when you ask a question and your manager responds with a sigh.');
yes('namesBehaviorPlainly', 'name-behavior-neutrally-3 (saved)', "It sounds like when you try to share your day, your sister moves the conversation to something else.");
yes('namesBehaviorPlainly', 'name-behavior-neutrally-4 (saved)', "It sounds like it's frustrating when you're trying to speak during dinner and your dad interrupts you.");
yes('namesBehaviorPlainly', 'synthetic: every time', 'Every time you mention the bills, your boss goes quiet.');
yes('namesBehaviorPlainly', 'the old he/she form still counts', 'So what happens is that he leaves the room when money comes up.');
no('namesBehaviorPlainly', 'a feeling only', 'It sounds like you are really lonely at dinner.');
no('namesBehaviorPlainly', 'a verdict with a role is not an observable behaviour', 'Your manager is rude and disrespectful.');
no('namesBehaviorPlainly', 'the role is not the subject of a behaviour verb', 'You and your sister have been close for a long time.');

// ---- tellsWhatToDo: the false alarm goes, real instructions stay
no('tellsWhatToDo', 'permission-giving-4 (saved)', 'You are noticing a conflict between what you feel you should do and your actual desire for support.');
no('tellsWhatToDo', 'synthetic mirror', 'It sounds like you think you should be grateful for what you have.');
no('tellsWhatToDo', 'synthetic mirror, told', 'You were told you must always be easy to deal with.');
yes('tellsWhatToDo', 'you should leave', 'You should leave.');
yes('tellsWhatToDo', 'you need to tell her', 'I think you need to tell her tonight.');
yes('tellsWhatToDo', 'a mirror in one sentence does not hide an instruction in the next', 'You feel you should stay. But you must tell him first.');
yes('tellsWhatToDo', 'I think you should', 'I think you should call your mother.');
yes('tellsWhatToDo', 'you have to', 'You have to talk to him.');

// ---- makesRoomToFeel: the stem bug and the words of pain
yes('makesRoomToFeel', 'grieve-before-deciding-1 (saved): devastated', 'Since you mentioned feeling devastated, would you be willing to wonder what need might be sitting under that feeling?');
yes('makesRoomToFeel', 'grieve-before-deciding-2 (saved): pain', 'It sounds like you are in a lot of pain because of what has happened in your relationship.');
yes('makesRoomToFeel', 'grieve-before-deciding-3 (saved): heartbreak', 'Would you be willing to wonder what need might be sitting under that heartbreak?');
yes('makesRoomToFeel', 'grieve-before-deciding-4 (saved): fury', 'Would you be open to wondering what need might be sitting under that fury?');
yes('makesRoomToFeel', 'synthetic betrayed', 'Being betrayed like that is a hard thing to carry.');
yes('makesRoomToFeel', 'synthetic heartbroken', 'You are heartbroken, and that deserves some time.');
yes('makesRoomToFeel', 'the old wording still counts', 'That is a lot to take in, and it hurts.');
no('makesRoomToFeel', 'a plan', 'Here is a plan for next week.');
no('makesRoomToFeel', 'a neutral question', 'What would you like to do?');
no('makesRoomToFeel', 'no feeling word', 'It sounds like the conversation is on Sunday and you want to prepare.');

// ---- offersSmallStep: needs an actual small step offered or asked
no('offersSmallStep', 'smallest-next-step-1 (saved false pass)', "Does it feel like there is something making it difficult to take that first step?");
no('offersSmallStep', 'smallest-next-step-4 (saved false pass)', 'You have a clear sense of the task ahead, but there is a barrier standing between you and that first step. Does it feel like you might be running on empty?');
no('offersSmallStep', 'smallest-next-step-2 (saved)', 'What is it like for you when you think about reaching out to her?');
no('offersSmallStep', 'smallest-next-step-3 (saved)', 'What is it like for you to hold that intention without taking action?');
no('offersSmallStep', 'a bare "first step" statement', 'The first step is the hardest one.');
yes('offersSmallStep', 'the smallest step, asked', 'What is the smallest step you could take today, maybe just two minutes?');
yes('offersSmallStep', 'two minutes, offered', 'Maybe just open the file for two minutes.');
yes('offersSmallStep', 'one small first step', 'One small first step: put the brush out.');
yes('offersSmallStep', 'something lighter, asked', 'Would something lighter feel more possible, like finding the number?');
yes('offersSmallStep', 'how about one sentence', 'How about saying one sentence aloud, just to yourself?');
no('offersSmallStep', 'a small step named but only reflected', 'The smallest step feels huge right now.');

// ---- assignsMotiveOrVerdict / namesBehaviorNeutrally (two parts)
const nb = {
  saved1: 'It sounds like whenever you try to talk about money, your husband leaves the room. Does it feel frustrating or perhaps lonely when that happens?',
  saved2: 'It sounds like it feels heavy when you ask a question and your manager responds with a sigh. Does it feel like there might be a sense of frustration or perhaps discouragement underneath that?',
  saved3: 'It sounds like when you try to share your day, your sister moves the conversation to something else. Does it feel like you are experiencing some frustration or perhaps a sense of being overlooked?',
  saved4: "It sounds like it's frustrating when you're trying to speak during dinner and your dad interrupts you. Does it feel like there might be a need for being heard or perhaps a need for respect that isn't being met?",
};
for (const [k, t] of Object.entries(nb)) {
  yes('namesBehaviorNeutrally', `${k}: plain behaviour, no motive or verdict`, t);
  no('assignsMotiveOrVerdict', `${k}`, t);
}
yes('assignsMotiveOrVerdict', 'a motive with a role', 'Your husband leaves the room because he does not want to deal with it.');
yes('assignsMotiveOrVerdict', 'a verdict with a role', 'Your manager is dismissive, and your sister is selfish.');
yes('assignsMotiveOrVerdict', 'a motive with a pronoun', 'He is trying to dismiss you.');
yes('assignsMotiveOrVerdict', 'on purpose', 'Your dad interrupts you on purpose.');
no('assignsMotiveOrVerdict', 'hedged, a question about the other person', 'I wonder whether your manager is distracted when she sighs.');
no('assignsMotiveOrVerdict', 'the person\'s need for respect is not a verdict on the father', 'Is there a need for respect that is not being met?');
no('namesBehaviorNeutrally', 'behaviour with a motive attached', 'When you ask a question, your manager sighs because she thinks you are a bother.');
no('namesBehaviorNeutrally', 'behaviour with a verdict attached', 'Your husband leaves the room whenever money comes up. He is dismissive.');
no('namesBehaviorNeutrally', 'no behaviour at all', 'It sounds like you are lonely at dinner.');

// ---- makesRoomWithoutDeciding (two parts)
yes('makesRoomWithoutDeciding', 'room offered, nothing decided', 'That is a lot of pain, and there is room for it before any decision. Would you like to sit with it first?');
yes('makesRoomWithoutDeciding', 'no rush', 'It sounds like you are devastated. There is no rush to know anything tonight.');
no('makesRoomWithoutDeciding', 'grieve-before-deciding-2 (saved): names the pain, offers no room', 'It sounds like you are in a lot of pain because of what has happened in your relationship. What need do you think sits under that?');
no('makesRoomWithoutDeciding', 'grieve-before-deciding-3 (saved)', 'Would you be willing to wonder what need might be sitting under that heartbreak?');
no('makesRoomWithoutDeciding', 'room offered but told to wait', 'That is a lot of pain. Please wait a few days before you decide.');
no('makesRoomWithoutDeciding', 'room offered but told what to do', 'You are in so much pain. There is no rush, but you should leave him.');
no('makesRoomWithoutDeciding', 'no room and no feeling', 'What would you like to do?');

// ---- the cases: the new two-part checks are review checks on their modules and never gates
const cases = (m: string) => MOVE_CASES.filter((c) => c.module === m);
ok('name_behavior_neutrally cases show the two-part check and the verdict check for review, not as a gate', cases('name_behavior_neutrally').every((c) => c.review?.includes('namesBehaviorNeutrally') && c.review.includes('assignsMotiveOrVerdict') && !c.mustNot?.includes('assignsMotiveOrVerdict') && !(c.mustAny ?? []).flat().includes('namesBehaviorNeutrally')));
ok('grieve_before_deciding cases show makesRoomWithoutDeciding for review, not as a gate', cases('grieve_before_deciding').every((c) => c.review?.includes('makesRoomWithoutDeciding') && !(c.mustAny ?? []).flat().includes('makesRoomWithoutDeciding')));
