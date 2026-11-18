# Data register

Everything Nenya keeps, where, for how long, and what deletes it. **Keep this current:** a change that stores something new adds its row in the same change. Reviewed each quarter (checklist below). Started 2026-11-15 (docs/data-hygiene-scope.md).

| What | Where | Kept | Deleted by | Who can read it |
|---|---|---|---|---|
| Reports, reflection summaries, contact messages (`submissions/<hash of the code>`) | private Blobs store | 90 days | `submission-expiry` (daily); the sender with the deletion code (`/my-transcript`); the owner on the admin page | the owner (admin page) |
| Report alerts (`submission-alert` form: kind and dates only, no text) | Netlify Forms and the owner's inbox | until deleted by hand | the owner (habit: delete after acting, at most 90 days) | the owner |
| Coach per-connection daily codes | private store | about 1.5 days | `coach-cleanup` (daily) | nobody (codes only) |
| Receipt fingerprints (signed transcripts) | private store | 30 days | `coach-cleanup` (daily) | the owner, as fingerprints |
| Transcripts people chose to send | private store | the keeping time they chose | `transcript-expiry` (daily); the person with the signed file | the owner |
| Transcript alerts (`verified-transcript` form: fingerprint and choices only) | Netlify Forms and the owner's inbox | until deleted by hand | the owner (same habit) | the owner |
| Public "witnessed" copies | private store | their showing time | `transcript-expiry`; withdrawal at once | everyone, after the owner's review |
| Partner-practice cells | private store | short | `cell-cleanup` (hourly) | the two people (end-to-end encrypted) |
| Daily totals (including, in the tray, a total per lens of how often it is opened and added: `lens.opened.<id>`, `lens.added.<id>`; no order, no time) | private store | no limit yet (proposal: 13 months, then monthly) | nothing yet | the owner (admin page) |
| Working pair (the random pair made at agreement under `VITE_TERMS_FIRST`) | the visitor's browser memory only | the visit | closing the tab; Forget me; Emergency Exit | nobody (shown to the visitor) |
| "Save and return later" | the visitor's own browser (encrypted) | 24 hours | the page itself; Forget me; Emergency Exit | the visitor, with ID and passcode (in tray mode it also holds a note of which lenses were opened but not added; still sealed) |
| Nightly canary archive (`canary/runs/<day>/<task>-<case>` and `meta`: the coach's replies to invented test cases, the model, instructions fingerprint, build and Neurons; never the prompt, never visitor text) | private store (staging, and production if the canary is switched on there) | kept until the owner trims it (about 170 KB a night); never public until the owner has read it, because a reply can echo the private notes | the owner, by hand | the owner |
| Guestbook signatures (`guestbook/<day>/<random>`: one color, the centroid of the visitor's two chosen colors and the two of the moment) | private store | forever (owner, 2026-11-15) | nothing (by design); cannot be found again to remove | everyone (the guestbook page) |
| Guestbook once-a-day markers (`c/<day>/g-<code>`) | private store | about 1.5 days | `coach-cleanup` (daily, with the connection records) | nobody (codes only) |
| Settings ("Remember on this device") | the visitor's own browser | until turned off | Forget me; Emergency Exit | the visitor |
| Older report-form submissions (before 2026-11-15) | Netlify Forms (`report-submission`) | until deleted | the owner, by hand: delete those older than 90 days now, the rest as they reach 90 days | the owner |
| Host logs and visit statistics | Netlify | Netlify's practices | Netlify | Netlify; the owner sees totals |
| Private configuration (method notes, module set, lexicon) | private store; backups in the owner's private folder | while in use | the owner | the server; the owner |
| Owner-side copies (admin exports, the anonymized coach dataset, evaluation runs) | the owner's computer | see the private checklist | the owner | the owner |

## Quarterly review (15 minutes)
1. This table matches the code (new store keys, new forms, new browser storage).
2. The jobs ran: the stats page shows `submission.deleted.expired` and the cleanup counts moving.
3. Nothing is kept past its time: the admin page's oldest report is under 90 days old; the inbox holds no alerts older than 90 days.
4. Owner-side copies trimmed to what is still needed.
5. Note the date of the review at the bottom of this file.

## Reviews
- 2026-11-15: register started.
