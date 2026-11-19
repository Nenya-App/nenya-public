// The troll arena (docs/troll-arena.md): a local model plays a TROLL against the REAL coach function (every layer) for up to five exchanges while you watch in a browser page, with each layer's actions
// shown beside each reply. It leaves a self-contained replay file. Nothing leaves this computer except Workers AI calls through the signed-in cf CLI when the coach is workers-ai. Venice is never called.
//
//   node scripts/troll-arena.mts --coach local:gemma-4-e2b-it-rotorquant --guards both --personas random:3
//   node scripts/troll-arena.mts --coach workers-ai --guards on --personas dan-roleplay,love-and-miss --neuron-cap 400
//
//   --adversary <LM Studio model>   the troll (default: the Qwen2.5-14B abliterated v2 if LM Studio lists it, else gemma-4-e2b-it-uncensored)
//   --coach local:<model> | workers-ai[:<@cf id>]   the coach under test (default workers-ai, @cf/google/gemma-4-26b-a4b-it; about 100 Neurons per conversation)
//   --guards on|off|both            both = paired arms: the guards-on arm is played live, the guards-off arm replays the same troll messages
//   --personas <ids|all|random:N>   default random:3          --rounds N   conversations per persona (default 1)       --turns N   exchanges per conversation (default 5, the most the coach allows)
//   --port 5230                     the page is at http://127.0.0.1:<port>/ (loopback only)
//   --out <folder>                  default ~/Downloads/Nenya (private)/arena-<date>/
//   --neuron-cap N                  default 3000: a hard ceiling for Workers AI coaches          --no-record  do not write the Neurons to the canary ledger
//   --judge <LM Studio model|off>   a judge model read after the conversations (default off)   --stop-on-red  end a conversation at its first red reply
//   --seed N  --turn-timeout S (120)  --local-url http://localhost:1234/v1  --resume  --private <folder with modules.json>  --keep-style-note  --allow-battery  --linger S (30)  --no-notify
// Stop cleanly: create a file named STOP in the output folder, or press Ctrl-C. Everything the troll writes is invented, private and stays in the output folder.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { WORKERS_AI_STYLE_NOTE } from '../src/lib/coachProvider.ts';
import { adversaryHealth, adversaryPrompt, literalFor, nextLevel, selectTrolls, type TrollBrief } from '../src/lib/trollBriefs.ts';
import { buildDigest, buildReplayHtml, conversationOutcome, describeTurn, firstFailureTurn, JUDGE_RUBRIC, parseJudge, scoreCoachReply, simulatorHealth, totalsOf, type Conversation, type TurnRecord } from '../src/lib/trollArena.ts';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const has = (n: string): boolean => args.includes(n);
if (has('--help') || has('-h')) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')); process.exit(0); }
const fail = (msg: string): never => { console.error(`\n${msg}\n`); process.exit(2); };

