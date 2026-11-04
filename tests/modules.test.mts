// The public selection logic for the private coaching modules. The module text itself is private and
// not in this repository, so buildNotes is tested with a made-up set.
import { selectModules, buildNotes, MODULE_IDS, type ModuleSet } from '../src/lib/coachModules.ts';
import { ok } from './helpers.mts';

const cases: [string, string[]][] = [
  ["I'm exhausted and nothing left to give", ['reserves']],
  ["My boss doesn't listen and dismisses everything I say", ['legitimacy']],
  ["My boss never listens", ['legitimacy']],
  ["I think he's sabotaging me on purpose, every time I try", ['deliberate_harm']],
  ["Maybe it's my fault, I'm too sensitive", ['inward_turn']],
  ["Part of me wants to leave but part of me wants to stay", ['split_values']],
  ["It's the same fight again and again", ['recurrence']],
  ["Nothing ever changes no matter what I do", ['frozen_system']],
  ["The whole company is set up this way, it's systemic", ['systemic_scale']],
  ["I'm at my limit, about to quit", ['pressure']],
  ["She didn't mean it, it was an oversight", ['careless_harm']],
  ["I know what to say but I freeze", ['unable_to_begin']],
  ["I only have one client, no savings", ['backup']],
  ["I'm exhausted. My boss never listens and I think it's on purpose. Same fight again. It's systemic.", ['reserves', 'legitimacy', 'deliberate_harm']],
  ["I had a nice walk today and want to plan dinner", []],
];
for (const [text, expected] of cases) {
  const got = selectModules([text]);
  ok(`selects ${expected.join(', ') || 'nothing'} for "${text.slice(0, 40)}"`, JSON.stringify(got) === JSON.stringify(expected), got.join(','));
}
ok('every selectable id is a known module id', cases.every(([t]) => selectModules([t]).every((id) => MODULE_IDS.includes(id))));
ok('at most 3 modules are chosen', selectModules(["I'm exhausted. My boss never listens and I think it's on purpose. Same fight again. It's systemic. I'm at my limit."]).length <= 3);

const fake: ModuleSet = { core: 'CORE-TEXT', modules: Object.fromEntries(MODULE_IDS.map((id) => [id, `MODULE-${id}`])) };
const notes = buildNotes(fake, ["I'm exhausted. My boss never listens."]);
ok('notes include the core and the selected modules', notes.includes('CORE-TEXT') && notes.includes('MODULE-reserves') && notes.includes('MODULE-legitimacy'));
ok('notes leave out modules that were not selected', !notes.includes('MODULE-backup'));
const soft = buildNotes(fake, ["I'm exhausted"], { skipModules: true });
ok('softened conversations get the core only', soft.includes('CORE-TEXT') && !soft.includes('MODULE-'));
ok('notes respect the character cap', buildNotes({ core: 'c'.repeat(500), modules: { reserves: 'r'.repeat(5000) } }, ["I'm exhausted"], { maxChars: 1000 }).length <= 1000);
