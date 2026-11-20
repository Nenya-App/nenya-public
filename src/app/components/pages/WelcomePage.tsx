import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import NenyaLogo from '../NenyaLogo';
import { ValarBreathingLogo, BreathingTechnique } from '../ValarBreathingLogo';
import QuickNav from '../QuickNav';
import { ArrowRight } from 'lucide-react';
import { AppFooter } from '../AppFooter';
import { SupportThisWork } from '../SupportThisWork';
import { ContactSection } from '../ContactSection';
import { LOGO_ALT_NO_ORBS, LOGO_ALT_SHORT } from '../../../lib/altText';
import { GATEWAY_SUMMARIES } from '../../../lib/gatewaySummaries';
import { SenseIcon } from '../SenseIcon';
import { MoreBelowButton } from '../MoreBelowButton';

import { L } from '../../../lib/vocabulary';
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
  /** Clicking the big logo opens the same panel as the small one in the top left: breathing animation and accessibility settings. */
  onLogoClick?: () => void;
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
  onLogoClick,
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
      {/* Quick navigation, bottom right: Breathe (home), Reflect (the gateways), Coach. It replaces the welcome message the sparkle used to reopen. */}
      <QuickNav onBreathe={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} onReflect={onContinue} />

      {/* First Section: Full Viewport with Large Logo */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative snap-start">
        {/* No flex-1 here -- letting this grow-to-fill was pinning the text
            below to the bottom of the viewport on shorter/wider screens,
            leaving a large empty gap above it. The outer section's own
            justify-center now centers this + the text block as one unit. */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0s both' }} className={`flex items-center justify-center transition-all duration-500`}>
          {/* Clicking the logo opens the breathing and accessibility settings, the same as the small logo in the top left (a button for the keyboard and screen readers, too). Hovering brightens the glow. */}
          <div
            id="tutorial-logo"
            className={`relative transition-all duration-500 nenya-logo-hover ${onLogoClick ? 'cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring' : ''}`}
            {...(onLogoClick
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': 'Open breathing animation and accessibility settings',
                  title: 'Open breathing animation & accessibility settings',
                  onClick: onLogoClick,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLogoClick();
                    }
                  },
                }
              : {})}
          >
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
                  alt={orbitEnabled ? LOGO_ALT_SHORT : LOGO_ALT_NO_ORBS}
                />
              </div>
            </ValarBreathingLogo>

          </div>
        </div>

        {/* Breathing Text with Scroll Indicator */}
        <div style={{ animation: 'nenya-bg-reveal 0.5s ease 0s both' }} className={`pb-8 mt-5 sm:mt-8 space-y-6 transition-opacity duration-500`}>
          <p className="text-xl md:text-2xl text-center text-muted-foreground">
            Take a Moment to Breathe
          </p>

          {/* The "Enter" button: glows, and pulses once at the end of each breath in that breath's colour */}
          <div className="flex justify-center pt-3">
            <MoreBelowButton label="Enter" ariaLabel="Enter" onClick={scrollToNextSection} cycleStart={cycleStart} technique={technique} />
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

          {/* The six gateways in a sentence each: short by default, nothing to open */}
          <section aria-labelledby="gateways-overview" className="mx-auto max-w-xl space-y-4 text-left">
            <h2 id="gateways-overview" className="text-center text-xl md:text-2xl">The six {L('gateways')}</h2>
            <p className="text-center text-base text-muted-foreground">
              Each one asks about where you are now and where you would like to be. Pick up any of them, in any order, as many or
              as few as you like. Choosing fewer can be more helpful than choosing many.
            </p>
            <dl className="space-y-3">
              {GATEWAY_SUMMARIES.map((g) => (
                <div key={g.id}>
                  <dt className="flex items-center gap-2 font-medium"><SenseIcon id={g.id} />{g.name}</dt>
                  <dd className="text-muted-foreground">{g.summary}</dd>
                </div>
              ))}
            </dl>
            <p className="text-center text-sm text-muted-foreground">
              Whatever you add can be seen together and saved as a report, made on your device.
            </p>
          </section>

          {/* Call to Action */}
          <div className="pt-6">
            <Button
              id="tutorial-cta"
              size="lg"
              onClick={onContinue}
              className="gap-2 text-lg px-8 py-6 bg-nenya-accent-warm hover:bg-nenya-gold-light text-primary-foreground"
            >
              Explore Your Senses
              <ArrowRight className="size-5" />
            </Button>
          </div>

          <div className="flex justify-center pt-8">
            <MoreBelowButton ariaLabel="Continue" onClick={scrollToNextSection} cycleStart={cycleStart} technique={technique} />
          </div>
        </div>
      </div>

      {/* Third Section: Support This Work */}
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative snap-start">
        <div className="text-center space-y-8 max-w-3xl w-full">
          <SupportThisWork />

          <div className="flex justify-center pt-2">
            <MoreBelowButton label="Get in touch" ariaLabel="Go to contact" onClick={scrollToNextSection} cycleStart={cycleStart} technique={technique} />
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