import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { ValarBreathingLogo, BreathingTechnique } from '../ValarBreathingLogo';
import WelcomePopup from '../WelcomePopup';
import { ArrowRight, ChevronDown, Heart, ExternalLink, Play, Pause } from 'lucide-react';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';

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
  cycleStart?: number;
  paused?: boolean;
  onTogglePaused?: () => void;
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
  cycleStart,
  paused = false,
  onTogglePaused,
}: WelcomePageProps) {
  const [logoSize, setLogoSize] = useState(400);

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
    <div className="size-full relative overflow-y-auto snap-y snap-proximity">
      {/* Welcome Popup */}
      <WelcomePopup onNavigateToAbout={onNavigateToAbout} onDismiss={onEntryUnlocked} />

      {/* First Section: Full Viewport with Large Logo */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative snap-start">
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0.7s both' }} className={`flex-1 flex items-center justify-center transition-all duration-500`}>
          <div
            id="tutorial-logo"
            role="button"
            aria-label={paused ? 'Resume breathing animation' : 'Pause breathing animation'}
            tabIndex={0}
            onClick={onTogglePaused}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTogglePaused?.();
              }
            }}
            className={`relative transition-all duration-500 nenya-logo-clickable cursor-pointer group`}
          >
            <ValarBreathingLogo
              enabled={breathingEnabled}
              selectedValarIndices={selectedValarIndices}
              opacity={breathingOpacity}
              logoSize={logoSize}
              cycleDuration={technique ? (technique.ih + (technique.hi || 0) + technique.ex + (technique.ho || 0)) / 1000 : 10}
              technique={technique}
              cvMode={cvMode}
              cycleStart={cycleStart}
              paused={paused}
            >
              <div className="nenya-logo-glow">
                <NenyaLogo
                  size={logoSize}
                  showValarOrbit={orbitEnabled}
                  showLogo={logoVisible}
                  cycleStart={cycleStart}
                  paused={paused}
                />
              </div>
            </ValarBreathingLogo>

            {/* Pause/play affordance - visible on hover, or always while paused.
                z-30 so it renders above ValarBreathingLogo's content layer (z-10). */}
            <div
              className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 ${
                paused ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
              }`}
            >
              <div className="rounded-full bg-background/70 backdrop-blur-sm p-4">
                {paused ? (
                  <Play className="size-8 text-foreground fill-current" />
                ) : (
                  <Pause className="size-8 text-foreground fill-current" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breathing Text with Scroll Indicator */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0.7s both' }} className={`pb-8 -mt-2 sm:-mt-4 space-y-3 transition-opacity duration-500`}>
          <p className="text-xl md:text-2xl text-center text-muted-foreground">
            Give Yourself a Moment to Breathe
          </p>

          {/* Animated Scroll Indicator */}
          <div className="flex flex-col items-center gap-1 animate-bounce">
            <ChevronDown className="size-6 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/50">Scroll down for more</span>
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

      {/* Third Section: Support This Work */}
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
                It is built by Estëlle, a Minnesota-based designer, educator, and
                artist — though the intention has always been for the work to
                speak for itself. The practice behind it asks what technology
                could look like if it helped us feel more human rather than
                less. Nenya models that answer: a free, open tool that gives
                more than it takes.
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

      <AppFooter onNavigateToAbout={() => onNavigateToAbout?.()} />
    </div>
  );
}