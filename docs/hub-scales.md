# Hubs from one table to a whole region: a ladder of scales (draft for the owner, 2026-11-18)

Companion to [hub-scope.md](hub-scope.md), which covers how a hub is built (option 1, option 4, the certificate and tunnel setup). This document asks a different question: **who is the hub for, and what changes as the group gets bigger.** It starts at the smallest case and climbs one step at a time. Nothing here is built. Hardware sizes are estimates (see `hub-scope.md`), and **how many people one machine can serve at once has not been measured**; every "users at once" figure below is a placeholder until it is.

**The rule that runs through every rung:** the guards (crisis and harm stops, persona, boundary, names, closing) must run on the hub's side of the line before a hub is offered to anyone but its owner. At the smallest rungs the owner is the only person at risk; from rung 2 on, someone else is.

## What rises with each rung (read this first)
| | What grows | Why it matters |
|---|---|---|
| People | How many, and how well you know them | Someone in crisis becomes likelier, and you can no longer know who it is |
| Operator | From "me" to "someone who did not choose to be a data controller" | The host reads the conversations in the clear |
| Setup | From plug-in to something that needs a certificate, a name, updates | The cost falls on non-technical people |
| Safety follow-up | From none to a real need for a person who can respond | A flag with nobody to receive it is a gap |
| Records and review | From nothing to logs, audits, a register | Trust at scale is checked, not assumed |

---

## Rung 0: one device, one person (no hub at all)
- **Example:** E2B in the person's own browser or a laptop app (the on-device track in `expanded-buildout-scope.md`).
- **Hardware:** a recent phone (8 GB), tablet or laptop.
- **Setup:** none beyond a one-time model download (from R2 later).
- **Who reads the words:** no one but the person.
- **What it needs:** the outer layers carry the most here, because the smallest model fails the most (measured 2026-11-18: E2B uncensored failed 3–5 of 25 first replies, Llama 1B 6–9).
- **Limit:** quality; no shared anything.
- This is the baseline every higher rung is compared against.

## Rung 1: a personal hub (one person, several of their own devices)
- **Example:** a person's mini PC or desktop at home, reached from their phone and laptop. Their kitchen-table laptop running the 26B for themselves.
- **Hardware:** 24–32 GB machine for the 26B; any recent laptop for E2B.
- **People at once:** one (maybe two).
- **Setup:** option 1 on `localhost` or the home network is enough; pairing is "same Wi-Fi". Certificate: the owner can accept a warning, or use the DNS-challenge name (`hub-scope.md`).
- **Who reads the words:** the owner, on their own machine.
- **Safety follow-up:** none beyond what the owner would do for themselves; the guards still run.
- **What it teaches us:** whether the hub image and updates are bearable for one non-expert. If setup is too hard here it is impossible further up.

