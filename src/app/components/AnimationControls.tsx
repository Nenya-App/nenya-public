import { Settings, Eye, EyeOff, Orbit, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { valarColors } from './ValarBreathingLogo';

interface AnimationControlsProps {
  breathingEnabled: boolean;
  orbitEnabled: boolean;
  selectedValarIndices: number[];
  breathingOpacity: number;
  onBreathingToggle: (enabled: boolean) => void;
  onOrbitToggle: (enabled: boolean) => void;
  onValarSelect: (indices: number[]) => void;
  onOpacityChange: (opacity: number) => void;
}

export default function AnimationControls({
  breathingEnabled,
  orbitEnabled,
  selectedValarIndices,
  breathingOpacity,
  onBreathingToggle,
  onOrbitToggle,
  onValarSelect,
  onOpacityChange,
}: AnimationControlsProps) {
  const handleColorToggle = (index: number, checked: boolean) => {
    if (checked) {
      onValarSelect([...selectedValarIndices, index].sort((a, b) => a - b));
    } else {
      onValarSelect(selectedValarIndices.filter(i => i !== index));
    }
  };

  const handleSelectAll = () => {
    onValarSelect([]);
  };

  const handleClearAll = () => {
    onValarSelect([]);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Settings className="size-4" />
          Animation Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg mb-3">Animation Controls</h3>
          </div>

          {/* Breathing Animation Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {breathingEnabled ? (
                <Eye className="size-4 text-muted-foreground" />
              ) : (
                <EyeOff className="size-4 text-muted-foreground" />
              )}
              <Label htmlFor="breathing-toggle" className="cursor-pointer">
                Breathing Emanation
              </Label>
            </div>
            <Switch
              id="breathing-toggle"
              checked={breathingEnabled}
              onCheckedChange={onBreathingToggle}
            />
          </div>

          {/* Orbit Animation Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Orbit className="size-4 text-muted-foreground" />
              <Label htmlFor="orbit-toggle" className="cursor-pointer">
                Valar Orbit
              </Label>
            </div>
            <Switch
              id="orbit-toggle"
              checked={orbitEnabled}
              onCheckedChange={onOrbitToggle}
            />
          </div>

          {/* Color Selection */}
          {breathingEnabled && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Loader className="size-4 text-muted-foreground" />
                  Breathing Colors
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-auto py-1 px-2 text-xs"
                >
                  {selectedValarIndices.length === 0 ? 'All Selected' : 'Select All'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedValarIndices.length === 0 
                  ? 'All 16 Valar × 6 colors = 96 color cycles'
                  : `${selectedValarIndices.length} Valar × 6 colors = ${selectedValarIndices.length * 6} cycles`}
              </div>
              <ScrollArea className="h-48 pr-4">
                <div className="space-y-2">
                  {valarColors.map((valar, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`valar-${index}`}
                        checked={selectedValarIndices.length === 0 || selectedValarIndices.includes(index)}
                        onCheckedChange={(checked) => handleColorToggle(index, checked as boolean)}
                        disabled={selectedValarIndices.length === 0}
                      />
                      <label
                        htmlFor={`valar-${index}`}
                        className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                      >
                        <div 
                          className="size-3 rounded-full border border-border" 
                          style={{ backgroundColor: valar.vector[0] }}
                        />
                        {valar.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Opacity Control */}
          {breathingEnabled && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="opacity-slider" className="text-sm">
                  Breathing Opacity
                </Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(breathingOpacity * 100)}%
                </span>
              </div>
              <Slider
                id="opacity-slider"
                min={0.1}
                max={1.0}
                step={0.05}
                value={[breathingOpacity]}
                onValueChange={(values) => onOpacityChange(values[0])}
                className="w-full"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Customize the meditative animations to suit your preferences
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
