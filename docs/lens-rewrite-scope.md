# The lens rewrite: scope (draft for the owner, 2026-11-17)

**Status:** scoping only; nothing built; nothing on the site. Source: the owner's brief (an AI-drafted visioning note, 2026-11-17), checked against the code. Where the brief and the code disagree, this document says so.

## 1. The change
Replace the word and figure **"gateway"** with **"lens"** as the product's central metaphor, and rebuild the visual and sonic identity around a lens examining a beam: refraction, dispersion, focus, distortion. The metaphor is not only optical (acoustic lensing, sonar and ultrasound bend waves the same way), and it fits better than "gateway": a lens is picked up and put down, a threshold is passed through. A lens can focus, and it can distort; choosing a medium is choosing a reading. It claims no lens shows the truth, which matches how the site already speaks of palettes ("starting points, not a measurement"). The existing gem is **re-read as the medium, not replaced**; the turning gold *e* in the footer mark already seeds the idea and stays.

## 2. How big it is (measured 2026-11-17)
| Where | Size |
|---|---|
| Source (`src/`) | 75 files, 477 lines mention "gateway" |
| Tests | 24 files, 90 lines (several pin visitor copy) |
| Docs | 55 files, 188 lines |
| Public pages (`llms.txt`, `about-nenya.html`, `why-nenya.html`, ...) | 5 files, 21 lines |
| The Terms | 3 mentions |
| File and component names | 19 (`GatewaysPage`, `SightGatewayPage`, `gatewayCopy.ts`, `SixGateways.tsx`, ...) |
Usage-count names are keyed by screen ids, not by the word, so stats continuity is not at risk if internal ids stay.

## 3. The structure (decided by the owner, 2026-11-17) and what is still open
**Decided:**
- **Breathing is the default entry point and is not a lens.** It stays "the breathing tool"; it is what a person meets first and can stay with.
- **There are six sensory lenses:** sight, sound, touch, essence, movement, insight. These are the lenses the rewrite renames from "gateways".
- **The coach is presented as a seventh lens, held apart from the six** as a standalone piece: a conversational lens of its own, not something picked up from the tray with the others.
- **The tray is where the six regular lenses are picked up and put down.** The coach is not in it.
- This matches the site's three sections today (`/breath`, `/senses`, `/coach`; `src/lib/sections.ts`): breath is the entry, `/senses` becomes the tray, `/coach` stays its own place. The three-door opening (breathe white, reflect blue, coach red) can stay as the first level: "reflect" opens the tray of six.

**Also decided (owner, 2026-11-17):**
- **The lenses keep the structure of the gateways** (the same six pages and what each one asks), but **a person chooses as they go**. Today a person selects the whole pathway in advance; with the tray they pick up a lens, look, add something or not, put it down, and pick up another, in any order, and can come back.
- **A lens put down without anything added** is recorded as **examined but not included**: said so in the person's own summary (local, nothing sent), and counted in the admin console as a plain total. *(Both are the owner's wording: "mentioned as having been examined but not included, or maybe just recorded in our own admin console". This scope proposes both; the admin count needs the Terms and data register, see below.)*

## 3a. How the tray behaves (draft)
Each of the six lenses is in one of three states: **not opened**, **examined** (opened, nothing added), **included** (something added). The state comes from what the person did; there is no queue, no required order and no "complete all". A lens with something added stays included when put down, for the visit. The person can reopen any lens and add or change entries. The review and the report are available at any time and are built from the **included** lenses; examined lenses appear as one line each ("Examined, not included: touch"), and not-opened lenses are not mentioned. Progress, if shown, says what has been examined and included, not "step 3 of 6". The coach is not in the tray and has no state there.

## 3b. What it changes in the code (read from `App.tsx`)
`selectedGateways` (the pathway chosen in advance), the auto-advance to "the next gateway" after each one, the `currentIndex` / `totalGateways` props, and "complete all" logic in `handleGatewayComplete` are replaced by a per-lens state derived from `gatewayData` plus the set of lenses opened. `GatewaysPage` (choose the pathway) becomes the tray; `GatewayProgress` / `GatewayStages` show state instead of position. The saved-draft payload (`SavedPayload`, version 1, holds `selectedGateways`) needs a version 2 that stores opened lenses and keeps reading version 1. The session ID (two colours from the sight and sound choices) forms when those lenses are used, as today. Tests that pin the order or "complete all" change with it. This is the heaviest code change in the rewrite and is separate from the vocabulary change.

## 3c. Data and the Terms
- The summary line "examined, not included" is made on the device and sent nowhere: no Terms change.
- **The admin count** (for example `lens.examined.<name>` and `lens.included.<name>`) is a new kind of plain count: numbers only, nothing identifying, only after the Terms are agreed and not under Global Privacy Control. The Terms list what is counted (Section 13) and the data register lists the counts, so both are updated in the same revision. Keep it to totals per lens, with no sequence or timing, so it cannot describe one person's path.

