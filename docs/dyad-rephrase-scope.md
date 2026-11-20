# Rephrasing in a partner cell: scope (draft for the owner, 2026-11-20)

**Status: scope only. No site code is changed by this document.** It describes a two-person flow, "rephrasing", built on the
solo phrase workbench and carried through the existing encrypted partner cell. A clickable prototype of the flow (invented
example phrases only) accompanies it; its link is in the commit message and the hand-over note.

**Depends on:** the solo phrase workbench (scoped separately; its scope document was not yet on its branch when this was
written, so everything below that says "reused from the workbench" is an *assumption about its parts*, listed in section 11,
to be checked once that document exists).

**What the owner asked for.** The workbench could "become the basis for the actual translation dynamic in the dyads". The
working idea: one person's marked phrase and their rewrite travels through the encrypted cell to their partner; the partner
marks what they heard; the tool shows "what I meant" next to "what I heard".

**Decisions already made (not reopened here).** The person marks everything themselves. No scores, trends or labelling of a
person (the Check-in was dropped until validated instruments exist). No red marks, no "wrong" labels. WCAG 2.2 AAA: tap or
key to mark, never colour alone, screen-reader announcements. Text stays on devices and is never stored by us. English only.
Nothing is suggested by the app unless asked. CNVC is credited as "The Center for Nonviolent Communication © 2023,
www.CNVC.org" wherever its categories are shown, and the communal-needs layer is said to be a project extension.

---

## 1. How the cell works today (what it can and cannot do)

Read from `src/cell/CellPage.tsx`, `src/lib/cellClient.ts`, `src/lib/cellCrypto.ts`, `netlify/functions/cell.mts`,
`netlify/functions/cell-cleanup.mts`, `src/lib/privacyModes.ts`, `docs/ghost-footprint-stack.md`. The channel is built and
off (`CELL_ENABLED=true` turns it on); the `/cell` page exists; the Terms for it are drafted, not applied.

**Joining.** One person makes a cell and gets a code (80 random bits, shown as `XXXX-XXXX-XXXX-XXXX`, no look-alike
letters). They give it to one other person themselves. The code is never sent. From it each browser derives a mailbox name
(all the server sees) and a secret that tags the key exchange. Each side makes a one-time P-256 key and leaves its public key
with a tag in the mailbox; each checks the other's tag. Only the person who made the code can open a cell; the other can
only join an open one. Each of the two seats is taken once, with a create-only write, so a third person is refused (unless
they get in first with a stolen code, see section 7). Both people then see two "safety colours" made from both public keys
and are asked to compare them out loud; the same colours mean no one is in between.

**What is encrypted.** Everything in a message except its sequence number and a commitment: the text, the message kind
(`text`, `pause`, `resume`, `close`), the time, and an optional AI-assisted version. Each message uses the next key in a chain
for its direction and the previous key is thrown away (forward secrecy). AES-256-GCM, with the mailbox name, sender, sequence
number and commitment as authenticated data. Altered, replayed or out-of-order messages are refused. Only the browser's own
WebCrypto is used.

**What the server sees.** The mailbox name; each side's public key and tag; for each message its sequence number, its size
(ciphertext length), when it arrived, and a franking commitment (a fingerprint under a random key that is inside the
encrypted message). It sees how often each browser polls, and ordinary connection details like any host. It cannot see the
text, the kind of message, or the code. The daily counts it keeps are cells opened and reports verified, with nothing about
who or what.

**What is kept, and for how long.** Messages sit in Netlify Blobs only while the cell is open. A cell is deleted when either
person closes it, when either person leaves the page (`pagehide` closes it), and in any case three hours after it opened
(enforced on each request and by the hourly cleanup). At most 300 messages per side, about 12 KB per message. Nothing is kept
in the browser either: the conversation lives in page memory. The Terms draft says Netlify may keep its own backups and
ordinary logs under its own practices.

**How a conversation ends.** Either person's "Close and delete the cell" sends an encrypted `close` and deletes the mailbox.
Leaving the page closes it for both. Expiry deletes it. The other side learns through the `close` message, or a 404/410 on
its next poll, and sees "The other person closed the cell" or the three-hour notice.

**What safety there is today.**
- *Crisis check on the reader's device.* Every incoming message of kind `text` is checked with `detectFlag`; a stop-tier flag
  pauses the cell for both and shows resources. Phrase matching only: it misses and misfires, and the page says so.
  **Gap found while reading:** `cellClient.ts` runs the check only when `m.kind === 'text'`, so any new message kind added for
  rephrasing would skip it unless the check is extended (section 7, and the plumbing commit in section 15).
