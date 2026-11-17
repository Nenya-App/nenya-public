// What the outer layers did (docs/outer-layers-scope.md): for each test case, the model's first reply scored with the same checks as the final reply, the guard events, and how many model
// calls the turn took. The summary says, per model, how often the raw reply failed, how often the layers rescued it, and which guards did the work. Pure; the scripts do the calls.
import { judge, type CaseResult } from './personaEval.ts';
import type { PersonaCase } from './personaEvalSet.ts';

export interface LayerRecord {
  raw: string | null;
  calls: number;
  events: string[];
  /** How the raw reply would have scored on its own. */
  rawOutcome: 'pass' | 'fail' | 'error' | 'none';
}

/** The guard events among the tallies: what a guard, the values rule, or the hostile-turn rules did to a reply. */
export const guardEvents = (events: string[]): string[] => events.filter((e) => /^coach\.(guard|values|turn\.hostile)\./.test(e));

export function layerRecord(c: PersonaCase, trace: { raw: string | null; calls: number; events: string[] }): LayerRecord {
  const rawOutcome = trace.raw === null ? 'none' : judge(c, { reply: trace.raw }).outcome;
  return { raw: trace.raw, calls: trace.calls, events: guardEvents(trace.events), rawOutcome };
}

export interface LayerSummary {
  cases: number;
  /** Cases where the model's first reply broke a check. */
  rawFailed: number;
  /** Cases that fail after all the layers. */
  finalFailed: number;
  /** Raw failed, final passed: the layers did it. */
  rescued: number;
  /** Raw passed, final failed: the layers made it worse (should be none). */
  broken: number;
  /** Raw failed and still fails: nothing caught it. */
  stillFailing: number;
  /** Turns that needed more than one model call (a guard asked again). */
  askedAgain: number;
  /** Times each guard acted. */
  byGuard: Record<string, number>;
}

export function summarizeLayers(rows: { result: Pick<CaseResult, 'outcome'>; layers?: LayerRecord }[]): LayerSummary {
  const s: LayerSummary = { cases: 0, rawFailed: 0, finalFailed: 0, rescued: 0, broken: 0, stillFailing: 0, askedAgain: 0, byGuard: {} };
  for (const { result, layers } of rows) {
    if (!layers || layers.rawOutcome === 'none') continue;
    s.cases++;
    const rawFail = layers.rawOutcome === 'fail';
    const finalFail = result.outcome === 'fail';
    if (rawFail) s.rawFailed++;
    if (finalFail) s.finalFailed++;
    if (rawFail && !finalFail) s.rescued++;
    if (!rawFail && finalFail) s.broken++;
    if (rawFail && finalFail) s.stillFailing++;
    if (layers.calls > 1) s.askedAgain++;
    for (const e of layers.events) s.byGuard[e] = (s.byGuard[e] ?? 0) + 1;
  }
  return s;
}
