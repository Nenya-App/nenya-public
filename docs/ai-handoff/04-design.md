# 4. Design: the visual and interaction language

## Principles
1. **Calm first.** Slow motion, low density, one thing to do at a time. A person arriving upset must not meet a wall of text or a choice of twenty.
2. **Few choices, plain words.** Choice paralysis is an accessibility failure. Offer the softened or default option first; put extras under "more". The Touch gateway and the chords are the model (docs: `src/lib/gatewayCopy.ts`).
3. **Never trap, never push.** Everything optional, nothing timed, an Emergency Exit on every screen (clears what this device saved and leaves the site at once), "Forget me" in the settings menu.
4. **Say what will happen before it happens** (what is sent, where, for how long), at the point of the choice, in the person's words, not in a policy.
5. **Accessibility is WCAG 2.2 level AAA** (`docs/accessibility-standard.md`, audit lists in `docs/accessibility-*.md`). Tests hold much of it.

## What the tests hold (do not break; add pairs before adding colors)
Text contrast 7:1 or more for every theme text color on every surface, light and dark; headings step down in size; base 16px and nothing visitor-facing under 12px; user text size 14/16/18; targets at least 44px (`min-h-11`); reduced-motion respected everywhere (the breathing ring, glow, kaleidoscope and the footer mark all stop or hold still); color-blind modes (deuteranopia, protanopia, tritanopia, achromatopsia); keyboard operation and a skip link first in the page; visible focus; polite live regions that never move focus; plain-language copy tested by Flesch-Kincaid (grade 8 or below, `src/lib/readingLevel.ts`) for new instructional text.

## The breathing identity
- **The logo is a breathing gem**: a ring of petals (leaves; six today, the count is a parameter) with a faceted gem inside, ringed by 16 inner and 16 outer orbs, in warm gold and silver-white. A visitor can change the gem's sides under **Logo look** in the accessibility panel (`docs/logo-look.md`). The ring, counter and tones share **one clock** (`src/lib/breathClock.ts`) so they stay in phase. The pace (5·5, 4·6, 4·8, 3·3, box, 4-7-8) is one choice for the whole page, kept only if the visitor asks to be remembered.
- **Portable pacing:** the counter and tones appear on every screen and on /coach (`PortableBreath.tsx`); tones play whenever switched on, off by default, unlocked by a click.
- **Three doors and three rings** at the start (`StartTriad.tsx`): **breathe is white, reflect is blue (#4A90E2), coach is red (#D64541)**, round glowing icons in a triangle: a flower of petals, a prism splitting light, two overlapping circles. The glow stops under reduced motion.
- **Palettes** are named after the Valar (a codename and an homage; the public pages call them palettes). Colors are starting points, never a measurement: "no color has a fixed meaning".
- **Sound:** chords and a melody in the Sound gateway (a softened voicing is the default; the rest under "Other ways to hear them"); breathing tones in several arrangements.
- **Gem and kaleidoscope:** a ray-traced live gem (`docs/live-gem.md`) with an optional slow kaleidoscope that can follow the breath; everything holds still under reduced motion.
- **The footer mark:** "nənya.biz", a turned e (schwa) layered over a gold e, rotating once on arrival (`NenyaMark.tsx`, settings in `src/lib/nameMark.ts`). Only there. Everywhere else: "Nenya".

## The guestbook geometry
Signatures are points in the RGB cube (`GuestbookCloud.tsx`, lifted from the owner's Apiary renderer): the visitor picks two colors (never their session colors), joined to two time-derived colors; only the **centroid** (per-channel average) and the day are kept. The page shows a cube you can turn, and a text summary under it.

## Session colors
A person's **session ID is two hex colors**; with a "shadow" random pair it keys the optional encrypted save-and-return (24 hours, PBKDF2 + AES-GCM in the browser). **Never publish or log a session color.** Anything shown publicly rounds colors to a named palette color.

## Copy
- Short sentences, everyday words, second person, no jargon, no exclamation marks, no emoji, no "journey". Say "AI", not "assistant" or "companion".
- Never claim certainty about feelings ("it sounds like", "might"), never diagnose.
- Credit CNVC's inventory; do not imply affiliation. No claims of clinical effect.
- Safety and legal copy is **owner-approved text**: change it only with the owner's yes (the pre-written answers record this in `ownerNote`).
- Link text names the place ("Terms, Section 15"), not "click here".

## Adding something new
Use theme tokens; add contrast pairs to the test first; check at phone width; check reduced motion and keyboard; write the data-register row if anything is kept; add the pre-written answer if visitors may ask about it. Ship it behind a switch.
