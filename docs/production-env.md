# Production environment variables

Every variable the site's functions read, for the **production** site (nenya.biz). Names only: values never go in the repo or in chat. A test (`tests/docs-drift.test.mts`) fails if the code reads a variable this page does not name, so add new ones here in the same change.
Set them in Netlify: the production site → Site configuration → Environment variables. Redeploy after each change; a `VITE_` variable needs "Clear cache and deploy site".

Staging (nenyastaging) is a separate Netlify site with its own variables and its own Blobs store. **Production secrets must not be copies of staging's**: if one leaks from staging (where test scripts and owner tools run), production is untouched. Generate each production secret fresh.

Generate a random secret: `openssl rand -hex 32`
Generate a signing key: `node -e "const {generateKeyPairSync}=require('crypto');process.stdout.write(generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'der'}).toString('base64'))"`

## 1. Set before the merge (secrets; scope: Functions)

| Variable | What it is | Notes |
|---|---|---|
| `VENICE_API_KEY` | Venice API key | **Production's own key** (2026-11-14 decision). The older key stays on staging and for test scripts only. |
| `COACH_TICKET_SECRET` | Signs the ticket each conversation carries | Fresh, production only. Changing it ends conversations in progress (nothing else). |
| `COACH_SIGNING_KEY` | Ed25519 key that signs transcripts, the agreement note and consent receipts | **Needed before the merge**, or the agreement step has nothing to sign. If production already has one, keep it: replacing it means transcripts signed earlier no longer check on /verify. |
| `COACH_IP_SECRET` | Makes the one-way daily code for the per-connection limit | Without it that limit is off. Fresh, production only. |
| `COACH_OWNER_TOKEN_HASH` | SHA-256 (hex) of your owner token | Lifts the per-connection limit and the US-only check for you, and opens the stats page. May match staging's if you use one owner token. |

## 2. Plain settings worth setting (scope: Functions)

| Variable | Value | Notes |
|---|---|---|
| `COACH_DAILY_CAP` | e.g. `500` | Turns the whole site may use a day. Default 500. Set it to what the production Venice key's budget allows. |
| `COACH_IP_TURNS` | leave unset | Default 10 a day per connection (two conversations). |
| `COACH_ENABLED` | **unset until after the merge** | `true` turns the coach on (step 3 of the switch order in the PR description). |

## 3. Switches, off until their turn (scope: Functions)

Turn these on one at a time, in the order in the PR description, after the matching staging test.

| Variable | On value | What it turns on |
|---|---|---|
| `COACH_DISTRESS_TEXT` | `on` | The site's sentences after a reply to distress |
| `COACH_VALUES` | `on` | The stance on mass violence and contempt for a group, and the mirror guard |
| `COACH_LEARNING_OFFERS` | `on` | Learning-card offers |
| `COACH_JUDGMENT_CARDS` | `on` | Cards about judgment (with the line above) |
| `COACH_LEARNING_MIN_SEVERITY` | a number | Optional floor for offering a card |
| `COACH_SCREEN_SECRET` | fresh secret | Creates `/api/screen`; production's own value |
| `COACH_SCREEN` | `shadow`, later `on` | The screening model: counts only, then acting |
| `COACH_SELECT_SECRET` | fresh secret | Creates `/api/select`; production's own value |
| `COACH_SELECT` | `shadow` only (for now) | Selection by meaning: counts only, next to what the phrase matcher chose; never changes a reply or which modules are used |
| `COACH_ARC` | `practice` | The practice arc (later) |
| `COACH_STANCES` | includes `learn` | The Learn stance (later) |
| `COACH_SEALED` | `on` | Sealed mode (later; needs an `e2ee-` model) |
| `COACH_MODULES` | `on` | The private module set (method notes in parts: the ICARUS lenses and the coaching moves, chosen per reply). Off: the single `method-notes` text is used. Upload the set to production's store first. |
| `CELL_ENABLED` | `true` | Partner cells (not built for visitors yet). **Set together with the build switch `VITE_CELL_ENABLED=on`** (below): the Terms describe cells (Section 22, new effective date November 23, 2026) only in a build with that switch, and the page opens only while this server variable is `true` |
| `PALETTE_ENABLED` | `true` | "Ask The Color API" in the Sight gateway |
| `WORD_HELP_ENABLED` | `true` | "Look it up online" under Word help (`/api/words`; docs/word-help-scope.md): one typed word goes through our server to Datamuse and the Free Dictionary API, nothing kept or logged. Also needs the build setting `VITE_WORD_HELP=on` for the button to show. Off by default |
| `WORD_HELP_PER_CONNECTION` | e.g. `40` | Optional: look-ups per connection per day (default 40) |
| `WORD_HELP_DAILY_CAP` | e.g. `600` | Optional: look-ups per day in all (default 600) |
| `COACH_CARD_DRAFTS` | leave unset | Owner tool for card drafts; not for production |

