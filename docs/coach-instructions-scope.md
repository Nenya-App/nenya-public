# Scoping: coach instructions out of the code, and a feedback loop

Status: scoping. Step 1 of the suggested order below is built (`src/lib/coachIntent.ts` and an answer-first block in `coach.mts`, with tests in `tests/coach-intent.test.mts`); the rest is not. No private text appears in this file; it describes structure.

## Where the coach's instructions live today

| Piece | Where | Notes |
|---|---|---|
| Core persona, pacing, safety wording | `systemInstruction()` in `netlify/functions/coach.mts` | Hard-coded. A change needs a deploy. |
| Method notes | private Blobs key `method-notes` (or `COACH_METHOD_NOTES`) | Free text, capped at 12,000 characters. |
| Modules | private Blobs key `modules` (JSON: `core` plus named modules) | Chosen per conversation by `selectModules()` in `src/lib/coachModules.ts` (public phrase matching). |
| Character card | Venice, by `COACH_CHARACTER_SLUG` | Does not apply to encrypted (`e2ee-`) models. Always meant as a stand-in. |

## What went wrong in the "What can I do about my anxiety?" test

The question was a direct request for options, and the reply ignored it and asked about the body. Reading the
code, part of this is our own prompt, not only the model:

- Turn 1 always carries "listen and reflect what you heard before anything else".
- Every turn carries "stay with empathy first" and "offer a concrete next step only when they ask for help or
  seem ready". "What can I do about..." is exactly asking, but nothing in the code recognises a direct question,
  so the first-turn rule wins (it is appended last).
- A 7B model follows the shape of an instruction more than its intent, so ambiguous priorities get resolved
  badly. A larger model hid this.
- No module matches "anxiety", so nothing in the notes helps either.

## Target structure

1. **Instruction blocks in the private store**, as one versioned JSON document:
   `{ version, core, blocks: { first_turn, final_turn, penultimate_turn, softened, direct_question, ... }, modules }`.
   `coach.mts` composes the system message from these. If the document is missing or invalid it falls back to the
   hard-coded defaults, so the coach never breaks because a blob is wrong (the same rule as method notes today).
2. **Selection stays deterministic phrase matching in the public repo** (like `safetyFlags.ts` and
   `coachModules.ts`): which blocks and modules apply is visible and testable; only the wording is private. If
   the modules become public educational documents, the wording can move into the repo too, and the private
   store holds only what must stay private.
3. **Intent detection** as a small public function: direct question or request for options ("what can I do",
   "how do I", "any tips", a question mark with a help-seeking verb), venting, crisis (the existing flags),
   hand-off requests. Direct question swaps the first-turn rule for "answer it briefly and concretely in the
   first two sentences, then at most one reflective question". This one change fixes the example above.
4. **Version stamp**: the version of the instruction document used goes into the signed transcript metadata, so a
   conversation can always be tied to the instructions that produced it.
5. **Where to keep it**: Netlify Blobs is enough for read-mostly configuration at this scale. A database is only
   worth adding if feedback needs to be stored on our side (see below), and the privacy stance argues against
   storing it at all.

## Feedback: "Was this reply helpful?"

Design principle: nothing is stored or sent unless the person chooses, and they can see exactly what.

- **Per reply, two quick taps** (helpful / not helpful). If not helpful, a short fixed list: ignored my question,
  too long, too generic, too pushy, other. Fixed choices cannot carry an injection attempt.
- **Effect inside the conversation**: the choice is sent with the next message as an enum, and the function maps
  it to an instruction block ("the person felt their question was ignored: answer it directly now"). No server
  storage; it lives only in that request.
- **Optional comment (up to about 200 characters)**: scrubbed and screened exactly like a message (the same
  identifier scrub, injection screen and crisis check), then passed as a short note in the same request. For
  encrypted models it is encrypted with the rest.
- **Send as a signed report (optional, separate)**: the person chooses one reply or one exchange. The page shows a
  preview of exactly what will be sent (scrubbed text, the signature, the instruction version). It goes through
  the existing Netlify Forms route, which is already the user-initiated, no-account channel. The signature lets
  a reviewer check that the text is a real coach reply. This is feedback we can learn from without keeping any
  conversation database.

## Evaluation

A private set of test prompts (direct questions, vague distress, requests for options, hand-offs, off-topic,
injection attempts, other languages) run against each candidate model and each instruction version, with
pass/fail notes. It is the way to tune the 7B model without guessing, and the reproducible comparison against
the hosted model that the funding application describes. Results derived from real material stay private.

## Suggested order

1. Direct-question detection plus an answer-first block (small, testable, fixes the observed failure).
2. Move the blocks into the versioned private document, with fallbacks and tests.
3. Instruction version in signed transcripts.
4. Feedback taps and the enum-to-block mapping.
5. Optional comments, then signed reports through the existing form route.
6. The evaluation harness, then public modules.

## Open questions

- Should the instruction document be editable in a form, or stay a file you upload to the store?
- Who reviews instruction changes before they go live (a second person, or a staging check against the evaluation set)?
- How much of the character card's content is method (private notes) and how much is persona (core)?
- What should happen on a direct question that is also a crisis phrase? (Today the stop tier wins; keep that.)
