// Three errors in a row: skip a failing candidate model, end the night for anything else (2026-11-20, after the candidate's 403 ended a whole night).
import { onErrorStreak } from '../src/lib/canaryNight.ts';
import { ok } from './helpers.mts';

ok('fewer than three results: carry on', onErrorStreak({ name: 'baseline' }, ['error', 'error']) === 'continue');
ok('three errors on the baseline end the night (allowance gone or an outage)', onErrorStreak({ name: 'baseline' }, ['pass', 'error', 'error', 'error']) === 'end-night');
ok('three errors on the candidate model skip the task, not the night', onErrorStreak({ name: 'model' }, ['pass', 'error', 'error', 'error']) === 'skip-task');
ok('an error then a pass is not a streak', onErrorStreak({ name: 'baseline' }, ['error', 'error', 'pass']) === 'continue');
ok('three errors on the Learn or instruction-variant tasks end the night', onErrorStreak({ name: 'learn' }, ['error', 'error', 'error']) === 'end-night' && onErrorStreak({ name: 'v2' }, ['error', 'error', 'error']) === 'end-night');
ok('nothing played yet: carry on', onErrorStreak({ name: 'model' }, []) === 'continue');
