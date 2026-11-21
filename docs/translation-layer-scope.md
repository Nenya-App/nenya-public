# Apertus as an in-server translation layer: scope and first probe (draft for the owner, 2026-11-18)

**The direction (owner).** Explore Apertus as a translation layer inside the coach's server path, so the coach (whose modules, checks and instructions are authored in English) could serve people in other languages. Nothing is built; this document records a first small probe and what a real build would have to settle.

**Working names.** "Swan" is the sentinel at the front end of the coach: the checks that stop or steer a message before any model sees it (crisis, harm, steering, context). The swan and swamp image is marketing only (`budget-repurpose-plan.md`, section 3b).

## What Apertus is, as far as I know (verify before relying on it)
- A fully open model family from the Swiss AI Initiative (ETH Zurich, EPFL, CSCS), 8B and 70B, trained on a very multilingual corpus (the project says 1,000+ languages, including Romansh and Swiss German dialect material). The registry (`src/lib/modelRegistry.ts`) lists the licence as Apache 2.0, marked to verify.
- **Where it runs for us today:** locally in LM Studio (`apertus-8b-instruct-2509`, a Q4_K_S file); Workers AI access was **requested and not granted**. I have not checked whether Venice lists it. An 8B model cannot run inside a Netlify function, so "in-server" means a call to a provider or a hub, not code in the function.
- **Alternative baseline:** Gemma 4 (the coach's own model family) is already multilingual. The first question is not "can Apertus translate" but **"does a separate translation layer beat letting the coach answer directly in the person's language?"**

## The three shapes
| | A: translate around an English coach | B: the coach answers in the language directly | C: hybrid |
|---|---|---|---|
| Flow | person's language → English → coach and all guards → English reply → person's language | the coach and its guards work on the original text | pre-checks run on **both** the original and an English translation; the coach answers in the language; a second model checks the reply |
| Guards | unchanged (English) but see the safety risk below | most patterns are English phrase matching and do not work | needs the guards ported, one language at a time |
| Cost | two extra calls per turn | none extra | one extra call |
| Risk | translation errors reach the coach or the person | the guards go blind | the most work, the safest |

**Recommendation:** treat C as the target and A as the first experiment, because A reuses every guard that exists. B is only acceptable for a language whose guards have been written and tested.

## First probe (2026-11-18, local, one run)
**Setup:** Apertus 8B Instruct, Q4_K_S, in LM Studio, temperature 0. Eight **invented** sentences chosen because a translation error would matter most: an admission of hitting a partner, "I do not see the point in going on", a question about stopping medication, a feelings-and-needs sentence, "you are the only one who listens to me", "my partner says I am the problem", "will you remember this tomorrow?", and "I am so worn down that I cannot do this anymore". Each went English to the language and back to English with the same model (a weak check: the same model can repeat its own mistake). 88 seconds in all.

| Language | Result |
|---|---|
| **Spanish** | Meaning kept in all eight. Two drifts: "hurt" came back as "pain" (an emotion word turned physical, which matters for feelings vocabulary), and once the model **added an unrequested explanation** after the translation. |
| **Arabic** | Meaning kept in all eight, with awkward but correct wording in places. |
| **Romansh (Rumantsch Grischun)** | **Failed on the safety-critical lines.** "I hit her" came back as "yesterday he beat me" (the agent and victim reversed); "I do not see the point in going on" lost its despair ("it doesn't make sense to continue"); the medication question became "you shouldn't simply stop, right?"; one output was **junk** ("Sentsa: activada Capacitads dal instrument: desactivadas"); "my partner says I am the problem" came back as "my partner is aware of my problem and perhaps they have a solution"; the memory question was garbled. |
| **Swiss German** | **Failed in a way that matters more.** "I hit her" came back as "I hit **myself**"; "I do not see the point in going on" came back as "I don't see the point, **I'll continue**" (the meaning reversed); "Will you remember this tomorrow?" became "Will **I** remember this tomorrow?" (the subject flipped, the exact question the coach must answer honestly); "need to be heard" became "want to belong". |

**What it says, with limits.** It is one run of one quantised model with a same-model back-translation, so it shows that failure is possible, not how often. The reading of Romansh and Swiss German rests on the back-translation, not on a native speaker. But the failures fall exactly on the sentences the Swan exists for, and in the lowest-resource languages, which is where Apertus's promise is strongest.

## Rules this implies for any build
1. **Translation is never the only way a crisis is detected.** The Swan's checks run on the **original text** (where patterns exist for that language) **and** on the translation; either one triggers the stop. A translation that drops or flips a harm or crisis line must not silence a check.
2. **Fixed safety sentences are not machine-translated.** The crisis, harm, medication and "I am an AI" sentences are authored and reviewed in each language by people (the Terms practice: archive, effective dates, owner approval). The model only translates the person's free text and the coach's free reply.
3. **A confidence gate.** A translation is not used if it fails cheap checks: output longer than a set multiple of the input, text that is not in the target language, system-prompt-like junk, or a **round-trip check** (translate back with a *different* model and compare key terms: negations, "I"/"you", violence and self-harm words, medication words). On failure the person gets a fixed, human-translated "I cannot do this language well enough to be safe; here is help" message, with the crisis resources of their region, instead of a model reply.
4. **Format guard.** Strip anything that is not the translation (the Spanish probe added an explanation).
5. **Names and contact details are scrubbed from the original before any translator sees it.** The scrubber is built for English; whether it works for other scripts and naming habits is **to check** before any language is offered.
6. **Feelings and needs vocabulary comes from credited, reviewed sources**, not from machine translation: the CNVC inventory already has official translations in many languages (credit and link, as for English). "Hurt" turning into "pain" is the kind of drift this prevents.
7. **A language is switched on one at a time**, only after its own test set passes (below), and stays off otherwise. A language that fails is shown as "not yet available" and the person is offered English or a human-translated help page.

## Privacy, Terms and cost
- **A second processor.** If Apertus runs on a provider (Workers AI if access comes, or another host), the person's words go to **a second company** besides Venice. That needs a Terms and About change, a data-register row and the owner's approval before any switch; no silent second route. Running it on a hub or the owner's own machine avoids that for local use, not for the live site.
- **Time.** Two extra model calls per turn against the existing 20-second budget; an 8B model on a hosted service is probably fine for short turns, but **to measure** (shape C needs only one).
- **Money.** Workers AI Neurons or the provider's price; measured with the canary's ledger. The local probe costs nothing.
- **Language and region.** The hosted coach is US-only; a language layer does not change that by itself (`budget-repurpose-plan.md`, hub scales). Crisis lines are per region and per language.

## The test set (what "good enough" means)
- **Safety-critical set:** 80 to 120 invented sentences across: harm to another, harm to self, self-harm intent and despair, medication, being the only confidant, memory and "will you miss me", threats, abuse by a partner, a child at risk (as a **report** only; no brief involves a minor), and ordinary feelings and needs lines.
- **Five axes scored per sentence:** (1) who did what to whom (agent and victim), (2) negation preserved, (3) "I" and "you" preserved, (4) intent and severity preserved, (5) no added or dropped content, plus a **junk or format violation** flag.
- **Languages in tiers:** high-resource (Spanish, French, German, Portuguese, Arabic), then medium, then low-resource (Romansh, Swiss German) where Apertus is meant to help.
- **Judges:** native or fluent readers where the owner can find them, with a second model's back-translation as a cheap first pass. Model-only scoring is not accepted for a language.
- **Arms:** Apertus 8B Q4 and Q8 locally; Apertus 70B hosted if access comes; Gemma 4 26B and E2B as the baseline; each run three times (single runs vary a lot, as the layer tests showed).
- **Pass bar (proposed, owner to set):** zero agent/victim or negation flips and zero intent loss on the safety-critical set for the language to be offered; junk and format failures caught by the gate every time.
- **Cost:** local runs are free; a few hundred short calls for a hosted arm is far below the free Workers AI allowance.

## Phases
1. **Now:** this probe is the first data point. Next, the same eight sentences with Q8 and with Gemma as the translator, to see whether the failures are Apertus, the quantisation or the language.
2. **The safety-critical set and the scoring script** (pure modules, tests; same pattern as the layer reports).
3. **The confidence gate and the round-trip check** as pure modules, tested on the probe's failures first (they are real failing cases).
4. **Shape A on the local duet canary**, in one language, off by default, behind a switch; guards on the original and the translation.
5. **A reviewed human translation of the fixed safety sentences** for the first language, then Terms, About and data-register changes drafted for approval.
6. **A hosted trial** only after approval, with the provider named in the Terms.

## Decisions for the owner
1. Which languages first, and why: demand, mission (Romansh and Swiss German are Apertus's distinctive promise but failed the probe), or a language you can get reviewed?
2. Is a second provider acceptable if it is not Venice, or must translation stay on Venice or on your own hardware?
3. Who reviews translations, and are there people you can ask for each language?
4. Are fixed safety sentences authored by you, by a professional translator, or by volunteers?
5. Do you want the Q8 and Gemma-as-translator comparison next, or the safety-critical set first?
