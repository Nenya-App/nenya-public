// Where Emergency Exit goes, and what the exit dialog says (owner's decisions, 2026-11-24; docs/safety-features-card.md):
// an ordinary page that does not mention Nenya, one constant to change, no promise of a feature that does not exist.
import { readFileSync, existsSync } from 'node:fs';
import { EXIT_URL, EXIT_PAGE_NAME } from '../src/lib/emergencyExit.ts';
import { LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const read = (f: string) => readFileSync(f, 'utf8');
const modal = read('src/app/components/EmergencyExit.tsx');
const lib = read('src/lib/emergencyExit.ts');
const guard = read('public/exit-guard.js');

ok('the exit goes to the Google home page', EXIT_URL === 'https://www.google.com/');
ok('neither the address nor the name of the page mentions Nenya, Wikipedia or the Rings', !/nenya|wikipedia|rings/i.test(EXIT_URL) && !/nenya|wikipedia|rings/i.test(EXIT_PAGE_NAME));
ok('the address is one constant, with a comment that it is one line to change and the owner may pick another', (lib.match(/export const EXIT_URL = /g) ?? []).length === 1 && /ONE LINE/.test(lib) && /owner may pick another/.test(lib));
ok('the plain guard script (it cannot import the constant) uses the same address, and no other address', guard.includes(EXIT_URL) && !/wikipedia|Rings_of_Power/i.test(guard) && (guard.match(/https?:\/\/[^'"]+/g) ?? []).every((u) => u === EXIT_URL));
ok('the page name says where it goes in words that match the address', /Google/.test(EXIT_PAGE_NAME) && /google\.com/.test(EXIT_PAGE_NAME));
ok('the dialog and the button name the page from the one constant and say its address does not mention Nenya', /\{EXIT_PAGE_NAME\}\. The address of that page does not mention Nenya/.test(modal) && /Instant redirect to \$\{EXIT_PAGE_NAME\}/.test(modal));
ok('no word of Wikipedia or the Rings of Power is left in the dialog', !/wikipedia|rings of power/i.test(modal));
ok('the "Interface Disguise Feature" paragraph is gone from the dialog, with the decoy and disguised-app promises', !/disguise|decoy|simulate a browser|pre-authorization/i.test(modal));
ok('the dialog still has the crisis lines, the exit button and Cancel', /Crisis Support Resources/.test(modal) && /EMERGENCY EXIT NOW/.test(modal) && /Cancel \/ Return to Reflection/.test(modal));

const s18 = LEGAL_PARTS.flatMap((p) => p.sections).find((s) => s.number === 18);
const s18text = JSON.stringify(s18);
ok('Section 18 of the Terms names the Google home page and not Wikipedia', !!s18 && /Google home page \(www\.google\.com\)/.test(s18text) && !/Wikipedia/.test(s18text));
ok('the outgoing Terms are archived under the -b name, with the old wording, and listed in the legal README', existsSync('docs/legal/archive/terms-and-privacy-until-2026-11-24-b.md') && /takes you to a page on Wikipedia/.test(read('docs/legal/archive/terms-and-privacy-until-2026-11-24-b.md')) && read('docs/legal/README.md').includes('terms-and-privacy-until-2026-11-24-b.md'));
// No page of the site says the exit goes to Wikipedia (the Terms archive keeps the old words; reference links to Wikipedia for other things are not about the exit).
const pages = ['src/lib/aboutNenya.ts', 'src/app/components/about/PrivacyPromise.tsx', 'src/lib/plainEnglish.ts', 'README.md', 'docs/device-memory.md', 'public/llms.txt', 'public/mind-facts.txt', 'public/about-nenya.html', 'public/why-nenya.html'];
ok('no answer, page or doc says Emergency Exit goes to Wikipedia', pages.every((f) => !/exit[^.\n]{0,120}wikipedia|wikipedia[^.\n]{0,120}exit/i.test(read(f))));
