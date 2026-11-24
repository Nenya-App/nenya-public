# Outer ring movement (visitor setting)

Status (2026-11-24): built on the branch `claude/outer-ring-movement`, owner-approved, not yet merged. The outer ring is the sixteen orbs at the edge of the breathing animation.
Code: `src/lib/outerRing.ts` (the maths), `src/app/components/useOuterRingTurn.ts` (draws it), `src/app/components/OuterRingControls.tsx` (the settings), tests in `tests/outer-ring.test.mts` and `tests/logo-look-storage.test.mts`.

## What it does
The ring turns round the logo. Before, it turned counter-clockwise on a CSS animation that shared the inner ring's 120 s. Now it has its own settings, and the inner ring is untouched (still 120 s, still the way it was).

## Defaults (a visitor who has set nothing)
| Setting | Stored as (in `nenya.prefs`) | Default |
|---|---|---|
| Ring: Turning or Still | `outerRingTurning` | Turning |
| Direction | `outerRingDirection` (`ccw`, `cw`) | Counter-clockwise |
| Pace, seconds per turn | `outerRingSeconds` (30 to 300) | 144 s per turn (0.42 rpm). Was 120 s |
| Pace to my breathing | `outerRingBreathPaced` | Off |
| Fraction of a turn per breath | `outerRingBreathTurn` (the N of 1/N: 12, 8, 6, 4) | 1/12 turn |

144 s is twelve breaths of 12 s (the default 6 s in, 6 s out), so 1/12 of a turn per breath at the default breath is the same average pace as the steady default.
`NenyaLogo` with no options looks as the site does; the only change is the outer ring's pace (120 s to 144 s). `OuterOrbitLook` carries the same five fields (`turn`, `direction`, `turnSeconds`, `breathPaced`, `breathTurn`) so the /bench page can set them; a bench prop overrides the visitor's choices.

## The controls
Settings, Logo look, a group labelled **Outer ring movement**, shown while Palette Orbit is on (like the other orb choices):
- **Turning / Still** (two radio buttons).
- **Direction**: Counter-clockwise (default) or Clockwise.
- **Pace**: a slider, 30 to 300 seconds per turn in 6 s steps (a real range input, so the arrow keys, Home and End work). Left is faster. Its label always reads like "144 s per turn (0.42 rpm)", and the same text is its `aria-valuetext`. A Reset button returns it to 144 s.
- **Pace to my breathing**: a switch. When on, the slider is disabled and says why, and four radio buttons choose the fraction: 1/12 (standard), 1/8, 1/6, 1/4 of a turn for each full breath. A line under them gives the average pace for the visitor's breathing pace, and says in words when the limit (below) applies.
- Changes are announced through the existing polite status line of the Logo look group. The help text is plain words with no claim about benefit. The direction, pace and breath controls are disabled while the ring is set to Still.

## How the ring moves
- Steady: angle = 360 x elapsed seconds / seconds per turn, from the shared breathing clock's start (`cycleStart`), so two logos on a page agree.
- Paced to the breath: each full breath adds the same fraction of a turn. Within a breath the speed never drops to zero: a quarter of the fastest at rest, rising through the in-breath, fastest at the top of the breath (and through a hold-in), falling away sooner than it rose through the out-breath, so most of the turning is on the in-breath and the out-breath eases. The speed is the breath's own envelope (`breathEnvelope`) smoothed, the same at the end of one breath and the start of the next. It follows whatever pace or ratio the visitor chose, because it is computed from that breath's own phase points.
- One `requestAnimationFrame` loop writes one `transform` on one element, only while the ring may move. It is not the CSS animation it used to be (that cannot follow the breath), so it runs on the main thread; the rest of the ring (the orbs' colours and halos) is unchanged and still the browser's own animation. The loop carries on from the last angle when any setting changes, so the ring never jumps.

## Limits and safety
- **Never faster than 2 turns a minute (12 degrees a second).** Steady pace: the slider stops at 30 s per turn, and a stored or coded value outside 30 to 300 is dropped or held to it. Paced to the breath: the ring's fastest moment is held to 2 rpm. When a short breath would pass that (for example the 3-second breaths at 1/4 turn), the turn for each breath is scaled down evenly (same shape, smaller fraction), never cut off, so the ring keeps turning smoothly. The note under the control says "At your breathing pace this would be faster than the most the ring ever turns (2 turns a minute), so it turns less each breath than you chose", with the average. At the default (6 s in, 6 s out, 1/12) the limit does not apply; for a breath with equal in and out, it begins to apply below a breath of about 6 s at 1/12, 8 s at 1/8, 10 s at 1/6 and 16 s at 1/4 (so 1/4 is held back even at the default 12-second breath).
- No flashing, no jumps, no sudden stop: smooth continuous movement only.
- **Stop motion and reduced motion win, and are not changed.** `motionPlan` (`src/lib/motionStop.ts`) gets a new `outerRingTurns` field: true only when motion is not held and the visitor has not chosen Still. While held, the ring is still (drawn at rest, as before) whatever the choices are; Resume brings back what was chosen. The panel says so when motion is held. `outerOrbsMove` (the orbs' own size pulse) is unchanged and is separate from the ring's turn.

## How it persists
Five display settings in `nenya.prefs` (src/lib/deviceMemory.ts), like leaf sway: kept only while "Remember on this device" is on; validated on load (an unoffered value is dropped, never turned into something faster); erased by turning Remember off, by "Forget me" (the app's button and `public/forget-me.js`) and by Emergency Exit, because those erase all of `nenya.prefs`. No new storage key was added, so the lists of keys (`docs/device-memory.md`, `public/forget-me.js`, the legal text's "animation and breathing choices") needed no change. Nothing is sent anywhere.

## What was not changed
The inner ring (still 120 s, its lights, their behaviour); the orbs' colours and halos (they still shift on their own); each orb's own size pulse and slow self-turn; the breath ring, counter and tones; the footer note in the breathing popout; the policy and site copy; the `nenya-orbit-ccw` keyframes (left in `globals.css`, no longer used by the logo).

## Not verified
Checked by build, type-check and tests only. The look of the movement was not seen in a browser (by decision). Frame cost of the script loop was not measured.
