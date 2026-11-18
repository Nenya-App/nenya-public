# Merge checklist: dev to staging to production (2026-11-18)

**State.** `dev` is 59 commits ahead of `origin/dev` and `origin/main` (staging and production are at the same old point). The owner pushes and merges; nothing here has been pushed. Counts and file lists below come from `git diff origin/main..dev` on 2026-11-18 and should be re-read before merging.

## 1. What a visitor can notice with every switch off
Only three things change on merge if no variable is set:
1. **The persona guard is wider** (`src/lib/personaGuard.ts`, `personaChecks.ts`): it also catches playing a requested character (a grandmother, a named therapist with a family) and claiming to love, miss or need the person, and a last no-ask persona pass runs after the guards that draw again (names, closing). The existing kill switch `COACH_PERSONA_GUARD=off` turns the whole persona guard off. *Risk:* an ordinary reply that matches a pattern ("my dear", "I love…") is replaced by the site's fixed sentence. Checked offline against 902 earlier replies; not yet against the live model.
2. **The site's answer to "will you remember me?"** (`c-memory`) has new wording, a card with sources, and now also answers "will you think about this afterward". The wording is the owner's to approve.
3. **Four lines in `src/coach/CoachPage.tsx`** for the mark (inert unless `VITE_NAME_MARK=on`).
Everything else in the 59 commits is documents, tests, scripts, wireframes (plain files under `docs/`), or behind a switch below.

## 2. Switches that are off until set (none is set by merging)
| Variable | Where | Effect when on | Needs before turning on |
|---|---|---|---|
| `COACH_BOUNDARY_GUARD=on` | Functions | Medication-directive and pull guards, the "here" rewrite (replaces "I'm here for you" with how the coach is here), the memory and diagnosis sentences, a card with sources when the memory sentence is said | The owner's approval of the fixed sentences (presence x3, memory, diagnosis, closing keep-line); the "keep a copy" and "send us feedback" options confirmed real; a persona/duet run on the live model with the guard on |
| `VITE_BOUNDARY_GUARD=on` | Build (sealed path, in the browser) | The same guards for the encrypted path | Same as above, and a rebuild |
| `COACH_FINAL_SUMMARY=on` | Functions | The last exchange (v2.1 only) is a short summary of feelings and needs, one line of encouragement and a pointer to the downloadable transcript | The check `scripts/eval-final-summary.mts` read on the real model; the answer text (`c-memory`) then updated to say "summary" |
| `VITE_LENS_COPY=on` | Build | "Lens" for "gateway", "Pattern" for "Insight" in visitor words | The owner's lens decisions 1 to 5 (see `docs/lens-rewrite-scope.md`) |
| `VITE_NAME_MARK=on` | Build | The mark as a visual form of the session ID, with a fidget | The owner's mark settings of 2026-11-17 reviewed on a device |
| `COACH_CANARY=on` (+ `COACH_CANARY_MODEL`) | Functions, staging | The nightly canary (Gemma on Workers AI) | Already set on staging; read `budget-repurpose-plan.md` before changing the budget |
| `COACH_PROVIDER=workers-ai` (+ `VITE_COACH_PROVIDER`) | Functions and build | The coach on Workers AI | Not wanted now: production stays on Venice |
Production variables are the owner's; this document sets none.

## 3. Before pushing to staging
1. `npm run check` on the final commit (3,350 tests passed on 2026-11-18).
2. `git log origin/main..dev --oneline` read once, and `git diff origin/main..dev --stat -- netlify src` compared with section 1 (any new file in `src/app`, `src/coach` or `netlify` that is not listed above is a new visitor-visible change).
3. Confirm staging's variables (`COACH_PROVIDER`, the Workers AI token, `COACH_CANARY*`) are not changed by the push (they live in Netlify, not in git).

## 4. On staging, with the owner at the keyboard
1. The persona set on the live model (needs a testing Venice key; `scripts/eval-persona.mts --private "<folder>" --layers`), once with `COACH_BOUNDARY_GUARD` unset and once on a test deploy with it on.
2. The full-exchange test (`scripts/duet-eval.mts --coach venice`), a dozen conversations, read by the owner.
3. One real conversation to the end, read from the first message to the closing note and the transcript download, with `COACH_FINAL_SUMMARY` unset and then on.
4. The "will you remember me" and "will you think about this afterward" questions, to read the answer and its card.
5. A harm-disclosure message and a crisis message, to confirm nothing earlier regressed.

## 5. Production
Merge `dev` to `main` only after section 4 is read. Verify with `git log origin/main..dev` before and after, and re-check the nightly canary (staging only) and the daily cap. Roll back by reverting the merge on `main`; for the persona guard alone, set `COACH_PERSONA_GUARD=off`.

## 6. Owner approvals this merge needs
- The wording of the `c-memory` answer and card.
- If any guard switch is to go on: the fixed sentences listed in section 2.
- The v2.1 final-summary wording, before `COACH_FINAL_SUMMARY` goes on anywhere.

## 7. What was left out on purpose
- The translation layer, the hub, the budget plan and the local duet canary: scope documents only.
- Anything that sends visitor text to a second company.
- The Terms: unchanged by this merge (the lens words in the Terms pass through a switch that is off).
