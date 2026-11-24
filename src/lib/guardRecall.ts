// Guard recall: of the many ways of saying one thing, how many does the site's phrase check flag, and how many harmless near-misses does it wrongly flag?
// A pure library (no file, no network, no clock, no model): scripts/guard-recall.mts reads the families file and writes the result. See docs/guard-recall.md.
//
// This is NOT a detection rate for real people. The messages in a families file are invented, the labels are one reader's, and the check is a phrase list that reads words, not meaning.
// Nothing here may be worded as "detects", "catches" or "protects": say "recall on the invented families" and "false-flag rate on the invented near-misses".
import { createHash } from 'node:crypto';
import { checkConversation, explainConversation, type FlagCategory, type FlagTier } from './safetyFlags.ts';

/** Registers of wording. In the families file a paraphrase carries one of the one-letter codes (the key) or the name itself. */
export const REGISTERS = {
  P: 'plain',
  I: 'indirect',
  Y: 'casual',
  F: 'formal',
  T: 'text-speak',
  X: 'typos',
  L: 'lead-in',
  M: 'mid-conversation',
} as const;
export type Register = (typeof REGISTERS)[keyof typeof REGISTERS];
const REGISTER_NAMES = new Set<string>(Object.values(REGISTERS));

const CATEGORIES = new Set<string>(['self-harm', 'self-injury', 'harm-others', 'abuse', 'distress']);
const TIERS = new Set<string>(['stop', 'soften']);

export interface Paraphrase {
  id: string;
  family: string;
  /** true: the check should flag it (as the family's category, tier and, when the family asserts one, kind). false: a near-miss that must not be flagged. */
  expectFlag: boolean;
  /** The conversation, oldest message first; the last one is under test. */
  turns: string[];
  /** Only for a paraphrase that should flag; a near-miss has none. */
  register: Register | null;
  note: string | null;
}
export interface Family {
  id: string;
  category: FlagCategory;
  tier: FlagTier;
  /** null: the kind is not asserted. */
  kind: string | null;
  title: string | null;
  items: Paraphrase[];
}
export interface FamiliesFile {
  /** The file's own "version" field, or null when it has none. It is part of the split rule. */
  version: string | null;
  families: Family[];
}

export class FamiliesError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(`The families file is not valid (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n- ${problems.slice(0, 20).join('\n- ')}${problems.length > 20 ? `\n- ... and ${problems.length - 20} more` : ''}`);
    this.name = 'FamiliesError';
    this.problems = problems;
  }
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/**
 * Checks the families file's structure and returns it in one shape, or throws a FamiliesError that names every problem found (up to the first 20 are shown).
 * Structure: { version?: string, families: [{ id, category, tier, kind: string|null, title?, pos: [{ id, reg, turns: [...], expect?: true }], neg: [{ id, turns: [...], note?, expect?: false }] }] }.
 * Fields it does not know (src, split, _label, ...) are ignored; in particular a "split" in the file is NOT used (see splitOf).
 */
