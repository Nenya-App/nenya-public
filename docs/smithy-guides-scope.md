# Scope: the "make your own" guides

Status: Shipped on branch `claude/smithy-guides` 2026-11-25, with all seven guides approved by the owner. Build plan: [smithy-guides-plan.md](smithy-guides-plan.md).

## What this is and why
A plain-language guide series that covers the technical side of the whole project, with links to the exact files in the repository, offered as its own page in About.

**The reader (owner, 2026-11-25):** a curious non-developer who wants to build their own, someone who fancies themselves an "elven smith" and wants to make something privately, on their own device.

**What success looks like:** that reader ends up with a working copy running on their own computer, has changed it into their own, knows what does and does not leave their device, and knows what the license and name rules ask if they ever share it.

## Goals
- Plain words (about grade 9 or lower), one task per guide, every command ready to copy, with what you should see after it.
- Every claim about the code names the file it comes from and links to it.
- The same text readable on nenya.biz, on GitHub and offline in the reader's own copy.
- The guides stay true as the code changes, because a test fails when they drift.

## Not goals
- Hosting a public website, Netlify, domains, accounts or payments.
- Running the AI coach. It needs an outside AI service and server functions, so it is not private on-device. The guides say so in one place and stop.
- Teaching programming in general.

## Would make this a failure
- A step that does not work on a fresh computer.
- A privacy statement that has not been checked.
- A reader being sent, unawares, to give data to Nenya or anyone else.
- Wording that sounds like a benefit claim, or like Nenya endorses what the reader builds.

## Approaches considered
| Approach | Trade-off |
|---|---|
| A. Guides in the repository, one short About page linking to them | Least work, one copy; the non-developer lands on GitHub |
| B. The series written as About pages | Friendliest to read; text lives inside code, hard to read in the reader's own copy, updates need developer work |
| **C. Plain documents in the repository, turned into About pages by a script (chosen by the owner, 2026-11-25)** | One text readable in all three places; more setup than A |

## The series
| # | Guide | The reader can then | Files it points to |
|---|---|---|---|
| 1 | What you'll make, and what you need | Decide whether to start: a computer, an internet connection once, Node.js 24 or newer, about an hour | `README.md`, `package.json`, `LICENSE` |
| 2 | Get the code and light it up | Download the code (as a ZIP, no git needed), install, and open their copy in a browser | `README.md` ("Running it locally"), `package.json` |
| 3 | A tour of the workshop | Find the file for the thing they want to change | `README.md` ("Project layout"), `src/app/App.tsx`, `src/lib/` |
| 4 | Make it yours | Change words, colors, breath paces and the logo's shape, and see the change | `src/styles/globals.css`, `src/lib/breathingPresets.ts`, `src/lib/logoLook.ts`, `src/lib/logoColours.ts`, `src/app/components/NenyaLogo.tsx` |
| 5 | Give it your own name and mark | Replace the name, logo, icons and contact address everywhere | `TRADEMARK.md`, `index.html`, `public/manifest.json`, `public/icons/` |
| 6 | Keep it private and use it offline | Build it, serve it only to their own computer, check that nothing leaves, and switch off what would | `README.md` ("Offline use"), `src/lib/deviceMemory.ts`, `src/lib/usageCounts.ts` |
| 7 | If you ever share it | Know that the code is AGPL-3.0, what that asks, and that the name and logo are not included | `LICENSE`, `TRADEMARK.md` |

The three animation levels (`simple-mode-scope.md`) are not built. Guide 4 mentions them only as planned until they are.

## Rules every guide follows
- **One computer, private by default.** Any local server command listens on the reader's own machine only. The guides use `npx vite preview` for the built copy (owner, 2026-11-25), which does so by default and is the same on every system; a command that opens to the network, such as `python3 -m http.server` without `--bind 127.0.0.1`, or any `--host`, is refused by the tests.
- **Checked, not assumed.** "Nothing leaves your computer" is written only after the built copy has been run offline and its network requests watched. The result and the date go in the guide. Known things to check: the usage counts (`usageCounts.ts`), forms that call server functions, and links that open other sites.
- **Contact addresses.** Guide 5 tells the reader to replace `info@nenya.biz`, so messages from their copy do not come to Nenya.
- **License and name.** Plain statements pointing to `LICENSE` and `TRADEMARK.md`, with "this is not legal advice".
- **Links** point to files on the `main` branch on GitHub, and the file path is also written out, so an offline reader can open it in their own copy.
- **Claims.** The facts rules apply: early prototype, not therapy, no study, no benefit claimed.

## How it works
- **Source:** one Markdown file per guide in `docs/smithy/`, each with a short front block (number, title, one-line summary, and `status: draft` or `approved`).
- **Build:** `scripts/build-smithy.mts` turns approved guides into `src/lib/smithyData.ts`, in the same way `build-learning-cards.mts` builds the cards. It accepts only a small set of formatting (headings, paragraphs, lists, tables, code blocks, links), so no new library is needed. A guide not marked `approved` does not appear on the site.
- **Page:** one new About section with an index page and one page per guide, using the existing About routes (`src/lib/aboutRoutes.ts`) and section list (`AboutMenu.tsx`). Code blocks have a copy button, work with a keyboard, and meet the AAA contrast target.
- **Tests:** the generated file matches the Markdown; every named file exists in the repository; every link is on an allowed list of sites; every guide has its status; banned claim words are absent. The existing About tests are extended for the new section.
- **Approval:** the owner reads each guide and marks it `approved`. Site text is not published without that.

## Order of work
1. Guides 1, 2 and 6 as drafts, each step run on a clean copy, with the offline network check. These prove the promise.
2. The build script, the About section and the tests.
3. Guides 3, 4, 5 and 7.

## Calls made in this design (change any)
- The section is called **"The Smithy"**, with the line "Make your own, on your own device." It alludes without naming anything.
- Download is by ZIP first; git is mentioned as an option.
- Instructions cover a Mac first, then Windows, then Linux, and say which have been tried. Only Mac can be tried here.
- A phone or tablet is out of scope for now: it would need the copy served over a network, which is not private by default.

## Left to the builder
Page layout details, the formatting subset's exact rules, and the wording of tests.
