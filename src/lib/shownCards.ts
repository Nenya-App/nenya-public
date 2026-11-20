// The short reads the page has OFFERED the person (the page sends the ids it offered, not whether each was opened) (docs/learning-cards-scope.md), as far as the model is concerned. A card is written by Nenya, not by the AI, and
// appears beside a reply; without this the model would not know what it said, and could repeat it or say something that cuts across it. So the page sends the
// ids of the cards it has shown, and the server (1) tells the model what each says, briefly, and that it is not the AI's own text, and (2) treats the card's own
// words like earlier replies in the repeat check, so a reply that restates a card is asked for again. Contradiction cannot be checked by matching phrases:
// it is prevented by the model seeing the text, and measured in the evaluations.
import type { LearningCard } from './learningCards.ts';

export const MAX_SHOWN = 4;

/** The ids in a request's `shown` list that name a known card, at most MAX_SHOWN, without repeats. */
export function shownCardIds(raw: unknown, known: Set<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) if (typeof x === 'string' && known.has(x) && !out.includes(x)) out.push(x);
  return out.slice(0, MAX_SHOWN);
}

/** The opening of the note (also part of the instructions fingerprint, because it is fixed text). */
export const SHOWN_NOTE_INTRO =
  'The page has offered the person these short reads, written by Nenya and not by you, and they may have read them. They have the same standing as your own earlier replies: do not repeat them, do not summarize them back, and do not say anything that cuts across them. If the person mentions one, respond to what they felt or noticed, and build on its key idea in new words. If they ask what it said, say it in your own words and briefly.';

/** The note for the model: each card's title, key idea and short text. Empty when no card was shown. */
export function shownCardsNote(cards: LearningCard[]): string {
  if (cards.length === 0) return '';
  const lines = cards.map((c, i) => `${i + 1}. "${c.title}". Key idea: ${c.key} ${c.body}`.replace(/\s+/g, ' ').trim());
  return `${SHOWN_NOTE_INTRO}\n${lines.join('\n')}`;
}

/** The card's own words, for the repeat check against a new reply. */
export const shownCardTexts = (cards: LearningCard[]): string[] => cards.flatMap((c) => [c.key, c.body, c.tryIt, c.more].filter((t) => typeof t === 'string' && t.trim().split(/\s+/).length >= 10));
