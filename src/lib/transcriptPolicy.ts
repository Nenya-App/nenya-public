// What a person allows us to do with a verified transcript they send us, and how long we may keep it (docs/transcript-consent-scope.md).
//
// Nothing is allowed by default: the person chooses, at the moment they send it, and can only be asked once. Reading it is the point of sending it, so it is
// always included; the other uses are separate choices. The signed file is the key to taking a permission back later: whoever holds the signed transcript can
// reduce what was allowed (stop a use, or ask for deletion), never widen it. Holding the file proves you have the file, not who you are; that is the honest
// limit, and it is why revoking can only ever make things more restrictive.

export const USES = ['evaluate', 'quote', 'publish', 'train'] as const;
/** The version of the wording the person agreed to; recorded with their choices and in the consent receipt. */
export const CONSENT_TERMS_VERSION = 'consent-2026-11-10';
export type Use = (typeof USES)[number];
export const KEEPS = ['30d', '90d', '1y', 'until-asked'] as const;
export type Keep = (typeof KEEPS)[number];

export const USE_LABELS: Record<Use, { label: string; detail: string }> = {
  evaluate: { label: 'Use it to test and improve the coach', detail: 'We may keep it, with names and contact details removed, among the test conversations we use to check the coach and its safety checks. It is not used to train a model unless you also choose that below.' },
  train: { label: 'Use it to train or improve a model, from now on', detail: 'A person at Nenya first reads it and edits it by hand (names and details removed again), and may decide not to use it. Only then may it be used to train or improve a model, for training runs from now on, never a conversation the safety check stopped. Taking it back removes it from future training. A model that was already trained cannot unlearn it. We do not publish it or the model as a dataset.' },
  publish: { label: 'Show it on our "witnessed conversations" page, without your name', detail: 'The site first replaces names and contact details again, then a person at Nenya reads it and edits it by hand, and may decide not to show it. If it goes up, it shows only what you choose, each message marked as written by you, by the AI, or by the site. Because names are removed, a stranger cannot check the signature on the public copy; it carries a short fingerprint that matches your signed file. You can take it down at any time with the signed file. We cannot recall copies other people make of a public page.' },
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
  /** The person said they are 18 or older and that the words are their own. Required to send anything at all. */
  adult?: true;
  /** The wording they agreed to (CONSENT_TERMS_VERSION). */
  terms?: string;
  /** Only when 'publish' is a use: 'all' (the whole conversation) or the numbers of the messages to show (an excerpt). */
  portions?: 'all' | number[];
  /** Only when 'publish' is a use: how long it may stay on the public page once it is up. Separate from, and never longer than, the keeping time. */
  showFor?: Keep;
}

const RANK: Record<Keep, number> = { '30d': 1, '90d': 2, '1y': 3, 'until-asked': 4 };
/** Whether the keeping time `keep` lasts at least as long as the showing time `show` (a copy cannot be on show after the transcript is gone). */
const outlasts = (keep: Keep, show: Keep): boolean => RANK[keep] >= RANK[show];

/** The person's choices from a request, or null if they are not valid (a keeping time is required; uses are optional and must be known). */
export function parseChoices(raw: unknown): Choices | null {
  const c = raw as { uses?: unknown; keep?: unknown; adult?: unknown } | null;
  if (!c || typeof c !== 'object') return null;
  // Nothing is sent without the statement "I am 18 or older, and these are my own words" (the owner's decision, 2026-11-10; docs/drafts/transcript-contribution-terms-draft.md).
  if (c.adult !== true) return null;
  if (typeof c.keep !== 'string' || !(KEEPS as readonly string[]).includes(c.keep)) return null;
  const list = c.uses === undefined ? [] : c.uses;
  if (!Array.isArray(list) || list.length > USES.length) return null;
  const uses: Use[] = [];
  for (const u of list) {
    if (typeof u !== 'string' || !(USES as readonly string[]).includes(u)) return null;
    if (!uses.includes(u as Use)) uses.push(u as Use);
  }
  const out: Choices = { uses, keep: c.keep as Keep, adult: true, terms: CONSENT_TERMS_VERSION };
  const portions = (raw as { portions?: unknown }).portions;
  if (uses.includes('publish')) {
    // publishing needs a clear choice of what to show: the whole conversation, or at least one chosen message
    if (portions === 'all') out.portions = 'all';
    else if (Array.isArray(portions) && portions.length >= 1 && portions.length <= 10 && portions.every((n) => Number.isInteger(n) && n >= 0 && n < 10)) out.portions = [...new Set(portions as number[])].sort((a, b) => a - b);
    else return null;
    // and for how long it may stay up (required, nothing assumed); it cannot outlast the keeping time
    const showFor = (raw as { showFor?: unknown }).showFor;
    if (typeof showFor !== 'string' || !(KEEPS as readonly string[]).includes(showFor)) return null;
    if (!outlasts(c.keep as Keep, showFor as Keep)) return null;
    out.showFor = showFor as Keep;
  } else if (portions !== undefined || (raw as { showFor?: unknown }).showFor !== undefined) return null;
  return out;
}

/** The day it must be gone by (ISO date and time), or null for "until I ask". */
export function keepUntil(keep: Keep, from: Date): string | null {
  return keep === 'until-asked' ? null : new Date(from.getTime() + DAYS[keep] * 86400e3).toISOString();
}

