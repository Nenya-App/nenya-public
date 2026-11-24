// The coercion modules' selection (src/lib/coachModules.ts, docs/coercion-modules-scope.md): which of coercion_name_pattern, coercion_steadiness and coercion_own_behavior fits a conversation,
// when none may apply (a guard, the distress path, fear or danger, a skilled-person referral), how they never combine, and how they sit beside the existing moves. No model is called.
import { ok } from './helpers.mts';
import { selectModules, buildNotes, coercionModuleFor, standDownMore, setCoercionModules, COERCION_IDS, COERCION_GROUPS, MODULE_IDS, MODULE_GROUPS, type ModuleSet } from '../src/lib/coachModules.ts';
import { checkConversation } from '../src/lib/safetyFlags.ts';

const sel = (...m: string[]) => selectModules(m, 3, [], { coercion: true });
const NAME = 'coercion_name_pattern', STEADY = 'coercion_steadiness', OWN = 'coercion_own_behavior';

// ---- they are not in the production lists, and are off unless switched on
ok('the three ids exist', COERCION_IDS.length === 3 && [NAME, STEADY, OWN].every((id) => (COERCION_IDS as readonly string[]).includes(id)));
ok('none is in MODULE_IDS or MODULE_GROUPS (the production lists)', COERCION_IDS.every((id) => !MODULE_IDS.includes(id) && !(id in MODULE_GROUPS)));
ok('off by default: the same message selects nothing from them', !selectModules(['My partner decides who I can see, and he gets angry when I spend time with my sister.']).some((id) => id.startsWith('coercion_')));
ok('off by default even with a description and a question', !selectModules(['My wife reads my messages.', 'What can I do about it?']).some((id) => id.startsWith('coercion_')));
ok('an explicit option turns them on for one call', sel('My partner decides who I can see, and he gets angry when I spend time with my sister.')[0] === NAME);
setCoercionModules(true);
ok('the in-code switch turns them on', selectModules(['My partner decides who I can see, and he gets angry when I spend time with my sister.'])[0] === NAME);
ok('an explicit option false overrides the switch', !selectModules(['My partner decides who I can see, and he gets angry when I spend time with my sister.'], 3, [], { coercion: false }).some((id) => id.startsWith('coercion_')));
setCoercionModules(false);
ok('and off again', !selectModules(['My partner decides who I can see, and he gets angry when I spend time with my sister.']).some((id) => id.startsWith('coercion_')));
ok('nothing in the production notes: buildNotes with no option never reaches the modules', !buildNotes({ core: 'core', modules: { [NAME]: 'private text' } }, ['My partner decides who I can see, and he gets angry when I spend time with my sister.']).includes('private text'));

// ---- being controlled: the name-the-pattern module
const CONTROLLED = [
  "My husband checks my phone when he thinks I'm not looking, and he questions me about every text.",
  'My partner decides who I can see, and he gets angry when I spend time with my sister.',
  'I have to ask my wife for permission before I buy anything, even groceries.',
  'My boyfriend gives me the silent treatment for days whenever I see my friends.',
  'She tells me what to wear and who to talk to, and I go along with it to keep the peace.',
  'My husband controls all the money and I get an allowance.',
  'He criticizes me in front of his friends and then says I am too sensitive.',
  'My girlfriend gets angry whenever I spend time with my family, so I have stopped going.',
  'He wants to know where I am every hour and I am not allowed to turn my phone off.',
  'My wife expects me to check in with her every time I leave the house.',
  'My partner is so controlling that I have stopped telling him about my day.',
  "I can't see my friends without him getting upset and making me pay for it later.",
];
for (const m of CONTROLLED) ok(`controlled: ${m.slice(0, 50)}`, sel(m).join() === NAME, sel(m).join());
ok('a coworker or a boss checking email is not a partner controlling', sel('My boss checks my email every night and it annoys me.').every((id) => !id.startsWith('coercion_')));
ok('a message about a partner with no control in it selects nothing', sel('My husband and I went for a walk and I felt calm.').every((id) => !id.startsWith('coercion_')));
ok('the pattern module looks at the latest message only', sel('My partner decides who I can see.', 'Thank you, that helps.').every((id) => id !== NAME));

