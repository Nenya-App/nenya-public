import { Eye, EyeOff, Orbit, Sparkles, Sun, Moon, Type } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';
import { DeviceMemoryControls } from './DeviceMemoryControls';
import { BreathToneStyle, BreathTonesSwitch } from './BreathTonesSwitch';
import { setGemKaleidoscope, useGemKaleidoscope } from '../../lib/deviceMemory';

const VISION_MODES: { value: string; label: string }[] = [
  { value: '', label: 'Standard' },
  { value: 'deuteranopia', label: 'Red-Green (D)' },
  { value: 'protanopia', label: 'Red-Green (P)' },
  { value: 'tritanopia', label: 'Blue-Yellow' },
  { value: 'achromatopsia', label: 'Monochrome' },
];

interface AccessibilitySettingsProps {
  breathingEnabled: boolean;
  orbitEnabled: boolean;
  logoVisible?: boolean;
  breathingOpacity: number;
  textSize?: number;
  showCounter?: boolean;
  cvMode?: string;
  onBreathingToggle: (enabled: boolean) => void;
  onOrbitToggle: (enabled: boolean) => void;
  onLogoVisibleToggle?: (visible: boolean) => void;
  onOpacityChange: (opacity: number) => void;
  onTextSizeChange?: (size: number) => void;
  onCounterToggle?: (show: boolean) => void;
  onCvModeChange?: (mode: string) => void;
  /** Theme and text size only, for pages without the breathing animations. */
  compact?: boolean;
}

