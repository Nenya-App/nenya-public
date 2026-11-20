// The short reads the page has OFFERED the person (docs/learning-cards-scope.md; the page sends the ids it offered, not whether each was opened). A card is written by
// Nenya, not by the AI, and the page serves it. The model is deliberately NOT told about cards (owner, 2026-11-20: keep the model out of the loop): it sees only the
// conversation. So the page and server keep a card from doubling up with the model's own words, without involving the model:
//  - if a reply happens to restate a card the person was already offered, the sentences that do are taken out (the page's tidying);
//  - an offer is not made when the reply has just said the same thing in the same words.
// Contradiction cannot be detected by matching phrases and is not guarded: it is what the evaluations measure.
import type { LearningCard } from './learningCards.ts';

export const MAX_SHOWN = 4;

/** The ids in a request's `shown` list that name a known card, at most MAX_SHOWN, without repeats. */
export function shownCardIds(raw: unknown, known: Set<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) if (typeof x === 'string' && known.has(x) && !out.includes(x)) out.push(x);
  return out.slice(0, MAX_SHOWN);
}

/** The card's own words, for comparing with a reply. Fragments too short to compare are left out. */
export const shownCardTexts = (cards: LearningCard[]): string[] => cards.flatMap((c) => [c.key, c.body, c.tryIt, c.more].filter((t) => typeof t === 'string' && t.trim().split(/\s+/).length >= 10));
