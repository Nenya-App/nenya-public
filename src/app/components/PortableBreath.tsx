import { useEffect, useState } from 'react';
import { usePref } from '../../lib/deviceMemory';
import type { BreathingTechnique } from '../../lib/breathingPresets';
import { BreathingCounter } from './BreathingCounter';
import { BreathTonesPlayer } from './BreathTonesSwitch';
import { setRingClock } from '../../lib/ringTheme';
import { breathLengthMs } from '../../lib/breathClock';

// The breathing pace, counter and tones, portable (owner, 2026-11-15: "the counter and pacer basically portable", and the tones heard whenever they are
// switched on in the panel). One pace and one clock per page, shared by the counter, the tones, the panel's ring and the header logo, on every screen of
// the main site and on /coach. The pace is a display choice like the others: kept on the device only with "Remember on this device".

/** The default pace: six seconds in, six out (owner, 2026-11-18; it was five and five). */
export const STEADY: BreathingTechnique = { ih: 6000, hi: 0, ex: 6000, ho: 0 };

/** The page's pace and the clock anchor every breathing thing reads, so they stay in phase. The clock restarts only when the pace changes. */
export function useBreathRhythm() {
  const [technique, setTechnique] = usePref('breathingTechnique', STEADY as BreathingTechnique);
  const [cycleStart, setCycleStart] = useState(() => Date.now());
  useEffect(() => {
    setCycleStart(Date.now());
  }, [technique]);
  useEffect(() => {
    setRingClock(cycleStart, breathLengthMs(technique));
  }, [cycleStart, technique]);
  return { technique, setTechnique, cycleStart } as const;
}

interface Props {
  /** Whether the visitor may see it yet (after the terms). */
  ready: boolean;
  breathingEnabled: boolean;
  showCounter: boolean;
  technique: BreathingTechnique;
  onTechniqueChange: (t: BreathingTechnique) => void;
  cycleStart: number;
  id?: string;
  /** Controlled minimizing, for the front page's tour; elsewhere the counter starts minimized and keeps its own state. */
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
}

/**
 * The counter (when "Show breathing counter" is on) and the tones player. The tones play whenever they are switched on and the breathing animation is
 * on, whether or not the counter is showing, so turning them on in the panel is enough to hear them on any page. They stop when the tab is hidden.
 */
export function PortableBreath({ ready, breathingEnabled, showCounter, technique, onTechniqueChange, cycleStart, id, minimized, onMinimizedChange }: Props) {
  const [ownMinimized, setOwnMinimized] = useState(true);
  if (!ready) return null;
  return (
    <>
      <BreathTonesPlayer active={breathingEnabled} timing={technique} cycleStart={cycleStart} />
      <BreathingCounter
        id={id}
        enabled={breathingEnabled}
        show={showCounter}
        ih={technique.ih}
        hi={technique.hi || 0}
        ex={technique.ex}
        ho={technique.ho || 0}
        onTechniqueChange={onTechniqueChange}
        cycleStart={cycleStart}
        minimized={minimized ?? ownMinimized}
        onMinimizedChange={onMinimizedChange ?? setOwnMinimized}
      />
    </>
  );
}
