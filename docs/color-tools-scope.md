# Scope: color tools for the Sight gateway, local first and online by choice

Status: scoping only, nothing built. Written 2026-11-09. Extends `docs/colormind-scope.md` after the owner asked to look at other open-source and online models, including an "AI color namer" found at designtools.tools. I am not a lawyer; terms below are as read from the pages named, on 2026-11-09.

## Two jobs, not one
1. **Naming a color** ("what would you call this?"). Today the person types a name themselves (`color1Name`, `color2Name`); nothing suggests one. A suggested name helps people who find words hard, and gives screen-reader users something to hear.
2. **Making a palette from the current and wish colors** (the Colormind idea).

## What I looked at
| Option | Job | Runs where | Cost / terms (as read) | Fit |
| --- | --- | --- | --- | --- |
| **Local math** (convert to OKLCH/OKLab and compute analogous, complementary, triad or "bridge" steps; no library needed, or a small MIT library such as `culori`) | palette | in the browser | free, no network, no data leaves | **Best default.** Predictable, accessible, works offline. |
| **color-name-list** (github.com/meodai/color-names, npm `color-name-list`) | naming | a subset shipped with the site, or its REST API at `api.color.pizza` | MIT ("simple attribution"); 32,004 names; full bundle about 1.2 MB, with smaller `bestof` and `short` sets; the API is free, with no stated limits | **Best for naming.** Nearest name in a perceptual color space, from a bundled subset: deterministic, no network, no third party. Credit it in `ATTRIBUTIONS.md`. |
| **The Color API** (thecolorapi.com) | naming and palettes | its server, over **HTTPS** | `/id` returns a color's name; `/scheme` makes palettes (monochrome, analogic, complement, triad, quad, ...); free; rate limits, CORS, license and open-source status are **not stated** on the docs page; run by one person | A workable online option, and unlike Colormind it is HTTPS. Unverified terms. |
| **Colormind** (colormind.io) | palettes | its server, **HTTP only** | free for non-commercial use; commercial use needs the owner's agreement; no limits, CORS or attribution stated | See `docs/colormind-scope.md`. Must go through our server; unencrypted. |
| **designtools.tools "AI color namer"** | naming | unknown | **I could not open it**: the address does not resolve from here (`designtools.tools` and `www.designtools.tools`). Please check the exact address. If it is a site without a documented API, calling it would mean scraping a page, which we should not do. | Not assessed. If it is just "nearest name from a list", `color-name-list` already does that locally. If it asks a language model, that sends the color to a third party for little gain. |
| **A language model naming colors** (any provider) | naming | a server | sends the color (not much else) to a third party and can invent | Not recommended: the nearest name from a curated list is predictable and has no data flow. |

Not verified, and not looked at: Huemint, Khroma and Coolors (palette services with their own terms or keys), and any trained palette model that could run in the browser (a research-sized download for a small gain).

## Recommendation
- **Naming:** bundle a subset of `color-name-list` and suggest the nearest name as a gentle default the person can edit ("This might be called *Deep Teal*. Use it, change it, or keep your own."). It is fast, offline, MIT, and removes any need for a third party.
- **Palettes:** build the **local** generator first (analogous, complementary, and the present-to-wish "bridge"), with contrast and distinctness checked as for the Nenya palettes. Then offer **one** online source, chosen after the terms are confirmed, behind an opt-in button.
- **One opt-in pattern for any online source:** a button that says what is sent ("the two colors, as RGB values, through our server to <service>, which we do not control"), nothing called until it is pressed, the call made by our server (so the service never sees the visitor), nothing stored or logged, a per-connection daily limit, the service named and credited, a plain "unavailable right now" when it is down, and the Terms, Privacy Promise and answers updated with the same sentence. Adding a second service later means adding a name to that pattern, not designing it again.
- **In the report and for the coach:** a suggested name that the person kept is part of their words; a generated palette is "colors of your own" with a source line, never a Nenya palette.

## Decisions for the owner
1. The exact address of the site you found (so I can read what it is and how it names colors), and whether it is open source.
2. Local naming from `color-name-list`: yes? Which set (`bestof`, a few thousand names, or `short`)? I would start small.
3. Local palette generator first: yes? Which modes (analogous, complement, triad, bridge)?
4. Which single online source, if any, after the terms are read: The Color API (HTTPS) or Colormind (HTTP, and the "non-commercial" question). Whether to write to either.
5. Whether suggested names should be spoken or shown to screen readers by default.

## Order of work
1. The report-to-coach module on the staging site (the current step).
2. Local naming and the local generator, with tests (pure functions).
3. The shared opt-in pattern and one online source, behind a switch.
4. Then the other sensory gateways (the owner's next scope): each gets the same treatment of looking at what is local, what is online, and what is only a suggestion.

## Not verified
- Terms, limits, CORS and privacy policies of the online services; whether designtools.tools exists at any address; bundle sizes for the name subsets after minification; any legal position.
