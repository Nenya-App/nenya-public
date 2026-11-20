// Two cost signals for the nightly canary digest (docs/canary-scope.md), kept as a pure function so they can be tested without the scheduled function.
//   send-backs: extra model calls the coach's guards caused. A turn normally makes one model call; a guard that asks the model for a different reply makes a second (or third).
//   cost per case: Neurons spent per persona case, as a median and a mean, not only the night's total.
// Input is numbers only (calls per turn, Neurons per case) and so is the output: no message or reply text can pass through here.

/** What the canary keeps of one case for cost: Neurons spent, and the model calls made on each turn of the case (from the coach's __trace, in process). */
export interface CostCase { outcome: string; neurons?: number; calls?: number[] }

export interface CostSummary {
  /** Cases counted (answered cases that have call data). */
  cases: number;
  /** Turns counted (one per message sent to the coach in those cases). */
  turns: number;
  modelCalls: number;
  /** Model calls beyond the first on a turn: how many extra calls the guards caused. */
  sendBacks: number;
  /** Send-backs per turn, to three places. 0 when no turns were counted. */
  sendBackRate: number;
  /** Neurons per case, to the nearest whole Neuron. */
  neuronsPerCaseMedian: number;
  neuronsPerCaseMean: number;
}

/** Extra calls in one case: each turn's calls beyond the first. A turn with no calls (stopped before the model) adds none. */
export const sendBacksIn = (callsPerTurn: number[]): number => callsPerTurn.reduce((a, n) => a + Math.max(0, Math.floor(Number(n) || 0) - 1), 0);

const middle = (xs: number[]): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Counts, medians and means for a set of cases. Cases that errored are left out (no answer, so no fair cost or call count), and so are cases saved before
 * this was recorded (no `calls`). An empty night gives all zeros.
 */
export function costSummary(cases: CostCase[]): CostSummary {
  const used = cases.filter((c) => c.outcome !== 'error' && Array.isArray(c.calls) && c.calls.length > 0);
  const turns = used.reduce((a, c) => a + (c.calls as number[]).length, 0);
  const modelCalls = used.reduce((a, c) => a + (c.calls as number[]).reduce((x, n) => x + Math.max(0, Math.floor(Number(n) || 0)), 0), 0);
  const sendBacks = used.reduce((a, c) => a + sendBacksIn(c.calls as number[]), 0);
  const costs = used.map((c) => Math.max(0, Number(c.neurons) || 0));
  return {
    cases: used.length,
    turns,
    modelCalls,
    sendBacks,
    sendBackRate: turns ? Math.round((sendBacks / turns) * 1000) / 1000 : 0,
    neuronsPerCaseMedian: Math.round(middle(costs)),
    neuronsPerCaseMean: costs.length ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : 0,
  };
}

/** A flag when today's send-backs per turn are well above the last seven nights' (at least three of them with the figure): half again as much and 0.15 more per turn. */
export function sendBackFlag(todayRate: number | undefined, pastRates: Array<number | undefined>): string | null {
  const past = pastRates.filter((r): r is number => typeof r === 'number');
  if (typeof todayRate !== 'number' || past.length < 3) return null;
  const avg = past.reduce((a, b) => a + b, 0) / past.length;
  return todayRate > avg * 1.5 && todayRate - avg >= 0.15 ? `send-backs ${todayRate.toFixed(2)} per turn against about ${avg.toFixed(2)} lately` : null;
}
