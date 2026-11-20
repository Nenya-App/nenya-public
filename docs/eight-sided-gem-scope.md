# Eight-sided gem: scope and recommendation

Written 2026-11-20. Scoping only: no source code was changed. Base: `dev` at `a79443e`. The leaf work was read from git
(`claude/mallorn-petals-57db2e`, commit `0fe08d3`), not merged.

## Recommendation

**Yes: make the gem a regular octagon with a brilliant cut (option A), with its corners on the leaves' axes, and keep the
side count as one setting so the hexagon stays available.** Do it in small steps, behind the bench first, and switch the site
default only after the owner has looked at it.

Why:

- Eight leaves around a six-sided stone is the one place the logo's symmetry breaks. Eight and eight reads as one design, and
  the sixteen orbs (two per side) divide evenly.
- The live engine is already built from "N sides" ideas (planes per side, a polygon outline, a wrap angle). Making N a
  parameter is a contained change in four files, not a rewrite. The step cut (option B) is a new cut that has to be designed
  and tuned by eye, and its long mirror-like flashes read poorly at the logo's small sizes.
- The kaleidoscope, glow, bezel and fallback all carry over once they take N.
- Keeping the hexagon costs almost nothing once N exists, so the change is reversible by one constant.

Main costs: a rebuilt fallback sprite (needs a browser), regenerated static logo files (needs a browser; but the leaf change
already forces that, so do both in one run), roughly a third more shader work per pixel, and new alt text.

## 1. How the gem is drawn today

| Piece | Where | What it assumes |
|---|---|---|
| Live stone | `src/lib/gemCut.ts` | A convex polyhedron of **49 planes**: table, 6 girdle sides, 6 crown mains, 6 stars, 6 pavilion mains, 12 upper and 12 lower girdle facets. `APOTHEM = √3/2` (hexagon with circumradius 1); `hexRadius()` folds angle by 60°; loops `k < 6`; sides at 0, 60, ...; corners at 30, 90, ...; girdle facets at `15 + 30k`, `corner = 30 + 60·round(...)`. `FRAME_HALF = 1/(2·476/1024)` ties the stone to `GEM_HEX_RADIUS`. |
| Live shader | `src/lib/gemRenderer.ts` | `#define NP ${PLANE_COUNT}`; outline loop `k < 6`, angle `k·TAU/6`, apothem constant `0.8660254`. Everything else (refraction at index 2.42, total internal reflection, dispersion, perspective) works for any convex stone. The sky lights (`uLights`, default **6**, max 8) are spaced `TAU/n`, so six lights on a six-fold stone is a quiet coincidence (see risks). |
| Orb light from below | `below()` in the shader | 16 orbs, by angle `i/16`. Independent of the stone's side count. Orbs turn with the orbit, so no static alignment exists to preserve. |
| Kaleidoscope | `src/lib/kaleidoscope.ts` | The turn wraps at **60°** (`twist: 60`, `% 60`, `tn * 60`). Test "the turn wraps without a jump" uses 60. |
| Sprite sheet | `src/assets/diamond-hex-sprite.webp` (809 KB; 2016 × 2016, 7 × 7 cells of 288; 48 frames) via `src/lib/gemSprite.ts` | A pre-rendered hexagonal stone. `GEM_HEX_FRACTION = 2/2.48` (hexagon width across flats, as a fraction of the frame), `GEM_HEX_RADIUS = 476/1024` (corner radius), `SPRITE_CELL`, `SPRITE_COLS`. Corners at top and bottom. |
| Silhouette for the glow | `drawGemSilhouette()` in `gemSprite.ts`; `LogoGlow.tsx` | Draws a six-point polygon from `π/2 + kπ/3`. With the sprite engine, `LogoGlow` uses the sprite's own first frame instead. |
| Size | `GEM_TO_PETALS = 0.313`; `SpectralGem.tsx` `gemSide = petalsSide * GEM_TO_PETALS`; `BEZEL_CANVAS = 1.12` | The frame's side. The polygon's circumradius is `0.4648 × frame`. Gem frame is about 239 units in the 765-unit petals box. |
| Bezel | `src/assets/logo/bezel.svg` (identical on the leaf branch) | Two hexagon paths hard-coded: gold at vertex radius 111.39, cream at 119.05 (viewBox ±134.09, i.e. 1.12 × frame). Gradients and the lighting filter are polygon-independent. |
| Static pictures | `nenya-logo.webp`, `nenya-logo-small.webp`, `public/icons/*`, `public/og-image.jpg`, `public/pdf-assets/nenya-logo.png`, print logos | Renders of the drawn logo with a hexagonal stone baked in. Made by `npm run logo:render` (`scripts/render-logo-assets.mts`), which needs Chrome, `sips`, `cwebp`. |
| Preloads | `src/lib/preload.ts` | Where WebGL2 works with `GEM_ENGINE = 'live'`, the sprite is not downloaded. The sprite is the fallback only. No six-sided assumption. |
| Hit areas | `SpectralGem`, `LogoGlow`: `pointerEvents: 'none'` | None today. The leaf work plans leaf ids (`leaf-1..N`) as future radial-menu controls; the gem has no hit area to change. |
| Tests | `tests/live-gem.test.mts`: girdle reaches the hexagon outline at 0, 60, ... 300 degrees; nothing sticks out past the hexagon (uses `hexRadius`, `APOTHEM`); kaleidoscope wrap at 60; shader/plane-count checks. `tests/kaleidoscope-choice.test.mts` reads `SpectralGem.tsx`. `tests/alt-text.test.mts` pins the alt text. `tests/assets.test.mts` names the sprite file. |
| Words | `src/lib/altText.ts` (`LOGO_ALT_SHORT`, `LOGO_ALT_NO_ORBS`, the long text: "hexagonal gem", "six-petaled flowers"), `index.html` `og:image:alt`, `docs/brand/alt-text.md`, `docs/brand/README.md` ("double hexagon"), `docs/live-gem.md` (49 facets, "every 60°"), `docs/ai-handoff/04-design.md` ("six petals"), `docs/accessibility-audio-scope.md`. The leaf branch does not appear to update the alt text: it still says six petals, so that fix is due with or before this one. |

