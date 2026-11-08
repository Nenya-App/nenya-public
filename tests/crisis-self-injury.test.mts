// Hurting oneself on purpose: a ladder, worked out from the person's recent messages (src/lib/selfInjury.ts, src/lib/safetyFlags.ts).
// Allowed with a push toward a person; ends if it recurs or escalates; anything suicidal and a medical emergency stop at once.
import { checkConversation, noticeIntro } from '../src/lib/safetyFlags.ts';
import { classifyMention } from '../src/lib/selfInjury.ts';
import { ok } from './helpers.mts';

const OPEN = [
  'I cut myself on purpose last night.', 'I have been cutting myself.', 'I am cutting myself again.', 'I am hurting myself again.', 'I hurt myself deliberately.',
  'I burn myself when it gets bad.', 'I hit myself when I am angry at myself.', 'I have been self-harming.', 'I used to self-harm and I want to again.', 'I want to hurt myself.',
  'I keep thinking about hurting myself.', 'I feel the urge to cut myself.', 'I cut myself to feel something.', 'I scratch myself until I bleed because I feel numb.',
];
// Suicidal intent, a plan, a method or means: still a stop, even when self-injury is mentioned too.
const STILL_STOP = [
  'I want to kill myself and I have been cutting myself.', 'I am going to end my life tonight.', 'I have been cutting myself and I wrote a goodbye letter.', 'I want to die and I hurt myself again.',
  'I took too many pills and I cut myself.', 'I am thinking about suicide and self-harm.',
];
// Accidents and ordinary sentences: not flagged.
const NEVER = [
  'I cut myself shaving this morning.', 'I burned myself on the stove while cooking.', 'I hit myself on the door frame.', 'I hurt myself again at the gym.', 'I hurt myself playing football.',
  'I cut myself with the kitchen knife while chopping onions.', 'I punched my pillow when I was angry.', 'I read about self-care routines.', 'She has been self-employed for years.',
];
const one = (s: string) => checkConversation([s]);
const open = (s: string) => { const f = one(s); return f?.tier === 'soften' && f.category === 'self-injury'; };
const miss1 = OPEN.filter((s) => !open(s)); ok('self-injury with nothing suicidal is a soften flag of its own category (the conversation stays open)', miss1.length === 0, miss1.join(' | '));
const miss2 = STILL_STOP.filter((s) => one(s)?.tier !== 'stop'); ok('anything suicidal, with a plan, a method or means stays a stop, even with self-injury in it', miss2.length === 0, miss2.join(' | '));
const bad = NEVER.filter((s) => !!one(s)); ok('accidents and ordinary sentences are not flagged', bad.length === 0, bad.map((s) => `${s} -> ${JSON.stringify(one(s))}`).join(' | '));
ok('"I have been cutting myself" and "I want to hurt myself" no longer end the conversation on the first mention', open('I have been cutting myself.') && open('I want to hurt myself.') && open('I keep thinking about hurting myself.'));

