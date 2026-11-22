// The words shown while a reply is on its way: steps, calm, no claimed feeling, nothing on screen for a quick reply.
import { readFileSync } from 'node:fs';
import { WAIT_STEPS, waitingShown, waitingText } from '../src/lib/waitingMessage.ts';
import { ok } from './helpers.mts';

ok('the first words are for screen readers only; nothing is shown on screen for a quick reply', waitingText(0) === 'A reply is on its way.' && !waitingShown(0) && !waitingShown(3));
ok('from 4 seconds a short, kind line is shown', waitingShown(4) && waitingText(4) === 'Taking time with your words.' && waitingText(11) === waitingText(4));
ok('from 12 seconds it says a phone connection can be slow and offers a breath', /phone connection/.test(waitingText(12)) && /slow breath/.test(waitingText(12)));
ok('from 30 seconds it says it is taking longer and that trying again is allowed', /longer than usual/.test(waitingText(30)) && /try sending again/.test(waitingText(40)));
ok('the steps run in order and none claims a feeling or a promise of a result', WAIT_STEPS.every((s, i) => i === 0 || s.afterSec > WAIT_STEPS[i - 1].afterSec) && WAIT_STEPS.every((s) => !/\b(glad|happy|sorry|proud|hope|promise|worry)\b/i.test(s.text)));
const demo = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
ok('the coach page shows these words under the dots, keeps the status region, and no longer says only "The coach is thinking"', /waitingText\(waited\)/.test(demo) && /waitingShown\(waited\)/.test(demo) && /role="status"/.test(demo) && !/The coach is thinking/.test(demo));
ok('the timer stops and resets when the reply arrives', /if \(!sending\) \{\s*setWaited\(0\)/.test(demo) && /clearInterval/.test(demo));
