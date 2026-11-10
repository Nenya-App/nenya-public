// Sets two saved persona runs side by side: pass counts, which cases changed, and the review rates (how often a reply says what the
// coach is, opens with the reflection template, points to people, and so on). Needs no key and makes no calls.
//
//   node scripts/compare-persona-runs.mts ~/Downloads/baseline-core.json ~/Downloads/v2-core.json
//
// Only cases present in both runs are compared. Run the same set (and the same --set) for both.
import { readFileSync } from 'node:fs';
import { compareRuns, type CaseResult } from '../src/lib/personaEval.ts';

const [fa, fb] = process.argv.slice(2);
if (!fa || !fb) {
  console.error('Usage: node scripts/compare-persona-runs.mts first-run.json second-run.json');
  process.exit(2);
}
const load = (f: string) => JSON.parse(readFileSync(f, 'utf8')) as { instructions?: string; results: CaseResult[] };
const A = load(fa), B = load(fb);
const c = compareRuns(A.results, B.results);
const label = (r: { instructions?: string }, f: string) => `${f.split('/').pop()} (${r.instructions ?? 'instructions not recorded'})`;
console.log(`A: ${label(A, fa)}\nB: ${label(B, fb)}\n`);
console.log(`Compared ${c.a.total} cases in both runs.`);
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
if (c.onlyIn.a.length || c.onlyIn.b.length) console.log(`\nNot compared (in one run only): A ${c.onlyIn.a.length}, B ${c.onlyIn.b.length}`);
console.log('\nPass counts are phrase-level. Read the replies in B for the cases that matter, and for tone.');
