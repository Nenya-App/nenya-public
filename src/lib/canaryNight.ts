// The pure parts of the nightly canary (docs/canary-scope.md): tonight's tasks, the case order, a task's digest line, and the drift flags. The run itself
// is netlify/functions/canary-nightly.mts. Nothing here holds a reply: a case is kept as its id, its outcome, and the length and reading grade of its reply.

import { costSummary, sendBackFlag, type CostSummary } from './canaryCost.ts';

export interface Task { name: string; instructions: string; stance?: string; model?: string }
/** `neurons` and `calls` (model calls on each turn of the case) are numbers only, and absent on cases saved before they were recorded. */
export interface Compact { id: string; outcome: string; words: number; grade: number; neurons?: number; calls?: number[] }
export interface TaskReport extends Task { conversations: number; pass: number; fail: number; error: number; medianWords: number; medianGrade: number; failedCases: Record<string, number>; neurons: number; cost?: CostSummary; sendBackRate?: number }

/** Where a night is up to, kept in the private store between the minute-by-minute runs. */
export interface NightState {
  day: string;
  allowance: number;
  tasks: Task[];
  /** The task, and the case within it, to play next. */
  t: number;
  c: number;
  spent: number;
  taskSpent: number[];
  compact: Compact[][];
  done: boolean;
  skipped?: string;
  /** Why the night ended early, if it did. */
  stopped?: string;
  /** Set when the candidate model task was skipped because it kept erroring (no access, say); the night went on with the next task. */
  candidateSkipped?: string;
  /** The instructions fingerprint of each task, for the archive. */
  fingerprints?: string[];
}

export const median = (xs: number[]): number => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);

/**
 * Tonight's tasks: an alternate, then the baseline twice. The baseline (instructions v2.1) is what drift and per-case pass rates are measured on. The alternate
 * rotates by day: the Learn stance, instructions v2, and a candidate model when one is named (for example Apertus, once access comes).
 */
export function planTasks(dayNo: number, candidateModel?: string, runs = 3): Task[] {
  const alts: Task[] = [{ name: 'learn', instructions: 'v2.1', stance: 'vilya' }, { name: 'v2', instructions: 'v2' }, ...(candidateModel ? [{ name: 'model', instructions: 'v2.1', model: candidateModel }] : [])];
  const baseline: Task = { name: 'baseline', instructions: 'v2.1' };
  // Three runs is the original night; a bigger allowance repeats the pattern (an alternate, then two baselines), the alternate rotating on.
  return Array.from({ length: Math.max(1, runs) }, (_, i) => (i % 3 === 0 ? alts[(dayNo + i / 3) % alts.length] : baseline));
}

/** The cases in a rotation that starts somewhere new each night, so a small allowance still covers every case over a few nights. */
export function caseOrder<T>(cases: T[], dayNo: number): T[] {
  const o = dayNo % cases.length;
  return [...cases.slice(o), ...cases.slice(0, o)];
}

/** One task's digest line: counts, the median reply length and reading level (Flesch-Kincaid grade), and the failed case ids. Never the replies. */
export function report(t: Task, cases: Compact[], neurons: number): TaskReport {
  const failedCases: Record<string, number> = {};
  cases.filter((r) => r.outcome === 'fail').forEach((r) => (failedCases[r.id] = (failedCases[r.id] ?? 0) + 1));
  const answered = cases.filter((r) => r.words > 0);
  return {
    ...t,
    conversations: cases.length,
    pass: cases.filter((r) => r.outcome === 'pass').length,
    fail: cases.filter((r) => r.outcome === 'fail').length,
    error: cases.filter((r) => r.outcome === 'error').length,
    medianWords: median(answered.map((r) => r.words)),
    medianGrade: Math.round(median(answered.map((r) => r.grade)) * 10) / 10,
    failedCases,
    neurons: Math.round(neurons),
    ...(cases.some((r) => r.calls) ? (() => { const cost = costSummary(cases); return { cost, sendBackRate: cost.sendBackRate }; })() : {}),
  };
}

/** What changed against the last week: a longer or shorter typical reply, a fall in the pass rate, or a case that had not failed in eight or more baseline runs and does now. */
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
  const baseToday = today.filter((t) => t.sendBackRate !== undefined && (t.cost?.turns ?? 0) > 0);
  for (const t of baseToday) { const f = sendBackFlag(t.sendBackRate, past.map((x) => x.sendBackRate)); if (f) flags.push(f); }
  const failsToday: Record<string, number> = {};
  for (const t of today) for (const [id, n] of Object.entries(t.failedCases)) failsToday[id] = (failsToday[id] ?? 0) + n;
  for (const [id, n] of Object.entries(failsToday)) if ((cases[id]?.[0] ?? 0) >= 8 && cases[id][1] === n) flags.push(`${id} had not failed in any earlier baseline run (${cases[id][0] - n} or more) and failed tonight`);
  return flags;
}

/**
 * What to do when cases keep erroring (2026-11-20). Three errors in a row on the candidate model task (no access yet, say) skip that task and the night goes on with the
 * next one; on any other task it is the allowance running out or an outage, so the night ends. Fewer than three errors in a row: carry on.
 * (Until this was fixed, the candidate model's 403 ended the whole night on 20 Nov and 6,110 Neurons went unused.)
 */
export function onErrorStreak(task: { name: string }, outcomes: string[]): 'continue' | 'skip-task' | 'end-night' {
  const last3 = outcomes.slice(-3);
  if (last3.length < 3 || !last3.every((o) => o === 'error')) return 'continue';
  return task.name === 'model' ? 'skip-task' : 'end-night';
}
