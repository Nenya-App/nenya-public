// The four tone styles (harp, bowls, chord, scale): the notes of one breath for each, and the setting that picks one.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
};
(globalThis as any).window ??= { addEventListener() {}, removeEventListener() {} };
const A = await import('../src/lib/breathArrangements.ts');
const { eventsBetween } = await import('../src/lib/breathTones.ts');
const dm = await import('../src/lib/deviceMemory.ts');
const { PRESETS } = await import('../src/lib/breathingPresets.ts');
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const sec = (a: number, b = 0, c = 0, d = 0) => ({ ih: a * 1000, hi: b * 1000, ex: c * 1000, ho: d * 1000 });
const midiOf = (f: number) => Math.round(69 + 12 * Math.log2(f / 440));
const PENTATONIC_D = new Set([2, 4, 6, 9, 11]); // D E F# A B as pitch classes
const inD = (f: number) => PENTATONIC_D.has(((midiOf(f) % 12) + 12) % 12);

// ---- the list of styles
ok('there are four styles: harp, bowls, chord and the original scale; harp is the default', A.ARRANGEMENTS.map((a) => a.id).join() === 'harp,bowls,chord,scale' && A.DEFAULT_ARRANGEMENT === 'harp');
ok('every style has a plain description for the panel', A.ARRANGEMENTS.every((a) => a.label.length > 2 && a.description.length > 30));
ok('only the harp has a drone under it', A.ARRANGEMENTS.filter((a) => a.drone).map((a) => a.id).join() === 'harp');
ok('anything that is not a style is refused', A.isArrangement('harp') && A.isArrangement('scale') && !A.isArrangement('organ') && !A.isArrangement(null));

// ---- true of every style, for every preset
const all = [...PRESETS, sec(12, 0, 12, 0), sec(1, 0, 1, 0)];
let bad = '';
for (const arr of A.ARRANGEMENTS.map((a) => a.id)) {
  for (const p of all) {
    const cycle = p.ih + (p.hi || 0) + p.ex + (p.ho || 0);
    for (const e of A.arrangementEvents(arr, p)) {
      if (!(e.t >= 0 && e.t < cycle)) bad = `${arr}: a note outside the breath`;
      if (!Number.isFinite(e.freq) || !(e.gain > 0 && e.gain <= 0.25) || !(e.dur > 0)) bad = `${arr}: bad freq/gain/dur`;
      if (arr !== 'scale' && e.timbre !== 'tick' && e.timbre !== 'bowl' && !inD(e.freq)) bad = `${arr}: ${e.freq} Hz is not in D pentatonic`;
    }
  }
}
ok('every note of every style, for every preset, is inside the breath, finite and not loud; apart from the original scale (which is C pentatonic), notes other than ticks and bowl partials are in D pentatonic', bad === '', bad);
ok('every style gives the same events however it is asked (pure and in time order)', A.ARRANGEMENTS.every((a) => { const x = A.arrangementEvents(a.id, sec(4, 4, 4, 4)); return JSON.stringify(x) === JSON.stringify(A.arrangementEvents(a.id, sec(4, 4, 4, 4))) && x.every((e, i) => i === 0 || e.t >= x[i - 1].t); }));
ok('a window on the shared clock works for each style', A.ARRANGEMENTS.every((a) => eventsBetween(sec(5, 0, 5, 0), 1000, 1000, 11000, a.id).length === A.arrangementEvents(a.id, sec(5, 0, 5, 0)).length));

// ---- harp
const h = A.arrangementEvents('harp', sec(5, 0, 5, 0));
const hIn = h.filter((e) => e.kind === 'inhale'), hEx = h.filter((e) => e.kind === 'exhale');
ok('harp: a plucked note a count, five rising then five falling', h.length === 10 && h.every((e) => e.timbre === 'harp') && hIn.every((e, i) => i === 0 || e.freq > hIn[i - 1].freq) && hEx.every((e, i) => i === 0 || e.freq < hEx[i - 1].freq));
ok('harp: the exhale lands on the home note (D4), the inhale starts there and climbs to the top', hEx[hEx.length - 1].freq === A.HARP_HOME && hIn[0].freq === A.HARP_HOME && hIn[hIn.length - 1].freq === A.HARP_LADDER[5] && midiOf(A.HARP_HOME) === 62);
ok('harp: notes ring for seconds, longer than the beat, so they overlap', h.every((e) => e.dur >= 1.5));
const hb = A.arrangementEvents('harp', sec(4, 4, 4, 4));
ok('harp: the hold after the inhale rests on the open D5, quietly; the hold after the exhale on the home note, quietly', hb.filter((e) => e.kind === 'hold-in').every((e) => e.freq === A.HARP_OPEN && e.gain < 0.06) && hb.filter((e) => e.kind === 'hold-out').every((e) => e.freq === A.HARP_HOME && e.gain < 0.06));
ok('harp: the first note of a breath is a little firmer', h[0].gain > h[1].gain);
ok('harp: a phase longer than the ladder shares notes but stays in range', A.arrangementEvents('harp', sec(12, 0, 12, 0)).every((e) => e.freq >= A.HARP_HOME && e.freq <= A.HARP_LADDER[5]));

