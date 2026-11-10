import { useEffect, useState, useSyncExternalStore } from 'react';

// Everything Nenya may keep on a visitor's device lives behind this one file, so there is a single
// place to read, a single list in the policy, and one function that erases it all.
//
// What is kept, and when:
//   nenya.coach.rest   a timestamp, set automatically when a coach conversation ends (see CoachDemo).
//   nenya.remember     '1' only if the visitor turned on "Remember on this device".
//   nenya.prefs        display settings, written only while nenya.remember is on.
//   nenya.terms        the terms date the visitor agreed to, written only while nenya.remember is on.
//   nenya.coach.pause  a timestamp: when the coach demo may open again after it ended a conversation (see src/lib/pause.ts). Removed by Forget me.
//   nenya.coach.owner  '1' in the owner's own browser, to skip the coach rest while testing.
//   nenya.coach.ownerToken  the owner's secret, to skip the per-connection limit while testing.
//   nenya.coach.overrides   the owner's testing switches (distress sentences on/off, instruction wording), sent only with the owner's token.
// Never kept: anything a visitor writes, draws, picks as a session color, or answers in a gateway.
// Nothing here is ever sent to a server, and there are no random identifiers.

export const REST_KEY = 'nenya.coach.rest';
/** When the coach demo may open again after a pause (ms since epoch), set by the pause (src/lib/pause.ts). Only a time; erased by Forget me and Emergency Exit. */
export const PAUSE_KEY = 'nenya.coach.pause';
export const OWNER_KEY = 'nenya.coach.owner';
/** The owner's secret token, kept in the owner's own browser only and sent to the coach as a header (see coach.mts). */
export const OWNER_TOKEN_KEY = 'nenya.coach.ownerToken';
/** The owner's testing switches for the coach, as JSON (see src/lib/ownerPanel.ts). Owner-only, like the two above. */
export const OVERRIDES_KEY = 'nenya.coach.overrides';
const REMEMBER_KEY = 'nenya.remember';
const PREFS_KEY = 'nenya.prefs';
const TERMS_KEY = 'nenya.terms';

const read = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    // Storage blocked: nothing is remembered.
  }
};
const remove = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {
    // Nothing to remove.
  }
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  window.addEventListener('storage', l);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', l);
  };
};

export const isRemembering = () => read(REMEMBER_KEY) === '1';

/** Turning it off also erases what it saved. */
export function setRemembering(on: boolean) {
  if (on) {
    write(REMEMBER_KEY, '1');
  } else {
    remove(REMEMBER_KEY);
    remove(PREFS_KEY);
    remove(TERMS_KEY);
  }
  emit();
}

export const useRemembering = () => useSyncExternalStore(subscribe, isRemembering, () => false);

export interface Prefs {
  theme?: 'dark' | 'light';
  textSize?: number;
  breathingEnabled?: boolean;
  orbitEnabled?: boolean;
  logoVisible?: boolean;
  breathingOpacity?: number;
  showBreathingCounter?: boolean;
  /** Breathing tones: a note for each count of the breath. Off unless the visitor switches it on. */
  breathingTones?: boolean;
  /** Which style the breathing tones are played in: harp, bowls, chord or scale. */
  breathingSound?: string;
  colorBlindMode?: string;
  breathingTechnique?: { ih: number; hi: number; ex: number; ho: number };
}

const VISION = ['', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'];
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const ms = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 60000;

// Anything that does not match is dropped, so a hand-edited or stale entry cannot break the page.
const VALID: { [K in keyof Prefs]-?: (v: unknown) => boolean } = {
  theme: (v) => v === 'dark' || v === 'light',
  textSize: (v) => v === 14 || v === 16 || v === 18,
  breathingEnabled: isBool,
  orbitEnabled: isBool,
  logoVisible: isBool,
  breathingOpacity: (v) => typeof v === 'number' && v >= 0.1 && v <= 1,
  showBreathingCounter: isBool,
  breathingTones: isBool,
  breathingSound: (v) => v === 'harp' || v === 'bowls' || v === 'chord' || v === 'scale',
  colorBlindMode: (v) => typeof v === 'string' && VISION.includes(v),
  breathingTechnique: (v) => {
    const t = v as Record<string, unknown> | null;
    return !!t && typeof t === 'object' && ms(t.ih) && ms(t.hi) && ms(t.ex) && ms(t.ho) && (t.ih as number) > 0 && (t.ex as number) > 0;
  },
};

export function loadPrefs(): Prefs {
  if (!isRemembering()) return {};
  try {
    const raw = JSON.parse(read(PREFS_KEY) ?? '{}');
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(VALID) as (keyof Prefs)[]) {
      if (raw && k in raw && VALID[k](raw[k])) out[k] = raw[k];
    }
    return out as Prefs;
  } catch {
    return {};
  }
}

