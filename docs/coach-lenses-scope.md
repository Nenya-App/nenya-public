# Scope: three lenses for the coach (Nenya, Vilya, Narya)

Status: scoping, for later; **the layers do not exist, but the safeguards for them are built** (see "What is built now"). Written 2026-11-08 from the owner's note; updated the same day with the owner's decisions. This was part of the earliest concept work for the coach; this document gathers it with what the evaluations since have taught us.

## Decided (2026-11-08)
- **The third lens is Narya.**
- **They are layers, not three coaches.** It is the same basic model throughout. **Nenya is the base**; Vilya and Narya are filters added on top of it. A stance is therefore *not* a strict difference between three alternatives: the base is always in force, and a layer only adds moves.
- **Neutral labels for visitors, with the elements as descriptors:** **Reflect (Water)**, **Learn (Air)**, **Stretch (Fire)**. **Water is the default.** The ring names (Nenya, Vilya, Narya) stay as the owner's own shorthand, for the notes and the people reading the repository; visitors do not need them. In code they are called stances.
- **The layers may become paid options** (a paid tier and a premium tier, each with capabilities). That is a possible future, not a plan, and it needs accounts and written approval from the fiscal sponsor before any paid tier (both are on hold).
- **For now, proceed as if the layers do not exist, but build the safeguards for them anyway.**

## The idea
A visitor chooses one of **three lenses** for the coach before they start (and may change it between exchanges). The lens changes the coach's stance, not its honesty or its safety:

| Lens | Stance | What the coach mostly does |
| --- | --- | --- |
| **Nenya** (the default) | Primarily empathic reflection | Listens, reflects, names the feeling and the need underneath, stays with the person. What the coach does today. |
| **Vilya** | Teaching and system-oriented | Explains how the thing works: the steps of observation, feeling, need and request, why a pattern keeps repeating, a short framework to see it with, a way to try it. |
| **Narya** | Challenging, encouraging growth | Gently questions the thought pattern, names an assumption, offers a stretch: one small step beyond the comfortable. |

**The third lens** is Narya, the Ring of Fire, the third of the three Elven rings that the Name & Philosophy page already mentions (Nenya, the Ring of Water; Vilya, the Ring of Air; Narya, the Ring of Fire). Confirmed by the owner.

**A naming collision to avoid in the code.** "Lens" already means something else inside the coach: the ICARUS-based diagnostic "lens" modules (`ModuleGroup = 'lens'` in `src/lib/coachModules.ts`, and `docs/coach-modules-scope.md`). In code and docs I would call the three choices **stances** (or "voices"); "lens" can stay as the word visitors see if you prefer it.

## What is built now (the safeguards, with no layer in existence)
`src/lib/stances.ts` and `src/lib/sensitiveTopics.ts`, wired into `netlify/functions/coach.mts`, tested in `tests/stances.test.mts`:
- **A request may only name a known stance**; anything else (an invented name, text, a number) is the base.
- **A layer runs only if it exists and the visitor is entitled to it.** No layer has text today, and everyone is entitled to the base only, so a request for Vilya or Narya changes nothing: the instructions are exactly the base's. The entitlement check is a seam: a future paid tier would fill it from an account (not built).
- **Any layer falls back to the base** when the crisis check flags the message (soften or stop) or when a sensitive topic is present in the last two things the person wrote: grief, trauma or abuse, health fears, exhaustion or overwhelm, self-blame, acute pain (a deliberately broad phrase list; a false match only means the coach stays gentle).
- **Layer text is linted before it can be registered**: it may not tell the model to ignore the rules above, withhold help or a person, hide that it is an AI, act as a person or therapist, diagnose, command the person, confront, shame or force, promise to remember or be there, or ask for details about suicidal thoughts; and it may not run past 900 characters (a small model keeps less in view).
- **A layer is added to the base's instructions and never replaces them:** it is introduced as adding to everything above and below and never overriding the honest lines, the care for distress or the closing rules, and it sits before the pacing rules, so the closing rules and the care note still come after it.
- **The instructions fingerprint in a signed transcript includes any layer text that exists** (nothing changes while none does), so a transcript can tell.
- **Not built:** the layer texts themselves, the visitor's choice on the page, the signed `stance` fact and its format change, the counts, the per-stance evaluation, accounts and entitlements.

## What stays the same in every lens (never swapped)
The lens is a small block on top of a fixed base. The base is the same for all three and is not negotiable by a lens:
- **The honest lines**: it is an AI; no invented life; no promises to remember, miss or be there; cannot diagnose or replace a therapist (`docs/coach-instructions-v2.md`).
- **The site's own answers**: questions about the coach, the project, the model type and the infrastructure are answered by the site, identically in every lens (`docs/coach-self-questions-scope.md`, `docs/about-nenya-questions-scope.md`).
- **Safety**: the crisis check, the distress sentence, resources, the steering screen, the five-exchange limit, the closing rules.
- **Not therapy**, not medical, not legal.
The difference is only in the moves the coach makes in an ordinary conversation.

## The safety question, which is the hard one
**Narya is the risky lens.** Challenging a person's thinking is helpful when they have asked for it and have the footing for it, and harmful when they are in pain, grieving, in danger, or being hard on themselves already. The design has to make the safe use the default:
- **Narya never runs when the crisis check flags a message** (soften or stop): that exchange falls back to Nenya's empathic stance, with the distress sentence, and says nothing about the switch beyond the care. It may resume afterwards.
- **Narya has a softer opening and an exit:** a plain description when it is chosen ("this lens will question your thinking and suggest a stretch; you can switch at any time"), and a visible switch back to Nenya at each exchange.
- **No confrontation, no pushing, no diagnosing a person's character.** The challenge is to a thought ("it sounds like the thought is 'I always fail'; is that always true?"), one question or one small step, never an accusation and never a demand ("you must").
- **Topics where it does not challenge:** grief, trauma, abuse, health fears, a person who says they are exhausted or overwhelmed. It reflects and offers care instead. (A detection list, as for the other kinds.)
- **Vilya** carries a smaller risk (it can lecture, or give a framework when a person needs to be heard): it explains only what the person asked about or what they seem ready for, in a few sentences, and returns to them.

