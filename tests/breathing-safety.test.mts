// The breathing safety words (owner, 2026-11-18): in the Terms, at the place a person sets a pace, in the settings panel, in the plain-English summary, and on the Breathing Tool page with sources that say what they do and do not show.
import { readFileSync } from 'node:fs';
import { LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { PLAIN_ENGLISH } from '../src/lib/plainEnglish.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const s3 = LEGAL_PARTS.flatMap((p) => p.sections).find((s) => s.number === 3)!;
const para = s3.paragraphs.find((p) => p.startsWith('Breathing safely.'))!;
ok('Section 3 of the Terms has the breathing-safety paragraph', !!para && /not a medical treatment/.test(para));
ok('it says: stop and return to normal breathing if dizzy or lightheaded', /Stop and return to normal breathing if you feel dizzy or lightheaded/.test(para));
ok('it says: shorten the count (four or five seconds each) and build up gradually, and names the six-second default', /shorter count, for example four or five seconds each, and build up gradually/.test(para) && /six seconds in and six out/.test(para));
ok('it says: check with a healthcare professional first for asthma, COPD, a heart or lung condition or specific symptoms', /If you have asthma, COPD, a heart or lung condition, or are managing specific symptoms, check with a healthcare professional before practicing slow or paced breathing exercises/.test(para));
ok('it points to the sources and does not give medical advice beyond that', /sources for this advice[^.]*Breathing Tool page/.test(para) && !/diagnos|treat(s|ed)? your|cure/i.test(para.replace('not a medical treatment', '')));
const comp = readFileSync('src/app/components/CustomBreath.tsx', 'utf8'), pop = readFileSync('src/app/components/BreathingPopout.tsx', 'utf8'), page = readFileSync('src/app/components/about/BreathingTool.tsx', 'utf8');
ok('the safety words sit where a pace is set and in the breathing settings', /Stop and return to normal breathing if you feel dizzy or lightheaded/.test(comp) && /asthma, COPD, a heart or lung condition/.test(comp) && /Stop and return to normal breathing if you feel dizzy or lightheaded/.test(pop));
ok('the plain-English page carries it, at an easy reading level', PLAIN_ENGLISH.some((i) => i.heading === 'Breathing safely' && /dizzy or lightheaded/.test(i.text) && /heart or lung condition/.test(i.text) && gradeLevel(i.text) <= 9));
ok('the Breathing Tool page has Safety and sources with the three links, each opening in a new tab, and says what the sources do not show', /Safety and sources/.test(page) && /PMC5721258/.test(page) && /9443-pursed-lip-breathing/.test(page) && /30245619/.test(page) && (page.match(/rel="noopener noreferrer"/g) ?? []).length >= 3 && /related technique, not this one/.test(page) && /mostly healthy people/.test(page) && /did not find a source on paced breathing in heart conditions/.test(page) && /not medical advice/.test(page));
ok('the outgoing Terms text is archived and listed', /Using Nenya well/.test(readFileSync('docs/legal/archive/terms-and-privacy-until-2026-11-18-c.md', 'utf8')) && /terms-and-privacy-until-2026-11-18-c\.md/.test(readFileSync('docs/legal/README.md', 'utf8')));
