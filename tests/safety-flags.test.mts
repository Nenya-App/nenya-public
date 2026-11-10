// The crisis check's "can't / cannot / can not" rule: it must catch all three spellings, and leave ordinary uses of "go on" alone.
import { detectFlag } from '../src/lib/safetyFlags.ts';
import { ok } from './helpers.mts';

const tier = (s: string) => detectFlag(s)?.tier ?? null;
const flagged = [
  "I can't go on.", 'I cannot go on.', 'I can not go on.', "I can't go on like this.", 'I cannot go on like this anymore.', "I can't go on with this.", 'I cannot go on with life.',
  "I can't take it anymore.", 'I cannot take this anymore.', 'I can not take it anymore.',
  "I can't do this anymore.", 'I cannot do this anymore.', 'I am so worn down that I cannot do this anymore.', 'I can’t do this anymore.',
];
ok('"can\'t", "cannot" and "can not" are all caught, at soften', flagged.every((s) => tier(s) === 'soften'), flagged.filter((s) => tier(s) !== 'soften').join(' | '));
const left = [
  'I cannot go on holiday this year.', "I can't go on a date tonight.", 'I cannot go on the trip.', "I can't go on stage without my notes.", 'I cannot go on Friday, I have a meeting.', 'I cannot go on about it for long.',
  "I can't do this spreadsheet anymore.", 'I cannot do this report today.', "I can't take it with me.", 'I cannot take this to the party.',
];
ok('ordinary uses of the same words are left alone', left.every((s) => tier(s) === null), left.filter((s) => tier(s) !== null).join(' | '));
ok('what was caught before is still caught at the same tier', tier("I want to kill myself.") === 'stop' && tier('There is no way out.') === 'soften' && tier("I can't see the point, nothing matters.") === 'soften' && tier('I feel hopeless.') === 'soften');
ok('a stop phrase still wins over a soften one in the same message', tier("I cannot go on and I want to end my life.") === 'stop');
