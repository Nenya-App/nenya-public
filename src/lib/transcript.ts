// Builds the downloadable and shareable copies of a /coach demo conversation.
// The signed form is documented in docs/coach-transcripts.md.

import type { CheckNote, SiteMessage } from './siteMessages.ts';

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
  /** Present only when the site ended the conversation by stopping the last message: the transcript then ends with that message. */
  endedBy?: 'site';
  stop?: { category: string; kind?: string };
}

/** The transcript object exactly as the server hashed and signed it (version 3 has `meta`; older files, version 2, do not). */
export interface SignedTranscript {
  v: number;
  session: SessionColors;
  meta?: TranscriptMeta;
  context?: string;
  /** What the site itself showed besides the messages: the greeting, the safety notice with resources, the closing message. */
  site?: SiteMessage[];
  /** Process notes: why the site's check flagged each message it flagged. */
  checks?: CheckNote[];
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
export function readableTranscript(messages: TranscriptMsg[], session: SessionColors, receipt: Receipt | null, context = '', meta?: TranscriptMeta, site: SiteMessage[] = [], checks: CheckNote[] = []): string {
  const lines: string[] = [
    'NENYA COACH DEMO: TRANSCRIPT',
    'An early prototype. Not therapy. In a crisis in the US, call or text 988.',
    `Session colors (a temporary label, not an account): ${session.color1.toUpperCase()}.${session.color2.toUpperCase()}`,
    '',
  ];
  if (context) lines.push('Parts of a report that the visitor chose to share with the coach:', context, '');
  const siteLines = (after: number) => {
    for (const x of site.filter((y) => y.after === after)) {
      lines.push(x.kind === 'answer' ? `Note (written by the site): ${x.text}` : `${x.kind === 'notice' ? 'Safety notice' : 'Coach'} (written by the site, not the AI): ${x.text}`);
      for (const r of x.resources ?? []) lines.push(`  - ${r.name}: ${r.detail}`);
      lines.push('');
    }
  };
  siteLines(-1);
  for (const c of checks.filter((y) => y.shared)) {
    lines.push(`Process note (written by the site): the safety check flagged the report text the visitor chose to share, as ${c.category}${c.kind ? ` / ${c.kind}` : ''} (${c.tier}). The conversation was not ended for this. Why: ${c.source === 'phrase' ? `matched words${c.matched ? `: "${c.matched}"` : ''}` : `the self-injury ladder, rung: ${c.rung ?? 'unknown'}`}. This is simple phrase matching and can be wrong.`, '');
  }
  messages.forEach((m, i) => {
    lines.push(`${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`, '');
    for (const c of checks.filter((y) => y.message === i && !y.shared)) {
      const what = `${c.category}${c.kind ? ` / ${c.kind}` : ''} (${c.tier})`;
      const why = c.source === 'phrase'
        ? `matched words in the message${c.matched ? `: "${c.matched}"` : ''}`
        : `the self-injury ladder, rung: ${c.rung ?? 'unknown'}${c.matched ? `; matched words: "${c.matched}"` : ''}${c.basedOn?.length ? `; earlier messages counted: ${c.basedOn.join(', ')}` : ''}`;
      lines.push(`Process note (written by the site): the safety check flagged this message as ${what}. Why: ${why}. This is simple phrase matching and can be wrong.`, '');
    }
    siteLines(i);
  });
  lines.push('— — —');
  if (receipt) {
    if (meta) {
      if (meta.endedBy === 'site') {
        lines.push(
          `Ended by the site: the last message was stopped by the site's safety check and was never sent to the AI. Check: ${meta.stop?.category ?? 'unknown'}${meta.stop?.kind ? ` (${meta.stop.kind})` : ''}. ${meta.exchanges} earlier exchange${meta.exchanges === 1 ? '' : 's'}.`,
          `Version of the site that ran the check: build ${meta.build}, model ${meta.model}, instructions ${meta.instructions}`
        );
      } else {
        lines.push(
          meta.closed ? `Conversation complete: yes (${meta.exchanges} exchanges)` : `Conversation complete: no, stopped after ${meta.exchanges} exchange${meta.exchanges === 1 ? '' : 's'}`,
          `Version that wrote the replies: build ${meta.build}, model ${meta.model}, instructions ${meta.instructions}`
        );
      }
    }
    lines.push(
      `Signed by Nenya on: ${receipt.issuedAt}`,
      `Transcript hash (SHA-256): ${receipt.hash}`,
      `Signature (${receipt.algorithm}): ${receipt.signature}`,
      `Key ID: ${receipt.keyId}`,
      `Public key: ${receipt.publicKey}`,
      '',
      'This readable copy carries the signed file at its end. To check that it is untouched, drop it on https://nenya.biz/verify/ (nothing is uploaded), or use the signed .json file and the steps at:',
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

/**
 * The download's file name: the first 8 characters of the transcript's hash (so two files from the same day can be told
 * apart, and a file can be matched to its report) and the time it was signed, down to the second. Letters and digits only.
 * An unsigned copy says so and carries the time it was made.
 */
export function transcriptFilename(receipt: { hash?: string; issuedAt?: string } | null | undefined, extension: 'json' | 'txt', now: Date = new Date()): string {
  const stamp = (iso: string) => iso.replace(/\.\d+Z$/, 'Z').replace(/[-:]/g, '');
  const parsed = receipt?.issuedAt && !Number.isNaN(Date.parse(receipt.issuedAt)) ? receipt.issuedAt : now.toISOString();
  const code = (receipt?.hash ?? '').toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 8);
  return `nenya-coach-transcript-${code && receipt?.issuedAt ? code : 'unsigned'}-${stamp(parsed)}.${extension}`;
}

