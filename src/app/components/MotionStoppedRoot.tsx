import { useEffect } from 'react';
import { useMotionStopped } from '../../lib/deviceMemory';

// While "Stop motion" is on, the page root carries data-page-motion-stopped, and src/styles/globals.css holds the page's decorative CSS animations still
// (the counter's number pulses and its filling circle, the "Enter" and "more below" pulses, the quick-navigation glimmer, the background's slow glow).
// Nothing is changed or remembered by this; the setting itself stays in deviceMemory. docs/logo-look.md, "Stop motion".
export function MotionStoppedRoot() {
  const stopped = useMotionStopped();
  useEffect(() => {
    const root = document.documentElement;
    if (stopped) root.setAttribute('data-page-motion-stopped', 'true');
    else root.removeAttribute('data-page-motion-stopped');
    return () => root.removeAttribute('data-page-motion-stopped');
  }, [stopped]);
  return null;
}
