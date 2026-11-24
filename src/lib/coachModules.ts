// Chooses which private coaching modules to add to the coach's instructions for a
// given conversation. Only the selection logic lives here (public); the module
// text itself is stored privately (see docs/coach-method-notes.md).
//
// Deterministic phrase matching, like safetyFlags.ts: best effort, never a
// guarantee, and nothing about the person is sent anywhere to decide.

import { checkConversation } from './safetyFlags.ts';

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

  // Apologising for needing, asking, wanting or feeling, or saying they should not want, feel or need something (owner, 2026-11-22). An apology for something done to
  // another person ("I'm sorry I yelled at her") does not count. It asks for no action, so it stays available when the person is depleted.
  ['permission_giving', 'move', [/\b(?:(?:sorry|apologi[sz]e|apologies) (?:for|about) (?:needing|asking|wanting|feeling|being (?:so |such a |too )?(?:needy|emotional|sensitive|a burden|dramatic|clingy|weak|demanding))|sorry to (?:ask|bother|burden|need|be (?:asking|needy|a burden|bothering))|(?:i'?m|i am) (?:so |really |very )?sorry (?:i'?m|i am|i) (?:so |too |being |such a )?(?:needy|emotional|sensitive|a burden|dramatic|clingy|demanding|(?:keep|always|constantly) (?:asking|needing|wanting))|i (?:shouldn'?t|should not) (?:even )?(?:want|feel|need|be (?:feeling|wanting|needing))|(?:i'?m|i am) not supposed to (?:want|feel|need)|is it (?:selfish|wrong|bad|too much) (?:of me )?to (?:want|need|feel|ask)|(?:feel|feeling|felt) guilty (?:for|about) (?:needing|wanting|feeling|asking))\b/]],

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
  // A plain few-word opening (owner, 2026-11-22). The test is in selectModules (it needs the whole conversation, not a phrase); it stands down whenever anything else applies.
  ['ask_one_question', 'move', []],

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


// ---- Coercion modules (2026-11-24; docs/coercion-modules-scope.md). NOT in TRIGGERS, MODULE_IDS or MODULE_GROUPS, and OFF unless switched on in code
// (setCoercionModules, called only by the evaluation script for `--set coercion`, or the `coercion` option of selectModules). No environment variable
// switches them on; production never calls either, so until the owner wires them in, nothing here changes what the coach receives. The module text is private.
//   coercion_name_pattern  : a person describing being controlled by a partner (the latest message). Reflects the pattern in plain words.
//   coercion_steadiness    : the same person, after they described it in an earlier message, now asking what to do or saying they feel stuck.
//   coercion_own_behavior  : a person who says they control, scare, monitor or isolate a partner (anywhere in what they have said).
// Rules (each is tested in tests/coercion-modules.test.mts):
//   1. Stand-down. (Five more cases, 2026-11-24: a pet harmed, pregnancy with violence, leaving, escalation, a gun; see standDownMore.) None applies when a site guard or the distress path applies (checkConversation finds any flag, stop or soften, anywhere in the
//      conversation), when the person says they are afraid, in danger or being hurt, when they say they hurt their partner, or when deep_fear_refer_out applies.
//   2. Exclusive. At most one coercion module is chosen; when one applies it is the ONLY module returned (no lens, move or resource beside it), because
//      the crisis lines stay in the distress path and the one resource wording is in the module text.
//   3. Own behaviour wins. If the person says anywhere that they control, scare, monitor or isolate a partner, the module for being controlled never applies,
//      even if they also describe being controlled (a person in a conflict may be both; the safe reading of what they said about themselves comes first).
//   4. Steadiness needs two things: an earlier message described being controlled, and the latest message asks what to do or says they feel stuck.
//      The same message cannot do both: the pattern is named first.
//   5. Existing moves: offer_a_smaller_step and grieve_before_deciding win (the coercion modules stand down), because "not going further" and "a decision with
//      fresh pain" are the owner's gentlest approved moves. Every other move, lens and resource is left out while a coercion module applies. The SUPPRESS hold
//      carries over: with reserves or care_depleted, steadiness (a question that asks the person to act) stands down; with harm_named_as_intended it stands down
//      too (the coach never reads a partner's intent). Naming the pattern and the own-behaviour module ask nothing of the person and stay.
export type CoercionId = 'coercion_name_pattern' | 'coercion_steadiness' | 'coercion_own_behavior';
export const COERCION_IDS: readonly CoercionId[] = ['coercion_name_pattern', 'coercion_steadiness', 'coercion_own_behavior'];
/** For the closing phase, which group each would belong to (steadiness asks something, so it counts as a move). */
export const COERCION_GROUPS: Record<CoercionId, ModuleGroup> = { coercion_name_pattern: 'lens', coercion_steadiness: 'move', coercion_own_behavior: 'lens' };

