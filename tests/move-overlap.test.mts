// "A narrower move wins" (src/lib/coachModules.ts, MOVE_PRECEDENCE; docs/move-overlap-2026-11-24.md). For each of the 36 moves cases the selection BEFORE the rule is pinned (taken from the review of
// 2026-11-24: the expected move plus the extras that pull against it) and the selection AFTER (the expected move without the contradicting extras). All other messages here are invented.
import { ok } from './helpers.mts';
import { MOVE_CASES, MOVE_MODULES } from '../src/lib/personaEvalMovesSet.ts';
import { selectModules, MOVE_PRECEDENCE, MODULE_GROUPS, MODULE_IDS, COERCION_IDS } from '../src/lib/coachModules.ts';

const sel = (...m: string[]) => selectModules(m);

// id -> [before, after]
const R = 'rough_draft_first', H = 'open_a_hard_conversation', P = 'offer_to_play_the_other', T = 'two_intentions', A = 'ask_for_what_you_want', G = 'grieve_before_deciding', F = 'field_cost', Q = 'guess_then_check';
const EXPECT: Record<string, [string[], string[]]> = {
  'rough-draft-first-1': [[R, H, P], [R]],
  'rough-draft-first-2': [[R, H, P], [R]],
  'rough-draft-first-3': [[R, H], [R]],
  'rough-draft-first-4': [[R, H], [R]],
  'two-intentions-1': [[T, H, A], [T, A]],
  'two-intentions-2': [[T, H, A], [T, A]],
  'two-intentions-3': [[T, H, A], [T, A]],
  'two-intentions-4': [[T, A, P], [T, A, P]],
  'grieve-before-deciding-1': [[F, G], [G]],
  'grieve-before-deciding-2': [[G, Q], [G]],
  'grieve-before-deciding-3': [[G], [G]],
  'grieve-before-deciding-4': [[G], [G]],
  'permission-giving-2': [['permission_giving', Q], ['permission_giving']],
  'name-behavior-neutrally-1': [['name_behavior_neutrally', H], ['name_behavior_neutrally', H]],
  'protective-not-punitive-1': [['protective_not_punitive', A], ['protective_not_punitive', A]],
  'protective-not-punitive-4': [['protective_not_punitive', A], ['protective_not_punitive', A]],
};
// every other case selects only its own module, before and after
for (const c of MOVE_CASES) if (!EXPECT[c.id]) EXPECT[c.id] = [[c.module], [c.module]];

ok('every one of the 36 moves cases has an expectation', MOVE_CASES.length === 36 && MOVE_CASES.every((c) => EXPECT[c.id]));
const same = (a: string[], b: string[]) => a.join() === b.join();
for (const c of MOVE_CASES) {
  const [before, after] = EXPECT[c.id];
  ok(`${c.id}: before the rule the move came with ${before.length - 1} extra(s) (pinned from the review); the move is in both`, before.includes(c.module) && after.includes(c.module));
  ok(`${c.id}: now selects ${after.join(', ')}`, same(sel(c.prompt), after), sel(c.prompt).join());
  ok(`${c.id}: what changed is exactly what the table drops for ${c.module}`, before.filter((id) => !after.includes(id)).every((id) => MOVE_PRECEDENCE[c.module].drops.includes(id)) && after.every((id) => before.includes(id)));
}
const changed = MOVE_CASES.filter((c) => !same(EXPECT[c.id][0], EXPECT[c.id][1])).map((c) => c.id);
ok('10 of the 36 cases changed (rough_draft_first 4, two_intentions 3, grieve_before_deciding 2, permission_giving 1) and 26 did not', changed.length === 10, changed.join());
ok('no case gained a module (nothing is backfilled into a freed slot)', MOVE_CASES.every((c) => sel(c.prompt).every((id) => EXPECT[c.id][0].includes(id))));

// ---- the table
const V03 = new Set<string>(MOVE_MODULES);
ok('the table has a row for each of the nine v0.3 moves, and only for them', Object.keys(MOVE_PRECEDENCE).sort().join() === [...MOVE_MODULES].sort().join());
ok('every row has a reason', Object.values(MOVE_PRECEDENCE).every((r) => r.why.length > 30));
const targets = Object.values(MOVE_PRECEDENCE).flatMap((r) => [...r.drops]);
ok('every target is a real module', targets.every((id) => MODULE_IDS.includes(id)));
ok('no target is a safety or resource module', targets.every((id) => MODULE_GROUPS[id] !== 'safety' && MODULE_GROUPS[id] !== 'resource'));
ok('no target is one of the nine v0.3 moves, a coercion module, or the lenses that SUPPRESS reads (reserves, care_depleted, harm_named_as_intended)', targets.every((id) => !V03.has(id) && !(COERCION_IDS as readonly string[]).includes(id) && !['reserves', 'care_depleted', 'harm_named_as_intended'].includes(id)));
ok('a row never drops its own move', Object.entries(MOVE_PRECEDENCE).every(([id, r]) => !r.drops.includes(id)));
ok('the four rows that drop something, and the five that do not', Object.values(MOVE_PRECEDENCE).filter((r) => r.drops.length).length === 4);

