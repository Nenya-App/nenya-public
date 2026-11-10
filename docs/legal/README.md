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
| Terms of Use & Privacy Policy (optional hand-off of a reflection summary to the demo) | 2026-10-31 (earlier text) to 2026-11-03 | `archive/terms-and-privacy-until-2026-11-03.md` |
| Terms of Use & Privacy Policy (adds the link to continue on Venice AI and the referral disclosure; the demo's 12-hour rest and daily limit; random session colors; the opt-in "Remember on this device" switch, with Forget and Emergency Exit erasing it) | 2026-10-31 (revised in place) to 2026-11-03 | `archive/terms-and-privacy-until-2026-11-03-b.md` |
| Terms of Use & Privacy Policy (removes the optional hand-off of a reflection summary to the demo, adds a link from the reflection review page to Venice AI, corrects how the daily limit is described, notes the page-written greeting and closing, updates when you are asked to agree) | 2026-11-03 to 2026-11-07 | `archive/terms-and-privacy-until-2026-11-07.md` |
| Terms of Use & Privacy Policy (adds the web host's anonymous visit statistics, and replaces the earlier statement that Nenya has no analytics) | 2026-11-07 to 2026-11-08 | `archive/terms-and-privacy-until-2026-11-08.md` |
| Terms of Use & Privacy Policy (adds Nenya's own daily totals, the coach demo's per-connection daily limit and its one-way daily code, receipt codes and signed-only transcript reports, a six-hour rest, and a turn-based site-wide limit) | 2026-11-08 to 2026-11-09 | `archive/terms-and-privacy-until-2026-11-09.md` |
| Terms of Use & Privacy Policy (adds the respectful-use paragraphs to Section 5; names the model and describes the encryption before Venice, and says it is not encryption all the way from the device; lists every kind of site-written text in the coach demo; signed copies of a conversation the site ended; a signed transcript includes the site's greeting, closing message and safety notice and notes on why a message was flagged) | 2026-11-09 to 2026-11-10 (in dev only; never live) | `archive/terms-and-privacy-until-2026-11-10.md` |
| Terms of Use & Privacy Policy (names the two kinds of reply the site may replace with a fixed sentence, and says a signed transcript marks a replaced reply as written by the site) | from 2026-11-10 | `src/lib/legalDocument.ts` |

When this document changes, copy the outgoing text into `archive/` (named with the date it stopped being in effect) before editing. If two versions end on the same date, the later one gets a `-b` suffix.
