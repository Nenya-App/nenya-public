// The outer ring's movement (docs/outer-ring-movement.md): the turn maths, the 2 rpm limit, the direction, the defaults, the settings panel's wiring, and that Stop motion / reduced motion still win.
import { readFileSync } from 'node:fs';
import {
  BREATH_TURN_DENOMINATORS, DEFAULT_BREATH_TURN, DEFAULT_OUTER_RING_SECONDS, OUTER_RING_MAX_RPM, OUTER_RING_MAX_SECONDS, OUTER_RING_MIN_SECONDS, OUTER_RING_STEP_SECONDS,
  breathClamp, breathPaceNote, breathPacedTurns, breathTurnProfile, breathTurnLabel, continuityOffset, directionSign, formatRpm, paceLabel, ringAngleDeg, ringPeakRpm, rpmFromSeconds,
  secondsFromRpm, snapBreathTurn, snapOuterRingSeconds, snapRingDirection, wrapDeg, type RingMotion,
} from '../src/lib/outerRing.ts';
import { breathFractions } from '../src/lib/breathClock.ts';
import { PRESETS } from '../src/lib/breathingPresets.ts';
import { DEFAULT_INNER_ORBIT, DEFAULT_OUTER_ORBIT } from '../src/lib/orbitLook.ts';
import { motionPlan, type MotionSettings } from '../src/lib/motionStop.ts';
import { ok } from './helpers.mts';

const src = (p: string) => readFileSync(p, 'utf8');
const near = (a: number, b: number, e = 1e-9) => Math.abs(a - b) <= e;
const T66 = { ih: 6000, hi: 0, ex: 6000, ho: 0 };

// Seconds per turn and turns a minute.
ok('rpm and seconds per turn are each other\'s inverse', near(rpmFromSeconds(144), 60 / 144) && near(secondsFromRpm(2), 30) && near(secondsFromRpm(rpmFromSeconds(77)), 77));
ok('the limits: 30 s per turn is exactly 2 rpm, 300 s is 0.2 rpm, the default is 144 s (about 0.42 rpm)', OUTER_RING_MIN_SECONDS === 30 && OUTER_RING_MAX_SECONDS === 300 && rpmFromSeconds(30) === OUTER_RING_MAX_RPM && near(rpmFromSeconds(300), 0.2) && DEFAULT_OUTER_RING_SECONDS === 144 && formatRpm(rpmFromSeconds(144)) === '0.42');
ok('the label says seconds per turn and the rpm', paceLabel(144) === '144 s per turn (0.42 rpm)' && paceLabel(30) === '30 s per turn (2 rpm)' && paceLabel(300) === '300 s per turn (0.2 rpm)');
ok('the slider steps (6 s from 30) land on 30, the default 144 and 300', (144 - 30) % OUTER_RING_STEP_SECONDS === 0 && (300 - 30) % OUTER_RING_STEP_SECONDS === 0);
ok('a pace is held to 30..300 and to the steps; junk is the default', snapOuterRingSeconds(5) === 30 && snapOuterRingSeconds(-10) === 30 && snapOuterRingSeconds(999) === 300 && snapOuterRingSeconds(146) === 144 && snapOuterRingSeconds(147) === 150 && snapOuterRingSeconds(NaN) === 144 && snapOuterRingSeconds('x') === 144 && snapOuterRingSeconds(undefined) === 144);
ok('every number the snap can return is allowed (never faster than 2 rpm)', Array.from({ length: 4000 }, (_, i) => snapOuterRingSeconds(i / 10 - 100)).every((s) => s >= 30 && s <= 300 && rpmFromSeconds(s) <= OUTER_RING_MAX_RPM + 1e-12));

// Direction.
ok('counter-clockwise is negative, clockwise positive; anything else is counter-clockwise', directionSign('ccw') === -1 && directionSign('cw') === 1 && snapRingDirection('cw') === 'cw' && snapRingDirection('left') === 'ccw' && snapRingDirection(undefined) === 'ccw');
const steady = (o: Partial<RingMotion> = {}): RingMotion => ({ direction: 'ccw', seconds: 144, breathPaced: false, breathTurn: 12, technique: T66, ...o });
ok('steady: one full turn takes the seconds chosen, counter-clockwise by default', near(ringAngleDeg(steady(), 144000), -360) && near(ringAngleDeg(steady(), 72000), -180) && near(ringAngleDeg(steady({ direction: 'cw' }), 144000), 360));
ok('steady: 30 s per turn is 12 degrees a second, no faster', near(ringAngleDeg(steady({ seconds: 30, direction: 'cw' }), 1000), 12));
ok('steady: the ring is never faster than 2 rpm whatever is passed (a pace under 30 is held to 30)', Math.abs(ringAngleDeg(steady({ seconds: 1, direction: 'cw' }), 1000)) <= 12 + 1e-9 && ringPeakRpm(steady({ seconds: 1 })) <= OUTER_RING_MAX_RPM);

