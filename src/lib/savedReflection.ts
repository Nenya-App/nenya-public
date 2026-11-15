// "Save and return later" (owner, 2026-11-15; docs/save-and-return-scope.md): the visitor's finished gateways, kept on THIS device only,
// encrypted under their session ID and a simple passcode, for at most 24 hours. Nothing here is ever sent anywhere.
//
// - The session ID is the visitor's two colors as hex codes ("#7a9b9e.#dac682", from Sight or Sound), or a random "shadow" pair.
// - The key comes from the ID and the passcode together (PBKDF2-SHA-256, many rounds, a random salt); the data is sealed with AES-GCM.
// - Neither the ID nor the passcode is stored. Stored: the salt, the nonce, the sealed data and the expiry time.
// - A wrong ID or passcode, an expired save and no save at all give the same answer (null), so nothing reveals that one exists.
// - One slot. Opening it removes it; saving again makes a new one. Forget me and Emergency Exit erase it (its key starts with "nenya").
// Behind VITE_SAVE_REFLECTION=on.

export const saveReflectionOn = (): boolean => import.meta.env?.VITE_SAVE_REFLECTION === 'on';

export const SAVED_KEY = 'nenya.reflection.saved';
export const SAVE_HOURS = 24;
const TTL_MS = SAVE_HOURS * 3600 * 1000;
const ROUNDS = 600_000;

export interface SavedPayload {
  v: 1;
  selectedGateways: string[];
  gatewayData: { gateway: string; data: unknown }[];
  bodyMapData: unknown;
  interfaceColors: { color1: string; color2: string };
}

interface SealedRecord {
  v: 1;
  salt: string;
  iv: string;
  ct: string;
  expiresAt: number;
}

const HEX = /^#?([0-9a-f]{6})$/i;

/** The session ID from two colors, or null if either is not a six-digit hex color. */
export function sessionIdFrom(c1: unknown, c2: unknown): string | null {
  const a = typeof c1 === 'string' ? HEX.exec(c1.trim()) : null;
  const b = typeof c2 === 'string' ? HEX.exec(c2.trim()) : null;
  return a && b ? `#${a[1].toLowerCase()}.#${b[1].toLowerCase()}` : null;
}

/** A random "shadow" ID: two random colors, for a visitor who has not done Sight or Sound yet. */
export function shadowId(rand: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const b = rand(6);
  const hex = (i: number) => Array.from(b.slice(i, i + 3), (x) => x.toString(16).padStart(2, '0')).join('');
  return `#${hex(0)}.#${hex(3)}`;
}

/** Accepts the ID as typed or pasted: with or without "#", separated by a dot, comma, space or slash, any case. Null if it is not two colors. */
export function normalizeId(raw: string): string | null {
  const parts = raw.trim().split(/[\s.,/|]+/).filter(Boolean);
  return parts.length === 2 ? sessionIdFrom(parts[0], parts[1]) : null;
}

const enc = new TextEncoder();
const b64 = (u: Uint8Array): string => btoa(String.fromCharCode(...u));
const unb64 = (s: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(s);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function keyFor(id: string, passcode: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', enc.encode(`${id}\n${passcode.normalize('NFC')}`), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ROUNDS }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

const store = {
  get: (): string | null => {
    try {
      return localStorage.getItem(SAVED_KEY);
    } catch {
      return null;
    }
  },
  set: (v: string): boolean => {
    try {
      localStorage.setItem(SAVED_KEY, v);
      return true;
    } catch {
      return false;
    }
  },
  remove: (): void => {
    try {
      localStorage.removeItem(SAVED_KEY);
    } catch {
      /* nothing to remove */
    }
  },
};

/** Removes the saved reflection if it has expired (or cannot be read). Call on every visit. */
export function purgeExpired(now = Date.now()): void {
  const raw = store.get();
  if (!raw) return;
  try {
    const r = JSON.parse(raw) as SealedRecord;
    if (!(typeof r.expiresAt === 'number' && r.expiresAt > now)) store.remove();
  } catch {
    store.remove();
  }
}

export const deleteSaved = (): void => store.remove();

export type SaveResult = 'saved' | 'invalid' | 'no-space';

/** Seals the reflection under the ID and passcode, replacing any earlier save. */
export async function saveReflection(payload: SavedPayload, id: string, passcode: string, now = Date.now()): Promise<SaveResult> {
  const canon = normalizeId(id);
  if (!canon || passcode.length === 0) return 'invalid';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFor(canon, passcode, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload))));
  const record: SealedRecord = { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct), expiresAt: now + TTL_MS };
  return store.set(JSON.stringify(record)) ? 'saved' : 'no-space';
}

/** Opens the saved reflection, or null (wrong ID or passcode, expired, or nothing saved: all the same). On success the saved copy is removed. */
export async function openReflection(id: string, passcode: string, now = Date.now()): Promise<SavedPayload | null> {
  purgeExpired(now);
  const raw = store.get();
  const canon = normalizeId(id);
  if (!raw || !canon || passcode.length === 0) return null;
  try {
    const r = JSON.parse(raw) as SealedRecord;
    const key = await keyFor(canon, passcode, unb64(r.salt));
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(r.iv) }, key, unb64(r.ct));
    const payload = JSON.parse(new TextDecoder().decode(plain)) as SavedPayload;
    if (payload?.v !== 1 || !Array.isArray(payload.selectedGateways) || !Array.isArray(payload.gatewayData)) return null;
    store.remove();
    return payload;
  } catch {
    return null;
  }
}
