# The Fractured Atlas website descriptor (2,500 characters or fewer)

Drafted 2026-11-13 for the owner to edit and for Fractured Atlas to review. **Not published anywhere.** The text below is **2460 characters** including spaces (limit 2,500), counted by script. It replaces the older description of the project on the Fractured Atlas page and reflects how Nenya works now.

---

Nenya is a free, open-source tool for reflection: a quiet place to notice what you feel and what you need, using colors, sound, touch, movement and your own words. It has no accounts, no advertising and no tracking. What you enter in the reflection tools stays on your device and is gone when you close the tab, unless you choose to save a setting there. Nothing about your use of it has commercial value to anyone, by design.

Nenya is built on one belief: your inner world belongs only to you. It accepts no equity investors and gives no funder a say in its direction. Its code is public under the GNU Affero General Public License, so what the site says about itself can be checked by reading it.

Nenya also offers an optional prototype of an AI reflective coach, using Nonviolent Communication, the practice of naming feelings and needs. It is early, it is not therapy, and it is not a substitute for a person. Messages pass through our server, which removes names and contact details and encrypts them before they reach a small AI model run by Venice AI in a private mode. We do not keep conversations, we never use them to train a model, and we keep only plain daily counts with nothing that identifies anyone. A person can download a signed copy of their own conversation, and it is theirs to keep or share.

Safety is part of the design. A message that suggests a crisis is never sent to the AI: the page shows resources, including 988 in the US, and the conversation ends. When someone expresses contempt for a whole group of people or calls for harm, the coach says plainly that it does not share that view, and it does not simply mirror the feeling back. Simple checks help with this. They can be wrong, and we say so: we measure them against public test sets, publish where they fall short, and keep improving them with the help of counselors, advocates and other reviewers who work only from public or invented examples, never from anyone's private conversations.

Donations pay for the costs of running Nenya: hosting, the AI processing for the optional coach, and the review and testing that keep it safe. Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) nonprofit arts service organization. Contributions are tax-deductible to the extent permitted by law, and Fractured Atlas administers them. The software and its content remain Nenya's own.

Learn more, read the Terms and the code, or write to us at nenya.biz and info@nenya.biz.

---

## Check before sending (Fractured Atlas will read this as a statement of fact)
1. **"The coach says plainly that it does not share that view"**: built and tested on the staging site only, behind `COACH_VALUES=on`. If the coach is still off on the day this goes live, change "offers an optional prototype" to say it is **in testing**, or hold that sentence.
2. **"Simple checks help with this. They can be wrong"**: the small screening model is in a test mode that only counts; the simple phrase checks are real. The sentence is accurate as written, and does not say the model decides anything.
3. **"We never use conversations to train a model"** and **"we keep only plain daily counts"**: both true today (`legalDocument.ts`; `docs/coach-screening-flow-scope.md`); the Terms update (draft `terms-and-privacy-1.2.0-draft.md`) must keep saying so.
4. **"Counselors, advocates and other reviewers who work only from public or invented examples"**: true of the work done so far; the contributor agreement that formalizes it is still a draft (`docs/drafts/contributor-agreement-draft.md`).
5. **"Donations pay for hosting, the AI processing and the review and testing"**: the list of uses is new. Confirm it is right, and whether anyone is paid, before Fractured Atlas sees it.
6. **"Fractured Atlas administers them. The software and its content remain Nenya's own."**: Fractured Atlas should confirm both halves are how they describe it.
7. **"Accepts no equity investors and gives no funder a say"**: carried over from the live Our Structure page. The "no federal funding" line is left out; add it back if it is still true and wanted.
8. **"A small AI model run by Venice AI in a private mode"**: matches Terms Section 21 (model named there, currently Qwen 2.5 7B). If the model changes, the Terms change first.
9. **"Nothing about your use has commercial value to anyone"** is the existing commitment, kept in the first paragraph.

## Shorter version (about 500 characters), for any field with a smaller limit
Nenya is a free, open-source tool for reflection: colors, sound, touch, movement and your own words, with no accounts, advertising or tracking. What you enter stays on your device. An optional early prototype of an AI reflective coach is not therapy; it keeps no conversations and never trains on them. Nenya is independent, accepts no equity investors, and is fiscally sponsored by Fractured Atlas, a 501(c)(3). Donations, tax-deductible as the law allows, pay for hosting, AI processing and review.
