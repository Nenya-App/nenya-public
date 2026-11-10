# Scope: a holistic overhaul of the About pages, with the Tolkien material in the background

Status: scoping only, nothing rewritten. Written 2026-11-08 from the owner's direction: after renaming the palettes, rewrite the About pages as a whole so that the Tolkien material becomes background and not an identifying feature, and let **the name of the site carry the story**. This also folds in the earlier items for the About pages: an accuracy pass, and rebuilding them as real pages with their own addresses (`docs/about-nenya-questions-scope.md`, "The About pages as real pages").

I am not a lawyer; this plan reduces how much of the project's identity rests on Tolkien's work, and the legal questions belong to a lawyer (list at the end).

## The idea
Today the project explains itself through Tolkien: the Name & Philosophy page is built on Galadriel's ring against Fëanor's seeing-stones; the Privacy Promise draws on the Palantíri and the One Ring; the welcome page is titled with an Elvish word; the public page for search and sharing speaks to fans of the books and the Amazon series. The overhaul keeps **one honest sentence about where the name comes from** and lets everything else stand on the project's own ideas: a mirror that reflects without taking; privacy as architecture; reflection over surveillance; needs under feelings. The name "Nenya" then does the work a name can do, with its origin as a short, quiet acknowledgment and not a theme.

## The principles for every page
1. **The project's own ideas first.** Each page says what Nenya believes and does, in its own images (a mirror, water, a breath), not through characters or places from the books.
2. **One origin note, in one place.** A short paragraph (on the Name page) says the name comes from a ring in Tolkien's work, that it is used as an image, and that the project is independent and not affiliated with or endorsed by Tolkien's estate or any publisher or studio. Nowhere else needs the story.
3. **No fan-targeting.** The search and sharing pages should not court readers of the books or viewers of the series (the "Rings of Power" note and the "wellness tool inspired by The Lord of the Rings" question): they invite comparison, imply affiliation by association, and make the identity depend on the source.
4. **Accurate, and the same as the Terms.** Every claim is checked against what the site does (the 8 discrepancies already found, `docs/drafts/answers/review-notes.mts`): "will remain free" and "no premium tiers", "Nenya is a Large Language Model", "trained in NVC+", "nothing is stored" versus what the Terms say.
5. **The same voice and the same names as everywhere else**: the outward palette names; "archetypes of need"; the answers the coach gives (`src/lib/aboutNenya.ts`) must match, and the pre-written answer about the name (`n-name`) changes with the Name page.
6. **Plain and accessible.** Short pages, real headings, no wall of myth; each page readable aloud by a screen reader and translatable (`docs/translation-scope.md`).

## Page by page (the 18 About pages and the public pages)
| Page | What changes |
| --- | --- |
| **Our Name & Philosophy** | The centre of the overhaul. Rewrite around the project's idea: a mirror that shows without taking, set against the watching eye of surveillance (as an idea, no named characters). Carries the one origin note, which now **names and explains the ring** (decided 2026-11-08), the meaning "you may rest here", and a link to "What you can check" on the About page. Working text: `docs/drafts/origin-and-name-draft.md`. |
| **About: What you can check (new section)** | A short list where each claim links to the place it can be verified (source, Terms, the feature itself): open source, Forget me, Emergency Exit, the closing note, the pause. Lives here, not on the Name page; the Name page only links to it. Needs a stable anchor so the link survives the rewrite. Items that are not in production yet (the closing note, the pause) stay out until they ship. Claims and wording limits are in the draft's claim table. |
| **Mellonamin: Welcome Letter** | "Mellonamin" is an Elvish word. Retitle in plain words; keep the warmth. |
| **Our Privacy Promise** | Replace the Palantíri and the One Ring with the plain argument already there (surveillance changes how people think); fix the LLM, "nothing stored" and hex-code claims. |
| **The Pantheon of Needs** | Done (needs and focus, no character stories). Check the section titles and the footer. |
| **About the Designer** | Done in part (compassion and archetypes without the mythology); check the rest. |
| **Our Structure, Support Us** | Reword "will remain free / no premium tiers" as decided; keep Fractured Atlas and the commitments. |
| **Contact Us** | List info@nenya.biz only; keep the 2-3 business day aim. |
| **Our NVC+ Method** | Add the clear invitation for critical and dissenting feedback from NVC practitioners (decided). |
| **Chat with Nenya's AI on Venice** | "Set up with a custom prompt", not "trained". |
| **Power of Color, Six Gateways, Breathing Tool, Bio-Social Design, Evolved Leadership, Theory U, PII Scrubbing Tutorial, Partner Practice (Planned), Terms** | Read for Tolkien references and for accuracy; mostly light edits. |
| **`public/about-nenya.html`, `why-nenya.html`, link previews, JSON-LD, `llms.txt`, `manifest.json`** | Rewrite without the series note and the fan question; keep the one origin note; the sixteen-archetype description is already done. |
| **`README.md`, `ATTRIBUTIONS.md`** | One-line origin note; credits stay. |
| **The coach's answers** | `n-name` and `n-who` follow the Name and Structure pages; run the fact-check test. |

