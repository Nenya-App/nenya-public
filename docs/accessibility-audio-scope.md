# Scope: audio cues and screen-reader support for blind and low-vision visitors

Status: scoping only, nothing built. Written 2026-11-06.

## The problem
The breathing counter is visual: a number and a word that change every second, and a glowing logo that follows the rhythm. A blind visitor gets none of it. More broadly, the site has a base of screen-reader markup (labels, live regions, hidden decoration) but it has never been checked with a screen reader, and several newer pieces (opening flow, tour, coach chat, body map) have never been tested that way at all.

## Decisions made
- **Stepped notes**, not a continuous glide. Each count is one note, so the tones carry both the phase and the count.
- **Off by default** (revised 2026-11-06, replacing "on by default"). Nobody gets an unrequested sound. A screen-reader user can find and switch on a clearly labelled toggle (see "Default off, with a toggle screen readers reach").
- **Alt text for every image**, with one written set shared with the marketing repo (see "Alt text").
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

## Default off, with a toggle screen readers reach
The tones start only when the visitor switches them on. That also solves the browser rule that audio cannot start until the visitor has interacted: the switch itself is the interaction, so the audio context is unlocked by it.

**The toggle** is a real switch (`role="switch"` or a labelled checkbox, with an on/off state a screen reader announces), named "Breathing tones" with a one-line description: "Plays a rising note for each count of an inhale and a falling note for each count of an exhale. Off by default."

**It must be found without looking for it.** A blind visitor should not need to guess that an accessibility panel exists. The same switch, sharing one setting, appears in three places:
1. **Near the start of the page**, as the first or second item in the tab and screen-reader order. It is visually hidden until it receives keyboard focus, then appears (the same pattern as a "skip to content" link, so keyboard users can see it too). Its text: "Breathing tones, off. Turn on."
2. **In the accessibility panel**, with the other settings.
3. **On the breathing counter**, as a small labelled sound button next to the minimize button.

**When it is switched on:** one short sample note plays so the visitor knows it worked, and a polite live region says "Breathing tones on". Switching off says "Breathing tones off" and stops sound immediately.

**Remembered** on the device, and cleared by "Forget me" like the other preferences, which means a returning screen-reader user would have to switch it on again. Whether to keep this one preference through "Forget me" is an open question: it is an access need, not a reflection.

Decide later whether tones continue while the counter is minimized (suggested: yes, since minimizing is a visual choice) and whether hiding the counter entirely also silences them (suggested: yes).

## Spoken and live-region support
- **No per-count announcements.** Announcing every number would talk over the tones and over the screen reader's own speech.
- A polite live region says only "Breathing started, <rhythm name>" and "Breathing ended".
- **A separate, optional setting**: announce each phase change ("breathe in", "hold", "breathe out"). Off by default, because the tones already carry it. For visitors who cannot hear the tones well, or who prefer speech.
- **Setting choices** in the accessibility panel: tones, spoken phases, both, or neither (neither is the default). Haptics (`navigator.vibrate`) are a possible fifth, with the caveat that iPhone Safari does not support them.
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

## Alt text
**Why it is its own item.** A screen reader reads an image's `alt` text, or says "image" and nothing else when there is none. The logo is the first thing on the welcome page and is built from several layers; right now a screen reader meets one image named "Nenya Logo", which says what it is but not what it looks like, and the same words are used everywhere the logo appears.

