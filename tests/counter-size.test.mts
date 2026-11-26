// The breathing counter's size (owner, 2026-11-26: it was outsized next to the front page's animation): about three quarters of what it was.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const c = readFileSync('src/app/components/BreathingCounter.tsx', 'utf8');
ok('the box: 160px as a circle, 112px closed to the word, and 212px only with the list of paces open', c.includes("width: collapsed ? '112px' : minimized ? '160px' : '212px',"));
ok('the circle is 84px (was 112), drawn from the same 112-unit picture', /className="bc-circle" style=\{\{ position: 'relative', width: '84px', height: '84px' \}\}/.test(c) && /<svg viewBox="0 0 112 112" width="84" height="84"/.test(c));
ok('the number and the word are scaled with it, and the word stays at least 12px', /fontSize: '2\.1rem'/.test(c) && /fontSize: '12px',\s*\n\s*color: 'rgba\(232,160,32,0\.9\)'/.test(c));
ok('less padding around the circle', c.includes("style={{ padding: '2px 12px 8px', cursor:"));

// Clicking the counter itself opens and closes it (owner, 2026-11-26): the circle shows or hides the list of paces; dragging it does not.
ok('the circle is a control that opens and closes the list, named for what it does', /role: 'button',\s*\n\s*tabIndex: 0,/.test(c) && /'aria-expanded': !minimized,/.test(c) && /'aria-label': minimized \? 'Show the breathing paces' : 'Hide the breathing paces',/.test(c));
ok('a click, Enter or Space toggles it', /onClick: toggleList,/.test(c) && /e\.key === 'Enter' \|\| e\.key === ' '/.test(c) && /onMinimizedChange\(!minimized\)/.test(c));
ok('letting go after dragging the counter does not toggle it', /onDragStart=\{\(\) => \{ dragged\.current = true; \}\}/.test(c) && /onPointerDownCapture=\{\(\) => \{ dragged\.current = false; \}\}/.test(c) && /if \(dragged\.current\) return;/.test(c));
const check = readFileSync('scripts/smithy-offline-check.mts', 'utf8');
ok('the offline check presses the lower "Explore Your Senses" button, the one that opens the Lenses', /await click\('Explore Your Senses', 'open the Lenses', true\);/.test(check));

// The corner buttons are full touch targets (owner, 2026-11-26), and the list of paces ends with "Set Custom", which opens the settings panel.
const sw = readFileSync('src/app/components/BreathTonesSwitch.tsx', 'utf8');
const corner = /width: '44px',\s*\n\s*height: '44px',/g;
ok('the close and minimize buttons are 44 by 44', (c.match(corner) ?? []).length === 2);
ok('the tones button on the counter is 44 by 44 and sits beside the minimize button without overlapping it', (sw.match(corner) ?? []).length === 1 && /top: 0,\s*\n\s*right: '44px',/.test(sw) && /top: 0,\s*\n\s*right: 0,/.test(c) && /top: 0,\s*\n\s*left: 0,/.test(c));
ok('the top row is tall enough for them, with the drag handle between the buttons', c.includes("...(collapsed ? { padding: '4px 0 0' } : { alignItems: 'center', height: '44px', padding: '0 88px 0 44px' }),"));
ok('"Set Custom" opens the settings panel and says where the custom pace is', /Set Custom/.test(c) && /Opens the settings panel\. Your own pace is near the top\./.test(c) && /setBreathingPanel\(true\);/.test(c) && /minHeight: '44px'/.test(c));
ok('it closes the list first, so the list does not cover the panel', /if \(onMinimizedChange\) onMinimizedChange\(true\);\s*\n\s*setBreathingPanel\(true\);/.test(c));
// On a short screen the list scrolls by itself, so the circle and the corner buttons stay put and every pace stays reachable.
ok('the open counter stays below the site header: the list scrolls instead of growing', c.includes("maxHeight: 'max(120px, calc(100dvh - 6rem - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 162px))',") && c.includes("overflowY: 'auto',"));
ok('a swipe on the list scrolls it instead of dragging the counter', c.includes("touchAction: 'pan-y',") && /el\?\.addEventListener\('pointerdown', \(e\) => e\.stopPropagation\(\)\);/.test(c) && /<div ref=\{keepPressInList\}/.test(c));

// The list of paces is readable (owner, 2026-11-26: the descriptions were very faint): every text color in it is at least 7:1 (WCAG AAA)
// on the counter's box, worked out for the lightest page that could show through it (white).
const list = c.slice(c.indexOf('{PRESETS.map('), c.indexOf('</m.div>'));
const box = /background: 'rgba\((\d+),(\d+),(\d+),([\d.]+)\)',\s*\n\s*border:/.exec(c)!.slice(1).map(Number);
const behind = box.slice(0, 3).map((v) => v * box[3] + 255 * (1 - box[3]));
const lum = (rgb: number[]) => rgb.map((v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const named = Object.fromEntries([...c.matchAll(/^const (PACE_\w+) = '#([0-9A-F]{6})';/gm)].map((x) => [x[1], [0, 2, 4].map((i) => parseInt(x[2].slice(i, i + 2), 16))]));
const used = [...list.matchAll(/(?<![\w-])color: ([^,}\n]+)/g)].map((x) => x[1].trim());
ok('every text color in the list is one of the two named pace colors, with no see-through gold left', used.length >= 6 && used.every((u) => u in named), used.join(' | '));
for (const [name, rgb] of Object.entries(named)) {
  const r = (lum(rgb) + 0.05) / (lum(behind) + 0.05);
  ok(`${name} on the counter's box is at least 7:1`, r >= 7, r.toFixed(2));
}
ok('there are two of them: one for the pace names, a softer one for the words under them', Object.keys(named).join() === 'PACE_NAME,PACE_TEXT');
ok('the pace in use is still marked without color alone: a bolder name beside a filled dot', /fontWeight: active \? 600 : 400,/.test(list) && /background: active \? 'rgba\(232,160,32,0\.95\)' : 'rgba\(232,160,32,0\.25\)',/.test(list));
