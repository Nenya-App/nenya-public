// The builder that turns the private module drafts into the one document the coach reads. Tested with made-up text;
// the real drafts and the built file stay outside the repository.
import { buildCombinedSet, moduleText, NOTES_CAP, type LensSet, type MoveDraft } from '../src/lib/moduleSet.ts';
import { MODULE_IDS, MODULE_GROUPS } from '../src/lib/coachModules.ts';
import { ok } from './helpers.mts';

const LENS_IDS = MODULE_IDS.filter((id) => MODULE_GROUPS[id] === 'lens');
const lens: LensSet = { core: 'CORE', modules: Object.fromEntries(LENS_IDS.map((id) => [id, `LENS-${id}`])) };
const moveIds = MODULE_IDS.filter((id) => !LENS_IDS.includes(id));
const moves: MoveDraft = {
  core_additions: ['ADDITION ONE', 'ADDITION TWO'],
  modules: moveIds.map((id) => ({ id, kind: 'skill', title: `Title ${id}`, guidance: `Guidance for ${id}.`, exemplars: id === 'answer_with_words' ? ['You could say this.', 'Or this.'] : undefined })),
};

let r = buildCombinedSet(lens, moves);
ok('a complete draft builds with no problems', r.report.problems.length === 0, r.report.problems.join('; '));
ok('every trigger id has text', MODULE_IDS.every((id) => !!r.set.modules[id]));
ok('the core is the lens core plus the additions', r.set.core === 'CORE\nADDITION ONE\nADDITION TWO');
ok('lens modules pass through unchanged', r.set.modules[LENS_IDS[0]] === `LENS-${LENS_IDS[0]}`);
const t = moduleText(moves.modules.find((m) => m.id === 'answer_with_words')!);
ok('a module is its title, its guidance and its exemplars', /^TITLE ANSWER_WITH_WORDS/.test(t) && t.includes('Guidance for answer_with_words.') && t.includes('- "You could say this."') && t.includes('never recite'));
ok('a module without exemplars has no exemplar block', !moduleText(moves.modules.find((m) => m.id === 'closure_check')!).includes('never recite'));

r = buildCombinedSet(lens, { ...moves, modules: [...moves.modules, { id: 'invented', kind: 'skill', title: 't', guidance: 'g' }] });
ok('a module with no trigger is reported', r.report.problems.some((p) => p.includes('no trigger for module invented')));
r = buildCombinedSet(lens, { ...moves, modules: moves.modules.slice(1) });
ok('a trigger with no text is reported', r.report.problems.some((p) => p.startsWith('trigger without text')));
const huge: MoveDraft = { ...moves, modules: moves.modules.map((m) => ({ ...m, guidance: 'x'.repeat(5000) })) };
r = buildCombinedSet(lens, huge);
ok('a worst case over the notes cap is reported', r.report.worstCaseChars > NOTES_CAP && r.report.problems.some((p) => p.includes('exceeds')));
r = buildCombinedSet(lens, moves);
ok('the report counts the core and every module', r.report.coreChars === r.set.core.length && Object.keys(r.report.perModule).length === MODULE_IDS.length);
