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


---

# Three other voices (added 2026-11-16)
Same facts as the text above and the same table; each fits a 2,500-character field (counts below). Choose one, mix paragraphs, or ask for a change. None is published.

## Voice B: human-scale and public benefit (1905 characters)
Leads with what others can reuse and check: a small, honest tool; most of it uses no AI; the one AI part is chosen, limited and transparent; signed records anyone can verify; open documentation; stated limits; on-device processing as a goal, not a claim.

Nenya is a free, open-source example of human-scale AI: a small, honest tool for breathing, reflection and learning to say what you feel and need, built so a person can see what it does with their words and stay in charge of them.

Most of it uses no AI at all. A breathing animation sets the pace (by default one breath every ten seconds). Six sensory gateways (sight, sound, touch, essence, movement and insight) help someone notice and name an experience, and what is entered stays on the person's device and is gone when the tab closes. Learning pages on Nonviolent Communication sit alongside.

One part uses AI, by choice: a short coach (five exchanges) that says it is an AI, is not therapy, and turns people back toward the people in their lives. Names and contact details are removed on the page and again on the server before anything leaves; the words reach an open model (Gemma 4, run on Cloudflare), are not kept, and are never used to train a model. A message that suggests a crisis is stopped before the AI sees it, and the page shows emergency resources. A person can download a conversation as a signed record that anyone can check, on their own device, at nenya.biz/verify.

Nenya is for people who want a moment of regulation without an account or being tracked. It is designed toward WCAG 2.2 level AAA, with known gaps listed in its public documents, and it says what it cannot do: it has no validated clinical instruments and makes no claim of treatment. Moving more of the work onto a person's own device is a goal, not something built yet.

The code and documentation are public under the GNU AGPL, so others can reuse, fork and check them. There are no accounts, advertising or tracking, no data is sold or shared, and no funder directs the project. Nenya is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (B):** "an open model (Gemma 4, run on Cloudflare)" matches the Terms of November 16, 2026. "A signed record that anyone can check ... at nenya.biz/verify" is the verify page and signed transcripts. "Designed toward WCAG 2.2 level AAA, with known gaps listed" is a goal with audits in `docs/accessibility-*.md`; it does not claim conformance. "Names and contact details are removed on the page and again on the server" is phrase matching and not a guarantee (the Terms say so): do not strengthen it. "On a person's own device is a goal" is true: the on-device coach is not built.

## Voice C: plain and personal (1158 characters)
Short sentences, about a grade-six reading level, for a reader who has never heard of fiscal sponsorship or Nonviolent Communication.

Nenya is a quiet place to catch your breath. It is free. You do not need an account, and nobody tracks you.

First there is a slow breathing animation. Breathe along with it for a minute, or longer. If you feel steadier, you can simply leave. That is the best outcome.

If you want to think more, there are six ways to reflect: with color, sound, touch, movement, scent or your own words. What you choose stays on your device. When you close the page it is gone, unless you decide to download a summary or save a draft for one day.

If you want to talk it through, there is an optional AI coach. It is short: five turns. It tells you it is an AI. It is not therapy, and it will not replace a person. It does not keep your conversation, and your words are never used to train an AI. If what you write sounds like a crisis, the coach stops and the page shows you where to get help.

Nenya is an independent creative project. The code is public, so anyone can see how it works. It does not sell your data, show ads or take investors. It is fiscally sponsored by Fractured Atlas, and gifts are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (C):** "five turns" is five exchanges. "Save a draft for one day" is the 24-hour encrypted save. "Independent creative project" replaces any claim about who works on it.

## Voice D: care and kinship (1341 characters)
Frames the same choices (no accounts, no engagement loop, a short coach that points back to people) as care, not as missing features. It uses plain words and no named theory.

Nenya begins from a simple idea: people are tended by other people. It is a free tool that tries to send you back toward them. A slow breathing animation helps the body settle first. Six sensory ways to reflect (color, sound, touch, essence, movement and insight) help you notice what you feel and need, in your own time and on your own device. Learning pages built on Nonviolent Communication help you say it to someone you care about.

An optional AI coach (five exchanges) can reflect back what it hears. It says it is an AI, does not remember you, will not miss you, is not therapy, and does not replace a friend, a family member, a chosen family or a professional. When someone leans on it, it points back to the people in their life. If a message suggests danger, the AI never sees it; the page shows emergency resources.

Care shapes the limits as much as the features. There is no account, no advertising, no tracking and no sale of data, because a person's attention and inner life are not things to extract. Nothing is built to bring you back. The aim is to leave you steadier, and sooner back in your life.

Nenya is independent and open source (GNU AGPL), with no investors and no funder directing it. It is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (D):** "does not remember you, will not miss you" is the coach's pre-written answer and instructions (v2.1). "Nothing is built to bring you back" is true of the design (no accounts, streaks or notifications) and is a statement of intent, not a measured result; do not add a claim about outcomes.
