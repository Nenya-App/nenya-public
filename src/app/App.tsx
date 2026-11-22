import { lensTrayOn, openLens, addLens, removeLens, reportShape, readSavedDraft, lensStatus, LENS_ORDER, type LensId, type LensState, type LensAdded } from '../lib/lensState';
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { setSessionMarkId } from '../lib/sessionMarkStore';
import SkipLink from './components/SkipLink';
import { ThemeProvider } from './components/ThemeProvider';
import { usePref, termsAcceptedFor } from '../lib/deviceMemory';
import { LEGAL_EFFECTIVE_DATE } from '../lib/legalDocument';
import { aboutSectionFromLocation, SITE_TITLE } from '../lib/aboutRoutes';
import { melodyColorsFor, melodyShared } from '../lib/melodySeed';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalNavigation } from './components/GlobalNavigation';
import { setKeptPalettes } from '../lib/keptPalettes';
import { BreathingPopout } from './components/BreathingPopout';
import { WelcomeTutorial, type TutorialStepId } from './components/WelcomeTutorial';
import { TourOffer } from './components/TourOffer';
import { LoadingVeil } from './components/LoadingVeil';
import { EmergencyExitDock } from './components/EmergencyExit';
import { BreathTonesSwitch, TonesAnnouncer } from './components/BreathTonesSwitch';
import { PortableBreath, useBreathRhythm } from './components/PortableBreath';
import { preloadLogoAssets } from '../lib/preload';
import { enableUsageCounts, countEvents, countEvent, countPageView } from '../lib/usageCounts';
import { PRESETS, sameTechnique } from '../lib/breathingPresets';
import { setBreathingPanel, toggleBreathingPanel, useBreathingPanel } from '../lib/breathingPanel';
import OnboardingFlow from './components/OnboardingFlow';
import { SECTION_PATHS, sectionOfPath, sectionOfScreen, sectionsOn } from '../lib/sections';
import { guestbookOn } from '../lib/guestbook';
import { SaveReflectionContext, type SaveReflectionApi } from './components/SaveReflection';
import { normalizeId, openReflection, purgeExpired, saveReflection, saveReflectionOn, type SavedPayload } from '../lib/savedReflection';
import { newShadow, sessionIdFor, termsFirstOn } from '../lib/shadowSession';
import WelcomePage from './components/pages/WelcomePage';
import { BodyMapData } from './components/BodyMapAvatar';
import { BodyMapBrushContext } from './components/BodyMapBrushContext';
import { brushesFor, cleanStrokes, lensName } from '../lib/bodyMapBrush';

// Everything past the welcome/breathing screen is code-split: a visitor who
// only ever does the breathing exercise shouldn't pay for the Sound
// gateway's audio engine, jsPDF, or the About essays up front.
const GatewaysPage = lazy(() => import('./components/pages/GatewaysPage'));
const LensTrayPage = lazy(() => import('./components/pages/LensTrayPage'));
const SightGatewayPage = lazy(() => import('./components/pages/SightGatewayPage'));
const SoundGatewayPage = lazy(() => import('./components/pages/SoundGatewayPage'));
const TouchGatewayPage = lazy(() => import('./components/pages/TouchGatewayPage'));
const EssenceGatewayPage = lazy(() => import('./components/pages/EssenceGatewayPage'));
const MovementGatewayPage = lazy(() => import('./components/pages/MovementGatewayPage'));
const InsightGatewayPage = lazy(() => import('./components/pages/InsightGatewayPage'));
const SessionKeyPicker = lazy(() => import('../coach/SessionKeyPicker'));
const GatewayReviewPage = lazy(() => import('./components/pages/GatewayReviewPage'));
const CoachDemo = lazy(() => import('../coach/CoachDemo'));
const GuestbookPage = lazy(() => import('./components/pages/GuestbookPage'));
const RegionGate = lazy(() => import('../coach/RegionGate').then((m) => ({ default: m.RegionGate })));
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
  // These were being set by SightGatewayPage's onComplete payload and read
  // downstream (the sensory report's intensity lines) without ever being
  // declared here -- harmless at runtime since nothing enforces this type,
  // but it meant the interface didn't actually describe the data flowing
  // through it.
  color1Intensity?: number | null;
  color2Intensity?: number | null;
  gradientDirection?: string;
  /** Up to two palettes the person made in the Sight gateway and chose to keep (their own colours; see src/lib/colorSchemes.ts). */
  generatedPalettes?: import('../lib/colorSchemes').GeneratedPalette[] | null;
}

