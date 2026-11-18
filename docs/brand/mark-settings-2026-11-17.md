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

## To settle before building it into the site (nothing here is decided)
1. **Reduced motion:** with a request for reduced motion the mark should show its resting state and not fidget. Both would need to hold still.
2. **Keyboard and touch:** pointing starts the fidget; a tap does on touch. A keyboard user needs a way to start it (focus or a press) and a way to stop it (WCAG 2.2.2).
3. **Colours:** Cormorant's list has `#ffffff` twice, which disappears on a light page; "colour any" is kept readable at 3:1, but listed colours are used as given. Palette 1 colours are kept readable the same way.
4. **Where the mark shows:** today only in the footer, behind `VITE_NAME_MARK=on`.
