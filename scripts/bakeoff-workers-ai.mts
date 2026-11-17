// Model bake-off on Cloudflare Workers AI: plays the persona evaluation set (src/lib/personaEvalSet.ts) through the REAL coach
// function (instructions, guards, checks, the site's own sentences), with only the model call sent to a Workers AI model instead
// of Venice. Same cases and scoring as scripts/eval-persona.mts, so runs can be compared with scripts/compare-persona-runs.mts.
//
//   node scripts/bakeoff-workers-ai.mts --model @cf/meta/llama-3.1-8b-instruct-fp8 --json bake-llama31-8b.json
//   node scripts/bakeoff-workers-ai.mts --model <id> --instructions v2      # default v2.1
//   node scripts/bakeoff-workers-ai.mts --model <id> --only crisis          # one category or case id
//   node scripts/bakeoff-workers-ai.mts --model <id> --private <dir>        # with the private text, as production sends it
//   node scripts/bakeoff-workers-ai.mts --model <id> --private <dir> --stance vilya   # and the Learn stance (adds learn-icarus)
//
// The function runs with COACH_PROVIDER=workers-ai, so the Workers AI request (and its style note) is exactly what the site would send; only
// the network hop is replaced by `cf ai run`. --private reads modules.json, method-notes.txt and learn-icarus.txt from a folder OUTSIDE the
// repository (owner decision 2026-11-15: the private text goes to Cloudflare in the prompt) and serves them from an in-memory store.
//
// Needs the Cloudflare CLI signed in (`cf auth login`); calls go through `cf ai run`, so no token is handled here. The messages are
// invented and contain nothing personal. No method notes or module set are sent (the private framework text stays off new
// providers). Each result records the Neurons the call used, so the cost per turn is measured, not guessed.
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { pacedSend, runCase, summarize, type CaseResult, type RawSent } from '../src/lib/personaEval.ts';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const model = flag('--model');
if (!model || !/^@cf\/[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(model)) {
  console.error('--model is a Workers AI model id, such as @cf/meta/llama-3.1-8b-instruct-fp8 (see `cf ai models list`).');
  process.exit(2);
}
const instructions = flag('--instructions') ?? 'v2.1';
if (!['v1', 'v2', 'v2.1'].includes(instructions)) {
  console.error('--instructions must be v1, v2 or v2.1.');
  process.exit(2);
}
const only = flag('--only');
const privateDir = flag('--private');
const stance = flag('--stance');
if (privateDir && !existsSync(join(privateDir, 'modules.json'))) {
  console.error('--private needs a folder with modules.json (and optionally method-notes.txt and learn-icarus.txt).');
  process.exit(2);
}
const jsonOut = flag('--json');
const CF = process.env.CF_BIN ?? join(homedir(), '.npm-global/bin/cf');

// The coach function, as it runs on the site, on the Workers AI provider. The account and token are placeholders: the call itself goes through the
// signed-in CLI below, so no token is handled here.
process.env.COACH_ENABLED = 'true';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_PROVIDER = 'workers-ai';
process.env.CF_AI_ACCOUNT_ID = '0'.repeat(32);
process.env.CF_AI_TOKEN = 'via-cf-cli';
process.env.COACH_MODEL = model;
process.env.COACH_INSTRUCTIONS = instructions;
process.env.COACH_DISTRESS_TEXT = 'on';
process.env.COACH_VALUES = 'on';
delete process.env.COACH_MODULES;
delete process.env.COACH_METHOD_NOTES;
const privateText = new Map<string, string>();
if (privateDir) {
  privateText.set('modules', readFileSync(join(privateDir, 'modules.json'), 'utf8'));
  for (const [key, file] of [['method-notes', 'method-notes.txt'], ['learn-icarus', 'learn-icarus.txt']]) {
    if (existsSync(join(privateDir, file))) privateText.set(key, readFileSync(join(privateDir, file), 'utf8'));
  }
  process.env.COACH_MODULES = 'on';
  process.env.COACH_STANCES = 'learn';
}

const work = mkdtempSync(join(tmpdir(), 'nenya-bakeoff-'));
let neurons = 0;
let calls = 0;
const latencies: number[] = [];
// One line per model call: how much was sent (characters, and the messages in it) and what it cost, to see how cost grows with a conversation.
const callLog: { chars: number; messages: number; neurons: number }[] = [];

// Only the model call is redirected. Anything else the function fetches goes out as usual.
const realFetch = globalThis.fetch;
(globalThis as { fetch: typeof fetch }).fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('https://api.venice.ai/')) throw new Error('the bake-off must never call Venice');
  if (!url.startsWith('https://api.cloudflare.com/client/v4/accounts/')) return realFetch(input as RequestInfo, init);
  // The body exactly as the coach function built it for Workers AI.
  const body = JSON.parse(String(init?.body ?? '{}'));
  const file = join(work, `req-${calls}.json`);
  writeFileSync(file, JSON.stringify(body));
  const t0 = Date.now();
  const out = spawnSync(CF, ['ai', 'run', model, '--body', `@${file}`], { encoding: 'utf8', timeout: 120_000 });
  latencies.push(Date.now() - t0);
  calls++;
  rmSync(file, { force: true });
  let j: any;
  try {
    j = JSON.parse(out.stdout);
  } catch {
    const status = /(\d{3}) [A-Z]/.exec(out.stdout + out.stderr)?.[1] ?? '502';
    return new Response('{}', { status: Number(status) === 429 ? 429 : 502 });
  }
  const spent = Number(j.usage?.neurons ?? j.result?.usage?.neurons ?? 0);
  neurons += spent;
  callLog.push({ chars: JSON.stringify(body.messages).length, messages: body.messages.length, neurons: spent });
  // Passed back as the REST API would answer; the coach function reads it (src/lib/coachProvider.ts readWorkersAi).
  return new Response(JSON.stringify(j), { status: 200, headers: { 'content-type': 'application/json' } });
}) as typeof fetch;

