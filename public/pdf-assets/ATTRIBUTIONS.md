# Visual Aid Attributions

Tracks the provenance of every third-party visual asset used for the sensory
gateway representations (report PDF and, eventually, in-app). Add a row
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

Sourced 2026-08-25 via the [Openverse](https://openverse.org) API (which
aggregates CC-licensed works from Flickr and other providers) for the
gateway visual-aid review pass. These are all CC BY 2.0 — Openverse's own
license fields, not verified against the original Flickr listing yet, so
double-check the source URL before shipping any of these. If a candidate
gets swapped for something else during visual review, remove its row here
and add the replacement instead (or delete the row entirely if the
replacement comes from a no-attribution source above).

Credit format per CC BY 2.0: `"Title" by Creator is licensed under CC BY 2.0`,
linking Creator to their profile and "CC BY 2.0" to the license URL.

| Represents | File | Title | Creator | License | Source |
|---|---|---|---|---|---|
| Essence — Taste: Bitter | `visual-aids-review/essence-taste/bitter--openverse.jpg` | Coffee beans | [jphilipg](https://www.flickr.com/photos/15708236@N07) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/15708236@N07/3577941255) |
| Essence — Taste: Sweet | `visual-aids-review/essence-taste/sweet--openverse.jpg` | honey drizzle | [missy & the universe](https://www.flickr.com/photos/33598632@N00) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/33598632@N00/3022958272) |
| Essence — Taste: Salty | `visual-aids-review/essence-taste/salty--openverse.jpg` | Crystal Heart | [geishaboy500](https://www.flickr.com/photos/49503154413@N01) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/49503154413@N01/133100456) |
| Essence — Taste: Umami | `visual-aids-review/essence-taste/umami--openverse.jpg` | making soy sauce the traditional way 生醤油 | [spinster cardigan](https://www.flickr.com/photos/84906483@N08) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/84906483@N08/8661806567) |
| Essence — Taste: Astringent | `visual-aids-review/essence-taste/astringent--openverse.jpg` | Red Wine Glass #dailyshoot | [Leshaines123](https://www.flickr.com/photos/46018453@N06) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/46018453@N06/9031746040) |
| Essence — Taste: Pungent | `visual-aids-review/essence-taste/pungent--openverse.jpg` | India - Koyambedu Market - Chili Peppers 01 | [mckaysavage](https://www.flickr.com/photos/56796376@N00) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/56796376@N00/3986954258) |
| Essence — Scent: Earthy | `visual-aids-review/essence-scent/earthy--openverse.jpg` | Nurse Log | [Nicholas_T](https://www.flickr.com/photos/14922165@N00) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/14922165@N00/7458324304) |
| Essence — Scent: Smoky | `visual-aids-review/essence-scent/smoky--openverse.jpg` | Green Smoke | [Jordan McCullough](https://www.flickr.com/photos/27752256@N05) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/27752256@N05/3380819757) |
| Essence — Scent: Spicy | `visual-aids-review/essence-scent/spicy--openverse.jpg` | Line caught ling cod tacos... (ancho chili spiced) | [ppacificvancouver](https://www.flickr.com/photos/46246687@N05) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/46246687@N05/35765839116) |
| Essence — Scent: Herbal | `visual-aids-review/essence-scent/herbal--openverse.jpg` | ~dried and bundled~ | [uteart](https://www.flickr.com/photos/47346831@N00) | CC BY 2.0 | [Flickr](https://www.flickr.com/photos/47346831@N00/4309590712) |

Three more Openverse photos came back **CC0 / public domain** (no
attribution needed, listed here only for traceability, not because credit
is required): "Lemon slices" by Thad Zajdowicz (Taste: Sour), "Silver coin
of Neapolis..." by Carlo Raso (Taste: Metallic, PDM), and "Figured flask |
Kensington Glass Works" by museado (Scent: Musky).

Everything else (all Movement, Insight, and Sound entries, plus Floral/
Citrus/Woody/Fresh/Sweet(scent)/Sharp/Ocean in Essence — Scent) came from
Lucide or Phosphor — no attribution required. Full per-item sourcing detail
(including the exact search query used for every asset) is in
`visual-aids-review/_manifest.json`.

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
