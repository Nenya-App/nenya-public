// The breathing strength: the old opacity on a new scale where the old 100% is 50% (owner, 2026-11-22).
import { readFileSync } from 'node:fs';
import { DEFAULT_STRENGTH, RING_STOPS, STRENGTH_MAX, STRENGTH_MIN, STRENGTH_STANDARD, STRENGTH_STEP, ringAlphas, ringEdgeStart, snapStrength, strengthFromOldOpacity, strengthLabel, strengthParts } from '../src/lib/breathStrength.ts';
import { ok } from './helpers.mts';

ok('the scale runs 5% to 200%; 50% is the standard and the default', STRENGTH_MIN === 5 && STRENGTH_MAX === 200 && STRENGTH_STEP === 5 && STRENGTH_STANDARD === 50 && DEFAULT_STRENGTH === 50);
ok('a strength is rounded to a step and kept in range; unreadable becomes 50%', snapStrength(52) === 50 && snapStrength(0) === 5 && snapStrength(999) === 200 && snapStrength(-3) === 5 && snapStrength('x') === 50 && snapStrength(NaN) === 50 && snapStrength(null) === 50 && snapStrength(undefined) === 50);
ok('the label is a plain percentage', strengthLabel(50) === '50%' && strengthLabel(200) === '200%' && strengthLabel(52) === '50%');

// The standard strength (50%) draws 1.5 times what the old maximum drew (owner, 2026-11-26: the ring was often too faint to see).
const standard = strengthParts(50);
ok('50% is the standard: opacity 1, no boost, the glow 1.5 times the old alphas and the old soft edge', standard.opacity === 1 && standard.boost === 1 && RING_STOPS.join() === '0.12,0.225,0.375,0.6' && ringAlphas(standard).join() === RING_STOPS.join() && ringEdgeStart(standard) === 30);
ok('below 50% it fades as it did: new 25% is old 50%, new 5% is the old 10%', strengthParts(25).opacity === 0.5 && strengthParts(25).boost === 1 && Math.abs(strengthParts(5).opacity - 0.1) < 1e-9 && [5, 10, 20, 30, 40, 50].every((s) => Math.abs(strengthParts(s).opacity - s / 50) < 1e-9 || s === 5));
ok('the old alphas times the old opacity are what the new 25% draws', ringAlphas(strengthParts(25)).every((a, i) => Math.abs(a - RING_STOPS[i] * 0.5) < 1e-9));
const p100 = strengthParts(100), p200 = strengthParts(200);
ok('above 50% the opacity stays at 1 (it cannot pass 1) and the ring is drawn stronger: up to twice the glow at 200%', p100.opacity === 1 && p200.opacity === 1 && p100.boost === 1 + 50 / 150 && p200.boost === 2);
ok('the glow is stronger step by step and never past full strength', [55, 75, 100, 150, 200].every((s, i, a) => i === 0 || ringAlphas(strengthParts(s)).every((x, k) => (x > ringAlphas(strengthParts(a[i - 1]))[k] || x === 1) && x <= 1)));
ok('at 200% every stop of the gradient is twice the standard, up to full strength', ringAlphas(p200).every((a, i) => Math.abs(a - Math.min(1, RING_STOPS[i] * 2)) < 1e-9));
ok('the soft edge starts further in as it gets stronger (30% of the radius at standard, 15% at 200%) and never below zero', ringEdgeStart(p200) === 15 && ringEdgeStart(p100) > 15 && ringEdgeStart(p100) < 30 && [5, 50, 100, 200].every((s) => ringEdgeStart(strengthParts(s)) >= 0));
ok('strength changes the drawing only: the parts are opacity and boost, nothing about time', Object.keys(strengthParts(150)).join() === 'opacity,boost');

