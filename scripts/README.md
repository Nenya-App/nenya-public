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
| `compare-persona-runs.mts` | Compares two saved persona runs | Nothing |
| `build-darkbench-persona-set.mts` | Builds `src/lib/personaEvalDarkBench.ts` from DarkBench | Research folder |
| `eval-final-turn.mts` | How often the fifth reply still asks a question | Key |
| `eval-prompts.mts` | A sample of an open prompt set run against a deployed coach, with a result you can publish | Deployed |
| `eval-detect.mts` | The site's detection (private list, history patterns, card offers) run over outside test sets | Research folder |
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
| `bakeoff-target-groups.py` | Catch and false-alarm rates for each target group, for the model and the list (run `eval-detect.mts --dump` first) | Research folder |
| `bakeoff-heldout-bias.py` | Threshold checked on held-out halves, plus flag rates on invented neutral sentences about 27 groups | Research folder |
| `bakeoff-second-reading.py` | Tests whether a second model (toxic-bert) closes the per-group gaps on the same budget | Research folder |
| `bakeoff-workers-ai.mts` | Runs the persona set through the real coach function with the model call sent to Workers AI instead of Venice (or to a local model server with `--local-url`); `--layers` records what the guards did | Cloudflare account |
| `layers-report.mts` | Compares saved persona runs made with `--layers` (bake-off or eval-persona): how often the model's first reply broke a check, how often the outer layers rescued it, which guards did the work, which cases nothing caught (docs/outer-layers-scope.md) | none (no calls) |
| `record-neurons.mts` | Adds Neurons you spent by hand to the nightly canary's ledger (the bake-off and full-exchange scripts do it for you; `--no-record` skips) so the canary does not spend what you already did | Netlify CLI |
| `duet-eval.mts` | Full-exchange tests: Venice plays an invented person turn by turn against the real coach on Workers AI; writes transcripts and a read-first summary to a private folder (docs/duet-eval.md) | Venice testing key, Cloudflare account |
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
| `build-learning-cards.mts` | Builds `src/lib/learningCardsData.ts` from approved card files | Private card folder |
| `build-draft-cards.mts` | Collects draft cards for testing on a dev site only | Private card folder |
| `build-module-set.mts` | Builds the coach's private module set (store key `modules`) | Private drafts |

## Documents and brand

| Script | What it does | Needs |
| --- | --- | --- |
| `build-agreement-pdf.mts` | Branded PDFs of the draft contributor agreement | Nothing |
| `build-answers-pdf.mts` | Branded PDFs of the draft pre-written answers | Nothing |
| `logo-export.vite.config.mts` | Builds only the `logo-export/` page, for the two scripts below (`npm run logo:render`) | Nothing |
| `render-logo-assets.mts` | Draws every static logo asset from the live gem in headless Chrome (`docs/logo-regeneration.md`) | Chrome |
| `render-logo-video.mts` | Renders the live gem as frames, then as animated WebP and MP4/WebM | Chrome, img2webp (ffmpeg optional) |
| `lib/brandedPdf.mts` | Shared by the two PDF scripts | n/a |

When you add a script, add a row here in the same change. `tests/docs-drift.test.mts` checks that every script is listed.
