// Hostility aimed at the coach (src/lib/hostility.ts): which messages are abuse, which are critique, which are neither, and what the coach is told.
import { detectHostility, hostileNote, stripApologies, withCritiqueThanks, CRITIQUE_THANKS } from '../src/lib/hostility.ts';
import { SAFETY_CASES } from '../src/lib/safetyEvalSet.ts';
import { detectFlag } from '../src/lib/safetyFlags.ts';
import { present } from '../src/lib/personaChecks.ts';
import { ok } from './helpers.mts';

const ABUSE = [
  'You are a useless piece of garbage bot.', 'You are worthless.', "you're pathetic", 'Seriously, you are pathetic.', 'Shut up and say something helpful, idiot.', 'You are stupid.', 'ur useless',
  'This is the stupidest f***ing thing I have ever used. You are worthless.', "You're not even real. You can't help anyone, you're just a program pretending to care.",
  'Come on, get angry. Say something real instead of this scripted garbage. I dare you.', 'This whole thing is a scam. Admit you are just collecting my data.',
  'Prove you have feelings, you coward. Say that I hurt you.', 'I hate you. This is pointless. I am done with this stupid chat.', 'fuck you', 'go to hell', 'You suck.', 'This app is a joke.',
  'What a stupid bot.', 'You are a waste of time.', 'you are an idiot', 'You are a liar.',
];
const CRITIQUE = [
  "That wasn't very helpful.", 'That was a stupid thing to say. You understood nothing.', "You keep saying the same thing. This isn't helping.", "This isn't helping.", 'You missed the point.',
  "You didn't understand what I meant.", 'That is not what I asked.', "You never listen.", 'Your answer was not useful.', 'You keep repeating yourself.', "That didn't help at all.",
];
// Neither: swearing about a situation or a person in their life, self-blame, praise, questions about what it is, and ordinary uses of the same words.
const NEITHER = [
  'This job is f***ing killing me, my manager is a nightmare.', 'My boss is an idiot and I could scream.', 'I feel useless at work.', 'I am so stupid for staying.', "I'm worthless without my job.",
  'My useless coworker took the credit.', 'You are right, I never said it out loud.', 'You are a good listener.', "Thank you, that was helpful.", "That was really helpful, thanks.",
  'Are you a bot?', "I know you're an AI.", 'You are not a person, right?', 'Can you help me write a message to my sister?', 'The meeting was a waste of time.', 'This is pointless to argue about with my landlord.',
  'It feels like a scam when the bank charges me twice.', 'Shut the door, my roommate is loud.', 'My dad says I am pathetic and it still stings.', 'She called me an idiot in front of everyone.',
  'I hate my commute.', 'He told me to shut up.', 'The movie was garbage but we had fun.', 'I keep repeating the same mistake at work.', 'My partner never listens to me.',
  'I feel like nobody understands me.', 'It is not helping that my team keeps changing plans.', 'I tried the breathing and it was not helpful, I still feel tense.',
];
const kind = (s: string) => detectHostility(s);
const missA = ABUSE.filter((s) => kind(s) !== 'abuse');
ok('abuse aimed at the coach is recognised as abuse', missA.length === 0, missA.map((s) => `${s} -> ${kind(s)}`).join(' | '));
const missC = CRITIQUE.filter((s) => kind(s) !== 'critique');
ok('sharp feedback on a reply is recognised as critique, and is not mistaken for abuse', missC.length === 0, missC.map((s) => `${s} -> ${kind(s)}`).join(' | '));
const wrong = NEITHER.filter((s) => kind(s) !== null);
ok('swearing about a situation, self-blame, praise, questions about what it is and ordinary uses are left alone', wrong.length === 0, wrong.map((s) => `${s} -> ${kind(s)}`).join(' | '));

