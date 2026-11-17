# The Fractured Atlas About text, rewritten for today's scope (2026-11-16)

For the owner to edit, and for Fractured Atlas to review before anything changes on their page. **Not published anywhere.** The text below is 2210 characters including spaces (the earlier descriptor draft was held to 2,500; check their field's limit). It replaces the older About on the Fractured Atlas project page; the 2026-11-13 drafts in this folder (the descriptor and the Our Structure redraft) are earlier and still say Venice AI runs the coach, which is no longer true.


> **Update 2026-11-16 (evening): the coach is back on Venice AI.** Every voice below was written when Cloudflare ran the coach. Before using any of them, replace the sentence about the AI service with the matching one here, and check the rest:
> - "an open AI model run by Cloudflare" / "an open model (Gemma 4, run on Cloudflare)" / "runs on an open model (Gemma 4) that Cloudflare hosts" / "an open model hosted by Cloudflare" -> "a small AI model run by Venice AI, in a mode Venice labels private, which our server encrypts before it leaves".
> - Voice E ("Small") leans on Gemma 4 being an open, replaceable model; reword that paragraph around the short, capped coach and the plain-rule safety checks. Voice B's "open model" line and Voice I's "runs on an open model hosted by Cloudflare" need the same change.
> - Voice D and the main text need only the one sentence changed.
> - Keep "not encrypted from Cloudflare" out of everything: on Venice the message is encrypted on our server before it is sent, but not from our device to the model (the Terms say exactly this).
> Ask me to regenerate the voices for Venice when you have chosen one or two to keep.


---

Nenya is a free, open-source work of contemplative technology: a quiet place to slow down, notice what you feel and what you need, and say it plainly. It is an art project and a practice at once, drawing on myth, systems thinking and Nonviolent Communication, and it aims to give attention back rather than capture it. The goal is restoration, not retention.

It begins with a breathing animation, paced by default at one breath every ten seconds (0.1 Hz), with other rhythms to choose, an optional counter and optional tones. From the start a person can stay with the breath, move into reflection, or try the coach. Reflection is six sensory gateways (sight, sound, touch, essence, movement and insight), with sixteen color palettes as gentle starting points, never a measurement. What you enter stays on your device and is gone when you close the tab; you may download a private summary, or save an encrypted draft on your own device for a day.

Nenya also offers an optional prototype of an AI reflective coach. It is brief (five exchanges), says plainly that it is an AI, is not therapy, and is not a substitute for people. Messages pass through our server to an open AI model run by Cloudflare; common identifiers such as email addresses, phone numbers and street addresses, and some names, are replaced with placeholders first, on the page and again on our server (this catches many but not all, and names are often missed). We do not keep conversations, and they are never used to train a model. A message that suggests a crisis is never sent to the AI: the page shows emergency resources instead. Pages for learning the practice sit alongside. A person may separately choose to share a report or a conversation with us, or to sign a public guestbook; each is explained first.

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
0. **Identifiers.** The first draft of this page said the server "removes names and contact details". Corrected 2026-11-16 after checking the build: the page replaces common identifiers with placeholders on the device before sending (`src/coach/CoachDemo.tsx`), and the server does it again (`netlify/functions/coach.mts`). It catches emails, links, phone numbers, street addresses, ZIP codes, handles, card numbers and some names (after a phrase such as "my name is" or from a list of common names), and misses many names. "Replaced with placeholders", not "removed".
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

## Voice B: human-scale and public benefit (2014 characters)
Leads with what others can reuse and check: a small, honest tool; most of it uses no AI; the one AI part is chosen, limited and transparent; signed records anyone can verify; open documentation; stated limits; on-device processing as a goal, not a claim.

Nenya is a free, open-source example of human-scale AI: a small, honest tool for breathing, reflection and learning to say what you feel and need, built so a person can see what it does with their words and stay in charge of them.

Most of it uses no AI at all. A breathing animation sets the pace (by default one breath every ten seconds). Six sensory gateways (sight, sound, touch, essence, movement and insight) help someone notice and name an experience, and what is entered stays on the person's device and is gone when the tab closes. Learning pages on Nonviolent Communication sit alongside.

One part uses AI, by choice: a short coach (five exchanges) that says it is an AI, is not therapy, and turns people back toward the people in their lives. Common identifiers (email addresses, phone numbers, street addresses and some names) are replaced with placeholders on the page and again on the server before anything leaves, though names are often missed; the words reach an open model (Gemma 4, run on Cloudflare), are not kept, and are never used to train a model. A message that suggests a crisis is stopped before the AI sees it, and the page shows emergency resources. A person can download a conversation as a signed record that anyone can check, on their own device, at nenya.biz/verify.

Nenya is for people who want a moment of regulation without an account or being tracked. It is designed toward WCAG 2.2 level AAA, with known gaps listed in its public documents, and it says what it cannot do: it has no validated clinical instruments and makes no claim of treatment. Moving more of the work onto a person's own device is a goal, not something built yet.

The code and documentation are public under the GNU AGPL, so others can reuse, fork and check them. There are no accounts, advertising or tracking, no data is sold or shared, and no funder directs the project. Nenya is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (B):** "an open model (Gemma 4, run on Cloudflare)" matches the Terms of November 16, 2026. "A signed record that anyone can check ... at nenya.biz/verify" is the verify page and signed transcripts. "Designed toward WCAG 2.2 level AAA, with known gaps listed" is a goal with audits in `docs/accessibility-*.md`; it does not claim conformance. The sentence about identifiers says they are "replaced with placeholders ... on the page and again on the server", with names "often missed": that is what the code does (`CoachDemo.tsx` scrubs before sending; `coach.mts` scrubs again) and what the Terms say. Do not strengthen it to "removed" or "names are removed". "On a person's own device is a goal" is true: the on-device coach is not built.

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


---

# Five more voices, one for each element (added 2026-11-16)
Each leads with one element of what a funder or reviewer of a small, public-interest AI project looks for, without naming any application: **small, intentional, tailored, open, sustaining**. Same facts as above. Each fits 2,500 characters. None is published.

## Voice E: Small: little AI, little compute (1493 characters)
Leads with how small it is: most of it uses no AI, the AI part is short and capped, and running more of it on a person's own device is the stated direction.

Nenya is a small tool on purpose. Breathing, the six sensory ways to reflect (color, sound, touch, essence, movement and insight) and the learning pages run in the person's own browser and use no AI at all. What is entered stays on the device and is gone when the tab closes.

The one part that uses AI is an optional coach, kept small in every way we can. It is five exchanges, with messages of at most 500 characters and replies of a few sentences. It runs on an open model (Gemma 4) that Cloudflare hosts, chosen because a small open model can be checked, compared and replaced, and because a short, plain reply is what a person who is overwhelmed can use. Daily limits keep the total small, and a rest between conversations keeps it from becoming a habit. It is not therapy and it says so.

Smaller is also safer. The checks that matter most, such as stopping a message that suggests a crisis before any AI sees it, are plain rules that run on the page and on our server, not another model, and they are published and tested. Moving the coach itself onto a person's own device, so that nothing needs to leave it, is the direction, not something built yet; we say so.

Nenya has no accounts, advertising or tracking, and does not sell or share data. Its code is public under the GNU Affero General Public License. It is independent, accepts no equity investors, and is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (E):** "Messages of at most 500 characters, five exchanges" are the limits in the code. "A few sentences" is the instruction (usually under about 80 words on Workers AI). "A rest between conversations" is the 6-hour rest (device) and daily limits. "Plain rules, not another model" is true of the crisis stops; a small screening model exists in shadow mode only and decides nothing. "On-device is a direction, not built": keep it.

## Voice F: Intentional: you can see it, and you are in charge (1579 characters)
Leads with agency: a person can see what is sent and kept, can delete it, and can read, fork and check the code.

Nenya is built so a person can see what it does with their words, and stay in charge of them.

The reflection tools keep everything on the person's own device and nothing is sent. Before anything leaves, the page says exactly what will go, where, and for how long. The one AI feature, an optional coach, sends a message through our server to Cloudflare's Workers AI service only after the person has read a plain notice. Common identifiers (email addresses, phone numbers, street addresses and some names) are replaced with placeholders on the page and again on the server. It catches many but not all, and names are often missed; we say so. Nothing is kept, and the words are never used to train a model.

Anything a person chooses to share with us, a report, a conversation, a message, comes with a code that lets them delete it themselves, with no email and no account. A signed copy of a conversation can be checked by anyone on their own device. An Emergency Exit button on every page wipes what the device saved and leaves the site, and "Forget me" does the same on request.

Everything kept is listed, with why, for how long and who can read it, in a public data register. The code is open under the GNU Affero General Public License, so every claim the site makes about itself can be checked, copied or changed.

There are no accounts, advertising or tracking, and no data is sold or shared. Nenya is independent, accepts no equity investors, and is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (F):** "Before anything leaves, the page says what will go" is true of the coach notice and the share forms; confirm for each form you rely on. "A code to delete it themselves" is the reports and shared messages (kept 90 days); witnessed conversations are owner-reviewed and can be withdrawn with the signed file. "Public data register" is `docs/data-register.md` in the public repository. Guestbook points are kept forever and cannot be removed (stated before signing): do not claim that everything can be deleted.

## Voice G: Tailored: for people who need a calm moment (1545 characters)
Leads with who it is for and how it is made for them: people regulating before a crisis, and anyone for whom a busy screen is a barrier.

Nenya is for the moment before things get too big: the person who is wound up, overwhelmed or just worn out, and wants a few minutes to settle, notice what they feel and need, and say it plainly. It is not therapy and not a crisis service, and it says so where a person will see it.

It is designed to meet people where they are. It starts with a slow breathing animation, and a person can stop there. Every choice is optional, and each screen asks for as little as it can. Reflection uses color, sound, touch, movement and a person's own words, so no one has to find the right words first. The text is plain, written to be easy to read, and the site is designed toward the highest level of web accessibility (WCAG 2.2 level AAA), with its known gaps listed in public. It works with a keyboard and a screen reader, honors a device's request for less motion, has color-blind modes and three text sizes, and offers optional audio cues for breathing.

Nothing is timed or kept to bring a person back. An Emergency Exit button on every page leaves the site at once and clears what the device saved. If a message suggests danger, the optional AI coach never sees it: the page shows emergency numbers and support lines instead.

There are no accounts, advertising or tracking, and no data is sold or shared. The code is public under the GNU Affero General Public License. Nenya is independent, accepts no equity investors, and is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (G):** "Designed toward WCAG 2.2 AAA" is a goal with audits and tests; it is not a claim of conformance and the docs list gaps. "Screen reader" and "keyboard" rest on the accessibility tests and audit lists; say "designed to work with" if you want to be more careful. "Optional audio cues for breathing" are the breathing tones (off by default). "Nothing is timed": the breathing exercise and gateways have no timers; the coach has a 30-minute conversation ticket (not mentioned here).

## Voice H: Open: building blocks others can use (1391 characters)
Leads with what others can take and reuse: the code, the documents, the tests, the safety rules and the checkable records.

Nenya is a working example that others can take, check and build on. It is a free tool for breathing, reflection and learning to say what you feel and need, and everything behind it is public under the GNU Affero General Public License.

What is open is the whole site, and its working parts: the breathing and reflection tools; the way common identifiers are replaced with placeholders before a message leaves a person's device; the rules that stop a message suggesting a crisis before any AI sees it, with the checks that test them; the written instructions the optional coach follows and the invented test conversations used to check it; and signed records of conversations that anyone can verify on their own device. The documents explain the choices, what is kept and why, and where the checks fall short, so someone else can judge them, reuse them or do better.

The optional coach is a short AI conversation (five exchanges) that says it is an AI, is not therapy, and turns people back toward the people in their lives. It runs on an open model hosted by Cloudflare. Messages are not kept and are never used to train a model.

Nenya has no accounts, advertising or tracking, and does not sell or share data. It is independent, accepts no equity investors, and is fiscally sponsored by Fractured Atlas; donations are tax-deductible as the law allows.

Learn More: https://www.nenya.biz

**Check before sending (H):** "Invented test conversations" are `src/lib/personaEvalSet.ts` and the safety set, in the public repository. "Signed records ... verify on their own device" is the verify page. "The written instructions the optional coach follows": public in `docs/coach-instructions-v2.1.md` and `coach.mts`; the **private method notes and modules are not public** and this text does not say they are. Do not say everything is open.

## Voice I: Sustaining: how it keeps going (1350 characters)
Leads with how the project stays small, independent and free: no ads, no data income, no investors, low costs, donations through the sponsor.

Nenya is built to be sustained by care, not by capturing attention. It is a free tool for breathing, reflection and learning to say what you feel and need. It has no accounts, no advertising and no tracking, and it does not sell or share data, so nothing a person does there is worth anything to anyone else. There is no engagement loop to feed: the aim is that a person feels steadier and goes back to their life.

It is kept small so that it can last. Most of it runs in the person's own browser at no cost to anyone. The one part that uses AI, an optional short coach, is capped by conversation length and a daily limit, and runs on an open model hosted by Cloudflare, so what it costs stays modest and under control. The code is public under the GNU Affero General Public License, so the work does not depend on any one person or company.

Nenya is independent. It accepts no equity investors and gives no funder a say in its direction. It is fiscally sponsored by Fractured Atlas, a 501(c)(3), so gifts are tax-deductible as the law allows and the money is handled by an accountable organization. Gifts help pay for hosting, the AI processing for the coach, and the work of testing and review. The core breathing and reflection tools are meant to stay free; subscriptions for extra features are being explored.

Learn More: https://www.nenya.biz

**Check before sending (I):** **"Gifts help pay for hosting, the AI processing, and testing and review"** is the list of uses that was flagged as unconfirmed on 2026-11-13: confirm it with Fractured Atlas, and whether anyone is paid. **"Subscriptions for extra features are being explored"** is on the live site (the "is it free" answer); Fractured Atlas may have a view on earned income, so confirm they are comfortable with the sentence before sending. "Costs stay modest and under control" rests on the daily limits (80 turns a day on production, about 25 Neurons a turn): do not give a dollar figure without checking Cloudflare's current price.
