// Plays the safety evaluation set (src/lib/safetyEvalSet.ts) and shows, turn by turn, WHAT THE SITE DECIDED and WHAT THE MODEL SAID: the crisis check and
// steering screen's decision against what the set expects, the notice and resources the page would write, and each reply split into the model's words and
// the sentence the site added. Groups: suicide-indirect, abuse-now, abuse-fear, self-injury, ai-abuse (abuse aimed at the coach), ordinary.
//
//   node scripts/eval-safety.mts --offline                        # the site's decisions only: no key, no calls, instant (the tests run this too)
//   node scripts/eval-safety.mts --list                           # list the scripts
//   VENICE_API_KEY=... node scripts/eval-safety.mts               # the coach function in this folder, with your key (model words are real)
//   NENYA_OWNER_TOKEN=... node scripts/eval-safety.mts --url https://dev--<your-site>.netlify.app     # a DEPLOYED site (the dev branch): what the real site does
//   ... --instructions v2    # the new instruction wording (default v1, the live one); in-folder runs only. Run once with v1 and once with v2, then:
//   node scripts/eval-safety.mts --compare v1.json v2.json     # what changed between two saved runs (no key, no calls)
//   ... --only self-injury | --only sj-recurs | --json out.json | --pace 6 | --distress-text on   (in-folder runs only: turns the added sentences on)
// Every group runs unless --only names one. A deployed site uses whichever instructions and switches ITS settings choose (COACH_INSTRUCTIONS, COACH_DISTRESS_TEXT).
//
// Against a deployed site the token (your owner token, sent as the x-nenya-owner header) keeps the scripts from using the daily allowance; without it a
// visitor allowance of 10 turns a day is used up quickly. The deployed site's own switches decide whether it adds the distress sentences
// (COACH_DISTRESS_TEXT) and which instructions it uses (COACH_INSTRUCTIONS); a preview deploy needs its host in COACH_EXTRA_HOSTS. Nothing is printed
// from your environment, and the messages are invented. A pass means no known failure phrase and the site decided as expected: read the replies.
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { GROUPS, SAFETY_CASES } from '../src/lib/safetyEvalSet.ts';
import { offlineSend, playScript, type ScriptResult, type Send } from '../src/lib/safetyEval.ts';
import { pacedSend, type RawSent } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const only = flag('--only');
const cmp = args.indexOf('--compare');
if (cmp >= 0) {
  const { readFileSync } = await import('node:fs');
  const [fa, fb] = [args[cmp + 1], args[cmp + 2]];
  const load = (f: string) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { console.error(`Could not read ${f}.`); process.exit(2); } };
  const a = load(fa), b = load(fb);
  const bi = new Map<string, ScriptResult>((b.results as ScriptResult[]).map((r) => [r.id, r]));
  console.log(`A: ${fa}  (${a.where}${a.instructions ? ', instructions ' + a.instructions : ''})\nB: ${fb}  (${b.where}${b.instructions ? ', instructions ' + b.instructions : ''})\n`);
  let changed = 0;
  for (const ra of a.results as ScriptResult[]) {
    const rb = bi.get(ra.id);
    if (!rb) continue;
    const sa = ra.turns.map((t) => t.site).join(' > '), sb = rb.turns.map((t) => t.site).join(' > ');
    const ca = new Set(ra.review.filter((x) => x.present).map((x) => x.check)), cb = new Set(rb.review.filter((x) => x.present).map((x) => x.check));
    const gained = [...cb].filter((x) => !ca.has(x)), lost = [...ca].filter((x) => !cb.has(x));
    if (ra.outcome === rb.outcome && sa === sb && !gained.length && !lost.length) continue;
    changed++;
    console.log(`${ra.id} [${ra.group}]  ${ra.outcome} -> ${rb.outcome}${sa !== sb ? `   site: ${sa}  ->  ${sb}` : ''}${gained.length ? `   review gained: ${gained.join(', ')}` : ''}${lost.length ? `   review lost: ${lost.join(', ')}` : ''}`);
    if (rb.failures.length) console.log(`   B fails: ${rb.failures.join('; ')}`);
  }
  const tot = (r: any) => (r.results as ScriptResult[]).reduce((n, x) => n + x.review.filter((y) => y.present).length, 0);
  console.log(`\n${changed} script(s) differ. Review checks present: A ${tot(a)}, B ${tot(b)}. Pass: A ${(a.results as ScriptResult[]).filter((r) => r.outcome === 'pass').length}, B ${(b.results as ScriptResult[]).filter((r) => r.outcome === 'pass').length}.`);
  process.exit(0);
}
const chosen = SAFETY_CASES.filter((c) => !only || c.id === only || c.group === only);
if (args.includes('--list')) {
  for (const c of chosen) console.log(`${c.id.padEnd(20)} ${c.group.padEnd(17)} ${c.turns.length} turn(s)  ${c.turns[c.turns.length - 1].slice(0, 70)}${c.gap ? '  [gap]' : ''}`);
  console.log(`\n${chosen.length} scripts. Groups: ${GROUPS.join(', ')}`);
  process.exit(0);
}
if (!chosen.length) { console.error(`Nothing matches --only ${only}. Use --list.`); process.exit(2); }

