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
