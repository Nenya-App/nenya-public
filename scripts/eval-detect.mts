// Runs the site's detection (the private list's matcher, the history patterns, and the card-offer rule, exactly as the coach uses them) over outside test sets and reports
// COUNTS ONLY: no case text is printed or written. The data stays in the research folder (outside the repository); results go to results/public as counts and case numbers.
//   node scripts/eval-detect.mts                          # HateCheck (and ETHOS / MetaHate if they are in datasets/), with the list at datasets/hurtlex/list/slurs.en.csv
//   node scripts/eval-detect.mts --list path/to/slurs.csv # another list (the loader's final format)
//   The reviewers' decisions (datasets/hurtlex/list/review-decisions.csv, or --decisions path) are applied when the file exists; --no-decisions shows the list as prepared.
//   node scripts/eval-detect.mts --no-list                # the history patterns alone (what runs when the private list is missing)
//   node scripts/eval-detect.mts --only hatecheck | ethos | metahate
//   node scripts/eval-detect.mts --attribute              # which list rows cause the false alarms (HateCheck): row numbers on screen; the words only in results/private/
//   node scripts/eval-detect.mts --scenes                 # the hand-written scenes (src/lib/detectScenes.ts): each says what outcome it must get
//   node scripts/eval-detect.mts --ethos-labels           # ETHOS's hate comments broken down by its own labels (violence, directed or general, six categories), with the site's harm checks beside the list
//   node scripts/eval-detect.mts --dump                   # also writes the per-case outcomes (ids and outcomes, no text) to results/private/verdicts-<set>.json, for joining with other tests
//   node scripts/eval-detect.mts --json name.json         # also writes counts to results/public/name.json
// "Flagged" means the coach would OFFER a card for the message (a hit of severity 2 or more, not inside a reporting frame): the gentlest outcome the matcher can cause.
// "Hit" means the matcher found anything at all. The bars below were set BEFORE the first run (docs/coach-detection-rescope-ethos.md) and are not to be moved to fit a result.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { loadLexicon, parseCsv, readLexicon } from '../src/lib/lexiconLoader.ts';
import { parseDecisions, applyDecisions } from '../src/lib/lexiconDecisions.ts';
import { match } from '../src/lib/lexicon.ts';
import type { Hit, Matcher } from '../src/lib/lexicon.ts';
import { siteDecision } from '../src/lib/safetyEval.ts';
import { SCENES, type Outcome } from '../src/lib/detectScenes.ts';
import type { Action } from '../src/lib/lexiconDecisions.ts';
import { OFFER_MAP, historyHits, isFramed, negatedBefore, offerFor } from '../src/lib/learningOffer.ts';

/** Bars, set 2026-11-12 before any run. Rates are shares of the non-hateful cases that the coach would flag. */
const BARS = { nonHatefulFlaggedMax: 0.02, perFunctionalityNote: 0.05 };

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const only = flag('--only');
const P = researchPaths();

let matcher: Matcher | null = null;
let listId = 'none (history patterns only)';
if (!args.includes('--no-list')) {
  const file = flag('--list') ?? join(P.datasets, 'hurtlex', 'list', 'slurs.en.csv');
  if (existsSync(file)) {
    const csv = readFileSync(file, 'utf8');
    const dfile = flag('--decisions') ?? join(P.datasets, 'hurtlex', 'list', 'review-decisions.csv');
    let decisions: Map<string, Action> | undefined;
    let dnote = 'no decisions applied';
    if (!args.includes('--no-decisions') && existsSync(dfile)) {
      const dcsv = readFileSync(dfile, 'utf8');
      const parsed = parseDecisions(dcsv);
      if (parsed.problems.length) { console.error('decisions file problems: ' + parsed.problems.join('; ')); process.exit(2); }
      decisions = parsed.decisions;
      const c = applyDecisions(readLexicon(csv).rows, decisions).counts;
      dnote = `decisions ${createHash('sha256').update(dcsv).digest('hex').slice(0, 8)}: ${decisions.size} terms (dropped ${c.dropped} rows, slur ${c.slur}, model ${c.model}, judgment ${c.judgment}, collapsed ${c.collapsed})`;
    }
    matcher = loadLexicon(csv, decisions).matcher;
    listId = `${createHash('sha256').update(csv).digest('hex').slice(0, 12)} (${file.replace(P.root, '<research>')}); ${dnote}`;
  } else console.error(`No list at ${file}; running with the history patterns alone.`);
}
const ALL_CARDS = [...new Set(Object.values(OFFER_MAP).flat())];

