# Scope: type a phrase, hear a melody (Solresol in the Sound gateway)

Status: scoping only; nothing built. Written 2026-11-10 from the owner's idea: bring back a Solresol translator so a person can type a phrase and get a melody, or the other way round, and link to solresol.xyz for people who want to build melodies outside Nenya.

## What Solresol is (general knowledge; check before quoting)
A constructed language published by François Sudre in the early 1800s. Every word is a sequence of one to five of seven syllables, do re mi fa sol la ti (si in older texts), so every word is already a short melody, and it was proposed to be communicable by notes, colors, gestures and signs, including to people who cannot hear or see. That is why it suits this gateway: a phrase becomes notes with no extra invention by us. The language itself is old and in the public domain; **a given dictionary or translator is not automatically so** (see licensing).

## What the owner has
`nenya-apiary/apiary/solresol/translator.py` (about 80 KB, Python): a bidirectional English/Solresol translator with a dictionary of about 700 entries (Gajewski's 1902 grammar via ifost.org.au, and an English-Solresol dictionary from datapacrat.com), plus **Apiary-specific** vocabulary and rules (retired "si", zero as "soldo", tense markers, roudo compression, hex color IDs, binary/braille encodings). The Apiary parts belong to that project and should not come with it into Nenya.

## How it would work in Nenya
1. **Phrase to melody.** The person types a few words. Each word is looked up; each found word becomes its syllables, and each syllable a note of the chosen scale (seven syllables to seven scale degrees). Word boundaries become short rests, so the melody breathes like speech. A word with no entry is shown as "no Solresol word for this" and left out, or the person picks a nearby word from a short list: nothing is guessed silently.
2. **Melody to phrase.** The notes in the slots are grouped by the rests, matched to Solresol words, and shown as possible English words ("this melody could say: ..."). Many melodies match nothing, and that is stated plainly. One word can have several meanings; all are listed, never one chosen for the person.
3. **Where it sits.** An optional step in the Sound gateway ("Start from words"), alongside the Sight-colors melody. It fills the same slots; the person can then play, change, mute and download as for any melody (see `sound-from-colors-scope.md`). The words behind the melody can be kept in the report as the person's own text.
4. **Runs on the device.** The dictionary is a lazy-loaded data file in the browser (a few tens of KB), so the typed phrase goes nowhere. Same rule as the colors: nothing is sent to a server. The report text and PDF carry the phrase and the notes only if the person chooses to keep them.
5. **The link.** A plain link to solresol.xyz, labeled as an outside site with its own terms, in the Sound gateway's help text. We do not embed or copy it. If we ever want to host something similar ourselves, we ask its author first.

## Choices that need care
- **Length.** A melody is capped (36 notes in the Sight scope). A phrase longer than that is cut with a message, never silently.
- **Scales.** Seven degrees map cleanly onto 7-note scales (Western, and the other 7-note tonal systems). Scales with fewer notes (pentatonic) would collapse syllables into the same pitch, so offer Solresol only on scales with at least seven notes, or map across octaves and say so. Check `SCALES` in `audio.ts`.
- **Classical or Apiary rules.** Keep to the classical rules (si or ti as the seventh; no retired forms) and the public sources; leave out the Apiary words.
- **Honesty.** Solresol was never in wide use; this is a playful, poetic way to hear words, not a translation service, and many English words have no entry. State that on the page. It must not be presented as a language people use to speak to each other.
- **Names and personal text.** The phrase stays on the device. If the person puts it in a report and shares the report with the coach, it goes through the same identifier scrubbing as any text.

## Licensing and permission (to check before anything ships)
- Gajewski's grammar (1902) is old enough that the text should be in the public domain; confirm the edition.
- **datapacrat.com's dictionary and solresol.xyz's tool:** their terms are unknown to me. Ask the maintainers or find the license; if there is none, either ask permission or build our own word list from the public-domain 19th-century dictionaries.
- Credit every source on the credits page, and in `ATTRIBUTIONS.md`.
- Owner's own code: confirm it is the owner's to relicense under AGPL-3.0 (it is, if written by the owner, but the dictionary data inside it is not).

## Work, in order
1. Settle the word-list source and its terms (the one blocking item).
2. Port the lookup to TypeScript (word to syllables to notes, and back), with the dictionary as a data file; no grammar engine is needed for a first version.
3. Tests: round trip for every word; unknown words reported; length cap; scale restriction; nothing sent over the network.
4. UI in the Sound gateway: the phrase box, the result list with unknown words marked, accessibility (every note named in text).
5. Report and PDF: the phrase and notes as text.
6. Terms and Privacy Promise: no new data flow, so only the credits and the "runs on your device" line.
7. Accessibility testing: add rows to `accessibility-testing-list.md`.

## Decisions for the owner
1. Is a first version "phrase to melody" only, with "melody to phrase" later?
2. Word-list source: ask datapacrat and solresol.xyz, or build our own from public-domain sources?
3. Whether the link to solresol.xyz goes live now, ahead of the feature (it needs no permission to link, only an honest label).
4. Whether an unknown word is skipped or the person picks from near matches.
5. Whether the typed phrase may be saved in the report.

## Not verified
Everything about Sudre, the historical claims about accessibility, and the licenses and sizes above comes from memory and the owner's file; none was checked against the sources.
