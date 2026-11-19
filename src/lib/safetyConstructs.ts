// Signs of distress that add up across a conversation (2026-11-19, step 3 of the suicidal-ideation audit). DRAFT: awaiting clinician review.
//
// The audit's reading of the guide (R6, R7, R8, R14): one mild sign alone is not a flag, but two different kinds across the person's recent
// messages, or a soften flag that was raised earlier, should keep the careful path on. This file only answers one question about one message:
// which of five kinds of sign does it contain, in the first person? The decision (what to do with the answer) is in src/lib/safetyFlags.ts.
//
// The five kinds are the constructs the guide names for the earliest, implicit level: hopelessness, feeling like a burden, isolation (disconnection,
// "nobody would notice"), entrapment or defeat, and emotional pain. They are phrase matches, not understanding: they miss what they do not list,
// they are English only, and they can fire on harmless text. Nothing here may be described as detecting, measuring or predicting anything.
//
// Precision rules (the same discipline as the rest of the screen): every phrase is first person ("I feel", "I'm", "my", "nobody would notice if I");
// a sentence that is a story, a song, a game or a quotation, or that is hypothetical ("if I felt"), counts for nothing; a negation just before the
// phrase ("I'm not hopeless") cancels it; and the ordinary uses are fenced off in the phrase itself ("a burden on my phone's battery", "hopeless
// romantic", "hopeless at math", "isolated in this Zoom call", "trapped in an elevator", "nobody was home").
// Matching also runs on the spelling variants from src/lib/safetyNormalize.ts (k1ll-style tricks, stretched letters). Nothing is stored or logged.

import { evasionVariants } from './safetyNormalize.ts';

export type Construct = 'hopelessness' | 'burden' | 'isolation' | 'entrapment' | 'pain';

export const CONSTRUCT_LABELS: Record<Construct, string> = {
  hopelessness: 'hopelessness',
  burden: 'feeling like a burden',
  isolation: 'isolation',
  entrapment: 'feeling trapped or defeated',
  pain: 'emotional pain',
};

/** How many of the person's most recent messages are looked at (the latest included). */
export const WINDOW = 10;

// A person (or people in general) as the one weighed down: where "burden" is about people and not an object.
const PEOPLE = "(?:everyone|everybody|people|others|them|anyone|us|my\\s+(?:family|friends|parents|mom|mum|dad|kids|children|wife|husband|partner|siblings|brother|sister|loved\\s+ones|roommates?)|the\\s+people\\s+(?:around|in)\\s+(?:me|my\\s+life)|those\\s+around\\s+me|everyone\\s+around\\s+me)";
// Where a feeling of being alone is about one place or occasion and not about life.
const SITUATION = "(?!\\s+(?:in|at|on|during|for)\\s+(?:this|that|the|my|our|a)\\s+(?:zoom|call|calls|meeting|meetings|class|classroom|room|office|team|group|lecture|conference|party|event|chat|remote|lab|session|webinar|queue|line|train|bus|flight|plane|hike|trip|shift|gym|cafeteria|lunch|dorm|tent|cabin|car|house\\s+tonight|work\\s+trip)\\b)(?!\\s+(?:at|during|on)\\s+(?:work|school|lunch|the\\s+(?:party|office|wedding|conference|event|hike|trip)))";

interface Pattern {
  construct: Construct;
  re: RegExp;
}

const p = (construct: Construct, source: string): Pattern => ({ construct, re: new RegExp(source, 'gi') });

const I_AM = "(?:i'?m|i\\s+am|i\\s+feel(?:\\s+like(?:\\s+i'?m|\\s+i\\s+am)?)?|feeling(?:\\s+like)?|i'?ve\\s+been\\s+feeling(?:\\s+like)?|i\\s+have\\s+been\\s+feeling(?:\\s+like)?|i\\s+(?:just|really|honestly)\\s+feel(?:\\s+like)?|i\\s+think\\s+i'?m|i'?m\\s+becoming|i\\s+am\\s+becoming|i'?ve\\s+become)";
const INTENS = '(?:\\s+(?:so|completely|totally|utterly|truly|really|just|such|incredibly|always|constantly|all|nothing\\s+but|only|too))*';