interface Verdict { hit: boolean; flagged: boolean; real: Hit[]; judgment: boolean; self: boolean; deferred: boolean }
function judge(text: string): Verdict {
  const hits: Hit[] = [...(matcher ? match(text, matcher) : []), ...historyHits(text)];
  const offer = offerFor({ hits, text, shown: [], available: ALL_CARDS, flagged: false, abuseAtCoach: false });
  const real = offer ? hits.filter((h) => h.severity >= 2 && !/llm-tell/.test(h.contextNote)) : [];
  // judgment: a blame word aimed at a person (gentle reply); deferred: a slur the list leaves to the model. Neither is "flagged".
  const judgment = !isFramed(text) && hits.some((h) => h.category === 'judgment' && !negatedBefore(text, h));
  const self = !judgment && !isFramed(text) && hits.some((h) => h.category === 'self-judgment' && !negatedBefore(text, h));
  const deferred = hits.some((h) => /needs-model/.test(h.contextNote));
  return { hit: hits.length > 0, flagged: offer !== null, real, judgment, self, deferred };
}

/** Wilson 95% interval, as percentages. */
function wilson(k: number, n: number): string {
  if (n === 0) return 'n/a';
  const z = 1.96, p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return `${(100 * (c - m) / d).toFixed(1)}-${(100 * (c + m) / d).toFixed(1)}`;
}
const pct = (k: number, n: number): string => (n ? `${((100 * k) / n).toFixed(1)}%` : 'n/a');

interface Case { id: string; text: string; hateful: boolean; group: string }
interface Result { name: string; n: number; byGroup: Record<string, { hateful: boolean; n: number; hit: number; flagged: number; judgment: number; self: number; deferred: number; flaggedIds: string[] }> }

const verdicts: Record<string, { id: string; group: string; hateful: boolean; flagged: boolean; judgment: boolean; self: boolean; deferred: boolean }[]> = {};
function run(name: string, cases: Case[]): Result {
  const byGroup: Result['byGroup'] = {};
  verdicts[name] = [];
  for (const c of cases) {
    const g = (byGroup[c.group] ??= { hateful: c.hateful, n: 0, hit: 0, flagged: 0, judgment: 0, self: 0, deferred: 0, flaggedIds: [] });
    const v = judge(c.text);
    verdicts[name].push({ id: c.id, group: c.group, hateful: c.hateful, flagged: v.flagged || siteDecision([c.text])?.tier === 'stop', judgment: v.judgment, self: v.self, deferred: v.deferred });
    g.n++; if (v.hit) g.hit++; if (v.judgment) g.judgment++; if (v.self) g.self++; if (v.deferred) g.deferred++;
    if (v.flagged) { g.flagged++; if (!c.hateful && g.flaggedIds.length < 40) g.flaggedIds.push(c.id); }
  }
  return { name, n: cases.length, byGroup };
}

function report(r: Result): boolean {
  console.log(`\n=== ${r.name}: ${r.n} cases ===`);
  const rows = Object.entries(r.byGroup).sort((a, b) => Number(a[1].hateful) - Number(b[1].hateful) || a[0].localeCompare(b[0]));
  let nhN = 0, nhF = 0, hN = 0, hF = 0, hH = 0, nhJ = 0, nhD = 0, hJ = 0, hD = 0, nhS = 0, hS = 0;
  for (const [g, x] of rows) {
    if (x.hateful) { hN += x.n; hF += x.flagged; hH += x.hit; hJ += x.judgment; hD += x.deferred; hS += x.self; } else { nhN += x.n; nhF += x.flagged; nhJ += x.judgment; nhD += x.deferred; nhS += x.self; }
    const over = !x.hateful && x.n && x.flagged / x.n > BARS.perFunctionalityNote ? '  <-- above 5%' : '';
    console.log(`${x.hateful ? 'hateful    ' : 'non-hateful'} ${g.padEnd(24)} n=${String(x.n).padStart(4)}  flagged ${pct(x.flagged, x.n).padStart(6)} [${wilson(x.flagged, x.n)}]  judgment ${pct(x.judgment, x.n).padStart(6)}  self ${pct(x.self, x.n).padStart(5)}  to model ${pct(x.deferred, x.n).padStart(6)}  any hit ${pct(x.hit, x.n).padStart(6)}${over}`);
  }
  console.log(`non-hateful total: flagged ${nhF}/${nhN} = ${pct(nhF, nhN)} [${wilson(nhF, nhN)}]   (bar: at most ${100 * BARS.nonHatefulFlaggedMax}%)`);
  console.log(`non-hateful, gentle reply only: judgment ${nhJ} (${pct(nhJ, nhN)}), self-judgment ${nhS}, left to the model ${nhD} (${pct(nhD, nhN)})`);
  console.log(`hateful total:     flagged ${hF}/${hN} = ${pct(hF, hN)} [${wilson(hF, hN)}]   judgment ${hJ} (${pct(hJ, hN)}), self-judgment ${hS}, to model ${hD} (${pct(hD, hN)}), any hit ${pct(hH, hN)}   (a catch rate is only a reading: the sets' notion of hate is wider than ours)`);
  const ok = nhN === 0 || nhF / nhN <= BARS.nonHatefulFlaggedMax;
  console.log(ok ? 'BAR MET' : 'BAR NOT MET');
  return ok;
}

