// The inner ring of orbs behind the gem: moving (the default), still, or hidden.
import { readFileSync } from 'node:fs';
import { DEFAULT_INNER_ORB_MODE, INNER_ORB_MODES, innerOrbHint, innerOrbLabel, innerOrbMessage, innerOrbsDrawn, innerOrbsMove, snapInnerOrbMode } from '../src/lib/logoLook.ts';
import { ok } from './helpers.mts';

ok('three choices, and the default is moving (today\'s behaviour)', INNER_ORB_MODES.join() === 'moving,still,hidden' && DEFAULT_INNER_ORB_MODE === 'moving');
ok('anything else becomes moving', [undefined, null, 'off', 5, {}, 'Still', ''].every((v) => snapInnerOrbMode(v) === 'moving') && INNER_ORB_MODES.every((m) => snapInnerOrbMode(m) === m));
ok('moving is drawn and moves; still is drawn and does not move; hidden is not drawn', innerOrbsDrawn('moving') && innerOrbsMove('moving') && innerOrbsDrawn('still') && !innerOrbsMove('still') && !innerOrbsDrawn('hidden') && !innerOrbsMove('hidden'));
ok('each choice has a plain label, a hint and a polite message, without the words gateway or Insight', INNER_ORB_MODES.every((m) => innerOrbLabel(m).length > 0 && innerOrbHint(m).length > 0 && innerOrbMessage(m).startsWith('The inner orbs are now ') && !/gateway|insight/i.test(innerOrbHint(m))));

const logo = readFileSync('src/app/components/NenyaLogo.tsx', 'utf8');
ok('the logo draws the inner ring only when it is not hidden', /showValarOrbit && inner\.show && innerOrbsDrawn\(innerMode\)/.test(logo));
ok('still: the ring has no turning animation and the orbs no turn, pulse or drift (only the colour fade is left)', /animation: innerMoves \?/.test(logo) && /rotate: 0,/.test(logo) && /default: \{ duration: 0 \}/.test(logo));
ok('moving is the old animation, unchanged: the same array of opacity, scale and turn', /opacity: isLight \? \[inner\.emergeDepth, 1, inner\.emergeDepth\] : INNER_ORB_OPACITY,\s*scale: isLight \? \[0\.55, 1, 0\.55\] : PULSE,\s*rotate: isLight \? 0 : -360,/.test(logo) && /nenya-orbit-cw \$\{ORBIT_DURATION\}s linear infinite/.test(logo));
const gem = readFileSync('src/app/components/SpectralGem.tsx', 'utf8');
ok('the gem stops circling the lights it takes from the ring when the orbs are still or hidden, and keeps their colours', /orbsStill/.test(logo) && /reduced \|\| stillRef\.current \? 0/.test(gem) && /orbColour\(orbVecRef\.current\[j\]/.test(gem));
const mem = readFileSync('src/lib/deviceMemory.ts', 'utf8');
ok('stored as innerOrbs, validated on load, moving unless chosen', /innerOrbs: \(v\) => \(INNER_ORB_MODES as readonly unknown\[\]\)\.includes\(v\)/.test(mem) && /snapInnerOrbMode\(loadPrefs\(\)\.innerOrbs\)/.test(mem));
const set = readFileSync('src/app/components/AccessibilitySettings.tsx', 'utf8');
ok('settings: a fieldset with a legend and three radios, in the Logo look card, announced politely', /<legend[^>]*>Inner orbs behind the gem<\/legend>/.test(set) && /name="inner-orbs"/.test(set) && /setLookMessage\(innerOrbMessage\(m\)\)/.test(set) && set.indexOf("card('logo-look'") < set.indexOf('Inner orbs behind the gem'));
