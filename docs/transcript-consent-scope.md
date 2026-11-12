# Verified transcripts: what the person allows, for how long, and taking it back

Status: built in dev on 2026-11-10 (not in production). Written from the owner's direction: an explicit opt-in and a policy for how long we keep verified transcripts; selectable choices that are self-executing; the signature as the key to take them back; and later, a public "witnessed conversations" page the person can choose and withdraw.

## What a person chooses (when they send a signed transcript)
Nothing is chosen for them.
- **Always:** we read it and consider what they wrote (that is why they send it).
- **Optional uses (unchecked):**
  - *Test and improve the coach:* kept with names and contact details removed among our test conversations. Never used to train a model.
  - *Quote short parts in public:* a few words, never with a name, never the whole conversation.
  - *Show it on a "witnessed conversations" page, without a name:* see below. They also choose **what to show**: the whole conversation (anyone can check the signature) or only chosen messages. Either way the public copy is anonymized, so a stranger cannot check its signature (see below).
- **How long we keep it (required):** delete after 30 days, 90 days, one year, or keep until they ask.
- **How long it may stay on the public page (required if they allow publishing):** the same four choices, and never longer than the keeping time. The clock starts the day a person approves the copy, and the copy comes down by itself on that day (the daily job), even if the transcript itself is still kept. This is a separate permission, like a testimonial with an end date.
The send button stays off until a keeping time is chosen.

## What we keep, and where (revised 2026-11-10: no account token, no email copy of the conversation)
- **The inbox** (our private store, key `inbox/<fingerprint>`): the readable transcript, the signed file, the person's note, the check, and the choices. The owner reads it in the admin page ("Transcripts people sent"). It is **not** in Netlify Forms.
- **A small record** (`transcript/<fingerprint>`): the choices, the dates and a status. No conversation.
- **A waiting copy** (`witnessed/<fingerprint>`), only if publishing was allowed: for the owner's by-hand review. **A public copy** (`public/<fingerprint>`), only after the owner approves: anonymized and reviewed.
- **The alert**: the owner's Netlify Forms email now carries only the fingerprint, the signing time, the key id, the choices and the check. It never carries the conversation or the note, so there is no email copy to delete.

## Self-executing parts
- **Keeping time:** a daily job (`transcript-expiry.mts`) deletes every copy we hold when the time the person chose ends: inbox, waiting, public. It leaves a marker with only the fingerprint and the date. It needs **no account token**: the store is the site's own.
- **Showing time:** a public copy comes down by itself when its own time ends, even while the transcript is still kept.
- **Taking it back:** `nenya.biz/my-transcript`. The person shows the signed file (checked on their device first). They can stop any use, take a public copy down, or ask for deletion. **Asking for deletion deletes every copy at once.** If the store cannot be reached, the request is recorded and the daily job finishes it, and it is listed for the owner.
- **Only ever narrower:** a request cannot add a use, lengthen the keeping time, or undo a deletion request. Sending the same transcript again cannot widen what was allowed or put a withdrawn copy back.

## Keeping the key (2026-11-11, revised 2026-11-12)
The signed file is the person's key, and their responsibility. With it, they make every change themselves at `/my-transcript` (stop a use, take a public copy down, delete); no one at Nenya needs to be involved. Without it, the only route is an email review at info@nenya.biz. It can take up to 30 days, needs them to say what the conversation contained and when it happened, and can only remove permissions or delete. Our policy is not to change or delete a verified transcript for anyone who cannot show the matching file, except through that review. **Permissions are never added, with or without the file** (owner, 2026-11-12); adding is scoped for future accounts only (below).
- After signing, the coach shows a "keep your key" notice until a signed copy is saved: the .json, or the readable .txt (it ends with the signed block, so it works at `/my-transcript`). Sending to Nenya stays off until a copy is saved or the person ticks that they understand what happens without one.
- **Save or send to myself:** where the browser can share files, a button opens the device's own share sheet (Mail, Notes, Files, Messages) with the readable .txt. It goes from the device to wherever the person chooses; nothing passes through Nenya and no address is recorded. Chosen over a server "email this to me", which would put the address and the key through our server and an email provider, and the key in an inbox. A completed share counts as saved; a cancelled one does not.
- The wording is shared in `src/lib/keepTheKey.ts`.