## 2. The options

Common to the octagon options: the stone must stay in the same frame, so `GEM_HEX_RADIUS`/`GEM_HEX_FRACTION` become a
function of N. For the **same visual area** as today's hexagon, the octagon's corner radius is about **0.445 × frame**
(apothem about 0.411), a touch smaller than the hexagon's 0.465; keeping the same corner radius would make the stone
about 9% larger in area and crowd the bezel. Choose by eye on the bench.

### A. Regular octagon, brilliant cut (recommended)

- **Live engine:** generalise `gemCut.ts` to N (apothem `cos(π/N)`, loops to N, girdle facets at quarter steps, `2N`
  upper and `2N` lower, planes `1 + 8N` = **65** for N = 8); `hexRadius` folds by `360/N`; the shader's outline loop and
  apothem constant come from N; kaleidoscope wraps at `360/N`. Roughly 15 to 30 changed lines in each of three files, plus
  tests. Default lights set to 5 (see risks).
- **Cost per frame:** the tracer loops over every plane for each bounce, so work rises by about **33%** (65 vs 49 planes).
  The site draws 15 times a second and pauses when hidden; the low preset and bounce count already exist to offset this.
  Needs a timing check on an older phone (browser/device, owner).
- **Sprite:** must be rebuilt, or the fallback shows a hexagon in an octagonal bezel. See "Fallback" below.
- **Bezel:** two octagon paths in `bezel.svg`: gold at vertex radius 111.39 and cream at 119.05 would be too wide at the
  flats if kept; scale so the **flats** clear the stone with the same margin as today (about 6 to 8 units at the girdle).
  A small script or hand-written path; the SVG filters and gradients stay. Must be looked at in a browser.
