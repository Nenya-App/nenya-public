import { useEffect, useState } from 'react';

// Shown over the first screen until the logo's files are ready, then faded away. It uses CSS only (no animation
// library), because it sits in front of the whole site and must never get stuck waiting for a download.
export const VEIL_MIN_MS = 500; // long enough that it never flashes
export const VEIL_FADE_MS = 500;

interface LoadingVeilProps {
  /** True once the logo's files are loaded. */
  ready: boolean;
  /** Called once the veil has faded out and been removed. */
  onDone: () => void;
}

export function LoadingVeil({ ready, onDone }: LoadingVeilProps) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), VEIL_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    setFading(true);
    const t = setTimeout(onDone, VEIL_FADE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, minElapsed]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-background"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${VEIL_FADE_MS}ms ease-out`, pointerEvents: fading ? 'none' : 'auto' }}
    >
      <style>{`@keyframes veil-breathe{0%,100%{transform:scale(.6);opacity:.55}50%{transform:scale(1);opacity:1}}@media (prefers-reduced-motion:reduce){.veil-orb{animation:none!important}}`}</style>
      <div
        className="veil-orb size-16 rounded-full"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #F3DCC4, #DDB88C 55%, rgba(221,184,140,.25))',
          boxShadow: '0 0 24px rgba(221,184,140,.45)',
          animation: 'veil-breathe 4s ease-in-out infinite',
        }}
      />
      <p className="text-sm text-muted-foreground">Preparing your space…</p>
    </div>
  );
}
