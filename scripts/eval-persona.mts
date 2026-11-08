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
//   node scripts/eval-persona.mts --list                             # list the cases (needs no key)
//
// The key is read from your environment and never printed. The messages are invented and contain nothing personal. The checks
// are phrase checks (see src/lib/personaChecks.ts): a pass means no known failure phrase, not good judgment, so read the replies.
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { CATEGORIES, PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { DARKBENCH_CASES } from '../src/lib/personaEvalDarkBench.ts';
import { runCase, summarize, type Send } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const only = flag('--only');
const jsonOut = flag('--json');
const setName = flag('--set') ?? 'core';
if (!['core', 'darkbench', 'all'].includes(setName)) {
  console.error('--set must be core, darkbench or all.');
  process.exit(2);
}
const pool = setName === 'core' ? PERSONA_CASES : setName === 'darkbench' ? DARKBENCH_CASES : [...PERSONA_CASES, ...DARKBENCH_CASES];

const chosen = pool.filter((c) => !only || c.id === only || c.category === only);
if (args.includes('--list')) {
  for (const c of chosen) console.log(`${c.id.padEnd(16)} ${c.category.padEnd(13)} ${c.prompt.slice(0, 100)}`);
  console.log(`\n${chosen.length} cases. Categories: ${CATEGORIES.join(', ')}`);
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

const send: Send = async (messages, ticket) => {
  const res = await handler(
    new Request('https://nenya.biz/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' },
      body: JSON.stringify({ messages, session: SESSION, ticket }),
    })
  );
  const j: any = await res.json().catch(() => ({}));
  return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
};

if (chosen.some((c) => c.source?.startsWith('darkbench:'))) {
  console.log('Includes prompts from DarkBench (MIT, Esben Kran and colleagues, ICLR 2025). Credit and license: ATTRIBUTIONS.md.');
}
const results = [];
for (const c of chosen) {
  const r = await runCase(c, send);
  results.push(r);
  const mark = r.outcome === 'pass' ? 'PASS' : r.outcome === 'fail' ? 'FAIL' : 'ERROR';
  console.log(`\n${mark}  ${c.id}  [${c.category}]${r.how !== 'reply' ? `  (${r.how})` : ''}`);
  console.log(`  Person: ${c.prompt}${c.source ? `  [${c.source}]` : ''}`);
  if (r.reply) console.log(`  Coach:  ${r.reply.replace(/\n+/g, ' ')}`);
  for (const f of r.failures) console.log(`  !! ${f}`);
  const shown = r.review.filter((x) => x.present).map((x) => x.check);
  const absent = r.review.filter((x) => !x.present).map((x) => x.check);
  if (r.review.length) console.log(`  review: present [${shown.join(', ') || 'none'}], absent [${absent.join(', ') || 'none'}]`);
  console.log(`  good looks like: ${c.note}`);
}

const s = summarize(results);
console.log(`\n=== ${s.pass} passed, ${s.fail} failed, ${s.error} errors, of ${s.total} ===`);
for (const [cat, n] of Object.entries(s.byCategory)) console.log(`  ${cat.padEnd(13)} pass ${n.pass}  fail ${n.fail}  error ${n.error}`);
if (s.failing.length) console.log(`\nTo read a failing case in full: --only <id>. Failing: ${s.failing.join(', ')}`);
console.log('\nA pass means no known failure phrase. Read the replies: tone, warmth and honesty are yours to judge.');
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), summary: s, results }, null, 2));
  console.log(`Results written to ${jsonOut}`);
}
process.exit(s.fail || s.error ? 1 : 0);
