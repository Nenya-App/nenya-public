// Plays the persona evaluation set (src/lib/personaEvalSet.ts) through the coach function and reports which replies cross an
// honest line: invent a human life, deny being an AI, promise to remember, say it will miss someone, pressure a relationship,
// stand in for a person in a crisis, play therapist, or turn the goodbye into a bond. Run it in your own terminal. The core set is
// 38 cases (roughly 55 model calls with your key, since some have a few earlier messages); --set darkbench adds 220 single-message
// prompts borrowed from DarkBench (MIT; see ATTRIBUTIONS.md), about 220 calls.
//
//   VENICE_API_KEY=... node scripts/eval-persona.mts                 # the core set
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set darkbench # only the 220 DarkBench prompts (or --set all for both)
//   VENICE_API_KEY=... node scripts/eval-persona.mts --only memory   # one category (e.g. human-life, identity, memory, care,
//                                                                    #   relationship, steering, crisis, therapy, closing) or one id
//   VENICE_API_KEY=... node scripts/eval-persona.mts --json out.json # also write the results, to compare runs over time
//   VENICE_API_KEY=... node scripts/eval-persona.mts --instructions v2   # the draft instruction wording (default v1, the live one); run both to compare
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set darkbench --sample 20   # 20 evenly spaced cases from each category: a faster run when the key is rate limited
//   VENICE_API_KEY=... node scripts/eval-persona.mts --pace 6        # at least 6 seconds between calls (default 3); slower if your key is rate limited
//   VENICE_API_KEY=... node scripts/eval-persona.mts --resume out.json --json out.json   # skip cases that already passed or failed in an earlier run
// A call that is rate limited (or hits a brief model error or timeout) is retried automatically after waiting 20, 45, 90 and 150 seconds.
//   node scripts/eval-persona.mts --list                             # list the cases (needs no key)
//   node scripts/eval-persona.mts --rescore out.json                 # score a saved run again with today's checks: no key, no calls
//
// The key is read from your environment and never printed. The messages are invented and contain nothing personal. The checks
// are phrase checks (see src/lib/personaChecks.ts): a pass means no known failure phrase, not good judgment, so read the replies.
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { CATEGORIES, PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { DARKBENCH_CASES } from '../src/lib/personaEvalDarkBench.ts';
import { pacedSend, planResume, sampleEvenly, rescore, runCase, summarize, type CaseResult, type RawSent } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const only = flag('--only');
const jsonOut = flag('--json');
const resumeFrom = flag('--resume');
const instructions = flag('--instructions') ?? 'v1';
if (!['v1', 'v2'].includes(instructions)) {
  console.error('--instructions must be v1 or v2.');
  process.exit(2);
}
if (instructions === 'v2') process.env.COACH_INSTRUCTIONS = 'v2';
const paceSeconds = Number(flag('--pace') ?? 3);
if (!(paceSeconds >= 0 && paceSeconds <= 120)) {
  console.error('--pace is a number of seconds between calls, from 0 to 120.');
  process.exit(2);
}
const setName = flag('--set') ?? 'core';
if (!['core', 'darkbench', 'all'].includes(setName)) {
  console.error('--set must be core, darkbench or all.');
  process.exit(2);
}
const pool = setName === 'core' ? PERSONA_CASES : setName === 'darkbench' ? DARKBENCH_CASES : [...PERSONA_CASES, ...DARKBENCH_CASES];

const sampleN = flag('--sample') === undefined ? 0 : Number(flag('--sample'));
if (flag('--sample') !== undefined && !(Number.isInteger(sampleN) && sampleN >= 1)) {
  console.error('--sample is a whole number: how many cases to take from each category.');
  process.exit(2);
}
const filtered = pool.filter((c) => !only || c.id === only || c.category === only);
const chosen = sampleN ? sampleEvenly(filtered, sampleN) : filtered;
if (args.includes('--list')) {
  for (const c of chosen) console.log(`${c.id.padEnd(16)} ${c.category.padEnd(13)} ${c.prompt.slice(0, 100)}`);
  console.log(`\n${chosen.length} cases. Categories: ${CATEGORIES.join(', ')}`);
  process.exit(0);
}
const rescoreFrom = flag('--rescore');
if (rescoreFrom) {
  const saved = JSON.parse(readFileSync(rescoreFrom, 'utf8')).results as CaseResult[];
  const again = rescore(saved, [...PERSONA_CASES, ...DARKBENCH_CASES]);
  const s2 = summarize(again);
  console.log(`Re-scored ${again.length} saved results with today's checks (no model calls): ${s2.pass} passed, ${s2.fail} failed, ${s2.error} errors.`);
  for (const r of again.filter((x) => x.outcome !== 'pass')) console.log(`  ${r.outcome.toUpperCase()} ${r.id}: ${r.failures.join('; ')}`);
  for (const [k, v] of Object.entries(s2.review)) console.log(`  review ${k.padEnd(22)} present in ${v.present} of ${v.of}`);
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), partial: false, rescored: true, summary: s2, results: again }, null, 2));
  process.exit(0);
}
if (!chosen.length) {
  console.error(`Nothing matches --only ${only}. Use --list to see the cases.`);
  process.exit(2);
}
if (!process.env.VENICE_API_KEY) {
  console.error('Set VENICE_API_KEY in your environment first (do not paste it anywhere else).');
  process.exit(2);
}

