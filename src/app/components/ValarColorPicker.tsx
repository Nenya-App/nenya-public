import { useState } from 'react';
import { Button } from './ui/button';
import { useIsMobile } from './useIsMobile';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { displayNameFor } from '../../lib/paletteNames';

interface ValarColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void; // Callback to close the dialog/picker
}

interface ValarPalette {
  name: string;
  domain: string;
  colors: string[];
}

const VALAR_PALETTES: ValarPalette[] = [
  // AIR & LIGHT — Perception, Awareness, Order
  {
    name: 'Manwë',
    domain: 'Air, Wind, Sovereignty',
    colors: ['#2C6E9E', '#6EA8D4', '#DCE9F2', '#8F9DB0', '#E9C46A', '#1E3F63']
  },
  {
    name: 'Varda',
    domain: 'Light, Stars, Awareness',
    colors: ['#F7D44A', '#FFF6D8', '#C9D1E0', '#A9C7F2', '#5B4A96', '#1B2447']
  },
  
  // WATER & FLOW — Emotion, Communion, Change
  {
    name: 'Ulmo',
    domain: 'Water, Flow, Communal Needs',
    colors: ['#1B4F6E', '#4B8EAA', '#6CBFA6', '#E4F2F0', '#D3C9CF', '#0D2A3F']
  },
  {
    name: 'Nienna',
    domain: 'Mercy, Compassion, Empathy',
    colors: ['#8B8B9E', '#6F7F95', '#A8BCCF', '#A58BBE', '#E3E6EC', '#4A4F63']
  },
  
  // EARTH & CRAFT — Structure, Growth, Material Justice
  {
    name: 'Aulë',
    domain: 'Earth, Structure, Accountability',
    colors: ['#9C5D3A', '#D9822B', '#5B5F66', '#C9B79C', '#BFC9D6', '#2E2A28']
  },
  {
    name: 'Yavanna',
    domain: 'Growth, Nourishment, Ecological Balance',
    colors: ['#3B6E47', '#7DAA80', '#CCE3CC', '#D8B24A', '#E0786A', '#6B4E37']
  },
  {
    name: 'Vána',
    domain: 'Youth, Renewal, Perpetual Bloom',
    colors: ['#A8B84C', '#F2A7B8', '#F6D55C', '#A877CC', '#9DC8E8', '#4F7F34']
  },
  
  // TIME & FATE — Memory, Consequence, Continuity
  {
    name: 'Mandos',
    domain: 'Fate, Judgment, Necessary Grief',
    colors: ['#5C4B6E', '#2B2540', '#8FA0BF', '#D08AA2', '#E4DCCB', '#6F6C7A']
  },
  {
    name: 'Vairë',
    domain: 'Memory, Time, Weaving of Lives',
    colors: ['#3A6B6B', '#2F4B7A', '#D8B25A', '#B04A50', '#E8DCC4', '#86ACAC']
  },
  
  // WILD & VITALITY — Instinct, Motion, Freedom
  {
    name: 'Oromë',
    domain: 'Action, Courage, Untamed Spirit',
    colors: ['#4D6E3B', '#A87D4B', '#E3CFA4', '#E0B04A', '#8BA7B8', '#253A2A']
  },
  {
    name: 'Tulkas',
    domain: 'Joy, Defiance, Vital Resistance',
    colors: ['#E3752B', '#F2B84B', '#B8392B', '#FBE2CC', '#6B3A22', '#F2AA74']
  },
  {
    name: 'Nessa',
    domain: 'Dance, Freedom, Kinetic Joy',
    colors: ['#D9626B', '#8DBF6A', '#C98B52', '#6BB5B0', '#F8E0E2', '#A63D54']
  },
  
  // DREAM & REST — Vision, Healing, Inner Worlds
  {
    name: 'Irmo',
    domain: 'Dream, Vision, Inner Worlds',
    colors: ['#845A9E', '#BB9ED4', '#6F8FD0', '#D9DDF0', '#6FA58A', '#2D2347']
  },
  {
    name: 'Estë',
    domain: 'Rest, Healing, Restoration',
    colors: ['#5A9C8E', '#C2E0D6', '#7FA0AD', '#E6D8BF', '#D9B8A8', '#2F5F59']
  },
  
  // SHADOW & ENTROPY — Corruption, Decay, Burnout
  {
    name: 'Melkor',
    domain: 'Raw Power, Potential, Tension',
    colors: ['#5C2E2E', '#D9552B', '#6E6A6A', '#A9CFE8', '#EAF2F8', '#1E1818']
  },
  {
    name: 'Morgoth',
    domain: 'Despair, Emptiness, Power Turned Destructive',
    colors: ['#1E1E2A', '#3A3A50', '#8585A0', '#DCDCE8', '#D01C1F', '#B3B3C8']
  },
];

