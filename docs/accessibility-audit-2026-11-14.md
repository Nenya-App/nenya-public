# Accessibility audit and fix pass, 2026-11-14 (WCAG 2.2, level AAA)

Method: **reading the source and the stylesheet, and scripts**; nothing here was done with a screen reader, a keyboard walk-through or a browser (a person still needs to do those; see the end). "Fixed" means changed and guarded by a test in `tests/a11y-static.test.mts` or `tests/contrast.test.mts`.

## Fixed in this pass
| Criterion | What was found | What changed |
|---|---|---|
| 1.4.6 Contrast (enhanced) | Light-theme text, gold text, destructive and Emergency Exit colors under 7:1; dark hovers on outline/ghost buttons far under | Tokens darkened or lightened to 7:1; hovers use the full accent; link button is gold text; quick-nav and Venice buttons corrected (earlier commit) |
| 1.4.8 Visual presentation | Long lines on text pages (up to about 110 characters) | Paragraphs and list items in scrolling pages capped at 80 characters (centered text left alone); no justified text anywhere (tested) |
| 2.4.1 Bypass blocks | No skip link | "Skip to main content" first on the main app and the coach, with focusable targets |
| 2.4.11 / 2.4.12 Focus not obscured | Fixed header, Emergency Exit dock and quick navigation could cover a focused control | `scroll-padding` top 5rem and bottom 6rem |
| 2.4.13 Focus appearance | Focus ring was the pale gold at about 1.45:1 in light mode, and half-strength | Every focused control gets a solid 3px outline with a 2px gap, 3:1 or more in both themes (tested numerically) |
| 2.5.5 Target size (enhanced) | Buttons 32 to 36px | Shared button 44px (small), 44px (default and icon), 48px (large); header Share 44px; Emergency Exit info button 44px (from 400px wide up); melody step buttons 44px |
| 2.5.7 Dragging movements | Body map had no way to place or move anything | Pins can be placed by click, by a button in the middle of the view, and moved by dragging **or** the arrow keys (Shift for bigger steps); Enter opens a pin, Delete removes it (new body map, see below) |
| 1.3.1 / 4.1.2 Labels | The body map note box and the custom color text box had no name | Named |
| 4.1.2 | Click-away backdrops were exposed to screen readers | `aria-hidden` on the four menu and dialog backdrops |
| 1.4.12 / text size | Text set at 9 to 11px; headings at `text-xs` | All visitor text at least 12px; no heading at `text-xs` (earlier commit; tested) |
| Gateways | Present and Wish shown together; no progress; opening cards had no Back | One at a time with a progress bar and Back buttons (earlier commits) |

**Body map (also asked for today):** pins anywhere (click, drag, keys), zoom with buttons and areas (Face, Upper body, Left hand, Right hand, Feet), a detailed face (forehead, temples, brows, eyes, ears, nose, cheeks, mouth and lips, jaw, chin), pins and face parts read in reports ("Pin 2 (near Stomach)"), the saved picture always the whole body.

## Checked and already fine
- Every `<img>` has `alt` (scripted; 0 missing). Pages declare `lang="en"`. Pinch zoom is allowed. The stylesheet honors reduced motion (3 rules). No positive `tabIndex`.
- 2.2.3 No timing: the coach's quiet timeout is the person's own choice and can be set to "Leave open"; the 30-minute ticket limit is a security limit (essential), and the page says so. Treated as met, with that exception stated.
- 3.2.6 Consistent help, 3.3.7 Redundant entry (the Present and Wish steps keep what was entered), 3.3.8 and 3.3.9 (visitors never authenticate): no failures found by reading.

## Not fixed, and why
1. **3.1.5 Reading level (AAA): lower secondary education (about grade 9).** Estimated Flesch-Kincaid grade of the text on each About page (rough: it reads the text out of the source files):
   BreathingTool 15.6, EvolvedLeadership 15.3, BioSocialDesign 15.3, HumanCenteredDesign 14.2, PantheonOfNeeds 13.8, NVCMethod 13.5, Structure 13.3, TheoryU 13.1, AboutTheFounder 12.5, VeniceChat 12.2, PrivacyPromise 12.1, SupportUs 11.2, SixGateways 11.2, PowerOfColor 11.2, Terms and Privacy 10.1, WhereWeStand 9.9; at or under 9: NamePhilosophy, PartnerPractice, HowChecksWork, Mellonamin, WitnessedConversations.
   These pages are the owner's writing. AAA allows a **plain-language summary** instead of rewriting; I can draft a short summary per page for you to edit and approve (nothing is written yet). The Terms are 10.1, close; a lawyer's read comes first.
2. **1.4.11 Non-text contrast (AA): borders** (about 1.1 to 1.5:1) and outline-button boundaries. Changing the border color changes the look of every card and input; a decision for you (a 3:1 border would be a visible, darker line).
3. **Targets under 360px wide:** the header's icon buttons still shrink to 32 to 40px on very narrow phones, because five 44px controls and the Emergency Exit do not fit in 320px without hiding something. Options: move Share and Add-to-Home-Screen into the menu on phones.
4. **Small controls outside the shared button:** native checkboxes and radio buttons (16px) sit inside labels, so the label is the target, but rows are not 44px tall; the term-info icon (14px); the slider thumbs (24px). Not changed.
5. **2.1.1 / 2.1.3 Keyboard, no exception:** the gem, drawing canvas, color pickers and the melody step were not walked by keyboard. The body map is now keyboard-operable. The drawing canvas (Movement and Insight) draws by dragging and has **no keyboard alternative**; that needs a design (for example drawing from shapes or lines placed by keys) and is not done.
6. **1.4.10 Reflow at 320px and 200% zoom, 1.4.13 content on hover,** and **1.4.9 images of text** (social images): not checked.

## What still needs a person (a short script)
Keyboard only, from the top of the main page through all six gateways (Tab, Shift+Tab, Enter, Space, arrows, Escape); a screen reader (VoiceOver on this Mac: Safari) through the welcome page, one gateway and the coach; 200% zoom and a 320px window in light and dark; read the new focus outline and skip link on staging. Send me anything that is clipped, covered or unreachable.