**Current state (checked in the code, 2026-11-06):**
- `NenyaLogo.tsx` base image: `alt="Nenya Logo"` everywhere it appears. The gem and glow canvases and the bezel are already hidden from screen readers (`aria-hidden`), so only that one image is read. Orbs are CSS shapes and are not read.
- `index.html`: `og:image:alt` already describes the emblem (and is accurate against the current image, apart from "six-petaled flower": it is two interlaced six-petaled flowers). This is what link previews use.
- Footer Netlify badge: "Deploys by Netlify". Fractured Atlas donate image: "Donate now at Fractured Atlas!" (inside a link, so the link's purpose is announced; fine).
- `GatewayReviewPage.tsx`: the visitor's own drawings and body map are labelled "Drawing for the present state", "Drawing for the wish state", "Body emotion map". These say what the picture is but give a blind visitor none of its content; the review page needs a text alternative (see below).
- SVG widgets: `MusicalStaff` has a group label; `FlavorWheel` has `role="group"` with no label, and the body-map avatar has none checked. These need audit.
- Not covered by `alt` at all: PDF exports (jsPDF does not tag images or structure) and exported PNGs. Out of scope here; listed in the audit as a known gap to document honestly.

**The work:**
1. **One written set of descriptions** for the logo and each other image, kept in `docs/brand/alt-text.md` in this repo (nothing private), with a short form (one sentence, for the site and posts) and a long form (for the About page, press kit, and a "describe this image" disclosure). The marketing repo points at that file instead of keeping its own copy, so the site and the posts cannot drift apart. (`brand/voice.md` there already says "alt text on every image, written to describe, not to decorate", and `templates/post.md` asks for `![alt](path)`.)
2. **Context-aware logo alt.** `NenyaLogo` takes an `alt` prop, with three uses: the full description on the welcome page; just "Nenya" (or "Nenya, home" when it is a link) in the header and anywhere it repeats; and `alt=""` where it is purely decorative next to the word "Nenya".
3. **Rules the descriptions follow:** say what it is first; describe shape and arrangement, not mood; mention colour only where it means something; no "image of" or "logo of" padding; do not repeat nearby text; decorative images get empty alt, never a filename.
4. **User-made pictures** (drawings, body map): the review page shows the visitor's own text and selections as the readable version, and labels the picture "Your drawing for the present state. Described in the text above." rather than a description we cannot know. The body map gets a list of marked regions, per `docs/body-map-integration-spec.md`.
5. **Social previews:** keep `og:image:alt` in step with the shared description.
6. **Test:** every `<img>` in the built pages and components has an `alt` attribute (empty only when intentionally decorative and marked so), and none reads as a filename or "image". The existing `render` tests can walk the rendered HTML.

**Draft descriptions** (to be refined once; they are checked against the current `public/og-image.jpg`, which shows two interlaced six-petaled flowers outlined in gold and cream, a hexagonal faceted gem with rainbow colours at the centre, and a ring of sixteen soft-coloured orbs, all softly glowing on a dark brown background):
- **Logo, short:** "Nenya logo: a faceted rainbow gem at the centre of two interlaced six-petaled flowers, gold and cream, ringed by sixteen coloured orbs."
- **Logo, long:** "The Nenya emblem. At the centre is a hexagonal gem whose facets show rainbow colours. Around it, two six-petaled flowers drawn in thin gold and cream lines weave over and under each other. A ring of sixteen small orbs surrounds the flowers, each a different soft colour: purples, greens, blues, yellow, orange, red and pink. On the site the orbs slowly change colour and the glow follows the breathing rhythm."
- **Logo without the orbs** (small header version): "Nenya logo: a faceted rainbow gem at the centre of two interlaced six-petaled flowers, gold and cream."
- **Header / repeated use:** "Nenya" (as a link: "Nenya, home").
- **Variants for marketing** (dark with glow, dark clean, transparent, for light backgrounds): the same text; mention the background only where it matters to the post ("on a light background").

## Starting a screen reader for the audit
Browsers do not have their own screen reader; they use the system's.
- **Safari (Mac): VoiceOver.** Press Cmd+F5 to start and stop it (on Macs with Touch ID, triple-press Touch ID while holding Cmd). The "VO" key is Control+Option. VO+Right/Left arrow moves through the page, VO+Space activates, VO+U opens the rotor (lists of headings, links, controls). In Safari settings under Advanced, turn on "Press Tab to highlight each item on a webpage" to check Tab order.
- **Firefox (Mac):** VoiceOver works there too, started the same way, but Safari is the better-supported pairing, so test Safari first.
- **Firefox (Windows): NVDA**, free from nvaccess.org. Insert+Q quits it. It is the most common free screen reader, so worth a pass if you or a friend have a Windows machine.
- **iPhone:** Settings > Accessibility > VoiceOver, or set the Accessibility Shortcut to triple-click the side button. **Android:** TalkBack, same area of Settings.
- Firefox's developer tools also include an Accessibility panel that shows the page as a screen reader sees it (names, roles, states), useful without turning any speech on.

## Phases
1. **Audit.** Run the automated tools, then go through the site with VoiceOver using [docs/accessibility-audit-checklist.md](accessibility-audit-checklist.md) and write down what breaks. No code changes. Output: a short findings list.
2. **Alt text.** The shared description file, the `alt` prop on the logo, the review-page text alternatives, and the test. Small, independent of the audio work, and useful to marketing straight away.
3. **Breathing tones.** The cue design above, the three-place toggle (off by default), the live-region announcements, and tests.
4. **Fixes from the audit,** then testing with blind users if they can be found.

Build order for the next session: 2, then 3, with the audit findings fed back as they come in.

## Tests to write when it is built
- Note scheduling from the shared clock: rising for inhale, falling for exhale, quiet repeats for both holds, stronger first note, correct for each rhythm including box breathing and rhythms with an empty hold.
- Mapping of N counts onto the pitch range (including N larger than the scale).
- The setting: off by default, remembered, cleared by "Forget me" (or kept, per the open question); no sound at all until switched on, including on first load and after the opening flow; switching on unlocks audio, plays the sample note and announces it; switching off silences immediately.
- The toggle: present in all three places and sharing one state; has a role, name and state a screen reader reads; is reachable by keyboard near the start of the page, hidden until focused; works with Space and Enter.
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
- Whether the tones setting survives "Forget me" (an access need, not a reflection).
- Where exactly the hidden-until-focused toggle sits in the page order, and whether the same pattern should also offer "Skip to main content".
- Whether the marketing repo should reference `docs/brand/alt-text.md` by link or by a copied file (a change in that repo, to be asked about first).
- Who the first blind testers could be.

## Decision (2026-11-07)
- **The breathing-tones setting is erased by "Forget me"** like the other saved settings (and by Emergency Exit). A returning screen-reader user switches it on again; the switch stays easy to find (first in the tab order, hidden until focused). This replaces the earlier open question.
