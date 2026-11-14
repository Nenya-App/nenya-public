# Accessibility standard: WCAG AAA is the goal

Decided 2026-11-14 by the owner: Nenya aims for **WCAG 2.2 AAA** and keeps that as the goal for every future design.

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
