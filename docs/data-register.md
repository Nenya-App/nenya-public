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
| Classifier band counts (`coach.screen.band.high|mid|low`, `coach.screen.unavailable`, `coach.screen.acted.*`, `coach.screen.vs-list.*`; only when `COACH_SCREEN` is `shadow` or `on`; counts only, never the message or its score) | private store (counters) | as the other daily totals | as the other daily totals | the owner (admin page) |
| Phrase workbench (`VITE_PHRASE_WORKBENCH`): the person's own sentence, the marks on its words and optional slider steps; nothing sent to anyone | the page's memory for the visit; optionally, only if the person turns it on inside the page, one record in this browser's local storage (`nenya.phrases`: the latest sentence up to 400 characters, its marks, slider steps; no time, count, history or identifier) | the visit; or, with Remember on, until the person turns it off, presses Forget, uses Forget me or Emergency Exit, or clears the browser's data | the page's Forget button; Forget me; Emergency Exit | the person at that device |
| Rephrasing round (`VITE_REPHRASE`) while a cell is open: ciphertext only (phrase, marks, rewrite, sentence) | private store (the cell's mailbox) | until the cell is closed; three hours at most | `cell-cleanup` (hourly); either person closing the cell | the other person in the cell only |
| Rephrasing round on each device (drafts, the round, messages received) | the page's memory only | until the round is done or stopped, or the page is left | "Done with this"; "Stop rephrasing"; closing the tab; Emergency Exit | the person at that device |
| A reported rephrasing message (the whole message as sent, its time, "verified"; no cell name) | private store (`cell-report/…`) | 30 days (decided by the owner, 2026-11-20) | the owner by hand now; a daily job must be written before `VITE_REPHRASE` goes on | the owner |
| Working pair (the random pair made at agreement under `VITE_TERMS_FIRST`) | the visitor's browser memory only | the visit | closing the tab; Forget me; Emergency Exit | nobody (shown to the visitor) |
| "Save and return later" | the visitor's own browser (encrypted) | 24 hours | the page itself; Forget me; Emergency Exit | the visitor, with ID and passcode (in tray mode it also holds a note of which lenses were opened but not added; still sealed) |
| Nightly canary archive (`canary/runs/<day>/<task>-<case>` and `meta`: the coach's replies to invented test cases, the model, instructions fingerprint, build and Neurons; never the prompt, never visitor text) | private store (staging, and production if the canary is switched on there) | kept until the owner trims it (about 170 KB a night); never public until the owner has read it, because a reply can echo the private notes | the owner, by hand | the owner |
| Guestbook signatures (`guestbook/<day>/<random>`: one color, the centroid of the visitor's two chosen colors and the two of the moment) | private store | forever (owner, 2026-11-15) | nothing (by design); cannot be found again to remove | everyone (the guestbook page) |
| Guestbook once-a-day markers (`c/<day>/g-<code>`) | private store | about 1.5 days | `coach-cleanup` (daily, with the connection records) | nobody (codes only) |
| Word look-up (`/api/words`, only if a visitor presses "Look it up online"): the one word typed, passed to Datamuse and the Free Dictionary API | not kept by us (only a per-connection count for the day, as the palette keeps) | the moment the answer is returned | nothing to delete | nobody |
| Settings ("Remember on this device") | the visitor's own browser | until turned off | Forget me; Emergency Exit | the visitor |
| Older report-form submissions (before 2026-11-15) | Netlify Forms (`report-submission`) | until deleted | the owner, by hand: delete those older than 90 days now, the rest as they reach 90 days | the owner |
| Host logs and visit statistics | Netlify | Netlify's practices | Netlify | Netlify; the owner sees totals |
| Private configuration (method notes, module set, lexicon) | private store; backups in the owner's private folder | while in use | the owner | the server; the owner |
| Owner-side copies (admin exports, the anonymized coach dataset, evaluation runs) | the owner's computer | see the private checklist | the owner | the owner |

## Proposed rows (not applied; built in dev 2026-11-18, move into the table when this goes to production)
| What | Where | Kept | Deleted by | Who can read it |
|---|---|---|---|---|
| Duplicate markers for reports and messages (`submission-dup/<one-way code of kind, text and comments>`; holds only its end date and the key of its submission, never the text) | private Blobs store | the same 90 days as the submission it guards | with the submission, by every route: the sender's code, the owner on the admin page, `submission-expiry` (which also sweeps any marker whose submission is gone) | nobody (a code only) |
| Which choices were sent for a signed transcript (`sentChoices` in the existing `transcript/<fingerprint>` record: plain choices such as "evaluate / 90d", no text) | private store | as the transcript record | as the record | the owner |
| "Already sent in this tab" (`nenya.sent-here` in `sessionStorage`: up to 20 SHA-256 codes of what this tab sent, never the text) | the visitor's own browser tab | until the tab closes | the browser, when the tab closes | the visitor's browser only |
| Plain daily totals `submission.duplicate-refused`, `submission.refused.no-adult`, `coach.report.duplicate-refused` | private store (counters) | as the other daily totals | as the other daily totals | the owner (admin page) |

## Quarterly review (15 minutes)
1. This table matches the code (new store keys, new forms, new browser storage).
2. The jobs ran: the stats page shows `submission.deleted.expired` and the cleanup counts moving.
3. Nothing is kept past its time: the admin page's oldest report is under 90 days old; the inbox holds no alerts older than 90 days.
4. Owner-side copies trimmed to what is still needed.
5. Note the date of the review at the bottom of this file.

## Reviews
- 2026-11-15: register started.
