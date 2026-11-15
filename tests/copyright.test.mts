// The site's own copyright mark follows the year (owner, 2026-11-15: it still said 2025). Credits to others keep their own years.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
const footer = readFileSync('src/app/components/AppFooter.tsx', 'utf8');
ok('the footer shows the current year, never earlier than 2026', /© \{Math\.max\(2026, new Date\(\)\.getFullYear\(\)\)\} Nenya Project/.test(footer) && !/© 2025 Nenya/.test(footer));
ok('the CNVC credit keeps its own year', /Nonviolent Communication © 2023/.test(readFileSync('src/app/components/about/NVCMethod.tsx', 'utf8')));
