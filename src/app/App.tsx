import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalNavigation } from './components/GlobalNavigation';
import { BreathingPopout } from './components/BreathingPopout';
import { BreathingCounter } from './components/BreathingCounter';
import { WelcomeTutorial } from './components/WelcomeTutorial';
import { AppFooter } from './components/AppFooter';
import { BreathingTechnique } from './components/ValarBreathingLogo';
import TermsAgreementPage from './components/pages/TermsAgreementPage';
import WelcomePage from './components/pages/WelcomePage';

// Everything past the welcome/breathing screen is code-split: a visitor who
// only ever does the breathing exercise shouldn't pay for the Sound
// gateway's audio engine, jsPDF, or the About essays up front.
const GatewaysPage = lazy(() => import('./components/pages/GatewaysPage'));
const SightGatewayPage = lazy(() => import('./components/pages/SightGatewayPage'));
const SoundGatewayPage = lazy(() => import('./components/pages/SoundGatewayPage'));
const TouchGatewayPage = lazy(() => import('./components/pages/TouchGatewayPage'));
const EssenceGatewayPage = lazy(() => import('./components/pages/EssenceGatewayPage'));
const MovementGatewayPage = lazy(() => import('./components/pages/MovementGatewayPage'));
const InsightGatewayPage = lazy(() => import('./components/pages/InsightGatewayPage'));
const InterfaceColorSelection = lazy(() => import('./components/pages/InterfaceColorSelection'));
const GatewayReviewPage = lazy(() => import('./components/pages/GatewayReviewPage'));
const SessionInterface = lazy(() => import('./components/SessionInterface'));
const DyadicCellCreation = lazy(() => import('./components/DyadicCellCreation'));
const DyadicCellInterface = lazy(() => import('./components/DyadicCellInterface'));
const AboutNenya = lazy(() => import('./components/AboutNenya'));

export type Gateway = 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight';

export interface UserColors {
  color1: string;
  color2: string;
  color1Name?: string | null;
  color2Name?: string | null;
  color1Random?: boolean;
  color2Random?: boolean;
  color1Qualities?: string[] | null;
  color2Qualities?: string[] | null;
  gradientDirection?: string;
}

export interface GatewayData {
  gateway: Gateway;
  data: any;
}

export interface AppState {
  selectedGateways: Gateway[];
  currentGatewayIndex: number;
  gatewayData: GatewayData[];
  interfaceColors: UserColors;
}

