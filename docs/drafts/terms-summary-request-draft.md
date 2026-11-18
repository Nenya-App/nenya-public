# Terms wording for "Request a summary" (DRAFT for the owner's edit; nothing applied, 2026-11-18)

**Status.** A draft. `src/lib/legalDocument.ts` is unchanged, and nothing here takes effect until you approve it, it is applied with a new effective date and the outgoing text is archived (`docs/legal/archive/`). It should ship with the summary switches, not before: while `COACH_SUMMARY_REQUEST` and `VITE_SUMMARY_REQUEST` are off, the Terms must not mention a summary. A same-day revision with the other Terms changes is fine (the Terms were last revised on November 18, 2026).

**What the feature does (so the sentences below are true of it):** after the five exchanges, only if the person presses a button, the page sends the finished conversation and its signed ticket to our server once more. The server checks the ticket, runs the safety check again on the person's messages (a flagged conversation gets a fixed sentence and no summary), counts the request as one message in the day's total, and sends the person's messages (not the coach's replies) to the same model provider with a short instruction to summarize the whole conversation. In one form the AI writes the summary; in another (for smaller models) the AI only chooses feeling and need words from the Center for Nonviolent Communication's inventory and the site writes the sentences. The site adds one sentence about the downloadable transcript. If the person later asks for a signed transcript, the summary can be included, only if our server can prove it wrote that text for that conversation. Nothing is stored.

Each change shows the current sentence (or the place) and the proposed one. Section numbers follow the current Terms; **Section 15** is the coach demo.

## 1. Where your words go (Section 15)
**Now (after the sentence about five exchanges):** "A conversation has at most five exchanges, and a message at most 500 characters. We do not store your messages or the replies…"
**Proposed, added after "…and a message at most 500 characters.":**
> "When the five exchanges are done, you may ask for one summary of the conversation. That is a separate request, made only when you press the button: your messages (not the coach's replies) go to Venice AI once more, in the same way, and Venice AI writes the summary. We do not store it."

## 2. Safety checks and stops (Section 15)
**Proposed, a new sentence at the end of the paragraph:**
> "If any message in the conversation was flagged by these checks, no summary is written: the page shows a short sentence of ours and the same pointers to people."

## 3. Words the site writes, not the AI (Section 15)
**Now:** "These are safety precautions, and this is the full list. The page writes the opening greeting … the closing message, and the safety notice …"
The paragraph calls itself the full list, so the summary has to be named in it.
**Proposed, a new sentence before "All of these are fixed texts…":**
> "If you ask for a summary, our server adds one sentence of its own about the transcript you can download, chosen from a short list in our public source code. Depending on the model, the site may write the sentences of the summary itself, from feeling and need words the AI chose from the Feelings and Needs Inventory of the Center for Nonviolent Communication; the page then names that source under the summary. The summary is the AI's reading of what you wrote, not a record."

## 4. Transcripts (Section 15)
**Now:** "…A signed copy includes the site's own words you were shown, marks each pre-written answer, replaced reply, and sentence the site added or took out…"
**Proposed, a new sentence after that:**
> "If you asked for a summary, a signed copy includes it, marked as the AI's reading and not a record; our server includes it only if it can prove it wrote that text for that conversation. A signed copy without a summary is unchanged."

## 5. Limits (Section 15)
**Now:** "…For all visitors together, the demo handles a set number of messages each day… For each connection, up to 10 messages a day (two full conversations)…"
**Proposed, a new sentence after the sentence about the daily total:**
> "A request for a summary counts as one message in that daily total. A request stopped by a limit is not passed to Venice AI and is not kept."
*Decision for you:* as built, the request counts in the daily total only. It does not use one of a connection's 10 messages. Say if it should.

## 6. What we count (Section 13)
**Now:** "…in the coach demo, how many messages are sent, answered or refused (with a reason…), how many conversations start and finish, how many signed transcripts and reports are made or rejected…"
**Proposed, added after "…are made or rejected,":**
> "how many summaries are asked for, written, or refused (with a reason, such as a safety flag or a limit),"
These are numbers only, counted after you agree and not under Global Privacy Control, like the other totals.

## 7. The short version (Privacy, "The short version")
**Now:** "Things leave your device only when you choose: the report form (Section 14), a palette from The Color API (Section 14), the coach demo (Section 15), and the signed note when you agree to these Terms (Section 16)."
**Proposed:** "…the coach demo, and a summary of it if you ask for one (Section 15), …"

## 8. No other change
- **Who gets your words:** still Venice AI, the same provider, for the same kind of call; no second company (Cloudflare Turnstile is unchanged). If the coach ever runs on another provider, the existing sentence about changing the model applies to the summary too.
- **Legal basis, age, crisis text:** unchanged. The summary does not give anyone more of your words than the conversation already did.
- **The About answers** (`c-memory` and the transcript answers) should say the same words as these sentences, and are changed in the same step (`docs/request-a-summary-scope.md`, step 4).

## Decisions for you
1. Approve, edit or reject each numbered sentence.
2. Does a summary request count against a connection's 10 messages (section 5)?
3. Should the Terms name the Center for Nonviolent Communication in the sentence in section 3, or only on the page under the summary? (Naming it in both is safer for the credit.)
4. The date: with the other changes, or its own effective date.
