# Screen-reader audit checklist (Safari + VoiceOver first)

Written 2026-11-06. Part of [accessibility-audio-scope.md](accessibility-audio-scope.md), phase 1. This is a checklist for **listening to the site**, not for changing it: write down what you hear, fix later.

## Setup (5 minutes)
1. Use the **staging site** (or a local build), in **Safari**, with a fresh window.
2. Start VoiceOver with **Cmd+F5**. If it offers the tutorial, take it once; it is short and teaches the keys.
3. In Safari settings > Advanced, turn on "Press Tab to highlight each item on a webpage".
4. **Look away from the screen**, or dim it fully, for at least the first pass. The point is to meet the site as a blind visitor would. Peek only to check what you heard.
5. Keep a notes file open. For each problem write: page, what you did, what VoiceOver said, what it should have said.

**Keys** (VO = Control+Option): VO+Right/Left = next/previous item; VO+Space = press; VO+A = read from here; VO+U = rotor (arrow left/right to choose Headings, Links, Form Controls, Landmarks; up/down to pick); VO+Cmd+H = next heading; Tab = next control; Escape = close a dialog; Control = stop speech; Cmd+F5 = VoiceOver off.

## The questions to ask on every page
- **Where am I?** On arrival, does it say the page or section name? Is there one clear heading to start from?
- **Does everything have a name?** Any "button", "link" or "image" with nothing after it is a failure.
- **Is the reading order the same as the visual order?** Use VO+Right through the whole page once.
- **Can I do it all without a mouse?** Tab and VO+Space only. Anything you can only do by clicking is a failure.
- **Can I tell the state?** Pressed, selected, on/off, expanded/collapsed, disabled: each should be spoken.
- **Is anything read twice, or read that should be silent?** Decoration, the glow, a ticking number.
- **Do changes get announced?** Something appears, loads or finishes: does it say so, once, without interrupting?
- **Am I ever trapped or lost?** Focus should never vanish, jump to the top unexpectedly, or stay behind an overlay.

## Page by page

**1. First load and the opening flow**
- On the first screen, what is spoken first? Is it clear that a choice is being offered ("Choose a breathing rhythm")?
- The four rhythms (including box breathing): are they reachable and named, and is the selected one announced? Can you preview or understand each without seeing the orb?
- The terms: can you read all of it, reach the accept button, and does it say the button is the way forward?
- Is the page behind the panel silent while the panel is open (not reachable by VO+Right or Tab)?
- After acceptance: where does focus go?

**2. The tour offer and the tour**
- Is "Would you like a quick tour?" announced as a dialog? Does Escape decline it?
- During the tour: is each step's text read, and is its position ("step 2 of 6") available?
- Does the highlighted ring make sense to a screen reader, or is it noise? Does focus move to the item being described?
- On the last step and on "Skip", where does focus end up?

**3. Welcome page and header**
- The logo: what is read? (Currently "Nenya Logo".) Is it read more than once?
- Header controls and the accessibility panel button: named? Is the panel announced when it opens and can you close it?
- The **breathing counter**: does it read itself every second (it should not)? Are its minimize and show buttons named? Is anything announced when it starts?
- The "Find your center" / reflection button: named and reachable?
- Landmarks (VO+U > Landmarks): are there a header, main and footer?

**4. Accessibility panel** (AccessibilitySettings)
- Every control named with its state. Are sliders or toggles operable by keyboard, and do they speak their value?
- Does changing a setting get confirmed aloud?
- (After the build) the breathing-tones switch: found early, named, on/off spoken.

**5. The six gateways (sight, sound, touch, movement, insight, essence) and the review page**
- Sound: the colour-to-note picker and the musical staff. Can a blind visitor choose notes, and does it say which note is selected? (The staff is labelled as a group; the notes inside may not be.)
- Sight: colour choices need names, not just colours.
- Touch and Movement: the body map and any drawing. Is there a text way to do the same thing?
- The review page: are your own answers readable? The drawings and body map currently read only as "Drawing for the present state" and "Body emotion map".
- Progress between gateways: is "you are on gateway 3 of 6" available?

**6. The coach**
- The input is named; the send button is named.
- When the reply arrives: announced once, in full, without cutting off whatever is being read?
- The resting screen, the blocked screen, the crisis message, and the failure and flag notices: each should be read as an alert the moment it appears, and each link or alternative reachable.
- The transcript tools (download, verify): named.

**7. About pages, terms, privacy, support**
- Headings in order (one main heading, then sub-headings, none skipped); long text reads cleanly.
- Links say where they go ("Donate to support Nenya"), not "click here". The donate badge is inside a link with a name.
- External links: is it said that they open a new tab?

**8. Emergency Exit and Forget me**
- Reachable from anywhere, quickly, by keyboard. Named plainly. Says what it does.
- After using it: where does focus go, and is the result announced?

**9. Footer and badges**
- Named, ordered, and the Netlify and donate images have alt text.

## Also check without VoiceOver
- **Keyboard only** (screen reader off): every control reachable with Tab; the focus ring always visible; no keyboard trap; Escape closes overlays.
- **Zoom to 200%** and **text size larger**: nothing cut off, no sideways scrolling for reading.
- **Reduce Motion on** (System Settings > Accessibility > Display): motion calms down.
- **Contrast**: the Valar-colour themes are on hold, but body text and controls should still be checked in the default theme.

## Automated pass (do this first; it takes minutes)
1. Install axe-core's browser extension (free) or run it from the developer tools in Firefox/Chrome, and run it on each page above. Record every "serious" and "critical" result.
2. In Firefox, open Developer Tools > Accessibility to see the tree a screen reader is given: names, roles, states. Faster than listening for finding unnamed items, but not a substitute.
3. Lint (`eslint-plugin-jsx-a11y`) is added when building, not now.

Automated tools find only a share of real problems, so the listening pass above is the real test.

## What to hand back
A list, in the order encountered, of: the page, what broke, and how bad it felt (blocked me / confusing / minor). That list becomes the "fixes from the audit" phase.

## Second pass, other readers
When VoiceOver is clear, repeat sections 1, 3, 5 and 6 with **NVDA** on Windows and **VoiceOver on iPhone** (Settings > Accessibility > VoiceOver), and **TalkBack** on Android if available. They disagree about details often enough that it is worth it.

## What this does not tell you
A sighted person with a screen reader finds mechanical problems, not the experience of someone who uses one every day: how fast they move, which shortcuts they use, what they expect. The first time you can, ask a blind or low-vision user to try the breathing tool and the coach, and pay them for it.
