import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { allColors } from './ValarBreathingLogo';
import { breathLengthMs, type BreathTiming } from '../../lib/breathClock';
import { nextBreathEnd, rgbTriplet } from '../../lib/breathPulse';

interface MoreBelowButtonProps {
  /** Words beside the arrow ("Look into the Mirror?" on the welcome page); leave out for the arrow alone. */
  label?: string;
  /** What a screen reader says. */
  ariaLabel: string;
  onClick: () => void;
  /** The shared breath start and technique, so the pulse lands on the end of each breath. Without a start the button glows but does not pulse. */
  cycleStart?: number;
  technique?: BreathTiming | null;
  className?: string;
}

/**
 * The "more below" cue as a real button with a soft glow. Once at the end of every breath the glow swells and fades a single time, in the
 * colour of the breath that has just ended (the same colour the ring and the gem have). It does not pulse continuously. With reduced motion
 * the pulse does not move: the glow just takes the colour.
 */
export function MoreBelowButton({ label, ariaLabel, onClick, cycleStart, technique = null, className = '' }: MoreBelowButtonProps) {
  const [pulse, setPulse] = useState<{ n: number; color: string } | null>(null);
  const breathMs = breathLengthMs(technique);

  useEffect(() => {
    if (cycleStart == null) return;
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const arm = () => {
      const end = nextBreathEnd(Date.now(), cycleStart, breathMs);
      timer = setTimeout(() => {
        // The breath that just ended is the one that was running when this was armed.
        setPulse({ n: ++n, color: allColors[end.colorIndex] ?? allColors[0] });
        arm();
      }, end.delayMs);
    };
    arm();
    return () => clearTimeout(timer);
  }, [cycleStart, breathMs]);

  const rgb = rgbTriplet(pulse?.color ?? '#e8a020');
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`nenya-more-below relative inline-flex cursor-pointer flex-col items-center gap-0.5 rounded-full border border-nenya-accent-warm/60 bg-background/40 px-6 py-2 text-muted-foreground ${className}`}
      style={{ ['--mb-rgb' as string]: rgb }}
    >
      {/* The glow is its own layer, so restarting it each breath never touches the button (or where keyboard focus is). */}
      <span key={pulse?.n ?? 0} aria-hidden="true" className={`nenya-more-below-glow ${pulse ? 'is-pulsing' : ''}`} />
      {label && <span className="relative text-base font-medium">{label}</span>}
      <ChevronDown aria-hidden="true" className="relative size-8" />
    </button>
  );
}
