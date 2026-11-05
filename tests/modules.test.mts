// The public selection logic for the private coaching modules. The module text itself is private and
// not in this repository, so buildNotes is tested with a made-up set.
import { selectModules, buildNotes, MODULE_IDS, MODULE_GROUPS, type ModuleSet } from '../src/lib/coachModules.ts';
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
  ["I'm exhausted. My boss never listens and I think it's on purpose. Same fight again. It's systemic.", ['reserves', 'legitimacy']],
  // coaching moves
  ['How do I tell my sister I need space? She keeps yelling at me.', ['answer_with_words', 'set_a_boundary']],
  ["I want to ask my wife for help but I'm worried how she will react. I feel so hurt.", ['ask_for_what_you_want', 'reaction_as_information', 'guess_then_check']],
  ['She says it is fine but I can tell it is not', ['closure_check']],
  ["My dad will get defensive when I bring it up", ['open_a_hard_conversation', 'empathize_before_asking']],
  ["My daughter won't talk to me and I want to tell her how I feel", ['open_a_hard_conversation', 'read_a_silence', 'power_difference']],
  ["I keep pretending everything is fine at home", ['say_the_real_feeling']],
  ['He goes quiet every time I raise it', ['open_a_hard_conversation', 'read_a_silence']],
  ["I want to practice what I'll say before I meet her", ['offer_to_play_the_other']],
  ["She's so controlling and always criticizing me", ['reframe_gently']],
  ['What is a need, exactly?', ['explain_briefly']],
  ['Any resources on nonviolent communication?', ['cnvc']],
  ['Is there a podcast where I can hear it practiced?', ['podcast']],
  ["Who should I call? I need a hotline", ['crisis_lines']],
  ['I had a panic attack and I freeze up around people', ['deep_fear_refer_out', 'unable_to_begin']],
  // a lens that applies holds back the moves that would pull against it
  ["I'm exhausted and I need to tell my boss no but I don't know how to say it", ['reserves']],
  ["My manager is so controlling and it's on purpose. How do I raise it?", ['deliberate_harm', 'answer_with_words']],
  ["I had a nice walk today and want to plan dinner", []],
];
for (const [text, expected] of cases) {
  const got = selectModules([text]);
  ok(`selects ${expected.join(', ') || 'nothing'} for "${text.slice(0, 40)}"`, JSON.stringify(got) === JSON.stringify(expected), got.join(','));
}
ok('every selectable id is a known module id', cases.every(([t]) => selectModules([t]).every((id) => MODULE_IDS.includes(id))));
ok('with depleted reserves, no action-planning moves are offered',
  !selectModules(["I'm exhausted. How do I tell my boss? I want to ask for help and set a boundary."]).some((id) => ['answer_with_words', 'ask_for_what_you_want', 'set_a_boundary'].includes(id)));
ok('with deliberate harm, perspective-taking toward the other party is left out',
  !selectModules(["He's doing it on purpose and he'll get defensive when I bring it up."]).includes('empathize_before_asking'));
ok('at most two lenses, one safety module and one resource are chosen', (() => {
  const g = selectModules(["I'm exhausted, my boss never listens, it's on purpose, same fight again, it's systemic, I'm at my limit. Any resources on NVC? Who should I call, I need a hotline. I freeze up and had a panic attack."]).map((id) => MODULE_GROUPS[id]);
  return g.filter((x) => x === 'lens').length <= 2 && g.filter((x) => x === 'safety').length <= 1 && g.filter((x) => x === 'resource').length <= 1;
})());
ok('safety comes before lenses', selectModules(["I'm exhausted and I had a panic attack"])[0] === 'deep_fear_refer_out');
ok('at most 3 modules are chosen', selectModules(["I'm exhausted. My boss never listens and I think it's on purpose. Same fight again. It's systemic. I'm at my limit."]).length <= 3);

const fake: ModuleSet = { core: 'CORE-TEXT', modules: Object.fromEntries(MODULE_IDS.map((id) => [id, `MODULE-${id}`])) };
const notes = buildNotes(fake, ["I'm exhausted. My boss never listens."]);
ok('notes include the core and the selected modules', notes.includes('CORE-TEXT') && notes.includes('MODULE-reserves') && notes.includes('MODULE-legitimacy'));
ok('notes leave out modules that were not selected', !notes.includes('MODULE-backup'));
const soft = buildNotes(fake, ["I'm exhausted"], { skipModules: true });
ok('softened conversations get the core only', soft.includes('CORE-TEXT') && !soft.includes('MODULE-'));
ok('notes respect the character cap', buildNotes({ core: 'c'.repeat(500), modules: { reserves: 'r'.repeat(5000) } }, ["I'm exhausted"], { maxChars: 1000 }).length <= 1000);
