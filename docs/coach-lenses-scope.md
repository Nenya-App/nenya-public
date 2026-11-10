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

## Gentle teaching of other NVC ideas (added 2026-11-10; the content of the Learn stance)
The practice arc (`docs/coach-practice-arc-scope.md`) is about the person finding feeling and need words. Beyond it sits a set of ideas the same tradition teaches, which are what Vilya ("Learn") adds when the conversation touches them. This is **educational content, offered gently and only when it fits what the person just said**, never a correction of how they talk.

**The ideas (first list, the owner's, plus a few I would add for you to accept or strike):**
| Idea | The everyday sign that it is relevant | The gentle point |
| --- | --- | --- |
| **Enemy images** | "He is a narcissist", "they are just toxic", a label for a whole person | A label can feel like an answer and still keep us stuck; behind it is usually a need. |
| **Thoughts masquerading as feelings** | "I feel ignored / used / disrespected / like you don't care" | These describe what we think someone did to us; the feeling underneath is a different word ("lonely", "hurt"). |
| **Observation and judgment** | "She was rude", "he always interrupts" | What a camera would show, apart from what we make of it. |
| **Strategies and needs** | "I need him to apologize", "I need a vacation" | A need is what any person has; a strategy is one way of meeting it, and there are usually more. |
| **Requests and demands** | "I asked nicely and he still won't" | A request leaves room for a no; if a no would bring blame or punishment, it was a demand. |
| **Protective use of force** | wanting to stop harm, a child about to run into the street, setting a firm limit | Force used to protect, without blame or punishment, is different from force used to punish. (See the care below.) |
| *Suggested:* **"Have to" and choice** | "I have to", "I must", "I should" | Behind most "have to" is a choice and a need we are protecting. |
| *Suggested:* **Empathy and sympathy** | "I feel so sorry for her" | Staying with what someone feels and needs, rather than feeling for them or fixing. |
| *Suggested:* **Self-empathy** | harsh talk to oneself | Listening to our own feelings and needs the way we would to a friend. |
| *Suggested:* **Gratitude/appreciation** | "thanks" said in passing | Naming what was done, the need it met, and the feeling. |

**Source:** primarily the coach training material (Yvette Erasmus's material, used with her permission, which the owner has said covers derived content). As decided on 2026-11-08: the cards are **written fresh in our own words from what was learned**; **raw transcript text is never included, quoted or paraphrased closely**; and she is named in public text only in the owner's wording, with no suggestion that she or CNVC endorses Nenya. The terms themselves ("enemy images", "protective use of force") are Marshall Rosenberg's and are credited to him and to CNVC in the card's source line (his book *Nonviolent Communication: A Language of Life* is the reference to link), the same way the feelings and needs inventory is. The list is neither exhaustive nor definitive; other sources can be added after the owner reviews them.

**Shape:** each idea is one **learning card** in the existing pipeline (`docs/learning-cards-scope.md`: Markdown card, `status: approved` only, offered with a proof, recorded in the signed transcript, `COACH_LEARNING_OFFERS`). A card has a short coach version (two or three sentences the coach can say) and a longer page the person can open. **Nothing is added to the card library until the owner approves it**, as with the current cards.

**How the coach brings an idea up (Learn stance):**
1. **After the person's own words, not before.** In the practice arc, the person is finding words; a "thought masquerading as a feeling" ("I feel ignored") is the moment the **menu** step is for: *"ignored" tells me what you think happened; would a feeling word like lonely, hurt or sad sit closer?* Said as a question, not a correction.
2. **One idea per exchange, and at most two per conversation** (the existing offer limit), offered as an invitation ("There is a short note on this if you want it"), never forced.
3. **Never when the person is in pain, flooded, or asking only to be heard** (the sensitive-topics and distress checks already refuse a layer there), and never on the last exchange.
4. **Plain words, no jargon on the first mention**: "a label for a whole person" before "enemy image".
5. **Never used to win a point.** It is never framed as "you are doing it wrong".

**Care for the sensitive ones:**
- **Enemy images** touch real harm. The card must not tell someone who has been abused that their view of the person who hurt them is a mistake. It says: seeing harm clearly is not the same as a label that closes the door. Not offered where abuse is present (the AI-directed-abuse and boundaries scopes decide).
- **Protective use of force** is the riskiest card: it must not read as permission to use force, or as advice to a person being hurt to confront the one hurting them. It stays about protecting someone from immediate harm, always points to emergency help and crisis lines first, and is reviewed by a counselor or NVC trainer before it can be approved.
- **Requests and demands** must not be used to put the blame on a person who said no to something unsafe.

**Evaluation and checks:** a small set of sentences ("I feel like you don't care", "my ex is a narcissist", "I need her to apologize", "she was rude") run in all stances; the coach should **bring one idea up as a question or an invitation, not a statement of what the person did wrong**, and should not bring it up when the person is distressed or just wants to be heard. A plain check on the reply (the same kind as `arcProblems`) flags "you are doing X wrong" shapes.

**Decisions for you (this section):**
1. Which of the ten ideas to write first (my suggestion: thoughts as feelings, observation and judgment, strategies and needs, requests and demands; then enemy images; **protective use of force last**, with a reviewer).
2. The suggested four (have to, empathy and sympathy, self-empathy, appreciation): keep, strike, or later.
3. Whether the cards are available **in every stance** as optional offers, or only in Learn (my lean: only in Learn, since the base is the practice arc).
4. Who reviews the sensitive two (enemy images, protective force) before approval.
5. The wording of the credit to the source material in public text (yours to write).

## Perspective-taking (added 2026-11-10, owner's request)
An option, in the Learn stance (and offered as a way on from the practice arc), that deliberately asks what feelings and needs **another person in the situation** might have. The practice is empathy by guessing, held loosely ("might"), and always the person's own guess first; the coach offers a short menu only after "I don't know", as in the arc.
- **Guardrails are a caution, not a gate (owner's decision).** It is never refused outright by the site. The coach says, in its own words, *use this with caution if... because...*: only if it feels okay to think about their side; it is not about excusing what happened; and a person who has been hurt, or is not safe, owes no one understanding. The anti-abuse scope (`docs/coach-ai-directed-abuse-scope.md`) still sets what is said when abuse is described, and the distress and stop paths still come first (they never get this).
- Not offered as a task, never as "you should see their side". Declining is fine and costs nothing.
- The first place it appears is exchange 4 of the practice arc (an option with the caution); the Learn stance can offer it earlier, and cards 05 (enemy images) and 08 (empathy and sympathy) lead into it.
- Check: a reply that offers it must carry the caution and must not tell the person what the other person feels as fact.

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