// ---- steadiness: described earlier, asking or stuck now
const ASKS = ['What can I do about it?', 'What should I do?', 'How do I cope with this?', 'How can I handle this?', "I don't know what to do.", 'I feel stuck.', 'I feel so stuck.', 'I feel powerless.', 'I am so helpless.'];
for (const a of ASKS) ok(`steadiness after a description, then "${a}"`, sel('My husband reads my messages and questions every text.', a).join() === STEADY, sel('My husband reads my messages and questions every text.', a).join());
ok('the same message cannot do both: description and question together name the pattern first', sel('My husband reads my messages and I do not know what to do.').join() === NAME);
ok('a question with no earlier description does not select steadiness', !sel('What can I do about it?').includes(STEADY) && !sel('I feel stuck.').includes(STEADY));
ok('a question after something that is not about being controlled does not select steadiness', !sel('My sister and I argued about the holidays.', 'What can I do about it?').includes(STEADY));
ok('steadiness is a move for the closing phase: left out when moves are excluded, and the pattern module is not chosen instead', !selectModules(['My husband reads my messages.', 'I feel stuck.'], 3, ['move'], { coercion: true }).includes(STEADY));

// ---- own behaviour: the person says they control, scare, monitor or isolate a partner
const OWNS = [
  "I check my wife's phone every night, and she has started hiding it from me.",
  "I yell at my girlfriend when she goes out without telling me where she's going.",
  "I don't let my husband see his old friends because I think they are a bad influence.",
  "I take all of my wife's pay and decide what she can spend.",
  "My girlfriend says I'm controlling and I think she might be right.",
  "I keep tabs on where my husband is all day, and I get furious when he doesn't answer.",
  "I scare my partner when I get angry, and I don't like that about myself.",
  'I make my wife feel guilty every time she wants to see her sister.',
  'I need to know where she is at all times.',
  'I track my boyfriend\'s location and read his messages.',
];
for (const m of OWNS) ok(`own: ${m.slice(0, 50)}`, sel(m).join() === OWN, sel(m).join());
ok('a negated statement is not an admission', sel('I never check her phone.').every((id) => id !== OWN) && sel("I don't read my husband's messages.").every((id) => id !== OWN));
ok('own behaviour persists: said earlier, still on for a later message', sel("I check my wife's phone every night.", 'Thank you for listening.').join() === OWN);
ok('own behaviour wins over being controlled, in one message', sel('I check my wife\'s phone every night, and my wife decides who I can see.').join() === OWN);
ok('own behaviour wins over being controlled, across messages', sel('My partner decides who I can see.', 'I also yell at my partner when he is late.').join() === OWN && sel('I yell at my partner when he is late.', 'My partner decides who I can see.', 'What can I do about it?').join() === OWN);
ok('the partner being scared of the person does not stand the module down', sel('My wife is scared of me and I control the money.').join() === OWN);

// ---- one module at a time, and alone
const mixed = ['My husband reads my messages and I feel exhausted and worn out. What can I do about it?', 'My partner decides who I can see, I am torn between two choices, and the same thing happens again and again.'];
for (const m of mixed) ok('a coercion module is the only module returned', sel(m).length <= 1 && (sel(m).length === 0 || sel(m)[0].startsWith('coercion_')), sel(m).join());
ok('exactly one of the three is ever chosen', CONTROLLED.concat(OWNS).every((m) => sel(m).length === 1));
ok('a coercion module replaces the ordinary moves it would collide with (reframe_gently on "so controlling", ask_for_what_you_want on permission)', !sel('My partner is so controlling that I have stopped telling him about my day.').includes('reframe_gently') && !sel('I have to ask my wife for permission before I buy anything, even groceries.').includes('ask_for_what_you_want'));
ok('the closing phase excludes the groups: pattern and own behaviour are lenses, steadiness a move', COERCION_GROUPS[NAME] === 'lens' && COERCION_GROUPS[OWN] === 'lens' && COERCION_GROUPS[STEADY] === 'move');

// ---- stand-down: guards, the distress path, fear and danger
const STANDS_DOWN = [
  'My husband checks my phone every night and I am afraid of my husband.',
  "My husband checks my phone every night and reads all my messages.", // the soften rule for control already applies
  'He is threatening to kill me and he checks my phone all day.',
  "My husband decides who I can see and last night he said he would hurt me.",
  "My husband reads my messages and I am scared of what he will do.",
  'My partner decides who I can see and I feel unsafe at home.',
  'My partner decides who I can see and I am in danger.',
  'My wife tracks my phone and I have bruises on my arm.',
  'I check my wife\'s phone every night and last week I hit my wife.',
  'I scare my partner and I have thought about hurting myself.',
  'I yell at my girlfriend and I want to hurt her.',
  "My boyfriend decides who I can see and I can't stop thinking about suicide.",
  "My partner is so controlling and I get panic attacks and flashbacks around him.",
];
for (const m of STANDS_DOWN) ok(`stands down: ${m.slice(0, 55)}`, sel(m).every((id) => !id.startsWith('coercion_')), sel(m).join());
ok('stands down on an earlier message too: fear said first, a question later', sel('I am afraid of my husband.', 'He decides who I can see.', 'What can I do about it?').every((id) => !id.startsWith('coercion_')));
ok('stands down for any flag the guards raise anywhere in the conversation', ['I want to disappear.', 'My husband takes my phone.'].every((m) => checkConversation([m]) && sel(m, 'My partner decides who I can see.').every((id) => !id.startsWith('coercion_'))));
ok('every case in the stand-down list that the guards catch is caught by checkConversation, and the rest by the net in coachModules', STANDS_DOWN.filter((m) => !checkConversation([m])).every((m) => sel(m).every((id) => !id.startsWith('coercion_'))));

