# The Smithy Guides Implementation Plan

Status: Shipped. Carried out 2026-11-25.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seven plain-language guides to building a private copy of Nenya on your own computer, written as Markdown in the repository and shown on the site as the About section "The Smithy".

**Architecture:** Markdown files in `docs/smithy/` are the only source. A pure parser and rule checker (`src/lib/smithyGuide.ts`) reads them; `scripts/build-smithy.mts` writes the approved ones into `src/lib/smithyData.ts`; one About page renders that data. Tests fail on drift, broken file references and rule breaks.

**Tech Stack:** TypeScript on Node 24 (`.mts` run directly), React 18, Vite 6. No new dependencies. The offline check uses `puppeteer-core` installed with `--no-save`, as `scripts/render-logo-assets.mts` does.

**Spec:** [smithy-guides-scope.md](smithy-guides-scope.md). Read it with this plan.

## Global Constraints

- Plain words, about grade 9 or lower; one task per guide; every command ready to copy, with what you should see after it.
- Every claim about the code names the file and links to it: links start `https://github.com/Nenya-App/nenya-public/blob/main/`, and the path is also written as text.
- Local servers bind to the reader's own machine only: any `python3 -m http.server` line carries `--bind 127.0.0.1`; no command uses `--host`.
- "Nothing leaves your computer" is written only after the offline check has run on a clean copy; the guide gives the date.
- Guide 5 tells the reader to replace `info@nenya.biz`.
- License statements point to `LICENSE` and `TRADEMARK.md` and say "this is not legal advice".
- Claims: early prototype, not therapy, no study, no benefit claimed. The AI coach is named as left out, in one place.
- A guide appears on the site only with `status: approved`, set by the owner. No agent sets it without the owner's word in chat.
- Download is by ZIP first; git is mentioned as an option.
- Section title "The Smithy", line "Make your own, on your own device."
- Mac steps first, then Windows and Linux; each guide says which were tried. Only Mac can be tried here. No phone or tablet steps.
- Animation levels are mentioned only as planned until built.
- Pages meet WCAG 2.2 AAA. `npm run check` passes before every commit. Commits go to `dev`; the owner pushes.
- New docs get a row in `docs/README.md`; new scripts a row in `scripts/README.md`.

## Review Focus

- A reader on Windows copies a Mac command: each command that differs is shown for both, labelled (Task 2 test).
- A reader with Node older than 24: guide 2 has them check the version before installing, and says what to do (Task 2 test).
- The ZIP unpacks into a folder whose path has spaces: the commands still work (Task 2, clean-copy run in `My Forge/`).
- A guide contains `<`, `|` or backticks inside a code block: shown literally, never run as markup (Task 1 test).
- A link with `javascript:`, `http:` or an unlisted host: the build refuses the guide (Task 1 test).

---

## File Structure

| File | Does |
|---|---|
| `docs/smithy/NN-<slug>.md` (7) | The guide text and its front block |
| `src/lib/smithyGuide.ts` | Types, parser, rule checks, reading grade, data-file text |
| `src/lib/smithyData.ts` | Generated: the approved guides |
| `scripts/build-smithy.mts` | Writes `smithyData.ts` |
| `src/lib/smithyOffline.ts` | Which requests left the machine (pure) |
| `scripts/smithy-offline-check.mts` | Serves `dist/` locally, drives Chrome, reports outward requests |
| `src/lib/aboutRoutes.ts` (modify) | The `smithy` page and its guide addresses |
| `src/app/components/about/Smithy.tsx` | The page: list and one guide |
| `src/app/components/SmithyBlocks.tsx` | Draws a guide's blocks (outside `about/`, which requires a scrolling root) |

---

### Task 1: Guide format, parser and rules

**Files:** Create `src/lib/smithyGuide.ts`, `tests/smithy-guides.test.mts`.

**Interfaces — Produces:**
```ts
export type Inline = { t: 'text' | 'code' | 'bold'; s: string } | { t: 'link'; s: string; href: string };
export type Block =
  | { k: 'h'; level: 2 | 3; text: Inline[] }
  | { k: 'p'; text: Inline[] }
  | { k: 'list'; ordered: boolean; items: Inline[][] }
  | { k: 'code'; lang: string; code: string }
  | { k: 'table'; head: Inline[][]; rows: Inline[][][] };
export interface Guide { number: number; slug: string; title: string; summary: string; status: 'draft' | 'approved'; files: string[]; blocks: Block[] }
export const REPO_BLOB = 'https://github.com/Nenya-App/nenya-public/blob/main/';
export function parseGuide(md: string): Guide; // throws Error naming the line
export function readingGrade(g: Guide): number; // Flesch-Kincaid over headings, paragraphs, list items and table cells; code excluded
export function guideProblems(g: Guide, fileExists: (repoPath: string) => boolean): string[];
export function smithyDataSource(guides: Guide[]): string;
```
Front block keys: `number`, `slug`, `title`, `summary`, `status`, `files` (comma-separated repository paths).

