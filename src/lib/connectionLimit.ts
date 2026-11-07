// The per-connection allowance for the coach demo: how many turns one connection may use in a day. A connection is
// stood for by a one-way code: an HMAC of the day and the address (for IPv6, its /64 network) under a secret that only
// the server holds. The code is different every day and cannot be turned back into an address without the secret.
// All that is stored under it is a count of turns, and records are deleted soon after their day ends.
import { createHmac } from 'node:crypto';
import { capDay, type CounterStore } from './dailyCap.ts';

/** 10 turns a day: two full conversations of five exchanges. */
export const DEFAULT_TURNS_PER_CONNECTION = 10;

export const turnsFromEnv = (raw: string | undefined): number => {
  const n = Number(raw);
  return raw && Number.isInteger(n) && n > 0 ? n : DEFAULT_TURNS_PER_CONNECTION;
};

const v4 = (s: string): string | null => {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  return parts.every((p) => p >= 0 && p <= 255) ? parts.join('.') : null;
};

/**
 * The part of an address that stands for one connection: an IPv4 address as it is, an IPv6 address cut to its /64
 * (one device can hold many addresses inside it), and an IPv4-mapped IPv6 address as the IPv4 it wraps.
 * Returns null for anything that is not an address.
 */
export function connectionKey(ip: string | null | undefined): string | null {
  if (!ip) return null;
  let s = ip.trim().toLowerCase().split('%')[0];
  if (!s.includes(':')) return v4(s);
  const mapped = /^(?:0{0,4}:){0,5}(?::|0{0,4}:)?ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s) ?? /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s);
  if (mapped) return v4(mapped[1]);
  // An IPv4 tail (for example 64:ff9b::1.2.3.4) becomes two hex groups.
  const tail = /^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/.exec(s);
  if (tail) {
    const q = v4(tail[2]);
    if (!q) return null;
    const [a, b, c, d] = q.split('.').map(Number);
    s = `${tail[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 ? (halves[1] ? halves[1].split(':') : []) : [];
  let groups: string[];
  if (halves.length === 2) {
    const fill = 8 - head.length - rest.length;
    if (fill < 1) return null;
    groups = [...head, ...Array(fill).fill('0'), ...rest];
  } else {
    groups = head;
  }
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.slice(0, 4).map((g) => g.padStart(4, '0')).join(':') + '::/64';
}

/** The one-way code for a connection on a day, or null when there is no usable address or no secret. */
export function connectionCode(secret: string | undefined, ip: string | null | undefined, now = new Date()): string | null {
  if (!secret) return null;
  const key = connectionKey(ip);
  if (!key) return null;
  return createHmac('sha256', secret).update(`${capDay(now)}|${key}`).digest('hex').slice(0, 32);
}

export const recordKey = (day: string, code: string): string => `c/${day}/${code}`;

/** Whether the connection has used up today's turns. A store that cannot be reached counts as not used up. */
export async function allowanceReached(store: CounterStore, code: string, limit: number, now = new Date()): Promise<boolean> {
  try {
    const cur = await store.getWithMetadata(recordKey(capDay(now), code), { type: 'text' });
    return (Number(cur?.data) || 0) >= limit;
  } catch {
    return false;
  }
}

const ATTEMPTS = 8;

/** Adds one turn to the connection's count for today. Never throws. */
export async function addConnectionTurn(store: CounterStore, code: string, now = new Date()): Promise<boolean> {
  const key = recordKey(capDay(now), code);
  try {
    for (let i = 0; i < ATTEMPTS; i++) {
      const cur = await store.getWithMetadata(key, { type: 'text' });
      const next = String((Number(cur?.data) || 0) + 1);
      const res = cur?.etag ? await store.set(key, next, { onlyIfMatch: cur.etag }) : await store.set(key, next, { onlyIfNew: true });
      if (res.modified) return true;
    }
  } catch {
    /* an uncounted turn is not fatal */
  }
  return false;
}

/** The slice of a Blobs store the cleanup needs. */
export interface ListableStore {
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
  delete(key: string): Promise<void>;
}

/**
 * Deletes every connection record from before today. Codes are different each day, so yesterday's are of no use, and
 * deleting them at the start of each new day keeps the promise that none outlives about a day and a half.
 * Returns how many were deleted.
 */
export async function cleanupConnectionRecords(store: ListableStore, now = new Date()): Promise<number> {
  const today = capDay(now);
  const { blobs } = await store.list({ prefix: 'c/' });
  let deleted = 0;
  for (const b of blobs) {
    const day = b.key.split('/')[1];
    if (day && day < today) {
      await store.delete(b.key);
      deleted++;
    }
  }
  return deleted;
}
