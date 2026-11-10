// Hurting oneself on purpose, as a ladder rather than a switch. The owner's decision (2026-11-08): a person talking about their experience of
// self-harm is allowed to, with extra pushes toward a person, because they may not feel safe talking to anyone else; if it recurs or escalates,
// the conversation ends with the crisis resources (the closing note says plainly that it is not a punishment); anything suicidal, and a
// medical emergency, stop at once. Someone talking about another person who self-harms is supported and never ends.
//
// The level is worked out from the person's own recent messages (the last RECENT, the server sees the whole conversation on every request),
// so nothing is stored and a mention long ago is not held against them. This is phrase matching, not understanding: it will sometimes be
// wrong, and the early rungs are gentle enough that a mistake costs little. Suicidal content is not handled here: it returns level 0 and
// the main check (src/lib/safetyFlags.ts) stops it.

// Suicidal intent, a plan, a method or means. Not a mention for this ladder (the main check decides), even if self-injury is also named.
const SUICIDAL =
  /\b(?:kill(?:ing)? myself|end(?:ing)? my (?:own )?life|tak(?:e|ing) my (?:own )?life|suicid\w*|want(?:ed)? to die|wish i (?:was|were) dead|better off dead|better off without me|overdos\w*|(?:hang|shoot|drown|poison|suffocate|stab)(?:ing)? myself|jump(?:ing)? off|goodbye (?:note|letter)|suicide note|(?:the |my )?(?:pills|gun|rope)\b[^.]{0,20}(?:ready|here|next to me|with me)|(?:took|taken|swallowed|taking) (?:too many|a bunch of|all (?:of )?(?:my|the)) (?:pills|meds|medication)|(?:tried|attempted) to (?:kill|end|take|overdose|hurt|cut))\b/i;

// Hurting oneself on purpose: an act (past or present) or an urge.
export const SELF_INJURY: RegExp[] = [
  /\b(?:i(?:'ve| have)? (?:been )?|i(?:'m| am) )?(?:cutting|burning|scratching|carving|hitting|punching|biting|starving) myself\b(?! (?:on|when i|while i) (?:the|a|my) (?:stove|door|oven|iron|knife|shaving|razor))/i,
  /\b(?:hurt|hurting|harm|harming|cut|burn|hit|punch)(?:ing)? myself (?:on purpose|deliberately|to (?:feel|cope|punish|release|stop)|because i|again|when i)\b/i,
  /\bi (?:cut|burn|scratch|hit|punch|bite|starve|hurt|harm) myself (?:when|until|because|to|so|if)\b/i,
  /\b(?:i )?(?:self[- ]?harm(?:ing|ed)?|self[- ]?injur\w+)\b/i,
  /\b(?:i )?(?:want|wanna|need|feel (?:like|the urge)|have (?:the )?urges?|(?:i'm|i am|i've been|i have been|am) (?:tempted|thinking (?:about|of))|keep (?:wanting|thinking about)) (?:to )?(?:hurt|harm|cut|burn|punish)(?:ing)? myself\b/i,
];
// "I cut myself shaving", "I burned myself on the stove": accidents, not self-injury.
const ACCIDENT = /\b(?:cut|burn(?:ed|t)?|hit|hurt) myself (?:again )?(?:shaving|cooking|on the (?:stove|door|oven|iron|knife|counter|table|corner)|with the (?:knife|iron|hot)|at the gym|playing|while (?:cooking|shaving|cutting|playing|running|lifting)|chopping|moving|lifting)\b/i;

/** Whether the message is about hurting oneself on purpose, with nothing suicidal in it. */
export function isSelfInjury(text: string): boolean {
  const t = text.replace(/[‘’]/g, "'");
  if (SUICIDAL.test(t)) return false;
  if (ACCIDENT.test(t) && !SELF_INJURY.slice(2).some((r) => r.test(t)) && !/on purpose|deliberately/i.test(t)) return false;
  return SELF_INJURY.some((r) => r.test(t));
}

export type Mention = 'other' | 'background' | 'present' | 'urgent';

