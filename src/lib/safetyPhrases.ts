// Phrase rules for the crisis check (src/lib/safetyFlags.ts): indirect and passive thoughts of suicide, plans, methods and attempts, and
// abuse in its several forms. Pure data and one small function; nothing here imports the check itself.
//
// Principle: a false "stop" ends someone's conversation, so a new phrase is SOFTEN (the message still reaches the coach, with care and the
// resources) unless it states a plan, a method, an attempt, or abuse happening now with a physical or sexual verb. Phrase matching reads words,
// not meaning: it misses euphemisms, typos and other languages, and it sometimes fires on ordinary text. Nothing may claim it catches every crisis.
// The wording of these lists is reviewed by a person (see docs/crisis-check-scope.md).

type Tier = 'stop' | 'soften';
export interface Rule { tier: Tier; why: string; pattern: RegExp }

// Words after "point in" that make it an everyday complaint ("no point in arguing"), not a statement about living.
const LIVING = '(?:living|going on|go on|continuing|carrying on|trying anymore|being here|being alive|existing|it all|life|anything anymore)';

// What may follow "go on" / "keep going" / "carry on" for it to be about living (not "go on holiday", "keep going to the gym").
const ENDS = "(?=\\s*(?:[.!?,;]|$|anymore|any more|any longer|much longer|like (?:this|that)|this way|living|without|alone))";

