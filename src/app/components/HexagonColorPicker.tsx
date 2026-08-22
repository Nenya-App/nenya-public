import { useState } from 'react';
import { Button } from './ui/button';
import { useIsMobile } from './useIsMobile';

interface HexagonColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HexagonColorPicker({ selectedColor, onColorChange, className = '', size = 'md' }: HexagonColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  const isMobile = useIsMobile();
  
  // Width and calculated height for equilateral hexagons
  const sizeConfig = {
    sm: { 
      width: isMobile ? 24 : 32, 
      get height() { return Math.round(this.width * 0.866); }
    },
    md: { 
      width: isMobile ? 32 : 48, 
      get height() { return Math.round(this.width * 0.866); }
    },
    lg: { 
      width: isMobile ? 40 : 64, 
      get height() { return Math.round(this.width * 0.866); }
    }
  };
  
  const { width, height } = sizeConfig[size];
  
  // Predefined color palette with 12 emotionally significant colors - muted Nenya tones
  const colorPalette = [
    '#B87860', // Muted terracotta - warmth, grounding
    '#DAC682', // Soft yellow - gentle optimism
    '#8B957A', // Moss green - growth, calm
    '#7A9B9E', // Sage blue - clarity, peace
    '#9B8BA4', // Muted lavender - contemplation
    '#C9A88A', // Warm tan - stability, comfort
    '#A68A7B', // Clay brown - earth, presence
    '#E8C4A8', // Rose gold - compassion, connection
    '#8C9A8E', // Soft sage - balance, renewal
    '#B5A89A', // Warm grey - depth, wisdom
    '#4A4440', // Deep earth - mystery, grounding
    '#FAF8F5', // Warm cream - clarity, openness
  ];

  const CircleShape = ({ color, isSelected = false, onClick }: { color: string; isSelected?: boolean; onClick?: () => void }) => (
    <div className="relative flex items-center justify-center">
      {/* Gradient background for selected state */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full animate-in fade-in zoom-in duration-500"
          style={{
            width: `${width + 16}px`,
            height: `${width + 16}px`,
            background: 'linear-gradient(135deg, #000000 0%, #FFFFFF 100%)',
            transform: 'translate(-8px, -8px)',
            padding: '8px',
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
    <div className={`space-y-3 md:space-y-4 ${className}`}>
      {/* Color Grid - 12 colors in 4x3 grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 bg-muted/30 rounded-lg border border-border justify-items-center">
        {colorPalette.map((color) => (
          <CircleShape
            key={color}
            color={color}
            isSelected={selectedColor.toLowerCase() === color.toLowerCase()}
            onClick={() => onColorChange(color)}
          />
        ))}
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
          onClick={() => onColorChange(customColor)}
          disabled={!/^#[0-9A-Fa-f]{6}$/i.test(customColor)}
          className="text-xs md:text-sm"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}