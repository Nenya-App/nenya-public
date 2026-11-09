# Scope: a notice that Nenya is English-only, an invitation to translators, and a document they can work from

Status: scoping only, nothing built. Written 2026-11-08 from the owner's note: the site is presented only in English; there should be notices inviting multilingual translators, ideally pointing to an easily translatable document that is available to them.

## Where things stand
- Nenya has **no translation layer**. The page language is set to English (`lang="en"`), and the words are written straight into the screens (about 80 component files; a rough count finds about 1,300 separate runs of text in them, plus the Terms and Privacy Policy, which are already one data file, `src/lib/legalDocument.ts`).
- There is **no invitation** anywhere for people who could help. `docs/learning-modules-scope.md` section 8 already says what other languages would need for the *coach* (written per language by native speakers, detection and crisis phrases never machine-translated alone, resources per country, an evaluation per language). This document is about the *site*, and what a volunteer translator can usefully be given today.

## 1. The notice
Short, honest, and not a promise: say what is true now, and how to help. **Decided 2026-11-08 (owner): state the language situation clearly and invite contributions, but do not overpromise on what kind of contributor agreement exists, because none does yet.**

> Nenya is available in English only for now. If you read and write another language and would like to help bring it to more people, we would be glad to hear from you at info@nenya.biz. We have not set up a contributor agreement yet, so we cannot say how contributions would be credited or licensed; we would work that out with you.

- **Where:** the About menu and the page footer (every page), and a line on the coach's start screen. Not as a banner that competes with Emergency Exit or the breathing tool.
- **Not in the page's way:** no pop-up; the line is plain text and a link; it is announced like any other text; it carries `lang="en"` and the link says where it goes.
- **What it must not say:** that a language is coming, or when; that contributions will be credited, licensed or paid in any particular way; or that a translation document is available before it exists. It can say translators are welcome and that the arrangement is still to be worked out.

## 2. The translatable document
Translators should not need to read code. Three formats were considered:

| Format | Good for | Poor for |
| --- | --- | --- |
| **A plain document** (Markdown or a shared document), one section per area, a stable id before each passage | Anyone, in any editor or word processor; a person reading every sentence in context | Getting translations back into the site without a script |
| **A strings file** (JSON keyed by id; what an i18n library reads) | The site itself; automatic checks (every id present, placeholders kept) | Non-developers |
| **A translation-tool format** (PO or XLIFF, or a hosted tool such as Weblate) | Volunteer communities; review and suggestions; translation memory | Needs setting up and an account for each translator |

**Recommendation:** generate one **plain document** from the site's own text (so it can never drift from the English), with a stable id on every passage, and **also** write the strings file from the same source. A translator works in the document (or a spreadsheet export of it, one row per id: id, English, their translation, notes); a script reads their version back, checks that every id is present and that nothing in curly braces or markup was altered, and produces the locale file. A hosted tool can be adopted later without changing the ids.

**What goes in it, in order of how much help it is to a first translator:**
1. **The interface and the coach's start and closing screens**: buttons, labels, the greeting, the closing, the pause screen and quiz (once approved).
2. **The About pages and Name & Philosophy.**
3. **The Terms of Use and Privacy Policy.** A volunteer translation is a **courtesy copy**, not the agreement: the English text governs, the translated page says so, and a legal check (and Fractured Atlas's view) comes before one is shown as part of the agreement.
4. **Alt text** (`docs/brand/alt-text.md`) and the screen-reader announcements, which are text too.

**What is deliberately NOT given to volunteers as a plain translation job:**
- **The crisis resources and the phrase lists.** Resources are per *country*, not per language, and each must be checked as real and current; the phrase lists are written and tested per language by a native speaker with the subject (`docs/learning-modules-scope.md` section 8), and the lists themselves stay private.
- **The coach's instructions and its fixed sentences** (the distress, self-injury and hostile-turn wording): they carry safety behaviour and are evaluated per language before any is offered.
- **Anything the coach says in a language its model has not been measured in.** A translated interface in front of an English-only coach must say so on the coach's start screen.

## 3. What the site needs before a translation can be shown
- **A string layer:** the text moved out of the screens into keyed strings, with a small library (or a very small home-grown one), a language setting kept like the other display choices (only with "Remember on this device", erased by Forget me), and a fallback to English for any missing id.
- **`lang` on the page and on passages in another language**, so screen readers pronounce them correctly; **right-to-left** layouts if one is offered; room in layouts for longer words; plural and number forms; dates.
- **Audio:** the breathing tones are language-neutral, which helps; a recorded voice (not decided) would be per language.
- **Translations of the page's own announcements** (polite live regions, the pause countdown).
- **A test** that every id has English text, that a locale file has no unknown ids, and that placeholders match.

## 4. Credit, rights and privacy
- **Credit and license: nothing is promised yet.** The aim is to credit translators by name or handle as they choose, and that is a plan, not an arrangement: the notice and the answer say that no contributor agreement exists and that terms would be worked out with each person. The words below are what an agreement would need to settle, and the repository does not say what a contributor agreement contains, because there is none.
- **License:** the code is AGPL-3.0; the words need a clear statement of what a contributor grants (for example, that they agree their translation may be published with the site under the same terms as the English text, and that they may be credited). To be settled, and by someone who can give legal advice.
- **Privacy:** an invitation means people will write to info@nenya.biz or open a repository issue. A translator's name and email are personal information: kept only to answer, never shared; the Terms already describe the contact form.
- **Review:** a second reader for each language before it is shown, since a small error in a page about feelings can change its meaning.

## 5. Order
1. **The notice and the contact route** (no infrastructure; words and a link).
2. **The generated source document and the strings file**, produced by a script from the site's text (a read-only extraction first, so people can start while the string layer is built).
3. **The string layer and `lang` handling**, with English as the first locale.
4. **One pilot language** with a volunteer and a reviewer; the translated interface in front of the English-only coach, clearly labelled.
5. **The coach per language**, only after its own evaluation (a separate piece of work, `docs/learning-modules-scope.md`).

## Decisions for the owner
1. **The notice's wording** and where it appears.
2. **The first document format** (a plain document plus a spreadsheet export is the suggestion) and whether to adopt a hosted tool later.
3. **How people reach you:** info@nenya.biz, a repository issue template, or both.
4. **The license and credit statement** for contributors, and who checks it.
5. **Whether the Terms are translated at all** at first, and how the courtesy copy is labelled.
6. **A pilot language**, if there is a volunteer in mind.

## Not verified
- How many strings the extraction would find (the count above is a rough pattern match, not a real extraction), or how much of the text is built from pieces that would need rewriting to translate cleanly (sentences assembled from parts, plurals, text inside images and diagrams).
- Whether the site's fonts cover every script a volunteer might offer.
- Any legal position on translated Terms.
