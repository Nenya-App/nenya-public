// Color name and emotional quality mapping utilities

export function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#0047AB': 'Cobalt Blue',
    '#F5D042': 'Golden Yellow',
    '#8B4513': 'Saddle Brown',
    '#87CEEB': 'Sky Blue',
    '#FF6B6B': 'Coral Red',
    '#4ECDC4': 'Turquoise',
    '#2C3E50': 'Midnight Blue',
    '#E8F8F5': 'Mint Cream',
    '#9B59B6': 'Amethyst Purple',
    '#F39C12': 'Orange Gold',
    '#27AE60': 'Emerald Green',
    '#E74C3C': 'Crimson Red',
    '#3498DB': 'Dodger Blue',
    '#1ABC9C': 'Persian Green',
    '#34495E': 'Wet Asphalt',
    '#95A5A6': 'Concrete Gray',
    '#D35400': 'Pumpkin Orange',
    '#C0392B': 'Pomegranate',
    '#BDC3C7': 'Silver',
    '#7F8C8D': 'Asbestos',
  };

  // Return the named color if it exists, otherwise analyze the hex
  if (colorNames[hex]) {
    return colorNames[hex];
  }

  // Basic color analysis for unlisted colors
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max - min < 30) {
    if (lightness > 200) return 'Light Gray';
    if (lightness > 100) return 'Medium Gray';
    return 'Dark Gray';
  }

  if (r > g && r > b) {
    if (lightness > 150) return 'Light Red';
    return 'Deep Red';
  }
  if (g > r && g > b) {
    if (lightness > 150) return 'Light Green';
    return 'Deep Green';
  }
  if (b > r && b > g) {
    if (lightness > 150) return 'Light Blue';
    return 'Deep Blue';
  }
  if (r > 150 && g > 150) {
    return 'Yellow';
  }
  if (r > 150 && b > 150) {
    return 'Magenta';
  }
  if (g > 150 && b > 150) {
    return 'Cyan';
  }

  return 'Rich Color';
}

export function getEmotionalQuality(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const saturation = max - min;

  // Low saturation (gray tones)
  if (saturation < 40) {
    if (lightness > 200) return 'something light and peaceful';
    if (lightness > 100) return 'something neutral and balanced';
    return 'something deep and grounded';
  }

  // High saturation colors
  if (r > g && r > b) {
    if (lightness > 150) return 'something warm and gentle';
    return 'something passionate and intense';
  }
  if (g > r && g > b) {
    if (lightness > 150) return 'something fresh and hopeful';
    return 'something alive and growing';
  }
  if (b > r && b > g) {
    if (lightness > 150) return 'something airy and clear';
    return 'something calm and deep';
  }
  if (r > 150 && g > 150 && b < 100) {
    return 'something bright and energizing';
  }

  return 'something unique and expressive';
}

// Calculate relative luminance for WCAG contrast calculation
export function getLuminance(hex: string): number {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Get readable text color (black or white) for a given background
export function getReadableTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');
  
  // Return white if it has better contrast, otherwise black
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

// Get the average color from a gradient (simplified: midpoint color)
export function getGradientMidpoint(color1: string, color2: string): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round((r1 + r2) / 2);
  const g = Math.round((g1 + g2) / 2);
  const b = Math.round((b1 + b2) / 2);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Check if two colors are too similar (low contrast)
export function areSimilarColors(color1: string, color2: string): boolean {
  const contrast = getContrastRatio(color1, color2);
  // WCAG AA requires 4.5:1 for normal text, but we'll use 3:1 for warning threshold
  return contrast < 3;
}
