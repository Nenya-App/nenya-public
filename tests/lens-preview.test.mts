// The live previews on the Movement and Pattern slider cards (src/lib/lensPreview.ts, LensPreview.tsx): the wireframe's mapping, in words as well, still under reduced motion, pausable.
import { readFileSync } from 'node:fs';
import { movePreview, patternPreview } from '../src/lib/lensPreview.ts';
import { ok } from './helpers.mts';

const slow = movePreview(0, 0, 'upward'), fast = movePreview(100, 100, 'flowing'), none = movePreview(null, null, null);
ok('Speed sets how long a drift takes and Energy how far and how strong it shows', slow.durationS === 9 && fast.durationS === 0.5 && slow.amplitudePx === 8 && fast.amplitudePx === 48 && fast.opacity > slow.opacity);
ok('the first direction word sets which way; still and stuck do not drift', slow.dx === 0 && slow.dy === -1 && fast.dx === 1 && movePreview(50, 50, 'still').still && movePreview(50, 50, 'stuck').still && !slow.still);
ok('a slider not set rests at the middle', none.durationS === 2.5 && none.amplitudePx === 28 && none.words === 'steady, moderate');
ok('the words say the same: direction, speed, energy', slow.words === 'upward, glacial, depleted' && fast.words === 'flowing, frenetic, surging');
const fog = patternPreview(0, 0, 'branching'), sharp = patternPreview(100, 100, null);
ok('Clarity sets the blur and Depth how many layers show; the words say it', fog.blurPx === 6 && sharp.blurPx === 0 && fog.layers === 1 && sharp.layers === 3 && fog.words === 'branching, foggy, surface' && sharp.words === 'crystal clear, profound');
const comp = readFileSync('src/app/components/LensPreview.tsx', 'utf8'), mvp = readFileSync('src/app/components/pages/MovementGatewayPage.tsx', 'utf8'), ptp = readFileSync('src/app/components/pages/InsightGatewayPage.tsx', 'utf8');
ok('the preview is a named image with a polite words line, still under reduced motion, and can be paused', /role="img"/.test(comp) && /role="status" aria-live="polite"/.test(comp) && /@media \(prefers-reduced-motion: reduce\)/.test(comp) && /Pause the preview/.test(comp) && /aria-pressed=\{paused\}/.test(comp) && /min-h-11/.test(comp));
ok('Movement and Pattern show it on the sliders card of both states', (mvp.match(/<LensPreview /g) ?? []).length === 2 && (ptp.match(/<LensPreview /g) ?? []).length === 2 && /parts: \[2, 3, 8\]/.test(mvp) && /parts: \[2, 3, 8\]/.test(ptp));
