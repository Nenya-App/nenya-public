import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export type TutorialStepId = 'logo' | 'counter' | 'tools' | 'accessibility' | 'reflection';

interface TutorialStep {
  id: TutorialStepId;
  targetIds: string[];
  title: string;
  body: string;
}

// The order: the logo and the counter, then the controls along the top (ending on the menu, where the accessibility
// settings are), then the sensory reflection. Closing the tour, by finishing or skipping, returns to the logo.
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'logo',
    targetIds: ['tutorial-logo'],
    title: 'Your breathing companion',
    body: 'This logo breathes slowly with you. Breathe in as it brightens and out as it softens. The ring of colours around it turns once every two minutes, and the gem at its centre takes on the colour of your breath.',
  },
  {
    id: 'counter',
    targetIds: ['tutorial-breathing-counter'],
    title: 'Your breath counter',
    body: 'It follows your rhythm and counts each breath. Drag it anywhere on the screen. Tap a pattern in its list to change your rhythm. The minus tucks the list away, and the x folds it down to just the word Breathe.',
  },
  {
    id: 'tools',
    targetIds: ['tutorial-header-tools-desktop', 'tutorial-header-tools-mobile'],
    title: 'Along the top',
    body: 'Switch between light and dark, or add Nenya to your home screen. Emergency Exit is always in the corner: it leaves the site at once and erases what this device has saved. On larger screens you will also find Support Us and this tour’s help button.',
  },
  {
    id: 'accessibility',
    targetIds: ['tutorial-menu-desktop', 'tutorial-menu-mobile'],
    title: 'Menu and accessibility',
    body: 'The menu takes you home or to About, and opens Accessibility Settings: turn the motion, the orbit and the counter off, change the logo’s opacity and the text size, and choose a colour-vision mode. The small logo in the corner opens the breathing and display controls too.',
  },
  {
    id: 'reflection',
    targetIds: ['tutorial-cta'],
    title: 'The sensory reflection',
    body: 'This button begins the reflection. You choose which of the six gateways to explore (Sight, Sound, Touch, Essence, Movement and Insight), and at the end you can save a private report made in your own browser.',
  },
];
const STEPS = TUTORIAL_STEPS;

interface WelcomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called as each step is shown (and with null when the tour ends), so the page can set things up for it. */
  onStepChange?: (id: TutorialStepId | null) => void;
}

function isVisible(el: HTMLElement): boolean {
  // offsetParent is always null for position:fixed elements even when
  // visible, so fall back to a real layout check via getClientRects.
  if (el.offsetParent !== null) return true;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

function resolveTarget(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && isVisible(el)) return el;
  }
  return null;
}

