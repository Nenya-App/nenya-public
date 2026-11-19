// The ring and the counter stay locked to one clock (owner, 2026-11-18: they drifted apart after a while): the ring's own animation is set back to the shared clock when it has drifted.
import { readFileSync } from 'node:fs';
import { ringCorrection, breathCounter } from '../src/lib/breathClock.ts';
import { ok } from './helpers.mts';

const cycle = 10000;
ok('no correction when the ring is on the shared clock, or within 30 ms of it', ringCorrection(23000, 0.3, cycle) === 0 && ringCorrection(23010, 0.3, cycle) === 0 && ringCorrection(22980, 0.3, cycle) === 0);
ok('a ring that has fallen behind is moved forward by exactly the gap', ringCorrection(23500, 0.3, cycle) === 500 && ringCorrection(23000, 0.25, cycle) === 500);
ok('a ring that has run ahead is moved back by exactly the gap', ringCorrection(23000, 0.35, cycle) === -500);
ok('it takes the short way round the cycle (a ring just past the start against a clock just before the end)', ringCorrection(29900, 0.01, cycle) === -200 && ringCorrection(20100, 0.99, cycle) === 200);
ok('after the correction the ring and the counter agree about where in the breath they are', (() => { const t = 43350, have = 0.18; const d = ringCorrection(t, have, cycle); const ringMs = have * cycle + d; const c = breathCounter(t, { ih: 5000, ex: 5000 }); return Math.abs(ringMs - (t % cycle)) <= 1 && c.phase === 'i' && c.count === 4; })());
ok('nonsense is ignored rather than moving the ring', ringCorrection(NaN, 0.3, cycle) === 0 && ringCorrection(1000, NaN, cycle) === 0 && ringCorrection(1000, 0.3, 0) === 0);
const src = readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8');
ok('the ring is locked once a second, when the tab returns, on focus and on page show, and only while it is running', /setInterval\(lock, 1000\)/.test(src) && /visibilitychange/.test(src) && /'focus', lock/.test(src) && /'pageshow', lock/.test(src) && /playState !== 'running'/.test(src) && /ringCorrection\(Date\.now\(\) - start, progress, cycleMs\)/.test(src) && /ref=\{ringRef\}/.test(src));
ok('the counter reads the same wall clock the ring is locked to', /Date\.now\(\) - start/.test(readFileSync('src/app/components/BreathingCounter.tsx', 'utf8')));
