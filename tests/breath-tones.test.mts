// Breathing tones: the notes for each rhythm, the shared clock, the setting (off by default, saved only when remembered,
// erased by Forget me), and that the switch is in three places.
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
const { breathEvents, eventsBetween, pitchFor, LOW_FREQ, HIGH_FREQ, GAIN_FIRM, GAIN_MOVING, GAIN_HOLD } = await import('../src/lib/breathTones.ts');
const { SCALE_LADDER } = await import('../src/lib/breathArrangements.ts');
const dm = await import('../src/lib/deviceMemory.ts');
const { PRESETS } = await import('../src/lib/breathingPresets.ts');
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const sec = (a: number, b = 0, c = 0, d = 0) => ({ ih: a * 1000, hi: b * 1000, ex: c * 1000, ho: d * 1000 });

// ---- the notes of one breath
const e55 = breathEvents(sec(5, 0, 5, 0));
ok('5-5: five rising notes then five falling notes, one a second', e55.length === 10 && e55.every((e, i) => e.t === i * 1000));
const up = e55.slice(0, 5).map((e) => e.freq), down = e55.slice(5).map((e) => e.freq);
ok('the inhale rises, from the bottom of the range to the top', up.every((f, i) => i === 0 || f > up[i - 1]) && up[0] === LOW_FREQ && up[4] === SCALE_LADDER[4]);
ok('the exhale falls, from the top of the range to the bottom', down.every((f, i) => i === 0 || f < down[i - 1]) && down[0] === SCALE_LADDER[4] && down[4] === LOW_FREQ);
ok('the first note of the breath is the firm one, the rest are not', e55[0].gain === GAIN_FIRM && e55.slice(1).every((e) => e.gain === GAIN_MOVING) && GAIN_FIRM > GAIN_MOVING);
const box = breathEvents(sec(4, 4, 4, 4));
ok('box breathing: four notes for each of four phases', box.length === 16 && ['inhale', 'hold-in', 'exhale', 'hold-out'].every((k) => box.filter((e) => e.kind === k).length === 4));
ok('hold after the inhale repeats the top note, quietly, once a count', box.filter((e) => e.kind === 'hold-in').every((e) => e.freq === SCALE_LADDER[3] && e.gain === GAIN_HOLD && GAIN_HOLD < GAIN_MOVING));
ok('hold after the exhale repeats the bottom note, quietly, once a count', box.filter((e) => e.kind === 'hold-out').every((e) => e.freq === LOW_FREQ && e.gain === GAIN_HOLD));
const r478 = breathEvents(sec(4, 7, 8, 0));
ok('4-7-8: seven quiet holds and no notes after the exhale (an empty hold-out)', r478.filter((e) => e.kind === 'hold-in').length === 7 && r478.filter((e) => e.kind === 'hold-out').length === 0 && r478.length === 4 + 7 + 8);
ok('a 4 count inhale and an 8 count exhale span the same range', (() => { const i = r478.filter((e) => e.kind === 'inhale'), x = r478.filter((e) => e.kind === 'exhale'); return i[0].freq === x[7].freq && i[3].freq === x[0].freq; })());
ok('a phase longer than the scale shares notes between neighbours but never leaves the range', (() => { const f = breathEvents(sec(12, 0, 12, 0)).map((e) => e.freq); return f.every((x) => x >= LOW_FREQ && x <= HIGH_FREQ) && f.slice(0, 12).every((x, i, a) => i === 0 || x >= a[i - 1]); })());
ok('a one-count phase sits at its end of the range', pitchFor(0, 1, 'up') === HIGH_FREQ && pitchFor(0, 1, 'down') === LOW_FREQ);
ok('every preset gives one note per whole second of the breath', PRESETS.every((p) => breathEvents(p).length === Math.round(p.ih / 1000) + Math.round((p.hi || 0) / 1000) + Math.round(p.ex / 1000) + Math.round((p.ho || 0) / 1000)));
ok('the notes come from the D major pentatonic, the key of the other styles', e55.every((e) => SCALE_LADDER.includes(e.freq)) && SCALE_LADDER.length === 6);
ok('an equal-phase breath climbs the scale a degree at a time: no skipped or repeated note, for 3, 4, 5 and 6 counts', [3, 4, 5, 6].every((n) => { const ev = breathEvents(sec(n, 0, n, 0)); const upN = ev.slice(0, n).map((e) => SCALE_LADDER.indexOf(e.freq)); const downN = ev.slice(n).map((e) => SCALE_LADDER.indexOf(e.freq)); return upN.every((d, i) => d === i) && downN.every((d, i) => d === n - 1 - i); }));
ok('both phases of a breath share the same top, so the exhale begins where the inhale ended', [[4, 6], [4, 8], [6, 6], [3, 3]].every(([a, b]) => { const ev = breathEvents(sec(a, 0, b, 0)); const i = ev.filter((e) => e.kind === 'inhale'), x = ev.filter((e) => e.kind === 'exhale'); return i[i.length - 1].freq === x[0].freq; }));
ok('no leap of more than three scale degrees inside a phase for the usual paces', PRESETS.every((p) => ['inhale', 'exhale'].every((k) => { const d = breathEvents(p).filter((e) => e.kind === k).map((e) => SCALE_LADDER.indexOf(e.freq)); return d.every((v, i) => i === 0 || Math.abs(v - d[i - 1]) <= 3); })));

