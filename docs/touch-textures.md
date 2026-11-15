# The Touch gateway's surfaces

Built 2026-11-09 from the texture review (ambientCG and Poly Haven, both CC0). Files: `src/lib/touchTextures.ts` (helpers), `src/lib/touchTexturesData.ts` (the 283 surfaces, generated), `src/app/components/TextureChooser.tsx` (the picker), `TouchSurfaceField.tsx` (the part of each state card), `public/touch-textures/` (256 px JPEGs, about 17 KB each, 4.9 MB in all, loaded only when the picker is opened and as they scroll into view).

## How it works
- Each state card (Present, Wish) has an optional "Surface from pictures". Choosing opens a dialog with the surfaces as a **list** (grid) or a **carousel**, in order **smooth to rough** or **by kind**, filtered by kind (soft and woven, leather and skin-like, plant and wood, stone, earth and cold) and by measured feel. "Start near my Texture slider" jumps to the surface whose place in the smooth-to-rough order matches the slider.
- Choosing a surface never moves a slider. "Set the Texture slider to match" is a separate button. The slider and the picture are two ways to answer, and the person's words stay theirs.
- The choice is saved as `currentSurface` / `potentialSurface` (an id). The report text, the coach hand-off and the PDF carry it as one line: the surface's title, kind, measured feel and source. Nothing in the picture itself is sent anywhere.
- Every picture ships with the site (no request to ambientCG or Poly Haven when the page is used).

## The measured feel
For 217 of the 220 ambientCG surfaces, the average steepness of the surface was read from each one's published normal map (the centre 512 px of the full-size map, mean of the length of the horizontal and vertical slope). It runs from 0 (flat) to about 0.7. Labels: under 0.03 flat or very smooth; under 0.15 smooth; under 0.30 lightly textured; under 0.45 textured; otherwise rough. The place on the Texture slider is the surface's place in the order of the measured surfaces (0 rough to 100 smooth); it is not a unit of anything.
- **Measures bumpiness only.** It says nothing about softness, warmth, weight or comfort: velvet and a coarse weave can score alike.
- 3 ambientCG surfaces could not be measured (their maps did not download) and the 63 Poly Haven surfaces were not measured (their maps are far larger); they show "not measured" and are left out of "smooth to rough".
- The cutoffs are ours and can move. Not checked: how it feels to people, and whether it matches what blind and low-vision users expect from the words.

## Accessibility (first pass, not tested with people)
- Each surface is a radio button with a roving tab stop (arrow keys, Home and End); the carousel has Previous and Next buttons as well.
- Every picture has a plain description for a screen reader, built from facts we know: its title, kind, average color in words and measured feel. These are first drafts for the owner to review, and alt text for photographs of a surface can only say so much.
- Skipping the pictures costs nothing: the sliders and the description box are unchanged.
- To test (see `docs/accessibility-testing-list.md`): screen reader and keyboard use of the dialog, 283 items in a list, carousel with switch access, reduced motion, 200 to 400 percent zoom.

## Not done, and ideas
- The picker's choice is not yet in the Touch part of the PDF as a picture (only the line).
- No hand-written alt text; the owner reviews alt text.
- A credits page listing every surface (the data file has the source, credit and link for each).
- Fewer, curated surfaces: 283 is a lot. The picker's filters help; a smaller default set is possible if it overwhelms people.
