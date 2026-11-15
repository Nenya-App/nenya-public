# Data hygiene: scope (reports built 2026-11-15; the rest open)

**The gap (owner, 2026-11-15):** there is no written data hygiene practice. Much is already automatic, but scattered across scheduled jobs, and some data has no deletion rule at all.

## What the site keeps today

| What | Where | Kept | Deleted by |
|---|---|---|---|
| Coach per-connection daily codes | private Blobs store | about 1.5 days | `coach-cleanup` (daily) |
| Receipt fingerprints (signed transcripts) | private store | 30 days | `coach-cleanup` |
| Transcripts people chose to send | private store | the keeping time they chose | `transcript-expiry` (daily), or their own request with the signed file |
| Public "witnessed" copies | private store | their showing time; withdrawable at once | `transcript-expiry`; a person reviews before anything is public |
| Partner-practice cells | private store | short | `cell-cleanup` (hourly) |
| Reports and contact messages | Netlify Forms | **no schedule** (Terms Section 20 says so) | by hand, on request |
| Daily totals | private store | **"while useful"** | nothing |
| Notification emails | the owner's inbox | **no rule** | by hand |
| Owner-side copies (admin exports, the anonymized coach dataset, evaluation runs) | the owner's computer | **no rule** | by hand |
| Host logs and visit statistics | Netlify | Netlify's own practices | Netlify |
| Private configuration (method notes, module set, lexicon) | private store | while in use | by hand; backups in the owner's private folder |

## Proposed practice
1. **One written register** (`docs/data-register.md`): the table above, kept current; every new feature that stores anything adds its row in the same change (a test checks that each store key prefix in the code has a row).
2. **Deletion schedules where there are none:**
   - **Reports and contact messages: move them out of Netlify Forms into the private store, like transcripts (recommended).** Owner, 2026-11-15: today a report goes through Netlify Forms, so asking to delete it means an email and a deletion by hand, while a transcript's owner can delete it themselves, automatically. In the private store a report gets a keeping time (90 days, then deleted by the daily job) and the person gets a **deletion code** when they send it (shown once, like a receipt; only its hash is stored), so they can delete it themselves on `/my-transcript` (renamed or widened to "my submissions") without writing to anyone. The owner reads reports on the admin page; the notification email carries only that a report arrived, never its text. The alternative, keeping Forms and adding a daily deletion job through Netlify's API, needs an API token and still leaves self-service deletion impossible.
   - **Daily totals: 13 months** at daily detail, then folded into monthly totals and the daily entries deleted (a year-on-year comparison stays possible; nothing about anyone is in them either way).
   - **Notification emails:** delete after acting on them, and at most 90 days (a habit for the owner, written in the register).
   - **Owner-side copies:** a short checklist in the private folder: what is kept, why, until when; a reminder each quarter to review and delete.
3. **A quarterly review** (15 minutes, checklist): the register matches the code; the jobs ran (their counts on the stats page); nothing kept past its time; owner-side copies trimmed.
4. **If something goes wrong** (a leak, a mistaken publication): a one-page plan: take it down, record what and when, tell the people affected where that is possible, and say so publicly on the site.
5. **The Terms** then state each period plainly (replacing "no automatic deletion schedule yet" and "while useful").

## Built (owner, 2026-11-15): reports and messages
Reports, reflection summaries and contact messages go to `/api/submit` (`netlify/functions/submit.mts`), are kept in the private store for 90 days under the hash of a deletion code, deleted by `submission-expiry` (daily), deletable by the sender at `/my-transcript` and by the owner on the admin page (`SubmissionsPanel`, `/api/submissions`). The alert email (`submission-alert` form) carries the kind and dates only. Terms Sections 14 and 20 updated. The written register is `docs/data-register.md`, with the quarterly review. Still open: daily totals (decision 2) and the review's month cycle (decision 3).

## Decisions for the owner
1. Reports and messages: into the private store with a 90-day keeping time and a self-service deletion code (recommended), or stay in Netlify Forms with a deletion job (an API token; deletion requests still by email)? Existing Forms submissions: delete those older than 90 days by hand once, at the switch.
2. Daily totals: 13 months daily, then monthly?
3. The quarterly review: yes, and on which month cycle?