// ---- loaders (the files are in the research folder; their text never leaves this process)
function hatecheck(): Case[] | null {
  const f = join(P.datasets, 'hatecheck', 'test_suite_cases.csv');
  if (!existsSync(f)) return null;
  const rows = parseCsv(readFileSync(f, 'utf8'));
  const h = rows[0], col = (n: string) => h.indexOf(n);
  const [ci, fi, ti, li] = [col('case_id'), col('functionality'), col('test_case'), col('label_gold')];
  return rows.slice(1).filter((r) => r.length > ti).map((r) => ({ id: r[ci], text: r[ti], hateful: r[li] === 'hateful', group: r[fi] }));
}
function ethos(): Case[] | null {
  const f = [join(P.datasets, 'ethos', 'Ethos_Dataset_Binary.csv'), join(P.datasets, 'ethos', 'ethos_data', 'Ethos_Dataset_Binary.csv')].find(existsSync);
  if (!f) return null;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).slice(1);
  return lines.map((l, i) => { const k = l.lastIndexOf(';'); return { id: String(i + 1), text: l.slice(0, k), hateful: parseFloat(l.slice(k + 1)) >= 0.5, group: parseFloat(l.slice(k + 1)) >= 0.5 ? 'hate' : 'no-hate' }; });
}
function metahate(): Case[] | null {
  const f = [join(P.datasets, 'metahate', 'MetaHate.tsv'), join(P.datasets, 'metahate', 'metahate.tsv')].find(existsSync);
  if (!f) return null;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines[0].split('\t'), ti = head.findIndex((c) => /text|post|comment/i.test(c)), li = head.findIndex((c) => /label|hate/i.test(c)), si = head.findIndex((c) => /^dataset$|source/i.test(c));
  if (ti < 0 || li < 0) { console.error('MetaHate: could not find the text and label columns.'); return null; }
  return lines.slice(1).map((l, i) => { const c = l.split('\t'); return { id: String(i + 1), text: c[ti] ?? '', hateful: c[li] === '1', group: (si >= 0 ? `src:${c[si]}:` : '') + (c[li] === '1' ? 'hate' : 'no-hate') }; });
}

console.log(`Matcher: ${matcher ? 'private list ' + listId : listId}; history patterns on; reporting-frame rule on.`);
const sets: [string, () => Case[] | null][] = [['hatecheck', hatecheck], ['ethos', ethos], ['metahate', metahate]];
const out: Record<string, Result> = {};
let allOk = true;
for (const [name, load] of sets) {
  if ((only && only !== name) || args.includes('--scenes') || args.includes('--ethos-labels')) continue;
  const cases = load();
  if (!cases) { console.log(`\n(${name}: not found in ${P.datasets}; skipped)`); continue; }
  out[name] = run(name, cases);
  allOk = report(out[name]) && allOk;
}

