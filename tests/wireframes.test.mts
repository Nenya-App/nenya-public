// The lens wireframes (docs/wireframes/lens) are meant to be tested: every page has its basics, Emergency Exit is the first focusable thing in each card, every form control has a name, nothing loads from outside.
import { readFileSync, readdirSync } from 'node:fs';
import { ok } from './helpers.mts';
const dir = 'docs/wireframes/lens';
const pages = readdirSync(dir).filter((f) => f.endsWith('.html'));
ok('there are wireframes for the index, the tray, Sight and Sound', ['index.html', 'tray.html', 'sight.html', 'sound.html'].every((f) => pages.includes(f)));
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
