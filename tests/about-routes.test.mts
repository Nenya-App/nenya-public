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
ok('the sitemap lists the About menu and each page', sitemap.includes('https://nenya.biz/about</loc>') && ABOUT_IDS.every((id) => sitemap.includes(`https://nenya.biz/about/${id}</loc>`)));