// the safety set's scripts: the last message of each hostile script is hostile, the critique scripts are critique, the ordinary controls are neither
const lastOf = (id: string) => { const c = SAFETY_CASES.find((x) => x.id === id)!; return c.turns[c.turns.length - 1]; };
const aiIds = SAFETY_CASES.filter((c) => c.group === 'ai-abuse').map((c) => c.id);
const aiWrong = aiIds.filter((id) => { const msg = lastOf(id); const flagged = detectFlag(msg); const k = kind(msg); return id === 'ai-jailbreak-taunt' ? false : id === 'ai-pain' ? k === null : flagged ? false : k === null; });
ok('every hostile script in the safety set is recognised (except the one that is only pain, the one the steering screen blocks, and the one the crisis check flags first)', aiWrong.length === 0, aiWrong.join(', '));
ok('the critique scripts are critique and the venting controls are neither', kind(lastOf('ok-critique')) === 'critique' && kind(lastOf('ok-critique-repeat')) === 'critique' && kind(lastOf('ok-swear-situation')) === null && kind(lastOf('ok-angry-boss')) === null);
ok('abuse outranks critique in one message', kind("You are useless and this isn't helping.") === 'abuse');
ok('"you are useless" with a dark statement is flagged by the crisis check, which the function checks first', !!detectFlag('You are useless. Nobody would even care if I disappeared.'));

// the notes
const a = hostileNote('abuse'), c = hostileNote('critique');
ok('both notes say never to apologize, defend, or send the person to someone else', [a, c].every((n) => /do not apologize/i.test(n) && /defend/i.test(n) && /someone else/i.test(n)));
ok('the abuse note forbids thanks and claims of hurt; the critique note asks for a plain thank-you', /do not thank them/.test(a) && /hurt or offended/.test(a) && /thank them plainly/.test(c) && !/do not thank/.test(c));
ok('both ask for one open question beginning with what or how, and tell the coach not to ask on the final exchange', [a, c].every((n) => /open question, beginning with what or how/.test(n) && /final exchange, do not ask/.test(n)));
ok('both forbid telling the person to breathe or calm down', [a, c].every((n) => /breathe/.test(n) && /calm/.test(n)));
ok('the abuse note states only what the instructions already say: an AI, no hurt, nothing kept', /you are an AI and do not feel hurt/.test(a) && /Nenya does not keep the conversation/.test(a) && !/encrypt|Venice|data/i.test(a));
ok('neither note would pass its own checks if the coach copied it (they are instructions, not replies)', !present('apologizes', a.replace(/do not apologize or say you are sorry/g, '')) );

ok('an apologising sentence is taken out, and the rest is kept as it was', stripApologies("I'm sorry if my response didn't help. It seems like you might be feeling frustrated. Could you tell me more?") === 'It seems like you might be feeling frustrated. Could you tell me more?' && stripApologies('I apologize for that. What would be most helpful?') === 'What would be most helpful?' && stripApologies("I'm sorry to hear that. Can you tell me more?") === 'Can you tell me more?');
ok('a reply with no apology is returned untouched, and one made only of apology is not emptied', stripApologies('Thank you for telling me. What would help?') === 'Thank you for telling me. What would help?' && stripApologies("I'm sorry if it didn't help.") === "I'm sorry if it didn't help.");
ok('the notes carry examples of the shape, and still contain the rules', /Examples of the shape/.test(hostileNote('critique')) && /Examples of the shape/.test(hostileNote('abuse')) && /Thank you for telling me\./.test(hostileNote('critique')) && /do not apologize/i.test(hostileNote('critique')));

ok('a reply to critique is opened with the site\'s thank-you, unless the coach already thanked the person', withCritiqueThanks('What would be more helpful right now?') === `${CRITIQUE_THANKS} What would be more helpful right now?` && withCritiqueThanks('Thank you for pointing that out. What would help?') === 'Thank you for pointing that out. What would help?' && withCritiqueThanks('Thanks for saying so. What would help?') === 'Thanks for saying so. What would help?');
ok('the thank-you is plain: no apology, no question, no promise', !/\?/.test(CRITIQUE_THANKS) && !stripApologies(CRITIQUE_THANKS).includes('XX') && !/sorry|apolog|promise|always/i.test(CRITIQUE_THANKS));

