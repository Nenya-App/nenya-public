import { useEffect, useRef } from 'react';
import { Button } from './ui/button';

interface TourOfferProps {
  onAccept: () => void;
  onDecline: () => void;
}

// Offered once, right after the terms are accepted. CSS only, like the panel before it.
export function TourOffer({ onAccept, onDecline }: TourOfferProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDecline();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDecline]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tour-offer-title">
      <div className="onb-fade-in absolute inset-0 bg-background/75 backdrop-blur-[2px]" onClick={onDecline} />
      <div className="onb-card-in relative w-full max-w-md space-y-4 rounded-2xl border border-nenya-accent-warm/30 bg-background/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <h2 id="tour-offer-title" ref={headingRef} tabIndex={-1} className="text-xl outline-none sm:text-2xl">
          Would you like a quick tour?
        </h2>
        <p className="text-sm text-muted-foreground">
          About a minute. It shows you the breathing logo and counter, the controls along the top (including the accessibility
          settings), and where the sensory reflection begins. You can skip it now and replay it from the help button any time.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onDecline} className="min-h-[44px]">
            Skip for now
          </Button>
          <Button onClick={onAccept} className="min-h-[44px] bg-nenya-accent-warm text-primary-foreground hover:bg-nenya-gold-light">
            Show me around
          </Button>
        </div>
      </div>
    </div>
  );
}
