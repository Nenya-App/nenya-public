import { useState, useEffect } from 'react';
import EagleProtocolDemoSelector from './EagleProtocolDemoSelector';
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
import PantheonOfNeeds from './about/PantheonOfNeeds';
import NVCMethod from './about/NVCMethod';
import PrivacyPromise from './about/PrivacyPromise';
import Structure from './about/Structure';
import SupportUs from './about/SupportUs';
import TermsOfService from './about/TermsOfService';
import { AppFooter } from './AppFooter';
import PIIScrubbingDemo from './PIIScrubbingDemo';
import { ErrorBoundary } from './ErrorBoundary';

interface AboutNenyaProps {
  onBack: () => void;
  onRestartDemo?: () => void;
  initialSection?: string;
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
  | 'pantheon-of-needs'
  | 'nvc-method' 
  | 'privacy-promise'
  | 'pii-scrubbing'
  | 'eagle-protocol'
  | 'venice-chat'
  | 'structure' 
  | 'support-us'
  | 'terms';

export default function AboutNenya({ onBack, onRestartDemo, initialSection }: AboutNenyaProps) {
  const [currentSection, setCurrentSection] = useState<AboutSection>(
    (initialSection as AboutSection) || 'menu'
  );

  // Scroll to top when section changes
  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.scroll-container');
    scrollContainers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'instant' });
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSection]);

  const handleBackToMenu = () => setCurrentSection('menu');

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
      {currentSection === 'pantheon-of-needs' && (
        <div className="size-full overflow-y-auto scroll-container">
          <button 
            onClick={handleBackToMenu}
            className="sticky top-0 left-0 z-40 m-4 px-4 py-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Menu
          </button>
          <PantheonOfNeeds onExploreGateways={onRestartDemo} />
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
      {currentSection === 'eagle-protocol' && (
        <>
          <EagleProtocolDemoSelector />
          <button 
            onClick={handleBackToMenu}
            className="fixed top-4 left-4 z-[60] px-4 py-2 text-sm bg-background/95 backdrop-blur-md border rounded-lg text-muted-foreground hover:text-foreground transition-colors shadow-lg"
          >
            ← Back to Menu
          </button>
        </>
      )}
      {currentSection === 'venice-chat' && (
        <VeniceChat onBack={handleBackToMenu} />
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
      <AppFooter />
    </ErrorBoundary>
  );
}