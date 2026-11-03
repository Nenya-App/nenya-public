# Testing the coach as the owner

Two things limit repeat use of the coach demo. Neither needs a server-side bypass.

**The 12-hour rest.** After a conversation ends, the page saves the finish time in the browser's
local storage (`nenya.coach.rest`) and shows a "resting" screen until 12 hours pass. It is a courtesy
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

**The daily cap** (100 new conversations a day, across all visitors) is a single anonymous counter in the
`coach-private` Blobs store (`daily-count`, holding only a date and a number). The day turns over at midnight
Minnesota time. Only a conversation's first exchange uses a slot. Set `COACH_DAILY_CAP` in Netlify's
environment variables to change the number, for example to raise it temporarily while you test. When the cap
is reached, the page tells the visitor and nothing they wrote is sent. If Blobs cannot be reached, the demo
stays open, so an outage never locks people out. Read the count with:

```bash
npx netlify-cli blobs:get coach-private daily-count
```
