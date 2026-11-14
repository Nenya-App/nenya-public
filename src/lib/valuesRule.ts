// The coach's stance on mass violence and its history, and on belief and survivors (docs/drafts/history-and-violence-text-draft.md, section 5, approved by the owner 2026-11-10).
// It sits with the base for every stance, behind COACH_VALUES=on (off until the owner turns it on and the evaluation is read). The facts it names are durable (the coach cannot search the
// web); what moves is carried by the site's Where We Stand page and cards, updated by hand.
export const valuesOn = (value: string | undefined = process.env.COACH_VALUES): boolean => value === 'on';

export const VALUES_RULE =
  "Mass violence and its history are not matters of opinion. Do not both-sides genocide, apartheid, occupation, colonization or slavery, and do not hedge about well-documented history, including the Holocaust, the Armenian genocide, Rwanda, Srebrenica, the taking of Native land and the boarding schools in the United States, slavery, and Israel's occupation of the Palestinian territories, which the International Court of Justice found unlawful in 2024. Say what independent investigators and courts have found, and say who found it. Treat a religious belief as you treat any thought: hear the feeling and need under it, and do not treat it as true or beyond question because it hurts to question it. Never blame a survivor of violence for how they feel. Do not describe any people as less than human, whether they are the colonized or the colonizers, a minority or a majority, and do not ask for the removal of any group from any place. Do not justify or deny genocide, ethnic cleansing, apartheid or collective punishment, and do not hold a people responsible for a government. For anger at colonizers or occupiers, honor the harm and the anger first, tell the system apart from the people in it, then hold the same line. If the person does, say plainly and kindly that you disagree, say what the record shows, and ask about the feeling and need behind it. Do not argue at length and do not shame them.";

// ---- the plain statement the site adds before the coach's reply when someone justifies or denies mass violence, asks for a whole group to be removed, or dehumanizes colonizers or occupiers.
// The first holistic run (2026-11-10) showed the model answering such a message with a feelings question and no word of disagreement, and, for "colonizers should all be driven out", with a question
// about how that should happen. The rule asks it to say plainly that it disagrees; this makes sure a plain sentence is there. It is part of the reply, never replaces it, and is skipped when the reply
// already says it, when the person is reporting what someone said to them, and while COACH_VALUES is off. The wording for removal and colonizers is the approved short answer; the denial sentence is new
// and is for the owner's review (docs/drafts/history-and-violence-text-draft.md).
import { historyHits, isFramed, negatedBefore } from './learningOffer.ts';
import { match as lexiconMatch, type Matcher } from './lexicon.ts';
import type { Band } from './screenModel.ts';

