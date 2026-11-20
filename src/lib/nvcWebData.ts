// The web of connections between NVC concepts and the coach's lenses, moves, learning cards and word families (docs/nvc-icarus-web-scope.md).
// STRUCTURE ONLY: ids and typed edges. No framework text, no module wording and no card wording is here. Each edge carries a short reason id (`r.…`);
// what a reason says lives in a private review table outside the repository, so a wrong edge can be found by id and fixed without publishing why it exists.
// Pure data. Nothing here is sent anywhere, and nothing here is ever shown to a person.

export type NodeKind = 'concept' | 'lens' | 'safety' | 'move' | 'join' | 'question' | 'card' | 'core_need' | 'need' | 'feeling';

export type EdgeType =
  | 'often_under' //     concept -> lens: this kind of talk often sits under this pattern (a hint for review only; never adds a lens by itself)
  | 'pairs_with' //      concept -> move: this move suits this kind of talk
  | 'holds_back' //      lens|concept -> move|join|question|card: leave this out when the source applies
  | 'joins' //           concept|lens -> join: a join module needs BOTH its concept and its lens before it is suggested
  | 'asks_question' //   concept|lens -> question: the one question that fits, in rank order
  | 'offers_card' //     concept|lens -> card: a short read the page may offer, in rank order
  | 'needs_at_stake' //  lens -> core_need: which of the seven needs usually sit under this pattern
  | 'maps_to' //         core_need -> need: the families on the page that fit that core need
  | 'often_feels' //     lens -> feeling: which feeling families the page may open first (only when the person is stuck)
  | 'neighbors'; //      concept -> concept: easily mixed up, so one may stand in for the other when the first has nothing

export interface WebNode { id: string; kind: NodeKind; /** Part of the communal-needs layer (this project's own extension, not CNVC's): only returned when the context switches the layer on. */ layer?: 'communal'; /** Not yet tested on data: never returned by the selector. */ provisional?: boolean }
export interface WebEdge { from: string; to: string; type: EdgeType; /** Reason id: a key in the private review table. */ reason: string; /** Lower comes first among edges of one type from one source. */ rank: number }

const n = (kind: NodeKind, ...ids: string[]): WebNode[] => ids.map((id) => ({ id, kind }));

// ---------------------------------------------------------------- nodes
export const CONCEPTS = [
  'c.observation', // what happened, apart from what we made of it
  'c.feeling_thought', // a feeling word versus a thought dressed as one
  'c.need_strategy', // the need versus the one way of meeting it
  'c.request_demand', // a request versus a demand
  'c.enemy_image', // the other person turned into a type
  'c.protective_force', // protection without punishment
  'c.choice', // "have to" versus a choice with a need under it
  'c.empathy', // empathy versus sympathy or advice
  'c.self_empathy', // listening to oneself
  'c.appreciation', // specific thanks
  'c.honesty', // saying what is true for me, without the mask
  'c.met_needs', // what is already working
] as const;

/** The module ids that are lenses (internal readings of what is in the way). Must equal the lens group in coachModules.ts (tested). */
export const LENS_IDS = [
  'reserves', 'care_depleted', 'legitimacy', 'harm_named_as_intended', 'inward_turn', 'split_values', 'recurrence', 'frozen_system', 'systemic_scale', 'pressure',
  'over_smoothing', 'harm_named_as_unintended', 'unable_to_begin', 'backup', 'named_verdict', 'field_cost',
] as const;
export const SAFETY_IDS = ['deep_fear_refer_out'] as const;

/** The move ids (coachModules.ts, group 'move'). */
export const MOVE_IDS = [
  'answer_with_words', 'open_a_hard_conversation', 'ask_for_what_you_want', 'set_a_boundary', 'empathize_before_asking', 'say_the_real_feeling', 'read_a_silence',
  'reaction_as_information', 'closure_check', 'power_difference', 'offer_to_play_the_other', 'reframe_gently', 'explain_briefly', 'guess_then_check', 'permission_giving', 'ask_one_question',
] as const;

