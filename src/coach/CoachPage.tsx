import { useEffect, useRef, useState } from 'react';
import { GlobalNavigation } from '../app/components/GlobalNavigation';
import { BreathingPopout } from '../app/components/BreathingPopout';
import SessionKeyPicker from './SessionKeyPicker';
import CoachDemo from './CoachDemo';

// The standalone /coach address: the same header as the rest of the site, then
// the session key (two colors and the melody they make), then the conversation.
// Header links that belong to the main app open it; "Support Us" jumps to the
// support section on this page.
export default function CoachPage() {
  const [colors, setColors] = useState<{ color1: string; color2: string } | null>(null);
  const [textSize, setTextSize] = useState(16);
  // The logo opens the same breathing animation panel as the rest of the site.
  const [popoutOpen, setPopoutOpen] = useState(false);
  const [breathingEnabled, setBreathingEnabled] = useState(true);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [logoVisible, setLogoVisible] = useState(true);
  const [valarIndices, setValarIndices] = useState<number[]>([]);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${textSize}px`);
  }, [textSize]);

  // Leaving mid-conversation loses it (nothing is saved), so the browser asks first.
  // The emergency exit skips the question, as on the main site.
  const exiting = useRef(false);
  useEffect(() => {
    if (!colors) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (exiting.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [colors]);

  const goToApp = (about?: string) => {
    window.location.href = about === undefined ? '/' : `/?about=${encodeURIComponent(about)}`;
  };

  return (
    <div className="size-full flex flex-col bg-background">
      <GlobalNavigation
        currentScreen="chat"
        onNavigate={(screen) => goToApp(screen === 'about' ? '' : undefined)}
        onNavigateToAbout={(section) => {
          const support = document.getElementById('support');
          if (section === 'support-us' && support) {
            support.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            goToApp(section ?? '');
          }
        }}
        compactSettings
        onBreathingPopoutToggle={() => setPopoutOpen((open) => !open)}
        onEmergencyExit={() => {
          exiting.current = true;
        }}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        breathingEnabled={breathingEnabled}
        orbitEnabled={orbitEnabled}
        logoVisible={logoVisible}
        selectedValarIndices={valarIndices}
        breathingOpacity={opacity}
        onBreathingToggle={setBreathingEnabled}
        onOrbitToggle={setOrbitEnabled}
        onLogoVisibleToggle={setLogoVisible}
        onValarSelect={setValarIndices}
        onOpacityChange={setOpacity}
      />
      <div className="flex-1 min-h-0">
        {!colors ? (
          <SessionKeyPicker onComplete={setColors} onBack={() => goToApp()} />
        ) : (
          <CoachDemo colors={colors} onBack={() => setColors(null)} />
        )}
      </div>
      <BreathingPopout
        isOpen={popoutOpen}
        onClose={() => setPopoutOpen(false)}
        breathingEnabled={breathingEnabled}
        orbitEnabled={orbitEnabled}
        logoVisible={logoVisible}
        selectedValarIndices={valarIndices}
        breathingOpacity={opacity}
        textSize={textSize}
        onBreathingToggle={setBreathingEnabled}
        onOrbitToggle={setOrbitEnabled}
        onLogoVisibleToggle={setLogoVisible}
        onValarSelect={setValarIndices}
        onOpacityChange={setOpacity}
        onTextSizeChange={setTextSize}
      />
    </div>
  );
}
