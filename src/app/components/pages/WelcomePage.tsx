import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { ValarBreathingLogo, BreathingTechnique } from '../ValarBreathingLogo';
import WelcomePopup from '../WelcomePopup';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { AppFooter } from '../AppFooter';
import { SupportThisWork } from '../SupportThisWork';
import { ContactSection } from '../ContactSection';

interface WelcomePageProps {
  onContinue: () => void;
  breathingEnabled: boolean;
  orbitEnabled: boolean;
  logoVisible?: boolean;
  breathingOpacity: number;
  onNavigateToAbout?: (section?: string) => void;
  technique?: BreathingTechnique | null;
  cvMode?: string;
  cycleStart?: number;
  onStartTutorial?: () => void;
  entryUnlocked?: boolean;
}

export default function WelcomePage({
  onContinue,
  breathingEnabled,
  orbitEnabled,
  logoVisible = true,
  breathingOpacity,
  onNavigateToAbout,
  technique = null,
  cvMode = '',
  cycleStart,
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
      <WelcomePopup initiallyOpen={false} />

      {/* First Section: Full Viewport with Large Logo */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative snap-start">
        {/* No flex-1 here -- letting this grow-to-fill was pinning the text
            below to the bottom of the viewport on shorter/wider screens,
            leaving a large empty gap above it. The outer section's own
            justify-center now centers this + the text block as one unit. */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0s both' }} className={`flex items-center justify-center transition-all duration-500`}>
          {/* Not interactive: hovering only brightens the glow. */}
          <div id="tutorial-logo" className="relative transition-all duration-500 nenya-logo-hover">
            <ValarBreathingLogo
              enabled={breathingEnabled}
              opacity={breathingOpacity}
              logoSize={logoSize}
              cycleDuration={technique ? (technique.ih + (technique.hi || 0) + technique.ex + (technique.ho || 0)) / 1000 : 10}
              technique={technique}
              cvMode={cvMode}
              cycleStart={cycleStart}
            >
              <div className="nenya-logo-glow">
                <NenyaLogo
                  size={logoSize}
                  showValarOrbit={orbitEnabled}
                  showLogo={logoVisible}
                  cycleStart={cycleStart}
                  technique={technique}
                  breathingEnabled={breathingEnabled}
                  glow
                />
              </div>
            </ValarBreathingLogo>

          </div>
        </div>

        {/* Breathing Text with Scroll Indicator */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0s both' }} className={`pb-8 -mt-2 sm:-mt-4 space-y-3 transition-opacity duration-500`}>
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
          <SupportThisWork />

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