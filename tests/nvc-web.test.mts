// The web of connections between NVC concepts and the coach's lenses, moves, cards and questions (docs/nvc-icarus-web-scope.md). Pure data and a pure selector:
// the tests check the data is sound, that the guards and the existing suppress rules always win, that nothing outside the known ids can come out, and that
// nothing a person sees names a lens. No module wording is here or needed: only ids.
import { existsSync, readFileSync } from 'node:fs';
import { ARC_EXCLUDED_MODULES, MODULE_GROUPS, MODULE_IDS, SUPPRESS, selectModules } from '../src/lib/coachModules.ts';
import {
  CARD_IDS, COMMUNAL_FAMILY_NODE_IDS, COMMUNAL_LAYER, CONCEPTS, EDGES, JOIN_IDS, JOIN_PAIRS, LENS_IDS, MOVE_IDS, NODES, QUESTION_IDS, SAFETY_IDS, NEED_FAMILY_IDS, FEELING_FAMILY_IDS,
} from '../src/lib/nvcWebData.ts';
import { GUARD_KEYS, KNOWN, anyGuard, detectConcepts, edgesFrom, notesIds, pageView, suggest, suggestFromText, webProblems, type WebSuggestion } from '../src/lib/nvcWeb.ts';
import { COMMUNAL_FAMILIES, COMMUNAL_FAMILY_IDS, COMMUNAL_LABEL } from '../src/lib/communalNeeds.ts';
import { ok } from './helpers.mts';

const ALL_CARDS = [...CARD_IDS];

// ---- the data is sound
ok('the data is well formed (no unknown node, no duplicate, every edge has a reason id)', webProblems().length === 0, webProblems().join('; '));
ok('the lens ids are exactly the lens modules in coachModules.ts', JSON.stringify([...LENS_IDS].sort()) === JSON.stringify(MODULE_IDS.filter((i) => MODULE_GROUPS[i] === 'lens').sort()));
ok('the safety ids are exactly the safety modules', JSON.stringify([...SAFETY_IDS].sort()) === JSON.stringify(MODULE_IDS.filter((i) => MODULE_GROUPS[i] === 'safety').sort()));
ok('the move ids are exactly the move modules', JSON.stringify([...MOVE_IDS].sort()) === JSON.stringify(MODULE_IDS.filter((i) => MODULE_GROUPS[i] === 'move').sort()));
ok('the new joined modules and question kinds do not collide with any existing module id', [...JOIN_IDS, ...QUESTION_IDS].every((i) => !MODULE_IDS.includes(i)));
ok('every join names a real concept and a real lens, and both edges to it exist', JOIN_PAIRS.every(([j, c, l]) => (CONCEPTS as readonly string[]).includes(c) && (LENS_IDS as readonly string[]).includes(l)
  && edgesFrom(c, 'joins').some((e) => e.to === j) && edgesFrom(l, 'joins').some((e) => e.to === j)) && JOIN_PAIRS.length === JOIN_IDS.length);
