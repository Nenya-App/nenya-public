// The palettes a visitor made and kept in the Sight lens (up to two; src/lib/colorSchemes.ts), as the logo's colour settings need them.
// They are held in memory only, for the visit: a colour a visitor picks is never written to the device (see the list at the top of
// src/lib/deviceMemory.ts), and this does not change that. The Sight page tells this store whenever its kept palettes change, and the page
// that holds the finished report tells it when that report changes or goes. Nothing here is stored, sent or given an identifier.
import { useSyncExternalStore } from 'react';
import { keptPalettes, type KeptPalette } from './logoColours.ts';

const EMPTY: KeptPalette[] = [];
let kept: KeptPalette[] = EMPTY;
let signature = '[]';
const listeners = new Set<() => void>();

/** The palettes kept now (the same array until they change). */
export const getKeptPalettes = (): KeptPalette[] => kept;

/** Tell the store what the Sight lens holds now (anything unusable is dropped). A change nobody could see does not wake the listeners. */
export function setKeptPalettes(raw: unknown): void {
  const next = keptPalettes(raw);
  const sig = JSON.stringify(next);
  if (sig === signature) return;
  signature = sig;
  kept = next.length ? next : EMPTY;
  listeners.forEach((l) => l());
}

export const clearKeptPalettes = (): void => setKeptPalettes([]);

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useKeptPalettes = (): KeptPalette[] => useSyncExternalStore(subscribe, getKeptPalettes, () => EMPTY);
