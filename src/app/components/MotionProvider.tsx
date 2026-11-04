import type { ReactNode } from 'react';
import { LazyMotion } from 'motion/react';

// Animated elements use the light `m` components (from 'motion/react-m'). The animation engine
// itself loads separately, right after first paint, so it is not part of the first download.
// Until it arrives, elements show their starting state; then they animate as before.
// `strict` makes the full `motion` components throw, so one cannot be added by accident and quietly
// pull the whole engine back into the main bundle.
const loadFeatures = () => import('../../lib/motionFeatures').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
