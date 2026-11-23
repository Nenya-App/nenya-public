// The standing non-affiliation line (owner, 2026-11-22): one text, shown in the footer, on the Name page, and on the static pages and README.
import { readFileSync } from 'node:fs';
import { NON_AFFILIATION } from '../src/lib/tolkienNotice.ts';
import { ok } from './helpers.mts';

ok('the line says independent, inspired by the books, not affiliated or endorsed, and names the Estate and Middle-earth Enterprises', /independent, free project inspired by J\. R\. R\. Tolkien’s books/.test(NON_AFFILIATION) && /not affiliated with or endorsed by the Tolkien Estate, Middle-earth Enterprises, or any Tolkien licensee/.test(NON_AFFILIATION));
ok('it makes no claim of an official, licensed or authorised connection', !/\b(official|licensed by|authori[sz]ed|endorsed and)\b/i.test(NON_AFFILIATION));
ok('the app footer shows it on every page', /import \{ NON_AFFILIATION \}/.test(readFileSync('src/app/components/AppFooter.tsx', 'utf8')) && /\{NON_AFFILIATION\}/.test(readFileSync('src/app/components/AppFooter.tsx', 'utf8')));
ok('the Name page shows it beside the ring names', /\{NON_AFFILIATION\}/.test(readFileSync('src/app/components/about/NamePhilosophy.tsx', 'utf8')));
const plain = "independent, free project inspired by J. R. R. Tolkien";
ok('the static about page, llms.txt and the README carry it', ['public/about-nenya.html', 'public/llms.txt', 'README.md'].every((f) => readFileSync(f, 'utf8').replace(/&rsquo;/g, "'").includes(plain.replace('Tolkien', 'Tolkien')) && /not affiliated with or endorsed by the Tolkien Estate, Middle-earth Enterprises, or any Tolkien licensee/.test(readFileSync(f, 'utf8'))));
