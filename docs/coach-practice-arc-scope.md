# Scope: the coach as a practice for naming feelings and needs (a literacy tool, not a guesser)

Status (2026-11-10): **built, off by default** (`COACH_ARC=practice`). Decisions made by the owner the same day: the five jobs and their order are right; the coach offers a menu of words only after "I don't know"; the word panel opens on its own on the first exchange; this is built before the stances (it is a switch in `systemInstruction`, not yet a stance layer, and the stance work should take it over). Still open: the note to CNVC before any expanded list (lists are CNVC's unchanged for now); exchange 4's "guess what the other person needs" is written as optional. Built: `src/lib/practiceArc.ts`, `src/lib/feelingsNeeds.ts`, `src/coach/WordPanel.tsx`, wiring in `coach.mts` and `CoachDemo.tsx`, `tests/practice-arc.test.mts`. Not yet: the evaluation set run, the greeting line, the About answer. Related: `docs/coach-instructions-v2.md` (persona wording), `docs/coach-ai-directed-abuse-scope.md` and `docs/coach-lenses-scope.md` (the stance work due next, which this must fit under), `docs/learning-modules-scope.md`, `docs/learning-cards-scope.md`.

## The point, in the owner's words
Nenya is a **literacy-building tool**. Naming feelings and needs, **met or unmet**, is the skill being practiced, so the words must be front and center, and the person does the guessing. The coach is not there to guess for them: that is cognitive offloading, and it teaches the person to wait for the machine's words instead of finding their own.

## What the code does now (and why it pulls the other way)
- Every non-final reply is told: *"Reflect what you hear, **name the feeling or need underneath**, and stay with empathy first."* (`systemInstruction`, `netlify/functions/coach.mts`). The model names it, so the person never has to. The final reply is told the same ("name the feeling or need underneath").
- The page has no word lists. The only mention of feelings and needs is the placeholder text and the line under the box. A person who has no words ("I don't know what I feel") has nothing to pick from.
- Needs are only ever *unmet* in the coach's thinking; **met needs are never asked about**, so the person is not practicing the other half (what is already working, and which need that is).
- The five exchanges have a pacing rule (exchange 4 invites a last word, exchange 5 closes) but **no arc of practice**: nothing says what each exchange is for.
- The "answer a direct question first" rule (`detectDirectQuestion`) stays right for how-to questions and must stay; this scope is about the usual case, where someone describes a hard moment.

## Proposed arc (five exchanges, each with one job)
| Exchange | The coach's job | The person's job | On the page |
| --- | --- | --- | --- |
| **1. What happened** | Reflect, in their words and briefly, what happened (what could be seen or heard, apart from the story). Then ask for **one word for what they are feeling, and say a wrong guess is useful**. Do not name the feeling for them. | Say what happened; try a feeling word. | Feelings list open. |
| **2. Feeling** | Hand their word back and check it ("is *worried* closest, or nearer to *scared*?"), offering **at most one neighbouring word as a choice, never a verdict**. Then ask them to **guess the need underneath**. | Settle a feeling word; try a need. | Needs list opens. |
| **3. Needs, unmet and met** | Hold their guess as a guess ("does that fit?"). Ask **which need is not being met, and whether any need is being met here, even a little** (met needs are named too). | Name an unmet need; name a met one. | Both lists; chosen words kept in view. |
| **4. Request** (the "invite" exchange) | Ask for a request in their own words ("what would help, from you or from someone else?"), and help shape it; may ask them to **guess what the other person might need**, unless a lens says not to (see stances below). Close the exchange with the existing invitation for their last word. | A request; a guess about the other side if it fits. | Lists stay available. |
| **5. Close** (no question) | Say back **their own words only**: the feeling and need words they chose, which was unmet, which was met, and the request. **No new words.** End on a settled statement. Name the lists as something to keep practicing with. | Nothing; the page closes. | Summary of their words (not new content). |

### Rules for the coach (the parts that make it practice)
1. **They guess first.** The coach never names the feeling or need before the person has tried. Exception: the person asks, or says "I don't know" / "no idea" / "nothing" (then rule 2).
2. **Stuck is answered with a menu, not a verdict.** If they cannot find a word, offer **two or three** candidate words as choices ("it might be closer to *drained*, *numb*, or *overwhelmed*, or none of these"), never one word stated as fact. A wrong pick is fine to say out loud.
3. **Tentative, never told.** Guesses are questions ("does *safety* fit?"), never "you feel / you need". The person is the authority on their inner life.
4. **Met and unmet.** From exchange 3 the coach asks for both. Feelings are also linked to this: pleasant feelings often point to met needs, unpleasant to unmet; the coach can ask which it seems to be, without lecturing.
5. **Their words, not ours.** The coach uses the person's own words when handing things back; where a list word is nearer, it is offered as a choice.
6. **No lists in the reply.** The existing "avoid lists" rule stays. **The lists live on the page** (below), so the reply stays short and the person's eyes go to the words they can pick from.
7. **Direct questions and crises are unchanged.** A direct how-to question is still answered first; the distress, stop and abuse paths are unchanged, and in those the practice is **set aside** (nobody in distress is asked to find a need). The softened tier uses the existing care note only.
8. **Not a drill.** If the person only wants to be heard, the coach reflects and invites a word once; it does not insist. Declining is allowed and noted nowhere.

### Draft wording (to be edited by the owner; goes behind a switch)
Replaces, only when the switch is on, the sentence that begins *"Reflect what you hear, name the feeling or need underneath..."*:

> This conversation is practice at finding words for feelings and needs, and the person should do the finding. Do not name their feeling or need for them. In your first exchange, reflect briefly what happened in their own words, then invite them to try one word for what they are feeling, and say a guess that misses is still useful. In the next, hand their word back, check it against a near word as a choice, and ask them to guess the need underneath. Then ask which need is not being met, and which need is being met, even a little. Offer words only as two or three options when they say they are stuck, never as a verdict about them. Phrase every guess as a question. The page shows them word lists, so do not list words yourself. If they only want to be heard, reflect and invite once, without pushing.

Exchange-specific lines (appended by `turn`, in the same way `phase` is now):

> *Exchange 2:* Check their feeling word, then ask for a guess at the need underneath.
> *Exchange 3:* Ask which need is unmet and which is met. Keep their guess as a guess.
> *Exchange 4 (invite):* Ask for a request in their words and help shape it. In place of any other question, invite their last word.
> *Exchange 5 (close):* Say back only the feeling words, needs (unmet and met) and request the person chose, in their words. Add no new word. Do not ask anything.

## The word lists on the page (the other half)
- A **"Words for feelings and needs" panel** sits under the message box in the coaching window: a closed disclosure at first; **opens by itself** on exchange 1 (feelings) and exchange 2 (needs) when the coach has asked, and stays one click away after.
- **Feelings:** two groups (when needs are met / not met), each with sub-headings; **Needs:** the families (connection, autonomy, meaning, physical well-being, play, peace and so on). A search box ("type a few letters") for the person who knows part of the word.
- **Choosing a word puts it in their message box** as a phrase they can edit ("I might be feeling *worried*"), so they compose the sentence themselves; the click does not send anything. Chosen words are marked (`aria-pressed`) and listed above the box, so the arc has something to point back to.
- Entirely on the page: **no word list goes to the server and the coach is not told which words were picked** (the person's message carries them if they put them there). This keeps the privacy promise unchanged.
- Keyboard and screen-reader friendly (buttons, groups with labels, no hover-only content); works without color.
- **Source and credit:** the structure follows CNVC's Feelings and Needs Inventory, already credited on the About NVC page and in `ATTRIBUTIONS.md`. The panel shows the exact credit line CNVC asks for. CNVC's permission covers sharing and copying that document; an expanded or reworded list is an adaptation, so the note to CNVC (cnvc@cnvc.org, which I can draft; you send) should go before an expanded list ships. Until then the panel uses the inventory's own words, unchanged.
- **Other languages later**, as the categories file is already meant to be translatable (`docs/translation-scope.md`): the panel's data lives in one file per language.

## Where it fits with the stances
The arc is a **default stance** (practice), and the stance work should decide when it steps aside rather than this scope hard-coding it:
- Ordinary difficulty: practice arc.
- **Critique of the coach or of the method** (`target: 'nvc'`): answer the critique first; the arc resumes only if they want it.
- **AI-directed abuse / harming others** (lenses): no "guess the other person's needs" at exchange 4 when the other person is the one being hurt or the one harming; the lens decides. No drilling a person in danger.
- **Possible distress / stop:** no practice at all.
So implement the arc as a stance layer (`src/lib/stances.ts` / `stanceLayers`), not as more text in the base.

## What to build, in order (nothing yet)
1. **Instructions** behind `COACH_ARC=practice` (off by default; staging first), separate from `COACH_INSTRUCTIONS` so persona v2 and the arc can be compared one at a time. The signed `instructions` fingerprint follows the text, so transcripts show which wording was used.
2. **Checks without a model** (like `personaChecks.ts`): on exchanges 1 to 3, a reply must contain a question inviting their word and must not contain "you feel / you are feeling / you need" followed by a word as a statement; on exchange 5, no new feeling or need word that the person never wrote (checked against the page's word list); no list in the reply. Tests for these.
3. **A small evaluation set** (6 to 8 scenes: someone who names a feeling quickly, someone who says "I don't know", someone who only wants to vent, a direct how-to question, a critique, one at the edge of distress) run with the owner's token one group at a time, compared on "coach named it first" rate, "offered a menu when stuck" rate, and "closing used only their words" rate.
4. **The panel** (`src/coach/WordPanel.tsx` plus `src/lib/feelingsNeeds.ts` data), with a test that every word shown is in the credited list file and that picking one edits only the draft.
5. **Wording of the first greeting and the line under the box** so the page says what the practice is: "You do the naming; the coach asks, and the word lists are yours to use." (A site message, so it is signed like the others.)
6. **About and Terms:** one plain answer on the About page ("Why does the coach ask me for the words?"); the Terms need no change if nothing new is stored.

## Risks
- **A 7B model drifts back to naming for the person.** The rule is a wording instruction; only the checks and the evaluation show whether it holds. If it does not, the page can write the exchange's question itself (a fixed line after the reply, like the distress sentence).
- **Some people want to be heard, not drilled.** Rule 8 and the "only wants to be heard" line are there for that; read real replies for pushiness.
- **Vulnerable moments.** Asking someone in pain to find a word can feel like homework. The practice steps aside in distress; softer wording ("if a word comes") is worth testing.
- **List length** overwhelms. The panel must start collapsed by family and be searchable.
- **Five exchanges are short** for four jobs. The arc spends exchange 1 on listening plus an invitation; if that feels rushed, the tradeoff is to combine exchanges 2 and 3 or to raise the limit later (`MAX_TURNS` is one constant).

## Decisions for you
1. **The arc itself**: are these the right five jobs, in this order, and is "which need is being met" in exchange 3 where you want it?
2. **Whether the coach may ever name a word unprompted** (my draft: only as a menu of two or three after "I don't know", never first).
3. **The lists: CNVC's inventory unchanged for now**, with the note to CNVC drafted before any expansion. Agree?
4. **Whether the panel opens by itself** at exchanges 1 and 2, or stays closed until the person opens it.
5. **Exchange 4's "guess the other person's needs"**: keep, make optional, or leave to the stance work.
6. **Order of work**: stances first (as planned for tomorrow) then this arc as a layer, or this first.

## Added 2026-11-10: a first message that is only picked words
A real test transcript showed a first message made entirely of panel sentences ("I might be feeling apprehensive. I might need affection..."), and the coach repeated the words back and asked whether those were the words used. That is irritating. Now (on every instruction version, not only with the arc): `isWordsOnly` (in `src/lib/practiceArc.ts`) spots such a message, and the coach is told (`WORDS_ONLY_NOTE`) to thank them, say the words give something to work with, and offer in one invitation three ways on: tell a little of what is going on; think about what would be a helpful way to spend the time (a lead-in to the stances); or work out a request, for themselves or someone else. It may add the perspective-taking option (see `docs/coach-lenses-scope.md`) with a caution. It names no word itself. A check (`echoesWords`) flags a reply that repeats two or more of their words.
Exchange 4's "guess what the other person might need" is now an option they can decline, said with a caution (only if it feels okay; not excusing; no one owed understanding), not a hard rule against asking.
