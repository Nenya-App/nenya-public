# Sight and Sound: audit and card plan (draft for the owner, 2026-11-17)

**Status:** the first lens-by-lens pass (method: `docs/lens-rebuild-audit.md`). Read from `SightGatewayPage.tsx` (549 lines), `SoundGatewayPage.tsx` (822 lines), `GatewayStages.tsx`, `lib/melodyPlayer.ts`, `lib/audio.ts`. Correction to an earlier note: each lens has **three** instruction cards, not nine.

## 1. Sight, as it is
**Flow:** three instruction cards ("Welcome to the Sight Gateway", "Two Colors, Two States", "Everything is Optional"), then one selection screen with two stages shown one at a time (`PairStage`: **present**, then **wish**), the body map on the wish stage, then Next (`onComplete`).
**On the screen:** *Surprise Me* (random colours); *Start from my melody's colors* (if a melody exists); per stage a colour card with a colour picker (the sixteen palettes and the 96 colours, `ValarColorPicker`), a name field with suggestions (`ColorNameSuggest`), a set of **quality** chips, and an **Intensity** slider (Faint to Strong, 0 to 100, with an unset state); an optional **palette** made on the device or from The Color API; the body map.
**What it stores:** `color1`, `color2`, their names (or "random"), qualities, intensities, `generatedPalettes`, gradient direction.
**What does not respond:** the Intensity slider changes a number and nothing else. It should change what you see.

## 2. Sound, as it is
**Flow:** three instruction cards, then **melody**, then **qualitative** (describe what you made, once for the present state and once for the wish state).
**Melody:** a six-note melody (three notes for the present state, three for the wish), from your Sight colours when you have them (`colorsToMelody` / `melodyToColors`) or composed from silence; six **tonal systems** (Western, maqam Rast, Slendro, Bhairav, Miyako-bushi, blues); a **long mode** (one phrase per colour and per palette marked for sound); play, stop, undo, clear, randomize, save as a WAV file made on the device; five **timbres** (soft, pure, bell, pluck, bowl); speed (`stepSeconds`) and volume.
**Qualitative step:** for each state a **pitch** slider and a **volume** slider (both unset by default), timbre chips, rhythm chips, free text. **None of it is heard**: the sliders and chips are recorded and described in the report; they do not change the melody.
**Link to Sight:** Sound can start from Sight's colours and Sight from Sound's (`melodyShared`, "bring to Sight"); either can come first.

## 3. What is wrong for the rebuild (from the code; to confirm by testing)
- Too much on one screen in Sight (two colour cards, names, qualities, sliders, palettes and the body map in one page); Sound's melody screen carries the composer, the tonal system, long mode, timbre, speed, volume, play, undo, save.
- Sliders and chips that **describe** instead of **do**.
- Colour cards are `div role="button"` elements: confirm keyboard behaviour and the spoken name of each (the page labels them "Choose the current state color. It is now #...").
- "Current" and "wish" are the code's words; the page words are Current and Wish. The plain-language words in the cards will be set with the copy pass.
- Instruction cards say things the first real card could say (colours are optional; two states).

## 4. Card plan: Sight (draft)
1. **Pick your colours.** Two small swatches (where I am, where I wish to be), the picker, "Surprise me", "Start from my melody" if there is one. Each swatch has its name spoken and shown. *Live:* the page's accents take the two colours.
2. **Pick a palette** (optional). The sixteen palettes as starting points; choose one or none; the colours can come from it. (The owner's example: colours, then palette.)
3. **Say how strong each is.** The Intensity slider, now **alive**: it changes the swatch (saturation or lightness, the size of its glow) as you move it, with a text value ("quite strong"), and an unset state so skipping is a choice. Names and quality chips sit here as optional extras, one short group at a time.
4. **Body map** (optional). The existing map, on its own card.
5. **Add this to my report / Put this down.**

## 5. Card plan: Sound (draft)
1. **Make a melody.** Six slots, from your colours if you have them or from silence; play; the tonal system as one choice ("which scale?") with a short hear-it for each, not six buttons at once.
2. **Hear it your way** (the owner's third step). The sliders **bend the melody you made**, live: *pitch* moves it up or down (a transposition), *volume* sets the loudness, *speed* sets the tempo; the timbre chips change the instrument; the rhythm chips change the feel (steady, flowing, short and separate). A **play** button on the card; a text line says what each setting is ("lower, softer, slower"). Present and wish are shaped separately, so you can hear the two states differ.
3. **Say anything more** (optional): the free-text description.
4. **Add this to my report / Put this down.** The WAV file stays an option on the report page.
**New in the player:** transposition (pitch) and a rhythm option are not in `playSequence` today (it takes step length, volume and a timbre); both are small additions in `melodyPlayer.ts`, with tests.

## 6. The shared piece, with a free tray
Whichever of Sight and Sound is picked up first, its two colours (or melody) are offered to the other: "Start from my melody's colors" and "bring to Sight" become offers on the second lens, never requirements. With no colours yet, each lens starts from a default pair. The session colours (the save ID) form from the colours **added to the report** in Sight or Sound, not from anything merely tried.

## 7. Decisions (owner, 2026-11-17: "go with these") and the wireframes
Decided: names stay as an optional field, quality chips tucked under "More words"; the strength slider sits on the swatch (colours with strength, then palette, then body map, then add: four cards); pitch is a transposition (about an octave each way, a plain-word range); four named feels (steady, flowing, light and separate, swaying); playfulness limited to small responses (a still "added" state, no points, streaks or badges); the long melody on its own optional card, shown only when it can be made. **Wireframes:** `docs/wireframes/lens/` (Sight and Sound, plain HTML, tested by `tests/wireframes.test.mts`).

## 8. Questions that remain
(The list below is the original set; the decisions above answer questions 1 to 6. New questions are in the wireframe notes.)
1. Sight: keep names and quality chips (an optional extra on the strength card), or drop them for the first rebuild?
2. Sight: palette before or after strength? (Draft: palette first, then strength.)
3. Sound: is "pitch" a transposition up and down (draft), or the register of a note?
4. Sound: which rhythm feels are right (steady, flowing, short and separate, ...)? The chips today are free choices; they need named, audible versions.
5. How playful: a small response to touch (the swatch breathes, the melody answers) is in; anything that scores, streaks or rewards returning is out. Confirm.
6. The long mode (one phrase per colour and palette): keep on the first card behind "more", or move to its own card?
