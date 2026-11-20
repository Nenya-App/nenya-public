// A zoomed-in page gets a lighter logo (docs/eight-sided-gem-scope.md, Part 4). When someone pinch-zooms on an iPhone, Safari
// re-draws effects and layers at the zoomed scale, and a logo with large glows, blends and many animated layers can use enough
// memory to make the page reload. While the page is zoomed past LITE_ABOVE the logo drops its glows, halos and blends and the gem
// stops drawing new frames (it keeps its last one); about a second after the zoom is back near 1 everything returns. Zoom itself is
// never limited. Pure state step first (tested), then the hook.
import { useEffect, useState } from 'react';

/** Zoom factors: lite above 1.25, back to normal below 1.05 for LITE_HOLD_MS (so a pinch in progress does not flicker). */
export const LITE_ABOVE = 1.25;
export const NORMAL_BELOW = 1.05;
export const LITE_HOLD_MS = 1000;

export interface ZoomState { lite: boolean; /** When the scale first dropped below NORMAL_BELOW while lite (ms), or 0. */ calmSince: number }
export const initialZoomState: ZoomState = { lite: false, calmSince: 0 };

/** The next state for the page's current zoom `scale` at time `now` (ms). */
export function stepZoom(prev: ZoomState, scale: number, now: number): ZoomState {
  if (!Number.isFinite(scale)) return prev;
  if (scale > LITE_ABOVE) return { lite: true, calmSince: 0 };
  if (!prev.lite) return prev;
  if (scale >= NORMAL_BELOW) return { lite: true, calmSince: 0 };
  const since = prev.calmSince || now;
  return now - since >= LITE_HOLD_MS ? initialZoomState : { lite: true, calmSince: since };
}

/** True while the page is pinch-zoomed in. Always false where the browser has no visual viewport (and on the server). */
export function useZoomedIn(): boolean {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    let state = initialZoomState;
    let timer = 0;
    const update = () => {
      window.clearTimeout(timer);
      state = stepZoom(state, vv.scale, Date.now());
      setLite(state.lite);
      // While waiting out the hold, look again once it is over.
      if (state.lite && state.calmSince) timer = window.setTimeout(update, LITE_HOLD_MS - (Date.now() - state.calmSince) + 20);
    };
    vv.addEventListener('resize', update);
    update();
    return () => {
      window.clearTimeout(timer);
      vv.removeEventListener('resize', update);
    };
  }, []);
  return lite;
}
