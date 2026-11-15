# Maintenance plan: bringing the repository under control

Status: Reference (plan). Written 2026-11-15, after an outside read-through of the repository and a follow-up audit.
Update the "Where things stand" column as items land, and record decisions here or in the scope record they belong to.

## Why this exists

Nenya's core idea is small. A visitor breathes for a minute, checks in through six senses, and keeps a report on their own
device. Around that core, the AI coach and its neighbours have grown fast: about 20 server functions, an admin page,
partner practice, sealed and end-to-end encrypted chat, an ONNX screening model, learning cards, and around 70 scope
documents. The engineering habits are good: strict type-checking, about 150 offline test files, pinned CI actions,
archived legal text and commented headers. The risk is **sprawl**. A new contributor, or a professional invited to
review the safety wording, should be able to find out what runs, what is switched off, and why, without reading
everything.

This plan covers five things: keeping the docs true, making the code readable, reducing the switches, gating releases
on evidence, and keeping the free tool simple enough to verify.

## What the review found, and what has been done

| # | Finding | Where things stand |
| --- | --- | --- |
| 1 | The README gave three Node versions (18, 22.18, 24) | **Fixed.** It now says 24 throughout. `tests/docs-drift.test.mts` fails if the README, `package.json`, `netlify.toml` and CI disagree |
| 2 | The README's layout described `netlify/functions/` as only the coach relay, and `scripts/` as only the verifier | **Fixed.** The layout lists every page and every function, grouped by area. `scripts/README.md` lists every script with what it needs. The drift test fails when a function or script is missing from either list |
| 3 | "`dist/` needs no server-side code" was true only for the core tool | **Fixed.** The README now says which parts need functions |
| 4 | `coach.mts` is a hotspot: about 1,300 lines, about 45 imports, about 25 switches | **Started.** The header now maps the 13 stages of a request, and points to one variable list instead of keeping its own, which had drifted. The split is in step 2 below |
| 5 | Safety rests on layers of phrase matching | **Planned.** See step 4, the release gate |
| 6 | No written line between shipped features and experiments | **Fixed.** See `docs/coach-features.md`, which sorts every switch into five tiers |
| 7 | Scope keeps growing; consider separating the coach | **Planned.** See step 5 |
| 8 | The docs folder is hard to navigate | **Fixed.** `docs/README.md` sorts every doc by status and gives entry points by reader. Conventions for new docs are at its end |

Further issues found in the follow-up audit:

| # | Finding | Where things stand |
| --- | --- | --- |
| 9 | The README said submissions go to Netlify Forms. They now go to `/api/submit`, are kept 90 days in the private store, and can be deleted by code | **Fixed** in the README's "honest edges" and "Deploying" sections |
| 10 | `coach.mts`'s header listed about 25 variables, but the functions and shared code read about 45. Three of them were documented nowhere (`COACH_ACCEPTED_KEY_IDS`, `COACH_E2EE_ATTESTATION_TTL_S`, `_STALE_S`) | **Fixed.** All three are in `docs/production-env.md`, and the drift test now fails on any variable the code reads that the page does not name |
| 11 | `tests/run.mjs` passed the shell's environment into every test. On a machine with the site's variables set (a Netlify shell, a `.env`), `coach-function.test.mts` failed (`system msg is turn-aware (final)`), because `COACH_INSTRUCTIONS` changed the instructions under test | **Fixed.** The runner now drops the site's own variables (`COACH_*`, `CELL_*`, `VENICE_*` and similar) before each test. All 3,058 checks pass |
| 12 | `COACH_INSTRUCTIONS` defaults to `v1` in code, but production and staging are both set to `v2`. If the variable were removed, the coach would quietly roll back | **Open.** See step 3 |
| 13 | The changelog was backfilled from commit subjects, and many were terse ("Audit", "Security buff", "Coach Update"). Several of those commits changed privacy or safety behaviour | **Fixed (the back pass).** 95 entries now carry a one-sentence description read from the commit itself, after a ` — ` |
| 14 | `docs/dev-console-helper.js` is a script in the docs folder | **Open.** Move it to `scripts/` or delete it (flagged in `docs/README.md`) |
| 15 | The same code appears more than once in `coach.mts`: the limits block (normal and sealed paths), the receipt builder (stopped and normal), "ask once more, then repair" (seven times), `process.env.COACH_MODEL || DEFAULT_MODEL` (five times) and `getMatcher` (up to three times a turn) | **Planned** in step 2 |

Found while building the docs index (details in `docs/README.md`):

