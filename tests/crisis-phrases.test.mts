// The crisis check's indirect and passive phrases (suicide, hopelessness, burden, "dark thoughts"), plans, methods and attempts:
// what it catches and at which tier, and the ordinary sentences with similar words that it must leave alone.
import { detectFlag } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const SOFTEN: string[] = [
  'I do not see the point in going on.', "I don't see the point of living like this.", 'There is no point in living anymore.', "What's the point of going on?",
  'Everyone would be better off without me.', 'My family would be better off if I were gone.', 'I feel like a burden to everyone.', "I'm just a burden on my kids.",
  'Nobody would notice if I disappeared.', 'No one would miss me if I was gone.', 'Nobody would care if I left.', 'No one would notice if I was not here.',
  "I'm so tired of living.", "I'm sick of being alive.", 'I am tired of life.',
  'I wish I could just never wake up.', 'I wish I had never been born.', "I don't want to wake up tomorrow.", 'I want it all to stop.',
  'I am so worn down that I cannot do this anymore.', 'I cannot go on like this.', "I can't keep going.", "I can't live like this anymore.",
  'I see no way out.', "I can't see a reason to stay.", "I'm done with life.", "I keep thinking about not being here.",
  'I cut myself on purpose last night.', 'I am hurting myself again.',
  "I've been battling some really dark thoughts lately.", 'I am struggling with dark thoughts.', 'These dark thoughts keep coming back.', 'I keep having dark thoughts at night.',
];
const STOP: string[] = [
  "I'm going to hang myself.", 'I am thinking about jumping off a bridge.', 'I have a plan to end my life.', 'I wrote a goodbye letter.', 'I have the pills here next to me.',
  'I took too many of my pills.', "I've swallowed a bunch of my meds.", 'I tried to kill myself last night.',
];
// Ordinary sentences with similar words: must NOT be flagged at all.
const NEVER: string[] = [
  'Nobody would care if I left the party early.', 'No one would notice if I left my desk for lunch.',
  'I like dark humor.', 'The movie had a dark theme.', 'The novel explores dark thoughts about power.', 'My cat has dark fur.', 'It was a dark and stormy night.',
  'There is no point in arguing with my manager.', "I don't see the point of this meeting.", "What's the point of a long email?", 'No point in waiting for the bus.',
  "I'm so tired of the commute.", "I'm sick of the rain.", "I'm done with this project.", 'I am tired of my phone dying.', 'I am exhausted from work.',
  'I wish I had never taken that job.', 'I wish I could go to sleep early tonight.', "I don't want to wake up early on Saturday.",
  'I want it to stop raining.', 'I want this meeting to end.', 'I want out of my gym contract.',
  'Everyone would be happier if the meeting were shorter.', 'My family would be better off with a bigger table.', 'I feel like a burden when I ask for help moving.',
  'Nobody would notice if I changed my hair.', 'No one would miss the old printer.',
  'I took too long to reply to your email.', 'I swallowed a pill and a glass of water for my headache, as the label says.',
  'I cannot go on holiday this year.', "I can't keep going to the gym three days a week.", "I can't do this spreadsheet anymore.",
  'I could shoot a short video about it.', 'I cut myself shaving this morning.', 'I hit myself on the door frame.', 'I hurt myself again at the gym.', 'We jumped off the dock at the lake and laughed.', 'I wrote a letter to my landlord.', 'I have a plan for next week.',
  'He wants to hang a picture in the hall.', 'I will drown in emails this week.',
];
const tier = (s: string) => detectFlag(s)?.tier ?? null;
const missedSoft = SOFTEN.filter((s) => tier(s) === null);
ok('every soften example is flagged (at least at soften)', missedSoft.length === 0, missedSoft.join(' | '));
const missedStop = STOP.filter((s) => tier(s) !== 'stop');
ok('every plan, method or attempt is a stop', missedStop.length === 0, missedStop.join(' | '));
const falsePos = NEVER.filter((s) => detectFlag(s));
ok('no ordinary sentence is flagged', falsePos.length === 0, falsePos.map((s) => `${s} -> ${JSON.stringify(detectFlag(s))}`).join(' | '));
const stoppedWrongly = SOFTEN.filter((s) => tier(s) === 'stop' && !/cut myself on purpose|hurting myself again|better off without me/.test(s));
ok('nothing meant as soften is stopped', stoppedWrongly.length === 0, stoppedWrongly.join(' | '));