- [ ] **Step 1: Write the failing tests** in `tests/smithy-guides.test.mts`, using `ok` from `./helpers.mts` and a small inline sample guide:
  - `parses the front block and each block kind`: number 2, slug `get-the-code`, block kinds `['h','p','list','code','table']`.
  - `code is literal`: a code block holding `<script>|` and backticks comes out as that exact string, in a `code` block.
  - `refuses unsafe links`: for hrefs `javascript:alert(1)`, `http://github.com/Nenya-App/nenya-public`, `https://example.com`, and `https://github.com/someone/else`, `guideProblems` is not empty. Allowed: `https://github.com/Nenya-App/nenya-public…`, `https://nodejs.org…`, `https://www.gnu.org…`.
  - `every named file exists and every blob link has its path as text`.
  - `server binding`: a code line `python3 -m http.server 8000` is a problem; the same with `--bind 127.0.0.1` is not; any `--host` is a problem.
  - `claim words`: `heal`, `healing`, `calm`, `calming`, `stress relief`, `proven`, `anonymous`, `trauma-informed` are problems; `therapy` is a problem unless written `not therapy`.
  - `reading grade`: `readingGrade` above 9.5 is a problem; the plain sample is at or below it.
- [ ] **Step 2:** `node tests/smithy-guides.test.mts` fails: module not found.
- [ ] **Step 3:** Implement `src/lib/smithyGuide.ts` (line-by-line parser; only the formats above; anything else, including raw HTML outside code, throws).
- [ ] **Step 4:** The test passes; `npm run check` passes.
- [ ] **Step 5:** Commit "The Smithy: guide format, parser and rules".

### Task 2: Guides 1, 2 and 6, proven on a clean copy

**Files:** Create `docs/smithy/01-what-you-need.md`, `02-get-the-code.md`, `06-private-and-offline.md`, `src/lib/smithyOffline.ts`, `scripts/smithy-offline-check.mts`; modify `scripts/README.md`, `tests/smithy-guides.test.mts`, `docs/README.md`.

**Interfaces — Consumes:** `parseGuide`, `guideProblems`. **Produces:** `export function outwardRequests(urls: string[], origin: string): string[]` (every URL whose origin differs from `origin`, ignoring `data:` and `blob:`).

- [ ] **Step 1: Failing tests:**
  - `outward requests`: from `['http://127.0.0.1:8000/a', 'data:x', 'blob:y', 'https://example.com/z', 'http://localhost:9/q']` with origin `http://127.0.0.1:8000`, the result is the last two.
  - `every guide in docs/smithy has no problems` and file names match `NN-<slug>.md`.
  - `guide 2 checks Node first`: its first code block containing `node` is `node --version`, before any containing `npm install`; the text names version 24.
  - `commands that differ are shown for both systems`: any guide with a `python3` command also has a `py` command, under headings containing "Mac" and "Windows".
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Implement `smithyOffline.ts` and `smithy-offline-check.mts`: serves `dist/` on `127.0.0.1` with Node's `http` (unknown paths give `index.html`), drives Chrome through: agree to the Terms, skip the tour, open the breathing panel, open the Lenses, download the report, open `/about` and `/about/privacy-promise`. Prints `outward requests: N` and lists them, then same-origin `/api/` calls separately. Exit 1 if N is over 0.
- [ ] **Step 4:** Write the three guides as `status: draft`.
- [ ] **Step 5: Clean-copy run.** `git archive --format=zip --prefix=nenya-public-main/ HEAD`, unzip into a scratch folder named `My Forge`, follow guides 2 and 6 exactly as written (`npm install`, `npm run build`, serve with `--bind 127.0.0.1`), then run the offline check. Record the date, commands, what appeared and the request counts in the task report. If outward requests are above 0, stop and tell the owner before writing any privacy sentence. Put the dated result in guide 6.
- [ ] **Step 6:** `npm run check` passes. Commit "The Smithy: drafts of guides 1, 2 and 6, with the offline check".

### Task 3: Owner reads guides 1, 2 and 6 (checkpoint)

- [ ] Send the three files to the owner with the clean-copy report. Wait.
- [ ] Apply their changes. Set `status: approved` only on guides they approve in chat. Commit "The Smithy: owner-approved text for guides …".

### Task 4: Data build

**Files:** Create `scripts/build-smithy.mts`, `src/lib/smithyData.ts` (generated); modify `package.json` (`"smithy": "node scripts/build-smithy.mts"`), `scripts/README.md`, `tests/smithy-guides.test.mts`.

