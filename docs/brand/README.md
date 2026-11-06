# The vector logo

The logo's petals, orbs and bezel are drawn as vectors. The gem is the one raster part: the site's own 48-frame sprite, unchanged.

## What is where
| Part | In the site | Source |
|---|---|---|
| Petals (two interlaced flowers, gold and cream, bevelled, true over-and-under weave) | `src/assets/logo/petals.svg`, drawn by `NenyaLogo.tsx`; its 765-unit box is `size * 0.765` | this folder's settings |
| Bezel (double hexagon round the gem) | `src/assets/logo/bezel.svg`, drawn by `SpectralGem.tsx` at 1.12 times the gem's frame | same |
| Orbs (16 inner, 16 outer) | CSS in `NenyaLogo.tsx` (`OrbSurface`): the animated colour with four fixed layers over it | same |
| Glow round the petals and gem | baked in the browser by `LogoGlow.tsx` (`GLOW_SPREAD`, `GLOW_STRENGTH` in `src/lib/glowBake.ts`) | same |
| Outer orbs' glow | `.nenya-orb-glow` in `src/styles/globals.css` (radii 1.45 times the old ones) | same |
| `docs/brand/nenya-orbs.svg` | a still of both orb rings, for reference and print; not used by the site | same |

`vector-logo-settings.json` holds every value chosen in the design bench (stroke widths, metal colours, bevel light, weave, orb shading, bezel). Units: the outer ring's diameter is 1000.

## Raster files made from the vectors
`src/assets/nenya-logo.webp` and `nenya-logo-small.webp` (the flat logo for headers, with no orbs), `public/icons/*`, `public/og-image.jpg`, `public/pdf-assets/nenya-logo.png`. They are renders of the same drawings; if the look changes, re-render them rather than editing them.

## Not in the repository
The design bench (`dev/`, git-excluded), the full-logo SVGs with the gem embedded (about 1 MB each) and the 10-inch print files live in `Desktop/Nenya Assets` (`Vector Masters`, `Print Logos`).
