# Scope: a per-connection allowance for the coach demo

Status: scoping only, nothing built. Written 2026-11-06. **Revised 2026-11-06 after decisions** (turn-counted allowance, 6-hour browser rest, owner key; see "Decisions made" at the end). Related: `docs/site-metrics-scope.md`, `docs/transcript-receipt-scope.md`.

## The problem
The coach demo is free and every reply costs money. Two things limit it today:
- the **6-hour rest**, kept in the visitor's own browser (`nenya.coach.rest`). Anyone can clear it, and "Forget me" now clears it for every visitor, so it is a courtesy, not a lock;
- a **daily cap of 100 new conversations** across all visitors (`src/lib/dailyCap.ts`), plus Netlify's **15 requests a minute per IP** (`rateLimit` in `netlify/functions/coach.mts`).

The cap protects the bill. Nothing stops one person from using up the whole day's cap, because nothing on the server knows that two conversations came from the same place.

## What Netlify can and cannot do (checked 2026-11-06)
- **Built-in rate limiting** counts per IP, but its longest window is 180 seconds. It cannot enforce hours.
- **Logs** are for people, not for the function: function logs are kept for at least 24 hours (up to 7 days on some plans), cannot be queried by the function during a request, and our function logs only codes and reference ids, never IPs. Traffic logs with IPs are reachable only through log drains, which need a plan we do not know we have.
- **Our own store works.** The function can read the visitor's IP (`context.ip` in Netlify's function context). Netlify Blobs, already used for the daily counter, can hold a small record per connection. Blobs have no expiry (we delete on read and clean up), updates can take up to 60 seconds to show unless the store uses strong consistency, and there is no atomic increment (conditional writes, as in `dailyCap.ts`).

## Proposed design
**An allowance of turns, not a lock-out timer.** Each connection gets **10 turns per calendar day** (`COACH_IP_TURNS`, default 10), which is **two full conversations** at the demo's 5 exchanges each, on the same Minnesota-time day boundary as the daily cap. Turns are counted, not finished conversations, because a conversation abandoned after two turns has still used two turns and cost money. A household, a classroom or a mobile carrier sharing one address has room for more than one person, which a long lock after a single conversation would not give them.

**Why turns:** someone who starts and abandons short conversations all day is stopped by the turn total, while someone who has two full conversations uses exactly their allowance. A *new conversation* is refused once the day's turns reach the allowance; a conversation already under way is never cut off, so the total can overshoot by at most 4 turns. (Cutting a conversation off mid-way would also skip the coach's closing-turn behaviour.)

**What is stored.** One record per connection per day: `day + keyed hash of the IP -> turns used`.
- The hash is HMAC-SHA256 of the IP with a secret held only in an environment variable (`COACH_IP_SECRET`), with the day mixed in, so the same person produces a different value each day and the value cannot be turned back into an address by anyone without the secret.
- IPv6 addresses are cut to their /64 first, since one device can hold many addresses inside it.
- The record is a count and nothing else: no timestamp beyond the day, no message text, no session colors, nothing about the conversation.
- Yesterday's records are deleted the first time a conversation starts on a new day, and a record is never read after its day has passed.

**When it is checked.** After the crisis-stop and manipulation checks (a message that never reaches the AI uses nothing). At a conversation's **first exchange**, in this order: read the connection's turns; if they have reached the allowance, refuse; claim a daily-cap slot; then add one turn. At **every later exchange**, just add one turn (no refusal). A blocked connection never uses a daily-cap slot, and a conversation the daily cap refuses is not counted against the connection. Turns are added only for messages that actually go to the model.

The site-wide daily cap (100 conversations started, `COACH_DAILY_CAP`) counts conversations, not turns. Because the bill follows turns, consider counting turns there too (see `site-metrics-scope.md`, open decisions).

