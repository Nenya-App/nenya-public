# Data hygiene: scope (draft for the owner, 2026-11-15)

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
   - **Reports and contact messages: 90 days**, then deleted. Netlify Forms has no automatic expiry; a daily job could delete older submissions through Netlify's API (needs an API token scoped to the site, stored as a secret), or new reports could go to the private store with a keeping time, like transcripts, instead of Forms.
   - **Daily totals: 13 months** at daily detail, then folded into monthly totals and the daily entries deleted (a year-on-year comparison stays possible; nothing about anyone is in them either way).
   - **Notification emails:** delete after acting on them, and at most 90 days (a habit for the owner, written in the register).
   - **Owner-side copies:** a short checklist in the private folder: what is kept, why, until when; a reminder each quarter to review and delete.
3. **A quarterly review** (15 minutes, checklist): the register matches the code; the jobs ran (their counts on the stats page); nothing kept past its time; owner-side copies trimmed.
4. **If something goes wrong** (a leak, a mistaken publication): a one-page plan: take it down, record what and when, tell the people affected where that is possible, and say so publicly on the site.
5. **The Terms** then state each period plainly (replacing "no automatic deletion schedule yet" and "while useful").

## Decisions for the owner
1. Reports and messages: 90 days? And Forms with a deletion job (needs an API token), or the private store with a keeping time (no token; the owner reads them on the admin page instead of by email)?
2. Daily totals: 13 months daily, then monthly?
3. The quarterly review: yes, and on which month cycle?
