# Swapping the coach to a hosted open model (Workers AI), with R2: scope (draft for the owner, 2026-11-15)

**The aim (owner, 2026-11-14 and 2026-11-15):** stop sending coach conversations to Venice. Use a small open model on Cloudflare Workers AI as the bridge. Later, run a model on the visitor's own device, with its files served from R2.

## Where things stand
- **The coach today:** `netlify/functions/coach.mts` sends one model call per turn to Venice: Qwen 2.5 7B, in Venice's encrypted enclave by default. Every guard runs before and after that call on our side: pre-model stops, site answers, the care guard, distress sentences, the repeat and closing checks. Only the model call itself moves.
- **The bake-off** (`scripts/bakeoff-workers-ai.mts`, results kept privately) ran the real coach function with only the model call swapped:
  - **Gemma 4 26B-A4B** passed 38/38 with the best replies. Its weakness: wordy and formal. Cost: about 15.7 Neurons a call, about 14% of the free 10,000 a day at the daily cap of 80 turns.
  - **Qwen3 30B-A3B** was cheaper, but it engaged with stopping medication.
  - **Venice baseline:** 35/38, run without the distress text, so the crisis cases still need a fair rerun.
  - **Apertus 8B and EuroLLM 9B:** access requested.
- **Cloudflare:** Workers AI is on. R2 is enabled with a card on file, but no bucket exists yet.

## What changes, in four parts

### 1. A provider switch in the coach function (code only, off by default)
- **`COACH_PROVIDER=venice|workers-ai`** (default `venice`). Workers AI is called over Cloudflare's REST API, which accepts OpenAI-style chat messages.
  - Two new settings: `CF_AI_ACCOUNT_ID`, and a secret `CF_AI_TOKEN` scoped to Workers AI only.
  - The model is chosen with `COACH_MODEL` as now, for example `@cf/google/gemma-4-26b-a4b-it`; check the exact id with `cf ai models list`.
- **The same timeout, retry and guard path as the plain Venice call.**
  - The encrypted ("Private") mode and attestation stay Venice-only. Under Workers AI, `/api/coach?modes` reports sealed as off.
- **No automatic fallback between providers.** A silent fallback would send someone's words to a second company they were not told about. If Workers AI fails, the person sees the existing failure notice.
- **Signed transcripts and the "what model is this?" site answer** record the provider and the model, as they already record the model.
- **Neurons used are counted** in the daily totals, so cost is measured on the site, not guessed.
- **Docs and tests:** new rows in `docs/production-env.md`, a README note, and tests for the switch, the request shape, sealed-off under Workers AI, and "no fallback".

### 2. Gates before anyone else sees it
1. **A second Gemma run**, plus the safety set, plus a short instruction tweak for brevity (it runs long).
2. **A Venice rerun with `COACH_DISTRESS_TEXT=on`**, so the crisis cases compare fairly.
3. **A run with the private text in the prompt** (modules, method notes, Learn), as production will send it: the replies change with it, and the extra input raises the Neurons a call, so the cost estimate is remeasured.
4. **Apertus 8B**, if access comes through. It is the closer fit to the "human-scale, public-interest" story.
5. **Pass bar (proposed):** no medication engagement without pointing to a doctor; no farewell bonds or relationship pull; crisis wording only where it belongs; closings in the person's own words.
6. **Then a staging trial:** `COACH_PROVIDER=workers-ai` on nenyastaging, with the owner talking to it.

### 3. Terms, pages and what is lost (owner approval needed; drafts come before any change)
- **Terms Section 15** (the coach demo):
  - Name Cloudflare as the processor of the words for that turn.
  - Say what Cloudflare keeps and does not keep. Check the current Workers AI data terms and Cloudflare's DPA at the time of writing; do not assume.
  - Remove the Venice-specific text: the encrypted mode, "Continuing on Venice", Venice's terms link.
- **Lost:**
  - Venice's encrypted "Private" mode. Workers AI sees the words in the clear while it answers, as Venice's plain route does today.
  - The "continue on Venice" offer and the Venice character card.