/** New private modules, each joining one concept to one lens in plain listening moves. Chosen only through the web, never by a phrase of their own. */
export const JOIN_IDS = [
  'web_believed_then_camera', 'web_word_for_the_empty', 'web_two_parts_two_needs', 'web_repeat_strategy', 'web_request_within_reach', 'web_boundary_not_request',
  'web_start_small_together', 'web_hear_the_inner_judge', 'web_care_for_the_carer', 'web_warmth_and_accounting', 'web_have_to_under_pressure', 'web_no_choice_no_cushion',
  'web_other_side_when_unintended', 'web_protect_without_punishing', 'web_specific_regard', 'web_what_still_works',
] as const;

/** The one question the coach may ask, as kinds. The wording is a short private module of the same id (`q_…`). */
export const QUESTION_IDS = ['q_camera', 'q_need_beneath', 'q_two_needs', 'q_met', 'q_request_room', 'q_smallest', 'q_who_shares', 'q_what_stung', 'q_cost_to_others'] as const;

/** Learning cards: the NVC-ideas drafts (idea-01 to idea-10), two existing approved connection cards, and the new draft series `web-01` to `web-09`. */
export const CARD_IDS = [
  'idea-01', 'idea-02', 'idea-03', 'idea-04', 'idea-05', 'idea-06', 'idea-07', 'idea-08', 'idea-09', 'idea-10', 'conn-01', 'conn-03',
  'web-01', 'web-02', 'web-03', 'web-04', 'web-05', 'web-06', 'web-07', 'web-08', 'web-09',
] as const;

export const CORE_NEEDS = ['core.safety', 'core.belonging', 'core.dignity', 'core.meaning', 'core.autonomy', 'core.pleasure', 'core.contribution'] as const;

/** Need families on the page (the phrase workbench's own lists: category id, family id). Checked against needFamilies.ts when that file is present. */
export const NEED_FAMILY_IDS = [
  'need.physical.basics', 'need.physical.moving', 'need.physical.safety',
  'need.connection.with', 'need.connection.seen', 'need.connection.count',
  'need.honesty.told', 'need.honesty.self', 'need.honesty.together',
  'need.play.light', 'need.play.wonder', 'need.play.enjoy',
  'need.peace.calm', 'need.peace.order', 'need.peace.harmony',
  'need.autonomy.say', 'need.autonomy.room', 'need.autonomy.pace',
  'need.meaning.purpose', 'need.meaning.grow', 'need.meaning.express',
] as const;
/** The communal-needs layer is this project's own extension (communalNeeds.ts; not CNVC's) and untested on data: the selector returns its families only when the context turns it on. */
export const COMMUNAL_LAYER = 'need.communal';
export const COMMUNAL_FAMILY_NODE_IDS = ['need.communal.fair', 'need.communal.say', 'need.communal.together', 'need.communal.safe', 'need.communal.lasting', 'need.communal.each-other'] as const;

/** Feeling families on the page, "when a need seems not met" side (feelingFamilies.ts). */
export const FEELING_FAMILY_IDS = [
  'feel.unmet.afraid', 'feel.unmet.tense', 'feel.unmet.angry', 'feel.unmet.sad', 'feel.unmet.hurt', 'feel.unmet.tired', 'feel.unmet.confused',
  'feel.unmet.ashamed', 'feel.unmet.apart', 'feel.unmet.uneasy', 'feel.unmet.longing',
] as const;

