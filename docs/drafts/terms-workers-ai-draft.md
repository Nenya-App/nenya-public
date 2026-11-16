# Terms revision for the coach on Cloudflare Workers AI (2026-11-15). APPLIED 2026-11-16: now in `src/lib/legalDocument.ts` (effective November 16, 2026); the outgoing text is archived. Kept as a record of the decisions.

**What this is.** The changes to the Terms of Use & Privacy Policy (`src/lib/legalDocument.ts`) for the day the coach moves from Venice AI to Gemma 4 on Cloudflare Workers AI (`COACH_PROVIDER=workers-ai`; docs/hosted-model-swap-scope.md).

**When it applies.** In the same change that switches production. The live Terms keep describing Venice until then, because Section 15 promises: "if we move to one without this protection, we will say so here first." Going live means:
- archive the outgoing text in `docs/legal/archive/`;
- set `LEGAL_EFFECTIVE_DATE` to that day;
- then set `COACH_PROVIDER=workers-ai` on production.

Staging can run the switch before then for the owner's trial.

**What the site's answers say.** The pre-written answers (`src/lib/aboutNenya.ts`) already follow the switch: under Workers AI they say what this draft says. Their fact checks point at this file until it is applied, then at the Terms.

**Sources for the Cloudflare facts** (read 2026-11-15): Cloudflare's Workers AI data usage page (developers.cloudflare.com/workers-ai/platform/data-usage/):
- "Cloudflare does not use Customer Content processed by Workers AI to train AI models."
- Inputs and outputs are not kept "after they are no longer needed to process the request".
- Operational metadata (model, time, token or Neuron counts, error codes) is kept, with no content.
- The page does not say where inference runs.

Re-read the page on the day this is applied.

---

## Section 3 (Using Nenya well), the coach paragraph
**Now:** "…or rely on it where a wrong reply could cause death, serious injury or significant harm. Venice AI, which runs the model behind the coach, asks the same of everyone who uses its service, through us or directly."

**New:** "…or rely on it where a wrong reply could cause death, serious injury or significant harm."

## Section 8 (No warranties), the coach’s replies
**Now:** "This includes the coach demo's replies, which are written by an AI model run by Venice AI, not by us. … We make no promise on Venice AI's behalf about its service."

**New:** "This includes the coach demo's replies, which are written by an AI model running on Cloudflare's Workers AI service, not by a person. They can be wrong, incomplete or offensive; they are not medical, legal, financial, tax or mental health advice; and you rely on them at your own risk. We make no promise on Cloudflare's behalf about its service."

## Section 9 (Limitation of liability), the Venice protection sentence
**Now:** "To the same extent, these disclaimers and limits also protect Venice AI, which provides the model behind the coach demo, for anything arising from your use of the demo."

**New:** removed. Venice's terms required it; Cloudflare's do not ask it of us.

## Section 15, where the coach is open
**Now:** "For now, it is open only to connections our host places in the United States or its territories, because Venice AI's terms say its service is intended for people located there. …"

**New:** "For now, it is open only to connections our host places in the United States or its territories, while we work out what offering it elsewhere would require. …" The rest of the paragraph is unchanged.

## Section 15, "Your messages go…" (the main paragraph)
**New, in full:**

"Your messages go through our server (hosted by Netlify) to Cloudflare's Workers AI service, which runs the model that writes the replies. A conversation has at most five exchanges, and a message at most 500 characters. We do not store your messages or the replies and do not write them to our logs; they live in your browser tab and are gone when you close it. Cloudflare handles what it receives under its own terms and privacy policy (https://www.cloudflare.com/privacypolicy/), which we do not control. Cloudflare says it does not use what Workers AI processes to train AI models, and does not keep a request's text or reply once the request is done; it keeps only records such as the time, the model and how much it used. The coach currently uses Gemma 4 (26B-A4B), an open model released by Google under the Apache 2.0 license, which runs on Cloudflare's own computers: Google does not receive your messages. Cloudflare reads your message in order to answer it; it is not encrypted from Cloudflare, and there is no "Private" mode as there was on Venice AI. Your message first reaches our server, which reads it in memory to remove identifiers, check for crisis and screen it, and does not store it. Along with your message, our server sends the coach's instructions and Nenya's own notes on its method, which contain nothing about you. We may change the model or the service; if we do, we will say so here first. Cloudflare and Netlify may process data outside your country."

## Section 15, safety checks
**Now:** "…After a stop, the page does not offer to continue on Venice AI for the rest of your visit."

**Unchanged** if the "Continuing on Venice" offer stays (decision A below). Removed if it goes.

## Section 15, limits
**Now:** "A message stopped by a limit reaches our server, is not passed to Venice AI, and is not kept."

**New:** "A message stopped by a limit reaches our server, is not passed on to the AI service, and is not kept."

## Section 15, "Continuing on Venice"; Section 18, links
- **If the offer stays (decision A):** both are unchanged except one sentence. "with the same character" becomes "with a character based on the coach's instructions", because on Venice it runs on a different model than the demo.
- **If the offer goes:** the "Continuing on Venice" subsection is removed. In Section 18, "The review page and the end of the coach demo link to Venice AI's site (not after a safety stop), with the referral code described in Section 15." is removed.

---

## Decisions (owner, 2026-11-15)
- **Nothing changes until the switch is flipped.** Everything Venice-related stays live. The owner is not yet sure about moving fully to Cloudflare: it has tradeoffs for the privacy story (no encrypted "Private" mode; Cloudflare reads the words).
- **A. The "continue on Venice" offer and its referral credits:** stay as they are.
- **B. US-only wording:** the current wording stays (the Venice reason). The "while we work out…" replacement above applies only if the switch is flipped.
- **C. The method-notes sentence:** kept in the draft.
- **D. Venice stays a toggleable option** (`COACH_PROVIDER=venice`, the default), not just a fallback for a quiet period. If the switch is flipped later, going back to Venice needs the Terms to name Venice again, so the two Terms texts (this draft and the archived live one) are both kept.
