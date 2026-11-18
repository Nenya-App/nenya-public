// "Request a summary" on the page (docs/request-a-summary-scope.md, step 3). Pure: the switch, the words, the request and how an answer is read. The page
// (src/coach/SummaryRequest.tsx) only shows what this decides. Never run automatically; one summary per conversation (the page keeps the first and offers no second).
import { SUMMARY_CREDIT, SUMMARY_CREDIT_LINK, SUMMARY_FAILED_TEXT } from './summaryWords.ts';

/** VITE_SUMMARY_REQUEST (off by default): the button on the coach page. The server's own switch is COACH_SUMMARY_REQUEST. */
export const summaryRequestOn = (): boolean => import.meta.env?.VITE_SUMMARY_REQUEST === 'on';

/** The words on the page: the block label, the button, the loading line, the note and the cap sentence. Approved by the owner 2026-11-18 ("approve all"). */
export const SUMMARY_UI = {
  button: 'Request a summary',
  buttonNote: 'Optional. A summary is the AI’s reading of what you wrote, not a record. The signed transcript is the exact record.',
  loading: 'Writing a summary…',
  label: 'Summary of this conversation, written by the AI',
  note: 'This is the AI’s reading of what you wrote, not a record of it. The signed transcript is the exact record, and it includes this summary only if you ask for it there.',
  cap: 'The free summaries for today are used up. The transcript you can download still has everything that was said.',
  error: 'A summary could not be asked for just now. The transcript you can download still has everything that was said.',
} as const;

export { SUMMARY_CREDIT, SUMMARY_CREDIT_LINK, SUMMARY_FAILED_TEXT };

export interface SummaryRequestInput {
  session: { color1: string; color2: string };
  /** All ten messages (five exchanges), as sent for the receipt. */
  messages: { role: string; content: string }[];
  ticket: string;
  /** The parts of a report the person brought, when they did (the ticket is bound to it). */
  context?: string;
}

export const summaryRequestBody = (i: SummaryRequestInput) => ({ action: 'summary', session: i.session, messages: i.messages, ticket: i.ticket, ...(i.context ? { context: i.context } : {}) });

export type SummaryOutcome =
  | { kind: 'ok'; summary: string; text: string; proof: string; credit: boolean }
  | { kind: 'flagged'; text: string }
  | { kind: 'cap'; text: string }
  | { kind: 'failed'; text: string }
  /** The server's switch is off: show nothing and hide the button. */
  | { kind: 'off' }
  | { kind: 'error'; text: string };

/** Reads the coach route's answer to a summary request. Anything unexpected is a plain error sentence, never a half-shown summary. */
export function readSummaryAnswer(status: number, body: unknown): SummaryOutcome {
  const j = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (status === 503) return { kind: 'off' };
  if (j.refused === 'flagged' && typeof j.text === 'string' && j.text) return { kind: 'flagged', text: j.text };
  if (j.refused === 'cap') return { kind: 'cap', text: SUMMARY_UI.cap };
  if (j.refused === 'failed') return { kind: 'failed', text: SUMMARY_FAILED_TEXT };
  if (status === 200 && typeof j.summary === 'string' && j.summary && typeof j.text === 'string' && typeof j.proof === 'string' && /^[0-9a-f]{64}$/.test(j.proof)) {
    return { kind: 'ok', summary: j.summary, text: j.text, proof: j.proof, credit: j.credit === true };
  }
  return { kind: 'error', text: SUMMARY_UI.error };
}
