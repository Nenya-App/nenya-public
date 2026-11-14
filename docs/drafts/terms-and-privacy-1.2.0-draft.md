# DRAFT: Terms of Use & Privacy Policy for the 1.2.0 release

Status: a draft for the owner to read and edit, written 2026-11-12. **Nothing here is in the live document** (`src/lib/legalDocument.ts`, effective November 9, 2026). I am not a lawyer; the owner (and Fractured Atlas, if it wishes) should read it, and ideally a lawyer should. The process when it is approved is in `docs/legal/README.md`: archive the outgoing text first, edit, change `LEGAL_EFFECTIVE_DATE` (everyone is asked to agree again), add the table row, update the tests that quote the Terms, `npm run check`.

No section is renumbered. Section numbers below follow the live document: 4 Your Privacy & Data, 5 Your Responsibility, 14 The Short Version, 17 What the Site Does Not Do, 19 Cookies and Saved Settings, 21 The Coach Demo, 22 Changes and Contact.

## 0. What goes in, and when (the single list)
Some of the earlier drafts describe features that are **off** in production; their wording goes in **only when the switch is turned on**, or the Terms would describe something that does not exist. This draft separates the two.

| Part | Source | Goes in at the 1.2.0 merge? |
| --- | --- | --- |
| **A. The agreement record** (the site-signed Terms note) | new, below | **Yes.** It is built, in dev, and on for everyone who agrees. |
| **B. The respectful-use paragraphs, encryption wording, the full list of site-written text, replaced replies** | `terms-revision-2026-11-09.md`, `terms-fixed-replacements-draft.md` | **Already live** (effective 2026-11-09). Nothing to apply; check A does not contradict it. |
| **C. Sending a conversation** (the separate consent, 18+, the consent receipt) | `terms-transcripts-draft.md`, `transcript-contribution-terms-draft.md` | Only when sending a conversation is switched on in production. Part A's "later agreements" line then applies to it. |
| **D. Learning cards** | `terms-learning-cards-draft.md` | Only when `COACH_LEARNING_OFFERS` is switched on (it needs the list and approved cards, so **not at this merge**). |
| **E. Sealed mode and partner practice** | `terms-sealed-and-partner-draft.md` | Only when `COACH_SEALED` or `CELL_ENABLED` is on. |
| **F. The pause and the way back in** | `terms-respectful-use-draft.md` | Only when the pause exists. It does not. |
| **G. The distress sentences** | `terms-revision-2026-11-09.md` section 3 | Already described. **The owner approved the wording of `src/lib/distressText.ts` as it stands on 2026-11-13**, so `COACH_DISTRESS_TEXT=on` may be set (staging first). |

**Production switches stay off at the merge, so only A applies, plus the one-line checks in section 5.**

## A. The agreement record (new)
**What it is, in the code:** when someone agrees to the Terms, the page asks our server (`POST /api/terms-agree`) to sign a short note: the Terms' effective date, the time by the site's clock, and the site's build label. The server stores nothing and records no address or identifier. The page holds the note in the browser's **session storage** (gone when the tab closes), keeps it on the device only if the person turns on "Remember on this device", and wipes it on Forget me and Emergency Exit. When a coach transcript is signed, the note is copied inside its signed `meta.terms`; a consent receipt copies it as `termsAgreed`. A transcript without a note (older ones) still verifies and reads "no agreement recorded." (`src/lib/termsReceipt.ts`, `visitConsent.ts`, `deviceMemory.ts`, `netlify/functions/`; scope in `docs/carrythrough-consent-scope.md`.)

### A1. Section 4 (Your Privacy & Data): add to the list of what passes through outside your device
Today the paragraph lists four things. Make it five by adding, after the third:

> - when you agree to these Terms, your browser asks our server to sign a short note of that agreement (Section 19), which our server does not keep;

and change "Four things" to "Five things".

### A2. Section 14 (The Short Version): add after the sentence "It is gone when you close the tab."
> When you agree to these Terms, our server signs a short note: the date of these Terms, the time, and the version of the site. It has no address and nothing about you, and we do not keep it. Your browser holds it for your visit. If you later download a signed copy of a coach conversation, the note is included, so the file shows which Terms you had agreed to and when.

### A3. Section 17 (What the Site Does Not Do): amend the first bullet
Today: "…it does not create profiles or persistent identifiers for visitors…" Add at its end:

> The signed note of your agreement to the Terms (Section 19) contains only the Terms' date, a time and the version of the site; it is not an identifier, it is not linked to your connection, and it is not stored by us.

### A4. Section 19 (Cookies and Saved Settings): add a paragraph after the one about local storage
> Your browser also holds, for the length of your visit only, the signed note of your agreement to these Terms (Section 14). It is kept in session storage, which is erased when you close the tab; it is never sent to us again except inside a transcript you download or a conversation you choose to send. If you turn on “Remember on this device,” the note is kept on your device until you turn the switch off, press “Forget me,” or press the Emergency Exit button. We cannot read it on your device.

(The existing sentence that the date of the Terms is kept only with the Remember switch stays true for the *remembered* copy; the sentence above adds the session copy.)

