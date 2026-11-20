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