## Rung 2: a micro-group (two to ten people who know each other)
Examples, smallest first:
1. **A household or couple** sharing one hub. Pair practice; each person's session is separate and stateless.
2. **A support or peer circle** that meets in a room, with one shared laptop or the hub on the room's Wi-Fi. A facilitator is the operator.
3. **A mutual-aid or neighbourhood group** whose organiser keeps the machine at home.
4. **A classroom** (an adult-education class, a workshop) using the hub for a communication exercise, with the teacher as operator. Under-18 use is a separate question (see decisions).
5. **A pop-up table at an event** (a market, a conference): a mini PC plus a small travel router that makes its **own** Wi-Fi network with no internet. This is a "hub in a box": it avoids the guest-Wi-Fi isolation problem completely and the certificate problem if the hub serves the page itself on its own name. It also shows the best privacy story (nothing leaves the table).
- **Hardware:** one 24–32 GB machine (26B) or a laptop (E2B); concurrency 2–5 is the first thing to measure.
- **Access:** the network is the boundary (own network or the room's), plus a per-device rate limit; a rotating link or QR token is optional.
- **Operator:** a known person, who can be asked to read a one-page operator document and agree to it.
- **Safety follow-up:** the operator knows the people. The consent screen tells each person that this is a reflection tool, not a clinician, and shows crisis help as it does on the site; the facilitator is asked to say aloud, at the start, what to do if someone is in distress. No clinical claims.
- **Terms and records:** the hub section of the Terms (host reads the conversation, no retention by default, who to tell if something goes wrong).
- **Best first pilot:** rung 2, items 2 or 5.

## Rung 3: a public venue (strangers share a room)
Examples: **a coffee shop** (the idea that started this), a **library table**, a **laundromat**, a **waiting room**.
- **Hardware:** a mini PC behind the counter or in a back office; E2B is the safer first choice if the venue's machine is small.
- **People at once:** a handful; the rate limit has to be tight (a per-device cap and a per-hub cap, so one person cannot use the machine all afternoon).
- **Access:** the venue's guest Wi-Fi, a QR code on the table. Many guest networks isolate clients from each other, which does not hurt option 1 (the hub serves the page) but kills peer-to-peer. People on mobile data cannot reach a LAN-only hub at all; say so on the card.
- **What changes from rung 2:**
  - **Screens are visible to the room.** Every screen needs a one-tap hide (the Emergency Exit exists; a "cover this screen" is new and is needed here more than anywhere).
  - **The host's machine reads the words.** The owner of the shop is the operator in practice. Logging is off and the hub says so on its first screen in plain words ("this café's computer reads this conversation; it keeps nothing; nobody at Nenya can see it").
  - **Strangers in distress.** The crisis and harm stops run before any model, but nobody on site is trained to receive a flag. The consent text says that, and the crisis text is shown more prominently (a public hub uses the stronger tier of the distress wording).
  - **Abuse.** Anyone on the network can send traffic: per-device and per-hub caps, and the existing steering/manipulation screen.
  - **Region and age.** The hosted coach is US-only; a hub has no region check unless one is added (a Terms-level statement by the operator, since a LAN hub cannot know geography). Terms assume adults.
  - **Responsibility.** The venue's owner takes on being an operator without having chosen to be a data controller. A one-page operator document, and the sponsor's view (Fractured Atlas) before a pilot.
- **Not before:** the guards run end to end on the hub, and one rung-2 pilot has run.

## Rung 4: an organisation (a clinic, a school, a nonprofit, a workplace)
- **Hardware:** one 32 GB+ machine, or two (one standby) if downtime matters; a small GPU box if the concurrency measurements demand it.
- **People at once:** dozens over a day, fewer than ten at the same moment (measure).
- **Access:** the organisation's own network and an IT contact; a managed certificate (the organisation's own domain, or a locally trusted CA on its devices); pairing by network plus, optionally, a sign-in by the organisation (outside Nenya).
- **Operator:** an IT person or a designated lead, with an agreement (not a click-through).
- **What changes:**
  - **A real follow-up path for flags.** Either the organisation names who receives a flag (the hub can show "tell your counsellor" text the organisation writes, within limits we review), or the hub shows only generic crisis help. Nenya does not offer a safety service; it tells the person where to go.
  - **Audit.** The operator can see counts (conversations per day, guard fires by type, no text) without seeing words. This is the first rung where aggregate numbers are worth building.
  - **Updates and a version policy.** The organisation needs a stable release channel and a note when guards change.
  - **Data protection duties.** The organisation may be bound by rules Nenya is not (schools, health). A hub there is a deployment decision for their counsel; Nenya's documents say what it does and does not do and do not claim compliance.
  - **Under-18 and clinical settings** are their own scopes and are **not** assumed to be allowed.
- **Terms and records:** operator agreement; data-register row (no Nenya processing); a review entry per release if reviewers exist.

## Rung 5: a locality (a library system, a city programme, a regional nonprofit network)
- **Shape:** many hubs of rung 3 or 4, run by one body, with a shared configuration. A **hub directory** (a page listing approved hubs by place) replaces a QR code per table.
- **Hardware:** a standard image on many small machines; central tooling to ship updates and checksums.
- **What changes:**
  - **A common baseline for every hub:** the same guards, the same consent text, the same retention (off), verified by a conformance check the hub runs on itself (the same tests as the repo: the persona set, harm set, boundary tests).
  - **Attestation of the image.** A hub proves it is running the published image (hash-pinned weights and build). Venice's sealed path does this for its models today; a hub would need its own, simpler form (a signed release the hub reports).
  - **Operator training** and a named person at the body who answers for the whole set.
  - **Incident handling:** a way for a person who had a bad experience to report it, and a way to pause one hub or all.
  - **Funding and cost:** electricity and machines are the operator's, and there is no per-turn bill, which is the attraction against the hosted route.
