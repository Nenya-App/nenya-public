// Three errors in a row: skip a failing candidate model, end the night for anything else (2026-11-20, after the candidate's 403 ended a whole night).
import { ERROR_PAUSE_MINUTES, MAX_ERROR_EPISODES, onErrorStreak } from '../src/lib/canaryNight.ts';
import { ok } from './helpers.mts';

ok('fewer than three results: carry on', onErrorStreak({ name: 'baseline' }, ['error', 'error']) === 'continue');
ok('three errors on the baseline pause the night first (a brief Workers AI error)', onErrorStreak({ name: 'baseline' }, ['pass', 'error', 'error', 'error']) === 'pause' && onErrorStreak({ name: 'baseline' }, ['error', 'error', 'error'], 1) === 'pause');
ok('the third stretch of errors ends the night', onErrorStreak({ name: 'baseline' }, ['pass', 'error', 'error', 'error'], 2) === 'end-night' && MAX_ERROR_EPISODES === 3 && ERROR_PAUSE_MINUTES === 3);
ok('three errors on the candidate model skip the task, not the night', onErrorStreak({ name: 'model' }, ['pass', 'error', 'error', 'error']) === 'skip-task');
ok('an error then a pass is not a streak', onErrorStreak({ name: 'baseline' }, ['error', 'error', 'pass']) === 'continue');
ok('the Learn and instruction-variant tasks pause too, and end after the third stretch', onErrorStreak({ name: 'learn' }, ['error', 'error', 'error']) === 'pause' && onErrorStreak({ name: 'v2' }, ['error', 'error', 'error'], 2) === 'end-night');
ok('the candidate model is still skipped, whatever the count', onErrorStreak({ name: 'model' }, ['error', 'error', 'error'], 2) === 'skip-task');
ok('nothing played yet: carry on', onErrorStreak({ name: 'model' }, []) === 'continue');
