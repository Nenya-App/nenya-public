# Which AI service runs the coach: the owner's checklist (updated 2026-11-16, evening)

**Today's state of the decision.** The coach ran on Cloudflare Workers AI (Gemma 4) for part of 2026-11-16 (Terms revision `bfb3b79`, merged in PR #28), and the owner then decided to **return to Venice AI**, keeping Cloudflare as an outer layer for organization integrations (Turnstile today; the rest is not scoped yet). The Workers AI provider, its tests, its Terms text (archived) and the Cloudflare versions of the site's answers are **kept and tested** so a later switch is a configuration change plus a Terms revision, not a rebuild.

## To be running on Venice (what the merge of this change needs)
1. Production keeps `VENICE_API_KEY`, `COACH_ENABLED=true`, `COACH_TICKET_SECRET`, `COACH_INSTRUCTIONS=v2.1`, `COACH_DAILY_CAP=80`. (Checked: `VENICE_API_KEY` and `COACH_SEALED` exist on production.)
2. Do **not** set `COACH_PROVIDER` or `VITE_COACH_PROVIDER` (the default is Venice again). `CF_AI_ACCOUNT_ID` and `CF_AI_TOKEN` on production can stay (they are unused) or be removed: the Cloudflare **Turnstile** check uses its own variables and is not affected.
3. `COACH_MODEL` unset: the default is now **Gemma 4 26B A4B Uncensored** (`e2ee-gemma-4-26b-a4b-uncensored-p`, encrypted and Private on Venice; it replaced Qwen 2.5 7B on 2026-11-16, same keys). Production's `COACH_E2EE_MINIMAL=off` and `COACH_E2EE_PLAIN_HISTORY=off` apply to it as before. Sealed mode (`COACH_SEALED=on`) is available again if you want it; it is off today.
4. Merge. The Terms are a same-day revision (the effective date stays **November 16, 2026**, so nobody is asked to agree again), and the Cloudflare-era text is archived as `docs/legal/archive/terms-and-privacy-until-2026-11-16-b.md`. If the merge happens on a later day, set `LEGAL_EFFECTIVE_DATE` to that day and rename the archive file (and its row in `docs/legal/README.md`).
5. After it deploys: ask the coach "what model are you" (it should name Gemma 4 26B A4B Uncensored, run by Venice AI), "are you a person" and a medication question; read Terms Section 15 ("Where your words go" names Venice).

## Before relying on it: a baseline on Venice
v2.1 and the 2026-11-16 changes were tested on Gemma 4 on Workers AI (38/38), **not on the uncensored fine-tune Venice runs**, which has fewer built-in refusals: the coach's own checks carry more of the safety, so run the persona set and the full-exchange test on it before the merge, and read the crisis, medication, relationship and closing cases. Run the persona set on Venice with your testing key, with the distress text on:
`COACH_DISTRESS_TEXT=on node scripts/eval-persona.mts --instructions v2.1` (see `docs/coach-testing.md`), then the full-exchange test with Venice as the coach (`COACH_PROVIDER` is the coach's here: `scripts/duet-eval.mts` currently plays the coach on Workers AI; say so before you run it for Venice).

## The Cloudflare side (staging, canary)
Staging still has `COACH_PROVIDER=workers-ai`, `VITE_COACH_PROVIDER=workers-ai` and `COACH_CANARY=on`: it keeps running Gemma 4 and the nightly canary as a comparison site, behind its password. **The canary tests Gemma, not what production visitors get.** Keep it as a comparison, or set `COACH_CANARY` off. Remove the two provider variables on staging if you want staging to match production.

## To switch to Cloudflare later
Apply the Terms revision again (restore the archived `-b` Section 3, 8, 9, 15 and 18 text, new date or same-day `-c`), set `COACH_PROVIDER=workers-ai`, `VITE_COACH_PROVIDER=workers-ai`, `CF_AI_ACCOUNT_ID`, the secret `CF_AI_TOKEN`; redeploy; then the checks in `docs/hosted-model-swap-scope.md`.
