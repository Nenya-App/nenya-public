# "Request a summary": the summary as the person's own request after the five exchanges (scope, owner direction 2026-11-18)

**Direction (owner).** The summary is effectively a sixth step in the demo: **"Request a summary."** It defaults to summarizing the **conversation as a whole**, not specific sections or speakers. This replaces the idea of appending a summary to the coach's fifth reply (`COACH_FINAL_SUMMARY=call`, built 2026-11-18, off).

## What it is, and what it is not
- **It is a request, not a coaching turn.** The five exchanges stay five (`MAX_TURNS = 5`, the Terms, the About answers and the daily cap all say five). The summary button appears **after the closing note**; pressing it asks the site for one summary. The person writes nothing, and the coach does not "speak" again in the persona of the conversation.
- **It is the person's choice.** Nothing is drafted unless they press it. That is more respectful than adding text to the fifth reply, and it removes the overlap seen in the 26B run (the closing and the summary saying nearly the same thing).
- **Whole conversation, one piece.** No options to pick sections or speakers. (A later version could offer "what I said" versus "what we said"; not now.)

## Why not a real sixth exchange
A sixth exchange would change what the site promises (five), the ticket and message limits in `coach.mts` (`raw.length <= MAX_TURNS * 2 - 1`, `turn > MAX_TURNS` refused), the turn counter, the Terms text, the cap arithmetic and the signed transcript's shape. A separate request after the end changes none of those.

## How it works (design, to read against the code before building)
1. **Endpoint:** a new function (for example `/api/coach-summary`) taking the finished conversation and its **signed ticket**. It accepts only a ticket for a **completed** conversation (five exchanges), verified with the same signing as the coach; a tampered, early or wrong-length request is refused.
2. **Model call:** the existing summary call (`src/lib/finalSummary.ts`: the two-part form "You felt… / You were looking for… / one sentence of care / one of encouragement", with its checks and one retry). Input: the person's messages, scrubbed as for the coach. **Open:** whether "the conversation as a whole" should also show the coach's replies; the first build keeps the person's messages only (chosen 2026-11-18), with the other tested separately.
3. **Guards:** the summary's own checks; the persona and boundary guards on the result; and **no summary at all if anything in the conversation was flagged** (crisis, harm, abuse at the coach): the person gets the site's fixed sentence pointing to people instead, never a model summary of a flagged conversation.
4. **Limits:** one summary per conversation. The function is stateless, so the repeat is limited by the signed result (the page keeps the first and does not offer a second request) and by the existing per-day limiter; a replay costs one model call, bounded by that limiter. **Open:** whether it counts against `COACH_DAILY_CAP` (recommended: yes, as a fraction or as one turn, so a visitor buffer holds).
5. **The transcript sentence** (site-written, from the approved pool) is added by the site, as now. Wording approved by the owner.

## The page
- A button "Request a summary" under the closing note, keyboard-reachable, with a visible loading state announced politely (`aria-live`), and the result in its own labelled block ("Summary of this conversation, written by the AI") so it is never confused with the coach's words or the exact record.
- On failure: a plain sentence ("A summary could not be written this time. The transcript still has everything that was said."); nothing else changes.
- A person who never presses it loses nothing. It is **not** shown on a flagged conversation or when the coach is off.
- The text states what the summary is: the AI's reading of what they wrote, not a record; the signed transcript is the exact record.

## The signed transcript
- The downloadable, signed transcript must stay valid with or without a summary. The summary is an **addendum with its own signature** over the conversation's signature, the summary text and the transcript sentence, so verification (`/verify`, `MyTranscriptPage`) can say "the summary was produced by this site for this conversation" and a transcript with no addendum verifies as before.
- Nothing in the signed conversation itself changes. **Check before building:** the verify page and the transcript policy (`src/lib/transcriptPolicy.ts`) on how an addendum is shown.

## Data, Terms and About
- **Same provider, same words, once more.** The person's messages go to the model provider a second time for this one call; no new processor. The Privacy section on the coach ("Where your words go") already covers it in principle, but the sentence should say that a requested summary is one more call. Batch with other Terms changes (the lens words, the shadow-ID clause); the owner approves wording.
- **About answers:** `c-memory` and the transcript answers should name the summary ("you can ask for a summary of the five exchanges") once it exists, and say that it is the AI's reading, not a record. The merge checklist already lists the update.
- **Counts:** a plain daily count of summaries requested and refused (numbers only, after agreement, not under Global Privacy Control).