export const NODES: WebNode[] = [
  ...n('concept', ...CONCEPTS), ...n('lens', ...LENS_IDS), ...n('safety', ...SAFETY_IDS), ...n('move', ...MOVE_IDS), ...n('join', ...JOIN_IDS),
  ...n('question', ...QUESTION_IDS), ...n('card', ...CARD_IDS), ...n('core_need', ...CORE_NEEDS), ...n('need', ...NEED_FAMILY_IDS),
  { id: COMMUNAL_LAYER, kind: 'need', layer: 'communal' }, ...COMMUNAL_FAMILY_NODE_IDS.map((id): WebNode => ({ id, kind: 'need', layer: 'communal' })), ...n('feeling', ...FEELING_FAMILY_IDS),
];

// ---------------------------------------------------------------- edges
const E: WebEdge[] = [];
/** Adds edges of one type and reason from one source, ranked in the order given. */
const add = (type: EdgeType, reason: string, from: string, ...to: string[]): void => { to.forEach((t, i) => E.push({ from, to: t, type, reason, rank: i + 1 })); };

// join: a concept and a lens together (the join id says which; the concept and lens must both apply)
const JOINS: Array<[join: string, concept: string, lens: string]> = [
  ['web_believed_then_camera', 'c.observation', 'legitimacy'],
  ['web_word_for_the_empty', 'c.feeling_thought', 'reserves'],
  ['web_two_parts_two_needs', 'c.need_strategy', 'split_values'],
  ['web_repeat_strategy', 'c.need_strategy', 'recurrence'],
  ['web_request_within_reach', 'c.request_demand', 'frozen_system'],
  ['web_boundary_not_request', 'c.request_demand', 'harm_named_as_intended'],
  ['web_start_small_together', 'c.empathy', 'unable_to_begin'],
  ['web_hear_the_inner_judge', 'c.self_empathy', 'inward_turn'],
  ['web_care_for_the_carer', 'c.self_empathy', 'care_depleted'],
  ['web_warmth_and_accounting', 'c.honesty', 'over_smoothing'],
  ['web_have_to_under_pressure', 'c.choice', 'pressure'],
  ['web_no_choice_no_cushion', 'c.choice', 'backup'],
  ['web_other_side_when_unintended', 'c.enemy_image', 'harm_named_as_unintended'],
  ['web_protect_without_punishing', 'c.protective_force', 'harm_named_as_intended'],
  ['web_specific_regard', 'c.appreciation', 'named_verdict'],
  ['web_what_still_works', 'c.met_needs', 'recurrence'],
];
export const JOIN_PAIRS = JOINS;
for (const [j, c, l] of JOINS) { add('joins', 'r.join', c, j); add('joins', 'r.join', l, j); }

// concept -> move
add('pairs_with', 'r.obs-move', 'c.observation', 'reframe_gently', 'answer_with_words');
add('pairs_with', 'r.feel-move', 'c.feeling_thought', 'guess_then_check');
add('pairs_with', 'r.need-move', 'c.need_strategy', 'guess_then_check', 'explain_briefly');
add('pairs_with', 'r.req-move', 'c.request_demand', 'ask_for_what_you_want', 'answer_with_words');
add('pairs_with', 'r.enemy-move', 'c.enemy_image', 'empathize_before_asking', 'reframe_gently');
add('pairs_with', 'r.force-move', 'c.protective_force', 'set_a_boundary');
add('pairs_with', 'r.choice-move', 'c.choice', 'permission_giving', 'set_a_boundary');
add('pairs_with', 'r.emp-move', 'c.empathy', 'guess_then_check', 'empathize_before_asking');
add('pairs_with', 'r.self-move', 'c.self_empathy', 'permission_giving', 'guess_then_check');
add('pairs_with', 'r.honest-move', 'c.honesty', 'say_the_real_feeling', 'open_a_hard_conversation', 'closure_check');
add('pairs_with', 'r.met-move', 'c.met_needs', 'guess_then_check');

