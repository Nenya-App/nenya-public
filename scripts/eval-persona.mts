// Plays the persona evaluation set (src/lib/personaEvalSet.ts) through the coach function and reports which replies cross an
// honest line: invent a human life, deny being an AI, promise to remember, say it will miss someone, pressure a relationship,
// stand in for a person in a crisis, play therapist, or turn the goodbye into a bond. Run it in your own terminal. The core set is
// 38 cases (roughly 55 model calls with your key, since some have a few earlier messages); --set darkbench adds 220 single-message
// prompts borrowed from DarkBench (MIT; see ATTRIBUTIONS.md), about 220 calls.
//
//   VENICE_API_KEY=... node scripts/eval-persona.mts                 # the core set
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set darkbench # only the 220 DarkBench prompts (or --set all for core, the coverage set and DarkBench together)
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set guards    # the coverage set (src/lib/personaEvalGuardSet.ts): each guard and safety path by name, and a sibling paraphrase of every stop and soften case
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set moves     # the coaching-moves set (src/lib/personaEvalMovesSet.ts): 36 messages, four for each of the nine private modules; use it with --private <folder>
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set coercion --private <folder>   # the coercion-modules set (src/lib/personaEvalCoercionSet.ts): 32 messages for the three private coercion modules and eleven boundary cases (39 in all); switches the (otherwise off) coercion modules on for this run only; see docs/coercion-modules-scope.md
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set sst --sst-file <path> --private <folder> --pace 6 --json out.json   # SimpleSafetyTests (CC BY 4.0), 100 prompts in five harm areas, read from YOUR local copy of the official file (the prompts are not in this repository; without --sst-file the script says how to download it); every case is also marked for you to read; see docs/sst-persona-set.md
//   VENICE_API_KEY=... node scripts/eval-persona.mts --condition "what is different about this run"   # the label the saved run carries (a condition, never called a baseline)
//   VENICE_API_KEY=... node scripts/eval-persona.mts --only memory   # one category (e.g. human-life, identity, memory, care,
//                                                                    #   relationship, steering, crisis, therapy, closing) or one id
//   VENICE_API_KEY=... node scripts/eval-persona.mts --json out.json # also write the results, to compare runs over time
//   VENICE_API_KEY=... node scripts/eval-persona.mts --instructions v2   # the draft instruction wording (default v1, the live one); run both to compare
//   VENICE_API_KEY=... node scripts/eval-persona.mts --set darkbench --sample 20   # 20 evenly spaced cases from each category: a faster run when the key is rate limited
//   VENICE_API_KEY=... node scripts/eval-persona.mts --card nenya-20   # test a Venice character card ON ITS OWN (what a visitor met after the old "Continue on Venice" link, removed 2026-11-24), with the same messages;
//                                                                      #   --card-model <id> picks the model (default deepseek-v3.2). Run it on the old and new card and compare the results.
//   VENICE_API_KEY=... node scripts/eval-persona.mts --pace 6        # at least 6 seconds between calls (default 3); slower if your key is rate limited
//   VENICE_API_KEY=... node scripts/eval-persona.mts --resume out.json --json out.json   # skip cases that already passed or failed in an earlier run
// A call that is rate limited (or hits a brief model error or timeout) is retried automatically after waiting 20, 45, 90 and 150 seconds.
//   VENICE_API_KEY=... node scripts/eval-persona.mts --private <folder>   # also give the coach the private text (modules.json, method-notes.txt, learn-icarus.txt, kept OUTSIDE the repo), as the live site does, with the distress text on
//   VENICE_API_KEY=... node scripts/eval-persona.mts --layers          # also record the model's FIRST reply and what each guard did, to see what the outer layers add (scripts/layers-report.mts compares runs)
//   node scripts/eval-persona.mts --list                             # list the cases (needs no key)
//   node scripts/eval-persona.mts --rescore out.json                 # score a saved run again with today's checks: no key, no calls
//
// The key is read from your environment and never printed. The messages are invented and contain nothing personal. The checks
// are phrase checks (see src/lib/personaChecks.ts): a pass means no known failure phrase, not good judgment, so read the replies.
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { CATEGORIES, PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { DARKBENCH_CASES } from '../src/lib/personaEvalDarkBench.ts';
import { GUARD_CASES } from '../src/lib/personaEvalGuardSet.ts';
import { MOVE_CASES } from '../src/lib/personaEvalMovesSet.ts';
import { COERCION_CASES } from '../src/lib/personaEvalCoercionSet.ts';
import { setCoercionModules } from '../src/lib/coachModules.ts';
import { buildCardRequest, isCardSlug, readCardReply, VENICE_CHAT_URL } from '../src/lib/veniceCard.ts';
import { coachModel } from '../src/lib/coachProvider.ts';
import { guardInfoFrom, layerRecord, summarizeLayers } from '../src/lib/layerTrace.ts';
import { parseSst, sstCases, sstDownloadHelp, sstSha256, SST_SHA256, SST_SUMMARY_NOTE } from '../src/lib/personaEvalSst.ts';
import { assertOneModel, checkHeader, pacedSend, planResume, runIncompleteReasons, sampleEvenly, rescore, runCase, summarize, type CaseResult, type RawSent } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const only = flag('--only');
const jsonOut = flag('--json');
const resumeFrom = flag('--resume');
const card = flag('--card');
if (card !== undefined && !isCardSlug(card)) {
  console.error('--card is a Venice character slug: the part after venice.ai/c/ (letters, digits and hyphens).');
  process.exit(2);
}
const cardModel = flag('--card-model') ?? 'deepseek-v3.2';
const instructions = card ? `card:${card}` : (flag('--instructions') ?? 'v1');
if (!card && !['v1', 'v2', 'v2.1', 'v2.2'].includes(instructions)) {
  console.error('--instructions must be v1, v2, v2.1 or v2.2.');
  process.exit(2);
}
if (instructions === 'v2' || instructions === 'v2.1' || instructions === 'v2.2') process.env.COACH_INSTRUCTIONS = instructions;
const paceSeconds = Number(flag('--pace') ?? 3);
if (!(paceSeconds >= 0 && paceSeconds <= 120)) {
  console.error('--pace is a number of seconds between calls, from 0 to 120.');
  process.exit(2);
}
const setName = flag('--set') ?? 'core';
if (!['core', 'darkbench', 'guards', 'moves', 'coercion', 'sst', 'all'].includes(setName)) {
  console.error('--set must be core, darkbench, guards, moves, coercion, sst or all.');
  process.exit(2);
}
// SimpleSafetyTests: the prompts are read from a local copy of the official file (never stored in the repository). Without --sst-file the run stops and says how to get it.
const sstFile = flag('--sst-file');
let SST_CASES: ReturnType<typeof sstCases> = [];
let sstInfo: { file: string; sha256: string; matchesPublished: boolean } | undefined;
if (sstFile !== undefined || setName === 'sst') {
  if (!sstFile) {
    console.error(sstDownloadHelp());
    process.exit(2);
  }
  try {
    const bytes = readFileSync(sstFile);
    const sha256 = sstSha256(bytes);
    SST_CASES = sstCases(parseSst(bytes.toString('utf8'), /\.json$/i.test(sstFile) ? 'json' : 'csv'));
    sstInfo = { file: sstFile.split('/').pop() ?? sstFile, sha256, matchesPublished: sha256 === SST_SHA256 };
    if (!sstInfo.matchesPublished && /\.csv$/i.test(sstFile)) console.log(`Note: the file's sha256 (${sha256}) is not the one this script was written against (${SST_SHA256}). The file may have changed upstream; the run goes on.`);
  } catch (e) {
    console.error(`Could not read the SimpleSafetyTests file ${sstFile}: ${(e as Error).message}\n\n${sstDownloadHelp()}`);
    process.exit(2);
  }
}
const pool = setName === 'core' ? PERSONA_CASES : setName === 'darkbench' ? DARKBENCH_CASES : setName === 'guards' ? GUARD_CASES : setName === 'moves' ? MOVE_CASES : setName === 'coercion' ? COERCION_CASES : setName === 'sst' ? SST_CASES : [...PERSONA_CASES, ...GUARD_CASES, ...DARKBENCH_CASES];

// The coercion modules are off everywhere (no environment variable switches them on); this run, and only this run, switches them on in code, and only for `--set coercion`.
if (setName === 'coercion') {
  setCoercionModules(true);
  if (!flag('--private')) console.log('Note: without --private <folder> the coach has no module text, so the three coercion modules are selected but add nothing. Add --private to test them.');
}
const sampleN = flag('--sample') === undefined ? 0 : Number(flag('--sample'));
if (flag('--sample') !== undefined && !(Number.isInteger(sampleN) && sampleN >= 1)) {
  console.error('--sample is a whole number: how many cases to take from each category.');
  process.exit(2);
}
const filtered = pool.filter((c) => !only || c.id === only || c.category === only);
const chosen = sampleN ? sampleEvenly(filtered, sampleN) : filtered;
if (args.includes('--list')) {
  // SST cases are listed by id and category only, never by prompt text.
  for (const c of chosen) console.log(`${c.id.padEnd(16)} ${c.category.padEnd(13)} ${c.humanReview ? '' : c.prompt.slice(0, 100)}`.trimEnd());
  console.log(`\n${chosen.length} cases. Categories: ${setName === 'sst' ? [...new Set(chosen.map((c) => c.category))].join(', ') : CATEGORIES.join(', ')}`);
  process.exit(0);
}
const rescoreFrom = flag('--rescore');
if (rescoreFrom) {
  const saved = JSON.parse(readFileSync(rescoreFrom, 'utf8')).results as CaseResult[];
  const again = rescore(saved, [...PERSONA_CASES, ...GUARD_CASES, ...MOVE_CASES, ...COERCION_CASES, ...DARKBENCH_CASES, ...SST_CASES], { cards: true, distress: true });
  const s2 = summarize(again);
  console.log(`Re-scored ${again.length} saved results with today's checks (no model calls): ${s2.pass} passed, ${s2.fail} failed, ${s2.error} errors.`);
  for (const r of again.filter((x) => x.outcome !== 'pass')) console.log(`  ${r.outcome.toUpperCase()} ${r.id}: ${r.failures.join('; ')}`);
  for (const [k, v] of Object.entries(s2.review)) console.log(`  review ${k.padEnd(22)} present in ${v.present} of ${v.of}`);
  console.log(`  "feel like" before a thought, model-written replies only: ${s2.feelLike?.count ?? 0} of ${s2.feelLike?.of ?? 0}${s2.feelLike?.rate == null ? '' : ` (${(s2.feelLike.rate * 100).toFixed(1)}%)`}`);
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
const { default: handler, __useStoreForTests, __trace, __instructionsFingerprint } = await import('../netlify/functions/coach.mts');
const withLayers = process.argv.includes('--layers'); // record the model's first reply and what the guards did (docs/outer-layers-scope.md)
__trace.on(true); // always: what the guards did is recorded for every case (guard.retried, guard.replaced); --layers adds the model's own first reply
let lastTrace: ReturnType<typeof __trace.take> | null = null;
// --private <folder>: the coach reads its private text from memory (never the repository), and the live site's own settings are on, so the run is like production.
const privateDir = flag('--private');
if (privateDir) {
  const { existsSync, readFileSync: rf } = await import('node:fs');
  const { join } = await import('node:path');
  const text = new Map<string, string>([['modules', rf(join(privateDir, 'modules.json'), 'utf8')]]);
  for (const [key, file] of [['method-notes', 'method-notes.txt'], ['learn-icarus', 'learn-icarus.txt']]) if (existsSync(join(privateDir, file))) text.set(key, rf(join(privateDir, file), 'utf8'));
  const m = new Map<string, { v: string; e: number }>();
  __useStoreForTests({
    async get(k: string) { return text.get(k) ?? m.get(k)?.v ?? null; },
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any = {}) { const x = m.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; m.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
    async setJSON(k: string, v: unknown) { m.set(k, { v: JSON.stringify(v), e: (m.get(k)?.e ?? 0) + 1 }); },
    async list({ prefix = '' }: { prefix?: string } = {}) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { m.delete(k); },
  });
  Object.assign(process.env, { COACH_MODULES: 'on', COACH_DISTRESS_TEXT: 'on', COACH_VALUES: 'on', COACH_STANCES: 'learn' });
}
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };

const rawSend = async (messages: { role: 'user' | 'assistant'; content: string }[], ticket: string | undefined): Promise<RawSent> => {
  __trace.take();
  const res = await handler(
    new Request('https://nenya.biz/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' },
      body: JSON.stringify({ messages, session: SESSION, ticket }),
    })
  );
  lastTrace = __trace.take();
  const j: any = await res.json().catch(() => ({}));
  return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, problem: j.problem, flag: j.flag, done: j.done, ...(j.card ? { card: { id: j.card.id, partial: !!j.card.partial } } : {}), guard: guardInfoFrom(lastTrace!), status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
};
// A Venice character on its own: no Nenya instructions, no protections (see src/lib/veniceCard.ts).
const cardSend = async (messages: { role: 'user' | 'assistant'; content: string }[]): Promise<RawSent> => {
  try {
    const res = await fetch(VENICE_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.VENICE_API_KEY}` },
      body: JSON.stringify(buildCardRequest(card!, cardModel, messages)),
    });
    if (!res.ok) return { status: res.status, error: `upstream status-${res.status}` }; // the status only
    const reply = readCardReply(await res.json().catch(() => null));
    return reply ? { reply, status: 200 } : { error: 'empty', status: 200 };
  } catch {
    return { error: 'upstream network' };
  }
};
const send = pacedSend(card ? cardSend : rawSend, {
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

if (chosen.some((c) => c.source?.startsWith('sst:'))) {
  console.log('Includes prompts from SimpleSafetyTests (CC BY 4.0, Bertie Vidgen and colleagues, 2023), loaded unmodified from your local copy of the official file. Credit and licence: ATTRIBUTIONS.md.');
}
if (chosen.some((c) => c.source?.startsWith('darkbench:'))) {
  console.log('Includes prompts from DarkBench (MIT, Esben Kran and colleagues, ICLR 2025). Credit and license: ATTRIBUTIONS.md.');
}
const fingerprint = card ? `card:${card}` : __instructionsFingerprint();
const condition = flag('--condition') ?? (card ? `the Venice character ${card} on its own, model ${cardModel}` : `instructions ${instructions} as they stand in this checkout (fingerprint ${fingerprint}), guards on`);
console.log(card ? `Testing the Venice character "${card}" on its own (model ${cardModel}): no Nenya instructions and none of Nenya's protections, as a visitor on Venice meets it.` : `Coach instructions: ${instructions}${instructions === 'v2' ? ' (the draft wording; the live site uses v1 until this is adopted)' : ' (the wording the live site uses)'}.`);
const fresh: CaseResult[] = [];
const modelName = card ? cardModel : coachModel();
// The pre-written answers are asserted when the site's own answers are on (they are, unless COACH_ABOUT_ANSWERS=off), and the site's distress sentence when the distress text is on (--private turns it on).
const judging = { cards: !card && process.env.COACH_ABOUT_ANSWERS !== 'off', distress: !card && process.env.COACH_DISTRESS_TEXT === 'on' };
for (const c of todo) {
  const r = await runCase(c, send, judging);
  r.model = modelName;
  if (withLayers && lastTrace) (r as CaseResult & { layers?: unknown }).layers = layerRecord(c, lastTrace);
  fresh.push(r);
  const mark = r.outcome === 'pass' ? 'PASS' : r.outcome === 'fail' ? 'FAIL' : 'ERROR';
  console.log(`\n${mark}  ${c.id}  [${c.category}]${r.how !== 'reply' ? `  (${r.how})` : ''}`);
  console.log(c.humanReview ? `  Person: (prompt not shown: ${c.source}; read it in your own copy of the file)` : `  Person: ${c.prompt}${c.source ? `  [${c.source}]` : ''}`);
  if (r.reply) console.log(`  Coach:  ${r.reply.replace(/\n+/g, ' ')}`);
  for (const f of r.failures) console.log(`  !! ${f}`);
  const shown = r.review.filter((x) => x.present).map((x) => x.check);
  const absent = r.review.filter((x) => !x.present).map((x) => x.check);
  if (r.review.length) console.log(`  review: present [${shown.join(', ') || 'none'}], absent [${absent.join(', ') || 'none'}]`);
  console.log(`  good looks like: ${c.note}`);
  // Saved after every case, so a run that is stopped (or crashes) can be continued with --resume instead of lost.
  if (jsonOut) {
    const soFar = chosen.map((x) => fresh.find((q) => q.id === x.id) ?? kept.find((q) => q.id === x.id)).filter(Boolean) as CaseResult[];
    writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), kind: 'condition', condition, instructions, fingerprint, model: modelName, distressText: process.env.COACH_DISTRESS_TEXT === 'on', caseIds: chosen.map((x) => x.id), partial: soFar.length < chosen.length, summary: summarize(soFar), results: soFar }, null, 2));
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
if (s.humanReview) console.log(`\n${SST_SUMMARY_NOTE} ${s.humanReview} of ${s.total} case(s) are marked for a person to read, including every pass.`);
if (jsonOut) {
  // What a saved run must carry (Venice's review, 2026-11-22): a fingerprint that is not null, one model for every result, the case list, and whether the run is complete.
  const problems = checkHeader({ condition, instructions, model: modelName, fingerprint, caseIds: chosen.map((x) => x.id) });
  try { assertOneModel(results.filter((r) => !r.cached), modelName); } catch (e) { problems.push((e as Error).message); }
  const incompleteReasons = runIncompleteReasons(results, chosen);
  if (problems.length) {
    console.error(`Not saving ${jsonOut}: ${problems.join('; ')}`);
    process.exitCode = 1;
  } else {
    writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), kind: 'condition', condition, instructions, fingerprint, model: modelName, distressText: process.env.COACH_DISTRESS_TEXT === 'on', caseIds: chosen.map((x) => x.id), ...(sstInfo ? { sst: { ...sstInfo, note: SST_SUMMARY_NOTE } } : {}), partial: false, incomplete: incompleteReasons.length > 0, incompleteReasons, summary: s, results }, null, 2));
    console.log(`Results written to ${jsonOut}${incompleteReasons.length ? `  (INCOMPLETE: ${incompleteReasons.join('; ')})` : ''}`);
  }
}
console.log(`Who wrote what the person saw: ${s.sources.card} cards, ${s.sources.model} model replies, ${s.sources.site} site sentences, ${s.sources.notice} notices, ${s.sources.cached} cached (kept from an earlier run). Model-only: ${s.modelOnly.pass} passed, ${s.modelOnly.fail} failed of ${s.modelOnly.of}. ${s.reviewNeeded} pass(es) to read because a guard replaced the reply.`);
console.log(`"Feel like" before a thought (review only, model-written replies only): ${s.feelLike?.count ?? 0} of ${s.feelLike?.of ?? 0}${s.feelLike?.rate == null ? '' : ` (${(s.feelLike.rate * 100).toFixed(1)}%)`}.`);
process.exit(s.fail || s.error ? 1 : 0);
