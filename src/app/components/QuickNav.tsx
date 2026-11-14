import { useState } from 'react';
import { Sparkles, Wind, Compass, MessageCircle, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';

interface QuickNavProps {
  /** Breathe: the home page. */
  onBreathe: () => void;
  /** Reflect: the gateways. */
  onReflect: () => void;
  /** The page of the coach (it lives at its own address). */
  coachHref?: string;
}

// A quick way to move between the three parts of Nenya, in the bottom right corner of the main page. It replaces the welcome message that the sparkle used to reopen.
export default function QuickNav({ onBreathe, onReflect, coachHref = '/coach/' }: QuickNavProps) {
  const [open, setOpen] = useState(false);
  const item = 'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-muted';
  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <m.nav
            id="quick-nav-menu"
            aria-label="Quick navigation"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="w-56 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg"
          >
            <button type="button" className={item} aria-current="page" onClick={() => { setOpen(false); onBreathe(); }}>
              <Wind className="size-4 shrink-0" />
              <span className="flex-1"><span className="block">Breathe</span><span className="block text-xs text-muted-foreground">Home</span></span>
            </button>
            <button type="button" className={item} onClick={() => { setOpen(false); onReflect(); }}>
              <Compass className="size-4 shrink-0" />
              <span className="flex-1"><span className="block">Reflect</span><span className="block text-xs text-muted-foreground">The six gateways</span></span>
            </button>
            <a href={coachHref} className={item}>
              <MessageCircle className="size-4 shrink-0" />
              <span className="flex-1"><span className="block">Coach</span><span className="block text-xs text-muted-foreground">An optional AI coach demo</span></span>
            </a>
          </m.nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="quick-nav-menu"
        aria-label={open ? 'Close quick navigation' : 'Open quick navigation'}
        className="rounded-full bg-nenya-accent-warm/90 p-3 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={open ? undefined : { animation: 'glimmer-ring 2.5s ease-in-out infinite' }}
      >
        {open ? <X className="size-5 text-primary-foreground" /> : <Sparkles className="size-5 text-primary-foreground" />}
      </button>
    </div>
  );
}