ok('every concept has a card or a move, and a question or a hint', CONCEPTS.every((c) => (edgesFrom(c, 'offers_card').length || edgesFrom(c, 'pairs_with').length) && (edgesFrom(c, 'asks_question').length || edgesFrom(c, 'often_under').length)));
ok('card ids have the shape the card reader accepts (letters, a dash, two digits)', CARD_IDS.every((c) => /^[a-z]+-\d\d$/.test(c)));
ok('no id in the public data uses a framework label', NODES.every((n) => !/icarus|volt|bottleneck|theorem|omega/i.test(n.id)) && EDGES.every((e) => !/icarus|volt|bottleneck|theorem|omega/i.test(e.reason)));
ok('edge reasons are ids only, no sentences', EDGES.every((e) => /^r\.[a-z0-9-]+$/.test(e.reason)));
ok('the data holds back at least everything the code holds back (SUPPRESS)', Object.entries(SUPPRESS).every(([lens, moves]) => { const have = new Set(edgesFrom(lens, 'holds_back').map((e) => e.to)); return moves.every((m) => have.has(m)); }));
ok('the arc-excluded modules are known moves', ARC_EXCLUDED_MODULES.every((m) => (MOVE_IDS as readonly string[]).includes(m)));
ok('the communal layer is marked as a layer of its own', NODES.find((n) => n.id === COMMUNAL_LAYER)?.layer === 'communal' && COMMUNAL_FAMILY_NODE_IDS.every((i) => NODES.find((n) => n.id === i)?.layer === 'communal'));
ok('the web\'s communal family ids are exactly the families in communalNeeds.ts', JSON.stringify([...COMMUNAL_FAMILY_NODE_IDS].sort()) === JSON.stringify([...COMMUNAL_FAMILY_IDS].sort()));
ok('every communal family has four to six words, each with a plain one-line meaning', COMMUNAL_FAMILIES.every((f) => f.words.length >= 4 && f.words.length <= 6 && f.words.every((w) => w.word && w.def.length > 10 && w.def.length < 90)));
ok('the communal words carry no dash, exclamation mark or banned word', COMMUNAL_FAMILIES.every((f) => f.words.every((w) => !/[—–!]/.test(w.word + w.def) && !/\b(journey|unlock|transform|hack|optimi[sz]e|heal|fix|wellness|anonymous|secure)\w*/i.test(w.word + w.def))));
ok('the communal label says it is this project\'s own and not CNVC\'s', /this project's own/.test(COMMUNAL_LABEL) && /not part of the CNVC inventory/.test(COMMUNAL_LABEL));
ok('no communal word is repeated across families', (() => { const all = COMMUNAL_FAMILIES.flatMap((f) => f.words.map((w) => w.word)); return new Set(all).size === all.length; })());

// ---- the phrase workbench's own lists, when this branch has them (they are on claude/phrase-workbench-scope-cc19cc until merged)
if (existsSync('src/lib/needFamilies.ts') && existsSync('src/lib/feelingFamilies.ts')) {
  const need = readFileSync('src/lib/needFamilies.ts', 'utf8');
  const feel = readFileSync('src/lib/feelingFamilies.ts', 'utf8');
  const cats = [...need.matchAll(/^\s{4}id: '([a-z]+)',$/gm)].map((m) => m[1]);
  let cat = '';
  const have = new Set<string>();
  for (const line of need.split('\n')) {
    const c = /^\s{4}id: '([a-z]+)',$/.exec(line); if (c) cat = c[1];
    const f = /^\s{6}f\('([a-z]+)'/.exec(line); if (f && cat) have.add(`need.${cat}.${f[1]}`);
  }
  ok('every need family id in the web exists in needFamilies.ts', NEED_FAMILY_IDS.every((i) => have.has(i)), `categories ${cats.join(',')}`);
  let side = '';
  const haveF = new Set<string>();
  for (const line of feel.split('\n')) {
    const s = /^\s{4}id: '(met|unmet)',$/.exec(line); if (s) side = s[1];
    const f = /^\s{6}f\('([a-z]+)'/.exec(line); if (f && side) haveF.add(`feel.${side}.${f[1]}`);
  }
  ok('every feeling family id in the web exists in feelingFamilies.ts', FEELING_FAMILY_IDS.every((i) => haveF.has(i)));
} else {
  ok('(workbench lists not on this branch yet: the cross-check runs once they are)', true);
}

// ---- concept detection
const concept = (t: string): string[] => detectConcepts([t]);
ok('detects a judgment dressed as a fact', concept('She is so rude and always interrupts me').includes('c.observation'));
ok('detects a thought dressed as a feeling', concept('I feel like nobody listens to me').includes('c.feeling_thought'));
ok('detects a strategy named as a need', concept('I need him to apologize, that is the only way').includes('c.need_strategy'));
ok('detects a demand', concept('I want to make him change or else').includes('c.request_demand'));
ok('detects "have to"', concept('I have to go every Sunday, I have no choice').includes('c.choice'));
ok('detects wanting to be heard', concept('I just want to be heard, I do not want advice').includes('c.empathy'));
ok('detects self-blame language', concept('I keep blaming myself, so stupid of me').includes('c.self_empathy'));
ok('detects thanks', concept('I want to thank my sister for last week').includes('c.appreciation'));
ok('detects the mask', concept("I never told her, I just bite my tongue").includes('c.honesty'));
ok('a message about the weather has no concept', concept('The weather has been grey this week').length === 0);
ok('only the latest message is read for concepts', detectConcepts(['She is so rude', 'The weather has been grey']).length === 0);

// ---- the guards always win
const sampleLenses = ['legitimacy', 'recurrence'];
const sampleConcepts = ['c.observation', 'c.need_strategy'];
for (const g of GUARD_KEYS) {
  const s = suggest(sampleConcepts, sampleLenses, { guards: { [g]: true }, availableCards: ALL_CARDS, stuck: true });
  ok(`guard "${g}": nothing at all comes back`, s.silent && s.why === 'guard' && !s.lenses.length && !s.moves.length && !s.joins.length && !s.question && !s.cards.length && !s.openFamilies.length && !s.hints.length);
}
ok('anyGuard is false with no guard and true with one', !anyGuard({}) && !anyGuard(undefined) && anyGuard({ crisis: true }));
ok('the crisis, hostility and softened tiers each get nothing through the full pipeline', ['crisis', 'hostility', 'softened'].every((g) => {
  const s = suggestFromText(['She is so rude, I feel like nobody listens'], { guards: { [g]: true }, availableCards: ALL_CARDS });
  return s.silent && notesIds(s).length === 0 && pageView(s).cards.length === 0;
}));
ok('a safety module (deep fear: refer out) silences the web', suggest(['c.observation'], ['deep_fear_refer_out'], { availableCards: ALL_CARDS }).silent);
ok('and so does the same module found through the full pipeline', suggestFromText(['I get flashbacks and she is so rude'], { availableCards: ALL_CARDS }).silent);

// ---- the existing suppress rules and the arc always win
const depleted = suggest(['c.observation', 'c.request_demand', 'c.self_empathy', 'c.feeling_thought'], ['reserves'], { availableCards: ALL_CARDS });
ok('depleted reserves: none of the held-back moves, no question', depleted.moves.every((m) => !SUPPRESS.reserves.includes(m.id)) && depleted.question === null);
ok('depleted reserves: only rest-only joins and cards are allowed', depleted.joins.every((j) => ['web_word_for_the_empty', 'web_care_for_the_carer'].includes(j.id)) && depleted.cards.every((c) => ['web-02', 'web-06'].includes(c.id)));
ok('depleted reserves with a feeling-as-thought: the rest-only join is the one chosen', depleted.joins[0]?.id === 'web_word_for_the_empty');
const carer = suggest(['c.self_empathy'], ['care_depleted'], { availableCards: ALL_CARDS });
ok('caring with nothing left: the carer join, no question, only rest cards', carer.joins[0]?.id === 'web_care_for_the_carer' && carer.question === null && carer.cards.every((c) => ['web-02', 'web-06'].includes(c.id)));
const intended = suggest(['c.enemy_image', 'c.request_demand', 'c.protective_force'], ['harm_named_as_intended'], { availableCards: ALL_CARDS });
ok('harm named as intended: no perspective-taking join, no request question, no reframe or empathy-first move', !intended.joins.some((j) => j.id === 'web_other_side_when_unintended') && intended.question?.id !== 'q_request_room'
  && intended.moves.every((m) => !SUPPRESS.harm_named_as_intended.includes(m.id)));
ok('harm named as intended: protection without punishing is what is joined for that concept', suggest(['c.protective_force'], ['harm_named_as_intended']).joins[0]?.id === 'web_protect_without_punishing' && suggest(['c.request_demand'], ['harm_named_as_intended']).joins[0]?.id === 'web_boundary_not_request');
ok('harm named as intended: the enemy-image cards are held back', intended.cards.every((c) => !['conn-01', 'idea-05'].includes(c.id)));
const unintended = suggest(['c.enemy_image', 'c.protective_force', 'c.request_demand'], ['harm_named_as_unintended'], { availableCards: ALL_CARDS });
ok('harm named as unintended: the deliberate-harm joins are held back', unintended.joins.every((j) => !['web_boundary_not_request', 'web_protect_without_punishing'].includes(j.id)) && unintended.joins[0]?.id === 'web_other_side_when_unintended');
const believed = suggest(['c.observation'], ['legitimacy'], { availableCards: ALL_CARDS });
ok('someone not believed: the camera question waits, and the join about being believed comes first', believed.question === null || believed.question.id !== 'q_camera');
ok('someone not believed: the join is the believed-then-camera one', believed.joins[0]?.id === 'web_believed_then_camera');
const arc = suggest(['c.feeling_thought', 'c.need_strategy', 'c.met_needs'], ['recurrence'], { arcOn: true, availableCards: ALL_CARDS });
ok('with the practice arc on: no guess-then-check, no question of the web, because the arc has its own', arc.moves.every((m) => !(ARC_EXCLUDED_MODULES as readonly string[]).includes(m.id)) && arc.question === null);
const noArc = suggest(['c.feeling_thought'], [], { availableCards: ALL_CARDS });
ok('without the arc, a feeling dressed as a thought suggests guess-then-check', noArc.moves.some((m) => m.id === 'guess_then_check'));
ok('a move the base selection already chose is not suggested again', !suggest(['c.feeling_thought'], [], { base: ['guess_then_check'] }).moves.some((m) => m.id === 'guess_then_check'));
ok('nothing the web leaves out for a hold-back is returned', ['reserves', 'harm_named_as_intended'].every((l) => { const s = suggest(CONCEPTS as unknown as string[], [l], { availableCards: ALL_CARDS, stuck: true }); const ids = new Set([...s.moves, ...s.joins, ...s.cards, ...(s.question ? [s.question] : [])].map((r) => r.id)); return edgesFrom(l, 'holds_back').every((e) => !ids.has(e.to)); }));

// ---- joins need both halves, and one at most
ok('a join needs its concept AND its lens', suggest(['c.observation'], [], {}).joins.length === 0 && suggest([], ['legitimacy'], {}).joins.length === 0 && suggest(['c.observation'], ['legitimacy'], {}).joins.length === 1);
ok('at most one join, two moves, two cards and one question come back', (() => { const s = suggest(CONCEPTS as unknown as string[], ['recurrence', 'split_values'], { availableCards: ALL_CARDS }); return s.joins.length <= 1 && s.moves.length <= 2 && s.cards.length <= 2; })());
ok('the ids that may reach the notes are at most two (one join and one question)', notesIds(suggest(sampleConcepts, ['recurrence', 'split_values'], { availableCards: ALL_CARDS })).length <= 2);

// ---- cards: only built ones, never twice
ok('with no cards available, none is returned', suggest(['c.observation'], ['legitimacy'], { availableCards: [] }).cards.length === 0 && suggest(['c.observation'], ['legitimacy']).cards.length === 0);
ok('only an available card is returned', suggest(['c.observation'], ['legitimacy'], { availableCards: ['idea-02'] }).cards.map((c) => c.id).join() === 'idea-02');
ok('a card already offered is not offered again', !suggest(['c.observation'], ['legitimacy'], { availableCards: ALL_CARDS, offeredCards: ['idea-02'] }).cards.some((c) => c.id === 'idea-02'));
ok('an id that is not a known card is dropped even if it is "available"', suggest(['c.observation'], [], { availableCards: ['not-a-card', 'idea-02'] }).cards.every((c) => KNOWN.cards.has(c.id)));
ok('maxCards is respected', suggest(['c.need_strategy'], [], { availableCards: ALL_CARDS, maxCards: 1 }).cards.length === 1);
ok('a neighbouring concept stands in when the first has no card available', suggest(['c.feeling_thought'], [], { availableCards: ['idea-02'] }).cards.map((c) => c.id).join() === 'idea-02');

// ---- word families: only when stuck, never the provisional layer
const notStuck = suggest([], ['reserves', 'legitimacy'], {});
const stuck = suggest([], ['reserves', 'legitimacy'], { stuck: true });
ok('no word family is suggested unless the person is stuck', notStuck.openFamilies.length === 0 && stuck.openFamilies.length > 0 && stuck.openFamilies.length <= 3);
ok('communal families are never returned unless the layer is switched on', LENS_IDS.every((l) => !suggest([], [l], { stuck: true }).openFamilies.some((f) => f.id.startsWith('need.communal'))));
const comm = suggest([], ['systemic_scale', 'frozen_system'], { stuck: true, communal: true });
ok('with the layer on, a stuck person facing something bigger than themselves is offered a communal family, and it is a known one', comm.openFamilies.some((f) => f.id.startsWith('need.communal')) && comm.openFamilies.every((f) => !f.id.startsWith('need.communal') || (COMMUNAL_FAMILY_IDS as string[]).includes(f.id)));
ok('with the layer on but the person not stuck, still nothing', suggest([], ['systemic_scale'], { communal: true }).openFamilies.length === 0);
ok('with the layer on, the guards still silence it', suggest([], ['systemic_scale'], { communal: true, stuck: true, guards: { crisis: true } }).openFamilies.length === 0);
ok('the communal bare category node is never returned', LENS_IDS.every((l) => !suggest([], [l], { stuck: true, communal: true }).openFamilies.some((f) => f.id === COMMUNAL_LAYER)));

// ---- nothing outside the known ids, ever, across many messages
const MESSAGES = [
  "I'm exhausted and nothing left to give. She never listens, she is so rude.", 'I feel like nobody listens to me. Same fight again and again.', 'I have to take the job, I have no choice, we have no savings.',
  'He did it on purpose, I need him to apologize. I want to make him stop or else.', 'She did not mean it, it was an oversight, but I feel so hurt. I never told her.',
  'Part of me wants to leave, part wants to stay. I just want to be heard.', 'I was always told I could not sing and it still stings. I want to thank my teacher.',
  "I'm caring for my mother and I'm drained. I keep blaming myself.", "Nothing ever changes no matter what I do, it's systemic.", 'I am at my limit, about to quit, I have to hold it in.',
  'We always make up and move on but it keeps happening. I want to be honest with him.', 'Should I take the job in another city? My partner would have to move.',
  'I need to protect my kids, I want to stand up to him, he is the problem.', 'I know what to say but I freeze, I do not know where to start.', 'hello', 'I feel lost',
  'What is a need? Can you explain what NVC means?', 'How do I tell my sister I need space? She keeps yelling at me.', 'One good thing today, a bright spot at work.',
];
const seen: { s: WebSuggestion; arc: boolean }[] = [];
for (const m of MESSAGES) for (const arcOn of [false, true]) for (const stuckNow of [false, true]) for (const communal of [false, true]) seen.push({ s: suggestFromText([m], { arcOn, stuck: stuckNow, communal, availableCards: ALL_CARDS }), arc: arcOn });
const idsOf = (s: WebSuggestion): string[] => [...s.lenses, ...s.moves, ...s.joins, ...(s.question ? [s.question] : []), ...s.cards, ...s.openFamilies, ...s.hints].map((r) => r.id);
const known = new Set<string>([...KNOWN.modules, ...KNOWN.cards, ...NEED_FAMILY_IDS, ...COMMUNAL_FAMILY_IDS, ...FEELING_FAMILY_IDS]);
ok('across many messages, every returned id is a known module, question, card or family id', seen.every(({ s }) => idsOf(s).every((i) => known.has(i))));
ok('across many messages, every module id returned is a real module or a registered join or question', seen.every(({ s }) => [...s.lenses, ...s.moves, ...s.joins].every((r) => MODULE_IDS.includes(r.id) || (JOIN_IDS as readonly string[]).includes(r.id))));
ok('across many messages with the arc on, the arc-excluded modules never appear', seen.filter((x) => x.arc).every(({ s }) => idsOf(s).every((i) => !(ARC_EXCLUDED_MODULES as readonly string[]).includes(i))));
ok('across many messages, a join is always one of the registered joins and always has both halves in its reasons', seen.every(({ s }) => s.joins.every((j) => (JOIN_IDS as readonly string[]).includes(j.id) && j.because.includes('r.join'))));
ok('across many messages, every returned item carries at least one reason id', seen.every(({ s }) => [...s.lenses, ...s.moves, ...s.joins, ...(s.question ? [s.question] : []), ...s.cards, ...s.openFamilies, ...s.hints].every((r) => r.because.length > 0 && r.because.every((b) => /^r\.[a-z0-9-]+$/.test(b)))));
ok('across many messages, the web never returns a lens that the phrase matching did not find', MESSAGES.every((m) => { const found = new Set(selectModules([m], 99)); return suggestFromText([m]).lenses.every((l) => found.has(l.id)); }));
ok('across many messages, the suggestion has no number in it (no score)', seen.every(({ s }) => !/"(score|weight|rank|confidence|probability)"/i.test(JSON.stringify(s))));
ok('the selector is deterministic', JSON.stringify(suggestFromText([MESSAGES[0]], { availableCards: ALL_CARDS })) === JSON.stringify(suggestFromText([MESSAGES[0]], { availableCards: ALL_CARDS })));

// ---- nothing a person sees names a lens
const LENS_AND_MODULE_IDS = new Set<string>([...LENS_IDS, ...SAFETY_IDS, ...MOVE_IDS, ...JOIN_IDS, ...QUESTION_IDS]);
ok('what the page may see holds only card ids and word-family ids', seen.every(({ s }) => { const v = pageView(s); return Object.keys(v).sort().join() === 'cards,openFamilies' && v.cards.every((c) => KNOWN.cards.has(c)) && v.openFamilies.every((f) => /^(need|feel)\./.test(f)); }));
ok('what the page may see never contains a lens, move, join or question id', seen.every(({ s }) => { const v = JSON.stringify(pageView(s)); return [...LENS_AND_MODULE_IDS].every((id) => !v.includes(`"${id}"`)); }));
ok('no card id looks like a lens or a framework label', CARD_IDS.every((c) => !LENS_AND_MODULE_IDS.has(c) && !/icarus|volt/i.test(c)));
ok('the web file holds no person-facing prose: no data string is longer than 40 characters', NODES.every((n) => n.id.length <= 40) && EDGES.every((e) => e.reason.length <= 40));
ok('the unknown-input paths are safe: empty input, unknown ids, junk', (() => {
  const a = suggest([], []); const b = suggest(['c.not_real', 'x'], ['not_a_lens', 'c.observation']); const c = suggestFromText([]);
  return !a.silent && idsOf(a).length === 0 && idsOf(b).length === 0 && !c.silent && idsOf(c).length === 0;
})());

// ---- checking a private set that carries the web's modules (made-up text: the real wording is private)
import { QUESTION_MAX, JOIN_MAX, webSetProblems } from '../src/lib/nvcWeb.ts';
const fake = (join = 'x'.repeat(400), q = 'Ask once, plainly? Wait.'): { core: string; modules: Record<string, string> } => ({
  core: 'c'.repeat(3500),
  modules: { ...Object.fromEntries(MODULE_IDS.map((i) => [i, 'm'.repeat(800)])), ...Object.fromEntries(JOIN_IDS.map((i) => [i, join])), ...Object.fromEntries(QUESTION_IDS.map((i) => [i, q])) },
});
ok('a complete made-up set with the web modules has no problems', webSetProblems(fake()).length === 0, webSetProblems(fake()).join('; '));
ok('a joined module with no text is reported', webSetProblems({ ...fake(), modules: Object.fromEntries(Object.entries(fake().modules).filter(([k]) => k !== 'web_what_still_works')) }).some((p) => p.includes('missing text: web_what_still_works')));
ok('a joined module that is too short or too long is reported', webSetProblems(fake('x'.repeat(100))).some((p) => p.includes('characters (300 to')) && webSetProblems(fake('x'.repeat(JOIN_MAX + 1))).length > 0);
ok('a question over its length is reported', webSetProblems(fake(undefined, 'q'.repeat(QUESTION_MAX + 1))).some((p) => p.includes('up to')));
ok('a question that carries two questions is reported', webSetProblems(fake(undefined, 'One? Two? Three?')).some((p) => p.includes('more than its one question')));
ok('a framework word in a joined module is reported', webSetProblems(fake('Listen for the bottleneck in what they say. '.repeat(10))).some((p) => p.includes('"bottleneck"')));
ok('a worst case over the cap is reported', webSetProblems({ ...fake(), core: 'c'.repeat(12000) }).some((p) => p.includes('exceeds')));
ok('an unknown module id is reported', webSetProblems({ ...fake(), modules: { ...fake().modules, invented_one: 'x' } }).some((p) => p.includes('unknown module id invented_one')));
