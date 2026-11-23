// Builds the before/after table for the guard fixes (docs/guard-fixes-2026-11-22.md) from two saved runs made with scripts/bakeoff-workers-ai.mts: for each case that changed, the verdict, who wrote what the
// person saw (card, model, site sentence, notice, or a result kept from an earlier run), which guard acted, and whether a guard asked the model again or replaced the reply. No model calls, no key.
//
//   node scripts/guard-run-table.mts before.json after.json [--out table.md]
//
// The earlier run is also scored again with today's checks (no calls), so a change in a check (the negation guard on claimsHumanLife) is told apart from a change in what the coach said.
import { readFileSync, writeFileSync } from 'node:fs';
import { PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { GUARD_CASES } from '../src/lib/personaEvalGuardSet.ts';
import { comparableRuns, compareRuns, rescore, summarize, type CaseResult } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined;
const [fa, fb] = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
if (!fa || !fb) {
  console.error('Usage: node scripts/guard-run-table.mts before.json after.json [--out table.md]');
  process.exit(2);
}
type Run = { instructions?: string; model?: string; fingerprint?: string | null; condition?: string; incomplete?: boolean; incompleteReasons?: string[]; caseIds?: string[]; cost?: { neurons?: number; calls?: number }; results: CaseResult[] };
const A = JSON.parse(readFileSync(fa, 'utf8')) as Run;
const B = JSON.parse(readFileSync(fb, 'utf8')) as Run;
const problems = comparableRuns({ model: A.model, caseIds: A.caseIds }, { model: B.model, caseIds: B.caseIds });
const cases = [...PERSONA_CASES, ...GUARD_CASES];
const judging = { cards: true, distress: true };
const A2 = rescore(A.results, cases, judging);
const byA = new Map(A.results.map((r) => [r.id, r]));
const byA2 = new Map(A2.map((r) => [r.id, r]));
const byB = new Map(B.results.map((r) => [r.id, r]));

const verdict = (r?: CaseResult): string => (r ? (r.verdict ?? r.outcome).toUpperCase() : 'MISSING');
const who = (r?: CaseResult): string => {
  if (!r) return '-';
  const bits: string[] = [r.cached ? 'cached' : (r.source ?? '?')];
  if (r.card) bits.push(r.card);
  if (r.guard?.retried) bits.push('asked again');
  if (r.guard?.replaced) bits.push('REPLACED');
  const acted = (r.guard?.repaired ?? []).map((e) => e.replace(/^coach\./, '').replace(/^guard\./, ''));
  if (acted.length) bits.push(acted.join(' + '));
  return bits.join('; ');
};
const short = (t: string[], n = 2): string => (t.length ? t.slice(0, n).join(' / ') + (t.length > n ? ` (+${t.length - n})` : '') : 'none');
const cell = (s: string) => s.replace(/\|/g, '/').replace(/\n/g, ' ');

const ids = [...new Set([...A.results.map((r) => r.id), ...B.results.map((r) => r.id)])];
const WATCH = ['human-2', 'identity-2', 'therapy-2', 'closing-3'];
const rows = ids.filter((id) => {
  const a = byA.get(id), b = byB.get(id), a2 = byA2.get(id);
  return WATCH.includes(id) || verdict(a) !== verdict(b) || verdict(a2) !== verdict(b) || who(a) !== who(b) || (a?.failures ?? []).join() !== (b?.failures ?? []).join();
});
const sa = summarize(A.results), sa2 = summarize(A2), sb = summarize(B.results);
const cmp = compareRuns(A.results, B.results);
const L: string[] = [];
L.push('| Case | Before (as scored then) | Before, re-scored with today\'s checks | After | Who wrote it, before | Who wrote it, after | What changed |', '|---|---|---|---|---|---|---|');
for (const id of rows) {
  const a = byA.get(id), a2 = byA2.get(id), b = byB.get(id);
  const change = verdict(a) !== verdict(b) ? `${verdict(a)} to ${verdict(b)}` : verdict(a2) !== verdict(b) ? `check changed, then ${verdict(a2)} to ${verdict(b)}` : 'same verdict';
  const f = (b?.failures ?? []).length ? `; after: ${short(b!.failures)}` : '';
  const g = (a?.failures ?? []).length ? `before: ${short(a!.failures)}` : 'before: none';
  L.push(`| ${id} | ${verdict(a)} | ${verdict(a2)} | ${verdict(b)} | ${cell(who(a))} | ${cell(who(b))} | ${cell(`${change}. ${g}${f}`)} |`);
}
const head = (r: Run, f: string) => `${f.split('/').slice(-2).join('/')}: ${r.condition ?? r.instructions ?? '?'}; model ${r.model ?? '?'}; fingerprint ${r.fingerprint ?? 'none'}; ${r.cost?.calls ?? '?'} model calls, ${r.cost?.neurons ?? '?'} Neurons${r.incomplete ? '; INCOMPLETE: ' + (r.incompleteReasons ?? []).join('; ') : ''}`;
const text = [
  '## Runs', '', `- Before: ${head(A, fa)}`, `- After: ${head(B, fb)}`, ...(problems.length ? ['', `**Not like for like: ${problems.join('; ')}.**`] : []), '',
  '## Totals', '',
  '| | Before (as scored then) | Before, re-scored today | After |', '|---|---|---|---|',
  `| Cases | ${sa.total} | ${sa2.total} | ${sb.total} |`,
  `| Passed | ${sa.pass} | ${sa2.pass} | ${sb.pass} |`, `| Failed | ${sa.fail} | ${sa2.fail} | ${sb.fail} |`, `| Errors | ${sa.error} | ${sa2.error} | ${sb.error} |`,
  `| Passes to read (a guard replaced the reply) | ${sa.reviewNeeded} | ${sa2.reviewNeeded} | ${sb.reviewNeeded} |`,
  `| Written by a card | ${sa.sources.card} | ${sa2.sources.card} | ${sb.sources.card} |`, `| Written by the model | ${sa.sources.model} | ${sa2.sources.model} | ${sb.sources.model} |`,
  `| Site sentences | ${sa.sources.site} | ${sa2.sources.site} | ${sb.sources.site} |`, `| Notices (stops and blocks) | ${sa.sources.notice} | ${sa2.sources.notice} | ${sb.sources.notice} |`, `| Cached (not run this time) | ${sa.sources.cached} | ${sa2.sources.cached} | ${sb.sources.cached} |`,
  `| Model-only pass / fail (of the model's own replies) | ${sa.modelOnly.pass} / ${sa.modelOnly.fail} of ${sa.modelOnly.of} | ${sa2.modelOnly.pass} / ${sa2.modelOnly.fail} of ${sa2.modelOnly.of} | ${sb.modelOnly.pass} / ${sb.modelOnly.fail} of ${sb.modelOnly.of} |`,
  '', `Cases whose outcome changed, before to after (as scored then): ${cmp.changed.length ? cmp.changed.map((c) => `${c.id} ${c.from} to ${c.to}`).join('; ') : 'none'}.`, '',
  '## Cases that changed (and the four named in the review, always)', '', ...L, '',
].join('\n');
console.log(text);
if (out) writeFileSync(out, text + '\n');
