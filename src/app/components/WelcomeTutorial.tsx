import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface TutorialStep {
  targetIds: string[];
  title: string;
  body: string;
}

const STEPS: TutorialStep[] = [
  {
    targetIds: ['tutorial-logo'],
    title: 'Your Breathing Companion',
    body: "This logo gently pulses to a slow rhythm — about six breaths a minute by default. Follow it: breathe in as it brightens, breathe out as it softens.",
  },
  {
    targetIds: ['tutorial-breathing-counter'],
    title: 'Track Your Breath',
    body: 'This counter shows exactly where you are in each cycle. Drag it anywhere on screen, and tap a pattern below to change your breathing pace.',
  },
  {
    targetIds: ['tutorial-cta'],
    title: 'When You’re Ready',
    body: 'This button leads into the six sensory gateways — Sight, Sound, Touch, Essence, Movement, and Insight — for a guided check-in with how you’re actually feeling.',
  },
  {
    targetIds: ['tutorial-menu-desktop', 'tutorial-menu-mobile'],
    title: 'Settings & More',
    body: 'Open this menu anytime to adjust accessibility settings, replay this tutorial, or return home.',
  },
];

interface WelcomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
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

export function WelcomeTutorial({ isOpen, onClose }: WelcomeTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(240);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const step = STEPS[stepIndex];
    const el = resolveTarget(step.targetIds);
    if (!el) {
      setRect(null);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const update = () => setRect(el.getBoundingClientRect());
    update();
    const t1 = setTimeout(update, 350);
    const t2 = setTimeout(update, 700);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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

  if (rect) {
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow >= cardHeight + margin * 2 || spaceBelow >= spaceAbove;
    cardTop = placeBelow ? rect.bottom + margin : rect.top - margin - cardHeight;
    // Clamp fully inside the viewport regardless of target size/position.
    cardTop = Math.max(margin, Math.min(cardTop, viewportH - cardHeight - margin));
    cardLeft = rect.left + rect.width / 2 - cardWidth / 2;
    cardLeft = Math.max(margin, Math.min(cardLeft, viewportW - cardWidth - margin));
  } else {
    cardTop = viewportH / 2 - cardHeight / 2;
    cardLeft = viewportW / 2 - cardWidth / 2;
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] bg-black/55"
        onClick={onClose}
      />

      {/* Spotlight ring */}
      <AnimatePresence>
        {rect && (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              borderRadius: 14,
              border: '2px solid rgba(232,160,32,0.9)',
              boxShadow: '0 0 0 6px rgba(232,160,32,0.18), 0 0 24px rgba(232,160,32,0.35)',
              pointerEvents: 'none',
              zIndex: 96,
              transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
            }}
          />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
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
      >
        <div ref={cardRef} className="relative rounded-2xl border border-nenya-accent-warm/30 bg-background/95 backdrop-blur-xl shadow-2xl p-5 space-y-4">
          <button
            onClick={onClose}
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
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
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
                onClick={() => (isLast ? onClose() : setStepIndex((i) => i + 1))}
                className="gap-1 bg-nenya-accent-warm hover:bg-nenya-accent-secondary text-background-elevated"
              >
                {isLast ? 'Done' : 'Next'}
                {!isLast && <ArrowRight className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
