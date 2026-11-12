# Re-scope: abuse detection, with ETHOS (and MetaHate) as evaluation sets

Written 2026-11-12. Replaces the plan order in `docs/triggers-and-escalation-checkin.md` (section 5) where they differ. Nothing here is built. No dataset text is in this file or in the repository.

## 1. What ETHOS is (from its GitHub page, read 2026-11-12)
- **ETHOS** ("multi-labEl haTe speecH detectiOn dataSet"; Mollas, Chrysopoulou, Karlos and Tsoumakas, *Complex & Intelligent Systems*, 2022, DOI 10.1007/s40747-021-00608-2). Social-media comments.
- **Binary file:** 998 comments, 565 without hate speech and 433 with it.
- **Multi-label file:** the 433 hate comments, with eight labels: *violence* (incites violence or not), *directed vs. general* (a person or a group), and six categories: gender, race, national origin, disability, religion, sexual orientation.
- **Licence:** GNU GPL-3.0; the page asks research use to cite the paper.
- **Not stated on the page, so to check in the repository and the paper before relying on it:** the language (I believe English), where the comments came from, how they were labelled (I recall crowd annotation with a score, not verified), and whether the labels are majority votes.

## 1b. MetaHate, the second candidate (from its Hugging Face page, read 2026-11-12)
- **MetaHate** (Piot, Martin-Rodilla and Parapar, ICWSM 2024): a **meta-collection of 36 English hate-speech datasets**, about 1.23 million posts (1,084,236 in the public part), a binary label (0 not hate, 1 hate), with the source dataset and platform recorded per post. Sources include Davidson 2017, Founta 2018, SemEval-2019, OLID and the Jigsaw/Kaggle collections. ETHOS may be among them (not checked).
- **Licence and access:** CC BY-NC-SA 4.0 with separate Terms of Use; **gated** (Hugging Face sign-in, and full access needs emailed agreements to nine source datasets' terms). The public subset is what we could use without those.
- **Use:** research, analysis or education, handled responsibly. No stated bias or annotation limits on the page (the paper must be read).
- **Where it helps:** its size gives a **false-alarm rate on ordinary text** with a tight interval, which ETHOS's 565 non-hate comments cannot. It also lets us read the rate **by source and platform** (the binary label is the same everywhere, so differences show which sources the matcher reacts to).
- **Where it does not:** binary only, so no category, no violence label, nothing about dehumanization or denial. **Its labels are the least reliable of the three uses**: it unifies datasets with different definitions of hate (some label abuse or offensiveness as hate), so a "hate" comment the matcher misses may not be our category at all. Use the **non-hate half for false alarms**; do not read the catch rate as meaning anything on its own.
- **Handling:** the same as ETHOS (private research folder, never in the repository, counts only, no training), plus: **a sign-in and sharing of the owner's Hugging Face information** to get it, which is the owner's step; and the NC-SA point applies at larger scale (we never distribute; the owner confirms the reading, as with HurtLex).
- **Order:** ETHOS first (small, labelled, readable by hand); MetaHate's public subset second, for the false-alarm rate only.

## 2. What it changes, and what it does not
| | Before (the plan of 2026-11-10) | Now |
| --- | --- | --- |
| The list | A word list from HurtLex, Wiktionary and LDNOOBW, checked by reviewers | **Unchanged.** ETHOS is not a word list; it has no lemma, severity or cue-word columns. |
| The evaluation | Hand-written scripts, written first, "the false-alarm cases" | **Adds a real-text test**, so the matcher and the list are measured on comments written by strangers, not only by us. |
| Severity calibration | Counselor and advocate, using the Rabat questions | **Adds a cross-check**: ETHOS's *violence* and *directed* labels are two of the three things we can read (content, intent, a call to act). |
| Training | Not offered; conversations never used to train | **Unchanged.** ETHOS is used only to measure. No model is trained or tuned on it. |

ETHOS tells us about **hate speech**. Our category is narrower and different: dehumanizing language, removal of a group, justification or denial of mass violence (`triggers-and-escalation-checkin.md`, sections 4 and 4b), plus abuse aimed at the coach. So it is a **partial** measure: the *violence* label overlaps our harm-to-others path, and the *race*, *national origin*, *religion*, *gender*, *disability* and *sexual orientation* labels give us comments to see which our matcher flags. It has **no label for dehumanization, for denial, or for abuse directed at an AI**, and no examples of the people we must not flag.

## 3. How it is used (offline, in the private research folder)
1. **Store it in the private research folder** (`~/Desktop/Nenya Research/datasets/ethos/`), with a `PROVENANCE.md` in the style of the HurtLex one: repository commit, file hashes, licence, citation, date. **Never in the repository**, never in a test fixture, never printed to the screen or into a report in full. Counts and comment numbers only.
2. **The licence.** GPL-3.0 is a software licence, and its application to a dataset is unsettled. We do not distribute the data and do not build it into the site, which is the safe place; the repository is AGPL-3.0 and stays free of it. Asking the authors in writing (one line, with the HurtLex email) is cheap and I recommend it. The owner reads the licence file and the paper's data statement first.
3. **A script** (`scripts/eval-ethos.mts`, not written yet) that runs the matcher over the file and reports only counts:
   - the share of the 433 hate comments that match anything, by label (race, religion and so on) and by *violence* 0 or 1;
   - the share of the 565 non-hate comments that match (the **false-alarm rate on ordinary text**);
   - how often a match comes from a word that also appears in a non-hate comment (a reading of which list entries cause the false alarms; entry ids, not text);
   - the same with and without the cue-word and neutral-identity guards, to show what the guards buy.
4. **The target is the false-alarm rate first**, not the catch rate. A coach that offers a card to an ordinary comment is worse than one that misses a slur. Set the bar before running (for example, "at most 2 in 100 of the 565 non-hate comments"), so the result cannot move the bar.
5. **Reading the misses is not the goal.** A hate comment that does not match is expected (the list is words; most hate is context). Do not add entries to the list *because* of ETHOS comments, which would overfit the measure; add them from the vetted sources and reviewers.

## 4. What ETHOS cannot do, and the work that stays ours
- **The must-not-count set** (a quote, a report, a survivor, a historian, a student, a sincere question, grief). ETHOS has none. These are written by hand with a counselor and an advocate, and they are more numerous than the true triggers. This is still the most important set.
- **Multi-turn boundaries scripts** (acknowledge, challenge, end). ETHOS is single comments.
- **Abuse aimed at the coach** (already built): no dataset here.
- **Denial and justification of mass violence** (the new category): hand-written patterns and a handful of review cases; ETHOS's *violence* label is near it, not the same.
- **A small size.** 433 hate comments are enough to estimate a catch rate roughly (about plus or minus 5 points) and a false-alarm rate on 565, not enough to measure a single category (disability, for example, may have only a few dozen). Report intervals; do not read a category with fewer than about 30 comments.
- **Age and platform drift.** Social-media comments from a few years ago differ from what people type into a reflective coach. The matcher's behaviour on our own scenes is the main test; ETHOS is a second opinion.

## 5. Order of work (replaces section 5 of the check-in)
1. **The evaluation set first** (hand-written must-not-count scenes, multi-turn scripts) and the **ETHOS script**, both before any list is loaded.
2. Send the HurtLex authors' and Fractured Atlas emails (already drafted; the owner sends), adding one line to the ETHOS authors if you want one.
3. Build the permissive base (Wiktionary, LDNOOBW) with source and licence per row, and let the reviewers read the HurtLex packet.
4. **Run the ETHOS script on the matcher with the base list**; look at the false-alarm rate by entry; fix entries and cues (from vetted sources and reviewers).
5. Ladder levels 1 and 2 (acknowledge, challenge, educate) before level 3 (ending).
6. The denial-and-justification category once the wording is approved.

## 6. Decisions for the owner
1. Is an offline, count-only use of ETHOS with no training and nothing in the repository acceptable to you? (I think it is the safest use; I would not use it any other way.)
2. The false-alarm bar before the first run (my suggestion: at most 2 in 100 on the non-hate half).
3. Use MetaHate's public subset for the false-alarm rate, after ETHOS? It needs your Hugging Face sign-in. And email the ETHOS authors about use in a counted, offline evaluation of a nonprofit tool, or rely on the licence?
4. Should the first run happen before or after the reviewers read the HurtLex packet? (I recommend before: it shows how noisy the raw list is and gives the reviewers something to correct.)

## 7. Not verified
Everything under "what ETHOS is" comes from its GitHub page (via a summary) and my memory of the paper; the language, the source of the comments, the annotation method and the exact file names must be read in the repository. I did not download anything.

## 8. Decisions of 2026-11-12 (owner)
- **The matcher stays on the server.** The list stays private and is never shipped to the browser.
- **Wiktionary's slur and derogatory-term categories are in the base**, beside HurtLex (conservative level) and our own target-neutral patterns, with source and licence recorded per row (CC BY-SA; credit goes in `ATTRIBUTIONS.md` before the list is switched on, as for HurtLex). Not yet built: a script to pull the categories (counts only), like `scripts/prepare-hurtlex.mts`.
- **A ToxiGen model on the server, for the witnessed side only** (screening a conversation a person has chosen to send, before a human reads it for the public page). Scope, to be confirmed before building:
  - **Role:** a flag that sends a conversation to closer human review. Never an automatic decision to show, hide or reject; never used on live coach messages.
  - **Fit:** the witnessed flow is not interactive, so a slow start is acceptable, and it can run in a background function (longer time limit than a normal one) rather than the relay.
  - **Size is the constraint.** A RoBERTa-base model is roughly 125 MB as an int8 ONNX file plus an ONNX runtime for Node, against Netlify's function size limits (about 250 MB unzipped, from memory; verify). It may fit; a distilled model fits more easily. The model could also be kept in Netlify Blobs and loaded at start, instead of in the bundle.
  - **Privacy:** it runs in the function's memory; no text goes to a third party; nothing is stored. The Terms line for sending a conversation (terms-transcripts-draft, section 1) should then say a machine also screens it before a person reads it.
  - **Licence:** check the ToxiGen model's card and the dataset's licence (I recall MIT; not verified), the conversion to ONNX, and the training-data terms. We do not train or tune it.
  - **Evaluation:** measure it on ETHOS and the hand-written scenes first; report its false-alarm rate like the matcher's.

## 9. HateCheck, added 2026-11-12 (downloaded to the private research folder)
`datasets/hatecheck/` (with `PROVENANCE.md`): 3,728 cases in 29 functional tests, CC BY-4.0, each case labelled hateful or non-hateful, with the target group. It is **the best of the three for our must-not-count set**, because whole functionalities are the cases we must not flag: quoted hate (`counter_quote_nh`, 173), denouncing it (`counter_ref_nh`, 141), reclaimed slurs (81), slur-lookalike words (30), neutral and positive identity statements (126 and 189), negated hate (133), profanity not aimed at anyone (100), and abuse aimed at an object or an individual (65 and 65). Its hateful side tests the matcher's reach: slurs, dehumanizing comparisons (`derog_dehum_h`), threats, and evasion by spelling (leet, deleted, swapped and spaced characters).
- **Our test:** run the matcher over it and report, **per functionality**, the share flagged. The non-hateful functionalities should be near zero; the evasion ones show what the leet fold and spacing handling buy. Counts and case ids only.
- **Caveats:** its notion of "hateful" includes profanity aimed at a group and implicit slights that are outside our category, so a hateful case the matcher misses is not automatically a miss for us; read the dehumanizing, threat and slur functionalities as the ones that matter. It covers seven groups, not every group our target-neutral patterns cover. Synthetic templates, so real text is messier (hence ETHOS and MetaHate).
- **Next:** `scripts/eval-hatecheck.mts` (with the ETHOS script, one shared runner); the bar for the non-hateful functionalities is set before the first run.

## 10. The evaluation runner, and its first run (2026-11-12)
`scripts/eval-detect.mts` runs the site's real detection (the private list's matcher, the history patterns and the card-offer rule with its reporting-frame guard) over HateCheck (and ETHOS and MetaHate when they are in `datasets/`), and prints **counts only** (per functionality, with 95% intervals); `--json` writes the counts and false-alarm case numbers (no text) to `results/public/`. `--no-list` runs the history patterns alone. "Flagged" = the coach would offer a card; "any hit" = the matcher found something at all.

