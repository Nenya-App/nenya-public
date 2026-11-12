// Runs the site's detection (the private list's matcher, the history patterns, and the card-offer rule, exactly as the coach uses them) over outside test sets and reports
// COUNTS ONLY: no case text is printed or written. The data stays in the research folder (outside the repository); results go to results/public as counts and case numbers.
//   node scripts/eval-detect.mts                          # HateCheck (and ETHOS / MetaHate if they are in datasets/), with the list at datasets/hurtlex/list/slurs.en.csv
//   node scripts/eval-detect.mts --list path/to/slurs.csv # another list (the loader's final format)
//   node scripts/eval-detect.mts --no-list                # the history patterns alone (what runs when the private list is missing)
//   node scripts/eval-detect.mts --only hatecheck | ethos | metahate
//   node scripts/eval-detect.mts --json name.json         # also writes counts to results/public/name.json
// "Flagged" means the coach would OFFER a card for the message (a hit of severity 2 or more, not inside a reporting frame): the gentlest outcome the matcher can cause.
// "Hit" means the matcher found anything at all. The bars below were set BEFORE the first run (docs/coach-detection-rescope-ethos.md) and are not to be moved to fit a result.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { loadLexicon, parseCsv } from '../src/lib/lexiconLoader.ts';
import { match } from '../src/lib/lexicon.ts';
import type { Hit, Matcher } from '../src/lib/lexicon.ts';
import { OFFER_MAP, historyHits, offerFor } from '../src/lib/learningOffer.ts';

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
    matcher = loadLexicon(csv).matcher;
    listId = `${createHash('sha256').update(csv).digest('hex').slice(0, 12)} (${file.replace(P.root, '<research>')})`;
  } else console.error(`No list at ${file}; running with the history patterns alone.`);
}
const ALL_CARDS = [...new Set(Object.values(OFFER_MAP).flat())];

interface Verdict { hit: boolean; flagged: boolean }
function judge(text: string): Verdict {
  const hits: Hit[] = [...(matcher ? match(text, matcher) : []), ...historyHits(text)];
  const offer = offerFor({ hits, text, shown: [], available: ALL_CARDS, flagged: false, abuseAtCoach: false });
  return { hit: hits.length > 0, flagged: offer !== null };
}

/** Wilson 95% interval, as percentages. */
function wilson(k: number, n: number): string {
  if (n === 0) return 'n/a';
  const z = 1.96, p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return `${(100 * (c - m) / d).toFixed(1)}-${(100 * (c + m) / d).toFixed(1)}`;
}
const pct = (k: number, n: number): string => (n ? `${((100 * k) / n).toFixed(1)}%` : 'n/a');

interface Case { id: string; text: string; hateful: boolean; group: string }
interface Result { name: string; n: number; byGroup: Record<string, { hateful: boolean; n: number; hit: number; flagged: number; flaggedIds: string[] }> }

function run(name: string, cases: Case[]): Result {
  const byGroup: Result['byGroup'] = {};
  for (const c of cases) {
    const g = (byGroup[c.group] ??= { hateful: c.hateful, n: 0, hit: 0, flagged: 0, flaggedIds: [] });
    const v = judge(c.text);
    g.n++; if (v.hit) g.hit++;
    if (v.flagged) { g.flagged++; if (!c.hateful && g.flaggedIds.length < 40) g.flaggedIds.push(c.id); }
  }
  return { name, n: cases.length, byGroup };
}

function report(r: Result): boolean {
  console.log(`\n=== ${r.name}: ${r.n} cases ===`);
  const rows = Object.entries(r.byGroup).sort((a, b) => Number(a[1].hateful) - Number(b[1].hateful) || a[0].localeCompare(b[0]));
  let nhN = 0, nhF = 0, hN = 0, hF = 0, hH = 0;
  for (const [g, x] of rows) {
    if (x.hateful) { hN += x.n; hF += x.flagged; hH += x.hit; } else { nhN += x.n; nhF += x.flagged; }
    const over = !x.hateful && x.n && x.flagged / x.n > BARS.perFunctionalityNote ? '  <-- above 5%' : '';
    console.log(`${x.hateful ? 'hateful    ' : 'non-hateful'} ${g.padEnd(24)} n=${String(x.n).padStart(4)}  flagged ${pct(x.flagged, x.n).padStart(6)} [${wilson(x.flagged, x.n)}]  any hit ${pct(x.hit, x.n).padStart(6)}${over}`);
  }
  console.log(`non-hateful total: flagged ${nhF}/${nhN} = ${pct(nhF, nhN)} [${wilson(nhF, nhN)}]   (bar: at most ${100 * BARS.nonHatefulFlaggedMax}%)`);
  console.log(`hateful total:     flagged ${hF}/${hN} = ${pct(hF, hN)} [${wilson(hF, hN)}]   any hit ${pct(hH, hN)}   (a catch rate is only a reading: the sets' notion of hate is wider than ours)`);
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
  return lines.map((l, i) => { const k = l.lastIndexOf(';'); return { id: String(i + 1), text: l.slice(0, k), hateful: parseFloat(l.slice(k + 1)) >= 0.5, group: 'all' }; });
}
function metahate(): Case[] | null {
  const f = [join(P.datasets, 'metahate', 'MetaHate.tsv'), join(P.datasets, 'metahate', 'metahate.tsv')].find(existsSync);
  if (!f) return null;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines[0].split('\t'), ti = head.findIndex((c) => /text|post|comment/i.test(c)), li = head.findIndex((c) => /label|hate/i.test(c)), si = head.findIndex((c) => /^dataset$|source/i.test(c));
  if (ti < 0 || li < 0) { console.error('MetaHate: could not find the text and label columns.'); return null; }
  return lines.slice(1).map((l, i) => { const c = l.split('\t'); return { id: String(i + 1), text: c[ti] ?? '', hateful: c[li] === '1', group: si >= 0 ? `src:${c[si]}` : 'all' }; });
}

console.log(`Matcher: ${matcher ? 'private list ' + listId : listId}; history patterns on; reporting-frame rule on.`);
const sets: [string, () => Case[] | null][] = [['hatecheck', hatecheck], ['ethos', ethos], ['metahate', metahate]];
const out: Record<string, Result> = {};
let allOk = true;
for (const [name, load] of sets) {
  if (only && only !== name) continue;
  const cases = load();
  if (!cases) { console.log(`\n(${name}: not found in ${P.datasets}; skipped)`); continue; }
  out[name] = run(name, cases);
  allOk = report(out[name]) && allOk;
}
const jsonName = flag('--json');
if (jsonName) {
  mkdirSync(P.publicResults, { recursive: true });
  writeFileSync(join(P.publicResults, jsonName), JSON.stringify({ at: new Date().toISOString(), list: listId, bars: BARS, results: out }, null, 2));
  console.log(`\nCounts written to ${join(P.publicResults, jsonName)} (no case text).`);
}
process.exit(allOk ? 0 : 1);
