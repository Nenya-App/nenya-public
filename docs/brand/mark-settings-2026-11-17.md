# The nənya.biz mark: the owner's settings "for now" (2026-11-17)

**2026-11-26 (owner):** the mark is now on the site, in the header and the footer ("nənya.biz" where ".biz" shows; "Nənya", with a capital, in the narrow header, below 1024 pixels wide), without the `VITE_NAME_MARK` switch. The e's take the **breathing ring's colors** for the theme (the visitor's breathing choice, the original palettes by default, only those that can be seen), each kept at least 3:1 against the page; this replaces the session's color pair below. The session ID still decides which e's rest turned and which color each takes. Stop motion holds it still, as reduced motion does.

Copied from the editor (`Nenya Marketing/press-kit/nenya-name-forms.html`, "Copy settings"). **Built into the site behind `VITE_NAME_MARK=on` on 2026-11-17** (`src/lib/nameMark.ts`, `src/lib/sessionMarkStore.ts`, `src/app/components/NenyaMark.tsx`; tests in `tests/name-mark.test.mts`). Off, the footer shows the plain name "Nenya".

```
Stacked mark settings.
Cormorant: nudge -0.030em, raise -0.025em, space after -0.010em.
Manrope:   nudge  0.085em, raise  0.020em, space after -0.020em.
Animation:
 Cormorant: spin, clockwise 180 degrees, 4.2s, wait 0.7s, pause 0.0s, not woven, settles, lift 1.10, pivot 0.000/0.000em,
   gold #C9A88A (same), in front,
   fidget (16 half turns of 1.0s, pause 0.5s, random, 4 e's, either way at random, colour any, seed off,
   readable at least 3.0:1, transparency solid, colours ink #C9A88A #ffffff #ffffff, keeps going while pointed at).
 Manrope:   spin, counterclockwise 180 degrees, 4.0s, wait 1.0s, pause 0.1s, not woven, settles, lift 1.10, pivot 0.000/0.000em,
   gold #C9A88A (turns), in front,
   fidget (16 half turns of 0.8s, pause 0.4s, random, 4 e's, alternating ways, colour theme (palette 1), seed off,
   readable at least 3.0:1, transparency solid, colours ink #C9A88A #8FB3C9 #C98FB3, keeps going while pointed at).
```

## What this means, in words
- **Placement changed from the live site** (Cormorant nudge 0.145 / raise 0.030 / after 0.075; Manrope 0.085 / 0.015 / 0): Cormorant's turned e now sits slightly left and down of the white e, with the pair drawn closer.
- **Both fonts play a fidget** when the mark is pointed at (or tapped): 16 half turns, one of 4 e's at a time chosen at random, and it keeps going while the pointer stays on it. Cormorant turns either way at random with any readable colour; Manrope alternates direction with colours from palette 1.
- **The single turn** (4.0 to 4.2 s, clockwise for Cormorant and counterclockwise for Manrope, with a 1.10 lift) is still set, but with the fidget as the way the mark plays, it is the motion the editor's "Play this font" shows when fidget is off.
- **Gold in front** of the white e in both fonts; the weave is off.

## To settle before building it into the site (nothing here is decided; the colour source, the colour pair, is decided as in point 3, the rest are open)
1. **Reduced motion:** with a request for reduced motion the mark should show its resting state and not fidget. Both would need to hold still.
2. **Keyboard and touch:** pointing starts the fidget; a tap does on touch. A keyboard user needs a way to start it (focus or a press) and a way to stop it (WCAG 2.2.2).
3. **Colours and the session ID** (owner, 2026-11-17, replacing the earlier note): the e's take their colours from the **session's colour pair** only, not from a palette, and the mark is meant to serve as the **visual form of the session ID**. People who do not use the visual lens (and so never pick colours) still get a session ID: a randomized "shadow ID". The colours in the settings line above are only what the editor happened to hold. Random colours stay readable against the page (the editor's "readable at least" setting, 3:1 here).
   Design questions this raises (not decided):
   - **The mark's shape:** colours alone are a weak ID (many people pick the same pair, such as the defaults). One way: the mark is made from both, with the colours from the pair and the arrangement (which e's are turned, upright, mirrored or flipped, and their order) drawn from the shadow ID, so two sessions with the same colours still differ. The editor's seed and session-mark generator already work this way (`seed` from the pair or from a typed value).
   - **A mark for everyone:** a person with no colour pair gets the page ink and gold, with the arrangement still drawn from their shadow ID.
   - **What the shadow ID is and where it lives:** random, per session, held only in the tab (the site stores nothing). **Decided: it is not added to signed transcripts** (2026-11-17); it is used for Save and return, the guestbook's own-pair check and the mark's fallback colours, and nothing else.
   - **It is a recognisable signature, not proof of anything:** letters that overlap hide each other, so far fewer marks are visibly different than are possible; the shadow ID, not the picture, stays the identifier.
4. **Where the mark shows:** today only in the footer, behind `VITE_NAME_MARK=on`.

## Built 2026-11-17 (behind VITE_NAME_MARK=on, staging first)
- **Four e's:** the white e (page ink), the gold e in front of it (turns once when the mark first comes into view, then rests upside down), and two more under the white e. Placement, timings and directions are the settings above.
- **The session ID:** the mark is drawn from the session ID, which is already two colours (`src/lib/savedReflection.ts`): the visitor's own pair from Sight or Sound or the coach's picker, or a random shadow pair. The palette is those two colours and two between them, each kept at least 3:1 against the page. The gold e and the white e are always the mark; the two extra e's rest upright or upside down, and take their colours, from the ID, so two sessions with the same colours can still differ.
- **The fidget:** pointing at the mark starts 16 half turns, one randomly chosen e at a time, in colours from the palette; it keeps going while the pointer stays; a tap plays one run; Escape stops it; a keyboard user gets a "Play the mark" button (visible on focus) that also stops it. With reduced motion it does not turn or fidget and shows only its resting state.
- **Decided against (owner, 2026-11-17):** adding the shadow ID or the mark to signed transcripts. A transcript's `session` record is always the pair the person picked in the coach, so the shadow ID never appears in one; transcripts stay as they are.
- **Not done:** the weave and flips are editor options only; the mark appears only where the footer does.

## Animation restored, and the turn fixed (owner, 2026-11-18)
The owner removed the animation ("messy and ugly on small text") and then asked why the calibrated animation behaved differently in the footer than in the editor: the Manrope e should turn in place and move only very slightly so that it lines up exactly with the other e and forms a theta, not swing off to the upper right. The animation is back (the single turn when first seen, the fidget when pointed at, the play button, reduced motion shows only the resting mark), with these fixes:
- **The editor's pivot was wrong in x.** `centreOnInk` (in the editor, `nenya-name-forms.html`, and in the site) turned each e about `(right - left) / 2 + left` of its ink instead of `(right - left) / 2`: one left-side bearing too far left (Manrope 0.040 em, Cormorant italic 0.022 em). A half turn about a point left of the middle pulls the e left by twice that, and the owner's sideways nudge was cancelling it by eye (Manrope 0.085 - 2 x 0.040 = 0.005 em). The settings are now written as the NET placement (`MARK_SETTINGS`: Manrope nudge 0.005, Cormorant nudge -0.074; raise and space after unchanged), so the e lands exactly where the editor showed it.
- **The baseline came from canvas font metrics**, which a browser can round or report differently from the layout engine (and a browser that did not report them left the e turning about the middle of its box, a tenth of an em too high, which swings it up and to the right). The pivot now uses the layout engine's own baseline (a hidden probe with a zero-size marker on it) and the glyph's outline (canvas, at a large reference size, scaled), and a measured fallback per face (`FALLBACK_PIVOT_EM`) if the glyph cannot be measured.
- **Measured when the real font is loaded** (`document.fonts.load` for this e, not only `fonts.ready`) and **again whenever the size changes** (`ResizeObserver`: the page's text size, the breakpoint root sizes and zoom all change it), so the pivot cannot go stale.
- **No jump at the start:** the gold e waits upright, in the page ink, until its first turn, and the pose holds through the delay (`fill: both`); before, it showed turned, then snapped upright and turned again.
**Verified (2026-11-18)**, the real component and the app's own CSS and fonts on a test page, in Chrome and Firefox: the pivot equals the middle of the ink with 0.000 px error at 12.25, 14, 20, 30 and 56 px, and after a size change; the gold e's ink centre never strays more than 0.021 em from the white e's during the whole turn and rests at (0.005 em, 0.020 em above), the same at 14 px and 56 px; the fidget (all e's, 4.5 s) never strays more than 0.021 em; no frame jump; the animation ends and leaves nothing running; with reduced motion nothing animates and the gold e rests turned; with the canvas unavailable the fallback pivot is within 0.02 em. Rendered pixels (device scale 4): the gold e's ink box centre is within 0.45 px at 14 px, 0.35 px at 56 px (Manrope) and 0.11 px (Cormorant) of the expected placement. Not tested: Safari (it cannot be automated here); it needs only canvas `actualBoundingBox*`, `ResizeObserver`, `IntersectionObserver` and Web Animations, all long supported.
