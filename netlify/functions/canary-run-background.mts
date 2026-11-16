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
import handler, { __useStoreForTests } from './coach.mts';

const WALL_MS = 13 * 60_000; // the background limit is 15 minutes
const MIN_CASE_NEURONS = 60; // a conversation's worth: stop before starting one that may not fit

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

    const send = pacedSend(
      async (messages, ticket): Promise<RawSent> => {
        const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket }) }));
        const j: any = await res.json().catch(() => ({}));
        return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
      },
      { paceMs: 500, backoffMs: [5000, 15000], sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), onWait: () => undefined },
    );

    // Cases in a rotation that starts somewhere new each night, so a small allowance still covers every case over a few nights.
    const offset = Math.floor(Date.parse(day) / 86400000) % PERSONA_CASES.length;
    const order = [...PERSONA_CASES.slice(offset), ...PERSONA_CASES.slice(0, offset)];
    const results: CaseResult[] = [];
    const runs: CaseResult[][] = [];
    try {
      while (allowance - spent >= MIN_CASE_NEURONS && Date.now() - started < WALL_MS) {
        const run: CaseResult[] = [];
        for (const c of order) {
          if (allowance - spent < MIN_CASE_NEURONS || Date.now() - started >= WALL_MS) break;
          const r = await runCase(c, send);
          run.push(r);
          results.push(r);
        }
        runs.push(run);
        if (run.length && run.every((r) => r.outcome === 'error')) break; // everything failing: quota or outage; stop
      }
    } finally {
      globalThis.fetch = realFetch;
    }
    const words = results.map((r) => String(r.reply ?? '').split(/\s+/).filter(Boolean).length).filter(Boolean).sort((a, b) => a - b);
    const failed: Record<string, number> = {};
    results.filter((r) => r.outcome !== 'pass').forEach((r) => (failed[r.id] = (failed[r.id] ?? 0) + 1));
    const s = summarize(results);
    const digest = { day, model: process.env.COACH_MODEL || '@cf/google/gemma-4-26b-a4b-it', instructions: 'v2.1', conversations: results.length, pass: s.pass, fail: s.fail, error: s.error, spentNeurons: Math.round(spent), medianWords: words[Math.floor(words.length / 2)] ?? 0, failedCases: failed, reviewed: false };
    await store.set(`canary/digest-${day}`, JSON.stringify(digest));
    ledger[day] = (ledger[day] ?? 0) + Math.round(spent);
    await store.set('canary/ledger', JSON.stringify(ledger));
    console.log(`canary: ${s.pass}/${results.length} passed, ${Math.round(spent)} Neurons`);
    return new Response(null, { status: 202 });
  } catch (e) {
    console.error(`canary: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};
