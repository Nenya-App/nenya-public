import { Home, BookOpen, Menu, X, ChevronDown, Settings, HelpCircle, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import NenyaLogo from './NenyaLogo';
import { ThemeToggle } from './ThemeToggle';
import { AccessibilitySettingsContent } from './AccessibilitySettings';
import { EmergencyExitButton } from './EmergencyExit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface GlobalNavigationProps {
  currentScreen: 'intro' | 'welcome' | 'chat' | 'cell-creation' | 'cell-interface' | 'about';
  onNavigate: (screen: 'intro' | 'welcome' | 'chat' | 'about') => void;
  onNavigateToAbout?: (section?: string) => void;
  onLogoClick?: () => void;
  userHasColors?: boolean;
  breathingEnabled?: boolean;
  orbitEnabled?: boolean;
  logoVisible?: boolean;
  selectedValarIndices?: number[];
  breathingOpacity?: number;
  textSize?: number;
  onBreathingToggle?: (enabled: boolean) => void;
  onOrbitToggle?: (enabled: boolean) => void;
  onLogoVisibleToggle?: (visible: boolean) => void;
  onValarSelect?: (indices: number[]) => void;
  onOpacityChange?: (opacity: number) => void;
  onTextSizeChange?: (size: number) => void;
  showCounter?: boolean;
  onCounterToggle?: (show: boolean) => void;
  cvMode?: string;
  onCvModeChange?: (mode: string) => void;
  showAnimationControls?: boolean;
  onEmergencyExit?: () => void;
  onBreathingPopoutToggle?: () => void;
  onTutorialReplay?: () => void;
}

export function GlobalNavigation({
  currentScreen,
  onNavigate,
  onNavigateToAbout,
  onLogoClick,
  breathingEnabled = true,
  orbitEnabled = true,
  logoVisible = true,
  selectedValarIndices = [],
  breathingOpacity = 0.5,
  textSize = 16,
  onBreathingToggle,
  onOrbitToggle,
  onLogoVisibleToggle,
  onValarSelect,
  onOpacityChange,
  onTextSizeChange,
  showCounter = false,
  onCounterToggle,
  cvMode = '',
  onCvModeChange,
  showAnimationControls = false,
  onEmergencyExit,
  onBreathingPopoutToggle,
  onTutorialReplay,
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
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
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
                <NenyaLogo size={40} />
              </button>
              <button
                onClick={handleNenyaTextClick}
                className="hover:opacity-80 transition-opacity"
                aria-label="Return to Welcome"
                title="Return to Welcome page"
              >
                <span className="text-xl bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
                  Nenya
                </span>
              </button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Replay Tutorial */}
              {showAnimationControls && onTutorialReplay ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onTutorialReplay}
                  aria-label="Replay tutorial"
                  title="Replay tutorial"
                >
                  <HelpCircle className="size-4" />
                </Button>
              ) : null}

              {/* Support Us */}
              {onNavigateToAbout ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-nenya-gold/40 hover:border-nenya-gold hover:bg-nenya-gold/10 hover:text-nenya-gold-dark text-nenya-gold-dark"
                  onClick={handleSupportUsClick}
                >
                  <Heart className="size-4" />
                  Support Us
                </Button>
              ) : null}

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
                        
                        {showAnimationControls && onBreathingToggle && onOrbitToggle && onValarSelect && onOpacityChange ? (
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
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        aria-label="Main navigation"
        role="navigation"
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity"
              aria-label="Open breathing animation"
              title="Open breathing animation & accessibility settings"
            >
              <NenyaLogo size={32} />
            </button>
            <button
              onClick={handleNenyaTextClick}
              className="hover:opacity-80 transition-opacity"
              aria-label="Return to Welcome"
              title="Return to Welcome page"
            >
              <span className="bg-gradient-to-r from-nenya-accent-secondary via-nenya-accent-primary to-nenya-accent-metallic bg-clip-text text-transparent">
                Nenya
              </span>
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-2">
            {/* Replay Tutorial */}
            {showAnimationControls && onTutorialReplay ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onTutorialReplay}
                aria-label="Replay tutorial"
                title="Replay tutorial"
              >
                <HelpCircle className="size-5" />
              </Button>
            ) : null}

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
            <EmergencyExitButton variant="header" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1" onEmergencyExit={onEmergencyExit} />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 top-14 bg-black/20 z-40" 
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="absolute top-14 left-0 right-0 bg-background border-b border-border shadow-lg z-50">
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
                    <Heart className="size-5 text-nenya-gold-dark" />
                    <div className="flex-1">
                      <div className="text-sm">Support Us</div>
                      <div className="text-xs text-muted-foreground">Help keep Nenya free</div>
                    </div>
                  </button>
                ) : null}

                {showAnimationControls && onBreathingToggle && onOrbitToggle && onValarSelect && onOpacityChange ? (
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

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16 md:h-16" aria-hidden="true" />

      {/* Accessibility Settings Dialog */}
      {showAnimationControls && onBreathingToggle && onOrbitToggle && onValarSelect && onOpacityChange ? (
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
              selectedValarIndices={selectedValarIndices}
              breathingOpacity={breathingOpacity}
              onBreathingToggle={onBreathingToggle}
              onOrbitToggle={onOrbitToggle}
              onLogoVisibleToggle={onLogoVisibleToggle}
              onValarSelect={onValarSelect}
              onOpacityChange={onOpacityChange}
              onTextSizeChange={onTextSizeChange}
              textSize={textSize}
              showCounter={showCounter}
              onCounterToggle={onCounterToggle}
              cvMode={cvMode}
              onCvModeChange={onCvModeChange}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}