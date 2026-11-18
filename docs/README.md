# Index of docs/

This folder holds reference pages, scope documents (`*-scope.md`), handoff notes, audits and drafts. This index sorts them by status, so you can tell what describes the site today, what has been built, and what is only an idea.

The status here comes from reading each document's own status line **and checking the code** (2026-11-15, `dev` branch). Many scope documents still open with "scoping only, nothing built" even though a later section, or the code, shows the feature was built. Where that happens, this index says so in the status note. When this index and a document disagree, check the code.

Two things to know when reading "shipped":
- Everything in the coach needs `COACH_ENABLED=true` on the server. Without it, the coach is off, however its other switches are set.
- Work merged to `main` up to pull request #22 is in production. Commits on `dev` after that are only on staging and previews. Notes below say "dev only" where that matters.

## Where to start

**If you are a new AI instance picking up the work**, read [ai-handoff/README.md](ai-handoff/README.md) first (philosophy, architecture, the coach, design, safety, working with the owner, and today's state).

**If you are a new contributor**, read:
[branches-and-previews.md](branches-and-previews.md), [production-env.md](production-env.md), [coach-features.md](coach-features.md), [maintenance-plan.md](maintenance-plan.md), [versioning.md](versioning.md), [coach-testing.md](coach-testing.md), [dev-testing-checklist.md](dev-testing-checklist.md), [accessibility-standard.md](accessibility-standard.md), then the latest handoff, [HANDOFF-2026-11-11.md](HANDOFF-2026-11-11.md). Read that handoff for history only: parts of it are out of date (see its row below).

**If you are a professional reviewing safety wording**, read:
[crisis-resources-check.md](crisis-resources-check.md) (the support lines the site names), [harm-disclosure-directions.md](harm-disclosure-directions.md) (what happens when someone says they have harmed a person), [coach-boundaries-scope.md](coach-boundaries-scope.md) (dehumanizing language and a ladder of boundaries), [triggers-and-escalation-checkin.md](triggers-and-escalation-checkin.md) and [coach-detection-rescope-ethos.md](coach-detection-rescope-ethos.md) (what detection exists and how it is measured), [coach-screening-flow-scope.md](coach-screening-flow-scope.md) (the screening model, with its uneven results across groups), [coach-ai-directed-abuse-scope.md](coach-ai-directed-abuse-scope.md), [coach-persona-scope.md](coach-persona-scope.md), [learning-cards-scope.md](learning-cards-scope.md), and [drafts/history-and-violence-text-draft.md](drafts/history-and-violence-text-draft.md). The wording itself is in `src/lib/safetyFlags.ts`, `src/lib/distressText.ts`, `src/lib/careGuard.ts`, `src/lib/selfInjury.ts` and `src/lib/valuesRule.ts`.

**If you are checking privacy claims**, read:
[data-register.md](data-register.md) (everything kept, where, and for how long), [device-memory.md](device-memory.md) (what stays in the browser), [coach-transcripts.md](coach-transcripts.md) and [transcript-consent-scope.md](transcript-consent-scope.md) (signed transcripts, and what happens when one is sent), [pii-names-scope.md](pii-names-scope.md), [data-hygiene-scope.md](data-hygiene-scope.md), and [legal/README.md](legal/README.md). The live Terms and Privacy Policy is `src/lib/legalDocument.ts`. Note: the rows for `coach-transcripts.md` and `drafts/terms-transcripts-draft.md` below describe a known mismatch between the Terms and the code.

## Reference (current; keep up to date)

| Doc | What it is | Status note |
|---|---|---|
| [coach-features.md](coach-features.md) | Each coach feature sorted into tiers: core, shipped, experiment, retire | New 2026-11-15 |
| [maintenance-plan.md](maintenance-plan.md) | Plan for bringing the repository under control after an outside review | New 2026-11-15. Update its "Where things stand" column as items land. |
| [production-env.md](production-env.md) | Every environment variable, with the production value and the order to switch them on | `tests/docs-drift.test.mts` checks that every variable the code reads is named here. |
| [branches-and-previews.md](branches-and-previews.md) | Branches, preview sites, and the checks to run | Current |
| [versioning.md](versioning.md) | The build label, and how transcripts record it | Current |
| [device-memory.md](device-memory.md) | What Nenya may keep on a visitor's device | **Needs an update**: it does not list `nenya.terms.receipt`, `nenya.reflection.saved` or `nenya.words.open`. The last one is written directly by `src/coach/CoachDemo.tsx`, not through `deviceMemory.ts`, though the page says all storage goes through that file. |
| [data-register.md](data-register.md) | Everything the site keeps, where, how long, and what deletes it | Started 2026-11-15. Reviewed every quarter. |
| [accessibility-standard.md](accessibility-standard.md) | The standard: WCAG 2.2, level AAA | Decided 2026-11-14 |
| [accessibility-audit-checklist.md](accessibility-audit-checklist.md) | A screen-reader listening checklist (Safari and VoiceOver) | Procedure |
| [accessibility-testing-list.md](accessibility-testing-list.md) | A running list of testing that disabled people still need to do | Row 5 says the long melody is "when built", but it is built (`src/lib/longMelody.ts`). |
| [coach-testing.md](coach-testing.md) | How the owner tests the coach (the rest period, the owner token) | Current |
| [coach-transcripts.md](coach-transcripts.md) | Signed transcripts: what the signature proves, and how to verify one | **Contradicts the code.** It says a sent transcript reaches us by a Netlify form and is not kept. `netlify/functions/report.mts` now keeps it in the private store, with the person's choices (see transcript-consent-scope.md). |
| [coach-method-notes.md](coach-method-notes.md) | Where the private method notes live (Blobs) and their limits | Current. For the module set, see coach-modules-scope.md. |
| [dev-testing-checklist.md](dev-testing-checklist.md) | What to check on staging after a push | Procedure |
| [dev-test-script.md](dev-test-script.md) | A ten-minute script for testing the coach on staging | Procedure. Lists the staging switches it needs. |
| [staging-loop.md](staging-loop.md) | The loop around `scripts/staging-suite.mts` | Procedure |
| [transcript-review-checklist.md](transcript-review-checklist.md) | Checklist for reading a conversation before it is shown publicly | Procedure |
| [valar-color-palettes.md](valar-color-palettes.md) | The sixteen palettes, and their outward names | Must match `ValarBreathingLogo.tsx` (see the comment at the top of the file). |
| [REFERENCE_LINKS.md](REFERENCE_LINKS.md) | The "learn more" links wired into the gateways | Current |
| [touch-textures.md](touch-textures.md) | The Touch gateway's 283 surfaces | Built 2026-11-09 |
| [discoverability.md](discoverability.md) | Search engines and AI assistants: what is in place | Current. It calls partner practice "planned"; it is now built but switched off. |
| [logo-regeneration.md](logo-regeneration.md) | How to remake the logo files from the live gem | Current |
| [lexicon-sources.md](lexicon-sources.md) | The sources for the detection list, their licences, and the attestation | Registry: `src/lib/lexiconSources.ts` |
| [test-prompt-datasets.md](test-prompt-datasets.md) | Open prompt sets for testing the coach, and their licences | Research note, 2026-11-10. Licences marked "unverified" need checking. |
| [results/README.md](results/README.md) | Rules for publishing test results | Nothing has been published yet. |
| [legal/README.md](legal/README.md) | How the Terms are versioned, with a table of past versions | `legal/archive/` holds the old texts. |
| [brand/README.md](brand/README.md) | The vector logo: petals, orbs and bezel | **Stale**: it says the gem is the 48-frame sprite. The site now draws the gem live (`GEM_ENGINE = 'live'`). |

## Shipped (in the code and on)

| Doc | What it is | Status note |
|---|---|---|
| [body-map-integration-spec.md](body-map-integration-spec.md) | The body map in the gateways | Built 2026-08-30 |
| [live-gem.md](live-gem.md) | The ray-traced gem, and the `/bench/` page | **Its status line is wrong**: it says "not switched on", but `GEM_ENGINE` in `src/lib/gemSprite.ts` is `'live'` (also at the #22 merge). |
| [valar-rename-scope.md](valar-rename-scope.md) | Outward names for the sixteen palettes | Done 2026-11-08. The questions for a lawyer are still open. |
| [coach-instructions-v2.md](coach-instructions-v2.md) | Instruction wording v2 | On in production and staging through `COACH_INSTRUCTIONS=v2`. The code still defaults to v1. |
| [coach-ip-limit-scope.md](coach-ip-limit-scope.md) | A daily allowance of turns for each connection | Built (`src/lib/connectionLimit.ts`). On when `COACH_IP_SECRET` is set; `COACH_IP_TURNS` sets the number. The status line ("nothing built") is stale. |
| [site-metrics-scope.md](site-metrics-scope.md) | Visit and usage counts | Built (`counters.ts`, `count.mts`, `stats.mts`). The status line is stale; see "Built (2026-11-07)" in the doc. |
| [transcript-receipt-scope.md](transcript-receipt-scope.md) | Receipt log, verified-only reports, the `/verify` page | Built 2026-11-07. The status line is stale. |
| [transcript-consent-scope.md](transcript-consent-scope.md) | What a person allows when they send a transcript; taking it back; the witnessed page | Built, with no switch, and in `main` since #22. The line "not in production" is stale. The Terms wording for it is not applied (see drafts). |
| [carrythrough-consent-scope.md](carrythrough-consent-scope.md) | The signed note of agreeing to the Terms, carried through the visit | The terms receipt is built (`terms-agree.mts`, `termsReceipt.ts`). Later agreements are not. The status line is stale. |
| [pii-names-scope.md](pii-names-scope.md) | Keeping names out of what Nenya receives | First pass built (`piiScrub.ts`, `givenNames.ts`, `nameGuard.ts`). `COACH_NAME_GUARD=off` is the emergency off switch. |
| [coach-persona-scope.md](coach-persona-scope.md) | How the coach presents itself; the persona evaluation | The evaluation and the runtime guard are built (`personaGuard.ts`, on by default; off with `COACH_PERSONA_GUARD=off`). The status line says the guard is not built; that is stale. |
| [coach-self-questions-scope.md](coach-self-questions-scope.md) | Questions about the coach itself (identity, memory, feelings) | Largely covered by the persona guard, v2 wording and the site's prewritten answers. The status line ("nothing built") is stale. Which parts of its build order are done is unclear. |
| [about-nenya-questions-scope.md](about-nenya-questions-scope.md) | Questions about Nenya itself, answered by the site | Built (`aboutNenya.ts`, `infraGuard.ts`). On by default; `COACH_ABOUT_ANSWERS=off` turns it off. The status line and the header of `aboutNenya.ts` both say it is unused; both are stale. |
| [coach-ai-directed-abuse-scope.md](coach-ai-directed-abuse-scope.md) | Abuse aimed at the coach | Built (`hostility.ts`, core). Not yet measured against the model. |
| [harm-disclosure-directions.md](harm-disclosure-directions.md) | Directions when someone says they harmed a person | Approved and wired 2026-11-15 (`safetyFlags.ts`). No switch. |
| [report-to-coach-scope.md](report-to-coach-scope.md) | Bringing parts of a reflection report to the coach | Built (`reportFragments.ts`, `reportShare.ts`). The status line is stale; see "Progress (2026-11-09)". |
| [sound-from-colors-scope.md](sound-from-colors-scope.md) | Longer melodies from a whole palette | Built (`longMelody.ts`). The status line is stale; see "Progress (2026-11-10)". |
| [accessibility-audio-scope.md](accessibility-audio-scope.md) | Audio cues and screen-reader support | Alt text and breathing tones are built (a visitor turns the tones on). Spoken phases, haptics, the audit and voice recordings are not. |
| [data-hygiene-scope.md](data-hygiene-scope.md) | Data hygiene practice | Reports and messages moved to the private store with 90-day deletion (`submit.mts`); dev only, after #22. The rest is open. |

## Built, switched off

| Doc | What it is | Switch |
|---|---|---|
| [coach-practice-arc-scope.md](coach-practice-arc-scope.md) | The coach as practice in naming feelings and needs | `COACH_ARC=practice` |
| [learning-cards-scope.md](learning-cards-scope.md) | Short educational cards the coach can offer | `COACH_LEARNING_OFFERS=on` (with `COACH_JUDGMENT_CARDS`, `COACH_LEARNING_MIN_SEVERITY`). No cards are approved yet. For dev only: `COACH_CARD_DRAFTS`, `VITE_CARD_DRAFTS`. |
| [coach-modules-scope.md](coach-modules-scope.md) | Private method notes in parts, chosen for each reply | `COACH_MODULES=on`. The status line ("nothing built") is stale: `moduleSet.ts`, `coachModules.ts` and the switch exist. |
| [coach-lenses-scope.md](coach-lenses-scope.md) | Reflect, Learn and Stretch stances | The Learn layer is built: `COACH_STANCES=learn` on the server, and `VITE_COACH_STANCES=learn` to show the choice. Stretch has no text. The status line, and the header of `stances.ts`, say no layer exists; both are stale. |
| [coach-screening-flow-scope.md](coach-screening-flow-scope.md) | Live screening with a small hate-speech model | `COACH_SCREEN=shadow` or `on`, with `COACH_SCREEN_SECRET`. The opening "nothing here is built" is stale; see section 14. |
| [coach-detection-rescope-ethos.md](coach-detection-rescope-ethos.md) | Abuse detection, with ETHOS and MetaHate as test sets | Parts are built (`lexiconDecisions.ts`, `learningOffer.ts`) and act only through `COACH_LEARNING_OFFERS` and `COACH_VALUES`. The list content is private. "Nothing here is built" is stale. |
| [coach-instructions-v2.1.md](coach-instructions-v2.1.md) | Instruction wording v2.1, with each rule said once | `COACH_INSTRUCTIONS=v2.1`. A candidate to replace v2; not yet decided. |
| [ghost-footprint-stack.md](ghost-footprint-stack.md) | Light-footprint plan: live gem, device profile, sealed coach, partner practice | Sealed coach: `COACH_SEALED=on`. Partner practice: `CELL_ENABLED=true`. The live gem is now on. The on-device model is planned, not built. |
| [color-tools-scope.md](color-tools-scope.md) | Color naming and palettes in the Sight gateway | Local naming is on. Palettes from The Color API: `PALETTE_ENABLED=true`. |
| [start-chooser-scope.md](start-chooser-scope.md) | A first screen: breathing, reflection or the coach | `VITE_START_CHOOSER=on` (dev only, after #22) |
| [save-and-return-scope.md](save-and-return-scope.md) | Save a reflection on the device for 24 hours, with a passcode | `VITE_SAVE_REFLECTION=on` (dev only, after #22) |

Switches with no scope document of their own (see production-env.md and coach-features.md): `COACH_DISTRESS_TEXT`, `COACH_VALUES` (its stance is scoped in section 4 of triggers-and-escalation-checkin.md and in drafts/history-and-violence-text-draft.md), `COACH_TURNSTILE`, `VITE_GATEWAYS_SIMPLE`, `VITE_SOUND_CHORDS`, `VITE_NAME_MARK`.

## Proposed, or only partly built

| Doc | What it is | Status note |
|---|---|---|
| [coach-boundaries-scope.md](coach-boundaries-scope.md) | Dehumanizing language, and a ladder of boundaries | The ladder is not built. The pause screen and quiz are built (`pause.ts`, `PauseScreen.tsx`), but only the owner panel can start a pause. |
| [coach-instructions-scope.md](coach-instructions-scope.md) | Moving coach instructions out of the code, with a feedback loop | Step 1 is built (`coachIntent.ts`). The rest is not. |
| [coach-improvement-loop.md](coach-improvement-loop.md) | A working plan for improving the coach | Some of it is built since (runtime guards, counts). It says "nothing built unless it says so", which is stale in places. |
| [about-overhaul-scope.md](about-overhaul-scope.md) | Rewriting the About pages with the Tolkien material in the background | Partly built: About pages have their own addresses (`aboutRoutes.ts`), and the series note is removed. Not built: the main rewrite. `NamePhilosophy.tsx` is still built around Galadriel and Fëanor. |
| [gateway-images-scope.md](gateway-images-scope.md) | Open images with alt text for four gateways | Touch got textures instead (touch-textures.md). There are no images for Movement, Insight or Essence in the code. |
| [learning-modules-scope.md](learning-modules-scope.md) | Learning modules that visitors can read | Not built |
| [translation-scope.md](translation-scope.md) | An English-only notice, and an invitation to translators | The notice is built (the footer and the coach page). The translator document and the string layer are not. |
| [solresol-scope.md](solresol-scope.md) | Type a phrase, hear a melody | Not built. The Sound gateway only links to solresol.xyz. |
| [reflection-submission-scope.md](reflection-submission-scope.md) | Signed public submission of reflections | A draft for the owner, 2026-11-15. Not built. |
| [venice-character-card-scope.md](venice-character-card-scope.md) | Rebuilding the Venice character card | Active (2026-11-10). The test harness is built; the new card is not live. |
| [venice-card-v2/](venice-card-v2/README.md) | Draft field texts for the new Venice character | Draft, 2026-11-10. Not yet pasted into Venice. |

## Superseded or abandoned

| Doc | What it is | Replaced by |
|---|---|---|
| [colormind-scope.md](colormind-scope.md) | A Colormind palette in Sight | color-tools-scope.md. Palettes come from The Color API (`netlify/functions/colors.mts`); Colormind is not used. |

Some documents are only partly replaced. Section 5 of triggers-and-escalation-checkin.md is replaced by coach-detection-rescope-ethos.md. The Terms parts of transcript-consent-scope.md are replaced by drafts/terms-transcripts-draft.md. No instructions version is superseded yet: v2 is live, and v2.1 is a candidate. Ideas dropped inside a document (for example, banning "I" in coach-persona-scope.md, or the Hatebase plan in the triggers check-in) are recorded in that document.

## Point-in-time records

| Doc | What it is | Date / note |
|---|---|---|
| [HANDOFF-2026-11-11.md](HANDOFF-2026-11-11.md) | Handoff: live gem, sealed coach, partner practice | 2026-11-11. Out of date: it lists `GEM_ENGINE='live'` as off, but it is now on. The sealed coach and cells are still off. |
| [accessibility-audit-2026-11-14.md](accessibility-audit-2026-11-14.md) | Source-reading audit against WCAG 2.2 AAA | 2026-11-14. No screen-reader or keyboard pass yet. |
| [crisis-resources-check.md](crisis-resources-check.md) | Each support line checked against its own organization's page | Checked 2026-11-14. **Check again before every release.** |
| [triggers-and-escalation-checkin.md](triggers-and-escalation-checkin.md) | Check-in on the triggers list and the escalation protocol | 2026-11-10. Its table is out of date: the mass-violence stance is now built behind `COACH_VALUES`. |
| [legal/archive/](legal/README.md) | Every earlier Terms text | Named by the date each one stopped being in effect |

## Drafts (not applied unless marked)

Terms drafts were compared with `src/lib/legalDocument.ts` (effective November 15, 2026) and `legal/archive/`. Several drafts still say "nothing here is live" after being applied.

| Doc | What it is | Applied? |
|---|---|---|
| [drafts/terms-revision-2026-11-09.md](drafts/terms-revision-2026-11-09.md) | Terms changes for release 1.1.0: encryption wording, site-written text | **Applied** 2026-11-09 (legal/README; the 1.2.0 draft calls it "already live"). Its header is stale. |
| [drafts/terms-fixed-replacements-draft.md](drafts/terms-fixed-replacements-draft.md) | Replies the site replaces with a fixed sentence | **Applied** 2026-11-10 (it says so) |
| [drafts/terms-respectful-use-draft.md](drafts/terms-respectful-use-draft.md) | Respectful use, and the pause | **Part A applied** (in the Terms since 2026-11-09 and in the live text). Part B (the pause) is **pending**: nothing starts a pause. Its header is stale. |
| [drafts/terms-and-privacy-1.2.0-draft.md](drafts/terms-and-privacy-1.2.0-draft.md) | Draft for release 1.2.0, with a list of which draft goes in when | **Part A applied** (the signed agreement note is in the live Terms). Parts C to F wait on their switches. |
| [drafts/terms-rewrite-2026-11-14.md](drafts/terms-rewrite-2026-11-14.md) | Full reorganization of the Terms | **Applied**: the live Terms use its structure (legal/README, 2026-11-14). It was not compared line by line. Its header is stale. |
| [drafts/terms-learning-cards-draft.md](drafts/terms-learning-cards-draft.md) | Terms for learning cards | Pending, until `COACH_LEARNING_OFFERS` is on |
| [drafts/terms-sealed-and-partner-draft.md](drafts/terms-sealed-and-partner-draft.md) | Terms for sealed mode and partner practice | Pending, until `COACH_SEALED` or `CELL_ENABLED` is on |
| [drafts/terms-transcripts-draft.md](drafts/terms-transcripts-draft.md) | Terms for sending a conversation (18+, consent receipt, uses, withdrawal) | **Pending, but the feature is live in the code with no switch.** The live Terms still say a sent transcript is passed on "without keeping or logging it". |
| [drafts/transcript-contribution-terms-draft.md](drafts/transcript-contribution-terms-draft.md) | What a person agrees to when a conversation is used | Pending. The consent receipt it describes is built (`consentReceipt.ts`). |
| [drafts/contributor-agreement-draft.md](drafts/contributor-agreement-draft.md) | Contributor agreement | Not in force. One clause is unfinished. |
| [drafts/history-and-violence-text-draft.md](drafts/history-and-violence-text-draft.md) | Where Nenya stands on genocide, occupation and colonization | The page text is not on the site. "Nothing wired into the coach" is stale: `valuesRule.ts` is built behind `COACH_VALUES`. |
| [drafts/reentry-quiz-draft.md](drafts/reentry-quiz-draft.md) | The pause screen and quiz | Built into `PauseScreen.tsx`. Nothing in a conversation starts it. |
| [drafts/plain-language-summaries-2026-11-14.md](drafts/plain-language-summaries-2026-11-14.md) | "In plain words" boxes for the About pages | Not on the site |
| [drafts/origin-and-name-draft.md](drafts/origin-and-name-draft.md) | Origin note and Name page | Not published |
| [drafts/compliance-pressure-set-draft.md](drafts/compliance-pressure-set-draft.md) | Ten categories of invented messages that ask a model to comply with what a careful reply declines; pass criteria left for the owner | Draft |
| [budget-repurpose-plan.md](budget-repurpose-plan.md) | Spending the canary and Venice budgets on measurement while demand is low; a better duet canary on local hardware | Scoping |
| [hub-scales.md](hub-scales.md) | Hubs from one table to a federation: a ladder of seven scales, from a single device to many regions, with what changes at each | Scoping |
| [hub-scope.md](hub-scope.md) | A local hub and spokes: the hub serves the app (option 1) or peer-to-peer (option 4); the guards must run on the hub's side | Scoping |
| [expanded-buildout-scope.md](expanded-buildout-scope.md) | The technical workstreams after 2026-11-17: outer layers, local models, lens rewrite, Terms batching, evidence | Scoping |
| [lens-rebuild-audit.md](lens-rebuild-audit.md) | The six lens pages as they are (sliders, stages, shared state), the card model, the method for rebuilding one lens at a time | Scoping |
| [wireframes/lens/index.html](wireframes/lens/index.html) | Plain-HTML wireframes for Sight and Sound (four cards each), built to be tested by keyboard and screen reader; make no sound and send nothing | Draft for the owner |
| [lens-audit-movement-pattern.md](lens-audit-movement-pattern.md) | Movement and Pattern (was Insight) audited together: two near-identical pages with 24 drawn shapes each that already work as decks; a shared card plan and optional activities | Draft for the owner |
| [lens-audit-essence.md](lens-audit-essence.md) | Essence as it is (word lists, no imagery), what the lens must get right (people who cannot smell or taste), three directions, a recommendation | Draft for the owner |
| [lens-audit-touch.md](lens-audit-touch.md) | Touch as it is (283 texture photos, ten sliders that change nothing), a card plan, and the shared-body-map finding | Draft for the owner |
| [lens-audit-sight-sound.md](lens-audit-sight-sound.md) | Sight and Sound as they are, what to fix, and a draft card plan for each | Draft for the owner |
| [lens-rewrite-scope.md](lens-rewrite-scope.md) | Replacing "gateway" with "lens": size, decisions, corrections to the brief, phases | Scoping, decisions open |
| [outer-layers-scope.md](outer-layers-scope.md) | What the outer layers add per model; the 2x2 test; local models | Measurement built; more to do |
| [drafts/fractured-atlas-about-2026-11-16.md](drafts/fractured-atlas-about-2026-11-16.md) | The Fractured Atlas About text rewritten for today's scope, in eight voices, with what changed and what to confirm | Draft for the owner; not sent or published |
| [drafts/fractured-atlas-about-redraft-2026-11-13.md](drafts/fractured-atlas-about-redraft-2026-11-13.md) | "Our Structure" redraft for Fractured Atlas | SUPERSEDED 2026-11-16 (still names Venice). Not applied (the live text is `about/Structure.tsx`) |
| [drafts/fractured-atlas-website-descriptor-2026-11-13.md](drafts/fractured-atlas-website-descriptor-2026-11-13.md) | Project description for Fractured Atlas's page | SUPERSEDED 2026-11-16 (still names Venice). Not published |
| [drafts/essence-images-shortlist.md](drafts/essence-images-shortlist.md) | 24 food photographs for Essence | Shortlist only. Not in the code. |
| [drafts/image-candidates-2026-11-09.md](drafts/image-candidates-2026-11-09.md) | Image search results from the Met and Openverse | A list to review |
| [drafts/nvc-ideas-cards-README.md](drafts/nvc-ideas-cards-README.md) | Index of private NVC idea cards for the Learn stance | The cards are kept outside the repository |
| [drafts/venice-attestation-questions.md](drafts/venice-attestation-questions.md) | Questions for Venice about end-to-end encryption attestation | Not sent |
| [drafts/answers/review-notes.mts](drafts/answers/review-notes.mts) | Code file: places where the About pages, Terms and code disagree | Imported by `scripts/build-answers-pdf.mts` and `tests/answers-draft.test.mts`. Update both if you move it. |

## Files that do not belong here

- **`dev-console-helper.js`** is a script, not a document. It is pasted into the browser console on the staging coach page, reads the owner token from local storage, and sends real messages (each one costs money and uses turns). It points to `docs/dev-console-tests.md`, which does not exist, and nothing else refers to it. Move it to `scripts/` (and add it to `scripts/README.md`), or delete it.
- **`drafts/answers/review-notes.mts`** is code kept in docs (see its row above).

## Conventions for new docs

- Name a scope document `<area>-scope.md`.
- Put a `Status:` line at the top, with one of: `Proposed`, `Built, off (SWITCH_NAME)`, `Shipped`, `Superseded by <doc>`, `Abandoned`. Change the line when the status changes. Do not only add a "Progress" section further down.
- Put the date in the filename of a point-in-time record (an audit, handoff or check): `<topic>-YYYY-MM-DD.md`.
- Put drafts in `drafts/`. When a Terms draft is applied, mark it `Applied YYYY-MM-DD` at the top.
- Keep scripts and code out of `docs/`.
- Update this index in the same change.
