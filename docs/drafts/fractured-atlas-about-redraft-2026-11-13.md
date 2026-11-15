# Redraft: the Fractured Atlas "Our Structure" section, for Fractured Atlas to review

Written 2026-11-13 for the owner to edit, then to send to Fractured Atlas. **Nothing here is on the site.** The live text is `src/app/components/about/Structure.tsx` ("Our Structure": A Private Artistic Project, Fiscal Sponsorship: Fractured Atlas, Why This Approach, Core Commitments, Open Source), with shorter versions of the sponsorship paragraph in `SupportUs.tsx` and `SupportThisWork.tsx`. I read "our current model" as **how Nenya is organized and what it does now**, since the live text was written before the coach, the safety checks, the contributor invitation and the signed-transcript features existed. If you meant something else, say so.

**How to use this.** Part 1 is the proposed text. Part 2 shows what changed and where each new claim is true in the code or documents. Part 3 is what Fractured Atlas needs to confirm or approve (I do not know their requirements, so none of it is written as their position). Brackets like [confirm] mark anything I could not verify from the repository.

---

## Part 1. Proposed text

### An independent project, built in the open
Nenya is an independent artistic and technology project: free to use, with no accounts, no advertising and no tracking. It is built around a specific set of values: anti-extractive design, radical privacy, and the belief that your inner world belongs only to you.

Its direction is set by its creator. Nenya invites counselors, advocates, trainers, translators and testers to review and improve the work, under a written contributor agreement [confirm: the agreement is still a draft], working only from public material or invented examples, never from anyone's private conversations. Nenya accepts no equity investors, gives no funder a board seat or an approval right, and [confirm: does not accept federal government funding].

### Fiscal sponsorship: Fractured Atlas
Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit arts service organization. Fiscal sponsorship lets an independent creative project receive tax-deductible donations without forming its own nonprofit, a model long used in the arts to preserve creative autonomy while enabling public support.

In practice:
- Donations for Nenya are made through Fractured Atlas, not to Nenya directly, and are tax-deductible to the extent permitted by law.
- Fractured Atlas handles the financial administration of those donations. [Fractured Atlas to confirm how it describes its role, fees, and any restrictions on use.]
- Donations pay for what it costs to run Nenya: web hosting, the AI processing for the optional coach demo, and the work of reviewing and testing it. [confirm: the list of uses, and whether anyone is paid.]
- Nenya's software, its content and its safety decisions are Nenya's own. Fractured Atlas does not direct them. [Fractured Atlas to confirm this statement; remove it if it is not theirs to make.]
- No equity, board seat or approval right is conveyed to any donor or funder.

