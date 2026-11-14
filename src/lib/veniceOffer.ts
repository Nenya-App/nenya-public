// Whether the page may offer to continue on Venice AI.
//
// After a safety stop, Nenya never points the person to Venice AI as a substitute: the right next step is the
// emergency numbers and support lines on the notice, and on Venice none of Nenya's checks run. The stop is
// remembered only in this page's memory, never in storage, so nothing on the device records that it happened;
// it lasts until the page is reloaded or closed, and covers the coach, its rest and limit screens, and the
// reflection review page.

let stoppedThisVisit = false;

/** Call when a conversation is stopped for safety. */
export function noteSafetyStop(): void {
  stoppedThisVisit = true;
}

/** False once any conversation in this visit was stopped for safety. */
export function veniceOfferAllowed(): boolean {
  return !stoppedThisVisit;
}

/** For tests only. */
export function resetVeniceOffer(): void {
  stoppedThisVisit = false;
}
