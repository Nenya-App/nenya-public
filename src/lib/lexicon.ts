// A matcher for a private list of slurs and dehumanizing language (the list itself is NEVER in this repository: it is read from private storage at run time).
// It detects; it does not decide what to do. It follows the specification in the handoff for the list (2026-11-10):
//  - the text is lower-cased (NFKC) and a second copy has look-alike symbols and digits folded (0 o, 1 i, 3 e, 4 a, 5 s, 7 t, @ a, ! i, $ s) and accents removed;
//  - every canonical term and every variant is a key; keys are matched longest first (most words, then most letters), the first hit consumes its span;
//  - hyphens and spaces inside a key and in the text are the same thing;
//  - "token" and "phrase" keys need a non-word character (or the edge) on both sides, so a slur inside an ordinary word does not match;
//  - "token_context" keys match only when one of their cue words is within a few words; no cue, no match, ever;
//  - "compound" keys match when followed by more letters or a hyphen; "suffix" keys only at the end of a word with at least two letters before.
// Asterisk-masked spellings (n*gger) are matched only if the list names them as variants.

export type MatchMode = 'token' | 'phrase' | 'token_context' | 'compound' | 'suffix';
export interface LexRow {
  term: string;
  variants: string[];
  category: string;
  target: string;
  severity: 1 | 2 | 3;
  matchMode: MatchMode;
  contextNote: string;
  /** For token_context rows: words that must be near. A row with no cues never matches. */
  cues: string[];
  /** How many words either side a cue may be (default 8). A judgment word has to be right beside the person it is aimed at. */
  window?: number;
  language: string;
  source: string;
  confidence: string;
}
export interface Hit {
  term: string;
  category: string;
  target: string;
  severity: 1 | 2 | 3;
  start: number;
  end: number;
  contextNote: string;
  confidence: string;
}

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '!': 'i', $: 's' };
const WINDOW = 8;

/** Lower case, NFKC, one space between words, and hyphens read as spaces. Length-preserving where it matters is handled by the span mapping below. */
const prep = (s: string): string => s.normalize('NFKC').toLowerCase();
const fold = (s: string): string => [...s].map((c) => LEET[c] ?? c).join('');
const stripAccents = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
const keyOf = (s: string): string => stripAccents(prep(s)).replace(/[-\s]+/g, ' ').trim();

interface Compiled { row: LexRow; key: string; words: number; mode: MatchMode }
export interface Matcher { keys: Map<string, Compiled[]>; ordered: Compiled[]; maxWords: number; byMode: Record<MatchMode, Compiled[]> }

export function compile(rows: LexRow[]): Matcher {
  const keys = new Map<string, Compiled[]>();
  const all: Compiled[] = [];
  for (const row of rows) {
    for (const raw of [row.term, ...row.variants]) {
      let k = keyOf(raw.replace(/^-+/, ''));
      if (k.length < 2) continue;
      const mode: MatchMode = row.matchMode === 'suffix' || raw.startsWith('-') ? 'suffix' : row.matchMode;
      const c: Compiled = { row, key: k, words: k.split(' ').length, mode };
      all.push(c);
      if (mode === 'token' || mode === 'phrase' || mode === 'token_context') keys.set(k, [...(keys.get(k) ?? []), c]);
    }
  }
  const ordered = [...all].sort((a, b) => b.words - a.words || b.key.length - a.key.length);
  const byMode = { token: [], phrase: [], token_context: [], compound: [], suffix: [] } as Record<MatchMode, Compiled[]>;
  for (const c of ordered) byMode[c.mode].push(c);
  return { keys, ordered, maxWords: Math.max(1, ...all.map((c) => c.words)), byMode };
}

interface Tok { text: string; folded: string; start: number; end: number }
function tokenize(text: string): Tok[] {
  const toks: Tok[] = [];
  // Letters, digits and the look-alike symbols belong to a word; spaces and hyphens separate words (hyphen and space are the same thing).
  // A look-alike symbol belongs to a word only between letters or digits (b@d, bl0rv!sh), so "word!" ends at the word.
  const re = /[\p{L}\p{N}_]+(?:[@$!'’][\p{L}\p{N}_]+)*/gu;
  for (const m of text.matchAll(re)) {
    const raw = prep(m[0]).replace(/[’']/g, '');
    toks.push({ text: raw, folded: stripAccents(fold(raw)), start: m.index!, end: m.index! + m[0].length });
  }
  return toks;
}

/** All hits in `text`, longest first, no overlaps. A hit's span is in the original text. */
export function match(text: string, m: Matcher): Hit[] {
  const toks = tokenize(text);
  const used = new Array(toks.length).fill(false);
  const hits: Hit[] = [];
  const cueNear = (i: number, j: number, cues: string[], window = WINDOW): boolean => {
    if (!cues.length) return false;
    const set = new Set(cues.map((c) => keyOf(c)));
    for (let k = Math.max(0, i - window); k <= Math.min(toks.length - 1, j + window); k++) {
      if (k >= i && k <= j) continue;
      if (set.has(toks[k].text) || set.has(toks[k].folded)) return true;
    }
    return false;
  };
  const emit = (c: Compiled, start: number, end: number): void => {
    hits.push({ term: c.row.term, category: c.row.category, target: c.row.target, severity: c.row.severity, start, end, contextNote: c.row.contextNote, confidence: c.row.confidence });
  };
  // whole-word and phrase keys, longest first at each position
  for (let i = 0; i < toks.length; i++) {
    if (used[i]) continue;
    for (let n = Math.min(m.maxWords, toks.length - i); n >= 1; n--) {
      const slice = toks.slice(i, i + n);
      const candidates = [slice.map((t) => stripAccents(t.text)).join(' '), slice.map((t) => t.folded).join(' ')];
      let matched = false;
      for (const cand of candidates) {
        const list = m.keys.get(cand);
        if (!list) continue;
        const ok = list.filter((c) => c.mode !== 'token_context' || cueNear(i, i + n - 1, c.row.cues, c.row.window));
        if (!ok.length) continue;
        for (const c of ok) emit(c, slice[0].start, slice[n - 1].end);
        for (let k = i; k < i + n; k++) used[k] = true;
        matched = true;
        break;
      }
      if (matched) break;
    }
  }
  // compound and suffix keys work inside a single word
  for (let i = 0; i < toks.length; i++) {
    if (used[i]) continue;
    const t = toks[i];
    for (const c of m.byMode.compound) {
      if (c.words !== 1) continue;
      for (const w of [stripAccents(t.text), t.folded]) {
        const at = w.indexOf(c.key);
        if (at >= 0 && (at + c.key.length < w.length || text[t.end] === '-')) { emit(c, t.start + at, t.start + at + c.key.length); used[i] = true; break; }
      }
      if (used[i]) break;
    }
    if (used[i]) continue;
    for (const c of m.byMode.suffix) {
      for (const w of [stripAccents(t.text), t.folded]) {
        if (w.endsWith(c.key) && w.length - c.key.length >= 2) { emit(c, t.end - c.key.length, t.end); used[i] = true; break; }
      }
      if (used[i]) break;
    }
  }
  // collapse repeated hits on the same span and term; order by position
  const seen = new Set<string>();
  return hits.filter((h) => { const k = `${h.start}|${h.end}|${h.term}|${h.target}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.start - b.start);
}

/** The strongest severity among hits (0 for none). */
export const strongest = (hits: Hit[]): number => hits.reduce((s, h) => Math.max(s, h.severity), 0);
