# Scope: live screening of coach messages with a small model, and how it improves without user data

Written 2026-11-12. Nothing here is built. It extends `docs/coach-detection-rescope-ethos.md` (which kept the matcher on the server and scoped the model for the witnessed side only) to **live screening**, at the owner's request. Sizes, limits and licences marked (verify) are from memory.

## 1. What we need (and do not)
- **A second signal beside the phrase matcher**, to catch what words miss (implicit contempt, dehumanizing comparisons without a listed word) and to avoid what words get wrong (quotes, grief, reclaimed words, which the model reads in context better than a list).
- **Gentle outcomes only from the model alone**: offer a card, soften or turn the reply toward feelings and needs. **A boundary or an ending needs the matcher and the model to agree, or the existing harm-to-others rule.** One signal never ends a conversation.
- **Nothing stored.** No message, score or identifier is kept by the checks. The ladder's state lives in the person's browser for the visit, as designed.
- **Honesty about it.** People can see that the checks exist, how they work and what they can do; they can contest a decision. They cannot switch the checks off (the safety purpose), and the text says why.
- **Improvement without real-user text.**

## 2. The stack
**The flow, per message, on the server (in memory only):**
1. Existing guards first (crisis and harm-to-others stops, the AI-directed-abuse path): unchanged and unaffected by the model.
2. The matcher (private list, cue words, the neutral-identity guard, reporting-frame rule) runs: microseconds.
3. The model scores the **latest message** (not the history) **in parallel with the call to Venice**, so it adds no waiting. If it has not answered within a short budget (for example 400 ms), the reply goes on **without it** (fail open to the matcher), and an aggregate counter ticks `model_unavailable`.
4. A small decision table (section 3) combines the two into one of: nothing, offer a card, soften, boundary level 1 or 2. The reply and the transcript note record **which checker said what, by rule name**, never the score.
5. Memory is released. Nothing is logged except aggregate counters (section 5).

