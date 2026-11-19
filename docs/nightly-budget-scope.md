# Nightly run budget: the canary, and leftover Claude and Venice credit at cycle ends (scope, draft for the owner, 2026-11-19)

Nothing here is built or switched. Spending, keys and production variables are the owner's. Builds on `budget-repurpose-plan.md` (what the budgets buy) and `canary-scope.md` (how the Netlify canary works). This page adds one idea: **a budget that is computed for each cycle, so credit that would expire unused is spent on measurement, and nothing else is.**

## 1. Three budgets, three different clocks (owner's answers, 2026-11-19)
| Budget | Cycle | Rolls over? | Known | Still open |
|---|---|---|---|---|
| **Workers AI free allowance** | UTC day (00:00 UTC) | No | 10,000 Neurons; about 26 a turn. **Owner's rule: the ceiling rises, and the run is held to the end-of-day window so nothing else using that allowance is interrupted. If the whole 10,000 is still unspent when the run starts, the run uses it instead of leaving it.** | The real nightly use (read `canary/ledger`); whether anything else still draws on it (production is on Venice) |
| **Venice credit** | **Monthly; resets 12/9 (owner).** | Unknown (assume no) | Listed price of the live model: $0.19 per million input tokens, $0.88 per million output. **Per-turn estimate from the 2026-11-18 duet runs:** the encrypted route reports no token counts, so tokens times price came out blank; the balance fell $0.0265 across 85 calls (43 person, 42 coach), so **about $0.0003 a call blended, $0.0006 a coach turn at most**. The site cap (80 turns a day, 2,400 a month) is therefore roughly **$0.75 to $1.50 a month**. Balances read then: $0.55 USD and $0.34 bundled credits. | A fresh balance reading before any run; whether staging has its own key. The estimate rests on one small run and a long private prompt makes real turns dearer, so measure again |
| **Claude, weekly usage** | **Weekly; resets Thursday morning (owner)** | No | Owner agrees to an API call for this, run only weekly (or monthly as a spend-down, like Venice). | The API key, its ceiling, the exact reset hour and time zone |

## 2. The rule: a floor for visitors, then spend what would expire
For each budget, each cycle:
1. **Visitor floor first (Venice only).** Reserve the rest of the month's visitor use: remaining days times the daily cap times the per-turn estimate, plus a margin. Workers AI has no visitor floor now (production is on Venice); its protection is timing.
2. **Spendable = balance minus floor minus margin minus tests already spent**, computed at run time.
3. **Timing.** Workers AI: only in the final window before 00:00 UTC (now 23:00-23:59), spending all of what is left up to the ceiling. Venice: a monthly spend-down in the days before 12/9, not nightly. Claude: one run a week, in the hours before Thursday's reset (or a monthly spend-down).
4. **Ceilings per run**, so one bad night cannot drain a cycle, and a stop after three errors in a row.
5. **Every run in a ledger** (counts and cost only), plus a one-line digest.

## 3. What runs, in order, when budget exists
Same priority as the repurpose plan, so a spare credit has a ready use:
1. Venice baseline of the live model on the persona set, with `--layers` (largest open gap).
2. Troll-arena pairs (guards on and off) against the live model, with the 500-character clip.
3. Self-harm and crisis cases from the audit's held-out set once it exists (step 9), run for rates, never as a safety claim.
4. Paraphrase variants of past failures (owner reviews first).
5. Anything else only after those.
A **menu file** (`canary/menu`) lists tasks with an estimated cost; the runner takes tasks from the top until the night's spendable amount is used. Tasks that do not fit are skipped, not shrunk.

## 3b. Which budget runs which task (owner, 2026-11-19: split by best fit so no credit is wasted)
Each budget has what it is good at; a task goes to the cheapest budget that can do it well, and anything left over flows to the next.
| Task | Best fit | Why |
|---|---|---|
| Persona set, layer measurements, page and persona checks on a hosted 26B | **Workers AI, nightly** (free, expires daily) | Fixed cost per turn, no rollover: the free allowance should never be left |
| Many short conversations with a small model playing the adversary or person | **Workers AI or the local machine** | Cheap, high volume; local costs nothing |
| Baseline of the live model, troll-arena pairs, anything that must be what visitors get | **Venice, monthly spend-down before 12/9** | Only Venice runs the live model; price per turn is tiny, so the month's leftover buys many runs |
| Drafting paraphrase variants of failures, new briefs, held-out sets, judge-side reading | **Claude API, weekly before Thursday** | Writing and judgement tasks; output goes to the owner for review, never straight into a set |
| Long, slow, unattended runs on small models | **The owner's machine (LM Studio), overnight** | Free; needs power, and runs in an idle window |
Overflow order, so nothing expires: a task that does not fit its best budget moves down this list (Workers AI first, then local, then Venice, then Claude) if it can run there without changing what it measures. A task never moves to a budget that would change the result (the live-model baseline never runs on Workers AI).
The runner reads the menu (`canary/menu`: task, best budget, estimated cost) and fills each budget's spendable amount from the top; unspent amounts and skipped tasks are written to the digest so the owner sees what was left.

## 4. Claude credit at a cycle end
- **Allowed (owner, 2026-11-19):** a weekly API call that spends down the week's usage before Thursday morning's reset, or monthly like Venice. It runs once, never nightly, with its own ceiling and ledger.
- **Limit:** I cannot read the plan's usage from a script, so the job spends a fixed, owner-set amount up to the ceiling; it cannot know what is truly left. The simplest safe form is a weekly ceiling the owner sets from what the usage screen shows.
- **What it would run:** the same menu as section 3 (baselines, paraphrase variants, held-out sets), model-drafted variants held for the owner to review before they join any set.
- **Needs:** an API key (created by the owner, never pasted in chat; stored as a private environment value) and the ceiling.

## 5. Changes this implies (none made)
1. `canaryBudget.ts`: raise `NIGHTLY_CEILING` toward the full 10,000, drop the visitor-turn and 1,000-margin hold-backs (production is on Venice), keep only a small retry margin, and keep the run inside 23:00-23:59 UTC so it ends before the reset. Tests: with a whole 10,000 free the allowance is the whole of it less the margin; the ceiling still binds; never negative.
2. The window is the limit (about 13 minutes of runs at roughly 30 seconds a task): widen it or run tasks that spend more per call before expecting the full 10,000 to be reached. Read the digests first.
3. A `venice` ledger beside the Neuron one, a monthly cycle ending 12/9, and a `veniceAllowance()` pure function with tests, same shape as `canaryAllowance`.
4. A Venice test key separate from the production key if the account allows, so a test cannot take a visitor's turn.
5. A digest line: spent, left, what was skipped.

## 6. Guardrails
- Invented text only; no visitor data ever; prompts never kept.
- Nothing is spent until the owner supplies the numbers in section 1 and approves the ceilings.
- Results are measurements, not safety claims; a human reads before anything is shared.
- Unused credit is not an obligation to spend it: a night with no spendable amount runs nothing.

## 7. Still needed from the owner
1. Venice: a fresh balance reading (I can take one with the key when you want), and whether staging has its own key.
2. Claude: the API key (as a private environment value) and a weekly ceiling in dollars; the exact Thursday reset hour and time zone.
3. Workers AI: confirm nothing else draws on that allowance, so the end-of-day run may use all of it.
4. Should the live-model baseline run as a monthly Venice spend-down before 12/9, with the canary staying on Workers AI nightly?
