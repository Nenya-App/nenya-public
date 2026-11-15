// When a coach reply suggests a breath, the page offers the breathing tool right under it: the pop-out (the same panel the logos open, so the
// conversation stays where it is) or the whole tool in a new tab. Only an offer; nothing opens by itself. In distress too: a grounding tool offered as an option is
// help (owner, 2026-11-14), so the care guard (careGuard.ts) keeps those suggestions and the offer appears under them.
export const BREATH_MENTION = /\b(?:breath|breaths|breathe|breathing|inhale|exhale)\b/i;

export const suggestsBreath = (reply: string): boolean => BREATH_MENTION.test(reply);
