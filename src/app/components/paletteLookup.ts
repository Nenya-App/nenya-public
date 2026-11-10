// Which of the sixteen palettes a colour belongs to (by its outward name), or null for a colour of the person's own. Used by the report hand-off to the
// coach and by the colour-name suggestions.
import { valarColors } from './ValarBreathingLogo';
import { displayNameFor } from '../../lib/paletteNames';

export function paletteOfHex(hex: string): string | null {
  const h = hex.toLowerCase();
  const v = valarColors.find((p) => p.vector.some((c) => c.toLowerCase() === h));
  return v ? displayNameFor(v.name) : null;
}
