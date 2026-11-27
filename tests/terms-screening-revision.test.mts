// The 2026-11-20 Terms revision: the hate-speech classifier is described in Sections 3, 13 and 15, behind VITE_SCREEN_MODEL; with the switch off nothing moved.
import { readFileSync, existsSync } from 'node:fs';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const src = readFileSync('src/lib/legalDocument.ts', 'utf8');
const archive = 'docs/legal/archive/terms-and-privacy-until-2026-11-20.md';
const text = LEGAL_PARTS.flatMap((p) => p.sections).map((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => x.paragraphs)].join(' ')).join(' ');

ok('with the switch off, none of the classifier sentences appear, and the date is November 27, 2026 (moved by later revisions)', LEGAL_EFFECTIVE_DATE === 'November 27, 2026' && !/hate-speech classifier/.test(text) && !/cardiffnlp/.test(text));
ok('with the switch off, the old phrase-matching sentences stand', /These checks are simple phrase matching and can be wrong\./.test(text) && /These checks are simple phrase matching: they can miss things and can flag harmless words\./.test(text));
ok('the switch is read as Vite needs, and reads as off on a server', /const SCREEN_MODEL = import\.meta\.env\?\.VITE_SCREEN_MODEL === 'on';/.test(src));
ok('the date is November 27, 2026 whatever the classifier switch (it was November 20 with the switch on); only the cells switch moves it, to November 28 (tests/terms-cells-2026-11-23.test.mts)', /LEGAL_EFFECTIVE_DATE = CELLS \? 'November 28, 2026' : 'November 27, 2026'/.test(src));
ok('the outgoing text is archived under its own header, and the README lists the revision', existsSync(archive) && /superseded on November 20, 2026/.test(readFileSync(archive, 'utf8')) && /Effective:\*\* November 19, 2026/.test(readFileSync(archive, 'utf8')) && /terms-and-privacy-until-2026-11-20\.md/.test(readFileSync('docs/legal/README.md', 'utf8')));
ok('the archive holds the old wording and not the new', /simple phrase matching/.test(readFileSync(archive, 'utf8')) && !/cardiffnlp/.test(readFileSync(archive, 'utf8')));
// The wording, present in the source behind its switch.
ok('Section 15 names the model, its maker and licence, and says what was changed', /cardiffnlp\/twitter-roberta-base-hate-latest, made by the Cardiff NLP group and shared under the Creative Commons Attribution 4\.0 licence; we shrank it to a smaller format and did not retrain it/.test(src));
ok('Section 15 says where it runs, what it reads and what it gives back', /runs on our own server, in memory, and sends your message to nobody else/.test(src) && /reads each message you write in a conversation, one at a time/.test(src) && /gives back only a band, high, mid or low, never a score and never your words, and we keep neither/.test(src));
ok('Section 15 says what it can and cannot change', /can change only the tone of the coach’s reply/.test(src) && /never ends a conversation, never stops a message from being sent, and reports no one/.test(src) && /If it is slow or fails, it is skipped/.test(src));
ok('Section 15 states its limits and points to the how-the-checks page', /reads English only, misses most hate that is not a slur, is uneven across groups/.test(src) && /“How the checks work” page explains how it was measured/.test(src));
ok('Section 3 and Section 13 carry the matching sentences behind the switch', /as Section 15 explains, a small hate-speech classifier\. Both can be wrong\./.test(src) && /we also count how many messages it placed in each band \(high, mid or low\), how often it could not answer in time/.test(src));
ok('the Section references in the new text are real: 13 is the daily totals and 15 the coach demo', LEGAL_PARTS.flatMap((p) => p.sections).some((s) => s.number === 13 && /visit counts/.test(s.heading)) && LEGAL_PARTS.flatMap((p) => p.sections).some((s) => s.number === 15 && /coach demo/i.test(s.heading)));
ok('the data register lists the band counts', /Classifier band counts/.test(readFileSync('docs/data-register.md', 'utf8')));
