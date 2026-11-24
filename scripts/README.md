# scripts/

Tools that are run by hand, on a contributor's or the owner's computer. None of them is part of the site, and only
`write-build-info.mjs` runs during a build. Each file begins with a comment that gives its exact usage. Read that comment
before you run a script.

**Key to the "Needs" column.** *Nothing*: no network and no keys. *Key*: your own `VENICE_API_KEY`, which runs the coach
function in this folder. *Deployed*: a deployed site, usually staging, together with `NENYA_OWNER_TOKEN`. *Research
folder*: files kept outside the repository (`NENYA_RESEARCH_DIR`), which are never committed. *Netlify*: `NETLIFY_SITE_ID`
and `NETLIFY_API_TOKEN`. Check the site id first, because the repo folder is linked to production.

## Build and release

| Script | What it does | Needs |
| --- | --- | --- |
| `write-build-info.mjs` | Writes `src/generated/build-info.ts` (version, commit, branch). It runs before build, test, typecheck and dev | Nothing |
| `footprint.mjs` | `npm run footprint`, run after a build: what the built site sends, by scenario | Nothing |
| `indexnow.mjs` | `npm run indexnow`: tells IndexNow search engines which public pages changed | Network |
| `verify-transcript.mjs` | Checks a signed coach transcript from the command line (`docs/coach-transcripts.md`) | Nothing |

## Coach evaluations

These scripts are the counterweight to the phrase-matching checks. See `docs/coach-testing.md`, and see the release
checklist in `CONTRIBUTING.md` for which ones must run before a release.

| Script | What it does | Needs |
| --- | --- | --- |
| `eval-safety.mts` | The safety set: what the site decided and what the model said, turn by turn. `--offline` is also run by the tests | Nothing (`--offline`), Key, or Deployed |
| `eval-persona.mts` | The persona set: replies that claim a human life, deny being an AI, and similar | Key or Deployed |
| `eval-select.mts` | The bake-off for choosing modules and cards by meaning: the phrase matcher and an embedder (`--embedder`), against invented messages, by topic and threshold. Needs no key; the default embedder is a word-overlap stand-in, not a model | Nothing |
| `embedder-onnx.mts` | An embedder for `eval-select.mts` made from a folder of downloaded files (`EMBED_DIR`, `EMBED_POOLING`): the model under test, run locally, nothing sent anywhere | Nothing |
| `compare-persona-runs.mts` | Compares two saved persona runs (same model and case list; a missing case counts as a failure) | Nothing |
| `guard-run-table.mts` | Builds the before/after table for the guard fixes from two bake-off runs (docs/guard-fixes-2026-11-22.md) | Nothing |
| `guard-recall.mts` | Recall of the phrase check on invented paraphrase families (a path to a private families file) and false flags on near-misses; no model (docs/guard-recall.md) | Nothing |
| `build-darkbench-persona-set.mts` | Builds `src/lib/personaEvalDarkBench.ts` from DarkBench | Research folder |
| `eval-final-turn.mts` | How often the fifth reply still asks a question | Key |
| `eval-final-summary.mts` | Reads the fifth reply of invented conversations from a local model for the v2.1 summary (no question, feelings and needs, transcript pointer, no promise, length) | Local |
| `eval-prompts.mts` | A sample of an open prompt set run against a deployed coach, with a result you can publish | Deployed |
| `eval-detect.mts` | The site's detection (private list, history patterns, card offers) run over outside test sets. `--record` appends a counts-only run, with the version fingerprint, to `src/lib/checksRuns.json`, the record behind the live figures on "How the Checks Work" (`docs/checks-live-figures.md`) | Research folder |
| `run-checks-nightly.sh` | Runs `eval-detect.mts`, the per-group bake-off and `--record` in one go, for a nightly schedule you create yourself (nothing is scheduled by the repo; `docs/checks-live-figures.md` has a launchd example) | Research folder, Python packages |
| `lib/checksRecord.mts` | Version fingerprint, groups-file checks and the record file's appender, used by `eval-detect.mts --record` | n/a |
| `holistic-coach.mts` | About 50 short conversations across every area of the coach | Deployed |
| `staging-suite.mts` | Checks staging against `docs/dev-test-script.md` | Deployed |
| `dev-coach.mts` | Sends one conversation to a deployed coach from the terminal | Deployed |
| `probe-e2ee.mts` | Tries the encrypted Venice route once and prints each step | Key |

## Screening model bake-off (Python)

These scripts produced the comparison written up in `docs/coach-screening-flow-scope.md` (sections 10 to 17). Only `export-onnx.py` is needed again
if the model changes.

