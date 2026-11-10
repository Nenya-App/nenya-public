// Runs a sample of an open prompt set (src/lib/testSets.ts) against a DEPLOYED coach, one message at a time, and writes a result you can publish: counts and prompt ids
// only, with the credit the set's licence asks for, how the sample was chosen, and what the numbers do not show. A second file, kept private, holds the prompts and replies
// so a person can read them (the numbers are only half of the result). The data is never in this repository: download the set to a folder of your own first.
//
//   read -s NENYA_OWNER_TOKEN; export NENYA_OWNER_TOKEN
//   node scripts/eval-prompts.mts --url https://nenyastaging.netlify.app --set xstest --file ~/Downloads/nenya-test-prompts/xstest_prompts.csv --n 50 --seed 1
//   ... --quote 3        # put up to 3 short example prompts in the public file (only for sets whose licence allows it)
//   ... --pace 5         # seconds between messages (default 5)
//   node scripts/eval-prompts.mts --sets               # the sets, their licences, and what each allows
// Sets: xstest (CSV), oasst2 (the message export, JSON lines), dolly (JSON lines), esconv (JSON). Output goes to your Downloads folder.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { TEST_SETS, creditsFor } from '../src/lib/testSets.ts';
import { readPrompts, sample, summarize, type Outcome } from '../src/lib/promptEval.ts';
import { arcProblems } from '../src/lib/practiceArc.ts';
import { detectDirectQuestion } from '../src/lib/coachIntent.ts';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
if (args.includes('--sets')) {
  for (const s of Object.values(TEST_SETS)) console.log(`${s.id.padEnd(7)} ${s.name}: ${s.licence} (${s.licenceChecked}); quote ${s.may.quoteShort ? 'yes' : 'no'}, redistribute ${s.may.redistribute ? 'yes' : 'no'}, train ${s.may.train ? 'yes' : 'no'}\n        ${s.note}`);
  process.exit(0);
}
const url = flag('--url'), setId = flag('--set'), file = flag('--file');
if (!url || !setId || !file) { console.error('Needs --url (the dev site), --set (xstest, oasst2, dolly or esconv) and --file (the downloaded data). --sets lists the sets.'); process.exit(2); }
const set = TEST_SETS[setId];
if (!set) { console.error(`Unknown set "${setId}". --sets lists them.`); process.exit(2); }
const origin = new URL(url);
const n = Number(flag('--n') ?? 25), seed = Number(flag('--seed') ?? 1), pace = Number(flag('--pace') ?? 5) * 1000, quote = Math.max(0, Number(flag('--quote') ?? 0));
const token = process.env.NENYA_OWNER_TOKEN;
if (!token) console.log('(No NENYA_OWNER_TOKEN: using the visitor allowance, 10 turns a day. Set it to run more than a few.)\n');
if (set.licenceChecked !== 'verified') console.log(`NOTE: ${set.name}'s licence is not marked verified. Read it at ${set.url} before publishing anything.\n`);

