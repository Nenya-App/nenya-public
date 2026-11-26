# Visual Aid Attributions

Tracks the provenance of every third-party visual asset used for the sensory
lens representations (report PDF and, eventually, in-app). Add a row
**before** an asset is committed, not after — this file is the source of
truth for what needs crediting where the license requires it.

## No-attribution-required sources (used freely, no entry needed per asset)

These are logged once here rather than per-icon since none of them require
per-use credit:

- **Lucide** (`lucide-react`, already a project dependency) — ISC License.
  No attribution required in the UI or PDF. Full license text ships in
  `node_modules/lucide-react/LICENSE`.
- **Phosphor Icons** — MIT License. No attribution required.
- **Unsplash** photos, downloaded and self-hosted (not called live via the
  Unsplash API) — Unsplash License. Attribution "appreciated but not
  required" for this usage pattern. (Note: if we ever switch to hitting the
  Unsplash API live instead of self-hosting a chosen photo, that mode *does*
  require visible photographer + Unsplash credit — different rule, watch for
  it if this changes.)
- **Pexels** photos, downloaded and self-hosted — Pexels License. No
  attribution required.

## Attribution-required assets in use

None. The candidate pictures gathered on 2026-08-25 for a visual review were never used by the site and were removed on 2026-11-26; they and their credits are in the repository's history.

## How to add an entry

1. Confirm the exact license on the source page before downloading — terms
   drift, don't rely on memory or on what's written above being current.
2. If it's CC BY, CC BY-SA, or another attribution-conditioned license, add
   a row above with the exact credit line the license requires.
3. If it's a no-attribution source already listed above, no row is needed —
   just make sure it's actually from one of those sources.
4. Keep the credit line format close to what the source's own help docs
   specify (e.g. Noun Project wants `"Icon name" by Creator, from Noun
   Project (CC BY 3.0)` with the Noun Project portion hyperlinked).
