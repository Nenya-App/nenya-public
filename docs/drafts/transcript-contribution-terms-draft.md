# DRAFT: what a person agrees to when they let a conversation be used (not the contributor agreement)

Status 2026-11-10: a draft for the owner and a lawyer (Fractured Atlas may review). Nothing here is applied. Written in answer to the question: should people who let a verified transcript be read, used or shown publicly also sign something like the contributor agreement?

## Short answer
**Yes in substance, no as a separate form.** They are giving permission, so what they agree to should be as clear and as lasting as a contributor's. But the **contributor agreement is the wrong instrument**, for three reasons:
1. It makes a contribution **open under the AGPL for anyone to reuse forever**. A conversation is personal, a person must be able to take back what is shown (the design already lets them narrow or end it), and a public copy must never be free for anyone to repackage.
2. It asks for a name, an identity and a signature step. The transcript system is built so nobody needs an account, and **a signed file is already the record** of exactly what was chosen (uses, how long it is kept, which parts, how long it is shown).
3. A separate agreement would be friction at a hard moment. The consent step should stay short and plain.
So the answer is a **short, plain permission statement inside the consent step, backed by the same words in the Terms**, with the signed receipt as the record. The current consent step (`src/coach/TranscriptChoices.tsx`) lists the choices but says nothing about copyright, the AI's part, or what cannot be undone.

## What the statement should say (draft, plain words)
> **What you are agreeing to.** You keep ownership of your own words. By choosing the uses below, you give Nenya permission, for those uses only, to read this conversation, to use it as described, and to show the parts you choose. The AI's replies are written by a machine, and Nenya treats them as part of the conversation, not as yours.
> - **Evaluate:** people at Nenya may read it to check and improve the coach. It is not used to train a model.
> - **Quote:** short parts may be quoted, without your name, in Nenya's own notes and results.
> - **Publish:** after it is anonymized by the site and read and edited by a person, the parts you chose may be shown on the Witnessed Conversations page until the date you chose.
> You promise that you wrote your side yourself and that it does not contain anyone else's private details. We replace names and contact details automatically, and a person checks before anything is shown; neither is perfect.
> **Taking it back.** You can narrow or end this at any time with the file you were given. We stop showing it and delete what we keep. **What cannot be undone:** if someone copied or saved a public copy while it was shown, we cannot get it back.
> **What you are not agreeing to.** No payment, no endorsement, no use to train a model, no sale, no advertising, no tracking. This is not an account.

## What to settle (for the owner and a lawyer)
1. **Training.** The draft says "not used to train a model". Is that the promise you want now, given you may later improve a model from consented data? If it may change, the statement must say it will be asked again.
2. **The licence grant itself.** The draft is a permission "for these uses only", worldwide, non-exclusive and revocable going forward. A lawyer should word it for the US and say how it fits the Terms, the Privacy Promise and Fractured Atlas's requirements.
3. **Age and capacity.** Does the coach require 18 or over? If not, a conversation from a minor should not be offered for public display at all.
4. **Third parties.** The person promises not to include anyone else's private details; the site scrubs, a person reviews. Is the promise enough, or should a flagged conversation never be offered for publishing (the stop-level rule already does this for crisis conversations)?
5. **The AI's part.** Whether the model provider's terms allow showing its replies. Not checked.
6. **Where the wording lives.** In the choice step (short), in the Terms (full), and in the signed receipt (a version number, so the file says which wording applied). The receipt format would gain a "terms version" fact (a small format change).
7. **A contributor who also gives text or code.** Someone who gives a translation or a fix signs the contributor agreement; that is a different act from donating a conversation, and the two should not be mixed.

## Where it fits in the code (not started)
`TranscriptChoices.tsx` (the statement above the choices, one short confirmation), the Terms section for transcripts (`docs/transcript-consent-scope.md` has the draft), and `transcriptPolicy.ts` (a terms version recorded with the choices).

## Owner's direction, 2026-11-10 (and what follows from it)

