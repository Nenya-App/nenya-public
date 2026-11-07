// Builds the downloadable and shareable copies of a /coach demo conversation.
// The signed form is documented in docs/coach-transcripts.md.

export interface TranscriptMsg {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionColors {
  color1: string;
  color2: string;
}

export interface TranscriptMeta {
  closed: boolean;
  exchanges: number;
  build: string;
  model: string;
  instructions: string;
}

/** The transcript object exactly as the server hashed and signed it (version 3 has `meta`; older files, version 2, do not). */
export interface SignedTranscript {
  v: number;
  session: SessionColors;
  meta?: TranscriptMeta;
  context?: string;
  messages: TranscriptMsg[];
}

export interface Receipt {
  version: number;
  algorithm: 'Ed25519';
  keyId: string;
  publicKey: string;
  hash: string;
  issuedAt: string;
  signature: string;
}

export const DOCS_URL = 'https://github.com/Nenya-App/nenya-public/blob/main/docs/coach-transcripts.md';

/** The verifiable file: the transcript exactly as the server hashed it, plus its receipt. */
export function signedJson(transcript: SignedTranscript, receipt: Receipt): string {
  return JSON.stringify(
    {
      transcript,
      receipt,
      verify: `Hash JSON.stringify(transcript) with SHA-256 and compare it to receipt.hash, then check the Ed25519 signature over "nenya-coach-transcript-v${transcript.v}\\n<hash>\\n<issuedAt>" with receipt.publicKey. Confirm the key matches Nenya's published key. Full steps: ${DOCS_URL}`,
    },
    null,
    2
  );
}

/** A readable copy. With a receipt it carries the signature block; without, it says so. */
export function readableTranscript(messages: TranscriptMsg[], session: SessionColors, receipt: Receipt | null, context = '', meta?: TranscriptMeta): string {
  const lines: string[] = [
    'NENYA COACH DEMO: TRANSCRIPT',
    'An early prototype. Not therapy. In a crisis in the US, call or text 988.',
    `Session colors (a temporary label, not an account): ${session.color1.toUpperCase()}.${session.color2.toUpperCase()}`,
    '',
  ];
  if (context) lines.push('Reflection summary the visitor chose to share with the coach:', context, '');
  for (const m of messages) {
    lines.push(`${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`, '');
  }
  lines.push('— — —');
  if (receipt) {
    if (meta) {
      lines.push(
        meta.closed ? `Conversation complete: yes (${meta.exchanges} exchanges)` : `Conversation complete: no, stopped after ${meta.exchanges} exchange${meta.exchanges === 1 ? '' : 's'}`,
        `Version that wrote the replies: build ${meta.build}, model ${meta.model}, instructions ${meta.instructions}`
      );
    }
    lines.push(
      `Signed by Nenya on: ${receipt.issuedAt}`,
      `Transcript hash (SHA-256): ${receipt.hash}`,
      `Signature (${receipt.algorithm}): ${receipt.signature}`,
      `Key ID: ${receipt.keyId}`,
      `Public key: ${receipt.publicKey}`,
      '',
      'This readable copy is for reading. To verify it, use the signed .json file and the steps at:',
      DOCS_URL
    );
  } else {
    lines.push(
      'UNSIGNED COPY: this copy has no signature, so it cannot be verified as untouched.',
      'Identifiers in your messages were replaced with placeholders before sending.'
    );
  }
  return lines.join('\n');
}

export function downloadText(filename: string, mime: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const dayStamp = (iso?: string): string => (iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10));
