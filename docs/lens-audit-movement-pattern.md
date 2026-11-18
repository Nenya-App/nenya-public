# Movement and Pattern: audit and card plan (draft for the owner, 2026-11-17)

**Status:** the fourth and fifth lens-by-lens pass, done together because the two pages are almost the same (owner, 2026-11-17: "largely matching already"). Pattern is the lens formerly called Insight. Read from `MovementGatewayPage.tsx` (406 lines), `InsightGatewayPage.tsx` (407), `lib/gatewayShapes.ts`, `lib/senseWords.ts`, `DrawingCanvas.tsx`. No wireframe yet.

## 1. The two pages, side by side (measured)
| | Movement | Pattern (was Insight) |
|---|---|---|
| Instruction cards | 3 (flow, two states, optional) | 3 (organizing understanding, two states, optional) |
| **Drawn shapes** to choose from | 24 (`ShapePicker`, set `movement`) | 24 (set `pattern`) |
| First word list | Direction (upward, downward, inward, outward, expansive, contracting, spiraling, oscillating, flowing, stuck, still) | Pattern (fragmented, linear, branching, circular, layered, web-like, crystalline, fractal, spiraling, chaotic, unified) |
| Slider 1 | Energy (depleted to surging) | Clarity (foggy to crystal clear) |
| Slider 2 | Speed (glacial to frenetic) | Depth (surface to profound) |
| Second word list | Quality (fluid, jerky, graceful, forceful, hesitant, determined, gentle, turbulent) | Perspective (narrow, focused, panoramic, microscopic, telescopic, multi-faceted, bird's eye, immersed) |
| Also | free text, a drawing pad (`DrawingCanvas`), the shared body map | the same |
Each state (present, then wish) holds its own copy of all of it. Every shape already has a **plain one-sentence description** (what a screen reader says) and **words it might go with**; the descriptions describe the drawing, never a feeling.

## 2. What is already good, and what is missing
- **The shape pickers are already decks.** Twenty-four drawn cards per lens, each with a name, a description and related words. They need no new artwork, and they answer the owner's wish for decks that can be **laid out** (all 24 visible) or **drawn from** (one at a time). This is the same deck component as Essence once planned, with existing content.
- **The sliders and the word lists describe; they do not do.** Energy, speed, clarity and depth change a number. The direction, quality, pattern and perspective words are only recorded.
- **Too much on one screen:** shapes, two word lists, two sliders, free text and a drawing pad, twice (present and wish).

## 3. Card plan (one template for both lenses; draft)
1. **Pick a shape for now** (the deck: laid out or drawn from; choose as many as fit, no maximum).
2. **Shape it** (optional). The chosen shape comes alive and the controls act on it, with a text twin:
   - **Movement:** *Direction* words set which way it moves (upward, downward, inward, outward, spiraling, oscillating...); *Speed* sets how fast; *Energy* sets how big and bright the motion is; *Quality* words set the feel (fluid, jerky, gentle, forceful...). Under reduced motion it becomes a still with motion trails, so the change still reads. Optional vibration, as in Touch: speed sets the rhythm of the pulses.
   - **Pattern:** *Pattern* words choose how the shape repeats (branching, layered, circular...); *Clarity* sets how sharp or foggy it is; *Depth* sets how many layers show and how far it zooms; *Perspective* words set the framing (narrow, panoramic, telescopic, microscopic...).
3. **Pick a shape for the life you want** (the same deck), then **shape it** (the same controls), with the first shape still in view for comparison.
4. **A drawing** (optional): the existing pad, kept as an optional activity (pointer or touch only, with the words as the full alternative).
5. **Add this to my report / Put this down**, with an optional free-text line.
The body map is the one shared map (decided), reached from the tray, not from these lenses.

### 3a. What stays on the card and what is tucked into "More descriptions" (owner asked 2026-11-17; draft)
One rule for every lens: **one shape (or one main choice) and two sliders up front, plus one "More descriptions" disclosure.** Anything inside it is optional; skipping it never blocks "Add this to my report". The disclosure is a real button with an expanded/collapsed state, closed by default, and its contents are in the report's text either way.
| Lens | On the card | Tucked into "More descriptions" |
|---|---|---|
| Movement | shape, Direction words (they set which way it moves), Speed, Energy | Quality words (fluid, jerky, gentle, forceful...), free-text line, vibration opt-in |
| Pattern | shape, Pattern words (they set how it repeats), Clarity, Depth | Perspective words (narrow, panoramic, telescopic...), free-text line, tapestry activity |
| Sound (already) | make a melody | "hear it your way": pitch, volume, speed, timbre, the four feels |
| Touch | surface cards, the orb's five sliders | vibration opt-in, landscape "Shape one part" |
| Essence | main dials and radar | any extra dials, if the owner wants more |
Option for Direction and Pattern words: one "which way" / "how it repeats" picker on the card, with the full eleven words under the disclosure.

## 4. Optional activities in the same spirit as Touch's landscape (proposals)
- **Pattern: weave a tapestry.** Layer as many pattern shapes as you like (a base, then each one above it, no maximum) and shape each; the result is a small woven design, with a text line ("base: layered, middle: branching...").
- **Movement: draw a path of motion.** Draw a line with the pad and the chosen quality; the path replays as a moving trail. Pointer only, with the words as the alternative.
Both are optional and skippable; neither is needed to add the lens.

## 5. Questions for the owner
1. One template for both lenses (recommended: half the work, one set of tests), or let them differ?
2. Shape it: are those mappings right (direction words set the direction of the motion; clarity sets the sharpness; depth sets the layers)?
3. ~~Choose up to how many shapes per state?~~ Decided (owner, 2026-11-17): no maximum. The text twin and the report list every shape chosen; the preview layers or tiles them, and the card says how many are chosen.
4. Keep the optional activities (tapestry, path of motion), drop them, or only one?
5. Is the existing drawing pad kept as an optional activity?
6. Vibration for Movement (speed sets the pulse rhythm), yes or no? (Same rules as Touch: off until chosen, only where supported, never the only signal.)
