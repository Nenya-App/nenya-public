# Production switch to Cloudflare Workers AI: the owner's checklist (2026-11-16)

Cloudflare is decided (owner, 2026-11-16). The Terms of November 16, 2026 name Cloudflare and Gemma 4; the code defaults to Workers AI; the pages and the site's answers say so. Venice stays a toggle (`COACH_PROVIDER=venice` and `VITE_COACH_PROVIDER=venice`, with the Terms changed back first) and stays the place to continue a conversation.

## Before merging dev into main (production variables, Netlify; production context)
1. `CF_AI_ACCOUNT_ID` = the account id (Functions). Not a secret.
2. `CF_AI_TOKEN` = a token allowed only Workers AI, as a secret (Functions only). Test it first with the curl in the Terminal (the same one staging used).
3. `COACH_INSTRUCTIONS` = `v2.1` (Functions). Keep it set: removing it falls back to v1.
4. Do NOT set `COACH_PROVIDER` or `VITE_COACH_PROVIDER` (the default is Cloudflare). Leave `COACH_MODEL` unset (the default is Gemma 4).
5. `COACH_SEALED` stays off or unset: sealed mode is Venice-only and refuses itself under Workers AI.
6. Optional, after a quiet week: `COACH_CANARY=on` (and `COACH_CANARY_MODEL`) on production; the staging canary comes first.
7. `COACH_DAILY_CAP` stays 80 (about 2,000 of the free 10,000 Neurons a day).

## The Terms date
`LEGAL_EFFECTIVE_DATE` is **November 16, 2026**. If the merge happens on a later day, set it to that day, and rename `docs/legal/archive/terms-and-privacy-until-2026-11-16.md` to that day (and the row in `docs/legal/README.md`, and the "Status" line inside the file). Everyone is asked to agree again at the first visit after the merge (the date changed).

## After the merge deploys
1. Open nenya.biz/coach (US connection, or the owner token): ask "what model are you" (Gemma 4 on Cloudflare, not Venice), "are you a person", and a medication question.
2. Check the Terms page: Section 15 "Where your words go" names Cloudflare; "Continuing on Venice" is still there.
3. About pages (Privacy Promise, Bio-Social Design, Name & Philosophy, Where the Coach Is Open) name Cloudflare.
4. Netlify function logs for `coach:` lines with `config` or `upstream` errors (a wrong token shows as `status-401` or `status-403`).
5. After 24 hours: the day's counts (`coach.model.workers-ai`, `coach.neurons.*`) in the stats.

## To go back to Venice (emergency)
Set `COACH_PROVIDER=venice` and `VITE_COACH_PROVIDER=venice` (and `VENICE_API_KEY`), redeploy. The Terms would then describe the wrong service: put the Venice-era Section 3, 8, 9 and 15 text back from `docs/legal/archive/terms-and-privacy-until-2026-11-16.md` and change the effective date in the same change.