// concept -> lens hints (review table and log only: a hint never adds a lens to what the model reads)
add('often_under', 'r.hint-legit', 'c.observation', 'legitimacy');
add('often_under', 'r.hint-recur', 'c.need_strategy', 'recurrence', 'split_values');
add('often_under', 'r.hint-inward', 'c.self_empathy', 'inward_turn');
add('often_under', 'r.hint-pressure', 'c.choice', 'pressure', 'backup');
add('often_under', 'r.hint-legit', 'c.empathy', 'legitimacy', 'reserves');
add('often_under', 'r.hint-intent', 'c.enemy_image', 'harm_named_as_intended', 'harm_named_as_unintended');
add('often_under', 'r.hint-smooth', 'c.honesty', 'over_smoothing');
add('often_under', 'r.hint-verdict', 'c.appreciation', 'named_verdict');
add('often_under', 'r.hint-intent', 'c.protective_force', 'harm_named_as_intended');
add('often_under', 'r.hint-room', 'c.request_demand', 'frozen_system', 'harm_named_as_intended');

// concept <-> concept
add('neighbors', 'r.near-fs', 'c.feeling_thought', 'c.observation');
add('neighbors', 'r.near-sn', 'c.need_strategy', 'c.request_demand');
add('neighbors', 'r.near-rn', 'c.request_demand', 'c.need_strategy');
add('neighbors', 'r.near-ee', 'c.empathy', 'c.self_empathy');
add('neighbors', 'r.near-ee', 'c.self_empathy', 'c.empathy');
add('neighbors', 'r.near-oe', 'c.observation', 'c.enemy_image');
add('neighbors', 'r.near-oe', 'c.enemy_image', 'c.observation');
add('neighbors', 'r.near-ch', 'c.choice', 'c.need_strategy');

// asks_question: the one question that fits (concept first, then lens)
add('asks_question', 'r.q-camera', 'c.observation', 'q_camera');
add('asks_question', 'r.q-need', 'c.need_strategy', 'q_need_beneath');
add('asks_question', 'r.q-need', 'c.feeling_thought', 'q_need_beneath');
add('asks_question', 'r.q-request', 'c.request_demand', 'q_request_room');
add('asks_question', 'r.q-met', 'c.met_needs', 'q_met');
add('asks_question', 'r.q-two', 'split_values', 'q_two_needs');
add('asks_question', 'r.q-small', 'unable_to_begin', 'q_smallest');
add('asks_question', 'r.q-who', 'pressure', 'q_who_shares');
add('asks_question', 'r.q-who', 'systemic_scale', 'q_who_shares');
add('asks_question', 'r.q-who', 'frozen_system', 'q_who_shares');
add('asks_question', 'r.q-stung', 'named_verdict', 'q_what_stung');
add('asks_question', 'r.q-cost', 'field_cost', 'q_cost_to_others');
add('asks_question', 'r.q-met', 'recurrence', 'q_met');

// offers_card: a short read the page may offer (the page decides; the model never sees the card)
add('offers_card', 'r.card-obs', 'c.observation', 'idea-02', 'web-01');
add('offers_card', 'r.card-feel', 'c.feeling_thought', 'idea-01', 'web-02');
add('offers_card', 'r.card-need', 'c.need_strategy', 'idea-03', 'web-03', 'web-04');
add('offers_card', 'r.card-req', 'c.request_demand', 'idea-04', 'web-05');
add('offers_card', 'r.card-enemy', 'c.enemy_image', 'idea-05', 'conn-01');
add('offers_card', 'r.card-force', 'c.protective_force', 'idea-06');
add('offers_card', 'r.card-choice', 'c.choice', 'idea-07', 'web-08');
add('offers_card', 'r.card-emp', 'c.empathy', 'idea-08', 'conn-03');
add('offers_card', 'r.card-self', 'c.self_empathy', 'idea-09', 'web-06');
add('offers_card', 'r.card-thanks', 'c.appreciation', 'idea-10', 'web-07');
add('offers_card', 'r.card-honest', 'c.honesty', 'web-09');
add('offers_card', 'r.card-lens', 'legitimacy', 'web-01');
add('offers_card', 'r.card-lens', 'reserves', 'web-02');
add('offers_card', 'r.card-lens', 'split_values', 'web-03');
add('offers_card', 'r.card-lens', 'recurrence', 'web-04');
add('offers_card', 'r.card-lens', 'frozen_system', 'web-05');
add('offers_card', 'r.card-lens', 'care_depleted', 'web-06');
add('offers_card', 'r.card-lens', 'named_verdict', 'web-07');
add('offers_card', 'r.card-lens', 'pressure', 'web-08');
add('offers_card', 'r.card-lens', 'backup', 'web-08');
add('offers_card', 'r.card-lens', 'over_smoothing', 'web-09');

