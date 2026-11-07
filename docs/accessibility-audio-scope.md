# Scope: audio cues and screen-reader support for blind and low-vision visitors

Status: scoping only, nothing built. Written 2026-11-06.

## The problem
The breathing counter is visual: a number and a word that change every second, and a glowing logo that follows the rhythm. A blind visitor gets none of it. More broadly, the site has a base of screen-reader markup (labels, live regions, hidden decoration) but it has never been checked with a screen reader, and several newer pieces (opening flow, tour, coach chat, body map) have never been tested that way at all.

## Decisions made
- **Stepped notes**, not a continuous glide. Each count is one note, so the tones carry both the phase and the count.
- **On by default.** The setting starts on, with a way to turn it off (see "On by default" below for what that requires).
- **Holds are repeated quiet notes**, not silence and not a single sustained tone. One quiet note per count, so a hold is audibly different from a stopped tool and the count stays audible.

## Cue design
The counter already runs on a shared clock (`breathCounter(Date.now() - start)`) and reports a phase (inhale, hold, exhale) and a count. Audio is scheduled from that same clock so sight and sound stay together.

| Phase | What is heard |
| --- | --- |
| Inhale | One note per count, **rising** through the scale. |
| Hold after inhale | One **quiet** note per count, repeating the **top** note of the inhale. |
| Exhale | One note per count, **falling** through the scale. |
| Hold after exhale (box breathing, and any rhythm with an empty pause) | One **quiet** note per count, repeating the **bottom** note of the exhale. |

- **Start of a breath** gets a slightly firmer first note, matching the stronger visual pulse the counter gives count 1 of an inhale.
- **Notes** come from the pentatonic scale already used for the session sound (`src/lib/sessionSound.ts`), so every step is consonant and nothing sounds like an alarm. Only the scale's frequencies are reused, not the session-key melody.
- **Mapping counts to notes.** A phase of N counts is spread across the fixed pitch range, so a 4-count inhale and an 8-count exhale span the same range. Where a phase has more counts than the scale has steps, neighbouring counts share a note. To be tuned by ear, with real listeners.
- **Sound character.** A soft sine or triangle with a short attack and a gentle fade (no clicks), at low volume. The quiet hold notes are clearly softer than the moving notes.
- **Engine.** The existing Web Audio code (`src/lib/audio.ts`); no new dependency. Notes are scheduled on the audio clock rather than with `setTimeout`, so they do not drift.

## On by default: what it requires
Browsers do not allow audio until the visitor has interacted with the page, so "on by default" means the setting defaults to on and the tones begin as soon as audio can be started.
- The audio context is unlocked by a real click or key press the visitor already makes. The terms acceptance in the opening flow is the natural place.
- Because a screen-reader user may land on the page without a click, the screen-reader text must say how to start the tones, in one short sentence.
- **The risk to design around:** an unrequested sound can be unwelcome for someone in a public place, on a shared device, or in distress. Mitigations to build in: quiet by default; a visible and screen-reader-labelled mute control on the counter itself, not only in the accessibility panel; the setting remembered on the device (and removed by "Forget me" like other preferences); and a one-time plain notice, the first time tones play, saying that they can be turned off here.
- Decide later whether tones continue while the counter is minimized (suggested: yes, since minimizing is a visual choice) and whether hiding the counter entirely also silences them (suggested: yes).

## Spoken and live-region support
- **No per-count announcements.** Announcing every number would talk over the tones and over the screen reader's own speech.
- A polite live region says only "Breathing started, <rhythm name>" and "Breathing ended".
- **A separate, optional setting**: announce each phase change ("breathe in", "hold", "breathe out"). Off by default, because the tones already carry it. For visitors who cannot hear the tones well, or who prefer speech.
- **Setting choices** in the accessibility panel: tones (default), spoken phases, both, neither. Haptics (`navigator.vibrate`) are a possible fifth, with the caveat that iPhone Safari does not support them.
- The counter's text (number and word) is hidden from screen readers while it ticks so it does not read itself every second; the live region and the labelled controls are what a screen reader meets.

