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

export function ScrollToTop({ trigger }: ScrollToTopProps) {
  useEffect(() => {
    // Reset immediately for instant feedback...
    resetScroll();

    // ...and again shortly after, in case late-loading images, fonts, or
    // entrance animations on the incoming screen shift its layout height
    // enough to drag the scroll position back down after the first reset.
    const timer = setTimeout(resetScroll, 120);
    return () => clearTimeout(timer);
  }, [trigger]);

  return null;
}
