import { useEffect, useState } from 'react';

// Covers the first screen until the logo's files are ready, then fades away. Most visits are ready within a moment, so
// at first it is only the plain background: nothing half-drawn shows, and no loading screen flashes. Only if the wait
// runs past VEIL_SHOW_MS does it show its message. CSS only (no animation library), because it sits in front of the
// whole site and must never get stuck waiting for a download.
export const VEIL_SHOW_MS = 400; // show the message only when the wait is long enough to notice
export const VEIL_FADE_MS = 300;

interface LoadingVeilProps {
  /** True once the logo's files are loaded. */
  ready: boolean;
  /** Called once the veil has faded out and been removed. */
  onDone: () => void;
}

export function LoadingVeil({ ready, onDone }: LoadingVeilProps) {
  const [slow, setSlow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setSlow(true), VEIL_SHOW_MS);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setFading(true);
    const t = setTimeout(onDone, VEIL_FADE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div
      role="status"
      aria-live="polite"
      // Styled inline, not with the stylesheet's classes: it is on screen before the page's stylesheet has loaded.
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background, #1A1512)',
        opacity: fading ? 0 : 1, transition: `opacity ${VEIL_FADE_MS}ms ease-out`, pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <p
        style={{
          margin: 0, fontFamily: "'Cinzel', serif", fontSize: '1rem', letterSpacing: '0.04em',
          color: 'var(--muted-foreground, #D4C8BD)', opacity: slow ? 1 : 0, transition: 'opacity 400ms ease-in',
        }}
        aria-hidden={!slow}
      >
        Welcome to Nenya.
      </p>
    </div>
  );
}
