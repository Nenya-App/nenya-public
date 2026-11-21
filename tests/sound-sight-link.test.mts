// The Sound and Sight link in the tray (either order, and Edit): what each offers the other, and that reopening never replaces a saved melody.
import { readFileSync } from 'node:fs';
import { colorsToMelody, melodyToColors, getScale } from '../src/lib/audio.ts';
import { melodyColorsFor, melodyShared } from '../src/lib/melodySeed.ts';
import { addLens, emptyLensState, openLens, removeLens } from '../src/lib/lensState.ts';
import { ok } from './helpers.mts';

const sound = readFileSync('src/app/components/pages/SoundGatewayPage.tsx', 'utf8');
const app = readFileSync('src/app/App.tsx', 'utf8');
const N = getScale('western').length;

// Sight first: Sound starts from the two Sight colors, and says so (connected), so it offers nothing back.
const fromSight = colorsToMelody('#336699', '#CC9933', N);
ok('Sight first: two colors make a six-note melody inside the scale', fromSight.length === 6 && fromSight.every((n) => n >= 0 && n < N));
const soundAfterSight = { melody: fromSight, melodyConnected: true, melodyColor1: '#336699', melodyColor2: '#CC9933', bringToSight: false };
ok('Sight first: the connected melody offers Sight nothing, and brings nothing', melodyColorsFor(soundAfterSight) === null && !melodyShared(soundAfterSight));

// The melody's colors are a stable starting point: turning notes into colors and back gives the same notes.
const roundTripOk = [[0, 3, 5, 7, 9, 11], [11, 11, 11, 0, 0, 0], [4, 4, 4, 4, 4, 4], [2, 8, 1, 6, 10, 3]].every((m) => {
  const [a, b] = melodyToColors(m, N);
  return colorsToMelody(a, b, N).join() === m.join();
});
ok('a melody turned into two colors and back gives the same six notes', roundTripOk);

// Sound first: the melody on its own offers its colors; Sight starts from them only if "Bring this to Sight" stays checked.
const own = [2, 8, 1, 6, 10, 3];
const [c1, c2] = melodyToColors(own, N);
const soundFirst = { melody: own, melodyConnected: false, melodyColor1: c1, melodyColor2: c2, bringToSight: true };
ok('Sound first: the melody offers its two colors', JSON.stringify(melodyColorsFor(soundFirst)) === JSON.stringify({ color1: c1.toUpperCase(), color2: c2.toUpperCase() }));
ok('Sound first: checked brings them to Sight; unchecked does not', melodyShared(soundFirst) && !melodyShared({ ...soundFirst, bringToSight: false }));

// In the tray: adding Sight afterwards never changes Sound's saved data, and removing Sight never changes it either.
let s = openLens(emptyLensState(), 'sound');
s = addLens(s, 'sound', soundFirst);
const before = JSON.stringify(s.added.find((a) => a.gateway === 'sound')!.data);
s = addLens(s, 'sight', { color1: c1, color2: c2 });
ok('adding Sight leaves the saved melody exactly as it was', JSON.stringify(s.added.find((a) => a.gateway === 'sound')!.data) === before);
s = removeLens(s, 'sight');
ok('taking Sight out leaves the saved melody exactly as it was', JSON.stringify(s.added.find((a) => a.gateway === 'sound')!.data) === before && s.added.length === 1);

// Edit: reopening Sound must keep a saved melody even though Sight colors now exist (the case that wiped it).
ok('Edit starts from the saved connection, not from whether Sight now has colors', /useState<boolean>\(init \? !!init\.melodyConnected && hasValidColors : hasValidColors\)/.test(sound));
ok('Edit keeps the saved melody: the effect that reseeds it skips its first run', /keepSaved = useRef\(!!init\)/.test(sound) && /if \(keepSaved\.current\) \{ keepSaved\.current = false; return; \}/.test(sound));
ok('Edit keeps the saved "Bring this to Sight" choice', /useState<boolean>\(init\?\.bringToSight \?\? true\)/.test(sound));

// The tray offers "bring to Sight" whenever Sight has not been added; the old flow keeps its own rule.
ok('in the tray Sound offers its colors to Sight whenever Sight is not yet added', /sightComesLater=\{lensTrayOn\(\) \? !gatewayData\.some\(\(g\) => g\.gateway === 'sight'\)/.test(app));
ok('Sight is given the melody colors from Sound\'s saved data', /melodyColors=\{melodyColorsFor\(gatewayData\.find\(\(g\) => g\.gateway === 'sound'\)\?\.data\)\}/.test(app));
