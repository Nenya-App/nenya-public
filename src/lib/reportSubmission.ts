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
export async function submitReport({ type, report, comments = '' }: SubmitReportArgs): Promise<SubmitReceipt> {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, report: sanitizeReportBody(report), comments: sanitizeComments(comments), website: '' }),
  });
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
