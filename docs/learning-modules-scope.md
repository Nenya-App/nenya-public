# Scope: learning modules visitors can read, which the coach can also use

Status: scoping only, nothing built. Written 2026-11-08. Related: `docs/coach-modules-scope.md` (the private modules the coach reasons with today), `docs/coach-self-questions-scope.md` (detection of what a message is about), `docs/coach-persona-scope.md`.

## The idea
Short, plain educational modules that **a visitor can read**, on the things the coach keeps meeting: naming feelings and needs, separating what happened from the story about it, making a request, receiving a no, calming the body when flooded, loneliness and reaching for people, and so on. The same module is also what the coach is given when the conversation touches the topic, so the site says one thing in two places: the visitor reads the full version; the coach gets a short version of the same text. Two kinds of source, and a third that is only a link: ours, openly licensed material from others, and pointers to resources we cannot or should not copy.

## What is already decided
- Modules are meant to be **public educational documents**, shown to users and also part of the basis for the coach's replies (your decision of 2026-11-05).
- The coach's private method notes stay private (Blobs). This scope is about the public side.
- Publication of anything derived from the private conversation data follows the earlier hold: modules are **authored from open and original material**, not from that data.

## 1. Where the content can come from
| Source | What it means | Notes |
| --- | --- | --- |
| **Written by us** (the default) | Plain markdown in the repository, reviewed, versioned, credited to the people who wrote and reviewed them. | Reading level high school. Decide a license for our own text (for example a Creative Commons license) so others may reuse it with credit. |
| **Openly licensed material from others** | Copied with credit under its license, like the DarkBench prompts (see `ATTRIBUTIONS.md`). | See "What I found" below. Nothing here is a free-for-all: each source needs its terms read and written down. |
| **Link-outs only** | A card with the title, the source, one line on why it helps, and a link. Nothing is fetched, copied or summarized from behind a paywall. | The honest place for paywalled courses. |

## 2. What I found (searched 2026-11-08; nothing here was verified beyond what the pages said)
- **NVC Academy** (the courses are paid). I found **no API and no partner-content or licensing program**. Its site says it works with NVC organizations around the world and links its own Online Services Terms and Conditions (nvctraining.com/nvcacademy/legal.html), which I could not read. So: there is nothing to "pull" from, and copying or scraping paywalled courses would be against the point of paywalls and almost certainly their terms. The way to find out is to **ask them**: whether they would allow a short credited excerpt, a link from the site, or something fuller. A written yes is the only basis for using their content.
- **CNVC's feelings and needs inventory** (the widely used list). CNVC's own store page offers the 4-page inventory as a free gift and asks that people share the link to the page. Copies of two versions say it may be copied and shared if CNVC is credited (the 2005 version and the 2023 version word it differently). I saw CNVC's page and reposts, not a formal license text. **Asking CNVC for written permission** (the address in the document's credit line) is the safe route before building the list into the site and giving it to a model, and it is a polite thing to do anyway.
- **Other open material.** I found a Quebec guide, "Emotional Literacy and Needs" (Fondation Jasmin Roy), whose license I could not see, and ELSA Support materials said to be under a Creative Commons license of an unknown variant. I found **no openly licensed NVC-style course** with listening practice. So the openly licensed shelf is thin, and most modules will have to be written by us.
- **Not found:** a ready-made, openly licensed, trauma-informed module set on this topic. That absence is part of why writing our own is worth doing.

## 3. "Fetched on demand, by an agent, with permission": my view
The idea has two kinds of permission in it, and they are different:
- **The visitor's permission** (do they want to leave the site, and have their address and topic seen by someone else?). Any outside request reveals the visitor's IP address and the topic to that site. If it goes through our server instead, our server makes the request and the visitor's address stays hidden, but then our server is reading and relaying a third party's text.
- **The publisher's permission** (may we use their content at all?). Many sites forbid automated access in their terms, and paywalled content is not ours to relay.

I would not build live fetching, for these reasons:
1. **Prompt injection.** Text fetched from outside and given to the model is text we did not write or review; it can tell the model what to do. The coach already treats the visitor's words as data for this reason; a fetched page is a bigger risk.
2. **We would be answering from text we never read.** The coach should speak from reviewed material.
3. **Terms and copyright** of the sites we would be reading, which we would be responsible for.
4. **Drift and failure.** A page changes or disappears and the coach changes with it.
5. **Privacy.** It undoes a simple promise: your messages do not go to anyone but us and the model service.

