// The nightly canary (owner, 2026-11-16; docs/canary-scope.md). Workers AI's free allowance resets at 00:00 UTC, so in the hour before it, a run every minute
// plays a few of the invented persona cases through the real coach function (Workers AI, the private text from this site's own store) and saves where it is
// up to; when the night's allowance is spent, or every task is done, it writes a digest. It spends only what is genuinely unused that day, never more than
// the whole free allowance, only in the last hour before the reset (src/lib/canaryBudget.ts). Small pieces, because a scheduled function may run only about 30 seconds, and because a password on a site blocks
// a function calling another over the site's own address.
//
// It touches nothing a visitor wrote: the cases are invented and the coach runs against an in-memory store (the site's counters and records stay out of it).
// The digest holds counts, medians, flags and failed case ids; never a reply. Off unless COACH_CANARY=on, on a site that runs the coach on Workers AI.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { MAX_RUNS_A_NIGHT, canaryAllowance, runsThatFit, utcDay } from '../../src/lib/canaryBudget.ts';
import { costSummary } from '../../src/lib/canaryCost.ts';
import { caseOrder, driftFlags, planTasks, report, type NightState, type TaskReport } from '../../src/lib/canaryNight.ts';
import { PERSONA_CASES } from '../../src/lib/personaEvalSet.ts';
import { pacedSend, runCase, type RawSent } from '../../src/lib/personaEval.ts';
import { readWorkersAi } from '../../src/lib/coachProvider.ts';
import { gradeLevel } from '../../src/lib/readingLevel.ts';
import { BUILD_INFO } from '../../src/generated/build-info.ts';
import handler, { __instructionsFingerprint, __trace, __useStoreForTests } from './coach.mts';

const START_NEW_CASE_BEFORE_MS = 10_000; // a case (up to five replies) must end before the 30-second limit
const MIN_CASE_NEURONS = 60; // a conversation's worth: stop before starting one that may not fit

