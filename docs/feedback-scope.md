# "Give feedback": a live feedback tool on Netlify Forms (built 2026-11-19, off by default)

**The flow.** A small "Give feedback" button (bottom left, after the Terms are agreed) opens a window. Step 1, **Select a feature**: point at something on the page (the next click is the choice; Escape or Cancel goes back) or choose one or more from a list, "Something else" included. The list is the keyboard and screen-reader way to do exactly what pointing does. Step 2, **Your comment**, with an optional email address. Send. Everything is English only; lens names use the lens words (`src/lib/vocabulary.ts`).

**What is collected.** The page's path (no query, no fragment), the chosen feature(s) or the short label of the thing pointed at (its own label or visible name; never what is typed in a field), the comment (names and contact details are taken out of it by the site's existing scrubber), and, only if typed, an email address. The address is never prefilled, never required, **never put in the form or stored anywhere**: it is used once, in the request, for the automated thank-you, and gone. Nothing is saved on the device.

**The pipeline (`netlify/functions/feedback.mts`, `/api/feedback`).** Netlify Forms alone would let anyone post straight to the form, so the page posts to this function, which runs the checks the site already has and only then posts to the Netlify form `feedback` (as `submit.mts` does for its alert):

| Order | Check | Reused from |
|---|---|---|
| 1 | Switch `FEEDBACK_ENABLED=true`, else 503 | the `WORD_HELP_ENABLED` pattern |
| 2 | The site's own origin; JSON only; body size | `hostAllowed` (`originHosts.ts`) |
| 3 | Honeypot field `website`: pretend success, keep nothing | `guestbook.mts`, `submit.mts` |
| 4 | Per-connection (default 5) and daily (default 200) limits, by the one-way daily connection code | `connectionCode` (`connectionLimit.ts`); keys under `c/<day>/`, which `coach-cleanup` deletes |
| 5 | Cloudflare Turnstile, with action `feedback`; mode from `COACH_TURNSTILE` (off, shadow, on) | `checkTurnstile` (`turnstileCheck.ts`, now with an optional action) and `useHumanCheck` (now with an optional action) |
| 6 | Plain text only; length 2,000 | `sanitizePlainText` |
| 7 | Names, emails, phones and the like taken out | `scrubPII` |
| 8 | A comment too short or not made of words is asked for again (never silent) | `checkMessageForm` (`COACH_FORM_CHECK=off` also turns this off) |
| 9 | The private list's slur and abuse matcher; a hit at severity 2 or more is refused (422) and dropped | `getMatcher` and `match` (`lexiconStore.ts`, `lexicon.ts`); skipped when the private list is not uploaded, as in the coach |

A note that fails 3 to 9 is dropped: not filed, not emailed. Only plain counts are kept (`feedback.*` events, shown on the admin page under "Feedback"). **Nothing is logged.** The nightly canary (`canary-nightly.mts`) is a model test on invented cases; it has no per-submission part, so nothing from it applies here.

A note that passes is filed with a `checked` field: an HMAC (under `COACH_TICKET_SECRET`) of its fields, which only this function can make. **The digest and the thank-you trust nothing without it**, so a note posted directly to the form (the form must exist in the built page for Forms to work) is never emailed. It would still sit in the Forms list; delete it there.

**Why the checks run in front of the form, not in a `submission-created` function.** That event fires after Forms has already stored the submission, and it carries no reliable connection address (so no per-connection limit) and cannot refuse. Deleting from it needs an API token; a function in front needs none. The proof field gives the same guarantee for what is emailed.

## The thank-you (`FEEDBACK_AUTOREPLY=on`)
Fixed words (`thankYouMail`), never repeating the comment, saying the address was not kept. Sent through **one small interface**, `MailSender` in `src/lib/feedbackMail.ts`. The repo had no mail sending before this; the only email the site causes is Netlify's own form notifications, and those cannot reply to a visitor. `senderFromEnv` makes a sender from `FEEDBACK_MAIL_URL`: it POSTs `{from,to,subject,text}` as JSON, with an optional Bearer token, and any 2xx is "sent". No service is named or bundled. Swap the provider by changing what that URL points at, or replace `senderFromEnv`.

## The daily digest (`netlify/functions/feedback-digest.mts`, 07:00 UTC, `FEEDBACK_DIGEST=on`)
Reads the form's submissions with the Netlify API (`GET /sites/{id}/forms`, `GET /forms/{id}/submissions`), keeps notes created since the last delivered digest whose proof holds, builds one plain-text digest and sends nothing on a quiet day. It keeps one timestamp in the private store (`fb-digest/last`); a failed delivery leaves the window open. It was chosen over a stored copy because Forms stays the only place the notes live (the owner's choice), so there is nothing extra to expire. The cost is one token. Delivery is `FEEDBACK_DIGEST_VIA=form` (default: posts to the form `feedback-digest`; the owner adds an email notification for that form, so no provider is needed) or `mail` (through the same `MailSender` to `FEEDBACK_ADMIN_EMAIL`). Scheduled functions run only on a site's published deploy.

## What the owner sets up (none of it is done by this change)
1. **Dev site, Netlify settings, Forms:** after a deploy that contains this change, the forms `feedback` and `feedback-digest` appear. Add an **email notification** for `feedback-digest` to the admin address (Site configuration, Forms, Form notifications). Do not add one for `feedback`.
2. **Dev site, Environment variables** (the dev site's own; never the production site, never in chat): `FEEDBACK_ENABLED=true`; for the digest `FEEDBACK_DIGEST=on` and `FEEDBACK_NETLIFY_TOKEN` (a personal access token, Functions scope, secret); for the thank-you `FEEDBACK_AUTOREPLY=on`, `FEEDBACK_MAIL_URL` (secret) and optionally `FEEDBACK_MAIL_TOKEN`, `FEEDBACK_MAIL_FROM`. `COACH_TICKET_SECRET` and `COACH_IP_SECRET` must already be set; `COACH_TURNSTILE`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES` and `VITE_TURNSTILE_SITE_KEY` make the human check live (the same ones as the coach).
3. **A mail provider**, only for the thank-you (and the digest if `mail`): a sender that accepts the JSON above.
4. The build switch `VITE_FEEDBACK=on` is already set for dev builds only (`netlify.toml`, `[context.dev.environment]`, and `.env.development`); production has none.

## Terms and privacy
Section 14 gains one bullet and Section 2's list one phrase, both shown **only** when `VITE_FEEDBACK` is on (the pattern of `WORD_HELP`); with it off the text is byte for byte what it was, so no archive copy is needed and the effective date is unchanged. When the tool goes to production, the owner approves the wording first and the outgoing text is archived then (`docs/legal/README.md`). Data register rows are added.

## Not done / for later
- The wording of the Terms sentence is mine, for the owner's review.
- Direct posts around the function remain possible in Forms (ignored by the digest; Netlify's own spam filter applies).
- Stored notes are removed by hand in Forms; there is no automatic expiry (the register says so).
