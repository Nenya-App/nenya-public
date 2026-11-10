// What a person allows us to do with a verified transcript they send us, and how long we may keep it (docs/transcript-consent-scope.md).
//
// Nothing is allowed by default: the person chooses, at the moment they send it, and can only be asked once. Reading it is the point of sending it, so it is
// always included; the other uses are separate choices. The signed file is the key to taking a permission back later: whoever holds the signed transcript can
// reduce what was allowed (stop a use, or ask for deletion), never widen it. Holding the file proves you have the file, not who you are; that is the honest
// limit, and it is why revoking can only ever make things more restrictive.

export const USES = ['evaluate', 'quote', 'publish'] as const;
export type Use = (typeof USES)[number];
export const KEEPS = ['30d', '90d', '1y', 'until-asked'] as const;
export type Keep = (typeof KEEPS)[number];

export const USE_LABELS: Record<Use, { label: string; detail: string }> = {
  evaluate: { label: 'Use it to test and improve the coach', detail: 'We may keep it, with names and contact details removed, among the test conversations we use to check the coach and its safety checks. It is never used to train a model.' },
  publish: { label: 'Show it on our "witnessed conversations" page, without your name', detail: 'A person at Nenya reads it first and checks that nothing identifies you. If it goes up, it shows only the messages you choose, marked as written by you, by the AI, or by the site, with a link to check the signature when the whole conversation is shown. You can take it down at any time with the signed file. We cannot recall copies other people make of a public page.' },
  quote: { label: 'Quote short parts in public', detail: 'We may quote a few words from it in our documents, posts or answers, never with a name, and never the whole conversation.' },
};
export const KEEP_LABELS: Record<Keep, string> = {
  '30d': 'Delete it after 30 days',
  '90d': 'Delete it after 90 days',
  '1y': 'Delete it after one year',
  'until-asked': 'Keep it until I ask for it to be deleted',
};
const DAYS: Record<Exclude<Keep, 'until-asked'>, number> = { '30d': 30, '90d': 90, '1y': 365 };

export interface Choices {
  uses: Use[];
  keep: Keep;
  /** Only when 'publish' is a use: 'all' (the whole signed conversation, which anyone can check) or the numbers of the messages to show (an excerpt). */
  portions?: 'all' | number[];
}

/** The person's choices from a request, or null if they are not valid (a keeping time is required; uses are optional and must be known). */
export function parseChoices(raw: unknown): Choices | null {
  const c = raw as { uses?: unknown; keep?: unknown } | null;
  if (!c || typeof c !== 'object') return null;
  if (typeof c.keep !== 'string' || !(KEEPS as readonly string[]).includes(c.keep)) return null;
  const list = c.uses === undefined ? [] : c.uses;
  if (!Array.isArray(list) || list.length > USES.length) return null;
  const uses: Use[] = [];
  for (const u of list) {
    if (typeof u !== 'string' || !(USES as readonly string[]).includes(u)) return null;
    if (!uses.includes(u as Use)) uses.push(u as Use);
  }
  const out: Choices = { uses, keep: c.keep as Keep };
  const portions = (raw as { portions?: unknown }).portions;
  if (uses.includes('publish')) {
    // publishing needs a clear choice of what to show: the whole conversation, or at least one chosen message
    if (portions === 'all') out.portions = 'all';
    else if (Array.isArray(portions) && portions.length >= 1 && portions.length <= 10 && portions.every((n) => Number.isInteger(n) && n >= 0 && n < 10)) out.portions = [...new Set(portions as number[])].sort((a, b) => a - b);
    else return null;
  } else if (portions !== undefined) return null;
  return out;
}

/** The day it must be gone by (ISO date and time), or null for "until I ask". */
export function keepUntil(keep: Keep, from: Date): string | null {
  return keep === 'until-asked' ? null : new Date(from.getTime() + DAYS[keep] * 86400e3).toISOString();
}

/** The choices in plain words, for the form field, the confirmation and the page. */
export function describeChoices(c: Choices): string {
  const parts = ['Read it and consider what the person wrote.'];
  for (const u of c.uses) parts.push(USE_LABELS[u].label + '.');
  if (!c.uses.length) parts.push('No other use: not used for testing, not quoted.');
  if (c.uses.includes('publish')) parts.push(c.portions === 'all' ? 'If published, the whole conversation is shown.' : 'If published, only the chosen messages are shown.');
  parts.push(KEEP_LABELS[c.keep] + '.');
  return parts.join(' ');
}

