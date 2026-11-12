# Terms of Use & Privacy Policy: draft for sealed mode and partner practice

Status: **a draft, not applied.** Written 2026-11-11. The live text is `src/lib/legalDocument.ts` (effective November 9, 2026).
Nothing here takes effect until the owner approves it and applies it through the usual process (`docs/legal/README.md`):
copy the outgoing text into `docs/legal/archive/` first, then edit, then change `LEGAL_EFFECTIVE_DATE`. I am not a lawyer:
this needs the owner's approval, and ideally a lawyer's review, as for all Terms wording.

**When to apply it.** Only when one of the two features is switched on in production. While `COACH_SEALED` and
`CELL_ENABLED` are off, the live text stays accurate, because nothing described here can happen. A deploy preview with a
feature on, used only by the owner for testing, does not need it. If only one feature goes live, apply only its parts:
the A items are sealed mode, the B items are partner practice, and the C items are shared.

Section numbers follow the live document: 4 is Your Privacy & Data, 14 The Short Version, 17 What the Site Does Not Do,
19 Cookies and Saved Settings, 21 The Coach Demo, and 22 Changes and Contact.

---

## C1. Section 4 (Your Privacy & Data): replace the second paragraph's list

Current: "Four things pass through infrastructure outside your device: … and if you choose to try the optional coach demo,
what you type … is sent through our server to an AI service."

Replace with:

> Five things pass through infrastructure outside your device:
> - our web host keeps standard connection logs, and produces anonymous visit statistics from them;
> - if you choose to submit a report or message through the optional form, what you submit is sent to us;
> - if you press "Ask The Color API" in the Sight gateway, one color is sent through our server to that service (Section 16);
> - if you choose to try the optional coach demo, what you type, and any parts of a sensory report you choose to bring to it, is sent through our server to an AI service. In its sealed mode it is encrypted on your device first, so our server cannot read it (Section 21);
> - if you choose to use partner practice, your messages are encrypted on your device and pass through our server, which cannot read them, to the one other person in your cell (Section 23).
>
> Part Two of this document explains each in full.

(The rest of the paragraph stays as it is.)

## C2. Section 14 (The Short Version): add after "It is gone when you close the tab."

> Two optional features send what you write in a form we cannot read. In the coach demo's sealed mode, your device encrypts each message so that only the AI model's secure processing environment can read it. In partner practice, your device encrypts each message so that only the other person can read it.

## C3. Section 17 (What the Site Does Not Do): replace the third bullet

> It does not send what you enter in the reflection tool to any server. The exceptions are all things you start yourself:
> - the form, and the optional palette from The Color API (Section 16);
> - the optional coach demo (Section 21), including any parts of a report you choose to bring to it;
> - partner practice (Section 23), whose messages our server relays without being able to read them.

## C4. Section 19 (Cookies and Saved Settings): no change needed

Neither feature saves anything on your device: no key, no code, no conversation. If that ever changes, this section and
`docs/device-memory.md` must change with it.

---

## A. Section 21 (The Coach Demo): sealed mode

### A1. Replace the third bullet's sentence that begins "Before your message goes to Venice, our server encrypts it…"

> The demo can be used in one of two ways. You choose before the conversation starts, and the page explains the difference.
>
> - **Witnessed**, the way it has always worked. Before your message goes to Venice, our server encrypts it so that only Venice's secure processing environment can read it, and Venice's service relays only encrypted data. This is not encryption all the way from your device: your message first reaches our server, which reads it in memory to remove identifiers, check for crisis, and screen it (all described below), and does not store it.
> - **Sealed.** Your device first checks a report from Venice that the secure processing environment is genuine, with a challenge your device makes itself. It then removes identifiers, checks for crisis and screens your message on your device, and encrypts it so that only that secure processing environment can read it. Our server passes the encrypted message on without being able to read it, adds the coach's instructions (which it encrypts in the same way), and passes back the encrypted reply, which only your device can open.
>
> In sealed mode:
> - the checks run only on your device, and someone who changes the page on their own device can skip them;
> - your device checks the hardware's own evidence itself (that it is signed by Intel, that the encryption key was made inside it for your conversation, that it is not in a debug mode, and which software it runs), but it still relies on Venice for whether the hardware's firmware is up to date and not revoked, for the graphics processor's evidence, and for whether the software is the software Venice intends;
> - our server cannot sign a transcript, because it never sees the words, so a sealed conversation cannot be downloaded as a signed transcript, sent to us as one, or shown on the Witnessed Encounters page;
> - you cannot bring parts of a sensory report to a sealed conversation;
> - the coach's general method notes are used, not notes chosen to suit what you wrote.
>
> The five-exchange limit, the daily limits and the per-connection code described below apply to both ways, in the same way, and count together.

