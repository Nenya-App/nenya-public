# The About pages as a thesis (2026-11-22)

The owner asked for every About page to be audited and rewritten so that, as far as possible, every empirical sentence rests on research. The working papers (protocol, ledgers, verified bibliographies, proposals, open questions) are private, kept outside the repository. What lives here is the result:

- Page text rewritten to what the sources support, at about grade 9 or lower (`gradeLevel` in `src/lib/readingLevel.ts`).
- Numbered references at the bottom of each page, through `<Cite>` and `<ReferenceList>` in `src/app/components/about/AboutReferences.tsx`. General citations (authors, year, title, journal, a free link when one exists); no page numbers.
- Rule of evidence: aim for three sources per empirical sentence (three peer-reviewed, or two peer-reviewed plus one institutional or book source). Below that, the sentence says "one study" or "we did not find", or it is cut.
- "Approach", not "method": the site no longer uses the name NVC+ in visitor text.
- Tolkien references only in the Reflection (Pattern) Lens text and the deeper About (see the site story note); each is cited by book and chapter.
- Nothing here is clinically or legally reviewed.