export function parseFamilies(raw: unknown): FamiliesFile {
  const bad: string[] = [];
  if (!isObj(raw)) throw new FamiliesError(['the top level must be an object with a "families" list']);
  if (raw.version !== undefined && raw.version !== null && (typeof raw.version !== 'string' || !raw.version.trim())) bad.push('"version" must be a non-empty string when present');
  if (!Array.isArray(raw.families) || raw.families.length === 0) bad.push('"families" must be a non-empty list');
  const families: Family[] = [];
  const famIds = new Set<string>();
  const itemIds = new Set<string>();
  (Array.isArray(raw.families) ? raw.families : []).forEach((f, fi) => {
    const where = `families[${fi}]`;
    if (!isObj(f)) return void bad.push(`${where} must be an object`);
    const id = typeof f.id === 'string' ? f.id : '';
    if (!ID.test(id)) bad.push(`${where}: "id" must be a plain id (letters, digits, - and _)`);
    else if (famIds.has(id)) bad.push(`${where}: the family id ${id} is used twice`);
    else famIds.add(id);
    const name = id || where;
    if (typeof f.category !== 'string' || !CATEGORIES.has(f.category)) bad.push(`${name}: "category" must be one of ${[...CATEGORIES].join(', ')}`);
    if (typeof f.tier !== 'string' || !TIERS.has(f.tier)) bad.push(`${name}: "tier" must be "stop" or "soften"`);
    if (f.kind !== undefined && f.kind !== null && (typeof f.kind !== 'string' || !f.kind)) bad.push(`${name}: "kind" must be a non-empty string or null`);
    if (f.title !== undefined && typeof f.title !== 'string') bad.push(`${name}: "title" must be a string`);
    const items: Paraphrase[] = [];
    for (const [list, expectFlag] of [['pos', true], ['neg', false]] as const) {
      const xs = f[list];
      if (!Array.isArray(xs)) {
        bad.push(`${name}: "${list}" must be a list`);
        continue;
      }
      xs.forEach((x, xi) => {
        const at = `${name}.${list}[${xi}]`;
        if (!isObj(x)) return void bad.push(`${at} must be an object`);
        const iid = typeof x.id === 'string' ? x.id : '';
        if (!ID.test(iid)) bad.push(`${at}: "id" must be a plain id`);
        else if (itemIds.has(iid) || famIds.has(iid)) bad.push(`${at}: the id ${iid} is used twice`);
        else itemIds.add(iid);
        if (x.expect !== undefined && x.expect !== expectFlag) bad.push(`${at}: "expect" is ${JSON.stringify(x.expect)} but the item is in "${list}" (which means ${expectFlag})`);
        const turns = x.turns;
        if (!Array.isArray(turns) || turns.length === 0 || turns.some((t) => typeof t !== 'string' || !t.trim())) bad.push(`${at}: "turns" must be a non-empty list of non-empty strings`);
        let register: Register | null = null;
        if (expectFlag) {
          const reg = typeof x.reg === 'string' ? x.reg : typeof x.register === 'string' ? x.register : '';
          const name2 = (REGISTERS as Record<string, string>)[reg] ?? (REGISTER_NAMES.has(reg) ? reg : null);
          if (!name2) bad.push(`${at}: "reg" must be one of ${Object.keys(REGISTERS).join(', ')} (or ${[...REGISTER_NAMES].join(', ')})`);
          else register = name2 as Register;
        }
        if (x.note !== undefined && typeof x.note !== 'string') bad.push(`${at}: "note" must be a string`);
        items.push({
          id: iid,
          family: id,
          expectFlag,
          turns: Array.isArray(turns) ? (turns as string[]) : [],
          register,
          note: typeof x.note === 'string' ? x.note : null,
        });
      });
    }
    if (!items.some((i) => i.expectFlag)) bad.push(`${name}: it has no item that should flag`);
    families.push({
      id,
      category: f.category as FlagCategory,
      tier: f.tier as FlagTier,
      kind: typeof f.kind === 'string' ? f.kind : null,
      title: typeof f.title === 'string' ? f.title : null,
      items,
    });
  });
  if (bad.length) throw new FamiliesError(bad);
  return { version: typeof raw.version === 'string' ? raw.version : null, families };
}

export const sha256Hex = (data: string | Uint8Array): string => createHash('sha256').update(data).digest('hex');

export type Split = 'tune' | 'heldout';
export type SplitChoice = Split | 'all';

/**
 * The split rule. One paraphrase's half depends only on the families file's version and the paraphrase's own id:
 * take SHA-256 of the text "<version>:<id>" (version "unversioned" when the file has none), read its first byte, and
 * an even byte means the tuning half ("tune"), an odd byte the held-out half ("heldout").
 * So the held-out half never changes unless the version changes or an id changes; adding, removing or rewording other items moves nothing.
 * The price: halves are about, not exactly, equal, and a small family can fall mostly on one side.
 */
export function splitOf(version: string | null, id: string): Split {
  const first = createHash('sha256').update(`${version ?? 'unversioned'}:${id}`).digest()[0];
  return first % 2 === 0 ? 'tune' : 'heldout';
}

