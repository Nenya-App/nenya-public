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

// Opt-in paid budget (owner, 2026-11-23: Workers is on a paid plan now). COACH_CANARY_PAID_NEURONS is a hard cap, in Neurons, that one night may spend BEYOND the free
// allowance, so the canary can still run on a night when other work used the free 10,000 up. Unset, empty, zero or invalid means off: exactly the free-allowance-only
// behaviour above. The price below is from the owner's pasted Cloudflare price list; nothing in the code checks what is actually billed.

/**
 * The most one night may spend in all (free and paid together), and the most the env value may ask for. A full night (about 150 conversations) uses about 5,200 Neurons, so
 * 12,000 leaves room for more than twice that, yet bounds a mistake (an extra zero in the variable) to about 0.13 dollars a night.
 */
export const PAID_NEURONS_CEILING = 12_000;
/** Dollars per 1,000 Neurons beyond the free allowance (owner's pasted price list, not verified in code). */
export const NEURON_USD_PER_1000 = 0.011;

/** The cap from the environment value: a whole number of Neurons, clamped to the ceiling; anything else (unset, empty, 0, negative, decimal, text) is 0 = off. */
export function parsePaidCap(raw: string | undefined): number {
  const t = (raw ?? '').trim();
  if (!/^\d+$/.test(t)) return 0;
  const n = Number(t);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, PAID_NEURONS_CEILING) : 0;
}

/** Tonight's allowance: the free part exactly as before, plus the paid cap, never above the ceiling. With no cap it is the free part alone (unchanged). */
export function nightBudget(i: BudgetInput, rawCap?: string): { free: number; paidCap: number; allowance: number } {
  const free = canaryAllowance(i);
  const paidCap = parsePaidCap(rawCap);
  return { free, paidCap, allowance: paidCap > 0 ? Math.min(free + paidCap, PAID_NEURONS_CEILING) : free };
}

/**
 * How much of tonight's `spent` went beyond the day's free allowance. `before` is what the day had already used when the night began (the ledger, the owner's manual record and
 * the visitor turns); the part of the day's total above the free 10,000 is paid, less whatever was already above it before tonight.
 */
export const paidNeurons = (before: number, spent: number, free = FREE_NEURONS_PER_DAY): number =>
  Math.max(0, Math.round(Math.max(0, before + spent - free) - Math.max(0, before - free)));

/** The night's free/paid split and an approximate cost, for the digest and the ledger. */
export function paidSummary(paidCap: number, before: number, spent: number): { paidCap: number; freeNeurons: number; paidNeurons: number; approxCostUsd: number; costNote: string } {
  const paid = Math.min(Math.round(spent), paidNeurons(before, spent));
  return {
    paidCap,
    freeNeurons: Math.round(spent) - paid,
    paidNeurons: paid,
    approxCostUsd: Math.round(paid * NEURON_USD_PER_1000 * 1000) / 1_000_000,
    costNote: `approximate: ${paid.toLocaleString('en-US')} Neurons beyond the free allowance at about ${NEURON_USD_PER_1000} dollars per 1,000 (Cloudflare's price list as the owner copied it; the invoice is the real figure)`,
  };
}

