# Essence: audit and directions (draft for the owner, 2026-11-17)

**Status:** the third lens-by-lens pass (method: `docs/lens-rebuild-audit.md`). Read from `EssenceGatewayPage.tsx` (337 lines), `WordPicker.tsx`, `lib/senseWords.ts`. No wireframe yet: the owner is least settled on this lens, so this note offers directions to choose from first.

## 1. Essence, as it is
**Flow:** three instruction cards, then one selection screen with two stages shown one at a time (present, then wish).
**On the screen, per state:** **Taste** (optional): a `WordPicker` of described words in four groups (Basic tastes: sweet, sour, salty, bitter, umami; Between tastes; Feelings in the mouth; Flavor families); **Scent** (optional): a `WordPicker` of grouped scent words (flowers, and the rest of the scent families); an **Intensity** slider (Faint to Overwhelming); a free-text box ("What aromas or flavors come to mind?"). Every word has a plain description for its "i" button ("like dark chocolate or burnt sugar").
**Stores per state:** chosen tastes and scents (plus "other" words), intensity, a description.
**The trouble, in the code's terms:** it is all word-picking. Nothing is shown, nothing moves, the slider changes a number, and taste and scent share one screen, so a person with no picture to hold has a list of words to scan.

## 2. What the lens has to get right
- **Some people cannot smell or taste right now** (a cold, an illness, long-term loss), and some have complicated relationships with food. The lens must work from **imagination and memory**, say so, and offer "I can't smell or taste right now: imagine instead". It never asks what a person eats, never uses calorie, diet, good-or-bad food language, and never asks about allergies.
- **Scent and taste are different** (smell is tied to memory and place; taste to the mouth and to sharing), even though one lens holds both.
- **No photographs for the identity** (the lens brief), and photographs of scents and flavors would be heavy, culturally narrow, and hard to describe in words. Drawn or simple icon imagery is the aim.
- **Everything optional; nothing timed; a text twin for anything shown or heard** (the lens rules).

## 3. Three directions
**A. Prompts (memory-led).** One short question at a time, with a free-text box and optional word chips from the existing lists. They draw a picture without needing one on screen. Draft prompts (about grade 5; the owner's two are first):
- "What scent brings back a memory?"
- "Describe your ideal meal." (or "…the meal you would like to be sitting down to")
- "If this feeling were a smell, what would it be?"
- "What does home smell like when you are at ease?"
- "What taste do you reach for when you are worn out?"
- "What smell makes your shoulders rise?"
- "What scent or taste would you like to be near?"
*For:* fun, personal, strong imagery, easy to build, works without smell. *Against:* more writing, which is hard for people who are post-verbal or find words difficult; mitigated by chips and by every prompt being skippable. Free text is the one place a person might type a name or a place: it stays on the device, and is scrubbed if it is ever shared (the existing rule).

**B. A drawn kit (visual vocabulary).** Scents and tastes shown as simple drawn symbols: scent families as small pictograms (a flower, a citrus slice, a leaf, a log, a wisp of smoke, a wave, a spice) and the five basic tastes as five shapes; the intensity slider drives a **live drawing**: aroma wisps that thicken and drift, or concentric ripples whose size and color follow what was picked, with a text twin ("a strong, sweet, smoky scent"). Material Symbols has some of these (a flower, a leaf, waves, fire, a cup, a restaurant); the rest would be drawn in the lens style. *For:* nothing to type, charming and visible, accessible by text twin. *Against:* illustration work, and abstract drawings can feel generic.

**C. A pantry (build something).** Fill jars, a bowl or a plate with ingredient tiles; how full is the intensity. *For:* playful. *Against:* the most food-centred, so the one most likely to touch food sensitivities; the most clutter; the most culturally specific. **Not recommended** as the default.

## 4. Recommendation (a combination of A and B, in cards)
Scent and taste become **separate cards inside the one lens**, with the pair (now | wish) on each card as in Sight:
1. **A prompt** (choose one of three drafts, or skip): free text plus a few chips.
2. **Scents** as drawn families, each opening its described words; "I can't smell right now: imagine instead" is always there.
3. **Tastes**: the five basic tastes as shapes, and the mouth-feelings words below them.
4. **How strong?** The slider drives the live aroma drawing, tinted by the words picked (or the session colors if there are none), with a text twin.
5. **Add this to my report / Put this down.**
Five cards is the most of any lens, but each is one small task and the first can be skipped; the person can also use only the scent or only the taste card.

## 5. Questions for the owner
1. Which direction: A, B, a mix (recommended), or C?
2. Write the prompts yourself? The draft list above is a start; the right questions matter most here.
3. One lens with scent and taste on separate cards (recommended), or split into two lenses (which would make seven in the tray, against the decided six)?
4. How much drawn imagery is realistic: Material icons only for the first rebuild, or commission or draw the pictograms?
5. Is the "I can't smell or taste right now: imagine instead" line right, and should it appear on every card?
