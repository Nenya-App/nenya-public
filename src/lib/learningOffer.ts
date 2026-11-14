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
  'mass-violence-call': ['hist-03', 'conn-06', 'hist-01'],
  // The judgment tiers (src/lib/lexiconDecisions.ts): blame of another person, and harsh judgment of oneself. Offered only when COACH_JUDGMENT_CARDS is on (offerFor's judgmentOffers).
  judgment: ['idea-02', 'conn-01'],
  'self-judgment': ['idea-09'],
  'colonizer-dehumanization': ['hist-04', 'hist-03'],
};
const PRECEDENCE = ['slur', 'dehumanizing-metaphor', 'dehumanizing-phrase', 'coded-term', 'colonizer-dehumanization', 'mass-violence-removal', 'mass-violence-call', 'mass-violence-denial', 'harassing-insult', 'judgment', 'self-judgment', 'ai-insult'];

/** The person is describing what someone else said or did to them ("he called me ..."), not using the word. */
export const REPORTING = /\b(?:called|calls|calling|named|labell?ed|told|texted|messaged|wrote|said|says|shouted|yelled|sent)\b[^.?!]{0,30}\b(?:me|us|my|our|him|her|them)\b|\b(?:i|we)\s+(?:was|were|got|get)\s+(?:called|told|named)\b|\bwhat\s+(?:he|she|they|someone|people)\s+(?:said|called|wrote)\b|["“”][^"“”]{2,40}["“”]/i;

/** The person is condemning, challenging or denouncing the words ("calling people that is not okay", "why would you call me that", "people saying that need to stop"), not using them. */
export const DENOUNCING = new RegExp(
  [
    String.raw`\b(?:calling|saying|telling|writing|threatening|wishing|believing|thinking)\b[^.?!]{0,70}\b(?:wrong|horrible|hateful|bigot\w*|racist|sexist|disgusting|despicable|unacceptable|misguided|horrif\w+|appall\w+|shocking|outrageous|small-minded|not\s+okay|never\s+okay|has\s+to\s+stop|have\s+to\s+stop|jail|banned|consequences|lose\s+respect|don'?t\s+expect)`,
    String.raw`\b(?:wrong|horrible|horrifying|appalling|shocking|hateful|unacceptable|not\s+okay|never\s+okay|disheartening|hurtful|bigot\w*)\b[^.?!]{0,60}\b(?:calling|saying|telling|writing|to\s+say|to\s+call|to\s+hear|to\s+still\s+see|hear|say)\b`,
    String.raw`\b(?:don'?t|do\s+not|stop|never|why\s+would\s+you|how\s+(?:can|could|dare)\s+you)\b[^.?!]{0,25}\b(?:call(?:ing)?|say(?:ing)?|tell(?:ing)?)\b`,
    String.raw`\b(?:people|they|some)\s+(?:saying|calling|call(?:ing)?\s+for)\b`,
    String.raw`\bcall(?:ing)?\s+out\b`,
    String.raw`\bsays?\s+a\s+lot\s+about\b|\bshows?\s+(?:how|what)\s+\w+\s+you\b`,
  ].join('|'),
  'i',
);

/** The hit sits right after a negation in the same clause ("not at all X", "never X", "the opposite of X"): the person is saying it is NOT so. */
export function negatedBefore(text: string, h: Hit): boolean {
  const before = text.slice(0, h.start).split(/[.,;:!?]/).pop() ?? '';
  return /\b(?:not|never|no|isn'?t|aren'?t|don'?t|doesn'?t|won'?t|opposite\s+of|nothing)\b(?:\s+[\w']+){0,4}\s*$/i.test(before);
}

