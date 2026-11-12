// Safety flags for the /coach demo. Used by the page (so a stop-tier message never
// leaves the device) and by the Netlify function (the authoritative check).
//
// This is simple phrase matching, not understanding. It misses euphemisms, typos,
// and other languages, and it sometimes fires on harmless text. Nothing that uses
// it may claim it detects every crisis. Two tiers:
//   stop    clear statements of intent or danger: the message is NOT sent to the AI
//           and the conversation ends with resources.
//   soften  ambiguous or indirect distress: the message is sent, the AI is asked to
//           respond briefly and with care, and the page shows the same resources.
// Hurting oneself on purpose is the exception to "clear statements stop": it is a ladder (src/lib/selfInjury.ts) worked out from the
// person's recent messages, so it needs the conversation, not one message: use checkConversation. detectFlag(text) checks one message alone.

import { ABUSE_CANDIDATES, CANDIDATES } from './safetyPhrases.ts';
import { classifyMention, RECENT, rungFor, SELF_INJURY } from './selfInjury.ts';

export type FlagCategory = 'self-harm' | 'self-injury' | 'harm-others' | 'abuse' | 'distress';
export type FlagTier = 'stop' | 'soften';

export interface SafetyFlag {
  category: FlagCategory;
  tier: FlagTier;
  label: string;
  /**
   * What kind, within the category, where the page, the notice, the resources and the sentence the site adds differ by it.
   * abuse: 'partner-or-family' | 'child-or-dependent' | 'sexual' | 'control-or-fear'.
   * self-injury: 'background' | 'other' | 'present' (soften); 'ends' | 'emergency' (stop).
   */
  kind?: string;
}

export const CATEGORY_LABELS: Record<FlagCategory, string> = {
  'self-harm': 'suicide or self-harm',
  'self-injury': 'hurting yourself on purpose',
  'harm-others': 'violence or harm to others',
  abuse: 'abuse or immediate danger',
  distress: 'serious distress',
};

interface Rule {
  category: FlagCategory;
  tier: FlagTier;
  pattern: RegExp;
}

// Words after "killing myself" / "die" that make it an everyday figure of speech.
const FIGURATIVE_AFTER_KILL =
  '(?:at|with|over|trying|for|to (?:get|finish|keep|make|do|work|meet|stay|please|be|pay))';

// What may follow "go on" for it to be about carrying on living: the end of the sentence, or "anymore", "like this", "with this" and so on.
const GO_ON_ENDS = '(?=\\s*(?:[.!?,;]|$|anymore|any more|any longer|much longer|like (?:this|that)|this way|living|without|alone|with (?:this|it|life|living|my life)))';

