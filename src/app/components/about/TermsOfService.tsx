import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { ReturnToTop } from '../ReturnToTop';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1>Terms of Use</h1>
      </div>

      {/* Content */}
      <div className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <section>
            <h2 className="mb-4">Nenya Terms of Use</h2>
            <div className="space-y-6 text-foreground/90">
              <p>
                Welcome. Please read this before you begin.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2">1. What Nenya Is</h4>
                  <p>
                    Nenya is an interactive digital environment designed as a tool for personal reflection and sensory exploration. It is best understood as a form of interactive art—a space to pause, breathe, and engage with your inner world through structured, sensory-based activities. It is a mirror for your own thoughts, not a source of answers.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2">2. What Nenya Is Not</h4>
                  <p>
                    Nenya is not a medical device, a therapeutic service, or a substitute for professional care. We make no claims, and offer no treatments, for any medical, psychological, or psychiatric condition. The tool is not designed to diagnose, treat, cure, or manage any illness or emotional distress. If you are experiencing a clinical mental health condition, please seek the support of a qualified human professional.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2">3. Your Privacy & Data</h4>
                  <p>
                    This environment is designed around the principle of ephemerality. The reflections you create here are for your personal use. By design, we do not track, record, or store your personal data, your sensory choices, or your reflections on our servers. Any outputs (like a sensory report) are generated on your device and belong to you. You are the sole curator of your experience.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2">4. Your Responsibility</h4>
                  <p>
                    By choosing to enter this space, you agree to use it for its intended purpose of personal reflection. You are responsible for your own well-being. If at any point you feel unsettled or overwhelmed, we encourage you to gently disengage and return to your physical surroundings. We invite you to be a gentle steward of your own journey.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2">5. A Note on Crisis</h4>
                  <p>
                    This artistic tool is not equipped, and its creators are not qualified, to support individuals in crisis. If you are feeling hopeless, considering harming yourself or others, or are otherwise in distress, please close this window and immediately connect with a human professional. You can reach the 988 Suicide & Crisis Lifeline in the US and Canada by calling or texting 988, or contact local emergency services in your area.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2">6. Intellectual Property</h4>
                  <p>
                    The Nenya environment, including its design, concepts, and underlying technology, is a copyrighted artistic work. The personal reflections and reports you generate are your own.
                  </p>
                </div>
              </div>
              
              <div className="border-l-4 border-primary/20 bg-muted/50 px-4 py-3 mt-8">
                <p className="italic">
                  By proceeding, you acknowledge that you have read, understood, and agree to these terms. Thank you for your presence here.
                </p>
              </div>
            </div>
          </section>

          <ReturnToTop onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}