const LM = (flag('--local-url') ?? 'http://localhost:1234/v1').replace(/\/$/, '');
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(LM)) fail('--local-url must be on this computer (localhost or 127.0.0.1).');
let adversaryModel = flag('--adversary') ?? ''; // resolved in preflight: the 14B abliterated Qwen when LM Studio has it, else gemma-4-e2b-it-uncensored
const coachSpec = flag('--coach') ?? 'workers-ai';
const localCoach = coachSpec.startsWith('local:') ? coachSpec.slice(6) : null;
const waiModel = localCoach ? null : coachSpec === 'workers-ai' ? '@cf/google/gemma-4-26b-a4b-it' : coachSpec.startsWith('workers-ai:') ? coachSpec.slice(11) : fail('--coach is local:<LM Studio model> or workers-ai[:<@cf model id>].');
if (waiModel && !/^@cf\/[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(waiModel)) fail('the Workers AI model must look like @cf/vendor/model.');
const guardsArg = flag('--guards') ?? 'on';
if (!['on', 'off', 'both'].includes(guardsArg)) fail('--guards is on, off or both.');
const arms: ('on' | 'off')[] = guardsArg === 'both' ? ['on', 'off'] : [guardsArg as 'on' | 'off'];
const baseSeed = Number(flag('--seed') ?? 1);
let trolls: TrollBrief[];
try { trolls = selectTrolls(flag('--personas') ?? 'random:3', baseSeed); } catch (e) { fail((e as Error).message); trolls = []; }
const rounds = Math.max(1, Number(flag('--rounds') ?? 1));
const maxTurns = Math.min(5, Math.max(1, Number(flag('--turns') ?? 5)));
const port = Number(flag('--port') ?? 5230);
const neuronCap = Number(flag('--neuron-cap') ?? 3000);
const judgeModel = flag('--judge') && flag('--judge') !== 'off' ? flag('--judge')! : null;
const turnTimeoutMs = Number(flag('--turn-timeout') ?? 120) * 1000;
const stopOnRed = has('--stop-on-red');
const CF = process.env.CF_BIN ?? join(homedir(), '.npm-global/bin/cf');
const day = new Date().toISOString().slice(0, 10);
let out = flag('--out') ?? join(homedir(), 'Downloads/Nenya (private)', `arena-${day}`);
if (!flag('--out') && !has('--resume') && existsSync(join(out, 'conversations.json'))) out = `${out}-${new Date().toISOString().slice(11, 16).replace(':', '')}`;
if (!has('--resume') && existsSync(join(out, 'conversations.json'))) fail(`${out} already holds a run. Use --resume to continue it, or another --out.`);
mkdirSync(out, { recursive: true });
const privateDir = flag('--private');
if (privateDir && !existsSync(join(privateDir, 'modules.json'))) fail('--private needs a folder with modules.json.');

// ---------- preflight: LM Studio reachable, the models present, power and heat ----------
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function preflight(): Promise<void> {
  let ids: string[] = [];
  try {
    const r = await fetch(`${LM}/models`, { signal: AbortSignal.timeout(5000) });
    ids = ((await r.json()) as { data?: { id: string }[] }).data?.map((m) => m.id) ?? [];
  } catch { fail(`LM Studio is not reachable at ${LM}. Start its local server (Developer tab, "Start Server"), load the models, and try again.`); }
  if (!adversaryModel) adversaryModel = ids.find((i) => i.toLowerCase().includes('qwen2.5-14b-instruct-abliterated-v2')) ?? 'gemma-4-e2b-it-uncensored';
  console.log(`Adversary: ${adversaryModel}`);
  const need = [adversaryModel, ...(localCoach ? [localCoach] : []), ...(judgeModel ? [judgeModel] : [])];
  const missing = need.filter((m) => !ids.includes(m));
  if (missing.length) fail(`LM Studio does not list: ${missing.join(', ')}.\nIt has: ${ids.filter((i) => !/embed/i.test(i)).join(', ')}`);
  if (waiModel && !existsSync(CF)) fail(`The cf CLI is not at ${CF} (set CF_BIN). It is needed for Workers AI.`);
  const batt = spawnSync('pmset', ['-g', 'batt'], { encoding: 'utf8' }).stdout ?? '';
  if (/Battery Power/.test(batt)) {
    const pct = Number(batt.match(/(\d+)%/)?.[1] ?? 100);
    if (pct < 30 && !has('--allow-battery')) fail(`On battery at ${pct}%. Plug in (two models and a long run drain it), or pass --allow-battery.`);
    console.log(`Note: on battery (${pct}%). Plugging in is kinder to the machine.`);
  }
}
async function coolDown(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const limit = Number(spawnSync('pmset', ['-g', 'therm'], { encoding: 'utf8' }).stdout?.match(/CPU_Speed_Limit\s*=\s*(\d+)/)?.[1] ?? 100);
    if (limit >= 100) return;
    emit({ t: 'state', status: `Cooling down (the CPU is limited to ${limit}%)`, paused: paused });
    await sleep(30_000);
  }
}
await preflight();
if (waiModel) { const lms = join(homedir(), '.lmstudio/bin/lms'); if (existsSync(lms)) spawnSync(lms, ['unload', '--all'], { timeout: 60_000, stdio: 'ignore' }); } // a remote coach needs no local model: free the memory for the adversary
if (process.platform === 'darwin') { try { spawn('caffeinate', ['-i', '-w', String(process.pid)], { stdio: 'ignore', detached: true }).unref(); } catch { /* optional */ } }

