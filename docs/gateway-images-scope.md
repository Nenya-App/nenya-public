# Scope: open-source images, with alt text, for the Touch, Movement, Insight (pattern) and Essence gateways

Status: scoping only. Written 2026-11-09 from the owner's request. These four gateways ask for texture, movement, pattern and aroma or taste in sliders and words. Images could give people something to point at ("this is the texture I mean"), and alt text would make each image usable by people who do not see it.

## What an image would do, and what it must not
- **Offer something to choose, not something to interpret.** A person picks an image that is closest to what they feel; nothing is read into the choice. The same rule as the palettes: starting points, no fixed meaning, not a scientific or medical instrument.
- **Never the only way in.** Every gateway keeps its words and sliders. An image adds a way to answer; leaving it out is fine.
- **Alt text written for the purpose.** Not "photo of rock" but a short description a person can choose by ("rough grey stone, cold and dry to the touch"), plus a longer plain description on request. For essence, the description names the taste or smell it might call to mind, carefully ("like orange peel or a lemon rind"), because for a blind visitor the words are the image.

## Where images could come from (license first)
Only images that can be shipped with the site, shown in a downloadable report and redistributed under the project's own terms, with credit kept. **CC0 (public domain) is the simplest**: no credit is required, though we would give it anyway. Candidates to check, none verified yet:
- **Poly Haven textures** (CC0): surfaces for Touch (stone, fabric, wood, metal, moss).
- **Smithsonian Open Access, The Met, Rijksmuseum, Cleveland Museum of Art** (CC0 collections): textiles, ceramics, patterns for Insight; works of art in motion for Movement (care with cultural and sacred objects).
- **NASA, NOAA and other public-domain science images:** water, weather, structure, for Insight and Movement.
- **Wikimedia Commons and Openverse:** large, with mixed licenses: CC0 and CC BY are usable (CC BY needs credit); CC BY-SA and NC are not suitable. Each image's license is checked individually, not assumed from the site.
- Not suitable: Unsplash, Pexels and Pixabay (their own licenses, not open-source and not meant for bundling as a dataset), anything "free for personal use", AI-generated images (provenance and rights unclear).

## How
1. **Bundle, never hotlink.** Images ship with the site (a few small files, loaded when a gateway opens), so no visitor request goes to a third party and the page works offline. This keeps the privacy story intact: nothing leaves the device.
2. **Small and consistent.** About 12 to 24 images per gateway, each reduced to a small size (a few tens of KB, WebP), with an exact credit and license recorded in a data file (`credits.json`) that also feeds `ATTRIBUTIONS.md`.
3. **The picker.** A grid of images with visible names; a keyboard-reachable listbox; each image announced by its alt text; "none of these" and "describe it in my own words" always available; a larger view for low-vision visitors.
4. **The record.** The chosen image's id and its words go into the report as text ("You chose an image: rough grey stone, cold and dry"); the PDF can include a small thumbnail with the same text beneath it. Nothing from the image is read by software.
5. **Sharing with the coach.** The chosen image's words (not the image) can be shared like any other part of the report.
6. **Alt text and descriptions are authored by hand,** reviewed with a blind or low-vision reader before release, and kept in the data file so they can be translated.

## Per gateway (starting thoughts)
- **Touch:** surfaces: smooth to rough, soft to hard, warm to cool. A set of close-up material textures. Maps to the existing sliders as a suggestion, never an override.
- **Movement:** direction and speed: images of motion without people (water, wind in grass, a flock, smoke), plus simple arrows and curves drawn by us (our own SVG, no license question) with text descriptions.
- **Insight (pattern):** patterns: spirals, grids, branching, ripples, repetition and break. Textiles and natural forms; or our own generated SVG patterns, which we can describe exactly.
- **Essence (aroma and taste):** the hardest to show: foods and plants as photographs, or none and words only. Possibly illustrations of ingredients drawn by us. Care: cultural foods, allergies and disordered eating; no calories or health claims; "this might bring to mind..." wording.

## People and sensitivity
- **No identifiable people** in any image, and no sacred or restricted cultural objects without the community's agreement. Museum open-access does not guarantee cultural permission.
- **Nothing graphic, nothing that could be a trigger by itself** (wounds, animals in distress, faces in pain).
- **Plain choices:** an image set that includes only one cultural tradition would narrow who feels addressed; the set is checked for range.

## Alternative that avoids all of the license work
Draw our own: simple SVG textures and patterns generated in code, each described exactly because we made it. No license, no downloads, tiny files, exact alt text. The cost is that they look designed rather than real. Recommend starting here for Movement and Insight, and using CC0 photographs only for Touch and Essence.

## Decisions (owner, 2026-11-09)
1. **Own SVGs first for Movement and Insight; CC0 photographs for Touch and Essence.**
2. **Essence gets images.** The test is universality: if a set of images cannot be found that reads across cultures and tastes, that is a reason to drop it, not to force it.
3. **The owner reviews alt text at first.** A running list of disability testing that needs doing is kept in `docs/accessibility-testing-list.md`.
4. **A credits page** (every image's source, license and credit, fed from the data file that also feeds `ATTRIBUTIONS.md`).
5. **Write to the collection chosen,** invite them to see their images on the site (a draft goes in the private correspondence folder once the source is picked; the owner is sourcing images now).
6. Still open: PDF thumbnail or words only.

## Order of work
Pick the sets and license-check each image; write the alt text and the data file; build the picker (one gateway first, Touch); tests (every image has alt text, a license and a credit; the picker is keyboard-reachable); Terms, Privacy Promise and attributions (no new data flow, so only the credits); then the other gateways.

## Not verified
- Every license above was named from general knowledge and must be read on the page of each image before use; sizes and quality; whether any collection restricts redistribution inside a downloadable report.
