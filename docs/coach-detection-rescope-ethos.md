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
