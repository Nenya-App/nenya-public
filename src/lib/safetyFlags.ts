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

import { ABUSE_CANDIDATES, CANDIDATES, IMMINENT_CANDIDATES, PARAPHRASE_CANDIDATES, SLANG_CANDIDATES } from './safetyPhrases.ts';
import { evasionVariants } from './safetyNormalize.ts';
import type { Rule as PhraseRule } from './safetyPhrases.ts';
import { IMMINENT_LEAD, STOP_LEAD } from './distressText.ts';
import { classifyMention, RECENT, rungFor, SELF_INJURY } from './selfInjury.ts';
import { CONSTRUCT_LABELS, constructsIn, WINDOW, type Construct } from './safetyConstructs.ts';

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
   * self-harm: 'imminent' (stop): a plan, means at hand, an act in progress or a goodbye. The same notice text as any suicide stop; the resource list leads with the emergency number.
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
  /** What kind within the category ("admitted", "graphic" for harm to others). */
  kind?: string;
  /** If this matches anywhere in the message, the rule does not apply (a game, a story, a dream). */
  unless?: RegExp;
}

// Words after "killing myself" / "die" that make it an everyday figure of speech.
const FIGURATIVE_AFTER_KILL =
  '(?:at|with|over|trying|for|to (?:get|finish|keep|make|do|work|meet|stay|please|be|pay))';

// What may follow "go on" for it to be about carrying on living: the end of the sentence, or "anymore", "like this", "with this" and so on.
const GO_ON_ENDS = '(?=\\s*(?:[.!?,;]|$|anymore|any more|any longer|much longer|like (?:this|that)|this way|living|without|alone|with (?:this|it|life|living|my life)))';

// A person as the object of an admitted act ("someone", "a man", "my wife"), and the words that make a message fiction or play rather than an admission.
const PERSON = "(?:someone|somebody|a\\s+(?:person|man|woman|boy|girl|child|kid|baby|guy|stranger)|two\\s+people|people|my\\s+(?:wife|husband|partner|mother|mom|father|dad|brother|sister|son|daughter|child|baby|friend|boss|neighbou?r|girlfriend|boyfriend|ex|roommate|coworker|teacher))\\b";
const CHILD = "my\\s+(?:\\w+\\s+)?(?:kid|kids|child|children|son|daughter|baby|toddler|boy|girl|stepson|stepdaughter|stepchild|foster\\s+child)\\b";
const PARTNER = "my\\s+(?:ex[- ])?(?:wife|husband|partner|girlfriend|boyfriend|spouse|fianc\\w+|significant\\s+other|ex)\\b";
const ACCIDENT = /\b(?:by accident|accidentally|an accident|playing|baseball|softball|ball|sport|sports)\b/i;
const FICTION = /\b(?:game|games|dream|dreamt|dreamed|nightmare|movie|film|novel|screenplay|role-?play|minecraft|fortnite|gta)\b/i;

// Whose life or death, for "I took a man's life" and "I caused a stranger's death" (a stranger or a person named by relation; family only for the life, since a grieving person may say "I caused my mother's death" of an accident they were not at fault for, which a stop would meet with a notice that ends the conversation).
const LIFE_OWNER = "(?:(?:a|an|the|another)\\s+(?:\\w+\\s+){0,2}?(?:man|woman|person|boy|girl|child|kid|guy|stranger|human|teenager|baby)|someone|somebody|another\\s+person|my\\s+(?:\\w+\\s+)?(?:wife|husband|partner|mother|mom|father|dad|brother|sister|son|daughter|child|friend|boss|neighbou?r|girlfriend|boyfriend|ex|roommate|coworker|teacher))'s";
const DEATH_OWNER = "(?:(?:a|an|the)\\s+(?:\\w+\\s+){0,2}?(?:man|woman|person|boy|girl|child|kid|guy|stranger|human|teenager)|someone|somebody)'s";

