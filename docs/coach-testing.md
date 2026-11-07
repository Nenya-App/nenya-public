# Testing the coach as the owner

Two things limit repeat use of the coach demo. Neither needs a server-side bypass.

**The 6-hour rest.** After a conversation ends, the page saves the finish time in the browser's
local storage (`nenya.coach.rest`) and shows a "resting" screen until 6 hours pass. It is a courtesy
that any visitor can clear, not a lock. To skip it in your own browser, run this once in the console
on nenya.biz (it stays until you remove it):

```js
localStorage.setItem('nenya.coach.owner', '1')
```

To go back to normal behavior: `localStorage.removeItem('nenya.coach.owner')`. To clear a rest that is
already running: `localStorage.removeItem('nenya.coach.rest')`. This flag lives only in your browser
and changes nothing on the server.

**The per-IP rate limit** (15 requests a minute on `/api/coach`, set in `netlify/functions/coach.mts`)
is enforced by Netlify before the function runs, so nothing can bypass it, by design: a bypass would
need a secret in the request, which is something to attack. A person testing by hand sends a message
every 20 seconds at most, so 15 a minute is not in the way. If you ever script tests against production,
slow them down, or run them against `netlify dev`, which does not enforce rate limits.

**The daily cap** (500 turns a day, across all visitors: the same ceiling as 100 full conversations of five
exchanges) is a single anonymous counter in the `coach-private` Blobs store (`daily-count`, holding only a date
and a number). The day turns over at midnight Minnesota time. Only a conversation's first exchange can be refused;
a conversation under way is never cut off, but its turns are still counted. Set `COACH_DAILY_CAP` in Netlify's
environment variables to change the number, for example to raise it temporarily while you test. When the cap
is reached, the page tells the visitor and nothing they wrote is sent. If Blobs cannot be reached, the demo
stays open, so an outage never locks people out.

**The per-connection limit** (10 turns a day, two full conversations) needs the secret `COACH_IP_SECRET`; without
it the limit is off, which is also the case on previews that do not set it. `COACH_IP_TURNS` changes the number
(set it to 1 to test the refusal). A connection is stood for by a one-way daily code (HMAC of the day and the
address, IPv6 cut to its /64), kept in the store as `c/<day>/<code>` with a count of turns, and carried in the
conversation's signed ticket so every turn counts against the connection that started it, even if the address
changes. A scheduled function (`coach-cleanup`, daily at 08:00 UTC) deletes records from before today.

**Owner token.** Put the SHA-256 (hex) of a long random token in `COACH_OWNER_TOKEN_HASH`. In your own browser,
set `nenya.coach.ownerToken` (in the developer console, `localStorage.setItem('nenya.coach.ownerToken', '<token>')`)
and the page sends it as `x-nenya-owner`; the function then skips the per-connection limit and records nothing
for you. It never lifts the site-wide cap. Generate the token and its hash yourself, and never paste them into
chat or code.

**Plain daily totals** are kept as `m/<day>/<event>` (numbers only): messages sent, answered, blocked by reason,
conversations started and finished. See `docs/site-metrics-scope.md`.

**Reading the totals.** Open `/admin/` on the site (it is not linked anywhere), paste the owner token, and the last 30
days appear as tables. Page views, the rhythm chosen, terms accepted and the tour answers are counted from the browser
(only after the terms are agreed, and not when the browser's Global Privacy Control signal is on); the coach counts come from
the function. To count nothing while you test, turn on Global Privacy Control in your browser.

Read the day's turn count with:

```bash
npx netlify-cli blobs:get coach-private daily-count
```

## Failed turns: what the person sees and how to trace one
When a turn fails, the coach screen says what happened in plain words and shows one line of codes, for example
`status 502 · upstream · timeout · ref 3fa9c1d2 · 2026-11-05 22:14 UTC`. Under it, "Report this failure" sends only
those details (and anything the person adds) through the usual report form as an `error-report`. It never includes
what they wrote or what the coach said.

- **Code** is the server's error: `upstream` (the model service), `empty`, `ticket`, `off`, `config`, `origin` and so on.
  `rate-limit` is the platform's own limit (no body), and `network` means the page never reached the site.
- **Reason** (for `upstream`): `timeout`, `network` (the server could not reach the model service), `status-NNN` (the
  model service answered with that status), or `e2ee-attestation`, `e2ee-nonce`, `e2ee-key`, `e2ee-status`,
  `e2ee-format`, `e2ee-decrypt`, `e2ee-size` for the encrypted route.
- **Ref** is a short random id. The same id is in the function log as `coach: <code>:<reason> ref=<id>`, so searching the
  log for it finds the failure. Logs hold codes only, never message text. Netlify may not keep function logs for long,
  so look soon after a report arrives.

### If the encrypted route fails with `e2ee-status-400`
That means Venice refused the encrypted request itself (not a rate limit: that would be 429). Venice's own message is in the
function log on the same line as the `ref`, as `detail="..."`. If it complains about a setting, set `COACH_E2EE_MINIMAL=true`
on the preview site to send only the token ceiling and temperature, and try again.


## The final reply: it has to read as an ending

The last exchange (`MAX_TURNS`) is followed by the page's own closing note ("That is our five..."), and the person cannot answer. So the last reply must not ask a question or invite a reply. Three things work together, all in `netlify/functions/coach.mts` and `src/lib/coachClosing.ts`, and all keyed on `MAX_TURNS`, so a longer conversation later needs no other change:

1. **Instructions.** On the last exchange the prompt says the person cannot reply, that the page adds its own closing, and gives a shape (what they said, one thing that is theirs to keep, one calm statement). The lines that tell the coach to ask a question or offer a next step are left out of that prompt, and the coaching-move modules are not added (they are how the coach opens a new thread; safety, lens and resource modules still apply). On the exchange before the last, the coach is told to invite the person's last word, without counting.
2. **Retry.** If the last reply still has a question mark or an invitation ("let me know", "feel free to", ...), it is tried once more with a firmer note, inside what is left of the same 20-second budget.
3. **Strip.** If it still asks, the sentences that ask or invite are dropped; if little is left, a short settling line is added (`CLOSE_FALLBACK`). The care note for a possibly distressed message still takes priority over all of this.

To measure how well the instructions work without the safety net (the number to watch when you change the wording), run it in your own terminal with your own key. It plays six invented conversations to the fifth exchange and counts final replies that still ask:

```bash
VENICE_API_KEY=... node scripts/eval-final-turn.mts --guard-off
VENICE_API_KEY=... node scripts/eval-final-turn.mts          # what a visitor would see
```

`COACH_CLOSING_GUARD=off` (environment variable) turns the retry and strip off; the script sets it for `--guard-off`. Leave it unset in production. The tests (`tests/coach-closing.test.mts`, `tests/closing-guard.test.mts`) check the rules and the retry and strip steps with a pretend model; only the real model shows whether the wording lands.
