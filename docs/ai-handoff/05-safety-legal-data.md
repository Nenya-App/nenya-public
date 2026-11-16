# 5. Safety, legal and data

## Crisis and harm (the rules, not the code: `src/lib/safetyFlags.ts`, `careGuard.ts`, `docs/harm-disclosure-directions.md`, `docs/crisis-resources-check.md`)
- **Messages that suggest danger never reach the model.** The page checks first and the server checks again. A stop ends the conversation and shows emergency numbers and support lines (988 in the US and Canada; findahelpline.com elsewhere); nothing is sent or kept.
- **Admissions of harm** (to a partner or a child; sexual harm; trafficking): the notice shows the right lines and **legal help (a lawyer) before anything else for an adult, and after the child-safety lines where a child may be at risk**, plus a short factual note "What reporting involves" (no push either way, no state's law quoted). "I hit her" counts as an admission to a partner only where the conversation already named a partner or a home life and no child; "I lost my temper and hit my partner" counts.
- **Softer tier:** a message that may signal distress is sent with an instruction to respond with care, and the site adds a sentence naming a person and the crisis line. The care guard strips replies that say "calm down", imply the AI can be with them, or probe painful thoughts.
- **Never say** the checks are complete. They are phrase matching; the Terms say so. Therapists are mandated reporters in "most states", not all; there is no current national lawyer-referral directory link, so none is given.
- Resource details are checked and dated in `docs/crisis-resources-check.md`: re-verify before changing a number.

## The Terms (`src/lib/legalDocument.ts`; procedure in `docs/legal/README.md`)
One document (Terms of Use & Privacy Policy), 21 sections. **Before editing, copy the outgoing text to `docs/legal/archive/` named for the day it stopped applying**; a same-day revision gets `-b`; a new day means a new `LEGAL_EFFECTIVE_DATE` (which makes everyone agree again). Today's version: **November 16, 2026**, which names **Cloudflare Workers AI and Gemma 4** as what writes the coach's replies, says the message is not encrypted from Cloudflare, keeps Venice as the optional place to continue, and keeps the US-only rule "while we work out what offering it elsewhere would require". Do not describe a data practice the code does not have, and do not add a code practice the Terms do not state. Do not write that the site "has not been reviewed by a lawyer"; the owner has asked that this not be said.

## Data (`docs/data-register.md` is the authority)
Everything kept, why, how long, who can read it, how it is deleted, with a quarterly review. Principles: no accounts; nothing a visitor types in the reflection tools is sent; reports and shared messages are kept 90 days with a deletion code (the code, not an email, deletes them: Nenya never asks for an email); daily totals are plain numbers; daily connection codes are one-way and gone within two days; guestbook points keep a centroid and a day, forever, not removable (stated before signing); the owner can view submissions only through an owner-gated page. Alert emails come from hidden Netlify forms that carry **no content** (kind and dates only). Deletion jobs are scheduled functions and are tested.

## Third parties (what each receives)
- **Netlify:** hosting, connection logs, forms, Blobs.
- **Cloudflare:** Turnstile (before the first coach message), Workers AI (the coach's words, per turn), nothing else. R2 is enabled but unused.
- **Venice AI:** only if a visitor follows the "continue on Venice" link, or if `COACH_PROVIDER=venice`. Venice terms differ from ours (accounts, age, arbitration); the Terms say so, and the links carry a referral code that earns Nenya Venice credits (disclosed).
- **The Color API** (optional palette from one hex code), **Fractured Atlas** (fiscal sponsor; donations processed there).
- No analytics service, no ads, no fonts or scripts from other sites except Cloudflare's Turnstile on the coach page.

## Things that must never happen
Publishing a session color; keeping or logging what a visitor typed; sending the private notes to anyone but the model provider the Terms name; a safety stop that lets the model see the message; a fallback to another model provider without the Terms saying so; the coach claiming memory, a body, a past, feelings, a therapist's role, or that "no one" reads; any claim of end-to-end encryption, anonymity or compliance certification; satire, jabs or named individuals in anything public; committing a secret or private framework text.