/** The 95% Wilson score interval for k of n, as fractions; null when n is 0. Treats the items as independent, which paraphrases of one meaning are not: read it as too narrow. */
export function wilson(k: number, n: number, z = 1.959964): [number, number] | null {
  if (n <= 0) return null;
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

export interface Rate {
  k: number;
  n: number;
  /** k / n as a fraction, or null when n is 0. */
  rate: number | null;
  wilson: [number, number] | null;
}
export const rate = (k: number, n: number): Rate => ({ k, n, rate: n ? k / n : null, wilson: wilson(k, n) });

export type Outcome =
  | 'exact' // flagged with the expected category, tier and (if asserted) kind
  | 'wrong-tier-low' // a soften where a stop was expected (the message still reaches the coach)
  | 'wrong-tier-high' // a stop where a soften was expected (the conversation ends sooner than intended)
  | 'wrong-category-or-kind' // flagged at the expected tier, but another category or kind
  | 'missed' // no flag where one was expected
  | 'clean' // a near-miss, not flagged
  | 'false-flag'; // a near-miss, flagged

export interface Got {
  category: string;
  tier: string;
  kind: string | null;
}
export interface Result {
  id: string;
  family: string;
  split: Split;
  register: Register | null;
  expectFlag: boolean;
  expected: { flag: boolean; category: string; tier: string; kind: string | null };
  got: Got | null;
  outcome: Outcome;
  /** The words that matched or the ladder's rung, cut short. Text taken from the message: for the JSON file only. */
  why: string | null;
  turns: string[];
  note: string | null;
}

export function classify(f: Family, item: Paraphrase, got: Got | null): Outcome {
  if (!item.expectFlag) return got ? 'false-flag' : 'clean';
  if (!got) return 'missed';
  if (got.tier !== f.tier) return f.tier === 'stop' ? 'wrong-tier-low' : 'wrong-tier-high';
  if (got.category !== f.category || (f.kind !== null && got.kind !== f.kind)) return 'wrong-category-or-kind';
  return 'exact';
}

/** Runs one paraphrase through the repository's own checkConversation (the entry the site uses: the phrase lists, the pronoun rule, the self-injury ladder, the carried-over distress rule). */
export function runItem(f: Family, item: Paraphrase, version: string | null): Result {
  const flag = checkConversation(item.turns);
  const got: Got | null = flag ? { category: flag.category, tier: flag.tier, kind: flag.kind ?? null } : null;
  let why: string | null = null;
  if (flag) {
    const w = explainConversation(item.turns)?.why;
    why = w ? [w.source, w.rung, w.matched].filter(Boolean).join(': ') : null;
  }
  return {
    id: item.id,
    family: f.id,
    split: splitOf(version, item.id),
    register: item.register,
    expectFlag: item.expectFlag,
    expected: { flag: item.expectFlag, category: f.category, tier: f.tier, kind: f.kind },
    got,
    outcome: classify(f, item, got),
    why,
    turns: item.turns,
    note: item.note,
  };
}

export interface Selection {
  split: SplitChoice;
  /** A family id (all its paraphrases) or one paraphrase id. */
  only?: string;
}

/** The families and items a run covers. Throws if --only names nothing, or the selection is empty. */
export function select(file: FamiliesFile, sel: Selection): Family[] {
  let fams = file.families;
  if (sel.only) {
    const byFamily = fams.filter((f) => f.id === sel.only);
    const byItem = fams.filter((f) => f.items.some((i) => i.id === sel.only));
    if (!byFamily.length && !byItem.length) throw new Error(`--only ${sel.only}: no family or paraphrase has that id (see --list)`);
    fams = byFamily.length ? byFamily : byItem.map((f) => ({ ...f, items: f.items.filter((i) => i.id === sel.only) }));
  }
  fams = fams
    .map((f) => ({ ...f, items: f.items.filter((i) => sel.split === 'all' || splitOf(file.version, i.id) === sel.split) }))
    .filter((f) => f.items.length > 0);
  if (!fams.length) throw new Error('nothing selected: no paraphrase falls in that split and --only choice');
  return fams;
}

export interface Group {
  flagged: Rate;
  asExpected: Rate;
}
export interface Summary {
  counts: { families: number; shouldFlag: number; nearMisses: number };
  overall: Group;
  byFamily: Record<string, Group & { falseFlags: Rate }>;
  byTier: Record<string, Group>;
  byCategory: Record<string, Group>;
  byKind: Record<string, Group>;
  byRegister: Record<string, Group>;
  bySplit: Record<string, Group & { falseFlags: Rate }>;
  /** Near-misses wrongly flagged, overall; by the tier of the family they belong to; and how many false flags were at the stop tier (the tier that ends a conversation). */
  falseFlags: Rate & { falseStops: number; falseSoftens: number; byFamilyTier: Record<string, Rate> };
  /** The tier or category or kind that differs from what was expected, for items that were flagged at all. */
  tierOrKindDiffers: number;
}

const group = (rs: Result[]): Group => ({
  flagged: rate(rs.filter((r) => r.got).length, rs.length),
  asExpected: rate(rs.filter((r) => r.outcome === 'exact').length, rs.length),
});
const falseRate = (ns: Result[]): Rate => rate(ns.filter((r) => r.outcome === 'false-flag').length, ns.length);
function by<T>(xs: Result[], key: (r: Result) => string | null, make: (rs: Result[]) => T): Record<string, T> {
  const m = new Map<string, Result[]>();
  for (const r of xs) {
    const k = key(r);
    if (k === null) continue;
    (m.get(k) ?? m.set(k, []).get(k)!).push(r);
  }
  return Object.fromEntries([...m.keys()].sort().map((k) => [k, make(m.get(k)!)]));
}

export function summarize(families: Family[], results: Result[]): Summary {
  const pos = results.filter((r) => r.expectFlag);
  const neg = results.filter((r) => !r.expectFlag);
  const famOf = new Map(families.map((f) => [f.id, f]));
  const tierOfFamily = (r: Result) => famOf.get(r.family)!.tier;
  const withFalse = (rs: Result[]) => ({ ...group(rs.filter((r) => r.expectFlag)), falseFlags: falseRate(rs.filter((r) => !r.expectFlag)) });
  const falseOnes = neg.filter((r) => r.outcome === 'false-flag');
  const falseStops = falseOnes.filter((r) => r.got!.tier === 'stop').length;
  return {
    counts: { families: families.length, shouldFlag: pos.length, nearMisses: neg.length },
    overall: group(pos),
    byFamily: by(results, (r) => r.family, withFalse),
    byTier: by(pos, (r) => r.expected.tier, group),
    byCategory: by(pos, (r) => r.expected.category, group),
    byKind: by(pos, (r) => r.expected.kind ?? '(not asserted)', group),
    byRegister: by(pos, (r) => r.register, group),
    bySplit: by(results, (r) => r.split, withFalse),
    falseFlags: {
      ...falseRate(neg),
      falseStops,
      falseSoftens: falseOnes.length - falseStops,
      byFamilyTier: by(neg, (r) => tierOfFamily(r), falseRate),
    },
    tierOrKindDiffers: pos.filter((r) => r.got && r.outcome !== 'exact').length,
  };
}

export interface RunMeta {
  ranAt: string;
  familiesPath: string;
  familiesSha256: string;
  commit: string | null;
  /** A short hash of the guard's source files, so a result says which code it describes; null when they could not be read. */
  fingerprint: string | null;
}

export const LABEL_NOTE =
  'Recall on invented wordings, as labelled by one reader (the labels are a model\'s draft and are not independent). Not a rate for ordinary talk, not a rate for real people, and no claim that anyone is safe.';

const expectText = (r: Result): string => `${r.expected.category}, ${r.expected.tier}${r.expected.kind ? ', ' + r.expected.kind : ''}`;
const gotText = (g: Got | null): string => (g ? `${g.category}, ${g.tier}${g.kind ? ', ' + g.kind : ''}` : 'no flag');

/** The failure sentence the results viewer parses: it begins "expected ...", and one for no flag says "raised no flag". Null for a pass. */
function failureText(r: Result): string | null {
  switch (r.outcome) {
    case 'exact':
    case 'clean':
      return null;
    case 'missed':
      return `expected a flag (${expectText(r)}); the check raised no flag`;
    case 'false-flag':
      return `expected no flag; the check raised ${gotText(r.got)}`;
    default:
      return `expected ${expectText(r)}; the check raised ${gotText(r.got)} (${r.outcome})`;
  }
}

/**
 * The whole result, in a shape the private results viewer already reads: a top-level "results" list of { id, category, outcome, verdict, how, note, failures }
 * (a pass is "the check flagged it as expected, or left a near-miss alone"), and kind "guard-recall". The invented text of each paraphrase is in "turns",
 * so the file is private: keep it out of the repository.
 */
export function buildReport(file: FamiliesFile, families: Family[], results: Result[], sel: Selection, meta: RunMeta) {
  const summary = summarize(families, results);
  const row = (r: Result) => ({
    id: r.id,
    category: r.family,
    note: r.expectFlag ? `Should be flagged (${expectText(r)}); register: ${r.register}.` : `Near-miss: should not be flagged.`,
    outcome: r.outcome === 'exact' || r.outcome === 'clean' ? 'pass' : 'fail',
    verdict: r.outcome === 'exact' || r.outcome === 'clean' ? 'pass' : 'fail',
    how: r.got ? 'flag' : 'none',
    failures: [failureText(r)].filter((x): x is string => !!x),
    detail: r.outcome,
    expected: r.expected,
    got: r.got,
    register: r.register,
    split: r.split,
    why: r.why,
    turns: r.turns,
  });
  const text = (r: Result) => ({ id: r.id, family: r.family, register: r.register, split: r.split, expected: r.expected, got: r.got, outcome: r.outcome, turns: r.turns });
  return {
    ranAt: meta.ranAt,
    kind: 'guard-recall',
    condition: `guard recall, families ${file.version ?? 'unversioned'}, split ${sel.split}${meta.commit ? `, dev ${meta.commit.slice(0, 7)}` : ''}`,
    fingerprint: meta.fingerprint,
    familiesVersion: file.version,
    familiesSha256: meta.familiesSha256,
    familiesFile: meta.familiesPath,
    commit: meta.commit,
    split: sel.split,
    only: sel.only ?? null,
    labelNote: LABEL_NOTE,
    summary,
    results: results.map(row),
    missed: results.filter((r) => r.outcome === 'missed').map(text),
    falseFlags: results.filter((r) => r.outcome === 'false-flag').map(text),
    differs: results.filter((r) => r.expectFlag && r.got && r.outcome !== 'exact').map(text),
  };
}

export function runAll(file: FamiliesFile, sel: Selection): { families: Family[]; results: Result[] } {
  const families = select(file, sel);
  const results = families.flatMap((f) => f.items.map((i) => runItem(f, i, file.version)));
  return { families, results };
}

const pct = (r: Rate): string => (r.rate === null ? 'n/a' : `${Math.round(r.rate * 100)}%`);
const span = (r: Rate): string => (r.wilson ? `${Math.round(r.wilson[0] * 100)}-${Math.round(r.wilson[1] * 100)}` : 'n/a');
const cell = (r: Rate): string => `${r.k}/${r.n} ${pct(r)} [${span(r)}]`;

/** The terminal summary. Ids and counts only: never the text of a message. */
export function formatSummary(rep: ReturnType<typeof buildReport>, results: Result[]): string {
  const s = rep.summary;
  const L: string[] = [];
  L.push(`Guard recall on INVENTED families (${rep.familiesVersion ?? 'unversioned'}, split ${rep.split}, guard ${rep.fingerprint ?? 'unknown'}, dev ${rep.commit?.slice(0, 7) ?? 'unknown'})`);
  L.push('Read: recall on invented wordings, labelled by one reader. Not a detection rate for real people, not a rate for ordinary talk, no claim of safety. Intervals are 95% Wilson and too narrow (paraphrases are not independent).');
  L.push(`families file sha256 ${rep.familiesSha256.slice(0, 16)}...  ${s.counts.families} families, ${s.counts.shouldFlag} should flag, ${s.counts.nearMisses} near-misses`);
  L.push('');
  L.push(`overall   flagged at all ${cell(s.overall.flagged)}   as expected ${cell(s.overall.asExpected)}   (flagged but at another tier, category or kind: ${s.tierOrKindDiffers})`);
  const table = (title: string, g: Record<string, Group>) => {
    L.push(`by ${title}:`);
    for (const [k, v] of Object.entries(g)) L.push(`  ${k.padEnd(20)} flagged ${cell(v.flagged).padEnd(22)} as expected ${cell(v.asExpected)}`);
  };
  table('tier (expected)', s.byTier);
  table('kind (expected)', s.byKind);
  table('category (expected)', s.byCategory);
  table('register', s.byRegister);
  L.push('by split:');
  for (const [k, v] of Object.entries(s.bySplit)) L.push(`  ${k.padEnd(20)} flagged ${cell(v.flagged).padEnd(22)} as expected ${cell(v.asExpected).padEnd(22)} near-miss false flags ${cell(v.falseFlags)}`);
  L.push('');
  L.push(`near-misses falsely flagged ${cell(s.falseFlags)}  (a stress set chosen to sit next to a phrase: not a rate for ordinary talk)`);
  L.push(`  of those, stops: ${s.falseFlags.falseStops}; softens: ${s.falseFlags.falseSoftens}`);
  for (const [t, v] of Object.entries(s.falseFlags.byFamilyTier)) L.push(`  near-misses of ${t}-tier families falsely flagged ${cell(v)}`);
  L.push('');
  L.push('by family (flagged at all; false flags on near-misses; wide intervals: look, do not rank):');
  for (const [k, v] of Object.entries(s.byFamily)) L.push(`  ${k.padEnd(22)} ${cell(v.flagged).padEnd(22)} as expected ${String(v.asExpected.k).padStart(2)}/${v.asExpected.n}   false flags ${v.falseFlags.k}/${v.falseFlags.n}`);
  const ids = (o: Outcome): Map<string, string[]> => {
    const m = new Map<string, string[]>();
    for (const r of results.filter((x) => x.outcome === o)) (m.get(r.family) ?? m.set(r.family, []).get(r.family)!).push(r.id);
    return m;
  };
  const listIds = (title: string, m: Map<string, string[]>) => {
    const n = [...m.values()].reduce((a, b) => a + b.length, 0);
    L.push('', `${title} (${n}), by family (ids only; the text is in the --json file only):`);
    for (const [fam, nums] of m) L.push(`  ${fam}: ${nums.join(' ')}`);
  };
  listIds('missed paraphrases', ids('missed'));
  listIds('near-misses falsely flagged', ids('false-flag'));
  return L.join('\n');
}
