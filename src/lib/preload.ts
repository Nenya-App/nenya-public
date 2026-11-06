// Loads what the logo is drawn from before the first screen is shown, so the logo and its gem do not pop in piece by
// piece. Never rejects and never waits forever: a slow or failed download only ends the wait.
import petalsSvg from '../assets/logo/petals.svg';
import bezelSvg from '../assets/logo/bezel.svg';
import flatLogo from '../assets/nenya-logo.webp';
import smallLogo from '../assets/nenya-logo-small.webp';
import { loadGemSprite, loadImage } from './gemSprite';

/** The longest the first screen is held back for the logo's files. */
export const PRELOAD_TIMEOUT_MS = 6000;

const quietly = (p: Promise<unknown>): Promise<void> => p.then(() => undefined, () => undefined);

/** Resolves once the image is loaded and decoded, so drawing it does not stall on the first frame. */
async function ready(load: () => Promise<HTMLImageElement>): Promise<void> {
  const img = await load();
  if (typeof img.decode === 'function') await img.decode();
}

export function preloadLogoAssets(timeoutMs: number = PRELOAD_TIMEOUT_MS): Promise<void> {
  const files = Promise.all([
    quietly(ready(loadGemSprite)),
    quietly(ready(() => loadImage(petalsSvg))),
    quietly(ready(() => loadImage(bezelSvg))),
    quietly(ready(() => loadImage(flatLogo))),
    quietly(ready(() => loadImage(smallLogo))),
    quietly(typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()),
  ]).then(() => undefined);
  return Promise.race([files, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}