export function WelcomeTutorial({ isOpen, onClose, onStepChange }: WelcomeTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  // False while the page is still scrolling to the step's target: no highlight is drawn and the card stays put.
  const [settled, setSettled] = useState(true);
  const lastCard = useRef<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(240);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  // Tell the page which step is showing; it opens the counter's list for the counter step and tucks it away otherwise.
  useEffect(() => {
    if (!isOpen) return;
    onStepChange?.(STEPS[stepIndex].id);
    return () => onStepChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const step = STEPS[stepIndex];
    const el = resolveTarget(step.targetIds);
    if (!el) {
      setRect(null);
      setSettled(true);
      return;
    }

    // Fixed-position targets (the header menu) never need scrolling to, so
    // return the page to the top rather than leaving it where the previous
    // step's target dragged it.
    if (getComputedStyle(el).position === 'fixed' || el.closest('nav, header')) {
      document.querySelector('.snap-y')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Hold the highlight back until the page has stopped moving: the smooth scroll above takes a moment, and a
    // highlight that follows a still-moving target jumps around. Settled means the target's position has not
    // changed for about a tenth of a second (or 1.5 s have passed).
    setSettled(false);
    const update = () => setRect(el.getBoundingClientRect());
    let raf = 0;
    let stable = 0;
    let last = '';
    const started = Date.now();
    const poll = () => {
      const r = el.getBoundingClientRect();
      const key = `${Math.round(r.top)}|${Math.round(r.left)}|${Math.round(r.width)}|${Math.round(r.height)}`;
      stable = key === last ? stable + 1 : 0;
      last = key;
      if (stable >= 6 || Date.now() - started > 1500) {
        setRect(r);
        setSettled(true);
        return;
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, stepIndex]);

  // Measure the card's actual rendered height so it can be clamped fully
  // inside the viewport regardless of how tall the spotlighted target is.
  useEffect(() => {
    if (!isOpen || !cardRef.current) return;
    const h = cardRef.current.offsetHeight;
    if (h && Math.abs(h - cardHeight) > 2) setCardHeight(h);
  });

  const handleClose = () => {
    // The tutorial scrolls the page around to spotlight each step's target;
    // land back at the top rather than wherever the last step left it.
    const toTop = () => {
      const container = document.querySelector('.snap-y');
      if (container) container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    toTop();
    // A smooth scroll from the previous step can still be in flight and
    // pull the page back down; reset again once it has settled.
    setTimeout(toTop, 400);
    onClose();
  };

  if (!isOpen) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const pad = 10;

  // Compute card position near the target, clamped to viewport.
  const cardWidth = 320;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 800;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 600;

  let cardTop: number;
  let cardLeft: number;
  const margin = 16;

  // The card is always centred across the page. Vertically it sits below the spotlighted part if there is room, else
  // above it, else at the bottom of the screen; with nothing to point at it is centred.
  cardLeft = Math.max(margin, (viewportW - Math.min(cardWidth, viewportW - margin * 2)) / 2);
  if (!settled && lastCard.current) {
    cardTop = lastCard.current.top;
    cardLeft = lastCard.current.left;
  } else if (rect) {
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow >= cardHeight + margin * 2) cardTop = rect.bottom + pad + margin;
    else if (spaceAbove >= cardHeight + margin * 2) cardTop = rect.top - pad - margin - cardHeight;
    else cardTop = viewportH - cardHeight - margin;
    cardTop = Math.max(margin, Math.min(cardTop, viewportH - cardHeight - margin));
  } else {
    cardTop = viewportH / 2 - cardHeight / 2;
  }
  if (settled) lastCard.current = { top: cardTop, left: cardLeft };

  return (
    <>
      {/* Click catcher. With nothing to point at the whole page is dimmed; otherwise the spotlight below dims everything
          but the highlighted part, so that part stays sharp and bright (no blur is ever applied here). */}
      <div className={`fixed inset-0 z-[95] ${rect && settled ? '' : 'bg-black/55'}`} onClick={handleClose} />

      <AnimatePresence>
        {rect && settled && (
          <m.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              borderRadius: 14,
              border: '2px solid rgba(232,160,32,0.9)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.58), 0 0 0 6px rgba(232,160,32,0.18), 0 0 24px rgba(232,160,32,0.35)',
              pointerEvents: 'none',
              zIndex: 96,
              transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
            }}
          />
        )}
      </AnimatePresence>

      {/* Card */}
      <m.div
        key={`card-${stepIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 97,
        }}
        className="pointer-events-auto"
        role="dialog"
        aria-label={`Tour: ${step.title}`}
      >
        <div ref={cardRef} className="relative rounded-2xl border border-nenya-accent-warm/30 bg-background/95 backdrop-blur-xl shadow-2xl p-5 space-y-4">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="size-4 text-muted-foreground" />
          </button>

          <div className="space-y-2 pr-6">
            <h3 className="text-base md:text-lg">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? 'w-5 bg-nenya-accent-warm' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
              Skip
            </Button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStepIndex((i) => i - 1)} className="gap-1">
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => (isLast ? handleClose() : setStepIndex((i) => i + 1))}
                className="gap-1 bg-nenya-accent-warm hover:bg-nenya-accent-secondary text-background-elevated"
              >
                {isLast ? 'Back to the logo' : 'Next'}
                {!isLast && <ArrowRight className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </m.div>
    </>
  );
}
