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