## What stays, so the story is not lost
- **The name**, as it is.
- **The origin acknowledgment**, short and honest, on the Name page, with the not-affiliated line.
- **The ideas** that came through the mythology (stewardship over possession; reflection over surveillance) stated as the project's own.

## Real pages with their own addresses
As decided in `docs/about-nenya-questions-scope.md`: each section becomes a page at `nenya.biz/<section>` (a page per section built with the rest, prerendered so it reads without scripts, with `/?about=<id>` redirected). Order matters: **rewrite first, then move**, so the new routes carry the new words and the coach's cards link to the right page.

## Order of work
1. **The origin note, the Name & Philosophy page and the About "What you can check" section.** Working drafts exist (`docs/drafts/origin-and-name-draft.md`). **The owner rewrites the naming passages** (see the note below); I check the facts and the claims.
2. **The Privacy Promise and the welcome letter** (the two most Tolkien-framed after the Name page).
3. **The accuracy pass on every page** against the Terms, with the 8 discrepancies fixed in the same edits.
4. **The public pages** (about, why, previews, JSON-LD, llms.txt).
5. **A test** that fails if a page names a character, a place or a language from the books outside the one origin note (a list, checked against the rendered pages and the public HTML, like `tests/palette-names.test.mjs`).
6. **The routes.**
7. **The coach's answers**, re-checked.

## Done already (2026-11-08)
- The owner agreed with the recommendation: **the series note and the "wellness tool inspired by The Lord of the Rings" question are removed** from the public page (the page, its structured data, and the "who it's for" clause), replaced by one line saying Nenya is an independent project, not affiliated with or endorsed by the Tolkien Estate or any publisher or studio. A test keeps them out (`tests/palette-names.test.mjs`). The rest of the public page (title, tagline, the "why the name" section, the two-makers section) still carries the Tolkien framing and is rewritten in step 4.

- Decided with the owner (2026-11-08): show the philosophy through the structure and let visitors find it; no Palantir named on the public page; the Harp of Móru not mentioned publicly for now; the project's voice, as a witness ("here is what we noticed"), with no personal or family history; the ring **named and explained**; "What you can check" lives on About and is linked from the Name page.

## A note for the owner: the naming passages are yours to write
The draft's origin paragraph and Name-page line describe the ring in brief, paraphrased words. I cannot reproduce Tolkien's story, and a retelling of it is not what the page needs. What only you can write is how the name and the stories affected you: what the ring meant, what it gave you when you needed it, and why it matters that its keeper held it for others. **To do:** rewrite the ring and name passages in your own voice, as short and as plain as you like, and keep the facts to a line (a ring of water, kept to preserve and protect, never to rule). I will check any facts you want checked, and the wording against the claim table, but the words about how it affected you are yours. Keep in mind the project's voice and the anonymity decision: say what it did for you without family or personal history.

## A private addition from the owner
The owner has an unpublished, AI-assisted rough draft of a work of Tolkien fan-fiction ("Nierilindalë", about 200 pages; dream records from August 2024 to September 2025, one per archetype, with essays and a retelling of the myth) that matters to them and appears to be where the sixteen archetypes began. It is private: nothing from it goes into the repository or the site without their say-so. How, and whether, it figures in the origin note is for the two of us to draft together: an honest "this began as a personal creative practice" can be said without naming a character, and without linking to the work. If the work were ever published or linked, that is a rights question for a lawyer, like the project name.

Update 2026-11-08: the owner shared the full draft and answered questions about the origin. The note's spine is that the name began as a refusal of technology that takes Tolkien's names for watching and control, and that Nenya is a place to rest before a crisis, with everything checkable. The draft stays private and is not mentioned publicly for now.

## Decisions for the owner
Resolved 2026-11-08: 2 (removed), 5 (the ring is named and explained, briefly), and the placement of "What you can check". Still open: 1 (the final wording, which the owner now writes), 3, 4, 6.

1. **The origin note's wording**, and whether it appears on the Name page only.
2. **Whether to remove the series note and the fan question** from the public page (recommended).
3. **The welcome letter's new title.**
4. **How far to go on the metaphors**: a mirror and a watching eye as plain images, or other images of the owner's choosing.
5. **Whether the Name page keeps a "why this name" story at all**, or only the acknowledgment.
6. **Who answers the rights questions** (below), and before what date.

## Questions for a lawyer (or Fractured Atlas's legal resources)
- Whether any of "Nenya", the ring names, or the palette names that were in use are registered for software, games or merchandise, and how the use of "Nenya" as a project name should be treated for a non-commercial, fiscally sponsored project.
- Whether the one origin note and the not-affiliated statement are enough, or what wording they should have.
- Whether the Vilya and Narya stance names (internal now, planned as labels) should be used at all.
- Whether the earlier public pages (the series note) created any exposure that the rewrite should address.

## Not verified
- The full text of the other About pages: only the ones named were read for this scope; the rest need reading in step 3.
- Any legal position.
