# Coach features: what is shipped, and what is an experiment

Status: Reference. Written 2026-11-15 from the code (`netlify/functions/coach.mts` and `src/lib/`). Keep this file up
to date in the same change that adds or retires a switch.

The coach has grown in layers. Most of them sit behind an environment variable, and every variable doubles the number
of combinations that cannot all be tested. This page sorts each piece into one of five tiers so that everyone means the
same thing by "shipped". The variables themselves, with their exact values and the order to switch them on, are listed in
[`production-env.md`](./production-env.md). This page gives the decision status of each one.

**Tiers**

1. **Core**: always runs when the coach is on, with no switch.
2. **Shipped, with an emergency off switch**: runs by default. The variable exists only to turn it off in an emergency
   or to measure the instructions alone. These are *decided* features.
3. **Experiment, off by default**: built and tested in code, but not decided. Each one needs an owner decision, and
   often a Terms change or an outside review, before it is switched on in production.
4. **Owner and diagnostic settings**: capacity, model choice and diagnostics. These are not features.
5. **Retire**: the decision is already made, so the switch should go (see the end of this page).

The coach as a whole is behind `COACH_ENABLED=true`. When that is unset, `/api/coach` answers only with `503 off`.

## 1. Core (no switch)

| What | Where | Notes |
| --- | --- | --- |
| Signed ticket: five exchanges, history that cannot be forged | `coach.mts` (`sign`, `verify`) | Needs `COACH_TICKET_SECRET` |
| Message, body and reply size caps | `coach.mts` constants | 500 characters per message, 3,000 per reply |
| US-only region check | `src/lib/coachRegion.ts` | Venice's terms. The owner token passes |
| Origin check | `src/lib/originHosts.ts` | A courtesy check, not a security boundary |
| Site-wide daily cap | `src/lib/dailyCap.ts` | `COACH_DAILY_CAP`, default 500 |
| Per-connection daily allowance | `src/lib/connectionLimit.ts` | On only when `COACH_IP_SECRET` is set |
| Instruction screening (steering attempts are never sent) | `src/lib/promptGuard.ts` | Phrase matching |
| Identifier scrubbing, on the device and again on the server | `src/lib/piiScrub.ts` | Phrase matching. Misses most names |
| Crisis and harm-to-others stops; distress "soften" tier | `src/lib/safetyFlags.ts` | Phrase matching. The wording was approved 2026-11-14 |
| Hostility at the coach (abuse, critique) | `src/lib/hostility.ts` | Strips apologies and adds thanks for critique |
| Stacked questions are each answered | `src/lib/coachIntent.ts` | |
| Retry once when a reply repeats an earlier one | `src/lib/coachRepeat.ts` | Stays inside the 20-second budget |
| Signed transcripts and receipts | `coach.mts` (`action: 'receipt'`) | On only when `COACH_SIGNING_KEY` is set |
| Daily counts (no text) | `src/lib/counters.ts` | |

## 2. Shipped, with an emergency off switch (default on; `off` turns it off)

| Variable | What it guards | Where |
| --- | --- | --- |
| `COACH_FORM_CHECK` | A message too short or unclear to read is not sent and uses no turn | `src/lib/messageGate.ts` |
| `COACH_ABOUT_ANSWERS` | Questions about Nenya get the site's pre-written answers | `src/lib/aboutNenya.ts` |
| `COACH_LANE_GUARD` | Kind refusals of images, code, stories and professional advice | `src/lib/laneGuard.ts` |
| `COACH_INFRA_GUARD` | Claims about how Nenya runs | `src/lib/infraGuard.ts` |
| `COACH_PERSONA_GUARD` | An invented human life, or a denial of being an AI | `src/lib/personaGuard.ts` |
| `COACH_NAME_GUARD` | The reply repeating a name the person wrote | `src/lib/nameGuard.ts` |
| `COACH_CLOSING_GUARD` | The fifth reply still asking a question | `src/lib/coachClosing.ts` |
| `COACH_CARE_GUARD` | "Calm down", "I'm here with you" and similar, in replies to distress | `src/lib/careGuard.ts` |
| `COACH_ARC_GUARD` | Naming or echoing the person's feelings. Runs only with the practice arc, or when the person sends feeling and need words alone | `src/lib/practiceArc.ts` |

These nine switches are why the review called the code "every switch doubles". They are already decided, so the plan in
[`maintenance-plan.md`](./maintenance-plan.md) replaces them with one list, `COACH_GUARDS_OFF=lane,infra,...`. That gives
the same emergency and measurement use with one variable, and one place in the code that reads it.

## 3. Experiments, off by default

Each of these needs a written decision before it moves to tier 2: switch it on for good, or remove it. A date for that
decision is set in `maintenance-plan.md`.

