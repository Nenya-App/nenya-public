// The About page is grouped into sections, every entry of the old menu sits in exactly one, and the pieces around it (quick navigation, Share in the header) are in place.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');

const menu = src('src/app/components/about/AboutMenu.tsx');
const entries = [...menu.matchAll(/^\s{6}id: '([a-z-]+)',$/gm)].map((m) => m[1]);
const block = menu.slice(menu.indexOf('ABOUT_SECTIONS'), menu.indexOf('export default function AboutMenu'));
const grouped = [...block.matchAll(/ids: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'([a-z-]+)'/g)].map((x) => x[1]));
ok('the About page has several sections', (block.match(/key: '/g) ?? []).length >= 4);
ok('every entry of the About menu is in exactly one section', entries.length >= 20 && entries.every((id) => grouped.filter((g) => g === id).length === 1) && grouped.every((g) => entries.includes(g)), `${entries.length} entries, ${grouped.length} placed`);
ok('each section is a labelled region with a heading, and the page has a way to jump between them', /<section[^>]*aria-labelledby/.test(menu) && /aria-label="Sections of this page"/.test(menu));

const quick = src('src/app/components/QuickNav.tsx');
ok('the quick navigation offers Breathe (home), Reflect (the gateways) and Coach (/coach)', /Breathe/.test(quick) && /Home/.test(quick) && /Reflect/.test(quick) && /The six gateways/.test(quick) && /coachHref = '\/coach\/'/.test(quick));
ok('it sits in the bottom right corner and replaces the welcome message', /fixed bottom-.*right-4/.test(quick) && /<QuickNav /.test(src('src/app/components/pages/WelcomePage.tsx')) && !/WelcomePopup/.test(src('src/app/components/pages/WelcomePage.tsx')));
const nav = src('src/app/components/GlobalNavigation.tsx');
ok('Share is in the header on wide screens and in the menu on phones (with Add to Home Screen)', /<ShareNenya variant="header" \/>/.test(nav) && /<ShareNenya variant="menu" \/>/.test(nav) && /<AddToHomeScreen variant="menu" \/>/.test(nav) && !/<ShareNenya variant="icon" \/>/.test(nav));
ok('Share still shares only the site, never anything entered', /const SITE_URL = 'https:\/\/nenya\.biz'/.test(src('src/app/components/ShareNenya.tsx')) && !/localStorage|sessionStorage|messages/.test(src('src/app/components/ShareNenya.tsx')));