### 1. Training becomes a fourth, separate choice
Decided: a person may allow their conversation to be used to train or improve a model. How to do it fairly:
- **Its own checkbox, off by default, never bundled** with evaluate, quote or publish, with a plain line: "Use it to train or improve a model."
- **Same safeguards as publishing, before it enters any training set:** the site anonymizes it and a person reads and edits it (names and details can be memorized by a model, which is the risk). **Never** for a conversation the safety check stopped, never without the age attestation, and never from any other source of data (the trainer's material is a separate matter).
- **It cannot be fully undone, and the choice must say so:** taking it back removes it from future training sets, but **a model already trained cannot unlearn it.** So the permission is worded "for training runs from now on, until you take it back."
- **A ledger, so a takedown is real:** each training set records the fingerprints of the conversations in it, so a withdrawal is honored in the next run and we can say which runs had it.
- **Keep training internal.** Do not offer or imply publishing the data or the model as a public dataset. That would be a **fifth, separate choice** with its own consent, which we do not offer now. It also matters for the Mozilla application (the dataset and open-sharing questions).
- **The Terms and the statement above change:** "not used to train a model" is replaced by what the fourth choice says. The Privacy Promise and the Terms must say the same.
- **Code touched (not started):** `USES` and `USE_LABELS` in `src/lib/transcriptPolicy.ts`, `TranscriptChoices.tsx`, the alert and inbox wording, revocation (a person can stop `train` without stopping the others), and the owner page's list. The stop-level block that already hides publishing would hide training too.

### 2. Age: ask, record, and let the review be a second look
- **An ID scan is not the answer.** It would break the site's own promise (no accounts, nothing kept, no identity), it needs an outside verifier and the handling and storage of government IDs (a breach risk and a liability for a project this size), it excludes people without ID, and it still would not be certain. It would also put a wall in front of people at a hard moment.
- **Take their word, and keep the word on record.** The standard for a service that is not aimed at children is an age statement: **"I am 18 or older, and these are my own words."** A checkbox, required to send anything at all (not only to publish or train), recorded with the choices.
- **Where it is recorded.** The person's signed transcript is signed when the conversation ends, **before** any choice exists, so a statement made later cannot go inside it. Two honest options: (a) record it in the stored consent record and the owner's inbox only; or (b) **issue a second small signed file, a consent receipt** (the transcript's fingerprint, the choices including training, the age statement, the terms version and the time), which the person keeps and which is also the key for taking it back. **I recommend (b):** it is the person's own proof of what they agreed to, and it fits how take-back already works. It is a small new signed format and a new field in the record.
- **The review as a second look.** The by-hand review before anything is shown or used for training should also look for signs of a minor (a school grade, "my mom said I can't", and so on) and remove the conversation if there are any. The checkbox is the promise; the review is the backstop.
- **If the age statement is missing, or a conversation shows a minor,** the conversation is not kept for training or shown, and what was sent is deleted by the same path as a take-back.
- **A question for the lawyer:** whether 18 is the right line for your jurisdictions, and whether the age statement must say more about guardians for people 13 to 17 (the safest answer for a coach that handles distress is to stay at 18+).

### 3. What I would build, in order, on your word
1. The fourth choice and the age statement in the consent step, the record and the inbox (and the revocation, the alert and the owner page), with tests.
2. The consent receipt (a signed file the person keeps), and the terms version recorded.
3. The Terms and the page wording, applied once you and a reader have read them.
4. A review checklist for the person who edits conversations before they are shown or used (anonymize, check for a minor, remove anything identifying).

## Built 2026-11-10 (owner's go-ahead; "18+" is for sending a conversation only, not for browsing the site)
The 18+ statement and the training choice are in the consent step, the record, take-back and the owner's inbox; a signed consent receipt is returned and offered for download; `docs/transcript-review-checklist.md` is the reader's checklist; the dev steps are in `docs/dev-testing-checklist.md`. **Not built:** the Terms and Privacy Promise wording (it is a separate consent from the site's general terms; the site stays browsable by anyone, and the Terms may recommend that anyone under 18 use Nenya with a trusted adult with them or looking on); the training ledger and the reader's approve action; any training pipeline (a conversation with a training choice is recorded as waiting for review and nothing reads it).
