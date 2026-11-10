import { useState, useEffect, useRef } from 'react';
import VeniceChat from './about/VeniceChat';
import AboutTheFounder from './about/AboutTheFounder';
import AboutMenu from './about/AboutMenu';
import ContactUs from './about/ContactUs';
import Mellonamin from './about/Mellonamin';
import EvolvedLeadership from './about/EvolvedLeadership';
import BioSocialDesign from './about/BioSocialDesign';
import NamePhilosophy from './about/NamePhilosophy';
import PowerOfColor from './about/PowerOfColor';
import SixGateways from './about/SixGateways';
import BreathingTool from './about/BreathingTool';
import PantheonOfNeeds from './about/PantheonOfNeeds';
import NVCMethod from './about/NVCMethod';
import PrivacyPromise from './about/PrivacyPromise';
import Structure from './about/Structure';
import SupportUs from './about/SupportUs';
import TermsOfService from './about/TermsOfService';
import PartnerPractice from './about/PartnerPractice';
import PIIScrubbingDemo from './PIIScrubbingDemo';
import { ErrorBoundary } from './ErrorBoundary';
import { AppFooter } from './AppFooter';

interface AboutNenyaProps {
  onBack: () => void;
  onRestartDemo?: () => void;
  initialSection?: string;
  onOpenPartnerPreview?: () => void;
}

type AboutSection = 
  | 'menu' 
  | 'mellonamin'
  | 'about-founder'
  | 'contact-us'
  | 'evolved-leader'
  | 'bio-social-design'
  | 'name-philosophy' 
  | 'power-of-color'
  | 'six-gateways'
  | 'breathing-tool'
  | 'pantheon-of-needs'
  | 'nvc-method' 
  | 'privacy-promise'
  | 'pii-scrubbing'
  | 'venice-chat'
  | 'witnessed'
  | 'where-we-stand'
  | 'partner-practice'
  | 'structure' 
  | 'support-us'
  | 'terms';

import WitnessedConversations from './about/WitnessedConversations';
import WhereWeStand from './about/WhereWeStand';
import { aboutPath, aboutSectionFromLocation, aboutTitle } from '../../lib/aboutRoutes';

export default function AboutNenya({ onBack, onRestartDemo, initialSection, onOpenPartnerPreview }: AboutNenyaProps) {
  const [currentSection, setCurrentSection] = useState<AboutSection>(
    (initialSection as AboutSection) || 'menu'
  );
  const pantheonScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when section changes
  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.scroll-container');
    scrollContainers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'instant' });
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSection]);

  const handleBackToMenu = () => setCurrentSection('menu');

  // The address follows the page: /about for the menu, /about/<section> for a page. A new address is a history entry, so the browser's back button works.
  useEffect(() => {
    const path = aboutPath(currentSection === 'menu' ? '' : currentSection);
    if (window.location.pathname !== path) {
      // Moving between About addresses is a new history entry; arriving by the old ?about= form or from another address replaces it.
      const onAboutPath = /^\/about(\/|$)/i.test(window.location.pathname);
      window.history[onAboutPath ? 'pushState' : 'replaceState'](null, '', path);
    } else if (window.location.search) {
      window.history.replaceState(null, '', path);
    }
    document.title = aboutTitle(currentSection === 'menu' ? '' : currentSection);
  }, [currentSection]);

  // Back and forward between About addresses.
  useEffect(() => {
    const onPop = () => {
      const s = aboutSectionFromLocation(window.location.pathname, window.location.search);
      if (s !== null) setCurrentSection((s || 'menu') as AboutSection);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <ErrorBoundary>
      {currentSection === 'menu' && (
        <AboutMenu 
          onBack={onBack} 
          onRestartDemo={onRestartDemo}
          onNavigateToSection={(section) => setCurrentSection(section as AboutSection)} 
        />
      )}
      {currentSection === 'mellonamin' && (
        <div className="size-full overflow-y-auto scroll-container bg-background">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            <button 
              onClick={handleBackToMenu}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Menu
            </button>
            <Mellonamin />

            <AppFooter />
          </div>
        </div>
      )}
      {currentSection === 'about-founder' && (
        <AboutTheFounder onBack={handleBackToMenu} />
      )}
      {currentSection === 'contact-us' && (
        <ContactUs onBack={handleBackToMenu} />
      )}
      {currentSection === 'evolved-leader' && (
        <EvolvedLeadership onBack={handleBackToMenu} />
      )}
      {currentSection === 'bio-social-design' && (
        <BioSocialDesign onBack={handleBackToMenu} />
      )}
      {currentSection === 'name-philosophy' && (
        <NamePhilosophy onBack={handleBackToMenu} />
      )}
      {currentSection === 'power-of-color' && (
        <PowerOfColor onBack={handleBackToMenu} />
      )}
      {currentSection === 'six-gateways' && (
        <SixGateways onBack={handleBackToMenu} />
      )}
      {currentSection === 'breathing-tool' && (
        <BreathingTool onBack={handleBackToMenu} />
      )}
      {currentSection === 'pantheon-of-needs' && (
        <div ref={pantheonScrollRef} className="size-full overflow-y-auto scroll-container">
          <button
            onClick={handleBackToMenu}
            className="sticky top-0 left-0 z-40 m-4 px-4 py-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Menu
          </button>
          <PantheonOfNeeds containerRef={pantheonScrollRef} />

          <AppFooter />
        </div>
      )}
      {currentSection === 'nvc-method' && (
        <NVCMethod onBack={handleBackToMenu} />
      )}
      {currentSection === 'privacy-promise' && (
        <PrivacyPromise 
          onBack={handleBackToMenu}
          onNavigateToNamePhilosophy={() => setCurrentSection('name-philosophy')}
        />
      )}
      {currentSection === 'pii-scrubbing' && (
        <PIIScrubbingDemo onBack={handleBackToMenu} />
      )}
      {currentSection === 'partner-practice' && (
        <PartnerPractice onBack={handleBackToMenu} onOpenPreview={onOpenPartnerPreview} />
      )}
      {currentSection === 'venice-chat' && (
        <VeniceChat onBack={handleBackToMenu} />
      )}
      {currentSection === 'where-we-stand' && (
        <WhereWeStand onBack={handleBackToMenu} />
      )}
      {currentSection === 'witnessed' && (
        <WitnessedConversations onBack={handleBackToMenu} />
      )}
      {currentSection === 'structure' && (
        <Structure onBack={handleBackToMenu} />
      )}
      {currentSection === 'support-us' && (
        <SupportUs onBack={handleBackToMenu} />
      )}
      {currentSection === 'terms' && (
        <TermsOfService onBack={handleBackToMenu} />
      )}
    </ErrorBoundary>
  );
}