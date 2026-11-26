import { Home, BookOpen, Menu, X, ChevronDown, Settings, HelpCircle, Heart } from 'lucide-react';
import { ShareNenya } from './ShareNenya';
import { Button } from './ui/button';
import { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { NenyaMark } from './NenyaMark';
import type { BreathingTechnique } from '../../lib/breathingPresets';
import { ThemeToggle } from './ThemeToggle';
import { AccessibilitySettingsContent } from './AccessibilitySettings';
import { STRENGTH_STANDARD } from '../../lib/breathStrength';
import { EmergencyExitButton } from './EmergencyExit';
import { AddToHomeScreen } from './AddToHomeScreen';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface GlobalNavigationProps {
  onNavigate: (screen: 'intro' | 'welcome' | 'chat' | 'about') => void;
  onNavigateToAbout?: (section?: string) => void;
  userHasColors?: boolean;
  breathingEnabled?: boolean;
  orbitEnabled?: boolean;
  logoVisible?: boolean;
  breathingStrength?: number;
  textSize?: number;
  onBreathingToggle?: (enabled: boolean) => void;
  onOrbitToggle?: (enabled: boolean) => void;
  onLogoVisibleToggle?: (visible: boolean) => void;
  onStrengthChange?: (opacity: number) => void;
  onTextSizeChange?: (size: number) => void;
  showCounter?: boolean;
  onCounterToggle?: (show: boolean) => void;
  cvMode?: string;
  onCvModeChange?: (mode: string) => void;
  showAnimationControls?: boolean;
  onEmergencyExit?: () => void;
  onBreathingPopoutToggle?: () => void;
  onTutorialReplay?: () => void;
  /** Accessibility dialog shows theme and text size only. */
  compactSettings?: boolean;
  /** The page's pace and clock, so the header logo breathes in phase with the counter and the tones. */
  technique?: BreathingTechnique | null;
  cycleStart?: number;
}

export function GlobalNavigation({
  onNavigate,
  onNavigateToAbout,
  breathingEnabled = true,
  orbitEnabled = true,
  logoVisible = true,
  breathingStrength = STRENGTH_STANDARD,
  textSize = 16,
  onBreathingToggle,
  onOrbitToggle,
  onLogoVisibleToggle,
  onStrengthChange,
  onTextSizeChange,
  showCounter = false,
  onCounterToggle,
  cvMode = '',
  onCvModeChange,
  showAnimationControls = false,
  onEmergencyExit,
  onBreathingPopoutToggle,
  onTutorialReplay,
  compactSettings = false,
  technique = null,
  cycleStart,
}: GlobalNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  
  const handleLogoClick = () => {
    // Toggle breathing popout
    if (onBreathingPopoutToggle) {
      onBreathingPopoutToggle();
    }
  };
  
  const handleNenyaTextClick = () => {
    // Navigate to welcome
    onNavigate('welcome');
  };

  const handleNavigate = (screen: 'intro' | 'about') => {
    onNavigate(screen);
    setMenuOpen(false);
  };

  const handleAccessibilityClick = () => {
    setAccessibilityOpen(true);
    setMenuOpen(false);
  };

  const handleSupportUsClick = () => {
    onNavigateToAbout?.('support-us');
    setMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation: it needs about 920px, so it starts at the desktop width (2026-11-26) */}
      <nav 
        className="hidden lg:flex relative shrink-0 z-50 bg-background border-b border-border shadow-sm pt-[env(safe-area-inset-top)]"
        aria-label="Main navigation"
        role="navigation"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoClick}
                className="hover:opacity-80 transition-opacity"
                aria-label="Open breathing animation"
                title="Open breathing animation & accessibility settings"
              >
                <HeaderLogo size={40} technique={technique} cycleStart={cycleStart} />
              </button>
              <button
                onClick={handleNenyaTextClick}
                className="hover:opacity-80 transition-opacity"
                aria-label="Nenya: return to Welcome"
                title="Return to Welcome page"
              >
                <NenyaMark face="body" playButton={false} className="text-xl font-medium text-foreground" />
              </button>
            </div>

            {/* Right side controls */}
            <div id="tutorial-header-tools-desktop" className="flex items-center gap-3">
              {/* Replay Tutorial */}
              {showAnimationControls && onTutorialReplay ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={onTutorialReplay}
                  aria-label="Take a quick tour"
                  title="Take a quick tour"
                >
                  <HelpCircle className="size-4" />
                  Tour
                </Button>
              ) : null}

              {/* Support Us */}
              {onNavigateToAbout ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-nenya-gold/40 hover:border-nenya-gold hover:bg-nenya-gold/10 hover:text-nenya-gold-text text-nenya-gold-text"
                  onClick={handleSupportUsClick}
                >
                  <Heart className="size-4" />
                  Support Us
                </Button>
              ) : null}

              {/* Share (the whole site, never anything entered) */}
              <ShareNenya variant="header" />

              {/* Add to Home Screen */}
              <AddToHomeScreen variant="icon" />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Simple Dropdown Menu */}
              <div className="relative">
                <Button
                  id="tutorial-menu-desktop"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <Menu className="size-4" />
                  Menu
                  <ChevronDown className={`size-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {menuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      aria-hidden="true"
                      className="fixed inset-0 z-40" 
                      onClick={() => setMenuOpen(false)}
                    />
                    
                    {/* Dropdown content */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => handleNavigate('intro')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <Home className="size-4" />
                          <span>Home</span>
                        </button>
                        <button
                          onClick={() => handleNavigate('about')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <BookOpen className="size-4" />
                          <span>About</span>
                        </button>
                        
                        {showAnimationControls && onBreathingToggle && onOrbitToggle && onStrengthChange ? (
                          <>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={handleAccessibilityClick}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                            >
                              <Settings className="size-4" />
                              <span>Accessibility Settings</span>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Emergency Exit Button */}
              <EmergencyExitButton variant="header" onEmergencyExit={onEmergencyExit} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav 
        className="lg:hidden relative shrink-0 z-50 bg-background border-b border-border shadow-sm pt-[env(safe-area-inset-top)]"
        aria-label="Main navigation"
        role="navigation"
      >
        <div className="flex flex-wrap items-center justify-between gap-y-1 min-h-14 px-2 min-[360px]:px-3 min-[400px]:px-4">
          {/* Logo */}
          <div className="flex items-center gap-1 min-[400px]:gap-2">
            <button
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity"
              aria-label="Open breathing animation"
              title="Open breathing animation & accessibility settings"
            >
              <HeaderLogo size={32} technique={technique} cycleStart={cycleStart} />
            </button>
            <button
              onClick={handleNenyaTextClick}
              className="hover:opacity-80 transition-opacity"
              aria-label="Nenya: return to Welcome"
              title="Return to Welcome page"
            >
              <NenyaMark face="body" short playButton={false} className="font-medium text-foreground" />
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div id="tutorial-header-tools-mobile" className="ml-auto flex items-center gap-0.5 min-[400px]:gap-1.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Simple Menu Button */}
            <Button
              id="tutorial-menu-mobile"
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            {/* Emergency Exit Button */}
            {/* On narrow phones the words may take two lines (and the arrow makes way), so the header and its information button fit. */}
            <EmergencyExitButton variant="header" className="text-xs px-1.5 sm:px-2 py-1 max-[439px]:max-w-[6.5rem] max-[439px]:whitespace-normal max-[439px]:text-left max-[439px]:leading-tight max-[439px]:has-[>svg]:px-2 max-[399px]:[&_svg]:hidden" onEmergencyExit={onEmergencyExit} />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div 
              aria-hidden="true"
              className="fixed inset-0 top-[calc(3.5rem+env(safe-area-inset-top))] bg-black/20 z-40" 
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto">
              <div className="flex flex-col p-2">
                <button
                  onClick={() => handleNavigate('intro')}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Home className="size-5" />
                  <div className="flex-1">
                    <div className="text-sm">Home</div>
                    <div className="text-xs text-muted-foreground">Return to introduction</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('about')}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <BookOpen className="size-5" />
                  <div className="flex-1">
                    <div className="text-sm">About</div>
                    <div className="text-xs text-muted-foreground">Learn about Nenya</div>
                  </div>
                </button>

                {onNavigateToAbout ? (
                  <button
                    onClick={handleSupportUsClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Heart className="size-5 text-nenya-gold-text" />
                    <div className="flex-1">
                      <div className="text-sm">Support Us</div>
                      <div className="text-xs text-muted-foreground">Help keep Nenya free</div>
                    </div>
                  </button>
                ) : null}

                <ShareNenya variant="menu" />
                <AddToHomeScreen variant="menu" />

                {showAnimationControls && onTutorialReplay ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onTutorialReplay();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <HelpCircle className="size-5" />
                    <div className="flex-1">
                      <div className="text-sm">Tour</div>
                      <div className="text-xs text-muted-foreground">Take a quick tour</div>
                    </div>
                  </button>
                ) : null}

                {showAnimationControls && onBreathingToggle && onOrbitToggle && onStrengthChange ? (
                  <>
                    <div className="border-t border-border my-2" />
                    <button
                      onClick={handleAccessibilityClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left w-full"
                    >
                      <Settings className="size-5" />
                      <div className="flex-1">
                        <div className="text-sm">Accessibility Settings</div>
                        <div className="text-xs text-muted-foreground">Customize animations</div>
                      </div>
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Accessibility Settings Dialog */}
      {showAnimationControls && onBreathingToggle && onOrbitToggle && onStrengthChange ? (
        <Dialog open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
          <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Accessibility Settings</DialogTitle>
              <DialogDescription>
                Customize animations and visual effects to suit your preferences.
              </DialogDescription>
            </DialogHeader>
            <AccessibilitySettingsContent
              breathingEnabled={breathingEnabled}
              orbitEnabled={orbitEnabled}
              logoVisible={logoVisible}
              breathingStrength={breathingStrength}
              onBreathingToggle={onBreathingToggle}
              onOrbitToggle={onOrbitToggle}
              onLogoVisibleToggle={onLogoVisibleToggle}
              onStrengthChange={onStrengthChange}
              onTextSizeChange={onTextSizeChange}
              textSize={textSize}
              showCounter={showCounter}
              onCounterToggle={onCounterToggle}
              cvMode={cvMode}
              onCvModeChange={onCvModeChange}
              compact={compactSettings}
              technique={technique}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}