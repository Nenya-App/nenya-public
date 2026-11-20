# Terms and register: draft for rephrasing in a partner cell

Status: **a draft, not applied.** Written 2026-11-20 for the integrating session. The live text is `src/lib/legalDocument.ts`;
`docs/legal/README.md` is the process (archive the outgoing text first, edit, then change `LEGAL_EFFECTIVE_DATE`).
This builds on `docs/drafts/terms-sealed-and-partner-draft.md` (Section 23, partner practice) and applies **only when
`VITE_REPHRASE=on` is set on a production build**, together with `CELL_ENABLED=true`. While the switch is off the live text stays
accurate, because nothing described here can happen. Scope: `docs/dyad-rephrase-scope.md`.

## 1. Wording to add to Section 23 (partner practice), shown only where rephrasing is on

> **Rephrasing.** Inside a cell, the two of you can use an optional activity called rephrasing. It has no AI in it. One of you types a phrase and marks the words yourself (what you saw or heard, a story about it, a feeling, a need, a request); the other, if they say yes, marks what they heard in it. Each of you chooses, every time, what is sent to the other: a request (which holds no words), the phrase, your marks, a rewrite, a sentence of your own. You can say "Not now" without a reason, stop at any time, and close the cell.
>
> - **What our server sees.** The same as for any message in a cell: that a message of some size was left, when, and its order. It cannot read it, and it cannot tell a rephrasing message from a chat message. Rephrasing messages are padded to a few fixed sizes so their length reveals less.
> - **What we keep.** Nothing from a round. The cell and everything in it is deleted as described above. Your phrase, marks and rewrite are held in your browser's memory only, and are cleared when a round is done or stopped, and when you leave.
> - **What the other person can do.** Once they have read what you send, they can copy it, photograph it, or show it to someone. Encryption protects it from us and from anyone in between; it cannot protect it from the person you sent it to.
> - **Device checks.** Your device checks, before you send, the words you have typed, and tells only you if it finds words that may be about someone being in danger; the other person is not told. The other person's device checks what it receives and pauses the cell for both of you only for danger to a person. This is simple phrase matching, runs on the device, can miss things and can flag harmless words, and a person who changes their own copy of the page can skip it. Nothing about these checks is sent to us.
> - **Reporting.** You can report a rephrasing message the other person sent you. Before anything is sent, the page tells you that the report reveals every word in that message (the phrase, a rewrite, a sentence and marks) to us, together with the proof that it came through the cell. We keep it as described in the table below. A message no one reports is never readable by us.
> - **Leaving the page.** If your page is only hidden (for example, you switched to another app), the other person is told you may have stepped away and the cell stays open; after two minutes they are asked whether to keep waiting or close the cell. If your page is closed, the cell is closed for both of you, as before.
> - **Not for emergencies, not therapy.** Rephrasing is a practice. It does not tell anyone who is right, and it is not a way to settle a situation in which one of you is afraid of the other.

> **Ordinary messages in a cell (when rephrasing is on).** The same device checks apply to the messages you type: before you send one, your device checks it and tells only you if it finds words that may be about someone being in danger or being hurt by someone; the other person is not told, and you can still send it. The other person's device pauses the cell for both of you only for danger to a person, not for anything you write about being hurt or afraid. Nothing about these checks is sent to us. (Without rephrasing the existing Section 23 wording stays as it is.)

Also add to the Short Version (Section 14), partner-practice item: "Rephrasing is optional, has no AI, and sends only what you choose, each time."

## 2. Report keeping time (decided by the owner, 2026-11-20: 30 days)

Today a verified report is kept in the private store with no stated keeping time (the stack document lists "the owner panel for
verified reports, and their keeping time" as left to do). **Proposal: 30 days, then deleted by the daily expiry job, or sooner when the
owner has dealt with it.** Reason: long enough for the owner to review one, short enough that intimate words are not held for
long. The minimum that is workable is the cap; if the owner prefers shorter, 14 days would also do. Until a job exists, the owner
deletes reports by hand and notes the date. Nothing in the page's wording yet states a time; add it to the report notice when decided.

## 3. Register rows (for `docs/data-register.md`, for the integrating session to add)

| What | Where | Kept | Deleted by | Who can read it |
|---|---|---|---|---|
| Rephrasing round (phrase, marks, rewrite, sentence) while a cell is open: ciphertext only | private store (the cell's mailbox) | until the cell is closed; three hours at most | `cell-cleanup` (hourly); either person closing the cell | the other person in the cell only |
| Rephrasing round on each device (drafts, the round, messages received) | the page's memory only | until the round is done or stopped, or the page is left | clearing at "Done with this" and "Stop rephrasing"; closing the tab; Emergency Exit | the person at that device |
| A reported rephrasing message (the whole message as sent, its time, "verified"; no cell name) | private store (`cell-report/…`) | 30 days (decided by the owner, 2026-11-20) | the owner by hand now; a daily job to be written | the owner |

Not stored anywhere by us: the private device-check results, which person asked or declined, how many rounds, any mark counts.

## 4. Other places that need the words (not edited here)

The About page for partner practice (`src/app/components/about/PartnerPractice.tsx`); the scripted preview in
`src/app/components/DyadicCellInterface.tsx`, whose "Send with AI" and "Receive translated" toggles and "AI translation (planned)"
steps now contradict the decision that there is no AI in the dyad in v1 (it is a scripted demo and was left unchanged; it needs a
rewrite as a rephrasing preview); `docs/data-register.md`; `docs/README.md` (index row for `dyad-rephrase-scope.md` and this file).
