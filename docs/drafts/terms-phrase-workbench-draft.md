# DRAFT: Terms and data-register wording for the phrase workbench (2026-11-20)

Status: a draft for the owner and the integrating session. **Nothing here is in the live Terms** (`src/lib/legalDocument.ts`) or in `docs/data-register.md`. This wording goes in **only when `VITE_PHRASE_WORKBENCH=on` is set in production**, the same way other switch-shown text is handled (see `docs/drafts/terms-and-privacy-1.2.0-draft.md`, section 0). With the switch off, the page does not exist and nothing needs saying.

Status: **applied on 2026-11-20 in `src/lib/legalDocument.ts` behind `VITE_PHRASE_WORKBENCH=on`** (Sections 12, 16 and 17 of the live numbering; the draft's section numbers below are the older ones). With the switch off nothing in the live Terms changes. The register row is in `docs/data-register.md`.

## What the feature does, for checking the wording against
- The page is at `/phrases`. A person types or pastes a sentence and marks its words in their own browser. **Nothing is sent to our server or to any other site.** There is no look-up service in this build.
- Everything lives in the page for the visit and is gone when the tab closes.
- **One optional setting**, off unless the person turns it on inside the page ("Remember this sentence and my marks on this device"): the browser keeps one record, the latest sentence, its marks and their slider steps, under the key `nenya.phrases`. No time, no count, no history of earlier sentences, no identifier. It is replaced on every change, and removed by the page's Forget button, by **Forget me** and by **Emergency Exit** (every key starting with `nenya`). It is separate from the site's "Remember my settings" switch.
- The coach is not told what is marked, and the only link from the coach page is a plain button that carries nothing.
- Word lists, meanings and near words are fixed text shipped with the page.

## Section 4 (Your Privacy & Data): add one item
> **The phrase workbench** (nenya.biz/phrases), if it is switched on. Whatever you type or mark there stays in your browser and is not sent to us or to anyone else. It is gone when you close the tab, unless you turn on the setting described in Section 19.

## Section 19 (Cookies and Saved Settings): add one item
> **A kept sentence in the phrase workbench**, only if you turn on "Remember this sentence and my marks on this device" inside that page. Your browser then keeps your latest sentence, the marks you put on it and your slider steps, with no date, count or history. It stays on your device, is not sent to us, and is replaced each time you change something. The page's Forget button, Forget me and Emergency Exit remove it. If you never turn this on, nothing is kept.

## Section 14 (The Short Version) and Section 17 (What the Site Does Not Do)
- Short Version, one line to add: "The phrase workbench keeps nothing unless you ask it to, and sends nothing."
- Section 17, if it lists things the site does not do: "It does not send what you type into the phrase workbench anywhere, and it does not score, grade or keep a history of it."

## Section 19's statement about what is never kept
The live wording and `src/lib/deviceMemory.ts` say that nothing a visitor writes is kept. When this feature is on, that sentence needs the exception above ("except the one setting inside the phrase workbench, which you turn on yourself").

## Section on credits (About / Terms, wherever CNVC is credited)
The workbench's own page carries: "The Center for Nonviolent Communication © 2023, www.CNVC.org", a link to CNVC's own page for the inventory (https://www.cnvc.org/store/feelings-and-needs-inventory), and the statement that the need families follow the structure of the inventory while the words, meanings, marks and frames are this site's own. It does not copy CNVC's lists. If a layer for the needs of groups is added later, it is a project extension and not CNVC's. The note to CNVC is the owner's to send; it is not required for the page to show.

## Data-register row (for `docs/data-register.md`, to be added by the integrating session)
| Field | Text |
| --- | --- |
| Item | Phrase workbench: the person's own sentence, marks, optional slider steps |
| Where | In the page's memory for the visit. Optionally, if the person turns it on, one record in this browser's local storage under `nenya.phrases` |
| What is in it | The latest sentence (up to 400 characters), the marks on its words (kind, which words, an optional choice from our lists or the person's own word, an optional slider step 0 to 6) |
| What is not in it | A time, a counter, a history of sentences, an identifier, anything about use |
| Sent to | Nobody. No server, no processor, no coach |
| Kept for | The visit; or, if "Remember" is on, until the person turns it off, presses Forget, uses Forget me or Emergency Exit, or clears the browser's data |
| Legal basis / purpose | The person's own request (a tool they use; the setting is their own switch). No analytics |
| Switch | `VITE_PHRASE_WORKBENCH=on` (build setting; off by default) |
| Review notes | The sentence may be about another person (a message the person pasted). It never leaves the device. The page says a mark is a reading and a guess |

## Checks before switching on
1. The owner reads every word meaning in `src/lib/needFamilies.ts` and `src/lib/feelingFamilies.ts`, and the page wording in `src/lib/workbenchCopy.ts`.
2. The Terms revision above is adopted by the integrating session (and `LEGAL_EFFECTIVE_DATE` changed with the usual archive step in `docs/legal/README.md`).
3. A person using a screen reader, a keyboard and a switch tries the page (`docs/accessibility-testing-list.md`, row 14). This build was checked by tests and server renders only, not in a browser.
4. Add a line to the About answers if the owner wants one; no wording has been written for it.
