// Reads the web of connections (nvcWebData.ts) and, given what a message is about, suggests lenses, moves, joined modules, one question and learning cards
// (docs/nvc-icarus-web-scope.md). PURE and, for now, UNUSED by any request path: nothing here changes what the coach or the page does.
//
// What it will never do (all tested):
//  - add to or override a guard: if any guard has fired, or the message was a crisis or hostility or the softened tier, it returns nothing at all;
//  - return an id that is not a known module, question or card id, or a provisional node;
//  - return a move that coachModules.ts holds back (SUPPRESS) or that the practice arc leaves out;
//  - return a number: results are ordered lists of ids with reason ids, never a score;
//  - hold any text. The wording of modules, questions and cards is private; this only chooses ids.
// The page may see only `pageView(...)`: card ids and word-family ids, never a lens, move, join or question id.
import { ARC_EXCLUDED_MODULES, MODULE_GROUPS, MODULE_IDS, SUPPRESS, selectModules } from './coachModules.ts';
import { CARD_IDS, COMMUNAL_LAYER, EDGES, JOIN_IDS, JOIN_PAIRS, LENS_IDS, MOVE_IDS, NODES, QUESTION_IDS, SAFETY_IDS, type EdgeType, type WebEdge, type WebNode } from './nvcWebData.ts';

/** The guards of the coach. Any one of them true means the web says nothing: the guards always win, and their own answers are not for a module to shape. */
export interface GuardState {
  crisis?: boolean; softened?: boolean; hostility?: boolean; care?: boolean; persona?: boolean; boundary?: boolean; lane?: boolean; names?: boolean; infra?: boolean; prompt?: boolean; values?: boolean;
}
export const GUARD_KEYS: Array<keyof GuardState> = ['crisis', 'softened', 'hostility', 'care', 'persona', 'boundary', 'lane', 'names', 'infra', 'prompt', 'values'];
export const anyGuard = (g: GuardState | undefined): boolean => !!g && GUARD_KEYS.some((k) => g[k]);

export interface Ranked { id: string; /** The reason ids of the edges that led here, in the private review table. */ because: string[] }
export interface WebSuggestion {
  /** True when nothing is suggested, with the reason (a guard or a safety module), so a log can say why without saying anything about the person. */
  silent: boolean;
  why?: string;
  /** Lenses already found by phrase, put in the order the matched concepts support. The web does not add a lens. */
  lenses: Ranked[];
  /** Moves that suit the concepts and are not held back. */
  moves: Ranked[];
  /** Joined modules: a concept AND its lens both apply. At most one is returned. */
  joins: Ranked[];
  /** The one question, or null. */
  question: Ranked | null;
  /** Learning cards for the page to offer, best first, only from `availableCards`. */
  cards: Ranked[];
  /** Word families the page may open first, only when the person has said they are stuck. */
  openFamilies: Ranked[];
  /** Lenses that the concepts often sit under, for the review table only: never read by the model. */
  hints: Ranked[];
  /** What the web left out because something holds it back, for the review table. */
  heldBack: string[];
}

export interface WebContext {
  guards?: GuardState;
  /** COACH_ARC=practice is on. */
  arcOn?: boolean;
  /** The person has said they cannot find a word. */
  stuck?: boolean;
  /** Cards already offered in this conversation. */
  offeredCards?: readonly string[];
  /** The cards that are really built in (or loaded for testing). A card outside this list is never returned. */
  availableCards?: readonly string[];
  /** The ids the base selection already chose (from selectModules). */
  base?: readonly string[];
  /** Maximum cards returned (the offer rules downstream still apply). */
  maxCards?: number;
}

const NONE: WebSuggestion = { silent: true, lenses: [], moves: [], joins: [], question: null, cards: [], openFamilies: [], hints: [], heldBack: [] };
const silent = (why: string): WebSuggestion => ({ ...NONE, why });

