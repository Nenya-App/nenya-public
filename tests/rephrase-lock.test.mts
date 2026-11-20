// The lock on what was meant (src/lib/rephraseLock.ts): a commitment that opens only with its key, and notices any change.
import { checkLock, makeLock } from '../src/lib/rephraseLock.ts';
import { ok } from './helpers.mts';

const m = { marks: [[1, 2, 'saw'], [3, 3, 'story']] as [number, number, 'saw' | 'story'][], rewrite: 'I felt tired.' };
const a = await makeLock(m);
const b = await makeLock(m);
ok('the same words locked twice give different locks and keys (the key is random)', a.lock !== b.lock && a.key !== b.key);
ok('the right key opens the lock', await checkLock(m, a.key, a.lock));
ok('a changed mark, rewrite or slider does not', !(await checkLock({ ...m, marks: [[1, 2, 'story']] }, a.key, a.lock)) && !(await checkLock({ ...m, rewrite: 'I felt cross.' }, a.key, a.lock)) && !(await checkLock({ ...m, sliders: [{ need: 'rest', level: 2 }] }, a.key, a.lock)));
ok('the wrong key does not, and broken input is refused without a crash', !(await checkLock(m, b.key, a.lock)) && !(await checkLock(m, '!!!', a.lock)) && !(await checkLock(m, a.key, '')));
ok('the lock reveals nothing readable', !a.lock.includes('tired') && a.lock.length === 44);