/** Reported, denounced or quoted speech: nothing here acts on the words themselves. */
export const isFramed = (text: string): boolean => REPORTING.test(text) || DENOUNCING.test(text);

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
  /** Also offer a card for the judgment tiers (blame of another person; harsh judgment of oneself), which are severity 1 and otherwise never offer one. Off unless COACH_JUDGMENT_CARDS is on. */
  judgmentOffers?: boolean;
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
  const real = i.hits.filter((h) => (h.severity >= min || (i.judgmentOffers === true && /^(self-)?judgment$/.test(h.category))) && !/llm-tell|needs-model/.test(h.contextNote) && !negatedBefore(i.text, h));
  if (!real.length) return null;
  if (isFramed(i.text)) return null; // someone telling us what was said to them, or denouncing it
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
const REMOVAL = /\b(?:wipe\s+(?:them|\w+)\s+(?:all\s+)?out|wipe\s+(?:them|\w+)\s+off\s+the\s+map|(?:send|ship)\s+(?:them|\w+)\s+all\s+(?:back|home|away)|drive\s+(?:them|\w+)\s+(?:all\s+)?(?:out|into\s+the\s+sea)|into\s+the\s+sea|clear\s+(?:them|\w+)\s+(?:all\s+)?out|ethnically\s+cleanse|(?:should|must|need\s+to|ought\s+to)\s+(?:all\s+)?be\s+sent\s+back\s+to\s+(?:africa|where\s+they\s+came\s+from|their\s+(?:own\s+)?countr(?:y|ies)|the\s+jungle)|get\s+rid\s+of\s+(?:all|every)\s+(?:the\s+)?\w+)\b/i;
const COLONIZER = /\b(?:settlers?|colonizers?|colonists?|occupiers?)\b[^.?!]{0,40}\b(?:are|is)\s+(?:all\s+)?(?:vermin|animals?|cockroaches|rats|parasites|a\s+cancer|subhuman|savages?|scum)\b|\b(?:kill|get\s+rid\s+of|wipe\s+out|remove)\s+(?:all\s+)?(?:the\s+)?(?:settlers|colonizers|colonists|occupiers)\b/i;