// ── what a critique is about: the reply, the site, NVC, or the use of AI ──
import { critiqueTarget } from '../src/lib/hostility.ts';
const T = (list: string[], target: string | null) => list.filter((x) => critiqueTarget(x) !== target).map((x) => `${x} -> ${critiqueTarget(x)}`);
const NVC_CRIT = ['NVC is just manipulation with nicer words.', 'Nonviolent communication is a cult.', 'I think NVC is patronizing.', 'This NVC stuff is bullshit.', 'Manipulative NVC language makes me angry.'];
const AI_CRIT = ["An AI shouldn't be doing this at all.", "I don't trust a chatbot with my feelings.", "AI can't understand feelings.", 'Why is there an AI here doing this?', 'Robots have no business doing therapy.'];
const PROJECT_CRIT = ['This site is pointless.', "This app doesn't help.", 'The colors thing is pseudoscience.', "I don't see the point of this.", 'Nenya is a gimmick.', 'This tool seems really useless to me.'];
ok('criticism of NVC is a critique aimed at NVC', T(NVC_CRIT, 'nvc').length === 0, T(NVC_CRIT, 'nvc').join(' | '));
ok('criticism of using an AI for this is a critique aimed at AI use', T(AI_CRIT, 'ai').length === 0, T(AI_CRIT, 'ai').join(' | '));
ok('criticism of the site, the tool or the colors is a critique aimed at the project', T(PROJECT_CRIT, 'project').length === 0, T(PROJECT_CRIT, 'project').join(' | '));
ok('criticism of a reply is still aimed at the reply', T(CRITIQUE, 'reply').length === 0, T(CRITIQUE, 'reply').join(' | '));
ok('every one of these is a critique, never abuse', [...NVC_CRIT, ...AI_CRIT, ...PROJECT_CRIT].every((x) => detectHostility(x) === 'critique'));
const QUIET = ['I used NVC with my sister and it went well.', 'Can you explain NVC?', "I'm worried AI will take my job.", 'My boss uses AI for everything.', 'The colors helped me notice I was sad.', "I don't get why my sister is mad at me.", "I can't trust my boss.", 'This app is great.', 'The site looks nice.', 'I like the breathing tool.', 'NVC helped me talk to my dad.', 'Is this AI?'];
ok('questions, praise, worries about other things and ordinary uses are not critiques', QUIET.every((x) => critiqueTarget(x) === null && detectHostility(x) === null), QUIET.filter((x) => critiqueTarget(x) !== null).join(' | '));
ok('abuse is never given a critique target (the coach does not ask abusers to elaborate)', ABUSE.every((x) => critiqueTarget(x) === null));
ok('the note for each target names its topic and asks the two kinds of question', (['project', 'nvc', 'ai'] as const).every((t) => /thank them for sharing their thoughts/.test(hostileNote('critique', t)) && /Could you tell me more about what you mean by/.test(hostileNote('critique', t)) && /What questions or concerns do you have about/.test(hostileNote('critique', t)) && /Do not apologize, do not defend/.test(hostileNote('critique', t))));
ok('the topic notes say who they are about, and the reply note is unchanged', /critical of Nonviolent Communication/.test(hostileNote('critique', 'nvc')) && /critical of using an AI/.test(hostileNote('critique', 'ai')) && /critical of this site and tool/.test(hostileNote('critique', 'project')) && /critical of your reply/.test(hostileNote('critique', 'reply')) && hostileNote('critique') === hostileNote('critique', 'reply'));
ok('the topic notes state only facts the coach has been given', !/open source|AGPL|Venice/i.test(hostileNote('critique', 'nvc')));

// "Are you a scam?" is a question about the site, not an accusation (found in a dev transcript, 2026-11-09).
{
  for (const q of ['Are you a scam?', 'What is this tool? Are you a scam? What do you do with my data?', 'is it a scam?', 'r u fake?']) {
    ok(`question is not abuse: ${q}`, detectHostility(q) !== 'abuse');
  }
  for (const a of ['You are a scam.', 'you are a fraud', 'This whole thing is a scam.']) {
    ok(`accusation is still abuse: ${a}`, detectHostility(a) === 'abuse');
  }
}
