# The nənya.biz mark: the owner's settings "for now" (2026-11-17)

Copied from the editor (`Nenya Marketing/press-kit/nenya-name-forms.html`, "Copy settings"). **Not yet wired into the site**: the site still uses the placement in `src/lib/nameMark.ts` and the single turn in `src/app/components/NenyaMark.tsx`. These are design choices to build from, not a record of what is live.

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
   - **What the shadow ID is and where it lives:** random, per session, held only in the tab (the site stores nothing); whether it appears in a signed transcript's `session` record next to `color1`/`color2` (it would let a transcript be matched to the mark it was made under, and to nothing else); how it is shown (the mark alone, or also as a short readable string for people who cannot see it).
   - **It is a recognisable signature, not proof of anything:** letters that overlap hide each other, so far fewer marks are visibly different than are possible; the shadow ID, not the picture, stays the identifier.
4. **Where the mark shows:** today only in the footer, behind `VITE_NAME_MARK=on`.
