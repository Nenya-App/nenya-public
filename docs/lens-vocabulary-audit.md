# Lens vocabulary audit (P1, read-only, English only; draft for the owner, 2026-11-17)

Nothing in the code has changed. This lists where the old word ("gateway") shows up so the rename is one switch, and proposes the one vocabulary sheet copy follows. Translations are left to real translators (owner, 2026-11-17).

## 1. Size (measured on `dev`)
- **Visitor-facing uses of the separate word "gateway/gateways" in code: 167 lines in 43 files** (identifiers like `GatewayPage`, `selectedGateways` are a different count, in `lens-rewrite-scope.md`).
- **By area (lines):** the choose page `GatewaysPage.tsx` 21; the About page `SixGateways.tsx` 17; `App.tsx` 16; the review page 10; `aboutNenya.ts` 9; the six lens pages 3 to 7 each; report text and fragments 9; `BioSocialDesign` 4; `GatewayProgress` 4; the PDF report 3; the Terms (`legalDocument.ts`) 3; `colorSchemes`, `WelcomePage` 3 each; and 25 files with one or two.
- **Public files:** `about-nenya.html` 15, `why-nenya.html` 2, `llms.txt` 1, `sitemap.xml` 1, `pdf-assets/ATTRIBUTIONS.md` 2. **Tests:** 20 files pin the word.
- **Where the word sits in what a person reads or hears:** "The six gateways" (welcome page, QuickNav), "Gateway 2 of 6" (progress label and its screen-reader text), "Choose one or more gateways" and "(3 gateways)" (the choose page), the card aria-labels ("Sight gateway: ..."), the saved-reflection copy ("Your finished gateways are kept on this device"), the start-chooser copy, the report headings, the PDF, the Terms and the data register, the AI-facing text (`llms.txt`, the about-answers corpus), and the page titles.

## 2. The sheet (proposed)
| Old | New | Notes |
|---|---|---|
| gateway / the six gateways | lens / the six lenses | "Pick up a lens", "put it down"; never "complete a gateway" |
| Reflect (door) | Reflect, now the tray | the three doors stay as the first level |
| Insight (a lens) | Pattern | the old name stays only in saved drafts (read as Pattern) |
| "Gateway 2 of 6" | "Lens: Sight, 2 of 6 looked at" or the tray states | no "of 6" order: lenses are chosen as you go |
| finish / complete / Continue | Add this to my report / Put this down | "Next" only inside a lens, between cards |
| your finished gateways | the lenses in your report | |
| "A gateway you are in the middle of is not saved" | "A lens you have not added is not saved" | |
| breathing | "the breathing tool", unchanged | the entry, not a lens |
| the coach | "the coach", described as a seventh lens held apart | |
| body map | "the body map" | one map for the whole report |
| fewer is better | "Choosing fewer can be more helpful than choosing many." | the opening line of every lens |
The word "gateway" appears nowhere in new copy.

## 3. How to do it safely (phases already in `lens-rewrite-scope.md`)
1. **One module, `src/lib/vocabulary.ts`,** holds the words. Every string above reads from it; one switch (`VITE_LENS_COPY`) flips old and new. Tests read from the module instead of pinning the word, so the rename is not 20 test edits.
2. **A scan test** fails if the old word appears in new copy, and another fails if the Terms, the answers corpus and the pages disagree (the one-vocabulary check the scope calls for).
3. **Terms:** three mentions change together with the Section 13 count sentence and the data-register row, in one revision (the same-day revision rule).
4. **Public and AI-facing text** (`about-nenya.html`, `why-nenya.html`, `llms.txt`, the corpus) are changed in the same release as the pages, so a model reading the site never sees two names.
5. **Saved drafts** keep reading the old names (v1) and write the new (v2).

## 4. Copy rules found while auditing the wireframes (apply in the module)
- First person only on controls ("Put this down", "Go back to the surface I picked"); questions and instructions speak to "you".
- One instruction, then the control; no sentence repeats the legend.
- Always say what is optional, where it is tucked ("More descriptions"), and that skipping is fine.
- Plain words, grade 5 to 8 (`readingLevel.ts`); nothing says what a color, sound or texture "means".

## 5. Decisions for the owner
1. Approve the sheet above (especially "Pattern", "lens", and the "of 6" replacement).
2. Approve doing the module and the switch first, with the visible rename a separate release.
3. Who changes the public and AI-facing files: me, in the same release (recommended).