const pool = readPrompts(setId, readFileSync(file.replace(/^~/, homedir()), 'utf8'));
const chosen = sample(pool, n, seed);
console.log(`${set.name}: ${pool.length} prompts in the file, ${chosen.length} chosen (seed ${seed}). About ${Math.round((chosen.length * pace) / 60000)} minutes.\n`);

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const outcomes: Outcome[] = [];
const priv: string[] = [];
let refusedInARow = 0;
for (const p of chosen) {
  const res = await fetch(`${origin.origin}/api/coach`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: origin.origin, ...(token ? { 'x-nenya-owner': token } : {}) },
    body: JSON.stringify({ messages: [{ role: 'user', content: p.text.slice(0, 500) }], session: { color1: '#7a9b9e', color2: '#DAC682' }, shown: [] }),
  });
  const j: any = await res.json().catch(() => ({}));
  const reply: string = j.reply ?? '';
  // The practice's checks do not apply to a how-to or factual question (the site answers those first) or to a site-written card.
  const checks = res.ok && !j.card && !detectDirectQuestion(p.text) ? arcProblems(reply, { turn: 1, max: 5, userTexts: [p.text] }).map((c) => c.check) : [];
  outcomes.push({
    id: p.id, group: p.group, status: res.status, flag: j.flag ? `${j.flag.tier ?? ''}:${j.flag.category ?? ''}` : '', blocked: !!j.blocked,
    card: j.card ? String(j.card.id ?? j.card.title ?? 'card') : '', offer: j.offer ? String(j.offer.id ?? 'offer') : '', replyWords: (reply.match(/\S+/g) ?? []).length, checks,
  });
  priv.push(`[${p.id}] ${p.group}\nPrompt: ${p.text}\nStatus ${res.status}${j.flag ? ` flag ${JSON.stringify(j.flag)}` : ''}${j.blocked ? ' blocked' : ''}\nReply: ${reply || JSON.stringify(j)}\n${checks.length ? 'CHECKS: ' + checks.join(', ') + '\n' : ''}`);
  process.stdout.write(res.ok ? '.' : `x(${res.status})`);
  refusedInARow = res.ok ? 0 : refusedInARow + 1;
  if (refusedInARow >= 3) { console.log('\nThe site refused three in a row (a limit, or the allowance). Stopping here; what was done is saved.'); break; }
  await sleep(pace);
}
console.log('\n');

const sum = summarize(outcomes);
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const dir = join(homedir(), 'Downloads');
const header = {
  set: set.id, name: set.name, authors: set.authors, source: set.url, licence: set.licence, licenceChecked: set.licenceChecked, credit: set.credit,
  poolSize: pool.length, sampled: chosen.length, seed, sampling: 'A seeded shuffle of the whole file, first n taken (src/lib/promptEval.ts, sample)', site: origin.origin, date: new Date().toISOString().slice(0, 10),
  notRun: 'Each prompt was sent alone as the first message of a conversation. Nothing shows how the coach does later in a conversation, and the checks are phrase checks, not judgments.',
};
const examples = set.may.quoteShort && quote ? chosen.slice(0, quote).map((p) => ({ id: p.id, prompt: p.text.slice(0, 200) })) : [];
const publicFile = join(dir, `prompt-eval-${set.id}-${stamp}.json`);
writeFileSync(publicFile, JSON.stringify({ header, summary: sum, outcomes, ...(examples.length ? { examples } : {}) }, null, 2) + '\n');
const privateFile = join(dir, `PRIVATE-prompt-eval-${set.id}-${stamp}.txt`);
writeFileSync(privateFile, `PRIVATE: prompts and replies for a person to read. Do not publish. ${set.name} (${set.licence}); credit: ${set.credit}\n\n${priv.join('\n')}`);
const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
const md = `# ${set.name}: the coach on the dev site, ${header.date}

Prompts: ${sum.n} answered of ${chosen.length} sampled from ${pool.length} (seed ${seed}); ${sum.refused} refused by the site. Site: ${origin.origin}.

| What the site did | Prompts |
| --- | --- |
| Flagged for distress or harm | ${Object.values(sum.flagged).reduce((a, b) => a + b, 0)} (${pct(sum.flaggedShare.low)} to ${pct(sum.flaggedShare.high)}, 95% interval) |
| Stopped by the steering screen | ${sum.blocked} |
| Answered with a site-written card | ${sum.card} |
| A learning card offered | ${sum.offer} |
| A practice-arc check tripped | ${sum.withChecks} |
| Mean reply length | ${sum.meanReplyWords} words |

Flags by kind: ${Object.entries(sum.flagged).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}.

## What this does not show
${header.notRun} The sample is small, a person read the replies (not recorded here), and a flag on a prompt that really is about harm is not a false alarm. Read the counts with the prompt ids, not instead of them.

## Credit
${creditsFor([set.id]).join('\n')}
`;
const mdFile = join(dir, `prompt-eval-${set.id}-${stamp}.md`);
writeFileSync(mdFile, md);
console.log(md);
console.log(`Saved:\n  ${publicFile}\n  ${mdFile}\n  ${privateFile}   (private: read it, do not publish it)`);
