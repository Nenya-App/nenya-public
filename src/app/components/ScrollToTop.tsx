import { useEffect } from 'react';

interface ScrollToTopProps {
  trigger: string | number;
}

export function ScrollToTop({ trigger }: ScrollToTopProps) {
  useEffect(() => {
    // Immediate scroll to top for instant feedback
    const scrollableElements = document.querySelectorAll('.scroll-container');
    
    if (scrollableElements.length > 0) {
      scrollableElements.forEach((element) => {
        // Instant scroll to top
        element.scrollTo({
          top: 0,
          behavior: 'instant' as ScrollBehavior
        });
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({
        top: 0,
        behavior: 'instant' as ScrollBehavior
      });
    }
    
    // Also scroll the main document
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'instant' as ScrollBehavior
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [trigger]);

  return null;
}

export function useScrollToTop(trigger: string | number) {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const scrollableElements = document.querySelectorAll('.scroll-container');
      
      if (scrollableElements.length > 0) {
        scrollableElements.forEach((element) => {
          element.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [trigger]);
}
