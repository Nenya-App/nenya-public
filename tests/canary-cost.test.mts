import { readFileSync } from 'node:fs';
import { costSummary, sendBackFlag, sendBacksIn } from '../src/lib/canaryCost.ts';
import { driftFlags, report } from '../src/lib/canaryNight.ts';
import { ok } from './helpers.mts';

ok('send-backs are the calls beyond the first on each turn; a turn with no call adds none', sendBacksIn([1]) === 0 && sendBacksIn([2]) === 1 && sendBacksIn([1, 3, 2]) === 3 && sendBacksIn([0, 1]) === 0 && sendBacksIn([]) === 0);
const mk = (outcome: string, neurons: number, calls: number[]) => ({ outcome, neurons, calls });
const s = costSummary([mk('pass', 100, [1]), mk('pass', 300, [2]), mk('fail', 200, [1, 3]), mk('pass', 400, [1])]);
ok('count and rate of send-backs per turn', s.cases === 4 && s.turns === 5 && s.modelCalls === 8 && s.sendBacks === 3 && s.sendBackRate === 0.6, JSON.stringify(s));
ok('median and mean Neurons per case (even count: the two middle ones averaged)', s.neuronsPerCaseMedian === 250 && s.neuronsPerCaseMean === 250);
ok('an odd count gives the middle case', costSummary([mk('pass', 10, [1]), mk('pass', 90, [1]), mk('pass', 20, [1])]).neuronsPerCaseMedian === 20);
ok('errored cases and cases saved without call data are left out', costSummary([mk('error', 0, [1]), { outcome: 'pass', neurons: 50 }, mk('pass', 70, [2])]).cases === 1);
const empty = costSummary([]);
ok('an empty night is all zeros, with no division by zero', empty.cases === 0 && empty.turns === 0 && empty.sendBacks === 0 && empty.sendBackRate === 0 && empty.neuronsPerCaseMedian === 0 && empty.neuronsPerCaseMean === 0);
ok('no text field can appear: every value is a number (or the by-note counts), and the keys are the fixed ones', (() => { const x = costSummary([{ outcome: 'pass', neurons: 5, calls: [1], reply: 'hello', text: 'hi' } as any]); const { sendBacksByNote, ...rest } = x; return Object.values(rest).every((v) => typeof v === 'number') && Object.values(sendBacksByNote).every((v) => typeof v === 'number') && Object.keys(x).join() === 'cases,turns,modelCalls,sendBacks,sendBackRate,neuronsPerCaseMedian,neuronsPerCaseMean,sendBacksByNote'; })());
// 2026-11-22: send-backs by the site note that asked again
const byNote = costSummary([{ outcome: 'pass', neurons: 5, calls: [2], asked: ['Your previous attempt repeated words you had already given earlier in this conversation. Do not'] }, { outcome: 'pass', neurons: 5, calls: [2, 2], asked: ['Your previous attempt repeated words you had alr', 'Your last reply repeated a name or a cap'] }, { outcome: 'pass', neurons: 5, calls: [2], asked: ['someone typed this'] }]).sendBacksByNote;
ok('send-backs are counted by the first 40 characters of the site note, and anything not starting with "Your " is "other"', byNote['Your previous attempt repeated words you'] === 2 && byNote['Your last reply repeated a name or a cap'] === 1 && byNote.other === 1 && Object.keys(byNote).length === 3);

const withCalls = [{ id: 'a', outcome: 'pass', words: 20, grade: 5, neurons: 100, calls: [1] }, { id: 'b', outcome: 'pass', words: 30, grade: 6, neurons: 200, calls: [2] }];
const r = report({ name: 'baseline', instructions: 'v2.1' }, withCalls, 300);
ok('a task report carries cost and the rate, and holds only numbers and the old fields', r.cost?.sendBacks === 1 && r.sendBackRate === 0.5 && !JSON.stringify(r).includes('hello') && report({ name: 'x', instructions: 'v2.1' }, [{ id: 'a', outcome: 'pass', words: 3, grade: 1 }], 5).cost === undefined);
const quiet = [1, 2, 3].map(() => ({ ...r, medianWords: 30, pass: 2, conversations: 2, sendBackRate: 0.1 }));
ok('send-backs well above the last week are flagged; the usual and a short history are not', sendBackFlag(0.5, [0.1, 0.1, 0.1]) !== null && sendBackFlag(0.12, [0.1, 0.1, 0.1]) === null && sendBackFlag(0.5, [0.1, 0.1]) === null && sendBackFlag(0.5, [0.1, 0.1, undefined]) === null && sendBackFlag(0.3, [0, 0, 0]) !== null && sendBackFlag(0.1, [0, 0, 0]) === null);
ok('the drift flags include it, and the old flags still work beside it', driftFlags([{ ...r, sendBackRate: 0.6 }], quiet, {}).some((f) => /send-backs/.test(f)) && driftFlags([{ ...r, sendBackRate: 0.1 }], quiet, {}).length === 0);
const night = readFileSync('netlify/functions/canary-nightly.mts', 'utf8');
ok('the function reads calls per turn from the trace and puts only numbers in the digest', /__trace\.on\(true\)/.test(night) && /turnCalls\.push\(tr\.calls\)/.test(night) && /turnAsked/.test(night) && /\.\.\.nightCost/.test(night) && !/__trace\.text\s*=/.test(night));