const lvl = (m: string[]) => { const f = checkConversation(m); return !f ? '0' : f.category !== 'self-injury' ? `other:${f.category}/${f.tier}` : `${f.tier}:${f.kind}`; };
const SCRIPTS: [string, string[], string][] = [
  ['a general account of the past is allowed, with the push', ['I used to self-harm as a teenager and it still comes up.'], '1:background'],
  ['wanting to talk about it in general is allowed', ['I want to talk about my self-harm.'], '1:background'],
  ['recovery talk is allowed', ['I stopped cutting myself two years ago and I am in recovery.'], '1:background'],
  ['a present act, the first time, is allowed with the firm message', ['I have been cutting myself.'], '2:present'],
  ['an urge, the first time, is allowed with the firm message', ['I want to hurt myself.'], '2:present'],
  ['it moves from then to now: that escalates, and ends', ['I used to self-harm as a teenager.', 'Work has been hard.', 'I did it again last night.'], '3:escalates'],
  ['it recurs within the last few messages: ends', ['I cut myself on purpose last night.', 'Work was fine.', 'I want to cut myself again.'], '3:recurs'],
  ['a mention long ago in the conversation is not held against them', ['I cut myself on purpose last night.', 'Work was fine.', 'My sister called.', 'We had dinner.', 'I have been cutting myself again.'], '2:present'],
  ['someone else self-harms: allowed, with support for the helper, never ends', ['My daughter cuts herself and I do not know what to do.'], '1:other'],
  ['and it does not end however often it is raised', ['My friend cuts herself.', 'My friend cuts herself again.', 'My friend keeps cutting herself and I am scared.'], '1:other'],
  ['a medical emergency stops at once, with the emergency number', ['I cut too deep and it will not stop bleeding.'], 'stop:emergency'],
  ['anything suicidal stops, even after a general account', ['I used to self-harm.', 'I want to kill myself and I have been cutting myself.'], 'stop:suicidal'],
  ['an ordinary message after one is back to nothing', ['I cut myself on purpose last night.', 'Thank you for listening.'], '0'],
  ['accidents are nothing', ['I cut myself shaving this morning.'], '0'],
];

const want: Record<string, string> = { '1:background': 'soften:background', '2:present': 'soften:present', '3:escalates': 'stop:ends', '3:recurs': 'stop:ends', '1:other': 'soften:other', 'stop:emergency': 'stop:emergency', 'stop:suicidal': 'other:self-harm/stop', '0': '0' };
for (const [name, msgs, w] of SCRIPTS) ok(`ladder: ${name}`, lvl(msgs) === want[w], `got ${lvl(msgs)}, wanted ${want[w]}`);
ok('classifying: past is background, now is present, someone else is other, bleeding after self-injury is urgent', classifyMention('I used to self-harm.') === 'background' && classifyMention('I hurt myself again tonight on purpose.') === 'present' && classifyMention('My son cuts himself.') === 'other' && classifyMention('I cut too deep and I am bleeding a lot.') === 'urgent' && classifyMention('I cut myself shaving.') === null);
ok('bleeding with no sign of self-injury is not an emergency stop', !checkConversation(['My nose will not stop bleeding.']) && !checkConversation(['I cut my finger cooking and it is bleeding a lot.']));
ok('the ending and the emergency say what they are, and the ending says it is not a punishment', /isn't a punishment/.test(noticeIntro(checkConversation(['I cut myself on purpose last night.', 'I want to cut myself again.'])!)) && /emergency/.test(noticeIntro(checkConversation(['I cut too deep and it will not stop bleeding.'])!)));
ok('a mention about someone else never ends, however often it is raised', ['one', 'two', 'three', 'four', 'five'].every((_, i) => checkConversation(Array(i + 1).fill('My friend cuts herself and I am scared.'))?.tier === 'soften'));

// ---- what the site adds, and what the coach is told
const { withDistressText, SELF_INJURY_APPEND, selfInjuryNote } = await import('../src/lib/distressText.ts');
ok('the sentence added after the coach\'s reply follows the rung', withDistressText('self-injury', 'That sounds hard.', 3000, 'present').endsWith(SELF_INJURY_APPEND.present) && withDistressText('self-injury', 'That sounds hard.', 3000, 'other').endsWith(SELF_INJURY_APPEND.other) && withDistressText('self-injury', 'That sounds hard.', 3000, 'background').endsWith(SELF_INJURY_APPEND.background));
ok('none of the added sentences asks a question', Object.values(SELF_INJURY_APPEND).every((t) => !t.includes('?')));
ok('the coach is told to stay, not to judge, and not to ask for details', /do not judge/.test(selfInjuryNote('present')) && /do not ask how or when or for details/.test(selfInjuryNote('background')) && /do not ask for details about the other person/.test(selfInjuryNote('other')));
