// The lens ring screen (src/app/components/LensRing.tsx, behind VITE_LENS_RING): source-level checks that it is wired as the scope note says.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const ring = readFileSync('src/app/components/LensRing.tsx', 'utf8');
const tray = readFileSync('src/app/components/pages/LensTrayPage.tsx', 'utf8');
const env = readFileSync('docs/production-env.md', 'utf8');
const toml = readFileSync('netlify.toml', 'utf8');

ok('the tray mounts the ring only when its switch is on, and the cards stay', /lensRingOn\(\) && <LensRing/.test(tray) && /gatewayCards\.map\(\(c\) => \{/.test(tray));
ok('picking up a leaf opens the lens through the tray\'s own handler', /onPick=\{\(id\) => onOpen\(id as LensId\)\}/.test(tray));
ok('the ring reads its lenses from the list it is given, with no fixed count', !/\b(6|8|13)\b *leaves/.test(ring) && /ringItems\(all\)/.test(ring));
ok('every leaf is a real button with a name, a description and a roving tabindex', /<button/.test(ring) && /aria-label=\{leafName/.test(ring) && /aria-describedby=/.test(ring) && /tabIndex=\{i === idx \? 0 : -1\}/.test(ring));
ok('the ring is not a menu role (it would promise behaviour it does not have)', !/role="menu/.test(ring));
ok('Escape, arrows, Home and End are handled; first press informs, second picks up', /Escape/.test(ring) && /nextIndex\(e\.key/.test(ring) && /pressAction\(cur, i\) === 'pick-up'/.test(ring));
ok('a mouse press does not count as keyboard focus information (so the second tap, not the first, picks up)', /pointer\.current = true/.test(ring) && /!pointer\.current\) inform/.test(ring));
ok('nothing animates', !/transition|animation|motion\//.test(ring));
ok('below the target size the ring is not drawn', /!ringFits\(size, n\)\) return null/.test(ring));
ok('the switch is documented and on in the dev context only', /VITE_LENS_RING/.test(env) && /\[context\.dev\.environment\][\s\S]*VITE_LENS_RING = "on"/.test(toml) && !/\[context\.production\.environment\][\s\S]{0,400}VITE_LENS_RING/.test(toml));