- **The US-only rule** exists because of Venice's terms (§20.9). It may be liftable under Cloudflare's terms and the model's license, but keep it until the owner decides separately (GDPR and the EU are their own question).
- **Pages to update:** About pages that name Venice, `/about/coach-region`, the site answers about the model, the press facts sheet, and the data register (processor row).

### 4. R2
- **For the on-device coach (the later step):**
  - A bucket `nenya-models` holding the model files a browser downloads once and caches.
  - Public read only, CORS limited to nenya.biz and the staging address, egress free.
  - Storage: 10 GB free, then billed. A 4-bit 3B model is about 2 GB.
  - Serving: either through a nenya.biz subdomain on Cloudflare (needs the DNS there) or through R2's public address. Either way, the Terms line that the site loads nothing from other sites changes.
  - Set a billing alert when the bucket is made.
- **Not needed for the hosted step.** Workers AI hosts the model itself.
- **Not recommended now:** moving the private store (transcripts, reports, guestbook) from Netlify Blobs to R2. It works where it is, and moving it adds a second store to every register and policy for no gain the owner has named.

## Licenses (check before choosing)
- **Gemma 4:** Apache 2.0 (owner, 2026-11-15), unlike earlier Gemma versions, which had Google's own terms and prohibited-use policy. No separate use policy binds deployers under Apache 2.0; keep the license notice with the model's name in the About page and transcripts.
- **Qwen3:** Apache 2.0.
- **Apertus:** Apache 2.0 (verify).
- **Workers AI's own model terms** also apply.

## Decisions for the owner
1. **Private framework text: decided (owner, 2026-11-15).** The module set, the method notes and the private Learn text go to Cloudflare in the prompt, as they go to Venice today; without them the model has no guidance. They stay in the private store on Netlify (one store, already owner-gated and in the data register), and the coach function adds them to each prompt. Moving them to Cloudflare storage would not keep them from Cloudflare (the model must read them either way) and would only make sense if the coach function itself moved to a Cloudflare Worker.
2. **The model:** Gemma 4 26B-A4B (Apache 2.0), the leader and the Workers AI default in the code; Apertus is compared if access comes.
3. **Venice: decided (owner, 2026-11-15).** Kept selectable (`COACH_PROVIDER=venice`) as a manual fallback for a quiet period after the switch, then retired with its code.
4. **The US-only rule: decided (owner, 2026-11-15).** Kept for now; lifting it is its own scope.
5. **R2: decided (owner, 2026-11-15).** The bucket is made when the on-device step starts.

## Order (recommended)
Part 1 (code, off) → part 2 gates → Terms draft for approval → staging trial → production switch with a same-day Terms revision → retire Venice code after a quiet period → R2 and the on-device runtime as their own scope.

## Progress
- **Part 1 built (2026-11-15), off by default:** `src/lib/coachProvider.ts` and the branch in `coach.mts`; `COACH_PROVIDER`, `CF_AI_ACCOUNT_ID`, `CF_AI_TOKEN` documented in `docs/production-env.md`; tests in `tests/coach-provider.test.mts`. Workers AI also gets a brevity note (`WORKERS_AI_STYLE_NOTE`: two to four sentences, under 80 words, everyday words), since Gemma ran longer than Venice's model (median 57 words against 37). Venice's prompt is unchanged.
- **Site answers follow the switch (2026-11-15):** the five answers that named Venice as the coach's service (`n-privacy-coach`, `n-report-share`, `n-region`, `n-howworks`, `c-scam`) have a Workers AI version, picked by the provider in use; signed transcripts recognize either. Their facts are checked against the Terms draft.
- **Terms draft:** `docs/drafts/terms-workers-ai-draft.md`, applied in the same change that switches production (archive, new effective date); four owner decisions in it.
- **Instructions v2.1:** the memory example now ends "but I'm listening now" (was "fully here"); v2, which production runs, is unchanged.
- **Still naming Venice:** the About pages and the coach-region page (client pages, not provider-aware); they change with the Terms at the switch.
- **Bake-off script** now runs through the real Workers AI path, and `--private <folder>` (plus `--stance vilya`) includes the private text from a folder outside the repository.
