// Reports and messages kept in the site's own private store instead of Netlify Forms (owner, 2026-11-15; docs/data-hygiene-scope.md). A Forms submission can
// only be deleted by the owner by hand, so a request to delete one meant an email; here each one is kept for 90 days and then deleted by a daily job, and the
// sender gets a deletion code (shown once; only its SHA-256 is stored) to delete it themselves at any time. The owner reads them on the admin page; the email
// alert carries only the kind and the dates, never the text.

import { createHash, createHmac, randomBytes } from 'node:crypto';

export const SUBMISSION_TYPES = ['error-report', 'sensory-reflection', 'contact-message'] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];
export const isSubmissionType = (v: unknown): v is SubmissionType => typeof v === 'string' && (SUBMISSION_TYPES as readonly string[]).includes(v);

export const KEEP_DAYS = 90;
export const PREFIX = 'submissions/';
/** Markers that let the server refuse an identical repeat (see duplicateKey). Deliberately NOT under PREFIX, so listing submissions never lists them. */
export const DUP_PREFIX = 'submission-dup/';

export interface SubmissionRecord {
  type: SubmissionType;
  report: string;
  comments: string;
  receivedAt: string;
  keepUntil: string;
  /** The key of its duplicate marker (a one-way code, not the text), so every way of deleting the submission can delete the marker too. */
  dup?: string;
}

/** What a duplicate marker holds: when it ends (the same day as the submission) and which submission it belongs to. No text. */
export interface DuplicateMarker {
  keepUntil: string;
  sub: string;
}

/**
 * Where the marker for "this exact text was already sent" is kept: under a one-way code of the type, the report and the comments, as plain text after the
 * same sanitizing. With a server secret the code is keyed (HMAC), so a guess at the words cannot be checked against it; without one it is a plain SHA-256.
 * The text is never stored a second time: the marker holds only its own end date and the key of the submission it belongs to.
 */
export function duplicateKey(type: SubmissionType, report: string, comments: string, secret?: string): string {
  const material = `${type}\u0000${report.trim()}\u0000${comments.trim()}`;
  const code = secret ? createHmac('sha256', secret).update(`submission-dup|${material}`).digest('hex') : createHash('sha256').update(material).digest('hex');
  return `${DUP_PREFIX}${code}`;
}

/** A deletion code: 20 random bytes, written in five groups of six letters and digits so it can be read aloud or copied. */
export function makeCode(rand: (n: number) => Buffer = randomBytes): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'; // no 0/o, 1/l/i: easy to read back
  const bytes = rand(30);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return chars.match(/.{6}/g)!.join('-');
}

/** The code as typed: case, spaces and dashes do not matter. */
export const normalizeCode = (code: string): string => code.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Where a submission is kept: under the hash of its code, so holding the code is the only way to find it again. */
export const keyForCode = (code: string): string => `${PREFIX}${createHash('sha256').update(normalizeCode(code)).digest('hex')}`;

export function newRecord(type: SubmissionType, report: string, comments: string, now = new Date(), dup?: string): SubmissionRecord {
  return { type, report, comments, receivedAt: now.toISOString(), keepUntil: new Date(now.getTime() + KEEP_DAYS * 86400000).toISOString(), ...(dup ? { dup } : {}) };
}

export const isDue = (rec: { keepUntil?: unknown } | null, now = new Date()): boolean =>
  !rec || typeof rec.keepUntil !== 'string' || !(new Date(rec.keepUntil).getTime() > now.getTime());
