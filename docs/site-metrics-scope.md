# Scope: visit and usage counts

Status: scoping only, nothing built. Written 2026-11-06. Goal: have *some* numbers about use, soon, without identifying anyone.

## The problem
Netlify's built-in visit statistics (Web Analytics, from server logs, no cookies, unique visitors counted by address within a day) are on and are described in the Terms and Privacy Policy effective 2026-11-07. That covers page views and visitors only. It does not show what happens inside the coach (messages, refusals, finished conversations), which is what this scope adds, using our own counters. Real User Monitoring stays off: it needs a script from another site and a looser security policy.

The wording for our own counters is a further Terms revision: it ships together with the counting, never ahead of it. See "Wording" below.

## Principles
- **Counts, not people.** A day's total for each named event. No visitor ID, no cookie, no stored IP, no user agent, no referrer, no timestamps finer than the day.
- **A fixed list of event names, in code.** Nothing a visitor types can become an event name or be counted.
- **Where a count can be made on the server, make it there.** It cannot be inflated by a script, and it needs no extra request from the visitor's browser.
- **Respect the browser's privacy signal.** Page-view and click counts from the browser are skipped when the Global Privacy Control signal is on. (Server counts that run the service, such as coach turns, are not optional, and are disclosed.)
- **The day** turns over at midnight in Minnesota, like the coach's daily cap (`capDay` in `src/lib/dailyCap.ts`).

## Two kinds of counts

### A. Counted by the coach function (authoritative)
The coach function already receives every message, so it counts there; no new browser request.

| Event | Counted when |
| --- | --- |
| `coach.turn.sent` | A request carrying a visitor message reaches the function and is well-formed. This is "every sent message". |
| `coach.turn.answered` | The message went to the model and a reply came back (the turns that cost money). |
| `coach.turn.blocked.<reason>` | The turn was refused. One count per reason, using the function's existing reason codes where there are any: crisis stop, manipulation check, daily cap, connection allowance, rate limit, too many turns, malformed or oversized input. The reason is a code; no message text is kept. |
| `coach.conversation.started` | The first exchange is accepted (same moment the daily cap slot is claimed). |
| `coach.conversation.finished` | The fifth exchange (the last of `MAX_TURNS`) is answered. A conversation abandoned after two turns is **started** and has two **answered** turns, and is never "finished". |
| `coach.receipt.issued.<keyId>` | A signed transcript receipt is issued (see `docs/transcript-receipt-scope.md`). |
| `coach.report.verified` / `coach.report.rejected` | A transcript report passed or failed the signature check. Counts only. |

Turn counts are separate from the connection allowance's per-connection turn records (see `docs/coach-ip-limit-scope.md`): these are plain site-wide totals.

### B. Counted from the browser (a small beacon)
A starting list, short on purpose (add or remove tomorrow):
- `page.view.<screen>`: once each time a screen is shown in a visit (welcome, each gateway, the review page, the coach, each About page). Not on every re-render, and not remembered between visits.
- `onboarding.rhythm.<name>`: which breathing rhythm is chosen in the opening flow (four values, including box breathing).
- `onboarding.terms.accepted`: the opening flow was completed.
- `tour.accepted`, `tour.declined`, `tour.completed`.
- Later: `tones.on` when the breathing-tones switch is turned on (see `docs/accessibility-audio-scope.md`).

Deliberately **not** counted by default: Emergency Exit use, anything typed, drawn or chosen inside a reflection, colours, notes, or the session key. Whether to count Emergency Exit at all is a decision for you.

## How it would work
- **A shared counter module** (`src/lib/counters.ts`), built on the same `CounterStore` interface and conditional-write retry loop as `dailyCap.ts`, so it can be tested with a fake store. One key per day per event (`m/<day>/<event>`), so two events never collide. Netlify Blobs has no atomic increment, so very busy moments can undercount slightly; for "any data at all" that is fine, and the numbers should be described as approximate.
- **The allowed event list** lives in one file imported by both the browser code and the function.
- **Browser counts** go to a small function (`/api/count`): accepts `{ event }`, rejects anything not on the list, adds one to the day's count, answers 204. It does not read the IP, user agent or referrer, sets no cookies, and is rate-limited per connection by Netlify. The browser sends with `navigator.sendBeacon` / `fetch` with `keepalive`, ignores failures, and never waits on it.
- **Failure never hurts the visitor.** If the store is down, counts are lost, nothing else happens.
- **Unique visitors: not in the first version.** Counting distinct people needs a per-visitor record, even a hashed one, which means more to disclose. The connection allowance (`coach-ip-limit-scope.md`) will already hold a daily keyed hash per connection, so a "distinct connections per day" figure could later be a by-product, with its own wording.
- **Retention.** Daily totals contain no personal data and can be kept indefinitely.

## Reading the numbers (admin only)
- A private read endpoint (`/api/stats?days=30`) that answers only to the owner token described in `coach-ip-limit-scope.md` ("Owner access"), and a plain unlinked, `noindex` admin page that shows the last 30 days as a table.
- The token is never put in a link. It is pasted once into a field on the admin page and kept in that browser's storage, like the existing owner flag.
- Alternative to decide tomorrow: no page at all, only a command you run locally.

