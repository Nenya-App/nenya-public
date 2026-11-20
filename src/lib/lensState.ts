// The state model for the lens tray (docs/lens-rewrite-scope.md 3a and 3b; owner approved 2026-11-17). Pure functions, no screen and no storage: the tray, the lens pages
// and the saved draft will all read these, so the rules live in one place and are tested.
//
// A lens is in one of three states: not opened, examined (opened, nothing added) or included (added to the report). Nothing is in the report until it is added; a lens put
// down without adding is "examined, not included". Lenses are picked up in any order, any number, and any lens can be added again (update) or removed.

import { unwrapEssence } from './flavour.ts';

// The tray replaces the pick-several-then-go-in-order flow only when VITE_LENS_TRAY=on (off by default).
export const lensTrayOn = (): boolean => import.meta.env?.VITE_LENS_TRAY === 'on';

// Every lens the code knows, in tray order. The first six are always there; Nature (seventh) and Story (eighth) appear only when their own switch is on (below). Nothing else counts the lenses:
// use activeLenses() for what a visitor can open, never a number.
export const LENS_ORDER = ['sight', 'sound', 'touch', 'essence', 'movement', 'insight', 'nature', 'story'] as const;
export type LensId = (typeof LENS_ORDER)[number];

// Nature, the seventh lens, and Story, the eighth (owner, 2026-11-19), each behind its own switch; off by default (docs/lens-story-nature.md).
export const natureLensOn = (): boolean => import.meta.env?.VITE_LENS_NATURE === 'on' && lensTrayOn();
export const storyLensOn = (): boolean => import.meta.env?.VITE_LENS_STORY === 'on' && lensTrayOn();

/** The lenses a visitor can open now, in tray order. Nature and Story need the tray as well as their own switch (the older choose-several flow never lists them). `env` is for tests. */
export function activeLenses(env: Record<string, unknown> | undefined = import.meta.env): LensId[] {
  const tray = env?.VITE_LENS_TRAY === 'on';
  return LENS_ORDER.filter((l) => (l === 'nature' ? tray && env?.VITE_LENS_NATURE === 'on' : l === 'story' ? tray && env?.VITE_LENS_STORY === 'on' : true));
}

const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
/** How many lenses there are, in words ("six", "seven", "eight"), for copy that would otherwise say a number. */
export const lensCountWord = (lenses: readonly LensId[] = activeLenses()): string => COUNT_WORDS[lenses.length] ?? String(lenses.length);
export type LensStatus = 'not-opened' | 'examined' | 'included';

export interface LensAdded { gateway: LensId; data: unknown } // the saved-data key keeps its old name so a saved draft still reads
export interface LensState { added: LensAdded[]; examined: LensId[] }

export const emptyLensState = (): LensState => ({ added: [], examined: [] });
const byOrder = (a: LensId, b: LensId): number => LENS_ORDER.indexOf(a) - LENS_ORDER.indexOf(b);
const isLens = (x: unknown): x is LensId => typeof x === 'string' && (LENS_ORDER as readonly string[]).includes(x);
const LENS_TITLES: Record<LensId, string> = { sight: 'Sight', sound: 'Sound', touch: 'Touch', essence: 'Essence', movement: 'Movement', insight: 'Pattern', nature: 'Nature', story: 'Story' };

export function lensStatus(s: LensState, lens: LensId): LensStatus {
  if (s.added.some((a) => a.gateway === lens)) return 'included';
  return s.examined.includes(lens) ? 'examined' : 'not-opened';
}

/** Picking a lens up: it becomes examined unless it is already included. Idempotent. */
export function openLens(s: LensState, lens: LensId): LensState {
  return lensStatus(s, lens) === 'not-opened' ? { ...s, examined: [...s.examined, lens].sort(byOrder) } : s;
}

/** Add this to my report. The first time it adds; later it updates in place. Either way it is no longer merely examined. */
export function addLens(s: LensState, lens: LensId, data: unknown): LensState {
  const has = s.added.some((a) => a.gateway === lens);
  const added = has ? s.added.map((a) => (a.gateway === lens ? { gateway: lens, data } : a)) : [...s.added, { gateway: lens, data }].sort((a, b) => byOrder(a.gateway, b.gateway));
  return { added, examined: s.examined.filter((l) => l !== lens) };
}

/** Remove from my report: the data is dropped and the lens goes back to examined (it was opened, it is just not included). */
export function removeLens(s: LensState, lens: LensId): LensState {
  if (!s.added.some((a) => a.gateway === lens)) return s;
  return { added: s.added.filter((a) => a.gateway !== lens), examined: [...s.examined, lens].sort(byOrder) };
}

/** Put this down: the same as opening and leaving it. An included lens stays included; anything typed but not added is the page's to keep for the visit, not stored here. */
export const putDownLens = openLens;

export interface ReportShape { included: LensId[]; examinedNotIncluded: LensId[]; line: string }

/** What the report says about the lenses: the included ones, and one plain line naming the examined ones, or no line if there are none. */
export function reportShape(s: LensState): ReportShape {
  const included = s.added.map((a) => a.gateway).sort(byOrder), examinedNotIncluded = [...s.examined].sort(byOrder);
  const name = (l: LensId) => LENS_TITLES[l];
  return { included, examinedNotIncluded, line: examinedNotIncluded.length ? `Examined, not included: ${examinedNotIncluded.map(name).join(', ')}.` : '' };
}

/** The soft limit on choosing several things on one card (every lens: fewer can be more helpful). */
export const SOFT_LIMIT = 3;
export const needsFewerWarning = (alreadyChosen: number, adding = 1): boolean => alreadyChosen + adding > SOFT_LIMIT;

// ── the saved draft: version 2 stores which lenses were examined; version 1 (selectedGateways + data) still reads.
export interface SavedPayloadV2 { v: 2; examined: LensId[]; gatewayData: LensAdded[]; bodyMapData: unknown; interfaceColors: { color1: string; color2: string } }

/** Reads a saved draft of either version into the version 2 shape, or null if it is not one. A v1 lens that was chosen but never finished is simply not opened. A lens whose switch is off here is left out (a draft made where Nature or Story is on still reads where they are off, without them). */
export function readSavedDraft(p: unknown, active: readonly LensId[] = activeLenses()): SavedPayloadV2 | null {
  const o = (p && typeof p === 'object' ? p : null) as Record<string, any> | null;
  if (!o || !Array.isArray(o.gatewayData) || (o.v !== 1 && o.v !== 2)) return null;
  const data: LensAdded[] = o.gatewayData.filter((g: any) => g && isLens(g.gateway) && active.includes(g.gateway)).map((g: any) => ({ gateway: g.gateway as LensId, data: g.gateway === 'essence' ? unwrapEssence(g.data) : g.data })).sort((a: LensAdded, b: LensAdded) => byOrder(a.gateway, b.gateway));
  const have = new Set(data.map((d) => d.gateway));
  const examined: LensId[] = o.v === 2 && Array.isArray(o.examined) ? (o.examined as unknown[]).filter(isLens).filter((l) => active.includes(l) && !have.has(l)).sort(byOrder) : [];
  return { v: 2, examined, gatewayData: data, bodyMapData: o.bodyMapData, interfaceColors: o.interfaceColors };
}
