import { useEffect, useState } from 'react';

/** Whether the device asks for reduced motion now (re-read when the setting changes). False before the first effect, so server and browser agree on the first render. */
export function useReducedMotionNow(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (!q) return;
    const update = () => setReduced(q.matches);
    update();
    q.addEventListener?.('change', update);
    return () => q.removeEventListener?.('change', update);
  }, []);
  return reduced;
}