**Bars, set before the first run:** at most **2%** of the non-hateful cases flagged overall (and any single non-hateful functionality above 5% is marked for a look).

**First run, with the HurtLex-derived list exactly as prepared (not yet reviewed by the counselor and the advocate), against HateCheck:**
- **Non-hateful: 167 of 1,165 flagged (14.3%). The bar is not met.** The list as it stands is too eager, as expected of a machine-translated, unreviewed lexicon.
- **Where it fails:** profanity not aimed at anyone 38%; reclaimed slurs 47%; denouncing hate 32%; slur lookalikes 20%; abuse aimed at an individual 17% and at an object 14%; negated hate 10.5%. Where it holds: quoted hate 0.6% (the reporting-frame rule does its job), neutral and positive identity statements 0%.
- **Hateful (reading only): 320 of 2,563 flagged (12.5%), any hit 53.5%.** Many "any hit" cases never reach "flagged" because of the severity floor, the cue requirement and the reporting frame; threats and implicit derogation are not caught by words at all (0% on three of those functionalities), which is the case for the model and the history patterns.
- **What it says:** the "derogatory words" and profanity-like rows (the largest HurtLex category taken, 974 rows) are the main source of false alarms; the reviewers' pass must cut or cue them. Denouncing and reclaimed use are the contexts the reporting rule does not reach; the model is the natural second signal there.

