import { useState } from 'react';
import { useIsMobile } from './useIsMobile';

interface CompactColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label: string;
}

export function CompactColorPicker({ selectedColor, onColorChange, label }: CompactColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);
  const isMobile = useIsMobile();
  
  // 3x3 grid - muted Nenya palette colors
  const colorPalette = [
    '#B87860', '#DAC682', '#8B957A', 
    '#7A9B9E', '#C9A88A', '#9B8BA4', 
    '#E8C4A8', '#8C9A8E', '#B5A89A'
  ];
  
  const circleSize = isMobile ? 56 : 64;

  const CircleShape = ({ color, isSelected = false, onClick }: { color: string; isSelected?: boolean; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`relative transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-nenya-gold/50 rounded-full ${
        isSelected ? 'ring-2 ring-nenya-gold shadow-lg scale-110 animate-in fade-in zoom-in duration-500' : ''
      }`}
      style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        backgroundColor: color,
        boxShadow: isSelected ? `0 0 20px ${color}40, 0 0 40px ${color}20` : undefined,
      }}
      title={color}
      aria-label={`Select color ${color}`}
    />
  );

  return (
    <div className="space-y-4">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div 
          className="size-20 rounded-full mx-auto transition-all duration-300 hover:scale-105 border-2 border-nenya-gold/30"
          style={{ backgroundColor: selectedColor }}
        />
        <code className="text-xs text-muted-foreground">{selectedColor.toUpperCase()}</code>
      </div>
      
      {/* 3x3 Color Grid */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border justify-items-center">
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
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
        <label htmlFor={`custom-color-${label}`} className="text-sm">
          Custom:
        </label>
        <input
          id={`custom-color-${label}`}
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onColorChange(e.target.value);
          }}
          className="size-10 rounded cursor-pointer border border-border"
          aria-label="Custom color picker"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => {
            const value = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
              setCustomColor(value);
              onColorChange(value);
            }
          }}
          placeholder="#000000"
          className="flex-1 text-sm px-2 py-1 bg-transparent border-none focus:outline-none font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );
}