## Overlapping submissions (built 2026-11-12)
A conversation can be signed after any exchange, so one person may send the copy signed at turn 2 and the copy signed at turn 5. They share their first messages but have different fingerprints. **Each copy is its own submission, treated independently (owner, 2026-11-12):** its own permissions, keeping time, public copy and deletion. Changing or deleting one never changes another, and sending one never narrows or widens another. To change or delete each, the person shows each file; `/my-transcript` says so.

The site flags overlaps to the owner, and does nothing more (`src/lib/overlap.ts`, run in `/api/report`):
- **Codes, not words.** For each message, two keyed hashes under the server secret: a *chained* code (the message with every message before it), exact for "the same conversation up to message N"; and a *single* code (the person's own messages of 24 characters or more), for the same words in a different conversation. Short replies like "yes" and the AI's messages are not compared on their own. Without the secret a code cannot be matched to a phrase, and it cannot be turned back into words.
- **The index** is one entry per code and submission (`overlap/<kind>/<code>/<fingerprint>`) plus a list of a submission's entries (`overlap-keys/<fingerprint>`). It is deleted with the submission: on request, at the end of its keeping time, or by the owner (`deleteEverything`). It never outlives the transcripts.
- **The inbox entry** of the later copy records what it overlaps with when it arrives. The owner's page shows it on both copies ("sent earlier" / "sent later") and in the publishing review, where it notes that the other copy may have different permissions and that the decision covers only this one. If the check cannot run, the transcript is still kept and the entry says so.
- **Possible near-duplicates:** a button in the owner's page compares the person's own words across the transcripts held, in the owner's browser, for runs of the same six words (`src/lib/nearDuplicates.ts`). It only flags and can be wrong both ways.

## Account-bound transcripts (planned, not built; owner, 2026-11-12)
Accounts would use Netlify Identity (enabled on the project, not wired into the coach). The only thing an account would add is the ability to **add** permissions; removing and deleting stay open to whoever holds the file.
- **Anonymous by default, even when logged in.** A logged-in person chooses, before the first message, whether the session is tied to their account. If not, the session is anonymous: no account marker, and its transcripts are the usual narrow-only kind. A logged-in person can always use the coach anonymously.
- **Logged in for the whole session.** A session counts as tied only if the choice was made before the first message and every turn came from the same logged-in account. Logging in partway, logging out, switching accounts or turning the choice off makes it anonymous.
- **The marker** in the signature is a keyed code for the account, never the raw account id; it cannot be matched to an account without the server's secret.
- **Adding a permission needs all three:** the signed file, the matching account, and **confirming with a fresh login at that moment**. The site asks for the login again even if the person is already logged in, and the server checks how recent it is.
- **Safeguards:** an email confirms every added permission; publishing still goes through the owner's review; closing an account makes its tied transcripts narrow-only.
- **Older and anonymous transcripts** never gain the ability to add permissions.
- **Before building:** Terms and Privacy Promise wording for tied transcripts (today they say the signature covers nothing that identifies the person), and where account holders' transcripts are kept on the site.

## What the signature does and does not prove
The signature proves the transcript is genuine and unchanged. Holding the file is the key. It does **not** prove who holds it: anyone with the file can make the request, so keep it as private as the conversation. Because a request can only remove permissions, the worst a stranger with the file could do is take your own transcript down. This is why it is safe for the key to be a bearer token. It is not an identity check, and nothing says it is.

## What needs a person (owner, 2026-11-10)
Software cannot finish every deletion, so the by-hand steps are explicit and listed, not left to memory:
- **A queue of deletions that did not go through** (`/api/witnessed-review`, action `deletions`; owner only): every transcript that is due (its time passed, or the person asked) and still has a copy because the store could not be reached. The owner can delete the copies from the list. This is a fallback only: normally the deletion is immediate.
- **Mark it done** (`mark-deleted`) once you have done them; the record becomes a marker with only the fingerprint and date, and leaves the list.
- **Review before anything goes up** (the same endpoint) is the other by-hand step.
The queue is only an API so far; a panel in the owner's page is next.

## Limits we must state
- We cannot recall copies others make of anything that was ever public (screenshots, archives).
- Netlify may keep its own backups of its stores under its own practices.
- If the email alert fails, the transcript is still kept and listed in the admin page; the failure is counted.
- The notification email carries the person's choices (not their words). The Netlify Forms entry for the alert holds the same, and holds nothing that needs deleting.
- Nothing here uses Netlify's API or an account token. (Netlify's published API description has one sign-in scheme with no narrower scopes, so a token that could delete a form submission would have acted as the owner for everything.)