function savePref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (!isRemembering()) return;
  write(PREFS_KEY, JSON.stringify({ ...loadPrefs(), [key]: value }));
}

/** Like useState, but the value is saved and restored while "Remember on this device" is on. */
export function usePref<K extends keyof Prefs>(key: K, fallback: NonNullable<Prefs[K]>) {
  const [value, setValue] = useState<NonNullable<Prefs[K]>>(() => (loadPrefs()[key] ?? fallback) as NonNullable<Prefs[K]>);
  const remembering = useRemembering();
  useEffect(() => {
    if (remembering) savePref(key, value);
  }, [remembering, key, value]);
  return [value, setValue] as const;
}

// Breathing tones are one setting shared by three switches (near the top of the page, in the accessibility panel and on
// the breathing counter), so it lives here rather than in one component's state. Off until switched on; saved only while
// "Remember on this device" is on, and erased by "Forget me" and Emergency Exit like every other saved setting.
let tonesOn: boolean | null = null;
const tonesListeners = new Set<() => void>();
const getTones = (): boolean => (tonesOn ??= loadPrefs().breathingTones === true);
export const getBreathingTones = getTones;
export function setBreathingTones(on: boolean): void {
  tonesOn = on;
  savePref('breathingTones', on);
  tonesListeners.forEach((l) => l());
}
const subscribeTones = (l: () => void) => {
  tonesListeners.add(l);
  return () => tonesListeners.delete(l);
};
export function useBreathingTones(): boolean {
  const on = useSyncExternalStore(subscribeTones, getTones, () => false);
  const remembering = useRemembering();
  useEffect(() => {
    if (remembering) savePref('breathingTones', on);
  }, [remembering, on]);
  return on;
}

// The style the tones are played in: the same kind of shared setting (the choice is made in the accessibility panel,
// the sound is played from the page).
export type BreathingSound = 'harp' | 'bowls' | 'chord' | 'scale';
let soundStyle: BreathingSound | null = null;
const soundListeners = new Set<() => void>();
const getSound = (): BreathingSound => (soundStyle ??= (loadPrefs().breathingSound as BreathingSound | undefined) ?? 'harp');
export const getBreathingSound = getSound;
export function setBreathingSound(s: BreathingSound): void {
  soundStyle = s;
  savePref('breathingSound', s);
  soundListeners.forEach((l) => l());
}
const subscribeSound = (l: () => void) => {
  soundListeners.add(l);
  return () => soundListeners.delete(l);
};
export function useBreathingSound(): BreathingSound {
  const style = useSyncExternalStore(subscribeSound, getSound, () => 'harp' as BreathingSound);
  const remembering = useRemembering();
  useEffect(() => {
    if (remembering) savePref('breathingSound', style);
  }, [remembering, style]);
  return style;
}

/** For tests: forget the in-memory values so the next read starts from storage again. */
export const __resetBreathingTonesForTests = (): void => {
  tonesOn = null;
  soundStyle = null;
};

/** Only if the visitor chose to be remembered, and only for the exact terms they agreed to. */
export const termsAcceptedFor = (version: string) => isRemembering() && read(TERMS_KEY) === version;
export const rememberTerms = (version: string) => {
  if (isRemembering()) write(TERMS_KEY, version);
};

/**
 * "Forget me": erase what this device saved, then go back to the start of the current page. Their agreement to the terms is part
 * of what was erased, so carrying on without it would be using the site outside the terms: the start of the page asks again.
 * (The page also shows its first screen with nothing left over: whatever was entered in this visit is not kept either.) The
 * address loses its #section and ?query, which could otherwise point at something behind the terms. `go` is replaceable for tests.
 */
export function forgetMeAndRestart(go: () => void = () => window.location.assign(window.location.pathname)) {
  wipeDevice({ keepOwner: true });
  go();
}

/**
 * Erases everything Nenya saved on this device, including older keys from earlier versions.
 * The owner's testing flag survives the visitor-facing "Forget me" button but not the emergency exit.
 */
export function wipeDevice({ keepOwner }: { keepOwner: boolean }) {
  try {
    const mine: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.toLowerCase().startsWith('nenya') && !(keepOwner && (k === OWNER_KEY || k === OWNER_TOKEN_KEY || k === OVERRIDES_KEY))) mine.push(k);
    }
    mine.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Nothing reachable to erase.
  }
  emit();
}
