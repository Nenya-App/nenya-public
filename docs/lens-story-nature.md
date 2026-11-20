# Nature and Story: the seventh and eighth lenses

Owner decision, 2026-11-19: Nature becomes the seventh lens and Story the eighth. This note records what was built and, for Story, the design choices the owner can adjust, because the owner had not defined Story beyond its name. **Everything below Story is a proposal, not an approved design.**

Both lenses sit behind their own switch, off by default in production, on for dev builds only:

| Switch | Lens | Also needs |
|---|---|---|
| `VITE_LENS_NATURE=on` | Nature, seventh | `VITE_LENS_TRAY=on` |
| `VITE_LENS_STORY=on` | Story, eighth | `VITE_LENS_TRAY=on` |

They are read as `import.meta.env?.VITE_X === 'on'`, set only in `netlify.toml [context.dev.environment]` and `.env.development`, and have rows in `docs/production-env.md` and a line in the README. With a switch off the lens is not in the tray, the welcome list, the About page, the report or a saved draft.

## How the lenses are counted

Nothing counts the lenses by hand any more. `LENS_ORDER` (src/lib/lensState.ts) lists every lens the code knows, in tray order; `activeLenses()` is the list a visitor can open now; `lensCountWord()` gives "six", "seven" or "eight" for copy. The tray (`trayLensCards()`), the welcome list (`lensSummaries()`), the quick navigation, the tour text, the PDF's opening sentence and the About page for the lenses all read these. The radial menu work can read `activeLenses()` and hold any number.

The soft limit of three is per list of words on one card, as for every lens, and does not depend on how many lenses there are. Daily totals (`lens.opened.<id>`, `lens.added.<id>`) accept both new ids; they are only counted where the lens is on.

## How they are built

Both follow the card-per-activity pattern of the other lenses. One component, `WordCardLensCards` (src/app/components/WordCardLens.tsx), runs both from a definition in src/lib/lensWordCards.ts:

- Each activity is its own card: a heading, one plain line saying what to do, the word bar (find a word, near words, Add, the lists to browse), the soft-limit warning before a fourth word, and a description box that fills in from the words chosen until the person types in it (`useAutoDescription`). "Fill it from my choices again" hands the box back.
- A last card shows the whole in a few words (also filled in from the choices, editable), one optional line about what the person would like, and Add this to my report / Put this down. If the lens is put down, the report says "Examined, not included".
- "Put this down" is in the header of every card, as on the other lenses. A new card moves focus to its heading. Back and Next with "Card n of N" are the shared `LensCardNav`.
- Nothing is a picture and nothing moves, so there is no text twin to keep: the lists, the chosen words and every box are already text. Reduced motion needs nothing because there is no motion. Colors are the site's own tokens, with no meaning carried by color.
- What is saved when a lens is added: `{ v: 1, words, texts, summary, wish }`, cleaned and length-capped on the way back in. The report lines are words and the person's own sentences only (what the coach hand-off also receives). Report sections are "Nature - The Natural World" and "Story - Narrative"; the coach hand-off accepts the section names Nature and Story.
- The tray shows the Material Symbols `park` (Nature) and `auto_stories` (Story), downloaded 2026-11-19 from the same source as the other six, credited in ATTRIBUTIONS.md.

## Nature

Four cards, as the owner named the word sets: **Plants and animals**, **Weather and climate**, **Landscapes**, **Physical properties** (materials and their qualities, such as stiff, translucent, brittle, flowing). Each card asks the same shape of question: "If how you feel were a living thing / a kind of weather / a place outdoors / a material, what would it be?" The word lists (49, 43, 34 and 49 words) are written fresh in src/lib/senseWords.ts, each word with a short plain description, none with a medical claim or a fixed meaning (tests/sense-words.test.mts checks this for all lists).

**Extension point for the ICARUS materials documents.** `MATERIALS_EXTENSION_GROUPS` in src/lib/senseWords.ts is an empty list that is appended to the Physical Properties lists. Adding groups of `n(term, description)` words there puts them in the word bar, the find box, the near words and the report with no other change. Nothing reads those documents; no private file was opened.

Choices to adjust: the cards ask only about the present (there is one optional "what would you like it to be like?" line on the last card, not a full present and wish pair as on Sight or Movement); and the order of the four cards.

## Story: the proposed design

**Idea.** A moment you could tell as a story. Four short cards say the parts of a story, and a last card says the whole in one line the person can change:

1. **Where and when** (35 words: places indoors, places outdoors, times of day and of life).
2. **Who is in it** (27 words: close to you, not so close, not quite here; "Just me" is first and is a full answer).
3. **What changes** (29 words: something arrives or leaves, something is said or done, something around changes; "Nothing changes" is included).
4. **How it ends** (30 words: how it settles, how it feels at the end, where it leaves you; "Unfinished" and "Left open" are included).
5. **Add:** the story in a few words, composed card by card ("Where and when: a kitchen and late at night. Who is in it: just me. What changes: a door opens. How it ends: quiet."), editable, plus an optional "How would you like it to end?".

**Why this shape, and why minimal.** It reuses the pattern the other lenses already use (word bar, auto description, one activity per card), asks for no writing, and makes every card skippable. It is a way of looking at one moment from outside, which is the same move as the other lenses (a color, a texture, a shape) with a different material. Choosing a setting, a cast, a turn and an ending gives a person something to look at, not something to be told.

**Low profile.** No claim of therapy or benefit anywhere in the cards, the About text or the report. The ask lines say "an unfinished story is fine" and "nothing changing is an answer too". The word lists include gentle words for people who are not here ("Someone far away", "Someone I miss") and no words about specific events or harm. The page does not interpret what is chosen. No satire.

**Open questions for the owner** (each is one edit in src/lib/lensWordCards.ts or the word lists):

- Should Story ask about now and wish, as most lenses do? It currently asks about one moment, with a wish only for the ending.
- Should the cast list stay as it is? It is the most sensitive list; shorter is safe, and it can be cut to "Just me, a friend, a stranger, a group, an animal" without changing anything else.
- Should the last card's one-line story be composed as labelled parts (as now, which never reads awkwardly) or as a sentence ("In a kitchen, late at night, ...")? Sentences read better and need more care for grammar.
- Is "Story" in the tray's list described as the owner wants? The one-line descriptions are in src/lib/gatewaySummaries.ts and src/app/components/pages/GatewaysPage.tsx.

## Not done

- The longer static About copy that says "six lenses" in prose (src/lib/aboutNenya.ts, the About eval corpus, the Terms draft wording, the human-centred design and bio-social essays, the coach and region notes) is unchanged: it is correct where the switches are off and says six where they are on. Parts that are built from the lens list (welcome page, quick navigation, tour, PDF opening, the Six Lenses About page) follow the switches.
- The Terms text (src/lib/legalDocument.ts) and docs/data-register.md describe lens totals "per lens" and need no new sentence, but the owner should look at whether Nature and Story need their own line before the switches go on in production.
- No browser check was made (owner's rule); the cards are checked by source tests and the build only.
- No ICARUS documents were read; the extension point is empty.
- Story's wording is a proposal; see the open questions above.
