// Leaving at once, and making sure the Back button cannot return to Nenya afterwards.
//
// Leaving: everything saved for the session and on this device is erased, then the tab's current page is replaced (not
// added to) with a neutral page, so the Nenya page the person was on is gone from this tab's history.
//
// Back: earlier Nenya pages in the same tab (for example the welcome page, if the person opened the coach from it) are
// still in the history, and the browser would show them again. So the exit leaves a note in this tab's session storage
// (it lives only in this tab and goes when the tab closes). Any Nenya page that is reached by Back or Forward, or restored
// from the browser's page cache, finds the note and leaves again at once, before anything is drawn. A page opened any
// other way (typing the address, a link, reload) is a fresh visit: it clears the note and carries on.
import { wipeDevice } from './deviceMemory.ts';

export const EXIT_URL = 'https://en.wikipedia.org/wiki/Rings_of_Power#Nenya';
export const EXIT_NOTE_KEY = 'nenya.exited';

/** True when this page was reached by Back or Forward (or restored from the page cache) after an exit. */
export function shouldLeaveAgain(navigationType: string | undefined, note: string | null, restoredFromCache = false): boolean {
  if (!note) return false;
  return restoredFromCache || navigationType === 'back_forward';
}

/** True when the note is left over from an earlier visit and this page is a fresh arrival. */
export function noteIsStale(navigationType: string | undefined, note: string | null, restoredFromCache = false): boolean {
  return !!note && !restoredFromCache && navigationType !== 'back_forward';
}

const readNote = (): string | null => {
  try {
    return sessionStorage.getItem(EXIT_NOTE_KEY);
  } catch {
    return null;
  }
};

const navigationType = (): string | undefined => {
  try {
    return (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;
  } catch {
    return undefined;
  }
};

/** Erase what was saved, leave a note for the Back guard, and replace this page with the neutral one. */
export function leaveNow(onLeaving?: () => void): void {
  onLeaving?.();
  try {
    localStorage.removeItem('nenya_session_data');
    sessionStorage.clear();
  } catch {
    // Nothing reachable to clear.
  }
  wipeDevice({ keepOwner: false });
  try {
    sessionStorage.setItem(EXIT_NOTE_KEY, '1');
  } catch {
    // Without session storage the Back guard cannot work; the exit itself still does.
  }
  window.location.replace(EXIT_URL);
}

/**
 * Call once, first thing, in the entry file of every visitor page. Leaves again if the page was reached by Back after an
 * exit; otherwise clears a stale note. Also covers pages restored from the browser's page cache.
 */
export function guardBackAfterExit(): void {
  if (typeof window === 'undefined') return;
  const note = readNote();
  const type = navigationType();
  if (shouldLeaveAgain(type, note)) {
    window.location.replace(EXIT_URL);
    return;
  }
  if (noteIsStale(type, note)) {
    try {
      sessionStorage.removeItem(EXIT_NOTE_KEY);
    } catch {
      // Left as it is.
    }
  }
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && readNote()) window.location.replace(EXIT_URL);
  });
}