export type Status = 'active' | 'deletion-requested' | 'deleted';
export type Publication = 'none' | 'pending-review' | 'public' | 'withdrawn';
/** What we keep about a transcript we were sent: its fingerprint, the choices and dates. Never the conversation itself. */
export interface TranscriptRecord {
  hash: string;
  receivedAt: string;
  uses: Use[];
  keep: Keep;
  keepUntil: string | null;
  status: Status;
  /** The public page, if 'publish' was allowed: waiting for a person to read it, shown, or taken down. */
  publication: Publication;
  /** The same as in the choices: what may be shown. */
  portions?: 'all' | number[];
  /** The id of the stored submission (set when the form submission arrives), so it can be deleted. */
  submissionId?: string;
  updatedAt: string;
}

export const recordKey = (hash: string): string => `transcript/${hash}`;
export const HASH = /^[0-9a-f]{64}$/;

export function newRecord(hash: string, c: Choices, now: Date): TranscriptRecord {
  return { hash, receivedAt: now.toISOString(), uses: [...c.uses], keep: c.keep, keepUntil: keepUntil(c.keep, now), status: 'active', publication: c.uses.includes('publish') ? 'pending-review' : 'none', ...(c.portions ? { portions: c.portions } : {}), updatedAt: now.toISOString() };
}

export interface Revocation {
  /** Uses to stop. */
  stop?: Use[];
  /** Ask for the whole thing to be deleted. */
  deleteNow?: boolean;
}

/** A revocation can only take permissions away: it never adds a use, never lengthens the keeping time, and never undoes a deletion request. */
export function applyRevocation(rec: TranscriptRecord, req: Revocation, now: Date): TranscriptRecord {
  if (rec.status !== 'active') return rec;
  const stop = new Set(req.stop ?? []);
  const next: TranscriptRecord = { ...rec, uses: rec.uses.filter((u) => !stop.has(u)), updatedAt: now.toISOString() };
  // Taking back 'publish', or asking for deletion, takes it off the public page at once (the page only ever shows records whose publication is 'public').
  if ((stop.has('publish') || req.deleteNow) && (next.publication === 'public' || next.publication === 'pending-review')) next.publication = 'withdrawn';
  if (req.deleteNow) next.status = 'deletion-requested';
  return next;
}

/** Whether a record is due for deletion: asked for, or past its keeping time. */
export const dueForDeletion = (rec: TranscriptRecord, now: Date): boolean =>
  rec.status === 'deletion-requested' || (rec.status === 'active' && rec.keepUntil !== null && new Date(rec.keepUntil) <= now);

/** The same transcript sent again: what was allowed before cannot be widened by sending it a second time. Only the narrower of the two stands. */
export function mergeResend(existing: TranscriptRecord, incoming: TranscriptRecord): TranscriptRecord {
  if (existing.status === 'deleted') return incoming; // it was deleted: sending it again is a fresh decision
  const earliest = [existing.keepUntil, incoming.keepUntil].filter((x): x is string => !!x).sort()[0] ?? null;
  return {
    ...existing,
    uses: existing.uses.filter((u) => incoming.uses.includes(u)),
    publication: existing.uses.includes('publish') && incoming.uses.includes('publish') ? existing.publication : existing.publication === 'public' || existing.publication === 'pending-review' ? 'withdrawn' : existing.publication,
    keepUntil: earliest,
    keep: earliest === existing.keepUntil ? existing.keep : incoming.keep,
    updatedAt: incoming.updatedAt,
  };
}

/** Whether the record may be shown on the public page right now. */
export const isPublic = (rec: TranscriptRecord, now: Date): boolean =>
  rec.status === 'active' && rec.publication === 'public' && rec.uses.includes('publish') && !(rec.keepUntil !== null && new Date(rec.keepUntil) <= now);

/** Where a transcript waiting to be read (and, if approved, shown) is kept. It holds the signed conversation, so it exists only when 'publish' was allowed,
 *  and it is deleted when the permission is taken back, when the record is deleted, or when a person decides not to show it. */
export const pendingKey = (hash: string): string => `witnessed/${hash}`;