- *Pause* by either person, and *resume* by either person. *Close* by either person. The Emergency Exit button closes the cell.
- *Report* one message the other person sent: the reporter reveals its text and the franking key, the server confirms it
  really came through this cell, and keeps it (text, time, "verified") in the private store, without the mailbox name. The
  report route accepts text up to 4000 characters.
- *Origin check*, size caps, and no AI in the cell (the page says "Send with AI" and "Receive translated" are not available).
- *What it does not have.* No check of what a person writes before it is sent. No hostility check between partners (the
  existing `src/lib/hostility.ts` is about hostility toward the coach, and is not to be reused for this). No way to tell who
  is on the other end, no identity, no way to revoke access after abuse (the stack doc lists this as an open question).
  No check on the sender's own side.

**Server-side checks cannot run on cell content.** The server cannot read it, so the crisis, hostility and hate-speech checks
that run in Witnessed mode cannot run here. Any check runs on a device, or not at all. And, as in Sealed mode, a person who
edits their own page can skip the checks on their own device; a device check protects an honest page, not against a
modified one. This is stated, not hidden, wherever checks are mentioned.

---

## 2. What rephrasing is, in plain words

Two people are in a cell. One of them has a phrase they said, or would say, that they think might land differently from how
they mean it. Using the workbench, on their own device and in private, they mark what they meant by the words. If the other
person is willing, they hear the phrase, mark what *they* hear in it, and then both people can look at the two readings of
the same words, side by side, if both choose to. The app suggests nothing, scores nothing and decides nothing. Neither reading
is "the right one".

It is a practice, not a verdict. It is not therapy, not for emergencies, and not a way to settle who is right.

---

## 3. The flow, step by step

Two people, "Sam" (has a phrase) and "Alex" (hears it). Either person can be either; a round is one phrase, and only one round is open at a time. Names are invented.

| # | Step | Sam sees | Alex sees | Travels |
|---|---|---|---|---|
| 0 | Both are in the cell (code, safety colours: all as today). Either opens "Rephrase". First time, each person, separately, sees one short screen: what rephrasing is, what is sent and what is not, who can see it, that either can stop at any moment and no reason is needed, that it is not for emergencies. Each taps "I understand" for themselves. | the screen | the screen | nothing |
| 1 | **Sam prepares, alone.** In the workbench: types the phrase, taps words to mark them (what they saw or heard, a story about it, a feeling, a need, a request), may fill a frame, may move a met-to-unmet slider on a need, may write a rewrite and mark that too. | their own work | nothing: no sign Sam is working, no typing signal | nothing |
| 2 | **Sam asks.** "Ask if they would like to hear a phrase". A review screen says exactly what will be sent: a request, with no words from the phrase and no length. | the review, then "Waiting. You can cancel." | the ask (below) | one small message: "a round is requested" |
| 3 | **Alex decides.** Alex sees: "They would like to share a phrase and hear what you hear in it. Nothing has been shown yet." Buttons of equal weight: **Yes, I will look** · **Not now** · **Not in this cell**. No reason is asked for. | "They would like to wait" (for Not now) or "They would rather not rephrase in this cell". Nothing else, no reason, no repeated nudge. | the three choices | one small message: yes / not now / not in this cell |
| 4 | **Sam sends the phrase, unmarked.** The review shows exactly the phrase that will go, with Sam's marks and rewrite *not* included, and "Send" / "Not after all". | review | nothing yet | the phrase text only (plus a round number) |
| 5 | **Alex hears and marks.** Alex reads the phrase and, in the workbench, marks what *they* heard in it: the words, and which kind. Feelings and needs are called "my guess" in the words on screen. Alex may mark nothing, may skip marking, may add one sentence of their own. | "Alex is looking" is *not* shown; no status | the phrase, and the marking tools | nothing yet |
| 6 | **Alex chooses what to send back.** Review: "Send my marks and sentence to Sam" · "Keep my marks to myself" · or "Skip marking". Equal weight. | nothing | review | Alex's marks and sentence if chosen, or a "skipped / kept private" notice |
| 7 | **Reveal together.** Sam's device now holds Alex's marks, still hidden. Sam sees: "Alex has answered. When you show what you meant, you will see what they heard." **Show what I meant** · **Not now**. | the choice | "Waiting for Sam to show what they meant" (no pressure wording) | on yes: Sam's marks, sliders (only if Sam ticked "include"), and the rewrite |
| 8 | **Two readings, side by side** (section 4). If Alex kept marks private, Alex's device shows Sam's meant next to Alex's own marks, and Sam's device shows Sam's meant only. | both readings (or Sam's own) | both readings | nothing more |
| 9 | **Optional: hear the rewrite.** If Sam included a rewrite, Alex may mark it too ("Hear the rewrite") and choose again whether to send those marks back. | their rewrite, then (if sent) Alex's marks on it | the rewrite, and the same choices | as chosen |
| 10 | **Close the round.** Either person: "Done with this". The round is cleared from the memory of that device. Either person can start a new round (back to step 1), or go back to ordinary conversation, or pause, or close the cell. | ... | ... | a small "round done" message |

