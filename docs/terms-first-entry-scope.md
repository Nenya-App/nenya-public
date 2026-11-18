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
1. **Terms are the first and only step** of the panel: the start chooser (retired) and the rhythm choice leave it. The rhythm is chosen from the breathing counter after entry (Steady is the default, as already stated in the panel).
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

## More owner decisions (2026-11-18)
- **The decline page gets its own address**, a "safe room for reading": it can be linked from the About pages and read without agreeing to anything.
- **The start chooser is retired as the opening.** The sparkle quick nav does the same job (where to start: Breathe, Reflect, Coach), so it takes over and `VITE_START_CHOOSER` stays off or goes.
- **The shadow ID is the working ID** (owner): two hex codes, the same form as a session ID (`#rrggbb` twice), existing **before** the person chooses colours. It is made at agreement (random, or from the time of signing). If the person then chooses colours, those become the session ID and the shadow ID either disappears or carries beneath it.
- **The plain-English text is drafted by me** for the owner's edit (below).

## My recommendations on the shadow ID (to confirm)
1. **Random, not time-derived.** A pair taken from the time of signing can be guessed and matched to a visit log; a random pair from the browser's random source (`crypto.getRandomValues`) carries nothing. Same form, same range as a session pair, so the coach's `session` field needs no change.
2. **It disappears when colours are chosen** (the chosen pair replaces it), unless a reason appears to keep it: carrying it beneath would mean two linked identifiers for one visit. If a link is wanted (for example to bind the signed receipt), the receipt can hold a one-way hash of the shadow ID instead of the ID.
3. **Held for the visit only, even with "Remember on this device".** Remember keeps the agreement and the display settings (Terms, "The short version"); a working ID kept between visits is a persistent identifier, so a new random pair each visit is the plainer promise.
4. **The Terms already say it:** "Two colors label the session: a random pair you can change, or your Sight gateway colors" (Privacy, "Your session colors"). The shadow ID is that random pair, now made at agreement and not later; the Terms sentence may need only one added clause (that it exists from agreement). Any change batches with the other Terms changes and a new effective date.
5. **Nothing before agreement.** The panel needs no identifier to show the Terms.

## What "no tracking" can honestly mean on the decline page
Our own code sends nothing, counts nothing and stores nothing for a decline (no request, no event, no cookie, no device memory). But **the host still logs every request** (the Terms, Privacy section 13: connection details, and visit totals built from the same logs), and the decline address is a page request like any other. So the page should say: *"We do not count or keep anything about you here. Our web host keeps ordinary connection logs, as any website's host does."* The Terms already state this, so the page repeats it and does not promise more. A claim of "no tracking at all" would be false.

## Draft: "In plain English" (for the owner to edit; a summary, not the Terms)
> **Nenya in plain English.** This is a short summary. The full Terms of Use and Privacy Policy are the binding text, and you can read them any time.
>
> **What it is.** A free place to pause, breathe and reflect, a kind of interactive art. It is not therapy, medical care or advice, and it cannot help in an emergency. If you are in crisis, please contact a person now: call or text 988 (US and Canada), or your local emergency number; elsewhere, findahelpline.com lists lines in your country.
>
> **Who it is for.** People 13 or older (or your country's minimum age, if higher). Under 18, please use the coach only with a parent's or guardian's consent.
>
> **What stays with you.** What you enter in the reflection tools (colours, melodies, drawings, writing) stays in your browser and is gone when you close the tab, unless you choose to save it on your own device, locked with your passcode, for up to 24 hours. A PDF report is made on your own device.
>
> **What we do not do.** No accounts, no ads, no tracking cookies, nothing that follows you around the internet.
>
> **What we do see.** Our web host keeps ordinary connection logs, as any website's host does, and gives us visit totals. We keep our own daily totals: numbers only, nothing about who. They start only after you agree, and not at all if your browser sends the Global Privacy Control signal.
>
> **What leaves your device.** Only what you choose to send: a report or message, a signed coach transcript, a colour palette from The Color API, and the coach conversation itself. The coach is an AI, and the Terms explain where those words go.
>
> **If you agree.** We sign a short note that you agreed, and your visit gets a random pair of colours as its working name, which you can change. It is not an account and it is not kept between visits.
>
> **If you decline.** Nothing from you is counted or kept by us. You can come back and read, or agree, whenever you like.

*Facts to verify against the Terms before use:* the 24-hour save, the Global Privacy Control sentence, the "not kept between visits" clause (depends on recommendation 3), and the coach sentence (read Privacy section 15 and write it from there, not from memory). The text must be added to the facts list and to the Terms archive practice, and the owner approves the wording.

## Open for the owner
1. Is the shadow ID random (my recommendation) or from the time of signing?
2. When colours are chosen, does it disappear (my recommendation) or carry beneath?
3. Does "Remember on this device" keep the shadow ID between visits (my recommendation: no)?
4. The address of the decline page, for example `/terms-read/` or `/saferoom/` (it must not suggest more safety than it gives).
5. Is the start chooser's copy (`src/lib/startCopy.ts`) reused for the quick nav, or written fresh?

## Build order (each a reversible step behind a switch, off by default)
1. The decline page and the plain-English page as plain components with tests (no network on decline).
2. The panel reduced to Terms with the two buttons and the link; the rhythm moved to the counter.
3. The sparkle and dock wiring with the tray switch.
4. Keyboard, screen-reader and AAA checks; then staging.
**Who:** the tray work is in the other session ("Nenya repository setup and GitHub Desktop (fork)"); `App.tsx` and `OnboardingFlow.tsx` are shared files, so the order of work between the sessions is the owner's call.
