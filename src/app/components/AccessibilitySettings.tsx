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
import { setGemKaleidoscope, setGemKaleidoscopeBreath, setGemKaleidoscopeLook, useGemKaleidoscope, useGemKaleidoscopeBreath, useGemKaleidoscopeLook, type KaleidoscopeLookChoice } from '../../lib/deviceMemory';
import { VISITOR_LOOKS } from '../../lib/kaleidoscope';
import { GEM_SIDE_PRESETS, LEAF_PRESETS, LEAF_SETTING_AVAILABLE, gemChoiceLabel, gemChoiceMessage, type GemSidesChoice } from '../../lib/logoLook';
import { setGemSidesChoice, setLogoLeaves, useGemSidesChoice, useLogoLeaves } from '../../lib/deviceMemory';
import { liveGemSupported } from '../../lib/gemRenderer';

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
  const gemChoice = useGemSidesChoice();
  const leafChoice = useLogoLeaves();
  const [lookMessage, setLookMessage] = useState('');
  const kaleidoLook = useGemKaleidoscopeLook();
  const kaleidoBreath = useGemKaleidoscopeBreath();
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
            {/* Shown only while it is on: the look, and whether it moves with the breath (owner, 2026-11-15). */}
            {gemKaleidoscope && (
              <div className="space-y-3 pl-6 pt-2">
                <fieldset className="space-y-1">
                  <legend className="text-xs text-muted-foreground">How much it moves</legend>
                  {VISITOR_LOOKS.map((l) => (
                    <label key={l.id} className="flex min-h-11 items-start gap-2 text-sm">
                      <input type="radio" name="kaleidoscope-look" value={l.id} checked={kaleidoLook === l.id} onChange={() => setGemKaleidoscopeLook(l.id as KaleidoscopeLookChoice)} className="mt-1" />
                      <span>
                        {l.label}
                        <span className="block text-xs text-muted-foreground">{l.hint}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="kaleidoscope-breath" className="cursor-pointer text-sm">
                    Move with my breathing
                  </Label>
                  <Switch id="kaleidoscope-breath" checked={kaleidoBreath} onCheckedChange={setGemKaleidoscopeBreath} aria-describedby="kaleidoscope-breath-help" />
                </div>
                <p id="kaleidoscope-breath-help" className="text-xs text-muted-foreground">
                  The pattern opens as you breathe in and settles as you breathe out, at the pace you chose.
                </p>
              </div>
            )}
          </div>
        )}

        {/* The logo's look: how many sides the gem has (and, once the leaves are in, how many leaves). Presets, applied at once, no motion. */}
        {!compact && (liveGemSupported() || LEAF_SETTING_AVAILABLE) && (
          <div className="space-y-2">
            <p id="logo-look-help" className="text-sm">Logo look</p>
            <p className="text-xs text-muted-foreground">This changes the animated logo. The still logo in some places stays at the standard design.</p>
            {LEAF_SETTING_AVAILABLE && (
              <fieldset className="space-y-1">
                <legend className="text-xs text-muted-foreground">Leaves</legend>
                {LEAF_PRESETS.map((n) => (
                  <label key={n} className="flex min-h-11 items-center gap-2 text-sm">
                    <input type="radio" name="logo-leaves" value={n} checked={leafChoice === n} onChange={() => { setLogoLeaves(n); setLookMessage(`The logo now has ${n} leaves.`); }} />
                    {n} leaves
                  </label>
                ))}
              </fieldset>
            )}
            {liveGemSupported() && (
              <fieldset className="space-y-1">
                <legend className="text-xs text-muted-foreground">Gem</legend>
                {(['match', ...GEM_SIDE_PRESETS] as GemSidesChoice[]).map((c) => (
                  <label key={String(c)} className="flex min-h-11 items-center gap-2 text-sm">
                    <input type="radio" name="gem-sides" value={String(c)} checked={gemChoice === c} onChange={() => { setGemSidesChoice(c); setLookMessage(gemChoiceMessage(c)); }} />
                    {gemChoiceLabel(c)}
                  </label>
                ))}
                <p className="text-xs text-muted-foreground">On a device that draws less, the gem has at most 8 sides.</p>
              </fieldset>
            )}
            <p role="status" aria-live="polite" className="sr-only">{lookMessage}</p>
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
              className={`cursor-pointer whitespace-nowrap rounded border px-2 py-1 text-xs font-medium [touch-action:manipulation] ${
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