| # | Finding | Where things stand |
| --- | --- | --- |
| 16 | `coach-transcripts.md` said `/api/report` "does not keep" a sent transcript. It keeps it in the private store, with the sender's choices, and it can be withdrawn and deleted. (The live Terms' form section does say that sending allows us to store it.) | **Fixed** in the doc. **Owner to check:** the transcript Terms draft (`drafts/terms-transcripts-draft.md`), which spells out keeping times and publishing, is still not applied |
| 17 | The live Terms describe a sentence on contempt for a group, but that is `COACH_VALUES`, which is off by default | **Owner to check.** This is accurate only if `COACH_VALUES=on` in production |
| 18 | Many scope docs still open with "nothing built" for features that are built. Three applied Terms drafts are still headed "nothing live". `live-gem.md`, the 2026-11-11 handoff and `brand/README.md` say the live gem is off, but `GEM_ENGINE = 'live'` | **Open.** Each is marked in `docs/README.md`. Fix each `Status:` line when the doc is next touched, or in one sweep |
| 19 | `device-memory.md` says every browser storage key goes through `deviceMemory.ts`, but `CoachDemo.tsx` writes `nenya.words.open` directly, and `nenya.terms.receipt` and `nenya.reflection.saved` are not listed | **Open.** This is a privacy claim: list the keys, or route them through `deviceMemory.ts`, and add a test that finds direct `localStorage` and `sessionStorage` writes |
| 20 | The headers of `src/lib/aboutNenya.ts` ("the coach does not use them yet") and `src/lib/stances.ts` ("none of the layers exists") were stale | **Fixed** |
| 21 | `colormind-scope.md` is superseded by `color-tools-scope.md`. `docs/drafts/answers/review-notes.mts` is code inside docs, and a script and a test import it | **Open.** Mark the first superseded. Move the second only together with its two importers |

## Step 1: Keep the docs true (done; keep it going)

- **One source for each fact.** Environment variables are in `docs/production-env.md`. Switch status is in
  `docs/coach-features.md`. Doc status is in `docs/README.md`. Scripts are in `scripts/README.md`. Functions are in the
  README. Other files link to these and do not copy them.
- **Tests guard the facts that drift.** `tests/docs-drift.test.mts` checks that the variable list is complete, that the
  Node version agrees everywhere, and that every function and script is listed. Add a check there whenever a new kind
  of drift is found.
- **A `Status:` line at the top of each scope doc**, using one of: Proposed, Built (off, SWITCH), Shipped,
  Superseded by X, Abandoned. Point-in-time records (audits, handoffs, eval results) carry the date in their filename.
  Drafts go in `docs/drafts/`.

## Step 2: Make `coach.mts` readable by splitting it into stages

The header of `coach.mts` now lists the stages in the order they run. The split follows those stages exactly, so it can
be done one stage at a time, and the existing `tests/coach-*.test.mts` files stay green after each move.

Proposed layout:

```
netlify/functions/coach.mts         route, config export, and a short handle() that calls the stages in order
src/lib/coach/config.ts             reads every COACH_* variable ONCE into a typed object (model, caps, switches, guardsOff)
src/lib/coach/request.ts            stages 1-4: gates, body parsing and validation (no more `body as {...}` casts), ticket
src/lib/coach/receipt.ts            stage 3's receipt action: one builder for both the stopped and the normal transcript
src/lib/coach/limits.ts             stage 6: shared by the witnessed and sealed paths
src/lib/coach/read.ts               stage 7: one `TurnContext` (userTexts, lastText, flag, hostile, stance, standing, bands...)
src/lib/coach/generate.ts           stage 9: the Venice call (encrypted or plain), timeout budget, the repeat retry
src/lib/coach/guards.ts             stage 10: a list of { name, applies(ctx), problems(reply), note, repair } run by ONE loop
src/lib/coach/siteText.ts           stage 11
src/lib/coach/sealed.ts             handleSealed and its ticket
```

Two changes matter most for readability:

1. **A `TurnContext` object.** Stage 7 is computed once and passed along, instead of about 20 local variables that later
   stages read implicitly. A reader can then see what each guard depends on.
2. **Guards as data.** The seven post-model guards share one shape: check the reply, ask once more inside the remaining
   budget, then repair or replace, and count each step. As a list run by one loop, they read as one ordered table, the
   order is visible and tested, and conflicts between guards (two guards rewriting the same sentence) can be tested in
   one place.

