// The phrase workbench's pure core (docs/phrase-workbench-scope.md, section 3): a sentence, the marks a person puts on its words, and the helpers around them.
// Pure on purpose: no DOM, no network, no timers, no randomness, no clock. Every change returns a new state and never throws. The person marks everything
// themselves; nothing here suggests a mark, a word or a level, and there is nothing that scores, totals or ranks (tests/phrase-workbench.test.mts checks that
// no such function is exported and that a stored record holds no time or counter). Reused by the page and, by design, by any flow that works on marked phrases.

import { LEVEL_NAMES, markInfo, type MarkKind } from './workbenchCopy.ts';
import type { MarkInfo } from './workbenchCopy.ts';

export type { MarkKind } from './workbenchCopy.ts';

export const MAX_SENTENCE = 400;
export const MAX_MARKS = 60;
export const MAX_LEVEL = LEVEL_NAMES.length - 1;
const KINDS: MarkKind[] = ['saw', 'feeling', 'need', 'request', 'story', 'thought', 'strategy', 'demand'];

export interface Token { id: number; text: string; start: number; end: number; markable: boolean }

/** What the person chose for a mark, in their own terms. All parts optional; `custom` is a word of their own. */
export interface Detail { category?: string; family?: string; word?: string; custom?: string }

export interface Mark {
  id: number;
  kind: MarkKind;
  /** First and last token (inclusive, both markable); a phrase is a range. */
  from: number;
  to: number;
  detail?: Detail;
  /** Met to unmet, need marks only: 0 (Not at all) to 6 (Fully). Absent means not marked yet. */
  level?: number;
}

export interface Workbench { sentence: string; marks: Mark[]; next: number }

const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu;

/** Words and punctuation, with their places in the sentence. Punctuation is not markable. Never throws. */
export function tokenize(sentence: string): Token[] {
  const out: Token[] = [];
  if (typeof sentence !== 'string') return out;
  let i = 0;
  for (const m of sentence.matchAll(WORD)) {
    out.push({ id: i++, text: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, markable: /[\p{L}\p{N}]/u.test(m[0]) });
  }
  return out;
}

/** How many characters over the limit a sentence is (0 if it fits). */
export const overBy = (sentence: string): number => Math.max(0, (typeof sentence === 'string' ? sentence.length : 0) - MAX_SENTENCE);

/** A new workbench for a sentence. A sentence over the limit is cut at the limit (the page says how far over it was before this). */
export function createWorkbench(sentence: string): Workbench {
  const s = typeof sentence === 'string' ? sentence.slice(0, MAX_SENTENCE) : '';
  return { sentence: s, marks: [], next: 1 };
}

export const tokensOf = (w: Workbench): Token[] => tokenize(w.sentence);

const validRange = (toks: Token[], from: unknown, to: unknown): [number, number] | null => {
  if (!Number.isInteger(from) || !Number.isInteger(to)) return null;
  const a = Math.min(from as number, to as number), b = Math.max(from as number, to as number);
  if (a < 0 || b >= toks.length || !toks[a].markable || !toks[b].markable) return null;
  return [a, b];
};

const cleanStr = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  return t || undefined;
};
export function cleanDetail(d: unknown): Detail | undefined {
  if (!d || typeof d !== 'object') return undefined;
  const o = d as Record<string, unknown>;
  const out: Detail = {};
  for (const k of ['category', 'family', 'word', 'custom'] as const) { const v = cleanStr(o[k]); if (v) out[k] = v; }
  return Object.keys(out).length ? out : undefined;
}

/** Add a mark on a word or a phrase. A range that does not fit the sentence, or a kind that does not exist, changes nothing. The same kind twice, or different kinds on the same words, are allowed. */
export function addMark(w: Workbench, m: { kind: MarkKind; from: number; to: number; detail?: Detail }): Workbench {
  if (!KINDS.includes(m?.kind) || w.marks.length >= MAX_MARKS) return w;
  const r = validRange(tokensOf(w), m.from, m.to);
  if (!r) return w;
  const mark: Mark = { id: w.next, kind: m.kind, from: r[0], to: r[1] };
  const d = cleanDetail(m.detail);
  if (d) mark.detail = d;
  return { ...w, marks: [...w.marks, mark], next: w.next + 1 };
}

export const removeMark = (w: Workbench, id: number): Workbench => (w.marks.some((m) => m.id === id) ? { ...w, marks: w.marks.filter((m) => m.id !== id) } : w);
export const clearMarks = (w: Workbench): Workbench => (w.marks.length ? { ...w, marks: [] } : w);

const mapMark = (w: Workbench, id: number, f: (m: Mark) => Mark): Workbench => (w.marks.some((m) => m.id === id) ? { ...w, marks: w.marks.map((m) => (m.id === id ? f(m) : m)) } : w);

