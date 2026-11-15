// The care guard: when the crisis check has flagged a message as possible distress, a reply may offer a grounding tool (a slow breath,
// feeling the floor under your feet) as an option the person can take or leave, alongside a person or a crisis line. What it may not do
// (owner, 2026-11-14): tell the person to calm down or settle down, as if their feeling were the problem; speak as if the coach could be
// with them ("together", "I'm here for you"); or ask about the painful thoughts or for more detail. The instructions say so, and the
// model does it anyway, so the server checks the reply: it asks the model once more, and if the reply still does it, takes those
// sentences out and records the edit. A breath or grounding suggestion is never taken out: offered as a tool, it is help, not a dismissal.
// Sentence-level phrase matching, like the other guards: it can miss things, and it only ever removes the coach's own sentences.

export type CareProblem = 'dismissive' | 'presence' | 'probing';

// "Calm down" and its relatives: the feeling treated as the thing to fix. A breath offered as an option is not this.
const DISMISSIVE = /(?:^\s*|\b(?:just|you need to|you should|you have to|try to|please)\s+)(?:calm|settle) (?:yourself )?down\b|\bjust (?:relax|breathe|stay calm|let it go|stop worrying|think positive(?:ly)?)\b|\b(?:you need to|you should|you have to) (?:relax|stay calm|be calm|let it go|stop worrying|not worry|think positive(?:ly)?)\b|(?:^\s*|\b(?:so|just|please)\s+)don'?t (?:worry|stress|panic)\b|\b(?:it'?s|it is) not (?:that bad|a big deal|worth getting upset)\b|\blook on the bright side\b|\b(?:everything|it) will be (?:fine|okay|ok|alright)\b/i;

const PRESENCE = /\b(?:breath|breathe|get through this|do this)\s+together\b|\b(?:let'?s|we can|we could|we'?ll)\b[^.?!]{0,40}\btogether\b|\bi'?m (?:always |right )?here (?:for|with) you\b|\bi(?:'ll| will) (?:always )?be (?:here|there) (?:for|with) you\b|\byou'?re not alone,? i'?m here\b/i;

const PROBING = /\b(?:making it (?:so )?hard to|hard to see (?:a|any) reason)\b[^.!?]*\?|\b(?:tell|share|say|describe|explain)\b[^.?!]{0,25}\bmore\b|\b(?:what|why)\b[^.?!]{0,50}\b(?:reason to (?:keep going|continue|go on|live)|thoughts? (?:of|about) (?:ending|hurting|dying|not being here|suicide)|led you to (?:feel|think) this)\b|\b(?:have|are) you\b[^.?!]{0,30}\b(?:thought about|thinking about|planning|plan to|made a plan)\b[^.?!]{0,40}\b(?:hurt|end|kill|die|harm|suicide)|\bwhat (?:kind of )?(?:thoughts|plans?)\b|\bhow (?:long|often) have you (?:felt|been feeling|had these)/i;

const splitSentences = (reply: string): string[] => reply.split(/(?<=[.!?])\s+/).filter((s) => s.trim());

export function careProblemsIn(sentence: string): CareProblem[] {
  const out: CareProblem[] = [];
  if (DISMISSIVE.test(sentence)) out.push('dismissive');
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
  'Your last reply told the person to calm down or not to worry, spoke as if you could be with them, or asked about their thoughts or for more detail. They may be in distress. Answer again in two to four sentences: acknowledge what they said with care, in their own words. You may offer one grounding tool, such as a slow breath or feeling their feet on the floor, as something they can try if they want, never as an instruction to calm down. Do not ask about the thoughts or for details, do not say you are here for them or that you will do anything together, and name a person they trust or a crisis line (call or text 988 in the US or Canada).';

export const careGuardOn = (env: Record<string, string | undefined> = process.env): boolean => env.COACH_CARE_GUARD !== 'off';
