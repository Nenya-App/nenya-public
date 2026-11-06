// The last reply has to read as an ending: it may not ask a question or invite a reply.
import { ok } from './helpers.mts';
import { asksOrInvites, closingPhase, CLOSE_FALLBACK, sentences, settleReply } from '../src/lib/coachClosing.ts';

// phases follow the maximum, so a longer conversation needs no other change
ok('five: exchange 5 closes, 4 invites, others neither', closingPhase(5, 5) === 'close' && closingPhase(4, 5) === 'invite' && [1, 2, 3].every((t) => closingPhase(t, 5) === null));
ok('seven: the last two follow the new maximum', closingPhase(7, 7) === 'close' && closingPhase(6, 7) === 'invite' && closingPhase(5, 7) === null);
ok('ten', closingPhase(10, 10) === 'close' && closingPhase(9, 10) === 'invite' && closingPhase(5, 10) === null);

// detection
ok('a question mark is caught', asksOrInvites('You carried a lot this week. What would help most?'));
ok('a full-width question mark is caught', asksOrInvites('それは大変でしたね？'));
for (const t of ['Let me know how it goes.', 'Feel free to share more.', 'I would love to hear what happens.', 'I am here if you want to continue.', 'We can keep exploring this next time.']) {
  ok(`an invitation without a question mark is caught: ${t}`, asksOrInvites(t));
}
ok('a settled closing is not flagged', !asksOrInvites('You said the quiet at home weighs on you. The way you spoke up for yourself is yours to keep. It is enough for today.'));
ok('a question inside quotes, with the sentence going on, is one sentence', sentences('You asked "why would she do that?" and it stayed with you. That matters.').length === 2);

// settling
const messy = 'You said it felt like no one listens. Saying it out loud was a step. What do you need next? Let me know.';
const s1 = settleReply(messy);
ok('the questions and invitations are dropped', s1 === 'You said it felt like no one listens. Saying it out loud was a step.');
ok('the result no longer asks', !asksOrInvites(s1));
ok('only a question: the settling line stands alone', settleReply('What would help you most?') === CLOSE_FALLBACK);
ok('a very short remainder gets the settling line after it', settleReply('I hear you. What do you need?') === `I hear you. ${CLOSE_FALLBACK}`);
ok('nothing is changed when nothing asks', settleReply('That is yours to keep. It is enough.') === 'That is yours to keep. It is enough.');
ok('the fallback itself asks nothing', !asksOrInvites(CLOSE_FALLBACK));
