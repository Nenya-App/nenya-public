# Check-in: the triggers list and the escalation protocol, against open resources and tools

Written 2026-11-10. The plan stays in `docs/coach-boundaries-scope.md` (the ladder), `docs/learning-cards-scope.md` (the offers) and `sourcing-a-vetted-list.md` (private, the list). This note checks them against what is open and available now, and adds the new category the history-and-violence text needs.

## 1. Where we are
| Piece | State |
| --- | --- |
| Matcher and loader (longest-first, leet fold, cue words, neutral-identity guard, self-description protection) | **Built**, tested. No list content in the repository. |
| The list itself | **None.** Venice's list was purged on 2026-11-10; the rebuild from vetted sources has not started. |
| Learning-card offers on a match | **Built, off** (`COACH_LEARNING_OFFERS`), no approved cards yet. |
| The boundaries ladder (levels 1 to 3: acknowledge, challenge, end) | **Scoped only.** Not built. |
| Hostility aimed at the coach | **Built** (the AI-directed-abuse path). |
| Harm to others and self-harm flags | **Built** (they stop or soften before anything else). |
| New: "justifying or denying mass violence" as a category | **Not scoped until now** (section 4 below). |

## 2. What I could confirm about open resources today (2026-11-10)
- **Google's Perspective API is shutting down on 31 December 2026**, with no new requests after February 2026. It was never an option (it sends visitors' words to a third party). Nothing to plan around.
- **Hatebase was retired in 2022** according to a civic-tech directory; the API was deprecated and its data removed. The earlier plan to use its severity scale to seed ours **no longer works**. A secondhand report says its maintainers suggested **Weaponized Words** (free for qualifying academic researchers, wider language range); I found no official terms, so that needs a direct look and a permission request.
- **HurtLex** (Bassignana, Basile and Patti, 2018): the repository's listed terms match Creative Commons attribution, noncommercial, share-alike. I could not confirm the licence file's wording, and a paper reports heavy noise in the machine-translated languages (over half of one language's original list discarded in checking). Still a candidate for the animal and filth comparison category, with an email to the authors first, as drafted in correspondence 05 C5.
- **Wiktionary categories** (CC BY-SA, human-tagged slurs and derogatory terms) and **LDNOOBW** remain the best permissive starting points; not re-checked today.
- **Research on dehumanizing language** (Mendelsohn, Tsvetkov and Jurafsky, 2020, and the later datasets noted in the boundaries scope) is still datasets and papers, not a lexicon we can load.

## 3. Open frameworks for the escalation itself (not word lists; these inform severity)
These are from my memory, so a reviewer should check each against its source before it is cited anywhere.
- **The Rabat Plan of Action (UN, 2012)** sets a six-part test for when speech reaches incitement to hatred: context, speaker, intent, content and form, extent of the speech, and the likelihood of harm. It is built for law, but its logic suits a severity score: the same words weigh differently as a quote, a rant, a threat or a call to act. We cannot judge speaker, extent or likelihood from a message, but **content, intent (a claim, a joke, a quote, a report) and the presence of a call to act** can be read.
- **Gregory Stanton's "ten stages of genocide"** (Genocide Watch) puts classification, symbolization, discrimination and **dehumanization** early, and persecution, extermination and denial later. It supports treating **denial and justification** as a distinct, serious category, and treating the ladder as being about conversation, not a person's character.
- **The Pyramid of Hate (ADL)** and the **Dangerous Speech Project's** framework are two more graded models that a reviewer can compare to our levels.
- **Social-psychology work on dehumanization** (Haslam and others) separates "animalistic" from "mechanistic" dehumanization, which would let us tag a category in the list.

## 4. A new category: justification or denial of mass violence
The history-and-violence text (`docs/drafts/history-and-violence-text-draft.md`) commits the coach to challenge, not stay silent on, claims that justify or deny genocide, apartheid, ethnic cleansing, collective punishment or mass violence. Phrase matching is weak at this, so the scope is:
- **Not a word list; a small set of patterns plus a model-side rule.** Patterns for the plain cases ("the Holocaust never happened", "they deserved it", "wipe them out", "there was no apartheid, it is just security", "slavery was good for them"), kept out of the public code like the other lists, plus the instruction paragraph in the draft.
- **A different response from the ladder.** It is the **challenge** (say plainly that we disagree, say what the record shows, one short card, ask what is behind it), not a boundary and not the end of the conversation. The ladder's Level 3 (ending) is still for continued dehumanizing language.
- **Quoting, reporting, studying and grieving never trigger it.** "He told me the Holocaust was fake", "my teacher denies it", "the propaganda said they were vermin" are must-not-count, as in the boundaries scope. The reporting-frame rule already in the offer logic (`REPORTING`) is the model.
- **Severity** (draft): 1 = a sceptical question ("was it really genocide?") is **not** a trigger, it is a question for the site-written answer; 2 = a denial or minimization stated as fact; 3 = justification or celebration of mass killing, or a call for it (the call for it is already the harm-to-others stop).
- **False alarms are the cost to watch.** A student, a survivor, a historian, or a person grieving a war must not be corrected. The evaluation set needs more of them than of the true triggers.

### 4b. The category is about the words, not the target (owner's direction, 2026-11-10)
- **Any group, any place.** The same category covers dehumanizing language toward the colonized and toward colonizers, settlers, occupiers, a majority or a ruling group, and **any text that asks for the complete removal of a group from a place** ("wipe them out", "send them all back", "drive them into the sea", "clear them out", "no one should live there") or for mass violence against anyone. The patterns are written target-neutral (a group noun is a slot), not as a list of targeted groups.
- **Different framing, the same line.** When the target holds power or a role (colonizers, settlers, occupiers), the reply first honors the harm and the anger, tells the system apart from the people in it, and then holds the line (card hist-04). When the target is a persecuted or marginalized group, the reply shows the record and the harm of the label (hist-02, hist-03). Removal of any group: hist-03. The harm-to-others stop (a call to kill) is unchanged and comes first.
- **Not a symmetry of facts.** The coach does not treat different histories as equal; it holds the same standard of language and the same refusal to justify mass violence. A system of occupation can be named for what it is (the text draft says so) while a settler is still not "vermin".
- **Must-not-count, again:** reporting ("he said we should be wiped out"), quoting propaganda, history, and a person naming what was done to them or their family.

## 5. What I recommend, in order
1. **Do not start the list from outside lists yet.** Send the three permission requests (Wiktionary needs none), because HurtLex and Weaponized Words need an answer from people, and Hatebase is gone. That is the slow step.
2. **Build the permissive base** (Wiktionary, LDNOOBW) with the script in the plan, recording source and licence per row, and look at how many of Venice's old rows each confirms (the old file was purged, so this means the new base only, with a reviewer filling gaps).
3. **Calibrate severity with a counselor and an advocate using the Rabat-style questions** (content, intent, call to act), not with a model's score.
4. **Build the ladder's levels 1 and 2** (acknowledge, challenge and educate) before level 3 (ending), because they cost less when wrong, and they use the cards. Level 3 waits until the false-alarm rate is measured.
5. **Add the denial-and-justification category** with its patterns and the history-and-violence rule once the wording is approved.
6. **The evaluation set first**: the boundaries multi-turn scripts plus the false-alarm cases, written before any list is loaded, so the list is judged by them.

## 6. Decisions for you
1. Send the permission requests (HurtLex authors, Weaponized Words) now, or wait for the new base?
2. Is the "challenge, not end" response right for justification and denial?
3. Who the counselor and the advocate are for calibrating severity.
4. Whether to read the Rabat questions and Stanton's stages as the written basis for the levels, with a reviewer checking the sources.
