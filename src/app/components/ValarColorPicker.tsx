import { useState } from 'react';
import { Button } from './ui/button';
import { useIsMobile } from './useIsMobile';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ValarColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  otherColor?: string; // The other color selected (for gradient display)
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
    colors: ['#4A90E2', '#F5A623', '#F0F4F7', '#607D8B', '#B0C4DE', '#1C3B6F']
  },
  {
    name: 'Varda',
    domain: 'Light, Stars, Awareness',
    colors: ['#EBEFF2', '#0B0E23', '#C7ECEC', '#87CEEB', '#ADD8E6', '#6A5ACD']
  },
  
  // WATER & FLOW — Emotion, Communion, Change
  {
    name: 'Ulmo',
    domain: 'Water, Flow, Communal Needs',
    colors: ['#004D7A', '#4682B4', '#5F9EA0', '#A9A9A9', '#F0F8FF', '#3C763D']
  },
  {
    name: 'Nienna',
    domain: 'Mercy, Compassion, Empathy',
    colors: ['#C8A2C8', '#E6E6FA', '#98FB98', '#FFE5B4', '#FFE4E1', '#CCCCFF']
  },
  
  // EARTH & CRAFT — Structure, Growth, Material Justice
  {
    name: 'Aulë',
    domain: 'Earth, Structure, Accountability',
    colors: ['#484A49', '#B87333', '#B22222', '#8B4513', '#1D1F21', '#3CB371']
  },
  {
    name: 'Yavanna',
    domain: 'Growth, Nourishment, Ecological Balance',
    colors: ['#228B22', '#DAA520', '#8FBC8F', '#6B4226', '#9ACD32', '#FFF8DC']
  },
  {
    name: 'Vána',
    domain: 'Youth, Renewal, Perpetual Bloom',
    colors: ['#FFFACD', '#FFB6C1', '#FFD700', '#ADFF2F', '#E0FFFF', '#FAEBD7']
  },
  
  // TIME & FATE — Memory, Consequence, Continuity
  {
    name: 'Mandos',
    domain: 'Fate, Judgment, Necessary Grief',
    colors: ['#4B0082', '#DCDCDC', '#546E7A', '#A52A2A', '#191970', '#F2F2F2']
  },
  {
    name: 'Vairë',
    domain: 'Memory, Time, Weaving of Lives',
    colors: ['#FFD700', '#C0C0C0', '#FAF0E6', '#9932CC', '#4169E1', '#D2B48C']
  },
  
  // WILD & VITALITY — Instinct, Motion, Freedom
  {
    name: 'Oromë',
    domain: 'Wild Hunt, Courage, Untamed Spirit',
    colors: ['#2E4600', '#C19A6B', '#355E3B', '#3B3C36', '#FF8C00', '#C0D9D9']
  },
  {
    name: 'Tulkas',
    domain: 'Joy, Defiance, Vital Resistance',
    colors: ['#FFD700', '#B08D57', '#FF7F50', '#CC7722', '#6B8E23', '#FFFACD']
  },
  {
    name: 'Nessa',
    domain: 'Dance, Freedom, Kinetic Joy',
    colors: ['#FFBF00', '#FF6F61', '#F4A460', '#87CEFA', '#BC8F8F', '#FDF5E6']
  },
  
  // DREAM & REST — Vision, Healing, Inner Worlds
  {
    name: 'Irmo',
    domain: 'Dream, Vision, Inner Worlds',
    colors: ['#AFEEEE', '#BA55D3', '#5F9EA0', '#F8F8FF', '#483D8B', '#D3D3D3']
  },
  {
    name: 'Estë',
    domain: 'Rest, Healing, Restoration',
    colors: ['#F5F5F5', '#B0C4C4', '#D2B48C', '#EED5D2', '#E0FFFF', '#C0C0C0']
  },
  
  // SHADOW & ENTROPY — Corruption, Decay, Burnout
  {
    name: 'Melkor',
    domain: 'Unfallen Chief, Potential, Entropic Tension',
    colors: ['#FF4500', '#CD7F32', '#4B0082', '#36454F', '#00FFFF', '#CC0000']
  },
  {
    name: 'Morgoth',
    domain: 'Fallen Destroyer, Entropic Actuality, Despair',
    colors: ['#1E1E2A', '#3A3A50', '#5C5C78', '#8585A0', '#B3B3C8', '#DCDCE8']
  },
];

export function ValarColorPicker({ selectedColor, onColorChange, className = '', size = 'md', otherColor, onClose }: ValarColorPickerProps) {
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
      {/* Valar Palettes Explainer */}
      <div className="px-3 py-2 bg-muted/20 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground">The Valar Palettes:</span> Sixteen archetypal domains drawn from Tolkien's mythology, each representing fundamental human needs and experiences—from sovereignty and compassion to wild vitality and necessary rest. Choose colors that resonate with your current state and aspiration.
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
                  <h4 className="font-medium">{palette.name}</h4>
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
    </div>
  );
}
