// The theme's text and background pairs, in light and dark, against WCAG AA (4.5:1 for normal text). Read from src/styles/globals.css, so a color change that brings low-contrast text back fails here.
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
  ['text-secondary', 'background'], ['text-tertiary', 'background'], ['nenya-gold-text', 'background'], ['nenya-gold-text', 'card'],
];
for (const [name, t] of [['light', light], ['dark', dark]] as const) {
  ok(`the ${name} theme has the colors this test reads`, !!t.background && !!t.foreground && !!t['muted-foreground']);
  for (const [fg, bg] of PAIRS) {
    if (!t[fg] || !t[bg]) continue;
    // In the dark theme the accent is a light gold used with its own accent-foreground (checked above), never with the ordinary text colors.
    if (name === 'dark' && bg === 'accent' && fg !== 'accent-foreground') continue;
    const r = ratio(t[fg], t[bg]);
    ok(`${name}: ${fg} on ${bg} is at least 4.5:1`, r >= 4.5, r.toFixed(2));
  }
}
ok('the light page is the warm gray the contrast was measured on', light.background.toLowerCase() === '#dcd9d6');
