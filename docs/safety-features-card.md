# The safety features card, and where Emergency Exit goes

Built 2026-11-24 from the owner's approved draft (`Nenya (private)/safety-features-card-draft-2026-11-24.md`, kept outside the repo). Pre-written site text; the model never writes it, changes it or sees it. Not a promise of safety, and not reviewed by a clinician or a lawyer.

## What it says

A collapsed card, titled "Learn more about our current safety and privacy features". Opened, it says, in plain words (about grade 4 by the site's reading-level helper): what **Emergency Exit** is, where it is, what it does and what it cannot do; the same for **Forget me**; what is **not built** (no disguised app, no lock, no key that hides the page; Nenya is not a safety plan or a crisis service); **what to do if you are not safe** (the local emergency number; the help lines are in the notice); and the usual footer (early prototype, not therapy, no clinician or lawyer has reviewed it, not studied).

The words are in `src/lib/safetyFeaturesCard.ts` and nowhere else. `tests/safety-features-card.test.mts` holds the approved draft word for word and checks that the card equals it plus the listed changes.

### Changes from the approved wording (each marked for the owner to approve)

1. **Exit destination** (the owner's decision): "a Wikipedia page" became "the Google home page (google.com)".
2. **Where the exit button is**: "in the header and the footer of the pages" became "of most pages", with "On the pages that check or open a signed transcript, it floats at the top instead." Those pages (and the partner-cell page) have no header or footer, only the pinned button. "It is red" became "It is rust-colored": the button is `#89452D`.
3. **Where Forget me is**: "bottom of every page" became "most pages" (the two static pages, about-nenya.html and why-nenya.html, run no script, so the link cannot work there; see `docs/forget-me-footers.md`), and "the display settings" became "Accessibility Settings", the window's real title.
4. **What is saved**: "Nenya never saves what you write or draw on your device" gets an exception, only where "Save and return later" is switched on (`VITE_SAVE_REFLECTION`, `on` in `production-env.md`): that option keeps finished gateways, body-map placements and colors for up to 24 hours, locked with a passcode, and Forget me erases it. With the option off, the approved sentence is used as written. (The Terms, Section 16, already say this.)
5. **"no password or lock"** became "no password or lock on the page": the saved reflection has a passcode, and the sentence is about the page.

`CHANGES_FROM_APPROVED` in the constants file lists these with the reasons, and the test checks every one.

## Where it appears

- **With a safety notice about abuse** (`src/coach/FlagNotice.tsx`), closed, **under the help lines** and before "What reporting involves". That notice is shown when the site stops a message (stop tier) or softens one (soften tier, the message is sent with care), so one place covers both.
- **Which flags** (`src/lib/safetyCardRule.ts`, `shouldShowSafetyCard(flags, moduleId)`): every `abuse` flag, any kind and either tier (partner-or-family, control-or-fear, child-or-dependent, sexual, trafficking, and the older abuse rules with no kind), and the `harm-others` kind `admitted-partner`. The owner asked for the first three and the admitted-partner case; the other abuse kinds are included because the card is about a person being watched on a device, and a child, a survivor of sexual violence or a trafficked person (or someone writing about them) may be watched too. Not included: suicide, self-harm, hurting yourself on purpose, distress, and the other admissions or graphic violence (a person who has hurt a child or a stranger is not asking how to hide a visit).
- **The three coercion modules** (`coercion_name_pattern`, `coercion_steadiness`, `coercion_own_behavior`; switched off everywhere): `shouldShowSafetyCard(flags, moduleId)` already returns true for them, so when they are turned on the card has a rule waiting. Nothing renders it for a module yet: when the modules are turned on, whoever wires the reply display calls the helper with the module id and shows `<SafetyFeaturesCard />` under the reply. The list of ids is a copy of `COERCION_IDS` (so the page does not load the coach's module code); a test keeps them equal.
- **Not in the partner cell.** `CellPage.tsx` passes `safetyCard={false}`: there Emergency Exit also closes the cell with our server, so the card's "It sends nothing to us" would not be true on that page.
- It never replaces the help lines, and never appears for any other topic.

## How it is built

`src/app/components/SafetyFeaturesCard.tsx`: the heading holds a real button with `aria-expanded` and `aria-controls`; the body is a region named by the button and hidden with `hidden` while closed. No animation (the arrow turns at once), so Stop motion and reduced motion have nothing to switch off. The site's own 3px focus outline applies. Text uses the full foreground color. Native button: Enter and Space work, at least 44px high. The component takes no text from outside.

## How to change it

Edit `src/lib/safetyFeaturesCard.ts`, add the change to `CHANGES_FROM_APPROVED` (or ask the owner to approve a new wording and update the approved copy in `tests/safety-features-card.test.mts`), run `npm run check`. To change where the exit goes: `EXIT_URL` and `EXIT_PAGE_NAME` in `src/lib/emergencyExit.ts`, the same address in `public/exit-guard.js` (a test fails if they differ), and the sentence in Section 18 of the Terms (`src/lib/legalDocument.ts`; archive the outgoing text first, `docs/legal/README.md`).

## Evidence (checked against the code on `dev`, 2026-11-24)

| Statement | Where |
|---|---|
| Exit erases everything Nenya saved on the device and in the tab, then replaces the page (no history entry) | `src/lib/emergencyExit.ts` (`leaveNow`), `src/lib/deviceMemory.ts` (`wipeDevice`: every key starting `nenya`, kept palettes, the tab's agreement note) |
| Exit sends nothing | no request in `emergencyExit.ts`; `tests/safety-features-card.test.mts`. (Not true on the partner-cell page, hence the card is off there.) |
| Back to an earlier Nenya page in the tab leaves again, until the tab closes | `emergencyExit.ts` (`guardBackAfterExit`, the note `nenya.exited` in session storage), `public/exit-guard.js` |
| The exit goes to the Google home page | `EXIT_URL` in `emergencyExit.ts`; Terms Section 18 |
| Exit button: header (both layouts) and footer; on the coach page through the header; floating at the top on the verify, my-transcript and partner-cell pages and over the loading screen and the first-visit panel | `GlobalNavigation.tsx`, `AppFooter.tsx`, `CoachPage.tsx`, `VerifyPage.tsx`, `MyTranscriptPage.tsx`, `CellPage.tsx`, `App.tsx` |
| Forget me: footer link on most pages; button under "Remember on this device" in Accessibility Settings | `AppFooter.tsx`, `MinimalFooter.tsx`, `DeviceMemoryControls.tsx`, `AccessibilitySettings.tsx`, `GlobalNavigation.tsx` (dialog title) |
| Forget me erases what is kept on the device and sends nothing | `deviceMemory.ts` (`forgetMeAndRestart`, `wipeDevice({ keepOwner: true })`) |
| Nothing a visitor writes or draws is kept, except the optional "Save and return later" | `deviceMemory.ts` ("Never kept"), `savedReflection.ts`, Terms Section 16 |
| The coach sends messages through our server to an outside AI service; we do not store them | `PrivacyPromise.tsx`, Terms Section 15 |
| A sent conversation is not removed by Forget me; email us to delete it | Terms Sections 5, 15 ("Transcripts") and 19 |

## Open points for the owner

- Approve the five wording changes above.
- Terms Section 18 changed with the exit destination. The effective date was **not** moved (as in earlier same-day corrections); decide whether returning visitors should agree again. The outgoing text is `docs/legal/archive/terms-and-privacy-until-2026-11-24-b.md`.
- Existing text says Forget me is "at the bottom of every page" (Terms Section 16, the privacy page, `DeviceMemoryControls.tsx`, About answers, `public/mind-facts.txt`). As of 2026-11-24 every page of the app carries the link (`MinimalFooter` was added to the transcript pages, the partner-practice page and the coach and app steps that had no footer). The two static pages are the exception (`docs/forget-me-footers.md`), so the card still says "most pages". The Terms were not changed.
- The Google page is reached with a referrer of `nenya.biz` (the Terms say so, in the same form as before). If the owner picks a page that sets no referrer or a different ordinary page, it is one line.