**What each person never sees.** Sam never sees Alex's draft marks before Alex chooses to send them, never learns whether Alex
opened the phrase, never sees a reason for "Not now", and never sees a count or any other number. Alex never sees Sam's marks
or rewrite before marking (so Sam's reading cannot steer Alex's), never sees Sam's draft, unsent rewrites or deleted marks,
and never sees Sam's sliders unless Sam ticked "include". Neither person sees a typing signal, a read receipt, a progress bar
for the other, a streak, an "agreement" figure, or any text written by the app about either person. Nenya (the server and the
owner) never sees any of the content, except one message a person chooses to report (section 6).

---

## 4. "What I meant" next to "what I heard", and how the difference is shown

**The view.** The phrase appears once, in words. Under it, two readings, in the same order and the same layout, headed
"What Sam meant" and "What Alex heard", in each person's own name for themselves ("What I meant" / "What they heard" on
their own screen). Words are grouped by the five kinds in a fixed order: what was seen or heard, a story about it, a feeling,
a need, a request. Each kind is a small named section with a text heading, not a colour. Each marked word is listed as text
with its kind spelled out. Sliders, if included, appear as a sentence with a number-free word scale ("this need is met", "this
need is partly met", "this need is not met"), never as a graded bar alone.

**The difference, in words.** Per word, one of four plain statements, in this wording:
- "Marked the same way by both of you."
- "Marked by both of you, as different kinds. Sam: a story. Alex: what they saw." (kinds named, not ranked)
- "Marked only by Sam."
- "Marked only by Alex."

**What is deliberately absent.** No summary line ("3 of 5 match"), no percentage, no "gap", no ordering by how different, no
green and red, no "wrong", "mismatch", "missed", "misunderstood", "agree", or any count. Marked words are not highlighted to
draw the eye to the differences; the four statements are reading aids, not alarms. Unmarked words are not mentioned. The text
at the top says only: "Two readings of the same words." The words "left unmarked" are an allowed, normal state.

**Feeling and need marks by the hearer** are shown as "a guess" ("Alex's guess at a feeling: tired"). A guess is not a
claim about Sam.

**Same on both screens.** Whatever is shown to one person in the comparison is shown to the other in the same order, so there
is no private reading of the other person's marks that the other cannot see. (If a person kept their marks private, only
their own side is shown, and the other's device says so in neutral words.)

**What the view does not do.** It does not suggest a better phrase, say what the rewrite "fixes", or point at a "reason" for a
difference. If, later, someone asks the app for help (solo workbench only; see question 12 in section 16), that is a separate act in the solo
tool and not part of the cell.

---

## 5. What travels, and what must never travel or be stored

**What travels (all inside the encrypted cell, new message kinds, sizes capped; section 6 shows the format):**
- a request (no content); an answer to a request;
- the phrase text (≤ 1000 characters, the same cap as an ordinary cell message);
- the person's own marks: for each, the word positions and the kind (one of five), nothing else;
- optional need sliders, only the ones the person ticked "include";
- the rewrite text (≤ 1000 characters) and its marks;
- the hearer's marks and one optional sentence (≤ 300 characters);
- control messages: pause, resume, stop rephrasing, done with this round, close.

**What must never travel.** Drafts, deleted marks, anything the person did not choose to send; any text typed in the
workbench's "ask for help" (solo only); any inferred label about a person (no "tone", "sentiment", "hostile", "contempt");
any count, score or trend; the person's name or any identifier; the device or browser's details; the other person's marks
sent *to a third party*; any phrase or marks to the AI coach route.

**What must never be stored.** By us: nothing from a round. The mailbox holds ciphertext for as long as the cell lives. We
keep no phrase, no marks, no sliders, no rewrite, no counts of rounds, no flag results from device checks, and no log that a
check ran. By the browser: nothing in `localStorage`, `sessionStorage`, IndexedDB, cookies or the URL; the round lives in
page memory and is cleared on "Done with this" and on leaving. No analytics events with content. (A person copying or
saving their own words is theirs to do, and Nenya does not offer a save in the first version; see the open questions.)

**What is kept if a message is reported:** exactly the one message the reporter chose, with its time and "verified" (today's
behaviour, section 6).

---

## 6. Encryption and keys: what is reused, what is protected from whom

**Reused as they are:** the cell code and mailbox, the handshake, the safety colours, the key chains, `sealMessage` /
`openMessage`, franking, sequence numbers, the 3-hour limit, closing and the `pagehide` close.

**What is added.** Message kinds, in `CellMessage['kind']`: `rp-ask`, `rp-answer`, `rp-phrase`, `rp-heard`, `rp-meant`,
`rp-control`. The kind is inside the ciphertext, and the structured content goes in the existing `text` field as JSON with a
version number and a round id (random, 8 hex characters):

```
{ "v": 1, "round": "a1b2c3d4", "step": "phrase", "phrase": "…" }
{ "v": 1, "round": "a1b2c3d4", "step": "heard", "marks": [[w0, w1, "story"], …], "note": "…" }
```

Because the server never inspects the kind or the text, **no server change is needed.** The franking commitment already
covers `kind` and `text`, so reporting works unchanged, provided the whole message stays under the 4000-character report
cap (the sizes above are chosen to fit: phrase + marks + sliders is comfortably under it, and the client refuses to build a
larger one). Old pages that do not know the new kinds ignore them (`onMessage` in `CellPage.tsx` handles only the known
kinds), so a person on an older page sees nothing from a round; the ask carries a version so the asker is told "their page
cannot do this yet".

**Optional hardening, without weakening anything:**
- *Size padding.* The server sees each message's size. Pad rephrase payloads (in the plaintext, before encryption) to a few
  fixed sizes (for example 512 B, 1 KB, 2 KB, 4 KB) so size reveals less about phrase length or number of marks.
- *Locking what was meant.* Sam's phrase message may carry a commitment (an HMAC under a random key) to Sam's marks and
  rewrite; the later reveal carries the key, and Alex's device checks the match. It shows that "what I meant" was fixed
  before Alex marked. It is about trust between the two people, not secrecy, and it is the last item in the build order.

**Exactly what is protected, from whom.**

| From | What it covers |
|---|---|
| **Nenya's server, the owner, Netlify, anyone on the network** | The phrase, marks, sliders, rewrite and sentence: all encrypted on the sender's device, readable only by the other person's device. They also cannot tell a rephrase message from a chat message. |
| **A later break-in** (a key found afterward) | Earlier messages stay closed, because each message key is thrown away after use (forward secrecy). |
| **A third person who does not have the code** | Cannot join (two seats, once each), cannot swap a key (tagged with the code's secret), cannot read or alter messages. |
| **Altered or replayed messages** | Refused. |

**What the encryption does not cover (said plainly, also on the first-use screen):**
- **The other person.** Once Alex has read it, Alex can copy it, screenshot it, photograph the screen, read it out, or show
  it to anyone. Nothing here can stop that, and no honest page could. The first-use screen says so; the "Done with this"
  button clears the page's memory, not the other person's.
- **A reported message.** Reporting reveals that one message, exactly as sent (for a rephrase message: the phrase or the
  marks and rewrite in it), to Nenya and the owner. The report button says so in those words before anything is sent.
- **Someone looking at your screen**, or a person who has your phone, an unlocked device, or malware on it.
- **A modified page.** Someone who edits their own copy of the page can skip the device checks, or display things the page
  would not, on their own device.
- **Metadata.** The server sees that a cell exists, when it opened, how many messages each side sent and when, their rough
  sizes (less with padding), and polling. It sees *that* two people are talking, not what about.
- **A stolen code.** Anyone who gets the code before the second person can take the second seat. The safety-colour
  comparison is what catches this, and it works only if the two people really compare out loud. Rephrasing should not begin
  until that comparison is done (the flow requires "They match").
- **Netlify's own backups and ordinary logs** (stated in the Terms draft already).
- **Two people sharing one device.** Rephrasing needs two browsers; it cannot detect, and does not protect, a case where
  one person is reading the other's screen.

---

## 7. Safety in a dyad

The principle: **protect people with structure and choice, not by reading what they write.** Nothing here proposes weakening
the encryption: no key escrow, no scanning by the server, no device check that reports its result to the server. Device
checks run on the device and their results stay there; the cell does not tell the server a message was flagged (unlike
Sealed mode, where the server is told whether a message needed care so it can choose the coach's instructions; there is no
coach here).

**Hostility or contempt between partners.** There is no reliable way to detect it, and none should label a person. Phrase
matching on contempt would misfire constantly, would amount to labelling, and could be turned into evidence. So the answer
is design, not detection:
- *Consent before words move* (steps 2 to 4): the hearer sees nothing until they say yes, and "Not now" needs no reason.
- *Reading, not accusing:* the hearer's marks are always worded "what I heard" / "my guess", never "what you said".
- *No comparison scoring,* so nothing can be used as "see, you got it wrong".
- *A stop that is always one tap away,* the same for both (see "Pause or leave" below).
- *No export of the side-by-side view,* no "copy as text", no shared link.
- *Nothing sent to the partner by the app about their partner's words,* no "they used a harsh word" notice.

**One person pressuring the other.** One open round at a time; no queue; no repeated nudges after "Not now"; "Not in this
cell" ends asks; the asker never learns whether the other opened or marked anything; the hearer may mark nothing; nobody
sees who ended a round. The app cannot stop pressure that happens outside it (in the room, in the message that carried the
code). It can make saying no cost nothing in the page and leave no record that says "refused".

**A person in distress.** Today's reader-side crisis check pauses both devices and shows resources. For rephrasing:
- The check must be **extended to every text field** of every new kind (the gap in section 1).
- A **private check on the sender's device before sending**, over the phrase, rewrite and sentence, shows resources to the
  *sender only* and lets them choose: send, edit, or stop. The partner receives no pause from this and no flag.
  Reason: a message in which someone writes about their own safety, or about being afraid of the person they are in the cell
  with, must not trigger a notice on that other person's screen. A flag shown to the person who is, perhaps, the source of
  the fear is a safety risk to the writer. This is why the reader-side notice is limited to **danger to self or others**
  (stop-tier `self-harm` and `harm-others`); the existing `abuse` category (partner or family, control or fear) shows
  resources to the *writer*, privately, and never reaches the partner's screen. *(The owner should confirm this split;
  I did not run the flag categories against example text, so which abuse phrasings are stop-tier is untested here.)*
- Either person can **pause**, immediately, without a reason; both devices stop sending.
- A page, not a person: the resources shown are the ones the site already uses (`resourcesFor`, `FlagNotice`).

**Someone who wants to stop.** Three levels, all always visible, never hidden behind the workbench:
1. **Pause:** both devices hold everything; either may resume.
2. **Stop rephrasing:** the round is cleared on both devices and the cell goes back to ordinary conversation. No reason, no
   notice beyond "Rephrasing has stopped."
3. **Close and delete the cell:** as today. And the Emergency Exit dock, as today.

**What cannot be done without reading the content (stated plainly).** The server cannot check the content, so no server-side
crisis, hostility or hate-speech check is possible, and none should be built by weakening the encryption. A person who edits
their own page can skip every device check. A device check is phrase matching, not understanding, and misses and misfires.
Nothing here is allowed to say that rephrasing is monitored, or that it detects crisis or abuse. It says what it does: "Your
device checks the words it receives for signs that someone may be in danger. This can miss things."

**What rephrasing should not claim.** It is not therapy and not for emergencies; it is not couples counselling; it does not
tell anyone who is right; and it does not make a hard conversation safe for someone who is in danger from the other person.
The first-use screen includes the national hotline line the cell page already shows.

---

## 8. Pause or leave at any time

- **Pause** (both people, either person can start or end it): as today (`pause` and `resume`). During a pause the workbench
  is read-only on both devices and nothing sends. Pause is also what a crisis flag does today.
- **Stop rephrasing** (new): clears the round on both devices. No reason shown.
- **Close and delete the cell:** as today; the Emergency Exit button too.
- **Leaving the page closes the cell for both people** (today's `pagehide` behaviour). Rephrasing makes this matter more: a
  round is slow, and on some phones switching to another app can fire `pagehide`, ending the cell without anyone choosing to.
  This is untested here and is the first open question under "failure modes". A possible change (a short grace period, with a
  "Still there?" prompt, before closing for the other person) alters the cell's current rule and is the owner's call.
- **Waiting is allowed.** A device whose tab is hidden stops polling; the other person's page says "Waiting. They may be
  away. You can cancel." and never "they ignored you".
- **The three-hour limit** remains. The page says when about 15 minutes remain, in text and to screen readers, and the cell
  cannot be extended (it exists for privacy). See section 9 for what AAA asks here.

---

## 9. Accessibility (WCAG 2.2 AAA)

Two people can be on different devices (a phone and a laptop), with or without assistive technology, so every screen is
designed to be complete for one person alone, and the comparison view is the only place both people's work meets.

- **One person's view per device,** never "two panes on one screen" for the two people; the prototype's two panes are for
  *understanding the flow*, not a layout to ship. On a phone: one column, one step at a time, with a step list that can be
  reached by keyboard and by screen reader.
- **Marking is not colour-only.** Each of the five kinds has a **text label** (always visible on the marked word in the text
  view, in the list, and in the legend), a **distinct non-colour cue** (underline pattern or border shape: solid, dotted,
  double, dashed and so on, by text decoration or border style, plus a one-character shape glyph), and the
  accessible name carries it: "tired, marked as a feeling". Colour may be added as a third cue and is never needed.
- **Tap or key to mark.** A kind is chosen first (a radio group), then words are toggled by tap, or by arrow keys + Space or
  Enter. No drag. Un-marking is the same action. A word can hold one kind; changing a kind is a normal choice, with undo.
- **Sliders** have a 5-step radio or stepper alternative in text ("met, mostly met, partly met, mostly unmet, unmet"), and are
  never the only way; no drag is required (2.5.7), and the target size is at least 44 by 44 CSS pixels (2.5.5, AAA).
- **Screen-reader announcements** (polite live region, never stealing focus): "A request has arrived from the other person.
  Open it when you are ready." The *content* of a phrase is **not** read out automatically on arrival; the person opens it.
  Status changes ("They paused", "The round is done", "Rephrasing has stopped") are announced. A person marking hears the
  mark and its kind. The comparison view has headings per kind and plain-text statements (section 4), readable in order.
- **No time pressure.** No countdowns except the cell's own three-hour limit, announced with 15 minutes left and again at
  five (2.2.6 and 2.2.3 ask that timing not be essential; the three-hour limit is a privacy rule and is declared as such,
  not an interaction timeout; the owner should decide whether this is acceptable; see open questions).
- **Interruptions can be postponed** (2.2.4): the other person's request is shown in a quiet place; it never moves focus.
- **Review and undo before sending** (3.3.4, 3.3.6, AAA): every send shows what will go, in text, with "Send" and "Not
  after all".
- **Reading level and plain words** (3.1.5, 3.1.3): lower-secondary level; no jargon; the five kinds each have a one-line
  plain description and a glossary; "need" and "request" are explained in plain words and not used as technical terms.
- **Contrast 7:1** for every text on every surface, in light and dark (the existing contrast test, with new tokens added to
  it before use, per `docs/accessibility-standard.md`); focus rings visible; reduced motion respected; nothing flashes.
- **CNVC credit** appears on the marking screen and on the comparison view, wherever the categories are shown (the exact
  line, below), and the screen that shows communal needs says in plain words that this layer is a project extension.
- **English only** (3.1.1 declared; no translation or language switching in this flow; see `docs/translation-layer-scope.md`
  for why the word "translation" is kept for languages).

Credit line, as it must appear: *"The Center for Nonviolent Communication © 2023, www.CNVC.org"*. And, where communal needs
are present: "The communal-needs layer is a project extension and is not part of the CNVC list."

---

## 10. Naming: "rephrasing"

The site already uses "translation layer" for translating between languages (`docs/translation-layer-scope.md`). "Rephrasing"
avoids that clash, and it is also more accurate: the app translates nothing and decides nothing; the *speaker* may find
another way to say the same thing, and the *hearer* says what they heard. "Translate" suggests one correct rendering of the
other person's meaning, which is exactly what this flow must not imply. Places to rename when built: the "Send with AI" and
"Receive translated" toggles in the scripted preview (`DyadicCellInterface.tsx`) and the "AI help" card in `CellPage.tsx`.

---

## 11. Reused from the solo workbench, and what is new

**Assumed reused (to verify against the workbench scope when it lands):**
- the phrase tokenizer and the marks model (word index ranges and one of five kinds);
- the five kinds, with their CNVC wording and credit, and the communal-needs layer;
- the mad-libs frames and the met-to-unmet sliders (optional);
- the marking component (tap or key to mark, text labels, announcements);
- the "nothing suggested unless asked" rule and the no-scores, no-labels rule;
- the in-memory-only, nothing-stored rule.

The tokenizer must be **byte-identical on both devices** (so word positions mean the same words); the payload carries a
tokenizer version, and a mismatch is refused with a plain message.

**New in this flow:**
- the message protocol, round states and who may do what when (section 3), as a pure, tested state machine;
- consent messages and the asks;
- blind-then-reveal ordering;
- the comparison function and view (pure; section 4);
- the private pre-send device check and the extension of the receive-side check to the new kinds (section 7);
- pause, stop and leave integration with the workbench;
- the first-use screen, the report wording for rephrase messages, the terms and About-page changes;
- the "no AI in the dyad" stance (question 12 in section 16).

---

## 12. Risks and failure modes

- **Using it to win.** A person marks the other's words as "story" to correct them, or screenshots the comparison as proof.
  Mitigations: first-person wording; "a guess" for feelings and needs; no scores or summaries; no export; one reading is not
  "right"; the hearer's marks are theirs to send or keep. It cannot prevent a screenshot (section 6), and the first-use
  screen says what rephrasing is not for.
- **Correcting the other person.** Alex uses "what I heard" as "what you really meant". The view shows two readings, never a
  combined one, and the app never says which is accurate.
- **Over-labelling.** Marking everything. Leaving words unmarked is a normal state, no count of marks is shown, and nothing
  nudges a person to mark more. The hearer may skip marking.
- **Marks read as accusation.** A hearer marking "story" on a phrase can sting. Wording ("When I heard this, I took it as a
  story") and the hearer's choice to send or keep private; an option to share only feelings and needs (not stories) is a
  question for the owner.
- **Pressure and withdrawal.** See section 7; "Not in this cell" and the lack of any trace of refusal.
- **Distress and safety.** A round surfaces something painful; the pause is immediate, the resources are shown only to
  the person who wrote the words, and nothing says "you triggered this".
- **Abuse in the pair.** The cell has no identity and cannot protect someone from the other person or revoke anyone's access
  (the stack doc's open question). Rephrasing must not be offered as a way to resolve an abusive situation, and the
  first-use screen says so in plain words.
- **A phone leaves the page.** A round ends silently when the cell closes on `pagehide` (section 8). Needs a test on real
  phones and a decision.
- **The other person is not there.** A hidden tab stops polling; a round can wait indefinitely. A "waiting" message, never
  "ignored", and a plain way to cancel; rounds expire with the cell.
- **State lost.** A reload or crash loses the round (by design). The page says so before the first round, and does not
  promise to keep anything.
- **Old pages.** A partner on an older page ignores the new kinds. The ask carries a version; the asker is told "their page
  cannot do this yet", and nothing else is sent.
- **Report cap.** A reported rephrase message must fit in 4000 characters; the client builds nothing larger.
- **Both people on the same device.** Not detectable; the first-use screen says rephrasing needs two devices.
- **The tokenizer disagrees.** Marks point to the wrong words. A version check; refusal with a plain message.
- **Terms and report keeping.** Reports of rephrase messages reveal intimate words to the owner. The Terms draft, the report
  button and the keeping time (a stack-doc open item) must be settled first.

## 13. How it differs from the Sealed coach tunnel

| | Sealed coach | Rephrasing in a cell |
|---|---|---|
| Who is on the other end | An AI model in a secure enclave | The other person, on their own device |
| Who can read | The enclave (run by Venice, on attested hardware) | The other person only |
| Keys | The device encrypts for the enclave's key (secp256k1), after checking the hardware evidence | Derived from a code the two people share; P-256; safety colours to compare |
| What the server does | A relay that never reads the words; adds nothing readable; told only whether the device found care-worthy or hostile text, so it can pick instructions | A mailbox holding ciphertext, up to three hours; told nothing about content or flags |
| What is kept | Nothing by us | Ciphertext only while the cell is open |
| Checks | Device only (crisis, identifier, instruction); a modified page can skip them | Device only (crisis); a modified page can skip them; nothing is told to the server |
| Records | None can be signed | None; a reported message is the one exception |
| Reports | Not applicable | One message, revealed by the reporter, verified with franking |
| AI | The point of it | **None in rephrasing (v1)** |
| What it asks of the person | Write, to the coach | Mark, and choose what to share, with a person |

The two share a principle (the server cannot read the words, checks run on devices), and rephrasing does **not** use the
Sealed tunnel: nothing from a round goes to a model.

## 14. Tests to write

Named as in the repository (`tests/*.test.mts`, with `ok(name, condition)`; the existing `tests/cell.test.mts` has the in-memory
store and the two-clients-through-the-real-function pattern to reuse).

1. **Codec:** every message round-trips; unknown version, unknown step, over-long field and over-cap total are refused; the
   built payloads stay under the 4000-character report cap in the worst case; the tokenizer version is carried and checked.
2. **State machine (pure):** every legal step moves on; every illegal one (a heard before a phrase, a second ask, a meant
   before an answer, a message from the wrong side) is ignored without crashing; one open round at a time; "Not in this
   cell" blocks further asks; stop clears both sides.
3. **Consent:** the ask carries no field from the phrase (the plaintext of an ask is checked); a "Not now" sends nothing but
   the answer; nothing is sent without an explicit send; nothing in the answer carries a reason.
4. **Blind order:** after the phrase arrives, the hearer's client state holds no marks or rewrite from the speaker; the
   speaker's client holds the hearer's marks without having exposed them to the view until "Show what I meant" is chosen;
   with "Keep private", the speaker's device never receives them.
5. **End to end through the real function** (two `CellClient`s, the in-memory store): a full round; then the store dump is
   searched for a marker word from the phrase, the marks and the rewrite (none found); after closing, nothing remains; a
   third person is refused; a rephrase message reported by the reader verifies, and an altered one does not; padded payloads
   have the expected sizes.
6. **Safety:** a stop-tier text in each field (phrase, rewrite, sentence) of each new kind triggers the reader-side pause (the
   regression test for the `kind === 'text'` gap); the sender-side check blocks a send until the person chooses, shows
   resources only on the sender's side, and sends no pause to the partner; abuse-category text never produces any message to
   the partner; pause makes the workbench read-only and sends nothing; stop clears both; a flag result is never sent to the server.
7. **Comparison (pure):** both devices compute the same output; the output has the four statements only; **a banned-words
   test** (no "wrong", "mismatch", "missed", "misunderstood", "agree", "score", "gap", "%", "points") over every string the
   function and the view can produce; no counts or numbers in the text except word positions; fixed order; unmarked words
   are not mentioned; "a guess" wording is used for the hearer's feelings and needs.
8. **Accessibility (static, in the style of `a11y-static.test.mts`):** every mark carries a text label and an accessible name
   with the kind; each kind has a non-colour cue; targets are at least 44 px; sliders have the text stepper; the live
   regions exist and are polite; arrival announcements do not include the phrase; new colour tokens are in the contrast
   test; headings in the comparison view per kind.
9. **Privacy (static):** the rephrase modules touch no `localStorage`, `sessionStorage`, IndexedDB, cookie or URL, make no
   request except to `/api/cell`, and log no content; no field carries a name or identifier.
10. **Wording:** the CNVC credit line appears on the screens that show the categories, and the project-extension statement
    appears with the communal-needs layer; no source coach is named; English only; the privacy mode text for `cell` includes the new limits.
11. **Padding and locking** (if built): bucket sizes; a changed marks or rewrite fails the lock check.

## 15. Build order (small, separate commits)

Each commit has its tests and builds on its own; none changes the server unless stated. All are behind a build-time switch
that is off until the owner turns it on.

1. **Protocol types and codec**, with caps and the tokenizer version check (pure; tests 1).
2. **The round state machine** (pure; tests 2 and 3).
3. **Cell plumbing:** the new kinds pass through `CellClient.send` / `pollOnce`; the reader-side crisis check covers every
   text field (fixing the `kind === 'text'` gap, which is useful on its own); the report path accepts the new kinds under the
   cap (tests 5 and part of 6).
4. **The comparison function** and its banned-words test (pure; tests 7).
5. **The first-use screen, the ask, the answer** (consent; no workbench needed; tests 3).
6. **The speaker's side:** "mark mine" using the workbench component, the send-review, "Send the phrase" (needs the workbench).
7. **The hearer's side:** read, mark "what I heard", send-or-keep, skip (blind order; tests 4).
8. **Reveal and the comparison view,** with screen-reader announcements and the CNVC credit.
9. **Pause, stop rephrasing, done with this,** and the sender-side private check (tests 6).
10. **The accessibility pass and static tests** (tests 8, 9, 10); contrast tokens added to the contrast test first.
11. **Words:** the Terms draft, the About partner-practice page, the `cell` mode's limits in `privacyModes.ts`, the renamed
    labels (section 10), the report button text.
12. **Optional:** size padding, then locking.

## 16. Open questions for the owner

1. **Ask first, then send (recommended),** or one step ("here is a phrase, look if you like")? The two-step ask means the
   hearer decides before any words reach their device; it costs one round trip.
2. **Reveal together (recommended):** the speaker's meant and the hearer's marks appear at the same time, each side choosing,
   or should the speaker see the hearer's marks first? Seeing first lets the speaker adjust what they say they meant.
3. **Does the hearer's reading come back by default?** Recommended: no default; "send" and "keep private" are equal buttons.
4. **Sliders:** the speaker's only, only if they tick "include", and never set by the hearer. OK? Or no sliders in the dyad?
5. **Stories:** may a hearer mark a story at all, and send it, or only share feelings and needs they guess? (A story mark can
   sound like an accusation.)
6. **Safety split (section 7):** a private pre-send check on the sender's device; reader-side pause only for danger to self
   or others; abuse-category resources shown to the writer only. Is this the right split? Should the sender-side check
   block sending, or only inform?
7. **`pagehide` closes the cell for both people.** For rephrasing, a short grace period and a "Still there?" prompt would
   avoid a phone leaving a page ending the round. This changes today's rule; is that allowed?
8. **The three-hour limit and AAA timing criteria** (2.2.3, 2.2.6): accept it as a declared privacy rule, with warnings?
9. **Padding** of payload sizes: yes, no, or later?
10. **Locking** what was meant (the commitment): include, or leave out?
11. **Local save:** may a person download their own side (not the other's) as a file? Recommended: not in the first version.
12. **AI in the dyad:** none in v1 (recommended). The workbench's "ask for help" stays solo-only. Agree? And may the
    scripted preview's "Send with AI" / "Receive translated" labels be retired for "Rephrase"?
13. **Who may start a round:** either person, one at a time (recommended), or do people take turns?
14. **Reports:** wording of the report button for rephrase messages, and a keeping time for reports, before this is turned on.
15. **Terms:** the draft for partner practice needs a rephrasing section (what is sent, who sees it, that a partner can copy
    it). Does it go through the archive process like the other Terms changes?
16. **Same-device use:** refuse, warn, or ignore? (It cannot be detected.)
17. **Wording of the four comparison statements** in section 4: are these the words?
