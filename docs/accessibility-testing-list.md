# Running list: disability testing still to do

Kept by Claude, edited by the owner. Add to it whenever a feature is built that someone with a disability should test before it is called finished. Nothing here has been done unless it says so. The general audit list is `accessibility-audit-checklist.md`; this is the list of *people-testing* we owe.

Format: what, who should test it, what to ask, status.

| # | What | Who tests | Ask | Status |
|---|------|-----------|-----|--------|
| 1 | Report-to-coach picker (`/coach`) | Screen-reader users (VoiceOver, NVDA, TalkBack) | Can you tell what will be shared? Is "nothing chosen" clear? Is "No thanks" as easy as "Share these"? | not done |
| 2 | Color names and plain descriptions (Sight) | Blind and low-vision users; people with color-vision differences | Are names/descriptions announced, useful, not overwhelming? Is the "rough match" wording clear? | not done |
| 3 | Palette panel (keep, replace, use in Sound) | Screen-reader and keyboard-only users | Can two palettes be made and kept without a mouse? | not done |
| 4 | Inline body map | Keyboard-only and screen-reader users; motor-impairment users | Can a part be chosen and a color placed without dragging? | not done |
| 5 | Sound gateway, long melody (when built) | Deaf and hard-of-hearing users; blind users; people sensitive to loud or long sounds | Is the written description enough? Are volume, pace, stop and mute easy? | planned |
| 6 | Audio file download (when built) | Same as 5 | Is the file named and described? Does the player work on the device? | planned |
| 7 | Gateway images and alt text (when built) | Blind and low-vision users; people with cognitive disabilities | Does the alt text help choose? Is it too long? Is "describe it in my words" easy to find? | planned |
| 8 | Coach chat (cards, notices, flags) | Screen-reader users | Are new replies announced? Are notice and card order clear? | not done |
| 9 | PDF report | Screen-reader users | Is the PDF readable in order? (It is produced by a library; tagging may be limited.) | not done |
| 10 | Reduced motion / high contrast / zoom to 200–400% on every page | Low-vision users | Anything lost or overlapped? | not done |
| 11 | Plain-language read of the safety notices and Terms | People with cognitive or reading disabilities | Is it understandable at a first reading? | not done |
| 12 | Switch / voice control | Motor-impairment users | Can the whole flow be done? | not done |

Notes
- Paid testers are preferable (testing by disabled people should be work that is paid). Budget line to be added to the funding plan.
- Findings go in this table with the date and the fix; do not delete rows.
