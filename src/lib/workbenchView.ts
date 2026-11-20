// What the phrase workbench page does, as a plain state machine (docs/phrase-workbench-scope.md): the page only draws this and sends it actions, so the
// behaviour can be tested without a browser. Pure. The page's state lives in memory for the visit; nothing here stores or sends anything. The words announced
// to a screen reader are made here too, and they describe what was done, never a verdict.

import { MAX_SENTENCE, MAX_LEVEL, addMark, clearMarks, createWorkbench, overBy, removeMark, setDetail, setLevel, textOf, tokensOf, type Detail, type Mark, type MarkKind, type Workbench } from './phraseWorkbench.ts';
import { LEVEL_NAMES, WB, markInfo } from './workbenchCopy.ts';
import { FRAMES, frameById, slotChoices, slotsOf } from './workbenchFrames.ts';
import { defineWord, nearTo } from './wordLookup.ts';
import { NEED_CATEGORIES } from './needFamilies.ts';
import { FEELING_SIDES } from './feelingFamilies.ts';

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
  /** The need or feeling mark whose "say more" panel is open (optional, never required). */
  detailFor: number | null;
  /** Whether that panel has been opened into families and words. */
  specOpen: boolean;
  /** Need marks that have a met-to-unmet slider turned on (by the person). */
  sliderOn: Record<number, boolean>;
  /** The frame chosen on step 4, what the person put in each slot (by frame, then slot), and which slot's "take from my sentence" list is open. */
  frameId: string;
  picks: Record<string, Record<string, string>>;
  pickOpen: string | null;
  /** The word the person asked about, and whether they also asked for near words. Only ever set by a press. */
  lookup: { word: string; near: boolean } | null;
  /** What is in the "a word to look at" box. */
  wordDraft: string;
  /** The person's own switch for keeping the latest sentence and marks on this device. Off unless turned on; the page does the keeping. */
  remember: boolean;
}

export const EXAMPLE_SENTENCE = 'When you left again without telling me, I felt hurt and uneasy, because I need to be able to count on you. Would you tell me before you go?';

