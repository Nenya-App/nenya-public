# Touch: audit and card plan (draft for the owner, 2026-11-17)

**Status:** the second lens-by-lens pass (method: `docs/lens-rebuild-audit.md`; wireframes: `docs/wireframes/lens/touch.html`). Read from `TouchGatewayPage.tsx` (410 lines), `TextureChooser.tsx`, `lib/touchTextures.ts`, `lib/gatewayCopy.ts`.

## 1. Touch, as it is
**Flow:** three instruction cards (skipped when the simple mode is on, `VITE_GATEWAYS_SIMPLE`), then a selection screen with two stages shown one at a time (`PairStage`): **present** ("Now") and **wish** ("How you would like it to feel").
**Simple mode (already built, staging and production):** a plain intro ("Imagine you could touch this feeling..."), **pick a surface** (one picture is enough), and a disclosure **"Add more detail"** that holds the sliders and a words box.
**The surfaces:** `TextureChooser`, 283 texture photographs (about 4.9 MB in all, `public/touch-textures/`, each loaded only when shown), four groups (Soft and woven; Leather and skin-like; Plant and wood; Stone, earth and cold), each with a description (`textureAlt`) and a "feel" (`FEELS`: flat or very smooth, smooth, lightly textured, textured, rough).
**The sliders (five per state, ten in all):** Texture (rough to smooth), Temperature (frozen to burning), Pressure (loose to compressed), Weight (weightless to heavy), Sharpness (blunt to sharp), each with an unset state, then a free-text box.
**What it stores per state:** the surface id, five slider values, the description. Plus the shared body map.
**What does not respond:** none of the five sliders changes anything you can see; they are recorded and described afterwards.

## 2. Card plan (draft; wireframed)
1. **How does it feel now?** Kind of surface, then surfaces (one group at a time), one pick. *Live:* the pick is shown larger with its description.
2. **How would you like it to feel?** The same, for the second state.
3. **Feel it more** (optional). The five sliders **act on the surface**: texture changes the grain, temperature the cool-to-warm tint, pressure squeezes it, weight sinks it, sharpness takes it from round to pointed. A text line says what it is ("rough, cool, loose, heavy, blunt"). Each slider can stay unset. Optional later: a short vibration where the device supports it, off unless asked.
4. **Add this to my report / Put this down**, with an optional free-text box.
Two cards for the surfaces (rather than one for both) because the choice is large; the strength cards in Sight can sit side by side because a color swatch is small.

## 3. Findings that matter beyond Touch
- **The body map is shared by all six lenses** (`bodyMapData`, `onUpdateBodyMap`, App-level state). That does not fit "add, update or remove per lens": whose marks are they? Options: (a) **one map for the whole report**, offered in the report or the tray, outside any lens; (b) **marks tagged by lens**, so adding or removing a lens adds or removes its marks; (c) a body card per lens with its own map. Recommended: **(a)**, a single optional "where do you feel it?" step available from the tray and the report, because a body feels all of this at once and the data model stays simple. This changes the Sight card plan (card 3 becomes optional elsewhere). Needs the owner's decision.
- **The texture photographs and the brief.** The lens brief says "vector or drawn, not photographic". Those rules are about the identity (marks, tray, motion); the photographs are content people choose from, each loaded only when shown and each with a description. Recommended: keep them, and draw the identity in vector.
- **Simple mode is the model.** Touch already has the plain intro, the one-picture step and the "more detail" disclosure; the rebuild turns the disclosure's sliders into an active step instead of changing the opening.
- **Haptics:** vibration works on some Android browsers and not on iOS; it must never be the only signal.

## 4. Decisions (owner, 2026-11-17)
- **One body map for the whole report** (option a). It works like the color picker: the person picks a **paint** (a color or a surface they added, or any color) and puts it on places on the body. Wireframe: `docs/wireframes/lens/body.html`. It is reached from the tray and from each lens's last card, and appears in the report as its own section. This takes the body card out of Sight (now three cards).
- **Two surface cards** (now, wish): the cards make sense as drawn.
- **The surface is shown as an object with the sliders acting on it**, in a quick render. The default shape is an **orb**. The wireframe orb shows how: texture changes the grain, temperature the tint, pressure squashes it, weight sinks it and grows its shadow, sharpness turns the circle into a pointed star. Drawn in 2D (CSS and canvas) so the first visit does not grow; a 3D version is possible later (the gem already uses WebGL), and other shapes can be offered later.
- **Icons:** Google's Material Symbols, downloaded and credited (see `ATTRIBUTIONS.md`).

## 5. Decided (owner, 2026-11-17, later)
- **"Feel it more" is for both states** (a Now / Wish choice on the card; each keeps its own settings).
- **The vibration idea is in.** A labelled switch, off until chosen, shown only where the device can vibrate; pressure sets the strength, texture the pattern, weight the length; the text line always says the same; never the only signal; Android browsers only (iOS has no vibration).
- **The body map keeps a pointer-drawn brush** (with a size slider and undo) **beside the places list**; the list stays the full alternative for keyboard and screen-reader users.

Still open: nothing for Touch beyond the copy pass.

## 6. The decisions that were asked (kept for the record)
1. The body map: (a), (b) or (c) above.
2. Surface cards: two (now, wish), or both on one card with a smaller chooser?
3. "Feel it more": for both states, or the present state first and the wish on request?
4. Keep the vibration idea (off by default), or leave haptics out of the first rebuild?
