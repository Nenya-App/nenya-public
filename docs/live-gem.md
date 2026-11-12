# The live gem and the gem bench

Status (2026-11-11): **built, not switched on.** The site still draws the sprite gem. The live gem runs on the `/bench/`
page, side by side with the sprite, for tuning. Switching the site over is one line (below).

## Why

The gem in the logo is a 48-frame sprite sheet (`src/assets/diamond-hex-sprite.webp`, 809 KB). It is about 70% of what a
first visit downloads, and every visitor downloads it at startup, including on small phones. The live gem draws the same
stone in the browser from about 3.9 KB of compressed code and no image.

## How it works

- `src/lib/gemCut.ts`: the stone as 49 flat facets (a convex polyhedron): table, six crown mains, six stars, twelve upper
  girdle facets, six girdle sides, twelve lower girdle facets, six pavilion mains. It is hexagonal, with corners at the top
  and bottom, and sits in its frame exactly where the sprite's stone does. Every angle can be tuned.
- `src/lib/gemRenderer.ts`: a WebGL2 shader that ray-traces the stone for each pixel. It traces reflection off the crown
  (sparkle), refraction in at diamond's index (2.42), bounces inside with total internal reflection, and light leaking out
  at each face. Light leaving through the pavilion takes the colour of the inner orbit's orbs that sit under that part of
  the stone, so the colours come from below and within, as they do with the sprite. Light leaving upward sees a dim sky,
  a few small lights that turn (the sparkle moves as the sprite's did), and the viewer's shadow overhead (the dark
  facets). With "fire" on, red, green and blue are traced at slightly different indices.
- `src/app/components/SpectralGem.tsx`: draws either gem, then gives both the same 2D finishing (contrast, lift, breathing
  tint, the partly clear body the orbit shows through). The live gem falls back to the sprite where WebGL2 is missing,
  where the shader fails to build, or if the browser takes the graphics context away.
- `src/lib/orbitLook.ts`: the inner and outer orbits' options, with defaults equal to what the site has always drawn.

## The bench (`/bench/`)

Not linked from anywhere, not indexed (a robots tag and an `X-Robots-Tag` header), saves nothing on the device. Settings
live only in the page's address after `#`, so a setting can be bookmarked or sent. "Copy settings" copies the ones that
differ from the defaults.

Panels: View; Inner orbit (radius, orb size, opacity range, pulse, colour cycle, turn time, the four glass layers, under or
over the gem, blend mode); Outer orbit; Live gem light and material; motion; cut; quality (bounces, fire, smooth edges,
and a low preset for older phones); and 2D finishing. Each side reports its time per frame.

## Switching the site over

1. Tune on the bench, then copy the settings into the defaults: `DEFAULT_LIGHT` in `gemRenderer.ts`, `DEFAULT_CUT` in
   `gemCut.ts`, and the live finishing (at least `fieldAlpha`, about 0.25) where `NenyaLogo` renders `SpectralGem`.
2. Set `GEM_ENGINE` to `'live'` in `src/lib/gemSprite.ts`. Startup then skips the sprite download where WebGL2 is
   available (`src/lib/preload.ts`), and the glow traces a hexagon instead of the sprite's first frame.
3. Before claiming a lower footprint, measure device energy on an older phone with the gem on screen, as in the footprint
   plan: the live gem trades 0.8 MB of download for some graphics work while it is visible (15 draws a second by default,
   paused when hidden, held still with reduced motion).

Still to decide: whether low-end devices should pick the low preset automatically (by timing the first frames).

## Kaleidoscope (built 2026-11-11, off by default)

`src/lib/kaleidoscope.ts`. The inside of the stone slowly re-cuts itself, while the outline stays still in the bezel:
- each facet angle drifts on its own slow wave, with unrelated lengths, so the pattern takes a long time to repeat;
- the star facets and the pavilion turn steadily in opposite directions, which is what reads as a kaleidoscope. The cut
  repeats every 60°, so the turn wraps without a jump.

It's tuned on `/bench/` (panel "Live gem: kaleidoscope": depth, slowest wave, turning). With reduced motion it holds still.
Tests sample half an hour at full depth and confirm the stone never opens a gap.

Cost: about 0.6 KB of extra compressed code, so the live gem is about 4.3 KB in all, against the sprite's 809 KB. The work
per frame is the same shader, plus a few microseconds to work out the cut.

On the site it is off by default, and a visitor can switch it on with **Gem Kaleidoscope** in the accessibility panel (next to the animation controls; `src/lib/deviceMemory.ts`, `useGemKaleidoscope`). The switch turns it on in addition to whatever the look says, takes effect at once, and puts the stone back to its plain cut each time it is toggled. To make it the default for everyone, change `on: false` to `on: true` in `src/lib/siteGem.ts`. The bench's own settings are never overridden by the visitor switch.