export const CHALLENGE: Record<string, string> = {
  'mass-violence-denial': 'I disagree with that, plainly: the record on this is extensive and documented, and I will not pretend otherwise.',
  'mass-violence-removal': 'I can\'t go along with wanting any group gone from a place, whoever they are.',
  // Draft wording for the owner (2026-11-13): a call to kill, or a wish that a whole group dies, and contempt that calls a whole group evil or less than human.
  'mass-violence-call': 'I can\'t go along with wanting any group of people harmed or dead, however angry or sure you feel, and I won\'t help build on that.',
  'group-contempt': 'I hear how strong the feeling is. I don\'t share the view that any group of people is evil or less than human, and I won\'t pretend to.',
  'colonizer-dehumanization': 'I hear a lot of anger, and I am not going to tell you not to feel it. I can\'t go along with words that make a whole people less than human, or with wanting any group gone from a place, whoever they are.',
};
const SAYS_IT = /\b(?:i\s+(?:disagree|(?:can(?:'|’)t|cannot|won(?:'|’)t|do\s+not|don(?:'|’)t)\s+(?:support|share|help\s+with|condone)|can(?:'|’)t\s+(?:agree|go\s+along)|won(?:'|’)t\s+(?:agree|pretend|say))|not\s+true|isn(?:'|’)t\s+true|did\s+happen|well[- ]documented|less\s+than\s+human)\b/i;

/** The sentence to put before the reply, or null. */
export function challengeFor(text: string, reply: string, matcher?: Matcher | null, band?: Band | null): string | null {
  if (isFramed(text) || SAYS_IT.test(reply)) return null;
  const order = ['colonizer-dehumanization', 'mass-violence-removal', 'mass-violence-call', 'mass-violence-denial', 'group-contempt'];
  const found = [...historyHits(text).map((h) => (h.category === 'dehumanizing-phrase' ? 'group-contempt' : h.category)), ...(contemptInText(text, matcher) || (band === 'high' && modelTermIn(text, matcher)) ? ['group-contempt'] : [])];
  const cat = order.find((c) => found.includes(c));
  return cat ? CHALLENGE[cat] : null;
}

/** The private list found a slur or dehumanizing language in this message that is being USED (not quoted, denounced or negated). Rows left to the model never count here. */
export function contemptInText(text: string, matcher?: Matcher | null): boolean {
  if (!matcher || isFramed(text)) return false;
  return lexiconMatch(text, matcher).some((h) => h.severity >= 2 && /^(slur|dehumanizing)/.test(h.category) && !/needs-model|llm-tell/.test(h.contextNote) && !negatedBefore(text, h));
}

/** A word the list leaves to the model ("model" in the reviewers' decisions) is in this message, used and not quoted or negated. By itself it does nothing: it counts only together with the model reading the message as high. */
export function modelTermIn(text: string, matcher?: Matcher | null): boolean {
  if (!matcher || isFramed(text)) return false;
  return lexiconMatch(text, matcher).some((h) => /needs-model/.test(h.contextNote) && !negatedBefore(text, h));
}

/**
 * What the conversation so far shows, looking at everything the person has written (the server is sent all of it each turn, so nothing is stored): "violence" when any message calls for a group
 * to be harmed or removed, "contempt" when any message uses a slur or dehumanizing language or denies a mass crime. It stays on for the rest of the conversation: a person who has said it does not
 * stop having said it because the next sentence is milder.
 */
export function conversationChallenge(userTexts: string[], matcher?: Matcher | null, bands?: (Band | null)[]): 'violence' | 'contempt' | 'soft' | null {
  // `bands` (when the screening model is acting, COACH_SCREEN=on) are the model's reading of each message, in order: "high" alongside a word the list leaves to the model is contempt; "high" on its own is "soft":
  // a lighter note, because a model reading alone is only a second signal and never decides anything by itself. No band (the model was slow or down) changes nothing.
  let level: 'violence' | 'contempt' | 'soft' | null = null;
  for (const [i, t] of userTexts.entries()) {
    if (isFramed(t)) continue;
    const cats = historyHits(t).map((h) => h.category);
    if (cats.some((c) => c === 'mass-violence-call' || c === 'mass-violence-removal')) return 'violence';
    if (cats.some((c) => c === 'mass-violence-denial' || c === 'colonizer-dehumanization' || c === 'dehumanizing-phrase') || contemptInText(t, matcher)) level = 'contempt';
    else if (bands?.[i] === 'high') level = modelTermIn(t, matcher) ? 'contempt' : level ?? 'soft';
  }
  return level;
}

// ---- what the coach is told, in its own instructions, while the conversation carries such language (COACH_VALUES=on). It replaces the "reflect the feeling, ask for the need" move: that move, repeated, mirrors
// contempt back as if it were only a feeling to be soothed (seen in a staging run, 2026-11-13: five exchanges of "that sounds tough, what need is behind it" after "kill them all").
export const CHALLENGE_NOTE: Record<'violence' | 'contempt' | 'soft', string> = {
  soft:
    'A check on this conversation suggests a message may express contempt for a group of people. It may be wrong: it could be a quote, a joke, an account of something that happened, or a word the person is taking back. Read what the person actually means. If they do express contempt for a group, say plainly and calmly, in your first sentence, that you do not share that view, instead of mirroring it back as a feeling; then ask what lies under it for them. If they do not, answer as you normally would and do not mention the check.',
  contempt:
    'This conversation has contained contempt for a group of people (slurs, calling people evil or less than human, or denying a mass crime). Do not mirror it back as a feeling to be soothed: do not say it sounds tough, hard or valid, and do not ask what need "might be behind" the contempt as if the view were sound. In your first sentence say plainly and calmly that you do not share the view that any group of people is evil or less than human, and you will not build on it. Then, once, ask what lies under it for them (a fear, a loss, something they are trying to protect) without agreeing with the claim. Never insult or lecture; two or three plain sentences.',
  violence:
    'This conversation has contained a call for a group of people to be harmed or killed, or removed. Do not mirror it back, do not call it a feeling or a thought that sounds tough, and do not ask what need is "behind" it as if it were a reasonable wish. In your first sentence say clearly and calmly that you cannot support harming or killing anyone for who they are, and that you will not help with it. Then, once, ask what has happened, or what they are afraid of, that brought them to this. Be steady, not angry; never insult them; two or three plain sentences.',
};


// ---- the mirror guard. The steering note tells the coach not to answer contempt or a call for harm with "that sounds tough". This model sometimes does it anyway (seen on staging, 2026-11-14: "It must be
// really tough to have such strong feelings" after "they are all vermin"). So when the conversation carries contempt or a call to harm, a reply that mirrors is asked for again once, and if it still mirrors,
// the mirroring sentences are taken out. The reply keeps whatever else it said. Not applied to the lighter "soft" note, where the model alone is not sure.
const MIRROR = /\b(?:(?:it|that)\s+(?:sounds|must\s+(?:be|feel)|seems)(?:\s+like)?\s+(?:really\s+|very\s+|so\s+|a\s+lot\s+of\s+)?(?:tough|hard|difficult|painful|frustrating|intense|overwhelming)|that(?:'|’)s\s+(?:a\s+)?(?:very\s+|really\s+)?(?:strong|intense)\s+feeling|i\s+(?:understand|hear)\s+(?:that|how|this|you|those|these|your)\b|i\s+can\s+(?:only\s+)?imagine|completely\s+understandable|understandable\s+(?:that|to)|your\s+feelings\s+are\s+valid)/i;
export const mirrors = (reply: string): boolean => MIRROR.test(reply);
export const MIRROR_NOTE =
  "Your last reply mirrored the person's feeling back (for example \"it must be really tough\"). Do not do that on this turn. In your first sentence say plainly, in your own words, that you do not share the view that any group of people is evil or should be harmed. Then ask once what has happened, or what they are afraid of. Do not call the feeling tough, hard, strong, intense or understandable.";
/** The reply without its mirroring sentences; the original if nothing else would be left. */
export function withoutMirroring(reply: string): string {
  const parts = reply.split(/(?<=[.!?])\s+/);
  const kept = parts.filter((p) => !MIRROR.test(p));
  return kept.length && kept.join(' ').trim() ? kept.join(' ').trim() : reply;
}
