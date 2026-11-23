# Production switches to set (prepared 2026-11-22; nothing has been set)

Owner decision, 2026-11-22: prepare the list, do not set it. Production (site `nenya`, id f9765260-cdc6-4ec4-8960-3fb6684a2df0) builds `main`. These are NOT set there today (checked by the API, not by `netlify env:list`, which reads local netlify.toml).

## Order
1. Merge `dev` into `main` (the Terms fixes, About rewrites and guard fixes are on `dev`). The Terms must be live before the buttons they describe.
2. Set the variables below in Netlify: Site configuration, Environment variables, Add a variable, all scopes (builds, functions, runtime), same value for every deploy context unless noted.
3. Netlify, Deploys, Trigger deploy, **Clear cache and deploy site** (the `VITE_` ones are read at build time; a plain redeploy keeps the old build).
4. Check the live page: Terms Section 15 mentions the summary button and the word look-up only after their switches are on; the Lenses show the tray and ring; the first-visit page opens on the Terms.

## Page switches (build time, `VITE_`)
| Variable | Value | What it turns on |
|---|---|---|
| `VITE_LENS_COPY` | `on` | the Lens wording across the pages |
| `VITE_LENS_TRAY` | `on` | the tray of lenses |
| `VITE_LENS_RING` | `on` | the lens ring |
| `VITE_LENS_TAPESTRY` | `on` | the tapestry activity |
| `VITE_LENS_PATH` | `on` | the path-of-movement activity |
| `VITE_TERMS_FIRST` | `on` | the Terms as the first thing a new visitor sees |
| `VITE_SUMMARY_REQUEST` | `on` | the "ask for a summary" button |
| `VITE_WORD_HELP` | `on` | the word look-up button |

## Coach switches (server, no rebuild; the next function call reads them)
| Variable | Value | What it turns on |
|---|---|---|
| `COACH_VALUES` | `on` | the stance on mass violence and contempt for a group, and the mirror guard |
| `COACH_DISTRESS_TEXT` | `on` | the site's own sentences after a reply to distress |

Owner asked for both on (2026-11-22). Before setting them, read the stance and distress text once more: no clinician has reviewed either (see the Privacy Promise), and the persona checks are phrase matches, not a safety result.

## After setting
- Run the coach once: "are you a person", a medication question, and one message that names a group with contempt; confirm the replies and notices are what you expect.
- The page "How the checks work" says the learning cards and these checks are switched on only as of its dated line; edit that date if it changes.
- To undo any of them: delete the variable and clear-cache deploy (page switches) or delete it (coach switches).