// Paced to the breath.
const f66 = breathFractions(T66);
const prof = breathTurnProfile(f66);
ok('the breath profile starts at 0, ends at 1, never falls and has no jump', prof.at(0) === 0 && near(prof.at(1), 1) && Array.from({ length: 1000 }, (_, i) => i).every((i) => prof.at((i + 1) / 1000) >= prof.at(i / 1000) && prof.at((i + 1) / 1000) - prof.at(i / 1000) < 0.01));
ok('it advances during the in-breath more than the out-breath (the ring eases on the out-breath) and never stops', prof.at(0.5) > 0.5 + 0.02 && Array.from({ length: 1000 }, (_, i) => prof.at((i + 1) / 1000) - prof.at(i / 1000)).every((d) => d > 0));
ok('its slowest speed is a quarter of its fastest, so the ease is gentle, not a stop', (() => { const d = Array.from({ length: 1000 }, (_, i) => prof.at((i + 1) / 1000) - prof.at(i / 1000)); return Math.min(...d) * 4 > Math.max(...d) * 0.95 - 0.001 && Math.min(...d) * 4 < Math.max(...d) * 1.05; })());
ok('the speed is the same at the end of one breath and the start of the next (it joins up)', (() => { const e = 1e-4; const s0 = (prof.at(e) - prof.at(0)) / e; const s1 = (prof.at(1) - prof.at(1 - e)) / e; return near(s0, s1, 1e-3); })());
ok('the default breath at 1/12: 144 s per turn, the same as the steady default (12 breaths of 12 s is one turn)', near(breathPacedTurns(144000, T66, 12), 1, 1e-9) && near(breathPacedTurns(12000, T66, 12), 1 / 12, 1e-9) && !breathClamp(T66, 12).clamped);
ok('the default breath at 1/12 is about 0.42 turns a minute on average, and its fastest moment is well under 2', near(breathClamp(T66, 12).averageRpm, 60 / 144, 1e-9) && breathClamp(T66, 12).peakRpm < 1);
ok('whole breaths add the same fraction of a turn each', [8, 6, 4].every((d) => near(breathPacedTurns(5 * 12000, T66, d), 5 * breathClamp(T66, d).turnsPerBreath, 1e-9)));
ok('it follows the breathing clock: the same instant of a different breath length gives a different angle, and a longer breath turns more slowly', near(breathPacedTurns(0, T66, 12), 0) && breathClamp({ ih: 8000, hi: 0, ex: 8000, ho: 0 }, 12).averageRpm < breathClamp(T66, 12).averageRpm);
ok('negative or odd clocks do not break it', Number.isFinite(breathPacedTurns(-5000, T66, 12)) && breathPacedTurns(NaN, T66, 12) === 0 && Number.isFinite(breathPacedTurns(1234, null, 12)));
ok('fractions offered: 1/12 (default), 1/8, 1/6, 1/4; anything else is the default', BREATH_TURN_DENOMINATORS.join() === '12,8,6,4' && DEFAULT_BREATH_TURN === 12 && snapBreathTurn(5) === 12 && snapBreathTurn(4) === 4 && snapBreathTurn('4') === 12 && breathTurnLabel(8) === '1/8 turn');

