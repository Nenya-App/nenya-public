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

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border p-6 space-y-4">
            <h2 className="text-xl md:text-2xl text-center">One Approach: Resonance Breathing</h2>
            <p className="text-lg md:text-xl">
              The Breathing Tool pulses at a rhythm of <strong>around 6 breaths per minute</strong>. This
              specific frequency is scientifically recognized for its profound effect on the nervous
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
