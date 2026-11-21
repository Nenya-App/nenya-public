# The lens rebuild: audit and method (draft for the owner, 2026-11-17)

**Status:** scoping. Read from the six pages in `src/app/components/pages/` on 2026-11-17. Companion to `docs/lens-rewrite-scope.md`. The rebuild is not only a rename: each lens becomes a short run of small activity cards that are accessible, charming and fun, and every slider moves something a person can see or hear.

## 1. What exists today (measured)
| Lens | Lines | Sliders | Stages in the code | Takes from other lenses |
|---|---|---|---|---|
| Sight | 549 | 2 ("Intensity", 0 to 100) | instructions, present, potential, selection | `melodyColors`, `melodyShared`, `soundComesLater` (colours chosen in Sound can seed Sight) |
| Sound | 822 | 4 (current and potential pitch, current and potential volume) | instructions, melody, present, potential | `userColors`, `sightComesLater` |
| Touch | 410 | 10 | instructions, present, selection | `userColors` |
| Essence | 337 | 2 | instructions, present, selection | `userColors` |
| Movement | 406 | 4 | instructions, present, selection | `userColors` |
| Insight | 407 | 4 | instructions, present, selection | `userColors` |
All six open with a **carousel of three instruction cards** (`INSTRUCTION_CARDS`, `instructionCardIndex`; an earlier version of this note said nine, which was a miscount), then ask for a *present* state and a *potential* state (the "where you are / where you wish you were" logic the brief keeps), and all six accept the body map (`bodyMapData`, `onUpdateBodyMap`). The sliders are `SnappingSlider` with an "unset" state (`optionalSlider.ts`); a slider that does not drive anything visible or audible is a value that is only described afterwards.

## 2. The dependency question, answered
Sight and Sound share: colours chosen in one can seed the other (`melodyColors`, `melodyShared`, and the "comes later" flags that say which one the person meets first). The other four take the **session colours** (`userColors`) as input, which form from the sight and sound choices. This is a **soft** dependency: with a tray where order is free, every lens must work when no colours exist yet (a default palette), and the first of sight or sound to be used offers its colours to the other. Nothing else depends on another lens.

## 3. The card model (draft)
A lens is an ordered run of cards, each one task, none needing a long read. The order inside a lens is sequential; the order of lenses is free (the tray). Every lens ends with **"Add this to my report"** and **"Put this down"**.
| Card kind | What it is | Today |
|---|---|---|
| Orient | One short instruction, or none | Three instruction cards |
| Present | What is here now | The "present" stage |
| Potential | What you would like | The "potential" stage |
| Shape it | Sliders with **live feedback**: see it or hear it change as you move it, plus a text equivalent | Sliders that are described afterwards |
| Body | The body map (optional) | The body map |
| Add | Add, update or remove from the report | Auto-advance |
Owner's examples: **Sight:** pick your colours, then pick a palette, then the body map. **Sound:** make a melody, then shape it (the sliders bend the melody you made, as a third step), then more to decide in the section. The same method goes through the other four.

## 4. The rules every card follows
One task per card; at most a few short sentences (grade 8 or below, `src/lib/readingLevel.ts`); fully keyboard-operable with a visible focus and a logical order; sound optional, off until asked, with a visual or textual equivalent; every slider has a live preview and a text value, and an "unset" state so choosing nothing is a choice; reduced motion gives a still that still shows the change; no timers; charming and a little playful in motion and sound, never at the cost of calm; nothing here says what a colour, sound or texture "means".

**Fewer can be more helpful (owner, 2026-11-17; every lens).** Every lens opens with one plain instruction: choosing fewer can be more helpful than choosing many. Where a card lets you choose several things (shapes, colors, words, surfaces, layers), the soft limit is **3**. It is a warning, not a block: before the fourth is added, a short notice says that fewer can be more helpful and asks "Add it anyway?" (Add it anyway / Keep three). It is shown once per card per visit, shared by keyboard and pointer, and read out politely to a screen reader. Nobody is ever stopped, and nothing is scored. Tests: each multi-choice card has the instruction, warns at the fourth, and allows going past it.

## 5. Method: one lens at a time
For each lens, in this order, with the owner at each stop:
1. **Audit:** read the page fully; list every control, every instruction card, every piece of data it stores.
2. **Cards:** the card sequence, and for each slider, exactly what it will show or sound.
3. **Wireframe** (plain HTML, tested by keyboard and screen reader).
4. **Copy** (plain, short, grade 8 or below).
5. **Build** behind a switch (`VITE_LENS_CARDS`), with tests and the contrast and reading-level checks.
6. **Owner review** before the next lens.
**Order:** Sight and Sound together (they share colours and a melody), then Touch (already simplified; the model), then Essence, Movement and Insight.
Per-lens state, add/update/remove and the saved-draft version 2 (see the scope, 3a and 3b) are built once for all six, before the first lens is rebuilt, so each lens plugs into them.

## 6. Decisions for the owner before the first lens
1. Confirm the card kinds and the order inside a lens.
2. The first lens to rebuild (recommended: Sight and Sound together).
3. How playful: what "fun" means here (a small toy at the shaping step, a sound that responds, an animation that rewards adding) without becoming a game or an engagement loop.
4. Whether the three-card instruction carousel goes entirely (recommended: fold the one thing each card says into the first real card) or survives as an optional "how this works".
