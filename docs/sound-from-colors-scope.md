# Scope: longer melodies from a whole palette (Sight to Sound)

Status: scoping only; the Sight side that feeds it is built. Written 2026-11-09 from the owner's idea: pass the palettes made in the Sight gateway through to the Sound gateway so a melody can be longer than six notes. "With 2 main colors and the 5 palette colors each, that's 12 colors, or a 36 tone melody."

## How it works today (`src/lib/audio.ts`, `SoundGatewayPage.tsx`)
- A color becomes three notes: its red, green and blue values are each mapped to a position on the chosen scale (`hexToMelodyIndices`). Two colors (current, wish) make a six-note melody (`colorsToMelody`), and `melodyToColors` turns six notes back into two colors for the report's gradient.
- The Sound page offers six slots, playback, a scale choice (Western, other tonal systems), and an optional description of timbre, rhythm and texture. If colors were chosen in Sight, the melody is already waiting ("connected"); it can be kept, adjusted, or disconnected.

## What the Sight gateway now provides
Up to two kept palettes (`generatedPalettes`: five colors each, each with a color name), each with a choice "Use this palette in the Sound gateway" (`useInSound`). With the two main colors, that is up to 12 colors, which at three notes a color is **36 notes**: it fits the existing mapping exactly.

## The shape of it
1. **Order.** The melody should tell the story the gateway already tells, from where you are to where you wish to be. Options: (a) current, then palette 1 (made around it), then wish, then palette 2; (b) current, wish, then each palette; (c) the person drags the colors into the order they want. Recommend (a) as the default, with (c) as an adjustment.
2. **Which palettes.** Only palettes marked "use in Sound". With none marked, the gateway behaves exactly as today. The melody length is 6, 21, or 36 notes.
3. **Why it can be more than a list of notes.** Three notes per color gives each color a short phrase; the phrases join into a longer line. The person can keep it whole, play one phrase at a time, or remove phrases they do not like. The bridge palette (current to wish) already moves through color space, so its notes move through pitch space: a melody that travels.
4. **Playback.** 36 notes at the current pace is long (about 20 to 40 seconds). Offer a speed control, pause, and play-from-here; highlight the playing note; announce the phrase in text for screen-reader users (the phrase's color name and note names) so the melody is available without hearing it.
5. **Editing.** Six slots become a grid grouped by color (three notes under each color's swatch and name). Changing a note changes the color it came from, as today (`melodyToColors`), now per phrase.
6. **Report and PDF.** Today's melody contour chart handles six notes; for 36 it needs a wider chart grouped by phrase, the note names in text, and the scale. The coach summary lists the phrases by color name and note names, not by audio.
7. **Limits.** A cap at 36 notes. A lower cap on devices where long playback is a problem is the person's speed choice, not ours.

## Decisions for the owner
1. The default order (a) and whether the person can reorder.
2. Whether one palette alone is allowed (21 notes) and whether the two main colors can be left out.
3. Whether each phrase can be muted or removed.
4. How the Sound gateway's description step changes for a long melody (a sentence per phrase is too much; one for the whole).
5. Whether to offer the melody as a short audio file for download (Web Audio recording): the report currently carries only text and a chart.

## Accessibility and care
- Never rely on hearing: the report carries the note names and a plain description (rising, falling, steady) of each phrase. Never rely on sight: the swatches carry names and plain descriptions (already built for palettes).
- Loud or long sounds can be hard for some people: start soft, offer a stop that works from the keyboard at any point, and never autoplay.

## Not verified
- How a 36-note melody sounds and whether it is pleasant (it needs listening); the audio code with long sequences on phones; any change needed to the scales for 36 notes.