if (args.includes('--ethos-labels')) {
  const f = join(P.datasets, 'ethos', 'Ethos_Dataset_Multi_Label.csv');
  if (!existsSync(f)) { console.error('No ETHOS multi-label file in datasets/ethos.'); process.exit(2); }
  const names = ['violence', 'directed_vs_generalized', 'gender', 'race', 'national_origin', 'disability', 'religion', 'sexual_orientation'];
  const rows = readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).slice(1).map((l) => {
    const parts = l.split(';'); const nums = parts.slice(-8).map((x) => parseFloat(x) >= 0.5);
    return { text: parts.slice(0, -8).join(';'), L: Object.fromEntries(names.map((n, i) => [n, nums[i]])) as Record<string, boolean> };
  });
  const groups: [string, (r: (typeof rows)[number]) => boolean][] = [
    ['all hate comments', () => true],
    ...['violence'].map((n): [string, (r: (typeof rows)[number]) => boolean] => ['violence = yes', (r) => r.L[n]]),
    ['violence = no', (r) => !r.L.violence],
    ['aimed at a person', (r) => r.L.directed_vs_generalized], ['aimed at a group', (r) => !r.L.directed_vs_generalized],
    ...['gender', 'race', 'national_origin', 'disability', 'religion', 'sexual_orientation'].map((n): [string, (r: (typeof rows)[number]) => boolean] => [n, (r) => r.L[n]]),
  ];
  const verdicts = rows.map((r) => ({ r, v: judge(r.text), site: siteDecision([r.text]) }));
  console.log(`\n=== ETHOS hate comments by label (${rows.length} comments; a label counts at 0.5 or above; categories can overlap) ===`);
  console.log('group                 n   list flags     judgment   to model   list anything   site harm/crisis checks   nothing at all');
  for (const [name, pick] of groups) {
    const g = verdicts.filter((x) => pick(x.r)); const n = g.length;
    const c = (fn: (x: (typeof g)[number]) => boolean) => g.filter(fn).length;
    const flagged = c((x) => x.v.flagged), judg = c((x) => x.v.judgment), mod = c((x) => x.v.deferred), any = c((x) => x.v.hit), site = c((x) => x.site !== null);
    const none = c((x) => !x.v.flagged && !x.v.judgment && !x.v.self && !x.v.deferred && x.site === null);
    console.log(`${name.padEnd(20)} ${String(n).padStart(4)}   ${pct(flagged, n).padStart(6)}      ${pct(judg, n).padStart(6)}    ${pct(mod, n).padStart(6)}       ${pct(any, n).padStart(6)}          ${pct(site, n).padStart(6)}              ${pct(none, n).padStart(6)}`);
  }
  process.exit(0);
}

if (args.includes('--scenes')) {
  let ok = 0, edgeMiss = 0;
  const fails: string[] = [];
  for (const sc of SCENES) {
    const v = judge(sc.text);
    const got: Outcome | 'deferred' = siteDecision([sc.text])?.tier === 'stop' ? 'stop' : v.flagged ? 'flagged' : v.judgment ? 'judgment' : v.self ? 'self' : v.deferred ? 'deferred' : 'none';
    if (got === sc.expect) { ok++; continue; }
    if (sc.edge) edgeMiss++;
    fails.push(`${sc.edge ? 'EDGE ' : 'FAIL '}${sc.id}: expected ${sc.expect}, got ${got}  | ${sc.text}  (${sc.why})`);
  }
  console.log(`\n=== scenes: ${SCENES.length} written; ${ok} got the outcome they expect; ${fails.length} did not (${edgeMiss} of them edge scenes, which are questions for the reviewers) ===`);
  for (const f of fails) console.log('  ' + f);
  process.exit(fails.length - edgeMiss === 0 ? 0 : 1);
}