const PATTERNS: Pattern[] = [
  // ── hopelessness
  p('hopelessness', `\\b${I_AM}${INTENS}\\s+hopeless\\b(?!\\s+(?:at|with|romantic|case|cause|fan|addict|optimist|cook|dancer|singer|driver|speller))`),
  p('hopelessness', "\\b(?:there'?s|there\\s+is|i\\s+have|i\\s+see|i\\s+feel)\\s+no\\s+hope(?=\\s*(?:[.!?,;]|$|left|for\\s+me|of\\s+(?:things\\s+)?(?:getting|ever)|anymore|any\\s+more|at\\s+all))"),
  p('hopelessness', "\\b(?:things|nothing|it|this|life)(?:\\s+will|\\s+is\\s+going\\s+to|'s\\s+going\\s+to|\\s+are\\s+going\\s+to)?\\s+never\\s+(?:get\\s+better|improve|be\\s+(?:okay|ok))\\b"),
  p('hopelessness', "\\bnothing\\s+(?:will\\s+)?ever\\s+(?:gets?\\s+better|changes?|improves?)(?=\\s*(?:[.!?,;]|$|for\\s+me|anymore|any\\s+more|no\\s+matter))"),
  p('hopelessness', "\\bi'?ll\\s+never\\s+(?:get\\s+better|be\\s+(?:happy|okay|ok|normal|better)|feel\\s+(?:better|okay|ok|happy|normal)|recover)\\b"),
  p('hopelessness', "\\b(?:there'?s|there\\s+is)\\s+no\\s+point\\s+(?:in|to)\\s+(?:going\\s+on|trying\\s+anymore|trying\\s+any\\s+more|living|anything|continuing)\\b"),
  p('hopelessness', "\\bwhat'?s\\s+the\\s+point\\s+of\\s+(?:anything|going\\s+on|trying|living|it\\s+all|any\\s+of\\s+it|my\\s+life|life)\\b"),
  p('hopelessness', "\\bi\\s+(?:can'?t|cannot|don'?t|do\\s+not)\\s+see\\s+(?:a\\s+|any\\s+)?(?:future|hope|way\\s+forward)(?=\\s*(?:[.!?,;]|$|for\\s+me|anymore|any\\s+more))"),
  p('hopelessness', "\\b(?:my\\s+)?life\\s+(?:isn'?t|is\\s+not)\\s+worth\\s+living\\b"),
  p('hopelessness', "\\bi\\s+(?:have\\s+)?given\\s+up\\s+(?:on\\s+)?(?:everything|life|myself|hope)\\b"),

  // ── feeling like a burden
  p('burden', `\\b${I_AM}${INTENS}\\s+(?:a\\s+|an\\s+)?burden(?:\\s+(?:on|to|for)\\s+${PEOPLE}|(?=\\s*(?:[.!?,;]|$|and\\b|but\\b|anymore|any\\s+more|now|lately|really|because|so\\b)))`),
  p('burden', "\\b(?:tired|sick)\\s+of\\s+(?:being|feeling\\s+like)\\s+a\\s+burden\\b"),
  p('burden', `\\b(?:i\\s+)?(?:hate|can'?t\\s+stand)\\s+(?:being|feeling\\s+like)\\s+a\\s+burden(?:\\s+(?:on|to)\\s+${PEOPLE})?\\b`),
  p('burden', `\\bi\\s+(?:don'?t|do\\s+not)\\s+want\\s+to\\s+be\\s+a\\s+burden\\s+(?:anymore|any\\s+more|on\\s+${PEOPLE}\\s+anymore)`),
  p('burden', `\\b(?:i'?m|i\\s+am|i\\s+feel\\s+like\\s+i'?m)\\s+(?:just\\s+)?(?:too\\s+much|so\\s+much)\\s+(?:work\\s+)?for\\s+${PEOPLE}\\b`),
  p('burden', "\\b(?:everyone|everybody|they|people|my\\s+(?:family|friends|parents|kids|wife|husband|partner))\\s+(?:would|'d)\\s+(?:be\\s+)?(?:happier|relieved|have\\s+an\\s+easier\\s+time|be\\s+lighter)\\s+(?:if\\s+i\\s+(?:was|were)\\s+(?:gone|not\\s+(?:here|around))|without\\s+me)\\b"),
  p('burden', `\\bi\\s+(?:keep\\s+)?(?:feel|feeling)\\s+like\\s+(?:i'?m\\s+)?(?:a\\s+)?(?:burden|weight)\\s+(?:on|to)\\s+${PEOPLE}\\b`),

  // ── isolation
  p('isolation', "\\b(?:nobody|no\\s+one|noone)\\s+(?:would|will|'d|wo?uld)\\s+(?:even\\s+)?(?:notice|miss|care)(?:\\s+about)?\\s+(?:me|if\\s+i|when\\s+i|that\\s+i)\\b"),
  p('isolation', "\\b(?:nobody|no\\s+one|noone)\\s+(?:really\\s+|even\\s+)?(?:cares\\s+(?:about|for)|understands|likes|loves|wants|needs|listens\\s+to|talks\\s+to|checks\\s+(?:in\\s+)?on)\\s+me\\b"),
  p('isolation', "\\bi\\s+(?:have|got|'ve\\s+got)\\s+(?:no\\s+one|nobody)\\s+(?:left|to\\s+talk\\s+to|to\\s+turn\\s+to|in\\s+my\\s+life|who\\s+(?:cares|understands))\\b"),
  p('isolation', "\\bi\\s+(?:have|got|'ve\\s+got)\\s+no\\s+(?:real\\s+)?friends\\b"),
  p('isolation', "\\bi\\s+(?:don'?t|do\\s+not)\\s+belong\\s+(?:anywhere|in\\s+this\\s+world|with\\s+anyone)\\b"),
  p('isolation', `\\b(?:i'?m|i\\s+am|i\\s+feel|feeling|i'?ve\\s+been\\s+feeling|i\\s+have\\s+been\\s+feeling)\\s+(?:so|completely|totally|utterly|truly|really|all|always|constantly|incredibly|painfully)(?:\\s+(?:so|completely|totally|utterly|truly|really|all|always|constantly|incredibly|painfully))*\\s+(?:alone|lonely|isolated)\\b${SITUATION}`),
  p('isolation', `\\b(?:i'?m|i\\s+am|i\\s+feel|feeling)\\s+(?:so\\s+)?(?:alone|lonely|isolated|cut\\s+off|disconnected)\\s+(?:from\\s+(?:everyone|everybody|the\\s+world|all\\s+my\\s+friends|my\\s+family|everything|other\\s+people)|in\\s+(?:the|this)\\s+world|all\\s+the\\s+time)\\b`),
  p('isolation', "\\bi\\s+(?:feel|am|'m)\\s+invisible(?:\\s+to\\s+everyone)?(?=\\s*(?:[.!?,;]|$|to\\s+everyone|to\\s+everybody))"),

  // ── entrapment or defeat
  p('entrapment', `\\b(?:i'?m|i\\s+am|i\\s+feel|feeling|i\\s+feel\\s+so)${INTENS}\\s+(?:trapped|cornered)\\s+(?:in\\s+(?:my\\s+(?:own\\s+)?(?:life|head|mind|body|skin)|this\\s+(?:life|situation|hell|pain))|with\\s+no\\s+(?:way|escape|out)|and\\s+(?:can'?t|cannot)\\s+(?:escape|get\\s+out))`),
  p('entrapment', "\\bno\\s+(?:way|escape|exit)\\s+out(?=\\s*(?:[.!?,;]|$|for\\s+me|anymore|and\\b|of\\s+(?:this|it|my\\s+(?:life|pain|situation))\\b))"),
  p('entrapment', "\\bi\\s+(?:can'?t|cannot)\\s+(?:take|stand|bear)\\s+(?:it|this)\\s+(?:anymore|any\\s+more|any\\s+longer)\\b"),
  p('entrapment', "\\bi\\s+(?:can'?t|cannot)\\s+go\\s+on(?=\\s*(?:[.!?,;]|$|anymore|any\\s+more|any\\s+longer|like\\s+(?:this|that)|this\\s+way|living|without|alone|with\\s+(?:this|it|life|living|my\\s+life)))"),
  p('entrapment', `\\b(?:i'?m|i\\s+am|i\\s+feel|feeling)${INTENS}\\s+(?:worthless(?!\\s+(?:at|with|as|in)\\b)|a\\s+(?:total|complete|utter)\\s+failure(?!\\s+(?:at|with|as|in)\\b))\\b`),
  p('entrapment', "\\bi\\s+feel\\s+like\\s+(?:a\\s+)?(?:total|complete|utter)\\s+failure\\b"),
  p('entrapment', "\\bi\\s+(?:have|'?ve)\\s+failed\\s+everyone\\b"),
  p('entrapment', "\\bi\\s+(?:feel|am|'m)\\s+(?:completely\\s+|totally\\s+)?(?:defeated|broken)(?=\\s*(?:[.!?,;]|$|inside|and\\b))"),

  // ── emotional pain
  p('pain', `\\b(?:i'?m|i\\s+am|i\\s+feel|feeling|i\\s+have|i'?ve\\s+got|i'?m\\s+in|i\\s+am\\s+in|i\\s+carry)\\s+(?:so\\s+|such\\s+|too\\s+|a\\s+lot\\s+of\\s+|so\\s+much\\s+|unbearable\\s+|this\\s+|constant\\s+)*(?:emotional|inner|mental|psychological)\\s+pain\\b`),
  p('pain', "\\b(?:the|this|my)\\s+(?:emotional|inner|psychological|mental)\\s+pain\\s+(?:is|won'?t|never|doesn'?t)\\b"),
  p('pain', "\\b(?:it|everything)\\s+(?:hurts|is\\s+hurting)\\s+so\\s+(?:much|badly|bad)\\s+inside\\b|\\bi\\s+(?:hurt|am\\s+hurting|'m\\s+hurting)\\s+so\\s+(?:much|badly|bad)\\s+inside\\b"),
  p('pain', "\\bi\\s+(?:can'?t|cannot)\\s+(?:bear|stand|handle|take)\\s+(?:this|the|my)\\s+(?:emotional|inner|psychological|mental)\\s+pain\\b"),
];

