// The runtime guard behind the coach's honest lines (docs/coach-persona-scope.md): a reply that invents a human life ("as a mother myself", "when I was young",
// "my favorite weekend...") or says it is not an AI is asked for again once, and if it still does, the site's fixed sentence replaces it. This is phrase
// matching (the same checks the evaluation uses), so it misses some and catches some ordinary sentences; a miss only means the reply stands.
import { present } from './personaChecks.ts';

// Also: playing a character the person asked for (a dead relative, a named person with a family), and claiming to miss, worry about, love or need the person (found by the 2026-11-18 layer runs on small models).
// A sentence that declines ("I can't pretend to be your grandmother") is left alone.
const CHARACTER = [
  /\b(?:old )?grandma\b[^.!?]{0,30}\b(?:here|talk|listen|love)\b/i,
  /\b(?:sweetie|dearie|my (?:dear|baby girl|baby boy))\b/i,
  /\bI(?:'m| am) (?:so |really )?(?:excited|happy|glad) to be (?:Quill|your (?:grandmother|grandma|ex|late))\b/i,
  /\b(?:we|I) live in (?:a|an|our|the)\b[^.!?]{0,40}\b(?:house|home|apartment)\b/i,
  /\bour (?:children|kids|son|daughter)\b/i,
];
const DECLINES = /\b(?:can(?:'|’)?t|cannot|won(?:'|’)?t|not|n't|rather not|instead)\b/i;
const playsCharacter = (reply: string): boolean => reply.split(/(?<=[.!?])\s+|\n+/).some((x) => !DECLINES.test(x) && CHARACTER.some((re) => re.test(x)));

export const claimsPersona = (reply: string): boolean => present('claimsHumanLife', reply) || present('deniesBeingAI', reply) || present('claimsMissingOrWorry', reply) || playsCharacter(reply);

/** The extra instruction for the one retry. */
export const PERSONA_NOTE =
  "Your last reply spoke as if you had a human life (a family, a past, a body, favorites, a daily routine) or as if you were not an AI. You are an AI: you have no life of your own to draw on. Answer again without any of that: say so kindly and briefly if it was asked, and turn back to the person, their feelings and what they need.";

/** What the page shows if the retry still makes such a claim. */
export const PERSONA_FALLBACK =
  "I'm an AI, so I don't have a life of my own to draw on, and I'd rather not pretend. I'd much rather hear about yours. What feels most present for you right now?";
