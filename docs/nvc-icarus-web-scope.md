# Scoping: a web of connections between NVC ideas and the coach's lenses, moves and cards

Status: scoping, with the pure data and selector built and tested (2026-11-20, branch `claude/nvc-icarus-web`). **Nothing calls it**: no request path, page or switch uses it yet, so nothing a visitor sees has changed. This file describes structure only. No framework text, module wording, card wording or reasons are in the repository; they are in the owner's private folder. Related: `docs/coach-modules-scope.md` (modules, the moveset), `docs/learning-cards-scope.md`, `docs/coach-practice-arc-scope.md`, `docs/phrase-workbench-scope.md` (on its own branch).

## What it is for

The coach picks private modules by phrase matching (`src/lib/coachModules.ts`). That matching is flat: a phrase fires a module, a few rules suppress others. It cannot say that a message is *about* a particular NVC idea (a verdict dressed as a fact, a thought dressed as a feeling, a demand), that this idea means something different when a particular pattern is also present (someone who feels dismissed, someone with nothing left), or which one question and which short read fit. The web writes those connections down once, as small data, so that:

1. the server can add one **joined module** (an NVC idea and a lens in plain listening moves) and one **question kind** to the notes for a reply, on top of what phrase matching chose;
2. the page can choose which **learning card** to offer and which **word families** to open first for someone who says they are stuck;
3. a person reviewing the coach can see *why* something was suggested (a reason id) and fix one bad connection without rewriting code.

It never replaces the guards or the phrase matching. It adds to them, and it goes silent whenever they speak.

## Nodes

| Kind | What | How many | Where the ids come from |
|---|---|---|---|
| concept | An NVC idea: observation and evaluation, feeling and thought, need and strategy, request and demand, enemy image, protective use of force, choice and "have to", empathy, self-empathy, appreciation, honest expression, met needs | 12 | New. Each has a draft idea card already (`idea-01` to `idea-10`) except honest expression and met needs |
| lens | The sixteen lens modules (`reserves`, `care_depleted`, `legitimacy`, `harm_named_as_intended`, `inward_turn`, `split_values`, `recurrence`, `frozen_system`, `systemic_scale`, `pressure`, `over_smoothing`, `harm_named_as_unintended`, `unable_to_begin`, `backup`, `named_verdict`, `field_cost`) | 16 (+1 safety: `deep_fear_refer_out`) | `coachModules.ts` (a test checks the ids are exactly the module group) |
| move | The sixteen move modules, including `permission_giving` and `ask_one_question` from the moveset | 16 | `coachModules.ts` |
| join | A new private module joining one concept to one lens in plain listening moves. Chosen only through the web, never by a phrase of its own | 16 | New: `web_…` ids |
| question | The one question the coach may ask, as a kind (`q_camera`, `q_need_beneath`, `q_two_needs`, `q_met`, `q_request_room`, `q_smallest`, `q_who_shares`, `q_what_stung`, `q_cost_to_others`). Its wording is a short private module of the same id | 9 | New |
| card | Learning cards: the `idea-` drafts, two approved connection cards and the new draft series `web-01` to `web-09` | 21 | `learningCards.ts` ids plus new |
| core need | The seven needs under the coach's core | 7 | The core |
| need, feeling | The phrase workbench's own tiered families (category, family; the "not met" feeling families) | 22 + 11 | `needFamilies.ts`, `feelingFamilies.ts` (checked against them when those files are on the branch) |

137 nodes. The **communal-needs layer** (`src/lib/communalNeeds.ts`: six families of needs that belong to a group, such as fairness, a say together, shared safety and looking after what lasts) is this project's own extension, not CNVC's, and carries its own label (`COMMUNAL_LABEL`) wherever it is shown. It is a draft, untested on data and unread by a reviewer, so the selector returns its families only when the context switches it on (`communal`, off by default) and only to a person who has said they are stuck. CNVC's own stance, that its lists are neither exhaustive nor definitive, is the basis for extending the lists; the note to CNVC was sent 2026-11-20.

## Edges

Ten typed edges, 331 in all. Each carries a **reason id** and a **rank** (lower first). What a reason says is private.

