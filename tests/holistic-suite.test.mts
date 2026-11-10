// The holistic suite's own consistency: its scenarios are well formed, and the ones that depend only on the site's code (the lane, the history cards' triggers, the site-written answers) agree
// with that code, so a scenario can never fail for being written wrong.
import { SCENARIOS, GROUPS, evaluate, type Turn } from '../src/lib/holisticSuite.ts';
import { laneFor, laneReply } from '../src/lib/laneGuard.ts';
import { historyHits, offerFor } from '../src/lib/learningOffer.ts';
import { aboutAnswerFor } from '../src/lib/aboutNenya.ts';
import { ok } from './helpers.mts';

ok('every scenario has a unique id, a group, at least one message and a hard check', new Set(SCENARIOS.map((s) => s.id)).size === SCENARIOS.length && SCENARIOS.every((s) => s.group && s.say.length > 0 && s.checks.some((c) => c.level === 'hard')));
ok('the suite covers the groups it promises', ['lane', 'site-answers', 'safety', 'practice-arc', 'world-questions', 'names', 'history', 'learn'].every((g) => GROUPS.includes(g)) && SCENARIOS.length >= 45);
ok('every "needs" is a known switch', SCENARIOS.every((s) => (s.needs ?? []).every((n) => ['arc', 'values', 'offers', 'learn'].includes(n))));

for (const s of SCENARIOS.filter((x) => x.id.startsWith('lane-') && !x.id.startsWith('lane-stays'))) ok(`the code answers "${s.say[0]}" with the lane guard`, laneFor(s.say[0]) !== null);
for (const s of SCENARIOS.filter((x) => x.id.startsWith('lane-stays'))) ok(`the code leaves "${s.say[0]}" to the coach`, laneFor(s.say[0]) === null);
const cardOf = (t: string) => offerFor({ hits: historyHits(t), text: t, shown: [], available: ['hist-01', 'hist-02', 'hist-03', 'hist-04'], flagged: false, abuseAtCoach: false })?.id ?? '';
for (const [id, want] of [['hist-denial-offer', 'hist-02'], ['hist-removal-offer', 'hist-03'], ['hist-colonizer-offer', 'hist-04'], ['hist-reporting-no-offer', ''], ['hist-discussion-no-offer', '']] as const) {
  const s = SCENARIOS.find((x) => x.id === id)!;
  ok(`the code's offer for ${id} is "${want || 'none'}"`, cardOf(s.say[0]) === want);
}
for (const [id, want] of [['site-gaza', 'h-genocide'], ['site-apartheid', 'h-apartheid'], ['site-colonial', 'h-colonization'], ['site-political', 'h-political'], ['site-belief', 'h-belief']] as const) {
  ok(`the site-written answer for ${id} is ${want}`, aboutAnswerFor(SCENARIOS.find((x) => x.id === id)!.say[0])?.id === want);
}
ok('a survivor\'s words get no site answer', aboutAnswerFor(SCENARIOS.find((x) => x.id === 'site-survivor-no-card')!.say[0]) === null);

// the evaluator
const turn = (o: Partial<Turn>): Turn => ({ say: 'x', reply: 'ok', turn: 1, done: false, status: 200, flag: '', blocked: '', card: '', offer: '', ...o });
const lane = SCENARIOS.find((x) => x.id === 'lane-media-1')!;
ok('a correct lane reply passes; an ordinary reply fails the hard check', evaluate(lane, [turn({ reply: laneReply('media', false) })]).hardFailed.length === 0 && evaluate(lane, [turn({ reply: 'Sure, here is a picture.' })]).hardFailed.length > 0);
const five = SCENARIOS.find((x) => x.id === 'arc-five')!;
const mk = (last: Partial<Turn>) => [turn({ turn: 1 }), turn({ turn: 2 }), turn({ turn: 3 }), turn({ turn: 4, reply: 'What request would help?' }), turn({ turn: 5, ...last })];
ok('the last exchange must end the conversation with no question', evaluate(five, mk({ done: true, reply: 'You said it matters. That is yours to keep.' })).hardFailed.length === 0 && evaluate(five, mk({ done: true, reply: 'Is there more?' })).hardFailed.length > 0 && evaluate(five, mk({ done: false, reply: 'Done.' })).hardFailed.length > 0);
const denial = SCENARIOS.find((x) => x.id === 'values-denial')!;
ok('a soft check reports a miss without failing hard', (() => { const r = evaluate(denial, [turn({ reply: 'There are different opinions on that.' })]); return r.hardFailed.length === 0 && r.softMissed.length === 2; })());
ok('a check that throws counts as a miss, not a crash', evaluate({ id: 'x', group: 'g', say: ['a'], checks: [{ level: 'hard', what: 'boom', test: () => { throw new Error('x'); } }] }, [turn({})]).hardFailed.length === 1);