export const initialView = (): ViewState => ({ step: 0, draft: EXAMPLE_SENTENCE, wb: createWorkbench(EXAMPLE_SENTENCE), sel: null, more: false, announce: '', lastMark: null, detailFor: null, specOpen: false, sliderOn: {}, frameId: FRAMES[0].id, picks: {}, pickOpen: null, lookup: null, wordDraft: '', remember: false });

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
  | { t: 'clear-marks' }
  | { t: 'detail-open'; id: number }
  | { t: 'detail-close' }
  | { t: 'detail-pick'; id: number; level: 'category' | 'family' | 'word'; name: string }
  | { t: 'detail-custom'; id: number; text: string }
  | { t: 'detail-clear'; id: number }
  | { t: 'spec' }
  | { t: 'slider'; id: number; on: boolean }
  | { t: 'level'; id: number; level: number | null }
  | { t: 'frame'; id: string }
  | { t: 'pick-open'; slot: string }
  | { t: 'take'; slot: string; markId: number }
  | { t: 'slot-text'; slot: string; text: string }
  | { t: 'clear-frame' }
  | { t: 'announce'; text: string }
  | { t: 'word-draft'; text: string }
  | { t: 'look'; word: string }
  | { t: 'look-selected' }
  | { t: 'look-near' }
  | { t: 'look-close' }
  | { t: 'remember'; on: boolean }
  | { t: 'forget' }
  | { t: 'restore'; wb: Workbench };

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
      return { ...s, wb: createWorkbench(text), sel: null, step: 1, lastMark: null, detailFor: null, specOpen: false, sliderOn: {}, picks: {}, pickOpen: null, lookup: null, announce: 'Your sentence is ready to mark.' };
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
      const opens = m.kind === 'need' || m.kind === 'feeling';
      return { ...s, wb, sel: null, lastMark: m.id, detailFor: opens ? m.id : s.detailFor, specOpen: opens ? false : s.specOpen, announce: `Marked ${quoted(textOf(wb, m))} as ${markInfo(m.kind).name.toLowerCase()}.` };
    }
    case 'remove': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m) return s;
      const text = textOf(s.wb, m);
      const { [a.id]: _gone, ...sliders } = s.sliderOn;
      return { ...s, wb: removeMark(s.wb, a.id), lastMark: null, detailFor: s.detailFor === a.id ? null : s.detailFor, sliderOn: sliders, announce: `Removed the mark from ${quoted(text)}.` };
    }
    case 'clear-marks':
      return s.wb.marks.length ? { ...s, wb: clearMarks(s.wb), lastMark: null, detailFor: null, specOpen: false, sliderOn: {}, announce: 'All marks removed.' } : s;
    case 'detail-open': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m || (m.kind !== 'need' && m.kind !== 'feeling')) return s;
      return say({ ...s, detailFor: m.id, specOpen: !!(m.detail?.family || m.detail?.word) }, `Choosing more about ${quoted(textOf(s.wb, m))}. This is optional.`);
    }
    case 'detail-close':
      return s.detailFor == null ? s : say({ ...s, detailFor: null, specOpen: false }, 'Closed.');
    case 'spec':
      return s.detailFor == null ? s : say({ ...s, specOpen: !s.specOpen }, s.specOpen ? 'Showing fewer.' : 'Showing the families.');
    case 'detail-pick': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m || (m.kind !== 'need' && m.kind !== 'feeling')) return s;
      const cur = m.detail ?? {};
      const groups = browseGroups(m.kind);
      let next: Detail | null;
      if (a.level === 'category') {
        if (!groups.some((g) => g.name === a.name)) return s;
        next = cur.category === a.name ? null : { category: a.name };
      } else if (a.level === 'family') {
        const g = groups.find((x) => x.name === cur.category);
        if (!g || !g.families.some((f) => f.name === a.name)) return s;
        next = cur.family === a.name ? { category: cur.category } : { category: cur.category, family: a.name };
      } else {
        const g = groups.find((x) => x.name === cur.category);
        const f = g?.families.find((x) => x.name === cur.family);
        if (!f || !f.words.some((w) => w === a.name)) return s;
        next = cur.word === a.name ? { category: cur.category, family: cur.family } : { category: cur.category, family: cur.family, word: a.name };
      }
      if (next && cur.custom) next = { ...next, custom: cur.custom };
      const wb = setDetail(s.wb, m.id, next);
      return say({ ...s, wb, specOpen: a.level === 'category' ? false : s.specOpen }, next ? `${markInfo(m.kind).name}: ${a.name}.` : `Cleared ${a.name}.`);
    }
    case 'detail-custom': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m || (m.kind !== 'need' && m.kind !== 'feeling')) return s;
      const cur = m.detail ?? {};
      const text = a.text.trim();
      const wb = setDetail(s.wb, m.id, { ...cur, custom: text || undefined });
      return say({ ...s, wb }, text ? `Added your own word, ${text}.` : 'Removed your own word.');
    }
    case 'detail-clear': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      return m && m.detail ? say({ ...s, wb: setDetail(s.wb, m.id, null), specOpen: false }, 'Cleared.') : s;
    }
    case 'slider': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m || m.kind !== 'need') return s;
      const sliders = { ...s.sliderOn, [m.id]: a.on };
      const wb = a.on ? s.wb : setLevel(s.wb, m.id, null);
      return say({ ...s, wb, sliderOn: sliders }, a.on ? `Slider added for ${quoted(textOf(s.wb, m))}. It starts unmarked.` : `Slider removed for ${quoted(textOf(s.wb, m))}.`);
    }
    case 'level': {
      const m = s.wb.marks.find((x) => x.id === a.id);
      if (!m || m.kind !== 'need' || !s.sliderOn[m.id]) return s;
      if (a.level !== null && (!Number.isInteger(a.level) || a.level < 0 || a.level > MAX_LEVEL)) return s;
      const wb = setLevel(s.wb, m.id, a.level);
      return say({ ...s, wb }, a.level === null ? `${quoted(textOf(wb, m))}: cleared.` : `${quoted(textOf(wb, m))}: ${LEVEL_NAMES[a.level]}.`);
    }
    case 'frame':
      return frameById(a.id) ? say({ ...s, frameId: a.id, pickOpen: null }, `Frame: ${frameById(a.id)!.title}.`) : s;
    case 'pick-open': {
      const f = frameById(s.frameId)!;
      if (!slotsOf(f).some((x) => x.slot === a.slot)) return s;
      return { ...s, pickOpen: s.pickOpen === a.slot ? null : a.slot, announce: s.pickOpen === a.slot ? '' : s.announce };
    }
    case 'take': {
      const f = frameById(s.frameId)!;
      const slot = slotsOf(f).find((x) => x.slot === a.slot);
      if (!slot) return s;
      // Only a word the person marked with this slot's kind can be taken from the sentence.
      const hit = slotChoices(s.wb, slot).find((c) => c.markId === a.markId);
      if (!hit) return s;
      return say({ ...s, picks: { ...s.picks, [f.id]: { ...(s.picks[f.id] ?? {}), [slot.slot]: hit.text } }, pickOpen: null }, `Put ${quoted(hit.text)} in the slot for ${slot.label}.`);
    }
    case 'slot-text': {
      const f = frameById(s.frameId)!;
      if (!slotsOf(f).some((x) => x.slot === a.slot)) return s;
      return { ...s, picks: { ...s.picks, [f.id]: { ...(s.picks[f.id] ?? {}), [a.slot]: a.text.slice(0, 200) } } };
    }
    case 'clear-frame': {
      const { [s.frameId]: _drop, ...rest } = s.picks;
      return say({ ...s, picks: rest, pickOpen: null }, 'The slots are empty again.');
    }
    case 'announce':
      return say(s, a.text);
    case 'word-draft':
      return { ...s, wordDraft: a.text.slice(0, 40) };
    case 'look': {
      const w = a.word.trim();
      if (!w) return say(s, 'Type a word first.');
      const mean = defineWord(w);
      return say({ ...s, lookup: { word: w, near: false }, wordDraft: s.step === 4 ? s.wordDraft : w }, mean ? `${mean.word}: ${mean.def}` : `No short meaning for ${w} on our lists. Your own word is always welcome.`);
    }
    case 'look-selected': {
      const w = selText(s);
      if (!w) return s;
      const mean = defineWord(w);
      return say({ ...s, lookup: { word: w, near: false } }, mean ? `${mean.word}: ${mean.def}` : `No short meaning for ${w} on our lists. Your own word is always welcome.`);
    }
    case 'look-near': {
      if (!s.lookup) return s;
      const list = nearTo(s.lookup.word);
      return say({ ...s, lookup: { ...s.lookup, near: true } }, list.length ? `Near words for ${s.lookup.word}: ${list.join(', ')}.` : `No near words on our lists for ${s.lookup.word}.`);
    }
    case 'look-close':
      return s.lookup ? say({ ...s, lookup: null }, 'Closed.') : s;
    case 'remember':
      return say({ ...s, remember: a.on }, a.on ? WB.rememberOn : WB.forgotten);
    case 'forget':
      return say({ ...s, remember: false }, WB.forgotten);
    case 'restore': {
      const sliders: Record<number, boolean> = {};
      for (const m of a.wb.marks) if (m.kind === 'need' && typeof m.level === 'number') sliders[m.id] = true;
      return { ...s, wb: a.wb, draft: a.wb.sentence, sel: null, sliderOn: sliders, step: 1, remember: true, announce: 'Your kept sentence is back.' };
    }
    default:
      return s;
  }
}