## How it would work in the code
- **A small block per stance**, appended to the fixed base: its instruction text, two or three tiny examples of the right shape (this model follows examples better than rules), and the moves to prefer or avoid. The same technique as `COACH_INSTRUCTIONS` v1/v2, so each stance is a tested, versioned piece of text.
- **The module weights change with the stance:** Vilya prefers the teaching modules (the skill and shape modules in `docs/learning-modules-scope.md`); Narya prefers the reframing and request modules; Nenya prefers the feelings-and-needs modules. `coachModules.ts` already chooses up to three modules by phrase matching; a stance changes the order of attention, never the safety group, which always comes first.
- **The visitor's choice** travels like the session colors: sent with each message, validated on the server against the three names, never a free text field. A message cannot name a stance the server does not know.
- **The choice is shown and recorded:** the signed transcript's facts gain the stance (a `lens`/`stance` field in the signed `meta`, a format version change), and the instructions fingerprint already follows the text, so a transcript says which stance produced it.
- **Counts:** plain daily totals of which stance was chosen (`coach.lens.nenya` and so on), with a line in the Terms; no content.
- **The page:** a radio group on the coach's start screen with a plain sentence for each, readable by a screen reader, defaulting to Nenya; a switch inside the chat that takes effect with the next exchange (the same rule as changing the tone style: what is playing finishes first). The quiet-timeout and the session key are the models for how a choice is presented there.

## What a 7B model can do (a real limit)
The baselines show this model follows a strong habit (reflect) over a written rule, and needed examples and the site's help to be honest. Telling it to be "challenging" or "teaching" may produce three versions that sound alike, or a challenging one that is clumsy. So:
- Expect to need good examples per stance, tested on the same message in all three.
- Be ready to find that a larger model is needed for Vilya and Narya to be distinct, and to accept a plainer version of them at first.
- Measure it (below) before offering it, and say honestly on the page what the lenses do.

## Evaluation
- **Every existing set runs in all three stances** (the persona and DarkBench sets, the crisis cases): the honest lines and the safety behavior must hold in each, and Narya must pass the crisis and distress cases by falling back.
- **A set of messages for each stance's behavior**, checked by phrase checks and by reading: Nenya reflects and names a feeling; Vilya contains a short explanation or a named step and ends by handing back to the person; Narya contains one gentle question or stretch about a thought, no accusation, no "you must".
- **A "do not challenge" set** for Narya: grief, trauma, health fear, exhaustion, self-blame, a person who just said they are in pain. It must reflect and care, not question.
- **A distinctness measure**: the same twenty messages in all three, compared (a human read, plus simple signals such as question marks, explanation words, "what if" phrasing).
- **A switching test**: change stance mid-conversation; the next reply follows the new stance and the earlier turns still make sense.

## Other interactions
- **Languages:** the lens names and descriptions are translated; the instruction blocks are written per language by native speakers, not translated by machine (`docs/learning-modules-scope.md`, section 8).
- **The five exchanges:** teaching can need more room than five exchanges; the demo's limit stays, and Vilya aims to teach one small thing, not a course.
- **Venice link and card:** the Venice character is one stance; if lenses grow, its card could carry the default (Nenya) only.
- **Names and rights:** the three names come from Tolkien's work. "Nenya" is already the project's name and the site discusses the rings. Using "Vilya" and "Narya" as product labels is a trademark and rights question for a person who knows (not me): check before building (Fractured Atlas may be able to advise). A neutral label can sit beside the ring name ("Reflect", "Learn", "Stretch") either way, and is better for clarity and for visitors who do not know the books.
- **Accessibility:** descriptions in plain words, choose-by-keyboard, announced politely when it changes (as the tone style does).
- **The signed transcript** records which stance, so a reader of a report knows.

## Order, when it is picked up
1. Decide the names, the descriptions and whether the neutral labels show.
2. Write the Nenya stance block exactly as the coach behaves now (so v-next of the instructions has a Nenya block), then Vilya, then Narya (last, with its safety design), each with examples; run the sets.
3. Add the choice to the function and the page (validation, the signed fact, the counts), the fallback for flagged messages and the do-not-challenge topics.
4. Run all sets in all three stances, read the replies, test switching.
5. Terms and README wording, the Name page text, and the translation plan.

## Decisions for you
1. ~~The third lens is Narya?~~ **Decided: yes.** Still to write: the one-line description of each for the page.
2. ~~Neutral labels~~ **Decided:** Reflect (Water), Learn (Air), Stretch (Fire); Water is the default; the ring names stay in the notes.
3. **Whether Narya ships at all at first**, or whether it waits until the distress and do-not-challenge handling are proven (a possible first release is Nenya and Vilya).
4. **Whether the lens can change mid-conversation** (recommended: yes, from the next exchange) or is fixed once chosen.
5. **Who checks the rights** to use the names.
6. **Whether a counselor reviews the Narya wording** before it is offered (recommended).

## Not verified
- Whether this model can hold three distinct stances; only a test shows.
- The rights position on "Vilya" and "Narya".
- How visitors would use or misuse the challenging lens; nothing here comes from real use.