**What the visitor sees.** The function answers `{ blocked: 'ip' }`. The page shows the same "resting" screen with its alternatives (the breathing tool, a person, a journal, a professional, the Venice link), worded so that it does not blame the visitor: "This connection has used its free conversations for today. Shared networks count together." No countdown, because the day boundary is not their clock.

**If the store fails,** the visitor is let through, as with the daily cap: an outage here should not lock people out of a breathing tool.

**What it does not do.** It does not stop someone who changes network (a VPN, or switching to mobile data) from starting more conversations; the daily cap still bounds the bill. It is a brake on casual looping, not a security control.

## "Forget me"
"Forget me" erases what is on the device. It cannot erase this record, which is on the server and is not on the device. The button's helper text and the Terms must say so: "Forget me" resets this device; it does not reset a daily limit that is counted for your connection. The browser rest remains as a courtesy; once the allowance exists, the 6-hour rest could be shortened or removed (decide later).

## Privacy and wording changes this requires (do these before building)
- The README says the relay "stores nothing" and "does not log message text". True of messages; it would no longer be true that the function stores nothing. New wording: it stores two daily counts (all conversations, and a keyed hash of each connection) and deletes them by the next day.
- The Terms and Privacy Policy need a revision (new effective date, archive copy in `docs/legal/archive/`) describing the connection record, its purpose, its retention, and that "Forget me" does not clear it.
- `docs/device-memory.md` stays accurate (it covers the device); add a pointer to the server-side record.
- The marketing repo's `brand/claims.md` and `brand/banned.txt` rely on "no analytics" and "stores nothing" wording; revisit them with the Terms.

