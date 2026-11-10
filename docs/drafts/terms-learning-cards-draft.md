# DRAFT: Terms wording for learning cards (not applied)

Status: draft for the owner, 2026-11-10. **Not in the live Terms.** Apply it, archive the outgoing text and bump the effective date only when learning cards are turned on (`docs/learning-cards-scope.md`, step 4). Until then the Terms must not describe cards, because they do not exist for visitors. I am not a lawyer; no legal review.

## Section 21 (The Coach Demo): add to the list of words written by us
> **Short educational cards.** When a message contains language that treats people as less than human, or abuse aimed at the AI, the coach may offer, under its reply, a short educational card written by Nenya, not by the AI. It is only an invitation: you can read it, read another, or carry on. Nothing is blocked, ended, punished or reported because of it. The card paraphrases published research and names its sources. Whether to offer a card is decided by simple phrase matching against a private list, run by our server on your latest message. It misses things and it can match ordinary sentences, it is not a safety system, and it does not protect anyone. We do not store which words matched or which cards you opened. The cards are in our public source code; the list is kept private because it contains harmful words and some of its sources restrict sharing. A signed transcript records an offer our server made, marked as written by the site, and the card's title.

## Section 21: the sentence in the existing bullet on site-written text
Add "and the short educational cards and the invitations to read them" to the list of words written by the site, and "an offer of a card" to the things a signed transcript marks.

## Section 14 / 17 (what leaves your device): nothing new
The latest message is already sent to our server. The matching runs there, on the same text, and keeps nothing.

## The pre-written answer
`c-cards` in `src/lib/aboutNenya.ts` is written and held as "pending". Switch its checks from this draft to the Terms (`file: TERMS`) and its status to `ready` when this wording is applied.
