import { isAllowedTechnique } from './breathCustom.ts';
import { DEFAULT_ARRANGEMENT } from './breathArrangements.ts';
import { DEFAULT_GEM_CHOICE, DEFAULT_HALO_STYLE, DEFAULT_HALO_WIDTH, DEFAULT_LOGO_LEAVES, DEFAULT_INNER_ORB_MODE, DEFAULT_PREVIEW_PCT, GEM_SIDE_PRESETS, INNER_ORB_MODES, snapInnerOrbMode, type InnerOrbMode, HALO_STYLES, HALO_WIDTHS, LEAF_PRESETS, snapGemChoice, snapHaloSeed, snapHaloStyle, snapHaloWidth, percentFromOldPixels, snapLeaves, snapPreviewPercent, type GemSidesChoice, type HaloStyle } from './logoLook.ts';
import { snapColourChoice } from './logoColours.ts';
import { clearKeptPalettes } from './keptPalettes.ts';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Everything Nenya may keep on a visitor's device lives behind this one file, so there is a single
// place to read, a single list in the policy, and one function that erases it all.
//
// What is kept, and when:
//   nenya.coach.rest   a timestamp, set automatically when a coach conversation ends (see CoachDemo).
//   nenya.remember     '1' only if the visitor turned on "Remember on this device".
//   nenya.prefs        display settings, written only while nenya.remember is on.
//   nenya.terms        the terms date the visitor agreed to, written only while nenya.remember is on.
//   nenya.terms.receipt  the site-signed terms receipt (src/lib/termsReceipt.ts): held for the VISIT in the tab's session storage (the browser clears it when the tab closes; Emergency Exit and Forget me clear it
//                      too), and written to this device only while nenya.remember is on. It holds the Terms' effective date, a time, a build and a signature: no address, no identifier.
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
    remove(TERMS_RECEIPT_KEY);
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
  /** The gem's kaleidoscope: the inside of the stone slowly re-cuts itself. Off unless the visitor switches it on. */
  gemKaleidoscope?: boolean;
  /** Which kaleidoscope look the visitor chose: calm, gentle (the default), lively or full. */
  gemKaleidoscopeLook?: string;
  /** Whether the kaleidoscope moves with the visitor's breathing (opens on the in-breath, settles on the out-breath). */
  gemKaleidoscopeBreath?: boolean;
  /** How many leaves the logo's ring has (a preset from src/lib/logoLook.ts). */
  logoLeaves?: number;
  /** How many sides the gem has: 'match' (follow the leaves) or a preset. */
  gemSides?: string | number;
  /** The outer orbs' glow: its style, its width (a preset multiple of the orb) and the seed of the random colours. */
  orbHalo?: string;
  orbHaloWidth?: number;
  orbHaloSeed?: number;
  /** The size of the animated preview in the breathing and accessibility panel, in pixels (a multiple of 20, 120 to 400). */
  previewSize?: number;
  /** The size of the preview as a percentage of the standard one (50 to 200, steps of 10). Replaces previewSize; an older previewSize is converted when this is not set. */
  previewPercent?: number;
  /** The inner ring of orbs behind the gem: 'moving' (the default), 'still' or 'hidden' (src/lib/logoLook.ts). */
  innerOrbs?: string;
  /** The leaves sway very slightly, as in a gentle breeze. Off unless the visitor switches it on; never on with reduced motion. */
  leafSway?: boolean;
  /** The colours of the breath ring and the gem's tint, and of the sixteen orbs: a choice from src/lib/logoColours.ts ('original' when none was made). Only the choice is kept, never the colours of a palette the visitor made. */
  breathColours?: string;
  orbColours?: string;
}

