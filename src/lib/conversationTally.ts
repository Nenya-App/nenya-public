// A running tally of the feelings and needs a person has named so far in a conversation (docs/need-tally-scope.md, option A, owner 2026-11-18). It is made from the person's OWN words, matched against CNVC's Feelings and Needs Inventory
// (src/lib/feelingsNeeds.ts, credited, unchanged), and it is page state only: computed on demand from the messages the page already holds, never stored, never sent, gone with the tab. The page shows it as an option ("what has come up so far"),
// the picking call is given it as a hint, and four or more different needs make the recommendation of one to three (src/lib/needFocus.ts).
// A word that is also an everyday word (cold, lost, open, safe, air, water...) is not counted: this is a mirror of the person's words, so a false hit would put words in their mouth. Pure functions.
import { wordsOf } from './feelingsNeeds.ts';
import { MANY_NEEDS, needsNamed } from './needFocus.ts';

export interface TallyEntry { word: string; /** In how many of the person's messages it appears. */ count: number; /** The first message (0-based) it appears in. */ first: number }
export interface Tally { feelings: TallyEntry[]; needs: TallyEntry[] }

const EVERYDAY_FEELINGS = new Set(['beat', 'cold', 'lost', 'removed', 'torn', 'open', 'safe', 'secure', 'moved', 'touched', 'involved', 'alert', 'aroused', 'wonder', 'dread', 'grief', 'hate', 'dislike', 'sensitive', 'reserved', 'guarded', 'still', 'quiet', 'content', 'warm', 'comfortable', 'friendly', 'trusting', 'mellow', 'centered', 'tender', 'fragile', 'pain', 'animated', 'vibrant', 'expectant', 'loving', 'distant', 'dazed']);

const escape = (w: string): string => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const feelingTerms = (): string[] => wordsOf('feeling').filter((w) => !EVERYDAY_FEELINGS.has(w));

/** The feelings and needs named in the person's messages so far, most often named first (then by first appearance), at most eight of each. */
export function tallyOf(userTexts: readonly string[]): Tally {
  const fterms = feelingTerms();
  const build = (matchIn: (text: string) => string[]): TallyEntry[] => {
    const seen = new Map<string, TallyEntry>();
    userTexts.forEach((t, i) => {
      for (const w of new Set(matchIn(t))) {
        const e = seen.get(w);
        if (e) e.count++;
        else seen.set(w, { word: w, count: 1, first: i });
      }
    });
    return [...seen.values()].sort((a, b) => b.count - a.count || a.first - b.first).slice(0, 8);
  };
  const feelingsIn = (text: string): string[] => {
    const t = ` ${text.toLowerCase().replace(/[^a-z\s'-]/g, ' ')} `;
    return fterms.filter((w) => new RegExp(`(?:^|\\s)${escape(w)}(?:\\s|$)`).test(t));
  };
  return { feelings: build(feelingsIn), needs: build(needsNamed) };
}

/** True when four or more different needs have come up across the conversation (the recommendation of one to three). */
export const manyNeedsSoFar = (t: Tally): boolean => t.needs.length >= MANY_NEEDS;

/** The tally as one plain line for a model hint or a screen reader: "Feelings: tired, anxious. Needs: rest, respect." */
export function tallyLine(t: Tally): string {
  const part = (label: string, es: TallyEntry[]): string => (es.length ? `${label}: ${es.map((e) => e.word).join(', ')}.` : '');
  return [part('Feelings', t.feelings), part('Needs', t.needs)].filter(Boolean).join(' ');
}
