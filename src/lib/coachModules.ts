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
  /** Private record of where each module came from (`docs`: the provenance register; tags P podcast patterns, F ICARUS-VOLT, N NVC, O the owner's own). Kept in the same file so it stays true after edits. Never read by `buildNotes`, so it is never sent to a model. */
  provenance?: Record<string, { tag: string; note?: string }>;
}

// Groups, in the order of attention: safety first, then the framework's lenses (what is blocking the person), then
// the coaching moves (how to answer), then resources. Within a group, earlier entries win when more match than fit.
export type ModuleGroup = 'safety' | 'lens' | 'move' | 'resource';

const TRIGGERS: Array<[id: string, group: ModuleGroup, patterns: RegExp[]]> = [
  // Safety: deep or trauma-like fear goes to a skilled person, not to a skill.
  ['deep_fear_refer_out', 'safety', [/\b(trauma\w*|flashback\w*|ptsd|dissociat\w+|freeze response|i (?:always )?freeze up|frozen (?:in place|solid)|shut(?:s|ting)? down (?:completely|entirely)|panic attacks?|can't (?:breathe|speak|move) (?:when|around)|terrified of (?:everyone|people))\b/]],

  // Lenses (internal reading of what is blocking the person).
  ['reserves', 'lens', [/\b(exhaust\w*|burn(?:ed|t)? out|burnout|drained|depleted|no energy|nothing left|running on (?:empty|fumes)|can't keep going|too tired|worn (?:out|down)|no capacity|wiped out)\b/]],
  // A caregiver with nothing left: caring for someone and depletion, anywhere in what they have said.
  ['care_depleted', 'lens', [/(?=[\s\S]*\b(?:caring for|care for|caregiver|carer|looking after|look after|taking care of|take care of)\b)(?=[\s\S]*\b(?:exhaust\w*|drained|depleted|nothing left|burn(?:ed|t)? out|burnout|running on empty|no energy|worn out|can't keep (?:going|doing))\b)/]],
  ['legitimacy', 'lens', [/\b(don't listen|doesn't listen|not listening|never listen\w*|won't listen|dismiss\w*|ignor\w+ me|not taken seriously|don't believe me|doesn't believe me|invalidat\w+|gaslight\w*|talks? over me|discount\w*|no one (?:hears|takes)|silenced|my (?:experience|word) (?:doesn't|does not) count)\b/]],
  // Intent is never read into a description (owner, 2026-11-14): the coach cannot know anyone's intent. These two fire only on the person's own words
  // that it was, or was not, meant. "Bully", "takes credit", "undermines" and the like fall back to the core.
  ['harm_named_as_intended', 'lens', [/\b(on purpose|deliberately|intentionally|out to get me|(?:doing|did|does) (?:it|this|that) to (?:hurt|punish|spite|get at) me|trying to (?:sabotage|punish|silence|hurt|undermine|get rid of) me|target(?:s|ed|ing) me)\b/]],
  ['inward_turn', 'lens', [/\b(my fault|i'm (?:the problem|not good enough|too sensitive|overreacting|a failure|just lazy|just weak)|something(?: is)? wrong with me|i must be (?:crazy|overreacting|imagining)|i should (?:just )?be able to)\b/]],
  ['split_values', 'lens', [/\b(part of me|torn between|half of me|two minds|caught between|on one hand|want both|can't decide between)\b/]],
  ['recurrence', 'lens', [/\b(same (?:fight|argument|thing|pattern)|again and again|over and over|one thing goes wrong|everything (?:falls apart|goes wrong)|snowball\w*|spiral\w*|domino|nothing (?:ever )?sticks)\b/]],
  ['frozen_system', 'lens', [/\b(nothing (?:ever )?changes|won't change|never changes|set in (?:their|its) ways|no matter what i (?:do|say|try)|no point (?:in )?(?:trying|raising)|always been (?:this|that) way|stonewall\w*)\b/]],
  ['systemic_scale', 'lens', [/\b(the whole (?:system|company|team|culture|department|family)|everyone (?:here|in)|polic(?:y|ies)|structural\w*|systemic|bureaucra\w+|bigger than me|the way (?:it|things) (?:is|are) set up)\b/]],
  ['pressure', 'lens', [/\b(about to (?:snap|explode|quit|break)|can't (?:take|do) (?:this|it) any ?more|breaking point|at my limit|ready to (?:quit|walk out|explode)|bottling|holding (?:it|everything) in)\b/]],
  ['over_smoothing', 'lens', [/\b(we always (?:make up|move on)|sweep\w* (?:it )?under|never (?:talk|discuss|address)\w* (?:it|about it)|keeps happening (?:but|and)|make up and then|forgive and forget)\b/]],
  ['harm_named_as_unintended', 'lens', [/\b(didn't mean (?:to|it)|did not mean (?:to|it)|wasn't intentional|was not intentional|unintentional\w*|by accident|accidentally|didn't realize|did not realize|didn't know (?:it|that) would|an oversight)\b/]],
  ['unable_to_begin', 'lens', [/\b(don't know where to start|can't (?:even )?start|can't get (?:myself )?started|freez\w+|paraly\w+|procrastinat\w+|avoiding it|stuck)\b/]],
  ['backup', 'lens', [/\b(only one|single point|no (?:backup|plan b|safety net|savings)|all (?:my|our) eggs|one paycheck|depend\w* on (?:one|him|her|them)|no one else (?:to|can))\b/]],
  // A judgment someone said about them that still stings at that exact spot (Theorems 9 and 10, v4.3 draft).
  ['named_verdict', 'lens', [/\b(?:(?:always|was|were|got|been) told (?:i|me) (?:was|am|were|can't|couldn't|wasn't|would never|will never|had no)|(?:said|told me) (?:that )?i (?:would never|will never|can't|couldn't|was too|am too|wasn't)|made fun of my|laughed at my|mocked my)\b/]],
  // Weighing a choice that touches others (the Ω draft): only then may the coach ask, once, what it costs or gives the people around them.
  ['field_cost', 'lens', [/\b(?:should i (?:take|accept|move|quit|buy|sell|leave|stay|go)|deciding (?:whether|between)|trying to decide|can't decide whether)\b/]],

  // Coaching moves added 2026-11-22 (owner-approved; the text is private). Placed first among the moves: each is narrower than the older ones, so when
  // more than three match, the specific one wins. Every trigger is the person's own words in the latest message and is written to miss lookalikes.
  // These never run in the soften tier (the caller passes skipModules) and the stop tier never reaches the model.
  // Overwhelm, or not wanting to go further: a choice of space, something lighter or later. Needs the person to say it of themselves.
  ['offer_a_smaller_step', 'move', [/\b(?:i(?:'m| am)|i feel|i'm feeling|i am feeling|it(?:'s| is)|this is) (?:so |really |completely |totally |just |getting |all )?overwhelm(?:ed|ing)\b(?! (?:with|by) (?:joy|gratitude|happiness|how (?:kind|good|lovely|generous|much (?:love|support))))|\b(?:this|it) (?:is|feels|'s) (?:all )?too much (?:for me|right now|at the moment)|\bit(?:'s| is) all too much\b|\btoo much to (?:handle|take in|process|think about|hold)|\bi(?:'m| am) (?:so |too |really )?tired (?:to (?:think|talk|go on|do this|keep)|and (?:i )?(?:don't|do not|can't|cannot|just))|\bi(?:'m| am) (?:so |too )?(?:spent|fried) (?:to|and)|(?:don't|do not|can't|cannot) (?:want|manage) to (?:go|get|dig) (?:any )?(?:further|deeper|into (?:it|this) (?:now|any ?more|today|right now))|(?:don't|do not) want to (?:go|get) (?:into|there|further|deeper)|\bcan't (?:go|get) (?:any )?(?:further|deeper) (?:into|with) (?:this|it)|\bi'?d rather not (?:go|get|talk|dig) (?:into|about|there|further|deeper|any)|\bneed (?:a break|to (?:pause|stop|step away)) (?:from (?:this|all this|all of this|talking|thinking|it)|for now|right now)|\b(?:let's|can we|could we) (?:stop|pause) (?:here|for now|this for now)\b/]],
  // A relationship-ending decision (leave, divorce, break up, cut off) together with fresh pain, both in the latest message.
  ['grieve_before_deciding', 'move', [/(?=[\s\S]*\b(?:i|should i|do i|i'm|i am)\b(?:(?!\b(?:never|not|won't|wouldn't|don't|do not|no)\b)[^.?!]){0,40}?\b(?:leav(?:e|ing) (?:him|her|them|my (?:husband|wife|partner|spouse|boyfriend|girlfriend|marriage|relationship))|divorc(?:e|ing) (?:him|her|them|my (?:husband|wife|spouse))|break(?:ing)? up with (?:him|her|them|my (?:boyfriend|girlfriend|partner))|call(?:ing)? it quits|end(?:ing)? (?:things with (?:him|her|them)|the (?:marriage|relationship|friendship)|our (?:marriage|relationship|friendship))|cut(?:ting)? (?:him|her|them|my (?:mother|father|mom|dad|sister|brother|friend)|my (?:best )?friend) (?:off|out)|walk(?:ing)? (?:away from|out on) (?:him|her|them|my (?:marriage|relationship|husband|wife|partner)))\b)(?=[\s\S]*\b(?:devastated|heartbroken|shattered|gutted|blindsided|betray(?:ed|al)|just (?:found out|discovered|learned|heard)|(?:last night|this morning|an hour ago|just now|today) (?:he|she|they) (?:told|said|admitted|left|cheated|lied|called|texted|sent)|can't stop crying|crying (?:all|since|again|for)|sobbing|in pieces|still shaking|so (?:hurt|angry|furious)|furious|livid|my heart is (?:broken|breaking)|it (?:still )?(?:hurts|burns)|raw)\b)/]],
  // Wanting someone to pay or suffer for what they did. Wanting repayment, or a story about revenge, does not count.
  ['protective_not_punitive', 'move', [/\b(?:(?:want|wants|wish|hope|hoping|need) (?:him|her|them|[a-z]+(?: [a-z]+)?) (?:to|would) (?:suffer|pay for (?:what|this|everything|all|it)|really pay|finally pay|burn|rot|regret|feel (?:what i|the pain|that pain|the hurt|how it feels)|know how (?:it|that) feels|get (?:what (?:he|she|they) deserve\w*|hurt))|(?:make|making|see|watch) (?:him|her|them) (?:pay|suffer|regret|squirm|crawl|hurt)|(?:want|need|crave|craving|thinking (?:of|about)) (?:some )?(?:revenge|payback)|(?:get|getting) (?:back at|even with) (?:him|her|them)|(?:he|she|they) (?:deserves?|deserved) (?:to (?:suffer|pay|burn|rot|hurt|lose everything|be punished|get what)|everything (?:he|she|they) get)|(?:he|she|they) should (?:suffer|burn|rot|pay for what))\b/]],
  // A hard conversation ahead, carried with a lot of charge. Not when the person says they do not want to go there.
  ['rough_draft_first', 'move', [/(?![\s\S]*\b(?:don't|do not|not) want to (?:go there|get into (?:it|that)|talk about (?:it|that)|go into (?:it|that))\b)(?=[\s\S]*\b(?:(?:hard|difficult|big|serious) (?:conversation|talk)|(?:have|need|want|got|going|plan(?:ning)?|trying) to (?:tell|talk to|speak to|confront|say something to|have it out with|bring (?:it|this|something) up with) (?:him|her|them|my \w+|the \w+)|confront(?:ing)? (?:him|her|them|my \w+))\b)(?=[\s\S]*\b(?:furious|livid|seething|fuming|enraged|so (?:angry|mad|pissed)|really (?:angry|mad|pissed)|rage|raging|blood is boiling|shaking (?:with|from) (?:anger|rage)|so much (?:anger|rage|resentment)|full of (?:anger|rage|resentment)|can't (?:hold|keep) (?:it|this) in|want to scream)\b)/]],
  // Wanting to say something hard to someone and wanting something from it: all three must be in the latest message.
  ['two_intentions', 'move', [/(?=[\s\S]*\b(?:hard|difficult|awkward|painful|scared to|nervous about|dreading|afraid to|haven't (?:said|told)|never (?:said|told))\b)(?=[\s\S]*\b(?:(?:want|need|have|got|going|plan(?:ning)?|trying) to (?:tell|talk to|speak to|say something to|bring (?:it|this|something) up with|call out|confront|let) (?:him|her|them|my \w+|the \w+)|(?:conversation|talk) with (?:him|her|them|my \w+))\b)(?=[\s\S]*\b(?:want (?:him|her|them|my \w+) to (?:understand|see|know|stop|listen|notice|get it|care|hear)|call(?:ing)? (?:out|(?:him|her|them|it|this) out)|point(?:ing)? (?:it|this) out|name the pattern|stop (?:doing|this)|understand me|what i (?:even )?want from)\b)/]],
  // A pattern in how someone acts, with how often and what could be seen or heard. The person must name a person (he, she, they, or a role), not a pet or a thing.
  ['name_behavior_neutrally', 'move', [/(?=[\s\S]*\b(?:every time|whenever|each time|any time|keeps|always|again and again|usually)\b)(?=[\s\S]*\b(?:he|she|they|my (?:boss|manager|partner|wife|husband|mom|mum|dad|mother|father|sister|brother|friend|coworker|colleague|roommate|son|daughter|ex|teacher|supervisor|team lead))\b (?:\w+ ){0,3}?(?:change(?:s|d)? (?:the )?(?:subject|topic)|go(?:es)? (?:quiet|silent)|walks? (?:out|away|off)|leaves? the room|cut(?:s|ting)? me off|interrupt(?:s|ing)?|talk(?:s|ing)? over me|(?:check(?:s|ing)?|scroll(?:s|ing)?|look(?:s|ing)?) (?:at |on )?(?:his|her|their) phone|roll(?:s|ing)? (?:his|her|their) eyes|sigh(?:s|ing)?|snap(?:s|ping)?|brush(?:es)? (?:it|me) off|laughs? (?:it|me) off|turns? (?:it|things) (?:around|back on me)|(?:doesn't|does not|don't|do not|won't) (?:answer|reply|respond|look at me|call back)|(?:raises?|lifts?) (?:his|her|their) voice|changes? (?:his|her|their) tone)\b)/]],
  // Knowing what matters and not starting, said by the person. The older "unable to begin" lens is separate and looks at the whole conversation.
  ['smallest_next_step', 'move', [/(?=[\s\S]*\b(?:i know (?:what (?:matters|i want|i need|i should|i have to|to do)|exactly what)|it matters (?:so much |a lot |deeply )?to me|(?:this|it) is (?:so |really |very )?important to me|i care (?:so much |deeply |a lot )?about (?:this|it|that|getting)|i really want (?:this|to (?:finish|write|start|begin|change|learn|make|get back)))\b)(?=[\s\S]*\b(?:keep (?:putting (?:it|this) off|not (?:starting|doing|getting)|avoiding|delaying|postponing)|(?:haven't|have not|still haven't|never) (?:started|begun|gotten started|got started|made a start|done anything)|can't (?:seem to )?(?:start|begin|get started)|(?:put|putting) (?:it|this) off|procrastinat\w+|just (?:can't|don't) (?:start|begin|do it))\b)/]],

  // Coaching moves (how the coach answers), written from what the coach does in the calls.
  ['answer_with_words', 'move', [/\b(how (?:do|can|should|could|would) i (?:say|tell|bring up|raise|ask|approach|respond|word|put)|what (?:do|should|can|could) i say|how to (?:say|tell|ask|bring up|raise|approach)|(?:don't|do not) know how to (?:say|tell|ask|bring|raise|start)|what words|how (?:would|do) you (?:say|put))\b/]],
  ['open_a_hard_conversation', 'move', [/\b(hard (?:conversation|talk)|difficult (?:conversation|talk)|bring (?:it |this )?up|raise (?:it|this|the issue)|confront\w*|(?:have|need|want) to (?:tell|talk to|speak to|say something to)|going to (?:tell|talk to|speak to) (?:him|her|them))\b/]],
  ['ask_for_what_you_want', 'move', [/\b(ask(?:ing)? (?:my \w+|him|her|them|for)|make a request|a request|(?:want|wish) (?:him|her|them|he|she|they) (?:to|would)|why (?:won't|doesn't|can't) (?:he|she|they)|ask for (?:help|what))\b/]],
  ['set_a_boundary', 'move', [/\b(boundar\w+|say no|saying no|can't say no|keeps? (?:yelling|screaming|pushing|crossing)|yells? at me|screams? at me|walks? all over|takes? advantage|too much of my|need (?:some )?space|step back|pull back|stop (?:letting|allowing)|overstep\w*)\b/]],
  ['empathize_before_asking', 'move', [/\b(?:(?:he|she|they)(?:'ll| will| would) (?:say|object|push back|get defensive)|(?:he|she|they) (?:might|may|could) (?:say|object|push back|get defensive)|(?:he|she|they)(?:'s| is| are) going to (?:say|object|push back|get defensive)|defensive|push back|pushback)\b/]],
  ['say_the_real_feeling', 'move', [/\b(pretend\w*|acting (?:like|as if)|act (?:like|as if)|fake (?:it|being)|say(?:ing)? it's fine|go(?:ing)? along|play(?:ing)? along|put on a (?:brave )?face)\b/]],
  ['read_a_silence', 'move', [/\b(goes? (?:quiet|silent)|went (?:quiet|silent)|silent treatment|stops? (?:talking|responding|answering)|shuts? down|won't (?:talk|answer|respond)|doesn't (?:respond|answer|reply)|ghost\w*)\b/]],
  ['reaction_as_information', 'move', [/\b(what if (?:he|she|they) (?:says?|reacts?|gets?|doesn't|won't)|how (?:will|would|might) (?:he|she|they) (?:react|respond|take)|afraid (?:he|she|they)(?:'ll| will)|worried (?:about )?(?:how|what) (?:he|she|they)|(?:worried|afraid|scared|nervous|anxious) (?:that )?(?:it|this|that|he|she|they) (?:might|may|will|would|could|'ll)|(?:might|may|will|would|could) (?:just )?make (?:her|him|them) (?:more )?(?:upset|angry|mad|defensive|worse))\b/]],
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
  reserves: ['answer_with_words', 'open_a_hard_conversation', 'ask_for_what_you_want', 'empathize_before_asking', 'offer_to_play_the_other', 'reaction_as_information', 'set_a_boundary', 'say_the_real_feeling', 'read_a_silence', 'closure_check', 'power_difference', 'rough_draft_first', 'two_intentions', 'name_behavior_neutrally', 'smallest_next_step'],
  care_depleted: ['answer_with_words', 'open_a_hard_conversation', 'ask_for_what_you_want', 'empathize_before_asking', 'offer_to_play_the_other', 'reaction_as_information', 'set_a_boundary', 'say_the_real_feeling', 'read_a_silence', 'closure_check', 'power_difference', 'rough_draft_first', 'two_intentions', 'name_behavior_neutrally', 'smallest_next_step'],
  harm_named_as_intended: ['empathize_before_asking', 'open_a_hard_conversation', 'ask_for_what_you_want', 'offer_to_play_the_other', 'reaction_as_information', 'reframe_gently', 'closure_check', 'rough_draft_first', 'two_intentions', 'name_behavior_neutrally', 'smallest_next_step'],
};

const CAPS: Record<ModuleGroup, number> = { safety: 1, lens: 2, move: 3, resource: 1 };

export const MODULE_IDS = TRIGGERS.map(([id]) => id);
export const MODULE_GROUPS: Record<string, ModuleGroup> = Object.fromEntries(TRIGGERS.map(([id, group]) => [id, group]));

const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");

/** Ids of the modules that fit this conversation, in order of attention (safety, lenses, moves, resources). `exclude` leaves whole groups out. */
export function selectModules(userTexts: string[], max = 3, exclude: ModuleGroup[] = []): string[] {
  // Safety and lens modules look at everything the person has said (what is blocking them stays true). The coaching moves and
  // resources look only at the latest message: what they ask for or react to now. Without this, a "how do I say..." from
  // two turns ago kept the "give them words" module on, and the coach offered the same words again.
  const whole = fold(userTexts.join('\n'));
  const latest = fold(userTexts[userTexts.length - 1] ?? '');
  const hit = new Set<string>();
  for (const [id, group, patterns] of TRIGGERS) {
    const text = group === 'safety' || group === 'lens' ? whole : latest;
    if (patterns.some((p) => p.test(text))) hit.add(id);
  }
  // Leave out moves that pull against a lens that applies.
  for (const lens of Object.keys(SUPPRESS)) if (hit.has(lens)) SUPPRESS[lens].forEach((id) => hit.delete(id));
  // "Offer a smaller step" is one clear offer (space, something lighter, or later) and nothing beside it (owner, 2026-11-22): when it applies, the other moves are left out.
  if (hit.has('offer_a_smaller_step')) for (const [id, group] of TRIGGERS) if (group === 'move' && id !== 'offer_a_smaller_step') hit.delete(id);
  const out: string[] = [];
  const used: Record<string, number> = { safety: 0, lens: 0, move: 0, resource: 0 };
  for (const [id, group] of TRIGGERS) {
    if (!hit.has(id) || exclude.includes(group) || used[group] >= CAPS[group]) continue;
    out.push(id);
    used[group]++;
    if (out.length >= max) break;
  }
  return out;
}

/** Core plus the chosen modules, within a character budget. */
export function buildNotes(set: ModuleSet, userTexts: string[], opts: { skipModules?: boolean; maxChars?: number; exclude?: ModuleGroup[] } = {}): string {
  const maxChars = opts.maxChars ?? 9000;
  const parts = [set.core.trim()];
  if (!opts.skipModules) {
    for (const id of selectModules(userTexts, 3, opts.exclude)) {
      const body = set.modules[id]?.trim();
      if (body && parts.join('\n\n').length + body.length + 2 <= maxChars) parts.push(body);
    }
  }
  return parts.join('\n\n');
}
