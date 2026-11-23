// Sets two saved persona runs side by side: pass counts, which cases changed, and the review rates (how often a reply says what the
// coach is, opens with the reflection template, points to people, and so on). Needs no key and makes no calls.
//
//   node scripts/compare-persona-runs.mts ~/Downloads/baseline-core.json ~/Downloads/v2-core.json
//
// The two runs must have the same model and the same case list. A case one run lacks counts as a failure in that run (a missing case is a failure, not a smaller denominator), and the
// script says plainly that the comparison is not like for like. Pass --force to compare runs of different models anyway (the table is then labelled).
import { readFileSync } from 'node:fs';
import { compareRuns, comparableRuns, type CaseResult } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const [fa, fb] = args.filter((a) => !a.startsWith('--'));
if (!fa || !fb) {
  console.error('Usage: node scripts/compare-persona-runs.mts first-run.json second-run.json');
  process.exit(2);
}
const load = (f: string) => JSON.parse(readFileSync(f, 'utf8')) as { instructions?: string; model?: string; fingerprint?: string | null; condition?: string; incomplete?: boolean; incompleteReasons?: string[]; caseIds?: string[]; results: CaseResult[] };
const A = load(fa), B = load(fb);
const c = compareRuns(A.results, B.results);
const label = (r: { instructions?: string; model?: string; condition?: string }, f: string) => `${f.split('/').pop()} (${r.condition ?? r.instructions ?? 'instructions not recorded'}; model ${r.model ?? 'not recorded'})`;
console.log(`A: ${label(A, fa)}\nB: ${label(B, fb)}\n`);
const problems = comparableRuns({ model: A.model, caseIds: A.caseIds ?? A.results.map((r) => r.id) }, { model: B.model, caseIds: B.caseIds ?? B.results.map((r) => r.id) });
for (const [run, name] of [[A, 'A'], [B, 'B']] as const) {
  if (run.incomplete) console.log(`!! Run ${name} is INCOMPLETE: ${(run.incompleteReasons ?? []).join('; ')}`);
  if (!run.fingerprint) console.log(`!! Run ${name} has no instructions fingerprint, so what it ran cannot be shown.`);
}
if (problems.length) console.log(`!! NOT LIKE FOR LIKE: ${problems.join('; ')}.${args.includes('--force') ? ' (compared anyway because of --force)' : ''}`);
if (problems.length && !args.includes('--force')) {
  console.log('Not comparing. Fix the run or pass --force.');
  process.exit(1);
}
console.log(`Compared ${c.a.total} cases (every case in either run; a case a run lacks counts as a failure there).`);
console.log(`  A: ${c.a.pass} passed, ${c.a.fail} failed, ${c.a.error} errors`);
console.log(`  B: ${c.b.pass} passed, ${c.b.fail} failed, ${c.b.error} errors\n`);
for (const cat of Object.keys(c.b.byCategory)) {
  const x = c.a.byCategory[cat] ?? { pass: 0, fail: 0, error: 0 }, y = c.b.byCategory[cat];
  console.log(`  ${cat.padEnd(13)} A pass ${String(x.pass).padStart(3)} fail ${String(x.fail).padStart(3)}   B pass ${String(y.pass).padStart(3)} fail ${String(y.fail).padStart(3)}`);
}
console.log('\nCases whose outcome changed:');
if (!c.changed.length) console.log('  none');
for (const x of c.changed) console.log(`  ${x.id}: ${x.from} -> ${x.to}${x.failures.length ? '  (' + x.failures.join('; ') + ')' : ''}`);
console.log('\nReview checks (present in N of M cases that name them):');
for (const r of c.review) console.log(`  ${r.check.padEnd(22)} A ${String(r.a.present).padStart(3)} of ${String(r.a.of).padEnd(3)}   B ${String(r.b.present).padStart(3)} of ${r.b.of}`);
if (c.onlyIn.a.length || c.onlyIn.b.length) console.log(`\nIn one run only (counted as failures in the other): A only ${c.onlyIn.a.length}, B only ${c.onlyIn.b.length}`);
console.log('\nPass counts are phrase-level. Read the replies in B for the cases that matter, and for tone.');