### What Nenya does today
Plainly, so that a visitor, a donor and the sponsor can all see the same thing:
- **The reflection tools** (colors, melody, textures, movement, body map, written reflection) run on your device. What you enter is not sent to us and is gone when you close the tab, unless you choose to save a setting on your device.
- **An optional coach demo** is an early prototype of an AI reflective coach. It is not therapy. Your message goes through our server, which removes names and contact details, then to a small AI model run by Venice AI in a mode Venice labels private; we encrypt it on our server before it leaves. We do not keep it. We keep only plain daily counts, with nothing that identifies a person.
- **Safety first.** A message that suggests a crisis is not sent to the AI; the page shows resources (in the US, call or text 988) and ends the conversation. Messages that call for harming a group of people, or that treat a whole group as less than human, are met by the coach saying plainly that it does not share that view. A second check, a small model that runs on our own server, can help decide the tone of a reply; it never ends a conversation by itself, never stores anything, and never sends a message to a third party. [confirm: wording of the last sentence once the screening model is switched on; today it is in a test mode that only counts.]
- **We say where the checks fall short.** They are simple, they can be wrong, and today they catch hateful messages about some groups much less often than about others. We publish how they work and measure them against public test sets, and we are working on closing the gaps.
- **No conversation is used to train a model**, and none is offered for training. Sending a conversation to us is a separate, optional step for adults (18 and over), with its own agreement and a receipt, and it can be taken back. [confirm: switched on only when released; it is off today.]
- **Your record of agreeing to the Terms** is a small signed note (the Terms' date, the time and the site version) that contains nothing about you and is not stored by us.
- **Crisis and exit.** An Emergency Exit button is on every page.

### Why this approach
Fiscal sponsorship is a well-established model for independent projects that want to accept charitable donations and keep financial accountability without the overhead of a separate nonprofit. For Nenya it is also a choice of values: a structure that matches the design, with no corporate shell, no investors and no stakeholders with a claim on where the project goes.

### Commitments
No data mining, no surveillance, no advertising. Using this tool generates nothing of commercial value for anyone.

### Open source
Nenya's code is public under the GNU Affero General Public License v3.0, and every claim the site makes about its own code, such as that nothing you enter is tracked, can be checked by reading it. The web host's connection logs and anonymous visit totals sit outside the code and are described in the Terms. The Nenya name and logo are reserved separately from the code license. Credits for every outside work we use, including the models, word lists and pictures, are in the repository's attributions file.

### Reaching us
info@nenya.biz. If something the coach said caused harm, tell us; we read what you send.

---

## Part 2. What changed, and where it is true

| New or changed claim | Where it holds |
|---|---|
| "Free, no accounts, no ads, no tracking" | `legalDocument.ts` (Short Version and "What the Site Does Not Do"); unchanged in substance |
| Contributors **invited** under an agreement, working only on public or invented material. **No professional has reviewed the work yet; the text only invites it, and must not imply otherwise** | `docs/drafts/contributor-agreement-draft.md`; `docs/coach-screening-flow-scope.md` section 8b (no user text for contributors). The agreement is a **draft, not yet in force** [confirm before saying it exists] |
| Donations through FA; what they fund | `SupportUs.tsx`, `Structure.tsx`; the list of uses is **new and unconfirmed** |
| Reflection tools on device, nothing sent | `legalDocument.ts` Section 4; code |
| Coach: Venice private model, server-side encryption, nothing kept, daily counts | Terms Section 21 and Part Two; `src/lib/veniceE2ee.ts`; `docs/branches-and-previews.md` |
| Crisis messages stop and show 988 | `src/lib/safetyFlags.ts` (stop tier), `coach.mts` |
| The coach states its position on contempt for a group or a call to harm one | `src/lib/valuesRule.ts`; behind `COACH_VALUES=on`, **tested on staging only; off on production** |
| A small model on our server, never ending a conversation alone, keeping nothing | `docs/coach-screening-flow-scope.md` sections 1 to 5, 14; **shadow mode only, off in production** |
| The checks are uneven across groups today | `docs/coach-screening-flow-scope.md` section 16 (measured: hate about trans and disabled people is caught about 15% of the time, against about 50% for Muslims) |
| Measured against public test sets | HateCheck, ETHOS; `docs/coach-detection-rescope-ethos.md` |
| No conversation used to train a model | owner's decision, `docs/drafts/terms-transcripts-draft.md`; the Terms must say it exactly |
| Sending a conversation: separate, 18+, receipt, revocable | `docs/drafts/terms-transcripts-draft.md`; **not built live; off** |
| Signed note of agreeing to the Terms | `docs/drafts/terms-and-privacy-1.2.0-draft.md` part A; built, on staging |
| Emergency Exit on every page | `EmergencyExit.tsx` |

**Features that are not live must not be described as live.** The coach is currently **off on production**, the screening model and the stance are test-only, and sending a conversation is not released. Before this text is published, each sentence about them should be checked against what is switched on that day; the brackets mark them.

## Part 3. For Fractured Atlas to confirm or approve
1. **Their role, fees and any restrictions on the use of donations.** The text states them only in general terms.
2. **Whether the sentence "Fractured Atlas does not direct Nenya's software, content or safety decisions" is theirs to make**, and whether they want it, or different wording.
3. **Use of their name, logo and the donation badge** (already on the page; confirm the current guidance).
4. **Their policy on projects that use AI**, on content moderation and on hate-speech handling, if any, and whether this text meets it.
5. **Their view of the safety and crisis wording**: that the coach is not therapy; that a crisis message ends the conversation and shows 988; any liability or insurance language they need.
6. **Volunteers and contributors**: whether reviewers and testers need anything from them, and whether the contributor agreement should be shared with them.
7. **Under-18 users**: the Terms recommend that anyone under 18 use Nenya with a trusted adult, and that only adults send a conversation to us. Do they need more?
8. **Donor privacy**: Fractured Atlas handles donor information; Nenya receives none. Confirm that is accurate and how they want it said.
9. **The "no federal funding" statement**: keep, change or remove.
10. **Where the text appears**: the "Our Structure" page, the Support pages, and the donation page's own description; whether they review each place.

## Part 4. Decisions for the owner before sending
- Keep Part 1's "What Nenya does today" section on the sponsorship page, or move it to a separate "How Nenya works" page and keep this page short? A sponsor will care most about Part 3; a visitor about "What Nenya does today".
- The admission that the checks are uneven across groups is honest and measured, and it is a public statement about a safety feature. Keep it (my recommendation, with the work to close it described) or hold it until the coverage work is further along?
- Which of the bracketed items are already true on the day you send it.