const offline = args.includes('--offline');
const url = flag('--url');
const paceSeconds = Number(flag('--pace') ?? 3);
let where = 'offline (the site\'s decisions only)';
let send: Send;
if (offline) {
  send = offlineSend();
} else {
  const post = async (endpoint: string, headers: Record<string, string>, messages: { role: string; content: string }[], ticket: string | undefined, overrides: Record<string, string> = {}): Promise<RawSent> => {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket, ...(Object.keys(overrides).length ? { overrides } : {}) }) });
      const j: any = await res.json().catch(() => ({}));
      return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
    } catch { return { error: 'upstream network' }; }
  };
  let raw: (m: any, t: string | undefined) => Promise<RawSent>;
  if (url) {
    let origin: URL;
    try { origin = new URL(url); } catch { console.error('--url is the address of the deployed site, for example https://dev--yoursite.netlify.app'); process.exit(2); }
    const token = process.env.NENYA_OWNER_TOKEN;
    if (!token) console.log('(No NENYA_OWNER_TOKEN set: the scripts will use the visitor allowance, 10 turns a day, and may be refused.)');
    where = `the deployed site ${origin.origin}`;
    // With the owner token the run can switch the added sentences and the instruction wording for each request, without redeploying the site.
    const overrides = token ? { ...(flag('--distress-text') ? { distressText: flag('--distress-text') } : {}), ...(flag('--instructions') ? { instructions: flag('--instructions') } : {}) } : {};
    if (!token && (flag('--distress-text') || flag('--instructions'))) console.log('(--distress-text and --instructions need NENYA_OWNER_TOKEN against a deployed site; without it the site\'s own settings are used.)');
    if (Object.keys(overrides).length) where += ` with owner overrides ${JSON.stringify(overrides)}`;
    raw = (m, t) => post(`${origin.origin}/api/coach`, { origin: origin.origin, ...(token ? { 'x-nenya-owner': token } : {}) }, m, t, overrides);
  } else {
    if (!process.env.VENICE_API_KEY) { console.error('Set VENICE_API_KEY in your environment (do not paste it anywhere else), or use --offline, or --url for a deployed site.'); process.exit(2); }
    process.env.COACH_ENABLED = 'true';
    process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
    if (flag('--distress-text') === 'on') process.env.COACH_DISTRESS_TEXT = 'on';
    if (!['v1', 'v2', undefined].includes(flag('--instructions'))) { console.error('--instructions must be v1 or v2.'); process.exit(2); }
    if (flag('--instructions') === 'v2') process.env.COACH_INSTRUCTIONS = 'v2';
    const { default: handler } = await import('../netlify/functions/coach.mts');
    where = `the coach function in this folder, instructions ${process.env.COACH_INSTRUCTIONS === 'v2' ? 'v2 (the new wording)' : 'v1 (the live wording)'}${process.env.COACH_DISTRESS_TEXT === 'on' ? ', distress sentences ON' : ', distress sentences off'}`;
    raw = async (messages, ticket) => {
      const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket }) }));
      const j: any = await res.json().catch(() => ({}));
      return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
    };
  }
  send = pacedSend(raw, { paceMs: paceSeconds * 1000, backoffMs: [20000, 45000, 90000, 150000], sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), onWait: (ms, a, why) => console.log(`  (${why}: waiting ${Math.round(ms / 1000)}s, retry ${a} of 4)`) });
}
console.log(`Playing ${chosen.length} script(s) against ${where}.\n`);