// Migration from the old scale: v x 50, only the new key is written.
ok('a stored old opacity v becomes v x 50: 1 -> 50%, 0.5 -> 25%, 0.1 -> 5%', strengthFromOldOpacity(1) === 50 && strengthFromOldOpacity(0.5) === 25 && strengthFromOldOpacity(0.1) === 5 && strengthFromOldOpacity(0.75) === 40);
ok('an unreadable or out-of-range old value becomes the default', strengthFromOldOpacity(5) === 50 && strengthFromOldOpacity(0) === 50 && strengthFromOldOpacity('1') === 50 && strengthFromOldOpacity(NaN) === 50 && strengthFromOldOpacity(undefined) === 50);

// Storage (a fresh copy of the module per case, a stand-in localStorage).
const store: Record<string, string> = {};
(globalThis as any).localStorage = { get length() { return Object.keys(store).length; }, key: (i: number) => Object.keys(store)[i] ?? null, getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = String(v); }, removeItem: (k: string) => { delete store[k]; } };
(globalThis as any).window ??= { addEventListener() {}, removeEventListener() {} };
const mem = await import('../src/lib/deviceMemory.ts');
store['nenya.remember'] = '1';
store['nenya.prefs'] = JSON.stringify({ breathingStrength: 150 });
ok('a stored strength is read back', mem.loadPrefs().breathingStrength === 150);
store['nenya.prefs'] = JSON.stringify({ breathingStrength: 500 });
ok('a strength outside the scale is dropped', mem.loadPrefs().breathingStrength === undefined);
store['nenya.prefs'] = JSON.stringify({ breathingOpacity: 0.5 });
ok('an old opacity is still read (for the migration) and the new key is not there', mem.loadPrefs().breathingOpacity === 0.5 && mem.loadPrefs().breathingStrength === undefined);

// Source checks.
const src = (p: string) => readFileSync(p, 'utf8');
const memSrc = src('src/lib/deviceMemory.ts');
ok('the old key is read once to migrate and is never written; the new key is the one saved', /usePref\('breathingStrength', p\.breathingOpacity !== undefined \? strengthFromOldOpacity\(p\.breathingOpacity\) : DEFAULT_STRENGTH\)/.test(memSrc) && !/usePref\('breathingOpacity'|savePref\('breathingOpacity'/.test(memSrc + src('src/app/App.tsx') + src('src/coach/CoachPage.tsx')));
const panel = src('src/app/components/AccessibilitySettings.tsx');
ok('the slider is labelled Breathing strength, shows a percentage, runs on the new scale, and says that 50% is the standard', /card\('strength', 'Breathing strength'/.test(panel) && /strengthLabel\(pendingBreathingStrength\)/.test(panel) && /min=\{STRENGTH_MIN\}/.test(panel) && /max=\{STRENGTH_MAX\}/.test(panel) && /step=\{STRENGTH_STEP\}/.test(panel) && /50% is the standard strength/.test(panel) && /aria-describedby="strength-help"/.test(panel) && !/Breathing Opacity|Breathing opacity/.test(panel));
const ring = src('src/app/components/ValarBreathingLogo.tsx');
ok('the ring draws its gradient from the strength (stops and edge) and leaves the timing, keyframes and colours alone', /ringAlphas\(\{ opacity, boost \}\)/.test(ring) && /ringEdgeStart\(\{ opacity, boost \}\)/.test(ring) && /opacity: \$\{opacity \* 0\.6\}/.test(ring) && !/animation: `\$\{ringAnimName\} \$\{cycleDur \/ boost/.test(ring));
ok('the pages hand the ring the parts of the strength', /\.\.\.strengthParts\(breathingStrength\)/.test(src('src/app/components/pages/WelcomePage.tsx')) && /\.\.\.strengthParts\(breathingStrength\)/.test(src('src/app/components/BreathingPopout.tsx')));
ok('the default on every page is the standard strength', /breathingStrength = STRENGTH_STANDARD/.test(src('src/app/components/BreathingPopout.tsx')) && /breathingStrength = STRENGTH_STANDARD/.test(src('src/app/components/GlobalNavigation.tsx')));
ok('the ring does not read Stop motion (it is the breathing guidance), and the strength is not part of what Stop motion changes', !/motionStopped|useMotionStopped/.test(ring) && !/breathingStrength|strength/i.test(src('src/lib/motionStop.ts').replace(/\/\/.*$/gm, '')));
