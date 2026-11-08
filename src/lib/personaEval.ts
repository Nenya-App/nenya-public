// Runs one persona evaluation case against anything that can answer a coach message (the real coach function in
// scripts/eval-persona.mts, a stand-in in the tests) and decides pass or fail with the checks in personaChecks.ts.
import { present, type CheckName } from './personaChecks.ts';
import type { PersonaCase } from './personaEvalSet.ts';

export interface Sent {
  reply?: string;
  ticket?: string;
  blocked?: string;
  flag?: { tier?: string };
  done?: boolean;
  error?: string;
}
export type Wire = { role: 'user' | 'assistant'; content: string };
export type Send = (messages: Wire[], ticket: string | undefined) => Promise<Sent>;

export interface RawSent extends Sent {
  /** The HTTP status of the answer, when there was one. */
  status?: number;
}

/** A failure that is worth waiting out and trying again: the model service is rate limiting, briefly down, or slow. */
export const isTransient = (r: RawSent): boolean =>
  r.status === 429 || (typeof r.error === 'string' && /\bupstream\b/.test(r.error) && /\b(?:status-(?:429|5\d\d)|timeout|network)\b/.test(r.error)) || (!r.reply && !r.blocked && !r.flag && /\bstatus (?:429|5\d\d)\b/.test(r.error ?? ''));

export interface PaceOptions {
  /** Least time between two calls. */
  paceMs: number;
  /** How long to wait before each retry of a call that failed in a way that may pass (its length is the number of retries). */
  backoffMs: number[];
  sleep: (ms: number) => Promise<void>;
  now: () => number;
  onWait?: (ms: number, attempt: number, why: string) => void;
}

/** Wraps a call so there is always a pause between calls and a rate-limited call is retried after waiting. */
export function pacedSend(raw: (messages: Wire[], ticket: string | undefined) => Promise<RawSent>, o: PaceOptions): Send {
  let last = -Infinity;
  return async (messages, ticket) => {
    for (let attempt = 0; ; attempt++) {
      const wait = Math.max(0, last + o.paceMs - o.now());
      if (wait > 0) await o.sleep(wait);
      last = o.now();
      const r = await raw(messages, ticket);
      if (!isTransient(r) || attempt >= o.backoffMs.length) return r;
      o.onWait?.(o.backoffMs[attempt], attempt + 1, r.error ?? `status ${r.status}`);
      await o.sleep(o.backoffMs[attempt]);
    }
  };
}

/** For resuming: which cases already have a pass or fail result (kept) and which still need a run (earlier errors are run again). */
export function planResume(previous: CaseResult[], chosen: { id: string }[]): { kept: CaseResult[]; todo: { id: string }[] } {
  const done = new Map(previous.filter((r) => r.outcome === 'pass' || r.outcome === 'fail').map((r) => [r.id, r]));
  return { kept: chosen.filter((c) => done.has(c.id)).map((c) => done.get(c.id)!), todo: chosen.filter((c) => !done.has(c.id)) };
}

export interface CaseResult {
  id: string;
  category: string;
  outcome: 'pass' | 'fail' | 'error';
  /** How the message was answered: a reply, stopped by the steering screen, stopped by the crisis check, or not at all. */
  how: 'reply' | 'blocked' | 'flag' | 'none';
  reply?: string;
  failures: string[];
  /** Review checks and whether they were present (never decide the outcome). */
  review: { check: CheckName; present: boolean }[];
  note: string;
}

export async function runCase(c: PersonaCase, send: Send): Promise<CaseResult> {
  const base = { id: c.id, category: c.category, note: c.note };
  const msgs: Wire[] = [];
  let ticket: string | undefined;
  for (const text of c.lead ?? []) {
    msgs.push({ role: 'user', content: text });
    const r = await send(msgs, ticket);
    if (!r.reply) return { ...base, outcome: 'error', how: 'none', failures: [`an earlier message got no reply (${r.error ?? r.blocked ?? 'unknown'})`], review: [] };
    msgs.push({ role: 'assistant', content: r.reply });
    ticket = r.ticket;
  }
  msgs.push({ role: 'user', content: c.prompt });
  const r = await send(msgs, ticket);
  const ok = c.alsoOk ?? [];
  if (r.blocked) {
    return ok.includes('blocked')
      ? { ...base, outcome: 'pass', how: 'blocked', failures: [], review: [] }
      : { ...base, outcome: 'fail', how: 'blocked', failures: [`the message was stopped before it reached the coach (${r.blocked}), which this case does not allow`], review: [] };
  }
  if (!r.reply) {
    if (r.flag?.tier === 'stop') {
      return ok.includes('flag')
        ? { ...base, outcome: 'pass', how: 'flag', failures: [], review: [] }
        : { ...base, outcome: 'fail', how: 'flag', failures: ['the crisis check stopped this message, which this case does not allow'], review: [] };
    }
    return { ...base, outcome: 'error', how: 'none', failures: [`no reply (${r.error ?? 'unknown'})`], review: [] };
  }
  const reply = r.reply;
  const failures: string[] = [];
  for (const k of c.must ?? []) if (!present(k, reply)) failures.push(`missing: ${k}`);
  for (const k of c.mustNot ?? []) if (present(k, reply)) failures.push(`present (must not be): ${k}`);
  const review = (c.review ?? []).map((check) => ({ check, present: present(check, reply) }));
  return { ...base, outcome: failures.length ? 'fail' : 'pass', how: 'reply', reply, failures, review };
}

export interface Summary {
  total: number;
  pass: number;
  fail: number;
  error: number;
  byCategory: Record<string, { pass: number; fail: number; error: number }>;
  failing: string[];
}

export function summarize(results: CaseResult[]): Summary {
  const byCategory: Summary['byCategory'] = {};
  for (const r of results) {
    const c = (byCategory[r.category] ??= { pass: 0, fail: 0, error: 0 });
    c[r.outcome]++;
  }
  return {
    total: results.length,
    pass: results.filter((r) => r.outcome === 'pass').length,
    fail: results.filter((r) => r.outcome === 'fail').length,
    error: results.filter((r) => r.outcome === 'error').length,
    byCategory,
    failing: results.filter((r) => r.outcome !== 'pass').map((r) => r.id),
  };
}
