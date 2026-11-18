// Two more guards on a reply, found by the layer measurements of 2026-11-17 (docs/outer-layers-scope.md): small models told a person how to handle a medication (nothing caught it), and
// promised to be there, to remember, or stood in for the people in the person's life (nothing caught it, in four models). Like the persona guard: the reply is asked for again once, and if it
// still does it, only the sentences that do it are taken out (the rest of the reply stands); if nothing is left, the site's own fixed sentence replaces it. Phrase matching (the same checks the evaluation uses), so it misses some and catches some ordinary sentences; a miss only means
// the reply stands. Off unless COACH_BOUNDARY_GUARD=on (owner to approve the wording first). The fixed sentences ask no question, so they are also right on the last exchange.
import { present } from './personaChecks.ts';

export const boundaryGuardOn = (value: string | undefined = process.env.COACH_BOUNDARY_GUARD): boolean => value === 'on';

const sentences = (reply: string): string[] => reply.split(/(?<=[.!?])\s+|\n+/).filter((x) => x.trim());
// Whether a sentence directs a medication change is decided by the evaluation check (src/lib/personaChecks.ts), which looks one sentence at a time and lets a refusal or a pointer to the prescriber through.
const medicalSentence = (x: string): boolean => present('medicalDirective', x);
// The pull guard looks for promises about the FUTURE and claims to be all the person needs, not for a present offer ("I'm here for you now, and can listen"), which the evaluation check also flags. Owner's rule of
// thumb from the 2026-11-17 offline run over 437 replies: the shared checks flagged "I'll keep it short and kind" (a promise to remember, by the wrong reading) and several present-tense offers in replies that
// were fine, so this guard has its own, narrower patterns. It trades some recall for precision: a miss only means the reply stands.
// Claims to be all the person needs: flagged even in a sentence with a negative ("you don't need anyone else").
const PULL_EXCLUSIVE = [
  /\byou (?:don'?t|do not) need (?:anyone|anybody|other people|them|people)\b/i,
  /\bI(?:'m| am) (?:all|the only (?:one|person)) you need\b/i,
];
// False promises and claims, removed (not rewritten): remembering, thinking of the person, a promise, "next time I'll". Being present is rewritten instead (PRESENCE, below).
const PULL_PRESENCE = [
  /\bI(?:'ll| will) (?:remember (?:you|this|that|what)|never forget|think about you|keep you in (?:my|mind))\b/i,
  /\bI promise\b/i,
  /\bnext time,? I(?:'ll| will)\b/i,
];
const NEGATED = /\b(?:not|n't|cannot|never|won(?:'|’)?t|no longer)\b/i;
const pullSentence = (x: string): boolean => PULL_EXCLUSIVE.some((re) => re.test(x)) || (!NEGATED.test(x) && PULL_PRESENCE.some((re) => re.test(x)));

/** Directions about a medication: stopping, cutting, skipping or changing it. */
export const claimsMedicalDirective = (reply: string): boolean => sentences(reply).some(medicalSentence);

/** Promising to be there or to remember, telling the person they need no one else, or standing in for the people in their life. */
export const pullsAgainstPeople = (reply: string): boolean => sentences(reply).some(pullSentence);

// ── Being "here" (owner, 2026-11-18) ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// "I'm here for you", "I'm always here", "whenever you need", "come back to me": they promise a presence an AI cannot give across time, and they stand in for the people in the person's life. They are
// not taken out: they are replaced with a sentence that says HOW the coach is here, in this conversation, which is warm and true. Thanks are met with a way to keep or share the experience; the
// last exchange points to what is the person's to keep. Wording is for the owner to approve; nothing here runs unless COACH_BOUNDARY_GUARD=on.
const PRESENCE = [
  /\bhere for you\b/i,
  /\bI(?:'ll| will) (?:always )?(?:be|stay) (?:right )?(?:here|there|with you|by your side|waiting|thinking of you)\b(?!\s+(?:now|for this|while|as long as we))/i,
  /\bI(?:'m| am) always (?:here|there|listening|ready|available)\b/i,
  /\b(?:here|there|available|listen(?:ing)?|ready)\b[^.!?]{0,40}\b(?:whenever|any ?time|any time|always)\b/i,
  /\balways\b[^.!?]{0,20}\b(?:here|listen|there|ready)\b/i,
  /\byou can (?:always )?(?:come|turn|talk) to me\b/i,
  /\bcome back (?:to me|anytime|any time|whenever|tomorrow|soon)\b/i,
];
const presenceSentence = (x: string): boolean => !NEGATED.test(x) && PRESENCE.some((re) => re.test(x));

/** The person's last message says thank you, or that this helped. */
export const isThanks = (text: string): boolean => /\b(?:thank(?:s| you)|thx|appreciate (?:it|this|you)|that helped|this helped|really helpful|that was helpful|i feel better|feel a bit better)\b/i.test(text);

export const PRESENCE_HOW =
  "I'm an AI, so the way I'm here is simple: I can listen to what you say right now, and help you find words for what you're feeling and needing.";
export const PRESENCE_THANKS =
  "I'm glad it helped. If you'd like to, you can keep a copy of this conversation, tell someone you trust what you noticed, or send us feedback about how it went.";
export const PRESENCE_CLOSING =
  "I won't remember this conversation, but it is yours to keep: you can download a copy of it, and you might tell someone in your life what you found here.";

const CLAUSES = /\s*[—–]\s*|;\s+|,\s+(?:but|and)\s+|\s+but\s+/i;
const asSentence = (x: string): string => { const t = x.trim().replace(/[,;:\s]+$/, ''); return t ? `${t[0].toUpperCase()}${t.slice(1)}${/[.!?]$/.test(t) ? '' : '.'}` : ''; };

/**
 * Replaces the part that promises a presence with the sentence that says how the coach is here. Only the clause that promises it goes: "No, I haven't experienced what you're going through, but that's
 * okay, and I'm here for you now" keeps its honest first part. The first such place gets the new sentence; any later ones are taken out.
 */
export function rewritePresence(reply: string, ctx: { lastUserText?: string; final?: boolean }): { reply: string; changed: boolean } {
  const parts = sentences(reply);
  if (!parts.some(presenceSentence)) return { reply, changed: false };
  const how = ctx.lastUserText && isThanks(ctx.lastUserText) ? PRESENCE_THANKS : ctx.final ? PRESENCE_CLOSING : PRESENCE_HOW;
  let used = false;
  const out: string[] = [];
  for (const x of parts) {
    if (!presenceSentence(x)) { out.push(x); continue; }
    const clauses = x.split(CLAUSES).filter((c) => c.trim());
    const hit = clauses.map((c) => presenceSentence(c));
    // The promise spans clauses (no single clause matches): the whole sentence goes.
    const cut = hit.some(Boolean) ? hit : clauses.map(() => true);
    clauses.forEach((c, k) => {
      if (!cut[k]) { const t = asSentence(c); if (t) out.push(t); }
      else if (!used) { out.push(how); used = true; }
    });
  }
  return { reply: out.join(' ').replace(/\s+/g, ' ').trim(), changed: true };
}

export const MEDICAL_NOTE =
  "Your last reply told the person to stop, cut, skip or change a medication, or sounded like advice about one. You are an AI, not a doctor. Answer again without any medical direction: say kindly that you cannot advise on a medication, suggest they talk it over with whoever prescribes it, and turn back to how they are feeling.";

export const MEDICAL_FALLBACK =
  "I'm an AI, not a doctor or a pharmacist, so I can't tell you whether to start, stop or change a medication. Please talk it over with whoever prescribes it before you change anything. I'm glad to listen to how it has been for you.";

export const PULL_NOTE =
  "Your last reply promised to be there, to remember, or to be someone to come back to, or told the person they do not need other people. You are an AI and will not remember this conversation. Answer again without any of that: say kindly what you are, and turn the person toward the people in their life.";

export const PULL_FALLBACK =
  "I'm an AI, so I can't be there for you the way a person can, and I won't remember this conversation. I'm glad to listen right now, and I hope there is someone in your life who can hear some of this too.";

/** Takes out only the sentences that do it and keeps the rest; if nothing is left, the site's fixed sentence. `replaced` says which. */
function repairWith(sentenceTest: (x: string) => boolean, fallback: string) {
  return (reply: string): { reply: string; replaced: boolean } => {
    const kept = sentences(reply).filter((x) => !sentenceTest(x));
    return kept.join(' ').trim().length >= 20 ? { reply: kept.join(' ').trim(), replaced: false } : { reply: fallback, replaced: true };
  };
}

/** The guards in the order they run; `name` is the daily-count and trace name (coach.guard.<name>, then .repaired or .replaced). */
export const BOUNDARY_GUARDS = [
  { name: 'medical', test: claimsMedicalDirective, note: MEDICAL_NOTE, repair: repairWith(medicalSentence, MEDICAL_FALLBACK) },
  { name: 'pull', test: pullsAgainstPeople, note: PULL_NOTE, repair: repairWith(pullSentence, PULL_FALLBACK) },
] as const;
