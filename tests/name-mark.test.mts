// The mark (owner, 2026-11-15, reset from the editor on 2026-11-17): nenya.biz with four e's stacked in one letter space: the white e, a gold e in front that turns half way and
// rests upside down (nənya.biz, "nunya biz"), and two more. A visual form of the session ID: colours from the session's pair, the arrangement of the other e's from the ID, a
// fidget when pointed at. Plain "Nenya" everywhere else; screen readers hear "nenya.biz"; still with reduced motion. A demonstration, nothing to do with security.
import { readFileSync } from 'node:fs';
import {
  MARK_FIDGET, MARK_LAYERS, MARK_MIN_CONTRAST, MARK_MOTION, MARK_SETTINGS, SETTLE, blendHex, contrastOf, fidgetPlan, hexToRgb, markArrangement, markColourIndexes, markPalette, pairFromId, readableOn, seededRng,
} from '../src/lib/nameMark.ts';
import { getSessionMarkId, setSessionMarkId, subscribeSessionMark } from '../src/lib/sessionMarkStore.ts';
import { shadowId } from '../src/lib/savedReflection.ts';
import { ok } from './helpers.mts';

// the owner's settings of 2026-11-17
ok("the owner's resting positions, per face", JSON.stringify(MARK_SETTINGS.lyric) === JSON.stringify({ nudge: -0.03, rise: -0.025, after: -0.01 }) && JSON.stringify(MARK_SETTINGS.body) === JSON.stringify({ nudge: 0.085, rise: 0.02, after: -0.02 }));
ok('the single turn: Cormorant clockwise 4.2 s after 0.7 s, Manrope counterclockwise 4.0 s after 1.0 s with a 0.1 s pause, both settling with a 1.10 lift', MARK_MOTION.lyric.way === 1 && MARK_MOTION.lyric.degrees === 180 && MARK_MOTION.lyric.durationMs === 4200 && MARK_MOTION.lyric.delayMs === 700 && MARK_MOTION.body.way === -1 && MARK_MOTION.body.durationMs === 4000 && MARK_MOTION.body.delayMs === 1000 && MARK_MOTION.body.pauseMs === 100 && MARK_MOTION.lyric.easing === SETTLE && MARK_MOTION.body.easing === SETTLE && MARK_MOTION.lyric.lift === 1.1 && MARK_MOTION.body.lift === 1.1);
ok('the gold e stays like the white e in Cormorant and turns to a colour in Manrope', MARK_MOTION.lyric.goldColour === 'same' && MARK_MOTION.body.goldColour === 'turns');
ok('the fidget: 16 half turns; Cormorant 1.0 s with 0.5 s pauses, either way at random; Manrope 0.8 s with 0.4 s pauses, alternating', MARK_FIDGET.lyric.steps === 16 && MARK_FIDGET.lyric.turnMs === 1000 && MARK_FIDGET.lyric.pauseMs === 500 && MARK_FIDGET.lyric.ways === 'either' && MARK_FIDGET.body.steps === 16 && MARK_FIDGET.body.turnMs === 800 && MARK_FIDGET.body.pauseMs === 400 && MARK_FIDGET.body.ways === 'alternate' && MARK_LAYERS === 4);

// the session ID as two colours, and what is made from it
const BG_LIGHT = hexToRgb('#F5F1ED'), BG_DARK = hexToRgb('#1A1512');
ok('a session ID is two hex colours; anything else is not', JSON.stringify(pairFromId('#7a9b9e.#dac682')) === JSON.stringify(['#7a9b9e', '#dac682']) && pairFromId('nope') === null && pairFromId('#7a9b9e') === null && pairFromId('#zzzzzz.#dac682') === null);
ok('a shadow ID (the random pair) is a session ID too', pairFromId(shadowId()) !== null);
ok('the palette is the pair and two colours between, each at least 3:1 against a light or a dark page', [BG_LIGHT, BG_DARK].every((bg) => ['#7a9b9e.#dac682', '#ffffff.#fafafa', '#000000.#101010', '#f7d44a.#fff6d8'].every((id) => { const p = markPalette(id, bg); return p.length === 4 && p.every((c) => contrastOf(hexToRgb(c), bg) >= MARK_MIN_CONTRAST - 0.001); })));
ok('a colour already readable is left as it is; a pale one on a light page is darkened until it is', readableOn('#2a2623', BG_LIGHT) === '#2a2623' && contrastOf(hexToRgb(readableOn('#fff6d8', BG_LIGHT)), BG_LIGHT) >= 3);
ok('blending: halfway between black and white is grey', blendHex('#000000', '#ffffff', 0.5) === '#808080');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
ok('the same ID always gives the same arrangement and colours; a different ID can differ', same(markArrangement('#7a9b9e.#dac682', 'body'), markArrangement('#7a9b9e.#dac682', 'body')) && same(markColourIndexes('#7a9b9e.#dac682', 'lyric'), markColourIndexes('#7a9b9e.#dac682', 'lyric')) && Array.from({ length: 40 }, (_, i) => JSON.stringify([markArrangement(`#00000${i % 10}.#1111${(i * 7) % 90}`, 'body'), markColourIndexes(`#00000${i % 10}.#1111${(i * 7) % 90}`, 'body')])).filter((v, i, a) => a.indexOf(v) === i).length > 8);
ok('the white e is always upright and the gold e always turned, whatever the ID (that is what makes it nənya)', Array.from({ length: 60 }, (_, i) => markArrangement(shadowId(), i % 2 ? 'body' : 'lyric')).every((a) => a.length === 4 && a[0] === false && a[1] === true));
ok('the seeded generator repeats for a seed and differs between seeds', same([...Array(5)].map(((r) => () => r())(seededRng('x'))), [...Array(5)].map(((r) => () => r())(seededRng('x')))) && !same([...Array(5)].map(((r) => () => r())(seededRng('x'))), [...Array(5)].map(((r) => () => r())(seededRng('y')))));

