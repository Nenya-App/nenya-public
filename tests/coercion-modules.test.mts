// The coercion modules' selection (src/lib/coachModules.ts, docs/coercion-modules-scope.md): which of coercion_name_pattern, coercion_steadiness and coercion_own_behavior fits a conversation,
// when none may apply (a guard, the distress path, fear or danger, a skilled-person referral), how they never combine, and how they sit beside the existing moves. No model is called.
import { ok } from './helpers.mts';
import { selectModules, buildNotes, coercionModuleFor, setCoercionModules, COERCION_IDS, COERCION_GROUPS, MODULE_IDS, MODULE_GROUPS, type ModuleSet } from '../src/lib/coachModules.ts';
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
