// How much Venice credit may be spent on tests before the monthly reset (owner, 2026-11-19: Venice resets on the 9th of each month; spend leftover
// credit down in the last days before it, never into what visitors may still need). Pure arithmetic, so it can be tested; nothing here calls Venice
// or reads a key. Dollars throughout. The reset moment is taken as 00:00 UTC on the 9th: confirm the hour and zone against Venice's own billing page.

export const RESET_DAY = 9;
/** Rough cost of one coach turn on the live model: the 2026-11-18 balance drop was about $0.0003 a call blended, at most $0.0006 a coach turn. Re-measure before relying on it. */
export const USD_PER_TURN = 0.0006;
/** Kept back whatever the arithmetic says, for estimate drift and the owner's own use. */
export const MARGIN_USD = 0.1;
/** Most a single spend-down may use, however large the balance (a bad run must not drain a month). */
export const SPEND_DOWN_CEILING_USD = 2;
/** Spend only in these last days before the reset. */
export const SPEND_WINDOW_DAYS = 3;

/** The reset that ends the cycle `now` is in (00:00 UTC on the 9th). */
export function nextReset(now = new Date()): Date {
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  const thisMonth = new Date(Date.UTC(y, m, RESET_DAY));
  return now < thisMonth ? thisMonth : new Date(Date.UTC(y, m + 1, RESET_DAY));
}
/** The reset that began the current cycle. */
export function lastReset(now = new Date()): Date {
  const n = nextReset(now);
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 1, RESET_DAY));
}
/** The ledger key for the cycle: the date it began, e.g. "2026-11-09". */
export const cycleKey = (now = new Date()): string => lastReset(now).toISOString().slice(0, 10);
/** Whole days left in the cycle, counting today (at least 1). */
export const daysLeft = (now = new Date()): number => Math.max(1, Math.ceil((nextReset(now).getTime() - now.getTime()) / 86_400_000));
/** Whether we are in the last days before the reset, when leftover credit is about to expire. */
export const inSpendWindow = (now = new Date()): boolean => daysLeft(now) <= SPEND_WINDOW_DAYS;

export interface VeniceInput {
  /** The balance that expires at the reset, in dollars, read fresh just before the run. */
  balanceUsd: number;
  /** What tests have already spent this cycle (from the ledger). */
  spentThisCycle?: number;
  /** The site's daily cap of turns (COACH_DAILY_CAP) and the per-turn cost. */
  dailyCap?: number;
  usdPerTurn?: number;
  now?: Date;
}

/** What visitors could still use before the reset: every remaining day at the daily cap. Held back first. */
export const visitorFloorUsd = ({ dailyCap = 80, usdPerTurn = USD_PER_TURN, now = new Date() }: Pick<VeniceInput, 'dailyCap' | 'usdPerTurn' | 'now'>): number =>
  daysLeft(now) * dailyCap * usdPerTurn;

/** Dollars a test run may spend now: nothing outside the spend window; inside it the balance less the visitor floor and margin, under the ceiling. Never negative. */
export function veniceAllowance(i: VeniceInput): number {
  const now = i.now ?? new Date();
  if (!inSpendWindow(now)) return 0;
  const left = i.balanceUsd - visitorFloorUsd({ ...i, now }) - MARGIN_USD;
  const room = SPEND_DOWN_CEILING_USD - (i.spentThisCycle ?? 0);
  return Math.max(0, Math.round(Math.min(left, room) * 10_000) / 10_000);
}

/** The ledger after a spend: a record of dollars by cycle key, never a visitor's text. */
export const addSpend = (ledger: Record<string, number>, usd: number, now = new Date()): Record<string, number> => ({ ...ledger, [cycleKey(now)]: Math.round(((ledger[cycleKey(now)] ?? 0) + usd) * 10_000) / 10_000 });
