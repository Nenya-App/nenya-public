// Counts from the browser: plain daily totals of how the site is used (see docs/site-metrics-scope.md).
// Nothing identifies a person: the event is just a name from a fixed list, sent with no cookie, no stored id and nothing
// else. Counting starts only once the visitor has agreed to the terms, and never happens if the browser's Global Privacy
// Control signal is on. A failed send is ignored.

const ENDPOINT = '/api/count';
let enabled = false;

/** The visitor has agreed to the terms (now or on an earlier visit they chose to remember): counting may begin. */
export function enableUsageCounts(): void {
  enabled = true;
}

const privacySignalOn = (): boolean => {
  try {
    return (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
};

function send(events: string[]): void {
  const body = JSON.stringify({ events });
  try {
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
  } catch {
    /* fall through to fetch */
  }
  try {
    void fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch {
    /* not counted */
  }
}

/** Counts one or more events together (for example the terms being accepted and the rhythm chosen). */
export function countEvents(events: string[]): void {
  if (!enabled || events.length === 0 || typeof window === 'undefined' || privacySignalOn()) return;
  send(events);
}

export const countEvent = (event: string): void => countEvents([event]);

/** A screen was shown. Called when the screen changes, not on every redraw. */
export const countPageView = (screen: string): void => countEvent(`page.view.${screen}`);
