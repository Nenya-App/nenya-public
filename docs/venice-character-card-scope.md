# Scope: rebuilding the Venice character card, and switching to it safely

Status: **parked** (2026-11-08): the owner will not do anything with the character for now, because the live coach matters more in the long run. Scoping and one testing tool (`--card` in the persona evaluation) are kept so the work can start from here. Written 2026-11-08. Related: `docs/coach-instructions-v2.md`, `docs/coach-persona-scope.md`, `docs/coach-self-questions-scope.md`.

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