export default async (): Promise<Response> => {
  if (process.env.COACH_CANARY !== 'on') return new Response(null, { status: 204 });
  const started = Date.now();
  const day = utcDay();
  const dayNo = Math.floor(Date.parse(day) / 86400000);
  const store = getStore(storeNameFrom(process.env.COACH_STORE_NAME));
  const stateKey = `canary/night-${day}`;
  try {
    let state = JSON.parse((await store.get(stateKey, { type: 'text' })) ?? 'null') as NightState | null;
    if (state?.done) return new Response(null, { status: 204 });
    const ledger = JSON.parse((await store.get('canary/ledger', { type: 'text' })) ?? '{}') as Record<string, number>;

    if (!state) {
      // The start of the night. Visitor turns today are a bare number (the daily counter's "day:count"); Minnesota's day lags the UTC day, so the evening before is allowed for with 20.
      const counted = /^\d{4}-\d{2}-\d{2}:(\d+)$/.exec((await store.get('daily-count', { type: 'text' })) ?? '')?.[1];
      // Visitors on THIS site only (its daily count). Production runs on Venice now, so no part of this allowance is held back for it (owner, 2026-11-19).
      const visitorTurns = counted ? Number(counted) : 0;
      // What the owner spent by hand today (scripts/record-neurons.mts): the free allowance is shared by every use of the account.
      const manual = (JSON.parse((await store.get('canary/manual', { type: 'text' })) ?? '{}') as Record<string, number>)[day] ?? 0;
      const allowance = canaryAllowance({ spentToday: (ledger[day] ?? 0) + manual, visitorTurns });
      const tasks = planTasks(dayNo, process.env.COACH_CANARY_MODEL, Math.min(MAX_RUNS_A_NIGHT, Math.max(3, runsThatFit(allowance))));
      state = { day, allowance, tasks, t: 0, c: 0, spent: 0, taskSpent: tasks.map(() => 0), compact: tasks.map(() => []), done: false };
      console.log(`canary: night ${day}, spent ${ledger[day] ?? 0} (canary) + ${manual} (by hand), visitor turns held back ${visitorTurns}, allowance ${allowance}`);
      if (allowance < MIN_CASE_NEURONS) {
        state.done = true;
        state.skipped = 'not enough unused today';
        await store.set(stateKey, JSON.stringify(state));
        return new Response(null, { status: 204 });
      }
    }

    // The private text, read from this site's own store and served to the coach from memory, with its counters and records kept out of the real store.
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
    const defaultModel = process.env.COACH_MODEL;
    Object.assign(process.env, { COACH_ENABLED: 'true', COACH_PROVIDER: 'workers-ai', COACH_DISTRESS_TEXT: 'on', COACH_VALUES: 'on', COACH_MODULES: 'on', COACH_STANCES: 'learn', COACH_TURNSTILE: 'off', COACH_SCREEN: 'off' });

    // Neurons are read from each Workers AI answer, the real thing, not estimated.
    let spentNow = 0;
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await realFetch(input as RequestInfo, init);
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith('https://api.cloudflare.com/client/v4/accounts/')) spentNow += readWorkersAi(await res.clone().json().catch(() => ({}))).neurons ?? 0;
      return res;
    }) as typeof fetch;
    // Model calls per turn, from the coach's own trace (counts only; the text of a rejected summary is not turned on). A turn that made two calls was sent back by a guard once.
    __trace.on(true);
    let turnCalls: number[] = [];
    let stance: string | undefined;
    const send = pacedSend(
      async (messages, ticket): Promise<RawSent> => {
        __trace.take();
        const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: { color1: '#7a9b9e', color2: '#DAC682' }, ticket, ...(stance ? { stance } : {}) }) }));
        turnCalls.push(__trace.take().calls);
        const j: any = await res.json().catch(() => ({}));
        return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, status: res.status, error: j.error ? `${j.error}${j.reason ? ' ' + j.reason : ''}` : res.ok ? undefined : `status ${res.status}` };
      },
      { paceMs: 500, backoffMs: [3000, 8000], sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now(), onWait: () => undefined },
    );

    const order = caseOrder(PERSONA_CASES, dayNo);
    // The last runs of the hour close the night with whatever has been played, so a slow night still leaves a digest before the allowance resets.
    let finished = new Date().getUTCMinutes() >= 55;
    try {
      while (state.t < state.tasks.length && !finished) {
        const task = state.tasks[state.t];
        stance = task.stance;
        process.env.COACH_INSTRUCTIONS = task.instructions;
        if (task.model) process.env.COACH_MODEL = task.model;
        else if (defaultModel) process.env.COACH_MODEL = defaultModel;
        else delete process.env.COACH_MODEL;
        if (state.c === 0 && !state.fingerprints?.[state.t]) (state.fingerprints ??= [])[state.t] = __instructionsFingerprint();
        while (state.c < order.length) {
          if (state.allowance - state.spent < MIN_CASE_NEURONS) { finished = true; break; }
          if (Date.now() - started >= START_NEW_CASE_BEFORE_MS) break;
          const before = spentNow;
          turnCalls = [];
          const r = await runCase(order[state.c], send);
          const reply = String(r.reply ?? '');
          const cost = spentNow - before;
          state.spent += cost;
          state.taskSpent[state.t] += cost;
          state.compact[state.t].push({ id: r.id, outcome: r.outcome, words: reply.split(/\s+/).filter(Boolean).length, grade: reply ? gradeLevel(reply) : 0, neurons: Math.round(cost), calls: turnCalls });
          // The complete run, kept privately: the case id, its outcome and checks, and the coach's replies. Never the prompt (it holds the private notes) and never any visitor text: the
          // cases are invented. One small key per case, so a run cut off by the time limit loses at most the case in hand.
          await store.set(`canary/runs/${day}/${state.t}-${r.id}`, JSON.stringify({ t: state.t, task: task.name, id: r.id, category: r.category, outcome: r.outcome, how: r.how, failures: r.failures, reply: r.reply ?? null, neurons: Math.round(cost) }));
          state.c++;
          // Three errors in a row: the allowance has run out or Workers AI is down. Stop at once instead of spending the rest of the night's requests on errors.
          const last3 = state.compact[state.t].slice(-3);
          if (last3.length === 3 && last3.every((x) => x.outcome === 'error')) { state.stopped = 'three errors in a row (probably the daily allowance, or an outage)'; finished = true; break; }
          await store.set(stateKey, JSON.stringify(state)); // after every case, so a run cut off by the time limit loses at most the case in hand
        }
        if (finished || Date.now() - started >= START_NEW_CASE_BEFORE_MS) break;
        // A task done. If every conversation failed, the candidate model (no access yet, say) is skipped; otherwise it is quota or an outage, so the night ends.
        const cs = state.compact[state.t];
        if (cs.length && cs.every((x) => x.outcome === 'error') && task.name !== 'model') { finished = true; break; }
        state.t++;
        state.c = 0;
      }
    } finally {
      globalThis.fetch = realFetch;
      __trace.on(false);
      __trace.take();
      if (defaultModel) process.env.COACH_MODEL = defaultModel;
    }

    if (state.t >= state.tasks.length) finished = true;
    if (finished) {
      const reports: TaskReport[] = state.tasks.map((t, i) => report(t, state!.compact[i], state!.taskSpent[i])).filter((r) => r.conversations > 0);
      const caseTally = JSON.parse((await store.get('canary/cases', { type: 'text' })) ?? '{}') as Record<string, [number, number]>;
      state.tasks.forEach((t, i) => {
        if (t.name !== 'baseline') return;
        for (const x of state!.compact[i]) {
          if (x.outcome === 'error') continue;
          const e = (caseTally[x.id] ??= [0, 0]);
          e[0]++;
          if (x.outcome !== 'pass') e[1]++;
        }
      });
      const recent = (await store.list({ prefix: 'canary/digest-' })).blobs.map((b) => b.key).filter((k) => k < `canary/digest-${day}`).sort().slice(-7);
      const past: TaskReport[] = [];
      for (const k of recent) past.push(...((JSON.parse((await store.get(k, { type: 'text' })) ?? '{}').tasks ?? []) as TaskReport[]).filter((x) => x.name === 'baseline'));
      const flags = driftFlags(reports.filter((x) => x.name === 'baseline'), past, caseTally);
      // The whole night's two cost signals (send-backs, Neurons per case), over every task played; each task's line carries its own under `cost`.
      const nightCost = (({ sendBacks, sendBackRate, neuronsPerCaseMedian, neuronsPerCaseMean, modelCalls, turns }) => ({ sendBacks, sendBackRate, neuronsPerCaseMedian, neuronsPerCaseMean, modelCalls, turns }))(costSummary(state.compact.flat()));
      const digest = { day, model: defaultModel || '@cf/google/gemma-4-26b-a4b-it', tasks: reports, spentNeurons: Math.round(state.spent), ...nightCost, flags, ...(state.stopped ? { stopped: state.stopped } : {}), reviewed: false };
      // What the full run was made with, so a later reader can tell one night's replies from another's.
      await store.set(`canary/runs/${day}/meta`, JSON.stringify({ day, model: digest.model, provider: 'workers-ai', build: BUILD_INFO.commit, tasks: state.tasks.map((t, i) => ({ ...t, instructionsFingerprint: state.fingerprints?.[i] ?? null, neurons: Math.round(state.taskSpent[i]) })), spentNeurons: digest.spentNeurons, note: 'Invented cases only. Replies can echo the private notes: read before sharing anything.' }));
      await store.set(`canary/digest-${day}`, JSON.stringify(digest));
      await store.set('canary/cases', JSON.stringify(caseTally));
      ledger[day] = (ledger[day] ?? 0) + Math.round(state.spent);
      await store.set('canary/ledger', JSON.stringify(ledger));
      state.done = true;
      console.log(`canary: done; ${reports.map((r) => `${r.name} ${r.pass}/${r.conversations}`).join(', ')}; ${Math.round(state.spent)} Neurons; flags ${flags.length}`);
    }
    await store.set(stateKey, JSON.stringify(state));
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(`canary: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. Every minute from 23:00 to 23:59 UTC, the hour before Workers AI's allowance resets.
export const config = {
  schedule: '* 23 * * *',
};
