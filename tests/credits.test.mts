// Credits the licenses and permissions ask for: the DarkBench credit is tested in persona-darkbench.test.mts; this covers CNVC's
// Feelings and Needs Inventory, whose last page asks to be credited as "The Center for Nonviolent Communication © 2023,
// www.CNVC.org, cnvc@cnvc.org", and which Nenya's feelings-and-needs categories were informed by.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string) => readFileSync(join(root, f), 'utf8').replace(/\s+/g, ' ');
const LINK = 'https://www.cnvc.org/store/feelings-and-needs-inventory';
const attrib = read('ATTRIBUTIONS.md');
const page = read('src/app/components/about/NVCMethod.tsx');

ok('ATTRIBUTIONS.md has a CNVC section with the credit line CNVC asks for, and the link to the specific document', attrib.includes('The Center for Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org') && attrib.includes(LINK) && attrib.includes('Feelings and Needs Inventory'));
ok('it says what the inventory informed, that the categories are being extended and translated, and that Nenya is not affiliated', /informed by/.test(attrib) && /extending and refining/.test(attrib) && /other languages/.test(attrib) && /not affiliated with or endorsed by CNVC/.test(attrib));
ok('it quotes CNVC\'s permission as given and does not claim more than it says (sharing and copying; adaptation to be confirmed)', /free to share or copy this document/.test(attrib) && /our categories are an adaptation/.test(attrib));
ok('the About NVC page credits CNVC for the structure of the categories, with the exact credit line and a link to the specific document', page.includes('id="cnvc-credit"') && page.includes(LINK) && /informed by/.test(page) && page.includes('The Center for Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org') && /rel="noopener noreferrer"/.test(page.slice(page.indexOf('id="cnvc-credit"'), page.indexOf('id="cnvc-credit"') + 900)));
ok('the credit sits beside the affiliation statement, so it cannot be read as an endorsement', page.indexOf('Affiliation Status') > 0 && page.indexOf('Affiliation Status') < page.indexOf('id="cnvc-credit"') && page.indexOf('id="cnvc-credit"') - page.indexOf('Affiliation Status') < 2500);
ok('the README sends readers to the credits', /ATTRIBUTIONS\.md/.test(read('README.md')));
