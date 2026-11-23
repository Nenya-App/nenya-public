// The hum (a tone style): the swell is a pure function of the active rhythm and matches the owner's video for 6 s in, 6 s out;
// the controls are off by default, nothing starts without a user action, volume and mute exist, wording has no benefit words.
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
const H = await import('../src/lib/breathHum.ts');
const A = await import('../src/lib/breathArrangements.ts');
const dm = await import('../src/lib/deviceMemory.ts');
const { PRESETS } = await import('../src/lib/breathingPresets.ts');
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const sec = (a: number, b = 0, c = 0, d = 0) => ({ ih: a * 1000, hi: b * 1000, ex: c * 1000, ho: d * 1000 });

// ---- the envelope
const six = sec(6, 0, 6, 0);
const owner = (t: number) => 0.10 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 12)); // the video's swell, t in seconds
let worst = 0;
for (let ms = 0; ms <= 12000; ms += 10) worst = Math.max(worst, Math.abs(H.humGain(ms, six) - owner(ms / 1000)));
ok('for 6 s in and 6 s out the gain is the owner\'s cosine swell, 0.10 * (0.5 - 0.5 cos(2 pi t / 12))', worst < 1e-12, `worst ${worst}`);
ok('the two tones are the owner\'s: 174 Hz and 261 Hz at 0.6', H.HUM_LOW_HZ === 174 && H.HUM_HIGH_HZ === 261 && H.HUM_HIGH_LEVEL === 0.6 && H.HUM_PEAK === 0.1);
const rhythms = [...PRESETS, sec(12, 0, 12, 0), sec(1, 0, 1, 0), sec(2, 0, 9, 0), sec(0.1, 0, 0.1, 0), sec(5, 0, 5, 3)];
let shape = '';
for (const r of rhythms) {
  const cycle = r.ih + (r.hi || 0) + r.ex + (r.ho || 0);
  if (H.humGain(0, r) !== 0) shape = `not zero at the start for ${cycle}`;
  if (H.humGain(cycle, r) !== 0 || H.humGain(cycle + 500, r) !== 0 || H.humGain(-5, r) !== 0) shape = `not zero at the end for ${cycle}`;
  const c = H.humCurve(r);
  if (c[0].gain !== 0 || c[c.length - 1].gain !== 0 || Math.abs(c[c.length - 1].at - cycle / 1000) > 1e-9) shape = `curve ends for ${cycle}`;
  let maxStep = 0;
  for (let i = 0; i < c.length; i++) {
    if (!(c[i].gain >= 0 && c[i].gain <= H.HUM_PEAK + 1e-12)) shape = `outside 0..peak for ${cycle}`;
    if (i > 0) { if (!(c[i].at > c[i - 1].at)) shape = `not in time order for ${cycle}`; maxStep = Math.max(maxStep, Math.abs(c[i].gain - c[i - 1].gain)); }
  }
  if (maxStep > H.HUM_PEAK * 0.14) shape = `a step of ${maxStep} (a jump) for ${cycle}`;
}
ok('every rhythm: zero at both ends, never above the 0.10 peak, in time order, and no jump between points (smooth)', shape === '', shape);
ok('the swell rises over the inhale and falls over the exhale, in step with the rhythm', (() => { const r = sec(4, 0, 8, 0); const up = [0, 1000, 2000, 3000, 4000].map((t) => H.humEnvelope(t, r)); const dn = [4000, 6000, 8000, 10000, 12000].map((t) => H.humEnvelope(t, r)); return up.every((v, i) => i === 0 || v > up[i - 1]) && dn.every((v, i) => i === 0 || v < dn[i - 1]) && Math.abs(H.humEnvelope(4000, r) - 1) < 1e-12 && Math.abs(H.humEnvelope(2000, r) - 0.5) < 1e-12; })());
ok('a hold after the inhale stays at the peak; a hold after the exhale stays at zero (box breathing)', (() => { const b = sec(4, 4, 4, 4); return [4000, 5000, 7000, 8000].every((t) => Math.abs(H.humEnvelope(t, b) - 1) < 1e-12) && [12000, 13500, 15000].every((t) => H.humEnvelope(t, b) === 0); })());
ok('it follows the active rhythm, not a fixed 12 s: the same moment gives different gain for different rhythms', H.humGain(3000, sec(6, 0, 6, 0)) !== H.humGain(3000, sec(3, 0, 3, 0)) && H.humEnvelope(3000, sec(3, 0, 3, 0)) === 1);
ok('a breath of zero length has no swell and no curve', H.humGain(100, { ih: 0, ex: 0 }) === 0 && H.humCurve({ ih: 0, ex: 0 }).length === 0);

// ---- volume and mute (pure part)
ok('the volume acts on the master level: 100 is the designed level, 0 is silent, in between it is gentler than linear', H.toneLevel(100, false) === H.MASTER_LEVEL && H.toneLevel(0, false) === 0 && H.toneLevel(50, false) < H.MASTER_LEVEL / 2 && H.toneLevel(50, false) > 0);
ok('mute is silent whatever the volume, and a stray value is clamped', H.toneLevel(100, true) === 0 && H.clampVolume(250) === 100 && H.clampVolume(-4) === 0 && H.clampVolume('x') === 100);

