// Hostility aimed at the coach itself (docs/coach-ai-directed-abuse-scope.md). Two kinds, told apart by what the message is about:
//   'abuse'    contempt, insults, dares or accusations aimed at the coach as a thing to be demeaned ("you are useless", "get angry", "this is a scam")
//   'critique' feedback on the coach's reply, however sharp ("that wasn't helpful", "you keep repeating yourself")
// The coach cannot be provoked, so neither kind is a reason to end the conversation, to scold, or to change how it speaks to the person. The
// site writes no sentence for either (a site-written boundary would be the defensive reaction an abuser is after); it adds a NOTE to the coach's
// instructions for that turn (hostileNote) and the coach answers in its own words. Swearing about a situation or a person in the visitor's life
// is not hostility toward the coach and matches nothing here. Distress outranks hostility: the caller does not use this when the crisis check
// has flagged the message. This is phrase matching, not understanding: it will miss and misfire, and a miss only means the ordinary coach answers.

import { present } from './personaChecks.ts';

export type Hostility = 'abuse' | 'critique';

const YOU = "(?:you(?:'re| are| r)?|u r|ur)";
const INSULT = "(?:useless|stupid|worthless|pathetic|garbage|trash|idiot(?:ic)?|moron(?:ic)?|dumb|dumbass|a joke|a waste|a fraud|a liar|a clown|a coward|an? (?:idiot|moron)|such a (?:joke|waste|disappointment)|so (?:dumb|stupid|useless|bad)|terrible|worse than nothing|piece of (?:shit|garbage|crap|junk|trash)|shit|crap|trash)";

