# The nənya.biz mark: the owner's settings "for now" (2026-11-17)

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

## Animation removed (owner, 2026-11-18)
"The animation looks messy and ugly when used on small sized text, so remove it completely for now." The mark no longer turns on first sight, no longer fidgets, and has no play button or pointer or key handlers. It shows its resting state only: the placement is still exactly the editor's settings above (nudge, rise and space after per face; the gold e in front; each e centred on its own ink so the upside-down e rests where the editor puts it). The timings and the fidget plan stay in `src/lib/nameMark.ts`, unused, so the animation can return. Behind `VITE_NAME_MARK=on`, as before.
