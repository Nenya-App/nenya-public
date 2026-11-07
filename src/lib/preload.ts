// Loads what the logo is drawn from before the first screen is shown, so the logo and its gem do not pop in piece by
// piece. Never rejects and never waits forever: a slow or failed download only ends the wait.
import petalsSvg from '../assets/logo/petals.svg';
import bezelSvg from '../assets/logo/bezel.svg';
import flatLogo from '../assets/nenya-logo.webp';
import smallLogo from '../assets/nenya-logo-small.webp';
import { gemFirstDraw, loadGemSprite, loadImage } from './gemSprite';

/** The longest the first screen is held back for the logo's files. */
export const PRELOAD_TIMEOUT_MS = 6000;

const quietly = (p: Promise<unknown>): Promise<void> => p.then(() => undefined, () => undefined);

/** Resolves once the image is loaded and decoded, so drawing it does not stall on the first frame. */
async function ready(load: () => Promise<HTMLImageElement>): Promise<void> {
  const img = await load();
  if (typeof img.decode === 'function') await img.decode();
}

let downloads: Promise<void> | null = null;

/**
 * Starts the downloads (the gem sprite first: it is by far the largest file, 0.8 MB and 2016 px square, and it is the
 * logo's top layer). Safe to call more than once; called at startup, before the page is even drawn.
 */
export function startLogoDownloads(): Promise<void> {
  if (!downloads) {
    // The gem is requested first and on its own, so the small files cannot queue ahead of it.
    const gem = quietly(ready(loadGemSprite));
    downloads = Promise.all([
      gem,
      quietly(ready(() => loadImage(petalsSvg))),
      quietly(ready(() => loadImage(bezelSvg))),
      quietly(ready(() => loadImage(flatLogo))),
      quietly(ready(() => loadImage(smallLogo))),
      quietly(typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()),
    ]).then(() => undefined);
  }
  return downloads;
}

/**
 * Resolves when the logo's files are ready and, if `gem` is true (the welcome screen with the gem showing), when the
 * gem has also drawn its first frame. Never longer than `timeoutMs`.
 */
export function preloadLogoAssets(timeoutMs: number = PRELOAD_TIMEOUT_MS, gem = false): Promise<void> {
  const parts: Promise<unknown>[] = [startLogoDownloads()];
  if (gem) parts.push(gemFirstDraw);
  const all = Promise.all(parts).then(() => undefined);
  return Promise.race([all, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}