const RULES: Rule[] = [
  // ── stop: suicide or self-harm ──────────────────────────────────────────
  { category: 'self-harm', tier: 'stop', pattern: new RegExp(`\\bkill(?:ing)? myself\\b(?! ${FIGURATIVE_AFTER_KILL})`, 'i') },
  { category: 'self-harm', tier: 'stop', pattern: /\bend(?:ing)? my (?:own )?life\b|\btak(?:e|ing) my (?:own )?life\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:want(?:ed)?|wish(?:ed)?|plan(?:ning)?|going|gonna|decided|ready|thinking (?:of|about)|considering)(?: to)? (?:die|be dead|not exist|not wake up|end it(?: all)?)\b(?! (?:of|from|laughing|inside))/i },
  // Hurting oneself on purpose ("cutting myself", "self-harming", "thinking about hurting myself") is not here: it is the ladder in
  // src/lib/selfInjury.ts, which allows it with extra pushes toward a person and ends only if it recurs or escalates.
  { category: 'self-harm', tier: 'stop', pattern: /\bno reason to (?:live|go on|keep going)\b|\bbetter off (?:dead|without me)\b|\bwish i (?:was|were) dead\b|\bdon'?t want to (?:live|be alive)\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:i'?m|i am|i feel|feeling|been feeling|i'?ve been|having|have) (?:\w+ )?suicidal\b|\b(?:thoughts? of|thinking (?:of|about)) suicide\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:going to|gonna|thinking (?:of|about)|want to) (?:overdose|take (?:all|a bunch of) (?:my |the )?(?:pills|meds))\b/i },

  // ── stop: violence toward others ────────────────────────────────────────
  { category: 'harm-others', tier: 'stop', pattern: /\b(?:going to|gonna|plan(?:ning)? to|about to|decided to|thinking (?:of|about)) (?:kill|murder|shoot|stab|strangle|hurt|harm|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone|people)\b/i },

  // First-person intent against a group of PEOPLE ("I'll kill any of them I meet", "I am going to hurt all of them", 2026-11-12, owner's decision): a stop, the same as intent against one person. Only forms that
  // clearly name people ("them", "all of them", "those people", "everyone") so an object ("all the weeds") is never a stop; "with kindness" is the idiom.
  { category: 'harm-others', tier: 'stop', pattern: /\bi(?:'ll|\s+will|'m\s+going\s+to|\s+am\s+going\s+to|\s+plan\s+to|\s+intend\s+to|'m\s+gonna|\s+am\s+gonna)\s+(?:just\s+|really\s+)?(?:kill|murder|slaughter|shoot|stab|strangle|hurt|harm|attack|beat\s+up|burn|bomb|poison|rape)\s+(?:all\s+of\s+them|every\s+(?:single\s+)?one\s+of\s+(?:them|those\s+people|these\s+people)|any\s+(?:one\s+)?of\s+(?:them|those\s+people|these\s+people)|each\s+of\s+them|them\s+all|(?:all\s+)?(?:of\s+)?(?:those|these)\s+people|every\s+last\s+one|everyone|everybody)\b(?!\s+with\s+kindness)/i },

  // ── stop: abuse or immediate danger ─────────────────────────────────────
  { category: 'abuse', tier: 'stop', pattern: /\b(?:he|she|they|my \w+)(?:'s| is| are|'re)? (?:hitting|beating|choking|strangling|raping|molesting|abusing|stalking) me\b(?! (?:at|to|in|by|back)\b)(?!(?<=hitting me) up\b)/i },
  { category: 'abuse', tier: 'stop', pattern: /\bthreatening to (?:kill|hurt) me\b|\b(?:afraid|scared|terrified) for my (?:life|safety)\b|\b(?:not safe|unsafe) (?:at home|here|right now|going home)\b|\bbeing (?:abused|assaulted|stalked)\b/i },

  // ── soften: indirect or ambiguous ───────────────────────────────────────
  { category: 'self-harm', tier: 'soften', pattern: new RegExp(`\\bkill(?:ing)? myself ${FIGURATIVE_AFTER_KILL}`, 'i') },
  { category: 'self-harm', tier: 'soften', pattern: /\bsuicid(?:e|al)\b|\bself[- ]?harm\b|\boverdos(?:e|ing)\b|\b(?:hurting|harming|harm) myself\b/i },
  { category: 'self-harm', tier: 'soften', pattern: /\bwish i could disappear\b|\bwant to disappear\b|\bdon'?t want to be here\b/i },
  { category: 'harm-others', tier: 'soften', pattern: /\b(?:want(?:ed)? to|wanna|could|feel like) (?:kill|murder|shoot|stab|strangle|hurt|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone)\b/i },
  { category: 'harm-others', tier: 'soften', pattern: /\bi\s+(?:want|wanna|would\s+love|'d\s+love|'d\s+like|would\s+like)\s+to\s+(?:just\s+)?(?:kill|murder|slaughter|shoot|stab|strangle|hurt|attack|beat\s+up|burn|bomb)\s+(?:all\s+of\s+them|every\s+(?:single\s+)?one\s+of\s+them|any\s+(?:one\s+)?of\s+them|them\s+all|(?:all\s+)?(?:of\s+)?(?:those|these)\s+people)\b/i },
  { category: 'abuse', tier: 'soften', pattern: /\b(?:hit(?! me up\b)|beat(?! me (?:at|to|in|by) )|choked|raped|molested|abused|assaulted) me\b/i },
  { category: 'distress', tier: 'soften', pattern: /\b(?:i'?m|i am|i feel|feel(?:ing)?|it'?s|everything is) (?:so |completely |totally |utterly )?(?:hopeless(?! (?:at|with)\b)|worthless)\b/i },
  { category: 'distress', tier: 'soften', pattern: /\bno way out\b|\bgive up on (?:everything|life)\b|\bnothing matters\b/i },
  // "can't" and "cannot" and "can not" alike. "Go on" counts only at the end of a thought or before "anymore", "like this", "with this"
  // and the like, so "I cannot go on holiday" and "I can't go on a date" are left alone.
  { category: 'distress', tier: 'soften', pattern: new RegExp(`\\bcan(?:'?t|not| not) (?:go on${GO_ON_ENDS}|take (?:it|this) anymore|do this anymore)\\b`, 'i') },
];

const flagOf = (category: FlagCategory, tier: FlagTier, kind?: string): SafetyFlag => ({ category, tier, label: CATEGORY_LABELS[category], ...(kind ? { kind } : {}) });

/** Why a message was flagged: the words that matched a phrase list, or the self-injury ladder's rung. A process note, not a verdict. */
export interface FlagWhy {
  source: 'phrase' | 'ladder';
  /** The words in the person's own message that matched (cut short). */
  matched?: string;
  /** For the ladder: its rung, in words ("a present act or urge", "recurs", "escalates", "a general account", "about someone else", "a medical emergency"). */
  rung?: string;
  /** For the ladder: the numbers (1 = first) of the person's earlier messages that count toward it. */
  basedOn?: number[];
}
export interface FlagExplained {
  flag: SafetyFlag;
  why: FlagWhy;
}
const cut = (x: string | undefined): string | undefined => (x === undefined ? undefined : x.length > 120 ? x.slice(0, 117) + '...' : x);

/** The most serious flag in one message, from the phrase lists alone (not the self-injury ladder), and the words that matched. Stop-tier rules win over soften-tier. */
function detectSingleWhy(text: string): FlagExplained | null {
  const t = text.replace(/[‘’]/g, "'");
  for (const tier of ['stop', 'soften'] as FlagTier[]) {
    for (const r of RULES) {
      const m = r.tier === tier ? r.pattern.exec(t) : null;
      if (!m) continue;
      // The older abuse rules carry no kind; borrow it from the kind rules (same tier) so the right resources are shown.
      const kind = r.category === 'abuse' ? ABUSE_CANDIDATES.find((k) => k.tier === tier && k.pattern.test(t))?.kind : undefined;
      return { flag: flagOf(r.category, tier, kind), why: { source: 'phrase', matched: cut(m[0]) } };
    }
    for (const r of CANDIDATES) {
      const m = r.tier === tier ? r.pattern.exec(t) : null;
      if (m) return { flag: flagOf('self-harm', tier), why: { source: 'phrase', matched: cut(m[0]) } };
    }
    for (const r of ABUSE_CANDIDATES) {
      const m = r.tier === tier ? r.pattern.exec(t) : null;
      if (m) return { flag: flagOf('abuse', tier, r.kind), why: { source: 'phrase', matched: cut(m[0]) } };
    }
  }
  return null;
}

/**
 * The flag for the person's latest message, given everything they have written in the conversation (oldest first, the latest last), or null.
 * A stop in the message itself always wins. Then the self-injury ladder: a medical emergency or a recurrence stops (kinds "emergency" and
 * "ends"); a general account, a present act or urge, or a mention about someone else is a soften flag (kinds "background", "present", "other").
 */
export function checkConversation(userMessages: string[]): SafetyFlag | null {
  return explainConversation(userMessages)?.flag ?? null;
}

/** The same decision as checkConversation, with why: the words that matched, or the ladder's rung. */
export function explainConversation(userMessages: string[]): FlagExplained | null {
  const latest = userMessages[userMessages.length - 1] ?? '';
  const single = detectSingleWhy(latest);
  if (single?.flag.tier === 'stop') return single;
  const norm = userMessages.map((m) => m.replace(/[‘’]/g, "'"));
  const rung = rungFor(norm);
  if (rung.level === 0) return single;
  const t = norm[norm.length - 1] ?? '';
  const matched = cut(SELF_INJURY.map((r) => r.exec(t)).find(Boolean)?.[0]);
  const basedOn = norm
    .slice(Math.max(0, norm.length - RECENT), -1)
    .map((m, i) => (classifyMention(m) ? Math.max(0, norm.length - RECENT) + i + 1 : 0))
    .filter(Boolean);
  const ladder = (flag: SafetyFlag, rungText: string, withBasis = false): FlagExplained => ({
    flag,
    why: { source: 'ladder', ...(matched ? { matched } : {}), rung: rungText, ...(withBasis && basedOn.length ? { basedOn } : {}) },
  });
  if (rung.level === 'emergency') return ladder(flagOf('self-injury', 'stop', 'emergency'), 'a medical emergency from hurting yourself');
  if (rung.level === 3) return ladder(flagOf('self-injury', 'stop', 'ends'), rung.why === 'recurs' ? 'recurs' : 'escalates', true);
  if (rung.level === 2) return ladder(flagOf('self-injury', 'soften', 'present'), 'a present act or urge');
  return ladder(flagOf('self-injury', 'soften', rung.why), rung.why === 'other' ? 'about someone else' : 'a general account');
}

/** The flag for one message on its own (a message with no history). Where the conversation is available, use checkConversation. */
export function detectFlag(text: string): SafetyFlag | null {
  return checkConversation([text]);
}

export interface Resource {
  name: string;
  detail: string;
  href?: string;
}

/** Resources already listed elsewhere on the site (Emergency Exit, Terms), and the specific lines for abuse. */
export function resourcesFor(category: FlagCategory, kind?: string): Resource[] {
  const list: Resource[] = [
    { name: '988 Suicide & Crisis Lifeline (US)', detail: 'Call or text 988, any time', href: 'tel:988' },
    { name: 'Crisis Text Line (US)', detail: 'Text HOME to 741741', href: 'sms:741741' },
    { name: '9-8-8 Suicide Crisis Helpline (Canada)', detail: 'Call or text 9-8-8, any time, in English or French', href: 'tel:988' },
    { name: 'Kids Help Phone (Canada)', detail: 'Call 1-800-668-6868 or text CONNECT to 686868', href: 'tel:18006686868' },
  ];
  if (category === 'abuse') {
    list.push({ name: 'National Domestic Violence Hotline (US)', detail: 'Call 1-800-799-7233, or text START to 88788', href: 'tel:18007997233' });
    if (kind === 'child-or-dependent') {
      list.push({ name: 'Childhelp National Child Abuse Hotline (US)', detail: 'Call or text 1-800-422-4453 (text GO), any time', href: 'tel:18004224453' });
    }
    if (kind === 'sexual') {
      list.push({ name: 'RAINN National Sexual Assault Hotline (US)', detail: 'Call 1-800-656-4673, any time', href: 'tel:18006564673' });
    }
  }
  list.push(
    { name: 'Immediate danger', detail: 'Call your local emergency number (911 in the US and Canada)', href: 'tel:911' },
    { name: 'Outside the US and Canada', detail: 'findahelpline.com or iasp.info/resources/Crisis_Centres' }
  );
  return list;
}

// What the notice says for hurting oneself on purpose (drafts approved for wiring 2026-11-08; the owner edits the wording).
const SELF_INJURY_NOTICE: Record<string, string> = {
  background:
    'This message may touch on hurting yourself on purpose. Thank you for trusting this with me. It deserves a person. Below are some resources for speaking with a live person.',
  other:
    'If you are worried about someone, you do not have to handle it alone. You can call or text 988 (US and Canada) to talk through how to support them, and the numbers below are free.',
  present:
    'Please make sure you are physically and emotionally safe right now. If you have hurt yourself and need medical care, call your local emergency number or go to urgent care. This is a very heavy topic, and it deserves a person. Below are some resources for speaking with a live person.',
  ends:
    "I'm going to end our conversation here. This isn't a punishment, and you haven't done anything wrong: I'm an AI, and what you're describing deserves more than I can give. Please make sure you are physically and emotionally safe right now. If you have hurt yourself and need care, call your local emergency number. And please reach a person today: text HOME to 741741 (US), or call or text 988 (US and Canada), or tell someone you trust. The numbers below are free, and nobody around you has to hear a text. The breathing tool is here if you want a moment to settle first.",
  emergency:
    'It sounds like you may need medical care right now. Please call your local emergency number (911 in the US and Canada) or go to the nearest emergency room, and if you can, ask someone near you to stay with you.',
};

export function noticeIntro(flag: SafetyFlag): string {
  if (flag.category === 'self-injury' && flag.kind && SELF_INJURY_NOTICE[flag.kind]) return SELF_INJURY_NOTICE[flag.kind];
  const subject =
    flag.tier === 'stop'
      ? `This message appears to contain ${flag.label} content.`
      : `This message may touch on ${flag.label}.`;
  return (
    `${subject} If you are experiencing a crisis, please reach out to a qualified human professional. ` +
    'AI systems are not qualified to assist in crisis. Below are some resources for speaking with a live person.'
  );
}