// ---- on the shared clock
const t = sec(5, 0, 5, 0);
const start = 1_000_000;
const win = eventsBetween(t, start, start, start + 10000);
ok('a window of one breath returns that breath\'s ten notes at the clock times', win.length === 10 && win.every((e, i) => e.at === start + i * 1000));
ok('notes fall in the same places however the window is cut', JSON.stringify([...eventsBetween(t, start, start, start + 4500), ...eventsBetween(t, start, start + 4500, start + 10000)].map((e) => e.at)) === JSON.stringify(win.map((e) => e.at)));
ok('the next breath repeats the first', eventsBetween(t, start, start + 10000, start + 20000).length === 10 && eventsBetween(t, start, start + 10000, start + 10001)[0].gain === GAIN_FIRM);
ok('a window before the cycle began still lines up (the clock is shared, not restarted)', eventsBetween(t, start, start - 3000, start).map((e) => e.at).join() === [start - 3000, start - 2000, start - 1000].join());
ok('an empty or backwards window, or a zero length breath, gives no notes', eventsBetween(t, start, start, start).length === 0 && eventsBetween(t, start, start + 5, start).length === 0 && eventsBetween({ ih: 0, ex: 0 }, start, start, start + 5000).length === 0);

// ---- the setting
ok('tones are off by default', dm.getBreathingTones() === false);
ok('turning them on is kept in memory and shared', (dm.setBreathingTones(true), dm.getBreathingTones() === true));
ok('it is not saved to the device unless "Remember on this device" is on', !('nenya.prefs' in store));
dm.__resetBreathingTonesForTests(); dm.setBreathingTones(false);
dm.setRemembering(true); dm.setBreathingTones(true);
ok('with remembering on, it is saved and loaded back', JSON.parse(store['nenya.prefs']).breathingTones === true && (dm.__resetBreathingTonesForTests(), dm.getBreathingTones() === true) && dm.loadPrefs().breathingTones === true);
store['nenya.prefs'] = JSON.stringify({ breathingTones: 'yes' });
ok('a hand-edited value that is not true or false is ignored', dm.loadPrefs().breathingTones === undefined);
store['nenya.prefs'] = JSON.stringify({ breathingTones: true });
dm.wipeDevice({ keepOwner: true });
dm.__resetBreathingTonesForTests();
ok('"Forget me" erases it, so tones are off again', !('nenya.prefs' in store) && dm.getBreathingTones() === false);

