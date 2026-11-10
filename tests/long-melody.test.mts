// The phrase model for long melodies and the audio file writer. No sound is played here.
import { buildPhrases, movePhrase, setMuted, setNote, remapScale, playlist, phraseLines, canMute, MAX_PHRASES } from '../src/lib/longMelody.ts';
import { colorsToMelody } from '../src/lib/audio.ts';
import { encodeWav, clampStep, clampVolume, melodyDuration, MIN_STEP, MAX_STEP } from '../src/lib/melodyPlayer.ts';
import { ok } from './helpers.mts';

const pal = (n: number, use = true) => ({ useInSound: use, colors: Array.from({ length: 5 }, (_, i) => ({ hex: `#${(n * 40 + i * 20).toString(16).padStart(2, '0')}80C0`, name: `P${n}C${i}` })) });
const L = 25;

// the plain two-color case is the original six-note melody
const two = buildPhrases({ hex: '#2C6E9E' }, { hex: '#D01C1F' }, [], L);
ok('with no palette the melody is the original six notes', two.length === 2 && JSON.stringify(playlist(two).notes) === JSON.stringify(colorsToMelody('#2C6E9E', '#D01C1F', L)));
// order: present, palette 1, wish, palette 2
const full = buildPhrases({ hex: '#2C6E9E', name: 'Here' }, { hex: '#D01C1F' }, [pal(1), pal(2)], L);
ok('two palettes make twelve phrases and 36 notes', full.length === 12 && playlist(full).notes.length === 36 && MAX_PHRASES === 12);
ok('default order: present, palette 1, wish, palette 2', full[0].kind === 'present' && full[1].id === 'palette1-0' && full[6].kind === 'wish' && full[7].id === 'palette2-0');
ok('one palette is allowed (seven phrases, 21 notes)', playlist(buildPhrases({ hex: '#2C6E9E' }, { hex: '#D01C1F' }, [pal(1)], L)).notes.length === 21);
ok('a palette not marked for sound is left out', buildPhrases({ hex: '#2C6E9E' }, { hex: '#D01C1F' }, [pal(1, false)], L).length === 2);
ok('the labels are the person\'s words, then names, then hex', full[0].label === 'Here' && full[1].label === 'P1C0' && full[6].label === '#D01C1F');
// identity phrases cannot be muted, palette ones can
ok('the present and wish phrases cannot be muted', !canMute(full[0]) && !canMute(full[6]) && setMuted(full, 'present', true)[0].muted === false && setMuted(full, 'wish', true)[6].muted === false);
const muted = setMuted(full, 'palette1-2', true);
ok('a palette phrase can be muted and is then left out of the sound', muted[3].muted && playlist(muted).notes.length === 33);
// reorder
const moved = movePhrase(full, 'wish', -1);
ok('phrases can be moved, identity phrases included, and the ends hold', moved[5].id === 'wish' && movePhrase(full, 'present', -1) === full && movePhrase(full, 'palette2-4', 1) === full);
// notes and colors stay separate
const edited = setNote(full, 'present', 1, 3);
ok('changing a note changes only that note and never the color', edited[0].notes[1] === 3 && edited[0].hex === '#2C6E9E' && edited[0].edited && !edited[1].edited && JSON.stringify(edited[1].notes) === JSON.stringify(full[1].notes));
const remapped = remapScale(edited, 25, 15);
ok('after a change of scale, an edited phrase is carried across and an untouched one is re-derived from its color', remapped[0].notes[1] === Math.round(3 * 14 / 24) && JSON.stringify(remapped[1].notes) === JSON.stringify(buildPhrases({ hex: '#2C6E9E' }, { hex: '#D01C1F' }, [pal(1), pal(2)], 15)[1].notes));
ok('the highlight map has a phrase and position for every note played', playlist(muted).at.length === 33 && playlist(muted).at[0].id === 'present' && playlist(muted).at[3].position === 0);
// report lines
const names = Array.from({ length: L }, (_, i) => `N${i}`);
const lines = phraseLines(muted, names);
ok('report lines give the note values and say what is muted, and describe nothing', lines.length === 12 && /Present Here #2C6E9E: N\d+ N3 N\d+/.test(phraseLines(edited, names)[0]) && /muted/.test(lines[3]) && !/sounds|feels|warm|bright/i.test(lines.join(' ')));
// audio file
const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1]), 44100);
ok('the audio file is a well-formed 16-bit mono WAV', String.fromCharCode(...wav.slice(0, 4)) === 'RIFF' && String.fromCharCode(...wav.slice(8, 12)) === 'WAVE' && wav.length === 44 + 8 && new DataView(wav.buffer).getUint16(22, true) === 1 && new DataView(wav.buffer).getUint32(24, true) === 44100);
ok('pace and volume are kept in range', clampStep(0.01) === MIN_STEP && clampStep(9) === MAX_STEP && clampStep(NaN) === 0.39 && clampVolume(2) === 1 && clampVolume(-1) === 0);
ok('a longer melody lasts longer, slower pace lasts longer', melodyDuration(36) > melodyDuration(6) && melodyDuration(6, 1) > melodyDuration(6, 0.4));

// the reports carry the phrases as text
import { formatGatewayData } from '../src/lib/reportText.ts';
{
  const t = formatGatewayData('sound', { currentPitch: 50, currentVolume: 50, potentialPitch: 50, potentialVolume: 50, tonalSystem: 'western', melody: [1, 2, 3, 4], melodyPhrases: [{ kind: 'present', label: 'Windsurfing', hex: '#2C6E9E', notes: [1, 2], muted: false }, { kind: 'palette', label: 'Bellflower', hex: '#5D60B3', notes: [3, 4], muted: true }] }).join('\n');
  ok('the report lists each phrase with its color and note values, and what is muted', /1\. Present Windsurfing #2C6E9E: \S+ \S+/.test(t) && /2\. Palette Bellflower #5D60B3: muted/.test(t), t);
  ok('a melody without phrases reads as before', !/Melody phrases/.test(formatGatewayData('sound', { currentPitch: 1, currentVolume: 1, potentialPitch: 1, potentialVolume: 1, melody: [1, 2] }).join('\n')));
}

// a palette's colors that are the present or wish color are not played twice
{
  const bridge = { useInSound: true, colors: [{ hex: '#2C6E9E', name: 'A' }, { hex: '#5D60B3', name: 'B' }, { hex: '#8E4BA9', name: 'C' }, { hex: '#B8327B', name: 'D' }, { hex: '#D01C1F', name: 'E' }] };
  const b = buildPhrases({ hex: '#2c6e9e' }, { hex: '#D01C1F' }, [bridge], L);
  ok('a bridge plays present, the three colors between, then wish (five phrases, 15 notes), not seven', b.length === 5 && b[0].kind === 'present' && b[1].label === 'B' && b[3].label === 'D' && b[4].kind === 'wish' && playlist(b).notes.length === 15);
  const seeded = (n: number) => ({ useInSound: true, colors: [{ hex: n === 1 ? '#2C6E9E' : '#D01C1F' }, ...Array.from({ length: 4 }, (_, i) => ({ hex: `#${(n * 50 + i * 20).toString(16).padStart(2, '0')}90C0` }))] });
  const two2 = buildPhrases({ hex: '#2C6E9E' }, { hex: '#D01C1F' }, [seeded(1), seeded(2)], L);
  ok('two palettes that each contain their seed make ten phrases and 30 notes', two2.length === 10 && playlist(two2).notes.length === 30);
}
