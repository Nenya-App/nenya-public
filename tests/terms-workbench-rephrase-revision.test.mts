// The 2026-11-20 Terms revision, second and third parts: the phrase workbench (VITE_PHRASE_WORKBENCH) and rephrasing in a partner cell (VITE_REPHRASE). With both off nothing moved.
import { readFileSync } from 'node:fs';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const src = readFileSync('src/lib/legalDocument.ts', 'utf8');
const sections = LEGAL_PARTS.flatMap((p) => p.sections);
const text = sections.map((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => x.paragraphs)].join(' ')).join(' ');
const register = readFileSync('docs/data-register.md', 'utf8');
const archive = readFileSync('docs/legal/archive/terms-and-privacy-until-2026-11-20.md', 'utf8');

ok('with every switch off, the date is November 19, 2026 and none of the new sentences appear', LEGAL_EFFECTIVE_DATE === 'November 19, 2026' && !/phrase workbench/i.test(text) && !/rephrasing/i.test(text) && !/partner cell/i.test(text));
ok('the switches are read as Vite needs, and read as off on a server', /const PHRASE_WORKBENCH = import\.meta\.env\?\.VITE_PHRASE_WORKBENCH === 'on';/.test(src) && /const REPHRASE = import\.meta\.env\?\.VITE_REPHRASE === 'on';/.test(src));
ok('the date moves to November 20 if ANY of the three switches is on', /SCREEN_MODEL \|\| PHRASE_WORKBENCH \|\| REPHRASE \? 'November 20, 2026' : 'November 19, 2026'/.test(src));
ok('the archive covers all three parts and keeps the old text', /phrase workbench/.test(archive) && /rephrasing in a partner cell/.test(archive) && !/phrase workbench keeps nothing/.test(archive) && /simple phrase matching/.test(archive));

// Workbench: Sections 12, 16 and 17
ok('Section 12 says the workbench keeps nothing unless asked and sends nothing, and the kept-sentence exception', /The phrase workbench keeps nothing unless you ask it to, and sends nothing\./.test(src) && /The phrase workbench keeps a sentence only if you turn that on inside it \(Section 16\)\./.test(src));
ok('Section 16 describes the one optional record: sentence, marks and slider steps, no date, count or history, and how it is removed', /Only if you turn on “Remember this sentence and my marks on this device” inside the phrase workbench: your latest sentence, the marks you put on it and your slider steps, with no date, count or history\./.test(src) && /Forget button, “Forget me” and Emergency Exit remove it/.test(src));
ok('Section 17 says nothing typed there is sent, scored, graded or kept as a history', /It does not send what you type into the phrase workbench anywhere, and it does not score, grade or keep a history of it\./.test(src));

// Rephrasing: Sections 12, 14 and 19
ok('Section 14 defines a cell in a sentence and says rephrasing has no AI and is optional', /A partner cell is a private space for two people whose messages are encrypted on your two devices/.test(src) && /It has no AI in it\./.test(src));
ok('Section 14 says what our server sees, what we keep, and that the other person can copy or show it', /What our server sees: the same as for any message in a cell/.test(src) && /We keep nothing from a round/.test(src) && /they can copy it, photograph it or show it to someone/.test(src));
ok('Section 14 describes the device checks as private to the writer, pausing only for danger to a person, and skippable by editing the page', /tells only you if it finds words that may be about someone being in danger or being hurt by someone/.test(src) && /pauses the cell for both of you only for danger to a person/.test(src) && /a person who changes their own copy of the page can skip it/.test(src));
ok('Section 14 tells the reporter exactly what a report reveals, and Section 19 gives 30 days', /the report reveals every word in that message/.test(src) && /We keep a report for 30 days \(Section 19\)/.test(src) && /A reported rephrasing message \(Section 14\) is deleted within 30 days of arriving/.test(src));
ok('Section 14 covers leaving the page, and says it is a practice, not for emergencies', /if your page is only hidden/.test(src) && /not for emergencies \(Section 4\)/.test(src));
ok('Section 12 lists rephrasing among the things that leave the device only when chosen, and says it sends only what you choose', /a rephrasing round in a partner cell, to the one other person in it \(Section 14\)/.test(src) && /Rephrasing in a partner cell is optional, has no AI, and sends only what you choose, each time\./.test(src));
ok('the section references in the new text are real: 4 is crisis, 14 is sending, 16 is the device, 19 is retention', [[4, /crisis/i], [14, /send us/i], [16, /device/i], [19, /retention/i]].every(([n, re]) => sections.some((s) => s.number === n && (re as RegExp).test(s.heading))));
ok('the data register lists the workbench record and the three rephrasing rows', /Phrase workbench \(`VITE_PHRASE_WORKBENCH`\)/.test(register) && /Rephrasing round \(`VITE_REPHRASE`\) while a cell is open/.test(register) && /A reported rephrasing message/.test(register) && /30 days \(decided by the owner, 2026-11-20\)/.test(register));
