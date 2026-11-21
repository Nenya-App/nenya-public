# Scope: modules, the Learn stance, ICARUS as learning modules, and the model knowing what a shown module says

Status: scoping plus one built piece. Written 2026-11-20 from the owner's note: shrink the main text and split the rest into modules sent separately from the full instructions; send the model a set of five modules for the Learn stance; let ICARUS live almost entirely in learning modules; and if a learning module may be shown to the person, the model must know what it says in advance, or the guards must check on the way back, so it neither contradicts nor repeats it.

## What already exists (checked in the code, 2026-11-20)
- **The coach already works this way.** Core instructions are always sent; modules are added per reply by public phrase matching (`src/lib/coachModules.ts`: groups safety, lens, move, resource; at most about three, roughly 2,500 characters, cap 12,000), from the private store. Everything goes in **one** system message (Venice's encrypted route rejects a second). Only the selection logic is public.
- **The Learn stance** (Vilya, Air): `LEARN_LAYER` in `src/lib/stances.ts` plus the private `learn-icarus` text (nine plain ideas, each with its feelings-and-needs side), added when someone chooses Learn and the layer is allowed. Off unless `COACH_STANCES` contains `learn`.
- **Learning cards** (`docs/learning-cards-scope.md`): short reads written by Nenya, not the AI, offered by the page **under** a reply as an invitation. The series include `nvc-ideas` (ids `idea-01`...). Off by default.
- **The gap that was real:** the page sent the ids of offered cards (`shown`), but the server used them only to avoid offering the same card twice. **The model never saw what a card said.**

## Built (2026-11-20, reworked the same day): the page serves cards, the model stays out of the loop
The first version told the model what each offered card said. **The owner asked for the opposite: keep the model out of the loop, and let the page do it.** So (`src/lib/shownCards.ts`, `tests/shown-cards.test.mts`):
- **The model is told nothing about cards.** It sees only the conversation. No card title, text or note is in the system message (a test checks this), and nothing about cards is in the instruction fingerprint.
- **The page's tidying after the reply:** if a reply happens to restate a card the person was already offered (a run of ten words in common), the sentences that do are taken out. No second call to the model, and the card is never mentioned to it. A reply that is entirely the card's words, or has none, is left alone.
- **A matching card is never suppressed** (owner, 2026-11-20): not when the coach has just taught the same idea in its own words, and not when the reply happens to use the card's wording. (An earlier version of this change suppressed the offer on a near-verbatim restatement; it was removed.)
- **What this cannot do:** catch a *contradiction*, or the same *idea* said in different words. Phrase matching cannot. Cards are written to be self-contained and are labeled "written by Nenya, not the AI", and the evaluations (duet and arena) measure whether the coach cuts across them.

## The shape the owner is describing, and how it fits
1. **Shrink the core, move detail into modules, send modules separately.** Already the design for the coach. Next: audit what is still in the core that is only sometimes relevant, and move it to a module with a trigger.
2. **A set of five modules for Learn.** Today Learn adds one block (`learn-icarus`, nine ideas). Two ways to get "five":
   - **Fixed:** five teaching ideas always sent in Learn (shorter, predictable, tested).
   - **Matched:** up to five chosen per reply by phrase matching, as lenses are today (cap raised from about three when Learn is on).
   The live model is now a larger one than the 7B the 2,500-character budget was set for, so five may fit; **it has to be measured** (length, repetition, contradictions, whether the honest lines still hold) with the duet and arena runs before the cap is raised.
3. **ICARUS in learning modules.** One source for each idea, used twice: **the person reads it as a card or module, and the model is given the same text**. That is the cleanest answer to contradiction, because the coach cannot say something the card does not. A file per idea would have: the public text (key idea, short body, try-it, credit) and the coach's guidance (when to use it, what not to say), with a test that the coach's note contains the card's key sentence verbatim. The ideas are named and spoken in plain language, with imagery and metaphor when someone asks about the framework (owner, 2026-11-20); `docs/venice-card-v2/module-pictures-from-nature.md` is a first set of natural pictures.
4. **The page, not the model, handles what may be shown** (owner, 2026-11-20). The model is not briefed on cards. For a card already offered, the page tidies the reply (built, above). A card that matches is always offered under the reply, whatever the reply said (owner's decision). Telling the model in advance that "the page will offer X" is **not** the plan; if the model ever needs to know, the better route is to let it see the card text as part of the conversation the person sees, not as a briefing.
5. **Guards on the way back:** repeat (earlier replies, and card words by sentence removal); the honesty, infrastructure, persona and name guards; **contradiction and same-idea overlap are measured, not guarded** (see above).

## On Venice (the card), for comparison
Nothing here can be done there: Venice, not Nenya, decides how a character's Context is used, and nothing selects a module per reply. The card's method text is therefore a short core plus small, self-contained modules (`docs/venice-card-v2/`), so it works whether Venice always includes them or retrieves them in pieces; the rules that must always hold are in the Instructions. Whether Venice retrieves or includes is one of the questions for Venice.

## Decisions for the owner
1. Fixed five or matched up to five for Learn; and which five ideas (the nine in `learn-icarus` are the pool).
2. Whether the ICARUS ideas also become public cards (the `nvc-ideas` series exists), so the card text and the coach's text are literally the same file.
3. ~~Whether the coach's own teaching should suppress the matching card~~ Decided 2026-11-20: no, never.
4. The test to run before raising any cap: which duet and arena scripts, and what counts as a pass (length, repeats, contradictions, honest lines).
5. Which parts of the core move into modules first.

## Not verified
- How the larger live model behaves with five modules; whether Venice retrieves or includes character Context; anything about how a visitor experiences an offered card beside a reply that refers to it.