export const CANDIDATES: Rule[] = [
  // ── soften: passive ideation, "wish to be dead", hopelessness ───────────────────────────────────────────────────────
  { tier: 'soften', why: 'no point / do not see the point, about living or going on', pattern: new RegExp(`\\b(?:no|don'?t see (?:any|the)|do not see (?:any|the)|can'?t see (?:any|the)|cannot see (?:any|the)|lost the|what'?s the) point (?:in|of|to) ${LIVING}`, 'i') },
  { tier: 'soften', why: 'do not see the point in going on (without "in")', pattern: /\b(?:don'?t|do not|can'?t|cannot) see the point (?:of |in )?(?:going on|living|continuing|carrying on|anything anymore)\b|\bsee(?:ing)? no point (?:in )?(?:going on|living|continuing|carrying on)\b/i },
  { tier: 'soften', why: 'burden / better off without me (indirect)', pattern: /\b(?:everyone|everybody|they|people|my (?:family|kids|friends)|the world) (?:would|will|'d) be (?:better|happier|safer|lighter|freer) (?:off )?(?:without me|if i (?:was|were) (?:gone|dead|not here|never born)|when i'?m gone)\b|\b(?:i'?m|i am|i feel like|feel like i'?m) (?:just )?(?:a )?(?:burden|a weight) (?:on|to) (?:everyone|everybody|my (?:family|kids|friends|parents)|them|people)\b/i },
  { tier: 'soften', why: 'nobody would notice or miss me if I were gone', pattern: /\b(?:no ?one|nobody|none of them) would (?:even )?(?:notice|miss|care)(?: me| about me| if i)?(?: if| when)? ?i? ?(?:(?:was|were) (?:gone|dead|not here|no longer here)|wasn'?t here|weren'?t here|disappeared|died|vanished|went away|(?:left|leave)(?!\s+(?:the|my|early|work|town|for|it|a|an|this|that|school|class|home|now|at)\b))\b|\bif i (?:disappeared|died|vanished|(?:was|were) gone),? (?:no ?one|nobody) would\b/i },
  { tier: 'soften', why: 'tired of living / sick of being alive', pattern: /\b(?:tired|sick|exhausted|weary|done) (?:of|with) (?:living|being alive|life|existing|being here)\b/i },
  { tier: 'soften', why: 'wish not to wake up / never been born / want everything to stop', pattern: /\bwish i (?:could )?(?:just )?(?:(?:go|fall) to sleep and )?(?:never|not) (?:wake|woke) up\b|\bwish i (?:had never|hadn'?t|never had) been born\b|\bdon'?t want to (?:wake up(?: tomorrow| again| anymore| any more| ever|\s*[.!?,;]|$)|exist|be around)|\bwant (?:it all|everything|all of it|this all|the pain|the thoughts|my life) to (?:stop|end)\b/i },
  { tier: 'soften', why: 'cannot go on / cannot keep going (adds "cannot", and only when it is about living)', pattern: new RegExp(`\\b(?:can'?t|cannot|can not) (?:keep going${ENDS}|keep doing this${ENDS}|keep living|go on${ENDS}|carry on${ENDS}|take (?:it|this) anymore|do this anymore|live like this)`, 'i') },
  { tier: 'soften', why: 'want to escape from everything; no way or reason out or to stay', pattern: /\bwant to escape from (?:everything|it all|life)\b|\b(?:no|can'?t see (?:a|any)) (?:way|reason) (?:out|to (?:keep|go) on|to stay)\b/i },
  { tier: 'soften', why: 'done with life, thinking about not being here', pattern: /\b(?:i'?m|i am) done with (?:life|everything|it all|living)\b|\bthinking (?:about|of) (?:not being here|leaving this world|not being around|disappearing)\b/i },
  { tier: 'soften', why: 'dark thoughts, said about oneself', pattern: /\b(?:battling|struggling with|having|fighting|dealing with|stuck in|overwhelmed by|haunted by|plagued by|(?:keep|been|i'?ve been) having)\b[^.]{0,25}\b(?:really |very |some |these |those |such )?dark thoughts\b|\bdark thoughts\b[^.]{0,20}\b(?:lately|again|at night|won'?t go away|keep (?:coming|returning))\b/i },
  { tier: 'soften', why: 'hurting oneself on purpose, past or again', pattern: /\b(?:hurt|cut|burn(?:ed|t)|hit) myself (?:on purpose|deliberately|to (?:feel|cope|punish)|because i)\b|\b(?:hurting|cutting|burning) myself again\b/i },

  // ── stop: a plan, a method, or an attempt ───────────────────────────────────────────────────────────────────────────
  { tier: 'stop', why: 'a stated method toward oneself', pattern: /\b(?:going to|gonna|plan(?:ning)? to|about to|want to|thinking (?:of|about)) (?:hang|shoot|drown|poison|suffocate|stab|hanging|shooting|drowning|poisoning|suffocating|stabbing) myself\b|\b(?:going to|gonna|planning to|want to|thinking (?:of|about)) jump(?:ing)? (?:off|from) (?:a |the )?(?:bridge|building|roof|balcony|cliff|overpass)\b/i },
  { tier: 'stop', why: 'a plan, or means at hand', pattern: /\bi (?:have|got|wrote|written) (?:a )?(?:plan|method|way) (?:to|for) (?:die|dying|end (?:it|my life)|kill myself|suicide)\b|\bi(?:'ve| have) (?:got |had )?(?:a )?(?:suicide|goodbye) (?:note|letter)\b|\bwrote (?:a )?(?:suicide|goodbye) (?:note|letter)\b|\bi have (?:the |a )?(?:pills|gun|rope|knife) (?:ready|here|with me|next to me|in front of me)\b/i },
  { tier: 'stop', why: 'an attempt in progress or just made', pattern: /\bi(?:'ve| have|'m| am)? ?(?:just )?(?:taken|swallowed|took|taking) (?:too many|a bunch of|all (?:of )?(?:my|the)|a lot of)(?: of)? (?:my |the )?(?:pills|meds|medication|tablets)\b|\bi (?:just )?(?:tried|attempted) to (?:kill myself|end my life|end it)\b/i },
];


// ── abuse, partner violence, child abuse and assault ──────────────────────────────────────────────────────────
export type AbuseKind = 'partner-or-family' | 'child-or-dependent' | 'sexual' | 'control-or-fear';
export interface AbuseRule { tier: 'stop' | 'soften'; kind: AbuseKind; why: string; pattern: RegExp }

const WHO = "(?:my (?:husband|wife|partner|boyfriend|girlfriend|ex|ex-?(?:husband|wife|boyfriend|girlfriend)|spouse|fianc[eé]e?|dad|father|mom|mother|stepfather|stepmother|stepdad|stepmom|parents?|uncle|aunt|brother|sister|grandfather|grandmother|caregiver|roommate|boss|teacher|coach|babysitter|neighbou?r)|he|she|they)";
const ADV = "(?:is |are |keeps |keep |always |often |still |sometimes |just |even )?(?:keep |keeps )?";
const VICTIM_KIN = "(?:my |our |the )?(?:child|children|kids?|son|daughter|baby|toddler|boy|girl|sister|brother|niece|nephew|grand(?:mother|father|ma|pa|child|children|son|daughter)|mother|mom|dad|father|aunt|uncle|elderly\\s+\\w+|stepson|stepdaughter)";

export const ABUSE_CANDIDATES: AbuseRule[] = [
  // ── stop: happening now to me, with a physical or sexual verb ──────────────────────────────────────────────────────────
  { tier: 'stop', kind: 'partner-or-family', why: 'someone hits, chokes or otherwise physically harms me now', pattern: new RegExp(`\\b${WHO}\\s+${ADV}(?:hits|hitting|beats|beating|chokes|choking|strangles|strangling|kicks|kicking|punche[sd]|punching|slaps|slapping(?! me on)|shoves|shoving|burns|burning|whips|whipping|throws (?:me|him|her) (?:against|down|across)|drags(?= me by)|dragging(?= me by))\\s+me\\b(?! up\\b)(?! (?:at|to|in|by|back)\\b)(?! on the (?:back|shoulder))`, 'i') },
  { tier: 'stop', kind: 'partner-or-family', why: 'pushes or grabs me in a way that is physical', pattern: new RegExp(`\\b${WHO}\\s+${ADV}(?:pushe[sd]|pushing|grab(?:s|bed|bing)|pins?|pinned|pinning)\\s+me\\s+(?:against|down|into|onto|by the|around|to the (?:floor|ground|wall))`, 'i') },
  { tier: 'stop', kind: 'sexual', why: 'forces sex on me, or touches me sexually, now', pattern: new RegExp(`\\b${WHO}\\s+${ADV}(?:rapes?|raping|forces? me (?:to|into)|makes? me have sex|molests?|molesting|touch(?:es|ing)? me (?:inappropriately|in a way|in my private|where (?:he|she) shouldn'?t|sexually))\\b`, 'i') },
  { tier: 'stop', kind: 'child-or-dependent', why: 'someone physically or sexually harms a child or a dependent I know', pattern: new RegExp(`\\b${WHO}\\s+${ADV}(?:abus\\w+|hits|hitting|beats|beating|chokes|choking|molests|molesting|rapes|raping|burns|burning|kicks|kicking|punche[sd]|punching|slaps|slapping|touch(?:es|ing)\\s+(?:inappropriately|in a way)|hurts|hurting)\\s+${VICTIM_KIN}\\b`, 'i') },
  { tier: 'stop', kind: 'child-or-dependent', why: 'someone touches a child or dependent I know sexually', pattern: new RegExp(`\\b${WHO}\\s+${ADV}touch(?:es|ing)\\s+${VICTIM_KIN}\\s+(?:inappropriately|sexually|in a way|in (?:her|his|their) private)`, 'i') },
  { tier: 'stop', kind: 'child-or-dependent', why: 'a child or someone vulnerable is being hurt', pattern: /\b(?:my (?:child|children|kids?|son|daughter|baby|sister|brother|niece|nephew|grand\w+|mother|mom|dad|father)|(?:a|the|our) (?:child|kids?|baby)|someone) (?:is|are|was|were) being (?:abused|hit|beaten|hurt|molested|raped|choked|burned|neglected|starved|locked up)\b/i },
  { tier: 'stop', kind: 'partner-or-family', why: 'I am being physically harmed, forced or locked in', pattern: /\bi(?:'m| am) being (?:beaten|hit|raped|molested|choked|strangled|forced|burned|held (?:captive|against my will)|locked (?:in|up))\b|\b(?:he|she|they|my \w+) (?:locks?|locked|keeps?) me (?:in|locked)\b/i },

  // ── soften: fear, control, the word "abusive", and what happened before ───────────────────────────────────────────────
  { tier: 'soften', kind: 'partner-or-family', why: 'someone hurts me (could be words or blows)', pattern: new RegExp(`\\b${WHO}\\s+${ADV}(?:hurts?|hurting)\\s+me\\b`, 'i') },
  { tier: 'soften', kind: 'partner-or-family', why: 'the person is called abusive, or I am in an abusive relationship', pattern: /\b(?:my (?:partner|husband|wife|boyfriend|girlfriend|ex|spouse|relationship|marriage|home|dad|father|mom|mother|boss|parents?)|he|she|they) (?:is|are|was|were) (?:very |so |really |emotionally |physically |verbally )?(?:abusive|violent)\b|\bi(?:'m| am) (?:in|living in|trapped in|stuck in|leaving|a (?:victim|survivor) of) (?:an? )?(?:abusive|violent)\b|\b(?:domestic (?:violence|abuse)|intimate partner violence)\b[^.]{0,30}\b(?:victim|survivor|me|my)\b|\bvictim of (?:domestic |physical |sexual |emotional )?(?:violence|abuse)\b/i },
  { tier: 'soften', kind: 'control-or-fear', why: 'I am afraid of someone close to me, or afraid to go home', pattern: /\bi(?:'m| am) (?:so |really |very |terribly )?(?:afraid|scared|terrified|frightened) (?:of|to be around|to be alone with) (?:my )?(?:husband|wife|partner|boyfriend|girlfriend|ex|spouse|dad|father|mom|mother|stepfather|stepmother|uncle|brother|caregiver|him|her)\b(?!['’]s)|\bi(?:'m| am) (?:so |really |very )?(?:afraid|scared|terrified|frightened) (?:to go home|of going home|of what (?:he|she|they) (?:will|might|could) do|to tell (?:him|her))\b|\bwalking on eggshells\b/i },
  { tier: 'soften', kind: 'control-or-fear', why: 'someone controls where I go, who I see, my phone or my money, or will not let me leave', pattern: /\b(?:he|she|they|my (?:husband|wife|partner|boyfriend|girlfriend|ex|spouse|dad|father|mom|mother|parents?))\s+(?:won'?t|will not|doesn'?t|does not|never|refuses? to|wouldn'?t|don'?t) let(?:s)? me (?:leave|go|see (?:my )?(?:friends|family)|go out|work|have (?:any )?money|use (?:my|the) (?:phone|car)|talk to)\b|\b(?:he|she|they|my (?:husband|wife|partner|boyfriend|girlfriend|ex|spouse)) (?:takes?|took|hides?|hid|keeps?|kept|destroyed?|breaks?|broke) my (?:phone(?! ?(?:charger|case|number|screen|bill))|keys|passport|money|car|documents|id|bank card|medication)\b|\b(?:he|she|they|my (?:husband|wife|partner|boyfriend|girlfriend|ex|spouse)) controls? (?:everything|my money|my phone|who i see|where i go|what i)\b|\b(?:he|she|they|my (?:husband|wife|partner|boyfriend|girlfriend|ex|spouse)) (?:checks|reads|goes through|tracks|monitors) my (?:phone|messages|texts|emails)(?: constantly| all the time| every (?:day|night|hour)| without (?:asking|my permission)| behind my back| to see who)|\bi can(?:'?t|not) leave (?:him|her|them|my (?:husband|wife|partner|boyfriend|girlfriend))\b/i },
  { tier: 'soften', kind: 'control-or-fear', why: 'someone threatens me, follows me or will not leave me alone', pattern: /\b(?:he|she|they|my (?:ex|husband|wife|partner|boyfriend|girlfriend|ex-?\w+)) (?:keeps|keep|kept|is|are|has been|have been)? ?(?:following|stalking|watching|texting|calling|showing up at|threatening|harassing) (?:me|my (?:work|house|home|school))\b|\b(?:threatens?|threatened|threatening) (?:me|to (?:leave me with nothing|take (?:the kids|my kids|my children)|hurt (?:me|the kids|my kids)|kill))\b/i },
  { tier: 'soften', kind: 'sexual', why: 'I was raped, assaulted, molested or abused (recently or before)', pattern: /\bi (?:was|got|have been|had been) (?:raped|sexually assaulted|molested|assaulted|abused|groped|forced (?:to|into) (?:have sex|sex|touch)|touched (?:against my will|without my consent))\b|\b(?:someone|he|she|they|my \w+|a (?:man|guy|stranger)) (?:raped|sexually assaulted|molested|groped|drugged|assaulted) me\b|\bi(?:'m| am) a (?:survivor|victim) of (?:rape|sexual (?:assault|abuse)|abuse|assault|incest|childhood abuse)\b|\bi was abused as a (?:child|kid|teen)\b|\bsexual(?:ly)? (?:assault|abus)\w* me\b/i },
  { tier: 'soften', kind: 'partner-or-family', why: 'my parents or someone at home hit or hurt me, now or before', pattern: /\b(?:my (?:mom|mother|dad|father|parents?|stepfather|stepmother|stepdad|stepmom|uncle|aunt|brother|sister|grandfather|grandmother|caregiver)) (?:hit|hits|beat|beats|slapped|slaps|punched|punches|kicked|kicks|hurt|hurts) me\b(?! (?:at|to|in|by|back|up)\b)|\bi(?:'m| am) (?:scared|afraid|terrified) of my (?:mom|mother|dad|father|parents?|stepfather|stepmother|uncle|brother|caregiver)\b(?!['’]s)/i },
];

export function detectAbuse(text: string): { tier: 'stop' | 'soften'; kind: AbuseKind; why: string } | null {
  const t = text.replace(/[‘’]/g, "'");
  for (const tier of ['stop', 'soften'] as const) {
    const r = ABUSE_CANDIDATES.find((x) => x.tier === tier && x.pattern.test(t));
    if (r) return { tier, kind: r.kind, why: r.why };
  }
  return null;
}

