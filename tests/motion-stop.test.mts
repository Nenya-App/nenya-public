// Stop motion: what moves, from every motion setting plus the stopped state; the button; and where the stopped state is kept.
import { readFileSync } from 'node:fs';
import { MOTION_REDUCED_REASON, MOTION_STOPPED_STATUS, motionButtonLabel, motionMessage, motionPlan, type MotionSettings } from '../src/lib/motionStop.ts';
import { INNER_ORB_MODES } from '../src/lib/logoLook.ts';
import { ok } from './helpers.mts';

const base: MotionSettings = { stopped: false, reducedMotion: false, leafSway: true, kaleidoscope: true, innerLights: 'moving' };

ok('not stopped: every motion setting is as it was set', (() => { const p = motionPlan(base); return !p.held && p.leafSway && p.kaleidoscope && p.innerLights === 'moving' && p.outerOrbsMove && p.glowSwells; })());
ok('not stopped: a setting that is off stays off', (() => { const p = motionPlan({ ...base, leafSway: false, kaleidoscope: false, innerLights: 'still' }); return !p.leafSway && !p.kaleidoscope && p.innerLights === 'still'; })());
ok('stopped: the sway, the kaleidoscope, the lights, the orbs\' pulse and turn, and the glow\'s swell all hold still', (() => { const p = motionPlan({ ...base, stopped: true }); return p.held && !p.leafSway && !p.kaleidoscope && p.innerLights === 'still' && !p.outerOrbsMove && !p.glowSwells; })());
ok('stopped: hidden lights stay hidden (stopping does not draw them), still stays still', motionPlan({ ...base, stopped: true, innerLights: 'hidden' }).innerLights === 'hidden' && motionPlan({ ...base, stopped: true, innerLights: 'still' }).innerLights === 'still');
ok('the stopped state wins over every combination of the individual settings, and over none of them is changed (the function reads them and returns a plan; the settings are not touched)', [true, false].every((sway) => [true, false].every((kal) => INNER_ORB_MODES.every((m) => { const s = { ...base, stopped: true, leafSway: sway, kaleidoscope: kal, innerLights: m }; const before = JSON.stringify(s); const p = motionPlan(s); return !p.leafSway && !p.kaleidoscope && p.innerLights !== 'moving' && !p.outerOrbsMove && JSON.stringify(s) === before; }))));
ok('resume gives back exactly what was set: the plan of the same settings, not stopped, is the same as before stopping', JSON.stringify(motionPlan({ ...base, stopped: false })) === JSON.stringify(motionPlan(base)));
ok('reduced motion holds everything still too, with or without the button', (() => { const a = motionPlan({ ...base, reducedMotion: true }); const b = motionPlan({ ...base, reducedMotion: true, stopped: true }); return a.held && b.held && !a.leafSway && !a.kaleidoscope && a.innerLights === 'still' && !a.outerOrbsMove && !a.glowSwells && JSON.stringify(a) === JSON.stringify(b); })());
ok('the breathing guidance is never part of what is stopped', [base, { ...base, stopped: true }, { ...base, reducedMotion: true }].every((s) => motionPlan(s).breathGuidance === true));

ok('the button says Stop motion, and Resume motion while stopped; the messages say Motion stopped and Motion resumed', motionButtonLabel(false) === 'Stop motion' && motionButtonLabel(true) === 'Resume motion' && motionMessage(true) === 'Motion stopped' && motionMessage(false) === 'Motion resumed' && MOTION_STOPPED_STATUS === 'Motion stopped');
ok('the reason under reduced motion uses the words the other motion switches use', /Your device asks for reduced motion/.test(MOTION_REDUCED_REASON) && !/gateway|insight/i.test(MOTION_REDUCED_REASON));