| Edge | From -> to | What it is for |
|---|---|---|
| `joins` | concept, lens -> join | A joined module is suggested only when its concept **and** its lens both apply. This is the heart of the web |
| `pairs_with` | concept -> move | "This move suits this kind of talk" (for example a thought dressed as a feeling pairs with one tentative guess) |
| `holds_back` | lens, concept -> move, join, question, card | "Leave this out when the source applies." Copies of the existing suppress rules plus the web's own (rest only when depleted; no perspective-taking when harm is named as intended; no cross-examining first when someone says they are not believed) |
| `asks_question` | concept, lens -> question | "Ask this one question": at most one comes back |
| `offers_card` | concept, lens -> card | "Offer this short read", in rank order; the concept's own idea card first, then the web card that joins it to a pattern |
| `needs_at_stake` | lens -> core need | Which of the seven needs usually sit under a pattern, read as "often", never as a finding about a person |
| `maps_to` | core need -> need family | Which families on the page fit a core need |
| `often_feels` | lens -> feeling family | Which feeling families the page may open first |
| `often_under` | concept -> lens | A hint of where a kind of talk often sits, **for the review table only**: it never adds a lens to what the model reads |
| `neighbors` | concept -> concept | Ideas easily mixed up, so a neighbour's card may stand in when the first has none available |

The suppress rules are the part that must not drift: a test checks that the data holds back at least everything `SUPPRESS` holds back, and the selector reads `SUPPRESS` from the code directly as well, so a stale copy in the data can never let a held-back move through.

## Storage and reading

- **Data**: `src/lib/nvcWebData.ts`, ids and edges only, no sentence longer than an id. Small enough to read in one sitting and to diff.
- **Reasons**: a private table outside the repository (`nvc-web-edge-reasons-v0.1-DRAFT.md`), keyed by reason id. The repository never says why an edge exists.
- **Reader**: `src/lib/nvcWeb.ts`, pure. `webProblems()` checks the data is sound; `detectConcepts(userTexts)` finds the concepts the **latest** message touches by public phrase matching; `suggest(concepts, lenses, context)` returns ordered ids with reason ids and no numbers; `suggestFromText(userTexts, context)` runs the existing `selectModules` first and puts the web on top; `pageView(...)` is the only part the page may see; `notesIds(...)` is the only part the server may add to the notes.
- **A private set check**: `scripts/check-web-set.mts` (and `webSetProblems`) checks a private module set that carries the web's modules: every join and question has text, joins are 300 to 700 characters, a question kind up to 300 and carrying one question, no framework word in what the model is told, no unknown id, and the worst case under the 12,000 cap. Writes nothing.

## How it would drive selection (not yet wired)

**On the server, per reply**, after the guards and the existing selection:
1. If any guard has fired (crisis, softened tier, hostility, care, persona, boundary, lane, names, infrastructure, prompt, values) or the deep-fear module applies: the web adds nothing, and the reply is whatever the guard already decided.
2. Otherwise `suggestFromText` is called with the practice arc state. Its `notesIds` (at most one joined module and one question module) are appended to the notes after the modules phrase matching chose, subject to the same budget: the notes builder keeps its 9,000-character default and the function keeps its 12,000 cap. A module that does not fit is simply left out.
3. Moves from `pairs_with` are *advice for ranking* only in the first version: they are not added unless phrase matching already chose them. The web can reorder; it should not add moves until the review below shows it is right.
4. The existing "one question at most" check still runs after the model replies, so a reply that asks two is repaired as today.

**On the page**, `pageView` gives card ids and word-family ids. The learning-card offer rules (`learningOffer.ts`: never after a crisis flag, at most two offers, never the same card twice, never to someone reporting what was said to them) still decide whether an offer is made. The web only says *which* card fits; the model never sees a card, as today. Word families are suggested for opening first only when the person has said they cannot find a word, and the practice arc's own handling of "I don't know" stays in charge.

