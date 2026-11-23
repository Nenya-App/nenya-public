// Wording the owner decided against (sweep of 2026-11-23): the fixed phrases stay out of the files that were changed.
// "Lens" and "Pattern" (not gateway and Insight) in the README; "501(c)(3) nonprofit" (not "public charity"); "approach" (not "method") for our own design;
// no "calming" in the front-page FAQ; no "profound" in the Essence lens description.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const read = (f: string): string => readFileSync(f, 'utf8');
const readme = read('README.md');
ok('README: no "gateway" or "Insight" lens words (lens and Pattern instead)', !/gateway/i.test(readme.replace(/`[^`]*`/g, '')) && !/\bInsight\b/.test(readme));
ok('README: the sixth lens is named Pattern', /Movement, Pattern\)/.test(readme) && /\*Pattern\*/.test(readme));
ok('SupportThisWork: "501(c)(3) nonprofit", never "public charity"', /501\(c\)\(3\) nonprofit/.test(read('src/app/components/SupportThisWork.tsx')) && !/public\s+charity/i.test(read('src/app/components/SupportThisWork.tsx')));
ok('Theory U page: "not a tested approach", not "method"', /not a tested approach/.test(read('src/app/components/about/TheoryU.tsx')) && !/tested method/.test(read('src/app/components/about/TheoryU.tsx')));
const about = read('public/about-nenya.html');
ok('about-nenya.html: "not a tested approach" and no "tested method"', /not a tested approach/.test(about) && !/tested method/.test(about));
ok('about-nenya.html: the breathing FAQ says "paced", not "calming"', /paced breathing exercise/.test(about) && !/calming/i.test(about));
ok('Essence lens description: no "profound"', !/profound/i.test(read('src/app/components/pages/EssenceGatewayPage.tsx').replace(/rightLabel="Profound"/g, '')));
