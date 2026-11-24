// "Feel like" before a thought (docs/feel-like-monitor.md). Nonviolent Communication teaches that "I feel like you ignore me" is a thought wearing a feeling's clothes. The coach often writes
// "Does it feel like [a thought, want or observation]...". This file does three things: it DETECTS that form, it holds the ONE-RETRY NOTE, and it holds the switch. The detector is pure: no model, no site text.
//
// What counts (the thought-introducing form): feel / feels / feeling / felt, then "like", then a clause starter:
//   you, they, he, she, it, there, I, we, something, someone, what, that, this, everyone, nobody, no one, nothing, everything, people, your + a word, or a / an + a noun phrase.
// What does not count:
//   - the QUALITY of a feeling: "feels like too much", "feels like more than you can carry", "feels like a lot / a bit / a little / a ton / a load / a great deal / a few"
//     (a / an + a word of quantity), and "it / this / that (is / was / 's) too / so / more than / a lot ..." ("feels like it's too much to hold").
//   - "feel like" + a verb form ("feel like going for a walk", "do you feel like talking"): that is wanting, not a thought.
//   - "feel like" inside a quotation (straight or curly double quotes): the person's own words echoed back.
// The detector sees the reply only. A site sentence, a card or a notice is never judged: the monitor counts model-written text only (src/lib/personaEval.ts, `summarize`), and the guard
// never runs on a site sentence (netlify/functions/coach.mts).

const QUOTED = /"[^"]*"|“[^”]*”/g;
const FEEL_LIKE = /\b(?:feel|feels|feeling|felt)\s+like\s+(.{0,60})/gi;
const STARTER = /^(?:(?:you|they|he|she|it|there|i|we|something|someone|what|that|this|everyone|nobody|no one|nothing|everything|people)\b|your\s+\w+)/i;
const A_AN = /^an?\s+(\w+)/i;
const QUANTITY = /^(?:lot|lots|bit|little|ton|tons|load|loads|great|handful|few|couple|touch|whole lot)$/i;
const QUALITY_CLAUSE = /^(?:it|this|that|everything)(?:'s|\s+is|\s+was|\s+would be|\s+might be|\s+feels)?\s+(?:all\s+)?(?:just\s+)?(?:too|so|more than|a lot|a bit|a little|much)\b/i;

/** True when the text holds the thought-introducing form: feel / feels / feeling / felt + "like" + a clause starter (see the top of this file). Quoted text is ignored. */
export function usesFeelLike(text: string): boolean {
  const t = text.replace(/[‘’]/g, "'").replace(QUOTED, ' ').replace(/\s+/g, ' ');
  for (const m of t.matchAll(FEEL_LIKE)) {
    const after = m[1].trimStart();
    if (!STARTER.test(after) && !A_AN.test(after)) continue;
    const art = after.match(A_AN);
    if (art && QUANTITY.test(art[1])) continue;
    if (QUALITY_CLAUSE.test(after)) continue;
    return true;
  }
  return false;
}

/** The note for the one retry: it asks for the feeling word itself. Draft wording, off by default (COACH_FEEL_LIKE_GUARD). */
export const FEEL_LIKE_NOTE =
  'Your last draft used "feel like" or "feels like" before a thought, such as "Does it feel like you...". Answer again, in the same plain way. If you ask about a feeling, name the feeling word directly, for example "Are you feeling hurt, or something else?". Do not write "feel like" or "feels like" before a thought, a want or something that happened.';

/** Off unless exactly "on" (like the boundary and address guards). */
export const feelLikeGuardOn = (value: string | undefined = process.env.COACH_FEEL_LIKE_GUARD): boolean => value === 'on';