export const SENTENCE_LIMIT = MAX_SENTENCE;

/** The two tiers a "say more" panel browses: for a need, the seven categories; for a feeling, the two sides. Each has families, each family its words. */
export interface BrowseGroup { name: string; plain: string; families: { name: string; words: string[] }[] }
export function browseGroups(kind: 'need' | 'feeling'): BrowseGroup[] {
  return kind === 'need'
    ? NEED_CATEGORIES.map((c) => ({ name: c.name, plain: c.plain, families: c.families.map((f) => ({ name: f.name, words: f.words.map((w) => w.word) })) }))
    : FEELING_SIDES.map((c) => ({ name: c.name, plain: c.plain, families: c.families.map((f) => ({ name: f.name, words: f.words.map((w) => w.word) })) }));
}

/** What the "say more" panel shows for a mark right now: the first tier always; the families once a group is chosen and the person opens it; the words once a family is chosen. */
export function browseFor(m: Mark, specOpen: boolean): { groups: BrowseGroup[]; chosen: BrowseGroup | null; families: BrowseGroup['families']; family: BrowseGroup['families'][number] | null } {
  const groups = browseGroups(m.kind === 'need' ? 'need' : 'feeling');
  const chosen = groups.find((g) => g.name === m.detail?.category) ?? null;
  const families = chosen && specOpen ? chosen.families : [];
  const family = chosen && specOpen ? chosen.families.find((f) => f.name === m.detail?.family) ?? null : null;
  return { groups, chosen, families, family };
}