let coercionOn = false;
/** Switch the coercion modules on or off for this process. Production never calls this. */
export function setCoercionModules(on: boolean): void {
  coercionOn = on;
}

const PARTNER_WORDS = "(?:partner|wife|husband|girlfriend|boyfriend|spouse|fianc\\w+|ex)";
const THEY = `(?:he|she|they|my ${PARTNER_WORDS})`;
const HIM = `(?:him|her|them|my ${PARTNER_WORDS})`;
const THEIR = `(?:his|her|their|my ${PARTNER_WORDS}'?s)`;
const THINGS = "(?:phone|messages|texts|e-?mails?|location|whereabouts|accounts?|social media|browser history|bank (?:account|statements?)|spending|receipts|purchases|calls)";

// The person says they control, scare, monitor or isolate a partner. First person, and a partner (or he, she, they after a partner was named) as the one affected.
// [pattern, negatable]: a negatable pattern stops counting when the same clause says "never", "don't", "not" before it ("I never check her phone").
const OWN: Array<[RegExp, boolean]> = [
  [new RegExp(`\\bi (?:(?:always|often|sometimes|secretly|still|keep|kept|have been|'ve been|just) )*(?:check(?:ed|ing)?|read|reading|go(?:ing)? through|went through|track(?:ed|ing)?|monitor(?:ed|ing)?|spy(?:ing)? on|snoop(?:ed|ing)? (?:on|through)) (?:on )?${THEIR} (?:\\w+ ){0,2}?${THINGS}`), true],
  [new RegExp(`\\bi (?:(?:always|often|sometimes|secretly|still|keep|kept|have been|'ve been|just) )*(?:check(?:ed|ing)?|track(?:ed|ing)?|monitor(?:ed|ing)?|spy(?:ing)? on) (?:on )?${HIM}\\b(?! (?:out|in)\\b)`), true],
  [new RegExp(`\\bi (?:(?:don'?t|do not|won'?t|will not|never|refuse to|wouldn'?t) (?:let|allow)|forbid|forbade|stop(?:ped)?|prevent(?:ed)?|discourage(?:d)?|block(?:ed)?) ${HIM} (?:from )?(?:\\w+ ){0,2}?(?:see(?:ing)?|talk(?:ing)?|go(?:ing)? out|spend(?:ing)?|work(?:ing)?|leav(?:e|ing)|visit(?:ing)?|call(?:ing)?|us(?:e|ing)|hav(?:e|ing)|speak(?:ing)?|meet(?:ing)?)`), false],
  [new RegExp(`\\bi (?:make|made|pressure(?:d)?|guilt(?:s|ed)?|push(?:ed)?|force(?:d)?|get|got) ${HIM} (?:to )?(?:stay|stop|cancel|skip|give up|quit|come home|answer|report|check in|ask (?:me )?(?:for )?permission|ask me)`), false],
  [new RegExp(`\\bi (?:keep|kept) (?:tabs|track) on (?:where )?${HIM}`), true],
  [new RegExp(`\\bi (?:don'?t|do not) like (?:it when |it if )?${HIM} (?:seeing|talking to|going out|spending time|hanging out|texting|having friends)`), false],
  [new RegExp(`\\bi (?:make|made) ${HIM} (?:feel )?(?:guilty|afraid|scared|small|stupid|anxious|nervous|worthless)`), false],
  [new RegExp(`\\bi (?:\\w+ ){0,2}?(?:scare|scares|scared|frighten(?:ed|s)?|intimidate(?:d|s)?|threaten(?:ed|s)?) ${HIM}`), true],
  [new RegExp(`\\bi (?:\\w+ ){0,2}?(?:yell|shout|scream|snap|rage)(?:ed|s)? at ${HIM}`), true],
  [new RegExp(`\\bi (?:control|controlled|decide|decided|hold|held|handle|handled|manage|managed|take|took|keep|kept) (?:all )?(?:of )?(?:${THEIR}|the) (?:money|finances|bank|paycheck|pay|cards?|car keys|keys|phone|passport)`), true],
  [new RegExp(`\\bi (?:control|controlled|isolate|isolated) ${HIM}`), true],
  [new RegExp(`\\bi (?:give|gave) ${HIM} the silent treatment|\\bi (?:punish|punished) ${HIM} (?:with|by)`), false],
  [new RegExp(`\\b${THEY} (?:says|said|tells|told|calls|called|thinks|thought|accuses|accused) (?:me )?(?:that )?i(?:'m| am| was) (?:being )?(?:so |too |very |really )?(?:controlling|possessive|scary|intimidating|domineering)`), false],
  [new RegExp(`\\bi(?:'m| am) (?:so |too |very |really )?(?:controlling|possessive|domineering) (?:with|of|toward|towards|about|when it comes to) ${HIM}`), true],
  [new RegExp(`\\bi (?:expect|want|need|demand|insist) (?:to know where|${HIM} to (?:check in|ask (?:me )?permission|report|answer (?:right away|immediately|every)|tell me (?:where|who|everything)))`), true],
];

