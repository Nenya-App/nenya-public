// The nightly canary (owner, 2026-11-16; docs/canary-scope.md): shortly before Workers AI's daily allowance resets, play the invented persona set through the
// real coach function (instructions v2.1, the private text, the real Workers AI call) and keep a digest. It spends only what is genuinely unused that day,
// and never more than 3,000 Neurons (src/lib/canaryBudget.ts). The coach runs against an in-memory store, so no visitor counter or record is touched, and
// nothing a visitor wrote is involved: the cases are invented. Digests go to the private store under canary/ and are never public until the owner reviews them.
// Off unless COACH_CANARY=on; only the nightly function, with a key made from COACH_TICKET_SECRET, can start it.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { canaryAllowance, canaryKey, utcDay } from '../../src/lib/canaryBudget.ts';
import { PERSONA_CASES } from '../../src/lib/personaEvalSet.ts';
import { pacedSend, runCase, summarize, type CaseResult, type RawSent } from '../../src/lib/personaEval.ts';
import { readWorkersAi } from '../../src/lib/coachProvider.ts';
import { gradeLevel } from '../../src/lib/readingLevel.ts';
import handler, { __useStoreForTests } from './coach.mts';

const WALL_MS = 13 * 60_000; // the background limit is 15 minutes
const MIN_CASE_NEURONS = 60; // a conversation's worth: stop before starting one that may not fit

interface Task { name: string; instructions: string; stance?: string; model?: string }
interface TaskReport { name: string; instructions: string; stance?: string; model?: string; conversations: number; pass: number; fail: number; error: number; medianWords: number; medianGrade: number; failedCases: Record<string, number>; neurons: number }
const median = (xs: number[]): number => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);

/** One task's digest line: counts, the median reply length and reading level (Flesch-Kincaid grade), and the cases that failed. Never the replies themselves. */
export function report(t: Task, results: CaseResult[], neurons: number): TaskReport {
  const replies = results.map((r) => String(r.reply ?? '')).filter(Boolean);
  const failedCases: Record<string, number> = {};
  results.filter((r) => r.outcome === 'fail').forEach((r) => (failedCases[r.id] = (failedCases[r.id] ?? 0) + 1));
  const s = summarize(results);
  return { ...t, conversations: results.length, pass: s.pass, fail: s.fail, error: s.error, medianWords: median(replies.map((x) => x.split(/\s+/).filter(Boolean).length)), medianGrade: Math.round(median(replies.map((x) => gradeLevel(x))) * 10) / 10, failedCases, neurons };
}

/** What changed against the last week: a longer or shorter typical reply, a fall in the pass rate, or a case that had never failed and now does. */
export function driftFlags(today: TaskReport[], past: TaskReport[], cases: Record<string, [number, number]>): string[] {
  const flags: string[] = [];
  if (past.length >= 3) {
    const avgWords = past.reduce((a, x) => a + x.medianWords, 0) / past.length;
    const avgRate = past.reduce((a, x) => a + x.pass / Math.max(1, x.conversations), 0) / past.length;
    for (const t of today) {
      if (avgWords && Math.abs(t.medianWords - avgWords) / avgWords > 0.25) flags.push(`median reply length ${t.medianWords} words against about ${Math.round(avgWords)} lately`);
      if (t.pass / Math.max(1, t.conversations) < avgRate - 0.08) flags.push(`pass rate ${t.pass}/${t.conversations} against about ${Math.round(avgRate * 100)}% lately`);
    }
  }
  const failsToday: Record<string, number> = {};
  for (const t of today) for (const [id, n] of Object.entries(t.failedCases)) failsToday[id] = (failsToday[id] ?? 0) + n;
  for (const [id, n] of Object.entries(failsToday)) if ((cases[id]?.[0] ?? 0) >= 8 && cases[id][1] === n) flags.push(`${id} had not failed in any earlier baseline run (${cases[id][0] - n} or more) and failed tonight`);
  return flags;
}

