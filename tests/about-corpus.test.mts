// The synthetic corpus (src/lib/aboutEvalCorpus.ts, written 2026-11-09) against the detector: every phrasing routes to the answer it was written for,
// nothing in the ordinary-message set is taken for a question about Nenya, and a long message gets an answer-first reply only when it contains one.
// The phrasings and the patterns were written together, so a perfect score here is a regression guard, not proof about real people: see the note in
// docs/about-nenya-questions-scope.md on what is still to be measured on real messages.
import { POSITIVES, NEGATIVES, LONG, LONG_QUIET, AMBIGUOUS } from '../src/lib/aboutEvalCorpus.ts';
import { ANSWERS, detectAboutNenya, aboutAnswerWithin, liveAnswers } from '../src/lib/aboutNenya.ts';
import { ok } from './helpers.mts';

const ids = new Set(ANSWERS.map((a) => a.id));
ok('every positive list belongs to a real answer, and has at least six phrasings', Object.entries(POSITIVES).every(([id, l]) => ids.has(id) && l.length >= 6));
const all = Object.values(POSITIVES).flat();
ok('the corpus covers every answer except the one that is the hostile-turn script (c-angry)', ANSWERS.filter((a) => a.id !== 'c-angry').every((a) => (POSITIVES[a.id] ?? []).length > 0));
ok('no phrasing is listed twice', new Set(all.map((x) => x.toLowerCase())).size === all.length && new Set(NEGATIVES).size === NEGATIVES.length);

const wrong = Object.entries(POSITIVES).flatMap(([id, l]) => l.filter((t) => detectAboutNenya(t) !== id).map((t) => `${id} <- "${t}" => ${detectAboutNenya(t)}`));
ok(`every synthetic phrasing routes to its answer (${all.length})`, wrong.length === 0, wrong.join(' | '));
const fp = NEGATIVES.filter((t) => detectAboutNenya(t));
ok(`none of the ${NEGATIVES.length} ordinary messages is taken for a question about Nenya`, fp.length === 0, fp.map((t) => `"${t}" => ${detectAboutNenya(t)}`).join(' | '));

ok('the long messages are over the whole-message limit', LONG.every((x) => x.text.length > 300) && LONG_QUIET.every((t) => t.length > 300));
const live = new Set(liveAnswers().map((a) => a.id));
const lm = LONG.filter((x) => live.has(x.id) && aboutAnswerWithin(x.text)?.id !== x.id);
ok('a question about Nenya inside a long message is found (for the live answers)', lm.length === 0, lm.map((x) => `${x.id} got ${aboutAnswerWithin(x.text)?.id}`).join(' | '));
ok('a question whose answer is not live yet (languages) is not answered', LONG.filter((x) => !live.has(x.id)).every((x) => aboutAnswerWithin(x.text) === null));
const lq = LONG_QUIET.filter((t) => aboutAnswerWithin(t));
ok('long messages that only share words get no answer-first reply', lq.length === 0, lq.map((t) => `${aboutAnswerWithin(t)?.id}: ${t.slice(0, 60)}`).join(' | '));
ok('the ambiguous list says what the site does and why', AMBIGUOUS.length >= 15 && AMBIGUOUS.every((a) => a.text && a.now && a.why));
ok('the ambiguous messages the owner may care about behave as the list says', detectAboutNenya('How do I contact a real person?') === null && detectAboutNenya('Can I talk to a person?') === 'n-contact' && detectAboutNenya('Are you real?') === 'c-ai' && detectAboutNenya('Is this normal?') === null && detectAboutNenya('Is it safe?') === 'n-privacy');
