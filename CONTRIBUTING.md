# Contributing to Nenya

Thank you for helping. Please read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) first. If you are a professional who
wants to review the safety wording, the detection or the learning cards, you do not need to touch the code: start at
[`docs/README.md`](./docs/README.md) and write to info@nenya.biz.

## Set up

- Node.js **24** (as `package.json`, `netlify.toml` and CI use). Then run `npm install` and `npm run dev`.
- `npm run check` runs the type-check, the tests and a production build. It needs no network and no keys. Run it
  before you open a pull request, because CI runs the same thing.
- To run the server functions locally, use `netlify dev` from the [Netlify CLI](https://docs.netlify.com/cli/get-started/).
  The coach also needs your own Venice key.
- Pull requests go to `dev`, which deploys to staging. `main` is production. See
  [`docs/branches-and-previews.md`](./docs/branches-and-previews.md).

## Find your way

| You want to… | Start at |
| --- | --- |
| Understand the layout | The README's "Project layout" section |
| Know what a doc is, and whether it is current | [`docs/README.md`](./docs/README.md) |
| Know what a coach switch does, and whether it is shipped | [`docs/coach-features.md`](./docs/coach-features.md) |
| Look up an environment variable | [`docs/production-env.md`](./docs/production-env.md) |
| Run a script or an evaluation | [`scripts/README.md`](./scripts/README.md) |
| Follow a coach request from start to end | The header of `netlify/functions/coach.mts` (13 stages, in order) |
| See where the codebase is heading | [`docs/maintenance-plan.md`](./docs/maintenance-plan.md) |

## How the code is written

- **Every file opens with a comment** that says what the file does, what it keeps (if anything), who may call it, and
  which doc explains it. Keep that comment true when you change the file.
- **Comments explain why, not what.** Good examples are what was seen ("seen on the dev site, 2026-11-09"), the
  decision and who made it, or the trade-off. Wrap comments at about 120 characters.
- **Privacy claims are code claims.** If a change alters what is sent, kept, counted or logged, update the Terms process
  (`docs/legal/README.md`), [`docs/device-memory.md`](./docs/device-memory.md) or
  [`docs/data-register.md`](./docs/data-register.md) in the same pull request.
- **Plain words** in copy and docs. Many readers are not developers.
- **Tests need no network and no keys.** Each test file prints `PASS`/`FAIL` lines through `tests/helpers.mts`. The
  runner (`tests/run.mjs`) clears the site's own variables before each test, so a test that needs one sets it itself.

## Adding things

- **A switch (environment variable).** Add a row to `docs/production-env.md` and to `docs/coach-features.md` (as an
  experiment, with what it is blocked on). Add a test that runs with the switch both on and off. When it has been
  decided, make it permanent or delete it. `tests/docs-drift.test.mts` fails if the code reads a variable the env page
  does not name.
- **A server function.** Open it with the usual header comment, add it to the README's functions table, and add any
  variable it reads to the env page. The drift test checks the table.
- **A script.** Open it with a usage comment and add a row to `scripts/README.md`. The drift test checks this too.
- **A doc.** Follow the conventions at the end of `docs/README.md`: a `Status:` line, scope docs named
  `<area>-scope.md`, the date in the filename for point-in-time records, drafts in `docs/drafts/`. Add a row to the
  index in the same change.
- **A coach guard or check.** It belongs in `src/lib/` with its own test. Place it in the right stage of the pipeline,
  and add its case to the safety or persona evaluation set so its effect can be measured.

## Release checklist (`dev` to `main`)

1. `npm run check` passes, and CI is green.
2. On staging, run `scripts/staging-suite.mts`, `scripts/eval-safety.mts --url …`, `scripts/eval-persona.mts --url …`
   and `scripts/eval-final-turn.mts`. Save the JSON results in `docs/results/` with the build label, and compare them
   with the last release. Note any rate that got worse. No stop-tier case in the safety set may be missed.
3. If detection changed, re-run the per-group check (`scripts/bakeoff-target-groups.py`) and update its table.
4. Check that `docs/coach-features.md` and `docs/production-env.md` match what production will run.
5. Bump the version (`docs/versioning.md`) and add a section to `CHANGELOG.md`.
6. If the Terms changed, archive the outgoing version first (`docs/legal/README.md`).
