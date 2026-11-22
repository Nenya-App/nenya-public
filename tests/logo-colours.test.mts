// The logo's colour choices (src/lib/logoColours.ts): the original is unchanged, presets and single palettes come from the sixteen, the visitor's kept palettes
// are offered only while they exist, "both" takes turns, and nothing unknown can break the logo.
import { readFileSync } from 'node:fs';
import {
  COLOUR_ORIGINAL, PALETTE_NAMES, PRESETS, breathSequence, colourChoiceDetail, colourChoiceLabel, colourChoiceMessage, colourChoiceSwatches, keptPalettes, orbVectors, resolveColours,
  savedChoicesFor, sixColours, snapColourChoice, type PaletteVector,
} from '../src/lib/logoColours.ts';
import { HIDDEN_NAMES, displayNameFor } from '../src/lib/paletteNames.ts';
import { ok } from './helpers.mts';

// The sixteen palettes, read from the component the way tests/palette-colors.test.mts reads them.
const logoSrc = readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8');
const sixteen: PaletteVector[] = [...logoSrc.matchAll(/name: '([^']+)',\s*vector: \[([^\]]*)\]/g)].map((m) => ({ name: m[1], vector: [...m[2].matchAll(/#[0-9A-Fa-f]{6}/g)].map((x) => x[0]) }));
ok('the sixteen palettes of six colours are read', sixteen.length === 16 && sixteen.every((p) => p.vector.length === 6));
ok('the outward names are sixteen and match the logo\'s palettes in order', PALETTE_NAMES.length === 16 && sixteen.every((p, i) => displayNameFor(p.name) === PALETTE_NAMES[i]));

// The original is exactly what the site did before.
const original = resolveColours(COLOUR_ORIGINAL, sixteen);
ok('original: the breath goes through all 96 colours in the old order', breathSequence(original).join() === sixteen.flatMap((p) => p.vector).join() && breathSequence(original).length === 96);
ok('original: every orb keeps its own palette, untouched', orbVectors(original, 16).every((v, i) => v.join() === sixteen[i].vector.join()));
ok('nothing chosen, or something unreadable, is the original', [undefined, null, 5, {}, 'neon', 'preset:nope', 'palette:Nobody', 'mine-3', ''].every((v) => snapColourChoice(v) === COLOUR_ORIGINAL && resolveColours(v, sixteen).choice === COLOUR_ORIGINAL));

// Presets and single palettes.
ok('there are a few presets, each with plain names and only real palettes', PRESETS.length >= 3 && PRESETS.length <= 6 && PRESETS.every((p) => p.label.length > 0 && p.palettes.length >= 2 && p.palettes.every((n) => PALETTE_NAMES.includes(n))));
ok('preset ids and labels are unique', new Set(PRESETS.map((p) => p.id)).size === PRESETS.length && new Set(PRESETS.map((p) => p.label)).size === PRESETS.length);
for (const p of PRESETS) {
  const r = resolveColours(`preset:${p.id}`, sixteen);
  ok(`${p.label}: made of exactly its palettes, in order`, r.choice === `preset:${p.id}` && r.palettes.length === p.palettes.length && r.palettes.every((c, i) => c.join() === sixteen.find((s) => displayNameFor(s.name) === p.palettes[i])!.vector.join()));
  const v = orbVectors(r, 16);
  ok(`${p.label}: sixteen orbs, six colours each, all from its palettes, and the palettes take turns`, v.length === 16 && v.every((x) => x.length === 6) && v.every((x, i) => x.every((c) => r.palettes[i % r.palettes.length].includes(c))));
  const b = breathSequence(r);
  ok(`${p.label}: the breath takes the palettes in turn`, b.length === 6 * p.palettes.length && b.every((c, k) => c === r.palettes[k % r.palettes.length][Math.floor(k / r.palettes.length) % 6]));
}
const one = resolveColours('palette:Tide', sixteen);
ok('one palette: the breath goes through its colours in order and then again', breathSequence(one).join() === sixteen[2].vector.join() && one.palettes.length === 1);
ok('one palette: all sixteen orbs use it, each starting one colour further along than the one before', orbVectors(one, 16).every((v, i) => v.join() === Array.from({ length: 6 }, (_, k) => sixteen[2].vector[(k + i) % 6]).join()));
ok('every one of the sixteen names can be chosen', PALETTE_NAMES.every((n) => snapColourChoice(`palette:${n}`) === `palette:${n}` && resolveColours(`palette:${n}`, sixteen).choice === `palette:${n}`));