**The better version of the same idea: curate and cache.** A person (you) reviews a permissioned source, we keep a reviewed, dated, credited copy of the part we may keep, and the coach and the page use that copy. If a publisher offers an API (none found so far), it can be used to **refresh the reviewed copy** by hand on a schedule, never to serve live. Link-outs cover everything else, each one chosen and kept up to date by a person.

## 4. How a module looks
One file per module in the repository (for example `content/modules/feelings-and-needs.md`), with front matter and two bodies:
- **Front matter:** `id`, `title`, `topics` (what it is about), `triggers` (the phrases that bring it up: reuse `src/lib/coachModules.ts`), `readingLevel`, `sources` (each with its license and a link), `reviewedBy`, `lastReviewed`, `version`.
- **Full text (for visitors):** what it is, why it helps, how to try it (a few steps), a short worked example, when a person is the better help (with the crisis lines), and the credits. Plain language, headings, no jargon left unexplained.
- **Coach text (for the model):** a short version (a few sentences, roughly 600 characters) of the same teaching and how to bring it up gently, written by hand from the full text, not generated.
- A build step turns the files into the page content and the JSON the coach reads, so the text is written once.

## 5. How a visitor meets it
- **A "Learn" shelf**: a page and a short list under the coach, or after the conversation, **never an interruption**. The coach may say "there is a short guide on this" in a reply that touched the topic; the guide opens on its own page.
- **Plain pages**, readable with a screen reader and without scripts, no tracking. Downloading a PDF has the accessibility gap noted elsewhere.
- **Leaving the site** (for a link-out) is said plainly first, as the Venice panel does: you are leaving Nenya, their privacy policy applies.
- **Counts** (optional, plain daily totals, no content): `module.viewed.<id>`; needs a line in the Terms and the admin page.

## 6. Quality and safety
- **Review** by someone with relevant experience (a counselor, an NVC trainer or an educator you trust) before a module goes live, plus a plain-language and accessibility read.
- **Trauma-informed wording**: no commands, no "just relax", an easy way to stop and to find a person.
- **Not therapy, not crisis help**: every module says so; the crisis path is unchanged and comes first.
- **Honest about sources**: each module lists where its ideas come from and under what license, in the same way `ATTRIBUTIONS.md` does for DarkBench.
- **One caution about the model**: modules shape what a 7B model says; they change replies in ways we only see by reading and by running the evaluation, so each new module is followed by a run.
- **Transcripts**: the signed transcript's `instructions` fingerprint covers the instruction text, not modules loaded from the private store. Once modules are public and versioned, a `modules` version could be added to the signed facts (a format version change); decide when we get there.

## 7. A pilot
Five modules, written by us, in this order (the ones the coach already needs most): **feelings and needs words**, **what happened versus the story about it**, **making a request**, **calming the body when flooded** (links to the breathing tool), **loneliness and reaching for people** (the one that most helps with the "be my friend" questions). Ask CNVC about the inventory in parallel; ask NVC Academy whether a credited link or excerpt is possible; keep the rest ours.

## Decisions for you
1. **The shape:** authored by us with permissioned and openly licensed material added as it is cleared (recommended), or something fuller.
2. **A license for our own modules** (for example Creative Commons BY or BY-SA), and who is credited.
3. **Whether to write to CNVC and to NVC Academy**, and who sends it (I can draft the note; you send it).
4. **Where it appears:** a Learn page, a shelf under the coach, links inside replies, or all three.
5. **Reviewer:** who reads each module before it goes live.
6. **Counts:** whether to count module views.
7. **Fetching:** whether you are comfortable with curate-and-cache and link-outs instead of live fetching.

## Not verified
- NVC Academy's terms (not read), whether it has an API or partner program (none found, which is not proof), and whether it would agree to anything.
- CNVC's exact license wording for the 2023 inventory (I saw reposts and the store page, not a license text).
- The licenses of the Quebec guide and the ELSA materials.
- How the coach's replies change when given modules; the evaluation is how we find out.
