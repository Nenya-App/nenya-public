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
