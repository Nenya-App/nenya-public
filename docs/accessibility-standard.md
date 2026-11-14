# Accessibility standard: WCAG 2.2, level AAA

Decided 2026-11-14 by the owner: Nenya designs to, and audits against, **WCAG 2.2 (https://www.w3.org/TR/WCAG22/) at level AAA**, for every future design. (An earlier line in this file said 2.1; the owner corrected it to 2.2 the same day.)

## What the tests hold today (`tests/contrast.test.mts`, `tests/gateway-flow.test.mts`)
- **Text contrast of 7:1 or more**, for every theme text color on every surface it is used on, in light and dark, large text included (so nothing depends on size).
- **Buttons:** default, destructive, link, and the Emergency Exit button meet 7:1; the dark-theme hovers use the full accent (a half-strength one fell below 7:1).
- **Type in proportion:** headings step down h1 > h2 > h3 > h4 (each at least 1.05 to 1.1 times the next), the smallest heading is not smaller than body text, the base size is 16px (no stale rule shrinking it), line height 1.5 or more.
- **Size floor:** no visitor-facing text under 12px (the dev-only gem bench is exempt); no heading set at `text-xs`.

## When designing anything new
1. Use the theme tokens. If a new color is needed, add it to `globals.css` and add its pairs to the contrast test **before** using it.
2. Colored text from the Tailwind palette (`text-green-600` and the like) is not allowed for words on the light page; use `text-foreground`, `text-muted-foreground` or `text-nenya-gold-text`. Palette colors are fine for decorative icons beside words.
3. Do not lower text with opacity (`opacity-70`, `text-foreground/50`); a disabled control is exempt, a hint is not.
4. A button that has a border as its only boundary still has text at 7:1. Focus rings stay visible.
5. Motion respects reduced motion; nothing flashes.

## Known trade-offs and gaps (stated plainly)
- **The light page is a mid warm gray (#DCD9D6).** To give 7:1 on it, ordinary light-mode text had to become very dark, so "muted" text is now close to the main text color: the hierarchy there comes from size and weight, not paler color. A lighter page background would give more room; that is a visual decision for the owner.
- **Borders and other non-text boundaries** are not held to a ratio (AAA adds nothing over AA here; AA asks 3:1 for a control's boundary when it is the only cue). Outline-style buttons rely on their text for identification.
- **Colors the owner's own palettes produce** (the colors a visitor picks, the Valar-inspired schemes) are the visitor's and are not checked.
- The tests read tokens and source; they do not render pages. By-eye checks of each page, in light and dark, remain with a person.

## Audit checklist, by principle (WCAG 2.2 AAA). Status is honest: "tested" means a test in this repository fails if it regresses; everything else has NOT been audited yet.
| Criterion (level) | Status |
|---|---|
| 1.4.6 Contrast, enhanced (AAA): 7:1 text, 4.5:1 large | **tested** for theme tokens and button variants (`tests/contrast.test.mts`); component-level hard-coded colors checked once by search, not guarded |
| 1.4.8 Visual presentation (AAA): line length at most 80 characters, line spacing 1.5, paragraph spacing 1.5 times the line spacing, no justified text, user-chosen colors, resize to 200% without scrolling sideways | line height tested; **the rest not audited** (the About and Terms pages have long measures to check) |
| 1.4.9 Images of text (AAA): none except the logo | not audited (the logo and PDF logos are exempt; check social images and any text in pictures) |
| 1.4.10 Reflow, 1.4.12 Text spacing (AA, in 2.1) | not audited |
| 1.4.11 Non-text contrast (AA): 3:1 for controls' boundaries and graphics that carry meaning | **known gap**: borders at about 1.1 to 1.5:1; outline buttons and some icons rely on text. To fix or accept deliberately |
| 1.4.13 Content on hover or focus (AA) | not audited |
| 2.1.1, 2.1.3 Keyboard, no exception (A/AAA) | not audited (the gem, drawing canvas, body map and color pickers need a keyboard pass) |
| 2.2.3 No timing (AAA) | **known gap**: the coach has a quiet timeout and a ticket lifetime (`chatTimeout.ts`); AAA asks for none, or that the person can turn it off or extend it. The reminder before it ends is the current mitigation |
| 2.3.2 Three flashes (AAA), 2.3.3 Animation from interactions (AAA) | breathing and gem motion respect reduced motion (tested for the kaleidoscope); a full pass on every animation not done |
| 2.4.8 Location, 2.4.9 Link purpose (link only), 2.4.10 Section headings (AAA) | the new gateway progress bar and About sections help; not audited page by page |
| 2.5.5 Target size, enhanced (AAA): 44 by 44 CSS pixels | **known gap**: buttons are 36px high (`h-9`), small ones 32px, icon buttons 36px, the header Emergency Exit smaller. Raising the sizes changes the look of every control; an owner decision |
| 2.5.8 Target size, minimum (AA, new in 2.2): 24 by 24 | believed met (smallest controls are 32px); not measured. Small inline icon buttons (the term-info icon, size-3.5) need checking |
| 2.4.11 Focus not obscured, minimum (AA) and 2.4.12 enhanced (AAA), new in 2.2 | **not audited**: the pinned Emergency Exit, the quick navigation at the bottom right and the header could cover a focused control |
| 2.4.13 Focus appearance (AAA, new in 2.2): a visible indicator of at least 2px and 3:1 | **not audited**; the default ring color (`ring`) is the pale gold, about 1.45:1 on the light page, so this very likely fails in light mode |
| 2.5.7 Dragging movements (AA, new in 2.2): a single-pointer alternative to dragging | **not audited**: the drawing canvas, body map placements and sliders |
| 3.2.6 Consistent help (A, new in 2.2) | probably met (Emergency Exit and the footer contact are in the same place on every page); not audited |
| 3.3.7 Redundant entry (A, new in 2.2) | the Present and Wish steps keep what was entered when going back and forth (tested by structure); not audited elsewhere |
| 3.3.8 and 3.3.9 Accessible authentication, minimum (AA) and enhanced (AAA), new in 2.2 | only the owner's admin sign-in uses a password; not audited. Visitors never authenticate |
| 3.1.3 Unusual words, 3.1.4 Abbreviations, 3.1.5 Reading level (AAA): lower secondary education or a simpler version | **not audited**; the About and Terms texts are long and in places advanced. Needs a reading-level pass and, where above it, a plain summary |
| 3.2.5 Change on request (AAA): no automatic context change | not audited (the Back-after-Emergency-Exit guard is deliberate and user-initiated) |
| 3.3.5 Help, 3.3.6 Error prevention (AAA) | partly (the form check explains itself; confirmations before sending anything); not audited |
| 4.1.2 Name, role, value; 4.1.3 Status messages (AA); 4.1.1 Parsing was removed in 2.2 | partly (progress bar, live regions, `aria-live` on Share and the stage line); not audited |

**How to audit:** go through the table row by row on staging, keyboard only, with a screen reader and at 200% zoom and 320px width, in light and dark; record what fails in `docs/accessibility-audit-<date>.md`; turn each fixable failure into a test where a test can catch it.