// ---- the existing moves and holds
ok('offer_a_smaller_step wins: overwhelmed, the coercion modules stand down and the smaller step is offered', sel("I'm overwhelmed. My partner decides who I can see.").join() === 'offer_a_smaller_step');
ok('offer_a_smaller_step wins over own behaviour too', sel("It's all too much right now. I check my wife's phone every night.").join() === 'offer_a_smaller_step');
ok('offer_a_smaller_step wins over steadiness', sel('My partner decides who I can see.', "I'm so tired and I can't do this tonight.").every((id) => !id.startsWith('coercion_')));
ok('grieve_before_deciding wins: a relationship-ending decision with fresh pain', sel("My partner decides who I can see and I'm heartbroken. Should I leave him?").every((id) => !id.startsWith('coercion_')));
ok('hold: with depleted reserves, steadiness stands down; the pattern is still named', sel('My husband reads my messages.', 'I feel stuck and I am exhausted.').join() !== STEADY && sel('My husband reads my messages, and I am completely exhausted.').join() === NAME);
ok('hold: with care depleted, steadiness stands down', sel('My husband reads my messages.', 'I am caring for my mother and I am drained, and I feel stuck.').join() !== STEADY);
ok('hold: when the person says it is on purpose, steadiness stands down', sel('My husband reads my messages and does it deliberately.', 'I feel stuck.').join() !== STEADY);
ok('own behaviour is not held by depleted reserves (it asks nothing of the person)', sel("I'm worn out and I check my wife's phone every night.").join() === OWN);
ok('deep fear: a referral to a skilled person wins', sel('My partner decides who I can see.', 'I have flashbacks and I freeze around him.').every((id) => !id.startsWith('coercion_')));
ok('the ask_one_question opening is not chosen beside a coercion module', !sel('He tracks my phone.').includes('ask_one_question'));

// ---- shape
ok('coercionModuleFor is pure and needs no model: the same input twice gives the same answer', coercionModuleFor(['My husband reads my messages.']) === coercionModuleFor(['My husband reads my messages.']));
ok('no text, no module', coercionModuleFor([]) === null && sel('').length >= 0);
const set: ModuleSet = { core: 'CORE', modules: { [NAME]: 'TEXT-A', [STEADY]: 'TEXT-B', [OWN]: 'TEXT-C' } };
ok('when switched on, buildNotes adds exactly the chosen module text and nothing else (module text here is a stand-in)', (() => { setCoercionModules(true); const n = buildNotes(set, ['My partner decides who I can see.']); setCoercionModules(false); return n.includes('TEXT-A') && !n.includes('TEXT-B') && !n.includes('TEXT-C'); })());
ok('a softened conversation (skipModules) gets no coercion text', (() => { setCoercionModules(true); const n = buildNotes(set, ['My partner decides who I can see.'], { skipModules: true }); setCoercionModules(false); return n === 'CORE'; })());