// The visitor's kept palettes.
const made = [
  { source: 'device', kind: 'analogic', colors: [{ hex: '#112233', name: 'Deep blue' }, { hex: '#445566' }, { hex: '#778899', name: 'Grey' }, { hex: '#AABBCC' }, { hex: '#DDEEFF' }] },
  { source: 'The Color API', kind: 'triad', colors: [{ hex: '#FF0000' }, { hex: '#00FF00' }, { hex: '#0000FF' }] },
];
const kept = keptPalettes(made);
ok('two kept palettes are read, colours upper-cased and names carried', kept.length === 2 && kept[0].colours.join() === '#112233,#445566,#778899,#AABBCC,#DDEEFF' && kept[0].names[0] === 'Deep blue' && kept[0].names[1] === undefined);
ok('unusable palettes are left out and the rest renumbered', keptPalettes([{ colors: [{ hex: 'red' }, { hex: '#12345' }] }, made[1], made[0]]).length === 2 && keptPalettes([{ colors: [{ hex: 'red' }] }, made[1]]).length === 1);
ok('a palette with fewer than two usable colours is left out; junk is ignored; at most two are read', keptPalettes([{ colors: [{ hex: '#ABCDEF' }] }]).length === 0 && keptPalettes('x').length === 0 && keptPalettes(null).length === 0 && keptPalettes([made[0], made[1], made[0]]).length === 2);
ok('none kept: no saved-palette choice is offered (nothing empty or disabled)', savedChoicesFor([]).length === 0);
ok('one kept: only "your saved palette 1"', savedChoicesFor(kept.slice(0, 1)).join() === 'mine-1');
ok('two kept: palette 1, palette 2 and both', savedChoicesFor(kept).join() === 'mine-1,mine-2,mine-both');
ok('a saved choice with nothing saved is the original (the choice outlives the visit, the palette does not)', ['mine-1', 'mine-2', 'mine-both'].every((c) => resolveColours(c, sixteen, []).choice === COLOUR_ORIGINAL) && resolveColours('mine-2', sixteen, kept.slice(0, 1)).choice === COLOUR_ORIGINAL && resolveColours('mine-both', sixteen, kept.slice(0, 1)).choice === COLOUR_ORIGINAL);
const m1 = resolveColours('mine-1', sixteen, kept), m2 = resolveColours('mine-2', sixteen, kept), both = resolveColours('mine-both', sixteen, kept);
ok('palette 1 alone and palette 2 alone use their own colours', m1.palettes.length === 1 && m1.palettes[0].join() === kept[0].colours.join() && m2.palettes[0].join() === kept[1].colours.join());
ok('both: the breath alternates between the two palettes, colour by colour', (() => { const b = breathSequence(both); return b.length === 10 && b[0] === kept[0].colours[0] && b[1] === kept[1].colours[0] && b[2] === kept[0].colours[1] && b[3] === kept[1].colours[1] && b[4] === kept[0].colours[2] && b[5] === kept[1].colours[2]; })());
ok('both: the orbs alternate between the two palettes all the way round (even orbs the first, odd orbs the second)', (() => {
  const v = orbVectors(both, 16);
  return v.length === 16 && v.every((x, i) => (i % 2 === 0 ? x[0] === kept[0].colours[Math.floor(i / 2) % 5] : x[0] === kept[1].colours[Math.floor(i / 2) % 3]));
})());
ok('a palette of five colours gives an orb six that start on its first colour and blend round', (() => { const six = sixColours(kept[0].colours); return six.length === 6 && six[0] === kept[0].colours[0] && six.every((c) => /^#[0-9A-F]{6}$/.test(c)); })());
ok('a palette of three colours still gives six colours, and the sixth blends toward the first rather than repeating it', (() => { const six = sixColours(['#000000', '#FF0000', '#0000FF']); return six.length === 6 && six[0] === '#000000' && six[2] === '#FF0000' && six[4] === '#0000FF' && six[5] !== '#000000' && six[5] !== '#0000FF'; })());
ok('six colours come back as they are, shifted along', sixColours(sixteen[0].vector, 2).join() === Array.from({ length: 6 }, (_, k) => sixteen[0].vector[(k + 2) % 6]).join());
const everyChoice = [COLOUR_ORIGINAL, ...PRESETS.map((p) => `preset:${p.id}`), ...PALETTE_NAMES.map((n) => `palette:${n}`), 'mine-1', 'mine-2', 'mine-both'];
ok('every orb vector of every choice is six valid hex colours', everyChoice.every((c) => orbVectors(resolveColours(c, sixteen, kept), 16).every((v) => v.length === 6 && v.every((x) => /^#[0-9A-Fa-f]{6}$/.test(x)))));
ok('every breath sequence has at least two colours and valid hex', everyChoice.every((c) => { const b = breathSequence(resolveColours(c, sixteen, kept)); return b.length >= 2 && b.every((x) => /^#[0-9A-Fa-f]{6}$/.test(x)); }));

// Words.
ok('every choice has a plain label, a line in words, and a polite message', everyChoice.every((c) => colourChoiceLabel(c).length > 0 && colourChoiceDetail(c, kept).length > 0 && /^Breathing colours are now /.test(colourChoiceMessage('breath', c)) && /^Orb colours are now /.test(colourChoiceMessage('orbs', c))));
ok('the default reads "Original"', colourChoiceLabel('original') === 'Original' && colourChoiceLabel('anything else') === 'Original');
ok('a kept palette is described by its colour names and codes, so it never rests on colour alone', colourChoiceDetail('mine-1', kept).includes('Deep blue #112233') && colourChoiceDetail('mine-1', kept).includes('#445566') && colourChoiceDetail('mine-both', kept).includes('They take turns'));
ok('swatches are valid colours and few', [COLOUR_ORIGINAL, 'preset:cool', 'palette:Sky', 'mine-both'].every((c) => { const s = colourChoiceSwatches(c, sixteen, kept); return s.length >= 1 && s.length <= 16 && s.every((x) => /^#[0-9A-Fa-f]{6}$/.test(x)); }));
const extras = readFileSync('src/app/components/LogoLookExtras.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const visible = [...PRESETS.flatMap((p) => [p.label, ...p.palettes]), ...PALETTE_NAMES].join(' ');
ok('nothing a visitor reads is an older palette name or "Valar"', !new RegExp(`(?<![A-Za-z])(?:${HIDDEN_NAMES.join('|')})(?![A-Za-z])`).test(visible + ' ' + extras));
ok('the words use "Lens" and "Pattern", never "gateway" or "Insight"', !/gateway|insight/i.test([colourChoiceDetail('preset:cool'), colourChoiceLabel('mine-both'), colourChoiceMessage('orbs', 'mine-1'), extras].join(' ')));
ok('no claim of benefit: the names say how the colours look, not what they do for a person', !/calm|relax|heal|anxiety|stress|therap|mood|wellbeing|health/i.test([...PRESETS.map((p) => p.label), colourChoiceDetail('preset:night'), extras].join(' ')));

// Where the choice is kept and how the logo reads it (source checks).
const mem = readFileSync('src/lib/deviceMemory.ts', 'utf8');
ok('storage: the sway and both colour choices are display settings, validated on load, and only the choice (never a palette\'s colours) is written', /leafSway: isBool/.test(mem) && /breathColours: \(v\) => typeof v === 'string' && snapColourChoice\(v\) === v/.test(mem) && /orbColours: \(v\) => typeof v === 'string' && snapColourChoice\(v\) === v/.test(mem) && !/savePref\('(?:keptPalettes|palettes)'/.test(mem));
ok('storage: sway on and the Night colours unless chosen; a stored choice (Original included) wins over the default', /loadPrefs\(\)\.leafSway \?\? DEFAULT_LEAF_SWAY/.test(mem) && /loadPrefs\(\)\.breathColours === undefined \? DEFAULT_BREATH_COLOURS : snapColourChoice\(loadPrefs\(\)\.breathColours\)/.test(mem) && /loadPrefs\(\)\.orbColours === undefined \? DEFAULT_ORB_COLOURS : snapColourChoice\(loadPrefs\(\)\.orbColours\)/.test(mem));
ok('storage: "Forget me" and Emergency Exit clear the kept palettes held in memory', /clearKeptPalettes\(\);\s*emit\(\);/.test(mem));
const kp = readFileSync('src/lib/keptPalettes.ts', 'utf8').replace(/\/\/.*$/gm, '');
ok('the kept palettes are held in memory only: no storage, no network', !/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|document\.cookie/.test(kp));
const logoLook = readFileSync('src/lib/logoColours.ts', 'utf8').replace(/\/\/.*$/gm, '');
ok('the colour rules are pure: no storage, no network, no clock, no randomness', !/localStorage|sessionStorage|fetch\(|Date\.now|Math\.random/.test(logoLook));
ok('the ring, the gem and the orbs read the choice (and the original arrays when nothing is chosen)', /useBreathColours\(\)/.test(logoSrc) && /choice === 'original' \? allColors/.test(logoSrc) && /useOrbVectors\(\)/.test(readFileSync('src/app/components/NenyaLogo.tsx', 'utf8')) && /breathColoursRef\.current/.test(readFileSync('src/app/components/SpectralGem.tsx', 'utf8')) && /orbVecRef\.current/.test(readFileSync('src/app/components/SpectralGem.tsx', 'utf8')));
const set = readFileSync('src/app/components/AccessibilitySettings.tsx', 'utf8');
ok('settings: both groups and the sway switch are in the Logo look group, announced through the same polite message', /legend="Breathing colours"/.test(set) && /legend="Orb colours"/.test(set) && /<LeafSwaySwitch[^>]*onMessage=\{setLookMessage\}/.test(set) && /setLookMessage\(colourChoiceMessage\('breath', c\)\)/.test(set) && /setLookMessage\(colourChoiceMessage\('orbs', c\)\)/.test(set));
ok('settings: each colour group is a fieldset with a legend, radios with names, and a note; saved palettes appear only when there are some', /<fieldset/.test(extras) && /<legend/.test(extras) && /type="radio"/.test(extras) && /saved\.length > 0 &&/.test(extras) && /savedChoicesFor\(kept\)/.test(extras));
ok('settings: the sway switch is off where motion is not allowed and says why, and has a label and a description', /disabled=\{!!blocked\}/.test(extras) && /htmlFor="leaf-sway-toggle"/.test(extras) && /aria-describedby="leaf-sway-help"/.test(extras));
