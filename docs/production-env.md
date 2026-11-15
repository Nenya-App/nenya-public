# Production environment variables

Every variable the site's functions read, for the **production** site (nenya.biz). Names only: values never go in the repo or in chat.
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
| `COACH_ARC` | `practice` | The practice arc (later) |
| `COACH_STANCES` | includes `learn` | The Learn stance (later) |
| `COACH_SEALED` | `on` | Sealed mode (later; needs an `e2ee-` model) |
| `COACH_MODULES` | `on` | The private module set (method notes in parts: the ICARUS lenses and the coaching moves, chosen per reply). Off: the single `method-notes` text is used. Upload the set to production's store first. |
| `CELL_ENABLED` | `true` | Partner cells (not built for visitors yet) |
| `PALETTE_ENABLED` | `true` | "Ask The Color API" in the Sight gateway |
| `COACH_CARD_DRAFTS` | leave unset | Owner tool for card drafts; not for production |

**Build switches for new screens (Builds scope; "Clear cache and deploy site" after a change).** Staging first; on production only after the owner approves what staging shows.

| Variable | On value | What it turns on |
|---|---|---|
| `VITE_START_CHOOSER` | `on` | The start chooser before the Terms (breathing, reflection or the coach); retires the automatic tour offer |
| `VITE_GATEWAYS_SIMPLE` | `on` | The simpler gateways (Touch first): one main choice per step, the rest under "Add more detail" |
| `VITE_SOUND_CHORDS` | `on` | Chords in the Sound gateway (softened by default) |

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
| `COACH_MODEL` | `e2ee-qwen-2-5-7b-p` | Another Venice model. The Terms name the model: change them first. |
| `COACH_CHARACTER_SLUG` | the built-in one | Another Venice character |
| `COACH_INSTRUCTIONS` | `v1` in the code | **Production and staging are set to `v2`** (owner, 2026-11-14). Keep it set: removing it falls back to v1. |
| `COACH_STORE_NAME` | `coach-private` | Another Blobs store name |
| `COACH_EXTRA_HOSTS` | none | Extra hosts allowed to call the functions (deploy previews) |
| `COACH_BUILD` | the generated build label | Overrides the label signed into transcripts |
| `COACH_HARDWARE_CHECK` | `report` | `enforce` or `off` for the encrypted model's hardware check |
| `COACH_E2EE_PLAIN_HISTORY`, `COACH_E2EE_MINIMAL` | off | Diagnostics for the encrypted route |
| `COACH_INCLUDE_VENICE_PROMPT` | off | Adds Venice's own system prompt; leave off |
| `COACH_METHOD_NOTES` | none | Short method notes (the Blobs key `method-notes` is used first) |
| `COACH_FORM_CHECK`, `COACH_ABOUT_ANSWERS`, `COACH_LANE_GUARD`, `COACH_ARC_GUARD`, `COACH_CLOSING_GUARD`, `COACH_PERSONA_GUARD`, `COACH_NAME_GUARD`, `COACH_INFRA_GUARD`, `COACH_CARE_GUARD` | on | `off` turns that check off. For emergencies only. |
| `PALETTE_DAILY_CAP`, `PALETTE_PER_CONNECTION` | 300, 20 | Limits for The Color API button |

## Not for Netlify

Used only by scripts on your computer, never set on the site: `NENYA_OWNER_TOKEN` (the token itself, for the staging suite), `NETLIFY_SITE_ID` and `NETLIFY_API_TOKEN` (for upload scripts; the repo folder is linked to production, so prefix `NETLIFY_SITE_ID` deliberately), `NENYA_RESEARCH_DIR`, `GEM_SETTINGS`, `LOGO_EXPORT_OUT`, `CHROME`. `NODE_VERSION = 24` is set in `netlify.toml`.