// ---- the switch is in three places and shares one state
const sw = src('src/app/components/BreathTonesSwitch.tsx');
ok('the switch is a real switch with a name and an on/off state a screen reader reads', (sw.match(/role="switch"/g) ?? []).length >= 2 && /aria-checked=\{on\}/.test(sw) && /aria-label="Breathing tones"/.test(sw) && /id="tones-toggle"/.test(sw));
ok('near the top of the page, hidden until it has keyboard focus (the skip-link pattern)', /variant="skip"/.test(src('src/app/App.tsx')) && /sr-only focus:not-sr-only/.test(sw));
ok('in the accessibility panel', /<BreathTonesSwitch variant="panel"/.test(src('src/app/components/AccessibilitySettings.tsx')));
ok('on the breathing counter', /<BreathTonesSwitch variant="counter"/.test(src('src/app/components/BreathingCounter.tsx')));
ok('all three go through the one function that sets the shared setting', (sw.match(/setTones\(/g) ?? []).length >= 3 && !/useState/.test(sw));
ok('switching on unlocks audio, plays one sample note and says so politely; switching off says so', /unlockAudio\(\);\s*playPreview\(/.test(sw) && /Breathing tones on/.test(sw) && /Breathing tones off/.test(sw) && /aria-live="polite"/.test(sw));
ok('the announcement never moves focus', !/\.focus\(/.test(sw) && !/\.focus\(/.test(src('src/lib/breathTones.ts')));
ok('there is no sound at import time: audio is created only from a click (unlockAudio), never at load', !/new (webkit)?AudioContext\(\)?;?\s*$/m.test(src('src/lib/breathTones.ts').split('export function unlockAudio')[0]) && /ctx \?\?= new Ctor\(\)/.test(src('src/lib/breathTones.ts')));
ok('the tones play on every screen and on /coach once the terms are accepted, whenever the setting and the breathing are on (whether or not the counter shows), and stop when the tab is hidden',
  /<BreathTonesPlayer active=\{breathingEnabled\}/.test(src('src/app/components/PortableBreath.tsx')) && /if \(!ready\) return null/.test(src('src/app/components/PortableBreath.tsx'))
  && /<PortableBreath\s+ready=\{entryUnlocked\}/.test(src('src/app/App.tsx')) && !/currentScreen === 'welcome' && entryUnlocked && \(/.test(src('src/app/App.tsx'))
  && /<PortableBreath\s+ready=\{agreed\}/.test(src('src/coach/CoachPage.tsx')) && /<TonesAnnouncer \/>/.test(src('src/coach/CoachPage.tsx'))
  && /visibilitychange/.test(sw) && /if \(!on \|\| !active\) return/.test(sw));
ok('one pace for the whole page: the coach page\'s panel offers the paces, and the app hands the same clock on',
  /onTechniqueChange=\{setTechnique\}/.test(src('src/coach/CoachPage.tsx'))
  && /<PortableBreath[\s\S]{0,400}cycleStart=\{breathingCycleStart\}/.test(src('src/app/App.tsx')) && /<BreathingPopout[\s\S]{0,1200}cycleStart=\{breathingCycleStart\}/.test(src('src/app/App.tsx')));
ok('the counter\'s ticking number and word are hidden from screen readers', /<div aria-hidden="true">\s*<div\s+style=\{\{\s*fontSize: '11px'/.test(src('src/app/components/BreathingCounter.tsx')));
ok('notes are scheduled on the audio clock ahead of time, not with a timer per note', /c\.currentTime \+ Math\.max\(0, e\.at - now\) \/ 1000/.test(src('src/lib/breathTones.ts')));
ok('the setting is one of the remembered display settings, and is checked as a boolean', /breathingTones\?: boolean/.test(src('src/lib/deviceMemory.ts')) && /breathingTones: isBool/.test(src('src/lib/deviceMemory.ts')));
