# Scope: admin sign-in and panel (Netlify Identity)

Status: scoping only, nothing built. Written 2026-11-07. Netlify Identity is activated for the site. Read with `docs/coach-ip-limit-scope.md` ("Owner access") and `docs/site-metrics-scope.md` ("Reading the numbers").

## Purpose
A private panel for the people who run Nenya: see the usage totals, later a list of verified transcript reports, and bypass the coach's per-connection allowance when testing. Not for visitors. Visitors never see a sign-in, and no part of the reflection tools or the coach uses it.

## Before anything else (settings, in Netlify)
- **Registration: Invite only.** The default is Open, which would let anyone create an account. Netlify's documentation says invites work under either setting, so Invite only costs nothing. Confirm it is set before the widget is on any page.
- No external sign-in providers unless wanted (each one is another place accounts can come from).
- Invite yourself; set your role (`admin`) in the Identity user's app metadata, which only a site admin can edit.

## Making the widget workable
Netlify's sign-in widget is a script that draws the sign-in dialog and talks to the site's own `/.netlify/identity` address. The site's security policy is strict (`script-src 'self'`, `frame-src 'none'`, `connect-src 'self'`, `style-src 'self' 'unsafe-inline'`), which is a feature and should stay.
- **Bundle it, do not load it from a CDN.** Install the widget from npm and import it in our own code, so the script is served from nenya.biz and `script-src 'self'` stays unchanged. The statement "Nenya does not load scripts from other sites" (Section 18 of the Terms) stays true.
- **Only the admin page loads it.** A separate page (`/admin/`, not linked, `noindex`, excluded from the sitemap and `llms.txt`) imports the widget. The welcome page, the reflection tools and the coach never download it, so visitors pay nothing for it.
- **Its dialog may need policy changes, to be tested, not assumed.** My understanding, not verified: the widget draws its dialog inside an iframe, which `frame-src 'none'` would block. If so, either allow `frame-src 'self'` **on the `/admin/` path only** (Netlify headers can be set per path), or skip the widget's dialog and build our own small sign-in form with the lighter client library (the third-party description I found names `@netlify/identity` as the recommended replacement; not confirmed against Netlify's own notes). Tomorrow's first check: load the widget on a preview of `/admin/`, open the browser's console, and see which policy rules it trips.
- **Invitation and password-reset links land on the site's front page** with a token in the address (after the `#`), not on `/admin/`. Something has to pick that token up. Plan: a few lines of our own code at the front page's entry that, when the address contains an invite, recovery or confirmation token, redirects to `/admin/` with the token intact, and does nothing for everyone else. No Netlify code loads on the front page.
- **Local testing:** the widget needs the live site's address to talk to. Test on a deploy preview, not on the local dev server.

## Who may do what
- The panel and any admin function (stats, reports, bypass) check the signed-in user's **role** (`admin`), never merely "signed in". A function reads the verified claims Netlify attaches to the request; it does not trust anything the page says about the user.
- Roles live in the Identity user's app metadata. Today there is one role, `admin`. More roles (testers) are possible later and need their own decision about disclosure.
- The coach allowance bypass (`coach-ip-limit-scope.md`) can use the same role instead of a separate secret token. Choose tomorrow: Identity role (a real sign-in, invitations, a base for more roles) or the environment token (no sign-in, no emails stored, nothing new on the site). Either way the key is not a visitor account.

## What the panel shows (first version)
- Last 30 days of our own daily totals (`site-metrics-scope.md`), as a table.
- Nothing else until the counters exist. Later: verified transcript reports (`transcript-receipt-scope.md`), the day's allowance usage.

## Wording
- The Terms (effective 2026-11-07) already say a sign-in exists only for the people who run Nenya through Netlify Identity, holding only their email addresses, and that visitors are not offered accounts. If testers or anyone else are ever invited, the wording changes first.
- README, marketing `claims.md`: "no account required" is accurate; "no accounts" is not.

## Tests to write when it is built
- The widget code is only in the admin page's bundle: the welcome page and coach bundles do not contain it (assert on the build output).
- The front-page redirect fires for an invite, recovery and confirmation token and for nothing else, and never sends the token anywhere but `/admin/`.
- Admin functions: no user, a user without the role, and a user with the role are three different results; the role check cannot be satisfied by a request header or body the page controls.
- `/admin/` is not in the sitemap or `llms.txt`, and carries `noindex`.
- The security policy still has no outside hosts; any per-path relaxation is only on `/admin/`.

## Open decisions
- Widget dialog (with a per-path `frame-src`) or our own small form?
- Identity role or environment token for the bypass?
- Multi-factor sign-in: not checked whether Identity offers it; look it up before relying on a password alone for an admin.
- Whether to keep the `/admin/` path name or something less guessable (hiding the path is a courtesy, not security).
