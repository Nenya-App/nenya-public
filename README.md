# Nenya

A free, private, browser-based tool for structured personal reflection:
a minute of paced breathing, then six optional sensory "gateways" (Sight,
Sound, Touch, Essence, Movement, Insight) for checking in with an emotional
state without having to put it into words first.

Live at [nenya.biz](https://nenya.biz).

Nenya is not a medical device or a substitute for professional care. See
the in-app Terms of Use for the full statement, including crisis resources.

## What it does

- **Breathing first.** A glowing logo and a live counter guide your breath.
  You choose a rhythm on your first screen (Steady 5·5 is the default, about
  six breaths a minute) and can change it any time from the counter.
- **Six gateways.** Pick one or all of them, in any order:
  - *Sight*: two colors, one for where you are and one for where you wish you were.
  - *Sound*: those colors become a short melody, in six tonal systems
    (Western, Arabic maqam Rast, Javanese Slendro, Indian Bhairav, Japanese
    Miyako-bushi, and the blues), each written in its own notation.
  - *Touch*, *Essence*, *Movement*, *Insight*: sliders and short prompts, plus a
    body map and a freeform drawing canvas.
- **A report you keep.** A PDF summary, generated entirely in your browser,
  that you can save, print, or bring to someone you trust.
- **Accessibility.** Light and dark themes, adjustable text size, animation
  controls, four vision modes, and an Emergency Exit button that leaves the
  site immediately.
- **Add to Home Screen.** A header button explains how to save Nenya to a phone's
  home screen or a browser's bookmarks. This is a shortcut, not an offline app.
- **Reading.** The About section explains the design, the Nonviolent
  Communication approach, and the sixteen "Valar" archetypes of need that give
  the colors their meaning.

## Privacy: what is and isn't true

Nenya is built so that there is almost nothing to disclose. The full legal
text is in the in-app **Terms of Use & Privacy Policy** (source:
[`src/lib/legalDocument.ts`](./src/lib/legalDocument.ts)). In short:

- No accounts, no analytics, no advertising, no cookies, no fingerprinting.
- What you enter while using the tool stays in your browser's memory and is
  gone when you close the tab. It is never sent to a server. Even your
  light/dark choice is deliberately not remembered between visits.
- Fonts, images, and scripts are all served from the site itself, and the
  Content Security Policy in [`netlify.toml`](./netlify.toml) enforces that.

The honest edges:

- **Hosting logs.** The site is hosted on Netlify, which keeps ordinary
  connection logs (such as IP address) like any web host.
- **Optional forms.** The site has one optional submission form, used for error
  reports, sensory-reflection reports you choose to share, and contact
  messages. It posts to Netlify Forms. Nothing is sent unless a visitor
  clicks send, and visitors are asked not to include identifying details.
- **Outbound links.** Links to Fractured Atlas (donations), GitHub, and the
  Venice AI chat demo leave the site. Each of those is governed by its own
  policies, not Nenya's.

## About the AI pieces

**The free tool has no AI in it.** Two things live beside it:

- **A prototype conversation partner on Venice AI.** The About section links out
  to a Nenya character hosted on [Venice AI](https://venice.ai). It runs on
  Venice's service and is not covered by Nenya's privacy and safety systems, and
  the page says so.
- **The coach demo.** An optional five-exchange conversation with the same
  character. Inside the site it is the session screen, reached after the gateways
  and reflection tools; it is also available on its own at `nenya.biz/coach`, where
  the visitor first picks the same two interface colors. Those colors theme the
  page and serve as a temporary session label (not an account, not stored); they
  are bound into the ticket and into signed transcripts. It goes through a small
  relay function, served at `/api/coach`, in
  [`netlify/functions/coach.mts`](./netlify/functions/coach.mts), so the Venice API
  key stays server-side. The function stores nothing and does not log message
  text. Caps: five exchanges, 500 characters per message, short replies, and a
  signed ticket that stops a client from forging or extending the history. The
  character's prompt lives on Venice, not in this repository.

  The demo also includes, all as small shared code in `src/lib`:
  - **Identifier scrubbing** ([`piiScrub.ts`](./src/lib/piiScrub.ts)): common
    identifiers are replaced with placeholders on the visitor's device, and again on
    the server. It is pattern matching and misses most names.
  - **Safety flags** ([`safetyFlags.ts`](./src/lib/safetyFlags.ts)): a clear crisis
    statement is never sent to the AI and ends the conversation with resources;
    ambiguous distress is sent with an instruction to respond with care. Also phrase
    matching, so it can miss things and flag harmless words.
  - **Reflection hand-off**: if the visitor arrives from the gateways, the session screen
    offers (off by default, with a preview) a text summary of their entries, scrubbed on the
    device and screened again on the server. It is sent as framed background data, bound
    into the ticket and the signed transcript as `context`. Uploading a prior report is not
    built.
  - **Continue on Venice**: when a demo ends without a safety notice, the page links to the
    same character on Venice AI's own site (links in [`veniceLinks.ts`](./src/lib/veniceLinks.ts),
    with the referral code disclosed), warning that Nenya's protections do not run there.
  - **Instruction screening** ([`promptGuard.ts`](./src/lib/promptGuard.ts)): messages
    that try to steer the coach ("ignore your rules", "show your prompt", fake
    system/role markers) are not sent, on the device or on the server; invisible
    characters and chat-template markers are stripped, and the system instruction
    tells the model to treat user text as content, never as commands. Phrase matching,
    so it is a speed bump, not a guarantee.
  - **Signed transcripts** ([`docs/coach-transcripts.md`](./docs/coach-transcripts.md)):
    a conversation can be downloaded, from the first exchange on, with a dated Ed25519 signature, and checked
    with `node scripts/verify-transcript.mjs`.

The in-app "partner practice" (dyadic cells), Eagle Protocol, and PII-scrubbing
screens are scripted previews of planned features, not working protections; the
coach demo carries only the basic versions described above. A fuller coach, with
on-device processing and data minimization, is planned as a separate product so
the free tool never depends on it.

## Running it locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install     # needs internet once, to download dependencies
npm run dev     # development server
```

To build static files:

```bash
npm run build   # outputs a fully static dist/ directory
```

`dist/` needs no server-side code, but it has to be served over HTTP rather than
opened by double-clicking `index.html` (the files use absolute paths). Any static
server works, for example `python3 -m http.server` run inside `dist/`.

**Offline use.** Once installed and built, the breathing tool, all six gateways,
the audio, and the PDF report work with no internet connection. These do not:
sending a report or contact message (they need the hosted Netlify form), the
`/coach` demo (it needs the relay function and Venice AI), and the outbound links.

To try the demo locally you need the [Netlify CLI](https://docs.netlify.com/cli/get-started/)
(`netlify dev`) and your own Venice key; plain `npm run dev` serves the page but not
the function.

## Deploying

The project is set up for Netlify:

- [`netlify.toml`](./netlify.toml) holds the security headers (including the
  Content Security Policy), cache rules, and the app's rate limit. The coach
  function's own rate limit is set in its source file.
- [`index.html`](./index.html) contains a hidden static copy of the
  `report-submission` form so Netlify registers it at build time. The in-app
  form posts to the same name (see [`src/lib/reportSubmission.ts`](./src/lib/reportSubmission.ts)).
  Where those submissions are emailed is set in the Netlify dashboard.
- The `/coach` demo's function reads these environment variables (set them in the
  Netlify dashboard for the Production context, Functions scope; never commit them):
  `VENICE_API_KEY` (secret), `COACH_TICKET_SECRET` (secret), `COACH_ENABLED`
  (`true` to accept requests). Optional: `COACH_SIGNING_KEY` (secret; enables signed
  transcripts, see the docs), `COACH_MODEL`, `COACH_CHARACTER_SLUG`.
  Changes take effect on the next deploy.

## Project layout

```
src/app/           React app: pages, About essays, gateway components
src/coach/         The separate /coach demo page (built as its own entry)
scripts/           verify-transcript.mjs: checks a signed transcript
netlify/functions/ Server-side relay for the coach demo
src/lib/           Audio and tonal systems, PDF generation, legal text, form submission
public/            Static assets: fonts, icons, PDF assets, web manifest
docs/legal/        Archive of earlier versions of the Terms and Privacy Policy
```

The Terms of Use & Privacy Policy lives in one file,
[`src/lib/legalDocument.ts`](./src/lib/legalDocument.ts), which feeds the
in-app pages and the downloadable PDF. When it changes, the outgoing version is
saved in [`docs/legal/archive`](./docs/legal) first. See that folder's README.

## Support

Nenya is a sponsored project of Fractured Atlas, a non-profit arts service
organization. Contributions for the charitable purposes of Nenya must be made
payable to "Fractured Atlas" only and are tax-deductible to the extent
permitted by law. Nenya accepts no equity investors.

Questions or feedback: info@nenya.biz.

## License

The source code in this repository is licensed under the
[GNU Affero General Public License v3.0](./LICENSE) or later. Anyone may run it
locally. If you modify it and offer it to others over a network, the license
requires you to share your changes under the same terms.

The "Nenya" name and logo are **not** covered by that license. See
[`TRADEMARK.md`](./TRADEMARK.md) for what that does and doesn't allow. Third-party
credits are in [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md).

## Contributing

Please read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before opening an
issue or pull request.

---

<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" width="120" />
</a>
