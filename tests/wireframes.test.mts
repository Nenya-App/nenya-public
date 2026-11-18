// The lens wireframes (docs/wireframes/lens) are meant to be tested: every page has its basics, Emergency Exit is the first focusable thing in each card, every form control has a name, nothing loads from outside.
import { readFileSync, readdirSync } from 'node:fs';
import { ok } from './helpers.mts';
const dir = 'docs/wireframes/lens';
const pages = readdirSync(dir).filter((f) => f.endsWith('.html'));
ok('there are wireframes for the index, the tray, Sight, Sound and Touch', ['index.html', 'tray.html', 'sight.html', 'sound.html', 'touch.html'].every((f) => pages.includes(f)));
for (const f of pages) {
  const h = readFileSync(`${dir}/${f}`, 'utf8');
  ok(`${f}: language, title, viewport, a skip link and one main`, /<html lang="en">/.test(h) && /<title>[^<]+<\/title>/.test(h) && /name="viewport"/.test(h) && /class="skip"/.test(h) && (h.match(/<main\b/g) ?? []).length === 1);
  ok(`${f}: nothing loads from outside and no script is inline (only wire.js)`, !/(?:src|href)="https?:/.test(h) && !/<script(?![^>]*src=)[^>]*>/.test(h));
  ok(`${f}: the word "gateway" does not appear`, !/gateway/i.test(h));
  const controls = [...h.matchAll(/<(input|select)\b([^>]*)>/g)].filter((m) => !/type="(hidden)"/.test(m[2]));
  const unnamed = controls.filter((m) => { const id = /id="([^"]+)"/.exec(m[2])?.[1]; const wrapped = false; return !(id && new RegExp(`<label for="${id}"`).test(h)) && !/aria-label=/.test(m[2]) && !isInsideLabel(h, m.index!) && !wrapped; });
  ok(`${f}: every input and select has a name (a label, or an aria-label)`, unnamed.length === 0, unnamed.map((m) => m[0]).join(' | '));
  const ids = [...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  ok(`${f}: ids are unique`, new Set(ids).size === ids.length);
  if (f !== 'index.html') {
    const cards = h.split('<div class="frame">').slice(1);
    ok(`${f}: Emergency Exit is the first button in every frame`, cards.length >= 4 && cards.every((c) => /^\s*<div class="bar"><button type="button">Emergency Exit<\/button>/.test(c)));
    if (f !== 'tray.html') ok(`${f}: the last card has Add, Update and Remove`, /Add this to my report/.test(h) && /Update my report/.test(h) && /Remove from my report/.test(h));
    else ok(`${f}: the tray names every state in words, keeps the coach apart, and the report lists examined lenses separately`, /Not opened/.test(h) && /Looked at, not in your report/.test(h) && /In your report/.test(h) && /a lens of its own/.test(h) && /Examined, not included/.test(h));
  }
}
function isInsideLabel(html: string, at: number): boolean {
  const open = html.lastIndexOf('<label', at);
  return open >= 0 && open > html.lastIndexOf('</label>', at);
}
const css = readFileSync(`${dir}/wire.css`, 'utf8');
ok('the stylesheet respects reduced motion and has a visible focus style', /prefers-reduced-motion: reduce/.test(css) && /:focus-visible/.test(css));

// Buttons are accessible but subtle: text 7:1 or better, the edge of a control 3:1 or better against the page, and no pure white or pure black fills (owner, 2026-11-17).
{
  const lum = (h: string) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const blocks = [css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: dark)')), css.slice(css.indexOf('@media (prefers-color-scheme: dark)'), css.indexOf('* { box-sizing'))];
  blocks.forEach((b, i) => {
    const v = (n: string) => new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{6})`).exec(b)?.[1] ?? '#000000';
    const name = i ? 'dark' : 'light';
    ok(`${name}: page text is 7:1 or better`, ratio(v('ink'), v('paper')) >= 7);
    ok(`${name}: a button's text on its fill is 7:1 or better`, ratio(v('btn-ink'), v('btn-bg')) >= 7, String(ratio(v('btn-ink'), v('btn-bg'))));
    ok(`${name}: a selected control's text on its fill is 7:1 or better`, ratio(v('sel-ink'), v('sel-bg')) >= 7);
    ok(`${name}: the edge of a control and the filled button stand out from the page (3:1 or better)`, ratio(v('edge'), v('paper')) >= 3 && ratio(v('btn-bg'), v('paper')) >= 3);
    ok(`${name}: no button fill is pure white or pure black`, !['#ffffff', '#000000'].includes(v('btn-bg').toLowerCase()) && !['#ffffff', '#000000'].includes(v('sel-bg').toLowerCase()));
  });
}
