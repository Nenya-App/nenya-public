// What this device can comfortably do, so Nenya can choose the lightest path that still works well
// (docs/ghost-footprint-stack.md). Read once, from signals the browser already offers; nothing is stored or sent.
//
//   lite      older or smaller phones, Save-Data, slow connections, or reduced motion: the gem held still at the low
//             setting, nothing optional downloaded early, and the coach (if used) on the server
//   standard  most phones and laptops: the live gem at the high setting, the coach on the server
//   capable   recent devices with plenty of memory and WebGPU: the same, plus the choice of on-device processing later
//
// The signals are hints, not measurements: deviceMemory and hardwareConcurrency are rounded (Chromium only), and a
// browser may leave any of them out. Missing signals count as "standard". The gem also times its own first frames
// (src/app/components/SpectralGem.tsx) and steps down if they are slow, which catches what these hints miss.

export type Tier = 'lite' | 'standard' | 'capable';

export interface DeviceSignals {
  /** GB, rounded down to a power of two (Chromium). */
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
  /** 'slow-2g' | '2g' | '3g' | '4g' (Chromium). */
  effectiveType?: string;
  reducedMotion?: boolean;
  webgl2?: boolean;
  webgpu?: boolean;
  /** CSS pixels of the shorter screen side. */
  screenShort?: number;
}

export interface DeviceProfile {
  tier: Tier;
  /** Why, in a few words each (for the bench and for testing). */
  reasons: string[];
  /** Which gem to draw and at what quality. */
  gem: { engine: 'live' | 'sprite'; quality: 'high' | 'low'; still: boolean };
  /** Whether optional large files (a model, extra images) may be fetched early. */
  prefetch: boolean;
  /** Where the coach should run when on-device processing exists: on the server unless the device is capable. */
  coachOnDevice: boolean;
}

export function profileFrom(s: DeviceSignals): DeviceProfile {
  const reasons: string[] = [];
  let lite = false;
  if (s.saveData) { lite = true; reasons.push('data saver is on'); }
  if (s.effectiveType && /(^|-)2g$|^3g$/.test(s.effectiveType)) { lite = true; reasons.push(`slow connection (${s.effectiveType})`); }
  if (s.deviceMemory !== undefined && s.deviceMemory <= 2) { lite = true; reasons.push(`${s.deviceMemory} GB of memory`); }
  if (s.hardwareConcurrency !== undefined && s.hardwareConcurrency <= 2) { lite = true; reasons.push(`${s.hardwareConcurrency} processor cores`); }
  if (s.reducedMotion) reasons.push('reduced motion');
  const capable = !lite && !!s.webgpu && (s.deviceMemory ?? 0) >= 8 && (s.hardwareConcurrency ?? 0) >= 8;
  if (capable) reasons.push('WebGPU, 8 GB or more, 8 cores or more');
  const tier: Tier = lite ? 'lite' : capable ? 'capable' : 'standard';
  if (!reasons.length) reasons.push('no reason to step down');
  return {
    tier,
    reasons,
    gem: { engine: s.webgl2 === false ? 'sprite' : 'live', quality: lite ? 'low' : 'high', still: !!s.reducedMotion },
    prefetch: tier !== 'lite',
    coachOnDevice: tier === 'capable',
  };
}

/** The signals this browser offers right now. */
export function readSignals(): DeviceSignals {
  if (typeof navigator === 'undefined') return {};
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string }; gpu?: unknown };
  let webgl2: boolean | undefined;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    webgl2 = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2 = undefined;
  }
  return {
    deviceMemory: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    hardwareConcurrency: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : undefined,
    saveData: nav.connection?.saveData === true,
    effectiveType: nav.connection?.effectiveType,
    reducedMotion: typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)').matches : undefined,
    webgl2,
    webgpu: 'gpu' in nav,
    screenShort: typeof screen !== 'undefined' ? Math.min(screen.width, screen.height) : undefined,
  };
}

let cached: DeviceProfile | null = null;
/** This device's profile (read once per page). */
export function deviceProfile(): DeviceProfile {
  return (cached ??= profileFrom(readSignals()));
}