const VISION = ['', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'];
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

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
  gemKaleidoscope: isBool,
  gemKaleidoscopeLook: (v) => v === 'calm' || v === 'gentle' || v === 'lively' || v === 'full',
  gemKaleidoscopeBreath: isBool,
  breathingSound: (v) => v === 'harp' || v === 'bowls' || v === 'chord' || v === 'scale',
  colorBlindMode: (v) => typeof v === 'string' && VISION.includes(v),
  logoLeaves: (v) => typeof v === 'number' && (LEAF_PRESETS as readonly number[]).includes(v),
  gemSides: (v) => v === 'match' || (typeof v === 'number' && (GEM_SIDE_PRESETS as readonly number[]).includes(v)),
  orbHalo: (v) => (HALO_STYLES as readonly unknown[]).includes(v),
  orbHaloWidth: (v) => typeof v === 'number' && (HALO_WIDTHS as readonly number[]).includes(v),
  orbHaloSeed: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4294967295,
  previewSize: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 120 && v <= 400,
  previewPercent: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 50 && v <= 200,
  leafSway: isBool,
  innerOrbs: (v) => (INNER_ORB_MODES as readonly unknown[]).includes(v),
  breathColours: (v) => typeof v === 'string' && snapColourChoice(v) === v,
  orbColours: (v) => typeof v === 'string' && snapColourChoice(v) === v,
  breathingTechnique: (v) => {
    // A saved pace must be one the site would have allowed (src/lib/breathCustom.ts); earlier saves of the presets all pass.
    return isAllowedTechnique(v);
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

// The gem's kaleidoscope: one visitor setting (the switch is in the accessibility panel, the gem reads it), off until switched on, saved only while "Remember on this device" is on and erased by
// "Forget me" and Emergency Exit like every other saved setting. The stone holds still when the device asks for reduced motion, whatever this says.
let kaleidoOn: boolean | null = null;
const kaleidoListeners = new Set<() => void>();
const getKaleido = (): boolean => (kaleidoOn ??= loadPrefs().gemKaleidoscope === true);
export const getGemKaleidoscope = getKaleido;
export function setGemKaleidoscope(on: boolean): void {
  kaleidoOn = on;
  savePref('gemKaleidoscope', on);
  kaleidoListeners.forEach((l) => l());
}
const subscribeKaleido = (l: () => void) => {
  kaleidoListeners.add(l);
  return () => kaleidoListeners.delete(l);
};
export function useGemKaleidoscope(): boolean {
  const on = useSyncExternalStore(subscribeKaleido, getKaleido, () => false);
  const remembering = useRemembering();
  useEffect(() => {
    if (remembering) savePref('gemKaleidoscope', on);
  }, [remembering, on]);
  return on;
}

// The kaleidoscope's look and "move with my breathing" (owner, 2026-11-15): the same kind of shared setting as the switch above, saved only
// while "Remember on this device" is on.
export type KaleidoscopeLookChoice = 'calm' | 'gentle' | 'lively' | 'full';
function sharedPref<T>(key: 'gemKaleidoscopeLook' | 'gemKaleidoscopeBreath', read: () => T, fallback: T) {
  let value: T | null = null;
  const listeners = new Set<() => void>();
  const get = (): T => (value ??= read());
  const set = (v: T): void => {
    value = v;
    savePref(key, v as never);
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const use = (): T => {
    const v = useSyncExternalStore(subscribe, get, () => fallback);
    const remembering = useRemembering();
    useEffect(() => {
      if (remembering) savePref(key, v as never);
    }, [remembering, v]);
    return v;
  };
  return { get, set, use };
}
const kaleidoLook = sharedPref<KaleidoscopeLookChoice>('gemKaleidoscopeLook', () => (loadPrefs().gemKaleidoscopeLook as KaleidoscopeLookChoice | undefined) ?? 'gentle', 'gentle');
export const setGemKaleidoscopeLook = kaleidoLook.set;
export const useGemKaleidoscopeLook = kaleidoLook.use;
const kaleidoBreath = sharedPref<boolean>('gemKaleidoscopeBreath', () => loadPrefs().gemKaleidoscopeBreath === true, false);
export const setGemKaleidoscopeBreath = kaleidoBreath.set;
export const useGemKaleidoscopeBreath = kaleidoBreath.use;

// The style the tones are played in: the same kind of shared setting (the choice is made in the accessibility panel,
// the sound is played from the page).
export type BreathingSound = 'harp' | 'bowls' | 'chord' | 'scale';
let soundStyle: BreathingSound | null = null;
const soundListeners = new Set<() => void>();
const getSound = (): BreathingSound => (soundStyle ??= (loadPrefs().breathingSound as BreathingSound | undefined) ?? DEFAULT_ARRANGEMENT);
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
  const style = useSyncExternalStore(subscribeSound, getSound, () => DEFAULT_ARRANGEMENT as BreathingSound);
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

export const TERMS_RECEIPT_KEY = 'nenya.terms.receipt';
/** What is held about the agreement: the site-signed receipt when there is one, else just the date and the page's own time (an unsigned note, never put into anything signed). */
export interface TermsRecord {
  terms: string;
  at: string;
  receipt?: unknown;
}
const sessionRead = (k: string): string | null => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(k);
  } catch {
    return null;
  }
};
const parseRecord = (raw: string | null): TermsRecord | null => {
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as TermsRecord;
    return r && typeof r.terms === 'string' && typeof r.at === 'string' ? r : null;
  } catch {
    return null;
  }
};
/** The agreement held for this visit (session storage), or, if the visitor chose to be remembered, the one kept on this device. */
export const getTermsRecord = (): TermsRecord | null => parseRecord(sessionRead(TERMS_RECEIPT_KEY)) ?? (isRemembering() ? parseRecord(read(TERMS_RECEIPT_KEY)) : null);
/** Holds the agreement for the visit; also on this device only if the visitor turned on "Remember on this device". */
export function holdTermsRecord(rec: TermsRecord): void {
  const text = JSON.stringify(rec);
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(TERMS_RECEIPT_KEY, text);
  } catch {
    /* blocked: the agreement is simply asked again */
  }
  if (isRemembering()) {
    write(TERMS_RECEIPT_KEY, text);
    write(TERMS_KEY, rec.terms);
  }
}
/** Agreement for exactly this Terms version: held for the visit, or kept on the device by choice. Session storage does not outlive the tab. */
export const termsAcceptedFor = (version: string) => getTermsRecord()?.terms === version || (isRemembering() && read(TERMS_KEY) === version);
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
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(TERMS_RECEIPT_KEY);
    } catch {
      /* nothing reachable */
    }
  } catch {
    // Nothing reachable to erase.
  }
  clearKeptPalettes();
  emit();
}

