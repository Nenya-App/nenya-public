// Breathing display styles: valid names, one shared clock, and the orb rule (orbs belong to the gem; hidden gem = no orbs, in every style).
import { readFileSync } from 'node:fs';
import { DISPLAY_STYLES, DISPLAY_STYLE_INFO, DEFAULT_DISPLAY_STYLE, isDisplayStyle, gemShown, orbsVisible, orbsShownFor, breathText, circleScale, styleSummary, styleHasRing } from '../src/lib/breathDisplay.ts';
import { breathCounter } from '../src/lib/breathClock.ts';
import { ok } from './helpers.mts';

ok('four styles, the gem is the default', DISPLAY_STYLES.length === 4 && DEFAULT_DISPLAY_STYLE === 'gem' && DISPLAY_STYLES.every(isDisplayStyle));
ok('anything else is not a style', !isDisplayStyle('Gem') && !isDisplayStyle('') && !isDisplayStyle(3) && !isDisplayStyle(null) && !isDisplayStyle('constructor'));
ok('every style has a clear name, a description and a screen-reader summary', DISPLAY_STYLES.every((s) => DISPLAY_STYLE_INFO[s].name.length > 3 && DISPLAY_STYLE_INFO[s].description.length > 10 && /^Breathing guide:/.test(styleSummary(s))));
ok('names are different from each other', new Set(DISPLAY_STYLES.map((s) => DISPLAY_STYLE_INFO[s].name)).size === DISPLAY_STYLES.length);

// The orb rule, across every style and every setting.
let bad: string[] = [];
for (const s of DISPLAY_STYLES) for (const logoVisible of [true, false]) for (const orbit of [true, false]) {
  const orbs = orbsShownFor(s, logoVisible, orbit);
  if (orbs && !gemShown(s, logoVisible)) bad.push(`${s}/${logoVisible}/${orbit}`);
  if (orbs !== orbsVisible(gemShown(s, logoVisible), orbit)) bad.push(`rule differs ${s}`);
}
ok('orbs can never show while the gem is hidden, in any style or setting', bad.length === 0, bad.join(' '));
ok('...orbs show only for the gem style, gem on, orbit on', DISPLAY_STYLES.every((s) => orbsShownFor(s, true, true) === (s === 'gem')) && !orbsShownFor('gem', true, false));
ok('...a hidden gem hides them even with the orbit setting on', !orbsVisible(false, true) && !orbsShownFor('gem', false, true));
const logo = readFileSync('src/app/components/NenyaLogo.tsx', 'utf8');
const stripped = logo.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
ok('NenyaLogo decides the orbs in one place, from the gem setting', /const orbs = orbsVisible\(showLogo, showValarOrbit\)/.test(stripped));
ok('...and uses the raw orbit prop only to declare it, default it and feed that rule', (stripped.match(/showValarOrbit/g) ?? []).length === 3);
const outerOrInner = [...stripped.matchAll(/\{orbs && (inner|outer)\.show/g)].length;
ok('...inner and outer orbs are both behind that one flag', outerOrInner === 2);
ok('orbs take no focus and no pointer', (() => { const i = stripped.indexOf('{orbs && inner.show'); const j = stripped.indexOf('{orbs && outer.show'); const blk = stripped.slice(i, j); return /pointer-events-none/.test(blk) && !/tabIndex|<button|<a /.test(stripped.slice(i, stripped.indexOf('<SpectralGem'))); })());
// No page may bypass it by drawing orbs itself.
const pages = ['WelcomePage', 'BreathingPopout', 'GlobalNavigation'].map((n) => n);
ok('no page or panel draws orbs of its own', ['src/app/components/pages/WelcomePage.tsx', 'src/app/components/BreathingPopout.tsx', 'src/app/components/GlobalNavigation.tsx', 'src/app/components/BreathingDisplay.tsx'].every((f) => { try { return !/valarColors\.map|OrbSurface/.test(readFileSync(f, 'utf8')); } catch { return true; } }) && pages.length === 3);

// One shared clock: the text and the circle read the same elapsed time as the counter.
const t = { ih: 5000, hi: 0, ex: 5000, ho: 0 };
let same = true;
for (let ms = 0; ms < 25000; ms += 137) { const a = breathText(ms, t), b = breathCounter(ms, t); if (a.count !== b.count || a.phase !== b.phase) same = false; }
ok('the text style reads the same count and phase as the counter, at every instant', same);
ok('the text is "Inhale, 1" at the start and "Exhale, 5" at the start of the exhale', breathText(0, t).text === 'Inhale, 1' && breathText(5000, t).text === 'Exhale, 5');
ok('the plain circle is smallest at rest, largest at the top of the breath, and never out of range', circleScale(0, t) === 0.25 && circleScale(5000, t) === 1 && circleScale(10000, t) === 0.25 && Array.from({ length: 200 }, (_, i) => circleScale(i * 97, t)).every((v) => v >= 0.25 && v <= 1));
ok('the circle with a hold stays full through the hold', circleScale(6000, { ih: 4000, hi: 4000, ex: 4000 }) === 1);
ok('only the gem and ring styles use the colour ring', styleHasRing('gem') && styleHasRing('ring') && !styleHasRing('circle') && !styleHasRing('text'));

// The component: selector, text equivalents, reduced motion, wiring (checked from the source).
const bd = readFileSync('src/app/components/BreathingDisplay.tsx', 'utf8');
ok('the selector is a fieldset of native radio buttons with a legend (keyboard: Tab, then arrow keys) and a name and sentence for each style', /<fieldset/.test(bd) && /<legend/.test(bd) && /type="radio"/.test(bd) && /DISPLAY_STYLE_INFO\[s\]\.name/.test(bd) && /DISPLAY_STYLE_INFO\[s\]\.description/.test(bd) && /min-h-11/.test(bd));
ok('choosing a style saves it through the shared per-device setting', /setBreathingDisplay\(s\)/.test(bd) && /useBreathingDisplay\(\)/.test(bd));
ok('every style has the phase and count as text and a stable summary for screen readers', /breathText\(Date\.now\(\) - start, technique\)/.test(bd) && /styleSummary\(style\)/.test(bd) && /className="sr-only"/.test(bd));
ok('all styles read the one shared clock (cycleStart), never a clock of their own', (bd.match(/cycleStart/g) ?? []).length >= 8 && !/Date\.now\(\)\s*[;,)]\s*\n?\s*const start = Date/.test(bd) && !/requestAnimationFrame/.test(bd));
ok('the plain circle is still (full size) with reduced motion, and the ring is still too', /prefers-reduced-motion: reduce/.test(bd) && /if \(!on \|\| reduce\)/.test(bd) && /nenya-ring-live \{ animation: none/.test(readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8')));
ok('the text colour is the theme foreground (no pale-on-pale text) and the circle has a solid outline', /text-foreground/.test(bd) && /border-foreground/.test(bd) && !/text-muted-foreground/.test(bd));
const pop = readFileSync('src/app/components/BreathingPopout.tsx', 'utf8'), wel = readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8');
ok('the welcome page and the settings panel both show the chosen style, and the panel has the selector', /<BreathingDisplay\b/.test(pop) && /<BreathingDisplay\b/.test(wel) && /<BreathingDisplayPicker \/>/.test(pop));
ok('with the gem hidden, the display passes no orbs-bearing logo at all (the gem-less styles never mount NenyaLogo)', /gemShown\(style, logoVisible\)/.test(bd) && /showGem \? \(/.test(bd));
