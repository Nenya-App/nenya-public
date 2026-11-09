# DRAFT: Terms wording for respectful use and pauses

Status: a draft for the owner to edit, written 2026-11-08. **Nothing here is in the live Terms** (`src/lib/legalDocument.ts`), and none of it may go live before the feature it describes exists (the pause and the way back in, `docs/coach-boundaries-scope.md`). I am not a lawyer; the owner (and Fractured Atlas, if it wants to review) should read this before it ships.

## Where it goes
Two places, so that **no section is renumbered** (the document has 11 references to Section 21 and others to Sections 3, 7, 15, 16, 19 and 22, which would all need checking):
1. **Section 5, "Your Responsibility"** gets the new paragraphs below (A), because that is where the Terms already say what the space is for.
2. **Section 21, "The Coach Demo"** gets one new bullet (B) about the second thing the browser keeps, next to the six-hour rest.
Whenever the live document changes, the outgoing text is first copied into `docs/legal/archive/` and the table in `docs/legal/README.md` is updated (see that file), and `LEGAL_EFFECTIVE_DATE` changes so everyone is asked to agree again.

## (A) For Section 5, "Your Responsibility", after the existing paragraph

> Nenya is a space for reflection: for looking at your own thoughts, feelings and needs. Strong feelings, including anger, frustration, and disagreement with Nenya or the coach, are part of being a person and are not a problem here. The coach is software; it is not hurt or offended by what you say to it, and hostile words aimed at the coach are not a reason for it to end your conversation.
>
> Please do not use Nenya, or the coach demo, to produce or share language that treats a person or a group of people as less than human (for example, calling people animals, vermin, or disease, or wishing them gone), to threaten or harass anyone, or to plan harm to others. This is not what the space is for.
>
> If a conversation goes in that direction, the coach may turn back to your own feelings and needs, may decline to continue, and may end the conversation. When it ends a conversation for this reason, the coach demo may pause for a short time. The pause is not a punishment, and it is not a judgment about who you are: the checks are simple phrase matching, they can be wrong, and a pause can follow a misreading. You can wait the pause out, or come back sooner by reading this section and completing a short reflective quiz. Nothing you answer in the quiz is sent to us or kept.
>
> If a message suggests you may be in distress or in danger, the coach responds with care and resources, as described in Section 6 and Section 21, instead of a pause. If you think a pause was a mistake, you can tell us through the optional form (Section 7).

**Notes for the owner**
- "Hostile words aimed at the coach are not a reason for it to end your conversation" is a **commitment about behaviour**. It matches the design (abuse aimed at the coach never ends a conversation; the break is for language about people and groups) and the code today, but a Terms promise is harder to change than a setting. Keep it, soften it ("are not, by themselves, ..."), or drop it.
- The sentence about **what is not allowed** is deliberately narrow (dehumanising language, threats, harassment, planning harm) and says nothing about swearing or insults. Add to it only what you are willing to enforce.
- It says "may" throughout (turn back, decline, end, pause), so the Terms never promise a pause that the code does not give.
- It makes **no claim about what Nenya does to anyone's behaviour or safety** (the honesty line in the boundaries scope).
- "Nothing you answer in the quiz is sent to us or kept" must stay true. The quiz is built so that it is (see `reentry-quiz-draft.md`).

## (B) For Section 21, "The Coach Demo", a new bullet after the six-hour rest bullet

> If the coach ends a conversation because it went in the direction described in Section 5, the page saves one more time in your browser’s local storage, and only the time: when the demo may open again. This pause is short. You can wait it out, or return sooner by completing the reflective quiz described in Section 5. Like the rest period, it is never sent to us and we cannot read it, it is not an identifier, and the “Forget me” button or clearing this site’s data removes it. Because it is only on your device, it does not stop anyone determined to return sooner, and it is not meant to. The quiz itself runs on your device, and your answers are not sent anywhere or kept.

**Notes for the owner**
- "This pause is short" should become a number when you choose the length (the boundaries scope suggests deciding it; a few minutes is typical for a pause that is meant to be gracious).
- The device-memory table (`docs/device-memory.md`) and `src/lib/deviceMemory.ts` get the new key when the feature is built (suggested name `nenya.coach.pause`), kept by "Forget me" the way the rest key is or erased by it (the rest key is erased); Emergency Exit erases it either way.

## What the live document would also need when this ships
- `LEGAL_EFFECTIVE_DATE` updated, the old version archived, the README table row added.
- The About page and the Name & Philosophy page do not describe the coach's limits today; the pause is a limit worth one line there.
- The pause screen and the quiz are described in `reentry-quiz-draft.md`.
