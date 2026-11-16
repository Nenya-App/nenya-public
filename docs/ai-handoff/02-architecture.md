# 2. Architecture: the stack and how a change ships

## Stack
- **Front end:** Vite + React + TypeScript, Tailwind tokens (`src/styles`), `motion` for animation. Several small entry pages: the main app (`index.html`, `src/app`), the coach page (`coach/`, `src/coach`), plus `admin/`, `cell/` (partner practice, off), `verify/`, `my-transcript/`, `bench/` and `logo-export/` (dev tools). Pure logic lives in `src/lib` (about 180 modules); components import it, tests import it, functions import it.
- **Back end:** Netlify Functions (`netlify/functions/*.mts`, TypeScript run by Node) and **Netlify Blobs** for the few things kept. No database, no accounts.
- **Hosting:** two Netlify sites from one repository. `main` is production (nenya.biz). `dev` builds the password-protected staging site (nenyastaging.netlify.app) with its own variables and its own Blobs store (`coach-private-staging`; production's is `coach-private`).
- **Models:** the coach calls Cloudflare Workers AI (Gemma 4 26B-A4B) by default; Venice AI is a toggle (`COACH_PROVIDER=venice`) and the place a visitor may continue a conversation. Cloudflare also provides Turnstile (the humanity check before a first coach message).
- **License:** AGPL-3.0. The repository is public, so **nothing private may be committed** (see file 6).

## Where things are
| Area | Where | Notes |
|---|---|---|
| Coach function | `netlify/functions/coach.mts` | One long file; its header lists the 12 stages (file 3) |
| Safety and text rules | `src/lib/safetyFlags.ts`, `careGuard.ts`, `infraGuard.ts`, `personaChecks.ts`, `laneGuard.ts`, `hostility.ts` | Phrase matching; all unit-tested |
| Pre-written answers | `src/lib/aboutNenya.ts` (+ `siteAnswers.ts`) | Owner-approved wording; detection tables, per-provider versions |
| Terms | `src/lib/legalDocument.ts` | One source for the agreement window, About page and PDF; archive in `docs/legal/archive/` |
| Reflection ("gateways") | `src/app/components/pages/*GatewayPage.tsx`, `src/lib/*` | Entries stay in the browser |
| Daily counts | `netlify/functions/count.mts`, `src/lib/usageCounts.ts` | Plain totals, no identifiers, off under GPC |
| Everything that is kept | `docs/data-register.md` | The authority; update it in the same change |
| Switches and variables | `docs/production-env.md` | A test fails if code reads a variable this file does not name |
| Scripts | `scripts/README.md` | A test fails if a script is not listed |

## Functions (the README table is the authority; this is the gist)
Coach: `coach` (the conversation), `screen` (screening model, shadow), `canary-nightly` (nightly tests), `coach-cleanup` / `transcript-expiry` / `submission-expiry` / `cell-cleanup` (daily deletion). Sharing: `submit` (reports, with a deletion code, kept 90 days), `witnessed*` (shared conversations, owner-reviewed), `transcript-revoke`, `receipt-lookup`, `report`, `mistake`. Misc: `guestbook`, `colors`, `terms-agree` (signs the agreement receipt), `stats`, `count`, `card-drafts`.

## What is kept, and where (all in the private Blobs store unless noted)
`modules`, `method-notes`, `learn-icarus` (the coach's private text, owner-uploaded, never in the repo); `daily-count`; `c/<day>/…` (one-way daily connection codes, deleted within two days); `submissions/<hash>` (reports); `guestbook/<day>/<id>`; `canary/…` (night state, digests, ledger); witnessed transcripts the owner approved; short hashes of signed transcripts (30 days). The browser keeps only what the visitor allows ("Remember on this device"), listed in `src/lib/deviceMemory.ts`.

## Switches
Build-time `VITE_*` switches need the **Builds** scope and take effect at the next build; server variables need **Functions**. Features ship dark behind a switch, are tried on staging, then turned on in production with the owner. Current set: see `docs/production-env.md` and file 7.

## How a change ships
1. Work on `dev` (or a feature branch into `dev`). Run `npm run check`. Commit each finished change with a full message (summary, then the why, the tests, any caveat).
2. The owner pushes with GitHub Desktop. Staging rebuilds from `dev` behind its password.
3. The owner opens a pull request `dev` → `main` and merges. Production rebuilds. Nothing a visitor sees changes for the better without the owner doing this.
4. Anything that changes what visitors are told (Terms) needs the archive-and-date procedure in `docs/legal/README.md`. A new Terms date makes every returning visitor agree again.
5. Tests use no network and no real keys. The test runner strips `COACH_*`/`VITE_*` variables from the environment, so a test sets what it needs.

## Gotchas learned the hard way
- A password on staging blocks function-to-function HTTP (everything answers 401). Scheduled functions run internally and are unaffected; do not design one function calling another over the site address.
- Netlify scheduled functions run only on a site's published deploy and may run about 30 seconds. Long work goes in small pieces with its place saved (see `canary-nightly.mts`).
- Node cannot import `.tsx` in tests: logic a test needs goes in `src/lib`.
- `docs-drift.test.mts` also checks the docs for each new function, script and variable. Add the row in the same change.