const RULES: Rule[] = [
  // ── stop: suicide or self-harm ──────────────────────────────────────────
  { category: 'self-harm', tier: 'stop', pattern: new RegExp(`\\bkill(?:ing)? myself\\b(?! ${FIGURATIVE_AFTER_KILL})`, 'i') },
  { category: 'self-harm', tier: 'stop', pattern: /\bend(?:ing)? my (?:own )?life\b|\btak(?:e|ing) my (?:own )?life\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:want(?:ed)?|wish(?:ed)?|plan(?:ning)?|going|gonna|decided|ready|thinking (?:of|about)|considering)(?: to)? (?:die|be dead|not exist|not wake up|end it(?: all)?)\b(?! (?:of|from|laughing|inside))/i },
  // Hurting oneself on purpose ("cutting myself", "self-harming", "thinking about hurting myself") is not here: it is the ladder in
  // src/lib/selfInjury.ts, which allows it with extra pushes toward a person and ends only if it recurs or escalates.
  { category: 'self-harm', tier: 'stop', pattern: /\bno reason to (?:live|go on|keep going)\b|\bbetter off (?:dead|without me)\b|\bwish i (?:was|were) dead\b|\bdon'?t want to (?:live|be alive)\b/i },
  { category: 'self-harm', tier: 'stop', pattern: /\b(?:i'?m|i am|i feel|feeling|been feeling|i'?ve been|having|have) (?:\w+ )?suicidal\b|\b(?:thoughts? of|thinking (?:of|about)) suicide\b/i },
  { category: 'self-harm', tier: 'stop', kind: 'imminent', pattern: /\b(?:going to|gonna|thinking (?:of|about)|want to) (?:overdose(?! on (?:caffeine|coffee|sugar|chocolate))|take (?:all|a bunch of) (?:my |the )?(?:pills|meds))\b/i },

  // ── stop: violence toward others ────────────────────────────────────────
  { category: 'harm-others', tier: 'stop', pattern: /\b(?:going to|gonna|plan(?:ning)? to|about to|decided to|thinking (?:of|about)) (?:kill|murder|shoot|stab|strangle|hurt|harm|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone|people)\b/i },

  // First-person intent against a group of PEOPLE ("I'll kill any of them I meet", "I am going to hurt all of them", 2026-11-12, owner's decision): a stop, the same as intent against one person. Only forms that
  // clearly name people ("them", "all of them", "those people", "everyone") so an object ("all the weeds") is never a stop; "with kindness" is the idiom.
  { category: 'harm-others', tier: 'stop', pattern: /\bi(?:'ll|\s+will|'m\s+going\s+to|\s+am\s+going\s+to|\s+plan\s+to|\s+intend\s+to|'m\s+gonna|\s+am\s+gonna)\s+(?:just\s+|really\s+)?(?:kill|murder|slaughter|shoot|stab|strangle|hurt|harm|attack|beat\s+up|burn|bomb|poison|rape)\s+(?:all\s+of\s+them|every\s+(?:single\s+)?one\s+of\s+(?:them|those\s+people|these\s+people)|any\s+(?:one\s+)?of\s+(?:them|those\s+people|these\s+people)|each\s+of\s+them|them\s+all|(?:all\s+)?(?:of\s+)?(?:those|these)\s+people|every\s+last\s+one|everyone|everybody)\b(?!\s+with\s+kindness)/i },

  // ── stop: an admission of abusing a child or a partner, of sexual violence or sexual harm to a child, of trafficking or holding a person captive (2026-11-14, owner's decision).
  // Each has its own notice and resources: emergency numbers for immediate harm, lines for people who want to stop, lines for survivors.
  { category: 'harm-others', tier: 'stop', kind: 'admitted-child', unless: ACCIDENT, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:been\\s+)?(?:(?:often|sometimes|just|really|regularly)\\s+)?(?:hit(?:ting)?|beat(?:ing)?|beaten|slapp(?:ed|ing)|punch(?:ed|ing)|kick(?:ed|ing)|shook|shaking|burn(?:ed|ing)|burnt|chok(?:ed|ing)|starv(?:ed|ing)|abus(?:ed|ing|e)|whipp(?:ed|ing)|lock(?:ed|ing)\\s+(?:in|up)|hurt(?:ing)?\\s+(?:physically|badly))\\s+${CHILD}`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-partner', unless: ACCIDENT, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:been\\s+)?(?:(?:often|sometimes|just|really|regularly)\\s+)?(?:hit(?:ting)?|beat(?:ing)?|beaten|slapp(?:ed|ing)|punch(?:ed|ing)|kick(?:ed|ing)|shov(?:ed|ing)|chok(?:ed|ing)|strangl(?:ed|ing)|abus(?:ed|ing|e)|burn(?:ed|ing)|hurt(?:ing)?\\s+(?:physically|badly))\\s+${PARTNER}`, 'i') },
  // "I lost my temper and hit my partner": the act comes after "and" or "then" in a clause that begins with "I" (owner, 2026-11-16, from a full-exchange test, which the rules above missed).
  { category: 'harm-others', tier: 'stop', kind: 'admitted-child', unless: ACCIDENT, pattern: new RegExp(`\\bi\\b[^.?!]{0,60}?\\b(?:and|then)\\s+(?:just\\s+)?(?:hit|beat|slapped|punched|kicked|shook|choked|burned|whipped)\\s+${CHILD}`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-partner', unless: ACCIDENT, pattern: new RegExp(`\\bi\\b[^.?!]{0,60}?\\b(?:and|then)\\s+(?:just\\s+)?(?:hit|beat|slapped|punched|kicked|shoved|choked|strangled)\\s+${PARTNER}`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-partner', pattern: /\bi(?:'m|\s+am|\s+have\s+been|'ve\s+been)\s+(?:physically\s+|emotionally\s+|verbally\s+)?abusive\s+(?:to|toward|towards|with)\s+(?:my\s+)?(?:wife|husband|partner|girlfriend|boyfriend|spouse|fianc\w+)\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-child-sexual', pattern: /\bi(?:'ve|\s+have)?\s+(?:been\s+)?(?:molest(?:ed|ing)\s+(?:a|an|my|the)\s+(?:\w+\s+)?(?:child|kid|boy|girl|son|daughter|niece|nephew|minor)|touch(?:ed|ing)\s+(?:a|an|my|the)\s+(?:\w+\s+)?(?:child|kid|boy|girl|son|daughter|niece|nephew)\s+(?:sexually|inappropriately)|(?:had|having)\s+sex\s+with\s+(?:a|an|my)\s+(?:\w+\s+)?(?:child|kid|minor|underage\s+\w+|\d{1,2}[- ]year[- ]old)|rap(?:ed|ing)\s+(?:a|an|my|the)\s+(?:\w+\s+)?(?:child|kid|boy|girl|minor|son|daughter)|sexually\s+abus(?:ed|ing)\s+(?:a|an|my|the)\s+(?:\w+\s+)?(?:child|kid|boy|girl|minor|son|daughter|niece|nephew)|(?:downloaded|watch(?:ed|ing)|collect(?:ed|ing)|shar(?:ed|ing)|sold|sell(?:ing)?|look(?:ed|ing)\s+at)\s+(?:child\s+porn(?:ography)?|child\s+sexual\s+abuse\s+material|csam))\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'child-attraction', pattern: /\bi(?:'m|\s+am)\s+(?:a\s+)?(?:pedophile|paedophile|attracted\s+to\s+(?:children|kids|minors|little\s+(?:girls|boys)))\b|\bi\s+(?:have|get|keep\s+having)\s+sexual\s+(?:thoughts|urges|feelings|fantasies)\s+(?:about|toward|towards)\s+(?:children|kids|minors|a\s+child|my\s+(?:\w+\s+)?(?:child|kid|son|daughter))\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-sexual', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:(?:think\\s+i|may\\s+have|might\\s+have|probably|maybe|could\\s+have)\\s+)?(?:just\\s+|actually\\s+|really\\s+|recently\\s+)?(?:raped|molested|sexually\\s+assaulted|sexually\\s+abused|drugged\\s+and\\s+raped)\\s+${PERSON}`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-trafficking', pattern: /\bi(?:'m|\s+am|\s+have\s+been|'ve\s+been)?\s*(?:been\s+)?traffick(?:ing|ed)\s+(?:people|women|girls|children|kids|boys|men|someone|workers)\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-trafficking', unless: FICTION, pattern: /\bi(?:'ve|\s+have)?\s+(?:just\s+|really\s+)?(?:enslaved|kidnapped|abducted)\s+(?:someone|somebody|a\s+(?:person|man|woman|girl|boy|child|kid)|people|him|her|them)\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-trafficking', unless: FICTION, pattern: /\bi(?:'m|\s+am)?\s*(?:keep(?:ing)?|hold(?:ing)?|kept|held)\s+(?:someone|somebody|a\s+(?:person|man|woman|girl|boy|child|kid)|people|him|her|them)\s+(?:captive|prisoner|locked\s+(?:in|up)|against\s+(?:his|her|their)\s+will)\b|\bi\s+(?:have|got)\s+(?:someone|somebody|a\s+(?:man|woman|girl|boy|child))\s+(?:locked|chained|tied)\s+(?:up|in)\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'admitted-trafficking', unless: FICTION, pattern: /\bi(?:'m|\s+am)?\s*(?:forc(?:ed|ing)|mak(?:ing|e)|made)\s+(?:\w+\s+){0,2}to\s+(?:work\s+for\s+free|have\s+sex|sell\s+sex)\b|\bi\s+(?:force|forced|am\s+forcing)\s+(?:\w+\s+){0,2}into\s+(?:prostitution|sex\s+work)\b|\bi\s+(?:sold|sell|am\s+selling)\s+(?:a\s+)?(?:girl|girls|women|woman|children|kids|people|someone)\s+(?:for\s+sex|into\s+(?:prostitution|slavery))\b/i },

  // ── stop: an admission of having killed or seriously hurt a person, and graphic violence or violent fantasy (2026-11-14, owner's decision after a test where the coach
  // answered "I killed someone" with "that must feel incredibly heavy"). These are stopped before the AI sees them: the notice sends the person to emergency services and
  // to people (a crisis line, a mental health professional, a lawyer), and the conversation ends. A game, a story, a film or a dream is not an admission.
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:(?:think\\s+i|may\\s+have|might\\s+have|probably|maybe|could\\s+have)\\s+)?(?:just\\s+|actually\\s+|really\\s+|recently\\s+|accidentally\\s+)?(?:killed|murdered|stabbed|strangled|suffocated|poisoned|drowned|shot|choked|assaulted|beat(?:en)?\\s+(?:up|to\\s+death))\\s+${PERSON}`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: /\bi(?:'ve|\s+have)?\s+(?:(?:think\s+i|may\s+have|might\s+have|probably|maybe|could\s+have)\s+)?(?:just\s+|actually\s+|really\s+|recently\s+|accidentally\s+)?(?:killed|murdered|stabbed|strangled|suffocated|poisoned|drowned)\s+(?:him|her|them)\b(?!\s+(?:with\s+(?:my|the|a)\s+(?:presentation|performance|joke|jokes|comedy|set|speech|audition|talk|pitch|cooking|outfit|dance)|at\s+the\s+|in\s+the\s+(?:game|match|round)))/i },
  // Other ways of admitting a death (2026-11-24, from the owner's advanced persona run: "I took a man's life last week" went unflagged). "I took a man's life", "I ended someone's life", "I took a life",
  // "I caused a stranger's death", "I shot and killed a man". The life must be a person's: "a man's coat", "a life insurance form", "a life drawing class", "my life savings" are not (the words after "life" are checked),
  // and a game, a film, a dream or a novel in the same sentence makes it play, as for the rules above.
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:(?:think\\s+i|may\\s+have|might\\s+have|probably|maybe|could\\s+have)\\s+)?(?:just\\s+|actually\\s+|really\\s+|recently\\s+|accidentally\\s+|finally\\s+)?(?:took|taken|ended)\\s+${LIFE_OWNER}\\s+life\\b(?![\\s-]+(?:insurance|savings|story|stories|lesson|lessons|coach|goal|goals|choice|choices|experience|work|partner|style|support|jacket|vest|raft|drawing|class|course|skills?|of\\b|in\\b|long|time|hack))`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:(?:think\\s+i|may\\s+have|might\\s+have|probably|maybe|could\\s+have)\\s+)?(?:just\\s+|actually\\s+|really\\s+|recently\\s+|accidentally\\s+|finally\\s+)?(?:took|taken|ended)\\s+(?:a|an|the)\\s+(?:(?:innocent|human|young|good|man)\\s+)?life(?:\\s*(?:[.!?,;]|$)|\\s+(?:last|yesterday|tonight|today|ago|and|but|because|\\d+|two|three|a\\s+(?:week|month|year)|years?|months?|weeks?)\\b)`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+(?:just\\s+|accidentally\\s+|finally\\s+)?(?:took|taken|ended)\\s+the\\s+life\\s+of\\s+${PERSON}(?!'s)`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi(?:'ve|\\s+have)?\\s+caused\\s+${DEATH_OWNER}\\s+death\\b`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'admitted', unless: FICTION, pattern: new RegExp(`\\bi\\s+(?:\\w+\\s+){0,6}?(?:and|then)\\s+(?:killed|murdered)\\s+${PERSON}(?!'s)`, 'i') },
  { category: 'harm-others', tier: 'stop', kind: 'graphic', unless: FICTION, pattern: /\bi\b[^.!?\n]{0,40}\b(?:fantas(?:y|ies|ize|ise|izing|ising)|imagin(?:e|ing)|picture|picturing|daydream(?:ing)?|visuali[sz](?:e|ing)|dream(?:ing)?\s+(?:of|about))\b[^.!?\n]{0,50}\b(?:killing|murdering|torturing|stabbing|shooting|strangling|raping|mutilating|dismembering|beating|choking|burning|slitting|cutting\s+up)\b[^.!?\n]{0,30}\b(?:him|her|them|someone|somebody|everyone|people|my\s+\w+|a\s+(?:person|man|woman|child))\b/i },
  { category: 'harm-others', tier: 'stop', kind: 'graphic', unless: FICTION, pattern: /\bi\b[^.!?\n]{0,30}\b(?:want|wanna|would\s+love|'d\s+love|need|keep\s+imagining|can'?t\s+stop\s+(?:thinking\s+about|imagining))\b[^.!?\n]{0,30}\b(?:watch(?:ing)?\s+(?:him|her|them|\w+)\s+(?:suffer|bleed|die|beg|scream)|(?:torture|mutilate|dismember|disembowel|behead|decapitate|flay)\b)/i },
  { category: 'harm-others', tier: 'stop', kind: 'graphic', unless: FICTION, pattern: /\b(?:i|we)\s+(?:then\s+)?(?:slit|cut|stabbed|slashed|bashed|smashed|strangled|dismembered|buried|burned)\b[^.!?\n]{0,40}\b(?:his|her|their|the)\s+(?:throat|head|skull|body|neck|face|chest)\b/i },


  // ── stop: abuse or immediate danger ─────────────────────────────────────
  { category: 'abuse', tier: 'stop', pattern: /\b(?:he|she|they|my \w+)(?:'s| is| are|'re)? (?:hitting|beating|choking|strangling|raping|molesting|abusing|stalking) me\b(?! (?:at|to|in|by|back)\b)(?!(?<=hitting me) up\b)/i },
  { category: 'abuse', tier: 'stop', pattern: /\bthreatening to (?:kill|hurt) me\b|\b(?:afraid|scared|terrified) for my (?:life|safety)\b|\b(?:not safe|unsafe) (?:at home|here|right now|going home)\b|\bbeing (?:abused|assaulted|stalked)\b/i },

  // ── soften: indirect or ambiguous ───────────────────────────────────────
  { category: 'self-harm', tier: 'soften', pattern: new RegExp(`\\bkill(?:ing)? myself ${FIGURATIVE_AFTER_KILL}`, 'i') },
  { category: 'self-harm', tier: 'soften', pattern: /\bsuicid(?:e|al)\b|\bself[- ]?harm\b|\boverdos(?:e|ing)\b|\b(?:hurting|harming|harm) myself\b/i },
  // Shorthand for "kill myself": a soften (it is also said in jest), so the message reaches the coach with care, and the form check never asks the person to rewrite it (2026-11-12).
  { category: 'self-harm', tier: 'soften', pattern: /\bkms\b/i },
  { category: 'self-harm', tier: 'soften', pattern: /\bwish i could disappear\b|\bwant to disappear\b|\bdon'?t want to be here\b/i },
  { category: 'harm-others', tier: 'soften', pattern: /\b(?:want(?:ed)? to|wanna|could|feel like) (?:kill|murder|shoot|stab|strangle|hurt|attack|beat up) (?:him|her|them|my \w+|someone|somebody|everyone)\b/i },
  { category: 'harm-others', tier: 'soften', pattern: /\bi\s+(?:want|wanna|would\s+love|'d\s+love|'d\s+like|would\s+like)\s+to\s+(?:just\s+)?(?:kill|murder|slaughter|shoot|stab|strangle|hurt|attack|beat\s+up|burn|bomb)\s+(?:all\s+of\s+them|every\s+(?:single\s+)?one\s+of\s+them|any\s+(?:one\s+)?of\s+them|them\s+all|(?:all\s+)?(?:of\s+)?(?:those|these)\s+people)\b/i },
  { category: 'abuse', tier: 'soften', pattern: /\b(?:hit(?! me up\b)|beat(?! me (?:at|to|in|by) )|choked|raped|molested|abused|assaulted) me\b/i },
  { category: 'distress', tier: 'soften', pattern: /\b(?:i'?m|i am|i feel|feel(?:ing)?|it'?s|everything is) (?:so |completely |totally |utterly )?(?:hopeless(?! (?:at|with)\b)|worthless)\b/i },
  { category: 'distress', tier: 'soften', pattern: /\bno way out\b|\bgive up on (?:everything|life)\b|\bnothing matters\b/i },
  // Worn out and cannot keep this up (2026-11-24, the owner's advanced persona run): a weariness word and "cannot keep this up" in one sentence, in either order, or "cannot keep this up anymore" alone. A soften: it may be tiredness or something more.
  // "Keep this up with my diet", "for another hour" and "keep up with the news" are not it.
  { category: 'distress', tier: 'soften', pattern: /\b(?:worn\s+(?:out|down)|exhausted|drained|burn(?:ed|t)\s+out|wiped\s+out|run\s+down|running\s+on\s+empty|at\s+the\s+end\s+of\s+my\s+rope|spent)\b[^.!?\n]{0,40}\bcan(?:'?t|not|\s+not)\s+(?:keep\s+(?:this|it)\s+up(?!\s+(?:with|for|at|in|on|while|when)\b)|hold\s+(?:it|this)\s+together|keep\s+doing\s+this(?=\s*(?:[.!?,;]|$|anymore|any\s+more|any\s+longer))|keep\s+going(?=\s*(?:[.!?,;]|$|anymore|any\s+more|any\s+longer|like\s+(?:this|that)|this\s+way)))/i },
  { category: 'distress', tier: 'soften', pattern: /\bcan(?:'?t|not|\s+not)\s+keep\s+(?:this|it)\s+up(?:\s+(?:anymore|any\s+more|any\s+longer|much\s+longer)|(?=\s*[.!?,;]?\s*(?:i'?m|i\s+am)\s+(?:so\s+)?(?:worn|exhausted|drained|burn|wiped|spent)))/i },
  // "can't" and "cannot" and "can not" alike. "Go on" counts only at the end of a thought or before "anymore", "like this", "with this"
  // and the like, so "I cannot go on holiday" and "I can't go on a date" are left alone.
  { category: 'distress', tier: 'soften', pattern: new RegExp(`\\bcan(?:'?t|not| not) (?:go on${GO_ON_ENDS}|take (?:it|this) anymore|do this anymore)\\b`, 'i') },
];

const flagOf = (category: FlagCategory, tier: FlagTier, kind?: string): SafetyFlag => ({ category, tier, label: CATEGORY_LABELS[category], ...(kind ? { kind } : {}) });

/** Why a message was flagged: the words that matched a phrase list, or the self-injury ladder's rung. A process note, not a verdict. */
export interface FlagWhy {
  source: 'phrase' | 'ladder' | 'accumulated';
  /** The words in the person's own message that matched (cut short). For "accumulated": the kinds of sign found, in words. */
  matched?: string;
  /** For the ladder: its rung, in words ("a present act or urge", "recurs", "escalates", "a general account", "about someone else", "a medical emergency").
   * For "accumulated": "two or more kinds of distress across the recent messages" or "a distress flag earlier in the conversation". */
  rung?: string;
  /** For the ladder: the numbers (1 = first) of the person's earlier messages that count toward it. */
  basedOn?: number[];
}
export interface FlagExplained {
  flag: SafetyFlag;
  why: FlagWhy;
}
const cut = (x: string | undefined): string | undefined => (x === undefined ? undefined : x.length > 120 ? x.slice(0, 117) + '...' : x);

const ALL_PHRASES: PhraseRule[] = [...CANDIDATES, ...IMMINENT_CANDIDATES, ...SLANG_CANDIDATES, ...PARAPHRASE_CANDIDATES];

/** The words a phrase rule matched, or null: a rule's "unless" (another person, a story, sport, a job farewell) in the same sentence cancels it. */
function phraseHit(r: PhraseRule, t: string): string | null {
  const m = r.pattern.exec(t);
  if (!m) return null;
  if (r.unless) {
    const from = Math.max(t.lastIndexOf('.', m.index), t.lastIndexOf('!', m.index), t.lastIndexOf('?', m.index)) + 1;
    const ends = ['.', '!', '?'].map((c) => t.indexOf(c, m.index + m[0].length)).filter((i) => i >= 0);
    if (r.unless.test(t.slice(from, ends.length ? Math.min(...ends) : t.length))) return null;
  }
  return m[0];
}

/** The most serious flag in one message, from the phrase lists alone (not the self-injury ladder), and the words that matched. Stop-tier rules win over soften-tier. */
function detectSingleWhy(text: string): FlagExplained | null {
  const own = detectOneSpelling(text);
  if (own?.flag.tier === 'stop') return own;
  // Common spelling tricks undone (k1ll, k i l l, su*cide, look-alike letters): the lists are matched against these other spellings too, for matching only
  // (src/lib/safetyNormalize.ts). A variant can add a flag or raise a soften to a stop; it never removes one, and it is never stored or sent.
  let best = own;
  for (const v of evasionVariants(text)) {
    const hit = detectOneSpelling(v);
    if (!hit) continue;
    if (hit.flag.tier === 'stop') return hit;
    best ??= hit;
  }
  return best;
}

function detectOneSpelling(text: string): FlagExplained | null {
  const t = text.replace(/[‘’]/g, "'");
  // Plan, means, an act in progress, a goodbye: kind "imminent" (the notice leads with the emergency number). Looked at first so that
  // "I'm going to kill myself tonight" carries the kind too; each rule skips a sentence about someone else, a story, sport, a job farewell.
  for (const r of ALL_PHRASES.filter((x) => x.tier === 'stop' && x.kind === 'imminent')) {
    const hit = phraseHit(r, t);
    if (hit) return { flag: flagOf('self-harm', 'stop', 'imminent'), why: { source: 'phrase', matched: cut(hit) } };
  }
  for (const tier of ['stop', 'soften'] as FlagTier[]) {
    for (const r of RULES) {
      const m = r.tier === tier ? r.pattern.exec(t) : null;
      if (!m) continue;
      // A game, a film, a dream or an accident named in the same sentence makes the words play or chance, not an admission.
      if (r.unless) {
        const from = Math.max(t.lastIndexOf('.', m.index), t.lastIndexOf('!', m.index), t.lastIndexOf('?', m.index)) + 1;
        const ends = ['.', '!', '?'].map((c) => t.indexOf(c, m.index + m[0].length)).filter((i) => i >= 0);
        if (r.unless.test(t.slice(from, ends.length ? Math.min(...ends) : t.length))) continue;
      }
      // The older abuse rules carry no kind; borrow it from the kind rules (same tier) so the right resources are shown.
      const kind = r.kind ?? (r.category === 'abuse' ? ABUSE_CANDIDATES.find((k) => k.tier === tier && k.pattern.test(t))?.kind : undefined);
      return { flag: flagOf(r.category, tier, kind), why: { source: 'phrase', matched: cut(m[0]) } };
    }
    for (const r of ALL_PHRASES) {
      const hit = r.tier === tier ? phraseHit(r, t) : null;
      if (hit) return { flag: flagOf('self-harm', tier, r.kind), why: { source: 'phrase', matched: cut(hit) } };
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

// An admission with only a pronoun for the person ("That's why I hit her"), which stands for a partner only where the conversation has already said so (owner, 2026-11-16, option one, from
// a full-exchange test): an earlier message names a partner or a home life, and nothing in the conversation names a child (then it is ambiguous, and the softer path applies). Alone it is not
// an admission of anything in particular: "her" could be anyone.
const PRONOUN_ADMISSION = /\bi(?:'ve|\s+have)?\s+(?:just\s+|really\s+|also\s+)?(?:hit|beat|slapped|punched|kicked|choked|strangled|shoved)\s+(?:her|him|them)\b/i;
const PARTNER_CONTEXT = /\bmy\s+(?:ex[- ])?(?:wife|husband|partner|girlfriend|boyfriend|spouse|fianc\w+|significant\s+other)\b|\bmy\s+ex\b|\b(?:at|in)\s+(?:our\s+|my\s+)?home\b|\bhome\s+life\b|\bmy\s+(?:relationship|marriage)\b/i;
function pronounAdmission(userMessages: string[]): FlagExplained | null {
  const norm = userMessages.map((m) => m.replace(/[‘’]/g, "'"));
  const latest = norm[norm.length - 1] ?? '';
  const m = PRONOUN_ADMISSION.exec(latest);
  if (!m || ACCIDENT.test(latest) || FICTION.test(latest)) return null;
  const earlier = norm.slice(0, -1).join(' ');
  if (!PARTNER_CONTEXT.test(earlier) || new RegExp(CHILD, 'i').test(norm.join(' '))) return null;
  return { flag: flagOf('harm-others', 'stop', 'admitted-partner'), why: { source: 'phrase', matched: cut(m[0]) } };
}

/**
 * The same decision as checkConversation, with why: the words that matched, or the ladder's rung, or what added up across the messages.
 *
 * Carrying risk across turns without keeping anything (step 3 of the suicidal-ideation audit; draft: awaiting clinician review). The server is sent the
 * person's messages on every request, so this is recomputed each time from the last WINDOW (10) of them; nothing is stored or logged. On top of
 * the single-message decision (which is never lowered, and a stop is never changed):
 *   - if that decision is no flag, and two or more different kinds of sign (src/lib/safetyConstructs.ts) appear anywhere in the window, or a
 *     soften flag was raised on an earlier message in the window, the outcome is a soften flag (category "distress", so the same site sentence
 *     as any distress soften; after an earlier suicide or self-harm soften, that category). It lasts while the window holds the earlier flag or the signs.
 *   - one kind of sign alone, with nothing earlier, is no flag.
 */
export function explainConversation(userMessages: string[]): FlagExplained | null {
  const single = explainSingle(userMessages);
  if (single) return single; // a stop, or a soften that already stands: never changed here
  const n = userMessages.length;
  if (n === 0) return null;
  const start = Math.max(0, n - WINDOW);
  const named = (ks: Set<Construct>): string => [...ks].map((k) => CONSTRUCT_LABELS[k]).join(', ');
  const kinds = new Set<Construct>();
  for (let i = start; i < n; i++) for (const k of constructsIn(userMessages[i])) kinds.add(k);
  if (kinds.size >= 2) return { flag: flagOf('distress', 'soften'), why: { source: 'accumulated', rung: 'two or more kinds of distress across the recent messages', matched: named(kinds) } };
  // A soften flag on an earlier message of the window stays on (signs that had added up earlier are still in the window, so they are covered above).
  for (let i = start; i < n - 1; i++) {
    const earlier = explainSingle(userMessages.slice(0, i + 1));
    // (Not the self-injury ladder's soften flags: the ladder has its own memory, the last few messages, by the owner's decision of 2026-11-08.)
    if (earlier?.flag.tier === 'soften' && earlier.why.source === 'phrase') {
      // The notice and the sentence stay the generic distress ones, except after a flag about suicide or self-harm, which keeps its own.
      const category: FlagCategory = earlier.flag.category === 'self-harm' ? 'self-harm' : 'distress';
      return { flag: flagOf(category, 'soften'), why: { source: 'accumulated', rung: 'a distress flag earlier in the conversation' } };
    }
  }
  return null;
}

/** The decision for the latest message from the phrase lists, the pronoun rule and the self-injury ladder, without anything carried across turns. */
function explainSingle(userMessages: string[]): FlagExplained | null {
  const latest = userMessages[userMessages.length - 1] ?? '';
  const single = detectSingleWhy(latest);
  if (single?.flag.tier === 'stop') return single;
  const withContext = pronounAdmission(userMessages);
  if (withContext) return withContext;
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

const STOP_IT_NOW: Resource = { name: 'Stop It Now helpline (US)', detail: 'Call 1-888-PREVENT (1-888-773-8368). Free and confidential, for anyone concerned about child sexual abuse. It is open on weekdays, not around the clock; chat and email are also offered at stopitnow.org', href: 'tel:18887738368' };
const NCMEC: Resource = { name: 'NCMEC CyberTipline (US)', detail: 'To report sexual images of children or online exploitation: report.cybertip.org, or call 1-800-843-5678, any time', href: 'tel:18008435678' };
const TRAFFICKING_LINES: Resource[] = [
  { name: 'National Human Trafficking Hotline (US)', detail: 'Call 1-888-373-7888 or text 233733, any time. Confidential, for survivors, for anyone who wants out, and for anyone who wants to report', href: 'tel:18883737888' },
  { name: 'Canadian Human Trafficking Hotline', detail: 'Call 1-833-900-1010, any time. Confidential, in many languages', href: 'tel:18339001010' },
];
// When a message admits having harmed someone: legal help by default (owner, 2026-11-15; docs/harm-disclosure-directions.md). Second for an adult harmed,
// after the emergency number; third where a child may be at risk, after the child-safety lines. No link: the right place is the person's own state bar,
// and no current national directory was found (checked 2026-11-15, docs/crisis-resources-check.md).
export const LEGAL_HELP: Resource = {
  name: 'A lawyer (US)',
  detail: 'Before you speak to the police or anyone in authority about what happened, you have the right to speak with a lawyer. Search for your state bar association’s lawyer referral service; many offer a first consultation for a small fee. If you are arrested or charged and cannot afford a lawyer, ask for a public defender.',
};
const ADMITTED_KINDS: ReadonlySet<string> = new Set(['admitted', 'admitted-partner', 'admitted-child', 'admitted-child-sexual', 'admitted-sexual', 'admitted-trafficking']);
const CHILD_KINDS: ReadonlySet<string> = new Set(['admitted-child', 'admitted-child-sexual']);

/** Whether a notice is about an act the person says they did (and so shows legal help and "What reporting involves"). */
export function admitsHarm(flag: Pick<SafetyFlag, 'category' | 'kind'>): boolean {
  return flag.category === 'harm-others' && !!flag.kind && ADMITTED_KINDS.has(flag.kind);
}

/** What reporting involves, as facts and never as a push either way (checked 2026-11-15; docs/crisis-resources-check.md). No state's law is quoted. */
export const REPORTING_FACTS: { heading: string; text: string }[] = [
  { heading: 'Reporting yourself', text: 'You can go to the police yourself, or ask a lawyer to contact them for you and be with you. Anything you tell the police can be used in court, and you can decline to answer questions until you have a lawyer.' },
  { heading: 'A lawyer', text: 'What you tell a lawyer about something you have already done is generally confidential. It does not cover asking for help with a crime that is still going on or being planned.' },
  { heading: 'Therapists and counselors', text: 'In most states, therapists and counselors must report suspected abuse of a child, and some states require everyone to. Many states also let or require them to act when a specific person is in serious danger. You can ask how confidentiality works before you start.' },
  { heading: 'Crisis lines', text: '988 is for your own crisis. Fewer than 2 in 100 contacts involve emergency services; most of those happen with the caller’s agreement, and some, when someone is in immediate danger, do not.' },
  { heading: 'Stop It Now', text: 'A private place to talk, and not a reporting agency. If you give identifying details about a specific child who is being abused, it may have to make a report.' },
  { heading: 'Other lines', text: 'Childhelp, RAINN, and the trafficking and domestic violence hotlines each have their own rules about confidentiality. You can ask at the start of a call.' },
  { heading: 'Your state', text: 'These rules differ from state to state. A lawyer can tell you how they apply to you.' },
];

/** For each kind of harm to others: the lines for people who want to stop, and for the people harmed. The emergency number is added in front. */
const HARM_LINES: Record<string, Resource[]> = {
  admitted: [],
  graphic: [],
  'admitted-partner': [{ name: 'National Domestic Violence Hotline (US)', detail: 'Call 1-800-799-7233 or text START to 88788, any time. For people who have been hurt, and for people who are worried that their own behavior is harmful to a partner', href: 'tel:18007997233' }],
  'admitted-child': [{ name: 'Childhelp National Child Abuse Hotline (US)', detail: 'Call or text 1-800-422-4453, any time. For children, for anyone concerned about a child, and for parents who are afraid they might hurt a child. You do not have to give your name', href: 'tel:18004224453' }],
  'admitted-child-sexual': [STOP_IT_NOW, NCMEC, { name: 'Childhelp National Child Abuse Hotline (US)', detail: 'Call or text 1-800-422-4453, any time. For a child who has been hurt, and for anyone who knows of one', href: 'tel:18004224453' }],
  'child-attraction': [STOP_IT_NOW],
  'admitted-sexual': [{ name: 'RAINN National Sexual Assault Hotline (US)', detail: 'For the person who was harmed, any time: 1-800-656-4673', href: 'tel:18006564673' }],
  'admitted-trafficking': TRAFFICKING_LINES,
};

/** US poison centers, for something swallowed. Listed by several sources as the national line (searched 2026-11-20); not yet checked on poison.org. No Canadian number: none confirmed. */
const POISON_HELP: Resource = { name: 'Poison Help (US)', detail: 'Call 1-800-222-1222, any time, free and confidential. For something swallowed', href: 'tel:18002221222' };

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
  const emergency: Resource = { name: 'Immediate danger', detail: 'Call your local emergency number (911 in the US and Canada)', href: 'tel:911' };
  const outside: Resource = { name: 'Outside the US and Canada', detail: 'findahelpline.com or iasp.info/resources/Crisis_Centres' };
  if (category === 'abuse' && kind === 'trafficking') list.push(...TRAFFICKING_LINES);
  // For an admitted act or graphic violence the emergency number comes first: someone may need help now. Then the lines for the kind of harm, for people who want to stop and for the people harmed.
  if (category === 'harm-others' && kind && HARM_LINES[kind]) {
    const first =
      kind === 'child-attraction'
        ? [...HARM_LINES[kind], emergency]
        : CHILD_KINDS.has(kind)
          ? [emergency, ...HARM_LINES[kind], LEGAL_HELP]
          : ADMITTED_KINDS.has(kind)
            ? [emergency, LEGAL_HELP, ...HARM_LINES[kind]]
            : [emergency, ...HARM_LINES[kind]];
    return [...first, ...list, outside];
  }
  // A plan, means at hand, an act in progress or a goodbye: the emergency number comes first (draft: awaiting clinician review, docs/ai-handoff/05-safety-legal-data.md).
  if (category === 'self-harm' && kind === 'imminent') return [emergency, POISON_HELP, ...list, outside];
  list.push(emergency, outside);
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

// What the notice says when a message admits having killed or seriously hurt someone, describes violence graphically, admits abuse, sexual harm or trafficking, or says the person is attracted to children. Wording approved by the owner 2026-11-14; the phone numbers were checked against the organizations' own pages the same day (see docs/crisis-resources-check.md).
const HARM_NOTICE: Record<string, string> = {
  'admitted-partner':
    "What you have written says you have hurt someone you are close to. I'm an AI, and this is beyond what I can help with. If anyone is in danger right now, call your local emergency number (911 in the US and Canada) immediately, and get away from the person if you can. Hurting a partner is serious, and people can stop: the numbers below include a line that is also for people who are worried that their own behavior is harmful, and a crisis line. The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. A lawyer can explain your rights before you speak to anyone in authority, and below is how to find one, with what reporting involves. I'm ending our conversation here so that you can call.",
  'admitted-child':
    "What you have written says a child has been hurt, by you. I'm an AI, and this is beyond what I can help with. If a child is hurt or in danger right now, call your local emergency number (911 in the US and Canada) immediately. A child is not safe until the hurting stops. The numbers below include a line for parents who are afraid of hurting a child, and a crisis line. The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. After the child-safety lines below is how to find a lawyer, with what reporting involves. I'm ending our conversation here so that you can call.",
  'admitted-child-sexual':
    "What you have written describes sexually harming a child, or sexual images of a child. I'm an AI, and I can't help with this, and I won't go into it. If a child is in danger right now, call your local emergency number (911 in the US and Canada) immediately. The numbers below include a confidential line for anyone concerned about child sexual abuse, a line to report sexual images of children, and a crisis line. The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. After the child-safety lines below is how to find a lawyer, with what reporting involves. I'm ending our conversation here so that you can call.",
  'child-attraction':
    "What you wrote is about sexual thoughts about children. Having thoughts does not mean you have acted on them, and wanting help is the right step. I'm an AI, and I can't help with this. The first number below is a confidential line for anyone concerned about child sexual abuse, and it is a place to start. If a child is in danger right now, call your local emergency number (911 in the US and Canada). I'm ending our conversation here so that you can call.",
  'admitted-sexual':
    "What you have written says you have sexually harmed someone. I'm an AI, and this is beyond what I can help with, and I won't go into it. If anyone is in danger right now, call your local emergency number (911 in the US and Canada) immediately. The numbers below include a crisis line, which can help you through the next hours, and a line for the person who was harmed. A mental health professional can help you with what comes next. The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. A lawyer can explain your rights before you speak to anyone in authority, and below is how to find one, with what reporting involves. I'm ending our conversation here so that you can call.",
  'admitted-trafficking':
    "What you have written says someone is being held, forced or sold. I'm an AI, and this is beyond what I can help with, and I won't go into it. If anyone is in danger right now, call your local emergency number (911 in the US and Canada) immediately. The National Human Trafficking Hotline below is confidential and can advise anyone, including people who are involved and want to get out. The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. A lawyer can explain your rights before you speak to anyone in authority, and below is how to find one, with what reporting involves. I'm ending our conversation here so that you can call.",
  admitted:
    "What you have written says someone was killed or badly hurt. I'm an AI, and this is beyond what I can help with. If anyone is hurt or in danger right now, call your local emergency number (911 in the US and Canada) immediately. Please also speak with a person today: a crisis line (988 in the US and Canada) can help you through the next hours, a mental health professional can help with what you are carrying, and a lawyer can explain your rights before you speak to anyone in authority (below is how to find one, with what reporting involves). The page stopped this message before it reached the AI; Nenya keeps nothing of it and cannot report it to anyone. I'm ending our conversation here so that you can do that.",
  graphic:
    "What you wrote describes violence in detail, or a wish to do violence. I'm an AI, and I can't help with this, and I won't go into it. If you are afraid you might act on it, or someone is in danger, call your local emergency number (911 in the US and Canada) or a crisis line (988 in the US and Canada) right now. A mental health professional is the right person to talk this through with. I'm ending our conversation here so that you can reach one.",
};

export function noticeIntro(flag: SafetyFlag): string {
  if (flag.category === 'harm-others' && flag.kind && HARM_NOTICE[flag.kind]) return HARM_NOTICE[flag.kind];
  if (flag.category === 'self-injury' && flag.kind && SELF_INJURY_NOTICE[flag.kind]) return SELF_INJURY_NOTICE[flag.kind];
  // Owner approved 2026-11-19: a stopped message about suicide or self-harm gets the warmer site-written lead, not the form-like sentence.
  // Owner chose a blend of options B and C 2026-11-20 for a plan, means, an act in progress or a goodbye (docs/imminent-notice-draft.md). Awaiting clinician review.
  if (flag.category === 'self-harm' && flag.tier === 'stop' && flag.kind === 'imminent') return IMMINENT_LEAD;
  if (flag.category === 'self-harm' && flag.tier === 'stop') return STOP_LEAD;
  const subject =
    flag.tier === 'stop'
      ? `This message appears to contain ${flag.label} content.`
      : `This message may touch on ${flag.label}.`;
  return (
    `${subject} If you are experiencing a crisis, please reach out to a qualified human professional. ` +
    'AI systems are not qualified to assist in crisis. Below are some resources for speaking with a live person.'
  );
}
