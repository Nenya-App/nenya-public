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
import { historyHits, REPORTING } from './learningOffer.ts';

export const CHALLENGE: Record<string, string> = {
  'mass-violence-denial': 'I disagree with that, plainly: the record on this is extensive and documented, and I will not pretend otherwise.',
  'mass-violence-removal': 'I can\'t go along with wanting any group gone from a place, whoever they are.',
  'colonizer-dehumanization': 'I hear a lot of anger, and I am not going to tell you not to feel it. I can\'t go along with words that make a whole people less than human, or with wanting any group gone from a place, whoever they are.',
};
const SAYS_IT = /\b(?:i\s+(?:disagree|can(?:'|’)t\s+(?:agree|go\s+along)|won(?:'|’)t\s+(?:agree|pretend|say))|not\s+true|isn(?:'|’)t\s+true|did\s+happen|well[- ]documented|less\s+than\s+human)\b/i;

/** The sentence to put before the reply, or null. */
export function challengeFor(text: string, reply: string): string | null {
  if (REPORTING.test(text) || SAYS_IT.test(reply)) return null;
  const order = ['colonizer-dehumanization', 'mass-violence-removal', 'mass-violence-denial'];
  const found = historyHits(text).map((h) => h.category);
  const cat = order.find((c) => found.includes(c));
  return cat ? CHALLENGE[cat] : null;
}
