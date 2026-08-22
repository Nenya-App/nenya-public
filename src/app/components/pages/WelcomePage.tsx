import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { ValarBreathingLogo, BreathingTechnique } from '../ValarBreathingLogo';
import WelcomePopup from '../WelcomePopup';
import { ArrowRight, ChevronDown, ChevronUp, Heart, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';

interface WelcomePageProps {
  onContinue: () => void;
  breathingEnabled: boolean;
  orbitEnabled: boolean;
  logoVisible?: boolean;
  selectedValarIndices: number[];
  breathingOpacity: number;
  onNavigateToAbout?: (section?: string) => void;
  technique?: BreathingTechnique | null;
  cvMode?: string;
  onEntryUnlocked?: () => void;
}

export default function WelcomePage({
  onContinue,
  breathingEnabled,
  orbitEnabled,
  logoVisible = true,
  selectedValarIndices,
  breathingOpacity,
  onNavigateToAbout,
  technique = null,
  cvMode = '',
  onEntryUnlocked,
}: WelcomePageProps) {
  const [logoSize, setLogoSize] = useState(400);
  const [isBreathingInfoExpanded, setIsBreathingInfoExpanded] = useState(false);

  // Calculate logo size to fill viewport
  useEffect(() => {
    const updateLogoSize = () => {
      // Use the smaller dimension to ensure logo fits, with some padding
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Account for header (64px) and padding, use 85% of smaller dimension
      const availableHeight = viewportHeight - 64 - 120; // header + padding for text
      const availableWidth = viewportWidth - 48; // horizontal padding
      // Reduced to 3/4 of original size: 600px -> 450px cap
      const size = Math.min(availableWidth, availableHeight, 600) * 0.675;
      setLogoSize(size);
    };

    updateLogoSize();
    window.addEventListener('resize', updateLogoSize);
    return () => window.removeEventListener('resize', updateLogoSize);
  }, []);

  return (
    <div className="size-full relative overflow-y-auto snap-y snap-mandatory">
      {/* Welcome Popup */}
      <WelcomePopup onNavigateToAbout={onNavigateToAbout} onDismiss={onEntryUnlocked} />

      {/* First Section: Full Viewport with Large Logo */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative snap-start">
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0.7s both' }} className={`flex-1 flex items-center justify-center transition-all duration-500`}>
          <div id="tutorial-logo" className={`transition-all duration-500 nenya-logo-clickable`}>
            <ValarBreathingLogo
              enabled={breathingEnabled}
              selectedValarIndices={selectedValarIndices}
              opacity={breathingOpacity}
              logoSize={logoSize}
              cycleDuration={technique ? (technique.ih + (technique.hi || 0) + technique.ex + (technique.ho || 0)) / 1000 : 10}
              technique={technique}
              cvMode={cvMode}
            >
              <div className="nenya-logo-glow">
                <NenyaLogo size={logoSize} showValarOrbit={orbitEnabled} showLogo={logoVisible} />
              </div>
            </ValarBreathingLogo>
          </div>
        </div>
        
        {/* Breathing Text with Scroll Indicator */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0.7s both' }} className={`pb-8 space-y-4 transition-opacity duration-500`}>
          <p className="text-xl md:text-2xl text-center text-muted-foreground">
            Take a Moment to Breathe
          </p>
          
          {/* Animated Scroll Indicator */}
          <div className="flex justify-center animate-bounce">
            <ChevronDown className="size-6 text-muted-foreground/50" />
          </div>
        </div>
      </div>
      
      {/* Second Section: Welcome Text and CTA */}
      <div className="min-h-screen flex items-center justify-center px-6 py-8 relative snap-start">
        <div className={`text-center space-y-12 max-w-3xl w-full transition-opacity duration-500`}>
          {/* Welcome Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl">
              Find Your Center Through Your Senses
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Begin with a moment to breathe. Everything else can wait.
            </p>
          </div>

          {/* Call to Action */}
          <div className="pt-6">
            <Button
              id="tutorial-cta"
              size="lg"
              onClick={onContinue}
              className="gap-2 text-lg px-8 py-6 bg-nenya-accent-warm hover:bg-nenya-accent-secondary text-background-elevated"
            >
              Explore Your Senses
              <ArrowRight className="size-5" />
            </Button>
          </div>

          {/* Animated Scroll Indicator */}
          <div className="flex justify-center animate-bounce pt-8">
            <ChevronDown className="size-6 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      {/* Third Section: About the Breathing Tool */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative snap-start">
        <div className="text-center space-y-8 max-w-4xl w-full" style={{ color: '#FFF8E7' }}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            About the Breathing Tool
          </h2>

          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border">
            <button
              onClick={() => setIsBreathingInfoExpanded(!isBreathingInfoExpanded)}
              className="w-full p-6 flex items-center justify-between text-left transition-all hover:opacity-90"
            >
              <h3 className="text-xl md:text-2xl">
                Learn About Resonance Breathing
              </h3>
              {isBreathingInfoExpanded ? (
                <ChevronUp className="size-6 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="size-6 flex-shrink-0 ml-2" />
              )}
            </button>

            {isBreathingInfoExpanded && (
              <div className="px-6 pb-6 space-y-6 text-left">
                <p className="text-lg md:text-xl">
                  The pulsing animation isn't just there to look nice — it's meant to guide your actual breath, using something called a <strong>resonance breathing technique</strong>.
                </p>

                <div className="space-y-4">
                  <h4 className="text-xl md:text-2xl text-center">One Approach: Resonance Breathing</h4>
                  <p className="text-lg md:text-xl">
                    The Breathing Tool pulses at a rhythm of <strong>around 6 breaths per minute</strong>. This specific frequency is scientifically recognized for its profound effect on the nervous system. Research, such as that cited by the National Institutes of Health, indicates that breathing at this pace:
                  </p>

                  <ul className="space-y-3 text-base md:text-lg pl-6">
                    <li className="list-disc">
                      <strong>Can support Heart Rate Variability (HRV):</strong> This is a key marker of your body's resilience and ability to self-regulate.
                    </li>
                    <li className="list-disc">
                      <strong>May activate the Baroreflex:</strong> This is your body's primary blood pressure regulation system, promoting a state of calm and balance.
                    </li>
                    <li className="list-disc">
                      <strong>Encourages synchronisation of cardiovascular and respiratory rhythms:</strong> This synchronization creates a powerful, coherent state between your heart, lungs, and brain, reducing psychological and physiological stress.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl md:text-2xl text-center">Your Built-In Breathing Pacer</h4>
                  <p className="text-lg md:text-xl">
                    By simply sitting with the Breathing Tool and synchronizing your breath to its gentle pulse—<em>inhaling as it brightens, exhaling as it softens</em>—you engage in a proven self-regulation technique before you even begin your sensory reflection.
                  </p>

                  <p className="text-lg md:text-xl">
                    This is the first gift of the sanctuary: a moment of somatic stillness. It prepares the ground for introspection by first calming the body, allowing you to step out of the frantic rhythm of daily life and into a state receptive enough to hear the subtle language of your own senses.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      {/* Fourth Section: Support This Work */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative snap-start">
        <div className="text-center space-y-8 max-w-3xl w-full">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl">
              Support This Work
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Nenya is free to use and privately run — no advertising, no data collection,
              no subscription required. It stays that way because people choose to support it.
            </p>
          </div>

          <Card className="p-8 bg-card/80 dark:bg-card/50 backdrop-blur-sm border-nenya-gold/30 space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-nenya-gold/20 flex items-center justify-center">
                <Heart className="size-8 text-nenya-gold" />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="text-2xl text-nenya-gold-light text-center">
                What You're Supporting
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nenya is a hybrid work of visual art, literature, and contemplative
                technology — a digital sanctuary built for reflection, emotional
                regulation, and ethical self-inquiry. The breathing interface, the
                color gateways, the guided reflection: each element is designed to
                leave you more present than when you arrived.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                It is built by Estëlle, a developer-philosopher and
                artist whose practice asks what technology could look like if it
                helped us feel more human rather than less. Nenya models that
                answer: a free, open tool that gives more than it takes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nenya is fiscally sponsored by Fractured Atlas, a 501(c)(3) public
                charity. Donations are tax-deductible to the extent permitted by law
                and handled with full financial transparency.
              </p>
            </div>

            <Button
              size="lg"
              className="gap-3 bg-nenya-gold hover:bg-nenya-gold-dark text-background-elevated px-8 py-6 text-lg w-full sm:w-auto"
              asChild
            >
              <a
                href="https://fundraising.fracturedatlas.org/nenya"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heart className="size-5" />
                Donate via Fractured Atlas
                <ExternalLink className="size-4" />
              </a>
            </Button>

            <p className="text-xs text-muted-foreground">
              Fiscally sponsored by{' '}
              <a
                href="https://www.fracturedatlas.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Fractured Atlas
              </a>
              , a 501(c)(3) public charity
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}