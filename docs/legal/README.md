# Legal documents

The live Terms of Use & Privacy Policy is `src/lib/legalDocument.ts` (one source for the agreement window, the About page, and the PDF download).

`archive/` holds superseded versions as plain markdown. These files are not part of the site build, so they add nothing to what visitors download. Git history keeps every revision as well.

| Version | In effect | File |
| --- | --- | --- |
| Terms of Use (seven sections, no separate privacy policy) | until 2026-10-24 | `archive/terms-of-use-until-2026-10-24.md` |
| Terms of Use & Privacy Policy (first combined version) | 2026-10-24 to 2026-10-26 | `archive/terms-and-privacy-until-2026-10-26.md` |
| Terms of Use & Privacy Policy (adds contact messages to the optional form) | 2026-10-26 to 2026-10-30 | `archive/terms-and-privacy-until-2026-10-30.md` |
| Terms of Use & Privacy Policy (adds the optional coach demo) | 2026-10-30 to 2026-10-31 | `archive/terms-and-privacy-until-2026-10-31.md` |
| Terms of Use & Privacy Policy (adds scrubbing, safety notices, signed transcripts to the demo) | 2026-10-31 to 2026-11-01 | `archive/terms-and-privacy-until-2026-11-01.md` |
| Terms of Use & Privacy Policy (demo reachable inside the site; session colors; instruction screening) | 2026-11-01 to 2026-11-02 | `archive/terms-and-privacy-until-2026-11-02.md` |
| Terms of Use & Privacy Policy (optional hand-off of a reflection summary to the demo) | from 2026-11-02 | `src/lib/legalDocument.ts` |

When this document changes, copy the outgoing text into `archive/` (named with the date it stopped being in effect) before editing.
