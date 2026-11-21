// Naming several needs at once (owner, 2026-11-18): when a message lists four or more needs, the site adds one plain sentence recommending one to three, because narrowing helps a person see what is really pressing for them. The same sentence
// idea closes a summary in which more than three needs came up. The words are CNVC's Feelings and Needs Inventory (src/lib/feelingsNeeds.ts, credited, unchanged); a word that is also an everyday noun (air, food, water, space...) is not counted, so an
// ordinary sentence about the weather or a meal does not look like a list of needs. Pure functions. Off in the coach unless COACH_NEED_FOCUS=on.
import { wordsOf } from './feelingsNeeds.ts';

/** Inventory need words that are also everyday nouns; they are not counted as a named need. */
const EVERYDAY = new Set(['air', 'food', 'water', 'shelter', 'touch', 'space', 'order', 'movement', 'exercise', 'movement/exercise', 'choice', 'humor', 'joy', 'beauty', 'harmony', 'hope', 'order']);

const needTerms = (): string[] => [...new Set(wordsOf('need').flatMap((w) => (w.includes('/') ? [w, ...w.split('/')] : [w])))].filter((w) => !EVERYDAY.has(w) && !/^to /.test(w));

/** The distinct need words (CNVC inventory) a text names, lower case. */
export function needsNamed(text: string): string[] {
  const t = ` ${text.toLowerCase().replace(/[^a-z/\s'-]/g, ' ')} `;
  return needTerms().filter((w) => new RegExp(`(?:^|[\\s/])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[\\s/]|$)`).test(t));
}

/** How many named needs make a list (four or more). */
export const MANY_NEEDS = 4;

/** The sentence the site adds to a reply when the person named several needs in a message. Draft wording, for the owner's approval. */
export const NEED_FOCUS_REPLY = 'You have named several needs. Choosing one to three to focus on is recommended: it helps you see what is really pressing for you.';

/** The sentence at the end of a summary in which more than three needs came up. Draft wording, for the owner's approval. */
export const NEED_FOCUS_SUMMARY = 'Several needs came up in what you wrote. Focusing on one to three is recommended: it helps you see what is really pressing for you.';

/** The reply with the focus sentence added after it, when the last message named four or more needs and the reply does not already say it. */
export function withNeedFocus(reply: string, lastUserText: string): { reply: string; changed: boolean } {
  if (needsNamed(lastUserText).length < MANY_NEEDS || /\bone to three\b/i.test(reply)) return { reply, changed: false };
  return { reply: `${reply.trim()}\n\n${NEED_FOCUS_REPLY}`, changed: true };
}

export const needFocusOn = (env: Record<string, string | undefined> = process.env): boolean => env.COACH_NEED_FOCUS === 'on';
