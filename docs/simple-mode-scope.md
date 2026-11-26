# Scope: three animation levels (Full, Simple, Minimal)

Status: scoping only, nothing built. Written 2026-11-25; updated the same day with the owner's decisions. The note behind it: older devices and busy machines drop frames, so there should be ready-made, much quieter ways to draw the logo.

## The idea in one line
Three levels for how the logo is drawn. **Full** is what exists today and stays the default for devices that can handle it. **Simple** is the middle level. **Minimal** is the bottom level, drawn as flat shapes. At every level the breath keeps its pace and its cue.

## Decisions made (owner, 2026-11-25)
1. **Two lighter levels,** with Minimal first and Simple second. (Read here as: build Minimal first, then Simple.)
2. **A lighter level is offered, never switched on by itself.**
3. **Yes to the "looks choppy" offer.**
4. **Names:** Minimal (bottom), Simple (middle), Full (top, and the default for devices that can handle it).
5. **In Minimal, the gem and as many other parts as realistically can become flat shapes.**

## Why
On 2026-11-25 a recording of the default animation on a Mac dropped frames (a quarter of the frame gaps were 50 ms or longer) while the machine was probably busy with other work. The same page ran at a steady 60 fps on a quiet machine. The animation stacks several layers: soft glows around sixteen orbs, inner lights, the gem with its kaleidoscope, swaying leaves and a turning ring. When graphics are short on time, those layers are the likely thing to slip. Slowing the processor changed nothing, which points to drawing and blending rather than the page's code. Which layer costs most has not been measured.

## What already exists
- **Device tiers** (`src/lib/deviceProfile.ts`): `lite`, `standard`, `capable`. On `lite` the gem is held still at the low setting, the kaleidoscope is off by default, the gem is capped at 8 sides and the preview is smaller. The gem also times its own first frames and steps down if they are slow.
- **Stop motion** (`src/lib/motionStop.ts`): holds the decorative movement while the breath ring keeps its rhythm. It wins over each motion setting without changing them. The device's "reduce motion" request does the same.
- **Individual settings:** Palette Orbit, Breathing Emanation, outer glow style and width, inner lights, leaf sway, kaleidoscope, outer ring movement.

The device tier names (`lite`, `standard`, `capable`) describe the **device**. The new levels (Minimal, Simple, Full) describe the **picture**. Keep the two apart in code and in words.

## The three levels

| Part | Full (default) | Simple | Minimal |
|---|---|---|---|
| Breath ring | As today | As today | A flat circle (one solid colour, hard edge), still growing and fading with the breath |
| Gem | As the visitor chose | Still, kaleidoscope off | A flat polygon, one solid fill, no facets, no live drawing |
| Leaves | As the visitor chose | Still, drawn as today | Flat outlines in one colour: no metal finish, glow or shadow |
| Outer orbs | As the visitor chose | Still (no pulse or turn) | Flat circles in their colours: no shading, glow or movement |
| Outer glow | As the visitor chose | One shared soft glow | None |
| Inner lights | As the visitor chose | Hidden | Hidden |
| Glow swell | As the visitor chose | Off | Off |
| Page background effect behind the logo | As today | Still | A flat background |
| Colour changes | As the visitor chose | Slow fades, as Stop motion keeps them | Held on one colour per breath, with no cross-fade |
| Pace, counter, tones | As the visitor chose | Unchanged | Unchanged |

Notes on the table:
- In Minimal nothing should need WebGL, blur, filters or layered gradients. Flat vector shapes that change only size, position or opacity are the aim.
- The orbs stay in Minimal as flat circles, so the mark is still recognisable. Palette Orbit remains the visitor's own switch.
- The inner lights are blurred light with no useful flat form, so they are hidden rather than flattened.

Like Stop motion, a level **wins over the individual settings without changing them**. Going back to Full returns exactly what the visitor had chosen.

## How a visitor gets a level
1. **Chooses it:** a three-way control at the top of the Breathing Animation panel: Full, Simple, Minimal.
2. **Is offered it on a `lite` device:** one quiet line, for example "This device may find the full picture heavy. Try Minimal?" Nothing changes unless the visitor accepts.
3. **Is offered it when frames drop:** if the page measures a run of slow frames, one quiet line, for example "The animation looks choppy. Try Simple?" Proposed: step down one level at a time (Full to Simple, Simple to Minimal). Once dismissed, it does not come back in that visit.

Full is the default. No level is ever switched on without the visitor choosing it.

The one exception is what already happens today and stays: a device that asks for reduced motion gets Stop motion's behaviour, and a `lite` device keeps its existing lighter gem settings.

## What it must not do
- Never change, stop or hide the pace, the counter or the breath cue. In Minimal the ring is drawn flat but keeps its timing.
- Never claim a benefit. The help line says what it does: "draws the picture with fewer and flatter parts, for older or busy devices".
- Never remove a setting. Controls a level overrides stay visible, greyed with a note, as Stop motion does.
- Never lose contrast: flat shapes keep AAA contrast against their background, in both themes and all vision modes.
- Never store or send frame timings.

## How we would know it works
- On this Mac, count frames over 25 ms in a fixed 400-frame run at each level while the graphics are busy. Minimal should be clearly better than Full under the same load.
- On a real older device or phone, run the same count at each level. **Until that is done, the claim that a level helps is unproven.** The quiet-machine tests on 2026-11-25 were all clean, so they cannot show a difference. An attempt to load the graphics with extra windows did not finish.
- Look at each level by eye, in both themes: the mark should still read as Nenya.

## Build order
1. **Minimal:** the flat drawing, the panel control (Full and Minimal at first), and its test.
2. **Simple:** the middle level, mostly a bundle of settings that exist.
3. **The offers:** on `lite` devices, then the choppy-frames offer.

## Where the pieces would go
- `src/lib/animationLevel.ts`: a pure function (like `motionStop.ts`) that takes the visitor's settings and the level and returns what is drawn.
- `src/lib/deviceMemory.ts`: one display setting, `animationLevel` (`full`, `simple`, `minimal`), kept only while "Remember on this device" is on and erased by "Forget me" and Emergency Exit.
- The Breathing Animation panel (`AccessibilitySettings.tsx`): the control and its help line.
- `NenyaLogo.tsx`, the ring, the gem and the page background: read the plan. Minimal needs its own flat drawing for the gem, leaves, orbs and ring.
- Tests for the pure function (every level against the settings) and a docs row.

## Still open
- What counts as "a run of slow frames" (how many, how slow, how soon after loading). It needs a measurement that stores and sends nothing.
- Whether an accepted level is remembered only with "Remember on this device" (proposed: yes, like other settings).
- Which colour the flat gem uses (proposed: the current breath colour).

## Not done
- Nothing is built. No device has been tested beyond one Mac on one day.
