import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ReturnToTop } from '../ReturnToTop';
import { ScrollIndicator } from '../ScrollIndicator';
import { AppFooter } from '../AppFooter';

interface BreathingToolProps {
  onBack: () => void;
}

export default function BreathingTool({ onBack }: BreathingToolProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-5" />
        </Button>
        <h1>About the Breathing Tool</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            The pulsing animation on the welcome screen isn't just there to look nice — it's meant to
            guide your actual breath, using something called a <strong>resonance breathing technique</strong>.
          </p>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-3" aria-labelledby="breathing-safety">
            <h2 id="breathing-safety" className="text-xl md:text-2xl text-center">Safety and sources</h2>
            <p>Stop and return to normal breathing if you feel dizzy or lightheaded. If six seconds feels too long, choose a shorter count (for example four or five seconds each) and build up gradually. If you have asthma, COPD, a heart or lung condition, or are managing specific symptoms, check with a healthcare professional before practicing slow or paced breathing exercises.</p>
            <p className="text-sm text-muted-foreground">What stands behind this, and where it stops:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>Dizziness is a recognised sign of over-breathing, which lowers carbon dioxide in the blood. A review of breathing training in asthma notes that slow, controlled breathing instruction can increase over-breathing in some susceptible people, and that in more severe chronic lung disease some diaphragmatic breathing can increase breathlessness. Courtney R. “Breathing training for dysfunctional breathing in asthma: taking a multidimensional approach.” <em>ERJ Open Research</em> 2017;3(4):00065-2017. <a className="underline underline-offset-4" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5721258" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The Cleveland Clinic, in its guidance on pursed-lip breathing (a related technique, not this one), says to take a break if you feel dizzy, lightheaded or tired, and to make sure the technique is right for your situation. <a className="underline underline-offset-4" href="https://my.clevelandclinic.org/health/treatments/9443-pursed-lip-breathing" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The benefits described on this page come from studies of mostly healthy people, and the body of evidence is small. A systematic review of slow breathing (under ten breaths a minute): Zaccaro A. et al., <em>Frontiers in Human Neuroscience</em> 2018;12:353. <a className="underline underline-offset-4" href="https://pubmed.ncbi.nlm.nih.gov/30245619/" target="_blank" rel="noopener noreferrer">Read it (opens in a new tab)</a>.</li>
              <li>The advice to check first if you have a heart condition is a general precaution. We did not find a source on paced breathing in heart conditions specifically, so we say so and do not claim one.</li>
            </ul>
            <p className="text-xs text-muted-foreground">This is general information, not medical advice. It does not replace the advice of your own healthcare professional.</p>
          </Card>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-4">
            <h2 className="text-xl md:text-2xl text-center">One Approach: Resonance Breathing</h2>
            <p className="text-lg md:text-xl">
              The Breathing Tool starts at <strong>six seconds in and six seconds out, about 5 breaths per minute</strong>.
              You can choose another pace, or set your own inside safe limits. Slow breathing in this range is scientifically recognized for its profound effect on the nervous
              system. Research, such as that cited by the National Institutes of Health, indicates that
              breathing at this pace:
            </p>

            <ul className="space-y-3 text-base md:text-lg pl-6">
              <li className="list-disc">
                <strong>Can support Heart Rate Variability (HRV):</strong> This is a key marker of your
                body's resilience and ability to self-regulate.
              </li>
              <li className="list-disc">
                <strong>May activate the Baroreflex:</strong> This is your body's primary blood pressure
                regulation system, promoting a state of calm and balance.
              </li>
              <li className="list-disc">
                <strong>Encourages synchronisation of cardiovascular and respiratory rhythms:</strong> This
                synchronization creates a powerful, coherent state between your heart, lungs, and brain,
                reducing psychological and physiological stress.
              </li>
            </ul>
          </Card>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-4">
            <h2 className="text-xl md:text-2xl text-center">Your Built-In Breathing Pacer</h2>
            <p className="text-lg md:text-xl">
              By simply sitting with the Breathing Tool and synchronizing your breath to its gentle
              pulse—<em>inhaling as it brightens, exhaling as it softens</em>—you engage in a proven
              self-regulation technique before you even begin your sensory reflection.
            </p>
            <p className="text-lg md:text-xl">
              This is the first gift of the sanctuary: a moment of somatic stillness. It prepares the
              ground for introspection by first calming the body, allowing you to step out of the frantic
              rhythm of daily life and into a state receptive enough to hear the subtle language of your
              own senses.
            </p>
          </Card>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>

      <ScrollIndicator containerRef={scrollContainerRef} />
      <AppFooter />
    </div>
  );
}
