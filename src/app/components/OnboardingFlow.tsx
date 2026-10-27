import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import NenyaLogo from './NenyaLogo';
import { ScrollIndicator } from './ScrollIndicator';
import { LegalDocumentBody } from './LegalDocumentBody';
import { DownloadLegalPdfButton } from './DownloadLegalPdfButton';
import { LEGAL_EFFECTIVE_DATE } from '../../lib/legalDocument';
import { PRESETS, sameTechnique, type BreathingTechnique } from '../../lib/breathingPresets';

export type OnboardingStep = 'rhythm' | 'counter' | 'process' | 'terms';
const STEPS: OnboardingStep[] = ['rhythm', 'counter', 'process', 'terms'];

// Friendly names for the picker. The first three are the gentlest, hold-free
// rhythms; the rest sit behind "More options".
const RHYTHM_INFO: Record<string, { name: string; blurb: string }> = {
  '5·5': { name: 'Steady', blurb: 'Even breaths, about six a minute. A good place to begin.' },
  '4·6': { name: 'Calming', blurb: 'A longer exhale, to help you settle.' },
  '3·3': { name: 'Lively', blurb: 'Quicker, lighter breaths to wake you up.' },
  '4·8': { name: 'Deep calm', blurb: 'A long, slow exhale. Good for winding down.' },
  Box: { name: 'Box', blurb: 'In, hold, out, hold, all the same length. For focus and reset.' },
  '4-7-8': { name: '4-7-8', blurb: 'A long hold between breaths. Skip it if holding your breath is uncomfortable.' },
};
const MAIN_LABELS = ['5·5', '4·6', '3·3'];
const MORE_LABELS = ['4·8', 'Box', '4-7-8'];
const presetByLabel = (lb: string) => PRESETS.find((p) => p.lb === lb)!;

interface OnboardingFlowProps {
  technique: BreathingTechnique;
  onTechniqueChange: (t: BreathingTechnique) => void;
  onStepChange?: (step: OnboardingStep) => void;
  onFinish: () => void;
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

export default function OnboardingFlow({ technique, onTechniqueChange, onStepChange, onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('rhythm');
  const [showMore, setShowMore] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stepIndex = STEPS.indexOf(step);
  const goTo = (s: OnboardingStep) => setStep(s);

  useEffect(() => {
    onStepChange?.(step);
    const t = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Spotlight the live breathing counter on its step.
  useEffect(() => {
    if (step !== 'counter') {
      setRect(null);
      return;
    }
    const find = () => {
      const el = document.getElementById('tutorial-breathing-counter');
      setRect(el ? el.getBoundingClientRect() : null);
    };
    find();
    const timers = [120, 400, 900].map((ms) => setTimeout(find, ms));
    window.addEventListener('resize', find);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', find);
    };
  }, [step]);

  const handleAgree = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onFinish, 700);
  };

  const isTerms = step === 'terms';
  const alignment =
    step === 'counter' ? 'items-end md:items-center md:pr-[250px]' : 'items-center';

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
            selected ? 'border-nenya-accent-warm text-nenya-accent-warm' : 'border-border text-muted-foreground'
          }`}
        >
          {lb}
        </span>
        <span className="flex-1">
          <span className="block text-sm">{info.name}</span>
          <span className="block text-xs leading-snug text-muted-foreground">{info.blurb}</span>
        </span>
        {selected && <Check className="size-4 shrink-0 text-nenya-accent-warm" />}
      </button>
    );
  };

  const nav = (opts: { back?: OnboardingStep; next: OnboardingStep; nextLabel?: string }) => (
    <div className="flex items-center justify-between gap-2 pt-1">
      <button
        type="button"
        onClick={() => goTo('terms')}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Skip to terms
      </button>
      <div className="flex items-center gap-2">
        {opts.back && (
          <Button variant="outline" size="sm" onClick={() => goTo(opts.back!)} className="gap-1">
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => goTo(opts.next)}
          className="gap-1 bg-nenya-accent-warm text-background-elevated hover:bg-nenya-accent-secondary"
        >
          {opts.nextLabel ?? 'Continue'}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      {/* Backdrop: light enough to see the logo breathing behind, darker while the counter is spotlit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 backdrop-blur-[2px] ${step === 'counter' ? 'bg-black/60' : 'bg-background/75'}`}
      />

      {rect && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            borderRadius: 18,
            border: '2px solid rgba(232,160,32,0.9)',
            boxShadow: '0 0 0 6px rgba(232,160,32,0.18), 0 0 24px rgba(232,160,32,0.35)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div className={`absolute inset-0 flex justify-center overflow-y-auto p-4 ${alignment}`}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 20 : 0, scale: isExiting ? 0.97 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`relative my-auto flex w-full flex-col overflow-hidden rounded-2xl border border-nenya-accent-warm/30 bg-background/90 shadow-2xl backdrop-blur-xl ${
            isTerms ? 'max-w-2xl max-h-[calc(100dvh-2rem)]' : 'max-w-lg'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={isTerms ? 'flex min-h-0 flex-1 flex-col' : 'space-y-4 p-5 sm:p-7'}
            >
              {step === 'rhythm' && (
                <>
                  <div className="flex items-center gap-4">
                    <RhythmOrb t={technique} />
                    <div className="space-y-1">
                      <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl outline-none">
                        Welcome to Nenya
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        A private place to listen to yourself. Let’s begin with your breath.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">Choose a rhythm. The glow follows it, and you can change it any time.</p>
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
                  {nav({ next: 'counter' })}
                </>
              )}

              {step === 'counter' && (
                <>
                  <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl outline-none">
                    Your breath counter
                  </h2>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                    <li>It follows your rhythm and shows where you are in each breath.</li>
                    <li>Drag it anywhere on the screen.</li>
                    <li>Tap a pattern in its list to change your rhythm.</li>
                    <li>Use the minus to tuck the list away, or the x to fold it down to just the word Breathe. Tap the word to bring it back.</li>
                  </ul>
                  {nav({ back: 'rhythm', next: 'process' })}
                </>
              )}

              {step === 'process' && (
                <>
                  <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl outline-none">
                    Three simple steps
                  </h2>
                  <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                    <li>Breathe to find your center.</li>
                    <li>Sense your inner state through color, sound, and sensation.</li>
                    <li>Reflect to gain clarity.</li>
                  </ol>
                  <p className="text-sm text-muted-foreground">
                    Your journey here is private by design. Nothing you enter is saved or sent to us, and it’s gone
                    when you close the tab.
                  </p>
                  <p className="text-sm">One last thing before you enter.</p>
                  {nav({ back: 'counter', next: 'terms', nextLabel: 'Read the terms' })}
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
                    </div>
                  </div>
                  <div
                    ref={scrollRef}
                    className="scroll-container relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
                  >
                    <LegalDocumentBody compact />
                    <ScrollIndicator containerRef={scrollRef} hideThreshold={50} />
                  </div>
                  <div
                    className="grid shrink-0 grid-cols-2 gap-2 border-t border-border bg-background/50 px-4 py-3 sm:gap-3 sm:px-6"
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
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 pb-3" aria-hidden="true">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? 'w-5 bg-nenya-accent-warm' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
