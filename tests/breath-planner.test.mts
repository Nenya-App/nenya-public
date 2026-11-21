// Switching the tone style while a breath is playing: the new style starts on the next breath, never midway; a change of
// rhythm still restarts at once. The planner is pure, so a whole session is played through it here, tick by tick.
import { createPlanner } from '../src/lib/breathTones.ts';
import type { Arrangement } from '../src/lib/breathArrangements.ts';
import { ok } from './helpers.mts';

const T55 = { ih: 5000, hi: 0, ex: 5000, ho: 0 }; // a 10 second breath
const START = 1_000_000;

type Ev = { at: number; timbre: string; freq: number; kind: string; tick: number };
/** Plays [from, to) in 150 ms ticks, letting `choose` say which style is wanted at each moment. */
function session(opts: { from: number; to: number; timing?: typeof T55; cycleStart?: number; choose: (now: number) => Arrangement; timingAt?: (now: number) => { timing: typeof T55; cycleStart: number } }) {
  const plan = createPlanner();
  const events: Ev[] = [];
  const restarts: number[] = [];
  const actives: Arrangement[] = [];
  for (let now = opts.from; now < opts.to; now += 150) {
    const st = opts.timingAt ? opts.timingAt(now) : { timing: opts.timing ?? T55, cycleStart: opts.cycleStart ?? START };
    const r = plan(now, { ...st, arrangement: opts.choose(now) });
    if (r.restart) restarts.push(now);
    actives.push(r.active);
    events.push(...r.events.map((e) => ({ at: e.at, timbre: e.timbre, freq: e.freq, kind: e.kind, tick: now })));
  }
  return { events, restarts, actives };
}
const HARP = new Set(['harp']);
const BOWLS = new Set(['bowl', 'pad', 'tick']);

// ---- no switch: a steady stream with nothing missed or doubled
const steady = session({ from: START + 100, to: START + 30_000, choose: () => 'harp' });
const ats = steady.events.map((e) => e.at);
ok('with no switch every note of three breaths is scheduled exactly once', new Set(ats).size === ats.length && steady.events.length >= 29 && steady.events.every((e) => HARP.has(e.timbre)));
ok('nothing restarts when nothing changes', steady.restarts.length === 0);

// ---- a switch in the middle of a breath
const SWITCH_AT = START + 4_000; // 4 s into the first breath (the harp is playing)
const mid = session({ from: START + 100, to: START + 32_000, choose: (now) => (now < SWITCH_AT ? 'harp' : 'bowls') });
const NEXT = START + 10_000;
const before = mid.events.filter((e) => e.at < NEXT), after = mid.events.filter((e) => e.at >= NEXT);
ok('the rest of the breath that was playing is still the old style', before.length > 0 && before.every((e) => HARP.has(e.timbre)), before.map((e) => e.timbre).join());
ok('nothing of the new style is heard before the next breath begins', before.every((e) => !BOWLS.has(e.timbre)));
ok('the new style begins exactly on the first beat of the next breath, with its opening bowl', after.length > 0 && after[0].at === NEXT && after.filter((e) => e.at === NEXT).some((e) => e.timbre === 'bowl') && after.every((e) => BOWLS.has(e.timbre)));
ok('nothing is doubled or dropped across the switch', new Set(mid.events.map((e) => `${e.at}.${e.timbre}.${e.freq}`)).size === mid.events.length);
ok('the old style\'s notes are not cut: no restart is asked for', mid.restarts.length === 0);
ok('the active style changes only when the next breath is reached', mid.actives[0] === 'harp' && mid.actives[mid.actives.length - 1] === 'bowls');

// ---- a switch just before the next breath, when its first notes are already scheduled
const late = session({ from: START + 100, to: START + 32_000, choose: (now) => (now < START + 9_800 ? 'harp' : 'chord') });
const lateBefore = late.events.filter((e) => e.at < START + 20_000);
ok('a switch so late that the next breath is already scheduled starts one breath after that, with nothing cut', lateBefore.every((e) => HARP.has(e.timbre)) && late.events.filter((e) => e.at >= START + 20_000)[0]?.at === START + 20_000 && late.events.some((e) => e.at === START + 10_000 && e.timbre === 'harp'));

// ---- changing your mind
const back = session({ from: START + 100, to: START + 30_000, choose: (now) => (now >= START + 3_000 && now < START + 6_000 ? 'chord' : 'harp') });
ok('switching back before the next breath cancels the switch: all harp', back.events.every((e) => HARP.has(e.timbre)));
const twice = session({ from: START + 100, to: START + 22_000, choose: (now) => (now < START + 3_000 ? 'harp' : now < START + 6_000 ? 'chord' : 'bowls') });
ok('choosing twice before the next breath uses the last choice, on the same breath', twice.events.filter((e) => e.at < START + 10_000).every((e) => HARP.has(e.timbre)) && twice.events.filter((e) => e.at >= START + 10_000 && e.at < START + 20_000).every((e) => BOWLS.has(e.timbre)) && twice.events.some((e) => e.at === START + 10_000 && e.timbre === 'bowl'));
ok('an unrelated style in between never sounds', !twice.events.some((e) => e.timbre === 'pad' && e.at < START + 10_000));

