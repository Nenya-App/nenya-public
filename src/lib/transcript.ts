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

export interface Receipt {
  version: 2;
  algorithm: 'Ed25519';
  keyId: string;
  publicKey: string;
  hash: string;
  issuedAt: string;
  signature: string;
}

export const DOCS_URL = 'https://github.com/Nenya-App/nenya-public/blob/main/docs/coach-transcripts.md';

const plain = (messages: TranscriptMsg[]): TranscriptMsg[] =>
  messages.map((m) => ({ role: m.role, content: m.content }));

/** The verifiable file: the transcript exactly as hashed, plus its receipt. */
export function signedJson(messages: TranscriptMsg[], session: SessionColors, receipt: Receipt): string {
  return JSON.stringify(
    {
      transcript: { v: 2, session: { color1: session.color1.toUpperCase(), color2: session.color2.toUpperCase() }, messages: plain(messages) },
      receipt,
      verify: `Hash JSON.stringify(transcript) with SHA-256 and compare it to receipt.hash, then check the Ed25519 signature over "nenya-coach-transcript-v2\\n<hash>\\n<issuedAt>" with receipt.publicKey. Confirm the key matches Nenya's published key. Full steps: ${DOCS_URL}`,
    },
    null,
    2
  );
}

/** A readable copy. With a receipt it carries the signature block; without, it says so. */
export function readableTranscript(messages: TranscriptMsg[], session: SessionColors, receipt: Receipt | null): string {
  const lines: string[] = [
    'NENYA COACH DEMO: TRANSCRIPT',
    'An early prototype. Not therapy. In a crisis in the US, call or text 988.',
    `Session colors (a temporary label, not an account): ${session.color1.toUpperCase()}.${session.color2.toUpperCase()}`,
    '',
  ];
  for (const m of messages) {
    lines.push(`${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`, '');
  }
  lines.push('— — —');
  if (receipt) {
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
