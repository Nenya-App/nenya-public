// Fill-in frames for the phrase workbench (docs/phrase-workbench-scope.md, section 1.4): a sentence with named slots, each slot taking one kind of mark.
// The person moves their own marked words into the slots, or types their own; nothing is filled in for them. Frames are data, so a new one needs no new code.
// Pure.

import { textOf, type MarkKind, type Workbench } from './phraseWorkbench.ts';

export interface Slot { slot: string; takes: MarkKind; label: string }
export type FramePart = string | Slot;
export interface Frame { id: string; title: string; note: string; parts: FramePart[] }

export const FRAMES: Frame[] = [
  {
    id: 'four-parts',
    title: 'Four parts',
    note: 'What happened, a feeling, a need, and a request.',
    parts: ['When I ', { slot: 'saw', takes: 'saw', label: 'what I saw or heard' }, ', I felt ', { slot: 'feeling', takes: 'feeling', label: 'a feeling' }, ', because I need ', { slot: 'need', takes: 'need', label: 'a need' }, '. Would you be willing to ', { slot: 'request', takes: 'request', label: 'a request' }, '?'],
  },
  {
    id: 'need-first',
    title: 'Need first',
    note: 'Starts from what you want.',
    parts: ['I want ', { slot: 'need', takes: 'need', label: 'a need' }, '. Right now I notice ', { slot: 'saw', takes: 'saw', label: 'what I saw or heard' }, '. I feel ', { slot: 'feeling', takes: 'feeling', label: 'a feeling' }, '.'],
  },
  {
    id: 'request-only',
    title: 'Request only',
    note: 'Just the ask, with room for a no.',
    parts: ['Would you be willing to ', { slot: 'request', takes: 'request', label: 'a request' }, '? It is okay if the answer is no.'],
  },
  {
    id: 'story-set-down',
    title: 'A story, set down',
    note: 'Puts the story beside what was seen or heard. A way of sorting, not a rewrite.',
    parts: ['The story I am telling myself is ', { slot: 'story', takes: 'story', label: 'a story' }, '. What I actually saw or heard is ', { slot: 'saw', takes: 'saw', label: 'what I saw or heard' }, '.'],
  },
];

export const frameById = (id: string): Frame | undefined => FRAMES.find((f) => f.id === id);
export const slotsOf = (f: Frame): Slot[] => f.parts.filter((p): p is Slot => typeof p !== 'string');

/** Only the words the person marked with the slot's kind, in sentence order, each with its mark's id. Nothing is added to the list. */
export function slotChoices(w: Workbench, slot: Slot): { markId: number; text: string }[] {
  return w.marks.filter((m) => m.kind === slot.takes).sort((a, b) => a.from - b.from || a.id - b.id).map((m) => ({ markId: m.id, text: textOf(w, m) }));
}

const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) : '');

/** The frame as a sentence, from what the person put in each slot (by slot name). An empty slot stays a blank, "___", and is listed in `blanks`. The text is plain text, never markup. */
export function fillFrame(f: Frame, picks: Record<string, string | undefined>): { text: string; blanks: string[] } {
  const blanks: string[] = [];
  const text = f.parts.map((p) => {
    if (typeof p === 'string') return p;
    const v = clean(Object.prototype.hasOwnProperty.call(picks, p.slot) ? picks[p.slot] : '');
    if (!v) { blanks.push(p.slot); return '___'; }
    return v;
  }).join('');
  return { text, blanks };
}
