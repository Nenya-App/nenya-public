import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import NenyaLogo from './NenyaLogo';
import { ScrollIndicator } from './ScrollIndicator';
import { LegalDocumentBody } from './LegalDocumentBody';
import { DownloadLegalPdfButton } from './DownloadLegalPdfButton';
import { LEGAL_EFFECTIVE_DATE } from '../../lib/legalDocument';
import { rememberTerms, setRemembering } from '../../lib/deviceMemory';
import { agreeToTerms } from '../../lib/visitConsent';
import { PRESETS, sameTechnique, type BreathingTechnique } from '../../lib/breathingPresets';
import { START_COPY, startChooserOn, type StartChoice } from '../../lib/startCopy';
import { StartTriad } from './StartTriad';

export type OnboardingStep = 'start' | 'rhythm' | 'terms';
const STEPS: OnboardingStep[] = ['rhythm', 'terms'];

// Friendly names for the picker. The first four are the ones most people want (three hold-free, and Box); the rest
// sit behind "More options".
const RHYTHM_INFO: Record<string, { name: string; blurb: string }> = {
  '5·5': { name: 'Steady', blurb: 'Even breaths, about six a minute. A good place to begin.' },
  '4·6': { name: 'Calming', blurb: 'A longer exhale, to help you settle.' },
  '3·3': { name: 'Lively', blurb: 'Quicker, lighter breaths to wake you up.' },
  '4·8': { name: 'Deep calm', blurb: 'A long, slow exhale. Good for winding down.' },
  Box: { name: 'Box', blurb: 'In, hold, out, hold, all the same length. For focus and reset.' },
  '4-7-8': { name: '4-7-8', blurb: 'A long hold between breaths. Skip it if holding your breath is uncomfortable.' },
};
const MAIN_LABELS = ['5·5', '4·6', '3·3', 'Box'];
const MORE_LABELS = ['4·8', '4-7-8'];
const presetByLabel = (lb: string) => PRESETS.find((p) => p.lb === lb)!;

interface OnboardingFlowProps {
  technique: BreathingTechnique;
  onTechniqueChange: (t: BreathingTechnique) => void;
  onStepChange?: (step: OnboardingStep) => void;
  /** Called once the Terms are agreed. With the start chooser on, it says where the visitor chose to start and hands over the agreement in progress (so a page change can wait for it to be signed). */
  onFinish: (choice?: StartChoice, agreement?: Promise<void>) => void;
  /**
   * False while the loading screen is still over the page. The panel is mounted under the loading screen, completely solid, so that
   * when the loading screen fades there is no half-drawn page or panel fading in; it is hidden from assistive technology and
   * skipped by the keyboard until then. Once the loading screen has gone, the backdrop eases to see-through so the logo can be
   * seen breathing behind. Defaults to true (no loading screen).
   */
  veilGone?: boolean;
  /**
   * True when the visitor arrived on a page other than the welcome page (a link straight to one of the About pages). The rhythm choice is
   * about the breathing counter on the welcome page, so it is left out there and the panel opens on the terms, which still wrap everything.
   * The rhythm stays the default (Steady) and can be changed later from the breathing counter.
   */
  skipRhythm?: boolean;
}

function RhythmOrb({ t }: { t: BreathingTechnique }) {
  const total = t.ih + (t.hi || 0) + t.ex + (t.ho || 0);
  const p1 = (t.ih / total) * 100;
  const p2 = ((t.ih + (t.hi || 0)) / total) * 100;
  const p3 = ((t.ih + (t.hi || 0) + t.ex) / total) * 100;
  const name = `onb-orb-${t.ih}-${t.hi || 0}-${t.ex}-${t.ho || 0}`;
  return (
    <>
      <style>{`@keyframes ${name}{0%{transform:scale(.55);opacity:.55}${p1}%{transform:scale(1);opacity:1}${p2}%{transform:scale(1);opacity:1}${p3}%{transform:scale(.55);opacity:.55}100%{transform:scale(.55);opacity:.55}}@media (prefers-reduced-motion:reduce){.onb-orb{animation:none!important}}`}</style>
      <div
        className="onb-orb size-16 rounded-full"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #F3DCC4, #DDB88C 55%, rgba(221,184,140,.25))',
          boxShadow: '0 0 24px rgba(221,184,140,.45)',
          animation: `${name} ${total}ms ease-in-out infinite`,
        }}
      />
    </>
  );
}