**Build switches for new screens (Builds scope; "Clear cache and deploy site" after a change).** Staging first; on production only after the owner approves what staging shows.

**Not set in production today (checked 2026-11-22, terms audit).** The eight page switches `VITE_LENS_COPY`, `VITE_LENS_TRAY`, `VITE_LENS_RING`, `VITE_LENS_TAPESTRY`, `VITE_LENS_PATH`, `VITE_TERMS_FIRST`, `VITE_SUMMARY_REQUEST` and `VITE_WORD_HELP` (the rows from `VITE_LENS_COPY` to `VITE_WORD_HELP` below) are **build-time variables set in Netlify's site settings, and they are NOT set in production's site settings.** The live build was made without them, so those screens are off for visitors and the Terms show the "switches off" text. The "On value" column below is only the value that would turn each one on. `netlify env:list --context production` can show them as `on` anyway, because the CLI also reads `netlify.toml` lines 15-23 (`[context.dev.environment]`), which reach builds of the `dev` branch (staging) and never production. Setting them is a separate decision; see `docs/terms-accuracy-fixes-2026-11-22.md` for the order (merge the Terms corrections first).

| Variable | On value | What it turns on |
|---|---|---|
| `VITE_SECTION_ADDRESSES` | `on` | One address per part (`/breath`, `/senses`, `/coach`; src/lib/sections.ts). On whenever the lens tray is on. **Replaces `VITE_START_CHOOSER`**: the start chooser (three rings to pick where to begin) was removed on 2026-11-18 at the owner's direction, so that variable is no longer read and can be deleted from a site's settings |
| `VITE_GATEWAYS_SIMPLE` | `on` | The simpler gateways (Touch first): one main choice per step, the rest under "Add more detail" |
| `VITE_SOUND_CHORDS` | `on` | Chords in the Sound gateway (softened by default) |
| `VITE_SAVE_REFLECTION` | `on` | "Save and return later": finished gateways kept encrypted on the visitor's device for 24 hours |
| `VITE_NAME_MARK` | `on` | The mark in the footer: nənya.biz, the gold e turning behind the white one (src/app/components/NenyaMark.tsx) |
| `VITE_LENS_COPY` | unset (on) | The lens vocabulary (src/lib/vocabulary.ts): visitor words say lens instead of gateway and Pattern instead of Insight, in the pages and (after the build, scripts/apply-lens-copy.mts) the static public files. **On by default since 2026-11-18** (owner: the lens words go across the whole site); `off` is the only way back to the old words. Not read from the environment of a function |
| `VITE_LENS_TRAY` | `on` | The lens tray (docs/lens-rewrite-scope.md): the start screen shows six lenses in any order and any number, each not opened, examined or added to the report, in place of choose-several-then-go-in-order. Off by default; step 1 only (the lens pages are not yet rebuilt to the new cards) |
| `VITE_LENS_RING` | `on` | The lens ring (docs/eight-sided-gem-scope.md Part 2, section 4): above the lens cards in the tray, the leaves as a menu, one leaf per lens in lens order clockwise from the top. First tap shows what the lens is, a second tap on the same leaf picks it up; keyboard: arrows, Home, End, Enter or Space, Escape. Not drawn where a leaf would be smaller than 44 CSS px (the card list is always there). Needs `VITE_LENS_TRAY`. Off by default; the owner walks it through with a screen reader and touch before it goes on |
| `VITE_LENS_TAPESTRY` | `on` | The Pattern tapestry, an optional activity inside Pattern's "More descriptions" in tray mode (wireframe: docs/wireframes/lens/pattern-tapestry.html). Needs `VITE_LENS_TRAY`. Off by default; built (src/app/components/LensActivities.tsx), saved as tapestryLayers and tapestryWords |
| `VITE_LENS_PATH` | `on` | The Movement path of movement, an optional activity inside Movement's "More descriptions" in tray mode (wireframe: docs/wireframes/lens/movement-path.html). Needs `VITE_LENS_TRAY`. Off by default; built (src/app/components/LensActivities.tsx), saved as movementPath and movementPathWords |
| `VITE_TERMS_FIRST` | `on` | The Terms-first entry (docs/terms-first-entry-scope.md). Step 1 only so far: the random working pair (the shadow ID) is made at agreement, held in memory for the whole session and made again on request, never stored; the person's own Sight or Sound colors still take over as the session ID. Off by default |
| `VITE_SUMMARY_REQUEST` | `on` | The "Request a summary" button on the coach page (docs/request-a-summary-scope.md, step 3), shown after the five exchanges and the closing note on an unflagged conversation. Needs the server's `COACH_SUMMARY_REQUEST=on` too (a switched-off server hides the button). Off by default; the wording is the owner's to approve |
| `VITE_WORD_HELP` | `on` | The "Look it up online" button under Word help (needs `WORD_HELP_ENABLED=true` on the server; English only). The on-device near words need no switch. The Terms (Sections 12 and 14) name the look-up only where this is on |
| `VITE_CELL_ENABLED` | `on` | The Terms' Section 22, "Partner-practice cells (preview)", two cross-references to it (Sections 12 and 17) and the effective date November 23, 2026, so returning visitors are asked to agree again (src/lib/legalDocument.ts, `docs/legal/README.md`). It changes nothing else: the cells themselves are opened only by the server's `CELL_ENABLED=true` (the page asks `/api/cell?status`). **Set the two together, and only after the owner approves Section 22:** with the server variable on and this one off, the cells are open but the Terms do not describe them; with this one on and the server variable off, the Terms describe a feature that is closed. Not set anywhere today |
| `VITE_NEED_TALLY` | `on` | "What has come up so far" on the coach pages (docs/need-tally-scope.md): a quiet, optional, closed-by-default control that lists the feelings and needs the person named in their own messages (from CNVC's inventory, credited), and at four or more different needs the one-to-three recommendation. Computed in the page from the messages it holds: never stored, never sent, gone with the tab; on the sealed route too. Off by default; the wording is the owner's to approve |
| `VITE_GUESTBOOK` | `on` | "Sign Our Guestbook" at /guestbook, and its links at the end of a reflection and a coach conversation (src/lib/guestbook.ts) |

**Humanity check (Cloudflare Turnstile), built 2026-11-15, off by default.** Staging first; on production only after the Terms change ships.

| Variable | Scope | Value | Notes |
|---|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Builds | the widget's site key (public) | Without it the page loads nothing from Cloudflare. A `VITE_` value needs "Clear cache and deploy site". |
| `TURNSTILE_SECRET_KEY` | Functions, secret | the widget's secret | Paste it straight from Cloudflare into Netlify; never into chat or the repo. |
| `TURNSTILE_HOSTNAMES` | Functions | production: `nenya.biz,www.nenya.biz`; staging: `nenyastaging.netlify.app` | The hosts a token may come from. **Never `localhost` on production.** Empty while on refuses every first message. |
| `COACH_TURNSTILE` | Functions | `shadow`, later `on` | `shadow` checks and counts (`coach.human.passed`, `coach.human.shadow.*`) and never refuses. `on` refuses a first message that fails (`coach.human.refused.*`). The owner's token always passes. |

Order: set the site key, the secret and the hosts, then `COACH_TURNSTILE=shadow`, and redeploy. Watch the counts for a few days, then switch to `on`.

## 4. Leave unset (defaults are right for production), except `COACH_INSTRUCTIONS`

These exist for testing, diagnosis, or turning a guard off in an emergency. Unset means the default.

| Variable | Default | Setting it |
|---|---|---|
| `COACH_CANARY` | unset | `on` lets the nightly canary run (docs/canary-scope.md): only on a site that runs the coach on Workers AI (`COACH_PROVIDER=workers-ai`, with its token). Unused Neurons only, at most 3,000 a night. |
| `COACH_CANARY_MODEL` | unset | A Workers AI model id (`@cf/…`) the nightly canary also compares, on a rotating night (for example Apertus, once access comes). Needs `COACH_CANARY=on`. |
| `COACH_PROVIDER` | `venice` | **Venice AI is the default again (2026-11-16, decided after one day on Cloudflare).** `workers-ai` runs the coach on Cloudflare Workers AI instead (Gemma 4); it needs `CF_AI_ACCOUNT_ID` and the secret `CF_AI_TOKEN`, a Terms revision that names Cloudflare (the text is archived in `docs/legal/archive/terms-and-privacy-until-2026-11-16-b.md`), and `VITE_COACH_PROVIDER=workers-ai`. No automatic fallback between providers. Sealed mode exists only on Venice. |
| `VITE_COACH_PROVIDER` | unset (= Venice) | `workers-ai` makes the pages (the demo's notices, the About pages, the region page) name Cloudflare instead of Venice AI. A build-time switch (Builds scope): always set it together with `COACH_PROVIDER` and the Terms. |
| `CF_AI_ACCOUNT_ID` | none | The Cloudflare account that runs Workers AI (32 hex characters; not a secret). Only with `COACH_PROVIDER=workers-ai` (and for the nightly canary). |
| `CF_AI_TOKEN` | none | **Secret.** A Cloudflare API token allowed only Workers AI. Only with `COACH_PROVIDER=workers-ai` (and for the nightly canary). |
| `COACH_MODEL` | `e2ee-gemma-4-26b-a4b-uncensored-p` (Venice; was `e2ee-qwen-2-5-7b-p` until 2026-11-16) or `@cf/google/gemma-4-26b-a4b-it` (with `COACH_PROVIDER=workers-ai`) | Another model for the chosen provider (a Workers AI id starts `@cf/`). The Terms name the model: change them first. |
| `COACH_CHARACTER_SLUG` | the built-in one | Another Venice character |
| `COACH_INSTRUCTIONS` | `v1` in the code | **Production is set to `v2.1` (read from Netlify's API on 2026-11-23); staging is also set to `v2.1`.** (It was `v2` from the owner's 2026-11-14 decision until v2.1 was set.) Keep it set: removing it falls back to v1. `v2.2` (v2.1 plus one sentence, 2026-11-22) is not set anywhere: it is for the owner to try on staging after review. |
| `COACH_STORE_NAME` | `coach-private` | Another Blobs store name |
| `COACH_EXTRA_HOSTS` | none | Extra hosts allowed to call the functions (deploy previews) |
| `COACH_BUILD` | the generated build label | Overrides the label signed into transcripts |
| `COACH_HARDWARE_CHECK` | `report` | `enforce` or `off` for the encrypted model's hardware check |
| `COACH_E2EE_PLAIN_HISTORY`, `COACH_E2EE_MINIMAL` | off | Diagnostics for the encrypted route |
| `COACH_E2EE_ATTESTATION_TTL_S`, `COACH_E2EE_ATTESTATION_STALE_S` | 300, 900 | How long (seconds) the encrypted model's verified key is reused, and how old a remembered key may be when a fresh check fails; at most a day. `0` turns the reuse off (src/lib/veniceE2ee.ts) |
| `COACH_ACCEPTED_KEY_IDS` | none | Earlier signing-key ids (comma-separated) whose transcripts `/api/report` still accepts after `COACH_SIGNING_KEY` is replaced (src/lib/signedCheck.ts) |
| `COACH_INCLUDE_VENICE_PROMPT` | off | Adds Venice's own system prompt; leave off |
| `COACH_METHOD_NOTES` | none | Short method notes (the Blobs key `method-notes` is used first) |
| `COACH_FINAL_SUMMARY` | unset (off) | `on` makes the last exchange of instructions v2.1 a short summary of the feelings and needs heard, one line of encouragement and a pointer to the downloadable transcript (docs/coach-instructions-v2.1.md). Unset keeps the earlier closing (say what you heard, name one thing to keep), and the instructions fingerprint is then unchanged. `call` instead draws the summary in a separate, focused model call that sees only the person's messages (`src/lib/finalSummary.ts`), after the coach's own two-or-three-sentence closing, and adds one site-written sentence about the transcript (a pool of six, chosen per conversation); if the summary fails its checks twice the closing stands alone. Turn either on only after the final-summary check (`scripts/eval-final-summary.mts`) has been read. |
| `COACH_SUMMARY_FORM` | unset (auto) | With `COACH_FINAL_SUMMARY=call`: `written` forces the model-written two-part summary, `picked` forces the form where the model chooses up to three feelings and three needs from CNVC's Feelings and Needs Inventory (`src/lib/feelingsNeeds.ts`) and the site writes the sentences (`src/lib/finalSummary.ts`). Unset or `auto` goes by the model's size in its name: 20B or more is written (the 26B), smaller is picked; a name with no size is written. Words outside the inventory are dropped; with no valid word the closing stands alone. |
| `COACH_SUMMARY_REQUEST` | unset (off) | `on` lets the coach function answer `action: "summary"`: a requested summary of a FINISHED conversation (all five exchanges, with its signed ticket), written from the whole conversation (the person's messages and the coach's replies) in the form `COACH_SUMMARY_FORM` picks, plus one transcript sentence from the site's pool. A flagged conversation gets the site's fixed sentence and no model call; the request counts against `COACH_DAILY_CAP` as one turn. Nothing on the page asks for it yet (`docs/request-a-summary-scope.md`, build step 1). |
| `COACH_NEED_FOCUS` | unset (off) | `on`: when the person's last message names four or more needs from CNVC's Feelings and Needs Inventory (everyday nouns such as air, food, water and space are not counted), the site adds one plain sentence after the reply recommending one to three, because that helps them see what is really pressing (`src/lib/needFocus.ts`). A summary that names more than three needs ends with the same recommendation whenever summaries are on. The sentence is draft wording for the owner's approval and belongs in the Terms' list of the site's own words before the switch goes on. |
| `COACH_BOUNDARY_GUARD` | unset (off) | `on` enables the two boundary guards (a medication directive; a promise to be there or to remember, or standing in for the person's people): asked again once, then the offending sentences are taken out, or the site's fixed sentence replaces the reply. **Owner to approve the two fixed sentences in `src/lib/boundaryGuard.ts` first.** |
| `VITE_BOUNDARY_GUARD` | unset (off) | The same two boundary guards on the **sealed** (encrypted) path, which runs in the browser: a build-time switch (Builds scope). The relay cannot read the reply, so it cannot ask the model again: the offending sentences are taken out, or the fixed sentence replaces the reply. Set it together with `COACH_BOUNDARY_GUARD`. |
| `COACH_FORM_CHECK`, `COACH_ABOUT_ANSWERS`, `COACH_LANE_GUARD`, `COACH_ARC_GUARD`, `COACH_CLOSING_GUARD`, `COACH_PERSONA_GUARD`, `COACH_NAME_GUARD`, `COACH_INFRA_GUARD`, `COACH_CARE_GUARD` | on | `off` turns that check off. For emergencies only. |
| `PALETTE_DAILY_CAP`, `PALETTE_PER_CONNECTION` | 300, 20 | Limits for The Color API button |

## Not for Netlify

Used only by scripts on your computer, never set on the site: `NENYA_OWNER_TOKEN` (the token itself, for the staging suite), `NETLIFY_SITE_ID` and `NETLIFY_API_TOKEN` (for upload scripts; the repo folder is linked to production, so prefix `NETLIFY_SITE_ID` deliberately), `NENYA_RESEARCH_DIR`, `GEM_SETTINGS`, `LOGO_EXPORT_OUT`, `CHROME`. `NODE_VERSION = 24` is set in `netlify.toml`.
