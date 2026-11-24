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
| `public/about-nenya.html` | no | a static page with no script at all (the site allows no inline scripts), so the Forget me action cannot run there; it also reads and keeps nothing on the device |
| `public/why-nenya.html` | no | a static page with no script at all (the site allows no inline scripts), so the Forget me action cannot run there; it also reads and keeps nothing on the device |

Not under the entry pages but covered by the same test: every file in `src/app/components/about/` and `src/app/components/pages/` (all carry `AppFooter`; `AboutReferences.tsx` is a list used inside other pages, not a page), and the coach and app screens that have no footer of their own (see `MinimalFooter` use in `App.tsx`, `CoachPage.tsx`, `RegionGate.tsx`).

## The two static pages

`public/about-nenya.html` and `public/why-nenya.html` are plain html with no script, because the site allows no inline scripts. Forget me is an action that erases storage and reloads, so a plain link there would do nothing. They also read and keep nothing on the device. So they are the one place the link is not, and the safety features card therefore still says "most pages". To make "every page" true, either give them a small same-origin script that runs the same erase (it would repeat `wipeDevice` and need its own test), or let the owner approve wording that says "every page of the app". Then change the card (`src/lib/safetyFeaturesCard.ts`, `CHANGES_FROM_APPROVED`) with the test.

## The partner-practice page

Forget me erases only what this device saved. The cell itself keeps nothing on the device. The link reloads the page, and a reload closes an open cell for both people (the page's `pagehide` handler), and the browser first asks "Leave site?" (the page's `beforeunload` guard). While a cell is open the footer says so beside the link. If the visitor cancels the browser's question, the cell stays open and the saved settings are already erased; nothing is left broken.
