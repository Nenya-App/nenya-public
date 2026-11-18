# Terms first, breathing as the default, the dock for the rest (scope, owner direction 2026-11-18)

**Direction (owner).** Go back to the initial design: the Terms are accepted or declined **before any other interaction**. After accepting, the visitor lands on **breathing**, and the other lenses are reached from the **new dock** (the tray, still under development). Coaching stays reachable from the **sparkle quick nav**, as now.

## Decided (owner, 2026-11-18)
- **Declining** shows an **informational page with no tracking**. It is also reachable as an optional sub-page from the Terms panel, as **"Learn more" / "In plain English"**, so a visitor can read before deciding.

## Principle (owner, 2026-11-18)
**Agreeing to the Terms is what creates a person's "shadow ID".** So before agreement there is no person in the system at all: nothing is counted, held or signed, and a decline creates nothing. The name "shadow ID" is not in the code or the docs yet; what agreement creates today is a **signed terms receipt** (`src/lib/visitConsent.ts`, `termsReceipt.ts`: "Nothing here sends an address or an identifier") held on the device for the visit. Whether the shadow ID is that receipt, a new pseudonymous identifier made at agreement, or the session ID (the two colours) is **open** (question 4 below), because it decides what the Terms and the data register may say about it.

## What exists today (read from the code)
- The welcome page is breathing. A first-visit panel (`src/app/components/OnboardingFlow.tsx`) sits over it: the rhythm choice, then the Terms; with `VITE_START_CHOOSER=on` a start chooser comes first. The breathing counter appears after "Agree, Enter" (`entryUnlocked` in `App.tsx`).
- **There is no decline path** in that panel (the only "decline" in the app is the tour offer).
- Deep links (About, `/senses`, the guestbook) skip the rhythm and ask only the Terms (`skipRhythm`).
- The sparkle quick nav (`QuickNav.tsx`) has Breathe, Reflect and Coach. The lens tray (commit a3e17dc, `VITE_LENS_TRAY`, off) is the Reflect destination; the coach is held apart from it (`lens-rewrite-scope.md`, section 3).

## What changes
1. **Terms are the first and only step** of the panel: the start chooser and the rhythm choice leave it. The rhythm is chosen from the breathing counter after entry (Steady is the default, as already stated in the panel).
2. **Two buttons of equal weight**, "Agree, Enter" and "Decline", plus "Learn more" / "In plain English".
3. **The plain-English page** is a short, accurate summary of the Terms and the privacy promise in everyday words, written to the facts list, shown inside the panel and as the page a decliner sees. It is a **summary, not a replacement**: the full Terms stay the binding text, and the page says so. Wording is the owner's to approve; it becomes a Terms-adjacent document (archive and effective-date practice).
4. **The decline page**: nothing is counted, no event is sent, nothing is stored (not even "declined"), no cookies or device memory; the page offers the plain-English text, the full Terms, and "Read the Terms again" to return. Closing the tab is the exit.
5. **After accepting, land on breathing**; the sparkle opens Breathe, the dock (Reflect, when `VITE_LENS_TRAY` is on) and Coach. Deep links still land where they point, after the Terms.
6. **Counts**: the existing rule holds, counting begins only after agreement ("Agreeing is the first thing counted"); a decline is not counted.

## Checks
- Nothing but static text loads before agreement (no analytics, no fonts or scripts from other hosts); a decline sends no request. A test reads the network list for a decline.
- Keyboard and screen reader: both buttons and the plain-English link reachable in order; focus kept inside the panel; Escape does not count as agreement.
- WCAG 2.2 AAA contrast and target size for the new buttons.
- A visitor with "Remember on this device" and unchanged Terms is not asked again (unchanged).

## Open for the owner
1. Does a decline page stay at the same address, or is it its own address (so it can be linked, for example from the About pages)?
2. "Remember on this device": unchanged, or should it stay off until after the plain-English page has been offered once?
3. Who writes the plain-English text: I draft from the Terms and the facts list for your edit, or you write it.
4. What exactly the shadow ID is (the receipt, a new identifier, or the session ID), where it is held (device only, or also on the site), what it is used for, and whether it is mentioned in the plain-English page and the Terms.
5. Whether the start chooser (`VITE_START_CHOOSER`) is retired or only left off.

## Build order (each a reversible step behind a switch, off by default)
1. The decline page and the plain-English page as plain components with tests (no network on decline).
2. The panel reduced to Terms with the two buttons and the link; the rhythm moved to the counter.
3. The sparkle and dock wiring with the tray switch.
4. Keyboard, screen-reader and AAA checks; then staging.
**Who:** the tray work is in the other session ("Nenya repository setup and GitHub Desktop (fork)"); `App.tsx` and `OnboardingFlow.tsx` are shared files, so the order of work between the sessions is the owner's call.
