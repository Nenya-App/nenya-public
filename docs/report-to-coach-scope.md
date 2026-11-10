# Scope: letting a visitor bring parts of a reflection report to the coach

Status: scoping only, nothing built. Written 2026-11-09 from the owner's direction. I am not a lawyer; the Terms changes below need the owner's approval (and a lawyer's eye, as for all Terms wording).

## What the owner asked for
- A module that can pass the **color labels and information from the sensory report** to the AI as plain text, with general instructions to the model about what it is and what it is for: **not a scientific or medical instrument**. A color from a palette can be named with its palette and some **rudimentary guesses at feelings and needs**; more text on each palette (not only a name) would help.
- The coach opens with a **site-written message** along these lines: "I see you shared information from a report you made at nenya.biz. I'm noticing that it says … It appears you chose colors from these palettes / a custom color. You're welcome to share more about anything in the report or talk about something else, such as how you're feeling or a challenge you're facing. Where would you like to begin?"
- **Site-side reading**: the site reads the report and passes it along, and the visitor can pass **fragments**, or say "no, I'd rather talk about something else."
- Whatever is passed goes through **the same safety and crisis passes** as any text. It need not stop the conversation, but it triggers the same warnings.
- **Opt-in, proactively disclosed, in the Terms.** A reflection is not needed to use `/coach`; nothing is shared automatically; the reports are not kept and we are not interested in what they say.

## What already exists (so this is mostly finishing, not starting)
- The coach function already accepts an optional `context` (up to 2,500 characters): it is bound into the conversation ticket and into a signed transcript; screened for instruction-giving (`looksLikeManipulation`); scrubbed of identifiers; run through the crisis check (`detectFlag`), which softens the coach's reply; and framed for the model by `contextInstruction`. The page never sends it, and the Terms dropped the hand-off on 2026-11-03.
- What is missing: reading the report on the page, the fragment picker, the site-written opening, palette descriptions, a visible notice when the shared text is flagged, process notes for it, richer model instructions, and the Terms wording.

## The pieces
1. **Palette information** (`src/lib/paletteInfo.ts`, new): for each of the sixteen palettes, one or two plain sentences about its image, plus a few feelings and needs it might point to, written fresh and in plain words (the Feelings and Needs Inventory is credited where used; see `docs/about-nenya-questions-scope.md`). They are guesses, stated as guesses. A test checks every palette has them and that none claims a fixed meaning. The same text can later enrich the Pantheon page and the picker.
2. **Reading the report on the page.** Two ways in, both visitor-started:
   - From the end of the reflection tools ("Talk it through with the coach"), where the report is still in memory.
   - From `/coach` directly: "Bring something from a report" lets the visitor paste text or open a saved Nenya report (.txt). Nothing is read unless they do this. (Reading the PDF is possible but heavier; decide below.)
3. **The picker.** A screen lists the report in pieces (each gateway's colors, melodies, body map, written words). **Nothing is selected by default.** Each piece shows exactly the words that would go. "Share these" and "No thanks, let's talk about something else" are both plain buttons. Identifiers are replaced as they are in messages, and the visitor sees the result.
4. **What goes to the model.** A plain-text digest of the chosen pieces. For a chosen color: its hex, the palette it comes from (or "a color the person chose themselves"), and that palette's information. Instructions say what it is and what it is not: a reflection the person made; palettes are starting points; no color has a fixed meaning; this is **not a scientific or medical instrument**; offer guesses tentatively, as questions; never diagnose or interpret; let the person correct you; the person may talk about anything else.
5. **The site-written opening.** Written by the page from what was actually shared (the palettes named, "a custom color," the report's own section titles), in the owner's wording above. It appears as the coach's first line in place of the greeting, is included in a signed transcript as a site message, and is added to the Terms list of site-written text.
6. **Safety.** The shared text goes through the same steps as a message: identifiers replaced (page and server), screened for instructions, and the crisis check. If it is flagged, the **safety notice and resources are shown and the care wording applies, but the conversation is not ended** (an earlier written reflection is not a message to the coach now). The site's added sentence applies as for a flagged message. A signed transcript carries the shared text (it already has a `context` field), and a **process note** says that a flag came from the shared report and which words matched.
7. **Terms** (Section 21, and the Section 19/16 cross-references): a bullet for the optional hand-off, stating: it is optional and never automatic; a reflection is not needed to use the coach; the visitor chooses which pieces go; what is sent (the chosen text, and for colors the palette and its description); it goes the same way as a message (our server, then Venice) and through the same checks; we do not keep it; it is part of a signed transcript the visitor asks for. And the new opening message added to the list of site-written text. This reverses the 2026-11-03 removal, so the archive note says why: the picker, the checks and the disclosure now exist.

## Decisions for the owner
1. **Entry points:** both (in-session, and paste or open a saved .txt from `/coach`), or in-session only to begin with?
2. **Open a saved PDF report?** Heavier; the .txt may be enough.
3. **Who writes the palette descriptions?** I can draft sixteen for you to edit, using the Feelings and Needs Inventory's words.
4. **What if the shared text contains a stop-level phrase?** Proposed above: show the notice, keep the conversation going, with the care wording. A stricter alternative is to stop. Your note suggests the first.
5. **The opening line:** your wording is the base. Should it also reflect any written reflection the person shared (for example, "I'm noticing it mentions …"), or only name the palettes and section titles? The second is safer: the site names only what it can read exactly.
6. **Size:** the context limit is 2,500 characters. Is that enough, or do we need a lower cap per piece?
7. **Timing:** this is a multi-part build (palette text, picker, digest, instructions, safety notice, Terms, tests, a dev run). I would ship 1.1.0 first and build this next, together with the answer cards, so the flows share one design.

## How I would test it
- Scripts for a report with: only colors from one palette; a custom color; several palettes; a written line with a crisis phrase; a written line with an instruction ("ignore your rules"); identifiers; an empty selection; "no thanks."
- Checks that the coach never diagnoses, never says a color means something fixed, offers guesses as questions, names nothing the person did not share, and invites them to talk about anything else.
- The site's decision against the repository's on every script (no mismatches), as for the safety set.

## Not verified
- How the picker would read for a screen-reader user, or on a phone: it needs a real accessibility pass.
- Whether the fixed 2,500-character limit fits a real report.
- Any legal position on the Terms wording.

## Progress (2026-11-09): built in dev
Defaults taken while the questions above were open (change any of them): **both entries** (a report in memory when the coach is opened from the reflection tools, and a pasted saved text report on any visit); **no PDF reading** (the text report is enough); the sixteen palette notes **drafted by Claude** for the owner to edit (`src/lib/paletteInfo.ts`); a stop-level phrase in the shared text **shows the notice and the coach continues** with care; the opening **names only what the site can read exactly** (sections and palette names from the header, not the person's words); the **2,500-character limit** stays, and a summary over it is refused with a message (nothing is cut silently).
- **Built:** `src/lib/reportText.ts` (the report's words, moved out of the review page), `paletteInfo.ts`, `reportShare.ts` (header, whitelist, opening), `reportFragments.ts` (pieces, summary, saved-report reader), `src/coach/ReportShare.tsx` (the picker: nothing chosen by default; the exact words shown; "No thanks" as plain as "Share these"; locked once the conversation starts), the coach function (framing, one system message, a flag in shared text reported with the first reply and never ending the conversation, the opening and a process note in a signed transcript), the privacy wording (Terms Sections 2, 14/17 lines and 21; Privacy Promise; welcome letter; public page; About design page; the answers, including a new one, "Can the coach see my report?"), evaluation scripts (`report-*` in the about-nenya group; the runner shares report text and prints a flag in it).
- **Not done:** a real dev run of the report scripts; reading the picker with a screen reader; whether to name a palette's guesses in the opening (it does not); legal review of the Terms bullet.