- **Eight leaves:** with a corner at the top (as today), corners point down each leaf's axis (leaf angles are `i·45°` from
  the top, root 30, so the stone sits over the roots); flats face the gaps between leaves. The other orientation (a flat at
  the top) puts a flat toward each leaf tip and corners in the gaps. I recommend corners on the leaf axes (the stone
  "points" into each leaf, and the top and bottom corners match the stone's present look); orientation should be one
  constant so the owner can flip it after seeing it.
- **Orbs:** 16 orbs = two per side, evenly. The inner ring turns, so there is no fixed alignment to keep; light from below
  maps by angle, not by side, and needs no change.
- **Glow:** `drawGemSilhouette` takes N and the same start angle. No other change.

### B. Octagon step (Asscher or emerald style) cut

- A step cut is also a convex polyhedron, so the same tracer can draw it, but the plane list is different: table, two or
  three rings of long parallel-ish "steps" on the crown (about 8 each), and steps on the pavilion. Plane count similar to
  today (about 49 to 57), so cost about equal to today.
- It needs a **new cut definition and bench panel** (step heights, tilt of each ring, culet), and tuning by eye. The
  kaleidoscope's star twist has no equivalent (the "stars" belong to brilliant cuts); it would need rethinking or would be
  off for this cut.
- Look: long clear bands and sharp, quiet flashes ("hall of mirrors"). Handsome large, but at the 40 to 240 px sizes the
  logo is shown at, it tends to read as flat grey and white bands, with less of the colour from the orbs breaking up into
  facets. Dispersion and orb colour show mostly as broad washes.
- Sprite, bezel, glow, test and word changes are the same as option A.
- Verdict: a good later variant. Doing the N-generalisation first makes it a cut style on the bench, not a rewrite.

### C. Keep the hexagon

- Zero engine, sprite or raster cost. The static pictures still need regenerating for the leaves, so there is no saving
  there.
- Cost is visual: eight leaves around six sides. The owner has said the gem "might" change, not that it must. Keeping the
  option open (N as a setting) lets this decision be made by eye and reversed.

### Fallback (where WebGL2 is missing)

The sprite is only a fallback now (`GEM_ENGINE = 'live'`). Choices:

1. **Regenerate the sheet from the live engine** (recommended). `render-logo-video.mts` already renders the live gem
   frame by frame in headless Chrome; add a mode (or a small sibling script) that renders 48 frames of the sparkle loop at
   288 px, packs them 7 × 7 into 2016 × 2016 and encodes WebP. Same constants (`SPRITE_CELL`, `SPRITE_COLS`). Needs
   Chrome, `cwebp` (browser; owner). Expect about 0.8 MB again; the octagon has more area, so possibly a little more. The
   original sprite's generator is not in the repository, so this also removes a dependency on lost tooling.
2. **Smaller sheet**: fewer frames or 192 px cells for a roughly 400 KB fallback. A call for the owner (smoothness of
   the sparkle versus bytes); only matters for visitors without WebGL2.
3. **No sprite**: fall back to a still picture or CSS octagon. Saves 809 KB in the repo, but loses the animated sparkle in
   the fallback, and that is a footprint choice for the owner.

Until the new sheet exists, the site must not switch to N = 8 as the default (a hexagonal fallback inside an octagonal
bezel is wrong). Low-capability devices that do have WebGL2 use the live gem's low preset, unaffected.

## 3. Risks

- **Unison sparkle:** six sky lights on a six-fold stone already lines up; eight on an eight-fold stone would flash all
  facets at once. Keep lights at 5 or 7 (coprime to 8) and judge on the bench.
- **Performance:** about 33% more shader work per pixel. Check on an older phone before relying on it; the low preset and
  `bounces` are the levers.
- **Visual balance:** an octagon is rounder, so at the same area it looks less "gem-like" and more like a coin. May need a
  taller crown or a more pronounced culet. Eye test.
- **Bezel look:** the lighting filter was tuned on six edges. Eight shorter edges catch the light differently. Eye test.
- **Fallback consistency:** see above. The sprite must be regenerated in the same release.
- **Words:** alt text says "hexagonal gem" and "six-petaled flowers" (and `og:image:alt`, brand docs). It must say eight
  leaves (the leaf branch may already be due to fix "petals") and an eight-sided gem. Use "lens"/"Pattern" only where they
  fit; the alt text is a plain description and needs neither.
- **Static pictures:** icons, og image, PDF logo, print files all show the old stone; mixed old and new files would be
  inconsistent. One regeneration run after both the leaves and the gem are in.
- **Merge order:** the leaf branch and this work touch different files (leaves: `leafWeave`, `MallornLeaves`, `NenyaLogo`;
  gem: `gemCut`, `gemRenderer`, `gemSprite`, `kaleidoscope`, `bezel.svg`, `SpectralGem` possibly). `NenyaLogo.tsx` and
  `altText.ts` are the likely overlaps; merge the leaves first.
- **Untouched by design:** `src/lib/breathClock.ts` and the ring-lock math need no change; nothing in the gem depends on
  them beyond reading the clock.

## 4. Build steps (each a separate commit)

1. **Side count as a parameter, hexagon unchanged.** `gemCut.ts` (N, apothem, plane count, folds), shader outline from N,
   `hexRadius` to a polygon radius, `drawGemSilhouette(N)`, kaleidoscope wrap `360/N`. N = 6 must give byte-identical
   planes to today (add a test). Existing tests keep passing. No visible change.
2. **Tests for N = 8:** girdle reaches the outline at 0, 45, ...; nothing sticks out; stone is closed; kaleidoscope wrap at
   45°; plane count 65. Tests only, plus any helper.
3. **Octagon geometry constants:** stone radius and frame fraction as a function of N; orientation (corner up) as one
   constant. Equal-area default.
4. **Bench control for N (6 or 8) and orientation**, so the owner can compare in a browser. Bezel follows N through a
   generated path function, so the bench can show the bezel too (the SVG file becomes a generated drawing or has an
   octagon twin).
5. **Octagon bezel:** `bezel-8.svg` (or the generated path), same finish.
6. **Lights default** for the octagon (5), and low-preset check.
7. **Sprite regeneration script** (live engine → 48 frames → 7 × 7 sheet), run by the owner; commit the new
   `diamond-*-sprite.webp` and update `gemSprite.ts` constants, `assets.test.mts`, `footprint.mjs`.
8. **Words:** `altText.ts`, `index.html` `og:image:alt`, `docs/brand/*`, `docs/live-gem.md`, `docs/ai-handoff/04-design.md`;
   update `tests/alt-text.test.mts`.
9. **Switch the site default to N = 8** (one constant) and re-render the static logo files in one run with the leaves.
10. *(Optional, later)* **Step-cut style** as a second cut on the bench.

Steps 1 to 6 and 8 need no browser to build and test (type-check and unit tests). Looking at them does.

## 5. What the owner must run

- **Bench** (`npm run dev`, open `/bench/`): compare N = 6 and 8, orientation, stone size, lights, and the octagon bezel
  against the eight leaves; copy the chosen settings. (Browser.)
- **Older-phone timing** with the octagon, as the footprint plan describes. (Device.)
- **Sprite rebuild** (step 7): Chrome, `cwebp`, and `puppeteer-core` (`npm i --no-save puppeteer-core`). (Browser.)
- **Static logo regeneration:** `npm run logo:render`, then review `before-after.png` in Finder, per
  `docs/logo-regeneration.md`. Needs Chrome, `sips`, `cwebp`. (Browser; do once, after the leaves and the gem are both in.)
- **Say yes or no** to the smaller-fallback question and to the final orientation after seeing it.

---

# Part 2: user-customizable leaves and gem sides, and the lens ring

Added 2026-11-20 at the owner's request. Scoping only, no source changed. Facts checked: `src/lib/breathCustom.ts`,
`src/lib/deviceMemory.ts`, `src/app/components/CustomBreath.tsx`, `src/lib/lensState.ts` (six lenses in `LENS_ORDER` on `dev`),
and `docs/lens-story-nature.md` on `claude/nature-story-lenses-e05e47` (Nature 7th, Story 8th, each behind its own switch).

## Updated recommendation

**Yes, but split two things that the idea joins.**

1. **The logo's look** (leaf count, gem sides) becomes a small, optional, device-only setting with **presets, not a slider**:
   leaves 6, 8, 10, 12; gem 6, 8, 10; default 8 and 8, gem **follows leaves** by default.
2. **The lens ring** (the leaves as a radial menu) is **not** governed by that setting. In the menu, the ring has **exactly one
   leaf per lens**: 8 today, plus one per custom lens, **up to 13 in all** (8 built-in plus up to 5 custom). That is where 13
   comes from, and why odd counts must work. Extra lenses never hide behind a "more" leaf.
3. The text list (the existing lens tray) always stays as the equal alternative to the ring.

Build the look setting first (small, safe), then the ring, then custom lenses last (it needs a privacy-policy decision).

## 1. Presets and limits

### Leaves

- The generator accepts 1 to 12 (`Math.min(12, ...)` in `leafWeave.ts`); tests cover 6, 8 and 12. Leaf width follows
  `238 × (6/n)^0.85`, so fewer than 6 leaves become very wide and overlap; I would not offer under 6.
- **Offer 6, 8, 10, 12 as the look presets.** All even, so the weave alternates cleanly all the way round.
- **What 13 costs** (needed by the ring, not offered as a look preset):
  - *Weave geometry:* the generator's cap rises to 13; pairs of leaves to test for crossings rise from 66 (12) to 78. The
    weave is computed once per count and memoised, so no per-frame cost. Leaf width shrinks to about 123 units with neighbours
    about 27.7° apart; leaves overlap more, so check that gaps (radius 7.5 outer, 5.5 inner) still read at small sizes.
  - *Odd count and the weave:* the over/under rule is `(j + a)` odd, per pair. With an odd number of leaves the alternation
    cannot close around the ring: there will be one seam (leaf n and leaf 1) where two neighbours behave the same way.
    Probably invisible, but a test must check that no crossing is left without a gap and that the seam reads as woven.
  - *Tone alternation:* `'alternate'` gives even-index leaves gold outside and odd-index silver outside. With an odd count
    leaf n and leaf 1 have the same tone and sit side by side. Options: accept it, or for odd counts use a third pattern
    (the seam leaf takes the other tone). Needs an eye check by the owner.
  - *Orbs:* the 16 orbs turn continuously with the orbit and are independent of the leaves, so there is no alignment to
    keep for any count. Only the evenness of 8 and 16 was a nicety.
  - *Ring-lock math:* none. The leaves breathe as one flower with the shared clock (`ringCorrection` and `breathClock.ts`
    are untouched).
  - *Tap targets:* see section 4.
- Because the ring needs 9 to 13 once custom lenses exist, **odd-count support is a requirement of the ring, not an extra**.

### Gem sides

- **Minimum 6.** Four sides reads as a square tile, five has a flat nowhere and a kite-like look. With the engine
  parametrised (Part 1), 5 can be tried on the bench; I'd start the offer at 6.
- **Maximum 12 in the engine, offered 10.** Planes = `1 + 8N`: 6 → 49, 8 → 65, 10 → 81, 12 → 97. Shader time rises about
  in step: 10 sides is roughly 1.65 times today's cost, 12 roughly 2 times. Past 12 the outline is within 3.5% of a circle,
  so extra sides add cost without reading as sides. Offer 6, 8, 10; 12 is available on the bench only.
- **Linked or independent:** *independent setting with a default of "Match the leaves"*. Match means
  `clamp(leaves, 6, 10)` (so 12 leaves gives a 10-sided gem). A person who wants a hexagon with twelve leaves can pick it.
  Gem follows leaves by default because that is the symmetry the owner liked at eight; independent control is a single
  extra radio group.

## 2. Storage and delivery

- **How the neighbour persists:** the custom breath pace is four numbers checked by `validateCustom`, applied only when the
  person presses Apply, and kept via `usePref('breathingTechnique', ...)` in `deviceMemory.ts`. That writes to
  `nenya.prefs` **only while "Remember on this device" is on** (`nenya.remember`), otherwise it lives for the visit in
  memory. `loadPrefs()` runs each key through a `VALID` check and drops anything that fails. "Forget me" and Emergency Exit
  already erase all of it. Nothing is sent to a server.
- **Proposed:** three new `Prefs` keys with the same pattern: `logoLeaves` (one of 6, 8, 10, 12), `gemSides` (`'match'`
  or one of 6, 8, 10), later `customLenses` (section 5). Add them to the file's header list of what is kept and to the
  privacy wording.
- **Defaults:** 8 leaves, `'match'`. A fresh visit and anyone who never opens the setting see exactly today's logo.
- **Validation:** the `VALID` table drops unknown values, which would fall back to the default. Better, for these two,
  **snap to the nearest preset** (a stale 7 becomes 8) and re-clamp on read, so hand-edited storage can never hit the
  generator's limits.
- **Where the control lives:** in the accessibility/display panel next to "Gem Kaleidoscope", as two radio groups (AAA:
  targets at least 44 CSS px, visible focus, no slider), with a plain note: "This changes the animated logo. The still
  logo in some places stays at the standard design." Changes apply at once with no animated transition; a polite
  live-region line says "The logo now has 10 leaves."
- **Reduced motion:** nothing new moves. The swell is already off; the gem is held still; a change redraws once.
- **Low-capability devices:** leaves are vector and cost nothing extra. For the gem, the low preset (and the first-frames
  step-down) draws **at most 8 sides** and the setting says so ("Your device draws up to 8 sides"); the saved choice is
  kept, not overwritten.
- **Baked images stay at the default:** `nenya-logo.webp`, the small header logo, favicons, app icons, the social preview
  and PDF logo are renders at the standard design (8 leaves, octagon). They never follow the setting. Where the flat logo is
  shown without the orbit, it stays standard; the control's help text says which views change.

## 3. Cost per preset for the gem

| Choice | Live engine | Sprite sheet (WebGL2 missing) |
|---|---|---|
| 8 (default) | 65 planes | the one rebuilt sheet (Part 1, step 7) |
| 6 | 49 planes, today's cost | the old hexagon sheet could be kept (809 KB) or dropped |
| 10 | 81 planes, about 1.65 × | none |
| 12 (bench only) | 97 planes, about 2 × | none |

- **One sheet per side count is not workable:** about 0.8 MB each, and every sheet is a browser render by the owner.
  Sheets **cannot be made on demand in the visitor's browser**: making them needs the same WebGL2 that is missing.
- **Recommended rule:** the sprite exists only for the default (8 sides). A device without WebGL2 shows the 8-sided gem
  whatever the setting says, and the gem-sides control is hidden there (feature test: `liveGemSupported()`). The leaf
  control still works because it is vector.
- **Alternative if the owner wants parity without WebGL2:** a small **2D-canvas drawn stone** (an N-gon with an angular
  gradient and facet lines, no image, about 1 KB of code) used for any non-default count when WebGL2 is missing. It looks
  plainer than the sprite; build only if asked.
- Preload (`preload.ts`) is unchanged: the sprite is fetched only when WebGL2 is missing.

## 4. The lens ring (leaves as a radial menu)

### The tension

Eight lenses today (Sight, Sound, Touch, Essence, Movement, Pattern from the Insight page, then Nature 7th and Story 8th,
the last two behind switches), plus "add a custom lens" later. A decorative leaf count of 6 would hide lenses; 12 would leave
four leaves doing nothing. So the user's look setting and the menu cannot be the same number.

### Options

| Option | For | Against |
|---|---|---|
| A. Leaf count fixed at the number of lenses | Every leaf is a control; nothing is hidden; no setting needed for the menu | No look choice; the count moves as lenses are added or switches change |
| B. A "more" leaf or tray for extra lenses | Keeps the ring a set size | Hides lenses behind an extra step; hard to name and to reach by keyboard; breaks "pick up any lens in any order" |
| C. The person assigns lenses to leaves | Maximum personal | Lots of interface and state; every leaf needs a "which lens?" step; error-prone with touch and screen readers |
| D. Custom lenses get their own leaves | Natural way to grow the ring; each custom lens is a leaf | The ring grows to 13 and needs odd-count support and smaller tap sectors |

### Recommendation: A for the built-in lenses, grown by D

- **In the menu the ring has exactly one leaf per available lens, in lens order, clockwise from the top.** A custom lens
  adds one leaf at the end. The total is capped at **13** (8 + 5 custom). When the menu is not open, the logo uses the
  look setting.
- Never use B or C: both hide or rearrange what every other lens-finding path (the list) shows in a fixed order.
- The text tray stays and lists the same lenses in the same order with the same names; the ring is an addition.

### Interaction

- **Touch and mouse: first tap is information, second tap picks up.** First tap on a leaf shows a caption (the lens name,
  its status "not opened", "examined" or "included", and one line of what it is) and marks that leaf selected. A second tap
  on the same leaf picks up the lens. A tap elsewhere clears. This matches `lensState.ts` (picking up = opening).
- **Keyboard:** focus is information (the caption shows when a leaf gets focus), Enter or Space picks up; no double
  action. Tab enters the ring as one stop; Left/Right (and Up/Down) move between leaves in lens order; Home/End jump;
  Escape closes the menu and returns focus to where it came from. Tab order inside the page matches visual order.
  A `radiogroup`-like roving tabindex is the right pattern; do not use `role="menu"`, which promises behaviours (typeahead,
  menu semantics) we do not provide.
- **Names for every leaf:** each leaf is a real `<button>` with the accessible name "Sight lens, not opened, 1 of 8"
  and the one-line description as its description. Status is not by colour alone. The captions never rely on hover.
- **Targets (AAA 2.5.5 is 44 CSS px):** hit areas are **angular sectors**, not the leaf's shape (13 leaves overlap).
  At 13 leaves the sector's arc at the leaf tips needs a ring radius of about 90 CSS px to give 44 px (2π × 90 ÷ 13). Below that
  logo size, the ring is **not offered**: the text list is used and the ring appears only at the sizes that fit.
- **Motion:** no spinning menu; selection is an outline plus the caption. With reduced motion nothing animates at all. No
  time limits.
- **Colour:** each leaf keeps its metal finish; selection is a thick outline in the AAA-contrast focus colour and a text
  caption, tested for contrast in both themes and the vision modes.
- **Behind a switch**, like Nature and Story (`VITE_LENS_TRAY=on` pattern): off in production until the owner has
  walked through it.

## 5. A custom lens

- **What it needs:** a **name** (English only, 1 to 24 characters, plain text), a **colour from the site palette** (not a free
  colour, so contrast is already checked), a **short description** (up to 120 characters), and optionally **a link to one of
  the existing Patterns** (chosen from the list by id; never a typed address).
- **What picking it up does:** opens the linked Pattern, or, with none, a private note page whose text never leaves the
  device and is **not** part of any report.
- **Out of scope, deliberately:** no text the person writes is sent anywhere: not to the coach, not into the report or PDF,
  not to any server or analytics; no sharing, no sync, no import of lens text from a link; no free web addresses; no
  generated or suggested names. Rendered as text only (no HTML), control characters stripped, length-limited.
- **A policy decision for the owner:** `deviceMemory.ts` states "Never kept: anything a visitor writes". A custom lens name
  and description are visitor-written text. Options: (a) **visit only** (in memory, gone when the tab closes), no policy
  change; (b) **kept on the device with "Remember on this device"**, which needs the privacy wording and that header list
  changed and approved. I recommend building (a) first and (b) only after the owner approves the wording.
- **Limit of 5** custom lenses (so the ring stays at 13).

## 6. Risks (new)

- Odd leaf counts: seam in the weave and tones (section 1); needs tests and an eye check.
- Ring at 12 to 13 leaves on small screens: the sector rule and the "list only below that size" rule must hold.
- The lens set changes by switch (Nature, Story), so the ring count is not constant between builds. The ring must read the
  available lens list at run time and not assume 8.
- Privacy wording for custom lenses (section 5).
- The look setting could be mistaken for the menu's leaf count. The control's help text and the ring's own behaviour must
  keep them apart.
- More surfaces to keep consistent with alt text: the long logo description must be generated from the count, or say
  "a ring of leaves", not a number, wherever the number can vary.

## 7. Proposed build order (continues Part 1's ten steps)

Part 1 steps 1 to 9 come first (gem as N sides, octagon default). Then, each its own commit:

11. **Prefs and validation (pure):** `logoLeaves`, `gemSides` with snapping, in `deviceMemory.ts`, plus tests. No UI.
12. **Odd counts and 13 in the leaf generator**, with tests (every crossing has a gap; tone seam behaviour; counts 1 to 13).
13. **Settings control:** two radio groups with the help text and live-region line; applies at once.
14. **Gem follows leaves:** `'match'` rule, low-capability clamp, hide the gem control without WebGL2; alt text built
    from the count.
15. **Ring geometry (pure):** angular sectors, order, names, status text, target-size rule and the list fallback, with tests.
16. **Ring interaction** behind a switch: first-tap information, second-tap pick up, keyboard, focus, live announcements.
17. **Custom lens model (pure):** validation, sanitising, limits, palette colour, Pattern link by id.
18. **Privacy decision and wording** if the owner chooses to keep custom lenses on the device.
19. **Custom lens UI** and its leaf in the ring.
20. *(Optional)* drawn 2D stone for non-default sides without WebGL2.

### The owner runs or decides

- Decide: the preset lists (6/8/10/12 and 6/8/10), "gem follows leaves", the 13-lens cap, and visit-only versus kept on
  the device for custom lenses (and approve the privacy wording).
- In a browser: judge odd-count leaves (seam and tones) and 10 and 12 leaves; judge the gem at 6, 8, 10 with the bezel;
  time 10 sides on an older phone; check the ring at several logo sizes on a real touch screen.
- By hand with assistive technology: VoiceOver on iPhone and Mac, TalkBack on Android, keyboard-only, switch/voice control,
  200% and 400% zoom, all four vision modes and reduced motion, before turning the ring switch on.
- Part 1's own browser steps (sprite rebuild, `npm run logo:render`) are unchanged.

---

# Part 3: inner orbs become emerging lights; outer orbs keep their planet look and get their own halos

Added 2026-11-20. Still scoping only (this session's task is scope, no source changes); say the word and each step below
can be built as its own commit. Facts checked: `NenyaLogo.tsx` (`OrbSurface`, inner and outer orbit blocks),
`src/lib/orbitLook.ts`, `.nenya-orb-glow` in `src/styles/globals.css`, and the `uOrbs` / `below()` path in `gemRenderer.ts`.

## Recommendation

Do both, as two independent changes behind one new look option, with the old look kept as a setting on the bench:

- **Inner ring: "lights".** Each of the 16 inner orbs stops being a shaded sphere and becomes a soft light source that
  slowly *wells up from beneath the stone*, brightens, and fades back, each on its own slow rhythm. The stone's own colour
  already comes from these orbs (the shader's `below()` reads their colours), so the gem and the lights stay one system.
- **Outer ring: keep the planets**, and give each its own halo in **its own current colour** (today all 16 share one halo
  from three theme colours).
- Keep 16 and the Valar colours; leave the breath clock and ring-lock alone.

## 1. How it is drawn today

- **Inner orbs** (16): each is a `m.div` with a `radial-gradient(circle at 30% 30%, ...)` that cycles through that orb's six
  colours over `colorCycle` (36 s), `OrbSurface` layers over it (form shading, glass highlight, rim light, rim dark), a pulse
  of opacity and scale (3 s plus 0.5 s per orb), a counter-rotation so highlights stay upper left, and a seam cut so the ring
  overlaps cleanly. Drawn under the gem by default (`layer: 'under'`), seen through the stone's clear body.
  The defaults already set `form`, `rimLight`, `rimDark` to 0 and `shine` to 1, so they are already lightly shaded.
- **Gem link:** `SpectralGem` feeds each orb's current colour (`orbColour(...)`) into the shader as `uOrbs`, so light leaving
  the pavilion takes the colour of whatever lies below. This does not depend on how the orbs are drawn, and works for lights
  with no change.
- **Outer orbs** (16): the same construction at radius 0.5, plus class `nenya-orb-glow`: a three-layer `box-shadow` in the
  theme's warm, metallic and primary colours, identical for every orb, strengthened on hover and in dark mode. Because it is
  `box-shadow` with blur radii up to 139 px on 16 elements, it is also the most expensive paint in the logo.
- **Baked images:** orbit-view assets (some icons, og image, print logos) include the orbs, so they need re-rendering.

## 2. Inner lights: design and cost

**What "emerge" means:** a light is a disc with a soft falloff (no rim, no highlight, no darkened edge), so it has no edge
to read as a sphere. Each cycle: it **rises** (opacity 0 to about 0.9 and size from about 55% to 100%, easing in), **holds**
briefly, **settles** (back down), at its own period (about 6 to 14 s, spread by index as the pulse is now) so the ring
never moves in step. Brightness is highest when the light is under the stone's clear facets. The colour cycle stays.

**How to build it (no new dependencies):**
1. New option `style: 'orb' | 'light'` in `InnerOrbitLook` (default stays `'orb'` until the owner chooses), with
   `emergeSeconds`, `emergeStep` (spread per orb) and `emergeDepth` (how far brightness falls to, 0 to 1).
2. In `light` style, skip `OrbSurface`; background is `radial-gradient(circle closest-side, colour 0%, colour at 55%
   alpha, transparent 100%)`; blend `screen` (or `plus-lighter` where supported) so overlapping lights add rather than
   cover. The seam cut (`SEAM_REACH`) is no longer needed because light adds; removes 4 wrapper elements.
3. Emerging **in the gem too:** multiply each orb colour fed to `uOrbs` by its current emergence factor (JS only; shader
   unchanged), so the stone brightens where a light is rising. Cheap: 16 numbers a frame.
4. Bench panel: style, emerge seconds, spread, depth, blend; the old orb look stays selectable for comparison.

**Cost:** similar DOM count to now; fewer gradient layers (4 fewer per orb in `light`), but blend modes force the ring into
its own compositing group. Needs a timing check on an older phone (device). With no `OrbSurface` per orb and no seam
wrappers, I'd expect it to be no worse than today.

**Limits:**
- Sprite fallback (no WebGL2): the stone cannot take light from below (the sprite is baked), so the lights are seen only
  through the sprite's clear body as now. No new asset.
- On a light theme, `screen` blending nearly vanishes; use normal alpha blend there with a slightly stronger core.
  The lights are decorative (`aria-hidden`), so no contrast requirement of their own, but they must not lower contrast of
  any text they sit under; keep the alpha cap and test over text.
- Names/words: nothing user-visible says "orbs" for the inner ring today; the alt text mentions sixteen orbs generally.
  If wording changes, "sixteen small lights" for the inner ring and orbs for the outer.

## 3. Outer orbs: planets with their own halos

- Keep the sphere construction (`OrbSurface`) unchanged.
- **Halo per orb**, replacing the shared `.nenya-orb-glow` box-shadow: a child `span` behind the orb, about 3 to 3.5 times its
  diameter, `radial-gradient(circle closest-side, colour at 55% alpha, colour at 20% alpha 45%, transparent 100%)` in **that orb's
  current colour**, so purple orbs have purple halos and the ring reads as a colour wheel of its own.
- **Keeping the colour in step** with the orb: the halo takes the same six colours, duration (30 s) and per-orb delay
  (`index × 2`) as the orb's background animation; the cheapest correct way is one shared CSS custom property per orb
  (registered with `@property`, animated once, read by both orb and halo), or the halo repeats the same Motion animation
  (16 more animated elements). I'd try the custom property first; fall back to the duplicate animation where `@property`
  isn't supported.
- **Cheaper than today:** a gradient on a composited layer instead of three large blurs, with its opacity (not blur radius)
  animated; hover raises opacity and size slightly, replacing the box-shadow switch. Dark mode raises opacity a little.
- **`glow` prop** (already toggles the class) toggles the halos; reduced-motion keeps the halos static at mid strength;
  low-capability profile uses a single smaller halo with no blend.
- **Halos and the leaves:** the halos sit at radius 0.5, outside the leaf tips, so they do not cross the leaf work.
  At 13 leaves or 12, no interaction.

## 4. Risks and checks

- Visual: lights must read as light, not as dim flat discs; this needs an eye test and a bench A/B against today's orbs.
- Performance: blend modes on 16 layers; check on an older phone. Fall back to normal blend on the low preset.
- Browser support: `plus-lighter` and `@property` have fallbacks (screen; duplicate animation).
- Tests: `orbitLook` defaults are pinned as "what the site has always drawn"; add `style` to the look and keep the default
  until the owner switches; add tests for emerge timing (period spread, never all lit at once) and for the `uOrbs` factor.
- Re-render the baked logo assets once, after the leaves, the gem and these changes are all in.

## 5. Build order (each a separate commit)

21. **Option plumbing:** `style` and emerge fields in `orbitLook.ts`, bench controls, defaults unchanged. Tests.
22. **Light style for the inner orbs** (CSS only, behind the option); bench A/B.
23. **Emergence factor into `uOrbs`** (JS only) and tests.
24. **Per-orb halos** on the outer ring (colour-synced), replacing `.nenya-orb-glow` where `halo` is on; keep the old look
    selectable; hover and dark mode.
25. **Low-capability and reduced-motion rules** for both.
26. **Owner chooses** on the bench; switch defaults in `orbitLook.ts`; update words and alt text if needed.
27. **Re-render logo assets** once (`npm run logo:render`).

The owner runs: the bench comparison (browser), older-phone timing, and the final `npm run logo:render`.

---

# Part 4: the site crashes when zooming in on the gem on an iPhone

Added 2026-11-20. Scoping only: nothing was run on a device (no browser checks in this session) and no source changed.
**This is a diagnosis from reading the code. Nothing below is confirmed until it is measured on the phone.** It matters beyond
this bug: people with low vision zoom, so the site must survive zoom (WCAG 2.2 AAA 1.4.4, 1.4.10). The fix is not to
forbid zoom: `index.html` correctly sets `maximum-scale=5.0, user-scalable=yes` and that must stay.

## What a crash on pinch-zoom usually is

iOS Safari reloads the page ("a problem repeatedly occurred") when the page uses too much memory. Pinch-zoom does not change
`devicePixelRatio` or the layout size, but Safari **re-rasterises** vector content, effects and composited layers at the
zoomed scale. So anything whose memory cost grows with scale (SVG filters, big blurs, many composited layers) can jump from
harmless to enormous when zoomed in on one spot. Bitmaps with a fixed size do not grow with zoom.

## Suspects, in order of likelihood

1. **SVG filters with a huge filter region** (strong suspect). `bezel.svg`, `petals.svg` and the leaf branch's
   `MallornLeaves.tsx` all define their lighting filters (`feSpecularLighting`, `feDiffuseLighting`, blur) with
   `filterUnits="userSpaceOnUse" x="-820" y="-820" width="1640" height="1640"`. The bezel's drawing is only 268 units wide, so its
   filter works on an area **about 37 times larger** than the image (6.1 × per side); the petals' is about 4.6 times (21 ×
   in area). The filter surface is allocated at the zoomed scale, so zoom multiplies that waste. The bezel is the gem's own
   frame, which is exactly what the person zooms into. Cost to fix is tiny: set the region to the drawing's bounds plus
   the blur margin (about ±140 for the bezel, ±400 for the petals) so the result looks identical and the surface is
   a fraction of the size. The leaf branch copied the same region, so it must be fixed there too.
2. **Large `box-shadow` blurs on the 16 outer orbs** (`.nenya-orb-glow`: blurs of 23, 46 and 70 px, rising to 139 px on hover
   or in dark mode). Shadow bitmaps are rasterised at zoom scale, 16 of them, each many times the orb's size. Part 3's
   per-orb gradient halos remove this; they would double as the fix.
3. **Many composited layers**: 32 orbs each with `will-change: background, opacity, transform`, `translateZ(0)` and an infinite
   rotation, the overlay-blended gem sparkle canvas, and the blurred glow layers (`filter: blur(40px)` at `globals.css:309`
   and the light-emanation layers). Each layer has its own backing store; zoom enlarges them all.
4. **Less likely, still worth ruling out**: the gem's own canvases are fixed bitmaps (`gemSide × min(dpr, 3)`, so about
   225 px on a phone at the default size) and do not grow with zoom. The WebGL context is released on
   dispose (`loseContext`). If iOS drops the context under pressure, `SpectralGem` already falls back to the sprite (a 2016 × 2016
   decode, about 16 MB of memory), which is survivable but is a second spike at a bad moment.
5. **JS heap**: nothing in the gem loop allocates per frame at a problem scale. Not suspected.

## Finding the cause (the owner runs this; it needs the phone)

Connect the iPhone to a Mac, open Safari's Web Inspector (Develop menu), and zoom in on the gem while watching memory:

1. Timelines → *Memory* and *Layers* (the layer count and total layer memory) before and after the zoom.
2. Bisect by turning things off, one at a time, and re-trying the zoom: the bench has switches for the gem, orbits and
   quality; for the rest, a temporary local edit (outer glow off; bezel image off; leaf SVG off).
3. Try the **iOS Simulator** first if no phone is at hand; it reproduces memory growth poorly, so a negative result means nothing.
4. Note the iPhone model and iOS version; older, smaller-memory phones fail first.

## Fixes, cheapest first (each its own commit, once confirmed)

1. **Tighten the SVG filter regions** in `bezel.svg`, `petals.svg` and `MallornLeaves.tsx` to the drawing's bounds plus margin.
   Look identical; test it with a static check (see 6).
2. **Replace the outer orbs' `box-shadow` glow** with per-orb gradient halos (Part 3, step 24).
3. **Zoom-aware lite mode:** listen to `window.visualViewport` (`scale` and `resize`). While `scale > 1.25`, show a lite logo: no
   blend modes, no `will-change`, outer halos and glow layers hidden, orbit and gem animation paused (the gem keeps its last
   frame), and the rest of the page untouched. Back to normal about a second after the scale returns near 1 (debounced, so a
   pinch does not flicker). Honour reduced motion. Nothing to be announced: it is purely visual and `aria-hidden`.
4. **Trim compositing hints:** remove `will-change` and `translateZ(0)` from the orbs where nothing needs them, keeping only what
   a measurement shows helps; drop the `backface-visibility` hacks.
5. **Smaller filter use overall:** if the bezel's lighting survives as a fixed raster (a small WebP rendered once by
   `npm run logo:render`, at 2×), the bezel stops being a live filter altogether. Costs a browser render and a file
   (about 10 to 20 KB), so only if 1 does not settle it.
