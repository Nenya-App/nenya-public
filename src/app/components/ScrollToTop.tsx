import { useEffect } from 'react';

interface ScrollToTopProps {
  trigger: string | number;
}

function resetScroll() {
  const scrollableElements = document.querySelectorAll('.scroll-container');

  if (scrollableElements.length > 0) {
    scrollableElements.forEach((element) => {
      element.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  document.documentElement.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  document.body.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

export function ScrollToTop({ trigger }: ScrollToTopProps) {
  useEffect(() => {
    // Reset immediately, then again as things settle: lazy chunks mount late
    // after a hard refresh, and Firefox reapplies saved inner-container
    // scroll positions after load, both of which land after the first reset.
    resetScroll();
    const timers = [120, 400, 1000].map((ms) => setTimeout(resetScroll, ms));
    return () => timers.forEach(clearTimeout);
  }, [trigger]);

  return null;
}
