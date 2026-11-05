# Branches, previews, and checks

## Branches
- `main` is production (nenya.biz).
- `dev` is a long-lived branch with its own preview URL. Feature branches open a pull request into `dev`.
- When `dev` looks right, open a pull request from `dev` into `main`.
- On GitHub, protect `main` (Settings, Branches): require a pull request and the **CI** check before merging.

## What runs on every pull request (`.github/workflows/ci.yml`)
`npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm audit --omit=dev --audit-level=high`.
Run the same things locally with `npm run check` (needs Node 22.18 or newer; the tests are TypeScript that Node runs directly).

The tests live in `tests/` and use no network and no real keys. They cover the coach function end to end (with Venice stubbed),
the daily cap, device memory, the preview-host rules, the public module selector, the safety, scrubbing and prompt-guard rules,
the transcript verification script, and server-side renders of the coach and review pages (these catch crashes a build can miss).

## Netlify: two sites from one repository
Previews-only passwords are an Enterprise feature, but a whole-project password is available on the Open Source plan. So staging is a
**second Netlify site** built from `dev`, with a password on all its deploys. It also gets its own environment variables and its own
Blobs store (Blobs belong to a site), so it cannot touch production's keys, notes, or daily counter.

**Set up the staging site (about ten minutes, no keys needed yet)**
1. Netlify, Add new project, Import an existing project, GitHub, `Nenya-App/nenya-public`.
2. Name it something like `nenya-staging`. Set the **production branch to `dev`**. The build command and publish folder come from `netlify.toml`.
   Do not add environment variables on this screen.
3. Deploy it. Then Site configuration, Access & security, Password Protection: choose **All deploys** and set a password.
4. Open the site in a private window and confirm it asks for the password.
5. On the **main** site (Branches and deploy contexts): production branch stays `main`; remove `dev` from branch deploys (staging builds it now, and the
   branch deploy on the main site would be public). Deploy Previews for pull requests can stay on: they are public, but the coach stays off there.
6. Check inherited variables: with a plan that has shared environment variables, anything shared at the team level is inherited by a new site.
   Compare Team settings, Environment variables, with the staging site's own list, and remove anything you did not intend to share.

**Until the keys step, the coach on staging is off by design.** With no `COACH_ENABLED=true` it answers "off", and with no `COACH_EXTRA_HOSTS`
it refuses the staging address anyway. Do not set `COACH_EXTRA_HOSTS` before the other values below are in place.

**Keys step (later), set on the staging site only**

| Variable | Staging value |
|---|---|
| `COACH_ENABLED` | `true` |
| `VENICE_API_KEY` | a separate key with a small credit limit |
| `COACH_TICKET_SECRET` | a new secret, not production's |
| `COACH_SIGNING_KEY` | a new key, so staging can never issue signatures that verify as production's |
| `COACH_DAILY_CAP` | `10` |
| `COACH_EXTRA_HOSTS` | the staging site's exact hostname, for example `nenya-staging.netlify.app` (set this last) |

`COACH_STORE_NAME` is not needed with a separate site. Keep it for the case where one site serves more than one context.
To give staging its own notes: `npx netlify-cli blobs:set coach-private method-notes --input FILE` run against the staging site (see `docs/coach-method-notes.md`).

Pull requests still get public, unlisted deploy previews on the main site. Layout and behavior can be reviewed there or on staging.

## Not covered by CI
Layout, colors, animation and sound: look at the preview. Live Venice behavior and tone: try the preview with the coach enabled.

## Trying an encrypted Venice model on a preview

Set `COACH_MODEL` on the staging site only to a Venice id that starts with `e2ee-` (for example
`e2ee-qwen-2-5-7b-p`). The coach function then encrypts the prompt before it reaches Venice and decrypts the
reply (see `src/lib/veniceE2ee.ts`). Nothing else changes. Notes:

- The encryption happens in the relay function, not in the visitor's browser, so the function still reads the
  visitor's text in memory (it has to, to scrub, screen and sign). Venice's API layer sees ciphertext. Do not call
  this end-to-end encryption from the visitor's device.
- Earlier replies from the model are sent as plain text (Venice's guide encrypts only user and system messages).
- Venice's own system prompt and the character card do not apply to these models. The coach's instruction is ours.
- The unit tests use a pretend enclave. Only a live test on staging shows whether Venice accepts the requests.
  Check the function log for `coach: e2ee <code>` lines (a short code, never message text).
