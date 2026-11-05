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

// Groups, in the order of attention: safety first, then the framework's lenses (what is blocking the person), then
// the coaching moves (how to answer), then resources. Within a group, earlier entries win when more match than fit.
export type ModuleGroup = 'safety' | 'lens' | 'move' | 'resource';

const TRIGGERS: Array<[id: string, group: ModuleGroup, patterns: RegExp[]]> = [
  // Safety: deep or trauma-like fear goes to a skilled person, not to a skill.
  ['deep_fear_refer_out', 'safety', [/\b(trauma\w*|flashback\w*|ptsd|dissociat\w+|freeze response|i (?:always )?freeze up|frozen (?:in place|solid)|shut(?:s|ting)? down (?:completely|entirely)|panic attacks?|can't (?:breathe|speak|move) (?:when|around)|terrified of (?:everyone|people))\b/]],

  // Lenses (internal reading of what is blocking the person).
  ['reserves', 'lens', [/\b(exhaust\w*|burn(?:ed|t)? out|burnout|drained|depleted|no energy|nothing left|running on (?:empty|fumes)|can't keep going|too tired|worn (?:out|down)|no capacity|wiped out)\b/]],
  ['legitimacy', 'lens', [/\b(don't listen|doesn't listen|not listening|never listen\w*|won't listen|dismiss\w*|ignor\w+ me|not taken seriously|don't believe me|doesn't believe me|invalidat\w+|gaslight\w*|talks? over me|discount\w*|no one (?:hears|takes)|silenced|my (?:experience|word) (?:doesn't|does not) count)\b/]],
  ['deliberate_harm', 'lens', [/\b(on purpose|deliberate\w*|target(?:s|ed|ing) me|sabotag\w+|retaliat\w+|punish\w* me|every time i try|blocks? me|undermin\w+|bully\w*|harass\w*|intimidat\w+|takes? (?:the )?credit|manipulat\w+|threaten\w*)\b/]],
  ['inward_turn', 'lens', [/\b(my fault|i'm (?:the problem|not good enough|too sensitive|overreacting|a failure|just lazy|just weak)|something(?: is)? wrong with me|i must be (?:crazy|overreacting|imagining)|i should (?:just )?be able to)\b/]],
  ['split_values', 'lens', [/\b(part of me|torn between|half of me|two minds|caught between|on one hand|want both|can't decide between)\b/]],
  ['recurrence', 'lens', [/\b(same (?:fight|argument|thing|pattern)|again and again|over and over|one thing goes wrong|everything (?:falls apart|goes wrong)|snowball\w*|spiral\w*|domino|nothing (?:ever )?sticks)\b/]],
  ['frozen_system', 'lens', [/\b(nothing (?:ever )?changes|won't change|never changes|set in (?:their|its) ways|no matter what i (?:do|say|try)|no point (?:in )?(?:trying|raising)|always been (?:this|that) way|stonewall\w*)\b/]],
  ['systemic_scale', 'lens', [/\b(the whole (?:system|company|team|culture|department|family)|everyone (?:here|in)|polic(?:y|ies)|structural\w*|systemic|bureaucra\w+|bigger than me|the way (?:it|things) (?:is|are) set up)\b/]],
  ['pressure', 'lens', [/\b(about to (?:snap|explode|quit|break)|can't (?:take|do) (?:this|it) any ?more|breaking point|at my limit|ready to (?:quit|walk out|explode)|bottling|holding (?:it|everything) in)\b/]],
  ['over_smoothing', 'lens', [/\b(we always (?:make up|move on)|sweep\w* (?:it )?under|never (?:talk|discuss|address)\w* (?:it|about it)|keeps happening (?:but|and)|make up and then|forgive and forget)\b/]],
  ['careless_harm', 'lens', [/\b(didn't mean|did not mean|unintentional\w*|by accident|misunderst\w+|miscommunicat\w+|oversight|didn't realize|thoughtless)\b/]],
  ['unable_to_begin', 'lens', [/\b(don't know where to start|can't (?:even )?start|can't get (?:myself )?started|freez\w+|paraly\w+|procrastinat\w+|avoiding it|stuck)\b/]],
  ['backup', 'lens', [/\b(only one|single point|no (?:backup|plan b|safety net|savings)|all (?:my|our) eggs|one paycheck|depend\w* on (?:one|him|her|them)|no one else (?:to|can))\b/]],

  // Coaching moves (how the coach answers), written from what the coach does in the calls.
  ['answer_with_words', 'move', [/\b(how (?:do|can|should|could|would) i (?:say|tell|bring up|raise|ask|approach|respond|word|put)|what (?:do|should|can|could) i say|how to (?:say|tell|ask|bring up|raise|approach)|(?:don't|do not) know how to (?:say|tell|ask|bring|raise|start)|what words|how (?:would|do) you (?:say|put))\b/]],
  ['open_a_hard_conversation', 'move', [/\b(hard (?:conversation|talk)|difficult (?:conversation|talk)|bring (?:it |this )?up|raise (?:it|this|the issue)|confront\w*|(?:have|need|want) to (?:tell|talk to|speak to|say something to)|going to (?:tell|talk to|speak to) (?:him|her|them))\b/]],
  ['ask_for_what_you_want', 'move', [/\b(ask(?:ing)? (?:my \w+|him|her|them|for)|make a request|a request|(?:want|wish) (?:him|her|them|he|she|they) (?:to|would)|why (?:won't|doesn't|can't) (?:he|she|they)|ask for (?:help|what))\b/]],
  ['set_a_boundary', 'move', [/\b(boundar\w+|say no|saying no|can't say no|keeps? (?:yelling|screaming|pushing|crossing)|yells? at me|screams? at me|walks? all over|takes? advantage|too much of my|need (?:some )?space|step back|pull back|stop (?:letting|allowing)|overstep\w*)\b/]],
  ['empathize_before_asking', 'move', [/\b(?:(?:he|she|they)(?:'ll| will| would) (?:say|object|push back|get defensive)|(?:he|she|they) (?:might|may|could) (?:say|object|push back|get defensive)|(?:he|she|they)(?:'s| is| are) going to (?:say|object|push back|get defensive)|defensive|push back|pushback)\b/]],
  ['say_the_real_feeling', 'move', [/\b(pretend\w*|acting (?:like|as if)|act (?:like|as if)|fake (?:it|being)|say(?:ing)? it's fine|go(?:ing)? along|play(?:ing)? along|put on a (?:brave )?face)\b/]],
  ['read_a_silence', 'move', [/\b(goes? (?:quiet|silent)|went (?:quiet|silent)|silent treatment|stops? (?:talking|responding|answering)|shuts? down|won't (?:talk|answer|respond)|doesn't (?:respond|answer|reply)|ghost\w*)\b/]],
  ['reaction_as_information', 'move', [/\b(what if (?:he|she|they) (?:says?|reacts?|gets?|doesn't|won't)|how (?:will|would|might) (?:he|she|they) (?:react|respond|take)|afraid (?:he|she|they)(?:'ll| will)|worried (?:about )?(?:how|what) (?:he|she|they))\b/]],
  ['closure_check', 'move', [/\b(?:says? it(?:'s| is) (?:fine|ok|okay)|said it(?:'s| was| is) (?:fine|ok|okay)|says? (?:they're|he's|she's|they are|he is|she is) (?:fine|ok|okay)|moved on|closure|won't (?:discuss|talk about) it|leave(?:s)? it at|let it go)\b/]],
  ['power_difference', 'move', [/\b(my (?:daughter|son|child|kid|kids|employee|employees|staff|student|students|team|direct reports?)|i'm (?:her|his|their) (?:boss|manager|parent|mother|father|teacher)|i (?:manage|supervise|lead)|power (?:imbalance|difference|dynamic)|younger than me)\b/]],
  ['offer_to_play_the_other', 'move', [/\b(rehears\w+|practice (?:what|how|the conversation|saying)|role[- ]?play|before i (?:talk|speak|tell|meet)|i'm (?:about|going) to (?:talk|tell|confront|speak)|i have to (?:talk|tell|go back))\b/]],
  ['reframe_gently', 'move', [/\b(?:(?:he|she|they)(?:'s| is|'re| are) (?:so |just |such |being )?(?:selfish|controlling|lazy|stubborn|manipulative|rude|judgmental|critical|difficult|impossible|a jerk|an idiot|toxic|narcissistic)|always (?:judging|criticiz\w+|complaining))\b/]],
  ['explain_briefly', 'move', [/\b(what (?:is|does|are) (?:a |an |the )?(?:need|needs|nvc|nonviolent communication|request|boundary|trigger|projection)\b|why (?:do|does) (?:i|people|we) react|what does .{1,30} mean|can you explain|explain (?:to me )?(?:what|how|why))/]],
  ['guess_then_check', 'move', [/\b(i feel|i'm feeling|i felt|it hurts|i'm (?:so |really |very )?(?:hurt|sad|angry|upset|frustrated|scared|anxious|lonely|disappointed|resentful|worried)|makes me (?:feel|so))\b/]],

  // Resources.
  ['crisis_lines', 'resource', [/\b(crisis line|hotline|helpline|where (?:can|do) i (?:get|find) help|who (?:can|should) i call|talk to (?:someone|a person) (?:now|today)|find a therapist|need (?:to talk to )?(?:a )?(?:person|professional))\b/]],
  ['cnvc', 'resource', [/\b(nonviolent communication|nvc|cnvc|marshall rosenberg|where (?:can|do) i learn|(?:a )?(?:book|course|class|training) (?:on|about|for)|resources? (?:on|about|for))\b/]],
  ['podcast', 'resource', [/\b(podcast|hear (?:examples|it practiced)|listen to (?:more|examples)|conversations from the heart)\b/]],
];

// When one of these lenses applies, the matching moves would pull against it, so they are left out. The framework
// says: with depleted reserves, offer rest only (no action planning or skill-building); with deliberate suppression,
// skip skill-building and perspective-taking toward the other party, and support boundaries.
const SUPPRESS: Record<string, string[]> = {
  reserves: ['answer_with_words', 'open_a_hard_conversation', 'ask_for_what_you_want', 'empathize_before_asking', 'offer_to_play_the_other', 'reaction_as_information', 'set_a_boundary', 'say_the_real_feeling', 'read_a_silence', 'closure_check', 'power_difference'],
  deliberate_harm: ['empathize_before_asking', 'open_a_hard_conversation', 'ask_for_what_you_want', 'offer_to_play_the_other', 'reaction_as_information', 'reframe_gently', 'closure_check'],
};

const CAPS: Record<ModuleGroup, number> = { safety: 1, lens: 2, move: 3, resource: 1 };

export const MODULE_IDS = TRIGGERS.map(([id]) => id);
export const MODULE_GROUPS: Record<string, ModuleGroup> = Object.fromEntries(TRIGGERS.map(([id, group]) => [id, group]));

const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");

/** Ids of the modules that fit this conversation, in order of attention (safety, lenses, moves, resources). */
export function selectModules(userTexts: string[], max = 3): string[] {
  const text = fold(userTexts.join('\n'));
  const hit = new Set<string>();
  for (const [id, , patterns] of TRIGGERS) if (patterns.some((p) => p.test(text))) hit.add(id);
  // Leave out moves that pull against a lens that applies.
  for (const lens of Object.keys(SUPPRESS)) if (hit.has(lens)) SUPPRESS[lens].forEach((id) => hit.delete(id));
  const out: string[] = [];
  const used: Record<string, number> = { safety: 0, lens: 0, move: 0, resource: 0 };
  for (const [id, group] of TRIGGERS) {
    if (!hit.has(id) || used[group] >= CAPS[group]) continue;
    out.push(id);
    used[group]++;
    if (out.length >= max) break;
  }
  return out;
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
