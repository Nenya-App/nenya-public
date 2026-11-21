import { SPEND_DOWN_CEILING_USD, MARGIN_USD, addSpend, cycleKey, daysLeft, inSpendWindow, lastReset, nextReset, veniceAllowance, visitorFloorUsd } from '../src/lib/veniceBudget.ts';
import { ok } from './helpers.mts';
const d = (s: string) => new Date(s);
ok('the reset is the 9th: before it this month, after it next month', nextReset(d('2026-11-19T12:00:00Z')).toISOString() === '2026-12-09T00:00:00.000Z' && nextReset(d('2026-11-05T12:00:00Z')).toISOString() === '2026-11-09T00:00:00.000Z' && nextReset(d('2026-12-31T12:00:00Z')).toISOString() === '2027-01-09T00:00:00.000Z');
ok('the cycle began on the last 9th, and its key is that date', lastReset(d('2026-11-19T12:00:00Z')).toISOString() === '2026-11-09T00:00:00.000Z' && cycleKey(d('2026-12-01T00:00:00Z')) === '2026-11-09' && cycleKey(d('2027-01-03T00:00:00Z')) === '2026-12-09');
ok('days left count today, and the spend window is the last three', daysLeft(d('2026-12-08T12:00:00Z')) === 1 && daysLeft(d('2026-12-06T12:00:00Z')) === 3 && inSpendWindow(d('2026-12-06T12:00:00Z')) && !inSpendWindow(d('2026-11-19T12:00:00Z')));
ok('nothing may be spent outside the window, however large the balance', veniceAllowance({ balanceUsd: 50, now: d('2026-11-19T12:00:00Z') }) === 0);
const late = d('2026-12-07T12:00:00Z'); // 2 days left
ok('visitors come first: the floor is the remaining days at the daily cap', Math.abs(visitorFloorUsd({ now: late }) - 2 * 80 * 0.0006) < 1e-9);
ok('inside the window the allowance is the balance less the floor and margin', Math.abs(veniceAllowance({ balanceUsd: 1, now: late }) - (1 - 2 * 80 * 0.0006 - MARGIN_USD)) < 1e-4);
ok('the ceiling binds, and what was spent this cycle counts toward it', veniceAllowance({ balanceUsd: 100, now: late }) === SPEND_DOWN_CEILING_USD && veniceAllowance({ balanceUsd: 100, spentThisCycle: 1.5, now: late }) === 0.5);
ok('never negative: a small balance gives nothing', veniceAllowance({ balanceUsd: 0.05, now: late }) === 0);
ok('the ledger adds dollars to the cycle', addSpend({ '2026-11-09': 0.5 }, 0.25, late)['2026-11-09'] === 0.75 && Object.keys(addSpend({}, 0.1, late)).join() === '2026-11-09');
