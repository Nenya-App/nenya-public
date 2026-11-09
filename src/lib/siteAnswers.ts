// Server side: which replies in a conversation were written by the site as pre-written answers (src/lib/aboutNenya.ts), so a signed transcript can
// say so. Kept out of the page's bundle (the answers are large); the page keeps this on the message itself.
import { ANSWERS, aboutAnswerFor, type Answer } from './aboutNenya.ts';

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether a reply is a site answer's short text, with its filled-in parts (version, date, model) allowed to differ. */
export function matchesAnswer(a: Answer, content: string): boolean {
  const re = new RegExp('^' + esc(a.short).replace(/\\\{(?:version|terms|model_clause|commit_url)\\\}/g, '.{0,80}') + '$');
  return re.test(content);
}

/** The replies the site itself wrote, by their index in the conversation, with the answer's title. */
export function answeredIn(messages: { role: 'user' | 'assistant'; content: string }[]): { index: number; title: string }[] {
  const out: { index: number; title: string }[] = [];
  messages.forEach((m, i) => {
    if (m.role !== 'assistant' || i === 0) return;
    const a = aboutAnswerFor(messages[i - 1].content);
    if (a && matchesAnswer(a, m.content)) out.push({ index: i, title: a.title });
  });
  return out;
}

export const __answers = ANSWERS;
