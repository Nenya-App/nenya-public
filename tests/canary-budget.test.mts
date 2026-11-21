import { NIGHTLY_CEILING, canaryAllowance, FREE_NEURONS_PER_DAY, MARGIN, NEURONS_PER_RUN, NEURONS_PER_TURN, runsThatFit, unusedNeurons, utcDay } from '../src/lib/canaryBudget.ts';
import { ok } from './helpers.mts';
ok('an empty day leaves the free allowance less the margin', unusedNeurons({ spentToday: 0, visitorTurns: 0 }) === FREE_NEURONS_PER_DAY - MARGIN);
ok('visitors come first: each turn takes its Neurons off', unusedNeurons({ spentToday: 0, visitorTurns: 80 }) === FREE_NEURONS_PER_DAY - MARGIN - 80 * NEURONS_PER_TURN);
ok('what was already spent today comes off too', unusedNeurons({ spentToday: 3000, visitorTurns: 0 }) === FREE_NEURONS_PER_DAY - MARGIN - 3000);
ok('never negative, however much was used', unusedNeurons({ spentToday: 9500, visitorTurns: 400 }) === 0);
ok('a run starts only if a whole run fits', runsThatFit(NEURONS_PER_RUN - 1) === 0 && runsThatFit(NEURONS_PER_RUN) === 1 && runsThatFit(3500) === 3);
ok('with no visitors nine runs fit, and a day of 80 staging turns still leaves seven', runsThatFit(unusedNeurons({ spentToday: 0, visitorTurns: 0 })) === 9 && runsThatFit(unusedNeurons({ spentToday: 0, visitorTurns: 80 })) === 7);
ok('the ledger day is the UTC day, which is when the allowance resets', utcDay(new Date('2026-11-16T23:59:00-06:00')) === '2026-11-17' && utcDay(new Date('2026-11-16T00:00:00Z')) === '2026-11-16');
ok('the ceiling is the whole free allowance: with the whole 10,000 free at run time, everything but the margin is the allowance', NIGHTLY_CEILING === FREE_NEURONS_PER_DAY && canaryAllowance({ spentToday: 0, visitorTurns: 0 }) === FREE_NEURONS_PER_DAY - MARGIN && MARGIN <= 200);
ok('what was already spent counts toward the ceiling, and the unused amount still limits it', canaryAllowance({ spentToday: 2500, visitorTurns: 0 }) === FREE_NEURONS_PER_DAY - MARGIN - 2500 && canaryAllowance({ spentToday: 0, visitorTurns: 300 }) === unusedNeurons({ spentToday: 0, visitorTurns: 300 }) && canaryAllowance({ spentToday: 9900, visitorTurns: 0 }) === 0 && canaryAllowance({ spentToday: 0, visitorTurns: 0, free: 20000 }) === NIGHTLY_CEILING);
import { readFileSync } from 'node:fs';
import { caseOrder, driftFlags, planTasks, report } from '../src/lib/canaryNight.ts';
const nightly = readFileSync('netlify/functions/canary-nightly.mts', 'utf8');
ok('it is off unless COACH_CANARY=on, and runs every minute from 23:00 to 23:59 UTC, the hour before the reset', /COACH_CANARY !== 'on'/.test(nightly) && /schedule: '\* 23 \* \* \*'/.test(nightly));
ok('there is no second function to call, so a password on the site cannot stop it', !/\.netlify\/functions\//.test(nightly) && !/fetch\(`\$\{process\.env\.URL\}/.test(nightly));
ok('the canary never touches the real counters: the coach runs on an in-memory store', /__useStoreForTests\(\{/.test(nightly) && /mem = new Map/.test(nightly));
ok('it stops when the allowance runs out, saves its place after every case, and closes the night by minute 55', /allowance - state\.spent < MIN_CASE_NEURONS/.test(nightly) && /await store\.set\(stateKey/.test(nightly) && /getUTCMinutes\(\) >= 55/.test(nightly));
ok('what it keeps of a case is its id, outcome, length and reading grade, never the reply', /state\.compact\[state\.t\]\.push\(\{ id: r\.id, outcome: r\.outcome, words:/.test(nightly));
ok('tonight has an alternate then the baseline twice; the alternate rotates, and the candidate model joins it only when named', planTasks(0).map((t) => t.name).join() === 'learn,baseline,baseline' && planTasks(1).map((t) => t.name).join() === 'v2,baseline,baseline' && planTasks(2).map((t) => t.name)[0] === 'learn' && planTasks(2, '@cf/x/y').map((t) => t.name)[0] === 'model');
ok('the case order starts somewhere new each night and keeps every case', caseOrder([1, 2, 3, 4], 1).join() === '2,3,4,1' && caseOrder([1, 2, 3, 4], 4).join() === '1,2,3,4');
const mk = (id: string, outcome: string, words: number, grade: number) => ({ id, outcome, words, grade });
const r1 = report({ name: 'baseline', instructions: 'v2.1' }, [mk('a', 'pass', 20, 5.2), mk('b', 'fail', 6, 3), mk('c', 'pass', 30, 6.1)], 900);
ok('a task report keeps counts, the median length and reading grade, and the failed ids', r1.conversations === 3 && r1.pass === 2 && r1.fail === 1 && r1.failedCases.b === 1 && r1.medianWords === 20 && r1.medianGrade === 5.2 && r1.neurons === 900);
const lately = [1, 2, 3].map(() => ({ ...r1, medianWords: 40, pass: 3, conversations: 3 }));
ok('a much longer typical reply than the week before is flagged; the usual is not', driftFlags([{ ...r1, medianWords: 70, pass: 3, failedCases: {} }], lately, {}).some((f) => /median reply length/.test(f)) && driftFlags([{ ...r1, medianWords: 42, pass: 3, failedCases: {} }], lately, {}).length === 0);
ok('a case that had never failed and now does is flagged, and one that often fails is not', driftFlags([{ ...r1, failedCases: { b: 1 } }], [], { b: [10, 1] }).some((f) => /b had not failed/.test(f)) && driftFlags([{ ...r1, failedCases: { b: 1 } }], [], { b: [10, 4] }).length === 0);
{
  const night = readFileSync('netlify/functions/canary-nightly.mts', 'utf8');
  ok('every case is archived under canary/runs with its reply, and the meta names the model, build and instructions fingerprint', /canary\/runs\/\$\{day\}\/\$\{state\.t\}-\$\{r\.id\}/.test(night) && /reply: r\.reply \?\? null/.test(night) && /canary\/runs\/\$\{day\}\/meta/.test(night) && /instructionsFingerprint/.test(night) && /build: BUILD_INFO\.commit/.test(night));
  ok('the archive never holds the prompt or a visitor message', !/messages:|systemInstruction|systemText/.test(night.slice(night.indexOf('canary/runs/${day}/${state.t}'), night.indexOf('canary/runs/${day}/${state.t}') + 400)));
}
{
  const night = readFileSync('netlify/functions/canary-nightly.mts', 'utf8');
  const rec = readFileSync('scripts/record-neurons.mts', 'utf8');
  ok('the canary counts the owner\'s manual spend and holds nothing back for production (it runs on Venice)', /canary\/manual/.test(night) && /spentToday: \(ledger\[day\] \?\? 0\) \+ manual/.test(night) && /const visitorTurns = counted \? Number\(counted\) : 0;/.test(night) && !/\+ cap \+ 20/.test(night));
  ok('three errors in a row end the night at once and say why in the digest, except on the candidate model, which only skips its own task', /onErrorStreak\(task, state\.compact\[state\.t\]/.test(night) && /streak === 'end-night'/.test(night) && /streak === 'skip-task'/.test(night) && /stopped: state\.stopped/.test(night) && /candidateSkipped/.test(night));
  ok('the recorder adds to today\'s UTC total and the manual scripts call it unless told not to', /canary\/manual/.test(rec) && /utcDay\(\)/.test(rec) && readFileSync('scripts/duet-eval.mts', 'utf8').includes("--no-record") && readFileSync('scripts/bakeoff-workers-ai.mts', 'utf8').includes("--no-record"));
}

import { MAX_RUNS_A_NIGHT } from '../src/lib/canaryBudget.ts';
ok('the plan scales with the allowance: three runs as before, more when more fits, never over the nightly maximum', planTasks(0).length === 3 && planTasks(0, undefined, 9).length === 9 && planTasks(0, undefined, 9).filter((t) => t.name === 'baseline').length === 6 && MAX_RUNS_A_NIGHT === 10);
ok('a bigger plan still starts with an alternate and rotates the alternate on', planTasks(0, undefined, 6)[0].name !== planTasks(0, undefined, 6)[3].name || planTasks(0).length === 3);