**Next:** (1) a per-entry attribution (which list rows cause the false alarms, by row number only, never printed words) so the reviewers' packet can start with the worst offenders; (2) re-run after each list change and record the result row here; (3) ETHOS and MetaHate files into `datasets/` (ETHOS is a plain download; MetaHate needs the owner's Hugging Face sign-in) and rerun.

### 10b. Attribution of the false alarms (`--attribute`, 2026-11-12)
Row numbers and counts only on screen and in `results/public/detect-attribution-2026-11-12.json`; the words are in `results/private/detect-attribution-2026-11-12.csv` for the reviewers.
- **Only 47 of the list's 2,218 rows cause any false alarm on HateCheck** (51 flag anything at all), because HateCheck uses a small vocabulary. **None of the 167 false alarms comes from the history patterns.** 13 rows only ever flag false alarms; they are the first to review.
- By category: slurs 30 rows (170 false alarms), harassing insults 16 rows (94), dehumanizing metaphors 5 rows (37). By severity: 2 → 170, 1 → 131.
- **The same rows drive the catches.** Removing the 10 worst rows takes false alarms from 14.3% to 7.7% but loses 70 of the 320 hateful flags; the 40 worst gets under the bar (1.5%) but keeps only 96 of 320. **Editing the list alone cannot meet the bar without giving up most catches**: the false alarms are mostly the same words in denouncing, reclaimed, negated, profane-but-not-aimed and individual-target uses. That context is what a model reads and a list cannot, and it is the strongest argument yet for the `screen` model as the second signal, and for a stricter rule that a list hit alone never flags without a context signal.
- **Next:** review the 13 only-false-alarm rows and the worst 25 (reviewers read the private CSV); then try a stricter combination rule on this runner before any model exists (for example, require the cue or a second signal for severity-1 rows), and record each result here.