// The 2 rpm limit, over every breathing pace the site offers and every fraction, and over the whole allowed range of custom paces.
const customs = [] as { ih: number; hi: number; ex: number; ho: number }[];
for (const ih of [2, 4, 6, 12]) for (const hi of [0, 4, 12]) for (const ex of [2, 6, 16]) for (const ho of [0, 4, 12]) { const c = ih + hi + ex + ho; if (c >= 4 && c <= 40) customs.push({ ih: ih * 1000, hi: hi * 1000, ex: ex * 1000, ho: ho * 1000 }); }
const paces = [...PRESETS, ...customs];
ok(`the limit holds for every preset and ${customs.length} custom paces at every fraction: the fastest moment is never over 2 rpm`, paces.every((t) => BREATH_TURN_DENOMINATORS.every((d) => breathClamp(t, d).peakRpm <= OUTER_RING_MAX_RPM + 1e-9)));
ok('and by sampling the real angle: no step between frames is more than 12 degrees a second', paces.filter((_, i) => i % 7 === 0).every((t) => BREATH_TURN_DENOMINATORS.every((d) => { let worst = 0; const b = (t.ih + t.hi + t.ex + t.ho); for (let ms = 0; ms < 2 * b; ms += 20) worst = Math.max(worst, Math.abs(breathPacedTurns(ms + 20, t, d) - breathPacedTurns(ms, t, d)) * 360 / 0.02); return worst <= 12 + 0.05; })));
ok('the limit applies to a fast breath at 1/4 (and says so), and does not at the default', breathClamp({ ih: 3000, hi: 0, ex: 3000, ho: 0 }, 4).clamped && !breathClamp(T66, 12).clamped && breathClamp({ ih: 3000, hi: 0, ex: 3000, ho: 0 }, 4).turnsPerBreath < 0.25);
ok('when the limit applies the ring still turns (it is scaled down evenly, not cut off)', breathClamp({ ih: 2000, hi: 0, ex: 2000, ho: 0 }, 4).turnsPerBreath > 0 && breathPacedTurns(40000, { ih: 2000, hi: 0, ex: 2000, ho: 0 }, 4) > 0);
ok('the note under the control says when the limit applies, and not otherwise, in plain words', breathPaceNote({ ih: 3000, hi: 0, ex: 3000, ho: 0 }, 4).includes('faster than the most') && !breathPaceNote(T66, 12).includes('faster than the most') && breathPaceNote(T66, 12).includes('0.42') && !/calm|relax|reduce|heal|help|benefit/i.test(breathPaceNote(T66, 12) + breathPaceNote({ ih: 3000, hi: 0, ex: 3000, ho: 0 }, 4)));
ok('ringPeakRpm: steady is the rpm of the pace; paced is the clamped peak', near(ringPeakRpm(steady()), 60 / 144) && near(ringPeakRpm(steady({ breathPaced: true })), breathClamp(T66, 12).peakRpm));
ok('direction applies to the breath-paced ring too', ringAngleDeg(steady({ breathPaced: true }), 30000) < 0 && ringAngleDeg(steady({ breathPaced: true, direction: 'cw' }), 30000) > 0 && near(ringAngleDeg(steady({ breathPaced: true }), 144000), -360));

// Continuity: a changed setting never makes the ring jump.
ok('continuity offset: the new setting carries on from the last angle drawn', (() => { const last = ringAngleDeg(steady(), 50000); const raw = ringAngleDeg(steady({ seconds: 60, direction: 'cw' }), 50000); return near(raw + continuityOffset(last, raw), last); })());
ok('wrapDeg keeps the angle between 0 and 360, either way round', near(wrapDeg(-90), 270) && near(wrapDeg(725), 5) && wrapDeg(0) === 0);

// Defaults.
ok('the look defaults: turning, counter-clockwise, 144 s, not breath-paced, 1/12; the inner ring is still 120 s', DEFAULT_OUTER_ORBIT.turn === true && DEFAULT_OUTER_ORBIT.direction === 'ccw' && DEFAULT_OUTER_ORBIT.turnSeconds === 144 && DEFAULT_OUTER_ORBIT.breathPaced === false && DEFAULT_OUTER_ORBIT.breathTurn === 12 && DEFAULT_INNER_ORBIT.orbitSeconds === 120);

// Motion stop and reduced motion still win, and change nothing.
const base: MotionSettings = { stopped: false, reducedMotion: false, leafSway: true, kaleidoscope: true, innerLights: 'moving' };
ok('moving: the ring turns when it is wanted, and not when it is set to Still', motionPlan(base).outerRingTurns && motionPlan({ ...base, outerRingTurning: true }).outerRingTurns && !motionPlan({ ...base, outerRingTurning: false }).outerRingTurns);
ok('stopped or reduced motion: the ring is still whatever it is set to (every combination)', [true, false].every((turn) => [[true, false], [false, true], [true, true]].every(([stopped, reducedMotion]) => !motionPlan({ ...base, stopped, reducedMotion, outerRingTurning: turn }).outerRingTurns)));
ok('the plan does not change the settings it reads', (() => { const s = { ...base, stopped: true, outerRingTurning: true }; const copy = JSON.stringify(s); motionPlan(s); return JSON.stringify(s) === copy; })());

