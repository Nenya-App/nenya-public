# Versioning

Every build has a label, and every signed coach transcript records it (`meta.build`), so a transcript can be matched to the code that wrote its replies.

## The label

| Where | Example | Meaning |
| --- | --- | --- |
| Production (`main`) | `1.1.0+679c4d2` | release number, then the first 7 characters of the commit it was built from |
| Staging (`dev`) | `1.1.0-dev+679c4d2` | the branch name follows the release number for every branch except `main` |
| Built without git information | `1.1.0-local+nogit` | only when the commit cannot be found |

It follows [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`, a `-branch` pre-release part, and `+commit` build metadata.

## The release number

It is the `version` in `package.json` and nothing else. Change it by hand, as part of the pull request that takes `dev` to `main`:

- **PATCH** (1.1.0 to 1.1.1): fixes and wording that change nothing a person can do.
- **MINOR** (1.1.0 to 1.2.0): something new a person can see or use.
- **MAJOR** (1.x to 2.0.0): a change that breaks something others rely on: the signed transcript format, a Terms revision that changes what we collect, or an API change.

Use `npm version minor --no-git-tag-version` (or `patch` / `major`) so only `package.json` and the lock file change, then commit it in the release pull request. After the merge, make a GitHub release (or tag) named for the number on the merge commit, so each number maps to one commit. Keep a line per release in `CHANGELOG.md` (not yet written; see the backfill item in the to-do list).

## How the label gets into the code

`scripts/write-build-info.mjs` writes `src/generated/build-info.ts` (not committed) from `package.json`, the host's `COMMIT_REF` and `BRANCH` (set during a Netlify build) or git. It runs before the build, the tests, the type check and the dev server, through the `pre*` entries in `package.json`.

Why not read the host's variables when the coach runs: Netlify gives `COMMIT_REF` and `BRANCH` to the build but not to a running function, which is why early signed transcripts said `build unknown`. Writing them into the code at build time fixes that.

`COACH_BUILD` in Netlify still overrides the label (kept to letters, digits and `._+-`, 40 characters), for the rare case of needing to name a build by hand. Leave it unset.

## Checking a transcript's build

On `/verify/` the "produced by" line shows the build. `1.1.0+679c4d2` means release 1.1.0 built from commit `679c4d2`: `git show 679c4d2` shows exactly that code. A `-dev` label means it came from staging.

## Related versions (separate numbers, not the release number)

- **Transcript format**: `v` in the signed file (currently 3).
- **Terms**: `LEGAL_EFFECTIVE_DATE` in `src/lib/legalDocument.ts`; archived copies in `docs/legal/archive/`.
- **Coach instructions**: the 16-character `instructions` fingerprint in each signed transcript.
