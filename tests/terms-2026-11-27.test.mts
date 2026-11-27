// The 2026-11-27 Terms revision (owner approved): the list of changes the site can make to a coach reply gains the ones it left out, the partner-practice
// section says the server keeps a code of each seat key, the date moves, and the outgoing text is archived.
import { existsSync, readFileSync } from 'node:fs';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const read = (p: string) => readFileSync(p, 'utf8');
const source = read('src/lib/legalDocument.ts');
const section15 = LEGAL_PARTS.flatMap((p) => p.sections).find((s) => s.number === 15)!;
const words = section15.subsections!.find((s) => s.heading === 'Words the site writes, not the AI')!.paragraphs;
const added = words[1] ?? '';
ok('the new paragraph follows the list the Terms call full', /this is the full list/.test(words[0]) && added.startsWith('Other changes our server may make to a reply.'));
ok('it names each change that was missing', ['a name, or another capitalized word, that you wrote', 'ask a question or invite a reply on the last exchange', 'repeat a learning card you have been shown', 'about a medicine', 'will remember you', 'name your feelings or needs for you', 'cannot diagnose', 'a web address the site does not itself use', 'shorten a reply that is too long'].every((w) => added.includes(w)));
ok('the date is November 27, 2026, and the cells-on date stays later', LEGAL_EFFECTIVE_DATE === 'November 27, 2026' && /CELLS \? 'November 28, 2026' : 'November 27, 2026'/.test(source));
const arch = 'docs/legal/archive/terms-and-privacy-until-2026-11-27.md';
ok('the outgoing text is archived without the new paragraph, and the README lists it', existsSync(arch) && /this is the full list/.test(read(arch)) && !/Other changes our server may make/.test(read(arch)) && read('docs/legal/README.md').includes('archive/terms-and-privacy-until-2026-11-27.md'));
ok('the facts page for AI assistants gives the same date', /in force: effective November 27, 2026/.test(read('public/mind-facts.txt')));