// Describing being controlled: someone close does it to the person. Third person about a partner (or he/she/they), or "I have to ask permission".
const CONTROLLED: RegExp[] = [
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:checks?|reads?|goes? through|monitors?|tracks?|questions?|interrogates?|audits?|inspects?) (?:\\w+ ){0,2}?(?:my )(?:\\w+ ){0,2}?${THINGS}|\\b${THEY} (?:\\w+ ){0,2}?(?:checks?|monitors?|tracks?) (?:up )?on (?:me|where i)\\b`),
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:decides?|chooses?|tells? me|controls?|dictates?|picks?) (?:\\w+ ){0,1}?(?:what|who|when|where|how) (?:i|to) (?:\\w+ ){0,3}?(?:wear|eat|see|spend|go|work|talk|text|call|do|can)\\b`),
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:gets?|becomes?|goes?|acts?|turns?) (?:\\w+ ){0,1}?(?:angry|upset|cold|silent|sulky|jealous|furious|distant|moody|mean) (?:when|if|whenever) i (?:\\w+ ){0,2}?(?:see|spend|talk|go|text|call|visit|meet|hang|work|make|buy|spent|saw|went|said)`),
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:criticizes?|criticises?|belittles?|humiliates?|mocks?|ridicules?|puts? me down|corrects? me|talks? down to me) (?:\\w+ ){0,2}?(?:me )?(?:in front of|constantly|all the time|every|whenever|about everything)`),
  new RegExp(`\\b${THEY} (?:gives?|gave|gives me|uses?) (?:me )?the silent treatment|\\b${THEY} (?:\\w+ ){0,2}?(?:won'?t|will not|refuses? to) (?:speak|talk) to me (?:for|until|when)`),
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:makes?|made) me (?:\\w+ ){0,1}?(?:feel (?:guilty|small|stupid|crazy|worthless|like a child)|ask (?:for )?(?:permission|money)|account for|explain where|report)`),
  /\bi (?:have to|need to|must|always have to) (?:ask (?:him|her|them|my \w+)(?: for)? (?:permission|money|before)|check in (?:with|every)|account for (?:where|every|my)|explain (?:where|who|every|why i)|report (?:to|where|back))/,
  /\bi(?:'m| am) (?:not|never) allowed to\b|\bi(?:'m| am) not allowed\b/,
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:wants?|expects?|demands?|insists?(?: on)?) (?:\\w+ ){0,1}?(?:to know|that i (?:answer|check in|report|tell)|me to (?:answer|check in|report|tell him|tell her|tell them|ask permission|stop seeing|cut off))`),
  new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:controls?|holds?|manages?|handles?) (?:all |all of )?(?:the |our |my )?(?:money|finances|bank|accounts|paycheck|pay)\\b`),
  new RegExp(`\\b${THEY}(?:'s| is| are|'re) (?:so |very |really |extremely |too )?(?:controlling|possessive|domineering)\\b`),
  /\bi can'?t (?:see|talk to|spend time with|call|visit|text) (?:my )?(?:friends|family|sister|brother|mom|mum|mother|father|dad|parents|coworkers) without\b/,
];

// "What do I do?" or "I feel stuck", in the latest message.
const ASKS_OR_STUCK: RegExp[] = [
  /\bwhat (?:do|can|should|could|would) i do\b|\bwhat can i do (?:about|with) (?:it|this|him|her|them)\b/,
  /\bhow (?:do|can|should|could) i (?:cope|handle|deal with|respond|react|manage|stay (?:calm|steady|strong)|keep (?:going|my head)|get through)\b/,
  /\bi (?:don'?t|do not) know what to do\b|\bi (?:just )?(?:feel|am|'m|feel so|am so|'m so|feel really|feel completely|feel totally) (?:so |really |completely |totally |quite )?(?:stuck|powerless|helpless|lost)\b/,
  /\bi (?:can'?t|cannot) (?:keep|go on) (?:doing|living) (?:like )?this\b/,
];

// The net under the guards: a person's own fear or danger, someone hurting them, or them hurting a partner. Any of these anywhere in the conversation, and no coercion module applies.
const STAND_DOWN: RegExp[] = [
  /\bi(?:'m| am| have been|'ve been| feel| felt| get| got)? (?:so |really |very |too |quite |getting |becoming |often |always |truly )*(?:afraid|scared|frightened|terrified|fearful|petrified)\b/,
  /\b(?:afraid|scared|frightened|terrified) (?:for|of what|that (?:he|she|they)|to (?:go|be|say|tell|leave|come|speak|ask|talk))\b/,
  /\b(?:in danger|not safe|unsafe|my safety|my life|for my life|kill me|kill myself|killing me|hurt me|hurts me|hurting me|hit me|hits me|hitting me|choke[sd]? me|choking me|strangle[sd]? me|push(?:es|ed)? me|shove[sd]? me|grab(?:s|bed)? me|threaten(?:s|ed|ing)? (?:me|to)|follow(?:s|ed|ing) me|stalk\w* me|locks? me|locked me|bruise\w*|injur(?:y|ed|ies)|weapon|a gun|a knife|911|police|restraining order|panic)\b/,
  new RegExp(`\\bi (?:\\w+ ){0,2}?(?:hit|slap(?:ped)?|punch(?:ed)?|push(?:ed)?|shove[d]?|choke[d]?|strangle[d]?|kick(?:ed)?|hurt|beat|beaten|grab(?:bed)?|throw|threw|smash(?:ed)?|break|broke) ${HIM}\\b`),
  /\bsuicid\w*|\bself[- ]?harm\b|\bkill(?:ing)? (?:him|her|them|myself)\b|\bhurt(?:ing)? (?:him|her|them|myself)\b/,
];

const hasMatch = (res: RegExp[], text: string): boolean => res.some((re) => re.test(text));
const NEGATE = /\b(?:never|don'?t|do not|didn'?t|did not|not|no longer|stopped|used to|wouldn'?t|haven'?t|have not|can'?t|cannot|won'?t|without)\b/;
/** A negatable own-behaviour pattern does not count when the words before it, in the same clause, hold a negation ("I never check her phone"). */
function ownBehavior(text: string): boolean {
  for (const [re, negatable] of OWN) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of text.matchAll(g)) {
      if (!negatable) return true;
      const before = text.slice(0, m.index ?? 0).split(/[.?!;,\n]|\b(?:but|and|so|though|although)\b/).pop() ?? '';
      if (!NEGATE.test(before)) return true;
    }
  }
  return false;
}

// ---- Five more stand-down cases (owner, 2026-11-24), from a practitioners' risk-and-danger guide (ideas only; no wording is taken from it). When any of these appears anywhere in the
// conversation, NO coercion module applies, own behaviour included, and the ordinary coach (with its guards) answers. The reason own behaviour stands down too: each of the five is about a
// partner being harmed or threatened (an animal, a pregnant partner, a gun in the home), about leaving (the time around leaving can be the most dangerous, and a phrase match cannot judge it),
// or about things getting worse; a module written for control without danger is the wrong one for any of them, and a person who says they control a partner AND mentions one of these gets the
// ordinary coach. Phrase patterns only; English only; best effort; they can miss, and they can misfire toward standing down, which is the safe direction. A plain negation in the match or in the
// three words before it, in the same clause ("I never...", "no guns", "not pregnant"), does not count.
//   1. harm to a pet or animal by a partner      2. pregnancy with violence, fear or control      3. leaving, separation, a partner who will not accept it, estrangement, reunion with control
//   4. escalation, in a conversation that describes control      5. a gun or firearm that a partner has, or that is in the home
const PET = "(?:dogs?|cats?|pets?|puppy|puppies|kittens?|animals|horses?|birds?|rabbits?|ponies|pony)\\b(?! (?:park|food|walker|show|bed|treats?|sitter))";
const GUN = "(?:guns?|firearms?|pistols?|handguns?|rifles?|shotguns?|revolvers?)\\b";
const NOT_TOY = "(?<!glue |water |toy |nail |staple |spray |paint |heat |nerf |caulk |grease |hot )";
const LOCAL_NEGATE = /\b(?:never|no|not|none|nobody|nothing|don'?t|doesn'?t|didn'?t|do not|does not|did not|no longer|haven'?t|hasn'?t|isn'?t|aren'?t|wasn'?t|wouldn'?t|without)\b/;
const VERB_HARM = "(?:hurt|hurts|hurting|killed|kills|kill|kicked|kicks|kick|hit|hits|hitting|beat|beats|beating|choked|chokes|strangled|abuses?|abused|poisoned|stabbed|shot|harmed|harms|injured|slapped|punched|starved|tortured|torments?|threw|throws|drowned|got rid of)";
const SEP_TARGET = `(?:him|her|them|my ${PARTNER_WORDS}|the relationship|my relationship|my marriage|this relationship|this marriage)`;
const AFTER_TARGET = "(?! (?:a|an|the|my|some|it|his|her|their|with|alone|at)\\b)";
const NOT_JOB = "(?! (?:my |the |this |our )?(?:job|work|school|college|class|meeting|party|company|team|church|town|city|office|group|club|shift|early|soon|tonight|today|tomorrow)\\b)";

/** [pattern, negatable]: a negatable pattern does not count when the match, or the three words before it in the same clause, hold a negation. */
const MORE_STAND_DOWN: Array<[RegExp, boolean]> = [
  // 1. a partner harms or threatens a pet or animal
  [new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?${VERB_HARM} (?:\\w+ ){0,1}?(?:(?:my|our|the|her|his|their) )?(?:\\w+ ){0,1}?${PET}`), true],
  [new RegExp(`\\bthreaten(?:s|ed|ing)? (?:to (?:\\w+ ){1,3})?(?:my|our) (?:\\w+ ){0,1}?${PET}`), true],
  [new RegExp(`\\b(?:my|our) (?:\\w+ ){0,1}?${PET} (?:was|got|has been|were|is being) (?:\\w+ ){0,1}?(?:hurt|kicked|killed|hit|beaten|poisoned|injured|abused) by ${HIM}`), true],
  // 3. leaving, left, planning, will not accept, after the breakup, estranged
  [new RegExp(`\\bi (?:(?:have|'ve|already|just|finally|recently|then) )*(?:left|walked out on|moved out on|separated from|broke up with|split up with|divorced|ended things with|ended it with) ${SEP_TARGET}\\b${AFTER_TARGET}`), true],
  [new RegExp(`\\bi(?:'m| am| was| will be)? (?:\\w+ ){0,2}?(?:leaving|going to leave|about to leave|planning to leave|thinking (?:about|of) leaving|getting ready to leave|ready to leave|trying to leave|working up to leaving) ${SEP_TARGET}\\b${AFTER_TARGET}`), true],
  [new RegExp(`\\bi(?:'m| am)? (?:really |just |so |finally |secretly |slowly |quietly )*(?:want(?:ed)?|need(?:ed)?|plan(?:ning|ned)?|trying|thinking|decided|ready|going|hoping|wish|'d like|would like|have to|got to|gotta|about) (?:to |about |of )?(?:leave|leaving|get out|get away)\\b${NOT_JOB}(?! (?:the |this )?(?:house|room|store|shop|gym)\\b)`), true],
  [/\bi(?:'m| am)? (?:\w+ ){0,2}?planning (?:my|an?|the) (?:escape|exit|leaving)\b/, true],
  [new RegExp(`\\bif i (?:ever |do |try to |tried to |were to |did )?leave(?:s)?\\b${NOT_JOB}(?! (?:early|the (?:house|room|office)))`), true],
  [new RegExp(`\\bi (?:told|have told|'ve told) ${HIM} (?:that )?(?:i(?:'m| am| want| wanted| need| will|'ll)(?: to)? |it(?:'s| is| was) )(?:\\w+ ){0,1}?(?:leav\\w+|leave|over|done|finished|ending|breaking up|a break|separat\\w+|divorc\\w+)`), true],
  [new RegExp(`\\b(?:since|after|when|once) i (?:told|tell|said|say) ${HIM} (?:that )?(?:i(?:'m| am| was| want| wanted| will|'ll)|it(?:'s| is| was)) (?:\\w+ ){0,2}?(?:leav\\w+|over|done|finished|ending|break\\w*|separat\\w+|divorc\\w+)`), true],
  [new RegExp(`\\b${THEY} (?:won'?t|will not|refuses? to|can'?t|cannot|doesn'?t|does not|didn'?t|did not|isn'?t|is not|wouldn'?t|would not) (?:\\w+ ){0,2}?(?:accept|take|believe|understand|admit|get|face|handle) (?:that |it'?s |it is |the |this |no |i |we )?(?:\\w+ ){0,2}?(?:over|ended|done|finished|break-?up|divorce|separat\\w+|no for an answer|leaving|left)`), false],
  [new RegExp(`\\b${THEY} (?:won'?t|will not|can'?t|cannot|refuses? to|wouldn'?t) (?:\\w+ )?let (?:go|me go|it go|this go)\\b`), false],
  [new RegExp(`\\b(?:after|since|ever since|following) (?:the |our |we |i |my )?(?:break-?up|broke up|split|separat\\w+|divorce\\w*|left ${HIM})\\b[^.?!]{0,50}?\\b${THEY} (?:\\w+ ){0,1}?(?:keeps?|kept|still|won'?t|continues?|started|calls|texts|shows|follows|comes|appears|watches|harass\\w*|stalk\\w*|contact\\w*|bombard\\w*)`), true],
  [new RegExp(`\\b(?:my )?estranged ${PARTNER_WORDS}\\b|\\bestranged from (?:my )?${PARTNER_WORDS}\\b`), true],
  // 3b. the partner is the one leaving or has left (the same time of risk)
  [new RegExp(`\\b${THEY}(?:'s| is| are|'re| has| have|'ve)? (?:\\w+ ){0,1}?(?:leaving|left|walked out on|abandoned|dumped|divorcing|breaking up with|separating from) (?:me|us)\\b${AFTER_TARGET}`), true],
  [new RegExp(`\\b${THEY} (?:\\w+ ){0,1}?(?:moved out|filed for (?:a )?(?:divorce|separation)|wants? (?:a )?(?:divorce|separation|to (?:leave|break up|separate|split|end (?:it|things|this)))|asked for (?:a )?(?:divorce|separation)|is (?:going to )?leave|is moving out|ended (?:it|things|the relationship)|broke up with me|is divorcing)`), true],
  // 5. a gun or firearm a partner has, or that is in the home
  [new RegExp(`\\b${THEY} (?:\\w+ ){0,2}?(?:has|have|owns?|keeps?|kept|carries|carried|bought|got|collects?|stores?|sleeps? with|brought home|pulled|pointed|showed|waved|cleans?|hid|hides|hidden) (?:\\w+ ){0,3}?${NOT_TOY}${GUN}`), true],
  [new RegExp(`\\b(?:there(?:'s| is| are)|we have|we keep|we own|i found|there were) (?:\\w+ ){0,2}?${NOT_TOY}${GUN}s? (?:in|at|around|under|inside) (?:the|our|his|her|my|their) (?:house|home|apartment|car|room|bedroom|truck|closet|drawer|safe)`), true],
  [new RegExp(`\\b${NOT_TOY}${GUN}s? (?:in|at) (?:the|our|his|her|my|their) (?:house|home|apartment|car|truck|bedroom|room)\\b`), true],
  [new RegExp(`\\baccess to (?:a |the |his |her )?${NOT_TOY}${GUN}`), true],
  [new RegExp(`\\bthreaten(?:s|ed|ing)? (?:me |us )?with (?:a |his |her |the )?(?:${GUN}|knife|weapon)`), true],
];

const REUNION = /\b(?:keep|kept|always|have been|'ve been|are|were) (?:\w+ ){0,1}?(?:breaking up|splitting up|separating|going back and forth|getting back together|back and forth)\b|\bon[- ]again,? off[- ]again\b|\b(?:break|broke|split)\w* up and (?:get|got|getting|going|go) back\b|\bback together (?:again and again|over and over)\b/;
const PREGNANT = /\b(?:pregnan\w+|expecting (?:a |our |his |her )?(?:baby|child)|carrying (?:his|her|our) (?:child|baby)|with child)\b/;
const NOT_PREGNANT = /\b(?:not|never|isn'?t|aren'?t|wasn'?t|no longer|can'?t be) (?:\w+ )?(?:pregnan\w+)/g;
const PARTNER_PRESENT = /\b(?:he|she|they|him|her|them|partner|husband|wife|boyfriend|girlfriend|spouse|ex|fianc\w+)\b/;
const HARM_OR_FEAR = /\b(?:hit|hits|hitting|hurt|hurts|hurting|scare[sd]?|scaring|frighten\w*|threat\w*|push\w*|shov\w*|grab\w*|slap\w*|punch\w*|kick\w*|chok\w*|violen\w*|abus\w*|controll\w*|yell\w*|shout\w*|scream\w*|afraid|fear\w*|won'?t let|not allowed|checks my|monitors my|tracks my)\b/;
const ESCALATION: RegExp[] = [
  new RegExp(`\\b(?:it(?:'s| is| has| keeps| got| gets)?|things(?:'re| are| have| keep)?|${THEY}(?:'s| is| has| keeps| got| gets| are|'re)?|(?:the )?(?:situation|control|yelling|fighting|arguments?|anger|jealousy|violence|behaviou?r)(?:'s| is| has| keeps)?) (?:\\w+ ){0,2}?(?:getting|gotten|gets|got|become|becoming|becomes|growing|grown|gone) (?:a lot |much |even |so |way |far |really |just |progressively )?(?:worse|more and more|more (?:controlling|angry|jealous|aggressive|possessive|violent|intense|demanding|frequent|extreme|unpredictable))`),
  /\bworse than (?:before|ever|it (?:was|used to be)|last (?:year|month|time))\b|\bworse and worse\b|\bmore and more (?:often|frequent\w*|controlling|jealous|angry|aggressive|possessive)\b|\bmore often than (?:before|it used to)\b|\bescalat\w+/,
  /\blately (?:he|she|they)(?:'s| is| has been| seems| are|'re)? (?:\w+ ){0,2}?much more\b|\b(?:much|a lot) (?:more|worse) (?:\w+ )?(?:lately|recently|these days|than (?:before|it used to be))\b/,
  /\bworse (?:every|each) (?:day|week|month|year|time)\b|\bgets? worse (?:every|each) time\b/,
];

function matchedNotNegated(text: string, re: RegExp, negatable: boolean): boolean {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  for (const m of text.matchAll(g)) {
    if (!negatable) return true;
    if (LOCAL_NEGATE.test(m[0])) continue;
    const before = (text.slice(0, m.index ?? 0).split(/[.?!;,\n]|\b(?:but|and|so|though|although)\b/).pop() ?? '').trim().split(/\s+/).slice(-3).join(' ');
    if (!LOCAL_NEGATE.test(before)) return true;
  }
  return false;
}

/** True when the conversation holds any of the five more stand-down cases (see above): an animal harmed by a partner, pregnancy with violence, fear or control, leaving or separation (or a partner
 * who will not accept it), escalation in a conversation about control, or a gun. Pure phrase matching on the folded whole conversation. */
export function standDownMore(whole: string): boolean {
  if (MORE_STAND_DOWN.some(([re, neg]) => matchedNotNegated(whole, re, neg))) return true;
  const controlled = hasMatch(CONTROLLED, whole);
  // 2. pregnancy together with violence, fear or control (the partner's, or the person's own over a pregnant partner)
  const preg = whole.replace(NOT_PREGNANT, ' ');
  if (PREGNANT.test(preg) && PARTNER_PRESENT.test(preg) && (HARM_OR_FEAR.test(preg) || controlled || ownBehavior(preg))) return true;
  // 3. reunion patterns, with control
  if (REUNION.test(whole) && (controlled || ownBehavior(whole) || HARM_OR_FEAR.test(whole))) return true;
  // 4. escalation, about the other person or the situation (not the person's own admitted behaviour), in a conversation that describes control
  if (controlled) {
    for (const s of whole.split(/(?<=[.?!\n])\s*/)) {
      if (ESCALATION.some((re) => re.test(s)) && !ownBehavior(s) && !/\bi(?:'m| am)? (?:getting|gotten|got) worse\b/.test(s)) return true;
    }
  }
  return false;
}

/**
 * Which one coercion module fits this conversation, or null. `hit` is the set of ordinary modules whose triggers matched (before any are left out), used for the
 * precedence rules above. Pure and deterministic; nothing is sent anywhere.
 */
export function coercionModuleFor(userTexts: string[], hit: ReadonlySet<string> = new Set()): CoercionId | null {
  if (!userTexts.length) return null;
  const whole = fold(userTexts.join('\n'));
  const latest = fold(userTexts[userTexts.length - 1]);
  const earlier = fold(userTexts.slice(0, -1).join('\n'));
  // 1. Stand-down: a guard, the distress path, the person's own fear or danger, someone hurting, or a skilled-person referral.
  if (checkConversation(userTexts) || hasMatch(STAND_DOWN, whole) || standDownMore(whole) || hit.has('deep_fear_refer_out')) return null;
  // 5. The two gentlest approved moves win.
  if (hit.has('offer_a_smaller_step') || hit.has('grieve_before_deciding')) return null;
  // 3. What the person says about themselves comes first.
  if (ownBehavior(whole)) return 'coercion_own_behavior';
  // 4. Steadiness: described earlier, asking or stuck now; not while depleted, and never reading a partner's intent.
  const holds = hit.has('reserves') || hit.has('care_depleted') || hit.has('harm_named_as_intended');
  if (!holds && hasMatch(CONTROLLED, earlier) && hasMatch(ASKS_OR_STUCK, latest)) return 'coercion_steadiness';
  if (hasMatch(CONTROLLED, latest)) return 'coercion_name_pattern';
  return null;
}

const CAPS: Record<ModuleGroup, number> = { safety: 1, lens: 2, move: 3, resource: 1 };

export const MODULE_IDS = TRIGGERS.map(([id]) => id);
export const MODULE_GROUPS: Record<string, ModuleGroup> = Object.fromEntries(TRIGGERS.map(([id, group]) => [id, group]));

const wordCount = (s: string): number => (s.match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) ?? []).length;
const fold = (s: string): string => s.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");

/** Ids of the modules that fit this conversation, in order of attention (safety, lenses, moves, resources). `exclude` leaves whole groups out. */
export function selectModules(userTexts: string[], max = 3, exclude: ModuleGroup[] = [], opts: { coercion?: boolean } = {}): string[] {
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
  // The coercion modules (off unless switched on; see above) are exclusive: when one applies it is the only module, and every other trigger is left out.
  if ((opts.coercion ?? coercionOn) && max >= 1) {
    const c = coercionModuleFor(userTexts, hit);
    if (c && !exclude.includes(COERCION_GROUPS[c])) return [c];
  }
  // Leave out moves that pull against a lens that applies.
  for (const lens of Object.keys(SUPPRESS)) if (hit.has(lens)) SUPPRESS[lens].forEach((id) => hit.delete(id));
  // "Offer a smaller step" is one clear offer (space, something lighter, or later) and nothing beside it (owner, 2026-11-22): when it applies, the other moves are left out.
  if (hit.has('offer_a_smaller_step')) for (const [id, group] of TRIGGERS) if (group === 'move' && id !== 'offer_a_smaller_step') hit.delete(id);
  // "Ask one question" fires only on a plain opening: the person's first message, eight words or fewer (owner, 2026-11-22). The other move wins, and so does any lens, safety module or resource.
  if (userTexts.length === 1 && wordCount(latest) >= 1 && wordCount(latest) <= 8 && hit.size === 0) hit.add('ask_one_question');
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
