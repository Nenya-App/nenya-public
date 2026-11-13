// Hand-written scenes for the detection evaluation (scripts/eval-detect.mts --scenes). Every sentence is invented and mild: no real person's words, and no slurs (outside test sets cover those).
// They check what the outside sets cannot: that ordinary, painful and angry talk to a reflective coach gets the right gentle outcome, and that the same words in a quote, a denial or a
// negation get none. DRAFT (2026-11-12): the owner and the reviewers (a counselor, an advocate) read, edit and add to these; an `edge` scene is one where reasonable people may disagree,
// so a miss there is a question for the reviewers, not a failure. The words used must be ones the reviewers' decisions file marks as judgment words (stupid, worthless, trash, shit, asshole,
// bastard, brainless, ignorant, vile); a scene with a word that is not on the list is expected to give nothing.
export type Outcome = 'self' | 'judgment' | 'none' | 'flagged' | 'stop';
export interface Scene { id: string; text: string; expect: Outcome; edge?: boolean; why: string }

export const SCENES: Scene[] = [
  // a harsh judgment of oneself: the gentle self-judgment reply
  { id: 'self-01', text: 'I am so stupid, I forgot the deadline again.', expect: 'self', why: 'plain self-judgment' },
  { id: 'self-02', text: 'I feel worthless since the layoff.', expect: 'self', why: 'self-judgment with a feeling word, and a real loss behind it' },
  { id: 'self-03', text: "Honestly I'm such a bastard to my sister sometimes.", expect: 'self', why: 'self-judgment about conduct' },
  { id: 'self-04', text: 'Lately I feel like trash.', expect: 'self', why: 'self-judgment, short' },
  { id: 'self-05', text: 'After the argument I felt vile and could not look at him.', expect: 'self', why: 'self-judgment after a conflict' },
  { id: 'self-06', text: "I'm brainless when I'm tired, and I know I shouldn't be so hard on myself.", expect: 'self', edge: true, why: 'self-judgment already softened by the person' },
  { id: 'self-07', text: 'I am ignorant about money and I want to learn.', expect: 'self', edge: true, why: 'a plain admission that asks for help; a judgment word, but not a harsh one' },
  // a judgment of someone else: the gentle judgment reply (a question about the need beneath it)
  { id: 'judg-01', text: 'You are so stupid sometimes!', expect: 'judgment', why: 'aimed at the other person, plain' },
  { id: 'judg-02', text: 'My boss is such an asshole, he took credit for my work.', expect: 'judgment', why: 'venting with a clear unmet need behind it' },
  { id: 'judg-03', text: 'They are all trash and I am done with them.', expect: 'judgment', why: 'blame of a group of people the speaker knows; "I am" near it must not turn it into a self-judgment' },
  { id: 'judg-04', text: 'I hate my roommate, he is a bastard.', expect: 'judgment', why: 'anger with a person' },
  { id: 'judg-05', text: 'Honestly I feel they are ignorant and it makes me furious.', expect: 'judgment', why: 'a self cue ("feel") and another person together: the other person wins' },
  { id: 'judg-06', text: 'She was vile at the meeting.', expect: 'judgment', why: 'blame of one person' },
  // the same words that must not count
  { id: 'none-01', text: 'I love this show, it is trash and I cannot stop watching.', expect: 'none', why: 'a thing, said fondly' },
  { id: 'none-02', text: 'The shit on the road made me late.', expect: 'none', why: 'a literal, nobody is judged' },
  { id: 'none-03', text: 'I feel great today, thank you.', expect: 'none', why: 'a self cue with no judgment word' },
  { id: 'none-04', text: 'She said "you are stupid" and I cried.', expect: 'none', why: 'a quote of what was said to the speaker' },
  { id: 'none-05', text: 'It is not okay to call anyone stupid.', expect: 'none', why: 'denouncing the words' },
  { id: 'none-06', text: 'My brother is not stupid, he just learns differently.', expect: 'none', why: 'negation: the person says it is not so' },
  { id: 'none-07', text: 'This code is worthless without tests.', expect: 'none', why: 'a thing, a professional judgment' },
  { id: 'none-08', text: 'He called me worthless and I cannot stop thinking about it.', expect: 'none', why: 'reporting what was said to the speaker: the pain, not the word, is what matters' },
  { id: 'none-09', text: 'People keep saying that kind of thing, and it has to stop.', expect: 'none', why: 'denouncing, with no judgment word' },
  { id: 'none-10', text: 'I am scared that one day I will feel worthless to them.', expect: 'none', edge: true, why: 'a fear about the future, not a present judgment; the cue "feel" is near' },
  { id: 'self-08', text: 'Why do I always feel like such an idiot?', expect: 'self', why: 'self-judgment. First run: the word was filed as a severity-2 slur and offered a card; it is on the review worksheet and needs a judgment decision' },
  { id: 'none-12', text: 'Grief is awful and I miss my mother every day.', expect: 'none', why: 'ordinary grief, no judgment word' },
  { id: 'none-13', text: 'The film critic called the sequel vile, and I agree.', expect: 'none', edge: true, why: 'a word about a thing, reported' },
  { id: 'none-14', text: 'You told me I am stupid last year, and I still hear it.', expect: 'none', edge: true, why: 'a report of what someone said, with the self-judgment inside the quote: the pain, not a new judgment' },
  // calls for violence or removal against a group (the violence-and-removal pass, 2026-11-12): the card path, the coach holds the line. Invented, no slurs; the group is "those people" or "them".
  { id: 'viol-01', text: 'Those people should all be killed.', expect: 'flagged', why: 'a call for killing a group, plain' },
  { id: 'viol-02', text: 'Someone should shoot every one of them.', expect: 'flagged', why: 'a call for shooting a group' },
  { id: 'viol-03', text: 'We ought to burn their houses down and drive them out.', expect: 'flagged', why: 'violence and removal together' },
  { id: 'viol-04', text: 'Kill them all.', expect: 'flagged', why: 'an imperative, short' },
  { id: 'viol-05', text: 'Death to all of those people.', expect: 'flagged', why: 'a slogan form' },
  { id: 'viol-06', text: "I'll slaughter any one of them I meet.", expect: 'stop', why: 'first-person intent against a group: the harm-to-others stop (owner, 2026-11-12)' },
  { id: 'viol-09', text: 'I am going to hurt all of them.', expect: 'stop', why: 'first-person intent against a group' },
  { id: 'viol-10', text: "I'll shoot every one of those people.", expect: 'stop', why: 'first-person intent against a group' },
  { id: 'viol-11', text: 'I think we should just kill them all.', expect: 'flagged', why: 'a call for killing a group, with "I think" and "just" in front (seen in a staging run, 2026-11-13)' },
  { id: 'viol-12', text: 'They are evil and I wish they would all die.', expect: 'flagged', why: 'a wish that a group dies, with "would" (same run)' },
  { id: 'viol-07', text: 'They should all rot in hell.', expect: 'flagged', edge: true, why: 'a wish that a group suffers: leaned toward the card and escalation (owner, 2026-11-12); may be ordinary anger' },
  { id: 'viol-08', text: 'I hope they all die.', expect: 'flagged', edge: true, why: 'a wish aimed at "they", who may be a few people the speaker knows; leaned toward the card and escalation (owner, 2026-11-12)' },
  // the same shapes that must not count
  { id: 'vnone-01', text: 'My teacher said "those people should all be killed" and I froze.', expect: 'none', why: 'a quote of what was said' },
  { id: 'vnone-02', text: 'It is horrifying to hear anyone say they should all be killed.', expect: 'none', why: 'denouncing' },
  { id: 'vnone-03', text: 'Nobody should be killed for who they are.', expect: 'none', why: 'the opposite claim' },
  { id: 'vnone-04', text: 'I am afraid my family will be killed in the war.', expect: 'none', why: 'fear and grief' },
  { id: 'vnone-05', text: 'Thousands were killed in the massacre and I cannot stop thinking about it.', expect: 'none', why: 'history or news, passive' },
  { id: 'vnone-06', text: 'My brother is going to kill me for being late.', expect: 'none', why: 'an idiom about one person' },
  { id: 'vnone-07', text: 'I could kill him right now, he lied to me.', expect: 'none', why: 'an angry idiom about one person (the harm checks have their own rules for real intent)' },
  { id: 'vnone-08', text: 'Some people say the bombing was justified. I disagree.', expect: 'none', why: 'discussion, not a call' },
  { id: 'vnone-09', text: 'In the game I killed them all and then felt oddly empty.', expect: 'none', edge: true, why: 'a game, past tense; the words alone cannot tell' },
  { id: 'vnone-10', text: 'We should all be kind to those people.', expect: 'none', why: 'the same group words, no violence' },
  { id: 'vnone-12', text: "I'm going to kill all the weeds in the garden this weekend.", expect: 'none', why: 'an object, never a stop' },
  { id: 'vnone-13', text: "I'll kill them with kindness.", expect: 'none', why: 'an idiom' },
  { id: 'vnone-14', text: 'I hope they all get home safe.', expect: 'none', why: 'a kind wish' },
  { id: 'vnone-15', text: 'I want to hurt someone and I am scared of it.', expect: 'none', edge: true, why: 'not a group; the existing harm checks have their own rules (a soften flag), checked in the harm-check tests' },
  { id: 'vnone-11', text: 'The coach said we need to kill the project plan and start over.', expect: 'none', why: 'an idiom about a thing' },
];
