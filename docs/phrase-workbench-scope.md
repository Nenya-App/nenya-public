# Phrase workbench (scope, draft for the owner, 2026-11-20)

Status: **scoped 2026-11-20; being built the same day** behind `VITE_PHRASE_WORKBENCH` (off by default), following section 9, with the owner's decisions recorded under "Decisions taken" at the end. Where an earlier section disagrees with "Decisions taken", the decisions win. Related: `docs/coach-practice-arc-scope.md` (the person guesses first), `docs/word-help-scope.md` (on-device word help, optional online lookup), `docs/learning-modules-scope.md` (the plain modules), `src/lib/feelingsNeeds.ts`, `src/lib/wordHelp.ts`, `src/coach/WordPanel.tsx`, `src/app/components/WordPicker.tsx`, and the coach's moves in plain words (`docs/coach-moves.md`, on branch `claude/coach-moveset`, read from git, not merged). A sibling session scopes a possible two-person rephrasing flow; **this document does not design that.** It only keeps the data model clean enough to be reused.

## The idea in one paragraph
The person types or pastes a sentence (a thing they said, were told, or want to say). It becomes a row of tappable word chips, like a grammar-annotation sheet. They mark parts of it themselves: this is what I saw or heard, this is a story about it, this is a feeling, this passes as a feeling but is a thought, this is a need, this is a strategy, this is a request, this is a demand. Need chips can carry a met-to-unmet slider. Then, if they like, a mad-libs frame ("When I see ___, I feel ___, because I need ___. Would you be willing to ___?") takes the marked words into its slots and shows both versions side by side. It is a bench for handling language and concepts, not a quiz. **The app suggests nothing unless asked, and never says a mark is wrong.**

## What already exists, and what can be reused
| Piece | Where | Reuse |
| --- | --- | --- |
| Seven CNVC need families and the feeling families (met and unmet), with `wordsOf`, `filterGroups`, `phraseFor` | `src/lib/feelingsNeeds.ts` | `wordsOf` and the family names are the lookup for "is this word on our list". `phraseFor` and `addWordToDraft` are for the coach box and are **not** reused. The lists stay CNVC's unchanged until the note to CNVC is sent (practice-arc scope). Our own richer list (below) sits beside them. |
| Pure helpers: `cleanLookupWord`, `localNearWords`, `parseDatamuse`, `parseDictionary`, `WORD_HELP_COPY`, `wordHelpOn` | `src/lib/wordHelp.ts` | Reused as is for "near words" and the optional online step. Note `FAMILIES` there is a small hand-made list of feeling, texture and motion words; the workbench needs its own, larger, feelings-and-needs near-word table (below). |
| Group pills, chips with `aria-pressed`, search, soft pointer to the missing piece, credit line | `src/coach/WordPanel.tsx` | Visual and behavioural patterns (chips are buttons; one group open at a time; plain credit). The component itself is coach-specific (it writes into the message box); the workbench gets its own component. |
| Find box, near words from this device, per-press online look-up, `OnlineLookup`, `TermInfo` | `src/app/components/WordPicker.tsx` | `OnlineLookup` and the "Near words (from this device, nothing sent)" pattern are reused directly. `TermInfo` is the model for the short definition popover. |
| Relay design (allow-listed host, one word, no logging, `WORD_HELP_ENABLED`) | `docs/word-help-scope.md` layer 3 | Reused unchanged. The workbench adds **no new network path**. |
| The arc and its rules (they guess first; tentative; met and unmet; their words, not ours; not a drill) | `docs/coach-practice-arc-scope.md` | These are the design rules of the workbench too. |
| The coach's moves (reflecting, naming the need, words they could say, boundaries, practising the first sentence) | `docs/coach-moves.md` (branch `claude/coach-moveset`) | "Words they could say" and "naming the need underneath" are what the workbench lets a person do by hand. The workbench uses the same shape of care: a request someone can say yes or no to; the person changes the words until they sound like themselves. Nothing from it is copied. |
| Communal-needs layer | `docs/coach-moves.md` | If the personal-and-communal split is shown, it is labelled as **a project extension, not CNVC's**. |

