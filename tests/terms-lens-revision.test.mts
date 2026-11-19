// The 2026-11-18 Terms revision (docs/drafts/terms-lens-and-first-entry-draft.md, approved as written): the date, the switch-shown sentences, the archive, and that with the switches off nothing else moved.
import { readFileSync, existsSync } from 'node:fs';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const src = readFileSync('src/lib/legalDocument.ts', 'utf8');
const archive = 'docs/legal/archive/terms-and-privacy-until-2026-11-18.md';
const text = LEGAL_PARTS.flatMap((p) => p.sections).map((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => x.paragraphs)].join(' ')).join(' ');

ok('the effective date is November 19, 2026 (this revision was made on November 18; a later one moved it)', LEGAL_EFFECTIVE_DATE === 'November 19, 2026');
ok('the outgoing text is archived and the README lists both versions', existsSync(archive) && /terms-and-privacy-until-2026-11-18\.md/.test(readFileSync('docs/legal/README.md', 'utf8')) && /from 2026-11-18/.test(readFileSync('docs/legal/README.md', 'utf8')));
ok('the archive is the live text as it stood (with every switch off), under its own header', /superseded on November 18, 2026/.test(readFileSync(archive, 'utf8')) && /Effective:\*\* November 16, 2026/.test(readFileSync(archive, 'utf8')));
// With the switches off (the default here) the new sentences do not appear, so the Terms say only what is live.
ok('with the switches off, none of the new sentences appear', !/which lenses are opened/.test(text) && !/a random pair is made for your visit/.test(text) && !/If you decline, nothing about you/.test(text) && !/plain English is available/.test(text) && !/where visitors choose to start/.test(text) && /which breathing rhythm is chosen/.test(text));
// The approved wording, present in the source behind its switch.
ok('Section 13: the per-lens totals clause is the approved wording, shown with the tray; the start-choice clause is gone for good (the chooser was removed) and the rhythm clause goes with Terms-first', /\$\{TRAY \? 'which lenses are opened and which are added to a report \(a total for each lens, never in any order and never with a time\), '/.test(src) && /\$\{TERMS_FIRST \? '' : 'which breathing rhythm is chosen, '\}/.test(src));
ok('Section 15: the working pair is made at agreement, replaced by your own colors, new each visit and never stored', /When you agree to these terms, a random pair is made for your visit\. If you choose your own colors \(in the Sight gateway, or from a melody in the Sound gateway\), those become the label instead\. The pair is made new on every visit, is never stored, is not an account, and appears on any transcript you download or send\./.test(src));
ok('Section 16: saved drafts keep the added lenses and a note of the others opened, only with the tray', /\$\{TRAY \? 'the gateways you added to your report, and a note of which others you opened,' : 'your finished gateways'\}/.test(src));
ok('Section 1 points to the plain-English summary, and Section 16 says what a decline leaves, only with Terms-first', /A short summary in plain English is available from the first screen\. It is a summary only: if it ever differs from these terms, these terms are the binding text\./.test(src) && /If you decline, nothing about you is counted or kept by us, and nothing is sent\. Our web host still keeps its ordinary connection logs \(Section 13\), as it does for any visit\./.test(src) && (src.match(/TERMS_FIRST \? \[/g) ?? []).length === 2);
ok('the short version (Section 12) is unchanged: nothing new is kept between visits', /By default the only thing kept on your device between visits is one timestamp after a coach conversation/.test(text));
ok('the flags are read as Vite needs, and read as off on a server', /const TRAY = import\.meta\.env\?\.VITE_LENS_TRAY === 'on';/.test(src) && /const TERMS_FIRST = import\.meta\.env\?\.VITE_TERMS_FIRST === 'on';/.test(src));
ok('the data register lists the working pair, the per-lens totals and the sealed note of opened lenses', /Working pair/.test(readFileSync('docs/data-register.md', 'utf8')) && /lens\.opened/.test(readFileSync('docs/data-register.md', 'utf8')) && /opened but not added/.test(readFileSync('docs/data-register.md', 'utf8')));