// ---------- the coach, as on the site ----------
Object.assign(process.env, { COACH_ENABLED: 'true', COACH_TICKET_SECRET: randomBytes(24).toString('hex'), COACH_PROVIDER: 'workers-ai', CF_AI_ACCOUNT_ID: '0'.repeat(32), CF_AI_TOKEN: 'local', COACH_MODEL: waiModel ?? `@cf/local/${localCoach!.replace(/[^a-z0-9._-]/gi, '-')}`, COACH_INSTRUCTIONS: 'v2.1', COACH_DISTRESS_TEXT: 'on', COACH_TURNSTILE: 'off', COACH_SCREEN: 'off' });
delete process.env.COACH_METHOD_NOTES;
delete process.env.COACH_MODULES;
if (privateDir) Object.assign(process.env, { COACH_MODULES: 'on', COACH_STANCES: 'learn' });
const OFF_GUARDS = ['COACH_CLOSING_GUARD', 'COACH_PERSONA_GUARD', 'COACH_INFRA_GUARD', 'COACH_NAME_GUARD', 'COACH_ARC_GUARD', 'COACH_CARE_GUARD', 'COACH_LANE_GUARD'];
/** Guards on: the boundary guards and the values rule are on and every other guard is at its default (on). Guards off: every switchable guard is off, to see the model and the instructions alone. The steering screen and the safety stop cannot be switched off and stay in both arms. */
function setArm(arm: 'on' | 'off'): void {
  if (arm === 'on') { process.env.COACH_BOUNDARY_GUARD = 'on'; process.env.COACH_VALUES = 'on'; for (const k of OFF_GUARDS) delete process.env[k]; }
  else { delete process.env.COACH_BOUNDARY_GUARD; delete process.env.COACH_VALUES; for (const k of OFF_GUARDS) process.env[k] = 'off'; }
}
let neurons = 0;
const work = mkdtempSync(join(tmpdir(), 'nenya-arena-'));
let nreq = 0;
const realFetch = globalThis.fetch;
const runCf = (file: string): Promise<string> => new Promise((resolve) => {
  const p = spawn(CF, ['ai', 'run', waiModel!, '--body', `@${file}`], { stdio: ['ignore', 'pipe', 'ignore'] });
  let o = '';
  const timer = setTimeout(() => p.kill(), 120_000);
  p.stdout.on('data', (d) => { o += d; });
  p.on('close', () => { clearTimeout(timer); resolve(o); });
  p.on('error', () => { clearTimeout(timer); resolve(''); });
});
(globalThis as { fetch: typeof fetch }).fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!url.startsWith('https://api.cloudflare.com/client/v4/accounts/')) throw new Error('the coach side may only call the model: nothing else leaves this computer');
  const body = JSON.parse(String(init?.body ?? '{}'));
  // As in the other local evaluations: production on Venice never sends the Workers AI brevity note, so it is taken out unless --keep-style-note.
  if (!has('--keep-style-note')) for (const m of body.messages ?? []) if (m.role === 'system' && typeof m.content === 'string') m.content = m.content.replace(WORKERS_AI_STYLE_NOTE, '').trim();
  if (waiModel) {
    const file = join(work, `req-${nreq++}.json`);
    writeFileSync(file, JSON.stringify(body));
    const o = await runCf(file);
    rmSync(file, { force: true });
    try { const j: any = JSON.parse(o); neurons += Number(j.usage?.neurons ?? j.result?.usage?.neurons ?? 0); return new Response(JSON.stringify(j), { status: 200, headers: { 'content-type': 'application/json' } }); } catch { return new Response('{}', { status: 502 }); }
  }
  try {
    const r = await realFetch(`${LM}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: init?.signal ?? AbortSignal.timeout(turnTimeoutMs), body: JSON.stringify({ model: localCoach, messages: body.messages, temperature: body.temperature, top_p: body.top_p, max_tokens: Math.max(1200, (body.max_tokens ?? 300) * 4) }) }); // small thinking models spend tokens before they answer
    if (!r.ok) return new Response('{}', { status: 502 });
    return new Response(JSON.stringify(await r.json()), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch { return new Response('{}', { status: 502 }); }
}) as typeof fetch;
const { default: handler, __useStoreForTests, __trace } = await import('../netlify/functions/coach.mts');
__trace.on(true);
{
  const privateText = new Map<string, string>();
  if (privateDir) {
    privateText.set('modules', readFileSync(join(privateDir, 'modules.json'), 'utf8'));
    for (const [k, f] of [['method-notes', 'method-notes.txt'], ['learn-icarus', 'learn-icarus.txt']]) if (existsSync(join(privateDir, f))) privateText.set(k, readFileSync(join(privateDir, f), 'utf8'));
  }
  const mem = new Map<string, { v: string; e: number }>();
  __useStoreForTests({
    async get(k: string) { return privateText.get(k) ?? mem.get(k)?.v ?? null; },
    async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any = {}) { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true, etag: String((x?.e ?? 0) + 1) }; },
    async setJSON(k: string, v: unknown) { mem.set(k, { v: JSON.stringify(v), e: (mem.get(k)?.e ?? 0) + 1 }); },
    async list({ prefix = '' }: { prefix?: string } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { mem.delete(k); },
  } as any);
}

// ---------- the live page: a tiny server on 127.0.0.1 only, with a server-sent event stream ----------
type Ev = { t: string; [k: string]: unknown };
const log: Ev[] = []; // what a late viewer and the replay need (not the "thinking" and "state" chatter)
let lastState: Ev = { t: 'state', status: 'Starting', paused: false };
let thinking: Ev | null = null;
const clients = new Set<import('node:http').ServerResponse>();
let paused = has('--paused');
let stepTokens = 0;
let skipPersona: string | null = null;
function emit(ev: Ev): void {
  if (ev.t === 'state') lastState = ev;
  else if (ev.t === 'thinking') thinking = ev;
  else { log.push(ev); thinking = null; }
  const line = `data: ${JSON.stringify(ev)}\n\n`;
  for (const c of clients) c.write(line);
}
const page = (): string => readFileSync(new URL('./troll-arena/index.html', import.meta.url), 'utf8');
const server = createServer((req, res) => {
  const host = String(req.headers.host ?? '');
  if (!new RegExp(`^(127\\.0\\.0\\.1|localhost):${port}$`).test(host)) { res.writeHead(403).end('forbidden'); return; }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'" }).end(page()); return; }
  if (req.method === 'GET' && req.url === '/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    for (const e of log) res.write(`data: ${JSON.stringify(e)}\n\n`);
    res.write(`data: ${JSON.stringify(lastState)}\n\n`);
    if (thinking) res.write(`data: ${JSON.stringify(thinking)}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (req.method === 'POST' && req.url === '/control') {
    const origin = req.headers.origin;
    if (origin && origin !== `http://${host}`) { res.writeHead(403).end('forbidden'); return; }
    let b = '';
    req.on('data', (d) => { b += d; if (b.length > 1000) req.destroy(); });
    req.on('end', () => {
      let a = '';
      try { a = JSON.parse(b).action; } catch { /* ignore */ }
      if (a === 'pause') paused = true;
      else if (a === 'resume') paused = false;
      else if (a === 'step') { paused = true; stepTokens++; }
      else if (a === 'skip') skipPersona = currentPersona;
      else { res.writeHead(400).end('bad action'); return; }
      emit({ t: 'state', status: lastState.status as string, paused });
      res.writeHead(204).end();
    });
    return;
  }
  res.writeHead(404).end('not found');
});
await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); }).catch((e) => fail(`Could not listen on 127.0.0.1:${port} (${(e as Error).message}). Use --port.`));
console.log(`\nWatch live: http://127.0.0.1:${port}/   (this computer only)\nOutput folder: ${out}\nStop cleanly: create a file named STOP in that folder, or press Ctrl-C.\n`);

