// The pause (src/lib/pause.ts): the browser time, the minutes shown, the quiz and its pass mark, and what is kept.
const store: Record<string, string> = {};
(globalThis as any).localStorage = { get length() { return Object.keys(store).length; }, key: (i: number) => Object.keys(store)[i] ?? null, getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = String(v); }, removeItem: (k: string) => { delete store[k]; } };
(globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
import { ok } from './helpers.mts';
const p = await import('../src/lib/pause.ts');
const dm = await import('../src/lib/deviceMemory.ts');
const counters = await import('../src/lib/counters.ts');
const NOW = 1_800_000_000_000;

ok('a pause is ten minutes', p.PAUSE_MINUTES === 10);
ok('there is no pause until one is started', p.readPauseEnds(NOW) === 0);
const ends = p.startPause(NOW);
ok('starting one keeps only a time, ten minutes on', ends === NOW + 600000 && store[dm.PAUSE_KEY] === String(ends) && Object.keys(store).length === 1);
ok('while it lasts it is read back, and after it the pause is gone', p.readPauseEnds(NOW + 1000) === ends && p.readPauseEnds(ends) === 0 && p.readPauseEnds(ends + 1) === 0);
store[dm.PAUSE_KEY] = String(NOW + 3 * 3600000);
ok('a far-future time (a tampered or wrong clock) is not a pause', p.readPauseEnds(NOW) === 0);
store[dm.PAUSE_KEY] = 'soon';
ok('junk is not a pause', p.readPauseEnds(NOW) === 0);
p.startPause(NOW); p.clearPause();
ok('clearing removes it', !(dm.PAUSE_KEY in store));
ok('minutes left round up, never below one, and change once a minute', p.minutesLeft(NOW + 600000, NOW) === 10 && p.minutesLeft(NOW + 540001, NOW) === 10 && p.minutesLeft(NOW + 540000, NOW) === 9 && p.minutesLeft(NOW + 1, NOW) === 1 && p.minutesLeft(NOW - 5, NOW) === 1);

// Forget me and Emergency Exit
p.startPause(Date.now());
store['nenya.coach.owner'] = '1'; store['other.site'] = 'keep';
dm.wipeDevice({ keepOwner: true });
ok('Forget me removes the pause (it keeps the owner flag and other sites)', !(dm.PAUSE_KEY in store) && store['nenya.coach.owner'] === '1' && store['other.site'] === 'keep');
p.startPause(Date.now()); dm.wipeDevice({ keepOwner: false });
ok('Emergency Exit removes it too', !(dm.PAUSE_KEY in store));

// the quiz
const best = Object.fromEntries(p.QUIZ.map((q) => [q.id, q.best]));
ok('there are five questions, each with four options, one best answer that exists, and an explanation', p.QUIZ.length === 5 && p.QUIZ.every((q) => q.options.length === 4 && q.options.some((o) => o.id === q.best) && q.explanation.length > 80 && q.prompt.length > 10));
ok('the pass mark is all five', p.PASS_MARK === 5 && p.gradeAnswers(best).passed && p.gradeAnswers(best).correct === 5 && p.gradeAnswers(best).toReview.length === 0);
ok('four of five does not pass, and names the one to look at again', (() => { const g = p.gradeAnswers({ ...best, q3: 'a' }); return !g.passed && g.correct === 4 && g.toReview.join() === 'q3'; })());
ok('unanswered questions do not pass either', !p.gradeAnswers({}).passed && p.gradeAnswers({}).toReview.length === 5 && !p.gradeAnswers({ q1: best.q1 }).passed);
ok('the questions use "monsters", and no slur or name of a real group', p.QUIZ.some((q) => /monsters/.test(q.prompt)) && !/vermin|animals/.test(JSON.stringify(p.QUIZ)));
ok('the best answers are spread across the options, so there is no pattern to guess', new Set(p.QUIZ.map((q) => q.best)).size >= 2);
ok('the note on respectful use is three plain paragraphs and promises nothing about outcomes', p.RESPECTFUL_USE_NOTE.length === 3 && p.RESPECTFUL_USE_NOTE.every((t) => !/guarantee|always|reduce|prevent/.test(t)));
ok('nothing about the quiz is stored: grading touches no storage', (() => { const before = JSON.stringify(store); p.gradeAnswers(best); return JSON.stringify(store) === before; })());

// the counts
ok('the three browser counts are on the allowed list', ['coach.pause.begun', 'coach.pause.returned.waited', 'coach.pause.returned.quiz'].every((e) => (counters.BROWSER_FIXED_EVENTS as readonly string[]).includes(e)));
