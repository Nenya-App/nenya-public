# Scope: modules, the Learn stance, ICARUS as learning modules, and the model knowing what a shown module says

Status: scoping plus one built piece. Written 2026-11-20 from the owner's note: shrink the main text and split the rest into modules sent separately from the full instructions; send the model a set of five modules for the Learn stance; let ICARUS live almost entirely in learning modules; and if a learning module may be shown to the person, the model must know what it says in advance, or the guards must check on the way back, so it neither contradicts nor repeats it.

## What already exists (checked in the code, 2026-11-20)
- **The coach already works this way.** Core instructions are always sent; modules are added per reply by public phrase matching (`src/lib/coachModules.ts`: groups safety, lens, move, resource; at most about three, roughly 2,500 characters, cap 12,000), from the private store. Everything goes in **one** system message (Venice's encrypted route rejects a second). Only the selection logic is public.
- **The Learn stance** (Vilya, Air): `LEARN_LAYER` in `src/lib/stances.ts` plus the private `learn-icarus` text (nine plain ideas, each with its feelings-and-needs side), added when someone chooses Learn and the layer is allowed. Off unless `COACH_STANCES` contains `learn`.
- **Learning cards** (`docs/learning-cards-scope.md`): short reads written by Nenya, not the AI, offered by the page **under** a reply as an invitation. The series include `nvc-ideas` (ids `idea-01`...). Off by default.
- **The gap that was real:** the page sent the ids of offered cards (`shown`), but the server used them only to avoid offering the same card twice. **The model never saw what a card said.**

## Built today (`src/lib/shownCards.ts`, tests in `tests/shown-cards.test.mts`)
- The server now tells the model, inside the single system message, which cards the page has offered (title, key idea and text), that they are **written by Nenya and not by the model**, that the person may have read them, and not to repeat, summarize or cut across them.
- The card's own words count in the existing repeat check: a reply that restates a card is asked for again once, like a reply that repeats an earlier one.
- **What this cannot do:** catch a *contradiction*. Phrase matching cannot tell that a reply cuts across a card. What prevents it is the model seeing the text; what measures it is the evaluations (the duet and arena runs), not a guard. Say so wherever the guard is described.

## The shape the owner is describing, and how it fits
1. **Shrink the core, move detail into modules, send modules separately.** Already the design for the coach. Next: audit what is still in the core that is only sometimes relevant, and move it to a module with a trigger.
2. **A set of five modules for Learn.** Today Learn adds one block (`learn-icarus`, nine ideas). Two ways to get "five":
   - **Fixed:** five teaching ideas always sent in Learn (shorter, predictable, tested).
   - **Matched:** up to five chosen per reply by phrase matching, as lenses are today (cap raised from about three when Learn is on).
   The live model is now a larger one than the 7B the 2,500-character budget was set for, so five may fit; **it has to be measured** (length, repetition, contradictions, whether the honest lines still hold) with the duet and arena runs before the cap is raised.
3. **ICARUS in learning modules.** One source for each idea, used twice: **the person reads it as a card or module, and the model is given the same text**. That is the cleanest answer to contradiction, because the coach cannot say something the card does not. A file per idea would have: the public text (key idea, short body, try-it, credit) and the coach's guidance (when to use it, what not to say), with a test that the coach's note contains the card's key sentence verbatim. The ideas are named and spoken in plain language, with imagery and metaphor when someone asks about the framework (owner, 2026-11-20); `docs/venice-card-v2/module-pictures-from-nature.md` is a first set of natural pictures.
4. **The model must know in advance what may be shown.** Two situations:
   - **A card the page already offered:** built (above).
   - **A card the page is about to offer under this very reply:** the offer is decided from the person's message and the history, not from the reply, so it could be decided **before** generation and the model told "the page will offer the short read X under your reply; do not restate it, and you may point to it in one sentence". The risk: a reply that says "below is a short read" when the offer is then suppressed by a later rule. It is only safe if the decision is final before the model runs. A decision for the owner; not built.
5. **Guards on the way back:** repeat (built, covers earlier replies and shown cards); the existing honesty, infrastructure, persona and name guards; **contradiction is measured, not guarded** (see above).

## On Venice (the card), for comparison
Nothing here can be done there: Venice, not Nenya, decides how a character's Context is used, and nothing selects a module per reply. The card's method text is therefore a short core plus small, self-contained modules (`docs/venice-card-v2/`), so it works whether Venice always includes them or retrieves them in pieces; the rules that must always hold are in the Instructions. Whether Venice retrieves or includes is one of the questions for Venice.

## Decisions for the owner
1. Fixed five or matched up to five for Learn; and which five ideas (the nine in `learn-icarus` are the pool).
2. Whether the ICARUS ideas also become public cards (the `nvc-ideas` series exists), so the card text and the coach's text are literally the same file.
3. Whether to decide the offer before generation (item 4).
4. The test to run before raising any cap: which duet and arena scripts, and what counts as a pass (length, repeats, contradictions, honest lines).
5. Which parts of the core move into modules first.

## Not verified
- How the larger live model behaves with five modules; whether Venice retrieves or includes character Context; anything about how a visitor experiences an offered card beside a reply that refers to it.
