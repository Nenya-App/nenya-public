// The live gem's look on the site: the one place to tune it. Everything here is optional; anything left out uses the
// defaults in src/lib/gemRenderer.ts (DEFAULT_LIGHT), src/lib/gemCut.ts (DEFAULT_CUT) and src/lib/kaleidoscope.ts.
// The /bench page shows the same settings as sliders: tune there, then copy the values you like into here.
//
// Only browsers that can draw the live gem (WebGL2) use these. Elsewhere the pre-rendered sprite is shown, which has no
// kaleidoscope.

import type { LiveGemLook } from '../app/components/SpectralGem';

export const SITE_LIVE_GEM: LiveGemLook = {
  // The stone's light. For example, to brighten it: { exposure: 1.8, lightGain: 2.6, sky: 0.2 }.
  light: {},
  // The kaleidoscope: the inside of the stone slowly re-cuts itself. On by default. Setting `on: false` pauses it where
  // it is; it does not snap back to the plain cut.
  kaleidoscope: { on: true, depth: 0.6, periodS: 90, turn: 1 },
};

/**
 * How much of the orbs' colour wheel the 2D finish lays over the live gem (0 to 1). The live gem already brings the
 * orbs' colours up through the stone, so it needs much less than the sprite (0.9).
 */
export const SITE_LIVE_FIELD_ALPHA = 0.25;
