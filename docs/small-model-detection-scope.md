# Scope: a tiny model to help with detection (which module or card applies, and whether a reply overlaps one)

Status: scoping only, nothing built. Written 2026-11-20 from the owner's question: is there a tiny AI model that could run in the browser, or on our server, to help with this detection? Sizes, licenses and speeds below are from memory and marked (verify).

## What "this detection" could mean, and what a small model is good for
| Job | Phrase matching today | A small model | Verdict |
| --- | --- | --- | --- |
| **Which module or card applies** to what the person said | Public phrase lists (`coachModules.ts`, the lexicon). Misses paraphrase ("I can't seem to start" vs "paralyzed"), catches ordinary sentences | A **sentence-embedding model**: embed the person's message once, compare with a short description of each module or card, take the nearest above a threshold | **Best fit.** Fewer misses on paraphrase, and the descriptions are public text, so the selection stays readable and testable |
| **Whether a reply says the same idea as a card** (in other words) | Only a shared run of ten words | The same embedding model: cosine similarity between a reply sentence and the card text | Useful to **measure**, not to act on: the owner has decided a matching card is never suppressed. Good for the evaluations and aggregate counts (how often the coach restates a card's idea) |
| **Whether a reply contradicts a card** | Not possible | A small **natural-language-inference** model (is this sentence consistent with that one) | **Not for live use.** Small models of this kind are unreliable on advice and nuance (verify on our own texts), and a false "contradiction" would be wrong in a way a person cannot see. Fine offline, with a person reading what it flags |
| Crisis, names, hostility | Phrase lists and the existing hate-speech screen | Already covered or out of scope | Leave as is |

## What already exists, so this is not from scratch
- `netlify/functions/screen.mts` and `src/lib/screenModel.ts`: a small ONNX model (a hate-speech RoBERTa, int8) run on **our server** with `onnxruntime-web` (WebAssembly, no native binary) and a JavaScript tokenizer (`@huggingface/tokenizers`); the files live in the private store and **every file is pinned by SHA-256** and refused if different; it keeps nothing, answers with a band and not a score, and **fails open** (the reply carries on without it) with a short time budget. Both libraries are already dependencies.
- An embedding model would reuse all of that: a second function (or the same one with a second model), the same pinned-hash loading, the same fail-open budget, aggregate counters only.

## Candidates (all (verify) before any is chosen)
- **all-MiniLM-L6-v2** (sentence-transformers; about 22M parameters, 384-dimension vectors; Apache-2.0 as I remember it; an int8 ONNX file in the tens of megabytes). The usual small choice.
- **bge-small-en-v1.5** (about 33M parameters; MIT as I remember it): often a little better at matching short texts.
- **e5-small** variants, and multilingual MiniLM models (larger) if other languages come; the site is English only for now (translators welcome).
- The choice is made by a **bake-off on our own texts** (module descriptions and example messages written for this, plus the real cards), not by reputation, exactly as the screening model was chosen.

## Where it would run
- **On our server (recommended first).** Same arrangement as the screening model: text never leaves our infrastructure, one more small file in the private store, a cold-start cost (a few seconds the first time; the relay already tolerates that by carrying on without it). Matching one short message against a few dozen descriptions is a few milliseconds once warm. The module descriptions' vectors can be computed once and kept, so only the person's message is embedded per turn.
- **In the browser** (onnxruntime-web or transformers.js, WebAssembly or WebGPU). Possible and the best privacy story: the person's words never go anywhere to be matched. Costs: a 20 to 100 MB download for each visitor (cached after the first), battery and older phones, and the selection would then need the page to tell the server which modules apply, which the server cannot verify. A good fit later, with the on-device coach; not a first step.
- **Not** a hosted API: sending the text to a third party for matching would undo what the Privacy Promise says.

## How it would be used without changing what people are promised
- It **adds a signal** to the phrase matcher (a module is chosen if either says so, with the model's threshold set conservatively); it never decides alone about anything that restricts the person. Selecting a teaching module or offering a card are gentle outcomes.
- It sees only the person's latest message (and, for the overlap measure, the reply), keeps nothing, and logs only aggregate counts.
- The Terms, the "How the checks work" page and the answers must name it the way they name the screening model. Wording drafted with the build, not before.

## Build order (if the owner wants it)
1. A bake-off set: one-sentence descriptions for the modules and cards, and several invented example messages for each (including paraphrases and ordinary sentences that should match nothing); measure hits, misses and false matches for each candidate against the current phrase matcher.
2. Pick one (verify its license and training data), export to ONNX int8 with a pinned-hash script like `scripts/export-onnx.py`, upload to the private store.
3. A function, a fail-open budget, and a switch (off by default, shadow mode first: record what it would have chosen without changing anything).
4. Read the shadow counts against the matcher on dev; only then let it add modules or cards.
5. The overlap measure goes into the evaluation scripts first (reply against card), not the live path.

## Decisions for the owner
1. Selection (which module or card applies) as the first use, with overlap measured offline only?
2. Server first, browser later?
3. Who writes and reviews the module and card descriptions the model matches against (they are public text and decide what the model "sees" as a topic).
4. Whether the choice of model waits for the bake-off (recommended).

## Not verified
Every model size, license, speed and accuracy figure above; whether an NLI model would be good enough on our texts (I expect not); how the page would feel with a cold start.
