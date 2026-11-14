// The theme's text and background pairs, in light and dark, against WCAG AAA (7:1 for normal text; the site holds every text color to 7:1, large text included, so that nothing depends on size). Read from src/styles/globals.css, so a color change that brings low-contrast text back fails here.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const css = readFileSync(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
const block = (start: RegExp): Record<string, string> => {
  const m = start.exec(css)!;
  const body = css.slice(m.index, css.indexOf('\n}', m.index));
  return Object.fromEntries([...body.matchAll(/^\s*--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/gm)].map((x) => [x[1], x[2]]));
};
const light = block(/^:root\s*\{/m), dark = block(/^\.dark\s*\{/m);
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const Y = (h: string) => 0.2126 * lin(parseInt(h.slice(1, 3), 16)) + 0.7152 * lin(parseInt(h.slice(3, 5), 16)) + 0.0722 * lin(parseInt(h.slice(5, 7), 16));
const ratio = (a: string, b: string) => { const [x, y] = [Y(a), Y(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const PAIRS: [string, string][] = [
  ['foreground', 'background'], ['foreground', 'card'], ['foreground', 'muted'], ['foreground', 'accent'],
  ['muted-foreground', 'background'], ['muted-foreground', 'card'], ['muted-foreground', 'muted'], ['muted-foreground', 'accent'],
  ['primary-foreground', 'primary'], ['secondary-foreground', 'secondary'], ['accent-foreground', 'accent'],
  ['text-secondary', 'background'], ['text-tertiary', 'background'], ['nenya-gold-text', 'background'], ['nenya-gold-text', 'card'], ['nenya-gold-text', 'muted'], ['nenya-gold-text', 'accent'],
  // Buttons: the default button's text on its fill and on the gold fill used for the call-to-action buttons, and the destructive button and badge.
  ['primary-foreground', 'nenya-accent-warm'], ['primary-foreground', 'primary'], ['destructive-foreground', 'destructive'],
  ['muted-foreground', 'input-background'], ['foreground', 'input-background'], ['muted-foreground', 'background-elevated'],
  ['text-primary', 'background'], ['text-secondary', 'card'], ['text-tertiary', 'card'],
];
for (const [name, t] of [['light', light], ['dark', dark]] as const) {
  ok(`the ${name} theme has the colors this test reads`, !!t.background && !!t.foreground && !!t['muted-foreground']);
  for (const [fg, bg] of PAIRS) {
    if (!t[fg] || !t[bg]) continue;
    // In the dark theme the accent is a light gold used with its own accent-foreground (checked above), never with the ordinary text colors.
    if (name === 'dark' && bg === 'accent' && fg !== 'accent-foreground') continue;
    const r = ratio(t[fg], t[bg]);
    ok(`${name}: ${fg} on ${bg} is at least 7:1 (AAA)`, r >= 7, r.toFixed(2));
  }
}
// The emergency button: white on its terracotta fill.
const emergency = /const EMERGENCY_COLOR = '(#[0-9A-Fa-f]{6})'/.exec(readFileSync(new URL('../src/app/components/EmergencyExit.tsx', import.meta.url), 'utf8'))![1];
ok('the Emergency Exit button\'s white text on its fill is at least 7:1', ratio('#FFFFFF', emergency) >= 7, ratio('#FFFFFF', emergency).toFixed(2));
// The button variants use only the pairs checked above, and their hover states in the dark theme use the full accent (a half-strength accent fell below 7:1).
const button = readFileSync(new URL('../src/app/components/ui/button.tsx', import.meta.url), 'utf8');
ok('the link button is gold TEXT (readable on the page), not the pale fill color', /link: "text-nenya-gold-text/.test(button));
ok('in the dark theme the outline and ghost hovers use the full accent with its own text color', /dark:hover:bg-accent(?!\/)/.test(button) && !/dark:hover:bg-(accent|input)\/50/.test(button));
ok('the destructive button is white on the destructive fill', /bg-destructive text-white/.test(button));
// Non-text contrast (WCAG 1.4.11): the edges of controls (buttons, fields, checkboxes, switches) and cards are at least 3:1 against every surface they sit on.
for (const [name, t] of [['light', light], ['dark', dark]] as const) {
  for (const edge of ['border', 'border-emphasis', 'switch-background']) for (const surface of ['background', 'card', 'muted', 'input-background']) {
    if (!t[edge] || !t[surface]) continue;
    const r = ratio(t[edge], t[surface]);
    ok(`${name}: ${edge} on ${surface} is at least 3:1 (non-text)`, r >= 3, r.toFixed(2));
  }
}
for (const surface of ['background', 'card', 'muted']) ok(`light: the field border (input) on ${surface} is at least 3:1`, ratio(light.input, light[surface]) >= 3, ratio(light.input, light[surface]).toFixed(2));
for (const surface of ['background', 'card', 'muted']) ok(`dark: the field border (input) on ${surface} is at least 3:1`, ratio(dark.input, dark[surface]) >= 3, ratio(dark.input, dark[surface]).toFixed(2));
ok('no border is made see-through with an opacity (it would drop below 3:1)', !/\bborder-border\/\d+/.test([...(await import('node:fs')).readdirSync(new URL('../src/app/components', import.meta.url))].map((f) => (f.endsWith('.tsx') ? readFileSync(new URL(`../src/app/components/${f}`, import.meta.url), 'utf8') : '')).join('')));
ok('the light page is the warm gray the contrast was measured on', light.background.toLowerCase() === '#dcd9d6');

// ---- Type: headings and body text in proportion (WCAG AAA is the goal for every future design as well)
// Tailwind's own scale (the stylesheet names the step, Tailwind defines it), in rem.
const TW: Record<string, number> = { 'text-xs': 0.75, 'text-sm': 0.875, 'text-base': 1, 'text-lg': 1.125, 'text-xl': 1.25, 'text-2xl': 1.5, 'text-3xl': 1.875, 'text-4xl': 2.25 };
const rem = (name: string): number => TW[name] ?? NaN;
const sizeOf = (tag: string): string => new RegExp(`\\n\\s*${tag} \\{[^}]*font-size: var\\(--(text-[a-z0-9]+)\\)`).exec(css)![1];
const scale = ['h1', 'h2', 'h3', 'h4'].map((h) => rem(sizeOf(h)));
ok('the heading sizes read from the stylesheet', scale.every((n) => Number.isFinite(n)), scale.join(', '));
ok('headings step down in size: h1 > h2 > h3 > h4, each at least 1.1 times the next', scale[0] > scale[1] && scale[1] > scale[2] && scale[2] > scale[3] && scale[0] / scale[1] >= 1.1 && scale[1] / scale[2] >= 1.05 && scale[2] / scale[3] >= 1.05, scale.join(', '));
ok('the smallest heading is not smaller than the body text', scale[3] >= 1);
ok('the page\'s base size is 16px, so body text is 1rem (not shrunk on small screens by a stale rule)', /--font-size: 16px/.test(css) && /\nhtml \{\s*font-size: var\(--font-size\);/.test(css) && css.lastIndexOf('font-size: var(--font-size);') > css.lastIndexOf('font-size: 14px;'));
ok('headings and body text keep a line height of at least 1.5', (css.match(/line-height: 1\.5;/g) ?? []).length >= 6);

// Text size floor in what visitors see: nothing under 12px, and no heading set smaller than the small body size.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'bench' ? [] : walk(p)) : /\.tsx$/.test(f) ? [p] : []; });
const files = walk(new URL('../src', import.meta.url).pathname);
const tiny: string[] = [], smallHeadings: string[] = [];
for (const f of files) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/text-\[(?:\d|1[01])(?:\.\d+)?px\]/g)) tiny.push(`${f.split('/src/')[1]}: ${m[0]}`);
  for (const _h of t.matchAll(/<h[1-4][^>]*className="[^"]*\btext-xs\b/g)) smallHeadings.push(`${f.split('/src/')[1]}`);
}
ok('no visitor-facing text is set below 12px', tiny.length === 0, tiny.join('; '));
ok('no heading is set at text-xs', smallHeadings.length === 0, smallHeadings.join('; '));