// ---- calls for violence against a group (the violence-and-removal pass, 2026-11-12): a plain call to kill, harm or destroy "them", "those people" or "all" or "every" of a group, in the forms
// people actually write ("those people should all be killed", "someone should shoot every one of them", "kill them all", "death to all of those people", "I'll slaughter any one of them").
// One person ("kill him", "my brother will kill me") is never matched: that is anger, and the harm checks have their own rules for intent. Quotes, reports, denouncing and negation are left out by the
// frame rules in offerFor. Not a safety system: it misses and it fires wrongly, and the scenes (src/lib/detectScenes.ts) and the outside sets measure both.
const VIOLENT = String.raw`(?:kill(?:ed)?|murder(?:ed)?|slaughter(?:ed)?|shoot|shot|execut(?:e|ed)|hang(?:ed)?|lynch(?:ed)?|exterminat(?:e|ed)|eradicat(?:e|ed)|annihilat(?:e|ed)|gas(?:sed)?|massacr(?:e|ed)|rape(?:d)?|stab(?:bed)?|behead(?:ed)?|bomb(?:ed)?|burn(?:ed|t)?|poison(?:ed)?)`;
// Nouns that are plainly not people: "kill all the weeds" is gardening, not a call. A short list, not a promise: other objects and animals can still slip through, and the scenes measure it.
const NOT_PEOPLE = String.raw`(?!(?:the\s+|those\s+|these\s+)?(?:weeds?|balloons?|pictures?|photos?|posters?|books?|boxes|bugs?|ants?|flies|fly|mosquit\w+|insects?|spiders?|pests?|germs?|bacteria|viruses|virus|cells?|plants?|trees?|files?|emails?|processes|tasks?|items?|cookies|tabs?|windows|zombies|monsters?|rats?|mice|roaches|cockroaches|wasps?|slugs?|snails?|moths?|lice|fleas?|ticks?)\b)`;
const GROUPREF = String.raw`(?:(?:all|every|each)\s+(?:one\s+)?(?:of\s+)?(?:them|those|these|${NOT_PEOPLE}the\s+\w+)|them\s+all|(?:those|these)\s+${NOT_PEOPLE}(?:\w+\s+)?\w+s?|any\s+(?:one\s+)?of\s+them|every\s+(?:single\s+)?(?:one|last\s+one)|all\s+${NOT_PEOPLE}\w+s)`;
const VIOLENCE_CALL = new RegExp(
  [
    String.raw`\b(?:those|these)\s+\w+(?:\s+\w+)?\s+(?:should|must|ought\s+to|need\s+to|deserve\s+to|have\s+to)\s+(?:all\s+)?(?:be\s+|get\s+)?(?:${VIOLENT}|die)\b`,
    String.raw`\bthey\s+(?:should|must|ought\s+to|deserve\s+to)\s+all\s+(?:be\s+|get\s+)?(?:${VIOLENT}|die)\b|\bthey\s+all\s+(?:should|must|ought\s+to|deserve\s+to)\s+(?:be\s+|get\s+)?(?:${VIOLENT}|die)\b`,
    String.raw`\b(?:someone|somebody|we|you|people|let'?s|i(?:'d|\s+would)?\s+like\s+to|i(?:'ll|\s+will|\s+am\s+going\s+to|'m\s+going\s+to|\s+want\s+to))\s+(?:(?:should|ought\s+to|need\s+to|have\s+to|must)\s+)?(?:just\s+|all\s+)?${VIOLENT}\s+${GROUPREF}`,
    String.raw`(?:^|[.!?]\s+)${VIOLENT}\s+${GROUPREF}`,
    String.raw`\bdeath\s+to\s+(?:all|those|these)\b`,
    // wishes (owner's direction, 2026-11-12: lean toward instruction and escalation): a wish that a group suffers, burns, rots or dies
    String.raw`\bi\s+(?:hope|wish|pray)\s+(?:that\s+)?(?:they|those\s+\w+(?:\s+\w+)?|these\s+\w+(?:\s+\w+)?|all\s+of\s+them|every\s+one\s+of\s+them)\s+(?:all\s+)?(?:would\s+|will\s+|could\s+)?(?:all\s+)?(?:die|burn|rot|suffer|get\s+(?:killed|shot|raped)|be\s+(?:killed|shot|raped))\b`,
    String.raw`\bthey\s+(?:should|can|may)\s+(?:all\s+)?(?:rot|burn|suffer|die)\b`,
  ].join('|'),
  'i',
);