6. **Guard against regression:** a unit test that parses each logo SVG and fails if any filter region is more than about
   2 × the drawing's viewBox, and one that fails if an element in the logo gets a `box-shadow` blur above a set limit.
7. **Do not** cap `maximum-scale`, disable `user-scalable`, or intercept pinch gestures: that breaks accessibility and is not a fix.

Because Part 1 changes the bezel (octagon) and the leaf branch adds new filtered SVG, fix 1 should be folded into those
changes: **write the new octagon bezel with a tight region from the start.**

## Order and ownership

- Build now, no browser needed: fix 1 and test 6 (and the same region in the leaf branch's `MallornLeaves.tsx`).
- Then the owner measures on the phone with the Inspector (section above) to see whether 1 was enough.
- If not: fix 2 (with Part 3), then fix 3.
- The owner runs: the iPhone measurement, any new `logo:render` if fix 5 is taken, and a hand test of pinch zoom on an
  older and a newer iPhone, in light and dark, with reduced motion on and off.

---

# Status of the build (2026-11-20)

Branch `claude/eight-sided-gem-018bd4`, nothing pushed. Everything below is checked by `npm test` and `tsc` only; none of it has
been seen in a browser or on a phone.

| Step | Done? | Notes |
|---|---|---|
| Part 4 fix 1 (tight SVG filter regions) + guard test | done | `bezel.svg`, `petals.svg`. The leaf branch's `MallornLeaves.tsx` still has the 1640 region: change it when merged (the test only covers `src/assets/logo/*.svg`; extend it to that file's constants then). |
| Part 4 fix 2 (per-orb halos replace big blurs) | done, **off by default** | `outer.halo: 'own'` in `orbitLook.ts`; choose on `/bench/` |
| Part 4 fix 3 and 4 (zoom lite mode, no will-change when zoomed) | done | `src/lib/zoomLite.ts`; zoom never limited |
| Part 4 fix 5 (baked bezel) | not done | needs a browser render; only if the phone test says the filter is still too heavy |
| Part 1 steps 1 to 4 (N-sided engine, tests, constants, bench control) | done | 6 to 12 sides, six unchanged (proved against the original construction) |
| Part 1 step 5 (octagon bezel) | done | generated for any side count, `gemBezel.ts` |
| Part 1 step 6 (lights default 5) | **not done** | the sky lights stay 6 (default `DEFAULT_LIGHT.lights`): set 5 after looking at the octagon on the bench |
| Part 1 step 7 (new sprite sheet) | not needed for now | without WebGL2 the stone and bezel stay the hexagon (`effectiveGemSides`), so no new sheet is required; regenerate later only if parity is wanted |
| Part 1 step 8 (words) | done | alt text, brand and live-gem docs |
| Part 1 step 9 (default to 8) | **waits for the leaves** | the gem follows the leaves ("match"); the default leaf count is 6 here, so the gem stays a hexagon until the mallorn leaves (default 8) are merged and `DEFAULT_LOGO_LEAVES` becomes 8 |
| Part 2 steps 11, 13, 14 (look setting, panel, match rule, low clamp, hidden without WebGL2) | done | leaf radio group hidden (`LEAF_SETTING_AVAILABLE`) until the leaf drawing is merged |
| Part 2 step 12 (odd counts and 13 in the leaf generator) | **not done** | the generator is on the leaf branch |
| Part 2 steps 15 to 19 (lens ring, custom lens) | in progress (side session) | visit-only; step 18 (keeping custom lenses on the device) needs the owner's privacy wording |
| Part 3 steps 21 to 25 (lights, halos, gem emergence) | done, **off by default** | `inner.style: 'light'`, `outer.halo: 'own'` |
| Step 20 (drawn 2D stone for non-default sides) | not done | only matters if the graphics context is lost mid-visit with a non-hexagon stone |
| Static pictures, final `npm run logo:render` | owner | after the leaves, the gem default and the orbs are chosen |

To switch the new orbs on: `style: 'light'` (inner) and `halo: 'own'` (outer) in `src/lib/orbitLook.ts`, after comparing on `/bench/`.
