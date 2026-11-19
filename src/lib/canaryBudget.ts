// How many Neurons are genuinely unused today (owner, 2026-11-16: the nightly canary spends only what is unused). Pure arithmetic, so it can be tested.
// Workers AI's free allowance is 10,000 Neurons a UTC day and does not roll over. What visitors may still need comes first, then the margin; the canary
// gets the rest. It never reads or sends anything from a visitor: only a count of turns.

export const FREE_NEURONS_PER_DAY = 10_000;
/** What one coach turn costs (bake-off 2026-11-16: about 25 with the private text, rounded up). */
export const NEURONS_PER_TURN = 26;
/** One persona run (38 cases) costs about 900 to 950 Neurons: the canary starts a run only if this much is free. */
export const NEURONS_PER_RUN = 1000;
/** Kept back whatever the arithmetic says, for a last case that costs more than expected. (Was 1,000 until 2026-11-19: nothing else draws on this allowance now, owner's decision.) */
export const MARGIN = 200;

export interface BudgetInput {
  /** What the canary and the owner's runs have already spent today (UTC day), from the ledger. */
  spentToday: number;
  /** Visitor turns counted today. A day's count is Minnesota's, which lags the UTC day, so the caller adds an allowance for the evening before. */
  visitorTurns: number;
  free?: number;
}

/**
 * The canary may spend at most the whole free allowance in a UTC day (owner, 2026-11-19; it was 3,000). It runs only in the last hour before the reset
 * (23:00-23:59 UTC), so nothing else using the allowance that day is interrupted, and whatever is still unspent then would otherwise expire.
 */
export const NIGHTLY_CEILING = FREE_NEURONS_PER_DAY;
/** Most persona runs planned for one night, however large the allowance: the hour's window is the real limit, and a night that runs out of time just ends early. */
export const MAX_RUNS_A_NIGHT = 10;

/** Neurons the canary may still spend: the unused amount, held under the nightly ceiling (spent today counts toward it). Never negative. */
export const canaryAllowance = (i: BudgetInput): number => Math.max(0, Math.min(unusedNeurons(i), NIGHTLY_CEILING - i.spentToday));

/** Neurons unused today before the ceiling. Never negative. */
export const unusedNeurons = ({ spentToday, visitorTurns, free = FREE_NEURONS_PER_DAY }: BudgetInput): number =>
  Math.max(0, Math.floor(free - spentToday - visitorTurns * NEURONS_PER_TURN - MARGIN));

/** Whole persona runs that fit. */
export const runsThatFit = (unused: number): number => Math.floor(unused / NEURONS_PER_RUN);

/** The UTC day a ledger entry belongs to (Workers AI's allowance turns over at 00:00 UTC). */
export const utcDay = (now = new Date()): string => now.toISOString().slice(0, 10);