// The logo's look (src/lib/logoLook.ts): how many leaves and how many sides the gem has. Two visitor settings with the same
// rules as the others: kept only while "Remember on this device" is on, erased by "Forget me" and Emergency Exit. A stored value
// that is not a preset is dropped by loadPrefs, and anything set in code snaps to the nearest preset.
let leavesNow: number | null = null;
let gemNow: GemSidesChoice | null = null;
const lookListeners = new Set<() => void>();
const getLeaves = (): number => (leavesNow ??= snapLeaves(loadPrefs().logoLeaves ?? DEFAULT_LOGO_LEAVES));
const getGemChoice = (): GemSidesChoice => (gemNow ??= snapGemChoice(loadPrefs().gemSides ?? DEFAULT_GEM_CHOICE));
export const getLogoLeaves = getLeaves;
export const getGemSidesChoice = getGemChoice;
export function setLogoLeaves(n: number): void {
  leavesNow = snapLeaves(n);
  savePref('logoLeaves', leavesNow);
  lookListeners.forEach((l) => l());
}
export function setGemSidesChoice(v: GemSidesChoice | number): void {
  gemNow = snapGemChoice(v);
  savePref('gemSides', gemNow);
  lookListeners.forEach((l) => l());
}
const subscribeLook = (l: () => void) => {
  lookListeners.add(l);
  return () => lookListeners.delete(l);
};
export const useLogoLeaves = (): number => useSyncExternalStore(subscribeLook, getLeaves, () => DEFAULT_LOGO_LEAVES);
export const useGemSidesChoice = (): GemSidesChoice => useSyncExternalStore(subscribeLook, getGemChoice, () => DEFAULT_GEM_CHOICE);

// The outer orbs' glow (style, width, and the seed of the random colours): the same rules as the look above.
let haloStyleNow: HaloStyle | null = null;
let haloWidthNow: number | null = null;
let haloSeedNow: number | null = null;
const getHaloStyle = (): HaloStyle => (haloStyleNow ??= snapHaloStyle(loadPrefs().orbHalo ?? DEFAULT_HALO_STYLE));
const getHaloWidth = (): number => (haloWidthNow ??= snapHaloWidth(loadPrefs().orbHaloWidth ?? DEFAULT_HALO_WIDTH));
const getHaloSeed = (): number => (haloSeedNow ??= snapHaloSeed(loadPrefs().orbHaloSeed ?? 1));
export const getOrbHaloStyle = getHaloStyle;
export const getOrbHaloWidth = getHaloWidth;
export function setOrbHaloStyle(v: HaloStyle | string): void {
  haloStyleNow = snapHaloStyle(v);
  savePref('orbHalo', haloStyleNow);
  lookListeners.forEach((l) => l());
}
export function setOrbHaloWidth(v: number): void {
  haloWidthNow = snapHaloWidth(v);
  savePref('orbHaloWidth', haloWidthNow);
  lookListeners.forEach((l) => l());
}
/** Deals a new set of random colours. */
export function shuffleOrbHalo(seed: number = Math.floor(Math.random() * 4294967296)): void {
  haloSeedNow = snapHaloSeed(seed);
  savePref('orbHaloSeed', haloSeedNow);
  lookListeners.forEach((l) => l());
}
export const useOrbHaloStyle = (): HaloStyle => useSyncExternalStore(subscribeLook, getHaloStyle, () => DEFAULT_HALO_STYLE);
export const useOrbHaloWidth = (): number => useSyncExternalStore(subscribeLook, getHaloWidth, () => DEFAULT_HALO_WIDTH);
export const useOrbHaloSeed = (): number => useSyncExternalStore(subscribeLook, getHaloSeed, () => 1);

