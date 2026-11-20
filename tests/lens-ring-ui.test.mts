// The lens ring screen (src/app/components/LensRing.tsx, behind VITE_LENS_RING): source-level checks that it is wired as the scope note says.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const ring = readFileSync('src/app/components/LensRing.tsx', 'utf8');
const tray = readFileSync('src/app/components/pages/LensTrayPage.tsx', 'utf8');
const env = readFileSync('docs/production-env.md', 'utf8');
const toml = readFileSync('netlify.toml', 'utf8');

ok('the tray mounts the ring only when its switch is on, and the cards stay', /ringOn = lensRingOn\(\)/.test(tray) && /ringOn && <LensRing/.test(tray) && /gatewayCards\.map\(\(c\) => \{/.test(tray));
ok('picking up a leaf opens the lens through the tray\'s own handler', /onPick=\{pick\}/.test(tray) && /return onOpen\(id as LensId\)/.test(tray));
ok('the ring reads its lenses from the list it is given, with no fixed count', !/\b(6|8|13)\b *leaves/.test(ring) && /ringItems\(all\)/.test(ring));
ok('every leaf is a real button with a name, a description and a roving tabindex', /<button/.test(ring) && /aria-label=\{leafName/.test(ring) && /aria-describedby=/.test(ring) && /tabIndex=\{i === idx \? 0 : -1\}/.test(ring));
ok('the ring is not a menu role (it would promise behaviour it does not have)', !/role="menu/.test(ring));
ok('Escape, arrows, Home and End are handled; first press informs, second picks up', /Escape/.test(ring) && /nextIndex\(e\.key/.test(ring) && /pressAction\(cur, i\) === 'pick-up'/.test(ring));
ok('a mouse press does not count as keyboard focus information (so the second tap, not the first, picks up)', /pointer\.current = true/.test(ring) && /!pointer\.current\) inform/.test(ring));
ok('nothing animates', !/transition|animation|motion\//.test(ring));
ok('below the target size the ring is not drawn', /!ringFits\(size, n\)\) return null/.test(ring));
ok('the switch is documented and on in the dev context only', /VITE_LENS_RING/.test(env) && /\[context\.dev\.environment\][\s\S]*VITE_LENS_RING = "on"/.test(toml) && !/\[context\.production\.environment\][\s\S]{0,400}VITE_LENS_RING/.test(toml));

// ── custom lens form and leaf (visit only)
import { readdirSync } from 'node:fs';
const form = readFileSync('src/app/components/CustomLensForm.tsx', 'utf8');
const card = readFileSync('src/app/components/CustomLensCard.tsx', 'utf8');
const store = readFileSync('src/app/components/useCustomLenses.ts', 'utf8');
const code = (s: string) => s.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
ok('custom lenses show only with the ring switch, as a leaf and as a card in the list', /ringOn && <LensRing items=\{ringItems\}/.test(tray) && /ringOn && custom\.lenses\.length > 0/.test(tray) && /ringOn && <CustomLensForm/.test(tray) && /custom: true/.test(tray));
ok('the form has labelled fields, a radio group of palette colours, a Pattern list from the pattern set, and says it is for this visit only', /<Label htmlFor/.test(form) && /type="radio"/.test(form) && /shapesFor\('pattern'\)/.test(form) && /only for this visit/.test(form) && /not sent anywhere/.test(form));
ok('colours are chosen from valarColors by index; there is no free colour input', /valarColors\.map/.test(form) && !/type="color"/.test(form));
ok('errors are announced and every target is at least 44 px (min-h-11)', /role="alert"/.test(form) && /min-h-11/.test(form) && /min-h-11/.test(card));
ok('custom lens text is rendered as text, not markup (the only inlined markup is our own Pattern drawing)', (card.match(/dangerouslySetInnerHTML/g) ?? []).length === 1 && /shape\.svg/.test(card) && !/dangerouslySetInnerHTML/.test(form));
ok('custom lenses are kept in memory only: no storage, device memory, network or coach in the store, form or card', [store, form, card].every((s) => !/localStorage|sessionStorage|indexedDB|deviceMemory|usePref|fetch\(|sendBeacon|coachService|coachClient/.test(code(s))));
const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]));
const users = walk('src').filter((f) => /\.(ts|tsx)$/.test(f) && /customLens|useCustomLenses|CustomLens/.test(readFileSync(f, 'utf8')));
ok('only the tray, the form, the card, the store and the model touch custom lenses (never a report, a PDF, the coach or the saved draft)', users.every((f) => /LensTrayPage|CustomLensForm|CustomLensCard|useCustomLenses|customLens\.ts|lensRing\.ts/.test(f)), users.join(', '));
