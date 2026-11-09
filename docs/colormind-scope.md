# Scope: an optional Colormind palette in the Sight gateway

Status: scoping only, nothing built. Written 2026-11-09 from the owner's request: an opt-in integration, on the Sight (visual) gateway only, that uses the Colormind API to generate a unique palette from the person's current and wish colors. Colormind returns five colors; the sixteen Nenya palettes have six, and that difference is fine.

## What the Colormind API is (read from colormind.io/api-access, 2026-11-09)
- A POST to `/api/` with JSON: a `model` (`"default"` and `"ui"` always exist; others change daily) and an `input` array of up to five entries, each an RGB triple or the placeholder `"N"` for "you choose". The answer is `{"result": [[r,g,b], ...]}` (five triples; the colors you supplied may come back changed slightly).
- Free for personal and non-commercial use; commercial use needs the owner's agreement. No API key. No rate limit, CORS rule or attribution rule is stated on the page. The models reload daily and the service is down for about 30 seconds then.
- **The address shown is `http://`, not `https://`.** A page served over HTTPS cannot call an HTTP address from the browser (blocked as mixed content), and a call over HTTP is not encrypted. So the browser cannot call it directly.

## How it could fit
- **Inputs** (only colors, never words): "Present" = `[current, N, N, N, N]`, "Wish" = `[N, N, N, N, wish]`, and a "Bridge" = `[current, N, N, N, wish]`, a five-color path from where the person is to where they would like to be, which fits the gateway's own idea.
- **Where:** after the person has chosen both colors in the Sight gateway, a clearly optional "Make a palette from these colors" button. Off unless pressed. Nothing is called before that, and nothing on any other gateway.
- **Through our server, not the browser:** a small function (`/api/palette`) takes the two colors (validated as hex), asks Colormind, and returns the five colors. Colormind then sees only our server and the RGB values: not the visitor's address, no cookie, no identifier, nothing else. The call to Colormind is unencrypted (their limitation); the function stores and logs nothing. A per-connection daily limit like the coach's keeps it from being used as a free service.
- **What the person gets:** five swatches with hex codes and color names, "Use as my palette" to keep it in the report (clearly marked "generated with Colormind"), and the picker's usual keyboard and screen-reader behavior. The generated colors count as "colors of your own" if later shared with the coach (not a Nenya palette); the palette name is the source line.
- **A local option beside it.** Because the API is HTTP-only and third-party, I would also build a local generator (harmonious colors computed in the browser from the two colors, no network) and offer it **first**, with Colormind as the second, opt-in choice for people who want a more varied result. The local one needs no Terms change and works offline.

## Privacy and the Terms (the part that must be right)
- Using it **sends the two RGB colors, through our server, to a third party** (Colormind, colormind.io), over an unencrypted connection. The button says so in one plain sentence before it is pressed. The Terms (a new bullet near the Sight gateway/third-party section), the Privacy Promise and the privacy answers need the same sentence; "nothing leaves your device" would stop being true for a person who presses it, so every such sentence gets "unless you choose..." as for the coach.
- No stored copy, no log, no identifier. Colormind's own policies apply to what it receives (the page names none; we should say we have not seen one, and link to the site).
- Credit: a line on the page, in the README and in `ATTRIBUTIONS.md`.

## Risks and decisions
1. **Non-commercial use.** Nenya is non-commercial and fiscally sponsored, but it has a Venice referral program that earns credits. The page says commercial use needs Colormind's agreement; the safe step is to write to them (I can draft the note), and ask Fractured Atlas if the credits could count.
2. **HTTP only.** If Colormind never offers HTTPS, the server-side call is unencrypted. Acceptable for two RGB values? Your call.
3. **Reliability.** A third-party service with a daily 30-second outage and no promise: the button should disappear or say "unavailable right now" without breaking the gateway; the local option is the fallback.
4. **Local first or Colormind only?** I recommend local first, Colormind opt-in second.
5. **Which of the three** (Present, Wish, Bridge) to offer. I recommend Bridge only, to start.
6. **Models:** `"default"` unless you prefer another (the list changes daily).
7. **Accessibility:** names for every color, contrast shown, keyboard and screen-reader behavior for the swatches, no information carried by color alone.
8. **Report and PDF:** how a generated palette appears there, and in the shared-to-coach summary (as colors of the person's own, with the source line).

## Order of work (after the report-to-coach module)
1. Write to Colormind (draft in the Downloads folder); decide the decisions above.
2. The local generator and its tests (pure functions; contrast and distinctness checked, as for the Nenya palettes).
3. The function, its limits and its tests (a stand-in for Colormind).
4. The button and swatches on the Sight gateway; the report, PDF and coach hand-off.
5. The Terms, Privacy Promise, welcome letter and answers; attribution.

## Not verified
- Whether Colormind sends CORS headers or offers HTTPS (not stated); whether they have a published privacy policy; what "non-commercial" means for the referral credits; behavior under load. None was called from here.