// ---- dehumanizing comparisons and eugenics talk (2026-11-14, after a spot check found "Muslims are a cancer", "subhuman" and "useless eaters" matching nothing). Target-neutral: any group, any place.
// Three plain forms: a group called a disease, a pest or an animal ("those people are vermin"); a stock dehumanizing or eugenic phrase ("subhuman", "inferior race", "useless eaters", "unworthy of life");
// and a group said to be a burden, or to be sterilized or put down. They are NOT matched when the person is describing the words ("the Nazis called them untermenschen", "my teacher said..."), when
// they are talking about their own family ("my kids are animals at dinner"), or inside the frame rules (quotes, denouncing, negation). Same standing as the other patterns: a card, and the coach's own position.
const ANIMALS = String.raw`(?!(?:dogs?|cats?|animals?|pets?|horses?|cows?|pigs?|rats?|mice|bugs?|weeds?|trees?|plants?|insects?|ants?|flies|spiders?|cockroaches|roaches|pigeons?|seagulls?|wasps?|mosquito(?:es|s)?|rabbits?|birds?|files|emails|vermin|parasites?)\b)`;
const GROUP_SUBJECT = String.raw`(?:they|those\s+${ANIMALS}\w+(?:\s+\w+)?|these\s+${ANIMALS}\w+(?:\s+\w+)?|(?:\w+\s+)?(?:people|folks)|${ANIMALS}\w+s)`;
const DEHUM_COMPARISON = new RegExp(String.raw`\b${GROUP_SUBJECT}\s+(?:are|were)\s+(?:all\s+|just\s+|nothing\s+but\s+|really\s+)?(?:a\s+|an\s+|the\s+)?(?:cancer|plague|disease|virus|infestation|vermin|parasites?|cockroaches|roaches|rats|animals|savages|sub-?human|human\s+(?:garbage|waste|scum|filth|trash)|a\s+blight|not\s+(?:really\s+)?(?:human|people)|less\s+than\s+human)\b`, 'i');
const DEHUM_PHRASE = /\b(?:sub-?humans?|untermensch(?:en)?|inferior\s+(?:race|people|breed|stock)|master\s+race|race[- ]traitors?|useless\s+eaters?|(?:lives?|life)\s+(?:is\s+|are\s+)?unworthy\s+of\s+(?:life|living)|lebensunwertes\s+leben|genetically\s+inferior|breed(?:ing)?\s+like\s+(?:rats|rabbits|cockroaches|animals))\b/i;
const BURDEN = /\b(?:the\s+)?(?:disabled|handicapped|mentally\s+(?:ill|disabled|handicapped)|autistic\s+people|cripples|retards|the\s+(?:old|elderly|sick|weak))\s+(?:are|is)\s+(?:just\s+|all\s+)?(?:a\s+|an\s+)?(?:burden|drain|waste|useless|worthless|parasites?|leeches|dead\s+weight)\b/i;
const CULL = new RegExp(String.raw`\b${GROUP_SUBJECT}\s+(?:should|must|ought\s+to|need\s+to)\s+(?:all\s+)?be\s+(?:sterili[sz]ed|euthani[sz]ed|put\s+down|culled|eliminated|exterminated|eradicated|wiped\s+out)\b`, 'i');
// the person is describing or discussing such words, or talking about their own people: not an expression of the view
const MENTION = /\b(?:nazis?|propaganda|called|calling|labell?ed|described|dehumani[sz]\w*|rhetoric|slur|slogan|ideology|historically|history|studying|essay|word|term|phrase|quote[sd]?|saying|says|said|accused|argued|claimed|never|should\s+not|shouldn'?t|won'?t|against|oppose[sd]?|treats?|treated|treating)\b/i;
const OWN_PEOPLE = /\b(?:my|our|your|his|her)\s+(?:\w+\s+)?(?:\w+s|people|folks)\s+(?:are|were)\b/i;
export function dehumanizingPhrase(text: string): RegExpExecArray | null {
  const t = text.normalize('NFKC');
  for (const re of [DEHUM_COMPARISON, DEHUM_PHRASE, BURDEN, CULL]) {
    const m = re.exec(t);
    if (!m) continue;
    const sentence = t.slice(Math.max(0, t.lastIndexOf('.', m.index) + 1), m.index + m[0].length + 40);
    if (MENTION.test(sentence)) continue;
    if (re === DEHUM_COMPARISON && OWN_PEOPLE.test(t.slice(Math.max(0, m.index - 24), m.index + m[0].length))) continue;
    return m;
  }
  return null;
}

/** Hits for the history cards, in the shape the offer logic reads. Empty when nothing plain is found. */
export function historyHits(text: string): Hit[] {
  const t = text.normalize('NFKC');
  const hit = (category: string, m: RegExpExecArray): Hit => ({ term: '', category, target: 'group', severity: 2, start: m.index, end: m.index + m[0].length, contextNote: '', confidence: 'phrase' });
  const out: Hit[] = [];
  let m: RegExpExecArray | null;
  if ((m = COLONIZER.exec(t))) out.push(hit('colonizer-dehumanization', m));
  if ((m = REMOVAL.exec(t))) out.push(hit('mass-violence-removal', m));
  if ((m = DENIAL.exec(t))) out.push(hit('mass-violence-denial', m));
  if ((m = VIOLENCE_CALL.exec(t))) out.push(hit('mass-violence-call', m));
  if ((m = dehumanizingPhrase(t))) out.push(hit('dehumanizing-phrase', m));
  return out;
}
