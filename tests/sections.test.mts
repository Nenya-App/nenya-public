// One address per part of the site (owner, 2026-11-15): /breath, /senses, /coach; "/" shows the front page and becomes /breath; the whole
// reflection stays at /senses; the coach after a reflection shows /coach. Behind VITE_SECTION_ADDRESSES (or the lens tray).
import { readFileSync } from 'node:fs';
import { SECTION_PATHS, sectionOfPath, sectionOfScreen } from '../src/lib/sections.ts';
import { ok } from './helpers.mts';

ok('the three addresses', SECTION_PATHS.breath === '/breath' && SECTION_PATHS.senses === '/senses' && SECTION_PATHS.coach === '/coach');
ok('"/" and /breath are the front page; trailing slashes do not matter', sectionOfPath('/') === 'breath' && sectionOfPath('/breath') === 'breath' && sectionOfPath('/breath/') === 'breath' && sectionOfPath('/senses/') === 'senses' && sectionOfPath('/coach/') === 'coach');
ok('other addresses are not a section (About keeps its own)', sectionOfPath('/about/terms') === null && sectionOfPath('/verify') === null && sectionOfPath('/senses/touch') === null);
ok('the whole reflection is /senses: the choice, every gateway, the colors and the review', ['home', 'sight', 'sound', 'touch', 'essence', 'movement', 'insight', 'color-selection', 'gateway-review'].every((x) => sectionOfScreen(x) === 'senses'));
ok('the front page is /breath, the coach after a reflection /coach, and About and partner practice keep their own', sectionOfScreen('welcome') === 'breath' && sectionOfScreen('session') === 'coach' && sectionOfScreen('about') === null && sectionOfScreen('cell-creation') === null);

const app = readFileSync('src/app/App.tsx', 'utf8');
ok('arriving at /senses opens the gateway choice and asks only the Terms (no chooser, no rhythm)', /arrivedAtSenses \? 'home' : 'welcome'/.test(app) && /useState\(initialAbout !== null \|\| arrivedAtSenses \|\| arrivedAtGuestbook \|\| arrivedAtPhrases\)/.test(app));
ok('a new history entry only when the part of the site changes; "/" becomes /breath without adding a step', /if \(firstAddress\.current \|\| sameSection \|\| leavingAbout\) window\.history\.replaceState\(null, '', target\);\s*else window\.history\.pushState\(null, '', target\);/.test(app));
ok('the canonical and share addresses follow the part of the site', /link\[rel="canonical"\][\s\S]{0,80}https:\/\/nenya\.biz\$\{target\}/.test(app) && /og:url[\s\S]{0,80}https:\/\/nenya\.biz\$\{target\}/.test(app));
ok('Back and Forward move between the parts; after a reflection, /senses returns to the review and /coach to the coach', /sec === 'senses' \? \(done \? 'gateway-review' : 'home'\) : done \? 'session' : 'home'/.test(app));
ok('without the switch, addresses behave as before', /else if \(leavingAbout\) \{\s*window\.history\.replaceState\(null, '', '\/'\);/.test(app) && /sectionsOn\(\) \? sectionOfScreen\(currentScreen\) : null/.test(app));
ok('the coach\'s links go to /senses and /breath with the switch on', /sectionsOn\(\) \? '\/senses' : '\/'/.test(readFileSync('src/coach/BreathFirst.tsx', 'utf8')) && /sectionsOn\(\) \? '\/breath' : '\/'/.test(readFileSync('src/coach/CoachDemo.tsx', 'utf8')));
