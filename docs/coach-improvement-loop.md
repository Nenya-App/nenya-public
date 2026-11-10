# How we keep improving the coach, and where its content should live

Status: a working plan, written 2026-11-08 after the first full evaluation passes (`docs/coach-persona-scope.md`, `docs/coach-instructions-v2.md`). Nothing here is built unless it says so.

## What the tests keep showing
Each round has fixed one family of errors and shown the next. The pattern is consistent:
- **Wording changes work for things the model can do by following a plain rule** (saying it is an AI, not promising to remember): identity went from 1 of 7 to 7 of 7 with one paragraph and five examples.
- **Wording does not work for things this 7B model will not do on its own** (name a person or 988 when someone is in distress; stop opening with "It sounds like..."; answer a question that looks like a story). Those need the site, not the prompt.
- **Our checks only catch what we named.** Passing is not the same as good. The review rates (how often it says what it is, how often it reflects instead of answering) are the better signal.

## The layers, from most to least reliable
The aim is that no single layer has to be perfect.
1. **The site answers, deterministically.** Detect what kind of message it is; for the kinds where a wrong answer is a lie or a harm, write the answer ourselves and keep the model away from it (identity, memory, "what are you made of", the model type, who runs it, the project's infrastructure, contact, distress). Reliable by construction; grows one kind at a time; needs held-out phrasings so it is not tuned to its own examples.
2. **The instructions, kept short and measured.** Each change is a new version (v2, v3...) behind the switch, run on the same sets, compared (`compare-persona-runs`), and adopted only if nothing that passed now fails. The signed transcript's fingerprint records which wording produced a reply.
3. **A check on every reply, at runtime.** The persona checks already exist and are tested; run on each reply, a reply that denies being an AI, promises to remember, claims a life, or invents infrastructure is retried once and then replaced by the site's own sentence. How often it fires is the coach's health number.
4. **The model itself.** A larger or better-tuned model follows instructions more reliably. The persona sets make this a measurement, not a guess: run the same sets with `COACH_MODEL=<other encrypted model>` and compare the review rates, cost and speed. Any change of model also changes what the Terms and the pages say about it.
5. **People.** A counselor reads a sample; a clinician reviews the distress wording; blind and low-vision testers (when planned) read the tones and the pages.

## A loop that runs on its own
1. **Every failure we find becomes a case.** Add it to the set with the check that would have caught it; it then protects against that failure for good (a regression case).
2. **Keep a held-out set that nobody tunes on**: paraphrases written separately from the patterns and the examples, run only when deciding.
3. **Add multi-turn scripts**, not only first messages. Dependence, grief and "you're the only one I talk to" build over three to five turns; the current sets are mostly single messages.
4. **Learn from real use without keeping what people write:**
   - plain daily counts: how often each kind of question is detected, how often the guard acts, how often a reply is replaced (health numbers; no content);
   - the signed-transcript reports people choose to send (already built): read them, scrub, turn the failures into cases;
   - a "Was this reply helpful?" thumb with a category and no text (scoped in `docs/coach-instructions-scope.md`), if you want it.
5. **A rhythm.** Run the persona sets before every instruction change, model change and release; save the results (they carry the instruction version and date); once a month read about thirty replies from a staged run, by eye, for tone.
6. **Release in steps.** A new instruction version or model goes to staging first (an environment variable), then production; rollback is changing the variable.
7. **Keep the claims modest.** The demo is five exchanges, says it is not therapy, and shows crisis resources; none of this makes it safe for a crisis and nothing should say so. What the loop gives is a lower and measured rate of the errors we know about, and a way to find the next ones.

## What to build next, in the order that closes the most harm
1. A fixed distress sentence appended when the crisis check flags (soften or stop), plus "dark thoughts" and the reviewed phrase list; and a line telling the model not to ask for detail about dark thoughts.
2. The "life" kind (73 of 110 life questions are still reflected as the person's own story): detect and add a fixed honest sentence.
3. The about-Nenya answers and the model-type answer (pre-written, with the card), and the instruction backstop.
4. The runtime guard.
5. More multi-turn cases and the held-out phrasings.
6. The About pages rebuilt and checked for accuracy, as real pages (so the answers can point to them).

## Blobs, a database, or both
**Today's Blobs** (Netlify's key and value store, private to the site): the coach's private method notes and modules (JSON), the plain daily counts (one number per event per day), the per-connection allowance records (deleted after about a day and a half), the site-wide turn count, and the 30-day receipt hashes. Every one of those is a small value that is read or counted by its exact key, and the conditional writes (create only if new, update only if unchanged) give the counting the safety it needs.

**What a database is better at:** questions across many records (sort, filter, join), edits with history and review, many editors at once, and relationships (a person and their saved things). **What it costs here:** another service to run and secure, more to say in the Terms (anything that holds personal data), and a temptation to start storing things we do not need.

**Recommendation: keep Blobs for what is there, and do not add a database yet. Revisit at three triggers.**
- **Public modules do not belong in Blobs at all.** Modules that visitors will read (`docs/learning-modules-scope.md`) should live in the repository as the source of truth, built into the site and into what the coach is given: reviewable, versioned, the same on staging and production. Blobs keeps only what must stay private (the coach's private notes). That removes the question for modules.
- **Trigger 1: accounts.** If the owner's sign-in grows into saved things for visitors (the encrypted journal, shared transcripts), that is relational, personal data: a database (with encryption the visitor controls) is the right home, and the Terms change with it.
- **Trigger 2: reporting.** If the admin page needs questions the daily totals cannot answer ("views per page per week by referrer", per-module trends), a small database or an analytics export becomes worth it. Until then plain daily totals in Blobs, plus the host's own analytics for page loads, are enough. Any richer analytics must stay free of personal data to keep the privacy promise.
- **Trigger 3: editing.** If someone other than a developer must write and review modules with history and approval, that is a content system: a database, or a hosted content tool, and the admin page as its front.
**If we ever have both:** each kind of data lives in exactly one of them (counters, limits and receipts in Blobs; accounts and content workflow in the database), never the same data in both, and the Terms and the admin page say what is held where.

## Decisions for you
1. **Which model to try beside the current one** when we compare (any other encrypted model Venice offers); and whether a better model is worth a higher cost and slower replies.
2. **The thumb** ("Was this reply helpful?"): yes or no.
3. **Public modules in the repository, private notes in Blobs** (recommended), or keep everything in Blobs.
4. **The monthly human read**: who does it, and whether a counselor is asked.
