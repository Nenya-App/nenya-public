# The Fractured Atlas About text, rewritten for today's scope (2026-11-16)

For the owner to edit, and for Fractured Atlas to review before anything changes on their page. **Not published anywhere.** The text below is 2021 characters including spaces (the earlier descriptor draft was held to 2,500; check their field's limit). It replaces the older About on the Fractured Atlas project page; the 2026-11-13 drafts in this folder (the descriptor and the Our Structure redraft) are earlier and still say Venice AI runs the coach, which is no longer true.

---

Nenya is a free, open-source work of contemplative technology: a quiet place to slow down, notice what you feel and what you need, and say it plainly. It is an art project and a practice at once, drawing on myth, systems thinking and Nonviolent Communication, and it aims to give attention back rather than capture it. The goal is restoration, not retention.

It begins with a breathing animation, paced by default at one breath every ten seconds (0.1 Hz), with other rhythms to choose, an optional counter and optional tones. From the start a person can stay with the breath, move into reflection, or try the coach. Reflection is six sensory gateways (sight, sound, touch, essence, movement and insight), with sixteen color palettes as gentle starting points, never a measurement. What you enter stays on your device and is gone when you close the tab; you may download a private summary, or save an encrypted draft on your own device for a day.

Nenya also offers an optional prototype of an AI reflective coach. It is brief (five exchanges), says plainly that it is an AI, is not therapy, and is not a substitute for people. Messages pass through our server, which removes names and contact details, to an open AI model run by Cloudflare. We do not keep conversations, and they are never used to train a model. A message that suggests a crisis is never sent to the AI: the page shows emergency resources instead. Pages for learning the practice sit alongside. A person may separately choose to share a report or a conversation with us, or to sign a public guestbook; each is explained first.

Nenya has no accounts, no advertising and no tracking, and it does not sell or share data. It is independent, accepts no equity investors, and gives no funder a say in its direction. Its code is public under the GNU Affero General Public License, so what the site says about itself can be checked. It is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

---

## What changed from the live About, and why

| The live About says | Today | Where it holds |
|---|---|---|
| "Calibrated to the human respiratory rhythm of 0.1 Hz" | 0.1 Hz (one breath in ten seconds) is the **default** pace; five other rhythms exist, with an optional counter and tones | `src/lib/breathingPresets.ts`; `src/styles/globals.css` |
| "Color-based perception gateways, each one of sixteen archetypal energies" | **Six sensory gateways** (sight, sound, touch, essence, movement, insight) and **sixteen palettes** as starting points; the two were run together | `PantheonOfNeeds.tsx`, the gateway pages |
| "Simple, local information processing (not data-mining AI)" | True of the reflection tools. **The coach is an AI language model** (Gemma 4 on Cloudflare Workers AI) reached through our server, optional, five exchanges | Terms Section 15 (November 16, 2026) |
| "Not a ... commercial AI product" | Still true of intent; but it now includes an AI feature, so the text says so plainly instead | Terms; data register |
| "Third outcome: a deeper conversational layer, where guided dialogue or AI-assisted reflection may help" | Built, optional, with crisis stops and limits | `netlify/functions/coach.mts` |
| Not mentioned | A start choice (breathe, reflect, coach), learning pages, saving an encrypted draft for 24 hours, sharing a report or a conversation (optional, owner-reviewed), a public guestbook, Emergency Exit on every page | the site; `docs/data-register.md` |
| "Without surveillance, judgment, or extraction" | Kept in substance as no accounts, advertising or tracking and no sale or sharing of data | Terms Sections 12 and 17 |

## Check before sending (Fractured Atlas will read this as a statement of fact)
1. **Their approval.** I do not know Fractured Atlas's requirements. The text describes what the project does and touches several things a sponsor often cares about: an AI feature, data the site keeps (shared reports, the guestbook), outside services (Cloudflare, Netlify; Venice only as an optional outside link), and a possible future paid tier. Ask their project manager whether a change to the public description, or to the features it describes, needs prior approval under the sponsorship agreement, and send this text for their review before it goes on their page.
2. **Donations and costs.** The text says donations are tax-deductible as the law allows and does not list uses. Add what donations pay for (hosting, AI processing, review and testing) only if you and they confirm it.
3. **"Does not sell or share data"** is the Terms' wording; the Venice referral credits (a $10 credit if a visitor signs up through Nenya's link, disclosed in the Terms) are not data. Mention them if Fractured Atlas wants earned income described.
4. **No professional has reviewed the coach's safety checks.** The text says nothing to imply otherwise; keep it that way.
5. **The coach's values rule and the screening model** are still staging-only or in test; the text does not mention them.
6. **"Open AI model run by Cloudflare"** matches the Terms of November 16, 2026. If the model or service changes, the Terms change first, then this.
7. **The sharing of a conversation or report** is optional and owner-reviewed before anything is public; confirm each is switched on in production the way the text implies.
