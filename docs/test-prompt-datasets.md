# Open prompt sets to test the coach with, and what we can publish

Written 2026-11-10. Nothing is downloaded and nothing is in the repository. "Verified" means I saw the licence on the dataset's own card or repository in a search today; "unverified" means from memory or an aggregator, to be read on the source before use.

## What we need them for
The coach is not a general assistant, so "generic conversational prompts" test three different things:
1. **False alarms.** Ordinary or odd-sounding text that must *not* trigger the crisis check, the hostility check, the manipulation guard, the lexicon or the learning-card offers (for example "how do I kill a Python process?").
2. **Staying in its lane.** Off-topic requests (write code, a poem, trivia) and attempts to change its role: it should say it can only help with what the person shares about themselves, kindly, without breaking the persona rules.
3. **Ordinary feelings talk.** Realistic everyday emotional conversation, to check length, tone, the practice arc and that it never invents a human life.

## The candidates
| Set | What it is | Licence | Use for | Verdict |
| --- | --- | --- | --- | --- |
| **XSTest** (Röttger and colleagues, NAACL 2024) | 250 safe prompts that sound unsafe (ten types) and 200 unsafe contrasts | **CC BY 4.0** for the prompts (verified, card and repository) | **False alarms** (1). Exactly the shape we need. | **Best first choice.** Publishable with credit. |
| **OpenAssistant OASST2** | Human-written multi-turn conversations, many topics, multiple languages | **Apache 2.0** (verified, dataset card) | **Staying in its lane** and everyday talk (2, 3): take first-turn prompts in English | Good. Publishable with credit; real contributors' text, so publish rates and prompt ids, not whole conversations. |
| **Databricks Dolly 15k** | 15,000 employee-written instructions (open QA, brainstorming, classification and others) | **CC BY-SA 3.0** (verified on the Databricks card; some mirrors say CC BY 3.0) | Off-topic requests (2) | Fine for testing. ShareAlike matters only if we republish the prompts in a modified form; results alone are fine. |
| **DarkBench** | Dark-pattern prompts (already used, credited in `ATTRIBUTIONS.md`) | already handled | Persona and honesty (done) | In use. |
| **ESConv** (emotional support conversations, Tsinghua) | About 1,300 support conversations with strategy labels | **CC BY-NC 4.0** (card on a pull-request branch; check the main branch) | Ordinary feelings talk (3) | Usable for research testing; not redistributable and not for commercial use. Keep out of the repository; report rates only. Ask the authors if unsure about "noncommercial" for a fiscally sponsored nonprofit. |
| **EmpatheticDialogues** (Facebook AI) | 25,000 conversations grounded in emotional situations | **Unverified** (I believe CC BY-NC 4.0) | Ordinary feelings talk (3) | Same cautions as ESConv once confirmed. |
| **MentalChat16K** | Synthetic and real-style counselling conversations | **Unverified** (one aggregator says CC BY-SA 4.0) | Feelings talk | Skip until the licence and its origin are confirmed; the "real" part raises privacy questions. |
| **Anthropic model-written evals** (persona, sycophancy, and others) | Many short generated prompts | **Unverified** (I believe CC BY 4.0) | Persona and sycophancy checks | Worth checking the repository. |
| **Anthropic hh-rlhf** (red-team attempts) | Human red-team conversations | **Unverified** (I believe MIT) | Role-change and manipulation attempts (2) | Contains harmful content; use a small reviewed sample only. |
| **TruthfulQA, RealToxicityPrompts, BBQ, BOLD** | Truthfulness, toxic continuation, and bias benchmarks | Unverified (I believe Apache 2.0, Apache 2.0, CC BY 4.0, CC BY-SA 4.0) | Not a fit for a coach, except the toxicity prompts for the hostility check | Later, if at all. |
| **WildChat** and **LMSYS-Chat-1M** | Real users' chats with chatbots | **WildChat: gated, AI2 ImpACT licence** (verified in search); **LMSYS: a custom agreement** (verified in search) | Realistic variety | **Do not use.** Real people's conversations, possible personal information, restrictive terms, and our own promise not to handle such data carelessly. |
| **ShareGPT** and scraped chat dumps | User-shared chats | Unclear | | Do not use. |

## What we can publish
- **Results, yes.** Aggregate rates (for example "of 250 safe prompts, the coach misfired on N"), the names and versions of the sets, our instruction version and fingerprint, and the date. Credit each set the way its licence asks (author names, a link, and the licence name); XSTest, OASST2 and Dolly all require attribution, which `ATTRIBUTIONS.md` is the place for.
- **The prompts themselves: only as the licence allows.** CC BY and Apache sets can be quoted with credit; CC BY-SA sets can be quoted but anything adapted must be shared under the same licence; CC BY-NC sets should not be redistributed at all. The safest habit is to publish **prompt ids and counts and link to the source**, and quote only a few short examples.
- **The coach's replies.** Our model's terms (and Venice's) should be read for publishing outputs; I have not checked them. Replies to *someone else's prompts* carry no privacy question; we never publish a reply to a visitor.
- **Never mix in real visitors' text.** These runs use only the public prompts and the deployed or in-folder coach.
- **Method matters as much as numbers.** Publish how many prompts were run, how they were chosen (a fixed random seed), what counted as a miss, who read the replies, and the known limits (a 7B model, phrase-matched checks, a small sample of each type). A short "what this does not show" paragraph keeps the numbers honest.

## What I would build next (nothing started)
1. **A download script** that fetches XSTest (and an English first-turn sample of OASST2) into a folder *outside* the repository, records the source and licence per file, and refuses anything unverified.
2. **A runner** (`scripts/eval-prompts.mts`, in the style of `dev-coach.mts` and `eval-safety.mts`) that takes a prompt file and a fixed seed, sends each prompt as a single-turn conversation to the dev site, records what the site decided (flag, manipulation guard, hostility, card offer), the reply length and the checks that already exist, and writes a results file with **counts and prompt ids only**.
3. **A reviewer pass:** a person reads every flagged case and a random tenth of the rest; those judgments, not the script's, are what we publish.
4. **A short results page draft** in the owner's voice with the attributions.

## Decisions for you
1. OK to start with **XSTest and OASST2** (both verified permissive)?
2. Is **ESConv** worth the NC question, or do we skip emotional-support sets until we have asked the authors?
3. Who reads the flagged replies (you, or a reviewer on the expert-input list)?
4. Where results should live when published: a page on the site, the repository (`docs/results/`), or both.
5. May I **download** the two sets to a folder outside the repo? (I will not download anything until you say so.)
