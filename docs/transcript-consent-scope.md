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

## What we keep
A small record keyed by the transcript's fingerprint (hash): the choices, the dates, the stored submission's id, and a status. **No conversation** (tested). If publishing was allowed, the signed conversation also waits in a separate "pending" store for a person at Nenya to read; that copy exists only because they allowed it.

## Self-executing parts
- **Keeping time:** a daily job (`netlify/functions/transcript-expiry.mts`) deletes what is due: the waiting copy, and the stored form submission through Netlify's API (needs `NETLIFY_API_TOKEN` set by the owner), and leaves a marker with only the fingerprint and date. If it cannot delete the submission (no token, or its id was not recorded), it counts it as needing a hand.
- **Taking it back:** `nenya.biz/my-transcript`. The person shows the signed file (checked on their device first). They can stop any use, take a public copy down, or ask for deletion. The effect on a public or waiting copy is immediate; deletion of the stored submission happens on the next daily run.
- **Only ever narrower:** a request cannot add a use, lengthen the keeping time, or undo a deletion request. Sending the same transcript again cannot widen what was allowed or put a withdrawn copy back.

## What the signature does and does not prove
The signature proves the transcript is genuine and unchanged. Holding the file is the key. It does **not** prove who holds it: anyone with the file can make the request, so keep it as private as the conversation. Because a request can only remove permissions, the worst a stranger with the file could do is take your own transcript down. This is why it is safe for the key to be a bearer token. It is not an identity check, and nothing says it is.

## What needs a person (owner, 2026-11-10)
Software cannot finish every deletion, so the by-hand steps are explicit and listed, not left to memory:
- **A queue of deletions waiting for a hand** (`/api/witnessed-review`, action `deletions`; owner only): every transcript that is due (its time passed, or the person asked) and has not been marked deleted. Each shows what to do: delete the stored submission in Netlify (Forms, verified-transcript) if the daily job could not, and delete the notification email copy.
- **Mark it done** (`mark-deleted`) once you have done them; the record becomes a marker with only the fingerprint and date, and leaves the list.
- **Review before anything goes up** (the same endpoint) is the other by-hand step.
The queue is only an API so far; a panel in the owner's page is next.

## Limits we must state
- A copy in our **notification email** is not deleted by the job. Options for the owner: turn the form's notification email off and read submissions in the dashboard only (then deletion covers everything), or keep emails and delete them by hand within the chosen time.
- We cannot recall copies others make of anything that was ever public (screenshots, archives).
- Netlify may keep its own backups under its own practices.
- The job that records each submission's id (`submission-created.mts`) and the delete call use Netlify's APIs as I remember them. Unverified against the current documentation; test on staging with a real submission first.

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
- Section 7 (reports), retention paragraph: replace "there is no automatic deletion schedule for submissions yet" with the new choices: what a person may allow, the keeping times, that we keep a small record of their choices and the transcript's fingerprint, that deletion happens at the end of the time or when they ask with the signed file, and the limits above (email copy removed by hand, no recall of public copies, Netlify's own backups).
- A new bullet in Section 21: the optional "witnessed conversations" page, that it is read before anything is shown, that names may be missed, how to take it down.
- Privacy Promise and the pre-written answers: the same facts, in the same words. The "report" answers and the report form's own text must match.
- Effective date bump and an archive of the outgoing text, as for any change.

## Decisions for the owner
1. Email notifications for transcript submissions: off (dashboard only) or on with hand deletion?
2. DECIDED 2026-11-10: a conversation flagged at stop level is never offered for publishing.
3. Keep "use for testing" at "never used to train a model", or say nothing about training?
4. A fixed list of keeping times, or a custom date?
5. Whether the public page lists the date a conversation happened.
