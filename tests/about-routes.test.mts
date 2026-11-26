// The About pages have real addresses (src/lib/aboutRoutes.ts).
import { readFileSync } from 'node:fs';
import { aboutPath, aboutSectionFromLocation, aboutTitle, ABOUT_IDS, SITE_TITLE } from '../src/lib/aboutRoutes.ts';
import { ok } from './helpers.mts';

ok('the menu is /about and a page is /about/<section>', aboutPath() === '/about' && aboutPath('') === '/about' && aboutPath('privacy-promise') === '/about/privacy-promise' && aboutPath('nope') === '/about');
ok('an address gives its section, the menu gives an empty one, anything else gives null', aboutSectionFromLocation('/about/terms') === 'terms' && aboutSectionFromLocation('/about') === '' && aboutSectionFromLocation('/about/') === '' && aboutSectionFromLocation('/') === null && aboutSectionFromLocation('/coach') === null && aboutSectionFromLocation('/about-nenya.html') === null);
ok('an unknown section under /about opens the menu', aboutSectionFromLocation('/about/nonsense') === '');
ok('the older /?about=<section> form still works', aboutSectionFromLocation('/', '?about=terms') === 'terms' && aboutSectionFromLocation('/', '?about') === '' && aboutSectionFromLocation('/', '?x=1') === null);
ok('every section has its own title, and the site title is unchanged', ABOUT_IDS.every((id) => /— Nenya$/.test(aboutTitle(id))) && aboutTitle('') === 'About Nenya' && /Breathe/.test(SITE_TITLE));

// the ids here are the ids the About router and the menu know about
const router = readFileSync(new URL('../src/app/components/AboutNenya.tsx', import.meta.url), 'utf8');
const menu = readFileSync(new URL('../src/app/components/about/AboutMenu.tsx', import.meta.url), 'utf8');
ok('every route id is a section of the About router and an item of the menu', ABOUT_IDS.every((id) => router.includes(`'${id}'`) && menu.includes(`id: '${id}'`)));
ok('every item of the menu has a route', [...menu.matchAll(/id: '([a-z-]+)',\s*\n\s*title/g)].every((m) => ABOUT_IDS.includes(m[1])));

// the host serves the app for these addresses, and the sitemap lists them
const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
ok('the host rewrites every other path to the app', /from = "\/\*"\s*\n\s*to = "\/index.html"/.test(toml));
ok('the sitemap lists the About menu and each page', sitemap.includes('https://nenya.biz/about</loc>') && ABOUT_IDS.every((id) => sitemap.includes(`https://nenya.biz/about/${aboutPath(id).slice('/about/'.length)}</loc>`)));
ok('the Six Lenses page has the address /about/six-lenses, and the old /about/six-gateways still opens it', aboutPath('six-gateways') === '/about/six-lenses' && aboutSectionFromLocation('/about/six-lenses') === 'six-gateways' && aboutSectionFromLocation('/about/six-gateways') === 'six-gateways' && aboutSectionFromLocation('/?about=six-gateways'.split('?')[0], '?about=six-gateways') === 'six-gateways');

// "The Smithy": one page, with an address for each guide.
const { smithyPath, smithySlugFromPath, ABOUT_TITLES } = await import('../src/lib/aboutRoutes.ts');
const { SMITHY_GUIDES } = await import('../src/lib/smithyData.ts');
ok('the Smithy list and each guide have addresses', smithyPath() === '/about/smithy' && smithyPath('get-the-code') === '/about/smithy/get-the-code' && smithyPath('../x') === '/about/smithy' && smithyPath(null) === '/about/smithy');
ok('a guide address is read back', smithySlugFromPath('/about/smithy/get-the-code') === 'get-the-code' && smithySlugFromPath('/about/smithy') === '' && smithySlugFromPath('/about/smithy/') === '' && smithySlugFromPath('/about/terms') === null && smithySlugFromPath('/about/smithy/a/b') === null);
ok('a guide address opens the Smithy page, and no other page takes a second part', aboutSectionFromLocation('/about/smithy/get-the-code') === 'smithy' && aboutSectionFromLocation('/about/smithy') === 'smithy' && aboutSectionFromLocation('/about/terms/x') === null);
ok('the Smithy has its title', ABOUT_TITLES.smithy === 'The Smithy' && aboutTitle('smithy') === 'The Smithy — Nenya');
ok('the sitemap lists every approved guide', SMITHY_GUIDES.length >= 3 && SMITHY_GUIDES.every((g) => sitemap.includes(`https://nenya.biz/about/smithy/${g.slug}</loc>`)));
