import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { ValarBreathingLogo, BreathingTechnique } from '../ValarBreathingLogo';
import WelcomePopup from '../WelcomePopup';
import { ArrowRight, ChevronDown, Heart, ExternalLink, Play, Pause } from 'lucide-react';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { ContactSection } from '../ContactSection';

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
  cycleStart?: number;
  paused?: boolean;
  onTogglePaused?: () => void;
  onStartTutorial?: () => void;
  entryUnlocked?: boolean;
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
  cycleStart,
  paused = false,
  onTogglePaused,
  onStartTutorial,
  entryUnlocked = false,
}: WelcomePageProps) {
  const [logoSize, setLogoSize] = useState(400);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Advances by one screen's worth of this page's own scroll container
  // (each section below is exactly one viewport tall, and CSS scroll-snap
  // settles the rest of the way) -- matching the same "scroll by ~90% of
  // the viewport" convention ScrollIndicator uses elsewhere, since this
  // page's sections aren't wired through that shared component (its
  // fixed-position, single-instance design doesn't fit three stacked
  // snap-scroll sections each wanting their own in-flow cue).
  const scrollToNextSection = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: container.clientHeight * 0.9, behavior: 'smooth' });
  };

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
    <div ref={scrollContainerRef} className="size-full relative overflow-y-auto snap-y snap-proximity">
      {/* Welcome Popup */}
      <WelcomePopup onNavigateToAbout={onNavigateToAbout} initiallyOpen={false} />

      {/* First Section: Full Viewport with Large Logo */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative snap-start">
        {/* No flex-1 here -- letting this grow-to-fill was pinning the text
            below to the bottom of the viewport on shorter/wider screens,
            leaving a large empty gap above it. The outer section's own
            justify-center now centers this + the text block as one unit. */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0.7s both' }} className={`flex items-center justify-center transition-all duration-500`}>
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

          {/* Opt-in tutorial entry. It never launches on its own (the site keeps
              no memory of past visits), but once the welcome card is dismissed
              it gets a brief gold pulse so it isn't missed. */}
          {onStartTutorial && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onStartTutorial}
                className={`rounded-full border border-nenya-accent-warm/50 px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-nenya-accent-warm transition-colors ${
                  entryUnlocked ? 'nenya-tour-highlight' : ''
                }`}
                style={entryUnlocked ? { animation: 'nenya-tour-pulse 1.6s ease-out 0.4s 3' } : undefined}
              >
                New here? Take a quick tour
              </button>
            </div>
          )}

          {/* Animated Scroll Indicator */}
          <div
            className="flex flex-col items-center gap-0.5 animate-bounce cursor-pointer pt-1"
            onClick={scrollToNextSection}
            role="button"
            tabIndex={0}
            aria-label="See more"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToNextSection();
              }
            }}
          >
            <span className="text-base font-medium text-muted-foreground">More below</span>
            <ChevronDown className="size-9 text-muted-foreground" />
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
          <div
            className="flex justify-center animate-bounce pt-8 cursor-pointer"
            onClick={scrollToNextSection}
            role="button"
            tabIndex={0}
            aria-label="See more"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToNextSection();
              }
            }}
          >
            <ChevronDown className="size-8 text-muted-foreground/70" />
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
              Nenya is a sponsored project of{' '}
              <a
                href="https://www.fracturedatlas.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Fractured Atlas
              </a>
              , a non-profit arts service organization. Contributions for the charitable purposes of Nenya must be made payable to “Fractured Atlas” only and are tax-deductible to the extent permitted by law.
            </p>
          </Card>

          <div
            className="flex flex-col items-center gap-0.5 animate-bounce cursor-pointer pt-2"
            onClick={scrollToNextSection}
            role="button"
            tabIndex={0}
            aria-label="Go to contact"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToNextSection();
              }
            }}
          >
            <span className="text-sm text-muted-foreground">Get in touch</span>
            <ChevronDown className="size-8 text-muted-foreground/70" />
          </div>
        </div>
      </div>

      {/* Fourth Section: Stay in Touch */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative snap-start">
        <ContactSection />
      </div>

      <AppFooter onNavigateToAbout={() => onNavigateToAbout?.()} />
    </div>
  );
}