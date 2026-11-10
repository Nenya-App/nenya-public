# Scope: keeping names out of what Nenya receives

Status: first pass built in dev, 2026-11-09. Owner's direction: we do not want names in our email (a submitted report or transcript that carries someone's name puts that name in our inbox), and we do not want the AI handling names at all. Gentle reminders and pattern-based deletion continue; the owner asked for more testing, especially of the model, as we go.

## Where a name can travel
1. **The person's message → our server → Venice AI.** The page scrubs identifiers before sending, and the server scrubs again.
2. **The coach's reply → the page.** A name that got through can be repeated by the model.
3. **A signed transcript or report sent to us** (the report function, then our email via Netlify Forms). The transcript is signed as sent, so it cannot be cleaned afterward without breaking the signature: whatever name is in it was already in the conversation. The only fixes are upstream (steps 1 and 2) and the person's own care with their optional note.
4. **The contact and feedback forms:** free text. The page asks people to leave names out; it cannot scrub a form's text without surprising the person.
5. **Shared report text** (parts of a reflection report brought to the coach) and **names typed into color/body-map notes.** They go through the same scrub as a message when shared.

## What is built (all pattern or list matching, never understanding)
- **The scrubber** (`src/lib/piiScrub.ts`): structured identifiers (emails, phones, cards, addresses, links, handles) as before; names after a telltale phrase ("my name is", "my sister Maria", "Dr. Lee"), with more relation words; and now a pass for **names with no phrase** ("Maria yelled at me", "I told Jordan") from a list of common given names and surnames from many languages (`src/lib/givenNames.ts`). Words that are also names (Will, Mark, Rose, Hope, May, June, Jordan...) count only when the sentence shows a person (after a relation word or "told", "with", "missed", or beside a surname). A capitalised word right after a name is taken as its surname.
- **The instruction** to the coach: never use or repeat any person's name, refer to people by role or pronoun, never ask for a name (`NAME_RULE`).
- **The reply guard** (`src/lib/nameGuard.ts`): if the reply repeats a capitalised word the person wrote (how a name that slipped through comes back), it is asked for again once, then the sentences that repeat it are taken out. `COACH_NAME_GUARD=off` turns it off to measure the instructions alone. Tallies: `coach.guard.names`, `.removed`.
- **Tests and a synthetic corpus** (`src/lib/piiEvalCorpus.ts`, `tests/pii-names.test.mts`): 50 invented sentences with listed names, 18 "held-out" sentences with names the list does not know, and 39 ordinary messages with capitalised words that must come out unchanged. The `names` group in the safety set plays held-out names through the real coach and fails any reply that uses one (`forbid`).

## What the numbers say (2026-11-09)
| Corpus | Before the list | After |
| --- | --- | --- |
| Listed names, many kinds (told, relation, bare, title, full, possessive, list, word, cultural) | 24 of 50 | 49 of 50 (the miss is a nickname that is also a word) |
| Ordinary messages changed by mistake | 0 of 24 | 0 of 39 (including "Will you remember me?", "Rose is the color...", "I flew to Jordan") |
| Names the list does not know (held out) | 3 of 18 (those after a relation word) | **3 of 18 (unchanged)** |

**Read this honestly:** the 49 of 50 is partly the list meeting names its author knew. The held-out line is the real one: **a name the list does not know is missed unless a phrase introduces it.** That is why the model instruction and the reply guard exist, why the page must keep asking people to leave names out, and why nothing may claim anonymity.

## What is not built, and decisions
1. **A "this looks like a name" note** while typing: the page highlights a capitalised word it does not recognise and offers "use 'my sister' instead?" with one click. The person stays in control and it catches names the list does not know. False positives (places, brands) are acceptable for a note, unlike for deletion. Recommended next.
2. **Telling people before they send a transcript to us** that names in it cannot be removed, and offering to send a note without the transcript. Wording is the owner's.
3. **A bigger list or a small open name dataset** (public-domain census-style data would need checking), shipped as a separate file loaded only when the coach opens. It raises recall for common names and does nothing for the rest; it also costs size.
4. **Scrubbing the body-map and color-name notes** at the time they are typed (they can hold names and travel only if shared with the coach, but they are in the downloaded report).
5. **Email hygiene:** a periodic search of the inbox for submitted names and a rule for deleting them; Netlify Forms keeps copies under its own retention.
6. **Model testing to run on the staging site:** `--only names` in `scripts/eval-safety.mts` (11 scripts: unknown names in sentences, the coach asked for advice about a coworker, a person giving their own name). Read whether the coach asks for names, uses them, or invents any.

## Not verified
- How the model behaves with the new rule (the scripts have not been run against it).
- Recall on names from languages and naming systems not represented in the list (single names, patronymics, clan names, names written in other scripts, names made of ordinary words).
- Any legal position on what counts as personal data in an inbox.
