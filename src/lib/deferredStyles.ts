// The main page's stylesheet is not render-blocking: the build turns its <link rel="stylesheet"> into a preload
// (see deferMainStylesheet in vite.config.ts), so the page can paint its background and the loading cover at once,
// while the stylesheet downloads alongside the scripts. This applies it and reports when it is in use. The site's
// policy allows no inline scripts, so the switch is made here rather than in an onload attribute.

let ready: Promise<void> | null = null;

/** Applies the deferred stylesheets; resolves once they are in use (at once where there are none, as in development). */
export function applyDeferredStyles(): Promise<void> {
  if (ready) return ready;
  if (typeof document === 'undefined') return (ready = Promise.resolve());
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-deferred-style]'));
  ready = Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          link.addEventListener('load', () => resolve(), { once: true });
          link.addEventListener('error', () => resolve(), { once: true });
          link.removeAttribute('as');
          link.rel = 'stylesheet';
          if (link.sheet) resolve();
        }),
    ),
  ).then(() => undefined);
  return ready;
}
