# Scope: a Simple mode for the breathing animation

Status: scoping only, nothing built. Written 2026-11-25 from the owner's note: older devices and busy machines drop frames, so there should be a ready-made, much quieter way to draw the logo, one that holds or removes the orbs, the extra glows and the kaleidoscope.

## The idea in one line
One switch, "Simple mode", that draws the logo with the fewest moving and blurred parts while the breathing ring and everything about the breath stay exactly as they are.

## Why
On 2026-11-25 a recording of the default animation on a Mac dropped frames (a quarter of the frame gaps were 50 ms or longer) while the machine was busy with other work. The same page ran at a steady 60 fps on a quiet machine. The animation stacks several layers: soft glows around sixteen orbs, inner lights, the gem with its kaleidoscope, swaying leaves and a turning ring. When graphics are short on time, those layers are what slip. Slowing the processor changed nothing, so the cost is in drawing and blending, not in the page's code.

## What already exists (so this is mostly a bundle, not new code)
- **Device tiers** (`src/lib/deviceProfile.ts`): `lite`, `standard`, `capable`. On `lite` the gem is held still at the low setting, the kaleidoscope is off by default, the gem is capped at 8 sides and the preview is smaller. The gem also times its own first frames and steps down if they are slow.
- **Stop motion** (`src/lib/motionStop.ts`): holds the leaves, the inner lights, the gem's kaleidoscope, the outer orbs' pulse and turn, the ring of orbs' turning and the glow's swell. The breath ring keeps its rhythm. It wins over each motion setting without changing them, so resuming restores what the visitor had. The device's own "reduce motion" request does the same.
- **Individual settings:** Palette Orbit off (removes the outer orbs, inner lights and the Palette Orbit drawing of the leaves), Breathing Emanation off, Logo look: outer glow style (shared glow is the lightest), glow width (Soft is the lightest), inner lights (Hidden), leaves sway, kaleidoscope, outer ring still.

## What Simple mode would do
Turned on, it draws:
- the breath ring and everything about the breath as usual (the pace, the counter, the tones, the ring's colour);
- the gem still, with the kaleidoscope off;
- the leaves still;
- the **inner lights hidden**;
- the **outer orbs still** (drawn, not pulsing or turning);
- the **outer glow set to the shared, soft style** (one glow, narrow), not a separate glow per orb;
- no halo swell.

A further step, **Minimal**, would also switch Palette Orbit off (no orbs at all), for the oldest devices. Whether to offer both steps or only one is an open decision below.

Like Stop motion, it would **win over the individual settings without changing them**, so turning it off returns the visitor to exactly what they had chosen. Nothing new is stored beyond one display setting, `simpleMode`, kept only while "Remember on this device" is on and erased by "Forget me" and Emergency Exit like the others.

## When it turns on
1. **By the visitor:** a switch at the top of the Breathing Animation panel, next to Stop motion.
2. **Automatically on the `lite` tier,** with a plain line saying so and a way to turn it off ("We switched to a simpler picture because this device looks like it might struggle. Turn it off").
3. **Offered when frames drop:** if the page measures a run of slow frames, show a quiet one-line offer ("The animation looks choppy. Try Simple mode?"). It never switches on by itself without a message, and never nags: once dismissed, not again that visit.

## What it must not do
- Never change, slow or hide the breath ring, the counter or the pace. Simple mode is about decoration, not the cue.
- Never claim a benefit. The label is "Simple mode" and the help line says it "draws the picture with fewer moving parts, for older or busy devices".
- Never make a setting unavailable that was available before (the individual settings stay, greyed with a note while Simple mode is on, as Stop motion does for the ones it holds).
- Keep every part at least AAA for contrast, as the rest of the animation is.

## How we would know it works
- On this Mac, measure the page's frame intervals with and without Simple mode while the graphics are busy (several animated windows open). Count frames over 25 ms in a fixed 400-frame run. The target is no worse than the default on a quiet machine.
- On a real older device or phone, run the same count with the default and with Simple mode. Until that is done, the claim "it helps" is unproven. On 2026-11-25 the quiet-machine tests were all clean, so they cannot show a difference.
- Check the picture by eye: the ring, gem and leaves should still read as the Nenya mark, and the screen recording of Simple mode should look steady.

## Where the pieces would go
- `src/lib/simpleMode.ts`: a pure function (like `motionStop.ts`) that takes the visitor's settings and the switch and returns what is drawn.
- `src/lib/deviceMemory.ts`: the `simpleMode` display setting, with the usual rules.
- The Breathing Animation panel (`AccessibilitySettings.tsx`): the switch and its help line.
- `NenyaLogo.tsx` and the gem: read the plan from `simpleMode.ts`.
- A test for the pure function (every combination of switch and settings) and a docs row.

## Open decisions for the owner
1. **One step or two** (Simple, and Minimal with no orbs)?
2. **Automatic on `lite` devices,** or only offered?
3. **The "choppy" offer:** wanted at all?
4. **Name:** "Simple mode", "Light mode" (confusing next to the light theme) or something else?
5. **Does the gem stay lit** (a still gem with its colours) or become a plain flat shape in Minimal?

## Not done
- Nothing is built. No device has been tested beyond one Mac on one day.
- The frame-drop offer needs a way to measure slow frames that does not store or send anything. That has not been designed.
