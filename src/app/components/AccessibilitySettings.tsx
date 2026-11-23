import { Eye, EyeOff, Orbit, Sparkles, Sun, Moon, Type } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { SettingsCard } from './SettingsCard';
import { STRENGTH_MAX, STRENGTH_MIN, STRENGTH_STEP, strengthLabel } from '../../lib/breathStrength';
import { useReducedMotionNow } from './useReducedMotionNow';
import { MOTION_REDUCED_REASON, MOTION_STOPPED_STATUS, motionButtonLabel, motionMessage } from '../../lib/motionStop';
import { setMotionStopped, useMotionStopped } from '../../lib/deviceMemory';
import { CARDS_INSTRUCTION, NO_CARDS_OPEN, allCardsOpen, closeAllCards, noCardsOpen, openAllCards, toggleCard, type OpenCards, type SettingsCardId } from '../../lib/settingsCards';
import { useTheme } from './ThemeProvider';
import { DeviceMemoryControls } from './DeviceMemoryControls';
import { BreathToneStyle, BreathToneVolume, BreathTonesQuickControls, BreathTonesSwitch } from './BreathTonesSwitch';
import { setGemKaleidoscope, setGemKaleidoscopeBreath, setGemKaleidoscopeLook, useGemKaleidoscope, useGemKaleidoscopeBreath, useGemKaleidoscopeLook, type KaleidoscopeLookChoice } from '../../lib/deviceMemory';
import { VISITOR_LOOKS } from '../../lib/kaleidoscope';
import { GEM_SIDE_PRESETS, HALO_STYLES, HALO_WIDTHS, LEAF_PRESETS, LEAF_SETTING_AVAILABLE, gemChoiceLabel, gemChoiceMessage, haloStyleLabel, haloStyleMessage, haloWidthLabel, type GemSidesChoice } from '../../lib/logoLook';
import { setGemSidesChoice, setLogoLeaves, setOrbHaloStyle, setOrbHaloWidth, shuffleOrbHalo, useGemSidesChoice, useLogoLeaves, useOrbHaloStyle, useOrbHaloWidth } from '../../lib/deviceMemory';
import { liveGemSupported } from '../../lib/gemRenderer';
import { LeafSwaySwitch, ColourChoiceGroup } from './LogoLookExtras';
import { setBreathColourChoice, setOrbColourChoice, useBreathColourChoice, useOrbColourChoice } from '../../lib/deviceMemory';
import { colourChoiceMessage } from '../../lib/logoColours';
import { INNER_ORB_MODES, innerOrbHint, innerOrbLabel, innerOrbMessage } from '../../lib/logoLook';
import { setInnerOrbMode, useInnerOrbMode } from '../../lib/deviceMemory';

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
  breathingStrength: number;
  textSize?: number;
  showCounter?: boolean;
  cvMode?: string;
  onBreathingToggle: (enabled: boolean) => void;
  onOrbitToggle: (enabled: boolean) => void;
  onLogoVisibleToggle?: (visible: boolean) => void;
  onStrengthChange: (opacity: number) => void;
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
  breathingStrength,
  textSize = 16,
  showCounter = false,
  cvMode = '',
  onBreathingToggle,
  onOrbitToggle,
  onLogoVisibleToggle,
  onStrengthChange,
  onTextSizeChange,
  onCounterToggle,
  onCvModeChange,
  compact = false,
}: AccessibilitySettingsProps) {
  const { theme, setTheme } = useTheme();

  // The cards all start closed, every visit; which are open is not stored.
  const [openCards, setOpenCards] = useState<OpenCards>(NO_CARDS_OPEN);
  // Stop motion: held by the visitor's button or by the device's reduced-motion request (then the button shows stopped and cannot be pressed).
  const motionStopped = useMotionStopped();
  const reducedMotion = useReducedMotionNow();
  const motionHeld = motionStopped || reducedMotion;
  const [motionMessageText, setMotionMessageText] = useState('');
  const card = (id: SettingsCardId, title: string, children: React.ReactNode, status?: string) => (
    <SettingsCard id={`a11y-${id}`} title={title} status={status} open={!!openCards[id]} onToggle={() => setOpenCards((o) => toggleCard(o, id))}>{children}</SettingsCard>
  );

  // Pending changes state
  const gemKaleidoscope = useGemKaleidoscope();
  const gemChoice = useGemSidesChoice();
  const leafChoice = useLogoLeaves();
  const haloStyle = useOrbHaloStyle();
  const haloWidth = useOrbHaloWidth();
  const breathColourChoice = useBreathColourChoice();
  const orbColourChoice = useOrbColourChoice();
  const innerOrbMode = useInnerOrbMode();
  const [lookMessage, setLookMessage] = useState('');
  const kaleidoLook = useGemKaleidoscopeLook();
  const kaleidoBreath = useGemKaleidoscopeBreath();
  const [pendingBreathingEnabled, setPendingBreathingEnabled] = useState(breathingEnabled);
  const [pendingOrbitEnabled, setPendingOrbitEnabled] = useState(orbitEnabled);
  const [pendingLogoVisible, setPendingLogoVisible] = useState(logoVisible);
  const [pendingBreathingStrength, setPendingBreathingStrength] = useState(breathingStrength);
  const [pendingTextSize, setPendingTextSize] = useState(textSize);

  // Check if there are unsaved changes
  const hasChanges =
    pendingBreathingEnabled !== breathingEnabled ||
    pendingOrbitEnabled !== orbitEnabled ||
    (onLogoVisibleToggle && pendingLogoVisible !== logoVisible) ||
    pendingBreathingStrength !== breathingStrength ||
    (onTextSizeChange && pendingTextSize !== textSize);
  
  // Apply all pending changes
  const handleApplyChanges = () => {
    onBreathingToggle(pendingBreathingEnabled);
    onOrbitToggle(pendingOrbitEnabled);
    if (onLogoVisibleToggle) {
      onLogoVisibleToggle(pendingLogoVisible);
    }
    onStrengthChange(pendingBreathingStrength);
    if (onTextSizeChange) {
      onTextSizeChange(pendingTextSize);
    }
  };

  return (
    <div className="space-y-3">
      {/* Stop motion: always visible at the very top, not inside a card. One press holds the decorative movement still; Resume brings back what was set. */}
      <div className="space-y-1">
        <button
          type="button"
          aria-pressed={motionHeld}
          disabled={reducedMotion}
          onClick={() => { const next = !motionStopped; setMotionStopped(next); setMotionMessageText(motionMessage(next)); }}
          aria-describedby="a11y-motion-help"
          className="min-h-11 w-full rounded-md border-2 border-foreground px-3 text-sm font-medium text-foreground disabled:opacity-80"
        >
          {motionButtonLabel(motionHeld)}
        </button>
        <p id="a11y-motion-help" className="text-xs text-muted-foreground">
          {reducedMotion
            ? MOTION_REDUCED_REASON
            : 'Holds the leaves, the inner lights, the gem, the orbs and the page\u2019s pulses still, including the counter\u2019s circle and number pulse and the front page button\u2019s pulse. The breathing ring and the tones carry on, and the counter still shows the number and the word. Your other settings are kept.'}
        </p>
        <p role="status" aria-live="polite" className="sr-only">{motionMessageText}</p>
      </div>

      {/* The tones' own off switch and mute, beside Stop motion: Stop motion does not silence them (sound is not motion). */}
      <BreathTonesQuickControls />

      {/* How the cards work, and open-all / close-all (helpful with a screen reader). */}
      <div className="space-y-2">
        <p id="a11y-cards-help" className="text-sm text-foreground">{CARDS_INSTRUCTION}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={allCardsOpen(openCards)} onClick={() => setOpenCards(openAllCards())} aria-describedby="a11y-cards-help" className="min-h-11 rounded-md border border-border px-3 text-sm disabled:opacity-60">Open all</button>
          <button type="button" disabled={noCardsOpen(openCards)} onClick={() => setOpenCards(closeAllCards())} aria-describedby="a11y-cards-help" className="min-h-11 rounded-md border border-border px-3 text-sm disabled:opacity-60">Close all</button>
        </div>
      </div>

      {/* Theme Toggle */}
      {card('theme', 'Theme', (
      <div className="space-y-3">
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
      ))}

      {!compact && (
      <>

      {/* Animation Controls */}
      {card('animation', 'Animation', (
      <div className="space-y-3">
        
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

        {/* Gem kaleidoscope: the inside of the stone slowly re-cuts itself. On by default (not on a light device); it takes effect at once and holds still when the device asks for reduced motion. */}
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
              The inside of the gem slowly re-cuts itself. On by default (off on a device that draws less). It holds still if your device asks for reduced motion.
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
      ), motionHeld ? MOTION_STOPPED_STATUS : undefined)}

      {card('logo-look', 'Logo look', (
      <div className="space-y-3">
        {/* The logo's look: how many sides the gem has (and, once the leaves are in, how many leaves). Presets, applied at once, no motion. */}
        {!compact && (liveGemSupported() || LEAF_SETTING_AVAILABLE || orbitEnabled) && (
          <div className="space-y-2">
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
            {/* The glow round each outer orb: its colour style and how wide it is. */}
            {orbitEnabled && (
              <>
                <fieldset className="space-y-1">
                  <legend className="text-xs text-muted-foreground">Outer glow</legend>
                  {HALO_STYLES.map((st) => (
                    <label key={st} className="flex min-h-11 items-center gap-2 text-sm">
                      <input type="radio" name="orb-halo" value={st} checked={haloStyle === st} onChange={() => { setOrbHaloStyle(st); setLookMessage(haloStyleMessage(st)); }} />
                      {haloStyleLabel(st)}
                    </label>
                  ))}
                  {haloStyle === 'random' && (
                    <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => { shuffleOrbHalo(); setLookMessage('New random glow colours.'); }}>
                      Shuffle colours
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">The old shared glow is the heaviest to draw; the others are lighter.</p>
                </fieldset>
                {haloStyle !== 'shared' && (
                  <fieldset className="space-y-1">
                    <legend className="text-xs text-muted-foreground">Glow width</legend>
                    {HALO_WIDTHS.map((w) => (
                      <label key={w} className="flex min-h-11 items-center gap-2 text-sm">
                        <input type="radio" name="orb-halo-width" value={w} checked={haloWidth === w} onChange={() => { setOrbHaloWidth(w); setLookMessage(`The outer glow is now ${haloWidthLabel(w).toLowerCase()}.`); }} />
                        {haloWidthLabel(w)}
                      </label>
                    ))}
                  </fieldset>
                )}
              </>
            )}
            {/* The inner ring of lights behind the gem: moving, still, or hidden. */}
            {orbitEnabled && (
              <fieldset className="space-y-1">
                <legend className="text-xs text-muted-foreground">Inner lights behind the gem</legend>
                {INNER_ORB_MODES.map((m) => (
                  <label key={m} className="flex min-h-11 items-start gap-2 py-1 text-sm">
                    <input type="radio" name="inner-orbs" value={m} checked={innerOrbMode === m} onChange={() => { setInnerOrbMode(m); setLookMessage(innerOrbMessage(m)); }} className="mt-1" aria-describedby={`inner-orbs-${m}-d`} />
                    <span>
                      {innerOrbLabel(m)}
                      <span id={`inner-orbs-${m}-d`} className="block text-xs text-muted-foreground">{innerOrbHint(m)}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            {/* The leaves' gentle sway (on by default; the leaves are drawn with the Palette Orbit). */}
            {orbitEnabled && <LeafSwaySwitch breathingEnabled={breathingEnabled} onMessage={setLookMessage} />}
            {/* The colours of the breath ring (and the gem's tint that follows it), and of the sixteen orbs. */}
            {breathingEnabled && (
              <ColourChoiceGroup
                legend="Breathing colours"
                name="breath-colours"
                choice={breathColourChoice}
                onChoose={(c) => { setBreathColourChoice(c); setLookMessage(colourChoiceMessage('breath', c)); }}
                help="The colour of the glow each breath. Original changes it every breath through all the palettes. Changes show at once in the logo."
              />
            )}
            {orbitEnabled && (
              <ColourChoiceGroup
                legend="Orb colours"
                name="orb-colours"
                choice={orbColourChoice}
                onChoose={(c) => { setOrbColourChoice(c); setLookMessage(colourChoiceMessage('orbs', c)); }}
                help="The colours of the sixteen orbs. Original gives each orb its own palette. Changes show at once in the logo."
              />
            )}
            <p role="status" aria-live="polite" className="sr-only">{lookMessage}</p>
          </div>
        )}
      </div>
      ))}

      {/* Breathing tones: the same switch that is near the top of the page and on the counter */}
      {card('sound', 'Sound and counter', (
      <div className="space-y-4">
      {!compact && <BreathTonesSwitch variant="panel" />}
      {!compact && <BreathToneStyle />}
      {!compact && <BreathToneVolume />}

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
      </div>
      ))}

      {onCvModeChange && card('vision', 'Vision mode', (
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
      ))}

      {/* Strength Control: 50% is the standard strength (what 100% opacity used to be); below it the ring fades, above it the ring is drawn stronger. */}
      {pendingBreathingEnabled && card('strength', 'Breathing strength', (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="strength-slider" className="text-sm">
                Breathing strength
              </Label>
              <span className="text-xs text-muted-foreground">
                {strengthLabel(pendingBreathingStrength)}
              </span>
            </div>
            <Slider
              id="strength-slider"
              min={STRENGTH_MIN}
              max={STRENGTH_MAX}
              step={STRENGTH_STEP}
              value={[pendingBreathingStrength]}
              onValueChange={(values) => setPendingBreathingStrength(values[0])}
              aria-describedby="strength-help"
              className="w-full"
            />
            <p id="strength-help" className="text-xs text-muted-foreground">
              50% is the standard strength. Below it the breathing ring fades; above it the ring is brighter, with a wider soft edge. It never moves faster or flashes.
            </p>
          </div>
        </>
      ))}

      </>
      )}

      {/* Text Size Control */}
      {onTextSizeChange && card('text-size', 'Text size', (
        <>
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
      ))}
      
      {card('remember', 'Remember on this device', <DeviceMemoryControls />)}

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