/** The choices in plain words, for the form field, the confirmation and the page. */
export function describeChoices(c: Choices): string {
  const parts = ['Read it and consider what the person wrote.', ...(c.adult ? ['The person confirmed they are 18 or older and that the words are their own.'] : [])];
  for (const u of c.uses) parts.push(USE_LABELS[u].label + '.');
  if (!c.uses.length) parts.push('No other use: not used for testing, not quoted, not used for training.');
  if (c.uses.includes('publish')) parts.push((c.portions === 'all' ? 'If published, the whole conversation is shown' : 'If published, only the chosen messages are shown') + (c.showFor ? `, and it stays up ${c.showFor === 'until-asked' ? 'until I ask for it to come down' : 'for ' + { '30d': '30 days', '90d': '90 days', '1y': 'a year' }[c.showFor]}.` : '.'));
  parts.push(KEEP_LABELS[c.keep] + '.');
  return parts.join(' ');
}

export type Status = 'active' | 'deletion-requested' | 'deleted';
export type Publication = 'none' | 'pending-review' | 'public' | 'withdrawn';
/** Training: nothing is used until a person has read and edited it by hand. 'withdrawn' means it is out of future training. */
export type Training = 'none' | 'pending-review' | 'approved' | 'withdrawn';
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
  /** Use for training, if 'train' was allowed: waiting for a person to read it, approved for the next training run, or withdrawn. */
  training?: Training;
  /** The person's 18-or-older statement and the wording they agreed to. */
  adult?: true;
  terms?: string;
  /** The same as in the choices: what may be shown. */
  portions?: 'all' | number[];
  /** How long it may stay on the public page once up, and the day it must come down (set when a person approves it). */
  showFor?: Keep;
  publicUntil?: string | null;
  updatedAt: string;
}

export const recordKey = (hash: string): string => `transcript/${hash}`;
export const HASH = /^[0-9a-f]{64}$/;

export function newRecord(hash: string, c: Choices, now: Date): TranscriptRecord {
  return { hash, receivedAt: now.toISOString(), uses: [...c.uses], keep: c.keep, keepUntil: keepUntil(c.keep, now), status: 'active', publication: c.uses.includes('publish') ? 'pending-review' : 'none', training: c.uses.includes('train') ? 'pending-review' : 'none', ...(c.adult ? { adult: true as const, terms: c.terms } : {}), ...(c.portions ? { portions: c.portions } : {}), ...(c.showFor ? { showFor: c.showFor } : {}), updatedAt: now.toISOString() };
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
  // Taking back 'train', or asking for deletion, takes it out of future training (a model already trained cannot unlearn it).
  if ((stop.has('train') || req.deleteNow) && (next.training === 'pending-review' || next.training === 'approved')) next.training = 'withdrawn';
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
    ...(existing.publicUntil !== undefined ? { publicUntil: existing.publicUntil } : {}),
    publication: existing.uses.includes('publish') && incoming.uses.includes('publish') ? existing.publication : existing.publication === 'public' || existing.publication === 'pending-review' ? 'withdrawn' : existing.publication,
    training: existing.uses.includes('train') && incoming.uses.includes('train') ? existing.training : existing.training === 'pending-review' || existing.training === 'approved' ? 'withdrawn' : existing.training,
    keepUntil: earliest,
    keep: earliest === existing.keepUntil ? existing.keep : incoming.keep,
    updatedAt: incoming.updatedAt,
  };
}

/** Whether the record may be shown on the public page right now. */
export const isPublic = (rec: TranscriptRecord, now: Date): boolean =>
  rec.status === 'active' && rec.publication === 'public' && rec.uses.includes('publish') && !(rec.keepUntil !== null && new Date(rec.keepUntil) <= now) && !(rec.publicUntil != null && new Date(rec.publicUntil) <= now);

/** The day a copy approved at `from` must come down, or null for "until I ask". */
export const publicUntilFor = (showFor: Keep | undefined, from: Date): string | null => (showFor ? keepUntil(showFor, from) : null);

/** Whether a public copy has outstayed the time its owner allowed (while the transcript itself may still be kept). */
export const publicExpired = (rec: TranscriptRecord, now: Date): boolean => rec.publication === 'public' && rec.publicUntil != null && new Date(rec.publicUntil) <= now;

/** A record that is due for deletion but could not be deleted by software, and so waits for a person. */
export const needsHand = (rec: TranscriptRecord, now: Date): boolean => dueForDeletion(rec, now);

/** Where a transcript waiting to be read (and, if approved, shown) is kept. It holds the signed conversation, so it exists only when 'publish' was allowed,
 *  and it is deleted when the permission is taken back, when the record is deleted, or when a person decides not to show it. */
export const pendingKey = (hash: string): string => `witnessed/${hash}`;

/** Where the reviewed, anonymized copy that the public page shows is kept (never the signed original). */
export const publicKey = (hash: string): string => `public/${hash}`;

/** Where a transcript someone sent us is kept (the owner reads it in the admin page). It holds the conversation, so it is deleted when the keeping time ends, when the
 *  person asks with the signed file, or when the owner deletes it. The notification email carries only the fingerprint and the choices, never the conversation. */
export const inboxKey = (hash: string): string => `inbox/${hash}`;

/** What the inbox keeps for one transcript. */
export interface InboxEntry {
  receivedAt: string;
  readable: string;
  signed: { transcript: unknown; receipt: unknown };
  note: string;
  checked: string;
  issuedRecord: string;
  permissions: string;
  keepUntil: string | null;
}
