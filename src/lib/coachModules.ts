// Chooses which private coaching modules to add to the coach's instructions for a
// given conversation. Only the selection logic lives here (public); the module
// text itself is stored privately (see docs/coach-method-notes.md).
//
// Deterministic phrase matching, like safetyFlags.ts: best effort, never a
// guarantee, and nothing about the person is sent anywhere to decide.

export interface ModuleSet {
  /** Always included. */
  core: string;
  /** id -> text. */
  modules: Record<string, string>;
}

// Listed in the order of attention: when more modules match than fit, earlier ones win.
const TRIGGERS: Array<[id: string, patterns: RegExp[]]> = [
  ['reserves', [/\b(exhaust\w*|burn(?:ed|t)? out|burnout|drained|depleted|no energy|nothing left|running on (?:empty|fumes)|can't keep going|too tired|worn (?:out|down)|no capacity|wiped out)\b/]],
  ['legitimacy', [/\b(don't listen|doesn't listen|not listening|never listen\w*|won't listen|dismiss\w*|ignor\w+ me|not taken seriously|don't believe me|doesn't believe me|invalidat\w+|gaslight\w*|talks? over me|discount\w*|no one (?:hears|takes)|silenced|my (?:experience|word) (?:doesn't|does not) count)\b/]],
  ['deliberate_harm', [/\b(on purpose|deliberate\w*|target(?:s|ed|ing) me|sabotag\w+|retaliat\w+|punish\w* me|every time i try|blocks? me|undermin\w+|bully\w*|harass\w*|intimidat\w+|takes? (?:the )?credit|manipulat\w+|threaten\w*)\b/]],
  ['inward_turn', [/\b(my fault|i'm (?:the problem|not good enough|too sensitive|overreacting|a failure|just lazy|just weak)|something(?: is)? wrong with me|i must be (?:crazy|overreacting|imagining)|i should (?:just )?be able to)\b/]],
  ['split_values', [/\b(part of me|torn between|half of me|two minds|caught between|on one hand|want both|can't decide between)\b/]],
  ['recurrence', [/\b(same (?:fight|argument|thing|pattern)|again and again|over and over|one thing goes wrong|everything (?:falls apart|goes wrong)|snowball\w*|spiral\w*|domino|nothing (?:ever )?sticks)\b/]],
  ['frozen_system', [/\b(nothing (?:ever )?changes|won't change|never changes|set in (?:their|its) ways|no matter what i (?:do|say|try)|no point (?:in )?(?:trying|raising)|always been (?:this|that) way|stonewall\w*)\b/]],
  ['systemic_scale', [/\b(the whole (?:system|company|team|culture|department|family)|everyone (?:here|in)|polic(?:y|ies)|structural\w*|systemic|bureaucra\w+|bigger than me|the way (?:it|things) (?:is|are) set up)\b/]],
  ['pressure', [/\b(about to (?:snap|explode|quit|break)|can't (?:take|do) (?:this|it) any ?more|breaking point|at my limit|ready to (?:quit|walk out|explode)|bottling|holding (?:it|everything) in)\b/]],
  ['over_smoothing', [/\b(we always (?:make up|move on)|sweep\w* (?:it )?under|never (?:talk|discuss|address)\w* (?:it|about it)|keeps happening (?:but|and)|make up and then|forgive and forget)\b/]],
  ['careless_harm', [/\b(didn't mean|did not mean|unintentional\w*|by accident|misunderst\w+|miscommunicat\w+|oversight|didn't realize|thoughtless)\b/]],
  ['unable_to_begin', [/\b(don't know where to start|can't (?:even )?start|can't get (?:myself )?started|freez\w+|paraly\w+|procrastinat\w+|avoiding it|stuck)\b/]],
  ['backup', [/\b(only one|single point|no (?:backup|plan b|safety net|savings)|all (?:my|our) eggs|one paycheck|depend\w* on (?:one|him|her|them)|no one else (?:to|can))\b/]],
];

export const MODULE_IDS = TRIGGERS.map(([id]) => id);

const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");

/** Ids of the modules that fit this conversation, in order of attention. */
export function selectModules(userTexts: string[], max = 3): string[] {
  const text = fold(userTexts.join('\n'));
  const hits: string[] = [];
  for (const [id, patterns] of TRIGGERS) {
    if (patterns.some((p) => p.test(text))) hits.push(id);
    if (hits.length >= max) break;
  }
  return hits;
}

/** Core plus the chosen modules, within a character budget. */
export function buildNotes(set: ModuleSet, userTexts: string[], opts: { skipModules?: boolean; maxChars?: number } = {}): string {
  const maxChars = opts.maxChars ?? 9000;
  const parts = [set.core.trim()];
  if (!opts.skipModules) {
    for (const id of selectModules(userTexts)) {
      const body = set.modules[id]?.trim();
      if (body && parts.join('\n\n').length + body.length + 2 <= maxChars) parts.push(body);
    }
  }
  return parts.join('\n\n');
}
