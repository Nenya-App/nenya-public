// "The Smithy" page (docs/smithy-guides-scope.md): where it sits in About, its addresses, and how it draws a guide.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const menu = read('src/app/components/about/AboutMenu.tsx');
const router = read('src/app/components/AboutNenya.tsx');
const page = read('src/app/components/about/Smithy.tsx');
const blocks = read('src/app/components/SmithyBlocks.tsx');

ok('About has a section "The Smithy" holding only the Smithy', /\{ key: 'smithy', title: 'The Smithy', blurb: 'Make your own, on your own device\.', ids: \['smithy'\] \}/.test(menu));
ok('the menu item says what it is', /id: 'smithy',\s*\n\s*title: 'The Smithy',\s*\n\s*description: 'Make your own, on your own device',\s*\n\s*icon: Hammer,/.test(menu));
ok('the router draws it', /currentSection === 'smithy' && \(\s*<Smithy onBack=\{handleBackToMenu\} \/>/.test(router));
ok('the router leaves a guide address in place', /smithySlugFromPath\(window\.location\.pathname\)/.test(router));
ok('the page scrolls like every About page', /className="size-full overflow-y-auto scroll-container/.test(page));
ok('the page follows the address, with back and forward', /smithySlugFromPath/.test(page) && /popstate/.test(page) && /smithyPath\(/.test(page) && /pushState/.test(page));
ok('the page sets a title for each guide', /document\.title = /.test(page) && /— Nenya/.test(page));
ok('the page offers the previous and next guide', /Previous/.test(page) && /Next/.test(page));
ok('guide text is never inserted as HTML', !/dangerouslySetInnerHTML/.test(blocks) && !/dangerouslySetInnerHTML/.test(page));
ok('each code block has a Copy button and says when it has copied', /aria-label=\{`Copy /.test(blocks) && /aria-live="polite"/.test(blocks) && /clipboard\.writeText\(/.test(blocks));
ok('code can be scrolled with a keyboard', /<pre[^>]*tabIndex=\{0\}/.test(blocks));
ok('tap targets are at least 44 px', /min-h-11/.test(blocks) && /min-h-11/.test(page));
ok('outside links open safely', /rel="noopener noreferrer"/.test(blocks) && /target="_blank"/.test(blocks));
ok('tables have header cells', /<th scope="col"/.test(blocks));
ok('long Previous and Next titles wrap on a phone', (page.match(/max-w-full shrink/g) ?? []).length === 2);
ok('with all seven guides in, the page no longer says more are coming', !/More guides are being written/.test(page));
ok('opening another guide moves focus to its heading, but not on first load', (page.match(/<h1 ref=\{heading\} tabIndex=\{-1\}/g) ?? []).length === 2 && /if \(shown\.current !== slug\)/.test(page) && /heading\.current\?\.focus\(/.test(page));
ok('the Copy button says whether it copies a command or code', /Copy the \$\{kind\}: /.test(blocks) && /\['bash', 'sh'\]\.includes\(lang\) \? 'command' : 'code'/.test(blocks));
ok('copying a second time is announced again', /setSaid\(''\);\s*\n\s*try \{/.test(blocks));
ok('an unknown guide address is replaced by the list address', /replaceState\(null, '', smithyPath\(\)\)/.test(page));
