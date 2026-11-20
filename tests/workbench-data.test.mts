// The phrase workbench's word data and wording (docs/phrase-workbench-scope.md): our own lists, tiered; plain meanings; no verdict words; the marks keep a
// shape and a name; the CNVC credit is exact; near words stay on the lists.
import { NEED_CATEGORIES, allNeedWords, categoryOfNeed } from '../src/lib/needFamilies.ts';
import { FEELING_SIDES, allFeelingWords } from '../src/lib/feelingFamilies.ts';
import { MARKS, WB, LEVEL_NAMES, PASSING_WORDS, PASSING_NOTE, CNVC_CREDIT_LINE, CNVC_PAGE } from '../src/lib/workbenchCopy.ts';
import { nearWords } from '../src/lib/nearWords.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const VERDICT = /\b(wrong|incorrect|mistake|mistaken|error|bad|good|correct|right answer|score|scores|scored|result|results|should|fix|fail|failed)\b/i;

// Tiers
ok('seven need categories, with the plain names of the structure', NEED_CATEGORIES.map((c) => c.name).join('|') === 'Physical wellbeing|Connection|Honesty|Play|Peace|Autonomy|Meaning');
ok('every category has a plain line and three families', NEED_CATEGORIES.every((c) => c.plain.length > 10 && c.families.length === 3));
ok('every need family has four to six words', NEED_CATEGORIES.every((c) => c.families.every((f) => f.words.length >= 4 && f.words.length <= 6)));
ok('feelings have two sides, each with families of three to six words', FEELING_SIDES.length === 2 && FEELING_SIDES.every((s) => s.families.length >= 8 && s.families.every((f) => f.words.length >= 3 && f.words.length <= 6)));
ok('the lists are expansive (at least 80 needs, 80 feelings) yet each screen shows at most six words', allNeedWords().length >= 80 && allFeelingWords().length >= 80);

// Words and meanings
const needs = allNeedWords(), feels = allFeelingWords();
ok('no need word sits on two lists', new Set(needs.map((w) => w.word.toLowerCase())).size === needs.length);
ok('no feeling word sits on two lists', new Set(feels.map((w) => w.word.toLowerCase())).size === feels.length);
ok('every word has a meaning of 10 to 90 characters', [...needs, ...feels].every((w) => w.def.length >= 10 && w.def.length <= 90 && /\.$/.test(w.def)));
ok('no meaning or word carries a verdict word', [...needs, ...feels].every((w) => !VERDICT.test(w.def) && !VERDICT.test(w.word)));
ok('every word is lower case and short', [...needs, ...feels].every((w) => w.word === w.word.toLowerCase() && w.word.length <= 32));
const gd = gradeLevel([...needs, ...feels].map((w) => w.def).join(' '));
ok(`the meanings, read together, are at grade 7 or below (${gd.toFixed(1)})`, gd <= 7);
ok('categoryOfNeed finds a word and its category, and says nothing for a word not listed', categoryOfNeed('Respect')?.category === 'Connection' && categoryOfNeed('zzz') === null);

// Marks
ok('eight marks, four shown first', MARKS.length === 8 && MARKS.filter((m) => m.first).length === 4);
ok('every mark has a name, a plain line and a words-for-the-shape', MARKS.every((m) => m.name && m.plain.length > 10 && m.shapeWords));
ok('every mark has its own shape, so no mark depends on colour', new Set(MARKS.map((m) => m.shape)).size === 8);
ok('the seven slider steps have names and none is a number', LEVEL_NAMES.length === 7 && LEVEL_NAMES.every((n) => !/\d/.test(n)));

// Wording
const copy: string[] = [...(Object.values(WB) as unknown[]).filter((v): v is string => typeof v === 'string'), ...WB.steps, WB.emptySlot('a feeling'), WB.tooLong(3), ...MARKS.flatMap((m) => [m.name, m.plain]), PASSING_NOTE, ...PASSING_WORDS.map((p) => p.def)];
ok('no screen wording carries a verdict word', copy.every((t) => !VERDICT.test(t)), copy.filter((t) => VERDICT.test(t)).join(' / '));
const gc = gradeLevel(copy.join(' '));
ok(`the screen wording, read together, is at grade 8 or below (${gc.toFixed(1)})`, gc <= 8);
ok('the page says nothing is scored, kept or sent', /not a test/.test(WB.intro) && /stays on this device/i.test(WB.deviceNote));

// Credit
ok('the CNVC credit line is exact', CNVC_CREDIT_LINE === 'The Center for Nonviolent Communication © 2023, www.CNVC.org' && WB.credit.includes(CNVC_CREDIT_LINE));
ok('the credit links to CNVC’s own page, and says the group-needs layer is this project’s extension, not CNVC’s', CNVC_PAGE === 'https://www.cnvc.org/store/feelings-and-needs-inventory' && /extension and not CNVC’s/.test(WB.credit));

// Near words
const nr = nearWords('hurt');
ok('near words come from the lists, never the word itself', nr.length > 0 && !nr.includes('hurt') && nr.every((w) => [...needs, ...feels].some((x) => x.word === w)));
ok('near words cross families by hand-picked links, both ways', nearWords('sad').includes('hurt') && nearWords('hurt').includes('sad'));
ok('an unlisted word has no near words, and the limit holds', nearWords('zzz').length === 0 && nearWords('tired', 3).length <= 3);
