// A short daily log of receipt hashes, kept 30 days, so a transcript we are shown can be recognized as one we issued
// and duplicate reports can be spotted. A receipt hash is a fingerprint of a transcript: it cannot be turned back into
// the conversation. Nothing else is stored with it.
import { capDay, type CounterStore } from './dailyCap.ts';

export const RECEIPT_KEEP_DAYS = 30;

export const receiptKey = (day: string, hash: string): string => `r/${day}/${hash}`;
const HASH = /^[0-9a-f]{64}$/;

/** Records a receipt hash for today. Returns 'new', 'duplicate' (already recorded today) or 'failed'. Never throws. */
export async function recordReceipt(store: CounterStore, hash: string, now = new Date()): Promise<'new' | 'duplicate' | 'failed'> {
  if (!HASH.test(hash)) return 'failed';
  try {
    const res = await store.set(receiptKey(capDay(now), hash), '1', { onlyIfNew: true });
    return res.modified ? 'new' : 'duplicate';
  } catch {
    return 'failed';
  }
}

export interface ReceiptListStore {
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
  delete(key: string): Promise<void>;
}

/** The day a receipt hash was recorded (within the 30 days kept), or null if it is not in the log. */
export async function receiptRecordedOn(store: ReceiptListStore, hash: string): Promise<string | null> {
  if (!HASH.test(hash)) return null;
  try {
    const { blobs } = await store.list({ prefix: 'r/' });
    const hit = blobs.map((b) => b.key).find((k) => k.endsWith(`/${hash}`));
    return hit ? hit.split('/')[1] : null;
  } catch {
    return null;
  }
}

/** Deletes receipt records older than 30 days. Returns how many were deleted. */
export async function cleanupReceiptRecords(store: ReceiptListStore, now = new Date()): Promise<number> {
  const cutoff = capDay(new Date(now.getTime() - RECEIPT_KEEP_DAYS * 86400000));
  const { blobs } = await store.list({ prefix: 'r/' });
  let deleted = 0;
  for (const b of blobs) {
    const day = b.key.split('/')[1];
    if (day && day < cutoff) {
      await store.delete(b.key);
      deleted++;
    }
  }
  return deleted;
}