// ---- attribution: which rows of the list make the false alarms (HateCheck's labels). Rows are numbered by their order in the list file.
if (args.includes('--attribute')) {
  const file = flag('--list') ?? join(P.datasets, 'hurtlex', 'list', 'slurs.en.csv');
  const hc = flag('--dataset') === 'ethos' ? ethos() : hatecheck();
  if (!matcher || !hc || !existsSync(file)) { console.error('--attribute needs the list and the HateCheck file.'); process.exit(2); }
  const { rows } = readLexicon(readFileSync(file, 'utf8'));
  const idOf = new Map<string, number[]>();
  rows.forEach((r, i) => idOf.set(r.term, [...(idOf.get(r.term) ?? []), i + 1]));
  const stat = new Map<number, { nh: number; h: number; nhGroups: Record<string, number> }>();
  const flaggedNh: { id: string; group: string; rowsHit: number[] }[] = [];
  const flaggedH: number[][] = [];
  for (const c of hc) {
    const v = judge(c.text);
    if (!v.flagged) continue;
    const ids = [...new Set(v.real.flatMap((h) => idOf.get(h.term) ?? []))]; // history patterns have no row
    if (c.hateful) flaggedH.push(ids); else flaggedNh.push({ id: c.id, group: c.group, rowsHit: ids });
    for (const i of ids) {
      const x = stat.get(i) ?? { nh: 0, h: 0, nhGroups: {} };
      if (c.hateful) x.h++; else { x.nh++; x.nhGroups[c.group] = (x.nhGroups[c.group] ?? 0) + 1; }
      stat.set(i, x);
    }
  }
  const totalNh = hc.filter((c) => !c.hateful).length;
  const noRow = flaggedNh.filter((f) => f.rowsHit.length === 0).length;
  console.log(`\n=== attribution (HateCheck): ${flaggedNh.length} non-hateful cases flagged out of ${totalNh}; ${noRow} of them by the history patterns, not a list row ===`);
  const by = (key: (r: (typeof rows)[number]) => string) => {
    const m: Record<string, { rows: number; nh: number; h: number }> = {};
    for (const [i, x] of stat) { const k = key(rows[i - 1]); const e = (m[k] ??= { rows: 0, nh: 0, h: 0 }); e.rows++; e.nh += x.nh; e.h += x.h; }
    return Object.entries(m).sort((a, b) => b[1].nh - a[1].nh).map(([k, e]) => `${k}: ${e.rows} rows, ${e.nh} false alarms, ${e.h} flagged hateful`).join('\n  ');
  };
  console.log(`by category:\n  ${by((r) => r.category)}\nby match mode:\n  ${by((r) => r.matchMode)}\nby severity:\n  ${by((r) => String(r.severity))}`);
  // greedy: drop the rows that cost the most false alarms per hateful catch lost, and see where the rate falls (counts only)
  const ranked = [...stat.entries()].sort((a, b) => (b[1].nh - 0.25 * b[1].h) - (a[1].nh - 0.25 * a[1].h));
  const dropped = new Set<number>();
  const nhRows = flaggedNh.map((f) => f.rowsHit);
  const curve: string[] = [];
  for (const k of [0, 5, 10, 20, 40, 80, 160]) {
    dropped.clear(); ranked.slice(0, k).forEach(([i]) => dropped.add(i));
    const nhLeft = nhRows.filter((ids) => ids.length === 0 || ids.some((i) => !dropped.has(i))).length;
    const hLeft = flaggedH.filter((ids) => ids.length === 0 || ids.some((i) => !dropped.has(i))).length;
    curve.push(`drop top ${String(k).padStart(3)} rows: non-hateful flagged ${nhLeft}/${totalNh} (${pct(nhLeft, totalNh)}), hateful flagged ${hLeft}/${flaggedH.length}`);
  }
  console.log(`\nIf the worst rows were removed or given cues (greedy, by false alarms minus a quarter of the hateful cases they catch):\n  ${curve.join('\n  ')}`);
  console.log(`\nWorst 25 row numbers (false alarms / hateful flagged): ${ranked.slice(0, 25).map(([i, x]) => `#${i} (${x.nh}/${x.h})`).join(', ')}`);
  console.log(`Rows that cause any false alarm: ${[...stat.values()].filter((x) => x.nh > 0).length} of ${rows.length}. Rows that only ever flag false alarms here: ${[...stat.values()].filter((x) => x.nh > 0 && x.h === 0).length}.`);
  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync(P.publicResults, { recursive: true }); mkdirSync(P.privateResults, { recursive: true });
  writeFileSync(join(P.publicResults, `detect-attribution-${flag('--dataset') ?? 'hatecheck'}-${stamp}.json`), JSON.stringify({ at: new Date().toISOString(), list: listId, rows: Object.fromEntries([...stat].map(([i, x]) => [i, { falseAlarms: x.nh, hatefulFlagged: x.h, byFunctionality: x.nhGroups }])) }, null, 2));
  const q = (v: string) => '"' + v.replace(/"/g, '""') + '"';
  writeFileSync(join(P.privateResults, `detect-attribution-${flag('--dataset') ?? 'hatecheck'}-${stamp}.csv`), 'row,term,category,severity,mode,false_alarms,hateful_flagged,false_alarm_functionalities\n' + ranked.map(([i, x]) => [i, q(rows[i - 1].term), rows[i - 1].category, rows[i - 1].severity, rows[i - 1].matchMode, x.nh, x.h, q(Object.entries(x.nhGroups).map(([g, n]) => `${g}:${n}`).join(' '))].join(',')).join('\n') + '\n');
  console.log(`\nRow numbers and counts: results/public/detect-attribution-${flag('--dataset') ?? 'hatecheck'}-${stamp}.json. The words, for the reviewers only: results/private/detect-attribution-${flag('--dataset') ?? 'hatecheck'}-${stamp}.csv (not for the repository).`);
  process.exit(0);
}
if (args.includes('--dump')) { mkdirSync(P.privateResults, { recursive: true }); for (const [k, v] of Object.entries(verdicts)) writeFileSync(join(P.privateResults, `verdicts-${k}.json`), JSON.stringify(v)); console.log('Per-case outcomes (no text) written to results/private/verdicts-*.json'); }
const jsonName = flag('--json');
if (jsonName) {
  mkdirSync(P.publicResults, { recursive: true });
  writeFileSync(join(P.publicResults, jsonName), JSON.stringify({ at: new Date().toISOString(), list: listId, bars: BARS, results: out }, null, 2));
  console.log(`\nCounts written to ${join(P.publicResults, jsonName)} (no case text).`);
}
process.exit(allOk ? 0 : 1);
