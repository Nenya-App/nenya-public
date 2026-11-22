// The shared citation pieces for the About pages: numbers link to real list entries, and nothing relies on colour or position alone.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const src = readFileSync('src/app/components/about/AboutReferences.tsx', 'utf8');
ok('each cited number is a link to its list entry, with a spoken label', /href=\{`#\$\{entryId\(pageId, k\)\}`\}/.test(src) && /aria-label=\{`Reference \$\{k\}`\}/.test(src));
ok('each list entry has the id the link points to, and the numbers keep their own values', /id=\{entryId\(pageId, r\.n\)\}/.test(src) && /value=\{r\.n\}/.test(src));
ok('external links open safely and say so for a screen reader', /rel="noopener noreferrer"/.test(src) && /opens in a new tab/.test(src));
ok('the list is a named section with a heading', /aria-labelledby=\{`\$\{pageId\}-refs-h`\}/.test(src) && /<ol /.test(src));
