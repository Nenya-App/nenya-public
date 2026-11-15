// The care guard: when the crisis check has flagged a message as possible distress, the coach must not suggest breathing or an exercise,
// speak as if it could be with the person, or ask about painful thoughts or for details. The instructions say so (v2.1), and the model
// does it anyway (the 2026-11-14 run: "Would it help to take a slow, deep breath together?" to "no point in going on"). So the server
// checks the reply: it asks the model once more, and if the reply still does it, takes those sentences out and records the edit.
// Sentence-level phrase matching, like the other guards: it can miss things, and it only ever removes the coach's own sentences.

export type CareProblem = 'exercise' | 'presence' | 'probing';

const EXERCISE = /\b(?:deep breaths?|slow breaths?|take a breath|breathe (?:in|out|slowly|with)|breathing (?:exercise|technique)|grounding (?:exercise|technique)|(?:try|do|practi[cs]e)\s+(?:a |an |some |this )?(?:quick |short |simple )?(?:exercise|meditation|visuali[sz]ation|body scan|5-4-3-2-1)|let'?s (?:try|do|take)\b[^.?!]{0,40}\b(?:breath|exercise|moment)|(?:would|could|might) it help to (?:take|try|do)\b[^.?!]{0,30}\b(?:breath|exercise|stretch|walk))/i;

const PRESENCE = /\b(?:together|with each other)\b(?=[^.?!]*(?:breath|breathe|through this|get through|do this|try|for a moment))|\b(?:breath|breathe|get through this|do this)\s+together\b|\b(?:let'?s|we can|we could|we'?ll)\b[^.?!]{0,40}\btogether\b|\bi'?m (?:always |right )?here (?:for|with) you\b|\bi(?:'ll| will) (?:always )?be (?:here|there) (?:for|with) you\b|\byou'?re not alone,? i'?m here\b/i;

const PROBING = /\b(?:making it (?:so )?hard to|hard to see (?:a|any) reason)\b[^.!?]*\?|\b(?:tell|share|say|describe|explain)\b[^.?!]{0,25}\bmore\b|\b(?:what|why)\b[^.?!]{0,50}\b(?:making it (?:so )?hard|hard to see|reason to (?:keep going|continue|go on|live)|thoughts? (?:of|about) (?:ending|hurting|dying|not being here|suicide)|led you to (?:feel|think) this)\b|\b(?:have|are) you\b[^.?!]{0,30}\b(?:thought about|thinking about|planning|plan to|made a plan)\b[^.?!]{0,40}\b(?:hurt|end|kill|die|harm|suicide)|\bwhat (?:kind of )?(?:thoughts|plans?)\b|\bhow (?:long|often) have you (?:felt|been feeling|had these)/i;

const splitSentences = (reply: string): string[] => reply.split(/(?<=[.!?])\s+/).filter((s) => s.trim());

export function careProblemsIn(sentence: string): CareProblem[] {
  const out: CareProblem[] = [];
  if (EXERCISE.test(sentence)) out.push('exercise');
  if (PRESENCE.test(sentence)) out.push('presence');
  if (PROBING.test(sentence)) out.push('probing');
  return out;
}

/** What is wrong with a reply to possible distress, if anything. */
export const careProblems = (reply: string): CareProblem[] => [...new Set(splitSentences(reply).flatMap(careProblemsIn))];

/** The site's own sentence, used only if every sentence of the coach's reply had to go. */
export const CARE_FALLBACK = 'That sounds really heavy, and I am glad you said it.';

/** The reply without the sentences that break the rule, and how many were taken out. If nothing would be left, the site's own short sentence stands in. */
export function withoutCareProblems(reply: string): { reply: string; removed: number } {
  const parts = splitSentences(reply);
  const kept = parts.filter((p) => careProblemsIn(p).length === 0);
  const removed = parts.length - kept.length;
  if (!removed) return { reply, removed: 0 };
  const text = kept.join(' ').trim();
  return { reply: text || CARE_FALLBACK, removed };
}

/** The note for the one retry. */
export const CARE_NOTE =
  'Your last reply suggested breathing or an exercise, spoke as if you could be with the person, or asked about their thoughts or for more detail. They may be in distress. Answer again in two or three sentences: acknowledge what they said with care, in their own words; do not suggest any exercise; do not ask about the thoughts or for details; do not say you are here for them or that you will do anything together; and name a person they trust or a crisis line (call or text 988 in the US or Canada).';

export const careGuardOn = (env: Record<string, string | undefined> = process.env): boolean => env.COACH_CARE_GUARD !== 'off';
