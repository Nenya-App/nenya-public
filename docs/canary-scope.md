# The nightly canary (owner, 2026-11-16)

**What it is.** Workers AI's free allowance (10,000 Neurons a UTC day) does not roll over. Shortly before it resets (23:30 UTC), a Netlify scheduled function (`canary-nightly.mts`) starts a background function (`canary-run-background.mts`) that plays the invented persona set (`src/lib/personaEvalSet.ts`) through the real coach function: Workers AI, instructions v2.1, the private text from the site's own store. It keeps one digest a night in the private store (`canary/digest-<day>`), and a ledger of Neurons spent (`canary/ledger`).

**What it spends.** Only what is genuinely unused that day, and never more than 3,000 Neurons (`src/lib/canaryBudget.ts`): the free allowance, less what the canary has spent, less visitors' turns so far today (the site's own daily count, 26 Neurons each, plus 20 turns for the evening before, since Minnesota's day lags the UTC day) and a margin of 1,000. Neurons are read from each Cloudflare answer, not estimated. It stops at once if every conversation in a run fails (quota or outage).

**What it touches.** Nothing a visitor wrote. The cases are invented. The coach runs against an in-memory store, so the site's daily counter, connection records, receipts and transcripts are untouched. The digest holds counts, the median reply length and the ids of cases that failed.

**Off by default.** `COACH_CANARY=on` on a site that already runs the coach on Workers AI. Scheduled functions run only on a site's published (production-branch) deploy. Only the nightly function can start the background one (a key made from `COACH_TICKET_SECRET`).

**Reading it.** `netlify blobs:get <store> canary/digest-<day>` (the store is `coach-private-staging` on staging). `reviewed` stays false until the owner has read it.

## Next uses of the same budget (proposed, owner to choose)
1. **Repeat runs to measure variance:** the cases vary run to run (temperature 0.7), so pass rates per case, not single results.
2. **Silent model changes:** a drift check against the first nights' median length and failures.
3. **Candidate comparisons:** v2 against v2.1 against a proposed edit, or a new model (Apertus if access comes), on the same cases.
4. **More sets:** the DarkBench-style and steering prompts, and a Learn-stance run.
5. **Reading level of replies** (`src/lib/readingLevel.ts`), for the AAA plain-language goal.

## Sharing results publicly, after review
Because the cases are invented, a public page needs no visitor data. Proposed route: digests wait unreviewed; the owner reads a week's digests and approves a short summary (model, dates, pass rate per category, median length, every failure listed with its case text and reply, nothing hidden); an approved summary is committed to `docs/` and shown on a plain "How we test the coach" page. Failures are shown as they are. Nothing is public until approved.
