// Topics where the coach must not challenge, push or "stretch" a person: grief, trauma and abuse, health fears, exhaustion and
// overwhelm, self-blame, acute pain. Used by the stance gate (src/lib/stances.ts): when one of these is present, any stance that
// adds challenge falls back to the base (the empathic stance). Deliberately broad: a false match only means the coach stays gentle.
// Plain phrase matching, like the crisis check; it misses what it does not list.

export type SensitiveTopic = 'grief' | 'trauma' | 'health' | 'overwhelm' | 'self-blame' | 'acute-pain';

const TOPICS: [SensitiveTopic, RegExp][] = [
  ['grief', /\b(?:died|passed away|passed on|death of|funeral|memorial|bereave\w*|griev\w*|miscarriage|stillborn|lost (?:my|our) (?:mother|father|mom|dad|wife|husband|partner|child|son|daughter|brother|sister|friend|pet|dog|cat|baby|grandmother|grandfather)|no longer with us)\b/i],
  ['trauma', /\b(?:abus\w*|assault\w*|rape\w*|raped|molest\w*|traumati[sz]\w*|trauma|ptsd|flashbacks?|stalk\w*|domestic violence|violent|violence|attacked|survivor)\b/i],
  ['health', /\b(?:cancer|terminal|chemo\w*|biopsy|surgery|test results?|health (?:news|scare|fears?)|heart attack|stroke|dying|diagnosed|diagnosis|illness|chronic pain|hospital|prognosis)\b/i],
  ['overwhelm', /\b(?:exhausted|burn(?:ed|t)? out|burnout|overwhelm\w*|can'?t cope|can'?t handle|drowning|falling apart|breaking down|at my limit|worn down|running on empty|nothing left)\b/i],
  ['self-blame', /\b(?:my fault|worthless|useless|i'?m (?:a )?(?:failure|burden|stupid|idiot|not good enough|too much|broken)|hate myself|ashamed of myself|i deserve (?:it|this|to suffer)|i always (?:fail|mess up|ruin))\b/i],
  ['acute-pain', /\b(?:heartbroken|devastated|can'?t stop crying|crying all|sobbing|panic attack|terrified|so scared|in so much pain|can'?t breathe)\b/i],
];

/** The sensitive topics found in the text, without repeats. */
export function detectSensitiveTopics(...texts: string[]): SensitiveTopic[] {
  const t = texts.join('\n').replace(/[‘’]/g, "'");
  return TOPICS.filter(([, re]) => re.test(t)).map(([name]) => name);
}