// The size of the preview in the breathing panel, as a percentage (50 to 200). A size kept in pixels by an earlier version is converted; the choice is kept as it was
// set, and the panel holds it to what this device and screen can take without changing what is stored (src/lib/logoLook.ts, previewMaxPercent).
let previewNow: number | null = null;
const getPreviewPercent = (): number => {
  if (previewNow !== null) return previewNow;
  const p = loadPrefs();
  return (previewNow = p.previewPercent !== undefined ? snapPreviewPercent(p.previewPercent) : p.previewSize !== undefined ? percentFromOldPixels(p.previewSize) : DEFAULT_PREVIEW_PCT);
};
export const getBreathPreviewPercent = getPreviewPercent;
export function setBreathPreviewPercent(n: number): void {
  previewNow = snapPreviewPercent(n);
  savePref('previewPercent', previewNow);
  lookListeners.forEach((l) => l());
}
export const useBreathPreviewPercent = (): number => useSyncExternalStore(subscribeLook, getPreviewPercent, () => DEFAULT_PREVIEW_PCT);

// The leaves' sway and the colour choices (src/lib/logoColours.ts): the same rules as the look above. Sway is off, and the colours are the original, unless the visitor chose.
// The choice is all that is kept: a palette the visitor made is held in memory for the visit only (src/lib/keptPalettes.ts), so if it is gone next time the choice reads as the original.
let swayNow: boolean | null = null;
let breathColoursNow: string | null = null;
let orbColoursNow: string | null = null;
const getSway = (): boolean => (swayNow ??= loadPrefs().leafSway === true);
const getBreathColours = (): string => (breathColoursNow ??= snapColourChoice(loadPrefs().breathColours));
const getOrbColours = (): string => (orbColoursNow ??= snapColourChoice(loadPrefs().orbColours));
export const getLeafSway = getSway;
export const getBreathColourChoice = getBreathColours;
export const getOrbColourChoice = getOrbColours;
export function setLeafSway(on: boolean): void {
  swayNow = on === true;
  savePref('leafSway', swayNow);
  lookListeners.forEach((l) => l());
}
export function setBreathColourChoice(v: string): void {
  breathColoursNow = snapColourChoice(v);
  savePref('breathColours', breathColoursNow);
  lookListeners.forEach((l) => l());
}
export function setOrbColourChoice(v: string): void {
  orbColoursNow = snapColourChoice(v);
  savePref('orbColours', orbColoursNow);
  lookListeners.forEach((l) => l());
}
export const useLeafSway = (): boolean => useSyncExternalStore(subscribeLook, getSway, () => false);
export const useBreathColourChoice = (): string => useSyncExternalStore(subscribeLook, getBreathColours, () => 'original');
export const useOrbColourChoice = (): string => useSyncExternalStore(subscribeLook, getOrbColours, () => 'original');

// The inner orbs behind the gem: moving unless the visitor chose otherwise; the same rules as the look above.
let innerOrbsNow: InnerOrbMode | null = null;
const getInnerOrbs = (): InnerOrbMode => (innerOrbsNow ??= snapInnerOrbMode(loadPrefs().innerOrbs));
export const getInnerOrbMode = getInnerOrbs;
export function setInnerOrbMode(v: InnerOrbMode | string): void {
  innerOrbsNow = snapInnerOrbMode(v);
  savePref('innerOrbs', innerOrbsNow);
  lookListeners.forEach((l) => l());
}
export const useInnerOrbMode = (): InnerOrbMode => useSyncExternalStore(subscribeLook, getInnerOrbs, () => DEFAULT_INNER_ORB_MODE);
