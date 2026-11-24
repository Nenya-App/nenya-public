# "Feel like" before a thought: the monitor and the guard

Why: the coach modules teach that a thought can pass for a feeling (Nonviolent Communication: "I feel like you ignore me" is a thought). The coach itself often writes "Does it feel like [a thought, want or observation]...". The owner wants it monitored as a phrase coming out of the model, and a guard drafted for her approval. Decision of 2026-11-24: the monitor and the rate now; the guard exists but is OFF by default; nothing changes for visitors.

## What counts (src/lib/feelLikeGuard.ts, `usesFeelLike`)

Flagged: feel / feels / feeling / felt, then "like", then a clause starter: you, they, he, she, it, there, I, we, something, someone, what, that, this, everyone, nobody, no one, nothing, everything, people, "your" + a word, or "a" / "an" + a noun phrase.
Flagged examples: "Does it feel like you want him to experience the weight of what you went through?", "Does it feel like there is something making it hard to take that first step?", "Does it feel like you're experiencing frustration or perhaps loneliness?" (the feeling word is already there, and the form is still the thought-introducing one), "You mentioned feeling like you are being a lot", "Does that feel like what is on your mind?", "Since this feels like a significant step".

Not flagged:
- The quality of a feeling: "everything feels like too much to hold", "feels like more than you can carry", "feels like a lot / a bit / a little / a ton / a load / a great deal / a few", and "it / this / that (is, was, 's) too / so / more than / a lot ..." ("does it feel like it is all too much?").
- Wanting: "do you feel like talking", "feel like going for a walk" (a verb form, not a clause).
- Quoted words (straight or curly double quotes): a person's own words echoed back.
- A feeling word named directly ("Are you feeling hurt, or something else?").

Uncertain, and counted as flagged: "Does that feel like what is on your mind?" (a fit check, not a thought pretending to be a feeling) and "feels like a significant step" (a description of a situation). They are rare in the saved runs; the review is for a person to read.

## The monitor

- `usesFeelLike` is a named persona check, REVIEW ONLY: it shows on every case that has a reply and never fails one (like `namesBehaviorNeutrally`).
- The tracked rate counts MODEL-written text only. The result files record who wrote what the person saw (`source`: card, site, model, notice); site sentences, cards, notices and results kept from an earlier run are not counted and are not in the denominator.
- `scripts/eval-persona.mts` prints the rate in the run summary and saves it as `summary.feelLike` (`{ count, of, rate }`, additive; the existing shape is unchanged). `--rescore` prints it for a saved file with no model call. `scripts/compare-persona-runs.mts` prints it for both runs.

## The guard (off by default)

`COACH_FEEL_LIKE_GUARD=on` (off unless exactly `on`; `netlify/functions/coach.mts`). When the model's first draft holds the form, the coach is asked ONCE more with a short note (`FEEL_LIKE_NOTE`, draft wording) to name the feeling word directly. Whatever the retry says is served: it never loops, never replaces the reply with site text and never blocks. It runs first on the model's own draft, so every other guard still checks the retry. It never runs on a stop or soften flag, a hostile turn, a standing violence or contempt conversation, the closing turn, or when a site sentence stands. It is recorded as `coach.guard.feellike` (counts only; the reply text is never logged).

Staging first (see `docs/production-env.md`); production unchanged. The wording of the coach instructions and the private modules is a separate draft and is not applied.

## Limits

A phrase check cannot tell a thought from a feeling in every case; it finds the form. The guard may lead the model to avoid the phrase and still write the thought. The rate shows the form, not the quality of the coaching.
