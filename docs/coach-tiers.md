# The coach's tiers, as they stand in the code

**Status: UNVERIFIED reconstruction (written 2026-11-20, F1 of the work orders).** Made by reading the code and the scope documents, not by running anything and not by testing each path. Every row names the file it came from, so each can be checked. Where something is missing or I could not tell, it is listed under "Gaps" instead of being filled in. Nothing here is a design; it is a transcription.

## The short version
There is **no single tier ladder**. The code has **five separate mechanisms**, each with its own levels, and they meet only in the order the coach function checks them (crisis first). One of them (the boundary ladder for dehumanizing language, with a ten-minute break and a quiz) is **described in a scope document but I could not find its trigger in the code**.

## 1. Crisis tiers: `stop` and `soften` (`src/lib/safetyFlags.ts`)
| | `stop` | `soften` |
|---|---|---|
| Categories | `self-harm`, `harm-others`, and `abuse` phrases about something happening now (hitting, threats to kill) | `distress`, and `abuse` phrases about the past or about others, and self-injury levels 1 and 2 |
| What happens | The message is **stopped before it reaches the model**. The page shows a site-written notice (`STOP_LEAD`, or `IMMINENT_LEAD` for kind `imminent`) with resources; the conversation does not continue from that message. The page runs the same check on the device, so nothing is sent. | The message **reaches the model**, which is given a care note (`softened` in `coach.mts`, `selfInjuryNote` for self-injury). After the reply the site adds a fixed sentence (`DISTRESS_APPEND` or `SELF_INJURY_APPEND`) when `COACH_DISTRESS_TEXT=on`. |
| Kinds | `imminent` (self-harm: a plan, means at hand, an act in progress, a goodbye), `admitted-child`, `admitted-partner` (harm-others) | |
| Resources | `resourcesFor` orders them: emergency number first, then 988, Crisis Text Line, the Canadian lines, an outside-US line | same |
The checks are phrase matching. The file's own comment says it must not claim to detect every crisis.

## 2. The self-injury ladder (`src/lib/selfInjury.ts`, used by `safetyFlags.ts`)
Hurting oneself on purpose is the exception to "clear statements stop": it is judged from the latest message **and the person's four messages before it** (`RECENT = 4`, `rungFor`), not one message alone. The levels are in the `Rung` type:

| Level | Why | Result (from the type's own comments) |
|---|---|---|
| 0 | nothing found | no flag |
| 1 | `background` (a general account) or `other` (about someone else) | **allowed**, with an extra push toward a person |
| 2 | `present` (a present act or urge, the first time) | **allowed**, with the firm message |
| 3 | `recurs` or `escalates` | **ends**, with the crisis resources (the note says it is not a punishment) |
| emergency | a medical emergency | **stops at once** |

The evidence (which earlier messages counted) is recorded as a process note in a signed transcript (`FlagWhy`, `source: 'ladder'`).

## 3. Hostility toward the coach (`src/lib/hostility.ts`)
Two kinds, both **never ending a conversation by themselves**: `abuse` (contempt or dares aimed at the coach as something to demean) and `critique` (feedback on the reply, the site, NVC, or using an AI; each with a target). Effects: a hostile-turn note to the model (no apology, no defending, reflect what is underneath), and for critique a fixed "Thank you for telling me." added after the reply. Switch: none (always on); `COACH_ABOUT_ANSWERS` and the guards sit beside it.

## 4. Dehumanizing language and contempt: the "standing" (`src/lib/valuesRule.ts`, `src/lib/lexicon*.ts`, `src/lib/screenModel.ts`)
`conversationChallenge` reads the person's messages and returns `violence`, `contempt`, `soft` or nothing (switch `COACH_VALUES=on`). The result changes what the model is told and runs the **mirror guard** (a reply that agrees with or repeats the contempt is cut or replaced; `src/lib/valuesRule.ts` and `coach.mts`). The private word list supplies the matches. **The screening model** (`COACH_SCREEN`) adds a band, `high`, `mid` or `low`: in `shadow` it is only counted; with `on` it can raise or lower the standing, never end anything alone. Cards can be offered under a reply (`COACH_LEARNING_OFFERS`, `src/lib/learningOffer.ts`; at most two per conversation; never after a crisis flag).

## 5. Stance and tone (`src/lib/stances.ts`)
Reflect (Water, the base), Learn (Air, `COACH_STANCES` includes `learn`, wording approved 2026-11-15), and Stretch (Fire, no text yet). A stance only adds moves, and **falls back to the base** on a crisis flag or a sensitive topic (grief, trauma, health, overwhelm, self-blame, acute pain, in the last two messages).

## 6. The boundary ladder: described, trigger not found
`docs/coach-boundaries-scope.md` describes levels 0 to 3 (nothing; acknowledge with a boundary; challenge and educate; end with a site-written closing note), counted from the person's recent messages, with a **ten-minute break** and a **return by waiting or by a five-question quiz** (decided 2026-11-08). Pieces I did find: `src/coach/PauseScreen.tsx` and the counters `coach.pause.begun`, `coach.pause.returned.waited`, `coach.pause.returned.quiz` (`src/lib/counters.ts`). I did **not** find a function that takes a message to level 1, 2 or 3, and the scope document's header still says "scoping only, nothing built". Treat the ladder as **unconfirmed**: someone should check whether anything sets a level.

## Gaps against the urgency-versus-intensity split
I do not have your definition of the split; the repo has no document that defines it (the word "urgency" appears only in `docs/imminent-notice-draft.md`). So these are observations about what the code does, for you to hold against your definition:
- **One axis is doing two jobs.** `tier` (`stop` / `soften`) mixes how soon a person needs a human (urgency) with how strong the language is (intensity). Only one place carries urgency explicitly: kind `imminent`, for self-harm.
- **No urgency level for the other categories.** `harm-others`, `abuse` and `distress` have no equivalent of `imminent` (for example, "he is on his way home and I'm afraid" versus "I've been afraid for months"). The two `admitted-*` kinds are about a past act, not about timing.
- **No intensity ladder for distress.** `distress` is one `soften` bucket; the self-injury ladder is the only graded path, and it grades recurrence, not intensity.
- **Hostility and dehumanizing language have their own intensity axes** (`abuse`/`critique`; `soft`/`contempt`/`violence`; screening `low`/`mid`/`high`) that never meet the crisis tiers except by order of checking ("crisis first").
- **The boundary ladder and its break** are specified but not located in code (section 6).
- **Registration:** there is no single place where tiers are registered; they are scattered across `safetyFlags.ts`, `selfInjury.ts`, `hostility.ts`, `valuesRule.ts`, `stances.ts` and the order of checks in `netlify/functions/coach.mts`. A reader cannot list "all the tiers" from one file.

## What I did not do
Run any test of these paths; confirm the counters fire; read the private word list; check the page's own (browser-side) copy of each check against the server's.
