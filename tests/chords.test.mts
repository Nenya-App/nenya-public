// The chord prototype (staging only): the softened voicing lands on a real chord near the color's notes, volume is shared between voices, and
// nothing shows unless VITE_SOUND_CHORDS=on.
import { readFileSync } from 'node:fs';
import { nearestSettled, voice, SETTLED_SHAPES } from '../src/lib/chords.ts';
import { CHROMATIC_NOTES, MAQAM_RAST_NOTES, hexToMelodyIndices } from '../src/lib/audio.ts';
import { ok } from './helpers.mts';

ok('a chord that is already settled is left exactly as it is', JSON.stringify(nearestSettled([60, 64, 67])) === JSON.stringify({ midis: [60, 64, 67], shape: 'major', moved: 0 }));
ok('one repeated note is not "softened" into anything', nearestSettled([65, 65, 65]).shape === 'single note');
const pc = (m: number) => ((m % 12) + 12) % 12;
let allWhole = true, worst = 0;
for (let i = 0; i < 500; i++) {
  const hex = '#' + ((i * 2654435761) >>> 8 & 0xffffff).toString(16).padStart(6, '0');
  const r = nearestSettled(hexToMelodyIndices(hex, CHROMATIC_NOTES.length).map((j) => CHROMATIC_NOTES[j].midi));
  if (r.shape === 'single note') continue;
  const shape = SETTLED_SHAPES.find((s) => s.name === r.shape)!;
  const classes = new Set(r.midis.map(pc));
  const fits = [...Array(12).keys()].some((root) => { const want = new Set(shape.steps.map((st) => pc(root + st))); return want.size === classes.size && [...want].every((c) => classes.has(c)); });
  allWhole &&= fits; worst = Math.max(worst, r.moved);
}
ok('across 500 colors, every softened chord really is the chord it is named as', allWhole);
ok('and no note set moves more than half an octave in all', worst <= 6, `worst ${worst}`);
ok('softened is Western only: other scales keep their own notes', JSON.stringify(voice([0, 3, 7], MAQAM_RAST_NOTES, 'softened', false).freqs) === JSON.stringify([0, 3, 7].map((i) => MAQAM_RAST_NOTES[i].freq)));
ok('the drone voicing holds a note an octave under the scale\'s first note', voice([0, 4, 7], CHROMATIC_NOTES, 'drone', true).drone === CHROMATIC_NOTES[0].freq / 2);
const lib = readFileSync('src/lib/chords.ts', 'utf8');
const page = readFileSync('src/app/components/pages/SoundGatewayPage.tsx', 'utf8');
const comp = readFileSync('src/app/components/ChordPrototype.tsx', 'utf8');
ok('volume is shared out between voices, so a chord is not louder than a note', /0\.22 \/ Math\.max\(1, voices\)/.test(lib));
ok('every note starts softly, never with a click', /linearRampToValueAtTime\(level, t \+ 0\.12\)/.test(lib));
ok('the prototype appears only with VITE_SOUND_CHORDS=on', /chordsOn\(\) && melodyComplete && \(/.test(page) && /VITE_SOUND_CHORDS === 'on'/.test(lib));
ok('nothing plays by itself; there is a Stop; the notes are written out for people who cannot hear them', !/useEffect\([^)]*play\(/.test(comp) && />Stop</.test(comp) && /noteNames\[n\]/.test(comp));
ok('muted palette phrases are left out of the chords too', /phrases\.filter\(\(p\) => !p\.muted\)\.map\(\(p\) => p\.notes\)/.test(page));
