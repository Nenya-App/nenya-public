import { useSyncExternalStore } from 'react';
import { addCustomLens, removeCustomLens, type CustomLens, type CustomLensInput } from '../../lib/customLens';

// Custom lenses live here, in memory, for this visit only: a module variable, not storage. They are not saved to the device (src/lib/deviceMemory.ts: visitor-written text is never kept),
// not added to the report and not sent anywhere. Closing or reloading the tab forgets them. (Keeping them would need the owner's privacy wording: docs/eight-sided-gem-scope.md step 18.)
let lenses: CustomLens[] = [];
let opened: string[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useCustomLenses() {
  const list = useSyncExternalStore(subscribe, () => lenses, () => lenses);
  const openedIds = useSyncExternalStore(subscribe, () => opened, () => opened);
  return {
    lenses: list,
    isOpened: (id: string) => openedIds.includes(id),
    add: (input: CustomLensInput) => { const r = addCustomLens(lenses, input); if (!r.errors) { lenses = r.list; emit(); } return { errors: r.errors, added: r.errors ? null : r.list[r.list.length - 1] }; },
    remove: (id: string) => { lenses = removeCustomLens(lenses, id); opened = opened.filter((o) => o !== id); emit(); },
    open: (id: string) => { if (!opened.includes(id)) { opened = [...opened, id]; emit(); } },
  };
}