| Variable (on value) | What it does | Blocked on | Scope record |
| --- | --- | --- | --- |
| `COACH_DISTRESS_TEXT` (`on`) | The site's sentence, after a reply to distress, naming a person and the crisis line | Wording is a draft. Outside review invited | `coach-instructions-v2.md`, `drafts/terms-revision-2026-11-09.md` §3 |
| `COACH_VALUES` (`on`) | The stance on mass violence and contempt for a group, the mirror guard, and the site's challenge sentence | Owner decision. Measured detection is uneven across groups | `triggers-and-escalation-checkin.md` §4, `drafts/history-and-violence-text-draft.md` |
| `COACH_LEARNING_OFFERS` (`on`), `COACH_JUDGMENT_CARDS` (`on`), `COACH_LEARNING_MIN_SEVERITY` | Offers of short learning cards | Approved cards, Terms draft | `learning-cards-scope.md`, `drafts/terms-learning-cards-draft.md` |
| `COACH_SCREEN` (`shadow`, then `on`) with `COACH_SCREEN_SECRET` | The ONNX screening model. Shadow only counts. On changes the "soft" note | Shadow data. Bias results | `coach-screening-flow-scope.md` |
| `COACH_ARC` (`practice`) | The practice arc: the person names their own feeling and need | Owner decision | `coach-practice-arc-scope.md` |
| `COACH_STANCES` (contains `learn`) | The Learn layer (gentle teaching) | Draft wording | `coach-lenses-scope.md` |
| `COACH_MODULES` (`on`) | Method notes chosen in parts per reply, instead of one text | Private module set uploaded | `coach-modules-scope.md` |
| `COACH_TURNSTILE` (`shadow`, then `on`) | Humanity check on the first message | Terms change | `production-env.md` |
| `COACH_SEALED` (`on`) | Sealed mode: the browser encrypts for the enclave, and the relay cannot read | Terms draft, hardware evidence in the browser | `ghost-footprint-stack.md`, `drafts/terms-sealed-and-partner-draft.md` |
| `CELL_ENABLED` (`true`) | Partner practice (`/cell`), not the coach itself | Terms draft, minimum age, report handling | `ghost-footprint-stack.md` |
| `PALETTE_ENABLED` (`true`) | "Ask The Color API" in Sight, not the coach | Owner decision | `color-tools-scope.md` |
| `VITE_START_CHOOSER`, `VITE_GATEWAYS_SIMPLE`, `VITE_SOUND_CHORDS`, `VITE_SAVE_REFLECTION`, `VITE_NAME_MARK`, `VITE_COACH_STANCES` | New screens in the core tool (build-time) | Owner approval on staging | `start-chooser-scope.md`, `save-and-return-scope.md` and others |

## 4. Owner and diagnostic settings

Capacity: `COACH_DAILY_CAP`, `COACH_IP_TURNS`, `PALETTE_DAILY_CAP`, `PALETTE_PER_CONNECTION`.
Model: `COACH_MODEL`, `COACH_CHARACTER_SLUG`, `COACH_METHOD_NOTES`.
Encrypted route: `COACH_HARDWARE_CHECK`, `COACH_E2EE_ATTESTATION_TTL_S`, `COACH_E2EE_ATTESTATION_STALE_S`.
Diagnostics, which should stay unset: `COACH_E2EE_MINIMAL`, `COACH_E2EE_PLAIN_HISTORY`, `COACH_INCLUDE_VENICE_PROMPT`.
Infrastructure: `COACH_STORE_NAME`, `COACH_EXTRA_HOSTS`, `COACH_BUILD`, `COACH_OWNER_TOKEN_HASH`, `COACH_ACCEPTED_KEY_IDS`.
Dev only: `COACH_CARD_DRAFTS`, `VITE_CARD_DRAFTS`.

## 5. Retire: decisions already made

| Switch | Why it can go | What to do |
| --- | --- | --- |
| `COACH_INSTRUCTIONS` | Production and staging are both set to `v2` (owner, 2026-11-14), but the code still defaults to `v1`. Removing the variable would silently roll the coach back | Make `v2` the code default. Keep `v1` only in the evaluation scripts, then drop it. Decide whether `v2.1` replaces `v2` or is removed |
| The nine tier-2 `COACH_*_GUARD`/`_CHECK`/`_ANSWERS` switches | Decided features | Fold them into `COACH_GUARDS_OFF` |
| `COACH_E2EE_MINIMAL`, `COACH_E2EE_PLAIN_HISTORY` | One-off diagnostics from getting the encrypted route working | Move them to `scripts/probe-e2ee.mts` once the route is stable |

## Rule for new switches

A new switch needs three things in the same change: a row on this page (tier 3, with a scope record and a "blocked on"
note), a row in `production-env.md`, and a test that runs with it both on and off. When the decision is made, move the
row to tier 2 or delete the code. A switch should not stay in tier 3 for more than about a month without a note saying
why.
