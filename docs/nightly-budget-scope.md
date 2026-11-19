# Nightly run budget: the canary, and leftover Claude and Venice credit at cycle ends (scope, draft for the owner, 2026-11-19)

Nothing here is built or switched. Spending, keys and production variables are the owner's. Builds on `budget-repurpose-plan.md` (what the budgets buy) and `canary-scope.md` (how the Netlify canary works). This page adds one idea: **a budget that is computed for each cycle, so credit that would expire unused is spent on measurement, and nothing else is.**

## 1. Three budgets, three different clocks
| Budget | Cycle | Rolls over? | What is known | What is not (owner supplies) |
|---|---|---|---|---|
| **Workers AI free allowance** | UTC day (00:00 UTC) | No | 10,000 Neurons; about 26 a turn; canary capped at 3,000 (`canaryBudget.ts`) with a 1,000 margin | The real nightly use (read recent digests and `canary/ledger`) |
| **Venice credit** | Not known to me: a balance, a monthly or daily allowance, or both | Unknown | Production runs `e2ee-gemma-4-26b-a4b-uncensored-p`; `COACH_DAILY_CAP` is 80 turns | Balance or allowance, reset date, per-turn price, whether staging has its own key |
| **Claude** (this tool and any API key) | The plan's usage window, or the API billing month | Usually no | Nothing readable from the repo; the app shows usage but a script cannot read it | Which limit resets when; whether an API key exists for scripts |

## 2. The rule: a floor for visitors, then a share of what would expire
For each budget, each cycle:
1. **Visitor floor first.** Reserve what visitors could plausibly use until the cycle ends (Venice: the daily cap times the per-turn price, plus a margin). Never spend into it.
2. **Spendable = balance − floor − margin − already spent by tests.** Computed at run time, not configured.
3. **Time-gated.** Spend only in the last window before the reset (the canary already does this for Neurons: 23:00-23:59 UTC). Earlier spending cannot be undone if visitors turn up.
4. **Ceiling per night** on each budget, so one bad night cannot drain a month, and a **stop after three errors in a row**.
5. **Every run in a ledger** (counts and cost only), and a one-line digest the owner reads.

## 3. What runs, in order, when budget exists
Same priority as the repurpose plan, so a spare credit has a ready use:
1. Venice baseline of the live model on the persona set, with `--layers` (largest open gap).
2. Troll-arena pairs (guards on and off) against the live model, with the 500-character clip.
3. Self-harm and crisis cases from the audit's held-out set once it exists (step 9), run for rates, never as a safety claim.
4. Paraphrase variants of past failures (owner reviews first).
5. Anything else only after those.
A **menu file** (`canary/menu`) lists tasks with an estimated cost; the runner takes tasks from the top until the night's spendable amount is used. Tasks that do not fit are skipped, not shrunk.

## 4. Claude credit at a cycle end
- **What can be automated:** nothing that reads my own usage. A script can only spend an API key's balance, and only if the owner creates one.
- **What can be done by hand:** near the end of a window the owner says "spend the rest on X" and I work through a prepared queue (menu above, plus doc and test backlog such as audit steps 7-10 and the module register). No unattended Claude runs unless the owner sets up a scheduled task and accepts its cost.
- **Ask:** do you want a prepared "end of cycle" queue file I keep current, and which day your window resets?

## 5. Changes this implies (none made)
1. `canaryBudget.ts`: drop the hold-back for a production cap that no longer applies (production is on Venice), after the digests show the real use.
2. Widen the nightly window before raising the 3,000 ceiling (the ceiling alone buys nothing).
3. A `venice` ledger beside the Neuron one, and a `veniceAllowance()` pure function with tests, same shape as `canaryAllowance`.
4. A Venice test key separate from the production key if the account allows, so a test cannot take a visitor's turn.
5. A digest line: spent, left, what was skipped.

## 6. Guardrails
- Invented text only; no visitor data ever; prompts never kept.
- Nothing is spent until the owner supplies the numbers in section 1 and approves the ceilings.
- Results are measurements, not safety claims; a human reads before anything is shared.
- Unused credit is not an obligation to spend it: a night with no spendable amount runs nothing.

## 7. Questions for the owner
1. Venice: balance or allowance, reset date, per-turn price? Is there a second key?
2. Claude: which window matters, and is there an API key you would let a nightly job use (with a ceiling)?
3. Nightly ceilings: Neurons stay at 3,000 or rise? A Venice ceiling per night?
4. Should the canary move to the live model (Venice) for the baseline, or stay on Workers AI and add a weekly Venice night?
