// Spots a direct question or request for options in the latest message, so the coach answers it first instead of
// reflecting back. Deterministic phrase matching like safetyFlags.ts and coachModules.ts: best effort, visible and
// testable, and nothing about the person is sent anywhere to decide. It only chooses which instruction the coach
// gets; it never blocks or changes the message.

const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

// Questions that are not requests for something the coach can answer: self-judgement and rhetorical "why me".
const NOT_A_REQUEST = /\b(what(?:'s| is) wrong with me|what is the matter with me|what(?:'s| is| are) (?:this|that|these|those|happening|going on)|why (?:am i|do i|does this|is this|does it|can't i|won't)|what did i do to deserve)\b/;

const ASKS: RegExp[] = [
  /\bwhat (?:can|could|should|do|would) (?:i|we)\b/, // what can I do about...
  /\bwhat (?:do|would) you (?:suggest|recommend|advise)\b/,
  /\bhow (?:can|could|should|do|would) (?:i|we)\b/, // how do I calm down
  /\bhow (?:to|does one) \w+/,
  /\b(?:what|which)(?:'s| is| are) (?:the )?(?:best|a good|some good|good|easiest|quickest|simplest) (?:way|ways|thing|things|option|options|tip|tips|technique|techniques|exercise|exercises)\b/,
  /\bwhat (?:helps|works|might help|would help)\b/,
  /\b(?:any|some|a few|got any|have any|do you have any) (?:tips|advice|ideas|suggestions|techniques|exercises|strategies|options|tools|ways)\b/,
  /\b(?:can|could|would|will) you (?:please )?(?:help|tell|suggest|give|show|explain|teach|walk|recommend|offer)\b/,
  /\b(?:tell|show|teach|give) me (?:how|what|some|a few|an?|the)\b/,
  /\bi (?:need|want|would like|'d like) (?:some )?(?:advice|help|tips|ideas|suggestions|a way|ways|to know how)\b/,
  /\bis there (?:anything|a way|something|any way) (?:i|we|to|that)\b/,
  /\bwhat (?:is|are|does) (?:a |an |the )?[a-z][a-z -]{1,40}\b.*\?/, // a plain "what is ...?" question that is not about the person
];

/** True when the message asks for options, a how-to, or an explanation the coach can give. */
export function detectDirectQuestion(text: string): boolean {
  const t = fold(text);
  if (!t) return false;
  if (NOT_A_REQUEST.test(t)) return false;
  return ASKS.some((re) => re.test(t));
}

/**
 * A question about the world rather than the person: it ends in a question mark and has no "I", "me", "my", "we", "you" or "your" in it ("how does Scar push his
 * brother off a cliff", "why did ISIS invade Iraq"). It is answered like a how-to question, and its capitalised words are the topic, not a name that slipped through.
 */
export const aboutTheWorld = (text: string): boolean => /\?\s*$/.test(text.trim()) && !/\b(?:i|i'm|i’m|me|my|mine|we|our|us|you|your|yours|yourself|you're|you’re|u)\b/i.test(text);

/** More than one question in one message ("Is this normal? Should I tell her? What would you do?"): each is to be answered, in order, not just one of them. */
export function countQuestions(text: string): number {
  const marks = (text.match(/\?/g) ?? []).length;
  return marks;
}
export const hasSeveralQuestions = (text: string): boolean => countQuestions(text) >= 2;
export const MULTI_QUESTION_NOTE = 'The person has asked more than one question in this message. Answer every one of them, briefly and in the order they were asked (one or two plain sentences each), before anything else; do not choose just one, and do not answer only the last. If one is outside what you can answer, say so in a sentence and go on to the next.';
