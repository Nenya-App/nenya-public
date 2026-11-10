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

## Progress (2026-11-09): local naming built; palettes next
Owner's decisions: local naming from the bundled MIT list loaded on request (names stand in for the colors for blind users, announced to screen readers by default); The Color API for generating palettes (and as an online source), credited; the local list is the fallback whether or not the API is up.
- **Built (no network, no Terms change):** `src/lib/colorNames.ts` (nearest name in OKLab from color-name-list's 5,000 "best of" names, how close the fit is, a plain description of the color such as "a dark, muted blue", and the sentence a screen reader says); `src/app/components/ColorNameSuggest.tsx` under both name fields in the Sight gateway ("Suggest a name", "Use this name", "Another name"; a polite live region announces it; a color in a Nenya palette also shows that palette's rough guesses as a question); the list is a separate file loaded only on request; `color-name-list` is pinned at 14.86.0 and credited in `ATTRIBUTIONS.md`; tests (`tests/color-names.test.mts` and render tests).
- **Next (palettes via The Color API):** a function (`/api/colors`) that takes a validated hex and a mode and asks thecolorapi.com `/scheme` over HTTPS (the visitor never reaches it; nothing stored or logged; a daily limit); an opt-in button that says what is sent; a local "bridge" (present to wish) that needs no network; the Terms, Privacy Promise and answers updated; attribution to The Color API and its author (Josh Beckman). The API's terms, rate limits and CORS are not stated on its docs page: write to its support address first (a draft note can be written). The function cannot use another code-based rate-limit rule (both slots are used), so its limit is kept in the function, as the coach does.
- **Still to confirm:** the exact address of the "AI color namer" the owner found; whether to show the Nenya palettes' emotional words more prominently in the suggestion.

## Progress (2026-11-09, later): palettes built in dev, behind a switch
Owner's decisions: all eight modes; a kept palette goes into the report as colors of the person's own, with a source line; the local bridge built too.
- **Built:** `src/lib/colorSchemes.ts` (the eight modes and a local version of each, a local bridge from the current color to the wish color, the client call, and the `GeneratedPalette` that is kept); `netlify/functions/colors.mts` (`POST /api/colors`: one hex and one mode in, five hex colors out, from thecolorapi.com over HTTPS; the service sees our server only; nothing about the request is stored or logged; counts only, under the coach's one-way daily code; own limits, since both code-based rate-limit rules are used; **off unless `PALETTE_ENABLED=true`**); `src/app/components/PalettePanel.tsx` in the Sight gateway (the bridge, "Make it on my device", and "Ask The Color API" with its disclosure sentence; if the service is unavailable the same kind of palette is made on the device and the page says so; every color has its hex, a plain description and a suggested name; the result is announced to screen readers; "Keep this palette in my report"); the report, PDF and coach hand-off carry a kept palette (its colors count as the person's own); the Terms (Section 16, plus the summary lines in Sections 14 and 17), Privacy Promise, welcome letter, public page and a new answer say what is sent; `ATTRIBUTIONS.md` credits The Color API.
- **Before switching it on anywhere public:** send the note to The Color API (`Downloads/Nenya-Correspondence/01-colorapi-support.md`) and read the reply. Its terms, limits and CORS are not stated on its docs page. Set `PALETTE_ENABLED=true` on the staging site to test it; leave it off in production until the reply is in.
- **Not verified:** a call to the real service (the tests use a stand-in); the panel in a browser or with a screen reader; whether the service's own colors look right beside the local ones.