**With the practice arc on**, the web leaves out `guess_then_check` and `ask_one_question` (the arc's excluded modules) and suggests no question of its own: the arc has the **person** guess feelings and needs first and gives each exchange its own question.

## What stays out

- **No scores, no labels, no profile.** Output is ordered ids and reason ids. Nothing is counted per person, nothing is kept between messages (concepts come from the latest message; lenses from the conversation so far, as today), nothing is stored.
- **No diagnosis.** A lens is never stated as true of a person. `often_under` is a hint for a human reviewer and adds nothing to what the model reads. Intent is never read in: the two intent lenses fire only on the person's own words, as the code already requires.
- **Nothing a person sees names a lens or a framework term.** `pageView` returns only card ids and word-family ids; no join, question, move or lens id leaves the server. The private modules are checked for framework words. The cards use plain words, and where they use the site's own "pattern" they say it as an ordinary word.
- **No Check-in, no test, no score** anywhere: the web does not ask anything of anyone and shows nothing about them.
- **No copying.** The repository holds ids and selection logic only. Module wording, card wording and edge reasons stay private; the cards are written fresh with credit, and CNVC's categories are shown only with its exact credit line, with the communal layer named as this project's extension.
- **No new store, no upload.** The private drafts are local files.

## Finding and fixing a bad edge

1. **Tests** (`tests/nvc-web.test.mts`): the data is well formed; ids match the code's module groups; the data holds back at least what the code holds back; guards and safety silence the web; the arc's exclusions and `SUPPRESS` always win; nothing outside the known ids can be returned; cards are only built-in ones and never twice; no lens, move, join or question id reaches the page; no number in the output; with the workbench's lists on the branch, every family id exists.
2. **A review table** (private): every reason id, one line on what it says and what would make it wrong, and the sixteen joins as the thing to read first. When a coach reply looks wrong, run its text through `suggestFromText`, read the `because` ids, look them up, change one edge in one commit and add the message as a test.
3. **An evaluation run** before anything is wired: the private evaluation set (a direct question, a vent, a request for words, a verdict, an injection) with and without the joins, reading real replies for pushiness, diagnosis-by-implication and the coach naming something it should not.

## Risks

- **Over-reading a message.** Phrase matching misses and over-catches. A wrong concept costs a wrong join; the guard and `holds_back` rules limit the harm, and a join needs a lens as well. Start with the web advising only, logging what it would have added, and read the log.
- **A join that sounds like a diagnosis.** The wording is private and short, but a 7B-class model can still say "it sounds like your reserves are low". The check against framework words helps; the evaluation run is the real test.
- **Notes budget.** One join (about 300 to 500 characters) and one question (about 150 to 250) added to three modules: the worst case with the web is about 8,400 of 12,000, and under the builder's 9,000 default a module that does not fit is skipped. Keep joins short.
- **Pulling against the arc.** The arc wants the person to guess first. The web leaves its question out while the arc is on; check in the evaluation run that a join does not name a feeling or need for the person.
- **Hold-backs hide good help.** Under depleted reserves the web holds back almost every card and join. That is the intent (rest only), and it is a decision to confirm.
- **Drift.** The data copies the code's suppress table; the test catches a copy that says less. Concept phrases can drift from the module phrases, so the sample messages in the tests matter.
- **Rights and credit.** CNVC's credit line must appear wherever its categories are shown; the new cards that name need categories carry it. The pairing of ideas with patterns is this project's own and credited that way. Whether to credit the framework publicly is the owner's call.

## Build order (small separate commits)

Done on `claude/nvc-icarus-web`: (1) export the suppress table for a read-only test; (2) the data; (3) the loader, concept detector, selector and tests; (4) the private-set check and script; (5) this note and its index row.

Next, each its own commit and each behind a switch that is off by default (`COACH_WEB=on`, staging first), none before the owner decides:
6. Log-only: the server computes `suggestFromText` and records which ids it *would* have added (ids only, no text) in the counts. No change to replies.
7. Run the private evaluation set with and without joins; read real replies; fix edges.
8. Add `notesIds` to the notes behind the switch, one join and one question.
9. Page: offer a card from `pageView` through the existing offer rules, behind its own switch; open word families for the stuck person.
10. Add `patterns` to `SERIES` in `learningCards.ts`, build the approved web cards (only after review, never automatically).
11. A public plain-language page on how the connections work, with the credits, once the owner approves wording.

## Open questions for the owner

1. **The sixteen joins.** Read the join table in the private review file and strike any pairing that feels like a diagnosis of the person.
2. **Hold-backs under depleted reserves.** Is "no join, no question and no card except the two written for rest" the right strictness, or should one gentle card be allowed?
3. **The new series name.** The draft cards use `series: patterns`, which is not in `SERIES` yet, so they cannot load until it is added (one word). Is `patterns` the name, and may I add it in a separate commit?
4. **The communal-needs layer** (decided 2026-11-20: build it now). Drafted as six families in `communalNeeds.ts` from my own reading, since your research was not to hand. Please read the words and strike or replace any, and say whether the label wording is yours.
5. **Moves from the web.** Should the web ever add a move that phrase matching did not choose, or only reorder?
6. **Concept phrases.** The detector is deliberately narrow. Do you want a wider list tuned on the private evaluation set, which means reading real messages?
7. **Credit for the framework.** The cards pair an NVC idea with a pattern and say the pairing is this project's own. Do you want the framework named in the card credits, and in whose wording?
8. **Which cards get approved first,** and who reads them (the trainer, a counselor). Nothing here is marked approved.
9. **Wiring order.** Log-only first as proposed, or go straight to the evaluation run?

## Not verified

- No real conversation was run: concept detection and every join are untested on data, and the wording is untested on a model.
- The card sources were not checked against the book; the need categories on the cards follow CNVC's inventory and show its credit line, but the source address on each card is the book's store page already used by `idea-02`, not a page confirmed for this purpose.
- The feeling and need family ids were checked against the workbench branch's two files by copying them in temporarily; this branch does not contain them, so the cross-check test runs only once that branch is merged (by the owner).
- Browser behaviour was not checked: nothing on the page changed.