## The "witnessed conversations" page: built 2026-11-10 (API; the screens are next)
Three safeguards, in this order (owner, 2026-11-10):
1. **A conversation in which the site's safety check stopped a message can never be offered for publishing.** The send step shows the option as unavailable, with the reason; `/api/report` refuses it whatever the request says (`stopLevelFlagged`).
2. **The site anonymizes automatically** (`anonymize()` in `src/lib/publicCopy.ts`): the same scrubber the coach uses is run again over every message; session colors, key id and exact dates are left out; each message is marked as written by the person, the AI, or the site (a pre-written answer or a fixed replacement sentence is the site's, never the AI's).
3. **A person reads and edits every copy by hand before anything is shown** (`/api/witnessed-review`, owner only): list the waiting ones with the anonymized draft, approve with the reviewer's final text, or reject. Approval is refused if the text has the wrong shape or the scrubber would still replace something. Approving writes the reviewed copy to the public store and deletes the signed original from the waiting store. Softer safety flags (a message that was softened, not stopped) are shown to the reviewer as a reason to read more closely.

**What the public copy is.** It is not the signed text (names were removed, so the hash no longer matches), so a stranger cannot check its signature, and the page says so. It carries the original's short fingerprint, which the person who holds the signed file can match to theirs. This corrects an earlier line in the send step that said the whole conversation could be checked by anyone.

`/api/witnessed` returns only reviewed copies whose owner has not taken them back and whose keeping time has not passed (`isPublic`), never cached, showing the month and not the exact date.

Taking it back (`/my-transcript`) or asking for deletion removes the public copy at once. The daily job removes it at the end of the keeping time. A takedown that does not need the file is an email to info@nenya.biz.

**Not built:** the review panel in the owner's page, and the public page itself (both only call the endpoints above).

## Terms and Privacy Promise: draft wording (not applied)
- Section 7 (reports), add (2026-11-12): "If you send us more than one signed copy of the same conversation, each is handled separately, with its own choices. To spot this, we keep short codes made from each message you send, which cannot be turned back into your words, and delete them with the transcript." And: "With the signed file you make changes yourself at nenya.biz/my-transcript. Without it, you can ask us by email for a review, which can take up to 30 days and can only remove permissions or delete."
- Section 7 (reports), retention paragraph: replace "there is no automatic deletion schedule for submissions yet" with the new choices: what a person may allow, the keeping times, that we keep a small record of their choices and the transcript's fingerprint, that deletion happens at the end of the time or when they ask with the signed file, and the limits above (no recall of public copies, Netlify's own backups). Also replace the claim that a submitted transcript is delivered by email: the conversation is kept in the site's private store and the email carries only the choices.
- A new bullet in Section 21: the optional "witnessed conversations" page, that it is read before anything is shown, that names may be missed, how to take it down.
- Privacy Promise and the pre-written answers: the same facts, in the same words. The "report" answers and the report form's own text must match.
- Effective date bump and an archive of the outgoing text, as for any change.

## Decisions for the owner
1. DECIDED 2026-11-10: transcripts live in our own store; the email is only an alert with no conversation.
2. DECIDED 2026-11-10: a conversation flagged at stop level is never offered for publishing.
3. Keep "use for testing" at "never used to train a model", or say nothing about training?
4. A fixed list of keeping times, or a custom date?
5. Whether the public page lists the date a conversation happened.
