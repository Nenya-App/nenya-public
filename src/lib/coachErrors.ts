// Turns what went wrong with a coach turn into a plain sentence the person can read, plus a short line of technical
// details they can quote or send. The details hold codes only: never what the person wrote or what the coach said.

export interface FailureInfo {
  /** A plain sentence about what happened. */
  message: string;
  /** The server's error code, or "network" / "rate-limit" / "unreadable" when the server did not answer in its own words. */
  code: string;
  reason?: string;
  /** The server's short reference for this failure; it finds the matching line in the log. */
  ref?: string;
  status?: number;
  /** When it happened (ISO time). */
  at?: string;
}

export interface FailureInput {
  status?: number;
  error?: string;
  reason?: string;
  ref?: string;
  /** The request never got an answer (offline, blocked, or the connection dropped). */
  network?: boolean;
}

const UPSTREAM: Array<[RegExp, string]> = [
  [/^timeout$/, "The coach's model took too long to answer."],
  [/^e2ee-/, "The coach could not set up its private connection to the model."],
  [/^network$/, "The coach's server could not reach the model service."],
  [/^status-/, "The coach's model service had a problem."],
];

const BY_CODE: Record<string, string> = {
  empty: 'The model sent back an empty reply.',
  ticket: 'This conversation could not be verified, which can happen if it sat for a long time. Starting a new conversation fixes it.',
  turns: 'This conversation has used its five exchanges.',
  off: 'The coach is switched off on this site right now.',
  config: 'The coach is not fully set up on this site yet.',
  origin: 'This web address is not allowed to use the coach.',
  messages: 'The server could not read the message.',
  json: 'The server could not read the message.',
  session: 'The server could not read the message.',
  context: 'The server could not read the message.',
  type: 'The server could not read the message.',
  size: 'The message was too long for the server to accept.',
};

export function describeFailure(i: FailureInput): FailureInfo {
  if (i.network) return { message: 'Your device could not reach the site. Check your connection and try again.', code: 'network' };
  if (i.status === 429) return { message: 'Too many messages in a short time. Wait a minute, then try again.', code: 'rate-limit', status: 429, ref: i.ref };
  if (i.error === 'unreadable') return { message: "The server's answer could not be read.", code: 'unreadable', status: i.status };
  const code = i.error ?? 'unknown';
  let message = BY_CODE[code];
  if (code === 'upstream') message = UPSTREAM.find(([re]) => re.test(i.reason ?? ''))?.[1] ?? "The coach's model service had a problem.";
  return { message: message ?? 'Something went wrong.', code, reason: i.reason, ref: i.ref, status: i.status };
}

/** One line of codes, for showing under the message. */
export function failureLine(f: FailureInfo): string {
  return [f.status ? `status ${f.status}` : null, f.code, f.reason ?? null, f.ref ? `ref ${f.ref}` : null, f.at ? f.at.replace('T', ' ').slice(0, 16) + ' UTC' : null]
    .filter(Boolean)
    .join(' · ');
}

/** The text of a failure report (or of "copy details"): technical details only. */
export function failureDetails(f: FailureInfo, turn: number): string {
  return [
    'Nenya coach: failed turn',
    `time: ${f.at ?? 'unknown'}`,
    `turn: ${turn}`,
    `status: ${f.status ?? 'none'}`,
    `code: ${f.code}`,
    `reason: ${f.reason ?? 'none'}`,
    `ref: ${f.ref ?? 'none'}`,
    `what the person saw: ${f.message}`,
  ].join('\n');
}
