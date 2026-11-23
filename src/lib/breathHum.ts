// The hum: a soft, steady tone that swells in with the inhale and fades with the exhale, one of the tone styles
// (breathArrangements.ts). Pure (no audio is made here); breathTones.ts plays it. Wording lives here so a test can check it.
//
// The shape follows the owner's video (2026-11-23), whose ffmpeg expression for a 12 second breath was
//   0.10 * (0.5 - 0.5*cos(2*PI*t/12)) * (sin(2*PI*174*t) + 0.6*sin(2*PI*261*t))
// so for a 6 s in, 6 s out rhythm the swell is exactly that raised cosine, and two sine tones (174 Hz and 261 Hz at 0.6)
// sit under it. With another rhythm the same half-cosine rises over the inhale, stays at its peak through a hold after the
// inhale, falls over the exhale and rests at zero through a hold after the exhale. It is zero at both ends of the breath,
// so one breath joins the next without a click. See docs/accessibility-audio-scope.md, "The hum".
import type { BreathTiming } from './breathClock.ts';

/** The two sine tones of the hum, in Hz, and the level of the second against the first (as in the owner's video). */
export const HUM_LOW_HZ = 174;
export const HUM_HIGH_HZ = 261;
export const HUM_HIGH_LEVEL = 0.6;
/** The most the hum ever reaches, as a share of full scale, before the person's own volume (the 0.10 of the video). */
export const HUM_PEAK = 0.1;
/** A rise or a fall is never quicker than this, so a very short phase still fades rather than clicks (milliseconds). */
export const HUM_MIN_RAMP_MS = 400;
/** How often the gain is given a new point when the swell is scheduled (milliseconds): small enough that the line of straight pieces follows the curve closely. */
export const HUM_STEP_MS = 40;

/** The lengths (ms) of the rise and the fall, never shorter than the minimum, and never so long that the fall would end after the breath does. */
export function humRamps(t: BreathTiming): { rise: number; fall: number; hold: number; cycle: number } {
  const hold = t.hi || 0;
  const cycle = t.ih + hold + t.ex + (t.ho || 0);
  let rise = Math.max(t.ih, HUM_MIN_RAMP_MS);
  let fall = Math.max(t.ex, HUM_MIN_RAMP_MS);
  const room = cycle - hold;
  if (rise + fall > room && room > 0) {
    const k = room / (rise + fall);
    rise *= k;
    fall *= k;
  }
  return { rise, fall, hold, cycle };
}

/** The swell at `tMs` from the start of a breath, 0 to 1 (1 is the peak). 0 at the start and the end, smooth between, never above 1. */
export function humEnvelope(tMs: number, t: BreathTiming): number {
  const { rise, fall, hold, cycle } = humRamps(t);
  if (!(cycle > 0) || !(tMs > 0) || tMs >= cycle) return 0;
  if (tMs < rise) return 0.5 - 0.5 * Math.cos((Math.PI * tMs) / rise);
  if (tMs <= rise + hold) return 1;
  const f = tMs - rise - hold;
  if (f < fall) return 0.5 + 0.5 * Math.cos((Math.PI * f) / fall);
  return 0;
}

/** The gain of the hum at `tMs`: the peak times the swell. */
export const humGain = (tMs: number, t: BreathTiming, peak: number = HUM_PEAK): number => peak * humEnvelope(tMs, t);

/** The points (seconds from the start, gain) the player joins with straight lines to draw one breath's swell: from 0 to 0. */
export function humCurve(t: BreathTiming, peak: number = HUM_PEAK, stepMs: number = HUM_STEP_MS): { at: number; gain: number }[] {
  const { cycle } = humRamps(t);
  if (!(cycle > 0)) return [];
  const out: { at: number; gain: number }[] = [];
  const n = Math.max(24, Math.ceil(cycle / stepMs)); // at least 24 pieces, so even a very short breath stays smooth
  for (let i = 0; i <= n; i++) {
    const ms = (i / n) * cycle;
    out.push({ at: ms / 1000, gain: i === n ? 0 : humGain(ms, t, peak) });
  }
  return out;
}

/** What the person's volume (0 to 100) and the mute do to the master level: a gentle curve (the square), so the low end of the slider is fine-grained. 100 is the level every style was designed at. */
export const MASTER_LEVEL = 0.9;
export const clampVolume = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : 100);
export const DEFAULT_TONE_VOLUME = 100;
export function toneLevel(volume: number, muted: boolean): number {
  if (muted) return 0;
  const v = clampVolume(volume) / 100;
  return MASTER_LEVEL * v * v;
}

// ---- wording (plain; no promise of benefit; the Sound Lens keeps the word "Sound")
export const HUM_LABEL = 'Hum';
export const HUM_DESCRIPTION =
  'A soft tone that follows your breathing: it swells in as you breathe in and fades as you breathe out, with no separate notes or ticks.';
export const TONES_BUTTON_LABEL = 'Breathing tones';
export const tonesButtonText = (on: boolean): string => `Breathing tones: ${on ? 'on' : 'off'}`;
export const TONES_BUTTON_HELP = 'Optional. Off until you turn it on. It has its own volume and mute, and Stop motion does not change it.';
export const VOLUME_LABEL = 'Tone volume';
export const volumeText = (v: number): string => `${clampVolume(v)}%`;
export const muteButtonText = (muted: boolean): string => (muted ? 'Unmute tones' : 'Mute tones');
export const muteAnnouncement = (muted: boolean): string => (muted ? 'Breathing tones muted' : 'Breathing tones unmuted');
export const VOLUME_HELP = 'Sets the tones against your device’s own volume. Mute keeps your place in the breath; the switch turns the tones off.';
/** Every visible phrase this feature adds, so a test can check them all. */
export const HUM_WORDING: string[] = [
  HUM_LABEL,
  HUM_DESCRIPTION,
  TONES_BUTTON_LABEL,
  tonesButtonText(true),
  tonesButtonText(false),
  TONES_BUTTON_HELP,
  VOLUME_LABEL,
  volumeText(40),
  muteButtonText(true),
  muteButtonText(false),
  muteAnnouncement(true),
  muteAnnouncement(false),
  VOLUME_HELP,
];
