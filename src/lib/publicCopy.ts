// Making a public copy of a conversation for the "witnessed conversations" page (docs/transcript-consent-scope.md). Three safeguards, in order:
//  1. A conversation in which the site's safety check STOPPED a message (self-harm, abuse, danger) can never be offered for publishing at all.
//  2. The site anonymizes automatically: identifiers and many names are replaced again (the same scrubber the coach uses), the session colors, key and exact dates
//     are left out, and each message is marked as written by the person, the AI or the site.
//  3. A person at Nenya reads and edits every copy by hand before anything is shown. Software cannot promise anonymity: names slip through and details identify.
// The public copy is therefore NOT the signed text, so a stranger cannot check its signature. It carries the original's short fingerprint, which the person who
// holds the signed file can match to theirs.
import { scrubPII } from './piiScrub.ts';
import type { SignedTranscript } from './transcript.ts';

export type Writer = 'person' | 'ai' | 'site';
export interface PublicItem {
  /** Position in the original conversation (for the reviewer; not shown). */
  n: number;
  by: Writer;
  text: string;
}

/** Whether the site's safety check stopped a message in this conversation: such a conversation is never offered for publishing. */
export function stopLevelFlagged(t: Pick<SignedTranscript, 'meta' | 'checks'> | null | undefined): boolean {
  if (!t) return false;
  if (t.meta && (t.meta as { endedBy?: unknown }).endedBy === 'site') return true;
  return (t.checks ?? []).some((c) => c.tier === 'stop');
}

export interface Draft {
  items: PublicItem[];
  /** How many identifiers or names the scrubber replaced just now (anything the person's own page missed). */
  replaced: number;
  /** For the reviewer only: categories of softer safety flags in the conversation, which deserve a closer read. */
  softFlags: string[];
}

/** The anonymized draft a reviewer starts from. `portions` is 'all' or the numbers of the messages to show. */
export function anonymize(t: SignedTranscript, portions: 'all' | number[]): Draft {
  const wanted = portions === 'all' ? t.messages.map((_, i) => i) : portions.filter((i) => i >= 0 && i < t.messages.length);
  const siteWrote = new Set((t.site ?? []).filter((x) => x.kind === 'answer' || x.kind === 'replacement').map((x) => x.after));
  let replaced = 0;
  const items: PublicItem[] = wanted.map((i) => {
    const m = t.messages[i];
    const s = scrubPII(m.content);
    replaced += s.total;
    // A reply the site wrote itself (a pre-written answer, or a fixed sentence in place of the AI's) is marked as the site's, never as the AI's.
    const by: Writer = m.role === 'user' ? 'person' : siteWrote.has(i) ? 'site' : 'ai';
    return { n: i, by, text: s.text };
  });
  const softFlags = [...new Set((t.checks ?? []).filter((c) => c.tier === 'soften').map((c) => c.category))];
  return { items, replaced, softFlags };
}

export const MAX_ITEMS = 10;
export const MAX_ITEM_CHARS = 3000;

/** Checks a reviewer's final copy before it can go up: the right shape, within limits, and nothing the scrubber would still replace. Returns a short reason, or null. */
export function reviewProblem(items: unknown): string | null {
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS) return 'shape';
  for (const x of items as PublicItem[]) {
    if (!x || !['person', 'ai', 'site'].includes(x.by) || typeof x.text !== 'string' || !x.text.trim() || x.text.length > MAX_ITEM_CHARS) return 'shape';
    if (scrubPII(x.text).total > 0) return 'still-identifying';
  }
  return null;
}