## 1. The interaction

### 1.1 The sentence becomes chips
- A text box ("Type or paste a sentence"; up to 400 characters) and **Make it markable**. Words become chips; punctuation sits between them and is not markable. A short phrase can be marked as a unit: tap a word, then "Extend to the next word" (a button, not a drag), or use the "Mark the whole sentence" button for a mark that covers everything (useful for "a story", "a demand").
- Chips are real buttons in a normal reading order. The sentence stays readable as a sentence (the chips are inline and wrap), and a plain-text copy of the sentence is always shown above for reading in one go.
- Selecting a chip (tap, Enter or Space) opens a small **Mark panel** under the sentence (not a popover that covers it) with the marks as a labelled list of buttons. Choosing a mark applies it to the selected word or phrase. A word can carry **more than one mark**, and "Not sure" and "Leave unmarked" are always there. Marking is optional for every word.

### 1.2 Which marks
Proposed: **eight marks, grouped in four plain families, not more than eight on the screen at once.**

| Family | Mark | Plain description shown with it |
| --- | --- | --- |
| What happened | **Saw or heard** | Something a camera or recorder would catch. |
| | **A story** | A reading of it: why, what it means, what someone is like. |
| Inside me | **A feeling** | A sensation or emotion in me. |
| | **A thought, passing as a feeling** | It starts with "I feel that…" or "I feel like…", or names what someone did to me. |
| | **A need** | Something I value or lack, not tied to one person or one way. |
| Going forward | **A way to meet it** (a strategy) | A particular action, time, person or thing. |
| | **A request** | Something someone could say yes or no to. |
| | **A demand** | Only a yes is acceptable. |

**Whether to offer exactly these or fewer.** The eight carry the whole arc and the owner's list; fewer would merge things the practice depends on (a thought passing as a feeling; a request versus a demand). My recommendation: **offer all eight, but behind a staged reveal:** first screen shows **four** (Saw or heard, A feeling, A need, A request), plus "More marks" which opens the other four (A story, A thought passing as a feeling, A way to meet it, A demand). This keeps the first step short and teaches the four-part shape the arc already uses, and lets the longer set be learned later. A setting "Always show all eight" is remembered on this device only. Open question 1 below asks the owner to confirm.

**Wording rules for the marks.** None is "wrong" or "right". The thought-passing-as-a-feeling mark is described as a **kind of sentence**, never a mistake ("this is a thought about what happened, and that is useful too"). The words "good", "bad", "correct", "mistake", "error", "should", "fix" do not appear anywhere on the screen. No red, no cross, no score. A mark the person has made is shown in their own terms back to them.

