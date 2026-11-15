import { useEffect, useRef } from 'react';
import { ArrowRight, Wind } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { setBreathingPanel } from '../lib/breathingPanel';
import { sectionsOn } from '../lib/sections';

interface BreathFirstProps {
  /** Go on to the coach (the color choice comes next). */
  onContinue: () => void;
}

// The soft default for someone who opens the coach directly (/coach), not through the gateways (owner, 2026-11-15). Nenya's
// order is breath, then reflection, then the coach; this offers the first two without locking anything. Someone who arrives
// through the gateways has done both and never sees this. Nothing about the choice is saved or counted.
export function BreathFirst({ onContinue }: BreathFirstProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="scroll-container size-full overflow-y-auto">
      <section className="mx-auto max-w-xl space-y-5 px-4 py-10" aria-labelledby="breath-first-title">
        <h1 id="breath-first-title" ref={headingRef} tabIndex={-1} className="text-2xl outline-none md:text-3xl">
          Begin with a breath first?
        </h1>
        <p className="text-muted-foreground">
          Nenya usually begins with a minute of breathing, then a reflection in color, sound or touch, and offers the coach
          after that. You don&rsquo;t have to start there. If you&rsquo;d like to settle first, the breathing tool opens right
          here, and the coach will be waiting.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => setBreathingPanel(true)} className="min-h-11 gap-2">
            <Wind className="size-4" aria-hidden="true" />
            Breathe here first
          </Button>
          <Button type="button" variant="outline" onClick={onContinue} className="min-h-11 gap-2">
            Go to the coach
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-sm">
          <a href={sectionsOn() ? '/senses' : '/'} className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Start with a reflection instead
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          If you are in danger or crisis right now, call or text 988 (US and Canada), or call your local emergency number.
        </p>
      </section>
    </div>
  );
}
