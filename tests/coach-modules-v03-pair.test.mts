// The two v0.3 coaching moves `permission_giving` and `ask_one_question` (owner-approved 2026-11-22): when each is chosen, and when lookalikes must not choose it.
// All messages are invented. The module text is private and is not in this repository; the size check uses stand-in text.
import { selectModules, buildNotes, MODULE_IDS, MODULE_GROUPS, type ModuleSet } from '../src/lib/coachModules.ts';
import { ok } from './helpers.mts';

const permissionMust = [
  "I'm sorry for needing so much from you.",
  "Sorry to ask again, I know it's a lot.",
  "I'm sorry I'm so needy.",
  "I know I shouldn't feel this way, but I do.",
  "I shouldn't even want this and yet I do.",
  "Is it selfish to want a weekend to myself?",
  "I feel guilty for needing help with the kids.",
  "I'm so sorry for asking, I know you are busy and it feels like too much.",
  "Sorry for being so emotional about all of this.",
  "I'm not supposed to want more than I have, right?",
  "I apologize for wanting so much attention lately.",
  "I feel guilty about wanting time alone after the baby.",
  "I'm really sorry I keep asking for reassurance.",
  "Is it wrong to need a day off from everyone?",
];
const permissionMustNot = [
  "I'm sorry I yelled at her yesterday.",
  "Sorry for the late reply, work has been busy.",
  "I'm sorry for your loss.",
  "Sorry to hear that, how did it go?",
  "I shouldn't have said that to my brother.",
  "He shouldn't feel that way about her.",
  "You shouldn't feel bad about it.",
  "I feel guilty for lying to my mother about the money.",
  "My boss apologised for needing the report early and I said fine.",
  "I'm sorry I broke your cup.",
  "Is it selfish to eat the last slice of cake?",
  "She shouldn't need to ask twice for help.",
  "I'm sorry I need to cancel on Friday.",
  "I'm sorry about the mess in the kitchen.",
];
const askMust = [
  'hi',
  'rough day',
  'I need advice',
  'help with my boss',
  'Hello there',
  'Can I ask you something?',
  'I have a problem with my sister.',
  'Not sure where to start, honestly.',
  'Need some help with a conversation',
  'My partner and I had a fight.',
  'Bad week at work',
  'I could use some help today.',
];
const askMustNot = [
  'one two three four five six seven eight nine',   // nine words
  'I need some advice about how to deal with my boss.', // ten words
  'Hi, I could really use some help with something tonight please.',
  "I'm overwhelmed.",                               // another move applies
  'I feel so sad.',                                 // another move applies
  "I'm exhausted.",                                 // a lens applies
  'I want him to pay for it.',                      // another move applies
  "I'm sorry for needing help.",                    // permission_giving applies
  'Why does my boss ignore me?',                    // a lens applies
  'I had a panic attack.',                          // safety applies
  'Can you explain what a need is?',                // another move applies
  'Every time I talk he walks away.',               // another move applies
  '',                                               // nothing said
  '   ',
];

ok('the two new modules are in group move and have triggers', ['permission_giving', 'ask_one_question'].every((id) => MODULE_GROUPS[id] === 'move' && MODULE_IDS.includes(id)));

ok('permission_giving: at least 10 trigger messages and 10 lookalikes are tested', permissionMust.length >= 10 && permissionMustNot.length >= 10);
for (const t of permissionMust) ok(`permission_giving fires for "${t.slice(0, 50)}"`, selectModules([t]).includes('permission_giving'), selectModules([t]).join(','));
for (const t of permissionMustNot) ok(`permission_giving does not fire for "${t.slice(0, 50)}"`, !selectModules([t]).includes('permission_giving'), selectModules([t]).join(','));

ok('ask_one_question: at least 10 trigger messages and 10 lookalikes are tested', askMust.length >= 10 && askMustNot.length >= 10);
for (const t of askMust) ok(`ask_one_question fires for first message "${t.slice(0, 50)}"`, selectModules([t]).includes('ask_one_question'), selectModules([t]).join(','));
for (const t of askMustNot) ok(`ask_one_question does not fire for first message "${t.slice(0, 50)}"`, !selectModules([t]).includes('ask_one_question'), selectModules([t]).join(','));

