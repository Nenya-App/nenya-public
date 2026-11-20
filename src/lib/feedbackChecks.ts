// The server's side of "Give feedback": the proof that a note passed the site's checks, the per-connection and daily limits, and the content check. Each check is an
// existing module of the site (sanitizePlainText, scrubPII, checkMessageForm, the private list's matcher, Cloudflare Turnstile, the one-way daily connection code);
// this file only puts them in order. See netlify/functions/feedback.mts.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { CounterStore } from './dailyCap.ts';
import { checkMessageForm } from './messageGate.ts';
import { scrubPII } from './piiScrub.ts';
import { sanitizePlainText } from './textSanitize.ts';
import { match as lexiconMatch, strongest, type Matcher } from './lexicon.ts';
import { MAX_COMMENT, MAX_PICKED, MIN_COMMENT } from './feedback.ts';

/** The stored fields the proof covers. */
export interface ProofFields { route: string; picked: string; features: string; comment: string }

/** What only this server can produce for a note that passed every check: the digest and the thank-you trust nothing without it, so a note posted straight to the form is never emailed. */
export function feedbackProof(secret: string, f: ProofFields): string {
  return createHmac('sha256', secret).update(['feedback-checked', f.route, f.picked, f.features, f.comment].join('\u0000')).digest('hex');
}

export function proofHolds(secret: string | undefined, f: ProofFields, proof: unknown): boolean {
  if (!secret || typeof proof !== 'string' || !/^[0-9a-f]{64}$/.test(proof)) return false;
  return timingSafeEqual(Buffer.from(feedbackProof(secret, f)), Buffer.from(proof));
}

/** A count that stops at a limit. Conditional writes keep two requests from taking one place. A store that cannot be reached lets the note through (never lock out a person for an outage). */
export async function takePlace(store: CounterStore, key: string, limit: number): Promise<boolean> {
  try {
    for (let i = 0; i < 8; i++) {
      const cur = await store.getWithMetadata(key, { type: 'text' });
      const n = Number(cur?.data) || 0;
      if (n >= limit) return false;
      const res = cur?.etag ? await store.set(key, String(n + 1), { onlyIfMatch: cur.etag }) : await store.set(key, String(n + 1), { onlyIfNew: true });
      if (res.modified) return true;
    }
  } catch {
    /* an uncounted note is not fatal */
  }
  return true;
}

export const intFrom = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return raw && Number.isInteger(n) && n > 0 ? n : fallback;
};

export type Vetted =
  | { ok: true; comment: string; picked: string; scrubbed: number }
  | { ok: false; why: 'empty' | 'short' | 'unclear' | 'language' };

/**
 * The note's text, checked: plain text only, personal details taken out (an address, a phone number, a name the comment gave: this form collects none), a form check that
 * only asks for a few more words (never silent), and the private list's matcher. A hit at or above `minSeverity` is refused and nothing is kept or sent.
 * `matcher` is null when the site has no private list yet: then only the other checks run, as in the coach.
 */
export function vetText(commentRaw: unknown, pickedRaw: unknown, matcher: Matcher | null, minSeverity: number, formCheck = true): Vetted {
  const comment0 = sanitizePlainText(typeof commentRaw === 'string' ? commentRaw : '', MAX_COMMENT);
  const picked0 = sanitizePlainText(typeof pickedRaw === 'string' ? pickedRaw : '', MAX_PICKED).replace(/\s+/g, ' ');
  if (comment0.length === 0) return { ok: false, why: 'empty' };
  const sc = scrubPII(comment0);
  const sp = scrubPII(picked0);
  const comment = sc.text.trim();
  if (comment.length < MIN_COMMENT) return { ok: false, why: 'short' };
  if (formCheck) {
    const f = checkMessageForm(comment);
    if (f) return { ok: false, why: f };
  }
  if (matcher && strongest([...lexiconMatch(comment, matcher), ...lexiconMatch(sp.text, matcher)]) >= minSeverity) return { ok: false, why: 'language' };
  return { ok: true, comment, picked: sp.text, scrubbed: sc.total + sp.total };
}