// ---- unaffected
ok('offer_a_smaller_step still removes every other move, and nothing else changes', sel("I'm overwhelmed. Fuming at my roommate, confronting her tonight, I feel guilty for wanting an evening to myself.").join() === 'offer_a_smaller_step');
ok('the lens holds still work: with reserves the move is kept and the holds apply', sel("I'm exhausted and heartbroken, want to cut my sister out. I feel guilty for wanting space.").join() === 'reserves,grieve_before_deciding,permission_giving');
ok('a depleted person with only a lens still gets the lens', sel("I'm drained and furious, confronting my roommate tonight.").join() === 'reserves');
ok('a hard conversation with no narrow move still gets open_a_hard_conversation', sel('My dad will get defensive when I bring it up').includes(H));
ok('guess_then_check still fires without a narrow move', sel("I want to ask my wife for help but I'm worried how she will react. I feel so hurt.").includes(Q));
ok('field_cost still fires for a choice that touches others', sel('Should I take the job in another city? My partner would have to move too.').includes(F));

// ---- coercion modules are untouched (they return first and are exclusive)
const COERCE = 'My partner decides who I can see, and he gets angry when I spend time with my sister. Fuming, confronting him tonight.';
ok('coercion off: the move and its precedence apply as usual', sel(COERCE).join() === R);
ok('coercion on: the only module is still the coercion module', selectModules([COERCE], 3, [], { coercion: true }).join() === 'coercion_name_pattern');
ok('coercion on, precedence does not change it', selectModules([COERCE], 3, [], { coercion: true }).length === 1);

// ---- two moves in one message: the union of what the existing rules select, with each row applied
ok('rough_draft_first with permission_giving: the move pair is kept and open_a_hard_conversation goes', sel('Fuming at my roommate, confronting her tonight, and I feel guilty for wanting an evening to myself.').join() === `${R},permission_giving`);
ok('protective_not_punitive with rough_draft_first: both kept, open_a_hard_conversation goes', sel('Hard talk with dad Sunday, full of rage. I want him to suffer.').join() === `protective_not_punitive,${R}`);
ok('permission_giving with grieve_before_deciding: both kept, guess_then_check goes', sel('So hurt, going to break up with my girlfriend, and I feel guilty for wanting an evening to myself.').join() === 'permission_giving');
ok('two moves: nothing a row does not name is removed (the cap and order are unchanged)', sel('Heartbroken, want to cut my sister out, and I want her to suffer.').join() === 'protective_not_punitive,ask_for_what_you_want');

// ---- groups: the move group is never emptied by the rule; safety and resources are never touched
for (const c of MOVE_CASES) {
  const out = sel(c.prompt);
  ok(`${c.id}: the move group still holds its move, and no safety or resource module is in the selection`, out.some((id) => MODULE_GROUPS[id] === 'move' && id === c.module) && out.every((id) => MODULE_GROUPS[id] !== 'safety' && MODULE_GROUPS[id] !== 'resource'));
}
ok('a safety module beside a narrow move is kept', sel('Fuming at my roommate, confronting her tonight. I get panic attacks and flashbacks when she raises her voice.').includes('deep_fear_refer_out'));
ok('a resource module beside a narrow move is kept', sel('Fuming at my roommate, confronting her tonight. Is there a podcast with examples?').join() === `${R},podcast`);
ok('the lens group is emptied only where the dropped module was the only lens (grieve-before-deciding-1)', MOVE_CASES.every((c) => sel(c.prompt).filter((id) => MODULE_GROUPS[id] === 'lens').length === 0));
ok('with the lens group excluded the move is still chosen', selectModules([MOVE_CASES.find((c) => c.id === 'grieve-before-deciding-1')!.prompt], 3, ['lens']).join() === G);
ok('with the move group excluded nothing from the table comes back', selectModules(['Fuming at my roommate, confronting her tonight.'], 3, ['move']).join() === '');
