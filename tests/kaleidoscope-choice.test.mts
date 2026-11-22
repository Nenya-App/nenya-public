// The kaleidoscope's look and "Move with my breathing" (owner, 2026-11-15): chosen by the visitor, saved only while remembering,
// still for reduced motion; with breathing on, the pattern swells on the in-breath and settles on the out-breath, in whole breaths.
import { readFileSync } from 'node:fs';
import { KALEIDOSCOPE_PRESETS, VISITOR_LOOKS, breathDepth, breathPeriodS, isVisitorLook } from '../src/lib/kaleidoscope.ts';
import { DEFAULT_KALEIDOSCOPE_BREATH, DEFAULT_KALEIDOSCOPE_LOOK } from '../src/lib/logoLook.ts';
import { ok } from './helpers.mts';

ok('four looks in order of movement, each a real preset, Gentle among them', VISITOR_LOOKS.map((l) => l.id).join() === 'calm,gentle,lively,full' && VISITOR_LOOKS.every((l) => l.id in KALEIDOSCOPE_PRESETS));
ok('"Full motion" says it is a lot of movement', /a lot of movement/i.test(VISITOR_LOOKS.find((l) => l.id === 'full')!.hint));
ok('only known looks are accepted', isVisitorLook('calm') && !isVisitorLook('wild') && !isVisitorLook(3));
ok('with the breath, depth runs from 40% at rest to the full look at the top of the in-breath', breathDepth(0.6, 0) === 0.6 * 0.4 && breathDepth(0.6, 1) === 0.6 && breathDepth(0.6, 2) === 0.6 && breathDepth(0.6, -1) === 0.6 * 0.4);
ok('the slow drift is a whole number of breaths at the chosen pace', [4000, 10000, 12345, 19000].every((b) => { const p = breathPeriodS(200, b); return Math.abs((p * 1000) / b - Math.round((p * 1000) / b)) < 1e-9 && Math.abs(p - 200) <= b / 2000; }));
ok('a very fast pace still gives at least one breath; no pace leaves the look unchanged', breathPeriodS(1, 10000) === 10 && breathPeriodS(200, 0) === 200);

const mem = readFileSync('src/lib/deviceMemory.ts', 'utf8');
ok('both choices are saved only while remembering, and checked when read back', /gemKaleidoscopeLook: \(v\) => v === 'calm' \|\| v === 'gentle' \|\| v === 'lively' \|\| v === 'full'/.test(mem) && /gemKaleidoscopeBreath: isBool/.test(mem) && /function savePref[\s\S]{0,80}if \(!isRemembering\(\)\) return;/.test(mem));
ok('the defaults are Lively and following the breath (owner, 2026-11-22: what she has set), and a stored choice wins', /'gemKaleidoscopeLook', [^\n]*\?\? DEFAULT_KALEIDOSCOPE_LOOK, DEFAULT_KALEIDOSCOPE_LOOK\);/.test(mem) && /loadPrefs\(\)\.gemKaleidoscopeBreath \?\? DEFAULT_KALEIDOSCOPE_BREATH, DEFAULT_KALEIDOSCOPE_BREATH\)/.test(mem) && DEFAULT_KALEIDOSCOPE_LOOK === 'lively' && DEFAULT_KALEIDOSCOPE_BREATH === true);

const gem = readFileSync('src/app/components/SpectralGem.tsx', 'utf8');
ok('the gem uses the visitor\'s look only while their switch is on', /\.\.\.\(visitorKaleido \? KALEIDOSCOPE_PRESETS\[visitorLook\] : \{\}\)/.test(gem));
ok('it follows the breath only when both are on, with the breath clock of the same frame', /sync: visitorKaleido && visitorBreath/.test(gem) && /kaleidoscopeAt\(reduced, L, c\.p\)/.test(gem) && /breathEnvelope\(breathPhase, b\.fractions\)/.test(gem));
ok('reduced motion still holds it still (the clock does not run, and the breath adds nothing)', /const running = !reduced && !!L\?\.kaleidoscope\?\.on;/.test(gem) && /reduced \? 0 : breathEnvelope/.test(gem));

const panel = readFileSync('src/app/components/AccessibilitySettings.tsx', 'utf8');
ok('the panel offers the looks and the breathing switch only while the kaleidoscope is on', /\{gemKaleidoscope && \(\s*<div className="space-y-3 pl-6 pt-2">/.test(panel) && /name="kaleidoscope-look"/.test(panel) && /id="kaleidoscope-breath"/.test(panel));
ok('the choices are a labeled radio group with 44px rows, and the switch is described', /<legend[^>]*>How much it moves<\/legend>/.test(panel) && /flex min-h-11 items-start gap-2/.test(panel) && /aria-describedby="kaleidoscope-breath-help"/.test(panel) && /opens as you breathe in and settles as you breathe out/.test(panel));
