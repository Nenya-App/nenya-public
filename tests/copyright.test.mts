// The site's own copyright mark (owner, 2026-11-26: it needed updating): "© 2025–2026 Nenya", the first year (2025) and the latest. The name is "Nenya" or "nenya.biz", never "Nenya Project". Credits to others keep their own years.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
const footer = readFileSync('src/app/components/AppFooter.tsx', 'utf8');
ok('the footer reads "© 2025–2026 Nenya"', /<p>© 2025–2026 Nenya<\/p>/.test(footer));
ok('"Nenya Project" is not used as a name in the site', !/Nenya Project/.test(footer));
ok('the CNVC credit keeps its own year', /Nonviolent Communication © 2023/.test(readFileSync('src/app/components/about/NVCMethod.tsx', 'utf8')));