export default async (req: Request): Promise<Response> => {
  const secret = process.env.COACH_TICKET_SECRET;
  if (process.env.COACH_CANARY !== 'on' || !secret || req.headers.get('x-canary-key') !== canaryKey(secret)) return new Response(null, { status: 404 });
  const started = Date.now();
  const day = utcDay();
  const store = getStore(storeNameFrom(process.env.COACH_STORE_NAME));
  try {
    const ledger = JSON.parse((await store.get('canary/ledger', { type: 'text' })) ?? '{}') as Record<string, number>;
    // Visitor turns today, a bare number (the daily counter's "day:count"); Minnesota's day lags the UTC day, so the evening before is allowed for with 20.
    const raw = (await store.get('daily-count', { type: 'text' })) ?? '';
    const counted = /^\d{4}-\d{2}-\d{2}:(\d+)$/.exec(raw)?.[1];
    const visitorTurns = (counted ? Number(counted) : Number(process.env.COACH_DAILY_CAP) || 80) + 20;
    let allowance = canaryAllowance({ spentToday: ledger[day] ?? 0, visitorTurns });
    console.log(`canary: day ${day}, spent ${ledger[day] ?? 0}, visitor turns ${visitorTurns}, allowance ${allowance}`);
    if (allowance < MIN_CASE_NEURONS) return new Response(null, { status: 202 });

    // The private text, read from this site's own store, served to the coach from memory (so its counters and records stay out of the real store).
    const text = new Map<string, string>();
    for (const k of ['modules', 'method-notes', 'learn-icarus']) {
      const v = await store.get(k, { type: 'text' });
      if (v) text.set(k, v);
    }
    const mem = new Map<string, { v: string; e: number }>();
    __useStoreForTests({
      async get(k: string) { return text.get(k) ?? mem.get(k)?.v ?? null; },
      async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
      async set(k: string, v: string, o: any = {}) { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
      async setJSON(k: string, v: unknown) { mem.set(k, { v: JSON.stringify(v), e: (mem.get(k)?.e ?? 0) + 1 }); },
      async list({ prefix = '' }: { prefix?: string } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
      async delete(k: string) { mem.delete(k); },
    });
    // The settings the bake-off measured. Provider, model, account and token are the site's own.
    Object.assign(process.env, { COACH_ENABLED: 'true', COACH_PROVIDER: 'workers-ai', COACH_INSTRUCTIONS: 'v2.1', COACH_DISTRESS_TEXT: 'on', COACH_VALUES: 'on', COACH_MODULES: 'on', COACH_TURNSTILE: 'off', COACH_SCREEN: 'off' });

    // Neurons are read from each Workers AI answer, the real thing, not estimated.
    let spent = 0;
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await realFetch(input as RequestInfo, init);
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith('https://api.cloudflare.com/client/v4/accounts/')) spent += readWorkersAi(await res.clone().json().catch(() => ({}))).neurons ?? 0;
      return res;
    }) as typeof fetch;

    let stance: string | undefined; // the task's stance (the Learn lens), sent with each message
    const send = pacedSend(
      async (messages, ticket): Promise<RawSent> => {
        const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket, ...(stance ? { stance } : {}) }) }));
        const j: any = await res.json().catch(() => ({}));
        return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
      },
      { paceMs: 500, backoffMs: [5000, 15000], sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), onWait: () => undefined },
    );

    // Tonight's tasks (docs/canary-scope.md): an alternate, then the baseline twice. The baseline (instructions v2.1) is what drift and per-case pass rates are measured on; the
    // alternate rotates by day: the Learn stance, instructions v2, and a candidate model when COACH_CANARY_MODEL names one (for example Apertus, once access comes).
    const dayNo = Math.floor(Date.parse(day) / 86400000);
    const alts: Task[] = [{ name: 'learn', instructions: 'v2.1', stance: 'vilya' }, { name: 'v2', instructions: 'v2' }, ...(process.env.COACH_CANARY_MODEL ? [{ name: 'model', instructions: 'v2.1', model: process.env.COACH_CANARY_MODEL }] : [])];
    const baseline: Task = { name: 'baseline', instructions: 'v2.1' };
    const tasks = [alts[dayNo % alts.length], baseline, baseline];
    const defaultModel = process.env.COACH_MODEL;
    const reports: TaskReport[] = [];
    // Cases in a rotation that starts somewhere new each night, so a small allowance still covers every case over a few nights.
    const offset = dayNo % PERSONA_CASES.length;
    const order = [...PERSONA_CASES.slice(offset), ...PERSONA_CASES.slice(0, offset)];
    const caseTally = JSON.parse((await store.get('canary/cases', { type: 'text' })) ?? '{}') as Record<string, [number, number]>;
    try {
      for (const t of tasks) {
        if (allowance - spent < MIN_CASE_NEURONS || Date.now() - started >= WALL_MS) break;
        stance = t.stance;
        process.env.COACH_INSTRUCTIONS = t.instructions;
        if (t.model) process.env.COACH_MODEL = t.model;
        else if (defaultModel) process.env.COACH_MODEL = defaultModel;
        else delete process.env.COACH_MODEL;
        const before = spent;
        const results: CaseResult[] = [];
        for (const c of order) {
          if (allowance - spent < MIN_CASE_NEURONS || Date.now() - started >= WALL_MS) break;
          const r = await runCase(c, send);
          results.push(r);
          if (t.name === 'baseline' && r.outcome !== 'error') {
            const e = (caseTally[r.id] ??= [0, 0]);
            e[0]++;
            if (r.outcome !== 'pass') e[1]++;
          }
        }
        reports.push(report(t, results, Math.round(spent - before)));
        // Everything failing: for the candidate model (no access yet, say) go on to the baselines; otherwise it is quota or an outage, so stop.
        if (results.length && results.every((r) => r.outcome === 'error') && t.name !== 'model') break;
      }
    } finally {
      globalThis.fetch = realFetch;
      if (defaultModel) process.env.COACH_MODEL = defaultModel;
    }
    // Drift: the baseline against the last week's baselines, and any case that has never failed (six or more runs) and now does.
    const recent = (await store.list({ prefix: 'canary/digest-' })).blobs.map((b) => b.key).filter((k) => k < `canary/digest-${day}`).sort().slice(-7);
    const past: TaskReport[] = [];
    for (const k of recent) {
      const d = JSON.parse((await store.get(k, { type: 'text' })) ?? '{}');
      past.push(...((d.tasks ?? []) as TaskReport[]).filter((x) => x.name === 'baseline'));
    }
    const flags = driftFlags(reports.filter((x) => x.name === 'baseline'), past, caseTally);
    const digest = { day, model: defaultModel || '@cf/google/gemma-4-26b-a4b-it', tasks: reports, spentNeurons: Math.round(spent), flags, reviewed: false };
    await store.set(`canary/digest-${day}`, JSON.stringify(digest));
    await store.set('canary/cases', JSON.stringify(caseTally));
    console.log(`canary: ${reports.map((r) => `${r.name} ${r.pass}/${r.conversations}`).join(', ')}; ${Math.round(spent)} Neurons; flags ${flags.length}`);
    ledger[day] = (ledger[day] ?? 0) + Math.round(spent);
    await store.set('canary/ledger', JSON.stringify(ledger));
    return new Response(null, { status: 202 });
  } catch (e) {
    console.error(`canary: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};