## Options to explore tomorrow before choosing
The plan above is "our own counters on Netlify Blobs". Before committing, look at whether a ready-made tool would let us say the same things truthfully, judged by: no cookies or identifiers, no third party receiving visitor data, cost, licence compatible with AGPL-3.0, and effort.
- **Netlify Web Analytics** (server-side, no code in the page): already on; keep it, and see whether anything else is needed beyond it.
- **GoatCounter, Plausible, Umami**: open-source analytics; their current licences, hosting costs and whether they set cookies should be checked rather than assumed.
- **Our own counters** (the baseline): free, fully ours, but we build and maintain it and it gives only totals.

The coach counts in section A are not replaceable by any of these, because the coach's own function is where they are made.

## Keeping totals past Netlify's 30 days
Netlify keeps its visit statistics for about 30 days, so without a copy there is no running history. Options, to settle tomorrow:
- **Record the totals by hand** once a month (pages, unique visitors, top pages, countries) in a private sheet, outside the public repo. Costs five minutes; works today. Whether the dashboard offers a file export, or Netlify has an API for these statistics, is **not checked** and should be looked up first.
- **Our own daily counters** (this scope) never expire, so for anything we count ourselves we keep a running total for free. Browser page-view counts would partly duplicate what Netlify already gives us, so they are worth adding mainly if Netlify's data cannot be exported. Distinct visitors cannot be replicated without a per-visitor record, so that one figure would still depend on Netlify or on the by-product of the connection allowance.
- **A scheduled function that copies Netlify's numbers into our own store**, only if an API exists for them.
Suggested for now: start the monthly manual record, and decide on the page-view beacon once we know whether an export exists.

## Wording (before anything is counted)
- README: the 2026-11-07 revision already describes the host's visit totals; add a line for our own daily totals (suggested: "Nenya also keeps plain daily totals, such as how many coach messages are sent. They are not tied to you.").
- Terms and Privacy: new effective date, archive copy in `docs/legal/archive/`; say what is counted, that it is not tied to a person, that the browser's Global Privacy Control signal is respected for browser counts, and that the coach function counts messages and refusals (no text).
- `PrivacyPromise.tsx` card "No Tracking, No Profiles, No Ads": check it still holds as written ("no profiles" stays true; "no tracking" needs the sentence above next to it).
- Marketing repo `brand/claims.md` and `brand/banned.txt`: revise with the Terms (a change in that repo, asked first).
- The IP allowance, the owner token and the transcript receipt count each have their own wording items, listed in their docs; do all of them in one Terms revision.

## Tests to write when it is built
Counter: add-one, day rollover, two-day separation, collision retry, store failure returns without throwing. Event list: unknown names rejected, names with extra characters rejected. Function: no IP, header or cookie is read or stored (assert on what is written); 204 on success and on failure; rate-limit configuration present. Coach function: each event counted exactly once at the right moment, across a 2-turn abandoned conversation, a finished one, and each blocked reason; blocked turns count under their reason and are not also counted as answered. Browser: beacons skipped when the privacy signal is on; one `page.view` per screen per visit; nothing counted before the terms are accepted unless decided otherwise (open question). Stats endpoint: wrong or missing token refused; never reachable without it.

## Rollout
1. Wording and archive copy (with the other items).
2. Preview deploy: count by hand, compare with what the function says.
3. Production. Check the first week's totals for sanity before relying on them.

## Open decisions
- Count browser events before the terms are accepted (needed for "how many leave at the terms"), or only after?
- Include Emergency Exit use, or never?
- Admin page or local command?
- Own counters, or a ready-made tool after tomorrow's look?
- Should the site-wide daily cap also count turns instead of conversations started (suggested: yes, since the bill follows turns), and at what number?

## Decisions made (2026-11-07)
- **Site-wide daily cap counts turns**, 500 a day (the same ceiling as 100 full conversations at five exchanges). The per-connection allowance already counts turns.
- **Browser counts start only after the visitor accepts the terms.** No "terms shown" count; the first count is the acceptance itself (`onboarding.terms.accepted`).
- **Emergency Exit use is never counted.**
- **Reading the numbers:** a private admin page behind the owner sign-in (last 30 days as a table).
- Still open: own counters versus a ready-made tool (to look at when building); whether to add the page-view beacon at all once we know whether Netlify's statistics can be exported.

## Built (2026-11-07): browser counts
- **`/api/count`** (`netlify/functions/count.mts`): accepts `{ "events": [...] }` (at most four names, at most 1000 bytes), keeps only names on the fixed list in `src/lib/counters.ts`, and adds one to each day's total. It answers 204. It reads the page's own address (for the courtesy origin check) and nothing else: not the visitor's address, browser, referrer or cookies, and it sets no cookie. Netlify's rate limit (60 a minute) sits in front. A store that is down never produces an error for the visitor.
- **The page** (`src/lib/usageCounts.ts`, wired in `App.tsx`): counting starts only after the terms are agreed (now or, for someone who chose to remember it, from the start of the visit); it never sends when the browser's Global Privacy Control signal is on; a failed send is ignored. First count: `onboarding.terms.accepted`, with the rhythm that was chosen (`onboarding.rhythm.<name>`), recorded at agreement because nothing before it is counted. Then `page.view.<screen>` each time a screen is shown, `tour.accepted`, `tour.declined`, `tour.completed` (the last step's close).
- **Not counted, by design:** anything entered, Emergency Exit, and the About pages individually (they count together as `page.view.about`).
- **Still to build:** the admin read page.

