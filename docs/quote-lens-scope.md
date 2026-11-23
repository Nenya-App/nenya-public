# A values-based quote library as its own Lens: scope

> **Owner decisions, 2026-11-22 (these settle the rights and first-release questions below).**
> - **Rights policy A: Tier 1 only** (public domain or open licence). No in-copyright quotes: Tolkien, Sailor Moon and NVC appear, if at all, only as paraphrase and citation.
> - **Tolkien in marketing: paraphrase and cite only.** No Tolkien quotes or images in posts (the Estate's FAQ says it does not permit them in marketing, including non-profit use; Middle-earth Enterprises holds NENYA for jewelry). A short quote on the library page only if a lawyer agrees.
> - **Social posts from quotes: text only, Tier 1 sources.** No quote graphics.
> - **The Lens is called "Voices"** (no "Nonviolent Communication" or "Tolkien" in the name or the title).
> - **Data lives in a private store added at build time;** the repo holds the format, the checker and invented placeholder text. Cleared Tier 1 quotes may move to the public repo later as a separate decision.
> - **First set: a small verified seed** (about 30 to 40 public-domain quotes), each verified by the owner against her own copy before it can show. **Secular sources first; faith pages later**, each read by someone from that tradition before it goes live.
> - **Permission requests: not now.** They go on the lawyer's question sheet.
> - The LM Studio candidates (55) are NOT a source: they are model output with misattributions and rights problems. Verified quotes are rebuilt from public-domain editions.


Written 2026-11-22. **Scoping only.** No feature code was written and **no quote text is in the repository**, in this file or anywhere else. Base: `dev` at `af331a0`. Everything here is a proposal for the owner to approve, change or drop. Nothing on the site changes.

## What was and was not read

- **Read in the repository:** `docs/eight-sided-gem-scope.md` (Part 2: the ring and custom lenses), `docs/lens-rebuild-audit.md`, `docs/lens-rewrite-scope.md` (the tray), `src/lib/lensState.ts`, `src/lib/lensActivities.ts`, `src/lib/lensRing.ts`, `src/lib/deviceMemory.ts`, `src/lib/blockedCard.ts`, `src/lib/tolkienNotice.ts`, `src/app/components/about/SixGateways.tsx` (the Mirror text), `docs/production-env.md`, `tests/docs-drift.test.mts`.
- **Read from other branches with `git show`:** `docs/lens-story-nature.md` from `claude/release-candidate` (the parked Nature and Story lenses) and `docs/nvc-icarus-web-scope.md` from `claude/nvc-icarus-web`.
- **Could not read yet:** `~/Downloads/Nenya (private)/quote-library/` **does not exist** (checked at the start of this task), so the candidate extraction and the `rights/` research were not available. Nothing here depends on their content. Section 4 is a placeholder that points at the rights research, and the numbers in sections 3 and 4 (length cap, status list) are proposals to be adjusted against it. `PRIVATE_id_map.json` was not opened.
- **Not found in the repository:** the "Venice Mind" idea has one note, in `docs/venice-character-card-scope.md` ("A future item: Venice Minds"), which says it was not looked up. Section 5 says what that means here. I did not look it up either.

## 1. What the Lens is and is not

**What it is.** A way to look at what you value, through other people's words, with your own words kept. A person picks a way in (a value, a tradition, a random draw, or a word they type), is shown **one short quote at a time with its full source**, and may write in their own words what they see in it. They may then add that, and the value words they pick, to their report, or put the Lens down.

**It follows the Mirror, not the Oracle.** The Lenses take their design from the Mirror of Galadriel (J. R. R. Tolkien, *The Fellowship of the Ring*, Book 2, chapter 7, as the Six Lenses page already cites it). The Mirror shows and leaves the choice with the person. So this Lens:

- shows a quote and its source and **does not say what it means or what the person should do**;
- never says a quote is "for you", "the right one", "today's", or what the person "needs";
- never picks a quote by reading the person: the person picks the way in, or chance does;
- leaves the last word to the person's own box, which is the only thing that can reach a report.

**What it is not.**

- Not advice, not guidance, not a verdict on what a person should value, and not a daily verse or fortune.
- Not a ranking or comparison of traditions, and not a claim that any tradition, book or story is true or better. Sacred texts are not used as advice, and not as decoration for any claim about Nenya.
- Not a claim of benefit. **No study of Nenya has been done and no clinician has reviewed anything** (owner, 2026-11-22). The Lens, its About text and its report line say nothing about helping, healing or improving.
- Not a place for the Mirror text itself. The site quotes no passage of the book beyond what the owner approves. This Lens does not change that. The Mirror stays cited by book and chapter.
- Not a part of the coach. The coach never offers, picks or reads out a quote.
- Not an AI feature. No model matches a person to a quote, and nothing a person types is sent anywhere.
- Not shown when someone is in crisis (section 6).
- Not a library you can browse as a book. It shows one at a time, with the soft limit of three, like the other Lenses ("fewer can be more helpful").

**Working name.** The code id would be `quotes` and the visitor name is open (question 1). The other Lenses are named for ways of sensing; this one is closer to "listening".

## 2. The visitor flow, in plain steps

All wording below is draft, in the lens vocabulary ("Lens", "Pattern"), and checked to grade 8 or below by `src/lib/readingLevel.ts` (the quotes themselves are exempt from that check; the framing text is not).

1. **Pick it up from the tray** like any Lens (not opened, examined, included). One plain line first: "Choosing fewer can be more helpful than choosing many."
2. **Choose a way in.** Four equal choices, none the default, in a fixed order with no "recommended":
   - **By a value.** A list of value words (about 20 to 30, written fresh for Nenya; section 3 says where they live). Up to three, with the standard "Add it anyway / Keep three" notice before a fourth.
   - **By where it comes from.** A list of sources, shown in three plain groups: **Stories** (for example the Tolkien legendarium and Sailor Moon), **A method** (Nonviolent Communication), and **Faith traditions**. Within each group the order is alphabetical, never by size or by anything that looks like rank. A short line says: "Not every tradition is here. What is here is only what has been checked. Being left out means nothing."
   - **By chance.** One button: "Show me one." The draw is made on the device, from the quotes allowed by any filter the person has set (or from all).
   - **By words you type.** A box: "Type a word or two." Matching is plain and local: the typed words are compared (lowercase, stripped of endings, with the site's existing near-words help if on) with the value words and with the owner's own tag words on each record. It is **not** a search through the quote text and **not** a model. No match gives "Nothing here for that word. You can pick a value or draw one by chance."
3. **See one quote.** A card shows: the quote, then **speaker or author, work, location (chapter, scene, verse, page), the tradition or source group, the language, the translator and year if it is a translation**, and a plain line "Checked against a printed copy on [date]". Nothing else. No theme labels beside it that suggest what it means, no emoji, no picture, no image of a character.
4. **If they want another.** "Show me a different one" (section 6 says how it is paced). Never repeats one already shown in the visit.
5. **What they can write back.** Two optional things, each skippable:
   - a box: "What do you see in this, in your own words?" (length capped like other description boxes; plain text only);
   - value words (the same list as step 2, the soft limit of three), "Which of your values does this touch, if any?" **"None of these" and "Not sure" are full answers.**
6. **What is saved.** **Nothing, unless the person chooses to add it.** The box and the chosen value words live in the visit only (in memory, like a custom lens in "visit only" mode) and are gone when the tab closes. There is no favourites list, no history and no "remember on this device" in the first version (question 6).
7. **Adding to the report.** "Add this to my report" works as it does for the other Lenses (`addLens`, update in place, remove at any time). The saved shape would be `{ v: 1, items: [{ ref, own, values }] }` with at most three items, where `ref` is the quote's id plus a plain citation line, `own` is the person's own text and `values` are their value words. **The report carries the person's own words, their value words and the citation. It does not carry the quote text** (question 3 gives the other options and why this is the recommendation). Report section name would be "Quotes - Words of Others" (open; matches the "Nature - The Natural World" pattern). The coach hand-off does **not** receive this section in the first version.
8. **How it ends.** "Put this down" is in the header of every card, as on the other Lenses. A Lens put down with nothing added is "Examined, not included" in the report, exactly as the other Lenses are. There is no closing summary that interprets what was chosen, and no suggestion of a next Lens.

Cards, following the card-per-activity pattern of the parked Nature and Story Lenses (`WordCardLensCards` style): **Card 1** way in, **Card 2** the quote, **Card 3** your words and values, **Card 4** add or put down. Focus moves to each card's heading; Back and Next with "Card n of N" use the shared `LensCardNav`.

## 3. The data model and where it lives

### A quote record

| Field | What | Notes |
|---|---|---|
| `id` | Stable id | Letters, digits and hyphens. Never reused. Never contains the text. |
| `text` | The quote exactly as in the checked copy | Plain text, no HTML. Ellipses are written `[...]` and count as an edit. Original spelling kept. |
| `speaker` | Who says it | For fiction this is the **character**, not the author. |
| `author` | Who wrote it | The writer, the speaker of a talk, or "traditional" with the tradition named. |
| `work` | The book, episode, sutra, surah, talk or chapter title | |
| `location` | Chapter, verse, book and page, scene, episode and time | Whatever lets a reader find it in their own copy. |
| `group` | `story`, `method` or `faith` | The three source groups in section 2. |
| `source` | Tradition or story world, as the owner names it | Free text from an owner-controlled list, so names are even-handed and exact. |
| `language` | Language of the text shown | English only for now (matches "real translators only"; no AI translation). |
| `translator`, `translationYear` | Required when the work is a translation | Empty for an original-language English text. |
| `edition` | Publisher, edition and year of the checked copy | The copy the owner verified against. |
| `rights` | One status from the list in section 4 | |
| `licence` | The licence or permission, in a short line, with a pointer to the proof in the private store | Never a link that identifies the owner's personal accounts. |
| `length` | Word count | **Computed at build time, not typed**, so it cannot be wrong. |
| `themes` | Up to 3 value words from the Nenya list | Chosen by the owner, never by a model. |
| `tags` | Optional extra typed-search words | Owner-chosen. |
| `context` | One factual line: who is speaking to whom, or what came just before | Owner-written, no interpretation. Needed so a line is not taken as the author's view (a character may be arguing, mocking or tempting). |
| `verifiedBy` | `owner` | A fixed value, there is only one verifier. |
| `verifiedOn` | Date (yyyy-mm-dd) | Empty means **unverified**. |
| `withdrawn` | Boolean, plus `withdrawnOn` | A withdrawn quote is never shown. |
| `notes` | Private notes | **Stripped from the built file.** Never reaches a visitor. |

**Rules in the data, not only in the code:**

- No quote is spoken by or attributed to an antagonist or in a voice the site would not stand behind unless the owner marks it (`context` says so). Default: such lines are not in the library. (`VALUES_RULE` and the "Where We Stand" stance on mass violence still govern. A quote that justifies or minimises violence is out whatever the source.)
- Faith traditions are all fields identical: no extra "teaching" field, no "meaning" field, no "which is true" field.
- The value list is the owner's, written fresh. It is not copied from any published values inventory. It lives in one file and is the only vocabulary for `themes`.

### Where it lives: three options

**Option A. Public repository, with a separate content licence.** The data file sits in the AGPL-3.0 repository next to the code.
- Simple, easy to review and to build.
- **Consequences:** the repository's licence (AGPL-3.0, per `LICENSE`) is a software licence. It does not and cannot license text the owner does not own. Anyone who forks, mirrors or archives the repository would copy in-copyright text. Git history is permanent, so **a pulled quote stays in history** unless the history is rewritten, which on a public repo with forks does not truly undo it. A rights holder could object to the repository itself, not only to the site. The AGPL's source-offer promise would also suggest the quotes are freely reusable, which they are not.

**Option B. Private store, injected at build, never in the repository.** The source of truth is a private file or private repository. The build reads it (from a path or a private fetch) and writes the quote data **only into the build output**. The public repository holds the schema, loader, validator, and a **fixture of obviously invented placeholder strings** (for tests).
- Keeps in-copyright text out of the public history and out of forks. Pulling a quote is a private edit and a rebuild.
- **Consequences:** the production build needs access to the private store (a deploy token or private submodule on the build host, which is a hosting setting the owner changes, not this scope). The built site still serves the text to every visitor, so rights questions about **showing** a quote remain. Option B removes only the question of **redistributing the repository**. Builds on a machine without access (a contributor's, CI) use the fixture, so tests never need the real text.

**Option C. Private store, served per request by a server function.** The browser asks a function for a quote.
- Easy to pull instantly, and keeps text out of the bundle.
- **Consequences:** a request such as "give me a quote for value X from tradition Y" **reveals what a person picked**, which breaks "nothing about a visitor is sent anywhere to pick a quote". It can be repaired by always fetching the whole library in one request, but then it is Option B with extra moving parts and an offline hole.

**Recommendation: Option B, in two tiers.** (1) Only quotes whose rights status is cleared go into the private build input, so the site can never show a quote without a recorded basis. (2) The repository holds no real quote text, ever. If the rights research finds that a given small set (public-domain texts, or texts under a licence that explicitly allows redistribution) is safe to publish, that set **may** move to Option A later, in its own folder with its own licence file saying "not AGPL; these texts are under their own licences", but only after a separate owner decision and only for those records. Launch does not need that. Until the private build input exists, the Lens has no quotes and stays off.

A separate small public file, `withdrawn.json`, would hold **only ids** of quotes pulled, so a pull takes effect without a rebuild (section 4).

## 4. Rights policy (a placeholder) and the verification workflow

**Rights policy: placeholder.** The rights research (owner's `quote-library/rights/`, not yet readable) decides what each tradition and work allows. This section fixes only the **structure** the policy plugs into. Each status below is a proposal and its legal meaning is **not** asserted here. The research and, if the owner wishes, a lawyer decide, as the Tolkien notice (`src/lib/tolkienNotice.ts`) already says about the trademark question.

Proposed `rights` statuses (a closed list):

| Status | Can be shown? | Meaning |
|---|---|---|
| `unverified` | **Never** | Extracted, nothing checked. The starting state of every candidate. |
| `public-domain` | After owner verification | The research found the text (and, for a translation, the translation) is out of copyright where it matters. |
| `open-licence` | After owner verification | A licence that allows reuse, with its terms recorded. |
| `permission` | After owner verification | Written permission from the rights holder, kept in the private store. |
| `quotation` | After owner verification **and a second owner decision recorded** | Short quotation relying on a quotation exception, with the cap and the reasoning from the research. The weakest basis; used only if the owner decides to. |
| `refused` | **Never** | A rights holder said no, or the research found no basis. Kept as a record so it is not re-extracted. |

**Verification workflow:**

1. A candidate arrives from the extraction as `unverified`, with only the fields the extraction could fill. A model's memory of a quote is never trusted: AI-assisted extraction invents and "improves" quotes.
2. **The owner checks each quote against her own copy** (the edition she records in `edition`): the words, the speaker, the work and the location. She corrects the record to match and sets `verifiedOn`. The record carries the checked edition so a later reader can repeat the check.
3. The rights status is set from the rights research, with the licence line and a pointer to proof in the private store.
4. **A build check (new, `npm run check` runs it) refuses the build** when any record that would reach the site:
   - has no `verifiedOn`, or `rights` is `unverified` or `refused`, or `withdrawn` is true (the last is simply left out, with a count printed);
   - is over the length cap (proposal: **35 words** for an in-copyright source, **60** for a public-domain one, both adjustable once the research is read; counted by the build, not typed);
   - lacks `speaker` or `author`, `work`, `location`, `group` or `source`, or lacks `translator` and `translationYear` when the work is a translation;
   - has `themes` outside the owner's value list, or more than three;
   - contains HTML, control characters, a link, or an unpaired quotation mark;
   - is a near-duplicate of another (the repository has `src/lib/nearDuplicates.ts`).
   In a build without the private input the check runs on the fixture only, so it can never leak text into logs. Error messages print **ids**, never quote text.
5. **The owner can pull a quote at once.** Set `withdrawn: true` in the private file (rebuild applies it), and add the id to `withdrawn.json`, which the page reads on opening, so the quote vanishes **without waiting for a rebuild**. The page reads the file as one plain request that carries nothing about the visitor. If the file cannot be read, the Lens shows the library it has (a pull is then late, not lost; question 8 asks if it should instead refuse to show anything).
6. **Published list.** The Lens ends with a plain line and a page, "Where these words come from", listing every work and edition used, with credits. It lists works, not a ranking.

## 5. How it relates to existing and parked work

- **Story and Nature (parked in `claude/release-candidate`).** They are word-card Lenses where the person chooses words. This Lens is different in kind: it shows someone else's words and asks for the person's. Its **cards, switch pattern, report shape and tests copy their approach** (card-per-activity, `{ v: 1, ... }` saved shape cleaned on the way in, tray icon from the Material Symbols set credited in ATTRIBUTIONS.md, section name in the report, drop-in with `LENS_ORDER` and `lensCountWord()` so nothing counts Lenses by hand). It **does not depend on them being merged**. There is one thing to settle first: the ring and gem hold 8 built-in leaves plus up to 5 custom (`MAX_RING_LEAVES` 13). Six Lenses plus Nature and Story already fill the 8 built-in places. If those two come back, this Lens would be a ninth built-in and needs a decision on the ring (question 7).
- **The Pattern Lens** (the sixth, formerly Insight). Pattern asks a person to look at their own thinking and patterns. This Lens could look like a cousin ("look at your values") and a person might read a quote as the answer to a Pattern result. So there is **no automatic link either way**: nothing from Pattern is used to pick a quote, and a quote never appears in Pattern. A person who wants to may type a Pattern word into the box themselves.
- **The report.** It joins the way the other Lenses do (`addLens` and `reportShape`: included, or "Examined, not included"). Words-only report text, the person's own sentences, citations as plain text. The PDF may show the citation line; **no quote text and no author portrait**. The report's text goes through the same reading path as other Lens text, so the coach hand-off stays excluded until the owner decides.
- **The Mirror text on the Six Lenses page** (`SixGateways.tsx`). It already says each Lens "does not tell you what it means or what to do". This Lens fits that sentence unchanged, and the page would get one more Lens description line through `gatewaySummaries.ts`, not a rewrite. The Mirror itself is cited by book and chapter; the new Lens adds no quotation of it. The standing Tolkien independence line stays on the page.
- **The planned Lothlorien site story** (site = Lothlorien, Breathing = Nenya, Reflections = Mirror of Galadriel). This Lens is the place a story metaphor could drift into **"the Mirror tells you"**. Guard: its text never says the Lens "speaks", "answers" or "shows your fate". That story stays in the deeper About page, as decided, and is written holistically after the thesis. Nothing here waits on it.
- **The Venice "Minds" idea.** `docs/venice-character-card-scope.md` only notes the idea and says it was not looked up. **This Lens does not use Venice, any model, or the coach at all,** so there is nothing to connect. If Minds are ever scoped, the decision that no model picks quotes would need to be taken again, openly, and would change the privacy claims of section 6.
- **The NVC and ICARUS web** (`claude/nvc-icarus-web`, scoping only, nothing calls it). A quote library carries NVC quotes, and NVC concepts are nodes in that web. The two stay **separate**: the web chooses coach modules and cards on the server for the coach; this Lens never reads it, and NVC quotes carry no concept labels, so no "this quote is about the need beneath" reading is made for anyone. CNVC stays credited and linked out, per the owner's earlier decision.
- **Public pages.** The existing credit approach for CNVC, Dr. Erasmus's site, and the Tolkien standing line is reused. New credits go in ATTRIBUTIONS.md.

## 6. Accessibility and safety design

**Accessibility (WCAG 2.2 AAA, the owner's goal):**

- Framing text at **grade 8 or below**, checked by `readingLevel.ts` in a test that reads every string in the Lens's copy file (quotes excluded, since they are other people's words).
- **Screen reader flow:** each card has one heading that takes focus. The quote is one `blockquote` with its source in a `figcaption`, announced together as: quote, then "by [speaker], [work], [location], [translator]". The language is marked with `lang` where it differs from the page. Counts and changes ("Showing quote 2 of up to 5 in this visit") use a polite live region only after the person acts, never on their own.
- **Keyboard:** every control reachable and operable, visible focus, a logical order, and targets of at least 44 CSS px (the ring's own rule). No gesture-only action.
- **No auto-advance, no timers on content, no carousel.** Nothing appears or changes unless the person acts. No sound.
- **Reduced motion:** there is no motion to reduce. A new quote replaces the old with no animation at all, and focus moves to the heading.
- **Contrast** uses site tokens only; **no meaning carried by color alone**. The source group is written, never only colored.
- **Words typed:** one plain box, a visible label, errors in text, no autofill suggestion, and `spellcheck` left to the person's device.
- **Text size and reflow:** the quote card reflows at 320 CSS px and at 400% zoom with no horizontal scroll. Long quotes are capped by length (section 4) so reading never needs more than a screenful.
- **Offline:** the library file is requested **when the Lens opens**, not at page load. If it cannot be loaded, the Lens says "The words could not be loaded. The rest of Nenya still works. You can try again." and shows nothing else. Nothing is faked from memory and no partial list is shown.

**Safety design:**

- **No quote around crisis words, and none beside distress.** Four layers:
  1. The Lens is **not offered** inside the coach, in stop notices, in blocked-message cards (`blockedCard.ts`), on the crisis resources page, or in any message where the site shows crisis information. No quote is ever composed into those.
  2. If the person types words into the box that match the site's own safety and distress lists (the same local matchers the site already uses, for example `distressText.ts` and `safetyPhrases.ts`), **the Lens does not search and shows the site's standard plain notice and crisis resources instead**, with no quote on the screen. The check runs on the device and nothing is sent.
  3. Values chosen are never combined with words from other Lenses to pick a quote (no use of what a person has said elsewhere).
  4. The quote list itself is reviewed by the owner for lines about death, self-harm, suicide, abuse or despair taken out of context; such a line is **excluded from the draw and from search results** (a `held` flag in the private file, not shown to anyone) rather than relied on to be filtered by the matcher.
- **"Show me a different one" never loops fast.** A new quote needs a deliberate press. After **three** in a row in one visit a plain notice appears, in the same pattern as the soft limit on other cards: "That is three. Fewer can be more helpful. Stay with one, or look at one more?" with two buttons, "Stay with this one" and "Look at one more". The visit allows at most **seven** quotes in total, after which the button is gone and a line says so. No timers are used: the limit counts presses, so a screen reader or switch user is not disadvantaged.
- **No rewards or streaks.** No "you've seen N quotes", no badges, no sharing buttons, no copy-the-quote button in the first version (that makes the quote leave the page; question 4).
- **Even-handedness:** the same fields, order and framing for every tradition. The draw is uniform over all allowed quotes, and "by chance" within a chosen tradition draws from that tradition only. No tradition is a default. No page sorts traditions by number of quotes.
- **No faith claims by Nenya.** The page says plainly that the words are given as words of the source, not as the site's view or as advice. A rule in the copy test refuses "teaches us", "reminds us", "the truth", "wisdom" used as a claim, and "should", in the Lens's own text.
- **Privacy:** nothing a person types or picks leaves the device. No network request depends on a choice. No analytics event names a quote, a tradition or a value. The existing plain daily totals (`lens.opened.<id>`, `lens.added.<id>`) count opens and adds only, like the other Lenses, and the Terms already describe those totals "per lens".
- **No browser-stored personal data beyond existing patterns.** The first version stores nothing on the device.
- **No satire, no jabs.** The library has no joke lines, no quote used to mock a person or group, no pop-culture meme use.

## 7. Staged build plan, switches, wording, approvals

**Switch.** `VITE_LENS_QUOTES=on` (off by default in production; on in dev builds only, in `netlify.toml [context.dev.environment]` and `.env.development`, as the parked Lenses did). Read as `import.meta.env?.VITE_LENS_QUOTES === 'on'`. It also needs `VITE_LENS_TRAY=on`. With the switch off the Lens is not in the tray, the welcome list, the About page, the report or a saved draft. A row goes in `docs/production-env.md` (`tests/docs-drift.test.mts` enforces it) and a line in the README.

**Stages (each its own commit, `npm run check` exit 0 each time):**

0. **Decisions.** The owner answers section 8's questions, and the rights research and the extracted candidates are read. No code before this.
1. **Schema, validator and fixtures.** `src/lib/quoteLibrary.ts` (types, `isShowable`, `lengthOf`, the closed status list) and `scripts/check-quotes.mts` (the build check). **Fixtures use invented placeholder strings** such as "placeholder quote one". Tests: every refusal in section 4; the notes field is stripped; errors print ids only; a build with no private input passes with the fixture and shows no real text.
2. **The private input path.** Build step reading the private source into the build output only (Option B), with a test that the repository contains no real quote text (a scan that fails on any record not in the fixture). Needs the owner's decision about the private store (question 2) and, if the build host is to read it, the owner changes that setting, not this work.
3. **Pure logic.** Filter by value and source, uniform draw, no repeats, the press limit, typed-word matching, the crisis-word hold. Tests, including that a typed word that matches the safety lists never returns a quote.
4. **The cards,** behind the switch, tray and report integration (`LENS_ORDER`, `lensCountWord`, `addLens`/`reportShape`, ring and tray icon, PDF line). Tests: reading level, no banned phrases, keyboard order, the focus move, "visit only" memory, nothing saved unless added, the saved shape is cleaned on load.
5. **`withdrawn.json` and the offline message.** Test that a withdrawn id is never shown, with and without the file, and with a failed request.
6. **Accessibility pass** against the AAA checklist (`docs/accessibility-audit-checklist.md`), as source tests and the owner's own device check; the owner's rule is no browser check by me.
7. **Words and the Terms.** The Terms draft (`src/lib/legalDocument.ts`), About text (`src/lib/aboutNenya.ts` and its eval corpus), `docs/data-register.md`, the Six Lenses line, and the "Where these words come from" page. Written as drafts for the owner's approval.
8. **Dev on, owner's review**, then the owner decides about production.

**What would change in the Terms and About (all drafts for approval):**

- **Terms:** a line that the Lens shows short quotations from named sources, credited, for reflection only; that the words belong to their owners and are shown with the permission or basis recorded; that the site does not claim the words, and that anyone who owns a quote may ask for it to be removed (a contact route and the promise to remove quickly); and that **nothing a person types in this Lens is sent anywhere**. If the owner later turns on "remember on this device", the "never kept: anything a visitor writes" wording in `deviceMemory.ts` and the privacy header list change too.
- **About:** one Six-Lenses-style description line; a short statement of the Mirror-not-Oracle design for this Lens; credits (CNVC, each work and edition, translators); a plain line that **no study of Nenya has been done**; and a line that Nenya is independent of the Tolkien estate (the standing line already exists).
- **The count word** in copy ("six", "seven", "eight") follows `lensCountWord()`. Static prose that says "six Lenses" is a known gap, as with Nature and Story.

**Must be approved by the owner first (nothing starts without these):**

1. The name and the one-line description of the Lens.
2. The data location (section 3) and the private store arrangement.
3. The rights policy, from the rights research, and any use of the `quotation` status.
4. Which works and traditions are in the first set, and the value list.
5. The length caps.
6. Whether the report carries quote text or citation only, and whether the coach hand-off ever receives the section.
7. All Terms and About wording, and any use of the Tolkien material (no quotation from any Tolkien text beyond what she approves).
8. Any change to the ring, the gem's leaf count, or the order of the Lenses.
9. Turning the switch on in production, and any Netlify or hosting setting (not touched in this scope).

**Tests and the `check` command** for every stage: `npm run check` (typecheck, tests and build), plus the new `check-quotes` step added to the build.

## 8. Risks and open questions

### The five biggest risks

1. **Rights.** Most of what the owner wants (Tolkien, Sailor Moon, Nonviolent Communication) is in copyright, mostly with active rights holders, and translators and publishers hold rights in translations. There is a real chance the usable first set is small, or that a holder says no. The design is built so that a refused quote can never reach the site, but it cannot make the quotes available.
2. **Repository licence and history.** Putting in-copyright text into a public AGPL repository misstates its licence and cannot be undone by deleting later. Hence Option B.
3. **A quote used as a verdict or as advice.** Even with no interpretation, a short line from a sacred text or a story placed in front of a person at a vulnerable moment can read as personal guidance, or as the site's view. Hence the crisis lockout, the press limit, the exclusion of lines about death and despair, and the wording ban. It is reduced, not removed.
4. **Fidelity and attribution.** An AI-assisted extraction can produce a misquote, a wrong speaker or an invented citation. Putting a wrong or unchecked line into a public Lens under a named author would harm the author's name and the site's trust. Hence owner verification of every quote, with her own edition, and the build refusing anything unverified.
5. **Faith even-handedness and uneven coverage.** A library built from what happened to be extracted will have more of some traditions than others, in different translations of different status, and the stories group may look like a ranking against scripture. Hence the plain "not every tradition is here" line, fixed order, equal fields, and the uniform draw. The limit remains: some traditions may be absent simply because no usable text was cleared.

(Smaller: the ring and gem having no free built-in leaf; scope drift into advice-giving; a "withdrawn" file not reaching a stale cached page; the owner being the single verifier and the single bottleneck.)

### Questions for the owner

Each has options, my recommendation first.

**1. What should the Lens be called?**
- **(a) Words** (recommended). Plain, says what it is, no claim.
- (b) Echo. Gentler, but suggests the Lens answers back.
- (c) Voices. Warm, but it may read as a spiritual or oracle claim, and suggests the quotes are people speaking to the visitor.

**2. Where should the quotes live?**
- **(a) A private store injected at build, never in the repository** (recommended; Option B). Needs the owner to decide how the build reaches the private files.
- (b) The public repository, in its own folder with its own licence file, for **cleared** quotes only. Easier, but permanent in history.
- (c) A server function that serves the quotes. Pulls instantly but sends a person's choice to a server, so I do not recommend it.

**3. Should the report carry the quote's words?**
- **(a) Citation only: the person's own words, their values and the citation** (recommended). Smallest copy of the text, keeps in-copyright text out of exported files.
- (b) The quote and citation, only for quotes whose status allows copying (public domain, open licence, permission that covers it).
- (c) The quote and citation for all showable quotes. Reads best, copies the most.

**4. Should there be a "copy this quote" button?**
- **(a) No, not in the first version** (recommended). The text stays on the page.
- (b) Yes, for the same set as 3(b), with the citation included automatically.

**5. What should the first set cover?**
- **(a) Start with whatever the rights research clears, even if it is only some faith texts and a few works, and add Tolkien, Sailor Moon and NVC only when permission or a basis exists** (recommended).
- (b) Wait until the full intended mix is cleared, so the Lens opens as the owner pictured it.
- (c) Start with the owner's own favourite quotes from the intended mix, with a "quotation" basis, and let the research follow. This is the riskiest, as it puts the weakest basis first.

**6. Should a person be able to keep anything on their device?**
- **(a) No, not at first** (recommended). The Lens keeps nothing unless added to a report; no favourites list.
- (b) "Remember on this device" for the person's own notes only (not the quotes), after the privacy header wording is changed and approved.
- (c) A favourites list of quote ids. I would not do this: it makes a list of what the person finds meaningful, which is personal data.

**7. How does it fit the ring and gem if Nature and Story return?**
- **(a) Decide Nature and Story first; if they stay parked, this is the seventh and fits** (recommended). Nothing in the ring changes.
- (b) If all return, raise the built-in count to nine and let the ring and gem rules (`MAX_RING_LEAVES`) adjust, with the 8-sided gem needing a separate decision.
- (c) Make it a Lens in the tray that has no leaf of its own and is reached from the tray only. This breaks "one leaf per Lens".

**8. If `withdrawn.json` cannot be read, what should the Lens do?**
- **(a) Show the library it has, because a late pull is rare and a blank Lens costs a visitor** (recommended).
- (b) Show nothing and say it cannot check. Safest for rights, but the Lens stops whenever the file is unreachable.
- (c) Skip the runtime file and rely on rebuild and deploy only. Simpler, but "pull at once" is then minutes, not seconds.

**9. How should "by words you type" match?**
- **(a) Plain local matching against the value words and the owner's tag words only** (recommended). Predictable; nothing sent; no model.
- (b) Also match against the quote text, locally. More results, but a typed word can pull up a quote nobody chose it for, including lines about death or despair.
- (c) Drop typed words, and keep value, source and chance. Simplest, but loses a way in the owner wanted.

**10. How are quotes by antagonists or characters who are wrong handled?**
- **(a) Left out by default; the owner can include one with a `context` line that makes the speaker clear** (recommended).
- (b) Included freely with speaker and context always shown. More of the story's range, higher risk of misreading.
- (c) Only the author's own words in nonfiction, none from characters. Cleanest, but leaves out most of Tolkien and Sailor Moon.

**11. How are crisis words handled in the typed box?**
- **(a) Stop, show the site's standard notice and resources, show no quote** (recommended).
- (b) Show the notice and also let the person continue to draw by chance. Respects choice more, but a quote may appear beside distress.
- (c) Do nothing special, since the person is choosing for themselves. I do not recommend this.

**12. May the coach ever mention that the library exists?**
- **(a) No, never; the coach does not know about it** (recommended). Keeps the Lens off the coach path and out of any crisis conversation.
- (b) A plain pointer ("there is a Lens that shows words from other people"), no quote, never in a stop notice.
- (c) The coach may offer a quote in a conversation. I would not do this: it is the Oracle the site says it is not.

**13. Should the Lens be built before the thesis and the Lothlorien About rewrite?**
- **(a) Scope and rights first, build later, after the thesis** (recommended). The wording needs the story set.
- (b) Build behind the switch now, write the About wording after.
- (c) Park the idea until the study of Nenya exists (none has been done).
