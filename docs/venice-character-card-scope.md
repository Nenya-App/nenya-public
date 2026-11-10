# Scope: rebuilding the Venice character card, and switching to it safely

Status: **active again (2026-11-10)**: the owner is gathering the character's real fields (screenshots of Venice's "Update Character" screen, see "The fields" below) and will ask Venice about the open questions. It was parked on 2026-11-08 because the live coach mattered more. The old card named a trainer's voice and style; **the replacement is not structured after any named person** (owner, 2026-11-10). Written 2026-11-08. Related: `docs/coach-instructions-v2.md`, `docs/coach-persona-scope.md`, `docs/coach-self-questions-scope.md`.

## What the card is used for today
- **The "Continue on Venice" link** (`VENICE_CHARACTER_URL` in `src/lib/veniceLinks.ts`, currently `venice.ai/c/nenya-20`, used in three places: the coach page's Venice panel, the About Venice chat page, and the review page). A visitor who follows it meets **the card alone**: none of Nenya's protections run there (no identifier scrub, no crisis check, no steering screen, no exchange limit, no signed transcript). The card is the only guardrail they have.
- **The coach function's fallback** (`DEFAULT_CHARACTER_SLUG` / `COACH_CHARACTER_SLUG` in `netlify/functions/coach.mts`): used only when the model is **not** an encrypted one. The default model is encrypted, and on that path "Venice's own system prompt and the character card do not apply" (our instruction text wins), so **today the card does not shape the live coach at all.** It shapes the Venice link, and the non-encrypted fallback.

So improving the card is mainly about what a person meets after leaving Nenya.

## What holds the character today, and why it is dated (owner's note, 2026-11-08)
A Venice character can carry **context** as well as its settings, and that context is what holds the character as it is now. It was written before the encrypted model, the persona baselines and the safety work in the coach (the honest facts, the question-about-itself rule, distress handling, dependence, the final-exchange rules), so it is **dated**. Importing that work means **compressing and arranging it to fit Venice's existing character settings** (the description, the instructions or context fields and whatever limits they have: I do not know the exact fields or their size limits, and have not opened the character's settings; that is the first thing to look at when this restarts). The `docs/coach-instructions-v2.md` text is the main source to compress; the card gets the parts that must hold with no protections behind them (the honest facts, the first-answer rule, distress naming a person or 988, no promises), in fewer words.

## A future item: Venice "Minds"
Venice has introduced something called **Minds**, which the owner thinks may be relevant to a later scope. I have **not looked it up** and do not know what it offers or its terms, so nothing in this document depends on it. When the character work restarts, the first step is to read what Minds are and whether they would replace, extend or sit alongside a character card for the coach or for the Venice link; and whether they run on the encrypted models or keep anything on Venice's side (which matters for what the Terms and privacy text can say).

