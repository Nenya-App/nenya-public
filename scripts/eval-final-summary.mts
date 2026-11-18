// Plays the invented five-exchange conversations of eval-final-turn.mts through the coach function with a LOCAL model (LM Studio and the like) and reads the FINAL reply for the v2.1 summary
// (docs/coach-instructions-v2.1.md): no question or invitation, names feelings and needs, points to the downloadable transcript, no promise to remember or be there, a sensible length.
// Everything stays on this computer (localhost only). The conversations are invented. Counts are heuristics (phrase matching): read the replies printed, they are the result.
//
//   node scripts/eval-final-summary.mts --local-url http://localhost:1234/v1 --model <LM Studio name> [--private <folder>] [--guards on|off] [--only 2] [--json out.json]
//
// --guards off (default) measures the instructions alone (the closing guard and the boundary guards are switched off); on shows what a visitor would see with the boundary guards on.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { asksOrInvites } from '../src/lib/coachClosing.ts';
import { pullsAgainstPeople } from '../src/lib/boundaryGuard.ts';
import { present } from '../src/lib/personaChecks.ts';
import { WORKERS_AI_STYLE_NOTE } from '../src/lib/coachProvider.ts';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const localUrl = flag('--local-url');
const model = flag('--model');
const privateDir = flag('--private');
const guards = flag('--guards') ?? 'off';
const only = Number(flag('--only') ?? 0);
const jsonOut = flag('--json');
const dumpPrompt = flag('--dump-prompt'); // writes the last request's messages (instructions included) to a file, to read what the model was actually given
if (!localUrl || !model || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(localUrl)) {
  console.error('Give --local-url (localhost only) and --model (the local model name).');
  process.exit(2);
}
if (privateDir && !existsSync(join(privateDir, 'modules.json'))) {
  console.error('--private needs a folder with modules.json.');
  process.exit(2);
}

process.env.COACH_ENABLED = 'true';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_PROVIDER = 'workers-ai';
process.env.CF_AI_ACCOUNT_ID = '0'.repeat(32);
process.env.CF_AI_TOKEN = 'local';
process.env.COACH_MODEL = `@cf/local/${model.replace(/[^a-z0-9._-]/gi, '-')}`;
process.env.COACH_INSTRUCTIONS = 'v2.1';
process.env.COACH_DISTRESS_TEXT = 'on';
process.env.COACH_VALUES = 'on';
delete process.env.COACH_MODULES;
delete process.env.COACH_METHOD_NOTES;
if (guards === 'on') process.env.COACH_BOUNDARY_GUARD = 'on';
else process.env.COACH_CLOSING_GUARD = 'off';
if (privateDir) {
  process.env.COACH_MODULES = 'on';
  process.env.COACH_STANCES = 'learn';
}

const realFetch = globalThis.fetch;
(globalThis as { fetch: typeof fetch }).fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('https://api.venice.ai/')) throw new Error('this script must never call Venice');
  if (!url.startsWith('https://api.cloudflare.com/client/v4/accounts/')) return realFetch(input as RequestInfo, init);
  const body = JSON.parse(String(init?.body ?? '{}'));
  // The Workers AI path adds a brevity note (two to four sentences, under 80 words) that production on Venice never sends, and it overrides the final-exchange summary. Taken out here so the run reads like Venice's prompt; --keep-style-note leaves it in.
  if (!args.includes('--keep-style-note')) for (const msg of body.messages ?? []) if (msg.role === 'system' && typeof msg.content === 'string') msg.content = msg.content.replace(WORKERS_AI_STYLE_NOTE, '').trim();
  if (dumpPrompt) writeFileSync(dumpPrompt, JSON.stringify(body.messages, null, 2));
  try {
    const r = await realFetch(`${localUrl.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: body.messages, temperature: body.temperature, top_p: body.top_p, max_tokens: body.max_tokens }) });
    if (!r.ok) return new Response('{}', { status: 502 });
    return new Response(JSON.stringify(await r.json()), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch {
    return new Response('{}', { status: 502 });
  }
}) as typeof fetch;

const privateText = new Map<string, string>();
if (privateDir) {
  privateText.set('modules', readFileSync(join(privateDir, 'modules.json'), 'utf8'));
  for (const [key, file] of [['method-notes', 'method-notes.txt'], ['learn-icarus', 'learn-icarus.txt']]) if (existsSync(join(privateDir, file))) privateText.set(key, readFileSync(join(privateDir, file), 'utf8'));
}
const { default: handler, __useStoreForTests } = await import('../netlify/functions/coach.mts');
{
  // An in-memory store: the private text when --private is given, and the counters the function writes (kept only for this run).
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

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const source = readFileSync(new URL('./eval-final-turn.mts', import.meta.url), 'utf8');
const m = source.match(/const CONVERSATIONS: string\[\]\[\] = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('could not read the conversations from eval-final-turn.mts');
const CONVERSATIONS: string[][] = new Function(`return ${m[1]}`)();

const words = (t: string): number => t.trim().split(/\s+/).filter(Boolean).length;
interface Row { n: number; reply: string; asks: boolean; feelingsNeeds: boolean; transcript: boolean; promise: boolean; words: number; tooLong: boolean }
const rows: Row[] = [];
console.log(`Final-reply summary check: ${model}, guards ${guards}${privateDir ? ', private text requested' : ''}`);
for (const [i, user] of CONVERSATIONS.entries()) {
  if (only && only !== i + 1) continue;
  const msgs: { role: 'user' | 'assistant'; content: string }[] = [];
  let ticket: string | undefined;
  let last = '';
  for (let t = 1; t <= 5; t++) {
    msgs.push({ role: 'user', content: user[t - 1] });
    const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: msgs, session: SESSION, ticket }) }));
    const j: any = await res.json();
    if (!j.reply) { last = ''; console.log(`  [conversation ${i + 1}, exchange ${t}] no reply: ${JSON.stringify({ error: j.error, blocked: j.blocked })}`); break; }
    msgs.push({ role: 'assistant', content: j.reply });
    ticket = j.ticket;
    last = j.reply;
  }
  if (!last) continue;
  const row: Row = {
    n: i + 1,
    reply: last,
    asks: asksOrInvites(last),
    feelingsNeeds: /\b(?:feel|feeling|feelings|felt|need|needs|needing|wish|want|hope)\b/i.test(last),
    transcript: /\b(?:transcript|download|a copy)\b/i.test(last),
    promise: pullsAgainstPeople(last) || present('promisesMemory', last) || present('farewellBond', last) || present('claimsMissingOrWorry', last),
    words: words(last),
    tooLong: words(last) > 150,
  };
  rows.push(row);
  console.log(`\n=== Conversation ${i + 1} (final reply, ${row.words} words) ===\n${last}\n  asks:${row.asks} feelings/needs:${row.feelingsNeeds} transcript:${row.transcript} promise:${row.promise}`);
}
const n = rows.length || 1;
const c = (f: (r: Row) => boolean): number => rows.filter(f).length;
console.log(`\nOf ${rows.length} final replies: ask or invite ${c((r) => r.asks)}; name feelings or needs ${c((r) => r.feelingsNeeds)}/${n}; point to the transcript ${c((r) => r.transcript)}/${n}; a promise or bond ${c((r) => r.promise)}; over 150 words ${c((r) => r.tooLong)}.`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), model, guards, rows }, null, 2));
