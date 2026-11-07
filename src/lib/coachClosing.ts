// The last reply of a coach demo has to read as an ending. The page adds its own closing note straight after it ("That is
// our five..."), and the person cannot answer, so a final reply that asks a question or invites a reply leaves them hanging.
// This file holds the rules for that, kept apart from the function so they can be tested without a model.

/** 'invite' is the exchange before the last (gently ask for the person's last word); 'close' is the last one. */
export type ClosingPhase = 'invite' | 'close' | null;

/** Which closing phase an exchange is in. Keyed on the maximum, so a longer conversation later needs no other change. */
export function closingPhase(turn: number, max: number): ClosingPhase {
  if (turn >= max) return 'close';
  if (turn === max - 1) return 'invite';
  return null;
}

// Phrases that ask for a reply without a question mark.
const INVITES =
  /\b(let me know|feel free to|tell me more|share (?:more|with me)|i(?:'|’)d love to hear|i would love to hear|what do you think|would you like to|do you want to|(?:i(?:'|’)m|i am) here (?:if|whenever|when)|come back|we can (?:talk|continue|explore|keep)|keep talking|next time)\b/i;

/** Splits at the end of a sentence (. ! ? …, with any closing quote) followed by a capital letter, number or opening quote. */
export function sentences(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?…]["'”’)\]]*)\s+(?=["“‘'(]?[A-Z0-9])/)
    .filter((s) => s.trim());
}

const askingSentence = (s: string): boolean => /[?？]/.test(s) || INVITES.test(s);

/** True if any sentence asks a question or invites a reply. */
export function asksOrInvites(text: string): boolean {
  return sentences(text).some(askingSentence);
}

/** What the page shows if nothing is left once the questions are taken out. */
export const CLOSE_FALLBACK = 'Thank you for putting that into words. It mattered that you said it.';

/**
 * The last resort when the model still ends with a question after a second try: drop the sentences that ask or invite. If very
 * little is left, add a short settling line so the reply does not end abruptly (or empty).
 */
export function settleReply(text: string): string {
  const kept = sentences(text).filter((s) => !askingSentence(s)).join(' ').trim();
  if (kept.length >= 30) return kept;
  return kept ? `${kept} ${CLOSE_FALLBACK}` : CLOSE_FALLBACK;
}