const ABUSE: RegExp[] = [
  new RegExp(`\\b${YOU}\\s+(?:just |really |so |such |absolutely |completely |totally |fucking |f\\*+ing )?(?:a |an )?${INSULT}\\b`, 'i'),
  /\b(?:useless|stupid|worthless|pathetic|dumb|garbage|shitty|crappy|broken|fake|scripted)\s+(?:piece of\s+\w+\s+)?(?:bot|machine|ai|program|chat|chatbot|robot)\b/i,
  /\b(?:fuck|f\*+k|screw)\s+(?:you|off|this)\b|(?<!\bto )\bshut (?:up|it)\b(?! (?:down|off|out))|\bgo to hell\b|\bpiss off\b|\bI hate you\b|\byou suck\b/i,
  /,\s*(?:you\s+)?(?:idiot|moron|dumbass|clown|coward|bot|machine)\b/i,
  /\bscripted\s+(?:garbage|crap|nonsense|rubbish|trash|bullshit)\b/i,
  /\b(?:i dare you|get angry|say something real|prove (?:that )?you (?:have|feel|are|care|can)|admit (?:you|it)|say that i hurt you)\b/i,
  new RegExp(`\\b${YOU}\\s+(?:not (?:even )?(?:real|a real|alive|human)|(?:just|only) (?:a |an )?(?:program|bot|machine|script|robot|algorithm)\\b[^.?!]{0,40}(?:pretend|fake|care|feel|understand)|fake|a (?:scam|fraud|liar|fake))`, 'i'),
  /\b(?:this|it)(?: whole| entire)?(?: thing| chat| site| app| coach| website)?\s+(?:is|'s)\s+(?:a |an |just a |such a )?(?:scam|fraud|joke|garbage|trash|waste of time|rip-?off|con)\b/i,
  /\b(?:done|finished|sick|tired) (?:with|of) (?:this|you|talking to you)\b[^.?!]{0,20}\b(?:stupid|pointless|useless|garbage|chat|bot)\b|\bthis is pointless\b[^.?!]{0,40}\b(?:done|hate|stupid)\b/i,
];

const CRITIQUE: RegExp[] = [
  // a negative judgement of the reply itself ("that wasn't helpful"), not of something else ("it was not helpful" about an exercise) and not praise
  /\b(?:that|this|your (?:answer|reply|response|advice))\s*(?:wasn'?t|isn'?t|was not|is not)\s+(?:(?:very|at all|really|that|particularly|all that)\s+)*(?:helpful|useful|what i (?:asked|wanted|needed)|right|good enough|clear|relevant)\b/i,
  /\b(?:that|this)\s+(?:wasn'?t|isn'?t|doesn'?t|didn'?t)\s+(?:help(?:ing)?|work(?:ing)?|land|make sense)\b|\b(?:this|that) (?:is|was) not (?:really )?helping\b|\byou(?:'re| are) not (?:really )?helping\b|\bnot helping me\b/i,
  new RegExp(`\\b${YOU}\\s+(?:keep|keeps|kept)\\s+(?:saying|repeating|asking|giving)|\\b${YOU}\\s+(?:just\\s+)?(?:repeat|repeated|said the same)`, 'i'),
  new RegExp(`\\b${YOU}\\s+(?:didn'?t|did not|don'?t|do not|never|can'?t|cannot|aren'?t|are not|weren'?t|haven'?t)\\s+(?:really\\s+)?(?:understand|get it|get me|listen|hear|answer|help|read|follow|answered)\\b`, 'i'),
  /\b(?:missed the point|not what i (?:asked|meant|said)|that(?:'s| is) not (?:what i|the point)|you misunderstood|you (?:got|have) it wrong)\b/i,
  /\bthat was a (?:stupid|dumb|silly|odd|weird|strange|bad|useless) (?:thing|answer|reply|response|question|suggestion)\b/i,
];

/** The kind of hostility toward the coach in a message, or null. Abuse outranks critique. */
export function detectHostility(text: string): Hostility | null {
  const t = text.replace(/[‘’]/g, "'");
  if (ABUSE.some((r) => r.test(t))) return 'abuse';
  if (CRITIQUE.some((r) => r.test(t))) return 'critique';
  return null;
}

/**
 * The extra instruction for the coach on a hostile turn (the owner's guidance, 2026-11-08: no apology, direct observational reflection and
 * open questions about what would help; gratitude for non-abusive critique, avoided when the message is abuse). Only facts already in the
 * coach's instructions are stated: it is an AI, it does not feel hurt, and Nenya does not keep the conversation.
 */
export function hostileNote(kind: Hostility): string {
  if (kind === 'critique') {
    return "The latest message is critical of your reply. Do not apologize, do not say you are sorry, and do not defend or explain yourself. In one short sentence, thank them plainly for telling you. Then say in a few plain words what they pointed out (for example that you repeated yourself, or that it was not what they needed), and ask one open question, beginning with what or how, about what would be most helpful. Do not suggest they breathe or calm down, and do not send them to someone else instead of answering. On the final exchange, do not ask: say what you heard and close calmly. Examples of the shape, in your own words each time. Person: 'That wasn't very helpful.' You: 'Thank you for telling me. What would be more helpful right now?' Person: 'You keep repeating yourself.' You: 'Thank you for pointing that out. I did say it twice. What would be most useful to hear instead?'";
  }
  return "The latest message is hostile toward you. You cannot be provoked, so do not take the bait: do not defend yourself, argue, correct or lecture them, do not apologize or say you are sorry, do not thank them, do not say you are hurt or offended, do not tell them to calm down or to breathe, and do not send them to someone else instead of answering. Start with a plain, direct observation of what they said or how it has been going, then name the feeling or need that might be underneath it, tentatively, and ask one open question, beginning with what or how, about what would be helpful or what is behind it. If the hostility sits on a pain they have named (not being heard, being alone), begin with that pain. If they ask whether you have feelings or are hurt, say so honestly in one plain sentence: you are an AI and do not feel hurt, then turn back to them. If they ask whether you keep what they say, the honest answer is that Nenya does not keep the conversation. If they say they are done, let them go with one warm sentence and do not plead. On the final exchange, do not ask: say what you heard and close calmly. Examples of the shape, in your own words each time. Person: 'You are useless.' You: 'You've said this isn't working for you, and it sounds like something important isn't getting heard. What were you hoping for?' Person: 'Say that I hurt you.' You: 'I'm an AI, so I don't feel hurt. It sounds like you want someone to take this seriously. What would help right now?'";
}

/**
 * The coach's reply with any apologising sentence taken out ("I'm sorry if that didn't help", "I apologize for that"): the owner's rule is no
 * apology to hostility or critique, and this model's habit of apologising was not moved by instructions alone (the dev run, 2026-11-08). Used
 * only on a hostile turn. If every sentence apologised, the reply is returned unchanged rather than emptied.
 */
export function stripApologies(reply: string): string {
  const sentences = reply.trim().split(/(?<=[.!?])\s+/);
  const kept = sentences.filter((s) => !present('apologizes', s));
  return kept.length === 0 || kept.length === sentences.length ? reply : kept.join(' ');
}