// permission_giving: latest message only, and available when depleted.
ok('permission_giving looks only at the latest message', !selectModules(["I'm sorry for needing so much.", 'Thanks, that helps a lot.']).includes('permission_giving'));
ok('permission_giving stays available when reserves are low', (() => { const g = selectModules(["I'm exhausted and I'm sorry for needing so much."]); return g.includes('reserves') && g.includes('permission_giving'); })());
ok('permission_giving stays available when a carer is depleted', (() => { const g = selectModules(["I'm caring for my mother and I'm drained, and I feel guilty for needing a break."]); return g.includes('care_depleted') && g.includes('permission_giving'); })());
ok('permission_giving is not held back by deliberate harm (it asks for no action)', (() => { const g = selectModules(["He did it on purpose, and I know I shouldn't feel this way."]); return g.includes('harm_named_as_intended') && g.includes('permission_giving'); })());
ok('offer_a_smaller_step still stands alone, and holds permission_giving back', (() => { const g = selectModules(["I'm overwhelmed and I'm sorry for needing so much."]); return g.includes('offer_a_smaller_step') && !g.includes('permission_giving'); })());

// ask_one_question: first message only.
ok('the second message never fires it, however short', !selectModules(['hi', 'rough day']).includes('ask_one_question') && !selectModules(['I have a long story to tell about my week at work and my boss.', 'hi']).includes('ask_one_question'));
ok('a conversation with nothing said yet never fires it', selectModules([]).length === 0);
ok('a first message of exactly eight words fires, nine does not', selectModules(['one two three four five six seven eight']).includes('ask_one_question') && !selectModules(['one two three four five six seven eight nine']).includes('ask_one_question'));
ok('"don\'t" counts as one word', selectModules(["I don't know what to say"]).includes('ask_one_question') && selectModules(["I don't know what to say, it's all so hard"]).includes('ask_one_question') === false);
ok('a first message that also fires a lens does not fire it', !selectModules(['I feel stuck']).includes('ask_one_question') && selectModules(['I feel stuck']).includes('unable_to_begin'));
ok('a first message that also fires another move does not fire it (the other move wins)', (() => { const g = selectModules(['I want to get back at her.']); return g.includes('protective_not_punitive') && !g.includes('ask_one_question'); })());
ok('a first message that fires safety does not fire it', (() => { const g = selectModules(['panic attacks']); return g[0] === 'deep_fear_refer_out' && !g.includes('ask_one_question'); })());
ok('a first message that asks for a resource does not fire it', !selectModules(['Any resources on NVC?']).includes('ask_one_question') && selectModules(['Any resources on NVC?']).includes('cnvc'));
ok('a plain opening gets exactly the one module', JSON.stringify(selectModules(['rough day'])) === JSON.stringify(['ask_one_question']));

// Exclusions that must keep working.
const set: ModuleSet = { core: 'CORE', modules: Object.fromEntries(MODULE_IDS.map((id) => [id, `MODULE-${id}`])) };
ok('soften tier gets the core only for a plain opening', buildNotes(set, ['rough day'], { skipModules: true }) === 'CORE');
ok('soften tier gets the core only for a permission message', buildNotes(set, ["I'm sorry for needing so much."], { skipModules: true }) === 'CORE');
ok('the closing exchange leaves both out (moves excluded)', buildNotes(set, ['rough day'], { exclude: ['move'] }) === 'CORE' && !buildNotes(set, ["I'm sorry for needing so much."], { exclude: ['move'] }).includes('MODULE-permission_giving'));
ok('without exclusions the modules are added', buildNotes(set, ['rough day']).includes('MODULE-ask_one_question') && buildNotes(set, ["I'm sorry for needing so much."]).includes('MODULE-permission_giving'));

// At most three modules, safety first.
ok('at most three modules and safety first when permission_giving also matches', (() => {
  const g = selectModules(["I had a panic attack. I'm exhausted, I'm sorry for needing so much. I want him to pay for what he did. Every time I raise it he goes quiet. I'm devastated and I'm leaving my husband."]);
  return g.length <= 3 && g[0] === 'deep_fear_refer_out';
})());
ok('ask_one_question never adds a fourth module', selectModules(['rough day']).length === 1);

// Size: the worst case with the two new modules, using stand-in text of the real length (the private texts are 475 and 460 characters).
{
  const stand: Record<string, string> = {};
  for (const id of MODULE_IDS) stand[id] = 'x'.repeat(id === 'permission_giving' ? 520 : id === 'ask_one_question' ? 510 : 1700);
  const core = 'c'.repeat(3600);
  const worst = core.length + Object.values(stand).sort((a, b) => b.length - a.length).slice(0, 3).reduce((a, t) => a + t.length + 2, 0);
  ok(`the worst case for one reply stays under the 12,000-character cap (${worst})`, worst < 12000);
}