### A5. Section 21 (The Coach Demo): in the bullet about signed transcripts, add
> A signed transcript includes the note of your agreement to the Terms, if you made one in this visit, so a reader can check which Terms applied and when. The note is signed by us; it contains no part of your conversation.

### A6. What the version and the time prove (a plain sentence, for Section 22 or the About page)
> The date in the note names the version of these Terms. The versions are public, with their dates, in our source repository (the file `docs/legal/README.md` lists them), so anyone can read the Terms that applied on that date. We recommend, and plan, a public tag in the repository for each version of the Terms so a version has a lasting name.

**Decisions for the owner (A)**
1. **The git tag.** Create a tag per Terms version (for example `terms-2026-11-12`) when this goes live? I recommend yes; a hash of the Terms text in the note would be stronger and is not built.
2. **"Which time."** The note carries the site's clock, not the browser's, so it can be trusted. The sentence says so only in effect; add a sentence that the time comes from our server if you want it said.
3. **Later agreements.** The note is copied into transcripts and the consent receipt but **not yet** into other forms (feedback, reports). Section A5 describes only the transcript; extend it if those are wired.
4. **No hashed address, no visit identifier** (as you decided). The text says the note has no address and nothing about you; this remains true only if that stays.
5. **Effective date and the key.** `LEGAL_EFFECTIVE_DATE` to the day it goes live. The signing has no switch of its own: it works whenever `COACH_SIGNING_KEY` is set (`netlify/functions/terms-agree.mts`; `COACH_BUILD` supplies the build label). So set the key on production before the merge, or the agreement step will have nothing to sign; check what the page does with no key.

## 5. Checks before the merge (one-liners, so nothing in the live text goes stale)
- **Model name in Section 21** matches the model in production (`MODEL_NAMES` in `src/lib/aboutNenya.ts`).
- **"Daily limit" and "six-hour rest" figures** match the production environment values.
- **Section 21's "site-written text" list** names nothing that is off in production (learning cards, the pause, the lane replies and history cards if those are not live). If a listed item is off, take it out until it is on.
- **The distress sentences**: the wording is approved, or `COACH_DISTRESS_TEXT` stays off.
- **Sealed mode and partner practice stay off**; the live text does not mention them.
- **The About page "Terms of Service"** renders from the same file; reload it after the edit.

## 6. Archive and README row (mechanical, after approval)
1. Copy the live `legalDocument.ts` text to `docs/legal/archive/terms-and-privacy-until-<date>.md`.
2. Add to the table in `docs/legal/README.md`: "adds the signed note of your agreement to the Terms (held for the visit, copied into signed transcripts and consent receipts, never stored by us)."
3. Update tests that quote Sections 4, 14, 17, 19 and 21 (search `tests/` for the phrases "Four things" and "persistent identifiers").

## 7. Not checked
I have not run the text against the code beyond the file names above; what the agreement step does when `COACH_SIGNING_KEY` is missing needs a look. A lawyer has not read this.

## H. Two additions to apply when their features go on (2026-11-12; draft, not applied)
**H1. The message form check** (built, on by default; `COACH_FORM_CHECK=off` turns it off). Section 21 (The Coach Demo), one bullet: "A message that is too short or too unclear to read (for example a single word, or a slip of the keys) is not sent to the AI and does not use up one of your turns; the page asks you to write it again, and your text stays in the box. This check never applies to a message that mentions distress or danger. It is simple, and it can be wrong; if it wrongly stops you, add a few words." Privacy list of counts: "how many messages were asked to be rewritten, as a count by 'too short' or 'unclear', with nothing about the message." This one applies at the 1.2.0 merge, because it is on by default.
**H2. Screening by a small model in shadow mode** (built, off: `COACH_SCREEN`). Not for the 1.2.0 merge unless shadow is switched on. Section 21 and the Privacy text: "A small AI model that runs on our own server, in memory, reads your latest message to help us measure how well our checks work. It keeps nothing, it never changes your reply or ends your conversation, and we count only how many messages fell in each of three bands, never the message or a score. If it is slow or unavailable, nothing changes." The model's name, licence and credit are in ATTRIBUTIONS.md. When the model starts to act (a card or a softer reply, never an ending), the text changes to say so, and the "How the checks work" page must exist first.

**H3. Edits the site makes to a reply** (built, committed `d9bddd8`; applies when `COACH_VALUES=on`). Section 21 (The Coach Demo), in the same paragraph as the list of words the site writes, after the sentence that begins "Our server adds short sentences to a reply in some situations". Proposed text:

> "When the coach's reply is about contempt for a group of people or a wish to harm one, our server may also change the reply: it puts a plain sentence of its own in front of it, or takes out sentences that repeated that contempt or wish back to you. A signed transcript marks each of these changes after the reply it applies to, and our server records one only if it can prove it made it. For a removal, the mark says how many sentences were taken out, not what they said. We do not record whether you opened or clicked anything the page offered."

Also, in Section 21 as it stands, "as written by the site,, rebuilt by our server" has a doubled comma (the words after it read as if a clause is missing); fix it in the same edit once you approve the wording.