// Standalone settings content component
export function AccessibilitySettingsContent({
  breathingEnabled,
  orbitEnabled,
  logoVisible = true,
  breathingOpacity,
  textSize = 16,
  showCounter = false,
  cvMode = '',
  onBreathingToggle,
  onOrbitToggle,
  onLogoVisibleToggle,
  onOpacityChange,
  onTextSizeChange,
  onCounterToggle,
  onCvModeChange,
  compact = false,
}: AccessibilitySettingsProps) {
  const { theme, setTheme } = useTheme();

  // Pending changes state
  const gemKaleidoscope = useGemKaleidoscope();
  const [pendingBreathingEnabled, setPendingBreathingEnabled] = useState(breathingEnabled);
  const [pendingOrbitEnabled, setPendingOrbitEnabled] = useState(orbitEnabled);
  const [pendingLogoVisible, setPendingLogoVisible] = useState(logoVisible);
  const [pendingBreathingOpacity, setPendingBreathingOpacity] = useState(breathingOpacity);
  const [pendingTextSize, setPendingTextSize] = useState(textSize);

  // Check if there are unsaved changes
  const hasChanges =
    pendingBreathingEnabled !== breathingEnabled ||
    pendingOrbitEnabled !== orbitEnabled ||
    (onLogoVisibleToggle && pendingLogoVisible !== logoVisible) ||
    pendingBreathingOpacity !== breathingOpacity ||
    (onTextSizeChange && pendingTextSize !== textSize);
  
  // Apply all pending changes
  const handleApplyChanges = () => {
    onBreathingToggle(pendingBreathingEnabled);
    onOrbitToggle(pendingOrbitEnabled);
    if (onLogoVisibleToggle) {
      onLogoVisibleToggle(pendingLogoVisible);
    }
    onOpacityChange(pendingBreathingOpacity);
    if (onTextSizeChange) {
      onTextSizeChange(pendingTextSize);
    }
  };

  return (
    <div className="space-y-4">
      {/* Theme Toggle */}
      <div className="space-y-3">
        <Label className="text-sm">Theme</Label>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="flex-1 gap-2"
          >
            <Sun className="size-4" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="flex-1 gap-2"
          >
            <Moon className="size-4" />
            Dark
          </Button>
        </div>
      </div>

      {!compact && (
      <>
      <Separator />

      {/* Animation Controls */}
      <div className="space-y-3">
        <Label className="text-sm">Animation Controls</Label>
        
        {/* Breathing Animation Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pendingBreathingEnabled ? (
              <Eye className="size-4 text-muted-foreground" />
            ) : (
              <EyeOff className="size-4 text-muted-foreground" />
            )}
            <Label htmlFor="breathing-toggle" className="cursor-pointer text-sm">
              Breathing Emanation
            </Label>
          </div>
          <Switch
            id="breathing-toggle"
            checked={pendingBreathingEnabled}
            onCheckedChange={setPendingBreathingEnabled}
          />
        </div>

        {/* Orbit Animation Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Orbit className="size-4 text-muted-foreground" />
            <Label htmlFor="orbit-toggle" className="cursor-pointer text-sm">
              Palette Orbit
            </Label>
          </div>
          <Switch
            id="orbit-toggle"
            checked={pendingOrbitEnabled}
            onCheckedChange={setPendingOrbitEnabled}
          />
        </div>

        {/* Gem kaleidoscope: the inside of the stone slowly re-cuts itself. Off by default; it takes effect at once and holds still when the device asks for reduced motion. */}
        {!compact && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
                <Label htmlFor="kaleidoscope-toggle" className="cursor-pointer text-sm">
                  Gem Kaleidoscope
                </Label>
              </div>
              <Switch id="kaleidoscope-toggle" checked={gemKaleidoscope} onCheckedChange={setGemKaleidoscope} aria-describedby="kaleidoscope-help" />
            </div>
            <p id="kaleidoscope-help" className="pl-6 text-xs text-muted-foreground">
              The inside of the gem slowly re-cuts itself. Off by default. It holds still if your device asks for reduced motion.
            </p>
          </div>
        )}

        {/* Logo Visibility Toggle */}
        {onLogoVisibleToggle && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pendingLogoVisible ? (
                <Eye className="size-4 text-muted-foreground" />
              ) : (
                <EyeOff className="size-4 text-muted-foreground" />
              )}
              <Label htmlFor="logo-toggle" className="cursor-pointer text-sm">
                Show Logo
              </Label>
            </div>
            <Switch
              id="logo-toggle"
              checked={pendingLogoVisible}
              onCheckedChange={setPendingLogoVisible}
            />
          </div>
        )}
      </div>

      {/* Breathing tones: the same switch that is near the top of the page and on the counter */}
      {!compact && <BreathTonesSwitch variant="panel" />}
      {!compact && <BreathToneStyle />}

      {onCounterToggle && (
      <>
      {/* Breathing Counter Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="counter-toggle" className="cursor-pointer text-sm">
          Breathing Counter
        </Label>
        <Switch
          id="counter-toggle"
          checked={showCounter}
          onCheckedChange={(checked) => onCounterToggle && onCounterToggle(checked)}
        />
      </div>
      </>
      )}

      {onCvModeChange && (
      <>
      {/* Vision Mode Selector */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium">Vision mode</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {VISION_MODES.map((mode) => (
            <button
              key={mode.value || 'standard'}
              type="button"
              aria-pressed={cvMode === mode.value}
              onClick={() => onCvModeChange && onCvModeChange(mode.value)}
              // Colours come from the theme so the label stays readable in light and dark: plain text colour, with the
              // chosen option marked by an amber border and tint (dark amber text on light, light amber on dark).
              className={`cursor-pointer whitespace-nowrap rounded border px-2 py-1 text-[11px] font-medium [touch-action:manipulation] ${
                cvMode === mode.value
                  ? 'border-[#9a5f00] bg-[rgba(232,160,32,0.18)] text-[#5c3800] dark:border-[rgba(232,160,32,0.8)] dark:text-[#F3C56B]'
                  : 'border-foreground/30 text-foreground hover:border-foreground/60'
              }`}
              style={{ fontFamily: "'Manrope',sans-serif" }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Opacity Control */}
      {pendingBreathingEnabled && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="opacity-slider" className="text-sm">
                Breathing Opacity
              </Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(pendingBreathingOpacity * 100)}%
              </span>
            </div>
            <Slider
              id="opacity-slider"
              min={0.1}
              max={1.0}
              step={0.05}
              value={[pendingBreathingOpacity]}
              onValueChange={(values) => setPendingBreathingOpacity(values[0])}
              className="w-full"
            />
          </div>
        </>
      )}

      </>
      )}

      {/* Text Size Control */}
      {onTextSizeChange && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm flex items-center gap-2">
              <Type className="size-4 text-muted-foreground" />
              Text Size
            </Label>
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingTextSize(14)}
                className={pendingTextSize === 14 ? 'border-primary' : ''}
              >
                Small
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingTextSize(16)}
                className={pendingTextSize === 16 ? 'border-primary' : ''}
              >
                Medium
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingTextSize(18)}
                className={pendingTextSize === 18 ? 'border-primary' : ''}
              >
                Large
              </Button>
            </div>
          </div>
        </>
      )}
      
      <DeviceMemoryControls />

      {/* Apply Changes Button */}
      {hasChanges && (
        <>
          <Separator />
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyChanges}
            className="w-full"
          >
            Apply Changes
          </Button>
        </>
      )}
    </div>
  );
}

// Default export for backward compatibility and use in dialogs
export default function AccessibilitySettings(props: AccessibilitySettingsProps) {
  return <AccessibilitySettingsContent {...props} />;
}