// The icons beside the six senses on the opening page: Google's Material Symbols, self-hosted, credited, decorative.
import { existsSync, readFileSync } from 'node:fs';
import { SENSE_ICONS, SENSE_ICON_VIEWBOX } from '../src/lib/senseIcons.ts';
import { GATEWAY_SUMMARIES } from '../src/lib/gatewaySummaries.ts';
import { ok } from './helpers.mts';

const ids = GATEWAY_SUMMARIES.map((g) => g.id);
ok('every one of the six senses has an icon, and no more', ids.length === 6 && Object.keys(SENSE_ICONS).sort().join() === [...ids].sort().join());
ok('each icon\'s path equals the downloaded file in public/icons/material/ (the table and the self-hosted files never drift apart)', ids.every((id) => {
  const f = `public/icons/material/${SENSE_ICONS[id].symbol}.svg`;
  if (!existsSync(f)) return false;
  const svg = readFileSync(f, 'utf8');
  return svg.includes(`d="${SENSE_ICONS[id].path}"`) && svg.includes(`viewBox="${SENSE_ICON_VIEWBOX}"`);
}));
ok('the licence and a note of the source sit beside the files (Apache 2.0, from Google\'s repository)', /Apache License/.test(readFileSync('public/icons/material/LICENSE.txt', 'utf8')) && /material-design-icons/.test(readFileSync('public/icons/material/README.txt', 'utf8')));
ok('the icons are credited in ATTRIBUTIONS.md', /Material Symbols/.test(readFileSync('ATTRIBUTIONS.md', 'utf8')) && /Apache License 2\.0/.test(readFileSync('ATTRIBUTIONS.md', 'utf8')));
const code = readFileSync('src/lib/senseIcons.ts', 'utf8') + readFileSync('src/app/components/SenseIcon.tsx', 'utf8');
ok('nothing is fetched from another host: no URL, no request in the icon code', !/https?:\/\/|fetch\(|<img|<link|@import/.test(code.replace(/\/\/.*$/gm, '')));
ok('the icon is decorative (hidden from screen readers, not focusable) and takes the text colour', /aria-hidden="true"/.test(code) && /focusable="false"/.test(code) && /fill="currentColor"/.test(code));
const welcome = readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8');
ok('the opening page shows the icon beside each name in the senses list, inside its term, so the list stays a list of names and sentences', /<dt className="flex items-center gap-2 font-medium"><SenseIcon id=\{g\.id\} \/>\{g\.name\}<\/dt>/.test(welcome));
ok('the public files are plain svg with one path each', ids.every((id) => (readFileSync(`public/icons/material/${SENSE_ICONS[id].symbol}.svg`, 'utf8').match(/<path /g) ?? []).length === 1 && !/<script|<image|href=/.test(readFileSync(`public/icons/material/${SENSE_ICONS[id].symbol}.svg`, 'utf8'))));
