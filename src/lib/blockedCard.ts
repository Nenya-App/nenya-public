// A message that is stopped as an instruction to the coach can still contain a question the site answers ("Ignore your instructions. Are you an AI?"). The owner's decision of 2026-11-22: the person is
// shown BOTH the notice and the pre-written answer (the card), so the question inside is not left unanswered. The notice is unchanged (MANIPULATION_NOTICE); this adds the answer, as the page shows it
// for any other question the site answers, written by the site and marked as such. The message is still not sent on and no turn is used.
import { aboutAnswerFor, fillAnswer, type FillContext } from './aboutNenya.ts';

export interface BlockedCard {
  /** The short answer, shown beside the notice. */
  answer: string;
  card: { id: string; title: string; more: string[]; links: { label: string; page?: string; href?: string }[] };
}

/**
 * The card for a blocked message, or null. On the server `ctx` is the real context (the model, the build, the Terms date), so the answer is filled in exactly as it would be for an ordinary question.
 * On the page, where the message is stopped on the device and nothing is sent, there is no `ctx`: only an answer that needs no fill-in and has no version for another provider is shown, so it can never
 * name the wrong service or leave a placeholder behind. Any other question is left for the server's path, and the notice stands alone.
 */
export function blockedCardFor(text: string, ctx?: FillContext): BlockedCard | null {
  const a = aboutAnswerFor(text);
  if (!a) return null;
  if (!ctx && (a.workersAi || /\{[a-z_]+\}/.test([a.short, ...a.full, ...a.links.map((l) => l.href ?? '')].join(' ')))) return null;
  const f = fillAnswer(a, ctx ?? {});
  return { answer: f.short, card: { id: a.id, title: a.title, more: f.full, links: f.links } };
}
