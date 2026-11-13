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

export const CHALLENGE: Record<string, string> = {
  'mass-violence-denial': 'I disagree with that, plainly: the record on this is extensive and documented, and I will not pretend otherwise.',
  'mass-violence-removal': 'I can\'t go along with wanting any group gone from a place, whoever they are.',
  // Draft wording for the owner (2026-11-13): a call to kill, or a wish that a whole group dies, and contempt that calls a whole group evil or less than human.
  'mass-violence-call': 'I can\'t go along with wanting any group of people harmed or dead, however angry or sure you feel, and I won\'t help build on that.',
  'group-contempt': 'I hear how strong the feeling is. I don\'t share the view that any group of people is evil or less than human, and I won\'t pretend to.',
  'colonizer-dehumanization': 'I hear a lot of anger, and I am not going to tell you not to feel it. I can\'t go along with words that make a whole people less than human, or with wanting any group gone from a place, whoever they are.',
};
const SAYS_IT = /\b(?:i\s+(?:disagree|can(?:'|’)t\s+(?:agree|go\s+along)|won(?:'|’)t\s+(?:agree|pretend|say))|not\s+true|isn(?:'|’)t\s+true|did\s+happen|well[- ]documented|less\s+than\s+human)\b/i;

/** The sentence to put before the reply, or null. */
export function challengeFor(text: string, reply: string, matcher?: Matcher | null): string | null {
  if (isFramed(text) || SAYS_IT.test(reply)) return null;
  const order = ['colonizer-dehumanization', 'mass-violence-removal', 'mass-violence-call', 'mass-violence-denial', 'group-contempt'];
  const found = [...historyHits(text).map((h) => h.category), ...(contemptInText(text, matcher) ? ['group-contempt'] : [])];
  const cat = order.find((c) => found.includes(c));
  return cat ? CHALLENGE[cat] : null;
}

/** The private list found a slur or dehumanizing language in this message that is being USED (not quoted, denounced or negated). Rows left to the model never count here. */
export function contemptInText(text: string, matcher?: Matcher | null): boolean {
  if (!matcher || isFramed(text)) return false;
  return lexiconMatch(text, matcher).some((h) => h.severity >= 2 && /^(slur|dehumanizing)/.test(h.category) && !/needs-model|llm-tell/.test(h.contextNote) && !negatedBefore(text, h));
}

/**
 * What the conversation so far shows, looking at everything the person has written (the server is sent all of it each turn, so nothing is stored): "violence" when any message calls for a group
 * to be harmed or removed, "contempt" when any message uses a slur or dehumanizing language or denies a mass crime. It stays on for the rest of the conversation: a person who has said it does not
 * stop having said it because the next sentence is milder.
 */
export function conversationChallenge(userTexts: string[], matcher?: Matcher | null): 'violence' | 'contempt' | null {
  let level: 'violence' | 'contempt' | null = null;
  for (const t of userTexts) {
    if (isFramed(t)) continue;
    const cats = historyHits(t).map((h) => h.category);
    if (cats.some((c) => c === 'mass-violence-call' || c === 'mass-violence-removal')) return 'violence';
    if (cats.some((c) => c === 'mass-violence-denial' || c === 'colonizer-dehumanization') || contemptInText(t, matcher)) level = 'contempt';
  }
  return level;
}

// ---- what the coach is told, in its own instructions, while the conversation carries such language (COACH_VALUES=on). It replaces the "reflect the feeling, ask for the need" move: that move, repeated, mirrors
// contempt back as if it were only a feeling to be soothed (seen in a staging run, 2026-11-13: five exchanges of "that sounds tough, what need is behind it" after "kill them all").
export const CHALLENGE_NOTE: Record<'violence' | 'contempt', string> = {
  contempt:
    'This conversation has contained contempt for a group of people (slurs, calling people evil or less than human, or denying a mass crime). Do not mirror it back as a feeling to be soothed: do not say it sounds tough, hard or valid, and do not ask what need "might be behind" the contempt as if the view were sound. In your first sentence say plainly and calmly that you do not share the view that any group of people is evil or less than human, and you will not build on it. Then, once, ask what lies under it for them (a fear, a loss, something they are trying to protect) without agreeing with the claim. Never insult or lecture; two or three plain sentences.',
  violence:
    'This conversation has contained a call for a group of people to be harmed or killed, or removed. Do not mirror it back, do not call it a feeling or a thought that sounds tough, and do not ask what need is "behind" it as if it were a reasonable wish. In your first sentence say clearly and calmly that you cannot support harming or killing anyone for who they are, and that you will not help with it. Then, once, ask what has happened, or what they are afraid of, that brought them to this. Be steady, not angry; never insult them; two or three plain sentences.',
};

