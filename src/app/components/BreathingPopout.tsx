import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { ValarBreathingLogo, type BreathingTechnique } from './ValarBreathingLogo';
import { breathLengthMs } from '../../lib/breathClock';
import { PRESETS, sameTechnique } from '../../lib/breathingPresets';
import { CustomBreath } from './CustomBreath';
import { paceLabel } from '../../lib/breathCustom';
import { STEADY } from './PortableBreath';
import NenyaLogo from './NenyaLogo';
import { AccessibilitySettingsContent } from './AccessibilitySettings';
import { useIsMobile } from './useIsMobile';
import { useEffect, useMemo, useState } from 'react';
import { setBreathPreviewPercent, useBreathPreviewPercent } from '../../lib/deviceMemory';
import { STRENGTH_STANDARD, strengthParts } from '../../lib/breathStrength';
import { DEFAULT_PREVIEW_PCT, PREVIEW_PCT_MIN, PREVIEW_PCT_STEP, effectivePreviewPercent, previewMaxPercent, previewPixels } from '../../lib/logoLook';
import { deviceProfile } from '../../lib/deviceProfile';
import { aboutPath } from '../../lib/aboutRoutes';

interface BreathingPopoutProps {
  isOpen: boolean;
  onClose: () => void;
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
  showBreathingCounter?: boolean;
  onCounterToggle?: (show: boolean) => void;
  cvMode?: string;
  onCvModeChange?: (mode: string) => void;
  /** The breathing technique and shared clock anchor, so the popout's ring and gem stay in phase with the counter. */
  technique?: BreathingTechnique | null;
  /** Changing the pace from here: the same patterns as the breathing counter. */
  onTechniqueChange?: (technique: BreathingTechnique) => void;
  cycleStart?: number;
}

