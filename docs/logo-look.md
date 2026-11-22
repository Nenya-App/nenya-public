# Logo look (visitor setting)

Status (2026-11-20): built and on. The leaf count shows in the settings (`LEAF_SETTING_AVAILABLE = true` in `src/lib/logoLook.ts`) now that the
mallorn leaves are in and the ring follows the count; the default is six leaves with an eight-sided gem (the owner's choice, 2026-11-20). Plan and reasons: [eight-sided-gem-scope.md](eight-sided-gem-scope.md), Part 2.

## What a visitor can change
Under **Logo look** in the accessibility panel (`AccessibilitySettings.tsx`), as radio buttons (no sliders), applied at once with no
motion, and announced politely ("The gem now has 8 sides."). Targets are at least 44 px.
- **Gem:** *Match the leaves*, 6 sides, 8 sides or 10 sides (`GEM_SIDE_PRESETS`). The engine can draw up to 12, but 12 costs about twice
  as much as 6, so it is not offered.
- **Leaves** (default 6): 6, 8, 10 or 12 (`LEAF_PRESETS`), all even so the weave alternates all the way round.

## Match
The default gem is eight-sided (`DEFAULT_GEM_CHOICE = 8`). *Match the leaves* is the other option: the stone then has as many sides as the ring has leaves, kept between 6 and 10, so twelve leaves
give a ten-sided stone. Picking a number fixes the gem whatever the leaves are.

## Outer glow
The glow round each outer orb is a setting too (Settings, Logo look, Outer glow), with the same storage rules as the rest of the look:
- **Style** (`orbHalo`): *Own colour* (the default; the halo follows the orb's own colour), *Orb's palette* (the rim fades into another colour from the same palette), *Random colours* (each orb draws from every palette; *Shuffle colours* deals a new set, kept as `orbHaloSeed` so a reload does not reshuffle) or *Old shared glow* (the three large gold blurs, the heaviest to draw).
- **Width** (`orbHaloWidth`): Soft 3.4, Wide 5 (the default, the owner's choice) or Wider 7, as a multiple of the orb's width. Not offered for the old shared glow.
The halos are gradients, never blurs, and their colours are animated by the browser, so they are light to draw. Reduced motion holds them still. Code: `src/lib/logoLook.ts` (choices, `randomHaloColors`), `src/lib/deviceMemory.ts` (storage), `NenyaLogo.tsx`.

## Preview size
The animated preview in the breathing and accessibility panel was a fixed 160 pixels. It now has a **Preview size** slider (120 to 400 pixels, steps of 20, default 220) and a Reset button, kept as `previewSize` like the other display settings. The panel widens to fit it on a wide screen; on a narrow screen the preview is held to 220 pixels so it fits. Code: `src/app/components/BreathingPopout.tsx`, `snapPreviewSize` in `src/lib/logoLook.ts`.

## Storage
Both choices are display settings like the others (`logoLeaves`, `gemSides` in `nenya.prefs`, `src/lib/deviceMemory.ts`). They are
written to the device only while "Remember on this device" is on; otherwise they last for the visit. Unreadable or unknown stored values
snap to the nearest preset (`snapLeaves`, `snapGemChoice`), so nothing stored can break the logo.

## Low-capability devices
Where the live gem cannot run (no WebGL2) the stone is the sprite's hexagon and the setting is not shown. On a device that draws less,
the stone never has more than 8 sides (`LOW_DEVICE_MAX_SIDES`); the panel says so under the choices. The bezel, the glow outline and
the kaleidoscope's wrap follow the side count that is actually drawn (`effectiveGemSides`).

## Stills stay standard
The still pictures of the logo (header image, icons, social preview, PDF) are always the standard design, and the panel says so:
"This changes the animated logo. The still logo in some places stays at the standard design." The written descriptions
([brand/alt-text.md](brand/alt-text.md)) do not fix a leaf or side count, so they stay true for every look.

Code: `src/lib/logoLook.ts` (pure, tested), `src/lib/gemBezel.ts`, `src/lib/gemCut.ts`, [live-gem.md](live-gem.md).

## The small static images (2026-11-21)
The favicons (`public/icons/favicon-32.png`, `favicon-48.png`), the app and touch icons (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png`) and the link-preview picture (`public/og-image.jpg`, 1200 x 630) were redrawn with the default look (six woven silver and gold leaves around an eight-sided gem, sixteen orbs; the favicons are the flat logo without orbs). They were made from the repository's own leaf, weave, gem and bezel code by the Python tools kept with the remade assets (`Nenya Assets/Remade 2026-11-21/tools`, outside the repository), not by `scripts/render-logo-assets.mts`, which needs a headless browser. The gem and glow are a port of the site's drawing, so they can differ slightly from what the site draws live; re-running `scripts/render-logo-assets.mts` in a browser gives the exact site render. `public/pdf-assets/nenya-logo.png` was not changed: it is the flat logo on grey leaf panels for white paper and still shows the earlier six-sided look. The icon names in `manifest.json` and `index.html` are unchanged.