const results: ScriptResult[] = [];
for (const c of chosen) {
  const r = await playScript(c, send);
  results.push(r);
  console.log(`${r.outcome === 'pass' ? 'PASS' : r.outcome === 'fail' ? 'FAIL' : 'ERROR'}  ${r.id}  [${r.group}]${r.gap ? '  (gap: ' + r.gap + ')' : ''}`);
  r.turns.forEach((t, i) => {
    console.log(`  ${i + 1}. Person: ${t.said}`);
    console.log(`     site decided: ${t.site}   expected: ${t.expected}   ${t.siteMatch ? 'ok' : 'MISMATCH'}`);
    if (t.page) console.log(`     page would show: "${t.page.notice.slice(0, 150)}${t.page.notice.length > 150 ? '…' : ''}"  + ${t.page.resources.length} resources (${t.page.resources.filter((x) => /Childhelp|RAINN|Domestic/.test(x)).map((x) => x.split(' (')[0]).join(', ') || 'general'})`);
    if (t.reply !== undefined) {
      console.log(`     model:  ${(t.model ?? '').replace(/\n+/g, ' ')}`);
      if (t.siteSentence) console.log(`     SITE ADDED: ${t.siteSentence}`);
    } else if (t.flag || t.blocked) console.log('     (no model reply: the site answered alone)');
  });
  for (const f of r.failures) console.log(`  !! ${f}`);
  if (r.failures.some((f) => /\b401\b/.test(f))) console.log('  !! A 401 means Venice rejected the API key (the site itself never answers 401). Check it with:  curl -s -o /dev/null -w "%{http_code}\\n" -H "Authorization: Bearer $VENICE_API_KEY" https://api.venice.ai/api/v1/models   (200 = the key works; 401 = it does not). For --url runs the key is the one in the deployed site\'s settings, not your terminal.');
  if (r.review.length) console.log(`  review: present [${r.review.filter((x) => x.present).map((x) => x.check).join(', ') || 'none'}], absent [${r.review.filter((x) => !x.present).map((x) => x.check).join(', ') || 'none'}]`);
  console.log(`  good looks like: ${r.note}\n`);
}

const n = (f: (r: ScriptResult) => boolean) => results.filter(f).length;
console.log(`=== ${n((r) => r.outcome === 'pass')} passed, ${n((r) => r.outcome === 'fail')} failed, ${n((r) => r.outcome === 'error')} errors, of ${results.length} ===`);
for (const g of GROUPS) { const rs = results.filter((r) => r.group === g); if (rs.length) console.log(`  ${g.padEnd(17)} pass ${rs.filter((r) => r.outcome === 'pass').length}  fail ${rs.filter((r) => r.outcome === 'fail').length}  error ${rs.filter((r) => r.outcome === 'error').length}`); }
const turns = results.flatMap((r) => r.turns);
console.log(`\nWho said what (${turns.length} turns): site alone ${turns.filter((t) => t.reply === undefined && (t.flag || t.blocked)).length}, model with a site sentence added ${turns.filter((t) => t.siteSentence).length}, model alone ${turns.filter((t) => t.reply !== undefined && !t.siteSentence).length}.`);
const gaps = results.filter((r) => r.gap);
if (gaps.length) console.log(`${gaps.length} script(s) test behaviour that is not built yet (marked gap): they show what the coach does today, not a failure.`);
if (args.includes('--json') || flag('--json')) { const out = flag('--json'); if (out) { writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), where, instructions: process.env.COACH_INSTRUCTIONS ?? (url ? 'set by the deployed site' : 'v1'), results }, null, 2)); console.log(`Results written to ${out}`); } }
process.exit(n((r) => r.outcome !== 'pass' && !r.gap) ? 1 : 0);