export default function OnboardingFlow({ technique, onTechniqueChange, onStepChange, onFinish, veilGone = true, skipRhythm = false }: OnboardingFlowProps) {
  // The start chooser (VITE_START_CHOOSER=on) comes first: what is here, and where to start; then the Terms. The rhythm step is only on the breathing path.
  const chooser = startChooserOn() && !skipRhythm;
  const [choice, setChoice] = useState<StartChoice | null>(null);
  const [step, setStep] = useState<OnboardingStep>(chooser ? 'start' : skipRhythm ? 'terms' : 'rhythm');
  const [showMore, setShowMore] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps: OnboardingStep[] = chooser
    ? ['start', ...(choice === 'breathing' || choice === null ? (['rhythm'] as OnboardingStep[]) : []), 'terms']
    : skipRhythm
      ? STEPS.filter((x) => x !== 'rhythm')
      : STEPS;
  const choose = (c: StartChoice) => {
    setChoice(c);
    setStep(c === 'breathing' ? 'rhythm' : 'terms');
  };
  const stepIndex = steps.indexOf(step);
  const goTo = (s: OnboardingStep) => setStep(s);

  useEffect(() => {
    onStepChange?.(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Focus goes to the heading once the panel can be seen (not while the loading screen is over it).
  useEffect(() => {
    if (!veilGone) return;
    const t = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 350);
    return () => clearTimeout(t);
  }, [step, veilGone]);

  // Off unless the visitor ticks it. Saves their settings and this agreement on this device only.
  const [rememberHere, setRememberHere] = useState(false);

  const handleAgree = () => {
    if (isExiting) return;
    if (rememberHere) {
      setRemembering(true);
      rememberTerms(LEGAL_EFFECTIVE_DATE);
    }
    // Held for the visit (cleared when the tab closes, on Emergency Exit or Forget me) and signed by the site; carried into anything the person later signs.
    const agreement = agreeToTerms();
    setIsExiting(true);
    setTimeout(() => onFinish(chooser ? (choice ?? undefined) : undefined, agreement), 700);
  };

  const isTerms = step === 'terms';

  const renderRhythmRow = (lb: string) => {
    const preset = presetByLabel(lb);
    const info = RHYTHM_INFO[lb];
    const selected = sameTechnique(technique, preset);
    return (
      <button
        key={lb}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onTechniqueChange({ ih: preset.ih, hi: preset.hi, ex: preset.ex, ho: preset.ho })}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nenya-accent-warm ${
          selected
            ? 'border-nenya-accent-warm bg-nenya-accent-warm/10'
            : 'border-border hover:border-nenya-accent-warm/50'
        }`}
      >
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full border text-sm ${
            selected ? 'border-nenya-accent-warm text-nenya-gold-text dark:text-nenya-accent-warm' : 'border-border text-muted-foreground'
          }`}
        >
          {lb}
        </span>
        <span className="flex-1">
          <span className="block text-sm">{info.name}</span>
          <span className="block text-xs leading-snug text-muted-foreground">{info.blurb}</span>
        </span>
        {selected && <Check className="size-4 shrink-0 text-nenya-gold-text dark:text-nenya-accent-warm" />}
      </button>
    );
  };

  // Nothing to choose is also a choice: the rhythm already selected (Steady unless changed) is what is used.
  const nav = (
    <div className={`flex pt-1 ${chooser ? 'justify-between' : 'justify-end'}`}>
      {chooser && (
        <Button size="sm" variant="ghost" onClick={() => goTo('start')} className="min-h-11 gap-1">
          <ArrowLeft className="size-3.5" />
          {START_COPY.back}
        </Button>
      )}
      <Button
        size="sm"
        onClick={() => goTo('terms')}
        className="gap-1 bg-nenya-accent-warm text-primary-foreground hover:bg-nenya-gold-light"
      >
        Read the terms
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      {...(!veilGone ? ({ inert: '', 'aria-hidden': 'true' } as Record<string, string>) : {})}
    >
      {/* Backdrop: fully solid while the loading screen is up, then light enough to see the logo breathing behind */}
      <div
        className="absolute inset-0 bg-background backdrop-blur-[2px]"
        style={{
          opacity: isExiting ? 0 : veilGone ? 0.75 : 1,
          transition: isExiting ? 'opacity 0.5s linear' : 'opacity 0.9s ease-out',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div
          className={`relative my-auto flex w-full flex-col overflow-hidden rounded-2xl border border-nenya-accent-warm/30 bg-background/90 shadow-2xl backdrop-blur-xl ${
            isTerms ? 'max-w-2xl max-h-[calc(100dvh-2rem)]' : 'max-w-lg'
          }`}
          style={{
            opacity: isExiting ? 0 : 1,
            transform: isExiting ? 'translateY(20px) scale(0.97)' : 'none',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          {/* A new key restarts the entrance, so each step fades in as it appears. */}
          <div key={step} className={`onb-step-in ${isTerms ? 'flex min-h-0 flex-1 flex-col' : 'space-y-4 p-5 sm:p-7'}`}>
              {step === 'start' && (
                <>
                  <div className="space-y-1">
                    <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl outline-none">
                      {START_COPY.heading}
                    </h2>
                    <p className="text-sm text-muted-foreground">{START_COPY.line}</p>
                  </div>
                  {/* The triangle of three glowing rings (StartTriad.tsx). Nothing is preselected; "Learn more" for all three sits below it. */}
                  <StartTriad onChoose={choose} />
                  <p className="text-sm text-muted-foreground">{START_COPY.notSure}</p>
                  <p className="text-xs text-muted-foreground">{START_COPY.crisis}</p>
                </>
              )}

              {step === 'rhythm' && (
                <>
                  <div className="flex items-center gap-4">
                    <RhythmOrb t={technique} />
                    <div className="space-y-1">
                      <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl outline-none">
                        {chooser ? START_COPY.rhythmHeading : 'Welcome to Nenya'}
                      </h2>
                      {!chooser && (
                        <p className="text-sm text-muted-foreground">
                          A private place to listen to yourself. Let’s begin with your breath.
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">
                    Choose a rhythm. The glow follows it, and you can change it any time. Not choosing is fine: Steady is already selected.
                  </p>
                  <div role="radiogroup" aria-label="Breathing rhythm" className="space-y-2">
                    {MAIN_LABELS.map(renderRhythmRow)}
                    {showMore && MORE_LABELS.map(renderRhythmRow)}
                  </div>
                  <button
                    type="button"
                    aria-expanded={showMore}
                    onClick={() => setShowMore((v) => !v)}
                    className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showMore ? 'Fewer options' : 'More options'}
                    {showMore ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                  {nav}
                </>
              )}

              {step === 'terms' && (
                <>
                  <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-3 sm:px-6">
                    <NenyaLogo size={28} />
                    <div className="space-y-0.5">
                      <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-base sm:text-lg outline-none">
                        Terms of Use & Privacy Policy
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Effective {LEGAL_EFFECTIVE_DATE}. Choosing “Agree, Enter” means you accept them.
                      </p>
                      <DownloadLegalPdfButton />
                      {chooser && (
                        <button type="button" onClick={() => goTo(choice === 'breathing' ? 'rhythm' : 'start')} className="flex min-h-11 items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                          <ArrowLeft className="size-3" aria-hidden="true" />
                          {START_COPY.back}
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    ref={scrollRef}
                    className="scroll-container relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
                  >
                    <LegalDocumentBody compact />
                    <ScrollIndicator containerRef={scrollRef} hideThreshold={50} />
                  </div>
                  <label className="flex shrink-0 items-start gap-2 border-t border-border bg-background/50 px-4 pt-3 text-xs text-muted-foreground sm:px-6">
                    <input
                      type="checkbox"
                      checked={rememberHere}
                      onChange={(e) => setRememberHere(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>
                      Remember my settings and this agreement on this device, so I am not asked each visit. Saved in this
                      browser only and never sent to Nenya. I can turn it off any time in the settings menu.
                    </span>
                  </label>
                  <div
                    className="grid shrink-0 grid-cols-2 gap-2 bg-background/50 px-4 py-3 sm:gap-3 sm:px-6"
                    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                  >
                    <Button size="lg" onClick={handleAgree} className="min-h-[44px] text-xs sm:text-sm">
                      Agree, Enter
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        try {
                          window.close();
                        } catch (e) {}
                        window.location.replace('about:blank');
                      }}
                      className="min-h-[44px] text-xs sm:text-sm"
                    >
                      Disagree, Exit
                    </Button>
                  </div>
                </>
              )}
          </div>

          {/* Progress dots */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 pb-3" aria-hidden="true">
            {steps.length > 1 && steps.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? 'w-5 bg-nenya-accent-warm' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
