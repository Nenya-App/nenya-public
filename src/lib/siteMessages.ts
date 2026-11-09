// The words the site itself puts in a coach conversation (not the AI): the greeting, the closing message when the five exchanges are
// done, and the safety notice with resources when the crisis check flagged a message. They are rebuilt from this public source, by the
// server when it signs a transcript and by the page when it makes an unsigned copy, so a signed transcript shows exactly what the
// visitor was shown. (The sentences the server adds to a reply, and the thank-you after critical feedback, are already inside the
// reply. The note about replaced identifiers is made by the page from the visitor's own message and is not part of this list.)
import { detectHostility } from './hostility.ts';
import { checkConversation, explainConversation, noticeIntro, resourcesFor } from './safetyFlags.ts';

export const greetingText = (maxTurns: number): string =>
  `Hello. We have ${maxTurns} exchanges together, so let's use them well. Tell me what happened, what you are feeling, and what you need, as much or as little as feels right.`;

export const CLOSING_TEXT =
  'That is our five. Thank you for letting me listen. Whatever came up deserves more time than this, so if it is still with you, a person you trust, a journal, or a professional can carry it further. For now, one slow breath, in and out, with the breathing tool below.';

/** After a conversation in which the person criticized the reply, the site, Nonviolent Communication or the use of AI: an invitation, never a request. */
export const INVITATION_TEXT =
  'If you would like the people who made Nenya to read what you thought, you can send this conversation to us with a note, using the buttons below. It is up to you, and nothing is sent unless you choose.';

export interface SiteMessage {
  kind: 'greeting' | 'closing' | 'notice' | 'invitation' | 'answer';
  /** The index of the message this one follows; -1 means before the first message. */
  after: number;
  text: string;
  /** For a notice: the resources listed under it. */
  resources?: { name: string; detail: string }[];
}

/**
 * What the page showed besides the visitor's messages and the coach's replies, in order. The greeting comes first. If any message was
 * flagged (the page keeps the most recent flag on screen), the notice with its resources comes after the last message; otherwise, when all
 * the exchanges are done, the closing message does.
 */
export function siteMessagesFor(messages: { role: 'user' | 'assistant'; content: string }[], maxTurns: number, answered: { index: number; title: string }[] = []): SiteMessage[] {
  const out: SiteMessage[] = [{ kind: 'greeting', after: -1, text: greetingText(maxTurns) }];
  // A reply the site wrote itself, as a pre-written answer to a question about Nenya, is marked as such right after it.
  for (const x of answered) out.push({ kind: 'answer', after: x.index, text: `The reply above was written by the site as a pre-written answer ("${x.title}"), not by the AI.` });
  const users = messages.filter((m) => m.role === 'user').map((m) => m.content);
  let flag = null as ReturnType<typeof checkConversation>;
  for (let j = 1; j <= users.length; j++) {
    const f = checkConversation(users.slice(0, j));
    if (f) flag = f;
  }
  const last = messages.length - 1;
  if (flag) {
    out.push({ kind: 'notice', after: last, text: noticeIntro(flag), resources: resourcesFor(flag.category, flag.kind).map((r) => ({ name: r.name, detail: r.detail })) });
  } else if (messages.length === maxTurns * 2 && messages[last]?.role === 'assistant') {
    out.push({ kind: 'closing', after: last, text: CLOSING_TEXT });
    // Critique is feedback the people who made Nenya want. Offered only at the end, never when a message was flagged, never as a request.
    if (users.some((t) => detectHostility(t) === 'critique')) out.push({ kind: 'invitation', after: last, text: INVITATION_TEXT });
  }
  return out;
}

/** A process note: why the site's check flagged one of the person's messages. */
export interface CheckNote {
  /** The index, in the transcript's messages, of the message that was flagged. */
  message: number;
  tier: 'stop' | 'soften';
  category: string;
  kind?: string;
  source: 'phrase' | 'ladder';
  /** The words in the person's message that matched a phrase list (cut short). */
  matched?: string;
  /** For the self-injury ladder: its rung in words. */
  rung?: string;
  /** For the ladder: the numbers (1 = first) of the person's earlier messages that count toward the rung. */
  basedOn?: number[];
}

/** For each message the check flagged (judged with what the person had written up to then, as the page and server do), why it did. */
export function checkNotesFor(messages: { role: 'user' | 'assistant'; content: string }[]): CheckNote[] {
  const users = messages.map((m, i) => ({ m, i })).filter((x) => x.m.role === 'user');
  const out: CheckNote[] = [];
  users.forEach((u, j) => {
    const e = explainConversation(users.slice(0, j + 1).map((x) => x.m.content));
    if (!e) return;
    out.push({
      message: u.i,
      tier: e.flag.tier,
      category: e.flag.category,
      ...(e.flag.kind ? { kind: e.flag.kind } : {}),
      source: e.why.source,
      ...(e.why.matched ? { matched: e.why.matched } : {}),
      ...(e.why.rung ? { rung: e.why.rung } : {}),
      ...(e.why.basedOn ? { basedOn: e.why.basedOn } : {}),
    });
  });
  return out;
}