**The model.**
- **Candidates:** a ToxiGen-trained RoBERTa (about 125M parameters, int8 ONNX about 125 MB (verify)) is the obvious one; a distilled model or a MiniLM-sized classifier (about 20 to 40 MB) is better for a function. **First step is a bake-off on our evaluation sets (section 4), not a choice by reputation.** Check each model card's licence and training data (verify) before use.
- **Runtime:** `onnxruntime-node` (or transformers.js, which wraps it), int8 quantized, CPU, single short input: about tens to low hundreds of milliseconds warm.
- **Where it lives.** Either **bundled in the function** (if the unzipped bundle stays under the host's limit, about 250 MB (verify)), or **in Netlify Blobs** and fetched on a cold start into the function's temporary disk, then reused while the instance is warm. Bundled is simpler and faster at cold start; Blobs lets the model change without a deploy and keeps a large file out of the build. **Recommendation: bundle a small distilled model; use Blobs only if the model is too large.**
- **A separate small function** (`screen`) called by the relay, or the same function with lazy loading? A separate one keeps the relay's cold start small and lets the screening fail without taking the coach down. Our own function calling our own function keeps the text on our infrastructure. **Recommendation: separate function.**
- **No third party sees the text for screening.** This stays true only if the model runs in our function; it is the reason for not using a hosted moderation API.
- **Client-side alternative (noted, not recommended for enforcement):** the model is open, so it could run in the browser (about 25 to 125 MB download) and send nothing. But a browser check can be bypassed, so it cannot be the safety layer; it could at most power an advisory "this may land hard" nudge. Keep server-side as the authority.

## 3. Decision table (draft)
| Matcher | Model | Outcome |
| --- | --- | --- |
| nothing | low | nothing |
| nothing | high | **offer a card** or soften the reply only; no boundary |
| match, cue present | low | offer a card; level 1 (acknowledge) at most |
| match | high | level 1 or 2 per the ladder |
| harm-to-others / crisis rule | any | existing stop (unchanged, comes first) |
| reporting, quoting, grief frame | any | nothing (the frame rule wins unless the harm rule fires) |
Level 3 (ending) stays out until the measured false-alarm rate allows it. Thresholds are set on our evaluation sets, not by feel, and the table itself is versioned.

## 4. How it improves without real-user text
**A fixed benchmark ladder** (all offline, counts only, nothing in the repository): HateCheck (per functionality), ETHOS, MetaHate's non-hateful half (false alarms), ToxiGen's own test data, and **our hand-written scenes** (must-not-count and multi-turn, written with a counselor and an advocate; these are the ones that matter most). Every checker version (matcher list version, model name and hash, thresholds) gets a row of results in a versioned table in `docs/`, so a change is a visible before and after, and a worse number blocks the change.

**Synthetic data for our own domain.** Public sets are social-media comments; our traffic is reflective, often angry or grieving text addressed to a coach. We write **scene templates** (a person describing a quarrel, a quote of someone else's hateful remark, grief about a war, a venting rant with no group target) and expand them with an AI model plus **human review** (a counselor and an advocate read a sample). No user text goes into the generator, so no user data is involved. The synthetic set is for **measuring** first.

**Calibration before any tuning.** Choosing thresholds and combining the two signals per category is the safest improvement: no model changes. Next, if needed, a **small tuning step on public and synthetic data only** (a lighter head over the frozen model). **Decision for the owner: "training is not offered" and "conversations are never used to train" are about people's conversations and stay absolutely true; this is tuning on public and synthetic data. Do you accept that, with the Terms saying exactly that?** If not, we stay at calibration and pick better off-the-shelf models.

**Shadow mode on real traffic, with no text kept.** Before the model is allowed to act, it runs silently on live messages, and the server keeps only **bucketed counters per day**: how many messages the matcher flagged, how many the model scored in each of a few score bands, and how many of each combination. That tells us the real-world flag rate and how often the two agree **without retaining a single message or score**. It is the same kind of aggregate we already keep for daily totals. (Counters this coarse cannot identify anyone; the Privacy text names them.)

**A way for people to tell us it was wrong, on their terms.** A button on a card or a softened reply: "This was a mistake." By default it only ticks an aggregate counter for the rule name (no text, no identifier). Separately, and only if the person chooses, they can attach that one message through the existing consent flow (a signed consent receipt, a person reads it, they can take it back). That gives us real false-alarm cases from people who decided to share them, without collecting by default.

## 5. What is kept, and what people can control
- **Kept, always:** daily aggregate counters (flag counts by rule name and score band, model-unavailable count, mistake-button counts). No text, no scores per message, no identifier, nothing linked to a connection.
- **Never kept:** the message, the model's score for it, which words matched (already the rule for cards).
- **In the browser, for the visit:** the ladder's state, cleared by closing the tab, Forget me, Emergency Exit.
- **People can:** read how each checker works and what it can do (a "How the checks work" page); see **which checker acted and why** in the reply notice and the signed transcript (rule name and checker version, not a score); say "this was a mistake" without consequence; share an example by choice; erase everything held on their device.
- **People cannot** turn the checks off. The text says why: they are the only thing between a person and abuse or a call to harm, they run only on the latest message, they keep nothing, they can be wrong, and a wrong flag changes only the tone of one reply (and, at most, offers a pause), never anything about the person.
- **Signed transcripts** record the checker version (matcher list version and model name and hash) so a disputed flag can be tied to what produced it.

## 6. Terms and Privacy wording this needs (when it ships)
Section 21 (the coach demo), the site-written-text list, and the Privacy lines: that a small AI model, run on our server and nowhere else, reads each message **in memory** to help decide how the coach replies, in addition to phrase matching; that it keeps nothing; that it can be wrong; that it never ends a conversation by itself; the name and licence of the model; and the aggregate counters. The wording goes in a draft first and ships only when the feature does (as with the learning cards).

## 7. Order of work
1. The evaluation runner and the ladder of benchmark sets, with the bars set first (shared with the matcher plan).
2. Bake-off of two or three small models (licence, size, speed, false alarms on HateCheck's non-hateful functionalities and the hand-written scenes). **No model is picked until a number picks it.**
3. The `screen` function and the shadow mode with bucketed counters, off in production, then on in shadow only.
4. The decision table with thresholds from the bake-off; cards and level 1 only.
5. The "mistake" button and the "How the checks work" page.
6. Terms and Privacy draft applied together with the switch.

## 8. Decisions for the owner
1. **Calibration only, or also light tuning on public and synthetic data** (never user data)?
2. **Shadow mode counters** as described (bucketed daily counts, no text): acceptable?
3. **Fail open** (if the model is slow or down, the matcher carries on) as the rule?
4. **Separate `screen` function** over bundling into the relay?
5. **The "this was a mistake" button** with the optional, consented example: yes?
6. **Who reviews synthetic scenes** (the counselor and the advocate), and when?

## 9. Not verified
Host function size, time and memory limits; each candidate model's licence, size and speed; ToxiGen's model card and data terms; whether the model's training data allows our use. All are checks in step 2 of the order of work.