**Interfaces — Consumes:** `smithyDataSource`. **Produces:** `export const SMITHY_GUIDES: Guide[]`, sorted by `number`.

- [ ] **Step 1: Failing tests:** `data is current`: `smithyDataSource(approved guides from docs/smithy)` equals the text of `src/lib/smithyData.ts`; `only approved guides ship`: every entry has `status === 'approved'`; `no draft slug appears in the data file`.
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Implement the script: exit 1, naming the file and problems, if an approved guide has any; print counts of approved and left out.
- [ ] **Step 4:** `npm run smithy`; tests and `npm run check` pass.
- [ ] **Step 5:** Commit "The Smithy: build approved guides into the site data".

### Task 5: The About page and its addresses

Needs at least guides 1, 2 and 6 approved.

**Files:** Modify `src/lib/aboutRoutes.ts`, `src/app/components/AboutNenya.tsx`, `src/app/components/about/AboutMenu.tsx`, `public/sitemap.xml`, `tests/about-routes.test.mts`; create `src/app/components/about/Smithy.tsx`, `src/app/components/SmithyBlocks.tsx`, `tests/smithy-page.test.mts`.

**Interfaces — Consumes:** `SMITHY_GUIDES`, `Guide`, `Block`. **Produces:**
```ts
export function smithyPath(slug?: string | null): string;          // '/about/smithy' or '/about/smithy/<slug>'
export function smithySlugFromPath(pathname: string): string | null; // '<slug>', '' for the list, null elsewhere
export default function Smithy(props: { onBack: () => void }): JSX.Element;
export function SmithyBlocks(props: { blocks: Block[] }): JSX.Element;
```

- [ ] **Step 1: Failing tests:**
  - routes: `smithyPath() === '/about/smithy'`; `smithyPath('get-the-code') === '/about/smithy/get-the-code'`; `smithyPath('../x') === '/about/smithy'`; `aboutSectionFromLocation('/about/smithy/get-the-code') === 'smithy'`; `aboutSectionFromLocation('/about/terms/x') === null`; `ABOUT_TITLES.smithy === 'The Smithy'`; the sitemap lists `/about/smithy` and every approved slug.
  - page (source checks): the menu has section key `smithy`, title `The Smithy`, blurb `Make your own, on your own device.`, holding only id `smithy`; `AboutNenya` leaves a `/about/smithy/<slug>` address in place; `Smithy.tsx` root has `className="size-full overflow-y-auto scroll-container`; `SmithyBlocks.tsx` never uses `dangerouslySetInnerHTML`; each code block has a button whose name begins `Copy` and an `aria-live` message; tap targets use `min-h-11`; outside links carry `rel="noopener noreferrer"`.
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Implement. `Smithy.tsx` reads the slug from the address, handles back and forward, sets the title `<guide title> — Nenya`, shows previous and next links, and shows the list for an unknown slug. Menu item icon: `Hammer` from `lucide-react`, description `Make your own, on your own device`.
- [ ] **Step 4:** `npm run check`; if `mind-facts` is reported stale, run `npm run mind-facts` and include it. Check `/about/smithy` and one guide on the dev server: keyboard only, phone width, both themes.
- [ ] **Step 5:** Commit "The Smithy: About section and guide pages".

### Task 6: Guides 3, 4, 5 and 7

**Files:** Create `docs/smithy/03-workshop-tour.md`, `04-make-it-yours.md`, `05-your-own-name.md`, `07-if-you-share.md`; modify `src/lib/smithyData.ts` (generated), `public/sitemap.xml`.

- [ ] **Step 1: Failing tests:** `guide 4 names its files` (`src/styles/globals.css`, `src/lib/breathingPresets.ts`, `src/lib/logoLook.ts`, `src/lib/logoColours.ts`, `src/app/components/NenyaLogo.tsx`) and says the animation levels are planned; `guide 5` names `info@nenya.biz`, `TRADEMARK.md`, `index.html`, `public/manifest.json`, `public/icons`; `guide 7` contains `not legal advice`, `AGPL-3.0` and `TRADEMARK.md`.
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Write the four drafts. For guides 4 and 5, make each change on a clean copy first, run `npm run build`, and write down what changed on screen. For guide 5, search the clean copy for `Nenya`, `nenya.biz` and the icon file names, and list every place a reader must change.
- [ ] **Step 4:** `npm run check` passes. Commit the drafts. Send them to the owner. Wait.
- [ ] **Step 5:** Apply changes, set `approved` as the owner says, `npm run smithy`, add the sitemap entries, `npm run check`, commit "The Smithy: guides 3, 4, 5 and 7".
