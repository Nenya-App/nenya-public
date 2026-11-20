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
