// Every breath can be seen (owner, 2026-11-26): the ring uses only colours that stand out from the page it is on, each palette keeps at least three,
// and the button's pulse and the gem take the same list. Also the edge line being tried in the local preview.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { EDGE_COLOUR, MIN_COLOURS, MIN_DIFFERENCE, PAGE_BACKGROUND, RIM_ALPHA, RING_PEAK_OPACITY, ringDifference, visibleColours, visibleRing, ringEdgeWanted } from '../src/lib/ringVisibility.ts';
import { RING_STOPS } from '../src/lib/breathStrength.ts';
import { PRESETS, breathSequence, resolveColours } from '../src/lib/logoColours.ts';

const src = (p: string) => readFileSync(p, 'utf8');
const css = src('src/styles/globals.css');
const ring = src('src/app/components/ValarBreathingLogo.tsx');
const bg = (sel: RegExp) => { const at = sel.exec(css)!.index; return /--background:\s*(#[0-9a-fA-F]{6})/.exec(css.slice(at))![1].toUpperCase(); };
ok('the page colours are the ones in the style sheet', PAGE_BACKGROUND.light === bg(/^:root\s*\{/m) && PAGE_BACKGROUND.dark === bg(/^\.dark\s*\{/m));
ok('the edge strength measured is the ring\'s own: its last gradient stop times its peak opacity', RING_PEAK_OPACITY === 0.6 && /opacity: \$\{opacity \* 0\.6\}/.test(ring) && Math.abs(RIM_ALPHA - RING_STOPS[3] * 0.6) < 1e-9 && Math.abs(RIM_ALPHA - 0.36) < 1e-9);
ok('the cut: a colour difference of 10 at the ring\'s edge, and at least three colours a palette', MIN_DIFFERENCE === 10 && MIN_COLOURS === 3);
ok('the page colour itself does not stand out at all, white does on dark and black does on light', ringDifference(PAGE_BACKGROUND.dark, 'dark') < 0.01 && ringDifference('#FFFFFF', 'dark') >= 10 && ringDifference('#000000', 'light') >= 10);

const sixteen = [...ring.matchAll(/name: '([^']+)',\s*\n\s*vector: \[([^\]]+)\]/g)].map((m) => ({ name: m[1], vector: m[2].match(/#[0-9A-F]{6}/gi)! }));
ok('the test reads all sixteen palettes', sixteen.length === 16 && sixteen.every((p) => p.vector.length === 6));
const lum = (h: string) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
for (const theme of ['dark', 'light'] as const) {
  const out = sixteen.map((p) => ({ p, got: visibleColours(p.vector, theme) }));
  ok(`${theme}: every palette keeps at least three colours`, out.every((x) => x.got.length >= 3), out.filter((x) => x.got.length < 3).map((x) => x.p.name).join());
  ok(`${theme}: every colour used stands out`, out.every((x) => x.got.every((h) => ringDifference(h, theme) >= 10)));
  ok(`${theme}: a colour that already stands out is kept exactly, in its palette's order`, out.every((x) => { const strong = x.p.vector.filter((h) => ringDifference(h, theme) >= 10); return x.got.filter((h) => strong.includes(h)).join() === strong.join(); }));
  ok(`${theme}: colours are only changed where a palette would have fewer than three, and no more than needed`, out.every((x) => { const strong = x.p.vector.filter((h) => ringDifference(h, theme) >= 10).length; return x.got.length === Math.max(strong, 3); }));
  const changed = out.flatMap((x) => x.got.filter((h) => !x.p.vector.includes(h)).map((h) => [h, x] as const));
  ok(`${theme}: a changed colour moves ${theme === 'dark' ? 'lighter' : 'darker'}`, changed.every(([h, x]) => x.p.vector.some((o) => (theme === 'dark' ? lum(h) > lum(o) : lum(h) < lum(o)))));
  for (const choice of ['original', ...PRESETS.map((p) => `preset:${p.id}`)]) {
    const seq = breathSequence(visibleRing(resolveColours(choice, sixteen), theme));
    ok(`${theme}, ${choice}: every breath stands out`, seq.length >= 3 && seq.every((h) => /^#[0-9A-F]{6}$/i.test(h) && ringDifference(h, theme) >= 10), `${seq.length} breaths`);
  }
}
ok('a kept palette of two faint colours stays two, both made to stand out', (() => { const got = visibleColours([PAGE_BACKGROUND.light, '#E0DCD8'], 'light'); return got.length === 2 && got.every((h) => ringDifference(h, 'light') >= 10); })());

ok('the ring, and so the gem, reads the list for the page it is on', /const \{ theme \} = useTheme\(\);/.test(ring) && /breathSequence\(visibleRing\(resolveColours\(choice, valarColors, kept\), theme\)\)/.test(ring) && /\[choice, kept, theme\]/.test(ring));
const button = src('src/app/components/MoreBelowButton.tsx');
ok('the button\'s pulse takes the ring\'s list, so it matches the breath just ended', /const colours = useBreathColours\(\);/.test(button) && /colours\[end\.index % colours\.length\]/.test(button) && !/allColors/.test(button));

// The edge line is only being tried: the local development copy, and only when the address asks for it.
ok('the edge line shows only in the development copy with ?ringedge=on', ringEdgeWanted(true, '?ringedge=on') && ringEdgeWanted(true, '?a=1&ringedge=on') && !ringEdgeWanted(false, '?ringedge=on') && !ringEdgeWanted(true, '') && !ringEdgeWanted(true, '?ringedge=off'));
for (const theme of ['dark', 'light'] as const) {
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const shown = '#' + rgb(EDGE_COLOUR[theme]).map((v, i) => Math.round(v * 0.6 + rgb(PAGE_BACKGROUND[theme])[i] * 0.4).toString(16).padStart(2, '0')).join('');
  const r = (Math.max(lum(shown), lum(PAGE_BACKGROUND[theme])) + 0.05) / (Math.min(lum(shown), lum(PAGE_BACKGROUND[theme])) + 0.05);
  ok(`${theme}: the edge line is at least 3:1 on the page at the ring's peak`, r >= 3, r.toFixed(2));
}
ok('the ring draws the line only when asked, from the build\'s own development flag', /const EDGE_PREVIEW = ringEdgeWanted\(import\.meta\.env\.DEV, typeof window === 'undefined' \? '' : window\.location\?\.search \?\? ''\);/.test(ring) && /EDGE_PREVIEW \? \{ border: `2px solid \$\{EDGE_COLOUR\[theme\]\}` \} : \{\}/.test(ring));