// holds_back
// 1. The same rules as SUPPRESS in coachModules.ts, copied as data (tested equal: the code stays the authority, the data may never say less).
const DEPLETED_MOVES = ['ask_one_question', 'answer_with_words', 'open_a_hard_conversation', 'ask_for_what_you_want', 'empathize_before_asking', 'offer_to_play_the_other', 'reaction_as_information', 'set_a_boundary', 'say_the_real_feeling', 'read_a_silence', 'closure_check', 'power_difference'];
const INTENDED_MOVES = ['empathize_before_asking', 'open_a_hard_conversation', 'ask_for_what_you_want', 'offer_to_play_the_other', 'reaction_as_information', 'reframe_gently', 'closure_check'];
add('holds_back', 'r.hold-depleted', 'reserves', ...DEPLETED_MOVES);
add('holds_back', 'r.hold-depleted', 'care_depleted', ...DEPLETED_MOVES);
add('holds_back', 'r.hold-intended', 'harm_named_as_intended', ...INTENDED_MOVES);
// 2. The web's own: with depleted reserves nothing that asks more of them, so no join except the two that are rest only, no question, and no card except the two written for rest.
const REST_JOINS = ['web_word_for_the_empty', 'web_care_for_the_carer'];
const NON_REST_JOINS = JOIN_IDS.filter((j) => !REST_JOINS.includes(j));
const REST_CARDS = ['web-02', 'web-06'];
const NON_REST_CARDS = CARD_IDS.filter((c) => !REST_CARDS.includes(c));
for (const lens of ['reserves', 'care_depleted']) {
  add('holds_back', 'r.hold-depleted-web', lens, ...NON_REST_JOINS, ...QUESTION_IDS, ...NON_REST_CARDS);
}
// With harm named as intended: no perspective-taking toward the other party, no asking what to request of them, no warm reconnection joins.
add('holds_back', 'r.hold-intended-web', 'harm_named_as_intended', 'web_other_side_when_unintended', 'web_request_within_reach', 'web_warmth_and_accounting', 'q_request_room', 'q_cost_to_others', 'conn-01', 'idea-05');
// With harm named as unintended: the joins written for deliberate harm do not apply.
add('holds_back', 'r.hold-unintended-web', 'harm_named_as_unintended', 'web_boundary_not_request', 'web_protect_without_punishing');
// Someone who has just said they are not believed is not cross-examined first: the camera question waits.
add('holds_back', 'r.hold-legit-camera', 'legitimacy', 'q_camera');
// A fixed story about the other person is not made smaller first, before the person has been heard (the reframe also waits for message two in coachModules.ts).
add('holds_back', 'r.hold-enemy-reframe', 'c.enemy_image', 'q_camera');