**Still open:**
1. **When the Terms change.** The Terms use the word "gateway" three times, and the count sentence needs adding; a new date makes everyone agree again. Batch it with other Terms changes.
2. **Naming rule:** sense lenses keep their sense names; any later lens is named for what it does. Confirm.
3. **Vocabulary first, code later:** brand words change now; identifiers (`GatewayReviewPage`, ...) on their own schedule or never. Confirm.
4. **Does the opening's "reflect" door go straight to the tray, or open the first lens?** Wireframe both.
5. **Does anything in the six lenses depend on another** (for example a choice made in sight that another page reads)? If so, the tray must say so or the dependency must go; this needs a pass through the six pages before wireframes are final.

## 4. Corrections to the brief (it feeds other documents, so these matter)
- **CSP:** the brief says `connect-src 'self'` and nothing else; the real policy also allows Cloudflare's Turnstile script and frame on the coach page (`netlify.toml`). Check before stating "self only".
- **Footprint:** the brief's "809 KB to 284 KB" is not in the repo. What is documented: the gem sprite (809 KB) was replaced by a live gem (about 4 KB) (`docs/live-gem.md`). **Measure the current first visit** (`npm run footprint`) before fixing a budget as an acceptance criterion.
- **Counts, resolved:** six lenses in the tray, plus the coach as a seventh held apart. The brief's "seven lens marks plus the tray container" is then six lens marks, the coach's mark, and the tray; breathing has no lens mark (it keeps the logo and the gem).
- **"Do not name a lens after its sense alone"** contradicts "Sight and Sound ... should keep doing it"; read it as: keep the sense names, name new lenses for their function.

## 5. Terminology (draft; owner to approve)
Gateway(s) → lens/lenses; "six gateways" → six lenses; "complete the gateways" → "pick up a lens"; the choice of the six → the lens tray (the opening's three doors can stay as the first level); the breathing tool **stays** "the breathing tool" (the brief's "breath lens" is dropped: breathing is the entry, not a lens); the coach stays "the coach", described as a seventh lens held apart. One-page vocabulary sheet for copy comes first. The word "gateway" appears nowhere in new copy.

## 6. Constraints that stay hard
Self-hosted only (no third-party fonts or assets); hashed assets only in `/assets` (`tests/assets.test.mts`); WCAG 2.2 AAA (contrast pairs added to the test first); four vision modes, reduced motion, text sizes, light and dark, nothing that strobes; **Emergency Exit first in tab order on every screen**; every new visual has an accessible name and alt text; **the iconography must not assume sight** (the acoustic half of the metaphor reaches the icons, not only the copy); no camera aperture, magnifying glass or focus square; no fourth typeface (Cinzel, Manrope, Cormorant Garamond stay); vector or drawn imagery only.

## 7. Phases (each reversible; a switch, `VITE_LENS_COPY`, flips the vocabulary)
- **P0 Decisions** (section 3).
- **P1 Vocabulary and copy audit.** A read-only list of every visitor-facing string (page, section, test that pins it). One module (`src/lib/vocabulary.ts`) holds the words so one switch flips them; tests read from it instead of pinning the word.
- **P2 Wireframes** (plain HTML in `docs/wireframes/lens/`, tested by keyboard and screen reader): the entry (breathing, with the way into reflection and into the coach); the tray of six, resting, focused, and with one lens held (and with several, if open question 1 says so); one lens page (Touch as the model); put down, and what is kept; the review page; the coach as a standalone seventh lens, visibly apart; each annotated with focus order and the spoken reading.
- **P3 Copy behind the switch.** Pages, About, public files, pre-written answers (a coach answer must say the same word as the page), alt text.
- **P4 Visual identity:** tray states, the lens marks, refraction and dispersion motion with a static fallback, the colour ramp only where it does work. Marks through the existing logo-export pipeline.
- **P5 Sound:** the six tonal systems are already "six media for one state"; optional short timbre per lens, off by default; breathing tones unchanged.
- **P6 Terms and the date** (batched), then the switch on in staging and then production.
- **P7 (optional, later) identifier renames.**

## 8. Acceptance
First visit no heavier than today's measured weight; the tray fully operable by keyboard and screen reader, skippable in one action; every lens distinguishable without colour; nothing strobes and reduced motion still reads as refraction; "gateway" nowhere in new copy; a sighted and a blind reviewer can each say what a lens does after a minute with the tray; the pre-written answers, About pages, public files and Terms agree with each other.

## 9. Risks
Camera cliché (always show the beam and the medium, not only glass); the word is unownable (Google Lens and others), so the identity carries the beam; optical-centrism; dispersion as decoration (rainbow gradients are invisible by default); breaking the gem (re-read, never replaced); a copy change that makes the Terms, the answers and the pages disagree (one vocabulary module and a test that scans for the old word guard this).