## Beyond the breathing tool (audit before building)
Check each with VoiceOver, then NVDA and TalkBack:
- The opening flow and the tour: focus lands inside, stays inside, returns afterwards; the background is inert; each step is announced.
- The logo, gem and other decoration: hidden from screen readers.
- The coach: new replies are announced once, the input is labelled, the resting and blocked screens read sensibly.
- The reflection tool and other choices: every control has a name, a state and an order that makes sense without sight.
- The body map (see `docs/body-map-integration-spec.md`): a list-based alternative that does everything the picture does.
- Colour choices, sound-key picker, and anything drawn on a canvas.

## Tools (all free or open source)
- **axe-core** and **eslint-plugin-jsx-a11y** (both MIT) in the check script. They catch labelling and focus errors; they find only a share of real problems and do not replace listening to the site.
- **Screen readers**: VoiceOver (built into macOS and iOS), NVDA (Windows, free), TalkBack (Android).
- **References**: WCAG 2.2, the WAI-ARIA Authoring Practices, and the live-region guidance from [Orange's accessibility guidelines](https://a11y-guidelines.orange.com/en/articles/make-a-screen-reader-talk/).
- **Prior art**, for design ideas only (nothing to adopt): [shwilliam/box](https://github.com/shwilliam/box) (box breathing through live regions) and the RespiCo research device (auditory, visual and haptic cues). Licenses not checked beyond RespiCo being listed as MIT.
- Tone.js (MIT) was considered and not needed.

## Starting a screen reader for the audit
Browsers do not have their own screen reader; they use the system's.
- **Safari (Mac): VoiceOver.** Press Cmd+F5 to start and stop it (on Macs with Touch ID, triple-press Touch ID while holding Cmd). The "VO" key is Control+Option. VO+Right/Left arrow moves through the page, VO+Space activates, VO+U opens the rotor (lists of headings, links, controls). In Safari settings under Advanced, turn on "Press Tab to highlight each item on a webpage" to check Tab order.
- **Firefox (Mac):** VoiceOver works there too, started the same way, but Safari is the better-supported pairing, so test Safari first.
- **Firefox (Windows): NVDA**, free from nvaccess.org. Insert+Q quits it. It is the most common free screen reader, so worth a pass if you or a friend have a Windows machine.
- **iPhone:** Settings > Accessibility > VoiceOver, or set the Accessibility Shortcut to triple-click the side button. **Android:** TalkBack, same area of Settings.
- Firefox's developer tools also include an Accessibility panel that shows the page as a screen reader sees it (names, roles, states), useful without turning any speech on.

## Phases
1. **Audit.** Run the automated tools, then go through the site with VoiceOver and write down what breaks. No code changes. Output: a short findings list.
2. **Breathing tones.** The cue design above, the accessibility-panel setting, the mute control, the live-region announcements, and tests.
3. **Fixes from the audit,** then testing with blind users if they can be found.

## Tests to write when it is built
- Note scheduling from the shared clock: rising for inhale, falling for exhale, quiet repeats for both holds, stronger first note, correct for each rhythm including box breathing and rhythms with an empty hold.
- Mapping of N counts onto the pitch range (including N larger than the scale).
- The setting: on by default, remembered, cleared by "Forget me", honoured by the mute control; no sound before the audio context is unlocked; no sound when set to off.
- Live region: start and end announced once; no per-count announcement; the optional phase announcements only when chosen.
- The counter's ticking text is hidden from screen readers.
- The critical-UI test: the new setting and its notice must not depend on the animation library.

## What this does not claim
- Automated checks and my own reading of the code are not proof of accessibility. Until blind users have tried it, the honest description is "built with screen-reader support and checked by the team", not "accessible".
- Tones will not suit everyone (hearing loss, sound sensitivity, shared spaces). That is why spoken phases, a mute, and the option to turn it all off exist.

## Open questions
- The exact scale range and sound character: decide by listening, not by spec.
- Whether the rhythm choice in the opening flow can be previewed by tone, so a blind visitor can choose a rhythm by ear.
- Whether to add a short wording to the Terms or help text about sound.
- Who the first blind testers could be.
