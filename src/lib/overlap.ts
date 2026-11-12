// Spotting signed transcripts that share messages (docs/transcript-consent-scope.md, "Overlapping submissions").
// A conversation can be signed after any exchange, so the copy signed at turn 2 and the copy signed at turn 5 share their first
// messages but have different fingerprints. Each is its own submission with its own permissions: nothing here changes, merges
// or narrows anything. It only tells the owner that two submissions overlap, so they know when reading or reviewing.
//
// Two kinds of code are kept per message, each a keyed hash (HMAC under the server secret), so a code cannot be matched to a
// common phrase by anyone without the secret and cannot be turned back into words:
//  - chained: message i together with every message before it. Two submissions that share chained code i are the same conversation
//    up to message i (exact, no false matches).
//  - single: message i alone (the person's own messages only, and only if long enough to mean something). Catches the same text
//    appearing in different conversations, such as something pasted in.
// The index is one empty entry per code and submission (`overlap/<kind>/<code>/<hash>`), and a list of a submission's index keys
// (`overlap-keys/<hash>`) so all of them are deleted with it.
import { createHmac } from 'node:crypto';
import { normalizeForOverlap } from './nearDuplicates.ts';

import type { OverlapMsg } from './nearDuplicates.ts';
export type { OverlapMsg };
export interface OverlapCodes { chain: string[]; single: (string | null)[] }

/** What the owner is told about one other submission. Message numbers start at 1. */
export interface Overlap {
  hash: string;
  /** This submission and the other are the same conversation up to and including this message. */
  sameUpTo?: number;
  /** Messages here (numbers in this submission) whose exact words also appear in the other submission, outside any shared start. */
  sameMessages?: number[];
}

/** The shortest of the person's messages that is compared on its own (shorter ones, like "yes", say too little). */
export const MIN_SINGLE_CHARS = 24;

export { normalizeForOverlap };

export function overlapCodes(messages: OverlapMsg[], secret: string): OverlapCodes {
  const mac = (x: string) => createHmac('sha256', secret).update(x).digest('hex');
  const chain: string[] = [];
  const single: (string | null)[] = [];
  let prev = '';
  for (const m of messages) {
    const norm = normalizeForOverlap(m.content);
    prev = mac(`overlap-chain|${prev}|${m.role}|${norm}`);
    chain.push(prev);
    single.push(m.role === 'user' && norm.length >= MIN_SINGLE_CHARS ? mac(`overlap-single|${norm}`) : null);
  }
  return { chain, single };
}

interface IndexStore {
  get(key: string, opts: { type: 'json' }): Promise<unknown>;
  setJSON(key: string, value: unknown): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
}

const chainKey = (code: string, hash: string) => `overlap/c/${code}/${hash}`;
const singleKey = (code: string, hash: string) => `overlap/s/${code}/${hash}`;
export const overlapKeysKey = (hash: string): string => `overlap-keys/${hash}`;

const others = async (s: IndexStore, prefix: string, self: string): Promise<string[]> =>
  (await s.list({ prefix })).blobs.map((b) => b.key.slice(prefix.length)).filter((h) => h && h !== self);

/** The other submissions that share messages with this one. Read-only. */
export async function findOverlaps(s: IndexStore, hash: string, codes: OverlapCodes): Promise<Overlap[]> {
  const found = new Map<string, Overlap>();
  const at = (h: string) => found.get(h) ?? (found.set(h, { hash: h }), found.get(h)!);
  // Longest shared start first: a match at message i implies a match at every message before it.
  for (let i = codes.chain.length - 1; i >= 0; i--) {
    for (const h of await others(s, `overlap/c/${codes.chain[i]}/`, hash)) if (!at(h).sameUpTo) at(h).sameUpTo = i + 1;
  }
  for (let i = 0; i < codes.single.length; i++) {
    const c = codes.single[i];
    if (!c) continue;
    for (const h of await others(s, `overlap/s/${c}/`, hash)) {
      const o = at(h);
      if ((o.sameUpTo ?? 0) > i) continue; // already part of the shared start
      o.sameMessages = [...(o.sameMessages ?? []), i + 1];
    }
  }
  return [...found.values()].sort((a, b) => (b.sameUpTo ?? 0) - (a.sameUpTo ?? 0) || a.hash.localeCompare(b.hash));
}

/** Adds this submission's codes to the index (and the list of them, so they are deleted with it). */
export async function indexOverlap(s: IndexStore, hash: string, codes: OverlapCodes): Promise<void> {
  const keys = [...codes.chain.map((c) => chainKey(c, hash)), ...codes.single.flatMap((c) => (c ? [singleKey(c, hash)] : []))];
  await s.setJSON(overlapKeysKey(hash), keys);
  for (const k of keys) await s.setJSON(k, 1);
}

/** Deletes every index entry of this submission. Throws if the store cannot be reached, so the caller can try again. */
export async function removeOverlap(s: IndexStore, hash: string): Promise<void> {
  const keys = (await s.get(overlapKeysKey(hash), { type: 'json' })) as string[] | null;
  for (const k of Array.isArray(keys) ? keys : []) if (typeof k === 'string' && k.endsWith(`/${hash}`)) await s.delete(k);
  await s.delete(overlapKeysKey(hash));
}

/** Plain words for the owner. */
export function describeOverlap(o: Overlap): string {
  const parts: string[] = [];
  if (o.sameUpTo) parts.push(`the same conversation up to message ${o.sameUpTo}`);
  if (o.sameMessages?.length) parts.push(`the same words in message${o.sameMessages.length === 1 ? '' : 's'} ${o.sameMessages.join(', ')}`);
  return `${o.hash.slice(0, 12)}: ${parts.join('; ')}`;
}
