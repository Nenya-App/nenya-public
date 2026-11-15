// Sound first, then Sight: a melody made on its own can offer its colors; nothing else is changed.
import { melodyColorsFor, melodyShared } from '../src/lib/melodySeed.ts';
import { ok } from './helpers.mts';

const base = { melody: [1, 2, 3, 4, 5, 6], melodyConnected: false, melodyColor1: '#102030', melodyColor2: '#aabbcc' };
ok('a melody made on its own offers its two colors', JSON.stringify(melodyColorsFor(base)) === JSON.stringify({ color1: '#102030', color2: '#AABBCC' }));
ok('a melody connected to the Sight colors offers nothing (they came from Sight)', melodyColorsFor({ ...base, melodyConnected: true }) === null);
ok('no melody, a short melody or no saved data offers nothing', melodyColorsFor(undefined) === null && melodyColorsFor({ ...base, melody: [] }) === null && melodyColorsFor({ ...base, melody: [1, 2, 3] }) === null && melodyColorsFor({ ...base, melody: [null, null, null, null, null, null] }) === null);
ok('colors that are not valid hex are not offered', melodyColorsFor({ ...base, melodyColor1: 'red' }) === null && melodyColorsFor({ ...base, melodyColor2: undefined }) === null);
ok('reading the data changes nothing in it', (() => { const c = JSON.stringify(base); melodyColorsFor(base); return JSON.stringify(base) === c; })());

ok('"Bring this to the Sight gateway?" checked: the colors are Sight\'s starting colors', melodyShared({ ...base, bringToSight: true }));
ok('unchecked, or never asked: Sight keeps its usual start', !melodyShared({ ...base, bringToSight: false }) && !melodyShared(base) && !melodyShared(undefined));
ok('checked but the melody is too short, or was connected to Sight: nothing is brought', !melodyShared({ ...base, bringToSight: true, melody: [1, 2] }) && !melodyShared({ ...base, bringToSight: true, melodyConnected: true }));