// The panel.
const panel = readFileSync('src/app/components/AccessibilitySettings.tsx', 'utf8');
ok('the button is at the very top of the panel, above the instruction and the cards, and not inside a card', panel.indexOf('Stop motion: always visible') > -1 && panel.indexOf('Stop motion: always visible') < panel.indexOf('{CARDS_INSTRUCTION}') && panel.indexOf('Stop motion: always visible') < panel.indexOf("card('theme'"));
ok('the button is a real button with aria-pressed, 44 px tall, described by its help text, and disabled only for reduced motion', /<button[^>]*type="button"[^>]*aria-pressed=\{motionHeld\}/s.test(panel) && /disabled=\{reducedMotion\}/.test(panel) && /aria-describedby="a11y-motion-help"/.test(panel) && /className="min-h-11 w-full/.test(panel));
ok('under reduced motion it shows as stopped (pressed, labelled Resume) with the reason', /motionButtonLabel\(motionHeld\)/.test(panel) && /MOTION_REDUCED_REASON/.test(panel));
ok('a press announces politely through a status region', /role="status" aria-live="polite"[^>]*>\{motionMessageText\}/.test(panel) && /setMotionMessageText\(motionMessage\(next\)\)/.test(panel));
ok('the Animation card\'s heading shows "Motion stopped" in words while it is stopped', /motionHeld \? MOTION_STOPPED_STATUS : undefined/.test(panel) && /status=\{status\}/.test(panel) && /\{status \? <span/.test(readFileSync('src/app/components/SettingsCard.tsx', 'utf8')));
ok('the stopped state is stored on the device by the same rules as the other display settings, off unless pressed, validated', (() => { const mem = readFileSync('src/lib/deviceMemory.ts', 'utf8'); return /motionStopped: isBool/.test(mem) && /loadPrefs\(\)\.motionStopped === true/.test(mem) && /savePref\('motionStopped'/.test(mem); })());

// What each part reads.
const logo = readFileSync('src/app/components/NenyaLogo.tsx', 'utf8');
const gem = readFileSync('src/app/components/SpectralGem.tsx', 'utf8');
ok('the logo takes what moves from the plan: sway, the inner lights, the outer orbs\' pulse and turn, their ring\'s turn (since 2026-11-24 taken from plan.outerRingTurns and drawn by useOuterRingTurn, not the old CSS animation on the inner ring\'s 120 s), and the glow\'s swell', /motionPlan\(\{ stopped: motionStopped, reducedMotion/.test(logo) && /sway=\{plan\.leafSway && !zoomed\}/.test(logo) && /const innerMode = plan\.innerLights/.test(logo) && /plan\.outerRingTurns/.test(logo) && /plan\.outerOrbsMove \? \{\s*scale: \[0\.95, 1\.05, 0\.95\]/.test(logo) && /plan\.glowSwells \? `nenya-halo-breathe/.test(logo));
ok('the glow does not swell on hover while stopped (the logo says so and the stylesheet holds the scale)', /data-motion-stopped=\{plan\.held \? 'true' : undefined\}/.test(logo) && /\[data-motion-stopped="true"\] \.nenya-orb-halo \{ scale: 1 !important/.test(readFileSync('src/styles/globals.css', 'utf8')));
ok('the gem treats a stopped state as its kaleidoscope being off, without touching the switch', /const visitorKaleido = kaleidoSwitch && !motionStopped;/.test(gem));
ok('the breath ring, the counter and the tones do not read the stopped state', !/useMotionStopped|motionStopped/.test(readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8')) && !/motionStopped/.test(readFileSync('src/app/components/BreathingCounter.tsx', 'utf8')) && !/motionStopped/.test(readFileSync('src/lib/breathTones.ts', 'utf8')));

// Stop motion also holds the page's decorative pulses still (owner, 2026-11-22: "stop all motion, including the timer and the enter pulse").
const root = readFileSync('src/app/components/MotionStoppedRoot.tsx', 'utf8');
const css = readFileSync('src/styles/globals.css', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');
ok('the page root carries a marker while motion is stopped, and the app mounts it', /useMotionStopped\(\)/.test(root) && /setAttribute\('data-page-motion-stopped', 'true'\)/.test(root) && /removeAttribute\('data-page-motion-stopped'\)/.test(root) && /<MotionStoppedRoot \/>/.test(app));
const counter = readFileSync('src/app/components/BreathingCounter.tsx', 'utf8');
ok('the counter\'s number and its filling circle (the timer) and its opening pulse are held still by the stylesheet, while the number and word are still drawn', /data-page-motion-stopped\] \.bc-digit \{ animation: none !important/.test(css) && /data-page-motion-stopped\] \.bc-arc \{ display: none/.test(css) && /className="bc-digit"/.test(counter) && /className="bc-arc"/.test(counter) && /\{count\}/.test(counter) && /\{phaseLabel\}|phaseLabel/.test(counter));
ok('the "Enter" and "more below" pulse, the arrow\'s pulse, the quick navigation\'s glimmer and the background glow are held still too', /data-page-motion-stopped\] \.nenya-more-below-glow\.is-pulsing \{ animation: none !important/.test(css) && /nenya-scroll-hint-arrow/.test(readFileSync('src/app/components/ScrollHint.tsx', 'utf8')) && /data-page-motion-stopped\] \.nenya-quicknav-glimmer/.test(css) && /nenya-quicknav-glimmer/.test(readFileSync('src/app/components/QuickNav.tsx', 'utf8')) && /data-page-motion-stopped\] \.nenya-background::before/.test(css));
ok('the breath ring and the tones are still the breathing guidance and do not read the stopped state', !/motionStopped/.test(readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8')) && !/motionStopped/.test(readFileSync('src/lib/breathTones.ts', 'utf8')));
ok('the front page button reads "Look into the Mirror?" (it was "Enter"), as its visible label and its accessible name', /label="Look into the Mirror\?" ariaLabel="Look into the Mirror\?"/.test(readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8')));