## The sealed path
The browser-side encrypted route (`VITE_BOUNDARY_GUARD`'s sealed path, `src/lib/sealedCoach.ts`) encrypts the person's messages before they leave the page. A summary on that route needs the same encryption for the summary call. **Phase 2.** Until then the button is shown only on the ordinary route (and the sealed route says so, or hides it).

## Switch and rollout
- `COACH_SUMMARY_REQUEST=on` (function) and `VITE_SUMMARY_REQUEST=on` (page), both off by default; nothing changes on merge.
- `COACH_FINAL_SUMMARY=call` (append to the fifth reply) stays as built, off, and is retired once this ships, unless the owner wants both.
- On: staging only until the owner has read a dozen real summaries from the 26B, and E2B/Llama results are read for the hosted-small-model case.

## Measured so far (2026-11-18, invented conversations; counts are heuristics, read the replies)
| Model | Free-form separate call |
|---|---|
| Gemma 4 26B (Workers AI) | 6 of 6 feelings and needs, transcript sentence varied, no promise, none over 150 words (582 Neurons) |
| Gemma 4 E2B (uncensored) | named feelings 6 of 6 but needs thinly; the two-part form was added to fix that (result in `coach-instructions-v2.1.md` once read) |
| Llama 3.2 1B | the summary part is usable; the coach's own closing ran long and asked questions (the closing step, not the summary call) |

## Build order (each reversible, off by default)
1. The endpoint, the ticket check, the flagged-conversation refusal and the tests (function only, no page).
2. The signed addendum and the verification changes, with tests that old transcripts still verify.
3. The page: button, loading and failure states, labelled block, keyboard and screen-reader checks, AAA contrast; behind `VITE_SUMMARY_REQUEST`.
4. About answers, counts, Terms wording drafted for approval; then staging.
5. The sealed route (phase 2).

## Decided (owner, 2026-11-18: "yes to all five recommendations")
1. **The request counts against the daily cap** (the exact weight, one turn or a fraction, is set when the endpoint is built and tested, so a visitor buffer holds).
2. **After the first tested version, the summary may also see the coach's replies**; the first build uses the person's messages only, and the two are compared on the same conversations before either is chosen.
3. **Both:** the summary on the page, and a signed addendum in the downloaded transcript **only if the person requested it**.
4. **A flagged conversation gets the site's fixed sentence**, never a model summary.
5. **`COACH_FINAL_SUMMARY=call` is retired once this ships.**

## Still open
- **Who builds it:** the tray session owns `App.tsx` and the page; the function, the module and the transcript changes fit the tests session. The page step waits for the Terms-first and tray steps (shared `App.tsx`/`CoachPage.tsx` territory).
- The exact wording of the block's label, the failure sentence and the Terms clause (owner approval).

## Progress
- **Step 1 built (2026-11-18), function only, off (`COACH_SUMMARY_REQUEST`):** `action: "summary"` in `netlify/functions/coach.mts`. Accepts only a finished conversation (ten messages) with its signed ticket (tampered, altered, early or wrong-session requests get 400); recomputes the safety check turn by turn from the person's messages (a message flagged at any point refuses, with the fixed sentence `SUMMARY_FLAGGED_LEAD` and the site's existing distress sentence; no model call); counts one turn against the daily cap (refused as `cap` when reached); calls the model once or twice (written form, retried once on failed checks) or in the picked form; returns `{ summary, transcriptLine, form, credit? }` or `{ refused: 'flagged' | 'cap' | 'failed' }`. Counts: `coach.summary.requested`, `.served`, `.failed`, `.refused.flagged`, `.refused.cap`. Tests: `tests/summary-request.test.mts`.
- **Step 2 built (2026-11-18), function and transcript only, off:** the summary is a new site-message kind `summary` (`src/lib/siteMessages.ts`), placed after the closing, in the signed transcript's `site` list. The summary response carries `text` (the summary and the site's transcript sentence) and a `proof` (a keyed hash over the ten messages and the text). A receipt request may send `{ text, proof }`; the server includes it only if the proof checks for exactly that conversation and text, so a forged proof, changed words or a proof moved to another conversation are ignored (the transcript is made without it). Old transcripts are unchanged and verify as before; `signedCheck.ts` accepts the new kind; the readable copy labels it ("Summary you asked for (the AI's reading of what you wrote, not a record…)"); `docs/coach-transcripts.md` lists it. Tests: `tests/summary-request.test.mts`.
- **Terms wording drafted (2026-11-18), not applied:** `docs/drafts/terms-summary-request-draft.md` (seven changes in Privacy section 15, the counts sentence and the short version, each beside the current sentence; four decisions for the owner).
- **Wording to approve:** `SUMMARY_FLAGGED_LEAD` and `SUMMARY_FAILED_TEXT` in `src/lib/finalSummary.ts`.
- **Not yet:** the signed addendum (step 2), the page (step 3), About answers and Terms wording (step 4), the sealed route (phase 2). One summary per conversation is limited today only by the cap, because the function is stateless; the page keeps the first and offers no second.
