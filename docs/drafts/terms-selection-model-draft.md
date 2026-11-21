# DRAFT: wording for the selection model (not in the live Terms)

Status: a draft for the owner, 2026-11-20. **Nothing here is live** (`src/lib/legalDocument.ts`, the "How the checks work" page and the pre-written answers are unchanged). It is needed **before `COACH_SELECT=shadow` is turned on in production**, because the function reads each coach message even though it only counts. I am not a lawyer.

## What is true today (the facts the wording must match)
- A small language model (all-MiniLM-L6-v2, Apache-2.0) runs inside Nenya's own server function (`netlify/functions/select.mts`). The latest message is sent from one of our functions to another and **nowhere outside Nenya's infrastructure**.
- It turns the message into a list of numbers, compares them with the numbers for short public descriptions of the site's modules and cards, and answers with the names of up to three topics. It never returns or keeps the message or any score.
- In shadow mode (`COACH_SELECT=shadow`) the only result is a **daily count**: whether its choice agreed with the phrase matcher's, and, for a topic it found that the phrases did not, a count under that topic's fixed name. **It changes nothing**: not the reply, not which modules the coach uses, not whether a card is offered.
- It is skipped for a message the crisis check flags, fails open (a slow or failed call is counted and ignored), and is off unless the owner turns it on.
- A later stage, where it adds a choice beside the phrase matcher, needs its own wording and the owner's approval.

## Proposed addition to the Section 21 list of checks (the screening-model bullet's neighbor)
> A second small model, running on our own server, reads each message you send to the coach (except one the safety check has already stopped) to compare its meaning with short descriptions of the site's teaching topics. It does not decide anything about your message or the reply: for now it only adds one to a daily count of how often its guess agrees with the simple phrase matching, so we can judge whether it would help. It does not keep your message, and the only thing it produces is the name of a topic. Like the other checks it can be wrong, and it never ends or changes a conversation.

## Also to update when it is turned on
- The "How the checks work" page (`HowChecksWork.tsx`): one short paragraph in the same plain words, saying what it reads, what it keeps (nothing), and what it can do (nothing yet).
- The Privacy Promise line that lists what runs on the server, and the pre-written answers about privacy and the checks, which the tests keep consistent with the Terms.
- The archive copy of the outgoing Terms and the effective date, as for every Terms change.