export function BreathingPopout({
  isOpen,
  onClose,
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
  showBreathingCounter = false,
  onCounterToggle,
  cvMode = '',
  onCvModeChange,
  technique = null,
  onTechniqueChange,
  cycleStart,
}: BreathingPopoutProps) {
  // The preview's size is the visitor's to set. On a narrow screen it is held to what fits.
  // The size is a percentage of the standard preview. How high it can go depends on the device (the light-device rules) and on the width of the screen, so the panel never scrolls sideways;
  // a stored choice above that is held to it for now and kept as it was.
  const previewChoice = useBreathPreviewPercent();
  const narrow = useIsMobile();
  const [viewport, setViewport] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  useEffect(() => {
    const on = () => setViewport(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const tier = useMemo(() => deviceProfile().tier, []);
  const previewMax = previewMaxPercent(tier, viewport);
  const previewPercent = effectivePreviewPercent(previewChoice, tier, viewport);
  const previewSize = previewPixels(previewChoice, tier, viewport);
  // The logo block is its size plus the breathing ring's room (64 or 96px) and the column's own padding (48px).
  const leftWidth = previewSize + (viewport < 640 ? 64 : 96) + 48;
  const cycleSeconds = breathLengthMs(technique) / 1000;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={onClose}
          />

          {/* Popout Panel */}
          <m.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="fixed top-16 left-4 z-[70] bg-background border border-border rounded-lg shadow-2xl overflow-y-auto"
            style={{ width: narrow ? 'calc(100vw - 2rem)' : `min(calc(100vw - 2rem), ${Math.max(500, leftWidth + 300)}px)`, maxHeight: 'calc(100dvh - 5rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="font-medium text-sm">Breathing Animation & Accessibility</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close the breathing panel"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Content - Two Columns */}
            <div className="grid grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-border" style={narrow ? undefined : { gridTemplateColumns: `${leftWidth}px minmax(0, 1fr)` }}>
              {/* Left: Breathing Animation */}
              <div className="flex flex-col items-center justify-center p-6 bg-background">
                <div>
                  <ValarBreathingLogo
                    enabled={breathingEnabled}
                    {...strengthParts(breathingStrength)}
                    logoSize={previewSize}
                    cycleDuration={cycleSeconds}
                    technique={technique}
                    cvMode={cvMode}
                    cycleStart={cycleStart}
                  >
                    <div className="nenya-logo-glow">
                      <NenyaLogo
                        size={previewSize}
                        showValarOrbit={orbitEnabled}
                        showLogo={logoVisible}
                        cycleStart={cycleStart}
                        technique={technique}
                        breathingEnabled={breathingEnabled}
                        glow
                      />
                    </div>
                  </ValarBreathingLogo>
                </div>
                <div className="mt-2 flex w-full max-w-xs flex-wrap items-center gap-x-3 gap-y-1">
                  <label htmlFor="preview-size" className="shrink-0 text-xs text-muted-foreground">Preview size</label>
                  <span aria-hidden="true" className="shrink-0 text-xs text-foreground">{previewPercent}%</span>
                  <input
                    id="preview-size"
                    type="range"
                    min={PREVIEW_PCT_MIN}
                    max={previewMax}
                    step={PREVIEW_PCT_STEP}
                    value={previewPercent}
                    onChange={(e) => setBreathPreviewPercent(Number(e.target.value))}
                    aria-valuetext={`${previewPercent} percent`}
                    className="h-11 min-w-0 flex-1"
                  />
                  <button type="button" onClick={() => setBreathPreviewPercent(DEFAULT_PREVIEW_PCT)} className="shrink-0 rounded-md border border-border px-2 text-xs min-h-11">Reset</button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {Number.isInteger(cycleSeconds) ? cycleSeconds : cycleSeconds.toFixed(1)}-second breathing cycle
                </p>
                {onTechniqueChange && (
                  <div role="group" aria-label="Breathing pace" className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground text-center">Breathing pace</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {PRESETS.map((preset) => {
                        const active = !!technique && sameTechnique(technique, preset);
                        return (
                          <button
                            key={preset.lb}
                            type="button"
                            aria-pressed={active}
                            title={preset.desc}
                            onClick={() => onTechniqueChange({ ih: preset.ih, hi: preset.hi || 0, ex: preset.ex, ho: preset.ho || 0 })}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'border-primary bg-primary/15 font-medium' : 'border-border hover:bg-muted'}`}
                          >
                            {preset.lb}
                          </button>
                        );
                      })}
                    </div>
                    {technique && (
                      <p className="text-xs text-muted-foreground text-center">{PRESETS.find((p) => sameTechnique(technique, p))?.desc ?? `Your own pace: ${paceLabel(technique)} seconds`}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-center">Stop and return to normal breathing if you feel dizzy or lightheaded. If a pace feels too long, choose a shorter one and build up gradually.</p>
                    <CustomBreath technique={technique} onApply={onTechniqueChange} steady={STEADY} />
                  </div>
                )}
              </div>

              {/* Right: Accessibility Controls */}
              <div className="p-4 md:max-h-[60vh] md:overflow-y-auto">
                {onBreathingToggle && onOrbitToggle && onStrengthChange && onTextSizeChange ? (
                  <AccessibilitySettingsContent
                    breathingEnabled={breathingEnabled}
                    orbitEnabled={orbitEnabled}
                    logoVisible={logoVisible}
                    breathingStrength={breathingStrength}
                    textSize={textSize}
                    onBreathingToggle={onBreathingToggle}
                    onOrbitToggle={onOrbitToggle}
                    onLogoVisibleToggle={onLogoVisibleToggle}
                    onStrengthChange={onStrengthChange}
                    onTextSizeChange={onTextSizeChange}
                    showCounter={showBreathingCounter}
                    onCounterToggle={onCounterToggle}
                    cvMode={cvMode}
                    onCvModeChange={onCvModeChange}
                    technique={technique}
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
                Paying attention to the breath is an old practice in contemplative traditions. Small studies of mostly healthy adults suggest
                slow breathing can change heart-rate patterns. Nenya itself has not been studied.{' '}
                <a href={aboutPath('breathing-tool')} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Sources and limits (opens in a new tab)
                </a>
              </p>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