- **Not before:** two rung-4 deployments have run for a season and the review register exists.

## Rung 6: a federation (many bodies, many regions)
- **Shape:** independent operators run hubs under a common name, charter and test suite; Nenya publishes the image, the checks, the consent text and the directory; it does not run the hubs.
- **What changes:**
  - **Governance:** a charter hubs agree to, a process to remove a hub that breaks it, and a trademark policy (the code is open; the name is the lever).
  - **Jurisdiction.** A hub in another country meets that country's law, language and crisis lines. The crisis resources and the wording are localised and reviewed per region (the languages scope in `expanded-buildout-scope.md`), and the US-only rule is a decision per region, not a default.
  - **Models.** Hubs may want a model that suits their language. Each model needs its measured layers result (`outer-layers-scope.md`), published, before a hub may use it.
  - **Evidence.** Aggregate, privacy-safe numbers across hubs (guard fires, reports of problems) to see whether the whole behaves, with the limits stated.
  - **Succession.** One maintainer is not enough to be a federation's centre; named stewardship is a precondition.
- **This is far off.** It is written down so the early rungs do not close the door on it (for example: no hub design that cannot be pinned to a published image, no consent text that cannot be localised).

---

## Summary ladder
| Rung | Who | People at once (to measure) | Operator | Network | Main new risk |
|---|---|---|---|---|---|
| 0 | One person, own device | 1 | Themselves | None | Quality of the smallest model |
| 1 | One person, own hub | 1–2 | Themselves | Home | Setup is too hard |
| 2 | Micro-group (known people) | 2–5 | A known facilitator | Own or room Wi-Fi | Operator reads words |
| 3 | Public venue (strangers) | handful | An unprepared host | Guest Wi-Fi | Strangers in distress, room-visible screens |
| 4 | Organisation | up to dozens a day | IT lead under agreement | Their network | Duties Nenya does not hold |
| 5 | Locality (many hubs, one body) | many hubs | A body with a named lead | Their networks | Keeping every hub honest |
| 6 | Federation | independent | Independent bodies | Anywhere | Governance, law, language |

## What to build first, and what each step unlocks
1. **Measure concurrency and guard coverage on one machine** (rung 1). Unlocks every number above.
2. **The hub wrapper that runs the server-side guards** (the gate in `hub-scope.md`). Unlocks rung 2.
3. **One rung-2 pilot** (a facilitated circle, or the pop-up table in a hub-in-a-box). Teaches setup, pairing and the consent text with a person who can be asked questions.
4. **The consent screen, the quick-hide and the stricter caps.** Unlocks rung 3.
5. **The operator document, the counts-only audit view and a release channel.** Unlocks rung 4.
6. **The conformance check and signed image.** Unlocks rung 5.
7. **Charter, localisation and governance.** Rung 6.

## Decisions for the owner
**Answered 2026-11-18 (owner):** no first pilot is decided. At the micro level the only user is the owner (rungs 0 and 1). Beyond that, the owner hands out cards and has a negligible Facebook presence; the site is not widely publicised and the live site is the part changing quickly. So nothing above rung 1 is planned, and a hub copy of the site (option 1) would go stale quickly: if a hub is ever shared, route 2 (the live page calls the hub) fits better than a pinned copy.

1. ~~First pilot~~ (answered above).
2. Is a public venue (rung 3) acceptable at all before an organisation (rung 4) has run one?
3. Under-18 users: out of scope for every hub until separately decided?
4. Does any hub give the operator a way to add their own "tell your counsellor" text (rung 4)? If yes, who reviews it?
5. Is a federation (rung 6) a goal, or a boundary we should state we will not cross (Nenya publishes, others run)?
6. Who answers a hub operator who has a problem, and how quickly? (Support obligations, no promise of a service level.)

## Things this document does not claim
- No figure here is measured: users at once, setup time, and power use are all placeholders.
- No clinical, legal or compliance claim: a deployment in a clinic or school is its owner's decision with their own advisers.
- No claim that a hub is safer than the hosted route; it is *more local*, which is a different thing, and only as safe as its guards.