// ---- a change of rhythm still restarts at once (the counter and ring restart with it)
const NOWR = START + 4_000;
const rhythm = session({
  from: START + 100, to: START + 20_000, choose: () => 'harp',
  timingAt: (now) => (now < NOWR ? { timing: T55, cycleStart: START } : { timing: { ih: 4000, hi: 0, ex: 6000, ho: 0 }, cycleStart: NOWR }),
});
ok('a new rhythm asks for a restart once, at the moment it changes', rhythm.restarts.length === 1 && rhythm.restarts[0] === NOWR);
ok('the new rhythm\'s first note is heard right away (within the look-ahead), not a breath later', rhythm.events.some((e) => e.at >= NOWR && e.at < NOWR + 700 && e.at === NOWR));
ok('the new rhythm and style together: sounds scheduled after the change (the earlier ones are silenced by the restart) are all the chosen style', session({ from: START + 100, to: START + 8_000, choose: (now) => (now < NOWR ? 'harp' : 'bowls'), timingAt: (now) => (now < NOWR ? { timing: T55, cycleStart: START } : { timing: { ih: 4000, hi: 0, ex: 6000, ho: 0 }, cycleStart: NOWR }) }).events.filter((e) => e.tick >= NOWR).every((e) => BOWLS.has(e.timbre)));

// ---- other rhythms: the boundary is that rhythm's own breath
const box = session({ from: START + 100, to: START + 40_000, timing: { ih: 4000, hi: 4000, ex: 4000, ho: 4000 }, choose: (now) => (now < START + 5_000 ? 'harp' : 'chord') });
ok('box breathing (a 16 second breath): the switch lands on its 16 second boundary', box.events.filter((e) => e.at < START + 16_000).every((e) => HARP.has(e.timbre)) && box.events.filter((e) => e.at >= START + 16_000)[0].at === START + 16_000 && box.events.filter((e) => e.at >= START + 16_000).every((e) => !HARP.has(e.timbre)));
ok('a degenerate rhythm of zero length does not hang or throw', (() => { const p = createPlanner(); try { p(1000, { timing: { ih: 0, hi: 0, ex: 0, ho: 0 }, cycleStart: 0, arrangement: 'harp' }); p(1150, { timing: { ih: 0, hi: 0, ex: 0, ho: 0 }, cycleStart: 0, arrangement: 'bowls' }); return true; } catch { return false; } })());

// ---- tapping in: switching the tones on part way through a breath starts at the next inhale, never over the preview note
import { firstBreathStart, TAP_IN_MS } from '../src/lib/breathTones.ts';
const CYCLE = 10_000;
ok('just after an inhale began, that inhale is played', firstBreathStart(START + 100, START, CYCLE) === START);
ok('part way through a breath, the next inhale is the first', firstBreathStart(START + 4_000, START, CYCLE) === START + CYCLE && firstBreathStart(START + CYCLE + 5_000, START, CYCLE) === START + 2 * CYCLE);
ok('the edge of the tap-in window', firstBreathStart(START + TAP_IN_MS, START, CYCLE) === START && firstBreathStart(START + TAP_IN_MS + 1, START, CYCLE) === START + CYCLE);
ok('a degenerate breath of no length does not hang', firstBreathStart(START, START, 0) === START);
const midJoin = session({ from: START + 4_000, to: START + 4_000 + 18_000, choose: () => 'bowls' });
ok('switched on mid-breath: nothing sounds until the next inhale, then the first sound is the start of that breath', midJoin.events.length > 0 && Math.min(...midJoin.events.map((e) => e.at)) >= START + CYCLE - 1 && midJoin.events.filter((e) => e.at < START + CYCLE).length === 0);
const midFirst = midJoin.events.filter((e) => e.at === Math.min(...midJoin.events.map((x) => x.at)));
ok('and that first sound is the opening bowl of the inhale', midFirst.some((e) => e.timbre === 'bowl' && e.kind === 'inhale'));
const early = session({ from: START + 100, to: START + 3_000, choose: () => 'bowls' });
ok('switched on just after an inhale began: that inhale is played', early.events.some((e) => e.at === START && e.timbre === 'bowl'));
const noDouble = session({ from: START + 4_000, to: START + 4_000 + 30_000, choose: () => 'harp' });
ok('no note is scheduled twice when joining mid-breath', new Set(noDouble.events.map((e) => `${e.at}|${e.freq}|${e.timbre}`)).size === noDouble.events.length);
const rhythmAfter = session({ from: START + 4_000, to: START + 4_000 + 12_000, choose: () => 'bowls', timingAt: (now) => ({ timing: T55, cycleStart: now < START + 8_000 ? START : START + 8_000 }) });
ok('a change of rhythm after tapping in still restarts at once', rhythmAfter.restarts.length === 1);