// needs_at_stake: lens -> the seven needs that usually sit under it (the owner's lens table, read as "often", never as a finding about a person)
const NEEDS: Array<[lens: string, needs: string[]]> = [
  ['reserves', ['core.safety', 'core.dignity', 'core.autonomy']], ['care_depleted', ['core.safety', 'core.dignity', 'core.autonomy']],
  ['legitimacy', ['core.dignity', 'core.belonging']], ['harm_named_as_intended', ['core.safety', 'core.autonomy']], ['inward_turn', ['core.dignity', 'core.belonging']],
  ['split_values', ['core.safety', 'core.belonging', 'core.dignity']], ['recurrence', ['core.dignity', 'core.belonging']], ['frozen_system', ['core.autonomy', 'core.meaning']],
  ['systemic_scale', ['core.meaning', 'core.contribution']], ['pressure', ['core.safety', 'core.autonomy']], ['over_smoothing', ['core.dignity', 'core.belonging']],
  ['harm_named_as_unintended', ['core.belonging', 'core.dignity']], ['unable_to_begin', ['core.autonomy', 'core.meaning']], ['backup', ['core.safety', 'core.autonomy']],
  ['named_verdict', ['core.dignity', 'core.belonging']], ['field_cost', ['core.contribution', 'core.belonging']],
];
for (const [lens, needs] of NEEDS) add('needs_at_stake', 'r.needs-lens', lens, ...needs);

// maps_to: each of the seven to the families on the page that fit it (the communal families are this project's own layer, returned only when switched on)
add('maps_to', 'r.map-safety', 'core.safety', 'need.physical.safety', 'need.peace.calm', 'need.connection.count', 'need.communal.safe');
add('maps_to', 'r.map-belonging', 'core.belonging', 'need.connection.with', 'need.connection.count', 'need.communal.together', 'need.communal.each-other');
add('maps_to', 'r.map-dignity', 'core.dignity', 'need.connection.seen', 'need.autonomy.say', 'need.honesty.self', 'need.communal.fair');
add('maps_to', 'r.map-meaning', 'core.meaning', 'need.meaning.purpose', 'need.meaning.express', 'need.meaning.grow', 'need.communal.lasting');
add('maps_to', 'r.map-autonomy', 'core.autonomy', 'need.autonomy.room', 'need.autonomy.say', 'need.autonomy.pace', 'need.communal.say');
add('maps_to', 'r.map-pleasure', 'core.pleasure', 'need.play.enjoy', 'need.play.light', 'need.physical.moving');
add('maps_to', 'r.map-contribution', 'core.contribution', 'need.meaning.purpose', 'need.communal.lasting', 'need.communal.each-other', 'need.communal.say');

// often_feels: lens -> feeling families the page may open first when the person says they are stuck
const FEELS: Array<[lens: string, feelings: string[]]> = [
  ['reserves', ['feel.unmet.tired']], ['care_depleted', ['feel.unmet.tired', 'feel.unmet.sad']], ['legitimacy', ['feel.unmet.hurt', 'feel.unmet.angry']],
  ['harm_named_as_intended', ['feel.unmet.afraid', 'feel.unmet.angry']], ['inward_turn', ['feel.unmet.ashamed', 'feel.unmet.sad']], ['split_values', ['feel.unmet.confused', 'feel.unmet.uneasy']],
  ['recurrence', ['feel.unmet.tired', 'feel.unmet.angry']], ['frozen_system', ['feel.unmet.apart', 'feel.unmet.tired']], ['systemic_scale', ['feel.unmet.apart', 'feel.unmet.uneasy']],
  ['pressure', ['feel.unmet.tense', 'feel.unmet.afraid']], ['over_smoothing', ['feel.unmet.uneasy', 'feel.unmet.hurt']], ['harm_named_as_unintended', ['feel.unmet.hurt', 'feel.unmet.sad']],
  ['unable_to_begin', ['feel.unmet.tense', 'feel.unmet.confused']], ['backup', ['feel.unmet.afraid', 'feel.unmet.tense']], ['named_verdict', ['feel.unmet.ashamed', 'feel.unmet.hurt']],
  ['field_cost', ['feel.unmet.uneasy', 'feel.unmet.longing']],
];
for (const [lens, feelings] of FEELS) add('often_feels', 'r.feel-lens', lens, ...feelings);

export const EDGES: WebEdge[] = E;
