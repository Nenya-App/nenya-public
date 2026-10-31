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

**There is no AI in this repository or in the free tool.** The About section
links out to a prototype conversation partner, a Nenya character hosted on
[Venice AI](https://venice.ai). It runs on Venice's service and is not covered by
Nenya's privacy and safety systems, and the page says so. The in-app "partner
practice", "session", Eagle Protocol, and PII-scrubbing screens are scripted
demonstrations of planned features, not working protections.

A fuller coach is planned as a separate product so the free tool never
depends on it. Its design is not in this repository.

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
sending a report or contact message (they need the hosted Netlify form), and the
outbound links.

## Deploying

The project is set up for Netlify:

- [`netlify.toml`](./netlify.toml) holds the security headers (including the
  Content Security Policy), cache rules, and rate limits.
- [`index.html`](./index.html) contains a hidden static copy of the
  `report-submission` form so Netlify registers it at build time. The in-app
  form posts to the same name (see [`src/lib/reportSubmission.ts`](./src/lib/reportSubmission.ts)).
  Where those submissions are emailed is set in the Netlify dashboard.

## Project layout

```
src/app/           React app: pages, About essays, gateway components
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