// ---- five more stand-down cases (2026-11-24, from a practitioners' risk-and-danger guide; ideas only): a pet or animal harmed by a partner, pregnancy with violence, fear or control, leaving or
// separation, escalation, a gun. Each stands down ALL the coercion modules, own behaviour included; the ordinary coach and its guards answer. No model is called.
const CTRL = 'My partner decides who I can see, and he gets angry when I spend time with my sister.';
const OWNMSG = "I check my wife's phone every night, and she has started hiding it from me.";
const none = (...m: string[]) => sel(...m).every((id) => !id.startsWith('coercion_'));
ok('baselines: the control message selects the pattern module, the own-behaviour message selects its module', sel(CTRL).join() === NAME && sel(OWNMSG).join() === OWN);
const MORE: Record<string, string[]> = {
  pets: ['He kicked my dog when he was angry.', 'my husband hurt my cat', 'He killed my pet rabbit.', 'he threatened my pet', 'He threatened to kill my dog.', 'he hurts the animals', 'My dog was kicked by him.', 'my ex hit our dog', 'she poisoned my cat'],
  pregnancy: ["I'm pregnant and he hits me.", "I'm pregnant and he scares me.", "I'm pregnant and he threatens me.", "I'm pregnant and my husband checks my phone every night.", 'He was violent while I was pregnant.', 'Since I got pregnant he decides who I can see.', "I'm expecting a baby and he gets angry whenever I see my sister.", 'My wife is pregnant and I check her phone every night.'],
  leaving: ['I left him.', "I'm leaving him.", 'I left my husband last month.', 'I want to leave.', "I'm planning to leave.", 'I am thinking about leaving.', 'If I leave he gets worse.', "Since I told him I'm leaving he has not spoken to me.", "He won't accept it's over.", "He won't accept the breakup.", 'After the breakup he keeps texting me.', "We keep breaking up and getting back together, and he decides who I can see.", 'I want to leave my husband.', 'My wife is leaving me.', 'She moved out last week.', 'My estranged husband still calls.'],
  escalation: ["It's getting worse.", "It's gotten worse.", "He's getting worse.", 'It happens more and more often.', 'It is escalating.', 'Lately he is much more angry.', "It's worse than before."],
  guns: ['He has a gun.', 'He owns guns.', 'He keeps a gun in the car.', "There's a gun in the house.", 'He threatened me with a gun.', 'He has a firearm.', 'There are firearms in the house.', 'He has access to a gun.'],
};
for (const [kind, list] of Object.entries(MORE)) for (const m of list) {
  // the control description (or the person's own admission) comes first, so a module would otherwise apply. Escalation stands down the modules only in a conversation about being controlled:
  // it is not about a partner being harmed, so a person's own admission plus "it's getting worse" still reaches coercion_own_behavior (see the decision in docs/coercion-modules-scope.md).
  ok(`stands down (${kind}): ${m.slice(0, 50)}`, none(CTRL, m) && (kind === 'escalation' ? sel(OWNMSG, m).join() === OWN : none(OWNMSG, m)), `${sel(CTRL, m).join()} / ${sel(OWNMSG, m).join()}`);
}
ok('it works anywhere in the conversation: said first, the control description later', none('There is a gun in the house.', CTRL) && none('My dog was kicked by him.', 'Thank you.', CTRL));
ok('own behaviour stands down too when the message holds one of the five (the decision: all three modules stand down)', none("I check my wife's phone every night and she is leaving me.") && none("I scare my partner, and she says she is pregnant.") && none('I take all of my wife\'s pay and there is a gun in the house.'));
ok('"he won\'t let me leave" is caught by the guards already, and stays caught', checkConversation(["He won't let me leave."]) !== null || none(CTRL, "He won't let me leave."));
// near misses: these must NOT stand the modules down on account of the five (the control description still selects its module)
const NEAR: string[] = ['My dog is my best friend.', 'I took my dog to the park.', 'He took the dog to the vet.', 'I left my job.', 'I want to leave early.', "I'm leaving for work.", 'I want to leave my job.', "It's getting late.", "I'm getting worse at chess.", 'He has a glue gun.', 'I never left him.', "I'm not leaving him.", 'No pets here.', 'He never hurt my dog.', 'I am not pregnant.'];
for (const m of NEAR) ok(`near miss does not stand down: ${m}`, sel(m, CTRL).join() === NAME, sel(m, CTRL).join());
ok('near miss: a control-free message about a dog is no module either way', none('My dog is my best friend.') && none('I left my job.'));
ok('near miss: escalation words with no control in the conversation are not enough on their own', !standsDownAlone("It's getting worse."), '');
ok('near miss: a person describing getting worse at their own controlling still reaches own behaviour', sel("I check my wife's phone every night and I am getting worse about it.").join() === OWN);
ok('negated: "I never left him" and "I am not pregnant" do not count, with a control description beside them', sel('I never left him.', CTRL).join() === NAME && sel('I am not pregnant.', CTRL).join() === NAME);
ok('a gun collection permit: stated choice is that "he has a gun collection permit" stands down (a partner and a gun)', none('He has a gun collection permit.', CTRL));
ok('an own-behaviour person who mentions a plain near-miss still gets own behaviour', sel(OWNMSG, 'My dog is my best friend.').join() === OWN && sel(OWNMSG, 'I left my job.').join() === OWN);
function standsDownAlone(m: string): boolean { return standDownMore(m.toLowerCase()); }
ok('near miss, alone: pregnancy without violence, fear or control; reunion without control; plain talk of a gun law', ["I'm pregnant and tired.", "I'm pregnant and my husband is excited.", 'We keep breaking up and getting back together.', 'I am not pregnant.'].every((m) => !standsDownAlone(m)));
ok('with a control description beside it, pregnancy and a reunion pattern DO stand down (that is the rule: pregnancy with control; reunion with control)', none("I'm pregnant and tired.", CTRL) && none('We keep breaking up and getting back together.', CTRL));
ok('known over-trigger, toward standing down: the older net matches "a gun" in "a gun control rally" (not changed here)', none('We went to a gun control rally.', CTRL));