// ---- as a tone style
const ev = A.arrangementEvents('hum', six);
ok('the hum is a tone style: one sound a breath, as long as the breath, with no notes and no ticks', A.isArrangement('hum') && ev.length === 1 && ev[0].timbre === 'hum' && ev[0].t === 0 && ev[0].dur === 12 && ev[0].gain === H.HUM_PEAK && ev[0].freq === 174);
ok('its event carries the active rhythm, so the swell follows it', JSON.stringify(A.arrangementEvents('hum', sec(4, 7, 8, 0))[0].shape) === JSON.stringify(sec(4, 7, 8, 0)) && A.arrangementEvents('hum', sec(4, 7, 8, 0))[0].dur === 19);
ok('it is not the default style, and has no drone', A.DEFAULT_ARRANGEMENT !== 'hum' && A.ARRANGEMENTS.find((a) => a.id === 'hum')?.drone === false);

// ---- the settings
ok('tones are off by default and the volume starts at 100', dm.getBreathingTones() === false && dm.getBreathingToneVolume() === 100);
ok('the volume is not written to the device unless "Remember on this device" is on', (dm.setBreathingToneVolume(40), dm.getBreathingToneVolume() === 40 && !('nenya.prefs' in store)));
dm.setRemembering(true); dm.setBreathingToneVolume(35);
ok('with remembering on, it is saved and loaded back', JSON.parse(store['nenya.prefs']).breathingToneVolume === 35 && (dm.__resetBreathingTonesForTests(), dm.getBreathingToneVolume() === 35));
store['nenya.prefs'] = JSON.stringify({ breathingToneVolume: 400, breathingSound: 'hum' });
ok('a stored volume outside 0 to 100 is ignored, and the hum is a valid stored style', dm.loadPrefs().breathingToneVolume === undefined && dm.loadPrefs().breathingSound === 'hum');
store['nenya.prefs'] = JSON.stringify({ breathingToneVolume: 20 });
dm.wipeDevice({ keepOwner: true }); dm.__resetBreathingTonesForTests();
ok('"Forget me" erases it, back to 100', !('nenya.prefs' in store) && dm.getBreathingToneVolume() === 100);
ok('the mute is never saved', !/\bmut(e|ed)\b/i.test(src('src/lib/deviceMemory.ts').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')));

// ---- in the page
const sw = src('src/app/components/BreathTonesSwitch.tsx');
const eng = src('src/lib/breathTones.ts');
const panel = src('src/app/components/AccessibilitySettings.tsx');
ok('the tones\' own switch sits right after Stop motion in the panel, as a labelled toggle button with aria-pressed', /motionMessageText\}<\/p>\s*<\/div>\s*\{\/\*[^*]*\*\/\}\s*<BreathTonesQuickControls \/>/.test(panel) && /aria-pressed=\{on\}/.test(sw) && /tonesButtonText\(on\)/.test(sw));
ok('mute is one press, a pressed button, and says so politely; the volume is a labelled range with its value spoken', /aria-pressed=\{muted\}/.test(sw) && /muteAnnouncement\(!muted\)/.test(sw) && /type="range"/.test(sw) && /htmlFor="tones-volume"/.test(sw) && /aria-valuetext/.test(sw));
ok('the volume and the mute act on the master gain of the audio, with a ramp (no click)', /bus\.master\.gain\.setTargetAtTime\(toneLevel\(/.test(eng) && /master\.gain\.value = toneLevel\(/.test(eng));
ok('the comment says why Stop motion does not silence the tones, and the help text says so', /sound is not motion/.test(sw) && /Stop motion does not change it/.test(H.TONES_BUTTON_HELP));
ok('nothing starts without a user action: audio is created only inside unlockAudio, the hum is scheduled only by the player (which runs only when the setting is on) and the preview', /ctx \?\?= new Ctor\(\)/.test(eng) && (eng.match(/new Ctor\(\)/g) ?? []).length === 1 && /if \(!on \|\| !active\) return/.test(sw) && !/autoplay/i.test(eng + sw) && /unlockAudio\(\);\s*playPreview\(/.test(sw));
ok('it stops when the page is hidden or left, and when the breathing or the setting stops', /visibilitychange/.test(sw) && /'pagehide', end/.test(sw) && /return \(\) => \{\s*document\.removeEventListener/.test(sw));
ok('no files, no network and no libraries for the sound: only the Web Audio API', !/fetch\(|XMLHttpRequest|new Audio\(|\.mp3|\.wav|\.ogg|import .* from '(tone|howler)/.test(eng + src('src/lib/breathHum.ts') + sw));
ok('no new motion: the hum changes no CSS, and there is no animation in the new controls', !/animation|@keyframes|transition/.test(src('src/lib/breathHum.ts')) && !/animate-|animation/.test(sw));

// ---- wording
const BANNED = /\b(calm|calming|relax|relaxing|relaxation|heal|healing|soothe|soothing|peace|peaceful|therapeutic|treat|treatment|cure|reduce|reduces|anxiety|stress|better|improve|improves|benefit|benefits|sleep|sound)\b/i;
const bad = H.HUM_WORDING.filter((w) => BANNED.test(w));
ok('no label or help text of the hum, its switch, mute or volume uses a benefit word or "Sound"', bad.length === 0, bad.join(' | '));
ok('the switch says "Breathing tones" and its state; the style is called "Hum"', H.tonesButtonText(false) === 'Breathing tones: off' && H.tonesButtonText(true) === 'Breathing tones: on' && H.HUM_LABEL === 'Hum' && /follows your breathing/.test(H.HUM_DESCRIPTION));
