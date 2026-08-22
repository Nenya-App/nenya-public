import { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrollIndicatorProps {
  /** The scrollable container element. If not provided, will use window scrolling */
  containerRef?: React.RefObject<HTMLElement>;
  /** Threshold from bottom to hide indicator (in pixels) */
  hideThreshold?: number;
  /** Custom className for styling */
  className?: string;
}

export function ScrollIndicator({ 
  containerRef, 
  hideThreshold = 50,
  className = ''
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkScrollable = () => {
      const element = containerRef?.current;
      
      if (element) {
        // Check if element has scrollable content
        const hasScroll = element.scrollHeight > element.clientHeight;
        setHasScrollableContent(hasScroll);
        
        if (hasScroll) {
          // Check if we're near the bottom
          const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
          setIsVisible(scrollBottom > hideThreshold);
        } else {
          setIsVisible(false);
        }
      } else {
        // Check window scrolling
        const hasScroll = document.documentElement.scrollHeight > window.innerHeight;
        setHasScrollableContent(hasScroll);
        
        if (hasScroll) {
          const scrollBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
          setIsVisible(scrollBottom > hideThreshold);
        } else {
          setIsVisible(false);
        }
      }
    };

    const handleScroll = () => {
      checkScrollable();
    };

    // Initial check with a slight delay to ensure content is rendered
    checkTimeoutRef.current = setTimeout(checkScrollable, 100);
    
    // Add another check after a longer delay for dynamic content
    const laterCheck = setTimeout(checkScrollable, 500);

    const element = containerRef?.current || window;
    element.addEventListener('scroll', handleScroll as any);
    window.addEventListener('resize', checkScrollable);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      clearTimeout(laterCheck);
      element.removeEventListener('scroll', handleScroll as any);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [containerRef, hideThreshold]);

  // Don't render if there's no scrollable content
  if (!hasScrollableContent) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none ${className}`}
          style={{
            // Ensure it appears above content but below modals
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-1"
          >
            <ChevronDown 
              className="w-6 h-6 text-primary drop-shadow-lg" 
              strokeWidth={2.5}
            />
            <ChevronDown 
              className="w-6 h-6 text-primary/60 drop-shadow-lg -mt-4" 
              strokeWidth={2.5}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
