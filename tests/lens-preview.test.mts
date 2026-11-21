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

// Movement: the sliders edit how the chosen drawing is drawn and moved (owner's comment sheet, 2026-11-18).
{
  const slowThin = movePreview(0, 0, null), fastBold = movePreview(100, 100, null), unset = movePreview(null, null, null);
  ok('Speed sets how fast a chosen drawing draws itself (glacial slow, frenetic quick); Energy how bold its line is', slowThin.drawS === 10 && fastBold.drawS === 1 && slowThin.strokeWidth === 1.5 && fastBold.strokeWidth === 5.2 && unset.drawS === 3.5 && unset.strokeWidth === 3);
  ok('both stay in range for any input', [-50, 12, 49, 120, NaN].every((v) => { const m = movePreview(v, v, null); return m.drawS >= 1 && m.drawS <= 10 && m.strokeWidth >= 1.5 && m.strokeWidth <= 5.2; }));
  ok('the preview shows the chosen drawing, drawn at that speed and line weight and moved by the same sliders, and a plain ring only until one is chosen; still under reduced motion', /shapeById\(props\.shapeId\)/.test(comp) && /--draw/.test(comp) && /--sw/.test(comp) && /lensDraw/.test(comp) && /prefers-reduced-motion: reduce\) \{ \.lens-shape/.test(comp) && (mvp.match(/shapeId=\{(current|potential)MovementShapes\[0\] \?\? null\}/g) ?? []).length === 2);
}

// Pattern: the preview uses the chosen pattern and moves; the tapestry weaves (owner's comment sheet and the tests session's note, 2026-11-18).
{
  const ptp2 = readFileSync('src/app/components/pages/InsightGatewayPage.tsx', 'utf8'), acts = readFileSync('src/app/components/LensActivities.tsx', 'utf8');
  ok('the Pattern preview shows the chosen drawing (it draws itself) or the chosen pattern word (its weave drifts), layered by Depth and blurred by Clarity, and only falls back to rings when nothing is chosen', /lens-pat-shape/.test(comp) && /PATTERN_BG\[props\.word\.toLowerCase\(\)\]/.test(comp) && /lensPatDrift/.test(comp) && /border-4 border-current/.test(comp) && /filter: `blur\(\$\{pt\.blurPx\}px\)`/.test(comp));
  ok('it is still under reduced motion and can be paused, for Pattern as for Movement', /\(mv \|\| pt\) && <button/.test(comp) && /prefers-reduced-motion: reduce\) \{ \.lens-pat/.test(comp));
  ok('Pattern passes it the chosen drawing and the chosen pattern word for each state', /shapeId=\{currentPatternShapes\[0\] \?\? null\}/.test(ptp2) && /shapeId=\{potentialPatternShapes\[0\] \?\? null\}/.test(ptp2) && /word=\{currentPatterns\[0\] \?\? null\}/.test(ptp2));
  ok('the tapestry layers weave: each drifts its own way at its own pace, still under reduced motion, with a pause button', /@keyframes tapWeave/.test(acts) && /tap-layer/.test(acts) && /\['--wd' as string\]/.test(acts) && /@media \(prefers-reduced-motion: reduce\) \{ \.tap-layer/.test(acts) && /Pause the weaving/.test(acts));
}
