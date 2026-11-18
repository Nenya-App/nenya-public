// The Pattern tapestry and the Movement path of movement (optional activities, each behind its own switch, tray mode only, inside More descriptions).
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { tapestryWords, tapestryNeedsWarning, cleanLayers, stepPoint, pathWords, pathLook, simplifyPoints, cleanPoints, lensPathOn, lensTapestryOn } from '../src/lib/lensActivities.ts';

ok('both switches are off by default (and never on without the tray)', !lensPathOn() && !lensTapestryOn());
ok('the tapestry says its layers in words, base first', tapestryWords(['Layered', 'Branching', 'Circular']) === 'base: layered, then branching, then circular' && tapestryWords([]) === 'nothing woven yet' && tapestryWords(null) === 'nothing woven yet');
ok('the tapestry warns before a fourth layer above the base, never earlier', !tapestryNeedsWarning(['A']) && !tapestryNeedsWarning(['A', 'B', 'C']) && tapestryNeedsWarning(['A', 'B', 'C', 'D']));
ok('saved layers are cleaned: only known pattern words survive, junk is dropped', JSON.stringify(cleanLayers(['Linear', 'nope', 5, 'Unified'])) === '["Linear","Unified"]' && cleanLayers('x').length === 0);
let p = stepPoint([], 'right'); p = stepPoint(p, 'up'); p = stepPoint(p, 'right');
ok('step buttons build a path from the left edge: right, up, right', JSON.stringify(p) === '[[10,50],[30,50],[30,30],[50,30]]');
ok('the path says where it starts, then its directions, then the Movement quality words', pathWords(p, ['Gentle']) === 'starts at the left, goes right, then up, then right; gentle' && pathWords([]) === 'nothing drawn yet' && /no steps yet/.test(pathWords([[50, 50]])));
ok('a path stays on the pad when steps would leave it', JSON.stringify(stepPoint([[0, 0]], 'left')) === '[[0,0],[0,0]]');
const long: [number, number][] = Array.from({ length: 300 }, (_, i) => [i / 3, 50]);
const small = simplifyPoints(long);
ok('a saved path is small (60 points at most), whole numbers, and keeps its first and last point', small.length === 60 && small[0][0] === 0 && small[59][0] === 100 && small.every(([x, y]) => Number.isInteger(x) && Number.isInteger(y)));
ok('saved points are cleaned: bad entries are dropped and values kept on the pad', cleanPoints([[1, 2], 'x', [1], [500, -5]]).length === 2 && cleanPoints([[500, -5]])[0][0] === 100 && cleanPoints(undefined).length === 0);
ok('the quality words set the look of the line (broken, thick, thin) and it is still said in words', pathLook(['Jerky']).dash !== 'none' && pathLook(['Forceful']).width > pathLook([]).width && pathLook(['Gentle']).width < pathLook([]).width);

const comp = readFileSync('src/app/components/LensActivities.tsx', 'utf8');
const move = readFileSync('src/app/components/pages/MovementGatewayPage.tsx', 'utf8');
const pat = readFileSync('src/app/components/pages/InsightGatewayPage.tsx', 'utf8');
const rt = readFileSync('src/lib/reportText.ts', 'utf8');
const lib = readFileSync('src/lib/lensActivities.ts', 'utf8');
ok('Movement shows the path only with its switch, as its own card (it replaces the old drawing pad: one drawing, not two), and saves it under new optional keys', /b\[7\] = <PathActivity/.test(move) && /parts: lensPathOn\(\) \? \[7\] : \[5\]/.test(move) && /movementPath: simplifyPoints/.test(move) && /movementPathWords/.test(move));
ok('Pattern shows the tapestry only with its switch, as its own card, and saves it under new optional keys', /b\[7\] = <TapestryActivity/.test(pat) && /lensTapestryOn\(\) \? \[\{ stage: 'present', title: 'The tapestry', parts: \[7\] \}/.test(pat) && /tapestryLayers/.test(pat) && /tapestryWords/.test(pat));
ok('the path takes its feel from the Movement quality words (no second list of the same words)', /feel=\{currentQualities\}/.test(move) && !/<select[^>]*feel/i.test(comp));
ok('both switches need the tray, and the pages reopen old drafts that lack the new keys', /lensTrayOn\(\) && import\.meta\.env\?\.VITE_LENS_TAPESTRY === 'on'/.test(lib) && /lensTrayOn\(\) && import\.meta\.env\?\.VITE_LENS_PATH === 'on'/.test(lib) && /cleanPoints\(init\?\.movementPath\)/.test(move) && /cleanLayers\(init\?\.tapestryLayers\)/.test(pat));
ok('the report text carries words only for both activities', /Path of movement: \$\{data\.movementPathWords\}/.test(rt) && /Tapestry: \$\{data\.tapestryWords\}/.test(rt) && !/movementPath\b[^W]/.test(rt.replace(/movementPathWords/g, '')) && !/tapestryLayers/.test(rt));
ok('every control has a name, there is a text twin, the warning is shared, step buttons replace the pointer, and reduced motion shows the finished line', /htmlFor="tapestry-next"/.test(comp) && /role="status" data-tapestry-words/.test(comp) && /role="status" data-path-words/.test(comp) && /<FewerWarning/.test(comp) && /\['up', 'down', 'left', 'right'\]/.test(comp) && /prefers-reduced-motion: reduce/.test(comp) && /aria-label=\{`Remove /.test(comp));
ok('nothing is sent anywhere and nothing is scored', !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|score|streak|badge/i.test(comp + lib));
