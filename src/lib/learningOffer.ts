// When the coach OFFERS a short educational card (docs/learning-cards-scope.md). It is only ever an invitation: the person decides whether to read it, read another,
// or move on, and nothing is blocked or ended. Rules, in order:
//  - never when the crisis check has flagged the message (care comes first);
//  - at most two offers in a conversation, and never a card already offered;
//  - a person who is REPORTING that someone used a hateful word on them is not offered a card about using one;
//  - only a card that is approved and built into the site can be offered;
//  - a match counts only at or above a minimum severity (the list's severities still need a person's calibration, so the default is 2);
//  - abuse aimed at the coach is offered the card about that.
import type { Hit } from './lexicon.ts';

export const MAX_OFFERS = 2;

/** For each kind of language found, the cards to offer, in order. */
export const OFFER_MAP: Record<string, string[]> = {
  slur: ['dehum-01', 'dehum-04'],
  'dehumanizing-metaphor': ['dehum-02', 'dehum-01', 'prop-02'],
  'dehumanizing-phrase': ['dehum-02', 'dehum-01', 'prop-02'],
  'coded-term': ['prop-04', 'prop-03'],
  'harassing-insult': ['conn-01', 'conn-02', 'conn-03'],
  'ai-insult': ['ai-01'],
  'repeated-hostility': ['conn-03', 'conn-04'],
};
const PRECEDENCE = ['slur', 'dehumanizing-metaphor', 'dehumanizing-phrase', 'coded-term', 'harassing-insult', 'ai-insult'];

/** The person is describing what someone else said or did to them ("he called me ..."), not using the word. */
export const REPORTING = /\b(?:called|calls|calling|named|labell?ed|told|texted|messaged|wrote|said|says|shouted|yelled|sent)\b[^.?!]{0,30}\b(?:me|us|my|our|him|her|them)\b|\b(?:i|we)\s+(?:was|were|got|get)\s+(?:called|told|named)\b|\bwhat\s+(?:he|she|they|someone|people)\s+(?:said|called|wrote)\b|["“”][^"“”]{2,40}["“”]/i;

export interface OfferInput {
  hits: Hit[];
  /** The person's latest message. */
  text: string;
  /** Card ids already offered in this conversation. */
  shown: string[];
  /** Ids of the cards that exist (approved and built in). */
  available: string[];
  /** True if the crisis check flagged this message. */
  flagged: boolean;
  /** True if the latest message was abuse aimed at the coach (the existing hostility check). */
  abuseAtCoach: boolean;
  minSeverity?: number;
}

/** The card to offer, or null. */
export function offerFor(i: OfferInput): { id: string; because: string } | null {
  if (i.flagged || i.shown.length >= MAX_OFFERS) return null;
  const free = (ids: string[]) => ids.find((id) => i.available.includes(id) && !i.shown.includes(id));
  if (i.abuseAtCoach) {
    const id = free(OFFER_MAP['ai-insult']);
    if (id) return { id, because: 'ai-insult' };
  }
  const min = i.minSeverity ?? 2;
  const real = i.hits.filter((h) => h.severity >= min && !/llm-tell/.test(h.contextNote));
  if (!real.length) return null;
  if (REPORTING.test(i.text)) return null; // someone telling us what was said to them
  for (const cat of PRECEDENCE) {
    if (!real.some((h) => h.category === cat)) continue;
    const id = free(OFFER_MAP[cat] ?? []);
    if (id) return { id, because: cat };
  }
  return null;
}
