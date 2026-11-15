// A holistic test of the coach on a DEPLOYED site (the dev site): about 50 short conversations across the language lane, the site's own answers, safety, the practice arc, questions about the world,
// names, the history and violence stance and cards, and the Learn stance. It checks what the SITE decided (hard: deterministic) and what the MODEL said (soft: phrase checks, read the reply).
//
//   read -s NENYA_OWNER_TOKEN; export NENYA_OWNER_TOKEN       # once per terminal window; the token is never printed
//   node scripts/holistic-coach.mts --url https://nenyastaging.netlify.app
//   ... --off learn,values     # switches that are OFF on the site: scenarios that need them are skipped (default: arc, values, offers and learn are assumed ON)
//   ... --only lane,safety     # just these groups (--groups lists them)       ... --pace 4     # seconds between messages (default 4)
// It prints one line per scenario and the failures, and saves every conversation to the research folder (results/dev-checks/) for reading. A "hard" failure is a real defect or a switch that is not
// on; a "soft" miss means read that reply. Allow about 8 minutes. The site's own settings decide what it does: set COACH_ARC=practice, COACH_VALUES=on, COACH_LEARNING_OFFERS=on and
// COACH_STANCES=learn (and redeploy) for the full run.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureResearchDirs } from '../src/lib/researchDir.ts';
import { GROUPS, SCENARIOS, evaluate, type Need, type ScenarioResult, type Turn } from '../src/lib/holisticSuite.ts';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
if (args.includes('--groups')) { for (const g of GROUPS) console.log(`${g.padEnd(16)} ${SCENARIOS.filter((s) => s.group === g).length} scenarios`); process.exit(0); }
const url = flag('--url');
if (!url) { console.error('Give the dev site with --url, for example --url https://nenyastaging.netlify.app (--groups lists the groups).'); process.exit(2); }
const origin = new URL(url);
const off = new Set((flag('--off') ?? '').split(',').map((x) => x.trim()).filter(Boolean) as Need[]);
const only = new Set((flag('--only') ?? '').split(',').map((x) => x.trim()).filter(Boolean));
const pace = Number(flag('--pace') ?? 4) * 1000;
const token = process.env.NENYA_OWNER_TOKEN;
if (!token) console.log('(No NENYA_OWNER_TOKEN: using the visitor allowance, 10 turns a day. The full run needs the token.)\n');
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const results: ScenarioResult[] = [];
let stop = false;
for (const s of SCENARIOS) {
  if (only.size && !only.has(s.group)) continue;
  const missing = (s.needs ?? []).filter((n) => off.has(n));
  if (missing.length) { results.push({ id: s.id, group: s.group, skipped: `needs ${missing.join(', ')} (reported off)`, hardFailed: [], softMissed: [], turns: [] }); continue; }
  const history: { role: 'user' | 'assistant'; content: string }[] = [];
  const turns: Turn[] = [];
  let ticket: string | undefined;
  for (const text of s.say) {
    history.push({ role: 'user', content: text });
    let j: any = {}, status = 0;
    try {
      const res = await fetch(`${origin.origin}/api/coach`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: origin.origin, ...(token ? { 'x-nenya-owner': token } : {}) },
        body: JSON.stringify({ messages: history, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket, shown: [], ...(s.stance ? { stance: s.stance } : {}) }),
      });
      status = res.status;
      j = await res.json().catch(() => ({}));
    } catch { status = 0; }
    const reply: string = j.reply ?? '';
    turns.push({ say: text, reply, turn: j.turn ?? turns.length + 1, done: !!j.done, status, flag: j.flag ? `${j.flag.tier ?? ''}:${j.flag.category ?? ''}` : '', blocked: j.blocked ? String(j.blocked) : '', card: j.card ? String(j.card.id ?? j.card.title ?? 'card') : '', offer: j.offer ? String(j.offer.id ?? 'offer') : '' });
    if (status !== 200) break;
    ticket = j.ticket;
    history.push({ role: 'assistant', content: reply });
    if (j.done || j.flag?.tier === 'stop' || j.blocked) break;
    await sleep(pace);
  }
  const r = evaluate(s, turns);
  results.push(r);
  const mark = r.hardFailed.length ? 'FAIL' : r.softMissed.length ? 'read' : 'pass';
  process.stdout.write(`${mark.padEnd(5)} ${s.id}\n`);
  if (turns.some((t) => t.status === 429 || t.status === 403 || t.status === 503)) { console.log('\nThe site refused (a limit or a switch). Stopping; what ran is saved.'); stop = true; }
  if (stop) break;
}

const ran = results.filter((r) => !r.skipped);
const hardFails = ran.filter((r) => r.hardFailed.length);
const softMiss = ran.filter((r) => !r.hardFailed.length && r.softMissed.length);
const lines: string[] = [];
const out = (s = ''): void => { lines.push(s); };
out(`Holistic test of the coach, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC, ${origin.origin}. Switches reported off: ${[...off].join(', ') || 'none'}.`);
out(`${ran.length} scenarios run, ${results.length - ran.length} skipped. Hard: ${ran.length - hardFails.length} pass, ${hardFails.length} fail. Soft: ${ran.length - hardFails.length - softMiss.length} pass, ${softMiss.length} to read.\n`);
for (const r of results) {
  if (r.skipped) { out(`skip  ${r.id}: ${r.skipped}`); continue; }
  const mark = r.hardFailed.length ? 'FAIL' : r.softMissed.length ? 'read' : 'pass';
  out(`${mark.padEnd(5)} [${r.group}] ${r.id}`);
  for (const t of r.turns) out(`        You: ${t.say}\n        Coach (exchange ${t.turn}${t.done ? ', last' : ''}, status ${t.status}${t.flag ? ', flag ' + t.flag : ''}${t.blocked ? ', blocked ' + t.blocked : ''}${t.card ? ', card ' + t.card : ''}${t.offer ? ', offered ' + t.offer : ''}): ${t.reply.replace(/\n/g, ' ')}`);
  for (const f of r.hardFailed) out(`        HARD FAIL: should be ${f}`);
  for (const f of r.softMissed) out(`        read: ${f}`);
}
const dir = ensureResearchDirs().devChecks;
const file = join(dir, `holistic-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.txt`);
writeFileSync(file, lines.join('\n') + '\n');
console.log(`\n${lines[1]}`);
if (hardFails.length) {
  console.log('\nHard failures:');
  for (const r of hardFails) console.log(`  ${r.id}: should be ${r.hardFailed.join('; ')}  (reply: ${(r.turns[r.turns.length - 1]?.reply ?? '').slice(0, 110).replace(/\n/g, ' ')})`);
}
if (softMiss.length) console.log(`\nTo read (soft): ${softMiss.map((r) => r.id).join(', ')}`);
console.log(`\nSaved, with every conversation: ${file}`);