export interface GatewayData {
  gateway: Gateway;
  data: any;
}

type ScreenType = 'welcome' | 'home' | 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight' | 'color-selection' | 'gateway-review' | 'session' | 'cell-creation' | 'cell-interface' | 'about' | 'guestbook';

export default function App() {
  // An address under /about (or the older /?about=<section>) opens that About page.
  const [initialAbout] = useState<string | null>(() => {
    try {
      return aboutSectionFromLocation(window.location.pathname, window.location.search);
    } catch {
      return null;
    }
  });
  // With the section addresses on (VITE_SECTION_ADDRESSES, or the lens tray), /senses opens the gateway choice; / and /breath the front page (src/lib/sections.ts).
  const [arrivedAtSenses] = useState(() => {
    try {
      return initialAbout === null && sectionsOn() && sectionOfPath(window.location.pathname) === 'senses';
    } catch {
      return false;
    }
  });
  // "Sign Our Guestbook" has its own address (VITE_GUESTBOOK=on): arriving there opens it, after the Terms.
  const [arrivedAtGuestbook] = useState(() => {
    try {
      return initialAbout === null && guestbookOn() && /^\/guestbook\/?$/.test(window.location.pathname);
    } catch {
      return false;
    }
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialAbout !== null ? 'about' : arrivedAtGuestbook ? 'guestbook' : arrivedAtSenses ? 'home' : 'welcome');
  // Arrived on a page other than the welcome page (a link to an About page, or straight to /senses, which means reflection was chosen):
  // the first-visit panel then skips the breathing-rhythm choice, and asks only the Terms.
  const [arrivedElsewhere] = useState(initialAbout !== null || arrivedAtSenses || arrivedAtGuestbook);
  // Real navigation history instead of a single "previousScreen" value.
  // A single value can only ever answer "what screen came immediately
  // before this one" -- it breaks the moment a screen is reachable more
  // than one step deep (which is most of the gateway flow), since each
  // forward step overwrites the one before it. A stack lets "back" from
  // gateway 3 correctly land on gateway 2, not jump all the way home.
  const [, setScreenHistory] = useState<ScreenType[]>([]);
  const [aboutSection, setAboutSection] = useState<string | undefined>(initialAbout || undefined);
  // Agreement is asked every visit unless the visitor chose "Remember on this device" and the terms are unchanged.
  // The browser's back button from an About address to a non-About one leaves the About pages.
  useEffect(() => {
    const onPop = () => {
      // With the section addresses on, Back and Forward move between Breath, Senses and Coach. A reflection stays in memory either way.
      if (guestbookOn() && /^\/guestbook\/?$/.test(window.location.pathname) && currentScreen !== 'guestbook') {
        setAboutSection(undefined);
        setCurrentScreen('guestbook');
        return;
      }
      const sec = sectionsOn() ? sectionOfPath(window.location.pathname) : null;
      if (sec && sec !== sectionOfScreen(currentScreen)) {
        setAboutSection(undefined);
        const done = gatewayDataRef.current.length > 0;
        setCurrentScreen(sec === 'breath' ? 'welcome' : sec === 'senses' ? (done ? 'gateway-review' : 'home') : done ? 'session' : 'home');
        return;
      }
      if (currentScreen === 'about' && aboutSectionFromLocation(window.location.pathname, window.location.search) === null) {
        setAboutSection(undefined);
        setCurrentScreen('welcome');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [currentScreen]);
  // Leaving the About pages by the app's own buttons returns the address and the title to the site's own. With the section addresses on,
  // the address follows the part of the site: a new history entry when the part changes, the same entry when it does not (so "/" becomes
  // "/breath" without adding a step), and the canonical and share addresses follow.
  const firstAddress = useRef(true);
  useEffect(() => {
    if (currentScreen === 'about') return;
    const sec = sectionsOn() ? sectionOfScreen(currentScreen) : null;
    const leavingAbout = aboutSectionFromLocation(window.location.pathname, '') !== null;
    if (currentScreen === 'guestbook' && guestbookOn()) {
      if (!/^\/guestbook\/?$/.test(window.location.pathname)) window.history[firstAddress.current || leavingAbout ? 'replaceState' : 'pushState'](null, '', '/guestbook');
      firstAddress.current = false;
      document.title = SITE_TITLE;
      return;
    }
    if (sec) {
      const target = SECTION_PATHS[sec];
      if (window.location.pathname !== target) {
        const sameSection = sectionOfPath(window.location.pathname) === sec;
        if (firstAddress.current || sameSection || leavingAbout) window.history.replaceState(null, '', target);
        else window.history.pushState(null, '', target);
      }
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://nenya.biz${target}`);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://nenya.biz${target}`);
    } else if (leavingAbout) {
      window.history.replaceState(null, '', '/');
    }
    firstAddress.current = false;
    document.title = SITE_TITLE;
  }, [currentScreen]);
  const [termsAgreed, setTermsAgreed] = useState(() => termsAcceptedFor(LEGAL_EFFECTIVE_DATE));
  
  // Gateway system state
  const [selectedGateways, setSelectedGateways] = useState<Gateway[]>([]);
  const [gatewayData, setGatewayData] = useState<GatewayData[]>([]);
  // Tray mode only (VITE_LENS_TRAY): lenses opened but not added. gatewayData is the added list.
  const [examined, setExamined] = useState<LensId[]>([]);
  // Read by the Back/Forward handler, which is set up before this state exists.
  const gatewayDataRef = useRef<GatewayData[]>([]);
  gatewayDataRef.current = gatewayData;
  // The palettes the visitor kept in the Sight lens are offered as colour choices for the logo (Settings, Logo look). They are held in memory only, for the visit (src/lib/keptPalettes.ts).
  useEffect(() => {
    setKeptPalettes(gatewayData.find((g) => g.gateway === 'sight')?.data?.generatedPalettes ?? []);
  }, [gatewayData]);
  // Shared across every gateway -- not owned by Sight or any one gateway's
  // data blob, so it persists regardless of which gateways are visited or
  // in what order.
  const [bodyMapData, setBodyMapData] = useState<BodyMapData>({ placements: [], notes: {} });
  const [interfaceColors, setInterfaceColors] = useState<UserColors>({ 
    color1: '#7A9B9E', 
    color2: '#DAC682' 
  });
  const [cellCode, setCellCode] = useState('');
  
  // Animation control state
  // These display choices are kept on the device only if the visitor turned on "Remember on this device".
  const [breathingEnabled, setBreathingEnabled] = usePref('breathingEnabled', true);
  const [orbitEnabled, setOrbitEnabled] = usePref('orbitEnabled', true);
  const [logoVisible, setLogoVisible] = usePref('logoVisible', true);
  const [breathingOpacity, setBreathingOpacity] = usePref('breathingOpacity', 1); // Default 100%
  const [textSize, setTextSize] = usePref('textSize', 16); // Default text size
  const [showBreathingCounter, setShowBreathingCounter] = usePref('showBreathingCounter', true);
  const [colorBlindMode, setColorBlindMode] = usePref('colorBlindMode', '');
  // One pace and one clock for the ring, the counter, the tones, the panel and the header logo, on every screen (src/app/components/PortableBreath.tsx).
  const { technique: breathingTechnique, setTechnique: setBreathingTechnique, cycleStart: breathingCycleStart } = useBreathRhythm();

  // Breathing popout state
  // Open or closed, shared with every logo that opens it (src/lib/breathingPanel.ts).
  const breathingPopoutOpen = useBreathingPanel();
  const setBreathingPopoutOpen = setBreathingPanel;

  // The logo's files (the gem sprite, the petals and bezel, the flat logo) are loaded before the first screen is
  // shown, behind a short loading screen, so the logo does not pop in piece by piece.
  const [assetsReady, setAssetsReady] = useState(false);
  const [veilGone, setVeilGone] = useState(false);
  useEffect(() => {
    // On the welcome screen with the gem showing, also wait for the gem's first frame to be drawn.
    preloadLogoAssets(undefined, currentScreen === 'welcome' && orbitEnabled && logoVisible).then(() => setAssetsReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The first-visit panel (rhythm choice, then the terms) is an overlay on the welcome page. The breathing counter
  // appears once the terms are accepted (or at once for a visitor whose agreement was remembered), and a short tour
  // is offered right after that.
  const [entryUnlocked, setEntryUnlocked] = useState(termsAgreed);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tourOffered, setTourOffered] = useState(false);

  // The tour is never started on its own for a returning visitor (the site keeps no memory of past visits unless
  // asked): it is offered once after the terms are accepted, and can be started from the welcome page's quiet link
  // or replayed from the header.
  //
  // The breathing counter starts minimized. The tour opens its pattern list for the counter step only, and the
  // counter folds back the moment the tour moves on or ends, whether by finishing, skipping or the "x".
  const [breathingCounterMinimized, setBreathingCounterMinimized] = useState(true);

  const handleStartTutorial = () => {
    setTutorialActive(true);
  };

  // A returning visitor who chose to remember their agreement has already agreed: counting may begin at once. A screen
  // is counted when it is shown (when it changes), and only after agreement.
  useEffect(() => {
    if (!termsAgreed) return;
    enableUsageCounts();
    countPageView(currentScreen);
  }, [currentScreen, termsAgreed]);

  const lastTutorialStep = useRef<TutorialStepId | null>(null);
  const handleTutorialStep = (id: TutorialStepId | null) => {
    if (id) lastTutorialStep.current = id;
    setBreathingCounterMinimized(id !== 'counter');
  };

  // Counting begins only once the terms are agreed. Agreeing is the first thing counted, with the rhythm that was
  // chosen (nothing before this point is counted, so the rhythm is recorded here, not when it was picked).
  // (The start chooser was removed on 2026-11-18; where to go next is the quick nav's job.)
  const handleOnboardingFinish = (_agreement?: Promise<void>) => {
    enableUsageCounts();
    const rhythm = PRESETS.find((p) => sameTechnique(breathingTechnique, p));
    const rhythmName = rhythm && !arrivedElsewhere && !termsFirstOn() ? ({ '6·6': 'steady', '5·5': 'resonance', '4·6': 'calming', '3·3': 'lively', '4·8': 'deep-calm', Box: 'box', '4-7-8': '478' } as Record<string, string>)[rhythm.lb] : undefined;
    countEvents(['onboarding.terms.accepted', ...(rhythmName ? [`onboarding.rhythm.${rhythmName}`] : [])]);
    setBreathingCounterMinimized(true);
    setEntryUnlocked(true);
    setTermsAgreed(true);
    // Only on the welcome screen: that is where the tour points.
    if (currentScreen === 'welcome') setTourOffered(true);
  };

  // Track emergency exit to disable beforeunload warning
  const isEmergencyExiting = useRef(false);

  // The old terms flag is never read: agreement is remembered only through deviceMemory, and only on
  // request. Clear the legacy key left by earlier versions so the modal logic has one source of truth.
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
    
    // No viewport-fit=cover: that opts the page into drawing under the notch
    // and status bar, which some iOS browsers (Brave) then place the header
    // beneath. Without it, browsers keep the layout inside the safe area.
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
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
    // The guestbook holds nothing to lose itself; a reflection in memory still does.
    const hasUnsavedProgress = currentScreen === 'guestbook' ? gatewayData.length > 0 : !screensWithNothingToLose.includes(currentScreen);

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
  }, [currentScreen, gatewayData.length]);

  // Gateway selection from home
  // "Save and return later" (VITE_SAVE_REFLECTION=on; src/lib/savedReflection.ts). The session ID is the two colors from Sight (or Sound's
  // melody colors); before either, a random "shadow" pair kept for this visit only. Neither the ID nor the passcode is ever stored.
  const saveOn = saveReflectionOn();
  // With VITE_TERMS_FIRST the pair is made at agreement, kept in memory for the whole session and made again on request (src/lib/shadowSession.ts).
  const termsFirst = termsFirstOn();
  const [shadow, setShadow] = useState(() => (termsFirst && !termsAgreed ? '' : newShadow()));
  useEffect(() => { if (termsFirst && termsAgreed && !shadow) setShadow(newShadow()); }, [termsFirst, termsAgreed, shadow]);
  useEffect(() => {
    if (saveOn) purgeExpired();
  }, [saveOn]);
  const sightDone = gatewayData.find((g) => g.gateway === 'sight')?.data;
  const soundDone = gatewayData.find((g) => g.gateway === 'sound')?.data;
  const sessionId = sessionIdFor(sightDone, soundDone, shadow);
  // The mark in the footer is a visual form of the session ID (src/lib/nameMark.ts).
  useEffect(() => { setSessionMarkId(sessionId || null); }, [sessionId]);
  const saveApi: SaveReflectionApi = {
    on: saveOn,
    canSave: gatewayData.length > 0,
    sessionId,
    save: (passcode) => {
      // Tray mode saves version 2: the added lenses (selectedGateways keeps the same meaning) plus the ones opened but not added. Off: version 1, as before.
      const payload: SavedPayload = lensTrayOn()
        ? { v: 2, selectedGateways: gatewayData.map((g) => g.gateway), examined, gatewayData, bodyMapData, interfaceColors }
        : { v: 1, selectedGateways, gatewayData, bodyMapData, interfaceColors };
      return saveReflection(payload, sessionId, passcode);
    },
    open: async (id, passcode) => {
      const saved = await openReflection(id, passcode);
      if (!saved) return false;
      if (lensTrayOn()) {
        // A version 1 or 2 draft opens at the tray: what was added is back, and the lenses opened but not added are remembered.
        const draft = readSavedDraft(saved);
        if (!draft) return false;
        setSelectedGateways(draft.gatewayData.map((g) => g.gateway as Gateway));
        setGatewayData(draft.gatewayData as GatewayData[]);
        setExamined(draft.examined);
        setBodyMapData({ ...(saved.bodyMapData as BodyMapData), strokes: cleanStrokes((saved.bodyMapData as BodyMapData | undefined)?.strokes) });
        setInterfaceColors(saved.interfaceColors);
        setShadow(normalizeId(id) ?? shadow);
        navigateTo('home');
        return true;
      }
      const gateways = saved.selectedGateways as Gateway[];
      const data = saved.gatewayData as GatewayData[];
      setSelectedGateways(gateways);
      setGatewayData(data);
      setBodyMapData(saved.bodyMapData as BodyMapData);
      setInterfaceColors(saved.interfaceColors);
      setShadow(normalizeId(id) ?? shadow); // a shadow ID stays the same if they save again
      const next = gateways.find((g) => !data.some((d) => d.gateway === g));
      navigateTo(next ?? 'gateway-review');
      return true;
    },
  };

  const trayState: LensState = { added: gatewayData as LensAdded[], examined };
  const handleOpenLens = (lens: LensId) => {
    // A plain total per lens (docs/lens-rewrite-scope.md 3c): the first time it is opened in this visit. No order, no time.
    if (lensStatus(trayState, lens) === 'not-opened') countEvent(`lens.opened.${lens}`);
    const opened = openLens(trayState, lens);
    setExamined(opened.examined);
    setSelectedGateways([...new Set([...gatewayData.map((g) => g.gateway), lens])].sort((a, b) => LENS_ORDER.indexOf(a as LensId) - LENS_ORDER.indexOf(b as LensId)) as Gateway[]);
    navigateTo(lens as ScreenType);
  };
  const handleRemoveLens = (lens: LensId) => {
    const next = removeLens(trayState, lens);
    setGatewayData(next.added as GatewayData[]);
    setExamined(next.examined);
    setSelectedGateways(next.added.map((a) => a.gateway as Gateway));
  };

  const handleGatewaysSelected = (gateways: Gateway[]) => {
    setSelectedGateways(gateways);
    setGatewayData([]);
    navigateTo(gateways[0]);
  };

  // Complete a gateway and move to next
  const handleGatewayComplete = (gateway: Gateway, data: any) => {
    if (lensTrayOn()) {
      if (lensStatus({ added: gatewayData as LensAdded[], examined }, gateway as LensId) !== 'included') countEvent(`lens.added.${gateway}`);
      const next = addLens({ added: gatewayData, examined }, gateway as LensId, data);
      setGatewayData(next.added as GatewayData[]);
      setExamined(next.examined);
      setSelectedGateways(next.added.map((a) => a.gateway as Gateway));
      if (gateway === 'sight' && data.color1 && data.color2) setInterfaceColors(data);
      navigateTo('home');
      return;
    }
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
    setGatewayData([]);
    setExamined([]);
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

  // The shared body map (lens tray only): the paintbrush is offered, with a brush for each color and surface the added lenses gave; the lenses it announced as picked up are kept here so the tray says it once.
  const [pickedSeen, setPickedSeen] = useState<LensId[]>([]);
  const brushValue = useMemo(() => ({ enabled: lensTrayOn(), brushes: lensTrayOn() ? brushesFor(gatewayData as LensAdded[]) : [], strokes: bodyMapData.strokes ?? [] }), [gatewayData, bodyMapData.strokes]);
  // The report's copy of the map names the lenses it picked up (the same sentence on the review page, in the text and PDF reports and for the coach). Not kept with the map itself.
  const reportBodyMap = useMemo<BodyMapData>(() => (lensTrayOn() ? { ...bodyMapData, pickedUp: gatewayData.map((g) => lensName(g.gateway as LensId)) } : bodyMapData), [bodyMapData, gatewayData]);

  return (
    <SaveReflectionContext.Provider value={saveApi}>
    <BodyMapBrushContext.Provider value={brushValue}>
    <ThemeProvider defaultTheme="dark">
      <SkipLink />
      {/* First in the page, above every overlay: the header's Exit is out of reach behind the loading screen, the first-visit panel and the tour. */}
      <EmergencyExitDock
        show={!veilGone || !termsAgreed || tourOffered || tutorialActive}
        onEmergencyExit={() => { isEmergencyExiting.current = true; }}
      />
      <TonesAnnouncer />
      {!veilGone && <LoadingVeil ready={assetsReady} onDone={() => setVeilGone(true)} />}
      {/* Mounted under the loading screen, solid, so nothing half-drawn shows when the loading screen fades. */}
      {!termsAgreed && (
        <OnboardingFlow
          veilGone={veilGone}
          skipRhythm={arrivedElsewhere}
          technique={breathingTechnique}
          onTechniqueChange={setBreathingTechnique}
          onFinish={handleOnboardingFinish}
        />
      )}
      {tourOffered && (
        <TourOffer
          onAccept={() => {
            countEvent('tour.accepted');
            lastTutorialStep.current = null;
            setTourOffered(false);
            handleStartTutorial();
          }}
          onDecline={() => {
            countEvent('tour.declined');
            setTourOffered(false);
          }}
        />
      )}
      {/* Nothing behind the onboarding can be reached until the terms are accepted. */}
      <div
        className="size-full bg-background relative overflow-hidden flex flex-col"
        {...(!termsAgreed || tourOffered ? ({ inert: '' } as Record<string, string>) : {})}
      >
        {/* Breathing tones: first in the reading and tab order, hidden until it has keyboard focus. */}
        <BreathTonesSwitch variant="skip" />
        {/* Scroll to top on screen change */}
        <ScrollToTop trigger={currentScreen} />
        
        {/* Animated background - subtle lotus pattern */}
        <div className="nenya-background" />
        
        {/* Global Navigation - visible on all screens */}
        <GlobalNavigation 
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
          breathingOpacity={breathingOpacity}
          textSize={textSize}
          onBreathingToggle={setBreathingEnabled}
          onOrbitToggle={setOrbitEnabled}
          onLogoVisibleToggle={setLogoVisible}
          onOpacityChange={setBreathingOpacity}
          onTextSizeChange={setTextSize}
          showCounter={showBreathingCounter}
          onCounterToggle={setShowBreathingCounter}
          cvMode={colorBlindMode}
          onCvModeChange={setColorBlindMode}
          showAnimationControls={currentScreen === 'welcome'}
          onEmergencyExit={() => { isEmergencyExiting.current = true; }}
          onBreathingPopoutToggle={toggleBreathingPanel}
          onTutorialReplay={handleStartTutorial}
          technique={breathingTechnique}
          cycleStart={breathingCycleStart}
        />

        {/* The counter and the tones on every screen once the terms are accepted (portable, owner 2026-11-15). The tour points at it on the front page. */}
        <PortableBreath
          ready={entryUnlocked}
          breathingEnabled={breathingEnabled}
          showCounter={showBreathingCounter}
          technique={breathingTechnique}
          onTechniqueChange={setBreathingTechnique}
          cycleStart={breathingCycleStart}
          id={currentScreen === 'welcome' ? 'tutorial-breathing-counter' : undefined}
          minimized={breathingCounterMinimized}
          onMinimizedChange={setBreathingCounterMinimized}
        />

        {currentScreen === 'welcome' && (
          <WelcomeTutorial
            isOpen={tutorialActive}
            onStepChange={handleTutorialStep}
            onClose={() => {
              if (lastTutorialStep.current === 'reflection') countEvent('tour.completed');
              lastTutorialStep.current = null;
              setTutorialActive(false);
              setBreathingCounterMinimized(true);
            }}
          />
        )}

        {/* Main Content Area */}
        <div id="main-content" role="main" tabIndex={-1} className="flex-1 overflow-hidden outline-none">
          <Suspense fallback={null}>
          {currentScreen === 'welcome' && (
            <WelcomePage
              onContinue={handleWelcomeContinue}
              breathingEnabled={breathingEnabled}
              orbitEnabled={orbitEnabled}
              logoVisible={logoVisible}
              breathingOpacity={breathingOpacity}
              onNavigateToAbout={handleNavigateToAbout}
              technique={breathingTechnique}
              cvMode={colorBlindMode}
              cycleStart={breathingCycleStart}
              onLogoClick={toggleBreathingPanel}
            />
          )}

          {currentScreen === 'guestbook' && (
            <Suspense fallback={null}>
              <GuestbookPage onBack={() => navigateBack('welcome')} sessionId={sessionId} />
            </Suspense>
          )}

          {currentScreen === 'home' && lensTrayOn() && (
            <Suspense fallback={null}>
              <LensTrayPage state={trayState} onOpen={handleOpenLens} onRemove={handleRemoveLens} onReport={() => navigateTo('gateway-review')} onBack={() => navigateBack('welcome')} onNewName={() => setShadow(newShadow())} bodyMapData={bodyMapData} onUpdateBodyMap={setBodyMapData} userColors={gatewayData.find((g) => g.gateway === 'sight')?.data} pickedSeen={pickedSeen} onPickedSeen={(next) => setPickedSeen((prev) => (prev.join(',') === next.join(',') ? prev : next))} />
            </Suspense>
          )}

          {currentScreen === 'home' && !lensTrayOn() && (
            <GatewaysPage
              onGatewaysSelected={handleGatewaysSelected}
              onBack={() => navigateBack('welcome')}
            />
          )}
          
          {currentScreen === 'sight' && (
            <SightGatewayPage
              onComplete={(data) => handleGatewayComplete('sight', data)}
              initialData={gatewayData.find((g) => g.gateway === 'sight')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('sight')}
              totalGateways={selectedGateways.length}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
              melodyColors={melodyColorsFor(gatewayData.find((g) => g.gateway === 'sound')?.data)}
              melodyShared={melodyShared(gatewayData.find((g) => g.gateway === 'sound')?.data)}
              soundComesLater={selectedGateways.includes('sound') && !gatewayData.some((g) => g.gateway === 'sound')}
            />
          )}

          {currentScreen === 'sound' && (
            <SoundGatewayPage
              onComplete={(data) => handleGatewayComplete('sound', data)}
              initialData={gatewayData.find((g) => g.gateway === 'sound')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('sound')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
              sightComesLater={lensTrayOn() ? !gatewayData.some((g) => g.gateway === 'sight') : selectedGateways.includes('sight') && !gatewayData.some((g) => g.gateway === 'sight')}
            />
          )}

          {currentScreen === 'touch' && (
            <TouchGatewayPage
              onComplete={(data) => handleGatewayComplete('touch', data)}
              initialData={gatewayData.find((g) => g.gateway === 'touch')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('touch')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
            />
          )}

          {currentScreen === 'essence' && (
            <EssenceGatewayPage
              onComplete={(data) => handleGatewayComplete('essence', data)}
              initialData={gatewayData.find((g) => g.gateway === 'essence')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('essence')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
            />
          )}

          {currentScreen === 'movement' && (
            <MovementGatewayPage
              onComplete={(data) => handleGatewayComplete('movement', data)}
              initialData={gatewayData.find((g) => g.gateway === 'movement')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('movement')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
            />
          )}

          {currentScreen === 'insight' && (
            <InsightGatewayPage
              onComplete={(data) => handleGatewayComplete('insight', data)}
              initialData={gatewayData.find((g) => g.gateway === 'insight')?.data}
              onBack={() => navigateBack('home')}
              currentIndex={selectedGateways.indexOf('insight')}
              totalGateways={selectedGateways.length}
              userColors={gatewayData.find(gd => gd.gateway === 'sight')?.data}
              bodyMapData={bodyMapData}
              onUpdateBodyMap={setBodyMapData}
            />
          )}
          
          {currentScreen === 'color-selection' && (
            <SessionKeyPicker
              onComplete={handleColorSelectionComplete}
              onBack={() => navigateBack('gateway-review')}
            />
          )}

          {currentScreen === 'gateway-review' && (
            <GatewayReviewPage
              gatewayData={gatewayData}
              selectedGateways={selectedGateways}
              examinedLine={lensTrayOn() ? reportShape(trayState).line : undefined}
              onContinue={handleContinueFromReview}
              onGuestbook={guestbookOn() ? () => navigateTo('guestbook') : undefined}
              onEditGateway={handleEditGateway}
              onBack={() => navigateBack('home')}
              bodyMapData={reportBodyMap}
            />
          )}

          {currentScreen === 'session' && (
            <RegionGate onBack={() => navigateBack('home')} onBreathe={() => handleGlobalNavigation('welcome')}>
            <CoachDemo
              colors={interfaceColors}
              report={gatewayData.length > 0 ? { gatewayData: gatewayData.map((gd) => ({ gateway: gd.gateway, data: gd.data })), bodyMap: reportBodyMap } : undefined}
              onBack={() => navigateBack('home')}
              onBreathe={() => handleGlobalNavigation('welcome')}
              onPartnerPractice={handleNavigateToCell}
              onGuestbook={guestbookOn() ? () => navigateTo('guestbook') : undefined}
            />
            </RegionGate>
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
              onOpenPartnerPreview={() => {
                setAboutSection('partner-practice');
                handleNavigateToCell();
              }}
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
          breathingOpacity={breathingOpacity}
          textSize={textSize}
          onBreathingToggle={setBreathingEnabled}
          onOrbitToggle={setOrbitEnabled}
          onLogoVisibleToggle={setLogoVisible}
          onOpacityChange={setBreathingOpacity}
          onTextSizeChange={setTextSize}
          showBreathingCounter={showBreathingCounter}
          onCounterToggle={setShowBreathingCounter}
          cvMode={colorBlindMode}
          onCvModeChange={setColorBlindMode}
          technique={breathingTechnique}
          onTechniqueChange={setBreathingTechnique}
          cycleStart={breathingCycleStart}
        />
      </div>
    </ThemeProvider>
    </BodyMapBrushContext.Provider>
    </SaveReflectionContext.Provider>
  );
}