// The inner lights follow the gem's motion settings: a pure mapping from the gem's settings to the lights' motion.
import { readFileSync } from 'node:fs';
import { KALEIDOSCOPE_PRESETS } from '../src/lib/kaleidoscope.ts';
import { DEFAULT_INNER_ORBIT } from '../src/lib/orbitLook.ts';
import { GEM_TURN_RATIO, LIGHT_STEP, lightBreathCss, lightBreathKey, lightLevel, lightMotionFor, lightRingAngle, type GemMotionSettings } from '../src/lib/lightMotion.ts';
import { ok } from './helpers.mts';

const look = (id: keyof typeof KALEIDOSCOPE_PRESETS, on = true) => { const k = KALEIDOSCOPE_PRESETS[id]; return { on, periodS: k.periodS, depth: k.depth, pattern: k.pattern, sway: k.sway, turn: k.turn }; };
const g = (over: Partial<GemMotionSettings> = {}): GemMotionSettings => ({ mode: 'moving', kaleidoscope: look('gentle'), breathSync: false, sides: 8, reducedMotion: false, ...over });

// The top level: Hidden, Still, Moving.
ok('hidden: not drawn, and nothing moves', (() => { const m = lightMotionFor(g({ mode: 'hidden' })); return !m.drawn && m.turn === 'none' && m.rise === 'none'; })());
ok('still: drawn, and nothing moves, whatever the gem does', ['calm', 'gentle', 'lively', 'full'].every((id) => { const m = lightMotionFor(g({ mode: 'still', kaleidoscope: look(id as 'calm'), breathSync: true })); return m.drawn && m.turn === 'none' && m.rise === 'none'; }));
ok('moving with the gem\'s kaleidoscope off: the lights hold still', (() => { const m = lightMotionFor(g({ kaleidoscope: look('gentle', false) })); return m.drawn && m.turn === 'none' && m.rise === 'none'; })());
ok('reduced motion: nothing moves', (() => { const m = lightMotionFor(g({ reducedMotion: true })); return m.turn === 'none' && m.rise === 'none'; })());
ok('a kaleidoscope of no depth does not move the lights', lightMotionFor(g({ kaleidoscope: { ...look('gentle'), depth: 0 } })).rise === 'none');

// Moving follows the gem's look: the same period and the same way of turning.
for (const id of ['calm', 'gentle', 'lively'] as const) {
  const k = KALEIDOSCOPE_PRESETS[id], m = lightMotionFor(g({ kaleidoscope: look(id) }));
  ok(`${id}: the ring swings back and forth by the gem's sway (${k.sway} degrees x turn x depth) on half the look's period (${k.periodS * GEM_TURN_RATIO} s)`, m.turn === 'sway' && Math.abs(m.turnDeg - k.sway * k.turn * k.depth) < 1e-9 && m.turnPeriodS === k.periodS * GEM_TURN_RATIO);
  ok(`${id}: each light rises and fades on the gem's wave, a little out of step with the next`, m.rise === 'gem' && m.risePeriodS === k.periodS * GEM_TURN_RATIO && Math.abs(m.riseStepS - m.risePeriodS * LIGHT_STEP) < 1e-9);
}
const full = lightMotionFor(g({ kaleidoscope: look('full') }));
ok('full motion (no sway): the ring turns on steadily, one repeat of the cut (360 / sides degrees) every half period', full.turn === 'steady' && Math.abs(full.turnDeg - (360 / 8) * 0.6) < 1e-9 && Math.abs(full.turnPeriodS - (360 / ((360 / 8) * 0.6)) * (90 * 0.5)) < 1e-9);
ok('the steady turn follows the number of sides: more sides, a smaller repeat, so a slower full turn', lightMotionFor(g({ kaleidoscope: look('full'), sides: 10 })).turnPeriodS > lightMotionFor(g({ kaleidoscope: look('full'), sides: 6 })).turnPeriodS);
ok('the calmer the look, the gentler the lights: calm dims and shrinks them least, full motion and lively most', (() => { const c = lightMotionFor(g({ kaleidoscope: look('calm') })), ge = lightMotionFor(g({ kaleidoscope: look('gentle') })), l = lightMotionFor(g({ kaleidoscope: look('lively') })); return c.depth > ge.depth && ge.depth > l.depth && c.scale > ge.scale && ge.scale > l.scale; })());
ok('the lights always stay at least half bright and three quarters of their size (nothing flashes or vanishes)', ['calm', 'gentle', 'lively', 'full'].every((id) => { const m = lightMotionFor(g({ kaleidoscope: look(id as 'calm') })); return m.depth >= 0.5 && m.scale >= 0.75 && m.depth <= 1 && m.scale <= 1; }));
ok('the ring turns the way the sway and steady turn say: zero when it does not turn', lightRingAngle(lightMotionFor(g({ mode: 'still' })), 123) === 0);
ok('a swing is a sine that starts at home, reaches its amount at a quarter period and returns', (() => { const m = lightMotionFor(g()); const a = (t: number) => lightRingAngle(m, t); return a(0) === 0 && Math.abs(a(m.turnPeriodS / 4) - (m.turnDeg * Math.PI) / 180) < 1e-9 && Math.abs(a(m.turnPeriodS / 2)) < 1e-9 && Math.abs(a(m.turnPeriodS)) < 1e-9; })());
ok('a steady turn goes once round in its period and carries on without a jump', Math.abs(lightRingAngle(full, full.turnPeriodS / 2) - Math.PI) < 1e-9 && lightRingAngle(full, full.turnPeriodS * 2) < 1e-6);

