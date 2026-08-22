import { motion } from 'motion/react';
import { useIsMobile } from './useIsMobile';
import type { ReactNode } from 'react';

interface MobileOptimizedMotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MobileOptimizedMotion({ children, className, delay = 0 }: MobileOptimizedMotionProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}