process.env.COACH_ENABLED = 'true';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
const { default: handler } = await import('../netlify/functions/coach.mts');
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };

const rawSend = async (messages: { role: 'user' | 'assistant'; content: string }[], ticket: string | undefined): Promise<RawSent> => {
  const res = await handler(
    new Request('https://nenya.biz/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' },
      body: JSON.stringify({ messages, session: SESSION, ticket }),
    })
  );
  const j: any = await res.json().catch(() => ({}));
  return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
};
const send = pacedSend(rawSend, {
  paceMs: paceSeconds * 1000,
  backoffMs: [20000, 45000, 90000, 150000],
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  now: () => Date.now(),
  onWait: (ms, attempt, why) => console.log(`  (${why}: waiting ${Math.round(ms / 1000)}s, then trying again, retry ${attempt} of 4)`),
});

let kept: CaseResult[] = [];
let todo = chosen;
if (resumeFrom) {
  try {
    const prev = JSON.parse(readFileSync(resumeFrom, 'utf8')).results as CaseResult[];
    const plan = planResume(prev, chosen);
    kept = plan.kept;
    todo = chosen.filter((c) => plan.todo.some((t) => t.id === c.id));
    console.log(`Resuming: ${kept.length} case(s) already passed or failed in ${resumeFrom} are kept; ${todo.length} to run.`);
  } catch {
    console.error(`Could not read results from ${resumeFrom}. Check the path, or leave --resume off to start fresh.`);
    process.exit(2);
  }
}

if (chosen.some((c) => c.source?.startsWith('darkbench:'))) {
  console.log('Includes prompts from DarkBench (MIT, Esben Kran and colleagues, ICLR 2025). Credit and license: ATTRIBUTIONS.md.');
}
console.log(`Coach instructions: ${instructions}${instructions === 'v2' ? ' (the draft wording; the live site uses v1 until this is adopted)' : ' (the wording the live site uses)'}.`);
const fresh: CaseResult[] = [];
for (const c of todo) {
  const r = await runCase(c, send);
  fresh.push(r);
  const mark = r.outcome === 'pass' ? 'PASS' : r.outcome === 'fail' ? 'FAIL' : 'ERROR';
  console.log(`\n${mark}  ${c.id}  [${c.category}]${r.how !== 'reply' ? `  (${r.how})` : ''}`);
  console.log(`  Person: ${c.prompt}${c.source ? `  [${c.source}]` : ''}`);
  if (r.reply) console.log(`  Coach:  ${r.reply.replace(/\n+/g, ' ')}`);
  for (const f of r.failures) console.log(`  !! ${f}`);
  const shown = r.review.filter((x) => x.present).map((x) => x.check);
  const absent = r.review.filter((x) => !x.present).map((x) => x.check);
  if (r.review.length) console.log(`  review: present [${shown.join(', ') || 'none'}], absent [${absent.join(', ') || 'none'}]`);
  console.log(`  good looks like: ${c.note}`);
  // Saved after every case, so a run that is stopped (or crashes) can be continued with --resume instead of lost.
  if (jsonOut) {
    const soFar = chosen.map((x) => fresh.find((q) => q.id === x.id) ?? kept.find((q) => q.id === x.id)).filter(Boolean) as CaseResult[];
    writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), instructions, partial: soFar.length < chosen.length, summary: summarize(soFar), results: soFar }, null, 2));
  }
}

const results = chosen.map((c) => fresh.find((r) => r.id === c.id) ?? kept.find((r) => r.id === c.id)!).filter(Boolean);
const s = summarize(results);
console.log(`\n=== ${s.pass} passed, ${s.fail} failed, ${s.error} errors, of ${s.total} ===`);
for (const [cat, n] of Object.entries(s.byCategory)) console.log(`  ${cat.padEnd(13)} pass ${n.pass}  fail ${n.fail}  error ${n.error}`);
const reviewLines = Object.entries(s.review).map(([k, v]) => `  ${k.padEnd(22)} present in ${v.present} of ${v.of}`);
if (reviewLines.length) console.log(`\nReview checks (they never fail a case; they show what the pass/fail checks cannot):\n${reviewLines.join('\n')}`);
if (s.failing.length) console.log(`\nTo read a failing case in full: --only <id>. Failing: ${s.failing.join(', ')}`);
console.log('\nA pass means no known failure phrase. Read the replies: tone, warmth and honesty are yours to judge.');
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), instructions, partial: false, summary: s, results }, null, 2));
  console.log(`Results written to ${jsonOut}`);
}
process.exit(s.fail || s.error ? 1 : 0);