// ------------------------------------------------------------ the loader: indexes over the data, with a check that it is well formed
const JOIN_PAIRS_BY_ID = new Map<string, { concept: string; lens: string }>(JOIN_PAIRS.map(([id, concept, lens]) => [id, { concept, lens }]));
const nodeById = new Map<string, WebNode>(NODES.map((x) => [x.id, x]));
const out = new Map<string, WebEdge[]>();
for (const e of EDGES) { const a = out.get(e.from) ?? []; a.push(e); out.set(e.from, a); }
for (const a of out.values()) a.sort((x, y) => x.rank - y.rank);
/** Edges of one type leaving one node, best rank first. */
export const edgesFrom = (id: string, type: EdgeType): WebEdge[] => (out.get(id) ?? []).filter((e) => e.type === type);

/** What is wrong with the data, if anything: an edge to a node that does not exist, a duplicate node, or a move or lens that is not a module. Empty when sound. */
export function webProblems(): string[] {
  const p: string[] = [];
  if (nodeById.size !== NODES.length) p.push('duplicate node id');
  for (const e of EDGES) {
    if (!nodeById.has(e.from)) p.push(`edge from unknown node ${e.from}`);
    if (!nodeById.has(e.to)) p.push(`edge to unknown node ${e.to}`);
    if (!/^r\.[a-z0-9-]+$/.test(e.reason)) p.push(`edge ${e.from} -> ${e.to} has no reason id`);
  }
  for (const id of [...LENS_IDS, ...SAFETY_IDS, ...MOVE_IDS]) if (!MODULE_IDS.includes(id)) p.push(`${id} is not a module id`);
  return p;
}

/** The ids the web may ever return, by kind. */
export const KNOWN = { modules: new Set<string>([...MODULE_IDS, ...JOIN_IDS, ...QUESTION_IDS]), cards: new Set<string>(CARD_IDS) };