// the fidget plan
for (const face of ['lyric', 'body'] as const) {
  const plan = fidgetPlan(face);
  ok(`${face}: a fidget is 16 half turns of one of the four e's, in one of the four colours`, plan.length === 16 && plan.every((s) => s.layer >= 0 && s.layer < 4 && s.colour >= 0 && s.colour < 4 && (s.way === 1 || s.way === -1)));
}
ok('Manrope alternates the way each turn goes', fidgetPlan('body', Math.random, 1).every((s, i) => s.way === (i % 2 === 0 ? 1 : -1)) && fidgetPlan('body', Math.random, -1).every((s, i) => s.way === (i % 2 === 0 ? -1 : 1)));
ok('Cormorant turns either way at random (both ways turn up over many plans), and every e gets a turn over many plans', (() => { const ways = new Set<number>(), layers = new Set<number>(); for (let k = 0; k < 40; k++) for (const s of fidgetPlan('lyric')) { ways.add(s.way); layers.add(s.layer); } return ways.size === 2 && layers.size === 4; })());
ok('a seeded random gives a repeatable plan', same(fidgetPlan('lyric', seededRng('p')), fidgetPlan('lyric', seededRng('p'))));

// the shared session ID
const seen: string[] = []; const off = subscribeSessionMark(() => seen.push(getSessionMarkId()));
const shadow = getSessionMarkId();
ok('with no ID set there is a random shadow ID, steady for the visit', pairFromId(shadow) !== null && getSessionMarkId() === shadow);
setSessionMarkId('#7a9b9e.#dac682');
ok('setting the ID changes it and tells the mark; setting it again changes nothing', getSessionMarkId() === '#7a9b9e.#dac682' && seen.length === 1 && (setSessionMarkId('#7a9b9e.#dac682'), seen.length === 1));
setSessionMarkId(null);
ok('clearing it goes back to the same shadow ID', getSessionMarkId() === shadow);
off();

// the component and where it is shown
const src = readFileSync('src/app/components/NenyaMark.tsx', 'utf8') + readFileSync('src/lib/nameMark.ts', 'utf8');
ok('screen readers hear "nenya.biz"; the letters themselves are hidden from them', /role="img"\s+aria-label="nenya\.biz"/.test(src) && /aria-hidden="true"/.test(src));
ok('the gold e is in front of the white one, and the two extras are under it', /const Z = \[2, 3, 0, 0\]/.test(src));
ok('the single turn happens once, on first sight, and the mark holds still under reduced motion (no turn, no fidget)', /if \(started \|\| disposed\) return;/.test(src) && /if \(reduce \|\| typeof els\[1\]\.animate !== 'function'\) return;/.test(src) && /if \(reduce \|\| disposed\) return;/.test(src) && /setCanPlay\(!reduce\)/.test(src));
ok('pointing at the mark starts the fidget and keeps it going while the pointer stays; a tap plays one run; it stops on Escape', /addEventListener\('pointerenter', enter\)/.test(src) && /hovering = true; void start\(true\)/.test(src) && /addEventListener\('pointerdown', tap\)/.test(src) && /e\.key === 'Escape'/.test(src));
ok('a keyboard user has a button to play the mark and the same button stops it (WCAG 2.2.2)', /aria-pressed=\{playing\}/.test(src) && /Play the mark/.test(src) && /Stop the mark/.test(src));
ok('the space after the stack moves only the letters after it; the nudge and rise move only an upside-down e', /marginRight: `\$\{MARK_SETTINGS\[face\]\.after\}em`/.test(src) && /odd \? place\.nudge : 0/.test(src) && /odd \? -place\.rise : 0/.test(src));
ok('the colours are kept readable against the page the mark sits on, and come from the session ID', /markPalette\(id, pageColour\(mark\)\)/.test(src) && /useSyncExternalStore\(subscribeSessionMark, getSessionMarkId/.test(src));
const footer = readFileSync('src/app/components/AppFooter.tsx', 'utf8');
ok('the footer shows the mark only with VITE_NAME_MARK=on, and the plain name otherwise', /nameMarkOn\(\) \? <NenyaMark face="body"/.test(footer) && /: <span className="text-sm font-medium">Nenya<\/span>/.test(footer));
ok('the copyright line keeps the plain name', /<p>© 2025 Nenya<\/p>/.test(footer));
ok('the main app and the coach tell the mark which session ID to use', /setSessionMarkId\(sessionId( \|\| null)?\)/.test(readFileSync('src/app/App.tsx', 'utf8')) && /setSessionMarkId\(colors \? sessionIdFrom\(colors\.color1, colors\.color2\) : null\)/.test(readFileSync('src/coach/CoachPage.tsx', 'utf8')));
