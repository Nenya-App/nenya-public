# Terms revision for the lenses and the Terms-first entry (DRAFT for the owner's edit, 2026-11-18)

**Status.** A draft, not applied. Nothing in `src/lib/legalDocument.ts` has changed. The wording is the owner's to approve. It ships in one same-day revision with the switch flips (`VITE_LENS_COPY`, `VITE_LENS_TRAY`, `VITE_TERMS_FIRST`), following the practice in `docs/hosted-model-swap-scope.md`: archive the outgoing text in `docs/legal/archive/`, set `LEGAL_EFFECTIVE_DATE` to that day (everyone agrees again), and only then turn the switches on. Each change below lists the line it replaces so the owner can see old and new together. The "facts to check" at the end must be true of the build on the day.

## 1. Words: "gateway" becomes "lens" (three places, already routed through `L()`)
No edit to the source text is needed for these three: with `VITE_LENS_COPY=on` they already read as below.
- **Palette (Section 14):** "A palette from The Color API (Sight lens, only if you press “Ask The Color API”): …".
- **Session colors (Section 15):** "…or your Sight lens colors if you came from there."
- **Save and return (Section 16):** "…keeps your finished lenses on this device…" (see 4 below, which changes this sentence further).

## 2. What we count (Section 13, the sentence about our own daily totals)
**Now:** "…They count how often each part of the site is opened, where visitors choose to start when the site asks (breathing, reflection or the coach), which breathing rhythm is chosen, and whether the tour is taken (only after you agree to these terms, and not at all if your browser sends the Global Privacy Control signal); …"

**Proposed (when the start chooser is retired and the tray is on):** "They count how often each part of the site is opened, which lenses are opened and which are added to a report (a total for each lens, never in any order and never with a time), and whether the tour is taken (only after you agree to these terms, and not at all if your browser sends the Global Privacy Control signal); …"

What changed and why:
- **Start choices dropped.** The chooser (breathing, reflection or the coach) is retired in the Terms-first entry, so the sentence stops promising a count that no longer exists.
- **Rhythm dropped.** The Terms-first panel no longer asks for a rhythm (it is chosen at the breathing counter), so nothing records it at agreement. If the owner wants rhythm counted at the counter later, the clause returns with that build.
- **Per-lens totals added.** Totals per lens only, so no count can describe one person's path (owner's rule, `docs/lens-rewrite-scope.md` section 3c).
- **Match the switches.** The sentence must match whichever of these are on the day it ships. If the chooser stays on, the start clause stays.

## 3. The working pair (Section 15, "Your session colors")
**Now:** "Two colors label the session: a random pair you can change, or your Sight gateway colors if you came from there. They are not an account, we do not store them, and they appear on any transcript you download or send."

**Proposed:** "Two colors label the session. When you agree to these terms, a random pair is made for your visit. If you choose your own colors (in the Sight lens, or from a melody in the Sound lens), those become the label instead. The pair is made new on every visit, is never stored, is not an account, and appears on any transcript you download or send."

Notes: the random pair is made from the browser's random source, held in memory for the visit, and sent nowhere except as the coach's `session` field while no colors are chosen. "Remember on this device" keeps your agreement and display settings, not the pair. Clearing site data or declining leaves nothing.

## 4. Save and return later (Section 16)
**Now:** "…“Save and return later” keeps your finished gateways on this device, encrypted with a key made from your session ID and a passcode you pick, for at most 24 hours. …"

**Proposed:** "…“Save and return later” keeps the lenses you added to your report, and a note of which others you opened, on this device, encrypted with a key made from your session ID and a passcode you pick, for at most 24 hours. …"

The sealed copy shows nothing about which lenses were opened (tested). The rest of the sentence is unchanged.

## 5. The plain-English page and declining (new, short, Section 1 or the start of Section 16)
Proposed addition (one sentence in Section 1): "A short summary in plain English is available from the first screen; it is a summary only, and if it ever differs from these terms, these terms are the binding text."

Proposed addition (one short paragraph, Section 16): "If you decline, nothing about you is counted or kept by us, and nothing is sent. Our web host still keeps its ordinary connection logs (Section 13), as it does for any visit."

(The decline page already says the second sentence on screen; this puts the same promise in the Terms so the page repeats the Terms and promises no more.)

## 6. The short version (Section 12): no change
"By default the only thing kept on your device between visits is one timestamp after a coach conversation…" stays true: nothing new is kept between visits. The working pair is not kept.

## 7. Data register rows (`docs/data-register.md`), same change
- **Daily totals:** add "including a total per lens of how often it is opened and added (no order, no time)".
- **"Save and return later":** add "(the added lenses and a note of the others opened; still sealed)".
- **New row, Working pair:** "the visitor's browser memory only | the visit | closing the tab; Forget me; Emergency Exit | nobody (shown to the visitor)".

## 8. Facts to check on the day (the facts list)
1. The Terms-first entry is on, and the chooser is off (or the start clause stays in the sentence in 2).
2. **Per-lens counts are built.** They are not built today. Needed: `lens.examined.<id>` and `lens.included.<id>` added to `BROWSER_FIXED_EVENTS` (`src/lib/counters.ts`) and the admin labels (`src/admin/labels.ts`), counted in `App.tsx` on open and on add, after agreement only and never under Global Privacy Control. Until then, section 2's per-lens clause must stay out of the Terms.
3. The rhythm is no longer counted at agreement under Terms-first (done: `App.tsx`).
4. The saved draft is version 2 in tray mode and its sealed copy shows nothing about the examined list (done and tested).
5. The pair is made at agreement and kept in memory only (done: `src/lib/shadowSession.ts`, behind `VITE_TERMS_FIRST`).
6. The plain-English page's two lines marked unverified in `src/lib/plainEnglish.ts` (`PLAIN_UNVERIFIED`) become true with sections 3 and 5 above.
7. Site answers that mention gateways, the start choice or the six-ness (`src/lib/aboutNenya.ts`, the corpus, `llms.txt`) are checked against the new Terms; the post-build script already carries the word change to the static files.

## Open for the owner
- Approve or edit the wording in sections 2 to 5.
- Whether to build the per-lens counts now (a small change, needs a go) or ship the revision without them and drop that clause.
- Whether the revision waits for the Terms-first entry or goes with the lens flip alone (each can ship without the other: section 3 and 5 belong to Terms-first, sections 2's per-lens clause and 4 to the tray).
