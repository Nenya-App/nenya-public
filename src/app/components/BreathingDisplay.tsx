import { useEffect, useId, useState } from 'react';
import { ValarBreathingLogo } from './ValarBreathingLogo';
import NenyaLogo from './NenyaLogo';
import { useBreathingDisplay, setBreathingDisplay } from '../../lib/deviceMemory';
import { DISPLAY_STYLES, DISPLAY_STYLE_INFO, breathText, circleScale, gemShown, styleSummary, type DisplayStyle } from '../../lib/breathDisplay';
import type { BreathTiming } from '../../lib/breathClock';

// The breathing animation in the style the visitor chose (src/lib/breathDisplay.ts). Every style reads the one shared clock (cycleStart + the pace), so the picture, the counter and the tones stay in phase.
// Each style has the phase and count as text beneath it, a still picture with reduced motion, and a summary for screen readers that does not change from second to second.

interface Props {
  breathingEnabled: boolean;
  breathingOpacity: number;
  logoSize: number;
  technique: BreathTiming | null;
  cycleSeconds: number;
  cvMode?: string;
  cycleStart?: number;
  orbitEnabled: boolean;
  logoVisible: boolean;
  alt?: string;
  /** Hide the text line under the picture (the text-only style always shows it). */
  hideCaption?: boolean;
}

const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The phase and count as text, read from the shared clock. Hidden from screen readers, which get the style's summary instead (a number that changes every second is not read out). */
function useBreathLine(technique: BreathTiming, cycleStart: number | undefined, on: boolean) {
  const [line, setLine] = useState('Inhale, 1');
  useEffect(() => {
    if (!on) return;
    const start = cycleStart ?? Date.now();
    const tick = () => setLine(breathText(Date.now() - start, technique).text);
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [on, cycleStart, technique.ih, technique.hi, technique.ex, technique.ho]);
  return line;
}

function PlainCircle({ size, technique, cycleStart, on }: { size: number; technique: BreathTiming; cycleStart?: number; on: boolean }) {
  const [scale, setScale] = useState(1);
  const reduce = prefersReducedMotion();
  useEffect(() => {
    // Reduced motion: a still circle at full size; the text line carries the breath.
    if (!on || reduce) { setScale(1); return; }
    const start = cycleStart ?? Date.now();
    const tick = () => setScale(circleScale(Date.now() - start, technique));
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [on, reduce, cycleStart, technique.ih, technique.hi, technique.ex, technique.ho]);
  return (
    <div aria-hidden="true" style={{ width: size, height: size }} className="flex items-center justify-center">
      <div
        className="rounded-full border-[3px] border-foreground bg-primary/20"
        style={{ width: size, height: size, transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function BreathingDisplay(props: Props) {
  const { breathingEnabled, breathingOpacity, logoSize, technique, cycleSeconds, cvMode, cycleStart, orbitEnabled, logoVisible, alt, hideCaption } = props;
  const style = useBreathingDisplay();
  const timing: BreathTiming = technique ?? { ih: (cycleSeconds * 1000) / 2, ex: (cycleSeconds * 1000) / 2 };
  const line = useBreathLine(timing, cycleStart, breathingEnabled);
  const showGem = gemShown(style, logoVisible);
  const ringStyles = style === 'gem' || style === 'ring';

  let picture: React.ReactNode = null;
  if (ringStyles) {
    picture = (
      <ValarBreathingLogo enabled={breathingEnabled} opacity={breathingOpacity} logoSize={logoSize} cycleDuration={cycleSeconds} technique={technique as never} cvMode={cvMode} cycleStart={cycleStart}>
        {showGem ? (
          <div className="nenya-logo-glow">
            <NenyaLogo size={logoSize} showValarOrbit={orbitEnabled} showLogo={logoVisible} cycleStart={cycleStart} technique={technique as never} breathingEnabled={breathingEnabled} glow alt={alt} />
          </div>
        ) : null}
      </ValarBreathingLogo>
    );
  } else if (style === 'circle') {
    picture = (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <PlainCircle size={logoSize} technique={timing} cycleStart={cycleStart} on={breathingEnabled} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="sr-only">{styleSummary(style)}</span>
      {picture}
      {style === 'text' ? (
        <p aria-hidden="true" className="p-8 text-4xl font-medium text-foreground sm:text-5xl" style={{ minHeight: logoSize * 0.5 }}>{breathingEnabled ? line : 'Breathing is off'}</p>
      ) : (
        !hideCaption && breathingEnabled && <p aria-hidden="true" className="-mt-2 text-lg font-medium text-foreground">{line}</p>
      )}
    </div>
  );
}

/** The selector: a radio group, reachable and operable by keyboard (arrow keys move between the styles), with a name and a sentence for each. */
export function BreathingDisplayPicker() {
  const style = useBreathingDisplay();
  const name = useId();
  return (
    <fieldset className="mt-3 space-y-1 text-left">
      <legend className="text-xs font-medium text-foreground">How the breathing is shown</legend>
      {DISPLAY_STYLES.map((s: DisplayStyle) => (
        <label key={s} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-ring ${style === s ? 'border-primary bg-primary/15' : 'border-border hover:bg-muted'}`}>
          <input type="radio" name={name} value={s} checked={style === s} onChange={() => setBreathingDisplay(s)} className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="block font-medium text-foreground">{DISPLAY_STYLE_INFO[s].name}</span>
            <span className="block text-foreground">{DISPLAY_STYLE_INFO[s].description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
