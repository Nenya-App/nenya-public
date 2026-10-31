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

export type FlagCategory = 'self-harm' | 'harm-others' | 'abuse' | 'distress';
export type FlagTier = 'stop' | 'soften';

export interface SafetyFlag {
  category: FlagCategory;
  tier: FlagTier;
  label: string;
}

export const CATEGORY_LABELS: Record<FlagCategory, string> = {
  'self-harm': 'suicide or self-harm',
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

const IDEATION =
  "(?:thinking (?:of|about)|want(?:ed)? to|going to|gonna|might|could|plan(?:ning)? to|urge to|feel(?:ing)? like|about to|afraid i(?:'ll| will| might)|scared i(?:'ll| will| might))";

const RULES: Rule[] = [
  // ── stop: suicide or self-harm ──────────────────────────────────────────
  { category: 'self-harm', tier: 'stop', pattern: new RegExp(`\\bkill(?:ing)? myself\\b(?! ${FIGURATIVE_AFTER_KILL})`, 'i') },
  { category: 'self-harm', tier: 'stop', pattern: /\bend(?:ing)? my (?:own )?life\b|\btak(?:e|ing) my (?:own )?life\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:want(?:ed)?|wish(?:ed)?|plan(?:ning)?|going|gonna|decided|ready|thinking (?:of|about)|considering)(?: to)? (?:die|be dead|not exist|not wake up|end it(?: all)?)\b(?! (?:of|from|laughing|inside))/i },
  { category: 'self-harm', tier: 'stop', pattern: new RegExp(`\\b${IDEATION}\\s+(?:hurt(?:ing)?|harm(?:ing)?|injur(?:e|ing))\\s+myself\\b`, 'i') },
  { category: 'self-harm', tier: 'stop', pattern: /\bcutting myself\b|\bself[- ]?harming\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\bno reason to (?:live|go on|keep going)\b|\bbetter off (?:dead|without me)\b|\bwish i (?:was|were) dead\b|\bdon'?t want to (?:live|be alive)\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:i'?m|i am|i feel|feeling|been feeling|i'?ve been|having|have) (?:\w+ )?suicidal\b|\b(?:thoughts? of|thinking (?:of|about)) suicide\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:going to|gonna|thinking (?:of|about)|want to) (?:overdose|take (?:all|a bunch of) (?:my |the )?(?:pills|meds))\b/i },

  // ── stop: violence toward others ────────────────────────────────────────
  { category: 'harm-others', tier: 'stop', pattern: /\b(?:going to|gonna|plan(?:ning)? to|about to|decided to|thinking (?:of|about)) (?:kill|murder|shoot|stab|strangle|hurt|harm|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone|people)\b/i },

  // ── stop: abuse or immediate danger ─────────────────────────────────────
  { category: 'abuse', tier: 'stop', pattern: /\b(?:he|she|they|my \w+)(?:'s| is| are|'re)? (?:hitting|beating|choking|strangling|raping|molesting|abusing|stalking) me\b/i },
  { category: 'abuse', tier: 'stop', pattern: /\bthreatening to (?:kill|hurt) me\b|\b(?:afraid|scared|terrified) for my (?:life|safety)\b|\b(?:not safe|unsafe) (?:at home|here|right now|going home)\b|\bbeing (?:abused|assaulted|stalked)\b/i },

  // ── soften: indirect or ambiguous ───────────────────────────────────────
  { category: 'self-harm', tier: 'soften', pattern: new RegExp(`\\bkill(?:ing)? myself ${FIGURATIVE_AFTER_KILL}`, 'i') },
  { category: 'self-harm', tier: 'soften', pattern: /\bsuicid(?:e|al)\b|\bself[- ]?harm\b|\boverdos(?:e|ing)\b|\b(?:hurting|harming|harm) myself\b/i },
  { category: 'self-harm', tier: 'soften', pattern: /\bwish i could disappear\b|\bwant to disappear\b|\bdon'?t want to be here\b/i },
  { category: 'harm-others', tier: 'soften', pattern: /\b(?:want(?:ed)? to|wanna|could|feel like) (?:kill|murder|shoot|stab|strangle|hurt|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone)\b/i },
  { category: 'abuse', tier: 'soften', pattern: /\b(?:hit|beat|choked|raped|molested|abused|assaulted) me\b/i },
  { category: 'distress', tier: 'soften', pattern: /\b(?:i'?m|i am|i feel|feel(?:ing)?|it'?s|everything is) (?:so |completely |totally |utterly )?(?:hopeless(?! (?:at|with)\b)|worthless)\b/i },
  { category: 'distress', tier: 'soften', pattern: /\bno way out\b|\bgive up on (?:everything|life)\b|\bnothing matters\b|\bcan'?t (?:go on|take (?:it|this) anymore|do this anymore)\b/i },
];

/** The most serious flag in `text`, or null. Stop-tier rules win over soften-tier. */
export function detectFlag(text: string): SafetyFlag | null {
  const t = text.replace(/[‘’]/g, "'");
  for (const tier of ['stop', 'soften'] as FlagTier[]) {
    for (const r of RULES) {
      if (r.tier === tier && r.pattern.test(t)) {
        return { category: r.category, tier, label: CATEGORY_LABELS[r.category] };
      }
    }
  }
  return null;
}

export interface Resource {
  name: string;
  detail: string;
  href?: string;
}

/** Resources already listed elsewhere on the site (Emergency Exit, Terms). */
export function resourcesFor(category: FlagCategory): Resource[] {
  const list: Resource[] = [
    { name: '988 Suicide & Crisis Lifeline (US)', detail: 'Call or text 988, any time', href: 'tel:988' },
    { name: 'Crisis Text Line (US)', detail: 'Text HOME to 741741', href: 'sms:741741' },
  ];
  if (category === 'abuse') {
    list.push({ name: 'National Domestic Violence Hotline (US)', detail: 'Call 1-800-799-7233', href: 'tel:18007997233' });
  }
  list.push(
    { name: 'Immediate danger', detail: 'Call your local emergency number (911 in the US)', href: 'tel:911' },
    { name: 'Outside the US', detail: 'findahelpline.com or iasp.info/resources/Crisis_Centres' }
  );
  return list;
}

export function noticeIntro(flag: SafetyFlag): string {
  const subject =
    flag.tier === 'stop'
      ? `This message appears to contain ${flag.label} content.`
      : `This message may touch on ${flag.label}.`;
  return (
    `${subject} If you are experiencing a crisis, please reach out to a qualified human professional. ` +
    'AI systems are not qualified to assist in crisis. Below are some resources for speaking with a live person.'
  );
}