Rules for the split: move code without changing behaviour, one stage per pull request; run `npm run check` each time;
keep the comments that explain *why* (they are this codebase's strength) and move them with the code.

## Step 3: Cut the switches down

`docs/coach-features.md` sorts every switch into tiers. Actions, in order:

1. **`COACH_INSTRUCTIONS`.** Make `v2` the code default (the owner chose it on 2026-11-14). Decide between `v2` and `v2.1`,
   and delete the loser. Keep older wording only where the evaluation scripts compare against it.
2. **Fold the nine emergency off switches** (`COACH_LANE_GUARD`, `COACH_INFRA_GUARD`, and the rest) into one variable,
   `COACH_GUARDS_OFF=lane,infra,...`, read once in `config.ts`. Accept the old names for one release, with a warning
   count, then remove them.
3. **Give every experiment a decision date** (tier 3 on that page). At the date, either move it to tier 2 or delete its
   code and its scope doc moves to "Abandoned". Good first candidates for a decision are the screening model (shadow data
   is already being collected) and the practice arc.
4. **Move the diagnostics** (`COACH_E2EE_MINIMAL`, `COACH_E2EE_PLAIN_HISTORY`) into `scripts/probe-e2ee.mts` once the
   encrypted route is stable.
5. **New switches follow the rule** at the end of `coach-features.md`: listed in both docs, tested on and off, and given a
   decision date.

## Step 4: Make the evaluations a release gate

The `scripts/eval-*` sets are the counterweight to phrase matching. Today the tests run the site's side of them: the
safety set's decisions (`tests/safety-eval.test.mts`) and the persona checks against stand-in models
(`tests/persona-eval.test.mts`). What the real model says is measured only when someone runs a script by hand. The
release checklist in `CONTRIBUTING.md` adds:

- **Every pull request (CI, no keys):** the offline safety decisions, as now. Add offline modes to `eval-detect.mts`
  (over the repo's own invented scenes) and to the detection rules' expected outcomes, so a change to a regex
  is measured on every pull request.
- **Every `dev` to `main` release (by hand, on staging):** `staging-suite.mts`, `eval-safety.mts --url`,
  `eval-persona.mts --url` and `eval-final-turn.mts`. Save each JSON result under `docs/results/` with the build label,
  and compare it with the previous release (`--compare`, `compare-persona-runs.mts`). A release note states any rate
  that got worse.
- **Thresholds written down.** For example: zero missed stop-tier cases in the safety set, and no persona-set case that
  passed last release failing now without a note. The owner sets the numbers, and they go in `docs/coach-testing.md`.
- **The per-group detection gap stays visible.** Any change to the list or the model re-runs `bakeoff-target-groups.py`,
  and the per-group table in `coach-screening-flow-scope.md` is updated.

## Step 5: Keep the free tool simple enough to verify

The README already says a fuller coach is planned as a separate product. The boundary exists in the code, but it is soft:
the core app lazy-loads the coach demo as its session screen (`src/app/App.tsx`), `src/lib/` mixes core and coach code,
and the core tool itself calls a few functions (`/api/count`, `/api/submit`, `/api/terms-agree`, `/api/colors`).

Recommended order, each step useful on its own:

1. **Make the boundary checkable now.** Add a test that `src/app/` (the core tool) imports nothing from the coach-only
   modules except through the lazy `CoachDemo` entry. Move coach-only modules into `src/lib/coach/` (this fits with
   step 2), so the boundary is a folder, not a list.
2. **Write down what the core tool may call**: today `count`, `submit`, `terms-agree`, `colors`. Anything else is
   coach or cell code. The privacy claim "the free tool is static" then becomes "the free tool calls these four
   functions, each documented".
3. **Split the deploy before the code.** Serve `/coach`, `/cell` and their functions from a second Netlify site (for
   example, `coach.nenya.biz`) built from the same repository with its own `netlify.toml`. The core site's CSP can then
   drop the Turnstile exception and the coach's connections, and the core site has no coach secrets at all. The core
   links out to the coach instead of embedding it.
4. **Then split the repository**, if the coach keeps growing: an npm workspace (`packages/core`, `packages/coach`,
   `packages/shared`) first, and a separate repository only if the teams or licences diverge.

This choice is the owner's. The trade-off is that today's in-site session screen, after the gateways, would become a
link to the coach site, and the shared report would have to be handed over explicitly. That may well be an improvement
for the privacy story.

## Step 6: Readability for contributors

- `CONTRIBUTING.md` (new) covers setup, where things live, the comment conventions this codebase already follows, how
  to add a switch, a doc, a function or a script, and the release checklist.
- **The comment convention, written down.** Every file opens with what it does, what it keeps, and who may call it.
  Comments explain *why* (what was seen, a date, a doc link), not *what*. Long single-line comments should be wrapped at
  about 120 characters; much of `coach.mts` runs past 200, which makes it hard to review in a diff.
- **The changelog** gets a section per release from now on (see `docs/versioning.md`). The back pass for the old
  terse entries is done.
- **Remaining back pass: scope docs.** Add `Status:` lines to the scope docs that `docs/README.md` marks "unclear", as
  each one is next touched.

## Not yet audited

This plan rests on reading the code and on running the type-check and the offline tests. It does not include a security
review of every function, a review of the safety pipeline by an outside professional (which is invited), or live
evaluation runs. These are the next deep looks worth doing, in this order: the coach's safety pipeline end to end, the
owner-only functions' gate (`src/lib/ownerGate.ts`), and the cell mailbox.
