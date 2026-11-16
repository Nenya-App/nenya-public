# The nightly canary (owner, 2026-11-16)

**What it is.** Workers AI's free allowance (10,000 Neurons a UTC day) does not roll over. Shortly before it resets (23:30 UTC), a Netlify scheduled function (`canary-nightly.mts`) starts a background function (`canary-run-background.mts`) that plays the invented persona set (`src/lib/personaEvalSet.ts`) through the real coach function: Workers AI, instructions v2.1, the private text from the site's own store. It keeps one digest a night in the private store (`canary/digest-<day>`), and a ledger of Neurons spent (`canary/ledger`).

**What it spends.** Only what is genuinely unused that day, and never more than 3,000 Neurons (`src/lib/canaryBudget.ts`): the free allowance, less what the canary has spent, less visitors' turns so far today (the site's own daily count, 26 Neurons each, plus 20 turns for the evening before, since Minnesota's day lags the UTC day) and a margin of 1,000. Neurons are read from each Cloudflare answer, not estimated. It stops at once if every conversation in a run fails (quota or outage).

**What it touches.** Nothing a visitor wrote. The cases are invented. The coach runs against an in-memory store, so the site's daily counter, connection records, receipts and transcripts are untouched. The digest holds counts, the median reply length and the ids of cases that failed.

**Off by default.** `COACH_CANARY=on` on a site that already runs the coach on Workers AI. Scheduled functions run only on a site's published (production-branch) deploy. Only the nightly function can start the background one (a key made from `COACH_TICKET_SECRET`).

**Reading it.** `netlify blobs:get <store> canary/digest-<day>` (the store is `coach-private-staging` on staging). `reviewed` stays false until the owner has read it.

## What each night runs (built 2026-11-16)
Three tasks, in order, until the allowance or 13 minutes run out: **an alternate**, then the **baseline twice**.
- **Baseline** (instructions v2.1): what drift and per-case pass rates are measured on. Run twice a night, the repeats give the variance: `canary/cases` keeps runs and failures per case.
- **Alternate**, by day: the **Learn stance**, **instructions v2**, and, if `COACH_CANARY_MODEL` names a model (Apertus once access comes), **that model**, so a candidate is compared on the same cases with no extra work.
- **Reading level:** every digest line carries the median Flesch-Kincaid grade of the replies (AAA plain language), and the median length.
- **Drift flags:** the baseline against the last seven nights (median length off by more than a quarter, a pass rate down by more than eight points), and any case that had never failed in eight or more baseline runs and fails now.
- **Not built:** other test sets (the DarkBench-style and steering prompts). The persona set already has a steering category; more sets need authored checks (what a pass is), which is the owner's call.

The digest holds counts, medians, flags and failed case ids only; never a reply.

## Sharing results publicly, after review
Because the cases are invented, a public page needs no visitor data. Proposed route: digests wait unreviewed; the owner reads a week's digests and approves a short summary (model, dates, pass rate per category, median length, every failure listed with its case text and reply, nothing hidden); an approved summary is committed to `docs/` and shown on a plain "How we test the coach" page. Failures are shown as they are. Nothing is public until approved.
