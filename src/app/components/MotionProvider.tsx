import type { ReactNode } from 'react';
import { LazyMotion } from 'motion/react';

// Animated elements use the light `m` components (from 'motion/react-m'). The animation engine
// itself loads separately, right after first paint, so it is not part of the first download.
// Until it arrives, animated elements show their starting state, which for many is invisible. So nothing
// that must be visible or usable at once (the first-visit panel, anything gating the site) may use it:
// tests/critical-ui.test.mts enforces that.
// `strict` makes the full `motion` components throw, so one cannot be added by accident and quietly
// pull the whole engine back into the main bundle.
const loadFeatures = () => import('../../lib/motionFeatures').then((mod) => mod.default);

/** Starts the download at once, before React has rendered, so the engine arrives as early as it can. */
export function preloadMotion() {
  void import('../../lib/motionFeatures');
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