### 1.3 Sliders on need chips (optional)
- Only a chip marked **A need** can get a slider, and only if the person turns on "Add a met-to-unmet slider". It is never added by itself.
- **Native `<input type="range">`** with `min=0 max=6 step=1`, labelled "How much is this need met, right now, here?", with end labels "Not met at all" and "Fully met" and a spoken value through `aria-valuetext` ("Mostly met, 5 of 6"; or "Not marked yet" until touched). The seven positions have **plain names**, shown on screen: Not at all, A little, Some, About half, Mostly, Almost fully, Fully. The **mid-point does not mean "fine"**, and the slider starts **unset** (a "Not marked yet" state) rather than at a default, so leaving it alone says nothing.
- **Stepped alternative (not a different control for different people; shown to everyone):** a row of seven buttons (a radio group) with the same seven names. Changing either updates the other. This is also what a screen reader or switch user can take if a range control is awkward. A "Clear" button returns it to unmarked.
- **No numbers shown** (no "5/7"), no totals, no average across needs, no colour ramp. The slider is a place to put a mark, not a measurement. There is no "overall" slider.
- An optional second line: "Whose need is it?" (me, the other person, both of us, a group). The group value is the **project extension** (not CNVC's) and is shown with that note. Not in the first build (open question 4).

### 1.4 Mad-libs frames as slots
Frames are sentences with named slots, like grammar-annotation templates. The first set (names are drafts):
1. **Four parts:** *When I (saw or heard) ___, I felt ___, because I need ___. Would you be willing to ___?*
2. **Need first:** *I really want ___ (a need). Right now I notice ___ (saw or heard). I feel ___.*
3. **Request only:** *Would you be willing to ___ ? It's okay if the answer is no.*
4. **A story, set down:** *The story I am telling myself is ___. What I actually saw or heard is ___.* (A sorting frame, not a rewrite.)

How it works:
- Each slot has a name and the mark it takes ("saw or heard", "a feeling"…). Slots start **empty**.
- **Move words from the sentence into the slots:** each slot has a button **"Take from my sentence"** listing only the words or phrases the person marked with that mark (as a labelled list), and the person picks one, or types their own into the slot. A slot can also be filled by typing alone. No drag and drop.
- If nothing in the sentence carries the slot's mark, the slot says "Nothing marked as a feeling yet. You can type one, or go back and mark one." (No suggestion of a word.)
- **Both versions, side by side** (stacked on a phone): "Your sentence" (the original, with mark labels shown inline as words, e.g. `[feeling]`), and "In the frame" (the sentence completed from the slots). Empty slots read as a blank line in the frame text, "___". Nothing is graded; if the frame sentence reads oddly, that is shown as is.
- A "Copy" button copies the frame text. No part of this is sent anywhere.
- A frame is just a template: our list of frames lives in data, so new frames add without code (and a sibling flow could reuse the data).

### 1.5 Words on request
Strictly in this order, each only when asked:
1. **A short plain definition**, written by us (grade 5 to 8) for the core feeling and need words (the CNVC family names and the words in our expanded list). Shown inline in the Mark panel as "What does this word mean?" for a chip whose word is in the list. The definition says what the word is **close to and different from** (for example, *lonely* and *alone*), so it clarifies senses rather than prescribing a use.
2. **Near words** from this device (`localNearWords`-style, but from the feelings-and-needs table), shown only after the person presses "Show near words". Never added by themselves. Always presented as "words nearby, some closer, some further", never as corrections.
3. **The general dictionary and thesaurus, as a second step**: the existing optional per-press online look-up (`OnlineLookup`, behind `VITE_WORD_HELP` and the server switch `WORD_HELP_ENABLED`), showing only one word at a time, with the same disclosure line about exactly what is sent. A dictionary meaning is displayed under a heading **"A general dictionary's meaning (it may not fit this use)"** with the first sense only, because dictionary senses are not about feelings and needs and can mislead (the feeling sense of *blue*, *heavy*, *cold*). This step is not shown at all unless the lookup is switched on.
4. **Not in a word list?** The person's own word is always allowed. A word not on our lists is not flagged; the marks apply to any word.

## 2. How the seven categories open into specific needs
- The **seven CNVC categories** (Physical wellbeing, Connection, Honesty, Play, Peace, Autonomy, Meaning) are what a person sees first when marking **A need**, as a short list of seven buttons (the "short scale"), with a plain one-line meaning each. **Nothing more is shown by default.**
- Choosing a category **sets the mark's detail to that category** ("a need: Connection"). The chip now reads as a need in Connection. This is a valid, finished mark.
- A button **"Open this into specific needs"** lists the words in that category (from our expanded list for Connection etc.). Choosing one narrows the mark ("a need: Connection, to be understood"). A button **"Closer to something else?"** shows the other six families, and a text box allows "my own word".
- If the chip's own word is already in a list, the matching category is shown **as a fact beside the word, only after the person marks it a need** ("Your word, *respect*, sits in Connection on our list. Does that fit?"), as a question with "Yes", "Not quite", "Leave it". Never before they have chosen a mark.
- **Feelings** work the same way with a shorter scale first: *When a need seems met* and *When a need seems not met* as the two top-level choices, then the families (Afraid, Angry, Sad…), then the specific word, never required.
- **Our own, richer list** (the owner does not need CNVC's list). Design: each category has a plain description (one line), and a larger and more nuanced set of specific words grouped under **families of three to six words** (for example Connection: *being understood*, *belonging*, *closeness*, *respect*, *trust*), so the screen shows one sub-family at a time, never 70 words at once. A word may sit in two families. Words are authored fresh, in grade 5 to 8 English, with one short definition each. Until the note to CNVC is sent, the **default** data source for the first build is CNVC's unchanged lists for the family names and the existing words, and our own words are a separate file that can be shown separately (see open question 3).
- **Credit.** Wherever the seven categories or any CNVC-derived word appears: "The Center for Nonviolent Communication © 2023, www.CNVC.org". It is a nod as the owner said: the footer of the workbench says the seven categories follow the inventory and that our fuller word list and the definitions are this site's own. **The communal-needs layer, where used, is shown as a project extension, not CNVC's.**

## 3. The pure module and data model
Everything that can be pure is pure: no DOM, no network, no timers, no randomness, no `Date`. React is a thin shell.

**`src/lib/phraseWorkbench.ts`** (pure, no imports from React; imports only `feelingsNeeds.ts` for family names, and `wordHelp.ts`'s `cleanLookupWord`):

```ts
export type MarkKind =
  | 'saw-heard' | 'story' | 'feeling' | 'thought-as-feeling'
  | 'need' | 'strategy' | 'request' | 'demand';

export interface Token { id: number; text: string; start: number; end: number; markable: boolean } // punctuation is not markable
export interface Mark {
  id: number;
  kind: MarkKind;
  from: number; to: number;          // token ids, inclusive, contiguous; a phrase is a range
  detail?: { family?: string; word?: string; custom?: string };  // the person's choice only
  level?: 0|1|2|3|4|5|6;             // met-to-unmet, need marks only; absent = not marked yet
  whose?: 'me' | 'other' | 'both' | 'group';                     // later (open question 4)
}
export interface Workbench { sentence: string; marks: Mark[] }  // the whole state; tokens are derived

export function tokenize(sentence: string): Token[]
export function addMark(w: Workbench, m: Omit<Mark,'id'>): Workbench          // never throws; overlapping marks of different kinds allowed
export function removeMark(w: Workbench, id: number): Workbench
export function setLevel(w: Workbench, id: number, level: number | null): Workbench
export function marksFor(w: Workbench, tokenId: number): Mark[]
export function textOf(w: Workbench, m: Mark): string                          // the words under a mark, as typed
export function labelFor(kind: MarkKind): { name: string; plain: string }       // the plain wording
export function levelName(level: number | null): string                         // 'Not marked yet', 'A little', …
export function fillFrame(frame: Frame, picks: Record<string, string>): { text: string; blanks: string[] }
export function slotChoices(w: Workbench, slot: Slot): { markId: number; text: string }[]   // only what the person marked
export function annotated(w: Workbench): string                                  // the sentence with [label] after each marked part, as plain text, for reading aloud and for copy
export function serialize(w: Workbench): string | null                           // JSON, version-tagged, size-checked
export function parse(raw: unknown): Workbench | null                            // validates everything, drops what does not fit
```

Static data (separate files so the owner can edit words without touching code):
- `src/lib/workbenchFrames.ts`: the frames (`id`, `title`, `parts: (string | { slot: string; takes: MarkKind; label: string })[]`).
- `src/lib/needFamilies.ts`: the seven categories, their plain lines, our sub-families and words (each with a one-line definition), and a `communal` flag for the project-extension layer.
- `src/lib/feelingFamilies.ts`: feeling families with definitions.
- `src/lib/nearWords.ts`: a feelings-and-needs near-word table (grade 5 to 8, reviewed for no judgments or slurs; the existing slur-list work applies), separate from `wordHelp.ts`'s `FAMILIES`.

**No scoring function exists.** Not `average`, not `total`, not `count by kind` shown to the person. (An internal count is fine in a test, but there is no code path that puts a count of marks on screen as an achievement.)

## 4. What is stored
- **By default: nothing.** The sentence and marks live in memory for the visit. They are not written to storage, not sent, not logged, not in the URL. Closing the tab clears them. The page says so in one line.
- **"Remember on this device" (off by default, a switch the person turns on, with a visible "Forget" button next to it):** stores one record in this browser's `localStorage`, as the other device-memory items do (see `docs/device-memory.md` and `docs/data-register.md`; the integrating session adds the data-register row): the **sentence, the marks, the levels, and the chosen frame's slot text** (all the person's own). **Not stored:** timestamps, a history of past sentences (only the latest one, replaced each time), counts, any "streak", anything about how often the tool was used. It would be added to the device-memory page's list of things that can be cleared, and to "Delete everything on this device".
- **Never stored or sent:** the sentence is never sent to the coach, to the server, to a look-up (only the one word they press "look up" on goes, as in `word-help-scope.md`), or to a report. The coach is not told which words were marked (same rule as `WordPanel`).
- **A sentence about another person** is the person's own text, on their own device. The reminder under the box: "Text stays on this device. It is not sent anywhere." (Written so a person pasting a message from someone else is not misled: nothing leaves.)
- **Paste and the data hygiene rules:** the sentence field uses the same input limits and the "no names of others" gentle hint as other free-text fields (`docs/pii-names-scope.md`), but nothing is sent, so the hint is a courtesy, not a block.

## 5. Accessibility (WCAG 2.2 AAA is the standing goal)
- **Tap or key to mark. No drag selection anywhere** (2.5.7 Dragging Movements; the AAA goal means we avoid pointer-path dependence altogether). Extending a mark to a neighbouring word is a button. Frames take words by "Take from my sentence" buttons, not drag and drop.
- **Targets:** every control is at least 44 by 44 CSS pixels (2.5.5 Target Size, AAA), with spacing between chips. Chips wrap; they do not need horizontal scrolling at 320 CSS pixels or at 400% zoom (1.4.10 Reflow).
- **Marks are shown by label or shape, never colour alone** (1.4.1). Each mark has a **text tag** attached to the chip ("feeling"), a **distinct underline or border shape** (solid, dashed, dotted, double, wavy and so on, with the shape set documented), and an accessible name ("sorry, a feeling"). A mark colour, if used at all, is a tint that adds nothing the label does not already say. A "Show marks as words" view puts each label in brackets inline.
- **Contrast:** AAA text contrast (7:1 for text, 4.5:1 for large text; 3:1 for non-text mark shapes), in both light and dark.
- **Announced:** a polite live region says "Marked ‘tired’ as a feeling." and "Removed the mark from ‘tired’." and the slider's spoken value. Not "Correct", never a verdict. Focus stays on the chip after marking, and goes to the Mark panel when it opens; Escape closes the panel and returns focus to the chip. The announcement does not repeat itself.
- **Structure:** the chips are a `<ul>`/`<li>` list inside a labelled group; marks on a chip are in its accessible description; a **marks summary list** ("Your marks: 'when you left the dishes' as saw or heard…") is a real list, below the sentence, one item per mark, each with a Remove button.
- **Sliders:** native range inputs (a keyboard works with arrows, Home, End, Page Up and Down), `aria-valuetext` spoken, visible label, visible value name (not a number), and the stepped radio-group alternative next to it. They are not hidden behind a "reduce motion" or "simple mode" switch because the stepped row is simply always there.
- **No time limits, no auto-advance**, no motion beyond a short fade that `prefers-reduced-motion` turns off (2.2.3 No Timing, 2.3.3 Animation from Interactions).
- **Reading level:** the workbench's copy is grade 5 to 8 (`readingLevel.ts` checks it); definitions likewise. Unusual words get a definition (3.1.3 Unusual Words, AAA); abbreviations are expanded (3.1.4). English only for now (no machine translation); every foreign word shown carries `lang`.
- **Help is always there** (3.2.6 Consistent Help; AAA: context-sensitive help 3.3.5): each mark has its plain description, each frame has a one-line note.
- **Errors** (3.3.1, 3.3.3): there are almost no errors possible. The one is a sentence that is too long; it says how many characters over, in plain words, without red.
- Add the workbench to `docs/accessibility-testing-list.md` and the static a11y test (`tests/a11y-static.test.mts`).

## 6. How it joins the coach and the practice arc without the app naming anything first
- **It is a separate place on the site** (a page under Feelings and needs, linked from the practice description), not part of the coach conversation. It is **optional** and it does not appear in the arc as a required step.
- **The person marks everything first.** The workbench has no "suggest marks", no auto-detect, no highlighted likely feelings. It shows no word as a candidate until the person presses "Show near words" on one chip or opens a category. This follows rules 1, 2 and 5 of the arc ("they guess first", "stuck is answered with a menu, not a verdict", "their words, not ours").
- **A way in from the coach, if wanted later:** the coach may *mention* the workbench as one of the ways to keep practising ("If you would like to take a sentence apart yourself, there is a page for it"), only when the person asks how to practise or says the words are hard, and **never** passes any of their sentence to it. The link carries nothing (no query string). This is a stance-layer matter (`src/lib/stances.ts`), and a line to add to the closing exchange text at most; not in the first build.
- **A way out to the coach:** the person can copy the frame sentence and paste it into the coach box themselves. That is the only bridge.
- **The practice arc's rules apply on the page:** tentative wording ("might", "does this fit?"), met and unmet both available, no drilling, declining always allowed and recorded nowhere.
- **Stances:** where the stance work says the practice steps aside (distress, abuse), the workbench is simply not offered by the coach. It has no state that the coach reads.
- **Words the coach uses:** the coach's wording uses "lens" and "Pattern" only where the site does; the workbench's own page uses the site's plain terms and does not name any coach or source of the method.

## 7. Risks
| Risk | Why it matters | Design answer |
| --- | --- | --- |
| **Feeling corrected** | A person pastes something painful and the tool seems to label their sentence wrong | No red, no "wrong"; the mark names are descriptions of kinds of sentence; "Not sure" and unmarked are always fine; a "thought passing as a feeling" is presented as useful, not as a mistake; no tool-made marks. A copy review with the owner for every word on the screen. |
| **Over-labelling** | Eight marks on every word can make a person talk like a form, or lose the sentence | Staged reveal (four first); marks optional; a word can stay bare; a "Clear all marks" button; the plain sentence always visible. |
| **Dictionary senses misleading** | A dictionary's first sense is often not the feeling sense | Our own plain definition comes first; the dictionary only on a second press, labelled "may not fit this use", first sense only; no auto-selection of a word from a dictionary. |
| **Looking like a test** | Marks that read as answers invite scoring; sliders look like measurement | No scores, totals, trends, streaks or timestamps anywhere (the Check-in was dropped until validated instruments exist). Sliders have names, no numbers, start unset, no overall. No "your results". The page says what it is: "a bench for working with words, not a test". No stored history. |
| **Pasting another person's message** | The person may be analysing someone else's words, and the tool might look like it is judging that person | Marks are described as "how I am reading it", not "what they meant"; the text stays on the device; the page's one line says marking another person's words is a guess about them. A careful wording note on "a story". |
| **A heavy sentence at a bad moment** | Parsing a painful sentence into marks can be too much | A short "You can stop at any time; nothing is kept" line; the coach's distress path does not point to the workbench; no required step; an easy "Clear and start over". |
| **A list read as the correct list** | Our words (or CNVC's) read as a complete, official vocabulary | The credit line and "a starting point, not a complete list"; "my own word" is always available. |
| **Hidden collection** | A sentence about a person is sensitive | Nothing stored by default; nothing sent; the opt-in memory is the latest sentence only and has a Forget button. |

## 8. Tests to write (`tests/phrase-workbench.test.mts`, plus data checks)
- `tokenize`: words, punctuation not markable, contractions and hyphens as one word, empty and over-long input, emoji, non-Latin text does not throw.
- `addMark` / `removeMark` / `marksFor`: ranges, overlapping marks of different kinds, the same kind twice on one word, ids stay stable, out-of-range ids ignored, no mutation of the input.
- `setLevel`: only for need marks; clamps to 0..6; `null` clears; `levelName` has all seven names and "Not marked yet".
- `fillFrame` and `slotChoices`: empty slots stay blank and are reported in `blanks`; a slot lists only words carrying its mark; a typed word fills a slot without any mark; text with `{}` or markup characters does not break the frame.
- `annotated`: labels in brackets, in sentence order, stable.
- `serialize` / `parse`: round trip; version tag; size limit; unknown keys dropped; out-of-range marks dropped; hostile JSON (prototype pollution keys, huge arrays) returns `null` or a clean subset.
- **Wording tests:** none of "wrong", "incorrect", "mistake", "error", "bad", "good", "correct", "score", "result", "should", "fix" appears in any user-facing string in the workbench's copy file (so a later edit cannot add it); no color names used as the only mark text; every mark has a label, a description and a shape.
- **No-score test:** the module exports no function named like `score`, `total`, `average`, `progress`, `streak`, and the stored record has no timestamp or counter field.
- **Data tests:** every need and feeling word has a definition under a length limit and at grade 8 or below (`readingLevel.ts`); no word appears under two different categories by accident (explicit allow-list for words in two); every sub-family has 4 to 8 words; every near-word is in the table once per family; words are screened by the slur and harm list.
- **Credit test:** the CNVC credit line is exactly "The Center for Nonviolent Communication © 2023, www.CNVC.org" wherever the seven categories appear, and the communal layer, where it exists, carries the "project extension, not CNVC's" note.
- **Network test:** the module imports nothing that fetches; a static test that the workbench page makes no request until a look-up press (same pattern as the other word-help tests).
- **A11y static tests:** buttons for chips, native range input with `aria-valuetext`, the stepped alternative present, live region present, no `draggable`, no pointer-only handlers, all targets have the size class.
- **Storage test:** nothing is written unless the switch is on; the Forget button removes the key; "Delete everything on this device" includes it.

## 9. Build order (small, separate commits)
1. **Data and wording, no UI:** `needFamilies.ts`, `feelingFamilies.ts` (the seven categories with plain lines and definitions; our expanded list as a separate file), the copy file with the banned-words test. Owner reviews the words.
2. **Pure core:** `phraseWorkbench.ts` (`tokenize`, marks, levels, `annotated`) with its tests.
3. **Frames:** `workbenchFrames.ts`, `fillFrame`, `slotChoices` with tests.
4. **Page, marking only:** sentence box, chips, Mark panel (four marks, then "More marks"), live announcements, marks summary. Static a11y tests.
5. **Need detail and sliders:** the seven categories opening into specific needs; the slider and its stepped alternative.
6. **Mad-libs frames** with the side-by-side view and Copy.
7. **Words on request:** plain definitions, near words (device), then the existing `OnlineLookup` as a second step (if the switch is on).
8. **Remember on this device** (off by default) with Forget, device-memory page, data-register row, Terms check (the integrating session).
9. **Doors:** the link from the practice description and the optional coach mention (stance layer), About answer, `docs/accessibility-testing-list.md` rows.
Each commit builds and passes `node tests/run.mjs`.

## 10. Open questions for the owner
1. **Marks:** all eight with a four-first reveal (my recommendation), or only four, or a different split? Are the eight names right (especially "A thought, passing as a feeling" and "A way to meet it")?
2. **Slider scale:** seven named steps (Not at all to Fully) with no numbers shown. Seven, five or nine? Does "right, now, here" fit, or should the slider's question be the person's to word?
3. **Word list:** may the first build use CNVC's lists unchanged for the seven categories and the existing words, with our own sub-families and words in a separate file, shown **only after** the note to CNVC is sent? Or do you want our own list alone from the start (the seven category names are CNVC's structure; the words would be ours)?
4. **Communal needs:** show "whose need" (me, them, both, a group) in the first build, or leave it out until it has been tested? If shown, it carries the "project extension, not CNVC's" note.
5. **Pasting another person's message:** allow it, with the "how I am reading it" wording (my recommendation), or advise typing only your own words?
6. **Remember on this device:** worth building at all, given nothing is stored by default? If yes, latest sentence only (my recommendation)?
7. **Where it lives:** a page under Feelings and needs, or inside the coach's word panel as a second tab, or a lens-style entry? (My recommendation: its own page; the coach panel stays small.)
8. **Online look-up:** include the second-step general dictionary at all, given the sense problem, or on-device only for this tool?
9. **Definitions:** who writes and reviews the plain definitions (the owner, as with the other word lists)?
10. **Naming:** "Phrase workbench" is a working title. What would the site call it, in its own words?
11. **Sibling flow:** the data model keeps marks and frames separate from the page so a two-person flow could reuse them. Nothing here designs that.

## Credit
The seven categories of needs and the feeling families follow the Feelings and Needs Inventory, **The Center for Nonviolent Communication © 2023, www.CNVC.org**. The inventory's lists are CNVC's. This site's fuller words, the plain definitions, the marks and the frames are this project's own. The communal-needs layer, where used, is an extension by this project and is not CNVC's.

## Decisions taken (2026-11-20)
The owner asked for the whole workbench to be built now, taking my recommendation for every open question, and the most conservative, privacy-preserving option where there was none. One question was answered directly by the owner.
1. **Marks:** all eight, with four shown first (Saw or heard, A feeling, A need, A request) and "More marks" for the other four. My recommendation.
2. **Slider:** seven named steps, no numbers shown, starting unmarked, with a stepped row of buttons beside it. My recommendation.
3. **Word list (answered by the owner):** our **own** feelings and needs lists, written fresh by us: seven categories, then families of three to six words, then words, each with a plain meaning (grade 5 to 8). They replace CNVC's lists for this tool. CNVC's inventory is not bundled or copied. The page links to CNVC's own page (https://www.cnvc.org/store/feelings-and-needs-inventory) and gives the credit exactly: "The Center for Nonviolent Communication © 2023, www.CNVC.org". The seven category names follow the inventory's structure, which the credit acknowledges. The note to CNVC is the owner's to send; the build does not wait for it.
4. **Whose need / communal layer:** left out of this build (my recommendation: not until tested). The footer says that a layer for the needs of groups, if added later, will be this project's extension and not CNVC's.
5. **Pasting someone else's message:** allowed, with the "a mark is how you are reading it, a guess about them" wording. My recommendation.
6. **Remember on this device:** built, **off by default**, latest sentence and marks only, no timestamps or counts, with a Forget button, and removed by "Forget me". My recommendation. It needs the Terms and register text in `docs/drafts/terms-phrase-workbench-draft.md` before the switch is turned on.
7. **Where it lives:** its own page at `/phrases`, linked from the coach's word panel by a plain link that carries nothing. My recommendation.
8. **Online dictionary:** **not included** in this build. There was no recommendation, so the privacy-preserving option stands: on-device meanings and near words only, nothing sent. The existing `OnlineLookup` can be added later as a second step without changing the data model.
9. **Definitions:** written by us in this build. The owner reviews them before the switch is turned on (they are in `src/lib/needFamilies.ts` and `src/lib/feelingFamilies.ts`, one line each).
10. **Name:** "Phrase workbench" stays as the working title, kept in one place (`WB.title` in `src/lib/workbenchCopy.ts`).
11. **Sibling flow:** nothing designed here. The pure core is exported for the two-person session to reuse.

## Build status (2026-11-20)
Built behind `VITE_PHRASE_WORKBENCH` (off by default), all nine steps of section 9: data and wording; the pure core; frames; the marking page; need and feeling detail with sliders; frames page; words on request; "Remember on this device"; and the doors (a plain button in the coach's word panel, an accessibility-testing row, the Terms and data-register draft in `docs/drafts/terms-phrase-workbench-draft.md`). Not done: an About answer (the owner's wording), the online look-up (decision 8), the communal layer (decision 4). Checked by tests, type-check, build and server renders only; not in a browser.
