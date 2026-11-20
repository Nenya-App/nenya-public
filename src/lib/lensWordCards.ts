// Nature (the seventh lens) and Story (the eighth), owner decision 2026-11-19; design notes and the choices to adjust: docs/lens-story-nature.md.
//
// Both are built the same way: a run of cards, one activity each. An activity card has a word bar (find a word, near words, Add) over the lists for that activity, and a description box that fills in
// from the words chosen until the person types in it. A last card shows the whole in a few words and adds it to the report. Everything is optional; nothing is a picture, so there is no text twin to keep
// (every word list and every box is already text). The definitions, the cleaning of saved data and the report lines are pure, so they are tested (tests/lens-word-cards.test.mts).
import type { SenseCategory } from './senseWords.ts';
import { composeDescription } from './describeChoices.ts';

export interface WordCardDef {
  id: string;
  /** The heading of the card. */
  title: string;
  /** One plain line under the heading saying what to do. */
  ask: string;
  /** The word lists this card offers (src/lib/senseWords.ts). */
  category: SenseCategory;
  /** The name of the card in the report. */
  reportLabel: string;
  /** What the description box asks for. */
  boxLabel: string;
}

export interface WordCardLens {
  id: 'nature' | 'story';
  /** What a visitor reads. */
  name: string;
  cards: WordCardDef[];
  /** The last card: the whole in a few words (it fills in from every choice), and one optional line about what the person would like. */
  summary: { title: string; label: string; wishLabel: string; reportLabel: string; wishReportLabel: string };
  /** How the summary box is composed from the words chosen, card by card. */
  compose: (picked: string[][]) => string;
}

const lower = (w: string): string => w.trim().toLowerCase();
const list = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export const NATURE: WordCardLens = {
  id: 'nature',
  name: 'Nature',
  cards: [
    { id: 'plantsAnimals', title: 'Plants and animals', ask: 'If how you feel were a living thing, which plant or animal would it be?', category: 'plantsAnimals', reportLabel: 'Plants and animals', boxLabel: 'Describe it with plants and animals (optional)' },
    { id: 'weather', title: 'Weather and climate', ask: 'If it were a kind of weather, or a season, what would it be?', category: 'weather', reportLabel: 'Weather and climate', boxLabel: 'Describe it as weather (optional)' },
    { id: 'landscape', title: 'Landscapes', ask: 'If it were a place outdoors, what would that place be?', category: 'landscape', reportLabel: 'Landscapes', boxLabel: 'Describe it as a landscape (optional)' },
    { id: 'properties', title: 'Physical properties', ask: 'If it were a material, what would it be like to see, touch and lift? Words such as stiff, translucent, brittle or flowing.', category: 'materialProperties', reportLabel: 'Physical properties', boxLabel: 'Describe the material (optional)' },
  ],
  summary: { title: 'Add Nature to your report?', label: 'Nature, in a few words (you can change the words):', wishLabel: 'What would you like it to be like? (optional)', reportLabel: 'In a few words', wishReportLabel: 'What I would like it to be like' },
  compose: (picked) => composeDescription(picked.flat()),
};

export const STORY: WordCardLens = {
  id: 'story',
  name: 'Story',
  cards: [
    { id: 'setting', title: 'Where and when', ask: 'Think of a moment you could tell as a story. Where is it, and when?', category: 'storySetting', reportLabel: 'Where and when', boxLabel: 'Describe the place and the time (optional)' },
    { id: 'cast', title: 'Who is in it', ask: 'Who is in the moment? It can be just you.', category: 'storyCast', reportLabel: 'Who is in it', boxLabel: 'Say who is there (optional)' },
    { id: 'change', title: 'What changes', ask: 'What happens, or what turns? Nothing changing is an answer too.', category: 'storyChange', reportLabel: 'What changes', boxLabel: 'Say what changes (optional)' },
    { id: 'ending', title: 'How it ends', ask: 'How does it end, or how might it end? An unfinished story is fine.', category: 'storyEnding', reportLabel: 'How it ends', boxLabel: 'Say how it ends (optional)' },
  ],
  summary: { title: 'Add Story to your report?', label: 'The story, in a few words (you can change the words):', wishLabel: 'How would you like it to end? (optional)', reportLabel: 'The story', wishReportLabel: 'How I would like it to end' },
  // "Where and when: a kitchen and late at night. Who is in it: just me. What changes: a door opens. How it ends: quiet."
  compose: (picked) => {
    const parts = STORY.cards.map((c, i) => ((picked[i] ?? []).length ? `${c.title}: ${list(picked[i].map(lower))}.` : ''));
    return parts.filter(Boolean).join(' ');
  },
};

export const WORD_CARD_LENSES = { nature: NATURE, story: STORY } as const;

/** What a word-card lens saves when it is added. Words by card id; the person's own text by card id; the summary; one optional line about what they would like. */
export interface WordCardsData { v: 1; words: Record<string, string[]>; texts: Record<string, string>; summary: string; wish: string }

const str = (v: unknown, n: number): string => (typeof v === 'string' ? v.slice(0, n) : '');

/** Reads saved data back into its shape, or null if it is not one. Unknown cards are dropped; lengths are capped. */
export function cleanWordCards(def: WordCardLens, x: unknown): WordCardsData | null {
  const o = (x && typeof x === 'object' ? x : null) as Record<string, any> | null;
  if (!o || o.v !== 1) return null;
  const words: Record<string, string[]> = {}, texts: Record<string, string> = {};
  for (const c of def.cards) {
    const w = o.words?.[c.id];
    words[c.id] = Array.isArray(w) ? w.filter((t: unknown): t is string => typeof t === 'string' && t.trim() !== '').map((t) => t.slice(0, 60)).slice(0, 12) : [];
    texts[c.id] = str(o.texts?.[c.id], 400);
  }
  return { v: 1, words, texts, summary: str(o.summary, 800), wish: str(o.wish, 400) };
}

/** The lines of the report for either lens (words only, as the report is only words). Empty when nothing was said. */
export function wordCardLines(def: WordCardLens, data: unknown): string[] {
  const d = cleanWordCards(def, data);
  if (!d) return [];
  const out: string[] = [];
  for (const c of def.cards) {
    const w = d.words[c.id], t = d.texts[c.id].trim();
    if (!w.length && !t) continue;
    out.push(`${c.reportLabel}: ${w.length ? w.join(', ') : 'described in words only'}`);
    if (t) out.push(`  Description: ${t}`);
  }
  if (d.summary.trim()) out.push(`${def.summary.reportLabel}: ${d.summary.trim()}`);
  if (d.wish.trim()) out.push(`  ${def.summary.wishReportLabel}: ${d.wish.trim()}`);
  return out;
}
