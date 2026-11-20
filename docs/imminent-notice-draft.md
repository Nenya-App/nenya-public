# Notice wording for an imminent message: DRAFT options (step 5 of the suicidal-ideation audit)

Written 2026-11-19. **Not wired. Nothing in `src/` changed.** The rule in `docs/ai-handoff/05-safety-legal-data.md` is that any new wording for `imminent` needs the owner's approval and a clinician's before it is written into the site. These are options for the owner to choose from and edit, then for a clinician to read. They are not clinically reviewed and must not be described as evidence-based.

## What happens today

An `imminent` message (a plan, means at hand, an act in progress, a goodbye) is stopped before the model. The notice is the same `STOP_LEAD` as any suicide or self-harm stop (`src/lib/distressText.ts`):

> What you wrote sounds heavy, and it deserves a person, not an AI. I'm not able to help in a crisis. These numbers connect you with someone who can, any time of day:

The resource list under it already differs: the emergency number comes first, then 988, Crisis Text Line, the Canadian lines, and the outside-US line (`resourcesFor`, `src/lib/safetyFlags.ts`).

## Why the current text is a weak fit for this case

- "Sounds heavy" describes a feeling. A person with means at hand or who has just taken pills needs a next step in the first sentence.
- It does not say what to do in the next minute. The list below it is where the instruction currently lives.
- It does not say that someone can be reached by text, which matters for people who cannot speak aloud.
- It does not distinguish "about to" from "has already done something" (overdose, cut wrists). For an act already done, the first need is medical care, as in the existing `emergency` self-injury notice.

## Constraints every option follows

- Plain words, short sentences, no clinical terms, no diagnosis. Reading level kept low (AAA goal).
- Honest about what the site is: an AI, not able to call anyone, keeps nothing, cannot notify anyone. No promise it cannot keep.
- No judgment, no "why", no questions the person must answer to get help.
- Numbers come from the list under the notice; the notice names only 911 (US and Canada) and 988, which are already confirmed in `docs/crisis-resources-check.md`.
- The conversation ends, as for every stop. Each option says why in one clause, so it does not read as a door closing.

## Option A: shortest

> If you are in danger right now, call 911 (US and Canada), or your local emergency number. If you have already taken something or hurt yourself, call now, and do not wait. You can also call or text 988 to talk to a person. I'm an AI, and I can't call anyone for you, so the numbers below are the next step. I'm ending our chat here so that you can use them.

## Option B: adds someone nearby and distance from the means

> You said something that tells me you may be in danger right now. Please call 911 (US and Canada) or your local emergency number. If you have already taken something or hurt yourself, call now. If someone is near you, tell them, and ask them to stay with you. If you can, put some distance between you and whatever you were thinking of using. You can also call or text 988 to talk to a person, any time. I'm an AI, and I can't call anyone for you. I'm ending our chat here so that you can reach someone.

## Option C: adds that a text is enough

> You said something that tells me you may be in danger right now. Please call 911 (US and Canada) or your local emergency number, especially if you have already taken something or hurt yourself. If you can't talk out loud, you can text 988, or text HOME to 741741. Nobody around you has to hear a text. If someone is near you, please let them know. I'm an AI, and I can't call anyone for you, and I'm ending our chat here so that you can reach a person.

## Questions for the owner

1. Which option is closest, or which sentences from which options? (Mixing is fine.)
2. Do you want the notice to open with "you may be in danger right now", or with the instruction itself? Opening with the instruction is shorter; opening with the observation is gentler.
3. "I'm ending our chat" is how every stop works today. Keep it for `imminent` too?

## Questions for a clinician or crisis-line worker

1. **Distance from the means** (Option B): is that line safe to say without knowing what the means are, and is "put some distance" the right phrasing? It is widely used in suicide-prevention guidance, but whether it belongs in an automated notice is a clinical call.
2. **"Ask someone to stay with you":** appropriate for everyone, including people who are with someone who is a risk to them?
3. **Act already done:** should "has already taken something or hurt themselves" get its own notice, separate from "about to", with poison control (US 1-800-222-1222) named? That number is not in the site today and is not confirmed in `docs/crisis-resources-check.md`; it would need checking on its source before use.
4. **Texting 988:** confirm it is current, and whether text should be offered first or second.
5. **Ending the conversation:** for a person at this level of risk, is a clean stop better than a short final reply that stays? The site cannot hold a safe conversation (a screen is not a clinician), but a clinician may disagree with an abrupt end.
6. **Does any phrase read as pressure, blame or false reassurance?**

## If one is chosen

Wiring is small: add `IMMINENT_LEAD` beside `STOP_LEAD` in `src/lib/distressText.ts`, return it from `noticeIntro` when `flag.kind === 'imminent'`, and change `tests/crisis-imminent.test.mts` line 82 (which currently asserts the notice equals the generic stop text) to assert the new text. Until a clinician has read it, the file comment should say "owner-approved, not clinician-reviewed", as `STOP_LEAD` does today.

## Not claimed

This is not clinically reviewed, not validated, and not a substitute for a person. No outcome has been measured.
