# Forget me footers

Several places say the Forget me link is "at the bottom of every page": Terms Section 16, the privacy page, `DeviceMemoryControls.tsx`, the About answers (`src/lib/aboutNenya.ts`), `public/mind-facts.txt` and `docs/device-memory.md`. This file lists every page and how it meets that.

The owner decided on 2026-11-24 to make the statement true by adding a footer, not by changing the Terms. Two footers carry the link:

- `AppFooter` (`src/app/components/AppFooter.tsx`): the full footer, on the app's pages, the About pages and the coach conversation.
- `MinimalFooter` (`src/app/components/MinimalFooter.tsx`): the small one, added 2026-11-24. The Forget me link, the contact address, the GitHub link and the non-affiliation notice. It is on the check-a-transcript page, the my-transcript page, the partner-practice page (`/cell`), every step of the coach before the conversation, the region notice, and the app's key-picker and partner-practice preview screens.

`tests/forget-me-footers.test.mts` fails when an html page, an About page or a page component has neither footer and no entry below with a reason. To add a page: give it `AppFooter` or `MinimalFooter`, or add it to the table in that test and here, with the reason.

## Every entry page

| Page | Footer with the link | Reason if none |
|---|---|---|
| `index.html` | yes |  |
| `coach/index.html` | yes |  |
| `verify/index.html` | yes |  |
| `my-transcript/index.html` | yes |  |
| `cell/index.html` | yes |  |
| `admin/index.html` | no | the owner's private numbers page: behind a sign-in, not linked from anywhere, and it keeps nothing on the device for Forget me to erase |
| `bench/index.html` | no | the owner's logo design bench: not linked anywhere, not indexed, a tool for tuning the gem |
| `logo-export/index.html` | no | drawn by the dev server only to render logo files (not a build input, so not in the production site) |
| `public/about-nenya.html` | via `/forget-me.js` | |
| `public/why-nenya.html` | via `/forget-me.js` | |

Not under the entry pages but covered by the same test: every file in `src/app/components/about/` and `src/app/components/pages/` (all carry `AppFooter`; `AboutReferences.tsx` is a list used inside other pages, not a page), and the coach and app screens that have no footer of their own (see `MinimalFooter` use in `App.tsx`, `CoachPage.tsx`, `RegionGate.tsx`).

## The two static pages

`public/about-nenya.html` and `public/why-nenya.html` are plain html. The site allows no inline scripts (`script-src 'self' https://challenges.cloudflare.com` in `netlify.toml`), so on 2026-11-24 the owner decided to give them a small same-origin script file, `public/forget-me.js`, loaded with `<script src="/forget-me.js" defer></script>`. Each page has, in its footer, a real `<button type="button">` labelled "Forget me" with the line "Erases what Nenya saved in this browser. Nothing is sent to anyone." and an empty `role="status"` line. The paragraph is `hidden` in the html and the script shows it, so a visitor whose browser runs no script is not shown a button that does nothing.

What the script does when the button is pressed (the same as `wipeDevice({ keepOwner: true })`, which is what the app's Forget me runs):

- removes every localStorage key that starts with "nenya", in any capitals, except the owner's three testing keys (`nenya.coach.owner`, `nenya.coach.ownerToken`, `nenya.coach.overrides`), which the app's Forget me also keeps;
- removes the terms receipt (`nenya.terms.receipt`) from this tab's session storage;
- the kept palettes (`src/lib/keptPalettes.ts`) are held in the app's memory only, never on the device, so a static page has none to clear;
- makes no request, stores nothing, reads no stored value, sets no timer and no animation, and never throws if storage is blocked;
- says "Erased what Nenya saved in this browser." in the status line (announced to screen readers), or, if the browser would not let it reach storage, "Nothing to erase: this browser does not let this page reach what Nenya saved.";
- does not reload the page and does not ask "Are you sure?" (the app's link does both, because the app has an agreement to show again; a static page has neither).

The script cannot import from the app, so it repeats the key names. `tests/forget-me-static.test.mts` fails if they differ from `src/lib/deviceMemory.ts`, and runs the script against a fake page and storage. `tests/forget-me-footers.test.mts` checks that each page carries the control and loads the script, that the script holds the wipe logic, and that the content security policy allows it.

## The partner-practice page

Forget me erases only what this device saved. The cell itself keeps nothing on the device. The link reloads the page, and a reload closes an open cell for both people (the page's `pagehide` handler), and the browser first asks "Leave site?" (the page's `beforeunload` guard). While a cell is open the footer says so beside the link. If the visitor cancels the browser's question, the cell stays open and the saved settings are already erased; nothing is left broken.
