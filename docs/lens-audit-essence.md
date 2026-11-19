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

## 4. Direction chosen: a deck of thematic questions (owner, 2026-11-17)
The owner does not want drawn imagery. The lens becomes a **deck of simple thematic question cards**, with open-access artwork on the cards, as accessible as possible.

**The deck.** A person draws a card (a shuffle, or by theme: Memory, Comfort, Tension, Wish, Place), reads one short question, answers it in any way that works for them, and can **draw another, keep this one, or pass**. Nothing is timed; there is no scoring; "pass" is always fine. The deck is drawn for **now** and again for **how you would like it to feel**.

**A card.** The question is the heading and carries the card; the picture is beside or above it, never behind the words (so contrast never depends on the art). The answer is any of: a few words (free text), tapping words from the existing described lists (taste, scent), or nothing. A short **strength** control ("how strong is it in your mind?") adjusts the picture's treatment: faint is pale and soft, strong is rich and sharp, with a text twin ("faint", "strong") and no animation under reduced motion. So the art is also the live feedback.

**Scent and taste.** Each question is marked scent or taste (some either). The person can ask for "scent cards", "taste cards" or both. A switch, **"I can't smell or taste right now: imagine instead"**, rewrites every question as "Imagine..." and says it is fine.

**Artwork, from the Met's open access collection.** The Metropolitan Museum's Open Access images are CC0 (public domain) and the API is free and keyless. This site loads nothing from outside (`img-src 'self'`), so images are **downloaded once, curated, resized (about 30 to 40 KB each as WebP) and served from the site**, one at a time as a card is shown; nothing is called live. Rules for choosing and using them:
- A **person reviews every image** before it goes in. The API's keyword search is noisy (a search for "tea" returns tea caddies; "market" returns a fish market), so the owner picks from a candidate sheet (titles, dates, links to the Met page; no images downloaded until approved).
- Avoid anything that could hurt: graphic violence, nudity, colonial-trophy or religious-object contexts, people in distress, and anything that foregrounds eating, dieting or bodies. Prefer still life without carcasses, gardens, plants, bowls and cups, textiles, seashores, rain and weather, rooms and windows.
- **Alt text is ours**, written for each image (the Met gives titles, not descriptions); a plain line says what is in it. "Show no picture" is a setting (and the default under reduced data or Save-Data).
- Credit "The Metropolitan Museum of Art, public domain" on the card and in `ATTRIBUTIONS.md`, though CC0 does not require it. Check each object's own **isPublicDomain** flag, not the collection's.
- The first visit does not grow: pictures load only when a card is drawn.

**The questions.** The owner writes the final deck. A first draft of 25 (about grade 5), five a theme (S scent, T taste):
- *Memory:* What smell brings back a memory? (S) · What did the kitchen smell like when you were small? (S) · What taste do you remember from a happy day? (T) · What did the sea, or rain, smell like the first time? (S) · Which smell takes you straight to someone? (S)
- *Comfort:* Describe your ideal meal. (T) · What smell makes you slow down? (S) · What would you like to be sipping right now? (T) · What is the coziest smell you know? (S) · What taste feels like a warm blanket? (T)
- *Tension:* If this feeling were a smell, what would it be? (S) · What smell makes your shoulders rise? (S) · What taste is stuck in your mouth today? (T) · What smell do you want to get away from? (S) · What would be too much right now? (S/T)
- *Wish:* What scent or taste would you like to be near? (S/T) · What would you like the air to smell like where you are going? (S) · What would you like to taste first when this passes? (T) · Which smell feels like a fresh start? (S) · What taste feels like enough? (T)
- *Place:* What smell is your favorite place? (S) · What does your favorite season smell like? (S) · What does the outdoors smell like for you? (S) · Which room at home smells best? (S) · What does a good morning smell like? (S/T)
Questions about food are asked as tastes and memories, never as what a person eats, and none asks about hunger, weight, diet or allergies.

**Card plan** (each state is its own draw; the cards are the lens):
1. **Draw a card for how it feels now** (theme or shuffle; answer, strength, keep or draw another).
2. **Draw a card for how you would like it to feel.**
3. **Add this to my report / Put this down** (the answers, with their words and strengths).

**The same deck for other lenses (owner, 2026-11-17: yes for Movement and Pattern, the lens formerly called Insight).** The deck is a component, with two views: **laid out** (all the cards visible) or **drawn from** (one at a time). See `docs/lens-rewrite-scope.md`, section 3-ter.

**Direction chosen, later 2026-11-17: Essence is "the flavor of life you have and/or want".** The owner's framing replaces the deck as the heart of the lens: one question asked twice, **what is the flavor of the life you have, and the one you want?** A person describes it the way a taster describes a drink. Wireframe: `docs/wireframes/lens/essence.html`.
- **Card 1, now:** five taste dials (sweet, sour, salty, bitter, umami, each from none to very strong) draw a five-pointed shape of the person's answers, with the same thing in words.
- **Card 2, notes and what lingers:** up to three notes from the existing scent and flavor words, one feel in the mouth, one thing that lingers; the page composes a **tasting note** ("Mostly sweet and bitter, with notes of citrus, creamy, and a sweetness that lingers").
- **Card 3, the life you want:** the dials again, drawn as a second shape over the first (now dashed, wish solid), with a line on the difference ("more sweet, less bitter"). No judgement: nothing says which is better.
- **Card 4, add to my report:** the two tasting sentences, an optional edit, add or put down.
**Safe by design:** it is a metaphor, so nothing is tasted or eaten; an "I can't taste or smell right now: imagine instead" switch is on the first card; no food, diet, hunger or body language; every dial can stay at none. **No artwork needed**: the shape is a chart of answers, not an illustration, and the words are the existing described lists, so nothing new is drawn or translated. **The Met pictures are not needed** (the candidate sheet stays in the private folder in case a later use appears; nothing was downloaded into the project). The question deck survives at most as a small "need an idea?" help of a few prompts. The texture landscape belongs to Touch.
**Three starting points (owner, 2026-11-17):** the lens opens with "Where would you like to start?" and three choices that all lead to the same two shapes and the same tasting note: **a memory** (begin with a time that tasted good, which often becomes the flavor you want, then now), **a mood** (now, then the flavor you want), and **a small thing to try** (begin with the flavor you want, then now, and end with one small thing that would bring a little of it into today). The choice sets the first question and the order; it can be changed later; the small thing to try is offered on the last card for everyone.
Open: more dials ("spicy heat" and "richness")? Which words appear as notes (draft: eight)? Is the tasting note editable on the last card (draft: yes)?

## 5. Questions for the owner
1. The five themes (Memory, Comfort, Tension, Wish, Place): right, or others (for example Season, Shared meals)?
2. Write the deck yourself from the draft: which of the 25 stay, which go, what is missing?
3. Free text, word chips, or both on each card? (Both, with each optional, is the draft.)
4. May I build a **candidate sheet** from the Met's open access API (metadata and links only, no images downloaded) for the owner to pick from?
5. Strength as a picture treatment (pale and soft to rich and sharp): right, or something else?
6. Try the deck idea on the other lenses after Essence?
