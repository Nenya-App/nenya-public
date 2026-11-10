// Short educational cards the coach can offer when someone's words dehumanize people or are aimed at the AI (docs/learning-cards-scope.md). Each card is written
// from named sources, paraphrased, and approved one by one by the owner: only cards marked `status: approved` ever reach the site (scripts/build-learning-cards.mts).
// This file is the shape, the reading of a card's Markdown, and the rules a card must meet. The approved cards themselves are in learningCardsData.ts.
import { LEARNING_CARDS_DATA } from './learningCardsData.ts';

export interface LearningCard {
  id: string;
  series: 'propaganda' | 'dehumanization' | 'connection' | 'words-aimed-at-ai' | 'nvc-ideas' | 'history' | 'thinking';
  order: number;
  title: string;
  /** One line shown first when the card discusses cruelty, or ''. */
  contentNote: string;
  key: string;
  body: string;
  tryIt: string;
  /** The credit line, in words. */
  where: string;
  /** "Read more", up to 250 words, or ''. */
  more: string;
  /** The one address the card links to, or ''. */
  url: string;
  license: string;
}

export const SERIES = ['propaganda', 'dehumanization', 'connection', 'words-aimed-at-ai', 'nvc-ideas', 'history', 'thinking'] as const;
const BANNED = ['journey', 'unlock', 'transform', 'hack', 'optimize', 'heal', 'fix', 'wellness', 'anonymous', 'secure'];
const words = (s: string): number => (s.match(/[A-Za-z']+/g) ?? []).length;

/** Reads one card from its Markdown (front matter, then "## Section" blocks). Returns null if it is not in the expected shape. */
export function parseCard(md: string): { card: LearningCard; status: string; problems: string[] } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(md);
  if (!m) return null;
  const fm = m[1];
  const get = (k: string): string => (new RegExp(`^${k}: (.*)$`, 'm').exec(fm)?.[1] ?? '').trim();
  const sections: Record<string, string> = {};
  let cur = '';
  for (const line of m[2].split(/\r?\n/)) {
    const h = /^## (.+)$/.exec(line);
    if (h) { cur = h[1].trim(); sections[cur] = ''; } else if (cur) sections[cur] += (sections[cur] ? '\n' : '') + line;
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].trim();
  const urls = [...fm.matchAll(/^ {4}url: (https?:\/\/\S+)$/gm)].map((x) => x[1]);
  const licenses = [...fm.matchAll(/^ {4}license: (.*)$/gm)].map((x) => x[1]);
  const note = get('content-note');
  const series = get('series') as LearningCard['series'];
  const card: LearningCard = {
    id: get('id'), series, order: Number(get('order')) || 0, title: get('title'), contentNote: note === 'none' ? '' : note.replace(/^Content note:\s*/i, 'Content note: '),
    key: sections['Key idea'] ?? '', body: sections['In plain words'] ?? '', tryIt: sections['Something to try'] ?? '', where: sections['Where this comes from'] ?? '',
    more: sections['Read more'] ?? '', url: urls[0] ?? '', license: licenses[0] ?? '',
  };
  return { card, status: get('status'), problems: cardProblems(card) };
}

/** Everything a card must satisfy before it can ship. Returns the reasons it cannot (empty if it can). */
export function cardProblems(c: LearningCard): string[] {
  const p: string[] = [];
  if (!/^[a-z]+-\d\d$/.test(c.id)) p.push('id');
  if (!(SERIES as readonly string[]).includes(c.series)) p.push('series');
  if (!c.title || c.title.length > 60) p.push('title is empty or over 60 characters');
  if ((c.key.match(/[.?!](\s|$)/g) ?? []).length !== 1) p.push('the key idea must be one sentence');
  const n = words(c.body);
  if (n < 40 || n > 80) p.push(`the body is ${n} words (40 to 80)`);
  if (c.more && words(c.more) > 250) p.push('"read more" is over 250 words');
  if (!c.tryIt) p.push('missing "something to try"');
  if (!c.where) p.push('missing the credit line');
  if (!c.url) p.push('no address for the source (a card is not shown without one)');
  const all = [c.title, c.key, c.body, c.tryIt, c.where, c.more, c.contentNote].join('\n');
  for (const b of BANNED) if (new RegExp(`\\b${b}\\w*`, 'i').test(all)) p.push(`uses the word "${b}"`);
  if (/[—–]/.test(all)) p.push('uses a dash');
  if (/!/.test(all)) p.push('uses an exclamation mark');
  if (/\byou (should|must)\b/i.test(all)) p.push('tells the reader what they should or must do');
  if (/https?:\/\//.test([c.title, c.key, c.body, c.tryIt, c.more].join('\n'))) p.push('a link in the text (the address belongs in the front matter)');
  if (/\n>/.test('\n' + c.body)) p.push('a block quote');
  return p;
}

/** The approved cards, in series and order. */
export const LEARNING_CARDS: LearningCard[] = [...LEARNING_CARDS_DATA].sort((a, b) => SERIES.indexOf(a.series) - SERIES.indexOf(b.series) || a.order - b.order);
let override: LearningCard[] | null = null;
/** The cards in use: the approved ones, or a test's own. */
export const allCards = (): LearningCard[] => override ?? LEARNING_CARDS;
export const __setCardsForTests = (c: LearningCard[] | null): void => { override = c; };
export const cardById = (id: string, list: LearningCard[] = allCards()): LearningCard | undefined => list.find((c) => c.id === id);
/** Other approved cards in the same series, after this one first, for "read another". */
export function othersInSeries(id: string, list: LearningCard[] = allCards()): LearningCard[] {
  const c = cardById(id, list);
  if (!c) return [];
  const same = list.filter((x) => x.series === c.series && x.id !== id);
  return [...same.filter((x) => x.order > c.order), ...same.filter((x) => x.order < c.order)];
}