export function ValarColorPicker({ selectedColor, onColorChange, className = '', size = 'md', onClose }: ValarColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  // Start with all palettes expanded
  const [expandedPalettes, setExpandedPalettes] = useState<Set<string>>(
    new Set(VALAR_PALETTES.map(p => p.name))
  );
  const isMobile = useIsMobile();
  
  // Width and calculated height for circles
  const sizeConfig = {
    sm: { 
      width: isMobile ? 24 : 32, 
    },
    md: { 
      width: isMobile ? 32 : 48, 
    },
    lg: { 
      width: isMobile ? 40 : 56, 
    }
  };
  
  const { width } = sizeConfig[size];
  
  const togglePalette = (paletteName: string) => {
    setExpandedPalettes(prev => {
      const next = new Set(prev);
      if (next.has(paletteName)) {
        next.delete(paletteName);
      } else {
        next.add(paletteName);
      }
      return next;
    });
  };

  const CircleShape = ({ color, isSelected = false, onClick }: { color: string; isSelected?: boolean; onClick?: () => void }) => (
    <div className="relative flex items-center justify-center">
      {/* Gradient background for selected state */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full animate-in fade-in zoom-in duration-500"
          style={{
            width: `${width + 12}px`,
            height: `${width + 12}px`,
            background: 'linear-gradient(135deg, #C9A88A 0%, #E8C4A8 100%)',
            transform: 'translate(-6px, -6px)',
            padding: '6px',
          }}
        />
      )}
      <button
        onClick={onClick}
        className={`relative transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-nenya-gold/50 rounded-full ${
          isSelected ? 'ring-2 ring-nenya-gold shadow-lg scale-110 z-10' : ''
        }`}
        style={{
          width: `${width}px`,
          height: `${width}px`,
          backgroundColor: color,
          boxShadow: isSelected ? `0 0 20px ${color}40, 0 0 40px ${color}20` : undefined,
        }}
        title={color}
      />
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Custom Color Input */}
      <div className="flex items-center gap-2 md:gap-3 p-3 bg-muted/30 rounded-lg border border-border">
        <label htmlFor="custom-color" className="text-sm font-medium">
          Custom:
        </label>
        <input
          id="custom-color"
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          className="rounded-full border-2 border-border cursor-pointer overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${width}px`,
            padding: '0',
          }}
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-2 md:px-3 py-1 md:py-2 text-sm bg-background border border-border rounded focus:ring-2 focus:ring-nenya-gold/50 focus:border-nenya-gold"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
        <Button
          size="sm"
          onClick={() => {
            onColorChange(customColor);
            onClose?.(); // Close the dialog when Apply is clicked
          }}
          disabled={!/^#[0-9A-Fa-f]{6}$/i.test(customColor)}
          className="text-xs md:text-sm"
        >
          Apply
        </Button>
      </div>

      {/* Valar Palettes Explainer */}
      <div className="px-3 py-2 bg-muted/20 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground">The sixteen palettes:</span> Simple starting points, offered so you do not have to begin with the whole spectrum. They do not measure or diagnose anything, and no color has a fixed meaning. Choose what feels right to you, or pick any color with the custom color control above.
        </p>
      </div>
      
      {/* Valar Palettes - Scrollable and Collapsible */}
      <div className="max-h-96 overflow-y-auto scroll-container space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
        {VALAR_PALETTES.map((palette) => {
          const isExpanded = expandedPalettes.has(palette.name);
          
          return (
            <div key={palette.name} className="border border-border rounded-lg overflow-hidden bg-background/50">
              {/* Palette Header - Clickable to expand/collapse */}
              <button
                onClick={() => togglePalette(palette.name)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="text-left">
                  <h4 className="font-medium">{displayNameFor(palette.name)}</h4>
                  <p className="text-xs text-muted-foreground">{palette.domain}</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </button>
              
              {/* Palette Colors - Show when expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2">
                  <div className="grid grid-cols-6 gap-2 justify-items-center">
                    {palette.colors.map((color) => (
                      <CircleShape
                        key={color}
                        color={color}
                        isSelected={selectedColor.toLowerCase() === color.toLowerCase()}
                        onClick={() => {
                          onColorChange(color);
                          onClose?.(); // Close the dialog when a color is selected
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