const { default: handler, __useStoreForTests } = await import('../netlify/functions/coach.mts');
// An in-memory store: the private text when --private is given, and the counters the function writes (kept only for this run).
{
  const m = new Map<string, { v: string; e: number }>();
  __useStoreForTests({
    async get(k: string) { return privateText.get(k) ?? m.get(k)?.v ?? null; },
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any = {}) { const x = m.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; m.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
    async setJSON(k: string, v: unknown) { m.set(k, { v: JSON.stringify(v), e: (m.get(k)?.e ?? 0) + 1 }); },
    async list({ prefix = '' }: { prefix?: string } = {}) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { m.delete(k); },
  });
}
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const rawSend = async (messages: { role: 'user' | 'assistant'; content: string }[], ticket: string | undefined): Promise<RawSent> => {
  const res = await handler(
    new Request('https://nenya.biz/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' },
      body: JSON.stringify({ messages, session: SESSION, ticket, ...(stance ? { stance } : {}) }),
    }),
  );
  const j: any = await res.json().catch(() => ({}));
  return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
};
const send = pacedSend(rawSend, {
  paceMs: 500,
  backoffMs: [10000, 30000, 60000],
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  now: () => Date.now(),
  onWait: (ms, attempt, why) => console.log(`  (${why}: waiting ${Math.round(ms / 1000)}s, retry ${attempt} of 3)`),
});

const chosen = PERSONA_CASES.filter((c) => !only || c.id === only || c.category === only);
const what = privateDir ? `private text (${[...privateText.keys()].join(', ')})${stance ? `, stance ${stance}` : ''}` : 'no private text';
console.log(`Bake-off: ${model}, instructions ${instructions}, ${chosen.length} cases, ${what}.`);
const results: CaseResult[] = [];
for (const c of chosen) {
  const r = await runCase(c, send);
  results.push(r);
  const mark = r.outcome === 'pass' ? 'PASS' : r.outcome === 'fail' ? 'FAIL' : 'ERROR';
  console.log(`\n${mark}  ${c.id}  [${c.category}]${r.how !== 'reply' ? `  (${r.how})` : ''}`);
  console.log(`  Person: ${c.prompt}`);
  if (r.reply) console.log(`  Coach:  ${r.reply.replace(/\n+/g, ' ')}`);
  for (const f of r.failures) console.log(`  !! ${f}`);
}
const s = summarize(results);
const sorted = [...latencies].sort((a, b) => a - b);
const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
const cost = { calls, neurons: Math.round(neurons), neuronsPerCall: calls ? +(neurons / calls).toFixed(2) : 0, medianSeconds: +(median / 1000).toFixed(1) };
console.log(`\n=== ${model}: ${s.pass} passed, ${s.fail} failed, ${s.error} errors, of ${s.total} ===`);
for (const [cat, n] of Object.entries(s.byCategory)) console.log(`  ${cat.padEnd(13)} pass ${n.pass}  fail ${n.fail}  error ${n.error}`);
console.log(`Model calls ${cost.calls}, Neurons ${cost.neurons} (${cost.neuronsPerCall} a call), median ${cost.medianSeconds}s a call (through the CLI, so slower than from the site).`);
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), instructions, model, provider: 'workers-ai', privateText: privateDir ? [...privateText.keys()] : false, stance: stance ?? null, styleNote: true, cost, callLog, summary: s, results }, null, 2));
  console.log(`Results written to ${jsonOut}`);
}
rmSync(work, { recursive: true, force: true });
if (!args.includes('--no-record')) console.log((await import('./record-neurons.mts')).recordNeurons(neurons));
process.exit(0);
