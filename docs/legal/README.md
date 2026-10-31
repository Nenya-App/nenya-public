# Legal documents

The live Terms of Use & Privacy Policy is `src/lib/legalDocument.ts` (one source for the agreement window, the About page, and the PDF download).

`archive/` holds superseded versions as plain markdown. These files are not part of the site build, so they add nothing to what visitors download. Git history keeps every revision as well.

| Version | In effect | File |
| --- | --- | --- |
| Terms of Use (seven sections, no separate privacy policy) | until 2026-10-24 | `archive/terms-of-use-until-2026-10-24.md` |
| Terms of Use & Privacy Policy (first combined version) | 2026-10-24 to 2026-10-26 | `archive/terms-and-privacy-until-2026-10-26.md` |
| Terms of Use & Privacy Policy (adds contact messages to the optional form) | 2026-10-26 to 2026-10-30 | `archive/terms-and-privacy-until-2026-10-30.md` |
| Terms of Use & Privacy Policy (adds the optional coach demo) | from 2026-10-30 | `src/lib/legalDocument.ts` |

When this document changes, copy the outgoing text into `archive/` (named with the date it stopped being in effect) before editing.