// ---- bowls
const b = A.arrangementEvents('bowls', sec(4, 0, 6, 0));
const bowls = b.filter((e) => e.timbre === 'bowl'), pads = b.filter((e) => e.timbre === 'pad'), ticks = b.filter((e) => e.timbre === 'tick');
ok('bowls: exactly two bowls a breath, at the start of the inhale and the start of the exhale', bowls.length === 2 && bowls[0].t === 0 && bowls[0].kind === 'inhale' && bowls[1].t === 4000 && bowls[1].kind === 'exhale');
ok('bowls: the exhale bowl is the fifth of the key, below the home note (A3 under D4)', Math.abs(bowls[0].freq / bowls[1].freq - 4 / 3) < 0.01 && midiOf(bowls[0].freq) === 62 && midiOf(bowls[1].freq) === 57);
ok('bowls: a tick for every count (ten), softer than the notes', ticks.length === 10 && ticks.every((e) => e.gain <= 0.08));
ok('bowls: two swelling voices, in over the inhale and out over the exhale', pads.length === 2 && pads.every((e) => e.t === 0 && Math.abs((e.attack ?? 0) - 4) < 0.01 && Math.abs((e.release ?? 0) - 6) < 0.01));
const bBox = A.arrangementEvents('bowls', sec(4, 4, 4, 4));
ok('bowls: in box breathing the holds have quiet ticks and the exhale bowl waits for the exhale', bBox.filter((e) => e.timbre === 'tick' && e.kind === 'hold-in').length === 4 && bBox.filter((e) => e.timbre === 'tick' && e.kind === 'hold-out').length === 4 && bBox.filter((e) => e.timbre === 'bowl')[1].t === 8000);
ok('bowls: in 4-7-8 there is no hold-out to tick', A.arrangementEvents('bowls', sec(4, 7, 8, 0)).filter((e) => e.kind === 'hold-out').length === 0);

// ---- chord
const c = A.arrangementEvents('chord', sec(4, 0, 4, 0));
const voices = c.filter((e) => e.timbre === 'pad'), cTicks = c.filter((e) => e.timbre === 'tick');
ok('chord: a voice joins on each count of a four count inhale', voices.length === 4 && voices.map((v) => v.t).join() === '0,1000,2000,3000');
ok('chord: voices join from the root up', voices.every((v, i) => i === 0 || v.freq > voices[i - 1].freq) && voices[0].freq === A.CHORD_LADDER[0]);
const off = (v: { t: number; dur: number }) => v.t + (v.dur - 0.9) * 1000; // when a voice is let go
ok('chord: voices leave top first, one on each count of the exhale, and the root last', off(voices[3]) <= off(voices[2]) && off(voices[2]) <= off(voices[1]) && off(voices[1]) <= off(voices[0]) && off(voices[3]) >= 4000);
ok('chord: the root is let go at the end of the exhale and lingers through the rest of the breath', off(voices[0]) >= 8000);
ok('chord: a very soft tick for every count, so counts can still be counted', cTicks.length === 8 && cTicks.every((e) => e.gain <= 0.06));
ok('chord: with a long inhale the chord stops at six voices and the other counts are ticks', A.arrangementEvents('chord', sec(8, 0, 8, 0)).filter((e) => e.timbre === 'pad').length === 6);

// ---- the setting
ok('the style defaults to harp', dm.getBreathingSound() === 'harp');
dm.setBreathingSound('bowls');
ok('choosing one is shared in memory and is not written to the device unless remembering', dm.getBreathingSound() === 'bowls' && !('nenya.prefs' in store));
dm.setRemembering(true); dm.setBreathingSound('chord');
ok('with remembering on it is saved and loaded back', JSON.parse(store['nenya.prefs']).breathingSound === 'chord' && (dm.__resetBreathingTonesForTests(), dm.getBreathingSound() === 'chord'));
store['nenya.prefs'] = JSON.stringify({ breathingSound: 'organ' });
ok('a value that is not a style is ignored', dm.loadPrefs().breathingSound === undefined);
store['nenya.prefs'] = JSON.stringify({ breathingSound: 'scale' });
dm.wipeDevice({ keepOwner: true }); dm.__resetBreathingTonesForTests();
ok('"Forget me" erases it, back to harp', !('nenya.prefs' in store) && dm.getBreathingSound() === 'harp');

// ---- in the page
const sw = src('src/app/components/BreathTonesSwitch.tsx');
const eng = src('src/lib/breathTones.ts');
ok('the panel offers the style, labelled, with a plain description of the one chosen', /<BreathToneStyle \/>/.test(src('src/app/components/AccessibilitySettings.tsx')) && /htmlFor="tones-style"/.test(sw) && /id="tones-style-desc"/.test(sw));
ok('choosing a style plays a short taste of it and says so politely', /playPreview\(next\)/.test(sw) && /Tone style: /.test(sw));
ok('switching the tones on plays a taste of the chosen style', /playPreview\(getBreathingSound\(\)\)/.test(sw));
ok('the player is given the chosen style and picks up a change without restarting', /arrangement/.test(sw) && /sig = `\$\{arrangement\}/.test(eng));
ok('the drone starts only for a style that has one, and fades out when the tones stop', /wantsDrone/.test(eng) && /drone\?\.\(\)/.test(eng));
ok('sound is created only from a click, never at load', /ctx \?\?= new Ctor\(\)/.test(eng) && !/^new AudioContext/m.test(eng));