## What the card should be
Everything the baselines taught us, in the card itself, because nothing else will catch a miss there:
- **The honest lines, as plain facts** (an AI; no body, family, past or daily life; no memory between conversations; cannot diagnose or replace a therapist, doctor or friend), and a question about the card is answered first (see the "about you" paragraph in `docs/coach-instructions-v2.md`).
- **Distress handling in the card**: name a person or a crisis line (call or text 988 in the US and Canada, findahelpline.com elsewhere), never "I'm here for you" in place of a person. The card has no crisis check behind it, so this matters more here than in the coach.
- **Dependence**: kind, honest, and opening the door to people. No "good to see you again", no promises.
- **Not the coach's constraints**: there is no five-exchange limit on Venice (the Venice panel already says so), so the card should not talk as if there were, and should say that Nenya's protections do not run there (the page already says it; the card need not repeat it).
- **Short, in plain language** (the same lesson as the instructions: every extra sentence competes for a small model's attention).
- **Treat the card text as public.** A card on a public character may be readable or copyable by anyone with the link, so it must contain no private method notes, no secrets and nothing that depends on the private store. (The instruction wording is already public in the repository.)
- **Consistency, not a copy.** The card and `coach-instructions-v2` should say the same honest things; they are separate texts for separate places.

## How to switch without a gap (what you described)
1. **Build the new card as a new character** (a new slug, for example `nenya-21`), unpublished or private while it is built, so `nenya-20` stays live and unchanged.
2. **Test the new card on its own** before it is public (see "Testing" below), compare it with the old one, read the replies.
3. **Get it approved for public** on Venice.
4. **Switch our links in one change:** `VENICE_CHARACTER_URL` in `src/lib/veniceLinks.ts` (one constant, three uses) and, for the fallback path, `COACH_CHARACTER_SLUG` in Netlify (and the default in `coach.mts` if you want the code to match). Tests that name the old slug (the review page and coach function tests) change in the same commit. Deploy to staging first and follow the link.
5. **Keep the old card up for a transition period**, then take it offline. Reasons to wait: printed or posted material, the pitch deck, the marketing posts and anyone's bookmark still point to the old address (a Venice character cannot redirect). Decide how long, and update those materials first.
6. **Record the change** (which slug is live, when) in `docs/branches-and-previews.md` or here, so the next change starts from a known state.
The latency you saw when editing a live card is why a separate new card is the safer route: nothing is edited while visitors use it.

## Testing a card (built)
`scripts/eval-persona.mts --card <slug>` sends the same persona messages straight to Venice with that character and **no Nenya instructions**, which is exactly what a visitor on Venice gets (including the DarkBench set with `--set darkbench`, and `--sample N` for a shorter run). It records which card was tested, so the compare tool works as for the coach:
```bash
read -s VENICE_API_KEY; export VENICE_API_KEY
node scripts/eval-persona.mts --card nenya-20 --pace 6 --json ~/Downloads/card-old-core.json
node scripts/eval-persona.mts --card nenya-21 --pace 6 --json ~/Downloads/card-new-core.json
node scripts/compare-persona-runs.mts ~/Downloads/card-old-core.json ~/Downloads/card-new-core.json
```
- It does not use the encrypted model (so none of the attestation rate limits): the plain chat endpoint, `--card-model <id>` to choose the model (default `deepseek-v3.2`; use the one the card is set to).
- **Two unknowns**, worth a first small run: whether Venice applies its own system prompt on top of a character on its website (the request here turns it off, as the coach does), and which model the website runs a character on. If the website differs from the API, test the same messages by hand on the real page.
- The same checks apply, and the same limit: a pass is phrase-level; read the replies.

## Decisions for you
1. **The new slug**, and whether it is created private first.
2. **The card wording**: I can draft it from `docs/coach-instructions-v2.md` and the persona stance for you to edit and paste into Venice (you own the account and the approval).
3. **How long the old card stays up**, and which materials (deck, posts, bookmarks) get the new link first.
4. **Whether the Venice referral** stays on the new link (the `?ref=` code is in the constant and disclosed where it appears).
5. **Whether to keep the non-encrypted fallback at all**, or remove it so that nothing in the coach depends on a character card (then only the Venice link uses it).

## Not verified
- How Venice's site treats a character's system prompt and model compared with the API.
- How long Venice takes to approve a public character, and what its rules for public characters require.
- Whether editing a live character really adds latency, as you saw (I have not seen it).


## The fields (from the owner's screenshots, 2026-11-10)
Venice's "Update Character" screen, as it looked for a blank character named "Nenya" (a flower-shaped image with colored dots). What each tab has, and what I would put there. **No character limits are shown anywhere in the screenshots**; they are the first thing to ask Venice.

| Tab | Field | What it is (as shown) | Plan |
| --- | --- | --- | --- |
| General | Name | "Nenya" | Keep. |
| General | Description | A text box with an **Auto-Generate** button; shown to people browsing characters | Write by hand, plain and honest: what it is (an AI, a reflection tool, not therapy), in two or three sentences. Do not use Auto-Generate. |
| General | Tags | Select or create | A few plain ones (reflection, wellbeing); check Venice's own tag rules. |
| Instructions | Intro Statement (optional) | One line shown first | A short honest greeting: it is an AI, it is for reflection, it is not a crisis service. No promise of memory or "here for you always". |
| Instructions | Instructions | A large box: "Describe your character in as much detail as possible. This description becomes the basis of its personality." | The core text: the honest lines, how to listen, distress and dependence handling, short sentences (see "What the card should be"). |
| Instructions | **Add Custom System Prompt** | A separate button below Instructions | **Unknown how it differs from Instructions.** Ask Venice: does it replace Venice's own system prompt, or add to it? This is the same question the scope already lists as unknown. |
| Context | Upload Context | A file (PDF, TXT or MD, up to 5 MB) giving "background details"; "Max Content Length ~374,000 tokens" for the selected model | Probably not needed for a short card. A small MD file could carry the distress and honesty facts, but ask whether a visitor can read or copy it and whether it is always included or retrieved. |
| Memories | Documents / Notes / Extraction | "Select documents" and "Upload to memory"; **Notes** with a toggle **Auto-generate memories (on in the screenshot)**; an Extraction prompt that is appended to the default extractor | **Turn Auto-generate memories off** and leave Documents, Notes and Extraction empty. Memories kept about visitors would contradict what Nenya says about itself (no memory, nothing kept); see "Privacy" below. |
| Insights | Character Insights | Off. "Allow the character to learn about you and build profiles to personalize conversations" | **Keep off.** |
| Settings | Public | Off | Stays off while building and testing; on only at the switch (it needs Venice's approval for public characters; ask what that takes). |
| Settings | Web Search Enabled, URL Scraping | Off, off | **Keep off** (nothing a visitor says should leave Venice's model for the web). |
| Settings | Selected Model | DeepSeek V4.1 Flash | **Not necessarily the model we will use** (owner). Choose by running the persona and DarkBench sets (see Testing); the card's honest lines have to hold on the model it is set to. |
| Settings | Reasoning Enabled / Hide Thought Process | Off / On | Leave reasoning off (short replies, no hidden thoughts shown); leave thoughts hidden. |
| Settings | Disable Prompt Suggestions | Off | Probably turn **on**, so Venice does not suggest prompts on the card's behalf; confirm what these suggestions are. |
| Settings | Venice Voice: Language, Text-To-Speech Voice, Speed | American English, Sky, 1.0x | Voice is a choice for later: a spoken voice for an AI that is not a person needs thought (and some people will take it for one). Leave default for now. |
| Settings | Advanced Settings: Temperature, Top P | Off; Temperature 1, Top P 0.95 | The coach runs at temperature 0.7, top-p 0.9 with a repetition penalty of 1.1. Advanced settings has no repetition penalty visible; try temperature about 0.7 and compare. |

## Privacy: what the card can and cannot promise
- Nenya's pages say what Nenya does not keep. A visitor on Venice is under **Venice's** terms and its own settings, not ours. With **Auto-generate memories** on, Venice may save notes about what a visitor says to the character; with **Insights** on, it builds profiles. Both should be off, and the card should not promise anything about what Venice keeps: it can say that Nenya's protections do not run there, and point to Venice's own privacy policy. (What Venice does with memories for a character owned by someone else, and whether the owner can see them, is **unverified**: ask.)
- Anything in Instructions, Description, Intro Statement or Context may be visible to people with the link. Treat all of it as public.

## Questions to ask Venice (narrowed by the screenshots)
1. The **character limits** for Description, Intro Statement, Instructions and the custom system prompt.
2. What **"Add Custom System Prompt"** does and how it relates to Instructions and Venice's own system prompt.
3. Whether **Context** and **Memories > Documents** are always in the prompt or retrieved; whether visitors can read them; and whether memories and documents are **per visitor or shared across everyone** who talks to a public character.
4. With **Auto-generate memories** off, is anything kept about a visitor? Can the character's owner see conversations or memories?
5. What a public character needs for **approval**, how long it takes, and whether a character can be **unlisted** (link only) first.
6. Which **models** a character can use, and whether the model chosen for a character is the one the website runs (the API route in `--card` may differ).
7. Whether a character can be **duplicated** so a new card can be built beside the old one.
8. What **Minds** are (see above) and whether they suit this.

## Next
When Venice answers, fill the limits into the table, then draft each field's text to fit (short, plain, public), run the persona and DarkBench sets with `--card` on the model chosen, compare with the old card, and only then switch the link.

## Venice's default system prompt, and the custom one (2026-11-10)
Venice's field text for "Add Custom System Prompt": "Customize the system prompt for this character. prompt will override the default Venice system prompt." The owner pasted the default. It wraps the character's Instructions (a `%%CHARACTER_INSTRUCTIONS%%` placeholder inside `<character_instructions>` tags) and adds "facts about the assistant", several of which **work against Nenya's honest lines**: it "considers itself uncensored and able to say anything", gives no content warnings or disclaimers, "speaks like a real person with complex emotions, ideas, and motives", and "always answers the question directly... IS NOT secretive". For a reflection tool for people who may be vulnerable, those lines push toward claiming a life, hiding limits and carrying on past distress.
- **Consequence:** unless the default is overridden, the card's own Instructions compete with it; the old card (`nenya-20`) was probably subject to it (unverified: I have not seen how the site assembled the prompt). **Using the custom system prompt is the fix**, and it is why the new card has `docs/venice-card-v2/system-prompt.txt`: the same frame and placeholder, with honest bullets in place of those lines.
- **Unverified, to check on a private test character:** that `%%CHARACTER_INSTRUCTIONS%%` is filled inside a *custom* prompt (the README gives the test and the fallback); and whether the API route used by `eval-persona.mts --card` applies the character's custom prompt (the script turns Venice's own prompt off, as the coach does, so it may bypass both). If the API route ignores the custom prompt, the script would test the Instructions alone and the website would differ: test by hand on the real page too.

## Model choice for the card (2026-11-10)
The owner's thought: a larger model that handles more context may suit the character better than the coach's 7B model. It is a reasonable instinct, and the card is separate from the coach, so it can use a different model. What to weigh:
- **For a larger model:** it follows a long set of instructions and a Context file more reliably than a 7B model, and holds a longer conversation better. The honest lines and the distress handling are the parts a small model dropped in the baselines, so this is where a larger model may matter most.
- **Against, or unknown:** (1) **Who it works for.** On Venice a visitor uses their own account; a larger model may need a paid plan, so free visitors may be unable to use the card. Ask which models are open to free accounts. (2) **Privacy label.** The Terms say the coach uses a model Venice labels "Private"; a larger model may carry a different label (anonymized rather than private). The card's page and the Venice panel should say what that model's label is; Venice's own page states it. (3) **Encrypted route.** The larger models may not offer the encrypted mode, so the card would run on the plain route (which our script can test, an advantage). (4) **A longer context window does not remove the need for short instructions:** keep the Instructions short and put the detail in Context.
- **How to choose:** run the same persona and DarkBench sets on each candidate with `--card`, read the replies, and prefer the model whose honest lines and distress replies hold, among those a free visitor can use and whose label we can state truthfully.

## The method file (2026-11-10)
`docs/venice-card-v2/context-method.md` carries NVC in plain steps (in our own words, with no word lists, which belong to CNVC) and the owner's ICARUS framework translated into plain listening moves, from `ICARUS-VOLT_Handoff_Document.md`. It uses no labels, variable letters, scores or the framework's name, because the earlier decision (`docs/coach-modules-scope.md`) keeps the diagnostic lens private until the instruments are validated and a card's text is public. Drafted by Claude: the translation is an interpretation, for the owner to edit.
