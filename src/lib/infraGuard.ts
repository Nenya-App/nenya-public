// The guard on replies about how Nenya runs. The coach is not to describe Nenya's hosting, the model or company behind it, its funding or team, how
// data is handled or encrypted, or promise that anything will be passed on: the site has pre-written, checked answers for those questions
// (src/lib/aboutNenya.ts), and a small model otherwise says false things ("we use AWS", "end-to-end encrypted", "HIPAA compliant"). A reply that
// makes such a claim is asked for again once, and if it still does it is replaced by a fixed sentence. This is phrase matching: it will miss some
// and catch some ordinary sentences, and a miss only means the reply stands.

export const INFRA_PATTERNS: RegExp[] = [
  // "we run on AWS", "this site is hosted by Google", "I'm built on OpenAI"
  /\b(?:we|nenya|this (?:site|app|tool)|i)(?:'m| am| are|'re)?\b[^.?!]{0,40}\b(?:run|runs|running|host|hosted|hosts|use|uses|using|store|stores|stored|built|powered|trained)\b[^.?!]{0,40}\b(?:aws|amazon|google|gcp|azure|microsoft|openai|chatgpt|gpt-?\d\w*|anthropic|claude|gemini|llama|mistral|deepseek|meta)\b/i,
  /\bend[- ]to[- ]end\b/i,
  /\b(?:hipaa|gdpr[- ]compliant|gdpr compliant|soc ?2|iso ?27001|ccpa[- ]compliant|pci[- ]compliant)\b/i,
  // promises about data
  /\b(?:nothing(?: you (?:say|write|share|type))?|none of (?:it|this|what you (?:say|write|share|type))) (?:is|will be|gets|ever gets) (?:ever )?(?:stored|saved|kept|recorded|logged|seen|read)\b|\bnever (?:stored|saved|kept|recorded|logged)\b|\b(?:completely|totally|100%|fully) (?:private|anonymous|confidential)\b|\bno one (?:will )?(?:ever )?(?:sees?|reads?)\b/i,
  // claims about what happens to the person's data, kept or not kept ("I don't keep any data", "Nenya doesn't store or use any information about you",
  // "your data is private and secure", "deleted afterward", "anonymous"): the coach cannot know (its instructions do let it say it will not remember
  // this conversation and that Nenya does not keep it, so a plain statement about the conversation itself is not matched), and the pre-written answer says what is true
  /\b(?:don'?t|do not|doesn'?t|does not|never|won'?t|will not|can'?t|cannot|not)\s+(?:\w+\s+){0,2}?(?:keep|store|save|record|log|collect|retain|share|sell|use|track|read|see|access)s?\b[^.?!]{0,30}\b(?:any |your |the |all |a |of )*(?:data|information|details|personal|what you (?:say|write|share|type|tell)|anything (?:about you|you (?:say|write|share|type|tell)))\b/i,
  /\b(?:your|the|this|our)\s+(?:data|information|conversation|chat|messages?|words|details|privacy)\s+(?:is|are|stays?|remains?|will be|gets?)\s+(?:\w+\s+){0,2}?(?:private|secure|safe|anonymous|confidential|protected|encrypted|deleted|erased|forgotten|not (?:stored|saved|kept|recorded|used|shared|sold)|never (?:stored|saved|kept|recorded|used|shared|sold))\b/i,
  /\b(?:is|are|will be|gets?|get)\s+(?:immediately |automatically |permanently |always )?(?:deleted|erased|forgotten|wiped|discarded)\s+(?:afterward|afterwards|after|when|once|as soon|right away|immediately)\b/i,
  /\b(?:completely |totally |fully |100% )?(?:anonymous|confidential)\b/i,
  /\bsafe with me\b|\bwill always be free\b|\balways (?:be )?free\b|\bfree (?:and|&) always\b|\bfree forever\b|\bwill always (?:be )?free\b/i,
  /\b(?:we|nenya|i)\s+(?:immediately |automatically |always )?(?:delete|erase|wipe|discard|destroy)s?\s+(?:everything|all|it|your|the)\b/i,
  // promises to pass things on
  /\b(?:i|we)(?: will|'ll| can| may|'m going to| am going to)? (?:pass|forward|share|send|report|escalate)(?: this| that| it| what you(?:'ve| have)? (?:said|written|shared))?(?: on)? to (?:the |our |a )?(?:team|developers?|staff|humans?|someone|moderators?|creators?|nenya)\b/i,
];

export const claimsInfrastructure = (text: string): boolean => INFRA_PATTERNS.some((r) => r.test(text.replace(/[‘’]/g, "'")));

/** The sentence added to the coach's instructions (a backstop for the question the detector misses). */
export const INFRA_RULE =
  "Do not describe how Nenya is hosted, which model or company runs you, how it is funded, who is on the team, or how data is handled or encrypted, and never claim a certification such as HIPAA or promise to pass anything on to anyone. If asked, say plainly that you do not have that detail and that the About pages and the Terms explain it.";

/** The extra instruction for the one retry. */
export const INFRA_NOTE =
  "Your last reply described how Nenya runs, how data is handled, or promised something it cannot know. Answer again without any such claim: say plainly that you do not have that detail and that the About pages and the Terms explain it, and keep to what the person is feeling or asking.";

/** What the page shows if the retry still makes a claim. */
export const INFRA_FALLBACK =
  "I don't have details about how Nenya runs or what happens to what you write, and I would rather not guess. The About pages and the Terms explain it. What would you like to look at here?";
