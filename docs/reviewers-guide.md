# What a reviewer is asked to check

Status: current as of 2026-11-25. Plain words for people who are not developers. Checked against `main` on that date.

## First, the honest part

Nenya is an early prototype. No study has been done on it. No clinician has reviewed it. Review is welcome, and it is optional. Nobody has to approve something before it ships, and a review does not make a feature "clinically approved."

You do not need to read code. Everything below can be checked by reading words on a page.

## What you would be reading

Nenya has a breathing tool, a reflection tool, and an optional AI coach. The coach is built on the ideas of Nonviolent Communication (NVC). Reviewers look at six things.

### 1. The words the site says in a hard moment
When someone seems to be in distress, the site shows a short message and a list of support lines. A reviewer checks:
- Are the phone numbers and services real, current, and right for the country?
- Is the wording kind, short, and clear? Does it avoid pushing or scaring?
- Does it avoid sounding like advice from a doctor?

### 2. What happens when someone says they might hurt themselves or someone else
There is a plan for each case. A reviewer checks whether the plan is safe and whether anything is missing. The coach should stop and point to help. It should not try to handle a crisis itself.

### 3. How the coach notices trouble, and where it gets it wrong
The coach looks for signs of distress, abuse, and dehumanizing language. It will sometimes be wrong. A reviewer looks at the false alarms (calm words flagged) and the misses (hard words not flagged). The numbers are in the docs, and they are uneven across groups. We want help judging what is acceptable.

### 4. How the coach responds to contempt for a group
If someone speaks about a group of people as less than human, the coach says plainly that it does not share that view and will not build on it. It then usually asks what lies underneath. It may offer a short learning card. It never blocks a message, never ends the conversation, and reports no one. A reviewer asks: is this kind, firm, and fair? Would it hurt someone who was only venting, or quoting what was said to them?

### 5. The short learning cards
These are short reads about propaganda, dehumanizing language, and building connection. They are switched on for the live site. A reviewer checks:
- Is each claim true to its source?
- Does each source address work?
- Is the reading level plain?
- Could a card hurt someone who reads it at a bad moment?

### 6. The privacy claims
The site says what it keeps and what it does not. A reviewer compares those claims with [data-register.md](data-register.md) and [device-memory.md](device-memory.md). This one is for privacy-minded people, not only clinicians.

## What a reviewer is not asked to do
- Approve the whole project.
- Give legal advice.
- Test it on people. (We have not done any user testing.)
- Say it works. We make no claim that it helps.

## How to send what you find
Write to info@nenya.biz. Say which wording you mean and what you would change. Short notes are fine.

## Where the reading lists live
[README.md](README.md) has one list for people reviewing safety wording and one for people checking privacy claims. The wording itself lives in five files under `src/lib/`. If you would rather not open code, ask, and we will paste the exact wording into a document for you.

If you want to give more than notes, see [contributing-as-a-professional.md](contributing-as-a-professional.md).
