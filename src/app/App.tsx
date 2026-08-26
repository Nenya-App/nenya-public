import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalNavigation } from './components/GlobalNavigation';
import { BreathingPopout } from './components/BreathingPopout';
import { BreathingCounter } from './components/BreathingCounter';
import { WelcomeTutorial } from './components/WelcomeTutorial';
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

type ScreenType = 'welcome' | 'home' | 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight' | 'color-selection' | 'gateway-review' | 'session' | 'cell-creation' | 'cell-interface' | 'about';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  // Real navigation history instead of a single "previousScreen" value.
  // A single value can only ever answer "what screen came immediately
  // before this one" -- it breaks the moment a screen is reachable more
  // than one step deep (which is most of the gateway flow), since each
  // forward step overwrites the one before it. A stack lets "back" from
  // gateway 3 correctly land on gateway 2, not jump all the way home.
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);
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

  // Single shared clock anchor for the breathing pulse animation and the
  // numeric counter, so they read the same phase instead of each timing
  // itself from whenever it happened to last mount. Only resets when the
  // technique itself changes (a real change in cycle shape) -- not for
  // opacity, colorblind mode, or visibility toggles.
  const [breathingCycleStart, setBreathingCycleStart] = useState(() => Date.now());
  useEffect(() => {
    setBreathingCycleStart(Date.now());
  }, [breathingTechnique]);

  // Pause/play for the breathing pulse, orbit, and numeric counter together
  // (triggered by clicking the large logo). On resume we shift the shared
  // clock forward by however long playback was frozen, so every animation
  // picks back up at the same phase it paused at instead of jumping ahead
  // to "catch up" for the paused duration.
  const [breathingPaused, setBreathingPaused] = useState(false);
  const pausedAtRef = useRef<number | null>(null);
  const toggleBreathingPaused = () => {
    setBreathingPaused((wasPaused) => {
      if (wasPaused) {
        if (pausedAtRef.current != null) {
          const pausedMs = Date.now() - pausedAtRef.current;
          setBreathingCycleStart((s) => s + pausedMs);
          pausedAtRef.current = null;
        }
        return false;
      }
      pausedAtRef.current = Date.now();
      return true;
    });
  };

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

  // Navigate forward: remember where we came from, then switch screens.
  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((h) => [...h, currentScreen]);
    setCurrentScreen(screen);
  };

  // Navigate back: pop the most recent screen off history. Falls back to
  // a caller-supplied default if history is somehow empty (shouldn't
  // normally happen, but a screen reached by a direct link or a future
  // bug shouldn't leave "back" with nowhere to go).
  const navigateBack = (fallback: ScreenType = 'welcome') => {
    setScreenHistory((h) => {
      if (h.length === 0) {
        setCurrentScreen(fallback);
        return h;
      }
      const next = [...h];
      const target = next.pop()!;
      setCurrentScreen(target);
      return next;
    });
  };

  // Warn user before refresh/close if they'd lose in-progress reflection
  // data. Previously this only checked gatewayData.length, which is empty
  // until a gateway is fully completed -- so refreshing mid-way through
  // even the very first gateway (colors picked, sliders moved, nothing
  // submitted yet) triggered no warning at all and silently lost it.
  // Nothing persists to a server or localStorage, so any screen inside the
  // actual reflection flow represents work that a refresh would destroy.
  useEffect(() => {
    const screensWithNothingToLose: ScreenType[] = ['welcome', 'home', 'about'];
    const hasUnsavedProgress = !screensWithNothingToLose.includes(currentScreen);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedProgress && !isEmergencyExiting.current) {
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
  }, [currentScreen]);

  // Gateway selection from home
  const handleGatewaysSelected = (gateways: Gateway[]) => {
    setSelectedGateways(gateways);
    setCurrentGatewayIndex(0);
    setGatewayData([]);
    navigateTo(gateways[0]);
  };

  // Complete a gateway and move to next
  const handleGatewayComplete = (gateway: Gateway, data: any) => {
    const wasAlreadyComplete = gatewayData.length === selectedGateways.length;
    const existingIndex = gatewayData.findIndex(g => g.gateway === gateway);

    const newGatewayData =
      existingIndex >= 0
        ? gatewayData.map((g, i) => (i === existingIndex ? { gateway, data } : g))
        : [...gatewayData, { gateway, data }];
    setGatewayData(newGatewayData);

    // If this was the Sight gateway and colors were provided, sync interface colors
    if (gateway === 'sight' && data.color1 && data.color2) {
      setInterfaceColors(data);
    }

    const allComplete = selectedGateways.every((g) => newGatewayData.some((gd) => gd.gateway === g));

    if (allComplete) {
      if (wasAlreadyComplete) {
        // Every gateway already had data *before* this update -- this was
        // a genuine edit-in-place (reached via the Edit button on review
        // or session), so return to wherever that edit was launched from.
        navigateBack('gateway-review');
      } else {
        // Finishing the sequence for the first time.
        navigateTo('gateway-review');
      }
    } else {
      // Still gateways left with no data yet. Advance to the next one
      // that's actually incomplete -- not just "index + 1" -- so that
      // going Back to an earlier gateway mid-sequence and re-submitting
      // it resumes forward progress instead of jumping to review or home.
      const nextGateway = selectedGateways.find((g) => !newGatewayData.some((gd) => gd.gateway === g));
      if (nextGateway) {
        setCurrentGatewayIndex(selectedGateways.indexOf(nextGateway));
        navigateTo(nextGateway);
      }
    }
  };

  // Handle editing a gateway from session or review
  const handleEditGateway = (gateway: Gateway) => {
    navigateTo(gateway);
  };

  // Handle continuing from gateway review
  const handleContinueFromReview = () => {
    // Check if we need color selection
    const sightData = gatewayData.find(g => g.gateway === 'sight');
    const hasValidSightColors = sightData && sightData.data.color1 && sightData.data.color2;

    navigateTo(hasValidSightColors ? 'session' : 'color-selection');
  };

  // Handle color selection completion
  const handleColorSelectionComplete = (colors: UserColors) => {
    setInterfaceColors(colors);
    navigateTo('session');
  };

  // Navigation handlers
  const handleNavigateToCell = () => {
    navigateTo('cell-creation');
  };

  const handleCreateCell = (code: string) => {
    setCellCode(code);
    navigateTo('cell-interface');
  };

  const handleBackToSession = () => {
    navigateBack('session');
  };

  const handleNavigateToAbout = (section?: string) => {
    setAboutSection(section);
    navigateTo('about');
  };

  const handleBackFromAbout = () => {
    setAboutSection(undefined);
    navigateBack('welcome');
  };

  const handleWelcomeContinue = () => {
    navigateTo('home');
  };

  const handleRestartDemo = () => {
    setScreenHistory([]);
    setCurrentScreen('welcome');
    setAboutSection(undefined);
    setSelectedGateways([]);
    setCurrentGatewayIndex(0);
    setGatewayData([]);
    setInterfaceColors({ color1: '#7A9B9E', color2: '#DAC682' });
    setCellCode('');
  };

  const handleGlobalNavigation = (screen: 'home' | 'session' | 'about' | 'welcome') => {
    setAboutSection(undefined);

    // If navigating to session but no gateways completed, go to home instead
    if (screen === 'session' && gatewayData.length === 0) {
      navigateTo('home');
    } else {
      navigateTo(screen as ScreenType);
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
            cycleStart={breathingCycleStart}
            paused={breathingPaused}
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
              cycleStart={breathingCycleStart}
              paused={breathingPaused}
              onTogglePaused={toggleBreathingPaused}
            />
          )}

          {currentScreen === 'home' && (
            <GatewaysPage
              onGatewaysSelected={handleGatewaysSelected}
              onBack={() => navigateBack('welcome')}
            />
          )}
          
          {currentScreen === 'sight' && (
            <SightGatewayPage 
              onComplete={(data) => handleGatewayComplete('sight', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('sight')}
              totalGateways={selectedGateways.length}
            />
          )}
          
          {currentScreen === 'sound' && (
            <SoundGatewayPage
              onComplete={(data) => handleGatewayComplete('sound', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('sound')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'touch' && (
            <TouchGatewayPage
              onComplete={(data) => handleGatewayComplete('touch', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('touch')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'essence' && (
            <EssenceGatewayPage
              onComplete={(data) => handleGatewayComplete('essence', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('essence')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'movement' && (
            <MovementGatewayPage
              onComplete={(data) => handleGatewayComplete('movement', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('movement')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}

          {currentScreen === 'insight' && (
            <InsightGatewayPage
              onComplete={(data) => handleGatewayComplete('insight', data)}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('insight')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
            />
          )}
          
          {currentScreen === 'color-selection' && (
            <InterfaceColorSelection
              onComplete={handleColorSelectionComplete}
              onBack={() => navigateBack('gateway-review')}
            />
          )}

          {currentScreen === 'gateway-review' && (
            <GatewayReviewPage
              gatewayData={gatewayData}
              selectedGateways={selectedGateways}
              onContinue={handleContinueFromReview}
              onEditGateway={handleEditGateway}
              onBack={() => navigateBack('home')}
            />
          )}

          {currentScreen === 'session' && (
            <SessionInterface
              interfaceColors={interfaceColors}
              gatewayData={gatewayData}
              selectedGateways={selectedGateways}
              onNavigateToCell={handleNavigateToCell}
              onBackToHome={() => navigateBack('home')}
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