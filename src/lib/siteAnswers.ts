// Server side: which replies in a conversation were written by the site as pre-written answers (src/lib/aboutNenya.ts), so a signed transcript can
// say so. Kept out of the page's bundle (the answers are large); the page keeps this on the message itself.
import { ANSWERS, aboutAnswerFor, aboutAnswerWithin, type Answer } from './aboutNenya.ts';

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pattern = (a: Answer): string => esc(a.short).replace(/\\\{(?:version|terms|model_clause|commit_url)\\\}/g, '.{0,80}');

/** Whether a reply is a site answer's short text, with its filled-in parts (version, date, model) allowed to differ. */
export function matchesAnswer(a: Answer, content: string): boolean {
  return new RegExp('^' + pattern(a) + '$').test(content);
}
/** Whether a reply BEGINS with a site answer's short text and then carries on in the model's words (answer first, then carry on). */
export function beginsWithAnswer(a: Answer, content: string): boolean {
  return new RegExp('^' + pattern(a) + '\\n\\n').test(content);
}

/** The replies the site wrote itself, whole or in their first part, by their index in the conversation, with the answer's title. */
export function answeredIn(messages: { role: 'user' | 'assistant'; content: string }[]): { index: number; title: string; partial?: boolean }[] {
  const out: { index: number; title: string; partial?: boolean }[] = [];
  messages.forEach((m, i) => {
    if (m.role !== 'assistant' || i === 0) return;
    const asked = messages[i - 1].content;
    const whole = aboutAnswerFor(asked);
    if (whole && matchesAnswer(whole, m.content)) return void out.push({ index: i, title: whole.title });
    const within = aboutAnswerWithin(asked);
    if (within && beginsWithAnswer(within, m.content)) out.push({ index: i, title: within.title, partial: true });
  });
  return out;
}

export const __answers = ANSWERS;