| Script | What it does | Needs |
| --- | --- | --- |
| `bakeoff-models.py` | Scores the candidate models on HateCheck and ETHOS at a 2% false-alarm line, with their cost. Counts only | Research folder |
| `bakeoff-target-groups.py` | Catch and false-alarm rates for each target group, for the model and the list (run `eval-detect.mts --dump` first). `--json out.json` also writes exact counts for `eval-detect.mts --record --groups out.json` | Research folder |
| `bakeoff-heldout-bias.py` | Threshold checked on held-out halves, plus flag rates on invented neutral sentences about 27 groups | Research folder |
| `bakeoff-second-reading.py` | Tests whether a second model (toxic-bert) closes the per-group gaps on the same budget | Research folder |
| `bakeoff-workers-ai.mts` | Runs the persona set through the real coach function with the model call sent to Workers AI instead of Venice (or to a local model server with `--local-url`); `--layers` records what the guards did; `--capture` keeps each request and the usage reported; `--venice` or `--openrouter` sends the model call to a Venice or OpenRouter model instead (tokens and dollars totalled; OpenRouter asks for no-data-collection hosts, `--zdr` for zero-retention hosts; testing only) | Cloudflare account (Venice testing key with `--venice`) |
| `replay-cost.mts` | Replays a captured coach request to two or more Venice models and prints tokens and dollars for each (prices read from Venice's public model list); invented text only | Venice testing key (spends credit), or an OpenRouter key with `--openrouter`; optional Venice admin key to read the balance |
| `layers-report.mts` | Compares saved persona runs made with `--layers` (bake-off or eval-persona): how often the model's first reply broke a check, how often the outer layers rescued it, which guards did the work, which cases nothing caught (docs/outer-layers-scope.md) | none (no calls) |
| `record-neurons.mts` | Adds Neurons you spent by hand to the nightly canary's ledger (the bake-off and full-exchange scripts do it for you; `--no-record` skips) so the canary does not spend what you already did | Netlify CLI |
| `apply-lens-copy.mts` | Runs after `vite build`. With `VITE_LENS_COPY=on`, puts the lens vocabulary into the static public files the page code does not render (about-nenya.html, why-nenya.html, llms.txt); with it off, does nothing | Node |
| `duet-eval.mts` | Full-exchange tests: Venice plays an invented person turn by turn against the real coach on Workers AI; writes transcripts and a read-first summary to a private folder (docs/duet-eval.md) | Venice testing key, Cloudflare account |
| `troll-arena.mts` | The troll arena: a local model plays one of 30+ invented trolls against the real coach (every layer) while you watch a live page on 127.0.0.1; paired guards on/off arms; writes a counts-only digest and a self-contained replay.html to a private folder (docs/troll-arena.md). `run-troll-arena.sh` starts it from a fresh shell | LM Studio, Cloudflare account (Workers AI coach) |
| `export-onnx.py` | Exports the cardiffnlp model to int8 ONNX for `netlify/functions/screen.mts` | Research folder, Python packages onnx, onnxruntime and torch |

## Private list and learning content

| Script | What it does | Needs |
| --- | --- | --- |
| `prepare-hurtlex.mts` | Turns HurtLex into a batch for the private list | Research folder |
| `pull-wiktionary.mts`, `pull-wiktionary-topics.mts` | Pulls Wiktionary slur and topic categories (CC BY-SA) | Network, Research folder |
| `prepare-wiktionary.mts` | Turns the pulled categories into candidate rows for review | Research folder |
| `prepare-private-list.mts` | Cleans and checks the reviewed list before upload | Research folder |
| `upload-private-list.mts` | Uploads the list to the site's private store | Netlify |
| `upload-screen-model.mts` | Uploads the ONNX model and tokenizer to the private store | Netlify |
| `upload-select-model.mts` | Uploads the selection model (all-MiniLM-L6-v2, int8 ONNX) and tokenizer to the private store, after checking every file's SHA-256 | Netlify |
| `check-site-env.mts` | Reads the production site's environment variables from Netlify (read-only) and reviews them against `docs/production-env.md`: what to turn off, what is missing, what needs a decision. Prints names, and values only for plain switches, never a secret's | Netlify |
| `build-learning-cards.mts` | Builds `src/lib/learningCardsData.ts` from approved card files | Private card folder |
| `build-draft-cards.mts` | Collects draft cards for testing on a dev site only | Private card folder |
| `build-module-set.mts` | Builds the coach's private module set (store key `modules`) | Private drafts |

## Documents and brand

| Script | What it does | Needs |
| --- | --- | --- |
| `build-agreement-pdf.mts` | Branded PDFs of the draft contributor agreement | Nothing |
| `build-answers-pdf.mts` | Branded PDFs of the draft pre-written answers | Nothing |
| `logo-export.vite.config.mts` | Builds only the `logo-export/` page, for the two scripts below (`npm run logo:render`) | Nothing |
| `build-mind-facts.mts` | Generates `public/mind-facts.txt` (the plain-text facts page for AI assistants) from the ready answers, the Terms date and section titles, and the standing statements; `npm run mind-facts`, with `-- --as-of YYYY-MM-DD` to move the date (`docs/mind-facts.md`) | Nothing |
| `lib/mindFacts.mts` | The builder it and `tests/mind-facts.test.mts` share | n/a |
| `render-logo-assets.mts` | Draws every static logo asset from the live gem in headless Chrome (`docs/logo-regeneration.md`) | Chrome |
| `render-logo-video.mts` | Renders the live gem as frames, then as animated WebP and MP4/WebM | Chrome, img2webp (ffmpeg optional) |
| `lib/brandedPdf.mts` | Shared by the two PDF scripts | n/a |

When you add a script, add a row here in the same change. `tests/docs-drift.test.mts` checks that every script is listed.