### 10c. The reviewers' decisions file, and the second run (2026-11-12)
**Built:** `src/lib/lexiconDecisions.ts` (tested with invented words, `tests/lexicon-decisions.test.mts`). A private CSV (`term,action,note`, kept at `datasets/hurtlex/list/review-decisions.csv`, never in the repository) says what to do with a **term**, across every row that has it: `drop`; `slur` (one row, severity 2); `model` (kept, marked `needs-model`: the list alone never offers a card for it, a model reads the context); `judgment` (one severity-1 row, only when a word for a person is within eight words: a blame word aimed at someone, for a gentle reply, never a boundary and not a "slur" however HurtLex filed it). `loadLexicon(csv, decisions)` applies it; `offerFor` skips `needs-model` hits; the runner applies the file by default (`--no-decisions` shows the list as prepared) and now reports **judgment** and **left to the model** beside **flagged**. The HurtLex-derived rows are untouched, with their provenance.
**The first 29 decisions (owner's review of the false-alarm rows):** 2 dropped, 4 identity slurs kept, 5 reclaimed or homonym slurs to the model, 18 blame or judgment words.
**Second run, HateCheck (hash of the decisions file printed by the runner):**
- **Non-hateful flagged: 6 of 1,165 (0.5%, bar 2%: met).** Judgment replies on 87 (7.5%) and left to the model 51 (4.4%).
- **Remaining flagged non-hateful** are denouncing uses of real slurs (4.3% of that functionality), which the model should read.
- **The catch rate fell with it, honestly:** hateful flagged 25 of 2,563 (1.0%), plus judgment 195 (7.6%) and to the model 15 (0.6%). On HateCheck's `slur_h` functionality the list flags 12.5% (19.4% before) and leaves 6.9% to the model; any hit is 36%.
- **What this shows:** the bar is now met by **not flagging** the ambiguous words, not by reading context. **Recall on slurs is the open problem**: the list reaches only about a third of HateCheck's slur cases even by "any hit", and most hateful cases there are profanity and judgment words that now give a gentle reply or nothing; threats and implicit derogation are unreached (0%). The measures to move are the model's catch on `slur_h`, `derog_dehum_h`, spelling evasions and threats, and the list's coverage of slurs for groups the HurtLex categories handle poorly (women, trans people, Muslims, immigrants; HateCheck's seven groups).
- **Also seen:** denouncing uses still draw the judgment reply on 24.8% of that functionality ("calling someone X is wrong"), so the reporting-frame rule should be widened to denouncing and negation.
**Next:** (1) widen the frame rule and re-run; (2) the reviewers' pass on the rest of the severity-2 "slur" rows that are not identity slurs (the same mis-filing as `stupid` and `trash` likely affects rows HateCheck did not touch), which needs a worksheet; (3) slur coverage for the groups HurtLex handles poorly, from Wiktionary and reviewer additions; (4) the model bake-off.