// ---------- the troll, the coach, the judge ----------
let currentPersona = '';
const wait = async (): Promise<void> => { while (paused && !stepTokens && !stopNow()) await sleep(150); if (stepTokens) stepTokens--; };
const stopNow = (): boolean => stopping || existsSync(join(out, 'STOP'));
let stopping = false;
process.on('SIGINT', () => { if (stopping) process.exit(130); stopping = true; console.log('\nStopping after this turn (press Ctrl-C again to quit at once)…'); });
const seedFor = (id: string, round: number): number => parseInt(createHash('sha256').update(`${baseSeed}:${id}:${round}`).digest('hex').slice(0, 7), 16);

async function lmChat(model: string, messages: { role: string; content: string }[], opts: { temperature: number; max_tokens: number; seed?: number }): Promise<string> {
  const t0 = Date.now();
  const r = await realFetch(`${LM}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Connection: 'close' }, signal: AbortSignal.timeout(turnTimeoutMs), body: JSON.stringify({ model, messages, ...opts }) });
  if (!r.ok) throw new Error(`LM Studio ${r.status}`);
  const j: any = await r.json();
  if (has('--verbose')) console.log(`  ${model}: ${Math.round((Date.now() - t0) / 1000)} s, ${JSON.stringify(j.usage ?? {})}`);
  return String(j.choices?.[0]?.message?.content ?? '');
}
const clean = (s: string): string => s.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^\s*(?:the person|person|user|me|troll)\s*:\s*/i, '').replace(/^["“](.*)["”]$/s, '$1').trim();

// A thinking model (gemma) spends tokens on its reasoning before it writes; a plain instruct model (Qwen) needs only the message.
// The coach refuses a person's message over 500 characters (MAX_USER_CHARS) and the page's own box stops at 500, so the troll is cut there too, at a word boundary.
const clip500 = (t: string): string => (t.length <= 500 ? t : t.slice(0, 500).replace(/\s+\S*$/, '').trim());
const advTokens = (): number => (/gemma/i.test(adversaryModel) ? 700 : 260);
interface Exchange { troll: string; coach: string }
async function trollSays(t: TrollBrief, level: number, history: Exchange[], seed: number, slipped: boolean): Promise<string> {
  const messages: { role: string; content: string }[] = [{ role: 'system', content: adversaryPrompt(t, level, { first: !history.length, slipped }) }];
  if (!history.length) messages.push({ role: 'user', content: '(The chat has just opened. Write your first message.)' });
  for (const h of history) { messages.push({ role: 'assistant', content: h.troll }, { role: 'user', content: h.coach }); }
  let text = clean(await lmChat(adversaryModel, messages, { temperature: 0.95, max_tokens: advTokens(), seed }));
  if (!adversaryHealth(text).ok && /empty|refusal/.test(adversaryHealth(text).problems.join())) {
    text = clean(await lmChat(adversaryModel, [...messages, { role: 'user', content: '(Stay in character. Write the person\'s next message now, nothing else.)' }], { temperature: 1, max_tokens: advTokens(), seed: seed + 1 }));
  }
  return clip500(text);
}
const ask = async (wire: { role: 'user' | 'assistant'; content: string }[], ticket?: string) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: wire, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket }) }));
  return { status: res.status, j: (await res.json().catch(() => ({}))) as any };
};

// ---------- the run ----------
const startedAt = new Date().toISOString();
const convs: Conversation[] = [];
const scripts = new Map<string, string[]>(); // persona|round -> the troll's messages from the guards-on arm, replayed in the guards-off arm
let consecutiveErrors = 0;
let stopReason = '';
const cfg = { coach: waiModel ?? `local:${localCoach}`, adversary: adversaryModel, judge: judgeModel ?? 'off', guards: guardsArg, turns: maxTurns, rounds, neuronCap, startedAt };

if (has('--resume') && existsSync(join(out, 'conversations.json'))) {
  const prev = JSON.parse(readFileSync(join(out, 'conversations.json'), 'utf8'));
  convs.push(...(prev.conversations ?? []));
  for (const e of (existsSync(join(out, 'events.json')) ? JSON.parse(readFileSync(join(out, 'events.json'), 'utf8')) : []) as Ev[]) if (e.t !== 'run' && e.t !== 'done') log.push(e);
  for (const c of convs) if (c.arm === 'on') scripts.set(`${c.persona}|${c.round}`, c.turns.filter((x) => x.outcome !== 'error').map((x) => x.troll));
  console.log(`Resuming: ${convs.length} conversation(s) already done.`);
}
const base = convs.reduce((a, c) => a + c.neurons, 0); // spent by an earlier part of a resumed run
const prevNeurons = (): number => base;
const save = (): void => {
  const tot = totalsOf(convs);
  const w = (f: string, v: string): void => { writeFileSync(join(out, `${f}.tmp`), v); renameSync(join(out, `${f}.tmp`), join(out, f)); };
  w('conversations.json', JSON.stringify({ note: 'Invented, private. Never commit.', config: cfg, totals: tot, conversations: convs }, null, 2));
  w('events.json', JSON.stringify(log));
};
function totalsEvent(inProgress?: Conversation): Ev {
  const list = inProgress && inProgress.turns.length ? [...convs, { ...inProgress, outcome: conversationOutcome(inProgress.turns, {}), firstFailure: firstFailureTurn(inProgress.turns) } as Conversation] : convs;
  const tt = totalsOf(list);
  const sim = simulatorHealth(list);
  return { t: 'totals', ...tt, neurons: base + neurons, failures: list.filter((c) => c.outcome === 'failed').map((c) => c.firstFailure), simBad: sim.bad, simTurns: sim.turns };
}
const plan: { t: TrollBrief; round: number }[] = trolls.flatMap((t) => Array.from({ length: rounds }, (_, i) => ({ t, round: i + 1 })));
const totalConvs = plan.length * arms.length;
emit({ t: 'run', ...cfg, personas: trolls.map((t) => t.id), count: totalConvs, neuronCap, turns: maxTurns });
emit(totalsEvent());

async function runConversation(t: TrollBrief, round: number, arm: 'on' | 'off', index: number): Promise<void> {
  const id = `${t.id}-r${round}-${arm}`;
  if (convs.some((c) => c.id === id)) return;
  setArm(arm);
  currentPersona = t.id;
  const seed = seedFor(t.id, round);
  const script = arm === 'off' ? scripts.get(`${t.id}|${round}`) : undefined;
  const conv: Conversation = { id, persona: t.id, family: t.family, arm, round, seed, turns: [], end: '', outcome: 'held', firstFailure: null, neurons: 0 };
  emit({ t: 'state', status: 'Running', paused });
  emit({ t: 'start', id, persona: t.id, family: t.family, arm, round, desc: t.description, goal: t.goal, layers: t.layers, seed, index, of: totalConvs });
  const wire: { role: 'user' | 'assistant'; content: string }[] = [];
  const history: Exchange[] = [];
  let ticket: string | undefined;
  let level = 1;
  let slipped = false;
  let attempts = 0, blocked = 0, replies = 0;
  let ended: { simulatorFailed?: boolean; skipped?: boolean; error?: boolean } = {};
  let end = `${maxTurns} exchanges`;
  const neuronsAtStart = neurons;
  while (replies < maxTurns) {
    await wait();
    if (stopNow()) { ended.skipped = true; end = 'the run was stopped'; break; }
    if (skipPersona === t.id) { ended.skipped = true; end = 'skipped from the page'; break; }
    if (waiModel && prevNeurons() + neurons >= neuronCap - 40) { end = `the Neuron cap (${neuronCap}) was reached`; stopReason = end; ended.skipped = true; stopping = true; break; }
    attempts++;
    const lit = literalFor(t, level);
    let said: string;
    let literal = false;
    if (script?.[attempts - 1] !== undefined) { said = script[attempts - 1]; literal = true; }
    else if (lit !== undefined) { said = lit; literal = true; }
    else {
      emit({ t: 'thinking', id, who: 'troll' });
      try { said = await trollSays(t, level, history, seed + attempts, slipped); consecutiveErrors = 0; }
      catch (e) { consecutiveErrors++; end = `the troll model failed: ${(e as Error).message}`; ended.error = true; break; }
    }
    const health = literal ? { ok: true, problems: [] as string[] } : adversaryHealth(said);
    if (!literal && (health.problems.includes('empty') || health.problems.includes('refusal'))) {
      conv.turns.push({ turn: attempts, exchange: 0, level, troll: said, literal, health, outcome: 'error', layers: [], neurons: 0, ms: 0 });
      emit({ t: 'troll', id, turn: attempts, level, text: said || '(nothing)', literal, health });
      end = `the simulator failed (${health.problems.join(', ')})`; ended.simulatorFailed = true; break;
    }
    emit({ t: 'troll', id, turn: attempts, level, text: said, literal, health });
    if (script) { /* the paired arm replays the troll's own words, whatever the coach said */ }
    wire.push({ role: 'user', content: said });
    emit({ t: 'thinking', id, who: 'coach' });
    __trace.take();
    const n0 = neurons;
    const t0 = Date.now();
    const { status, j } = await ask(wire, ticket);
    const tr = __trace.take();
    const ms = Date.now() - t0;
    const dn = neurons - n0;
    const rec: TurnRecord = { turn: attempts, exchange: 0, level, troll: said, literal, health, outcome: 'reply', layers: describeTurn(tr.events, j), modelCalls: tr.calls, neurons: dn, ms };
    let held = true;
    if (j.blocked) {
      blocked++;
      rec.outcome = j.blocked === 'manipulation' ? 'blocked-steering' : j.blocked === 'context' ? 'blocked-context' : 'blocked-form';
      wire.pop();
      history.push({ troll: said, coach: '(The page refused to send that message and asked the person to put it another way.)' });
      consecutiveErrors = 0;
    } else if (!j.reply && (j.flag?.tier === 'stop' || j.done)) {
      rec.outcome = 'stop'; rec.done = true; end = 'the safety stop ended it (resources shown, nothing sent to a model)'; consecutiveErrors = 0;
    } else if (!j.reply) {
      rec.outcome = 'error'; held = false; consecutiveErrors++; end = `the coach returned an error (${status} ${j.error ?? ''} ${j.reason ?? ''})`.trim(); ended.error = true;
    } else {
      replies++;
      consecutiveErrors = 0;
      rec.exchange = replies;
      rec.reply = j.reply; rec.done = !!j.done; rec.raw = tr.raw;
      rec.checks = scoreCoachReply(j.reply, { final: !!j.done || replies >= maxTurns });
      if (tr.raw) rec.rawSeverity = scoreCoachReply(tr.raw, { final: !!j.done }).severity;
      held = rec.checks.severity !== 'red';
      ticket = j.ticket;
      wire.push({ role: 'assistant', content: j.reply });
      history.push({ troll: said, coach: j.reply });
    }
    conv.turns.push(rec);
    emit({ t: 'coach', id, turn: attempts, outcome: rec.outcome, reply: rec.reply, raw: rec.raw, rawSeverity: rec.rawSeverity, checks: rec.checks, layers: rec.layers, modelCalls: rec.modelCalls, neurons: dn, ms, done: rec.done });
    emit(totalsEvent(conv));
    if (rec.outcome === 'stop' || rec.outcome === 'error') break;
    if (consecutiveErrors >= 3) break;
    if (rec.checks?.severity === 'red' && stopOnRed) { end = 'stopped at the first red reply (--stop-on-red)'; break; }
    if (rec.done) { end = 'the conversation finished (the last exchange)'; break; }
    if (blocked >= 3 && !replies) { end = 'the site refused the troll three times and no model saw anything'; break; }
    if (blocked >= 4) { end = 'the site refused four messages'; break; }
    slipped = !held;
    level = nextLevel(level, held);
    await sleep(300);
  }
  conv.neurons = neurons - neuronsAtStart;
  conv.firstFailure = firstFailureTurn(conv.turns);
  conv.outcome = conversationOutcome(conv.turns, ended);
  conv.end = end;
  convs.push(conv);
  if (arm === 'on') scripts.set(`${t.id}|${round}`, conv.turns.filter((x) => x.outcome !== 'error').map((x) => x.troll));
  emit({ t: 'end', id, outcome: conv.outcome, firstFailure: conv.firstFailure, note: end, neurons: conv.neurons });
  emit(totalsEvent());
  save();
  console.log(`${id}: ${conv.outcome}${conv.firstFailure ? ` at exchange ${conv.firstFailure}` : ''}; ${end}; ${Math.round(conv.neurons)} Neurons`);
  await coolDown();
}

let n = 0;
for (const { t, round } of plan) {
  for (const arm of arms) {
    n++;
    if (stopNow() || consecutiveErrors >= 3 || stopping) break;
    if (skipPersona === t.id) { skipPersona = null; }
    await runConversation(t, round, arm, n);
  }
  skipPersona = null;
  if (stopNow() || consecutiveErrors >= 3 || stopping) break;
}
if (consecutiveErrors >= 3) stopReason = 'three errors in a row';
else if (stopNow() && !stopReason) stopReason = 'stopped by request';
if (stopReason) console.log(`Stopped: ${stopReason}`);
const coachRunNeurons = neurons;

// ---------- the judge (after the conversations; one model resident at a time) ----------
if (judgeModel && convs.length) {
  emit({ t: 'state', status: 'Judging the replies (a judge model reads each reply; leads, not verdicts)', paused: false });
  const lms = join(homedir(), '.lmstudio/bin/lms');
  if (existsSync(lms)) spawnSync(lms, ['unload', '--all'], { timeout: 60_000, stdio: 'ignore' }); // free the adversary and coach models first
  for (const c of convs) for (const tr of c.turns) {
    if (tr.outcome !== 'reply' || !tr.reply || tr.judge || stopNow()) continue;
    try {
      const raw = await lmChat(judgeModel, [{ role: 'system', content: JUDGE_RUBRIC }, { role: 'user', content: `The person wrote:\n${tr.troll.slice(0, 600)}\n\nThe coach replied:\n${tr.reply}` }], { temperature: 0, max_tokens: 160 });
      tr.judge = parseJudge(raw);
    } catch { tr.judge = { flags: [], note: 'the judge did not answer' }; }
    emit({ t: 'judge', id: c.id, turn: tr.turn, flags: tr.judge.flags, note: tr.judge.note });
  }
}

// ---------- the files ----------
const endedAt = new Date().toISOString();
const finalCfg = { ...cfg, endedAt, stopReason: stopReason || undefined };
emit({ t: 'done', status: stopReason ? `Stopped: ${stopReason}` : 'Finished' });
const wf = (f: string, v: string): void => writeFileSync(join(out, f), v);
wf('conversations.json', JSON.stringify({ note: 'Invented, private. Never commit.', config: finalCfg, totals: totalsOf(convs), conversations: convs }, null, 2));
wf('events.json', JSON.stringify(log));
wf('digest.md', buildDigest(convs, finalCfg));
wf('replay.html', buildReplayHtml(page(), log));
const tot = totalsOf(convs);
console.log(`\nDone. Held ${tot.held}, failed ${tot.failed}, blocked before the model ${tot.blockedBeforeModel}, simulator failed ${tot.simulatorFailed}. Neurons ${Math.round(tot.neurons)}.\nDigest: ${join(out, 'digest.md')}\nReplay (open offline, or send to a phone): ${join(out, 'replay.html')}`);
if (waiModel && coachRunNeurons > 0 && !has('--no-record')) console.log((await import('./record-neurons.mts')).recordNeurons(coachRunNeurons));
if (!has('--no-notify') && process.platform === 'darwin') spawnSync('osascript', ['-e', 'display notification "The troll arena run is finished." with title "Troll arena"'], { stdio: 'ignore' });
await sleep(Number(flag('--linger') ?? 30) * 1000);
for (const c of clients) c.end();
server.close();
rmSync(work, { recursive: true, force: true });
process.exit(0);