/** Set or clear (null) what the person chose for a mark. */
export const setDetail = (w: Workbench, id: number, detail: Detail | null): Workbench =>
  mapMark(w, id, (m) => {
    const { detail: _drop, ...rest } = m;
    const d = detail ? cleanDetail(detail) : undefined;
    return d ? { ...rest, detail: d } : rest;
  });

/** Set the met-to-unmet level of a need mark, 0 to 6, or clear it with null. Other kinds, and numbers outside 0 to 6, change nothing. */
export function setLevel(w: Workbench, id: number, level: number | null): Workbench {
  const m = w.marks.find((x) => x.id === id);
  if (!m || m.kind !== 'need') return w;
  if (level === null) { const { level: _drop, ...rest } = m; return mapMark(w, id, () => rest); }
  if (!Number.isInteger(level) || level < 0 || level > MAX_LEVEL) return w;
  return mapMark(w, id, (x) => ({ ...x, level }));
}

export const marksFor = (w: Workbench, tokenId: number): Mark[] => w.marks.filter((m) => tokenId >= m.from && tokenId <= m.to);

/** The words under a mark, exactly as typed. */
export function textOf(w: Workbench, m: Mark): string {
  const toks = tokensOf(w);
  const a = toks[m.from], b = toks[m.to];
  return a && b ? w.sentence.slice(a.start, b.end) : '';
}

export const markInfoOf = (m: Mark): MarkInfo => markInfo(m.kind);

/** A mark in the person's own terms: "A need: trust (Connection)", "A need: Connection" or just "A feeling". */
export function markLabel(m: Mark): string {
  const d = m.detail;
  const main = [d?.word, d?.custom].filter(Boolean).join(', ');
  const ctx = d?.family || d?.category;
  const name = markInfo(m.kind).name;
  if (main) return `${name}: ${main}${ctx ? ` (${ctx})` : ''}`;
  return ctx ? `${name}: ${ctx}` : name;
}

/** The step's name for a level, or "Not marked yet". */
export const levelName = (level: number | null | undefined): string => (typeof level === 'number' && LEVEL_NAMES[level] ? LEVEL_NAMES[level] : 'Not marked yet');
/** What a screen reader says for the slider's value. The position is spoken, never shown. */
export const levelSpoken = (level: number | null | undefined): string => (typeof level === 'number' && LEVEL_NAMES[level] ? `${LEVEL_NAMES[level]}, step ${level + 1} of ${LEVEL_NAMES.length}` : 'Not marked yet');

/** The sentence with the mark's name in brackets after each marked part, for reading aloud or copying as plain text. Marks keep their order in the sentence. */
export function annotated(w: Workbench): string {
  const toks = tokensOf(w);
  const inserts = w.marks
    .map((m) => ({ at: toks[m.to]?.end ?? -1, id: m.id, label: `[${markInfo(m.kind).name.toLowerCase()}]` }))
    .filter((x) => x.at >= 0)
    .sort((a, b) => b.at - a.at || b.id - a.id);
  let s = w.sentence;
  for (const x of inserts) s = `${s.slice(0, x.at)} ${x.label}${s.slice(x.at)}`;
  return s;
}

// ---- Keeping and restoring (only if the person turns on "Remember on this device"). No time, no counter, no history.

export const STORE_VERSION = 1;
export const MAX_STORED_CHARS = 8000;

/** The record to keep: the sentence, the marks and their levels. Nothing else. Null if it would be too large. */
export function serialize(w: Workbench): string | null {
  const rec = { v: STORE_VERSION, sentence: w.sentence, marks: w.marks.map((m) => ({ id: m.id, kind: m.kind, from: m.from, to: m.to, ...(m.detail ? { detail: m.detail } : {}), ...(typeof m.level === 'number' ? { level: m.level } : {}) })) };
  const s = JSON.stringify(rec);
  return s.length <= MAX_STORED_CHARS ? s : null;
}

/** Restore a kept record, dropping anything that does not fit (unknown keys, marks outside the sentence, levels outside 0 to 6). Null if it is not a record at all. */
export function parse(raw: unknown): Workbench | null {
  if (typeof raw !== 'string' || raw.length > MAX_STORED_CHARS) return null;
  let j: unknown;
  try { j = JSON.parse(raw); } catch { return null; }
  if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
  const o = j as Record<string, unknown>;
  if (o.v !== STORE_VERSION || typeof o.sentence !== 'string') return null;
  let w = createWorkbench(o.sentence);
  const toks = tokensOf(w);
  const list = Array.isArray(o.marks) ? o.marks.slice(0, MAX_MARKS) : [];
  for (const x of list) {
    if (!x || typeof x !== 'object') continue;
    const r = x as Record<string, unknown>;
    if (typeof r.kind !== 'string' || !KINDS.includes(r.kind as MarkKind)) continue;
    const range = validRange(toks, r.from, r.to);
    if (!range) continue;
    w = addMark(w, { kind: r.kind as MarkKind, from: range[0], to: range[1], detail: cleanDetail(r.detail) });
    if (typeof r.level === 'number') w = setLevel(w, w.next - 1, r.level);
  }
  return w;
}
