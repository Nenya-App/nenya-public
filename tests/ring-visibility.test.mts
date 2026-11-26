// Every breath can be seen (owner, 2026-11-26): the ring uses only colours that stand out from the page it is on, each palette keeps at least three,
// and the button's pulse and the gem take the same list. Also the soft edge line.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { EDGE_COLOUR, EDGE_GLOW, EDGE_WIDTH, MIN_COLOURS, MIN_DIFFERENCE, PAGE_BACKGROUND, RIM_ALPHA, RING_PEAK_OPACITY, ringDifference, visibleColours, visibleRing } from '../src/lib/ringVisibility.ts';
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

ok('the ring, the gem and the button read the lists made for each theme', /dark: breathSequence\(visibleRing\(chosen, 'dark'\)\), light: breathSequence\(visibleRing\(chosen, 'light'\)\)/.test(ring) && /useBreathColours\(\)/.test(src('src/app/components/MoreBelowButton.tsx')) && /useBreathColours\(\)/.test(src('src/app/components/SpectralGem.tsx')) && !/allColors/.test(src('src/app/components/MoreBelowButton.tsx')));

// The edge line (owner, 2026-11-26: "I like the border line, but I'd like it slightly softer"): thinner than the first try, partly see-through, with a faint glow,
// and still at least 3:1 against the page at the top of a breath.
ok('the line is 1.5px with a faint glow, and is part of the site', EDGE_WIDTH === 1.5 && !/ringedge|EDGE_PREVIEW|import\.meta\.env\.DEV/.test(ring + src('src/lib/ringVisibility.ts')));
for (const theme of ['dark', 'light'] as const) {
  const parts = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(EDGE_COLOUR[theme])!.slice(1).map(Number);
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const shown = '#' + parts.slice(0, 3).map((v, i) => Math.round(v * parts[3] * 0.6 + rgb(PAGE_BACKGROUND[theme])[i] * (1 - parts[3] * 0.6)).toString(16).padStart(2, '0')).join('');
  const r = (Math.max(lum(shown), lum(PAGE_BACKGROUND[theme])) + 0.05) / (Math.min(lum(shown), lum(PAGE_BACKGROUND[theme])) + 0.05);
  ok(`${theme}: the line is softer than solid but at least 3:1 on the page at the ring's peak`, parts[3] < 1 && r >= 3 && r < (theme === 'dark' ? 4 : 3.3), r.toFixed(2));
  ok(`${theme}: its glow is fainter than the line`, Number(/([\d.]+)\)$/.exec(EDGE_GLOW[theme])![1]) < parts[3] / 2);
}
ok('the ring draws the line and its glow for the page it is on, changing with the page', /border: `\$\{EDGE_WIDTH\}px solid \$\{EDGE_COLOUR\[theme\]\}`,/.test(ring) && /boxShadow: `0 0 5px \$\{EDGE_GLOW\[theme\]\}, inset 0 0 5px \$\{EDGE_GLOW\[theme\]\}`,/.test(ring));
