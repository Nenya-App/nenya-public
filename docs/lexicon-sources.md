# Lexicon sources for the detection list: what we have, the licence, and the attestation

Written 2026-11-10. No list content is in this repository, and none appears in this file. The data is in the private research folder (`~/Desktop/Nenya Research/datasets/`). The registry is `src/lib/lexiconSources.ts`.

## HurtLex, English 1.2 (downloaded 2026-11-10)
- **Source:** https://github.com/valeriobasile/hurtlex, file `lexica/EN/1.2/hurtlex_EN.tsv` (SHA-256 `a734820a…d470c`; the full record, with the other file hashes, repository commits and a fill-in checklist, is `datasets/hurtlex/PROVENANCE.md` in the research folder).
- **Licence:** CC BY-NC-SA 4.0, as stated in the repository's root README (GitHub's own detection found no LICENSE file).
- **What it holds (counts only):** 8,228 rows, 5,963 distinct lemmas; 3,360 conservative rows. The categories that matter for dehumanizing language: animals (299 conservative), negative stereotypes and ethnic slurs (148), derogatory words (975). The ethnic-slur count is modest, so **it is a base, not the whole list**: the permissive sources (Wiktionary, LDNOOBW) and reviewer additions fill the rest, as planned.
- **Level:** conservative (offensive senses only) for triggers; inclusive only to find candidates.

## How we stay within the licence
1. **Attribution.** Credit goes in `ATTRIBUTIONS.md` and the About page **before the list is switched on**. Draft text (not applied):
   > *Dehumanizing and slur detection uses a private list built partly from HurtLex (Bassignana, Basile and Patti, "Hurtlex: A Multilingual Lexicon of Words to Hurt", CLiC-it 2018; https://github.com/valeriobasile/hurtlex), licensed CC BY-NC-SA 4.0. We use the English version 1.2, conservative level only, removed entries that are ordinary words without a context cue, and added our own context rules and additions from other sources. The authors have not endorsed Nenya.*
2. **NonCommercial.** Nenya's coach is free, nothing in it is sold, and the list only offers a gentle educational card. It takes donations and is fiscally sponsored. **The owner confirms this reading**; the authors are asked (correspondence 05 C5, drafted, not sent) and so is Fractured Atlas.
3. **ShareAlike.** The derived list is **never distributed**: it lives in the site's private store, not the repository, a download or the app. (If it ever were, it would have to be CC BY-NC-SA, which cannot sit in an AGPL repository. That is a reason to keep it private for good.)
4. **Changes** are stated in the credit. **No endorsement** is claimed.

## What is not done
- The credit is not applied; the owner's confirmations in `PROVENANCE.md` are blank; the request to the authors is not sent.
- No list has been built or loaded. The next step is a script that turns the conservative level into the loader's format (`scripts/prepare-private-list.mts`), keeps the source and licence on every row, and drops entries that are ordinary words until a cue word exists. Not started.
- The same record should be made for each further source (Wiktionary, LDNOOBW, Weaponized Words) as it is added.