// ------------------------------------------------------------ concept detection (public phrases, best effort, like coachModules.ts)
const CONCEPT_PATTERNS: Array<[id: string, pattern: RegExp]> = [
  ['c.observation', /\b(?:(?:always|never|constantly|every time)\b.{0,40}\b(?:rude|lazy|selfish|inconsiderate|disrespectful|ignores?|interrupts?|listens?)|(?:he|she|they)(?:'s|'re| is| are| was| were) (?:so |just |being |such )?(?:rude|lazy|selfish|inconsiderate|disrespectful|unfair|a liar))\b/],
  ['c.feeling_thought', /\bi feel (?:like|that) (?:he|she|they|you|i|it|nobody|no one|everyone)\b|\bi feel (?:ignored|disrespected|used|manipulated|judged|abandoned|rejected|betrayed|unseen|unappreciated|misunderstood|dismissed)\b/],
  ['c.need_strategy', /\b(?:i need (?:him|her|them|you) to|i need (?:a|an|my) (?:\w+ )?(?:apology|raise|divorce|break|vacation|job)|if only (?:he|she|they)|the only way|the only thing that would)\b/],
  ['c.request_demand', /\b(?:make (?:him|her|them)|force (?:him|her|them)|(?:he|she|they) has to (?:stop|listen|change|apologi[sz]e)|(?:he|she|they) should (?:just )?(?:stop|listen|change|apologi[sz]e)|or else|ultimatum|tell (?:him|her|them) (?:to|what))\b/],
  ['c.enemy_image', /\b(?:(?:he|she|they)(?:'s|'re| is| are) (?:the problem|evil|toxic|a narcissist|impossible|the worst)|people like (?:him|her|that))\b/],
  ['c.protective_force', /\b(?:protect (?:my|myself|him|her|them|the kids)|keep (?:my|the) (?:kids|children) safe|restraining order|stand up to|defend (?:myself|my))\b/],
  ['c.choice', /\b(?:i have to|i had to|i must|i can't (?:not|say no)|no choice|i'm (?:supposed|expected|forced) to|obligat\w+|my duty)\b/],
  ['c.empathy', /\b(?:no one (?:gets|understands)|nobody (?:gets|understands)|just (?:want|need) (?:to be )?(?:heard|listened)|(?:don't|do not) want advice|want someone to (?:listen|understand|hear))\b/],
  ['c.self_empathy', /\b(?:i hate myself for|beat(?:ing)? myself up|i'm (?:so )?hard on myself|my inner critic|i keep blaming myself|i should have known|so stupid of me)\b/],
  ['c.appreciation', /\b(?:thank(?:s| you) for|grateful (?:for|to)|appreciate\w*|want(?:ed)? to thank|compliment\w*)\b/],
  ['c.honesty', /\b(?:pretend\w*|(?:never|haven't) told (?:him|her|them)|keep(?:ing)? (?:it|this) to myself|bite my tongue|swallow(?:ed)? (?:it|my)|white lie|be honest)\b/],
  ['c.met_needs', /\b(?:what(?:'s| is) (?:going|working) well|one good thing|silver lining|something (?:good|nice)|a bright spot)\b/],
];
const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");

/** The concepts the person's LATEST message touches (what they are saying now), in the order of CONCEPT_PATTERNS. */
export function detectConcepts(userTexts: string[]): string[] {
  const latest = fold(userTexts[userTexts.length - 1] ?? '');
  return CONCEPT_PATTERNS.filter(([, re]) => re.test(latest)).map(([id]) => id);
}

// ------------------------------------------------------------ the selector
const bump = (m: Map<string, { weight: number; because: Set<string> }>, id: string, weight: number, reason: string): void => {
  const cur = m.get(id) ?? { weight: 0, because: new Set<string>() };
  cur.weight += weight; cur.because.add(reason); m.set(id, cur);
};
const rank = (m: Map<string, { weight: number; because: Set<string> }>, order: readonly string[] = []): Ranked[] =>
  [...m.entries()].sort((a, b) => b[1].weight - a[1].weight || order.indexOf(a[0]) - order.indexOf(b[0]) || a[0].localeCompare(b[0])).map(([id, v]) => ({ id, because: [...v.because].sort() }));

/**
 * Suggestions for one message. `concepts` are the matched concepts (detectConcepts); `lenses` are the lens ids that the phrase matching already found
 * (the web never adds one). Pure: the same input always gives the same output.
 */
export function suggest(concepts: readonly string[], lenses: readonly string[], ctx: WebContext = {}): WebSuggestion {
  if (anyGuard(ctx.guards)) return silent('guard');
  const base = ctx.base ?? [];
  if (SAFETY_IDS.some((s) => base.includes(s) || lenses.includes(s))) return silent('safety');
  const cs = concepts.filter((c) => nodeById.get(c)?.kind === 'concept');
  const ls = lenses.filter((l) => (LENS_IDS as readonly string[]).includes(l));
  if (!cs.length && !ls.length) return { ...NONE, silent: false };
  const sources = [...cs, ...ls];

  // Everything held back by any source that applies: nothing suggested may be on this list.
  const held = new Map<string, Set<string>>();
  const hold = (id: string, reason: string): void => { const s = held.get(id) ?? new Set<string>(); s.add(reason); held.set(id, s); };
  for (const s of sources) for (const e of edgesFrom(s, 'holds_back')) hold(e.to, e.reason);
  // The code's own table is the authority and is read directly, so a stale copy in the data can never let a held-back move through.
  for (const l of ls) for (const m of SUPPRESS[l] ?? []) hold(m, 'r.code-suppress');
  if (ctx.arcOn) for (const m of ARC_EXCLUDED_MODULES) hold(m, 'r.arc');
  const blocked = (id: string): boolean => held.has(id);
  const heldBack: string[] = [];
  const keep = (id: string): boolean => { if (blocked(id)) { if (!heldBack.includes(id)) heldBack.push(id); return false; } return true; };

  // Lenses already found, ordered by how many of the matched concepts join them.
  const lensW = new Map<string, { weight: number; because: Set<string> }>();
  for (const l of ls) bump(lensW, l, 1, 'r.phrase');
  for (const e of EDGES.filter((x) => x.type === 'joins' && ls.includes(x.from))) {
    const join = JOIN_PAIRS_BY_ID.get(e.to);
    if (join && cs.includes(join.concept)) bump(lensW, join.lens, 5, e.reason);
  }

  // Joined modules: both halves must apply. At most one, because the notes stay short.
  const joinW = new Map<string, { weight: number; because: Set<string> }>();
  for (const [id, { concept, lens }] of JOIN_PAIRS_BY_ID) if (cs.includes(concept) && ls.includes(lens) && keep(id)) bump(joinW, id, 10, 'r.join');

  // Moves that suit the concepts, left out if held back, if already chosen by phrase (the base selection keeps them), or if the arc leaves them out.
  const moveW = new Map<string, { weight: number; because: Set<string> }>();
  for (const c of cs) for (const e of edgesFrom(c, 'pairs_with')) if (!base.includes(e.to) && keep(e.to)) bump(moveW, e.to, 4 - Math.min(e.rank, 3), e.reason);

  // The one question: not while the arc is on (it gives each exchange its own question), and not when the base already asks one.
  let question: Ranked | null = null;
  if (!ctx.arcOn && !base.includes('ask_one_question')) {
    const qW = new Map<string, { weight: number; because: Set<string> }>();
    for (const s of sources) for (const e of edgesFrom(s, 'asks_question')) if (keep(e.to)) bump(qW, e.to, cs.includes(s) ? 3 : 2, e.reason);
    question = rank(qW, QUESTION_IDS)[0] ?? null;
  }

  // Cards: only built-in ones, not offered already, not held back, and, if the concept found nothing, a neighbouring concept stands in.
  const avail = new Set((ctx.availableCards ?? []).filter((c) => KNOWN.cards.has(c)));
  const offered = new Set(ctx.offeredCards ?? []);
  const cardW = new Map<string, { weight: number; because: Set<string> }>();
  const cardSources = [...cs];
  for (const c of cs) if (!edgesFrom(c, 'offers_card').some((e) => avail.has(e.to) && !offered.has(e.to))) for (const nb of edgesFrom(c, 'neighbors')) cardSources.push(nb.to);
  for (const s of [...cardSources, ...ls]) {
    for (const e of edgesFrom(s, 'offers_card')) {
      if (!avail.has(e.to) || offered.has(e.to) || !keep(e.to)) continue;
      bump(cardW, e.to, (nodeById.get(s)?.kind === 'concept' ? 6 : 3) - Math.min(e.rank, 3), e.reason);
    }
  }
  const maxCards = ctx.maxCards ?? 2;

  // Word families for the page, only for a person who is stuck: the families that the lenses' needs map to and the feeling families the lenses often show.
  const famW = new Map<string, { weight: number; because: Set<string> }>();
  if (ctx.stuck) {
    for (const l of ls) {
      for (const ne of edgesFrom(l, 'needs_at_stake')) for (const me of edgesFrom(ne.to, 'maps_to')) if (me.to !== COMMUNAL_LAYER && !nodeById.get(me.to)?.provisional) bump(famW, me.to, 3 - Math.min(me.rank, 2), me.reason);
      for (const fe of edgesFrom(l, 'often_feels')) bump(famW, fe.to, 2, fe.reason);
    }
  }

  // Hints for the review table: where the concepts often sit, minus the lenses already found.
  const hintW = new Map<string, { weight: number; because: Set<string> }>();
  for (const c of cs) for (const e of edgesFrom(c, 'often_under')) if (!ls.includes(e.to)) bump(hintW, e.to, 3 - Math.min(e.rank, 2), e.reason);

  return {
    silent: false,
    lenses: rank(lensW, LENS_IDS),
    moves: rank(moveW, MOVE_IDS).slice(0, 2),
    joins: rank(joinW, JOIN_IDS).slice(0, 1),
    question,
    cards: rank(cardW, CARD_IDS).slice(0, maxCards),
    openFamilies: rank(famW).slice(0, 3),
    hints: rank(hintW, LENS_IDS).slice(0, 3),
    heldBack,
  };
}

/** The whole pipeline for a conversation: the existing phrase matching first, then the web on top of it. Same guards, same arc rule. */
export function suggestFromText(userTexts: string[], ctx: Omit<WebContext, 'base'> = {}): WebSuggestion {
  if (anyGuard(ctx.guards)) return silent('guard');
  const base = selectModules(userTexts, 6, [], ctx.arcOn ? ARC_EXCLUDED_MODULES : []);
  const lensHits = base.filter((id) => MODULE_GROUPS[id] === 'lens' || MODULE_GROUPS[id] === 'safety');
  return suggest(detectConcepts(userTexts), lensHits, { ...ctx, base });
}

/**
 * The only part of a suggestion the page may see: card ids to offer and word-family ids to open first. No lens, move, join or question id ever leaves the server,
 * and none is ever shown to a person. The coach never names a lens.
 */
export function pageView(s: WebSuggestion): { cards: string[]; openFamilies: string[] } {
  return { cards: s.cards.map((c) => c.id), openFamilies: s.openFamilies.map((f) => f.id) };
}

/** The ids the server may add to the notes for one reply, in order: at most one join, then the question's module. The notes builder still applies the 12,000-character cap. */
export function notesIds(s: WebSuggestion): string[] {
  return [...s.joins.map((j) => j.id), ...(s.question ? [s.question.id] : [])];
}

// ------------------------------------------------------------ checking a private module set that carries the web's modules (the wording stays outside the repository)
/** Words that belong to the framework, not to the person. A joined or question module that uses one is not ready: the coach never names a lens. */
export const FRAMEWORK_LABELS = ['icarus', 'volt', 'bottleneck', 'lens', 'legitimacy', 'recursion', 'torque', 'omega', 'theorem', 'flourishing', 'scale-coupling', 'reserves'];
export const JOIN_MIN = 300;
export const JOIN_MAX = 700;
export const QUESTION_MAX = 300;

/**
 * What is wrong with a private set (core, modules) as far as the web is concerned: a joined module or question kind without text, text outside the length
 * the notes can afford, a framework label in what the model is told to say, or a worst case over the cap (core, the three longest existing modules, one join, one question).
 */
export function webSetProblems(set: { core: string; modules: Record<string, string> }, cap = 12000): string[] {
  const p: string[] = [];
  for (const id of JOIN_IDS) {
    const t = set.modules[id];
    if (!t) { p.push(`missing text: ${id}`); continue; }
    if (t.length < JOIN_MIN || t.length > JOIN_MAX) p.push(`${id} is ${t.length} characters (${JOIN_MIN} to ${JOIN_MAX})`);
  }
  for (const id of QUESTION_IDS) {
    const t = set.modules[id];
    if (!t) { p.push(`missing text: ${id}`); continue; }
    if (t.length > QUESTION_MAX) p.push(`${id} is ${t.length} characters (up to ${QUESTION_MAX})`);
    if ((t.match(/\?/g) ?? []).length > 2) p.push(`${id} carries more than its one question`);
  }
  for (const id of [...JOIN_IDS, ...QUESTION_IDS]) {
    const t = (set.modules[id] ?? '').toLowerCase();
    for (const w of FRAMEWORK_LABELS) if (new RegExp(`\\b${w}\\b`).test(t)) p.push(`${id} uses the framework word "${w}"`);
  }
  const webIds = new Set<string>([...JOIN_IDS, ...QUESTION_IDS]);
  const lens = Object.entries(set.modules).filter(([id]) => !webIds.has(id)).map(([, t]) => t.length).sort((a, b) => b - a).slice(0, 3);
  const longest = (ids: readonly string[]): number => Math.max(0, ...ids.map((i) => set.modules[i]?.length ?? 0));
  const worst = set.core.length + lens.reduce((a, n) => a + n + 2, 0) + longest(JOIN_IDS) + 2 + longest(QUESTION_IDS) + 2;
  if (worst > cap) p.push(`worst case ${worst} characters exceeds the ${cap} cap`);
  for (const id of Object.keys(set.modules)) if (!MODULE_IDS.includes(id) && !webIds.has(id)) p.push(`unknown module id ${id}`);
  return p;
}