// Someone else self-harms (a friend, a child): support for the person helping; never ends the conversation.
const OTHER = /\b(?:my|a|our) (?:friend|daughter|son|sister|brother|partner|student|child|kid|teen|mother|mom|dad|father|boyfriend|girlfriend|wife|husband|roommate|coworker|cousin|niece|nephew)\b[^.]{0,40}\b(?:cuts?|cutting|self[- ]?harm\w*|self[- ]?injur\w*|hurts?|hurting|burns?|burning) (?:herself|himself|themselves|themself)\b|\b(?:my|a) [a-z]+ (?:is|has been|keeps) self[- ]?harm\w*\b/i;
// A medical emergency from self-injury: not a punishment, an emergency. Counts only with a sign that it is about self-injury (so "my nose
// won't stop bleeding" or a kitchen cut is not an emergency stop).
const URGENT = /\b(?:cut (?:too )?deep|(?:won'?t|will not|doesn'?t|does not|can'?t) stop bleeding|bleeding (?:a lot|badly|heavily|and (?:won'?t|can'?t))|lost (?:a lot of )?blood|need (?:stitches|an ambulance|the hospital|medical (?:help|care))|(?:might|will|going to) bleed out|infected (?:cut|wound)s?)\b/i;
const SELF_CONTEXT = /\bmyself\b|\bon purpose\b|\bcut (?:too )?deep\b|\bbleed out\b/i;
// Now: an act today or lately, an urge, "again", "can't stop".
const PRESENT = /\b(?:again|tonight|today|right now|last night|this (?:week|morning|afternoon|evening)|yesterday|just (?:now|did)|can'?t stop|keep (?:doing|cutting|hurting|burning|wanting)|urges?|(?:want(?:ed)? to|wanna|need to|feel like|tempted to|about to|going to|thinking (?:about|of)) (?:hurt|harm|cut|burn|punish|hit))\b/i;
// A follow-up that only makes sense after an earlier mention (so it counts only when there was one): "I did it again".
const FOLLOWUP = /\b(?:i )?(?:did it|relapsed|slipped|couldn'?t help it|it happened)(?: again| last night| today| tonight| this (?:week|morning))|\b(?:cut|hurt|burned|burnt) (?:again|more|deeper)\b|\bi(?:'m| am) (?:doing it|still doing it) again\b/i;
// A general account: the past, recovery, a history, or wanting to talk about it.
const BACKGROUND = /\b(?:used to|in the past|years ago|as a (?:teen|teenager|kid|child)|when i was|history of|struggled with|struggle with|recover\w*|in recovery|got better|stopped|quit|clean (?:for|since)|want to talk about|talk about my|my experience (?:with|of)|why (?:do|did) i)\b/i;

/** What kind of self-injury mention the message is, or null. Accidents and suicidal messages are not mentions here. */
export function classifyMention(text: string, earlierMention = false): Mention | null {
  const t = text.replace(/[‘’]/g, "'");
  if (SUICIDAL.test(t)) return null;
  if (URGENT.test(t) && (SELF_CONTEXT.test(t) || earlierMention)) return 'urgent';
  if (earlierMention && FOLLOWUP.test(t)) return 'present';
  if (OTHER.test(t) && !/\bmyself\b/i.test(t)) return 'other';
  if (!isSelfInjury(t)) return null;
  if (PRESENT.test(t)) return 'present';
  return BACKGROUND.test(t) ? 'background' : 'present'; // unless it is plainly about the past, treat an act as present
}

export type Rung =
  | { level: 0 }
  | { level: 1; why: 'background' | 'other' } // general or about someone else: allowed, with the extra push toward a person
  | { level: 2; why: 'present' } // a present act or urge, the first time: allowed, with the firm message
  | { level: 3; why: 'recurs' | 'escalates' } // ends, with the crisis resources (the note says it is not a punishment)
  | { level: 'emergency' }; // a medical emergency: stops at once

/** How many of the person's last messages are looked at (the latest included is not counted among these). */
export const RECENT = 4;

/**
 * The rung for the person's latest message, given the person's messages in order (the latest last).
 *  - a medical emergency: stop at once
 *  - recurs: a present-tense mention, and another present-tense mention among the earlier recent messages
 *  - escalates: a present-tense mention after an earlier general one (the account has moved from "then" to "now")
 *  - otherwise allowed, with a push (firmer for a present act or urge)
 * A mention about someone else never recurs or escalates. Suicidal content returns level 0: the main check stops it.
 */
export function rungFor(userMessages: string[]): Rung {
  const latest = userMessages[userMessages.length - 1] ?? '';
  const recent = userMessages.slice(Math.max(0, userMessages.length - RECENT), -1);
  const now = classifyMention(latest, recent.some((m) => !!classifyMention(m)));
  if (now === null) return { level: 0 };
  if (now === 'urgent') return { level: 'emergency' };
  if (now === 'other') return { level: 1, why: 'other' };
  const earlier = recent.map((m) => classifyMention(m));
  if (now === 'present' && earlier.includes('present')) return { level: 3, why: 'recurs' };
  if (now === 'present' && earlier.includes('background')) return { level: 3, why: 'escalates' };
  return now === 'present' ? { level: 2, why: 'present' } : { level: 1, why: 'background' };
}