// Wiring (source checks, as the other tests do).
const logo = src('src/app/components/NenyaLogo.tsx');
const hook = src('src/app/components/useOuterRingTurn.ts');
const ui = src('src/app/components/OuterRingControls.tsx');
const settings = src('src/app/components/AccessibilitySettings.tsx');
const css = src('src/styles/globals.css');
ok('the logo no longer ties the outer ring to the inner ring\'s turn time', !/nenya-orbit-ccw \$\{ORBIT_DURATION\}/.test(logo) && /useOuterRingTurn\(outerRingRef, showValarOrbit && outer\.show && plan\.outerRingTurns/.test(logo) && /ref=\{outerRingRef\}/.test(logo));
ok('the inner ring still turns on the inner ring\'s own time', /nenya-orbit-cw \$\{ORBIT_DURATION\}s/.test(logo));
ok('the logo takes the visitor\'s choices and a prop (the bench) overrides them', /turn: ringTurnChoice, direction: ringDirectionChoice, turnSeconds: ringSecondsChoice, breathPaced: ringBreathPacedChoice, breathTurn: ringBreathTurnChoice, \.\.\.outerOrbit/.test(logo));
ok('the ring is drawn only while allowed, one transform from a frame loop, and rest means no transform', /if \(!moving\)/.test(hook) && /el\.style\.transform = ''/.test(hook) && /requestAnimationFrame/.test(hook) && /cancelAnimationFrame/.test(hook) && !/opacity|filter|animation/.test(hook));
ok('keyframes for the ring are still in the stylesheet unchanged (nothing else removed)', /@keyframes nenya-orbit-ccw/.test(css) && /@keyframes nenya-orbit-cw/.test(css));
ok('the settings panel shows the group under the Palette Orbit, labelled "Outer ring movement"', /orbitEnabled && <OuterRingControls/.test(settings) && /Outer ring movement/.test(ui));
ok('the controls: Turning / Still, direction, a 30 to 300 s slider in 6 s steps with the rpm in its label, and Pace to my breathing with the four fractions', /'Turning' : 'Still'/.test(ui) && /Counter-clockwise/.test(ui) && /Clockwise/.test(ui) && /type="range"/.test(ui) && /min=\{OUTER_RING_MIN_SECONDS\}/.test(ui) && /max=\{OUTER_RING_MAX_SECONDS\}/.test(ui) && /step=\{OUTER_RING_STEP_SECONDS\}/.test(ui) && /aria-valuetext=\{paceLabel\(seconds\)\}/.test(ui) && /Pace to my breathing/.test(ui) && /BREATH_TURN_DENOMINATORS\.map/.test(ui));
ok('the slider is disabled, with its reason in words, while Pace to my breathing is on', /disabled=\{off \|\| breathPaced\}/.test(ui) && /This is off while "Pace to my breathing" is on/.test(ui));
ok('the controls have real labels, a described-by help line, and announce through the existing polite status', /htmlFor="outer-ring-seconds"/.test(ui) && /htmlFor="outer-ring-breath"/.test(ui) && /aria-describedby="outer-ring-seconds-help"/.test(ui) && /onMessage\(/.test(ui) && /role="status" aria-live="polite"/.test(settings) && /<OuterRingControls technique=\{technique\} onMessage=\{setLookMessage\}/.test(settings));
ok('the panel says when the ring is held by Stop motion or reduced motion', /Motion is stopped right now, so the ring is still/.test(ui) && /useReducedMotionNow/.test(ui) && /useMotionStopped/.test(ui));
ok('the help text makes no claim about benefit', !/calm|relax|reduce stress|heal|therap|anxiety|benefit|improve/i.test(ui));
ok('both panels pass the breathing pace to the settings, so the limit can be explained', /technique=\{technique\}/.test(src('src/app/components/BreathingPopout.tsx')) && /technique=\{technique\}\n?\s*\/>/.test(src('src/app/components/GlobalNavigation.tsx')));
