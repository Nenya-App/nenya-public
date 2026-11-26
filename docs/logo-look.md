# Logo look (visitor setting)

Status (2026-11-22): built and on. The leaf count shows in the settings (`LEAF_SETTING_AVAILABLE = true` in `src/lib/logoLook.ts`) now that the
mallorn leaves are in and the ring follows the count; the default is six leaves with an eight-sided gem (the owner's choice, 2026-11-20). Plan and reasons: [eight-sided-gem-scope.md](eight-sided-gem-scope.md), Part 2.

## Defaults (2026-11-22)
Owner, 2026-11-22: "set the defaults to what is currently set." For a visitor who has set nothing, the logo and animation settings now start as follows (old default -> new):
| Setting | Old | New |
|---|---|---|
| Leaves sway gently (`leafSway`) | off | on |
| Gem kaleidoscope (`gemKaleidoscope`) | off | on (off on a light device) |
| Kaleidoscope look (`gemKaleidoscopeLook`) | Gentle | Lively |
| Kaleidoscope moves with the breath (`gemKaleidoscopeBreath`) | off | on |
| Breathing colours (`breathColours`) | Original | Night |
| Orb colours (`orbColours`) | Original | ~~Night~~ Original again (owner, 2026-11-22: the outer orbs should be the standard colours; the breathing colours stay Night) |
| Outer glow (`orbHalo`) | Own colour | Orb's palette |
| Animation size (`animationSize`; replaced the preview slider on 2026-11-26, see below) | preview 120% | Standard |
| Outer ring movement (2026-11-24, [outer-ring-movement.md](outer-ring-movement.md)) | turns counter-clockwise, 120 s | turns counter-clockwise at its own 144 s per turn; options for still, direction, pace and pace to the breath |
| Inner lights (`innerOrbs`), leaves (`logoLeaves`), gem sides (`gemSides`) | Moving, 6, 8 | the same |
Not changed: theme, text size, colour-blind mode, breathing sound and tones, the breathing pace and the breathing strength (personal and access settings; the strength is on a new scale, below).
Rules that still hold: a stored value always wins over a default, and "never chose" is told from "chose Original" (a chosen Original is stored as `'original'` and stays Original); Original is one tap away in both colour groups; sway, the kaleidoscope, the lights and the rest of the motion stay still under reduced motion, less data, a light device and pinch zoom (the kaleidoscope's default is off on a light device, and sway needs the checks in `swayAllowed`). Code: the `DEFAULT_*` constants at the end of `src/lib/logoLook.ts`, read in `src/lib/deviceMemory.ts`; tests in `tests/logo-look-storage.test.mts`.

## Stop motion (2026-11-22)
A button at the very top of the settings panel, above the instruction line and the cards (never inside a collapsed card): **Stop motion**, and **Resume motion** while stopped. It is a real button with `aria-pressed`, 44 px tall, with a short line under it, and a press is announced politely ("Motion stopped" / "Motion resumed"). While stopped, the Animation card's heading also says "Motion stopped" in words. Kept as `motionStopped` in `nenya.prefs` like the other display settings (off unless pressed).
- **What it stops** (`src/lib/motionStop.ts`, a pure function from all the motion settings plus the stopped state to what moves; `tests/motion-stop.test.mts`): the leaves' sway; the inner lights' turning, rising and fading (they stay drawn, still; Hidden stays hidden); the gem's kaleidoscope (the stone keeps its plain cut); the outer orbs' size pulse and slow turn and the turn of their ring; the glow round the outer orbs (its slow swell, and the swell when the logo is hovered).
- **The page's own pulses too (2026-11-22, owner: "stop all motion, including the timer and the enter pulse").** While stopped, the page root carries `data-page-motion-stopped` (`MotionStoppedRoot.tsx`) and `globals.css` holds these still: the breathing counter's number pulse, including the stronger pulse that opens each breath, and its filling circle (the "timer": hidden, as with reduced motion; the number and the word still change); the swell at the end of each breath on the "Enter" and "more below" buttons (the steady glow stays); the scroll arrow's pulse; the quick navigation's glimmer; the background's slow glow. Resume brings them back.
- **What it keeps.** The breathing guidance: the breath ring keeps its rhythm (it is the visual cue for the breath, so stopping it would leave a visitor with no cue), and the counter, its words and the tones are untouched; a visitor who wants the ring still too can use the Breathing Emanation switch. Colours still change slowly (a fade, not a movement). The individual settings (sway, kaleidoscope, look, lights, colours) are not changed: stopped wins over them while it lasts, and Resume gives back exactly what was set.
- **Reduced motion.** When the device already asks for it, the button shows as stopped ("Resume motion", pressed) and cannot be pressed, with the reason "Your device asks for reduced motion, so motion is already stopped." Reduced motion holds the same things still whether or not the button was pressed (the outer orbs' pulse and turn now also hold still under reduced motion; they did not before).

## Breathing strength (2026-11-22)
The old **Breathing opacity** (0 to 100%, default 100%) is now **Breathing strength** on a new scale in which the old 100% is shown as **50%**: 5% to 200% in steps of 5%, default 50% (`src/lib/breathStrength.ts`, `tests/breath-strength.test.mts`). The slider shows "50%" style values with a help line saying that 50% is the standard strength. (The lowest is 5%, the old 10%: 0 would be an invisible ring, the same as turning Breathing Emanation off.)
- **At 50% the ring looks exactly as it did at the old 100%**, so the default look does not change. **Below 50%** it fades as before (new 25% = old 50%, new 5% = old 10%): its opacity is strength / 50.
- **Above 50%** opacity cannot pass 1, so the ring is drawn stronger instead: every step of its soft radial gradient (alphas 0.08, 0.15, 0.25 and 0.4 at standard) is multiplied by a boost that rises from 1 at 50% to 2 at 200%, and the soft edge starts further in (30% of the radius at standard, 15% at 200%), so the ring is brighter and wider. The timing, the growing and fading, the colours and the peak opacity of the animation are exactly the same: it never moves faster and nothing flashes, only the ring is drawn stronger. Stop motion and reduced motion act on it as before (the ring is the breathing guidance and keeps its rhythm; Breathing Emanation turns it off).
- **Migration.** The new key is `breathingStrength` (percent, 5 to 200). A value stored on the old key `breathingOpacity` (0.1 to 1) is read once, only when there is no new key, and becomes v x 50 (1 -> 50%, 0.5 -> 25%, 0.75 -> 40% after rounding to a step). The old key is no longer written; a visitor who never chose gets 50%. Code: `useBreathingStrength` in `src/lib/deviceMemory.ts`.

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

## Cards in the panel (2026-11-22)
The breathing and accessibility panel is a set of collapsible cards (Theme, Animation, Logo look, Sound and counter, Vision mode, Breathing strength, Text size, Remember on this device), all closed on every visit; which are open is not stored. Each heading holds a real button (`aria-expanded`, `aria-controls`), the body is a region named by the heading, targets are 44 px, and nothing animates. The note at the top says "Each card opens when you select its heading. Select it again to close it." and there are Open all and Close all buttons (small, and one press instead of eight for a screen reader user). The live logo preview is in the popout's left column, outside the cards. Code: `SettingsCard.tsx`, `src/lib/settingsCards.ts`, `tests/settings-cards.test.mts`.

## Inner lights behind the gem (2026-11-22)
The sixteen inner orbs behind the gem are now soft **lights** (owner, 2026-11-22: "I want them to be lights instead of solid orbs"): no sphere, no rim, no highlight; each is a radial glow of its palette colour fading to nothing, drawn with the screen blend so it reads as light shining behind and through the gem, in the same places and the same palette colours as the orbs (including the Orb colours choice). The gem keeps taking light from them. The default inner style in `src/lib/orbitLook.ts` is `'light'`; the shaded `'orb'` style is still there for the /bench page.
Logo look, **Inner lights behind the gem**, three radio choices, stored as `innerOrbs` in `nenya.prefs` (the key and values are the ones from when they were orbs, so nothing stored breaks): `'moving'` (the default; anything else unknown reads as moving), `'still'`, `'hidden'`. Shown with the Palette Orbit.
- **Hidden**: not drawn. The gem keeps its own light.
- **Still**: drawn, nothing turns, rises or fades (they rest at the middle of their range). Their colours still change slowly. The gem's light from them holds at the same level and stops circling.
- **Moving**: **the lights follow the gem's own motion settings** (`src/lib/lightMotion.ts`, a pure mapping, tested in `tests/light-motion.test.mts`):
  - *The gem's kaleidoscope switch* (Settings, Animation): off, the lights hold still; on, they move. (It is on by default since 2026-11-22, except on a light device, so with Moving chosen the lights move with the gem unless the visitor turned the kaleidoscope off.)
  - *The gem's look* (Calm, Gentle, Lively, Full motion): the gem turns its star and pavilion facets on half of the look's slowest period (150, 100, 60 and 45 seconds). The ring turns on the same period and the same way: with a sway (Calm 6, Gentle 12, Lively 25 degrees, times turn and depth) it swings back and forth with a sine and comes home; with Full motion (no sway) it turns on steadily by one repeat of the cut (360 divided by the gem's sides, times depth) every half period. Each light also rises and fades on that period, a little out of step with the next (4% longer each). How much they dim and shrink is the gem's own measure of how far its star pattern moves (depth times pattern): brightness 1 - 0.5 x that, size 1 - 0.25 x that. Gentle: 79% to 100% bright, 90% to 100% in size. Calm: 88%, 94%. Lively: 60%, 80%. Full motion: 70%, 85%.
  - *"Move with my breathing"*: when it is on, the lights brighten and swell as the breath goes in, hold through the hold, and dim and settle as it goes out, on the shared breath clock (CSS keyframes, `lightBreathCss`), instead of their own wave.
  - *Reduced motion*: nothing moves.
  - Not followed: the gem's structure setting and the crown, pavilion, girdle and table angles (they have no meaning for a light), the side count except for the length of a steady turn, and the spin of the gem's own sparkle (three breaths a loop), which is the gem's light.
- **The old numbers, for tuning.** The shaded orbs pulsed 22% in size either way and 80% to 90% in opacity, 3 seconds plus 0.5 per orb (3 to 10.5 seconds), and the ring turned once in 120 seconds. The first bench lights (`style: 'light'` before this change) went 12% to 100% bright and 55% to 100% in size over 9 seconds plus 0.7 per light. Now the motion comes from the gem's look as above; `DEFAULT_INNER_ORBIT` (`emergeDepth` 0.6, `emergeScale` 0.9, `emergeSeconds` 12, `emergeStep` 0.8) is only the fallback for the bench and the gem's own props. The `LIGHT_STEP`, the 0.5 and 0.25 in `lightMotionFor` and `GEM_TURN_RATIO` are the numbers to tune.
- The turning direction is clockwise on screen, as the ring has always turned. Whether the gem's own facets turn the same way on screen was not checked (no browser).
Code: `lightMotion.ts`, `NenyaLogo.tsx`, `SpectralGem.tsx` (`lights`), `globals.css` (`nenya-lights-sway`), `AccessibilitySettings.tsx`.

## Outer orbs opaque, the breath ends behind them (2026-11-22)
The sixteen outer orbs are **100% opaque at every moment** (owner: "so the breathing pulse ends behind them"), for every colour choice. Before, their opacity pulsed between 64% and 87% with a 4 to 8 second wave and their gradient faded to 27% opacity at the rim, so the ring showed through them. Now the opacity is fixed at 1, the animation touches only size (95% to 105%, kept: it does not move the orbs' centres, where the ring ends) and the slow turn, and the sphere's gradient has no transparent stop (it darkens toward the rim by mixing with black instead). The halo and the glow round each orb stay soft and keep their own opacity (`outer.opacityLow`/`opacityHigh` now belong to the halo only; the /bench sliders for them no longer change the orbs).
The ring: it was already drawn below the logo (ring z-index 1, logo 10, outer orbs inside the logo) and its full-size radius was already the orbs' centre radius (0.5 x the logo's size; the orbs are 0.053 x the size across, so they cover 0.4735 to 0.5265). So the radii are the same before and after: **ring 0.5, orb centres 0.5, orb radius 0.0265, all x the logo's size**. What changed is that the orbs now hide it. The ring's size is now computed from the orbs' radius (`RING_END_FRACTION` in `ValarBreathingLogo.tsx`) so the two cannot drift apart. Between two orbs the ring's soft outer edge is still visible (16 orbs cover about a quarter of the circle), as before. Tests: `tests/outer-orbs-opaque.test.mts`.

## Leaf sway, breathing colours and orb colours (2026-11-22)
Three more choices in the same Logo look group (Settings, `AccessibilitySettings.tsx`; the parts are in `LogoLookExtras.tsx`). All three are display settings stored like the rest (`leafSway`, `breathColours`, `orbColours` in `nenya.prefs`, only while "Remember on this device" is on), applied at once, shown live in the preview in the breathing panel and in the header logo, and announced politely ("Orb colours are now cool."). Defaults are unchanged for a visitor who sets nothing: sway off, colours *Original*.

### Leaves sway gently (default off)
A switch, shown with the Palette Orbit (the leaves are drawn there). Each leaf rocks about its own base by **1 degree** either way, one full rock every **18 seconds**, eased and looping with no jump. Leaf *i* of *n* starts *i/n* of a rock behind the one before, so a slow wave goes round the ring and joins up with itself. Code: `leafMotion.ts` (`LEAF_ROCK_DEG`, `LEAF_ROCK_PERIOD_MS`, `leafBase`, `rockOffsetMs`, `leafRockCss`, `leafRockStyle`), `MallornLeaves.tsx`.
- **Where it can run.** Only when the visitor switched it on, Breathing Emanation is on, and the device does not ask for reduced motion, less data (Save-Data) or lighter drawing (2 GB or less memory, 2 or fewer cores), and the page is not pinch-zoomed (the light drawing). Where it cannot run, the switch is off and says why. A stylesheet rule repeats the reduced-motion rule as a backstop. Nothing about the sway is on for the first render.
- **How it is drawn.** Without sway the leaves are one picture, exactly as before. With it each leaf is its own stacked layer turned by a CSS transform (the only thing animated), with its own lighting filter over just that leaf's box, so the filter runs when a layer is first drawn and not on every turn. The over-and-under weave is cut into the paths as gaps, not made by stacking order, so layers can sit in any order.
- **The weave.** Neighbouring leaves rock out of step, so the places where they cross move a little against each other. At 1 degree the worst drift at any crossing is 3.5 units in 765 with 6 leaves (less with more); the gaps are cut 7.5 units round a crossing. A test measures this on the real outlines (`tests/leaf-sway.test.mts`) so a larger angle cannot be set by accident.
- **History.** An earlier sway (up to 1.6 degrees, two breaths a rock, with the leaves opening and closing) was removed 2026-11-20 (commit 3b704fd) for a breath swell, and the swell is now off (`PETALS_BREATHE = false`). Kept from the earlier sway: the keyframe shape, rotation about the leaf's own base, a negative delay per leaf, and no sway under reduced motion or on a light device. New: the fixed slow period, the smaller angle, the wave that joins up, separate layers.

### Breathing colours and Orb colours
Two groups of radio choices with names (never colour alone: each says in words what it is made of, with small swatches as decoration):
- **Original**: the logo as it always was (the ring goes through all 96 colours, one a breath; each orb keeps its own palette).
- **Cool, Warm, Woodland, Night**: named sets built from the sixteen palettes (`PRESETS` in `src/lib/logoColours.ts`; each says which palettes it takes, by their outward names).
- **One of the sixteen palettes**: a drop-down of the outward names.
- **Your saved palette 1, 2, or both**: only while those exist (see below). With none kept, nothing appears, not even a disabled control.
Where the colours go: the *Breathing colours* choice sets the colour of the breath ring and, as before, the tint the gem takes from the same breath. *Orb colours* sets the sixteen orbs, the inner light the gem takes from them, and the outer glow in "Own colour" and "Orb's palette" styles ("Random colours" draws from the chosen colours).
- **More than one palette** (a named set, or both saved palettes): the palettes take turns. Breath: breath 1 the first palette's first colour, breath 2 the second palette's first colour, and so on round, then each palette's second colour. Orbs: orb *i* of sixteen takes palette *i mod P*, so two palettes alternate all the way round. Each orb fades through six colours: a six-colour palette as it is (shifted along one each time the palettes come round, so orbs sharing a palette do not all start on the same colour); a palette of another size is sampled evenly round its loop, blending between neighbours.
- **No new animation.** The colours change through the animations the logo already has (one swap a breath for the ring, the orb colour fades), which already hold still under reduced motion.

### Saved palettes
A visitor "saves" a palette by pressing *Keep this palette in my report* in the Sight Lens (`PalettePanel.tsx`): up to two, in the report data as `generatedPalettes` (`GeneratedPalette`, `src/lib/colorSchemes.ts`). They live in the browser's memory for the visit only (a colour a visitor picks is never written to the device, `deviceMemory.ts`). `src/lib/keptPalettes.ts` is a small in-memory store the Sight page fills whenever its kept palettes change and `App.tsx` refills from the report; the settings read it. A palette with fewer than two usable colours is ignored. Only the *choice* ("your saved palette 1") is stored with the other settings; if the palette is gone next visit, the choice reads as *Original*. Forget me and Emergency Exit empty the store. Nothing is sent anywhere. See [data-register.md](data-register.md).

Tests: `tests/logo-colours.test.mts`, `tests/leaf-sway.test.mts`, `tests/logo-look-storage.test.mts`.

## Animation size
The breathing and accessibility panel has three presets, **Small, Standard and Large** (2026-11-26; before that, a "Preview size" slider that changed only the panel's preview). The choice sizes the animation on the front page and the panel's preview. Kept as `animationSize` like the other display settings; the earlier `previewPercent` and `previewSize` values are no longer read. Code: `src/app/components/BreathingPopout.tsx`, `src/lib/logoLook.ts` (the presets and the preview) and `src/lib/welcomeLogo.ts` (the front page).
- **Front page:** Standard is the size from `welcomeLogoSize`; Small is three quarters of it; Large is up to a quarter larger, as far as the width allows and while both gaps and the button stay on the screen. On a very short screen (a phone on its side) Large is the same as Standard.
- **Equal gaps:** the first screen is the space under the header. The gap above the animation and the gap between it and "Explore Your Senses" share the spare height equally.
- **Preview:** 220, 264 and 308 pixels on a wide screen (Large is 275 on a light device), less where the screen is narrow, with no sideways scroll. The buttons sit above the preview and the panel keeps one width, so they do not move when one is picked.

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
The favicons (`public/icons/favicon-32.png`, `favicon-48.png`), the app and touch icons (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png`) and the link-preview picture (`public/og-image.jpg`, 1200 x 630) were redrawn with the default look (six woven silver and gold leaves around an eight-sided gem, sixteen orbs; the favicons are the flat logo without orbs). They were made from the repository's own leaf, weave, gem and bezel code by the Python tools kept with the remade assets (`Nenya Assets/Remade 2026-11-21/tools`, outside the repository), not by `scripts/render-logo-assets.mts`, which needs a headless browser. The gem and glow are a port of the site's drawing, so they can differ slightly from what the site draws live; re-running `scripts/render-logo-assets.mts` in a browser gives the exact site render. `public/pdf-assets/nenya-logo.png` (the logo the PDFs print on cream paper) was redrawn the same day: the flat logo (no orbs) with the faint grey leaf panels the old one had, 908 x 1024 px, so the six leaves and the eight-sided gem read on paper; the PDF code sizes it from the image's own aspect ratio, so the changed width needed no code change. The icon names in `manifest.json` and `index.html` are unchanged.
