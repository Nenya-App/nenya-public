// Submits reports to Netlify Forms -- a plain HTML form POST to our own
// origin, which Netlify intercepts server-side and (per the dashboard
// configuration) emails to the team. This stays inside the site's own
// `connect-src 'self'` CSP: no third-party endpoint, no API key shipped
// to the browser, no new attack surface beyond what a static site already
// has. See index.html for the static form Netlify needs to detect this
// form at build time.

type ReportSubmissionType = 'error-report' | 'sensory-reflection';

const MAX_REPORT_LENGTH = 20000; // generous -- a full multi-gateway sensory report can be long
const MAX_COMMENTS_LENGTH = 2000;

/**
 * Strips anything that isn't plain text: HTML/XML tags (so no markup or
 * script content can ride along), and non-printable control characters
 * (keeping newline, tab, and carriage return). This is a courtesy
 * backstop, not a security boundary -- Netlify stores form submissions as
 * plain field values and never executes them, and this data is never
 * rendered back into the Nenya site itself. It exists so what lands in
 * the team's inbox is exactly what it claims to be: plain text, nothing
 * else.
 */
function sanitizePlainText(input: string, maxLength: number): string {
  const withoutTags = input.replace(/<[^>]*>/g, '');

  // Filtering control characters by char code rather than a regex literal:
  // control-character ranges are easy to mangle in transit and hard to
  // eyeball-verify once written, so this is the unambiguous version.
  let printableOnly = '';
  for (let i = 0; i < withoutTags.length; i++) {
    const code = withoutTags.charCodeAt(i);
    const isKeptWhitespace = code === 9 || code === 10 || code === 13; // tab, \n, \r
    const isControl = (code < 32 && !isKeptWhitespace) || code === 127;
    if (!isControl) {
      printableOnly += withoutTags[i];
    }
  }

  return printableOnly.trim().slice(0, maxLength);
}

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

/**
 * POSTs to our own origin in Netlify's expected
 * application/x-www-form-urlencoded shape. Throws on a non-2xx response;
 * callers are expected to show their own pending/success/error UI around
 * this.
 */
export async function submitReport({ type, report, comments = '' }: SubmitReportArgs): Promise<void> {
  const body = new URLSearchParams({
    'form-name': 'report-submission',
    'bot-field': '', // honeypot -- real users never fill this in
    type,
    report: sanitizeReportBody(report),
    comments: sanitizeComments(comments),
  });

  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Report submission failed (${response.status})`);
  }
}