### 10d. The wider frame rule, and the third run (2026-11-12)
**Built (`src/lib/learningOffer.ts`, tested with invented words):** `DENOUNCING` (condemning or challenging the act of saying or calling: "not okay to be calling...", "why would you call me...", "people saying... need to stop", "call out", "says a lot about you"), `negatedBefore` (the hit follows a negation in the same clause: "not at all X", "never said X", "the opposite of X"; a negation in an earlier clause does not hide a later word), and `isFramed` (the old reporting rule or the new denouncing rule). `offerFor` and the runner's judgment outcome use them; plain use ("they are all X", "you are not welcome, you X") still offers.
**Third run, HateCheck:** non-hateful flagged **0 of 1,165 (0.0%, [0.0-0.3])**; judgment replies on denouncing fell from 24.8% to 5.0% and on negation from 8.3% to 0%. **Cost:** hateful flagged 25 to 19 of 2,563, judgment 195 to 153: six hateful cases (three in `slur_h`, three in the leet-spelled set) are now read as framed or negated. Those need a look, because they are the leak a person could use (wrapping hate in a denouncing frame); the model should read them, and the frame rules stay narrow and measured.
**Still open:**
- **Judgment replies on profanity not aimed at anyone (23%) and on abuse aimed at an individual (15%):** the person-word cue list is too loose ("I", "my", "we" appear in almost any sentence, so "this shit is great, I love it" counts). Options: drop the first-person words from the cues (but then "I am so stupid", a self-judgment the NVC card could meet kindly, is lost), or keep them as a separate lower tier, a self-judgment reply, from the others. Owner's call.
- **Recall** on slurs (10.4% flagged, 6.9% to the model, 36% any hit), threats and implicit derogation: unchanged; the model and the coverage work.

### 10e. Two judgment tiers and a tighter cue (fourth run, 2026-11-12)
**Built:** a judgment decision now makes two rows. **Judgment**: the word of another person within **three** words either side (you, he, she, they, him, her, them, his, their, people, person, guy, man, woman, boss, friend, mom, dad, husband, wife, partner; "I", "my", "we" removed). **Self-judgment** (a separate tier, owner's decision): "am", "I'm", "im", "myself", "feel", "feeling" or "felt" within three words ("I am so ...", "I feel ..."): a gentle reply to a harsh judgment of oneself. "I" alone and "was" are not cues ("I love this ..." and "it was ..." are not self-judgment). `LexRow.window` sets how far a cue may be (default eight for other rows). Neither tier offers a card; each is for the gentle reply (NVC card or a question about the need beneath it), and the cards for them (a judgment card and a self-judgment card) are not written yet.
**Fourth run, HateCheck:** non-hateful flagged 0 of 1,165 (bar met). Judgment replies on profanity not aimed at anyone fell from 23% to 4% (self-judgment 6%, for example "I feel ... shit"), and on abuse aimed at an individual from 15% to 6%. Across all hateful cases: judgment 66 (2.6%), flagged 19, to the model 15. The remaining recall problem is unchanged and is for the model and the coverage work. HateCheck has no self-judgment cases, so that tier is tested only with invented sentences; the evaluation set needs hand-written ones (a person saying "I am so stupid" must get the gentle reply; "I am stupid about money, I need help" arguably should too).
