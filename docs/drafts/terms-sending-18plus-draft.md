# Terms draft: sending reports and messages is for people 18 and older, and what the consent screen says (2026-11-18)

Status: DRAFT for the owner's approval. Nothing here is applied to `src/lib/legalDocument.ts`. Each change sits beside the current sentence. Needs an effective-date bump and an archive of the outgoing text, as for any change.

This changes only what happens when someone **sends** something to Nenya. It does not change who may **use** the site or the coach: Section 2 (13 and older, or the minimum age in the person's country; under 18 only with a parent for the coach) stays exactly as it is.

## Section 14, first bullet ("Things you choose to send us": the report form, the reflection summary form, the contact form)

**Current:** "The report form (Section 5), the form for a reflection summary, and the contact form: the text of your report or message and an optional comment, kept in our own private storage with our host (not in an email inbox or a form service). We do not ask for your name or email; anything identifying that you type becomes part of the submission. If you want a reply, you may include your email address, and we use it only to answer you. Each one is kept for 90 days and then deleted automatically. When you send it you get a deletion code, shown once; with it you can delete what you sent yourself, at once, at nenya.biz/my-transcript. We keep only a scrambled copy of the code, so we cannot show it again. We are told by email only that something arrived, never what it says."

**Proposed (three added sentences, shown in bold; the rest is unchanged):**

"The report form (Section 5), the form for a reflection summary, and the contact form: the text of your report or message and an optional comment, kept in our own private storage with our host (not in an email inbox or a form service). **Before anything is sent, a screen shows you exactly what would be sent, who reads it, what we may do with it, how long we keep it, and that a deletion code will be shown once; nothing is sent until you press Send there, and Don't send is just as easy to press. Sending is for people 18 and older: the screen asks you to tick "I am 18 or older", Send stays off until you do, and our server refuses a send that does not carry that confirmation. We keep no age and nothing else about you from this: only the text, the dates, and a plain daily total of how many sends were refused for lacking it.** We do not ask for your name or email; anything identifying that you type becomes part of the submission. If you want a reply, you may include your email address, and we use it only to answer you. Each one is kept for 90 days and then deleted automatically. **To refuse an identical repeat, we keep a one-way code of what you sent for as long as we keep it. It cannot be turned back into your words, and it is deleted when the submission is deleted, so deleting one lets you send the same words again if you choose.** When you send it you get a deletion code, shown once; with it you can delete what you sent yourself, at once, at nenya.biz/my-transcript. We keep only a scrambled copy of the code, so we cannot show it again. We are told by email only that something arrived, never what it says."

## Section 14 / Section 7, sending a signed transcript

**Current (Section 2 end, Section 14 bullet 1 intro, Section 15 "after your first exchange"):** a signed transcript is sent "if you choose", after "you see exactly what will be sent first".

**Proposed addition, one sentence, where the signed-transcript sending is described:** "Sending a signed transcript is also for people 18 and older, and the choices screen asks you to confirm this before it lets you send. If you send the same signed transcript again with the same choices, we refuse it and change nothing; sending it with different choices is treated as an update, and an update can only remove permissions, never add them."

(The 18-or-older statement for transcripts already exists in the code, "I am 18 or older, and these are my own words", and in the draft `docs/drafts/transcript-contribution-terms-draft.md`. This sentence makes the Terms match it.)

## Section 2 (age) — no change, and one cross-reference

**Current:** "Nenya is for people aged 13 and older, or the minimum age in your country for using online services on your own, whichever is higher. If you are younger, please use it only with a parent or guardian. If you are under 18, please use the coach demo only with a parent's or guardian's consent."

**Proposed:** keep as is, and add: "Sending something to us (Section 14) is only for people 18 and older, even though using the site is open from 13."

## Privacy Promise and pre-written answers
The same three facts, in the same words: sending needs "I am 18 or older"; a screen shows what is sent first; an identical repeat is refused using a one-way code kept as long as the submission. The "report" answers and the forms' own text already match the screen wording (see `src/app/components/SendConsent.tsx`).

## Also for the data register
`docs/data-register.md` has the same three stored items as proposed rows (the duplicate marker, which choices were sent for a transcript, the tab-only code in `sessionStorage`). The Terms say the site stores very little on the device; the tab-only code is the one new thing on the device: up to 20 SHA-256 codes, never the text, gone when the tab closes, and the form works the same without it. If you would rather it did not exist, remove `rememberSentInThisTab` in `src/lib/reportSubmission.ts`: the server's refusal and the form's own state still stop a repeat.