// Stories, songs, games and quotations: the words are not the person's own account.
const NOT_OWN = /\b(?:game|games|dream|dreamt|dreamed|nightmare|movie|film|novel|screenplay|story|stories|song|songs|lyrics|poem|poetry|book|show|episode|character|role-?play|minecraft|fortnite|gta|quote|quoted|she\s+said|he\s+said|they\s+said|says\s+that|wrote\s+that|reads?\s+like)\b/i;
// A hypothetical in the same sentence before the phrase.
const HYPOTHETICAL = /\b(?:if|suppose|imagine|pretend|what\s+if|whenever|would\s+you)\b/i;
// A negation just before the phrase cancels it ("I'm not hopeless", "I never feel like a burden").
const NEGATION_BEFORE = /(?:\b(?:not|never|no\s+longer|hardly|rarely|barely)|n't)\s+(?:\w+\s+){0,2}$/i;

function sentencesOf(text: string): string[] {
  return text.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);
}

function constructsInSpelling(text: string, into: Set<Construct>): void {
  const t = text.replace(/[‘’]/g, "'");
  for (const s of sentencesOf(t)) {
    if (NOT_OWN.test(s)) continue;
    for (const { construct, re } of PATTERNS) {
      if (into.has(construct)) continue;
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(s))) {
        const before = s.slice(0, m.index);
        if (!HYPOTHETICAL.test(before) && !NEGATION_BEFORE.test(before.slice(-30))) {
          into.add(construct);
          break;
        }
        if (m[0].length === 0) re.lastIndex++;
      }
    }
  }
}

/** Which kinds of sign the message contains, in the first person (as written, and with common spelling tricks undone). Matching only; nothing is kept. */
export function constructsIn(text: string): Set<Construct> {
  const found = new Set<Construct>();
  constructsInSpelling(text, found);
  if (found.size < PATTERN_KINDS) for (const v of evasionVariants(text)) constructsInSpelling(v, found);
  return found;
}

const PATTERN_KINDS = 5;
