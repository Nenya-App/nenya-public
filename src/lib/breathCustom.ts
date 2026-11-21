// A breathing pace of the person's own (owner, 2026-11-18): four numbers in whole seconds (the counter counts whole seconds), inside limits that keep the pace safe and the counter honest,
// applied only when the person presses Apply, and kept with the other display settings on the device only when "Remember on this device" is on (src/lib/deviceMemory.ts). Pure, so it is tested.
import type { BreathingTechnique } from './breathingPresets.ts';

/** Limits in seconds. Inhale and exhale never shorter than 2 s; no phase longer than 16 s; a whole breath between 4 and 40 s. */
export const BREATH_LIMITS = {
  ih: { min: 2, max: 12, label: 'Breathe in' },
  hi: { min: 0, max: 12, label: 'Hold after breathing in' },
  ex: { min: 2, max: 16, label: 'Breathe out' },
  ho: { min: 0, max: 12, label: 'Hold after breathing out' },
  cycle: { min: 4, max: 40 },
} as const;
export type PhaseKey = 'ih' | 'hi' | 'ex' | 'ho';
export const PHASE_KEYS: PhaseKey[] = ['ih', 'hi', 'ex', 'ho'];
export type CustomSeconds = Record<PhaseKey, number>;

export const secondsOf = (t: BreathingTechnique): CustomSeconds => ({ ih: t.ih / 1000, hi: (t.hi || 0) / 1000, ex: t.ex / 1000, ho: (t.ho || 0) / 1000 });

export interface CustomCheck { ok: boolean; technique: BreathingTechnique | null; problems: string[]; cycleS: number; perMinute: number }
/** Checks four numbers of seconds. `problems` are plain sentences, one per thing to fix; the pace is only returned when there are none. */
export function validateCustom(s: Partial<Record<PhaseKey, unknown>>): CustomCheck {
  const problems: string[] = [];
  const v = {} as CustomSeconds;
  for (const k of PHASE_KEYS) {
    const raw = s[k], n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    const { min, max, label } = BREATH_LIMITS[k];
    if (!Number.isFinite(n)) { problems.push(`${label}: type a whole number of seconds.`); v[k] = 0; continue; }
    if (!Number.isInteger(n)) problems.push(`${label}: use whole seconds.`);
    else if (n < min || n > max) problems.push(`${label}: between ${min} and ${max} seconds.`);
    v[k] = n;
  }
  const cycleS = PHASE_KEYS.reduce((a, k) => a + (Number.isFinite(v[k]) ? v[k] : 0), 0);
  if (problems.length === 0 && (cycleS < BREATH_LIMITS.cycle.min || cycleS > BREATH_LIMITS.cycle.max)) problems.push(`One whole breath: between ${BREATH_LIMITS.cycle.min} and ${BREATH_LIMITS.cycle.max} seconds (this one is ${cycleS}).`);
  const ok = problems.length === 0;
  return { ok, technique: ok ? { ih: v.ih * 1000, hi: v.hi * 1000, ex: v.ex * 1000, ho: v.ho * 1000 } : null, problems, cycleS, perMinute: cycleS > 0 ? Math.round((60 / cycleS) * 10) / 10 : 0 };
}

/** Whether a saved pace is one this site would have allowed (used when reading what the device kept, so a damaged or edited value never reaches the ring). */
export function isAllowedTechnique(t: unknown): t is BreathingTechnique {
  const o = t as Record<string, unknown> | null;
  if (!o || typeof o !== 'object') return false;
  const ms = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x % 1000 === 0;
  if (!ms(o.ih) || !ms(o.hi) || !ms(o.ex) || !ms(o.ho)) return false;
  return validateCustom({ ih: (o.ih as number) / 1000, hi: (o.hi as number) / 1000, ex: (o.ex as number) / 1000, ho: (o.ho as number) / 1000 }).ok;
}

/** A short name for a pace: "6·0·8·0" style, in seconds. */
export const paceLabel = (t: BreathingTechnique): string => `${t.ih / 1000}·${(t.hi || 0) / 1000}·${t.ex / 1000}·${(t.ho || 0) / 1000}`;
