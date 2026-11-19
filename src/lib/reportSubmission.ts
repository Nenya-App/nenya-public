// Sends reports, sensory-reflection summaries and contact messages to the site's own function (/api/submit), which keeps them in the private store for 90 days
// and gives the sender a deletion code (owner, 2026-11-15; docs/data-hygiene-scope.md). Before this they went to Netlify Forms, where only the owner could delete
// them, by hand, so a request to delete one meant an email. Same origin, so it stays inside the site's `connect-src 'self'` policy.
//
// Text sanitization (stripping markup/control characters) is a courtesy backstop, not a security boundary; the function checks again. See textSanitize.ts.
import { sanitizePlainText } from './textSanitize';

type ReportSubmissionType = 'error-report' | 'sensory-reflection' | 'contact-message';

const MAX_REPORT_LENGTH = 20000; // generous -- a full multi-gateway sensory report can be long
const MAX_COMMENTS_LENGTH = 2000;

function sanitizeComments(input: string): string {
  return sanitizePlainText(input, MAX_COMMENTS_LENGTH);
}

function sanitizeReportBody(input: string): string {
  return sanitizePlainText(input, MAX_REPORT_LENGTH);
}

interface SubmitReportArgs {
  type: ReportSubmissionType;
  report: string;
  comments?: string;
  /** The sender's "I am 18 or older", ticked on the consent screen (SendConsent.tsx). Required: the function refuses a send without it. Nothing else about age is sent. */
  adult: true;
}

/** The text exactly as it will be sent (after the same cleaning), so the consent screen can show it first. */
export const textToSend = (report: string, comments = ''): { report: string; comments: string } => ({ report: sanitizeReportBody(report), comments: sanitizeComments(comments) });

/** The server already has exactly this (HTTP 409). Nothing new was kept. */
export class DuplicateSubmissionError extends Error {
  constructor() {
    super('Identical submission');
    this.name = 'DuplicateSubmissionError';
  }
}

/** What the person is told when an identical send is refused (by the server, or by the tab's own memory). */
export const DUPLICATE_MESSAGE = 'You already sent exactly this. It is on file, and the deletion code you were given still works. Change it if you want to send something different.';

// A second guard, in this tab only: a one-way code (SHA-256) of what was sent, in sessionStorage, never the text. It is gone when the tab closes, is not shared with any
// site or other tab, and nothing breaks if the browser refuses it (a private window). The Terms say the site stores very little on the device; this is that little.
const TAB_KEY = 'nenya.sent-here';
export async function digestOfSend(type: string, report: string, comments = ''): Promise<string | null> {
  try {
    const bytes = new TextEncoder().encode(`${type}\u0000${report.trim()}\u0000${comments.trim()}`);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}
export function sentInThisTab(digest: string | null): boolean {
  if (!digest) return false;
  try {
    return (JSON.parse(sessionStorage.getItem(TAB_KEY) || '[]') as string[]).includes(digest);
  } catch {
    return false;
  }
}
export function rememberSentInThisTab(digest: string | null): void {
  if (!digest) return;
  try {
    const list = (JSON.parse(sessionStorage.getItem(TAB_KEY) || '[]') as string[]).filter((d) => d !== digest);
    sessionStorage.setItem(TAB_KEY, JSON.stringify([...list, digest].slice(-20)));
  } catch {
    /* no tab memory here; the server still refuses an identical repeat */
  }
}

export interface SubmitReceipt {
  /** Shown once; deletes the submission at /my-transcript. Only its hash is kept. */
  code: string;
  keepUntil: string;
}

/**
 * Sends to /api/submit (netlify/functions/submit.mts): kept in the site's own private store for 90 days, then deleted; the sender gets a deletion code.
 * Throws on a non-2xx answer; callers show their own pending/success/error states and the code (DeletionCode.tsx).
 */
export async function submitReport({ type, report, comments = '', adult }: SubmitReportArgs): Promise<SubmitReceipt> {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, report: sanitizeReportBody(report), comments: sanitizeComments(comments), adult, website: '' }),
  });
  if (response.status === 409) throw new DuplicateSubmissionError();
  if (!response.ok) throw new Error(`Report submission failed (${response.status})`);
  const j = (await response.json()) as Partial<SubmitReceipt>;
  if (typeof j.code !== 'string' || typeof j.keepUntil !== 'string') throw new Error('Report submission gave no code');
  return { code: j.code, keepUntil: j.keepUntil };
}

/** Deletes a submission with its code. The answer is the same whether or not there was one. */
export async function deleteSubmission(code: string): Promise<void> {
  const response = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', code }) });
  if (!response.ok) throw new Error(`Deletion failed (${response.status})`);
}