### A2. In the bullet on site-written words, add at the end

> In sealed mode our server cannot read the AI's reply, so the checks that replace or trim a reply run on your device instead, and our server adds no sentences to it.

### A3. In the bullet about crisis checks, add at the end

> In sealed mode these checks run only on your device. Our server is told only whether your device found a message that should be answered with care, or one that was hostile toward the coach, and it uses that to choose the coach's instructions. It is not told why.

### A4. In the bullet about the two daily limits, add at the end

> Sealed conversations count toward the same limits. Our server also keeps plain daily totals of sealed messages relayed and of secure-environment checks given to browsers, with nothing about who sent them or what they said.

---

## B. New Section 23: Partner Practice

The current Section 22 (Changes and Contact) becomes Section 24, and Section 23 is inserted before it. Any reference to
"Section 22" elsewhere in the document must be updated.

**Section 23. Partner Practice**

Opening paragraph:

> Partner practice is an optional, early version of a space where two people can hold a structured conversation, reached at nenya.biz/cell. It has no AI in it. If you choose to use it, this is what happens:

Bullets:

> - **The code.** One person makes a cell and receives a code of 16 letters and digits. They give it to one other person themselves, outside Nenya. Our server never receives the code. It sees only a mailbox name worked out from the code, which cannot be turned back into it. Two people can be in a cell, once each, and no one else can join.
> - **Encryption.** Your device encrypts each message so that only the other person's device can open it. The key the two devices agree on is tied to the code, so someone without the code cannot place themselves in between. Each message uses a new key. Both people are shown the same two colors and can compare them to confirm no one is in between.
> - **What our server sees.** Messages pass through our server, hosted by Netlify, which keeps them only in encrypted form, only while the cell is open, and cannot read them. It also sees each message's order and size, when it was sent, and a fingerprint of the message that reveals nothing on its own. A cell and everything in it is deleted when either person closes it, when either person leaves the page, and in any case within three hours, by an automatic job. Netlify may keep its own backups of its stores under its own practices, and, like any host, keeps ordinary connection logs.
> - **Crisis check.** Each device checks the messages it receives for signs of crisis. If a message clearly suggests someone may be in danger, the cell pauses for both people and the page shows crisis resources. Either person can pause and continue at any time. This is simple phrase matching: it can miss things and can flag harmless words. It runs on your device, not on our server.
> - **Reporting.** You can report a message the other person sent you. A report sends that message to us, together with the key that proves it was sent through the cell, so that a report cannot be invented or altered. Our server keeps the reported message, the time, and the fact that it checked out, in our private store, without the cell's mailbox name. It does not keep anything else from the cell. A message no one reports is never readable by us. Reporting reveals the message to us; it does not reveal who you are, and we cannot tell the other person who reported them.
> - **What we count.** We keep plain daily totals of cells opened and reports verified, with nothing about who or what was said.
> - **Nothing on your device.** Partner practice saves nothing on your device. The conversation is in your browser tab only, and is gone when you close it.
> - **Respectful use.** The respectful-use paragraphs in Section 5 apply. Partner practice is for practicing a conversation with someone who has agreed to it. Do not use it to harass, threaten or deceive anyone.
> - **Not a substitute for care.** It is not therapy, not mediation, not a substitute for professional help, and it cannot help in a crisis. It is not intended for people under 13, or under the minimum age in your country (Section 3).
> - **Legal basis (GDPR Art. 6(1)(a)):** your consent, given when you choose to make or join a cell.

**Owner decisions needed before applying B:**
1. **Accountability.** The About page says access can be revoked after verified, repeated abuse. With no accounts there is nothing to revoke. Either drop that promise from the About page, or decide on some form of identity, for example professionals sign in and clients join by code, and describe it here.
2. **Retention of reports.** How long are verified reports kept? A fixed time (for example 90 days) is suggested, with deletion by the same nightly job as transcripts. Nothing deletes them yet.
3. **Minimum age.** Is partner practice for adults only, like many peer-support services?
4. **AI help.** When "Send with AI" or "Receive translated" is added, the person who turns it on sends their own words to the coach route. A new bullet is then needed, and the B bullets above must stop saying "It has no AI in it."

---

## Other places that must say the same thing

These are not legal text, but they must agree with it:
- `src/lib/privacyModes.ts` (the wording the new screens show).
- The About page for partner practice (`src/app/components/about/PartnerPractice.tsx`) and its "planned, not built" notices, once the cell is live.
- The Privacy Promise and the pre-written answers about where messages go (`src/lib/aboutNenya.ts`).
- `public/llms.txt` and `README.md`.
- `docs/device-memory.md`, if either feature ever saves anything on the device.
