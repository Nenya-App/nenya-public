# Word help for the "in your own words" fields (scope, draft for the owner, 2026-11-17)

**The ask:** wherever a lens lets someone write their own word or line, offer longer, fitting lists of words, or better, a thesaurus and dictionary, ideally through an API.

## Where the free-text fields are
Sight (name this color, color words), Sound (none now), Touch (none now), Essence (notes, feel, finish), Movement and Pattern ("In your own words", under More descriptions), the body map (place notes, if kept). All are optional and already tucked away.

## Recommendation: three layers, each optional, the first sends nothing
1. **On-device word help (default, no network).** A bundled, compact word list of related words (synonyms by sense, grouped by the lens's own families: feeling, texture, motion, taste, shape). A "Find a word" box under More descriptions: type any word, get up to twelve near words as buttons that add to the line. Source: WordNet (Princeton, permissive license) reduced to the needed words; the license text goes in `ATTRIBUTIONS.md`. Works offline, costs no requests, and sends nothing, so it needs no Terms change. Lists are reviewed so no word reads as a judgment or a slur (the slur-list rebuild applies here too).
2. **Longer fixed lists (also on-device).** Each lens's word groups grow from about 10 to 25 to 40 words, grouped and searchable, with a "Show more" button. Authored fresh, in grade 5 to 8 words.
3. **"Look it up" through a server relay (optional, per press).** The same pattern as the Sight palette: a disclosure says exactly what is sent, one press sends one word through our server, nothing else goes, nothing is logged or kept. Candidates (verify each service's current terms and rate limits at build time; do not assume):
   - **Datamuse** (api.datamuse.com): related words and meanings by word, no key. Good for the thesaurus.
   - **Free Dictionary API** (dictionaryapi.dev): definitions and parts of speech from Wiktionary (CC BY-SA, so attribution and share-alike apply to anything shown or kept).
   The relay is a Netlify function like `colors.mts` (allow-listed host, one short word, length and character checks, no cookies, a short timeout, a rate limit). The browser never calls the outside service (the site's policy is that nothing loads from other sites).

## What it needs if layer 3 is chosen
- **Terms Section 13 and the data register:** the same revision, a new processor row per service (what is sent: one word; what comes back; no retention by us). The Terms line that nothing loads from other sites stays true because the relay is ours.
- **Off by default**, behind a switch (`WORD_HELP_ENABLED`), documented in `docs/production-env.md` with a drift-test row, like `PALETTE_ENABLED`.
- **Never the coach, never a report line by itself:** looked-up words go only into the person's own line, and nothing sent to a lookup service is a sentence of theirs, only a single word they chose to look up.
- **Accessibility:** the box and results are labelled, results are a real list of buttons, the status is polite, a failure says so in plain words and the on-device list still works.

## Order (recommended)
Layer 2 first (longer lists, no risk), then layer 1 (on-device Find a word), then decide on layer 3 after using the first two.

## Decisions for the owner
1. Agree with the order above? (Recommended: yes.)
2. Layer 3: build it, wait, or never? If build: Datamuse, the Free Dictionary API, or both?
3. Which free-text fields get the box? (Recommended: all that exist, always under More descriptions.)
4. Longer-lists target (about 25 to 40 per group) and who reviews the words (you, as with the other word lists)?
