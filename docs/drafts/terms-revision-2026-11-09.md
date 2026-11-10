# DRAFT: Terms revision for the 1.1.0 release

Status: a draft for the owner to read and edit, written 2026-11-09. **Nothing here is in the live Terms** (`src/lib/legalDocument.ts`) until it is approved. I am not a lawyer; the owner (and Fractured Atlas, if it wishes) should read it before it ships. Each change is shown as exact replacement text, with a note on what in the code makes it true.

Why now: the rewritten Privacy Promise and the pre-written answers already say that our server encrypts a message before it goes to Venice, that this is not encryption all the way from the device, and that some words in the coach are written by the site. The Terms must say the same things, or the pages disagree.

No section is renumbered (the document has many references to Sections 3, 5, 6, 7, 15, 16, 19, 21 and 22).

## 1. Section 5, "Your Responsibility": add after the existing paragraph

> Nenya is a space for reflection: for looking at your own thoughts, feelings and needs. Strong feelings, including anger, frustration, and disagreement with Nenya or the coach, are part of being a person and are welcome here. The coach is software; it is not hurt or offended by what you say to it, and hostile words aimed at the coach are not a reason for it to end your conversation.
>
> Please do not use Nenya, or the coach demo, to produce or share language that treats a person or a group of people as less than human (for example, calling people animals, vermin, or disease, or wishing them gone), to threaten or harass anyone, or to plan harm to others. This is not what the space is for.
>
> If a conversation goes in that direction, the coach may turn back to your own feelings and needs, or decline to continue. These checks are simple phrase matching and they can be wrong.
>
> If a message suggests you may be in distress or in danger, the coach responds with care and resources, as described in Section 6 and Section 21.

What makes it true today: the coach instructions turn hostile messages toward feelings and needs (v2 and the hostile-turn note); abuse aimed at the coach never ends a conversation (`netlify/functions/coach.mts`, tested in `tests/hostile-turn.test.mts`); crisis messages are handled before any of this (Sections 6 and 21).

**Decisions for the owner**
- "Are not a reason for it to end your conversation" is a **commitment about behaviour**, harder to change than a setting. Keep it, soften it ("are not, by themselves, a reason ..."), or drop it.
- The prohibited list is deliberately narrow (dehumanising language, threats, harassment, planning harm). It says nothing about swearing or insults. Add only what you are willing to enforce.
- **No pause and no quiz** are mentioned, because the break does not exist yet (the trigger is not built; the existing intensification ladder is described in `docs/coach-boundaries-scope.md`). When the trigger ships, add the pause paragraph and the Section 21 pause bullet from `docs/drafts/terms-respectful-use-draft.md`, and update the effective date again.

## 2. Section 21, "The Coach Demo": replace the third bullet

Today it reads: "Venice AI handles what it receives under its own terms and privacy policy, which we do not control. We have chosen a model that Venice labels “Private.” Venice and Netlify may process data outside your country."

Replace with:

> Venice AI handles what it receives under its own terms and privacy policy, which we do not control. The coach currently uses Qwen 2.5 7B, a small AI model, in a mode that Venice labels “Private.” Before your message goes to Venice, our server encrypts it so that only Venice’s secure processing environment can read it, and Venice’s service relays only encrypted data. This is not encryption all the way from your device: your message first reaches our server, which reads it in memory to remove identifiers, check for crisis, and screen it (all described below), and does not store it. We may change the model. If we move to one without this protection, we will say so in this section first. Venice and Netlify may process data outside your country.

What makes it true: `netlify/functions/coach.mts` (default model `e2ee-qwen-2-5-7b-p`), `src/lib/veniceE2ee.ts` (the prompt is encrypted in the function; Venice relays ciphertext; the header comment says not to call it end-to-end from the visitor's device), and `MODEL_NAMES` in `src/lib/aboutNenya.ts`.

**Decisions for the owner**
- Naming the model in the Terms means the Terms go stale if the model changes. The pre-written answers fill the model's name from the model actually in use, so they never go stale. The alternative is to leave the name out of the Terms ("a small AI model that Venice labels “Private”") and let the answers and the source name it. I recommend leaving it in only if you will update the Terms with every model change.
- "If we move to one without this protection, we will say so in this section first" is a **commitment**. Keep, soften, or drop.
- The existing test (`tests/answers-draft.test.mts`, discrepancy d3) looks for the phrase "a model that Venice labels". It will be updated to the new wording.

## 3. Section 21: replace the "opening greeting and closing message" bullet

Today it reads: "The opening greeting and the closing message of a conversation are written by the page itself, not by the AI. They are not sent anywhere and are not part of a signed transcript."

Replace with:

> Some of the words you see in the coach demo are written by us, not by the AI. We treat them as safety precautions, and this is the full list. The page writes the opening greeting, the closing message, and the notice with crisis resources shown when a message is stopped; none of these is sent to the AI, and the greeting and closing message are not part of a signed transcript. Our server adds short sentences to a reply in some situations: a pointer to a crisis line when a message suggests distress, self-harm, hurting yourself on purpose, abuse, or the risk of hurting someone, and a brief “Thank you for telling me.” after critical feedback about the coach. Our server may also take an apology out of a reply when a message was hostile toward the coach. These added sentences are part of the reply you see and appear in a transcript you download. They are fixed texts in our public source code, not AI output.

What makes it true: `CLOSING` and the greeting in `src/coach/CoachDemo.tsx`; the stop notice (`src/lib/safetyFlags.ts`); `DISTRESS_APPEND` and `SELF_INJURY_APPEND` (`src/lib/distressText.ts`, added by `withDistressText`, only when `COACH_DISTRESS_TEXT=on`); `CRITIQUE_THANKS` and `stripApologies` (`src/lib/hostility.ts`, used in `coach.mts`).

**Decisions for the owner**
- The distress sentences are **off in production until you approve their wording** and turn `COACH_DISTRESS_TEXT=on`. This bullet is true as written once they are on, and still true (they are simply not yet added) if they are off. Approve the wording of `src/lib/distressText.ts` before the merge.
- If you later add fixed answers about Nenya inside the coach (the pre-written answers), add them to this list when they go live. They are not live yet.

## 4. What I do after you approve (mechanical, and I will tell you each step)
1. Copy the outgoing Terms to `docs/legal/archive/terms-and-privacy-until-<date it stops being in effect>.md`.
2. Edit `src/lib/legalDocument.ts` with the text above; set `LEGAL_EFFECTIVE_DATE` to the day it goes live (people are asked to agree again).
3. Add the row to `docs/legal/README.md`: "adds the respectful-use paragraphs, the encryption wording with the model named, and a full list of site-written text".
4. Update the tests that quote the Terms (d3 above; `tests/answers-draft.test.mts`; any that check Section 21 bullets), the pre-written answer `n-model` ownerNote, and the About "Terms of Service" page (it renders from the same file).
5. `npm run check`, commit message, PR snippet.

## 5. Not covered here
- The break's pause, the quiz and the turn charge or refund (later, with the trigger).
- The dehumanising-language and slur lists (later; private; need review by a counselor and a domestic-violence advocate).
- Any legal review.