// Breath: the lights follow the breath when the gem's pattern does.
const br = lightMotionFor(g({ breathSync: true }));
ok('with the gem\'s "move with my breathing" on, the lights follow the breath', br.rise === 'breath' && lightMotionFor(g({ breathSync: false })).rise === 'gem');
ok('breath: dimmest at rest, full at the top of the inhale, between on the way', lightLevel(br, 0, 5, 0) === br.depth && lightLevel(br, 0, 5, 1) === 1 && lightLevel(br, 0, 5, 0.5) > br.depth && lightLevel(br, 0, 5, 0.5) < 1);
ok('breath: the breath switch counts only while the kaleidoscope is on (as the gem\'s does)', lightMotionFor(g({ kaleidoscope: look('gentle', false), breathSync: true })).rise === 'none');
const tech = { ih: 4000, hi: 2000, ex: 6000, ho: 0 };
const css = lightBreathCss(tech);
ok('breath keyframes: rest, end of inhale, hold, end of exhale, with the same breath fractions as the ring, only opacity and size, and a reduced-motion backstop', css.includes(`nl-breath-${lightBreathKey(tech)}`) && css.includes('0%{') && css.includes('33.33%{') && css.includes('50%{') && css.includes('100%{') && !/width|height|left|top|filter/.test(css) && /prefers-reduced-motion:reduce/.test(css));
ok('the first and last keyframes are the same (the loop has no jump)', (() => { const first = css.match(/0%\{([^}]*)\}/)![1], last = css.match(/100%\{([^}]*)\}/)![1]; return first === last; })());

// Wave: each light is a little out of step, within its range.
const gm = lightMotionFor(g());
const samples = (j: number) => Array.from({ length: 2000 }, (_, k) => lightLevel(gm, j, k * 0.5, 0));
ok('each light stays between its dimmest and full, reaches both, and starts at its dimmest', Array.from({ length: 16 }, (_, j) => samples(j)).every((a) => Math.min(...a) >= gm.depth - 1e-9 && Math.max(...a) <= 1 + 1e-9 && Math.max(...a) > 0.97 && a[0] === gm.depth));
ok('the lights are not in step: each has its own period', new Set(Array.from({ length: 16 }, (_, j) => (gm.risePeriodS + j * gm.riseStepS).toFixed(3))).size === 16);

// Gentler than before (the numbers the owner can tune).
ok('the lights\' own motion is gentler and slower than the old orbs\' pulse: a smaller change in size and brightness, and a longer period', DEFAULT_INNER_ORBIT.emergeDepth >= 0.6 && 1 - DEFAULT_INNER_ORBIT.emergeScale <= 0.1 && DEFAULT_INNER_ORBIT.emergeSeconds >= 12 && DEFAULT_INNER_ORBIT.style === 'light');

// The wiring (source).
const logo = readFileSync('src/app/components/NenyaLogo.tsx', 'utf8');
const gem = readFileSync('src/app/components/SpectralGem.tsx', 'utf8');
ok('the logo reads the same gem settings the gem reads (switch, look, move with my breathing) and hands them to the mapping', /useGemKaleidoscope\(\)/.test(logo) && /useGemKaleidoscopeLook\(\)/.test(logo) && /useGemKaleidoscopeBreath\(\)/.test(logo) && /breathSync: kalVisitor && kalBreath/.test(logo) && /lightMotionFor\(\{/.test(logo));
ok('the ring turns by the mapping: steady, or swinging with a sine easing, or not at all', /lights\.turn === 'steady'/.test(logo) && /nenya-lights-sway/.test(logo) && /cubic-bezier\(0\.37,0,0\.63,1\)/.test(logo));
ok('the gem takes the lights\' brightness and ring angle from the same mapping', /lightLevel\(lightsRef\.current, j, tSec, lightEnv\)/.test(gem) && /lightRingAngle\(lightsRef\.current/.test(gem));
ok('the swing keyframes are in the stylesheet, with reduced motion switching the breath ones off', /@keyframes nenya-lights-sway/.test(readFileSync('src/styles/globals.css', 'utf8')) && /\.nenya-light-breath \{ animation: none !important/.test(readFileSync('src/styles/globals.css', 'utf8')));
