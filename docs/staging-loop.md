# The staging test-and-improve loop

`scripts/staging-suite.mts` runs the checkable parts of `docs/dev-test-script.md` against the deployed staging coach (about 30 model calls per full run). The loop around it is below. A person stays in it at two points: **redeploying staging** (Claude never pushes or merges) and **approving any change to wording** (site sentences, notes, Terms).

## One round
1. **Run** (owner token in the environment, never typed into a command): `node scripts/staging-suite.mts --url https://nenyastaging.netlify.app`
2. **Read the report** (research folder, devChecks: `staging-suite-<time>.txt`, with "newly failing" and "fixed" against the last run).
3. **Sort every failure:**
   - *Site-side and deterministic* (a challenge sentence missing where the rules say it should be, a wrong flag, a form-check misfire, an edit not reported): reproduce it in a local test first (`tests/`), fix the code, `npm run check`, commit locally.
   - *Model-side* (the AI mirrors, or ignores a steering note): not fixed by code alone. Record the exact message and reply, then change the note or the guard, and add the case to the suite. Never edit approved wording without asking.
   - *Environment* (a switch is off, the daily cap, 401/429, cold start): not a failure of the code; fix the setting or wait.
4. **Hand over:** list the commits, say that staging must be redeployed from `dev` to test them. Stop until it has been.
5. **Re-run** only the affected scenarios (`--only name,name`), then the full suite once at the end.

## Limits that keep it honest
- **At most three rounds in a session**, and stop earlier if a round finds nothing new. Each round costs real model calls and the user's usage.
- **A passing suite is not the safety case.** It checks the rules above on invented, mild messages; it cannot judge tone, kindness or whether a reply helped. The by-hand sections (7 with a real slur, 11b, 12) stay with the owner.
- **A rule is only as good as its scenario.** When a real transcript shows a miss, the miss becomes a scenario *before* the fix.
- Slurs and real hateful text are never put in the suite or the repository.
- Failures that repeat after a fix are reported as such, not retried silently.
