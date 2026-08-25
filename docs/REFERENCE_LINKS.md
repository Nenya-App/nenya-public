# External Reference Links

Tracks "learn more" links wired into the gateway UI — each opens in a new
tab next to a term that benefits from a real-world explainer (the way
umamiinfo.com explains umami). Add a row here whenever a new link is wired
in, and update it if a link goes dead or gets swapped.

Scope is deliberately selective, not exhaustive: only terms that are
genuinely non-obvious, contested, or benefit from a dedicated source get a
link. Self-explanatory terms (e.g. "Sweet", "Upward") don't.

| Term | Gateway / category | URL | Source | Verified live |
|---|---|---|---|---|
| Umami | Essence — Taste | https://www.umamiinfo.com | Umami Information Center | 2026-08-25 |
| Astringent | Essence — Taste | https://sciencemeetsfood.org/what-is-astringency/ | Institute of Food Technologists (Science Meets Food) | 2026-08-25 |
| Metallic | Essence — Taste | https://health.clevelandclinic.org/common-causes-for-metallic-taste-in-your-mouth | Cleveland Clinic | 2026-08-25 |
| Pungent | Essence — Taste | https://en.wikipedia.org/wiki/Chemesthesis | Wikipedia | 2026-08-25 |
| Musky | Essence — Scent | https://en.wikipedia.org/wiki/Musk | Wikipedia | 2026-08-25 |
| Fractal | Insight — Pattern | https://fractalfoundation.org/resources/what-are-fractals/ | Fractal Foundation | 2026-08-25 |
| Syncopated | Sound — Rhythm | https://en.wikipedia.org/wiki/Syncopation | Wikipedia | 2026-08-25 |
| Chromesthesia | Sight gateway subtitle | https://en.wikipedia.org/wiki/Chromesthesia | Wikipedia | 2026-08-25 |
| Audition | Sound gateway subtitle | https://bio.libretexts.org/Bookshelves/Human_Biology/Human_Anatomy_Lab/13:_The_Somatic_Nervous_System_(Special_Senses)/13.03:_Audition_(Hearing) | Biology LibreTexts | 2026-08-25 |
| Somatosensation | Touch gateway subtitle | https://www.ncbi.nlm.nih.gov/books/NBK583711/ | NCBI Bookshelf (Neuroscience and Philosophy) | 2026-08-25 |
| Kinesthesia | Movement gateway subtitle | https://open.lib.umn.edu/sensationandperception/chapter/kinesthesia-and-prorioception/ | U of MN Open Textbook Library | 2026-08-25 |
| Noesis | Insight gateway subtitle | https://en.wikipedia.org/wiki/Noesis | Wikipedia | 2026-08-25 |

Not linked (no established real-world term to point to — these read as
descriptive English rather than technical vocabulary, so no external source
applies): "Aromatic Memory" / "Atmosphere" (Essence gateway subtitle — the
codebase currently uses both inconsistently across files, worth a separate
cleanup pass), "Sonesthesia" and "Haptic Resonance" / "Hapthesthesia" were
previously used but were **not real words** — replaced throughout the
codebase with Audition and Somatosensation respectively (2026-08-25).

## Where these are wired in

- Per-term links (Umami, Astringent, Metallic, Pungent, Musky, Fractal,
  Syncopated) live in the `LEARN_MORE_LINKS` map in
  `src/app/components/TermInfo.tsx`, surfaced as a "Learn more" link inside
  that term's existing info dialog.
- Gateway-subtitle links (Chromesthesia, Audition, Somatosensation,
  Kinesthesia, Noesis) are a small external-link icon next to each gateway
  page's `<h1>` subtitle.