type ScreenType = 'welcome' | 'home' | 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight' | 'color-selection' | 'gateway-review' | 'session' | 'cell-creation' | 'cell-interface' | 'about';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('welcome');
  const [aboutSection, setAboutSection] = useState<string | undefined>();
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  // Gateway system state
  const [selectedGateways, setSelectedGateways] = useState<Gateway[]>([]);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [gatewayData, setGatewayData] = useState<GatewayData[]>([]);
  const [interfaceColors, setInterfaceColors] = useState<UserColors>({ 
    color1: '#7A9B9E', 
    color2: '#DAC682' 
  });
  const [cellCode, setCellCode] = useState('');
  
  // Animation control state
  const [breathingEnabled, setBreathingEnabled] = useState(true);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [logoVisible, setLogoVisible] = useState(true);
  const [selectedValarIndices, setSelectedValarIndices] = useState<number[]>([]); // Empty array = all colors
  const [breathingOpacity, setBreathingOpacity] = useState(0.5); // Default 50%
  const [textSize, setTextSize] = useState(16); // Default text size
  const [showBreathingCounter, setShowBreathingCounter] = useState(true);
  const [colorBlindMode, setColorBlindMode] = useState('');
  const [breathingTechnique, setBreathingTechnique] = useState<BreathingTechnique>({ ih: 5000, hi: 0, ex: 5000, ho: 0 });

  // Breathing popout state
  const [breathingPopoutOpen, setBreathingPopoutOpen] = useState(false);

  // Gated by the "Speak, Friend, and Enter" welcome card — the breathing
  // counter and tutorial only appear once a visitor has moved past it.
  const [entryUnlocked, setEntryUnlocked] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const hasAutoShownTutorial = useRef(false);

  useEffect(() => {
    if (entryUnlocked && currentScreen === 'welcome' && !hasAutoShownTutorial.current) {
      hasAutoShownTutorial.current = true;
      const t = setTimeout(() => setTutorialActive(true), 400);
      return () => clearTimeout(t);
    }
  }, [entryUnlocked, currentScreen]);

  // Track emergency exit to disable beforeunload warning
  const isEmergencyExiting = useRef(false);

  // Terms agreement is not persisted across sessions (ephemerality by design) —
  // always clear any stored flag before checking, so the modal shows every load.
  useEffect(() => {
    localStorage.removeItem('nenya_terms_agreed');
    if (localStorage.getItem('nenya_terms_agreed') === 'true') {
      setTermsAgreed(true);
    }
  }, []);

  // Set viewport meta tag for proper mobile rendering
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      // Create viewport meta tag if it doesn't exist
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set proper viewport configuration for mobile
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
  }, []);

  // Apply text size changes to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${textSize}px`);
  }, [textSize]);

  // Warn user before refresh if they have gateway data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user has gateway data (has started/completed gateways)
      if (gatewayData.length > 0 && !isEmergencyExiting.current) {
        // Standard way to trigger browser's confirmation dialog
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        // Note: Modern browsers show a generic message like "Changes you made may not be saved"
        // We cannot customize the message, but this triggers the confirmation dialog
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gatewayData]);

  // Gateway selection from home
  const handleGatewaysSelected = (gateways: Gateway[]) => {
    setSelectedGateways(gateways);
    setCurrentGatewayIndex(0);
    setGatewayData([]);
    setPreviousScreen(currentScreen);
    // Navigate to first selected gateway
    setCurrentScreen(gateways[0]);
  };

  // Complete a gateway and move to next
  const handleGatewayComplete = (gateway: Gateway, data: any) => {
    // Update or add gateway data
    const existingIndex = gatewayData.findIndex(g => g.gateway === gateway);
    let newGatewayData: GatewayData[];
    
    if (existingIndex >= 0) {
      // Update existing gateway data - user is editing
      newGatewayData = [...gatewayData];
      newGatewayData[existingIndex] = { gateway, data };
      setGatewayData(newGatewayData);
      
      // If this was the Sight gateway and colors were provided, update interface colors
      if (gateway === 'sight' && data.color1 && data.color2) {
        setInterfaceColors(data);
      }
      
      // Return to where they came from (review or session)
      setCurrentScreen(previousScreen === 'session' || previousScreen === 'gateway-review' ? previousScreen : 'gateway-review');
    } else {
      // Add new gateway data - initial creation flow
      newGatewayData = [...gatewayData, { gateway, data }];
      setGatewayData(newGatewayData);

      // If this was the Sight gateway and colors were provided, set interface colors
      if (gateway === 'sight' && data.color1 && data.color2) {
        setInterfaceColors(data);
      }

      const nextIndex = currentGatewayIndex + 1;
      
      if (nextIndex < selectedGateways.length) {
        // Move to next gateway
        setCurrentGatewayIndex(nextIndex);
        setPreviousScreen(currentScreen);
        setCurrentScreen(selectedGateways[nextIndex]);
      } else {
        // All gateways complete - go to review page
        setPreviousScreen(currentScreen);
        setCurrentScreen('gateway-review');
      }
    }
  };

  // Handle editing a gateway from session or review
  const handleEditGateway = (gateway: Gateway) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(gateway);
  };

  // Handle continuing from gateway review
  const handleContinueFromReview = () => {
    // Check if we need color selection
    const sightData = gatewayData.find(g => g.gateway === 'sight');
    const hasValidSightColors = sightData && sightData.data.color1 && sightData.data.color2;
    
    setPreviousScreen(currentScreen);
    setCurrentScreen(hasValidSightColors ? 'session' : 'color-selection');
  };

  // Handle color selection completion
  const handleColorSelectionComplete = (colors: UserColors) => {
    setInterfaceColors(colors);
    setPreviousScreen(currentScreen);
    setCurrentScreen('session');
  };

  // Navigation handlers
  const handleNavigateToCell = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('cell-creation');
  };

  const handleCreateCell = (code: string) => {
    setCellCode(code);
    setPreviousScreen(currentScreen);
    setCurrentScreen('cell-interface');
  };

  const handleBackToSession = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('session');
  };

  const handleNavigateToAbout = (section?: string) => {
    setPreviousScreen(currentScreen);
    setAboutSection(section);
    setCurrentScreen('about');
  };

  const handleBackFromAbout = () => {
    setAboutSection(undefined);
    setCurrentScreen(previousScreen === 'about' ? 'welcome' : previousScreen);
  };
  
  const handleWelcomeContinue = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('home');
  };

  const handleRestartDemo = () => {
    setPreviousScreen('welcome');
    setCurrentScreen('welcome');
    setAboutSection(undefined);
    setSelectedGateways([]);
    setCurrentGatewayIndex(0);
    setGatewayData([]);
    setInterfaceColors({ color1: '#7A9B9E', color2: '#DAC682' });
    setCellCode('');
  };

  const handleGlobalNavigation = (screen: 'home' | 'session' | 'about' | 'welcome') => {
    setPreviousScreen(currentScreen);
    setAboutSection(undefined);
    
    // If navigating to session but no gateways completed, go to home instead
    if (screen === 'session' && gatewayData.length === 0) {
      setCurrentScreen('home');
    } else if (screen === 'home') {
      // Home now means the Gateways page
      setCurrentScreen('home');
    } else if (screen === 'welcome') {
      // Navigate to the welcome/initialization page
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen(screen as ScreenType);
    }
  };

  // Check if user has completed at least one gateway
  const userHasGatewayData = gatewayData.length > 0;

  // If terms haven't been agreed to, show only the terms page
  if (!termsAgreed) {
    return (
      <ThemeProvider defaultTheme="dark">
        <TermsAgreementPage onAgree={() => setTermsAgreed(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="size-full bg-background relative overflow-hidden flex flex-col">
        {/* Scroll to top on screen change */}
        <ScrollToTop trigger={currentScreen} />
        
        {/* Animated background - subtle lotus pattern */}
        <div className="nenya-background" />
        
        {/* Global Navigation - visible on all screens */}
        <GlobalNavigation 
          currentScreen={
            currentScreen === 'welcome' ? 'intro' : 
            currentScreen === 'home' ? 'intro' : 
            currentScreen === 'session' ? 'chat' : 
            currentScreen === 'sight' || currentScreen === 'sound' || currentScreen === 'touch' || 
            currentScreen === 'essence' || currentScreen === 'movement' || currentScreen === 'insight' ||
            currentScreen === 'color-selection' || currentScreen === 'gateway-review' ||
            currentScreen === 'cell-creation' || currentScreen === 'cell-interface' ? 'intro' :
            currentScreen
          }
          onNavigate={(screen) => {
            if (screen === 'intro') handleGlobalNavigation('home');
            else if (screen === 'welcome') handleGlobalNavigation('welcome');
            else if (screen === 'chat') handleGlobalNavigation('session');
            else handleGlobalNavigation(screen as any);
          }}
          onNavigateToAbout={handleNavigateToAbout}
          userHasColors={userHasGatewayData}
          breathingEnabled={breathingEnabled}
          orbitEnabled={orbitEnabled}
          logoVisible={logoVisible}
          selectedValarIndices={selectedValarIndices}
          breathingOpacity={breathingOpacity}
          textSize={textSize}
          onBreathingToggle={setBreathingEnabled}
          onOrbitToggle={setOrbitEnabled}
          onLogoVisibleToggle={setLogoVisible}
          onValarSelect={setSelectedValarIndices}
          onOpacityChange={setBreathingOpacity}
          onTextSizeChange={setTextSize}
          showCounter={showBreathingCounter}
          onCounterToggle={setShowBreathingCounter}
          cvMode={colorBlindMode}
          onCvModeChange={setColorBlindMode}
          showAnimationControls={currentScreen === 'welcome'}
          onEmergencyExit={() => { isEmergencyExiting.current = true; }}
          onBreathingPopoutToggle={() => setBreathingPopoutOpen(!breathingPopoutOpen)}
          onTutorialReplay={() => setTutorialActive(true)}
        />

        {currentScreen === 'welcome' && entryUnlocked && (
          <BreathingCounter
            id="tutorial-breathing-counter"
            enabled={breathingEnabled}
            show={showBreathingCounter}
            ih={breathingTechnique.ih}
            hi={breathingTechnique.hi || 0}
            ex={breathingTechnique.ex}
            ho={breathingTechnique.ho || 0}
            onTechniqueChange={setBreathingTechnique}
          />
        )}

        {currentScreen === 'welcome' && (
          <WelcomeTutorial isOpen={tutorialActive} onClose={() => setTutorialActive(false)} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={null}>
          {currentScreen === 'welcome' && (
            <WelcomePage
              onContinue={handleWelcomeContinue}
              breathingEnabled={breathingEnabled}
              orbitEnabled={orbitEnabled}
              logoVisible={logoVisible}
              selectedValarIndices={selectedValarIndices}
              breathingOpacity={breathingOpacity}
              onNavigateToAbout={handleNavigateToAbout}
              technique={breathingTechnique}
              cvMode={colorBlindMode}
              onEntryUnlocked={() => setEntryUnlocked(true)}
            />
          )}

          {currentScreen === 'home' && (
            <GatewaysPage 
              onGatewaysSelected={handleGatewaysSelected}
            />
          )}
          
          {currentScreen === 'sight' && (
            <SightGatewayPage 
              onComplete={(data) => handleGatewayComplete('sight', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('sight')}
              totalGateways={selectedGateways.length}
            />
          )}
          
          {currentScreen === 'sound' && (
            <SoundGatewayPage
              onComplete={(data) => handleGatewayComplete('sound', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('sound')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'touch' && (
            <TouchGatewayPage
              onComplete={(data) => handleGatewayComplete('touch', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('touch')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'essence' && (
            <EssenceGatewayPage
              onComplete={(data) => handleGatewayComplete('essence', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('essence')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'movement' && (
            <MovementGatewayPage
              onComplete={(data) => handleGatewayComplete('movement', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('movement')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'insight' && (
            <InsightGatewayPage
              onComplete={(data) => handleGatewayComplete('insight', data)}
              onBack={() => setCurrentScreen(previousScreen === 'gateway-review' || previousScreen === 'session' ? previousScreen : 'home')}
              currentIndex={selectedGateways.indexOf('insight')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}
          
          {currentScreen === 'color-selection' && (
            <InterfaceColorSelection 
              onComplete={handleColorSelectionComplete}
              onBack={() => setCurrentScreen('gateway-review')}
            />
          )}
          
          {currentScreen === 'gateway-review' && (
            <GatewayReviewPage
              gatewayData={gatewayData}
              selectedGateways={selectedGateways}
              onContinue={handleContinueFromReview}
              onEditGateway={handleEditGateway}
            />
          )}
          
          {currentScreen === 'session' && (
            <SessionInterface 
              interfaceColors={interfaceColors}
              gatewayData={gatewayData}
              selectedGateways={selectedGateways}
              onNavigateToCell={handleNavigateToCell}
              onBackToHome={() => setCurrentScreen('home')}
              onNavigateToAbout={handleNavigateToAbout}
              onUpdateGatewayData={setGatewayData}
              onEditGateway={handleEditGateway}
            />
          )}
          
          {currentScreen === 'cell-creation' && (
            <DyadicCellCreation 
              onCreateCell={handleCreateCell}
              onBack={handleBackToSession}
            />
          )}
          
          {currentScreen === 'cell-interface' && (
            <DyadicCellInterface 
              userColors={interfaceColors}
              cellCode={cellCode}
              onBack={handleBackToSession}
            />
          )}
          
          {currentScreen === 'about' && (
            <AboutNenya 
              onBack={handleBackFromAbout} 
              onRestartDemo={handleRestartDemo}
              initialSection={aboutSection}
            />
          )}
          </Suspense>
        </div>

        {/* Persistent footer, visible on every screen without needing to scroll */}
        <AppFooter onNavigateToAbout={() => handleNavigateToAbout()} />

        {/* Breathing Popout */}
        <BreathingPopout
          isOpen={breathingPopoutOpen}
          onClose={() => setBreathingPopoutOpen(false)}
          breathingEnabled={breathingEnabled}
          orbitEnabled={orbitEnabled}
          logoVisible={logoVisible}
          selectedValarIndices={selectedValarIndices}
          breathingOpacity={breathingOpacity}
          textSize={textSize}
          onBreathingToggle={setBreathingEnabled}
          onOrbitToggle={setOrbitEnabled}
          onLogoVisibleToggle={setLogoVisible}
          onValarSelect={setSelectedValarIndices}
          onOpacityChange={setBreathingOpacity}
          onTextSizeChange={setTextSize}
          showBreathingCounter={showBreathingCounter}
          onCounterToggle={setShowBreathingCounter}
          cvMode={colorBlindMode}
          onCvModeChange={setColorBlindMode}
        />
      </div>
    </ThemeProvider>
  );
}