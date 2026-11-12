// Whether the breathing animation and accessibility panel (the "breathing popout") is open. One shared setting, so the small logo in the top bar, the big logo on the welcome page and the logos on the
// other pages can all open the same panel without passing a function through every page. Nothing is stored: it is only ever open or closed for the moment.
import { useSyncExternalStore } from 'react';

let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const setBreathingPanel = (value: boolean): void => {
  if (open === value) return;
  open = value;
  emit();
};
export const toggleBreathingPanel = (): void => setBreathingPanel(!open);
export const isBreathingPanelOpen = (): boolean => open;
export const useBreathingPanel = (): boolean =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );
