import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { ValarBreathingLogo } from './ValarBreathingLogo';
import NenyaLogo from './NenyaLogo';
import { AccessibilitySettingsContent } from './AccessibilitySettings';

interface BreathingPopoutProps {
  isOpen: boolean;
  onClose: () => void;
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
  showBreathingCounter?: boolean;
  onCounterToggle?: (show: boolean) => void;
  cvMode?: string;
  onCvModeChange?: (mode: string) => void;
}

export function BreathingPopout({
  isOpen,
  onClose,
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
  showBreathingCounter = false,
  onCounterToggle,
  cvMode = '',
  onCvModeChange,
}: BreathingPopoutProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={onClose}
          />

          {/* Popout Panel */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="fixed top-16 left-4 z-[70] bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
            style={{ width: 'min(500px, calc(100vw - 2rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="font-medium text-sm">Breathing Animation & Accessibility</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Content - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left: Breathing Animation */}
              <div className="flex flex-col items-center justify-center p-6 bg-background">
                <div className="scale-75 md:scale-90">
                  <ValarBreathingLogo
                    enabled={breathingEnabled}
                    selectedValarIndices={selectedValarIndices}
                    opacity={breathingOpacity}
                    logoSize={160}
                  >
                    <div className="nenya-logo-glow">
                      <NenyaLogo size={160} showValarOrbit={orbitEnabled} showLogo={logoVisible} />
                    </div>
                  </ValarBreathingLogo>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  10-second breathing cycle
                </p>
              </div>

              {/* Right: Accessibility Controls */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {onBreathingToggle && onOrbitToggle && onValarSelect && onOpacityChange && onTextSizeChange ? (
                  <AccessibilitySettingsContent
                    breathingEnabled={breathingEnabled}
                    orbitEnabled={orbitEnabled}
                    logoVisible={logoVisible}
                    selectedValarIndices={selectedValarIndices}
                    breathingOpacity={breathingOpacity}
                    textSize={textSize}
                    onBreathingToggle={onBreathingToggle}
                    onOrbitToggle={onOrbitToggle}
                    onLogoVisibleToggle={onLogoVisibleToggle}
                    onValarSelect={onValarSelect}
                    onOpacityChange={onOpacityChange}
                    onTextSizeChange={onTextSizeChange}
                    showCounter={showBreathingCounter}
                    onCounterToggle={onCounterToggle}
                    cvMode={cvMode}
                    onCvModeChange={onCvModeChange}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Accessibility controls not available on this page
                  </div>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                This breathing animation persists across all pages to support nervous system regulation
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
