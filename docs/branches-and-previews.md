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

## Netlify
1. Site configuration, Build & deploy, Branches and deploy contexts: add `dev` as a branch deploy; keep Deploy Previews on for pull requests.
2. Site configuration, Environment variables: give each variable below a **different value for Deploy Previews and Branch deploys**.

| Variable | Production | Previews and `dev` |
|---|---|---|
| `COACH_ENABLED` | `true` | `false` until you want to test the coach, then `true` with the values below |
| `VENICE_API_KEY` | the real key | a separate key with a small credit limit, or leave unset |
| `COACH_TICKET_SECRET` | the real secret | a different secret |
| `COACH_SIGNING_KEY` | the real signing key | a different key, so previews can never issue signatures that verify as production's |
| `COACH_EXTRA_HOSTS` | not set | `dev--SITENAME.netlify.app, deploy-preview-*--SITENAME.netlify.app` (use your Netlify site name; a `*` matches one label) |
| `COACH_STORE_NAME` | not set (uses `coach-private`) | `coach-private-preview`, so previews never read production's notes or share its daily counter |
| `COACH_DAILY_CAP` | `100` | `10` |

3. To give the preview store its own notes: `npx netlify-cli blobs:set coach-private-preview method-notes --input FILE` (see `docs/coach-method-notes.md`).
4. Site configuration, Access & security, Visitor access: turn on **password protection** for deploy previews and branch deploys (not production).
   It is available on some plans; the non-profit plan may include it.
5. Check that previews are not indexed: `curl -I https://dev--SITENAME.netlify.app` should show an `X-Robots-Tag: noindex` header.
   If it does not, add one.

## Not covered by CI
Layout, colors, animation and sound: look at the preview. Live Venice behavior and tone: try the preview with the coach enabled.
