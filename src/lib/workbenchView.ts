// What the phrase workbench page does, as a plain state machine (docs/phrase-workbench-scope.md): the page only draws this and sends it actions, so the
// behaviour can be tested without a browser. Pure. The page's state lives in memory for the visit; nothing here stores or sends anything. The words announced
// to a screen reader are made here too, and they describe what was done, never a verdict.

import { MAX_SENTENCE, addMark, clearMarks, createWorkbench, overBy, removeMark, textOf, tokensOf, type MarkKind, type Workbench } from './phraseWorkbench.ts';
import { WB, markInfo } from './workbenchCopy.ts';

export type StepIndex = 0 | 1 | 2 | 3 | 4;

export interface ViewState {
  step: StepIndex;
  /** What is in the sentence box (not yet turned into chips). */
  draft: string;
  wb: Workbench;
  /** The selected words: token ids, inclusive, or null. */
  sel: { a: number; b: number } | null;
  /** Whether the four marks that are not shown first are shown. */
  more: boolean;
  /** The last thing announced to a screen reader (a polite live region). */
  announce: string;
  /** The mark just made, so the page can put focus back sensibly. */
  lastMark: number | null;
}

export const EXAMPLE_SENTENCE = 'When you left again without telling me, I felt hurt and uneasy, because I need to be able to count on you. Would you tell me before you go?';

export const initialView = (): ViewState => ({ step: 0, draft: EXAMPLE_SENTENCE, wb: createWorkbench(EXAMPLE_SENTENCE), sel: null, more: false, announce: '', lastMark: null });

export type Action =
  | { t: 'draft'; text: string }
  | { t: 'make' }
  | { t: 'step'; step: number }
  | { t: 'select'; id: number }
  | { t: 'extend' }
  | { t: 'unselect' }
  | { t: 'select-all' }
  | { t: 'more' }
  | { t: 'mark'; kind: MarkKind }
  | { t: 'remove'; id: number }
  | { t: 'clear-marks' };

const say = (s: ViewState, announce: string): ViewState => ({ ...s, announce });

const selText = (s: ViewState): string => {
  if (!s.sel) return '';
  const toks = tokensOf(s.wb);
  const a = toks[s.sel.a], b = toks[s.sel.b];
  return a && b ? s.wb.sentence.slice(a.start, b.end) : '';
};
export { selText };

const quoted = (t: string) => `“${t}”`;

export function reduce(s: ViewState, a: Action): ViewState {
  switch (a.t) {
    case 'draft':
      return { ...s, draft: a.text };
    case 'make': {
      const text = s.draft.trim();
      const over = overBy(text);
      if (over > 0) return say(s, WB.tooLong(over));
      if (!text) return say(s, 'There is no sentence yet.');
      return { ...s, wb: createWorkbench(text), sel: null, step: 1, lastMark: null, announce: 'Your sentence is ready to mark.' };
    }
    case 'step':
      return a.step >= 0 && a.step <= 4 && Number.isInteger(a.step) ? { ...s, step: a.step as StepIndex, announce: `Step ${a.step + 1}: ${WB.steps[a.step]}.` } : s;
    case 'select': {
      const t = tokensOf(s.wb)[a.id];
      if (!t || !t.markable) return s;
      if (s.sel && s.sel.a === a.id && s.sel.b === a.id) return say({ ...s, sel: null }, `Unselected ${quoted(t.text)}.`);
      const next = { ...s, sel: { a: a.id, b: a.id } };
      return say(next, `Selected ${quoted(t.text)}.`);
    }
    case 'extend': {
      if (!s.sel) return s;
      const toks = tokensOf(s.wb);
      let n = s.sel.b + 1;
      while (n < toks.length && !toks[n].markable) n++;
      if (n >= toks.length) return say(s, 'That is the last word.');
      const next = { ...s, sel: { a: s.sel.a, b: n } };
      return say(next, `Selected ${quoted(selText(next))}.`);
    }
    case 'unselect':
      return s.sel ? say({ ...s, sel: null }, 'Unselected.') : s;
    case 'select-all': {
      const toks = tokensOf(s.wb);
      const first = toks.find((t) => t.markable), last = [...toks].reverse().find((t) => t.markable);
      if (!first || !last) return s;
      const next = { ...s, sel: { a: first.id, b: last.id } };
      return say(next, 'Selected the whole sentence.');
    }
    case 'more':
      return say({ ...s, more: !s.more }, s.more ? 'Showing fewer marks.' : 'Showing all eight marks.');
    case 'mark': {
      if (!s.sel) return s;
      const wb = addMark(s.wb, { kind: a.kind, from: s.sel.a, to: s.sel.b });
      if (wb === s.wb) return say(s, 'That could not be marked.');
      const m = wb.marks[wb.marks.length - 1];
      return { ...s, wb, sel: null, lastMark: m.id, announce: `Marked ${quoted(textOf(wb, m))} as ${markInfo(m.kind).name.toLowerCase()}.` };
    }
    case 'remove': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m) return s;
      const text = textOf(s.wb, m);
      return { ...s, wb: removeMark(s.wb, a.id), lastMark: null, announce: `Removed the mark from ${quoted(text)}.` };
    }
    case 'clear-marks':
      return s.wb.marks.length ? { ...s, wb: clearMarks(s.wb), lastMark: null, announce: 'All marks removed.' } : s;
    default:
      return s;
  }
}

export const SENTENCE_LIMIT = MAX_SENTENCE;
