# Learning cards: short educational reads the coach can offer

Status: built in dev 2026-11-10, **off by default and with no cards approved**, so nothing changes for visitors until the owner approves cards and turns it on.

## What it is
When someone's words dehumanize people, use a slur, or are abuse aimed at the AI, the coach can *offer* a short educational card: an invitation under its reply ("Written by Nenya, not the AI: a short read, 'X'. Only if you would like it.") with **Read it** and **No thanks**. Nothing is blocked, ended or reported. The cards are about propaganda, dehumanization and rehumanization, connection-building, and (for abuse aimed at the AI) why we notice such words. They are written from named sources, paraphrased, and credited.

## Pieces
- **Cards** (Markdown, drafted with Venice, reviewed by Claude, then the owner): `Nenya (private)/learning-cards/cleaned/` today. A card ships only if its front matter says `status: approved` **and** it passes every rule in `cardProblems()` (title, one-sentence key idea, body 40 to 80 words, read-more up to 250, an address for the source, no banned words, dashes, exclamation marks, "you should", links in the text). `node scripts/build-learning-cards.mts <folder>` writes `src/lib/learningCardsData.ts` from the approved ones. An approved card that breaks a rule stops the build.
- **Offer rules** (`src/lib/learningOffer.ts`): never after a crisis flag; at most two offers in a conversation, never the same card twice; not to someone *reporting* what was said to them; only a card that is built in; a list match counts only at or above `COACH_LEARNING_MIN_SEVERITY` (default 2, because the list's severities still need a person's calibration); abuse aimed at the coach is offered the AI card.
- **The list** (`src/lib/lexicon.ts`, `lexiconLoader.ts`, `lexiconStore.ts`): private, read from storage at run time, uploaded with `scripts/upload-private-list.mts`. With no list, only the AI-abuse offer can happen.
- **Screen**: `src/coach/LearningCard.tsx` (the invitation and the card; Read another; Back to the conversation; Stop here). The card says plainly it is not written by the AI.

## To turn it on (in this order)
1. A person opens and checks **every source address** in each card, and an expert reads each series; a counselor reads for harm; real readers check the reading level.
2. The owner sets `status: approved` on the cards to ship, one by one, and runs the build script.
3. A person **recalibrates the list's severities** (most slurs are marked 1 now) and the counselor and the advocate review it; the list is uploaded to the store (staging first).
4. **Terms (Section 21) and the answers**: wording drafted in `docs/drafts/terms-learning-cards-draft.md`, and the pre-written answer `c-cards` is written and held as pending. Apply the wording, archive the old text, set the date, then switch the answer to the Terms and to ready.
5. **Signed transcripts**: BUILT 2026-11-10. An offer carries a proof (a keyed hash over the conversation up to that reply); the page sends it back with the receipt request, and the server records an `offer` site message only for offers it can prove. Forged or moved offers are ignored.
6. Set `COACH_LEARNING_OFFERS=on` on staging, run the scripts, read what the offers look like, then production.

## Honest limits
- Phrase matching misses things and catches ordinary sentences; the list is mostly from model knowledge and has not been reviewed by people yet.
- A card does not change anyone's mind and must never be described as protecting anyone.
- The cards' claims come from the named sources as remembered by the drafters; none has been verified against the originals.
