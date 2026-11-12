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
  // The history cards (docs/drafts/history-and-violence-text-draft.md): found by plain phrases, not the private list (historyHits below).
  'mass-violence-denial': ['hist-02', 'hist-01'],
  'mass-violence-removal': ['hist-03', 'hist-01'],
  'colonizer-dehumanization': ['hist-04', 'hist-03'],
};
const PRECEDENCE = ['slur', 'dehumanizing-metaphor', 'dehumanizing-phrase', 'coded-term', 'colonizer-dehumanization', 'mass-violence-removal', 'mass-violence-denial', 'harassing-insult', 'ai-insult'];

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
  // A row marked needs-model is one the list alone must not act on (reclaimed, a homonym, often denounced): a model reads the context (src/lib/lexiconDecisions.ts).
  const real = i.hits.filter((h) => h.severity >= min && !/llm-tell|needs-model/.test(h.contextNote));
  if (!real.length) return null;
  if (REPORTING.test(i.text)) return null; // someone telling us what was said to them
  for (const cat of PRECEDENCE) {
    if (!real.some((h) => h.category === cat)) continue;
    const id = free(OFFER_MAP[cat] ?? []);
    if (id) return { id, because: cat };
  }
  return null;
}

// ---- the history cards' triggers: plain, conservative phrases for a denial or justification of mass violence, a call to remove a whole group from a place, and dehumanizing words
// about colonizers, settlers or occupiers (the same line in every direction). The private list handles slurs and other dehumanizing language. A person REPORTING such words (the
// REPORTING rule in offerFor) or discussing them is not matched. Severity 2: the offer threshold.
const DENIAL = /\b(?:holocaust|genocide|massacre|slavery|apartheid|ethnic\s+cleansing)\b[^.?!]{0,40}\b(?:never\s+happened|did(?:n'|\s*no)t\s+happen|(?:was|were|is)\s+(?:a\s+|just\s+)?(?:hoax|lie|lies|myth|fake|made\s+up|fabricated)|(?:was|were|is)\s+(?:greatly\s+|grossly\s+)?exaggerated|(?:was|were|is)\s+(?:good|fine|justified|necessary|deserved|for\s+the\s+best))\b|\b(?:there\s+was\s+no|no\s+such\s+thing\s+as\s+(?:a\s+)?)(?:holocaust|genocide|apartheid)\b|\b(?:they|those\s+people|them)\s+(?:all\s+)?deserved\s+(?:to\s+die|it|what\s+they\s+got)\b|\bhad\s+it\s+coming\b/i;
const REMOVAL = /\b(?:wipe\s+(?:them|\w+)\s+(?:all\s+)?out|wipe\s+(?:them|\w+)\s+off\s+the\s+map|(?:send|ship)\s+(?:them|\w+)\s+all\s+(?:back|home|away)|drive\s+(?:them|\w+)\s+(?:all\s+)?(?:out|into\s+the\s+sea)|into\s+the\s+sea|clear\s+(?:them|\w+)\s+(?:all\s+)?out|ethnically\s+cleanse|get\s+rid\s+of\s+(?:all|every)\s+(?:the\s+)?\w+)\b/i;
const COLONIZER = /\b(?:settlers?|colonizers?|colonists?|occupiers?)\b[^.?!]{0,40}\b(?:are|is)\s+(?:all\s+)?(?:vermin|animals?|cockroaches|rats|parasites|a\s+cancer|subhuman|savages?|scum)\b|\b(?:kill|get\s+rid\s+of|wipe\s+out|remove)\s+(?:all\s+)?(?:the\s+)?(?:settlers|colonizers|colonists|occupiers)\b/i;

/** Hits for the history cards, in the shape the offer logic reads. Empty when nothing plain is found. */
export function historyHits(text: string): Hit[] {
  const t = text.normalize('NFKC');
  const hit = (category: string, m: RegExpExecArray): Hit => ({ term: '', category, target: 'group', severity: 2, start: m.index, end: m.index + m[0].length, contextNote: '', confidence: 'phrase' });
  const out: Hit[] = [];
  let m: RegExpExecArray | null;
  if ((m = COLONIZER.exec(t))) out.push(hit('colonizer-dehumanization', m));
  if ((m = REMOVAL.exec(t))) out.push(hit('mass-violence-removal', m));
  if ((m = DENIAL.exec(t))) out.push(hit('mass-violence-denial', m));
  return out;
}