## Fairness and risk
- Shared addresses (schools, offices, libraries, carriers) can use up the allowance for everyone behind them. The default of 2 and the non-blaming message limit the harm; raise `COACH_IP_TURNS` if real use shows it. Blocked starts should be counted in aggregate only (no IP), in the log as a code, so the allowance can be tuned from real numbers.
- The hash secret must be generated and set by you in the Netlify environment, never pasted into chat or code, and rotated if it is ever exposed (rotating it only resets today's counts).

## Owner access (the first credentialed user)
**Decision (2026-11-06): build the token (option 1 below), designed as the first "admin key"**, a prototype for any later profile idea. The same key would open the admin-only views (the metrics page in `site-metrics-scope.md`, a possible list of verified reports) and skip the connection allowance and the browser rest, never the site-wide cap or the per-minute limit.
- **Design so it can grow:** the function resolves a token to a *role* (today only `admin`), by comparing against a hashed value in the environment, so more keys with other roles can be added later without changing the checks.
- **It stays a key, not an account:** no password database, sign-in page, session or stored profile. That keeps the Terms' "no accounts" statement true. If real user profiles are ever wanted, that is a separate, deliberate privacy decision: it would change what the site stores and what the Terms and README say, and should be scoped on its own.
- **Handling:** the token is generated and set by you in Netlify, pasted into the admin page by you, kept in that browser's storage, sent in a request header and never in a link. I never see or handle it.

Today's "owner mode" is a browser flag. It skips only the 6-hour rest, in that browser, and nothing on the server knows about it.

**How to use it now.** In your own browser, on the site you are testing, open the developer console (Safari: Develop menu > Show JavaScript Console; Chrome: Cmd+Option+J) and run:

```js
localStorage.setItem('nenya.coach.owner', '1')
```

To turn it off: `localStorage.removeItem('nenya.coach.owner')`. To clear a rest already running: `localStorage.removeItem('nenya.coach.rest')`. Notes:
- Storage is per site address: set it separately on nenya.biz, on the staging site, and on each deploy preview.
- "Forget me" keeps the flag; Emergency Exit removes it.
- It does **not** skip the daily cap (100), Netlify's 15-a-minute limit, or the future allowance.

**What a server-side owner bypass would need.** A per-IP allowance is enforced by the function, so a browser flag cannot lift it. Three ways, in order of preference:
1. **A secret token (suggested).** You set `COACH_OWNER_TOKEN` in Netlify; your browser keeps the same value in its own storage (set once from the console, never shown in the page, kept through "Forget me" like the flag) and sends it in a request header. The function compares it in constant time and, if it matches, skips only the connection allowance and the rest. The daily cap and the per-minute limit still apply to you. Risk: if the token leaks, someone can skip the allowance, but not the cap. This is a single secret known to one person, **not an account**: there is no password database, sign-in page, or session. If more testers are added later, each would get their own token (a list of hashes in the environment), and the Terms' "no accounts" statement would still hold.
2. **An allowed address list** (`COACH_OWNER_IPS`). No secret in requests, but home and mobile addresses change and shared ones would exempt other people.
3. **No bypass in production.** Test with `COACH_IP_DAILY` set high on previews and staging only, and accept the limit on the live site.

## Tests to write when it is built
Key hashing (same IP and day gives the same key, different day or IP gives a different one, IPv6 /64 grouping, secret never appears in logs); the claim logic with a fake store (allowance, concurrency, day rollover, store failure lets through, deletion of old days); the function's order of checks (crisis stop and manipulation use nothing, the cap is not used by a blocked connection, the connection is not counted when the cap refuses); the `blocked: 'ip'` screen and its wording; the owner token (right token skips, wrong or missing does not, comparison is constant-time, the token never reaches logs or the transcript).

## Rollout
1. Update the README, Terms (new date, archive copy) and the "Forget me" helper text first.
2. Ship to a preview with `COACH_IP_TURNS` high; test the limit with it set to 1.
3. Set `COACH_IP_SECRET` and `COACH_OWNER_TOKEN` (stored as a hash) in Netlify yourself.
4. Production at 10; watch the aggregate blocked count for a week.

## Decisions made (2026-11-06)
- **Allowance:** 2 conversations' worth, counted as **10 turns per calendar day** per connection (see above).
- **Browser rest:** shortened from 12 hours to **6 hours**. It still starts only when a conversation finishes (an abandoned conversation does not start it); the server-side turn allowance is what covers abandoned ones. This is a change to the constant and its wording in the coach page and `docs/device-memory.md`, and the owner flag still skips it.
- **Owner access:** the token, built as the first admin key (see above).

## Still to decide
- The wording of the blocked screen.
- Whether the site-wide daily cap becomes a turn cap, and the number.

## More decisions (2026-11-07)
- **Blocked screen wording:** "This connection has used its free conversations for today. Shared networks count together." (plain, no blame, no countdown), above the usual alternatives.
- **Site-wide daily cap** becomes a turn cap, 500 a day (see `site-metrics-scope.md`).
- **Cleanup of old records:** records are keyed by day and removed by a small scheduled cleanup (and opportunistically when a conversation starts), so none outlives about two days; the Terms wording should say "deleted within two days".

## Address changes mid-conversation (decided 2026-11-07)
A conversation's turns are **counted against the connection that started it**, not against whichever address sends a later message:
- At the first exchange, the function makes the one-way daily code for the connection (as above) and puts it **inside the signed ticket** that already carries the conversation's state (the ticket is authenticated, so the page cannot change it).
- Every later exchange adds its turn to that code from the ticket, whatever the current address is. A VPN switched on, or Wi-Fi changing to mobile data, no longer splits the count or touches the new address's record.
- The conversation itself never depended on the address (the ticket binds history and session colors only), so nothing breaks when the address changes.
- **Not prevented:** starting a *new* conversation from a new address gets a fresh count. That limit is inherent to any per-address rule; the site-wide cap still bounds the bill.
- The code sits in the ticket the page holds, so the Terms say so (Section 21). It is one-way and cannot be turned back into an address without the key.
- **Tests:** a conversation whose later messages come from different addresses adds all its turns to the starting code; a tampered code in the ticket is refused; the new address's record is untouched.

