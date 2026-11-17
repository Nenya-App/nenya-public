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

**Still open:**
1. **Hold more than one?** "Pick up and put down" suggests a person can have more than one lens in hand. Today the gateways run in sequence with progress. Is the tray (a) one lens at a time, picked up and put down, or (b) any number held at once, with a way to see what is held?
2. **What "put down" does to what a person entered.** Entries live only in the tab. Options: put down keeps the entry while the visit lasts (nothing is lost by switching lenses); put down clears it; or the person chooses. This is a data-handling decision and changes the notice text.
3. **The review and the report.** A report is built from the gateways done. With a tray, is the report built from whichever lenses were used, whenever the person asks?
4. **When the Terms change.** The Terms use the word three times; a new date makes everyone agree again. Batch it with other Terms changes.
5. **Naming rule:** sense lenses keep their sense names; any later lens is named for what it does. Confirm.
6. **Vocabulary first, code later:** brand words change now, identifiers (`GatewayReviewPage`, ...) on their own schedule or never. Confirm.

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
