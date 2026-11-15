// When a coach reply suggests a breath, the page offers the breathing tool right under it: the pop-out (the same panel the logos open, so the
// conversation stays where it is) or the whole tool in a new tab. Only an offer; nothing opens by itself. The care guard (careGuard.ts) already
// takes breathing suggestions out of replies to possible distress, so this never appears there.
export const BREATH_MENTION = /\b(?:breath|breaths|breathe|breathing|inhale|exhale)\b/i;

export const suggestsBreath = (reply: string): boolean => BREATH_MENTION.test(reply);
