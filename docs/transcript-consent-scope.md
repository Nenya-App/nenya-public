# Verified transcripts: what the person allows, for how long, and taking it back

Status: built in dev on 2026-11-10 (not in production). Written from the owner's direction: an explicit opt-in and a policy for how long we keep verified transcripts; selectable choices that are self-executing; the signature as the key to take them back; and later, a public "witnessed conversations" page the person can choose and withdraw.

## What a person chooses (when they send a signed transcript)
Nothing is chosen for them.
- **Always:** we read it and consider what they wrote (that is why they send it).
- **Optional uses (unchecked):**
  - *Test and improve the coach:* kept with names and contact details removed among our test conversations. Never used to train a model.
  - *Quote short parts in public:* a few words, never with a name, never the whole conversation.
  - *Show it on a "witnessed conversations" page, without a name:* see below. They also choose **what to show**: the whole conversation (anyone can check the signature) or only chosen messages (an excerpt, which cannot be checked against the signature).
- **How long (required):** delete after 30 days, 90 days, one year, or keep until they ask.
The send button stays off until a keeping time is chosen.

## What we keep
A small record keyed by the transcript's fingerprint (hash): the choices, the dates, the stored submission's id, and a status. **No conversation** (tested). If publishing was allowed, the signed conversation also waits in a separate "pending" store for a person at Nenya to read; that copy exists only because they allowed it.

## Self-executing parts
- **Keeping time:** a daily job (`netlify/functions/transcript-expiry.mts`) deletes what is due: the waiting copy, and the stored form submission through Netlify's API (needs `NETLIFY_API_TOKEN` set by the owner), and leaves a marker with only the fingerprint and date. If it cannot delete the submission (no token, or its id was not recorded), it counts it as needing a hand.
- **Taking it back:** `nenya.biz/my-transcript`. The person shows the signed file (checked on their device first). They can stop any use, take a public copy down, or ask for deletion. The effect on a public or waiting copy is immediate; deletion of the stored submission happens on the next daily run.
- **Only ever narrower:** a request cannot add a use, lengthen the keeping time, or undo a deletion request. Sending the same transcript again cannot widen what was allowed or put a withdrawn copy back.

## What the signature does and does not prove
The signature proves the transcript is genuine and unchanged. Holding the file is the key. It does **not** prove who holds it: anyone with the file can make the request, so keep it as private as the conversation. Because a request can only remove permissions, the worst a stranger with the file could do is take your own transcript down. This is why it is safe for the key to be a bearer token. It is not an identity check, and nothing says it is.

## Limits we must state
- A copy in our **notification email** is not deleted by the job. Options for the owner: turn the form's notification email off and read submissions in the dashboard only (then deletion covers everything), or keep emails and delete them by hand within the chosen time.
- We cannot recall copies others make of anything that was ever public (screenshots, archives).
- Netlify may keep its own backups under its own practices.
- The job that records each submission's id (`submission-created.mts`) and the delete call use Netlify's APIs as I remember them. Unverified against the current documentation; test on staging with a real submission first.

## The "witnessed conversations" page (next step; not built)
The permission, the pending copy, the withdrawal and the effect on a public copy are built. What is not: the review screen for the owner, the public page, and the listing function. Design:
- A person at Nenya reads every pending conversation and decides whether to show it. Anonymity cannot be promised by software (names slip through; details identify), so the page says it is read first and may not be shown.
- The page shows only records whose publication is `public`, active, and within their keeping time (`isPublic()` in `transcriptPolicy.ts`, tested). It is served with no caching, so a withdrawal takes effect at once.
- Shown without session colors, key ids or dates; each message marked as written by the person, the AI, or the site; for a whole conversation, a "check the signature" link.
- **Never** shown, in my recommendation: a conversation in which the site's safety check flagged a message at stop level (self-harm, abuse, danger). Publishing is the wrong default for someone in that moment, and the person may not be able to judge it. Decision for the owner.
- A takedown route that does not need the file (an email to info@nenya.biz, answered by a person).
- Terms and Privacy Promise changes (draft below).

## Terms and Privacy Promise: draft wording (not applied)
- Section 7 (reports), retention paragraph: replace "there is no automatic deletion schedule for submissions yet" with the new choices: what a person may allow, the keeping times, that we keep a small record of their choices and the transcript's fingerprint, that deletion happens at the end of the time or when they ask with the signed file, and the limits above (email copy removed by hand, no recall of public copies, Netlify's own backups).
- A new bullet in Section 21: the optional "witnessed conversations" page, that it is read before anything is shown, that names may be missed, how to take it down.
- Privacy Promise and the pre-written answers: the same facts, in the same words. The "report" answers and the report form's own text must match.
- Effective date bump and an archive of the outgoing text, as for any change.

## Decisions for the owner
1. Email notifications for transcript submissions: off (dashboard only) or on with hand deletion?
2. Never show a conversation that was flagged at stop level? (Recommended: yes.)
3. Keep "use for testing" at "never used to train a model", or say nothing about training?
4. A fixed list of keeping times, or a custom date?
5. Whether the public page lists the date a conversation happened.
