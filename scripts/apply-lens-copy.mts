// Runs after `vite build`. With VITE_LENS_COPY=on, puts the lens vocabulary (src/lib/vocabulary.ts) into the static public files that the page code does not
// render (the About text for crawlers, the plain-text site summary, the Why page), so a model or a search engine reading the site never sees two names.
// With the switch off, it does nothing. The sitemap and route paths keep their addresses (a renamed address needs its own redirect plan).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { L } from '../src/lib/vocabulary.ts';

if (process.env.VITE_LENS_COPY !== 'on') { console.log('apply-lens-copy: off, nothing changed'); process.exit(0); }
const FILES = ['about-nenya.html', 'why-nenya.html', 'llms.txt'];
for (const f of FILES) {
  const p = `dist/${f}`;
  if (!existsSync(p)) { console.log(`apply-lens-copy: ${p} not found, skipped`); continue; }
  const before = readFileSync(p, 'utf8'), after = L(before, true);
  writeFileSync(p, after);
  console.log(`apply-lens-copy: ${f}, ${before === after ? 'no change' : 'changed'}`);
}
